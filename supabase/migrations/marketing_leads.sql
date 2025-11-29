-- Marketing Leads Table
-- Run this on BOTH dev and production Supabase branches
-- 
-- This table stores leads from the marketing website (writegreatnotes.ai)
-- before they complete signup on the app (app.writegreatnotes.ai)

create table if not exists marketing_leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  practice_name text,
  practice_size text,
  current_emr text,
  inquiry_type text,
  message text,
  source text
);

-- Create index on email for quick lookups
create index if not exists marketing_leads_email_idx on marketing_leads(email);

-- Create index on created_at for time-based queries
create index if not exists marketing_leads_created_at_idx on marketing_leads(created_at desc);

-- Enable Row Level Security (optional - remove if you want open access)
-- alter table marketing_leads enable row level security;

-- Allow inserts from the anon key (for the marketing website)
-- create policy "Allow anonymous inserts" on marketing_leads
--   for insert
--   to anon
--   with check (true);

-- Allow authenticated users to read all leads (for admin dashboard)
-- create policy "Allow authenticated reads" on marketing_leads
--   for select
--   to authenticated
--   using (true);

-- Comment on table
comment on table marketing_leads is 'Leads captured from the marketing website before signup';

