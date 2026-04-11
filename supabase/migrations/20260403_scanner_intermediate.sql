alter type pickup_status add value if not exists 'PENDING_SCAN';
alter type pickup_status add value if not exists 'SCANNED';

alter table public.pickups
  add column if not exists scanner_id       uuid references public.profiles(id) on delete set null,
  add column if not exists scanned_weight_kg double precision,
  add column if not exists scan_notes        text,
  add column if not exists scanned_at        timestamptz,
  add column if not exists plastic_type      varchar(16),
  add column if not exists quality_grade     varchar(8);

create index if not exists pickups_scanner_idx on public.pickups(scanner_id);

drop policy if exists "Recycler can update their own pickup" on public.pickups;

create policy "Recycler can update their own pickup"
  on public.pickups for update
  using (auth.uid() = recycler_id);

create policy "Scanner can update assigned pickups"
  on public.pickups for update
  using (
    auth.uid() = scanner_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'scanner'
    )
  );

create or replace function public.submit_to_scanner(p_pickup_id uuid)
returns public.pickups
language plpgsql
security definer
as $$
declare
  v_row public.pickups;
begin
  update public.pickups
  set status     = 'PENDING_SCAN',
      updated_at = now()
  where id = p_pickup_id
    and recycler_id = auth.uid()
    and status = 'AVAILABLE'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'pickup_not_found_or_not_yours' using errcode = 'P0010';
  end if;

  return v_row;
end;
$$;

create or replace function public.scanner_validate(
  p_pickup_id      uuid,
  p_weight_kg      double precision,
  p_plastic_type   varchar,
  p_quality_grade  varchar,
  p_notes          text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_row    public.pickups;
  v_points int;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'scanner'
  ) then
    raise exception 'scanner_role_required' using errcode = 'P0011';
  end if;

  if p_weight_kg <= 0 then
    raise exception 'invalid_weight' using errcode = 'P0012';
  end if;

  v_points := greatest(1, round(p_weight_kg * 100)::int);

  update public.pickups
  set status            = 'SCANNED',
      scanner_id        = auth.uid(),
      scanned_weight_kg = p_weight_kg,
      plastic_type      = p_plastic_type,
      quality_grade     = p_quality_grade,
      scan_notes        = p_notes,
      reward_points     = v_points,
      scanned_at        = now(),
      updated_at        = now()
  where id = p_pickup_id
    and status = 'PENDING_SCAN'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'pickup_not_pending_scan' using errcode = 'P0013';
  end if;

  update public.profiles
  set total_recycled_kg = total_recycled_kg + p_weight_kg,
      updated_at        = now()
  where id = v_row.recycler_id;

  return jsonb_build_object(
    'pickup_id',     v_row.id,
    'weight_kg',     p_weight_kg,
    'plastic_type',  p_plastic_type,
    'quality_grade', p_quality_grade,
    'points',        v_points,
    'recycler_id',   v_row.recycler_id
  );
end;
$$;

create or replace function public.accept_pickup(p_pickup_id uuid)
returns public.pickups
language plpgsql
security definer
as $$
declare
  v_row public.pickups;
begin
  update public.pickups
  set picker_id  = auth.uid(),
      status     = 'ASSIGNED',
      updated_at = now()
  where id = p_pickup_id
    and status = 'SCANNED'
    and picker_id is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'pickup_not_scanned_or_unavailable' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

create or replace function public.verify_pickup_token(p_token varchar)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_row    public.pickups;
  v_points int;
begin
  select * into v_row
  from public.pickups
  where verification_token = p_token
    and status = 'ASSIGNED'
    and picker_id = auth.uid();

  if v_row.id is null then
    raise exception 'token_invalid_or_not_assigned' using errcode = 'P0004';
  end if;

  if v_row.scanned_weight_kg is null then
    raise exception 'item_not_scanned_cannot_pay' using errcode = 'P0014';
  end if;

  v_points := v_row.reward_points;

  update public.pickups
  set status     = 'COMPLETED',
      updated_at = now()
  where id = v_row.id;

  update public.profiles
  set coin_balance      = coin_balance + v_points,
      total_points      = total_points + v_points,
      total_pickups     = total_pickups + 1,
      updated_at        = now()
  where id = v_row.picker_id;

  insert into public.pickup_transactions (picker_id, recycler_id, weight_kg, points_earned)
  values (v_row.picker_id, v_row.recycler_id, v_row.scanned_weight_kg, v_points);

  return jsonb_build_object(
    'pickup_id',    v_row.id,
    'weight_kg',    v_row.scanned_weight_kg,
    'plastic_type', v_row.plastic_type,
    'points',       v_points,
    'recycler_id',  v_row.recycler_id
  );
end;
$$;
