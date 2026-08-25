create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  roll_no text unique not null,
  name text not null,
  blood_group text not null,
  allergies text default 'None known',
  medical_conditions text default 'None declared',
  habits text default 'None known',
  emergency_contacts jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table profiles enable row level security;

-- Public can insert new registrations
create policy "Allow public insert"
  on profiles for insert
  with check (true);

-- Public can read profiles for instant emergency access
create policy "Allow public read by roll_no"
  on profiles for select
  using (true);
