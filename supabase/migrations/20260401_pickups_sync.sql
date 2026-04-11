create type pickup_status as enum ('AVAILABLE', 'ASSIGNED', 'COMPLETED');

create table if not exists public.pickups (
  id            uuid primary key default gen_random_uuid(),
  recycler_id   uuid not null references public.profiles(id) on delete cascade,
  picker_id     uuid references public.profiles(id) on delete set null,
  lat           double precision not null,
  lng           double precision not null,
  address       text not null default '',
  weight_kg     double precision not null default 0,
  status        pickup_status not null default 'AVAILABLE',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index pickups_status_idx      on public.pickups(status);
create index pickups_recycler_idx    on public.pickups(recycler_id);
create index pickups_picker_idx      on public.pickups(picker_id);

alter table public.pickups enable row level security;

create policy "Recyclers can insert their own pickups"
  on public.pickups for insert
  with check (auth.uid() = recycler_id);

create policy "Anyone authenticated can view AVAILABLE pickups"
  on public.pickups for select
  using (auth.uid() is not null);

create policy "Recycler can update their own pickup"
  on public.pickups for update
  using (auth.uid() = recycler_id);

create or replace function public.accept_pickup(p_pickup_id uuid)
returns public.pickups
language plpgsql
security definer
as $$
declare
  v_row public.pickups;
begin
  update public.pickups
  set
    picker_id  = auth.uid(),
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

create or replace function public.complete_pickup(p_pickup_id uuid)
returns public.pickups
language plpgsql
security definer
as $$
declare
  v_row    public.pickups;
  v_points int;
begin
  update public.pickups
  set
    status     = 'COMPLETED',
    updated_at = now()
  where id = p_pickup_id
    and status = 'ASSIGNED'
    and picker_id = auth.uid()
  returning * into v_row;

  if v_row.id is null then
    raise exception 'pickup_not_assigned_to_you' using errcode = 'P0002';
  end if;

  v_points := greatest(1, round(v_row.weight_kg * 100)::int);

  update public.profiles
  set
    coin_balance      = coin_balance + v_points,
    total_points      = total_points + v_points,
    total_pickups     = total_pickups + 1,
    total_recycled_kg = total_recycled_kg + v_row.weight_kg,
    updated_at        = now()
  where id = v_row.picker_id;

  update public.profiles
  set
    total_recycled_kg = total_recycled_kg + v_row.weight_kg,
    updated_at        = now()
  where id = v_row.recycler_id;

  insert into public.pickup_transactions (picker_id, recycler_id, weight_kg, points_earned)
  values (v_row.picker_id, v_row.recycler_id, v_row.weight_kg, v_points);

  return v_row;
end;
$$;

create or replace function public.handle_pickup_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pickups_updated_at
  before update on public.pickups
  for each row execute function public.handle_pickup_updated_at();

alter publication supabase_realtime add table public.pickups;
