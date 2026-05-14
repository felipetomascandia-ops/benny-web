create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  photo_urls text[] not null default '{}',
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  address text,
  project_details text,
  reservation_date date not null,
  reservation_time text not null,
  status text not null default 'reserved',
  created_at timestamptz not null default now(),
  constraint unique_booking_day unique (reservation_date)
);

create index if not exists bookings_date_idx on public.bookings (reservation_date);
create index if not exists bookings_phone_idx on public.bookings (phone);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

alter table public.bookings add column if not exists address text;

do $$
begin
  alter table public.bookings drop constraint if exists unique_booking_slot;
exception
  when undefined_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'unique_booking_day'
      and conrelid = 'public.bookings'::regclass
  ) then
    if exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relname = 'unique_booking_day'
        and n.nspname = 'public'
    ) then
      execute 'drop index if exists public.unique_booking_day';
    end if;

    alter table public.bookings add constraint unique_booking_day unique (reservation_date);
  end if;
exception
  when duplicate_object then null;
  when duplicate_table then null;
  when unique_violation then null;
end $$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.bookings to anon, authenticated;
grant select, insert, update, delete on table public.reviews to anon, authenticated;

alter table public.bookings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_select_upcoming'
  ) then
    execute $policy$
      create policy bookings_select_upcoming
      on public.bookings
      for select
      to anon, authenticated
      using (reservation_date >= current_date and status <> 'cancelled')
    $policy$;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'bookings_insert_anyone'
  ) then
    execute $policy$
      create policy bookings_insert_anyone
      on public.bookings
      for insert
      to anon, authenticated
      with check (true)
    $policy$;
  end if;
end $$;
