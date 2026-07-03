-- Milestone 3: shared calendar & booking engine.
-- One bookings table for every resource type; conflicts are enforced at
-- the database level with exclusion constraints (not just client checks).

create extension if not exists btree_gist;

create type public.resource_type as enum
  ('hall', 'field1', 'field2', 'field3', 'lesson', 'event');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');
create type public.lesson_type as enum ('private', 'group');

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  active boolean not null default true
);

insert into public.trainers (name, bio) values
  ('Brad Rainford-Blackett', 'Head polo trainer at Frankfurter Polo Club.');

create table public.club_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  ticket_price_cents integer not null default 0,
  capacity integer,
  created_at timestamptz not null default now(),
  constraint valid_event_range check (ends_at > starts_at)
);

-- Placeholder tournament days (real dates TBA by the club).
insert into public.club_events (title, description, starts_at, ends_at, ticket_price_cents, capacity) values
  ('Carl von Weinberg Cup 2026', 'The club''s flagship tournament weekend.',
   '2026-08-15 11:00+02', '2026-08-15 18:00+02', 1500, 400),
  ('International Polo Cup 2026', 'International teams, chukkas all day.',
   '2026-09-05 11:00+02', '2026-09-05 18:00+02', 1200, 400);

-- Hourly prices in cents; lessons are per hour by lesson type.
create table public.rates (
  key text primary key,
  per_hour_cents integer not null
);

insert into public.rates (key, per_hour_cents) values
  ('hall', 6000),
  ('field', 4500),
  ('lesson_private', 9000),
  ('lesson_group', 5500);

-- Configurable club-wide settings (single row).
create table public.club_settings (
  id boolean primary key default true check (id),
  cancellation_hours integer not null default 24
);
insert into public.club_settings default values;

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resource public.resource_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.booking_status not null default 'pending',
  notes text,
  price_cents integer not null default 0,
  -- lesson bookings
  trainer_id uuid references public.trainers (id),
  lesson_type public.lesson_type,
  -- event (spectator ticket) bookings
  event_id uuid references public.club_events (id),
  ticket_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_range check (ends_at > starts_at),
  constraint lesson_fields check
    (resource <> 'lesson' or (trainer_id is not null and lesson_type is not null)),
  constraint event_fields check
    (resource <> 'event' or (event_id is not null and ticket_count >= 1))
);

-- Server-side conflict detection. A physical resource (hall/fields) can
-- hold one active booking per time range …
alter table public.bookings add constraint no_double_booking_resource
  exclude using gist (
    resource with =,
    tstzrange(starts_at, ends_at) with &&
  )
  where (status <> 'cancelled'
         and resource in ('hall', 'field1', 'field2', 'field3'));

-- … and a trainer can teach one lesson at a time. Event tickets don't
-- conflict — they're capacity-checked by trigger below.
alter table public.bookings add constraint no_double_booking_trainer
  exclude using gist (
    trainer_id with =,
    tstzrange(starts_at, ends_at) with &&
  )
  where (status <> 'cancelled' and resource = 'lesson');

create index bookings_range_idx on public.bookings using gist
  (tstzrange(starts_at, ends_at));
create index bookings_user_idx on public.bookings (user_id, starts_at desc);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- Enforce spectator capacity transactionally (locks the event row).
create function public.check_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  cap integer;
  taken integer;
begin
  select capacity into cap from public.club_events
    where id = new.event_id for update;
  if cap is null then
    return new;
  end if;
  select coalesce(sum(ticket_count), 0) into taken
    from public.bookings
    where event_id = new.event_id and status <> 'cancelled' and id <> new.id;
  if taken + new.ticket_count > cap then
    raise exception 'Event is sold out' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger bookings_event_capacity
  before insert or update on public.bookings
  for each row when (new.resource = 'event')
  execute procedure public.check_event_capacity();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.bookings enable row level security;
alter table public.trainers enable row level security;
alter table public.club_events enable row level security;
alter table public.rates enable row level security;
alter table public.club_settings enable row level security;

create policy "Members manage own bookings: select"
  on public.bookings for select using ((select auth.uid()) = user_id);
create policy "Members manage own bookings: insert"
  on public.bookings for insert with check ((select auth.uid()) = user_id);
-- No direct update/delete: cancellation goes through cancel_booking().

create policy "Reference data is public: trainers"
  on public.trainers for select using (true);
create policy "Reference data is public: events"
  on public.club_events for select using (true);
create policy "Reference data is public: rates"
  on public.rates for select using (true);
create policy "Reference data is public: settings"
  on public.club_settings for select using (true);

-- Anonymous availability: expose busy time ranges (no personal data).
-- Intentionally a definer-style view so it bypasses bookings RLS.
create view public.busy_slots as
  select id, resource, trainer_id, starts_at, ends_at
  from public.bookings
  where status <> 'cancelled';

grant select on public.busy_slots to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cancellation with configurable window
-- ---------------------------------------------------------------------------

create function public.cancel_booking(booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.bookings%rowtype;
  win integer;
begin
  select * into b from public.bookings
    where id = booking_id and user_id = (select auth.uid());
  if not found then
    raise exception 'Booking not found';
  end if;
  if b.status = 'cancelled' then
    return;
  end if;
  select cancellation_hours into win from public.club_settings limit 1;
  win := coalesce(win, 24);
  if b.starts_at < now() + make_interval(hours => win) then
    raise exception 'Bookings can only be cancelled up to % hours before the start', win;
  end if;
  update public.bookings set status = 'cancelled' where id = booking_id;
end;
$$;

grant execute on function public.cancel_booking(uuid) to authenticated;
