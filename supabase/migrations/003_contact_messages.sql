-- 003_contact_messages.sql — Contact messages & correction requests queue
-- Stores general contact form submissions and organization correction/missing-website
-- reports. Written by the server (service role) after validation & rate limiting.

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  organization_name text,
  name text not null,
  email text not null,
  topic text not null default 'general',
  subject text,
  message text not null,
  locale text,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
create index on contact_messages(status);
create index on contact_messages(created_at);
create index on contact_messages(organization_id);

alter table contact_messages enable row level security;

-- No public policies: submissions are inserted and read via the server-side
-- service role only (validated + rate limited in the application layer).
