alter table public.pickups
  drop column if exists scanner_id,
  drop column if exists scanned_weight_kg,
  drop column if exists scan_notes,
  drop column if exists scanned_at,
  drop column if exists plastic_type,
  drop column if exists quality_grade;

drop function if exists public.submit_to_scanner(uuid);
drop function if exists public.scanner_validate(uuid, double precision, varchar, varchar, text);

drop policy if exists "Scanner can update assigned pickups" on public.pickups;

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
    and status = 'AVAILABLE'
    and picker_id is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'pickup_not_available' using errcode = 'P0001';
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

  v_points := greatest(1, round(v_row.weight_kg * 100)::int);

  update public.pickups
  set status        = 'COMPLETED',
      reward_points = v_points,
      updated_at    = now()
  where id = v_row.id;

  update public.profiles
  set coin_balance      = coin_balance + v_points,
      total_points      = total_points + v_points,
      total_pickups     = total_pickups + 1,
      total_recycled_kg = total_recycled_kg + v_row.weight_kg,
      updated_at        = now()
  where id = v_row.picker_id;

  update public.profiles
  set total_recycled_kg = total_recycled_kg + v_row.weight_kg,
      updated_at        = now()
  where id = v_row.recycler_id;

  insert into public.pickup_transactions (picker_id, recycler_id, weight_kg, points_earned)
  values (v_row.picker_id, v_row.recycler_id, v_row.weight_kg, v_points);

  return jsonb_build_object(
    'pickup_id',   v_row.id,
    'weight_kg',   v_row.weight_kg,
    'points',      v_points,
    'recycler_id', v_row.recycler_id
  );
end;
$$;
