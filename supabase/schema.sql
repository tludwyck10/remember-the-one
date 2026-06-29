-- ============================================================
-- Remember The One — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- Pastor profile (single row)
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null default 'Alex',
  last_name    text not null default 'Johnson',
  title        text not null default 'Pastor',
  role         text not null default 'Lead Pastor',
  campus       text not null default 'Frisco',
  phone        text not null default '',
  email        text not null default '',
  bio          text not null default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Contacts
create table if not exists people (
  id                 text primary key,
  name               text not null,
  circle             text not null default 'Growth Circle',
  phone              text not null default '',
  email              text not null default '',
  campus             text not null default '',
  notes              text not null default '',
  cll_stage          text not null default 'Belong',
  last_contact       text not null default '',
  last_contact_days  int  not null default 0,
  growth_areas       text[] not null default '{}',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Conversations (per person)
create table if not exists conversations (
  id         text primary key,
  person_id  text not null references people(id) on delete cascade,
  date       text not null,
  notes      text not null,
  created_at timestamptz default now()
);

-- Prayer requests (per person)
create table if not exists prayer_requests (
  id          text primary key,
  person_id   text not null references people(id) on delete cascade,
  person_name text not null,
  request     text not null,
  date_added  text not null,
  status      text not null default 'Active',
  days_active int  not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Life events (per person)
create table if not exists life_events (
  id         text primary key,
  person_id  text not null references people(id) on delete cascade,
  event      text not null,
  date       text not null,
  category   text not null,
  created_at timestamptz default now()
);

-- Follow-up tasks (global, linked to person)
create table if not exists tasks (
  id          text primary key,
  person_id   text not null references people(id) on delete cascade,
  person_name text not null,
  label       text not null,
  type        text not null default 'call',
  date        text not null,
  time        text not null default '',
  category    text not null default 'This Week',
  notes       text not null default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Indexes for common lookups ───────────────────────────────
create index if not exists idx_conversations_person on conversations(person_id);
create index if not exists idx_prayers_person       on prayer_requests(person_id);
create index if not exists idx_life_events_person   on life_events(person_id);
create index if not exists idx_tasks_person         on tasks(person_id);
create index if not exists idx_tasks_date           on tasks(date);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create or replace trigger trg_people_updated_at
  before update on people
  for each row execute function set_updated_at();

create or replace trigger trg_prayers_updated_at
  before update on prayer_requests
  for each row execute function set_updated_at();

create or replace trigger trg_tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();
