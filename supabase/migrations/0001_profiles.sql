-- Milestone 2: member profiles + auth wiring.
-- Run via the Supabase SQL editor or `supabase db push`.

create type public.membership_type as enum ('full', 'junior', 'guest');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  membership public.membership_type not null default 'guest',
  member_since date,
  stripe_customer_id text unique,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Created automatically by on_auth_user_created.';

alter table public.profiles enable row level security;

create policy "Members can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Members can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Members may edit contact/newsletter fields only. Membership type,
-- member_since and the Stripe link are managed by the club (service role).
revoke update on public.profiles from authenticated;
grant update (full_name, phone, newsletter_opt_in)
  on public.profiles to authenticated;

-- Create a profile row whenever a user signs up (email or Apple).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
