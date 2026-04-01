alter table public.pickups
  add column if not exists verification_token varchar(64) unique,
  add column if not exists reward_points int not null default 0;

create index if not exists pickups_token_idx on public.pickups(verification_token);

create or replace function public.generate_pickup_token(p_pickup_id uuid)
returns varchar
language plpgsql
security definer
as $$
declare
  v_token varchar(64);
  v_recycler uuid;
begin
  select recycler_id into v_recycler
  from public.pickups
  where id = p_pickup_id;

  if v_recycler is null or v_recycler <> auth.uid() then
    raise exception 'not_authorized' using errcode = 'P0003';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');

  update public.pickups
  set verification_token = v_token,
      updated_at = now()
  where id = p_pickup_id;

  return v_token;
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
