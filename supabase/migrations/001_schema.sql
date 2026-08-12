-- Communest Database Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- ─── 1. Users ───────────────────────────────────────────────────────────────
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null unique,
  phone        text,
  role         text not null default 'regular_user'
               check (role in ('communest_admin','estate_admin','tenant','regular_user')),
  estate_id    text,
  profile_picture text,
  email_verified  boolean not null default false,
  phone_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── 2. Estates ─────────────────────────────────────────────────────────────
create table if not exists public.estates (
  id                  text primary key default gen_random_uuid()::text,
  name                text not null,
  location            text not null,
  county              text not null,
  description         text,
  units               integer not null default 0,
  total_area          numeric not null default 0,
  estate_photo        text,
  management_name     text not null,
  management_email    text not null,
  management_phone    text not null,
  title_deed_number   text not null,
  status              text not null default 'pending'
                      check (status in ('pending','approved','denied')),
  admin_id            text,
  created_at          timestamptz not null default now()
);

-- ─── 3. Houses ──────────────────────────────────────────────────────────────
create table if not exists public.houses (
  id            text primary key default gen_random_uuid()::text,
  estate_id     text not null references public.estates(id) on delete cascade,
  house_number  text not null,
  type          text not null,
  bedrooms      integer not null default 1,
  bathrooms     integer not null default 1,
  size          numeric not null default 0,
  rent          numeric not null default 0,
  status        text not null default 'available'
                check (status in ('available','occupied','maintenance')),
  tenant_id     text,
  photos        text[],
  amenities     text[],
  created_at    timestamptz not null default now()
);

-- ─── 4. Notifications ───────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          text primary key default gen_random_uuid()::text,
  user_id     text not null,
  title       text not null,
  message     text not null,
  type        text not null default 'info'
              check (type in ('info','success','warning','error')),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─── 5. Maintenance Items ────────────────────────────────────────────────────
create table if not exists public.maintenance_items (
  id           text primary key default gen_random_uuid()::text,
  estate_id    text not null references public.estates(id) on delete cascade,
  house_id     text references public.houses(id) on delete set null,
  title        text not null,
  description  text,
  status       text not null default 'pending'
               check (status in ('pending','in_progress','completed')),
  priority     text not null default 'medium'
               check (priority in ('low','medium','high','urgent')),
  reported_by  text,
  assigned_to  text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

-- ─── 6. Payments ─────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id           text primary key default gen_random_uuid()::text,
  estate_id    text not null references public.estates(id) on delete cascade,
  house_id     text references public.houses(id) on delete set null,
  tenant_id    text not null,
  amount       numeric not null,
  type         text not null default 'rent'
               check (type in ('rent','deposit','maintenance','other')),
  status       text not null default 'pending'
               check (status in ('pending','completed','failed','refunded')),
  month        text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ─── 7. Inquiries ────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id          text primary key default gen_random_uuid()::text,
  estate_id   text not null references public.estates(id) on delete cascade,
  house_id    text references public.houses(id) on delete set null,
  user_id     text not null,
  user_name   text not null,
  user_email  text not null,
  user_phone  text,
  message     text not null,
  status      text not null default 'pending'
              check (status in ('pending','responded','closed')),
  created_at  timestamptz not null default now()
);

-- ─── 8. Rental Proposals ─────────────────────────────────────────────────────
create table if not exists public.rental_proposals (
  id              text primary key default gen_random_uuid()::text,
  estate_id       text not null references public.estates(id) on delete cascade,
  house_id        text references public.houses(id) on delete set null,
  applicant_id    text not null,
  applicant_name  text not null,
  applicant_email text not null,
  applicant_phone text,
  message         text,
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  created_at      timestamptz not null default now()
);

-- ─── 9. Payment Options ──────────────────────────────────────────────────────
create table if not exists public.payment_options (
  id          text primary key default gen_random_uuid()::text,
  estate_id   text not null references public.estates(id) on delete cascade,
  name        text not null,
  type        text not null,
  details     jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Disable RLS (development mode) ──────────────────────────────────────────
alter table public.users              disable row level security;
alter table public.estates            disable row level security;
alter table public.houses             disable row level security;
alter table public.notifications      disable row level security;
alter table public.maintenance_items  disable row level security;
alter table public.payments           disable row level security;
alter table public.inquiries          disable row level security;
alter table public.rental_proposals   disable row level security;
alter table public.payment_options    disable row level security;
