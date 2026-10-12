-- 001_initial.sql — CultureFirst normalized schema
-- Compatible with Supabase PostgreSQL. Apply with: supabase migration up
-- or via psql. Every table uses UUIDs via pgcrypto (gen_random_uuid).

create extension if not exists "pgcrypto";
create extension if not exists "pg_stat_statements";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function cf_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Organization categories
-- ---------------------------------------------------------------------------
create table organization_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name jsonb not null,        -- {en,bn}
  description jsonb not null, -- {en,bn}
  icon text not null default 'building',
  is_fallback boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reviewer relationship types
-- ---------------------------------------------------------------------------
create table reviewer_relationship_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name jsonb not null,
  kind text not null check (kind in ('patient','employee','student','citizen','beneficiary','visitor','other')),
  created_at timestamptz not null default now()
);

create table category_relationships (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references organization_categories(id) on delete cascade,
  relationship_type_id uuid not null references reviewer_relationship_types(id) on delete cascade,
  unique (category_id, relationship_type_id)
);

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  official_name text not null,
  bengali_name text,
  alternate_names text[] not null default '{}',
  category_id uuid not null references organization_categories(id) on delete restrict,
  parent_organization_id uuid references organizations(id) on delete set null,
  description jsonb not null,
  website text,
  address text,
  division text,
  district text,
  city text,
  status text not null default 'active' check (status in ('active','inactive','pending_approval','merged')),
  google_maps_url text,
  google_place_id text,
  verified boolean not null default false,
  claim_status text not null default 'unclaimed' check (claim_status in ('unclaimed','pending','claimed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_updated_at before update on organizations
  for each row execute function cf_set_updated_at();
create index on organizations(category_id);
create index on organizations(division);
create index on organizations(district);
create index on organizations using gin(alternate_names);
-- Full-text (English) — Bengali handled in app with Unicode substring search.
create index on organizations using gin(to_tsvector('english', official_name));

create table organization_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  alias text not null
);
create index on organization_aliases(organization_id);

create table organization_branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  address text,
  division text,
  district text,
  city text,
  created_at timestamptz not null default now()
);
create index on organization_branches(organization_id);

create table organization_suggestions (
  id uuid primary key default gen_random_uuid(),
  slug text,
  official_name text not null,
  category_id uuid references organization_categories(id) on delete set null,
  submitted_by uuid references profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rating templates (many-to-many with relationships)
-- ---------------------------------------------------------------------------
create table rating_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references organization_categories(id) on delete restrict,
  name jsonb not null,
  created_at timestamptz not null default now()
);

create table rating_template_relationships (
  template_id uuid not null references rating_templates(id) on delete cascade,
  relationship_type_id uuid not null references reviewer_relationship_types(id) on delete cascade,
  primary key (template_id, relationship_type_id)
);

create table rating_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references rating_templates(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  change_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);
create index on rating_template_versions(template_id, status);

create table rating_parameters (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references rating_template_versions(id) on delete cascade,
  key text not null,
  name jsonb not null,
  description jsonb not null,
  weight numeric not null check (weight >= 0 and weight <= 100),
  ordering integer not null,
  active boolean not null default true
);
create index on rating_parameters(version_id);
create unique index on rating_parameters(version_id, key) where active;

create table rating_questions (
  id uuid primary key default gen_random_uuid(),
  parameter_id uuid not null references rating_parameters(id) on delete cascade,
  text jsonb not null,
  required boolean not null default true,
  ordering integer not null
);
create index on rating_questions(parameter_id);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references organization_branches(id) on delete set null,
  category_id uuid not null references organization_categories(id) on delete restrict,
  relationship_type_id uuid not null references reviewer_relationship_types(id) on delete restrict,
  template_version_id uuid not null references rating_template_versions(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('draft','pending','published','rejected','withdrawn','flagged','under_appeal')),
  title text,
  body text not null check (char_length(body) >= 40 and char_length(body) <= 5000),
  employment_stage text,
  experience_period text,
  display_name text,
  language text not null check (language in ('en','bn','mixed')),
  score numeric(3,2) check (score is null or (score >= 1 and score <= 5)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  moderation_reason text,
  constraint review_not_self_branch
    check (branch_id is null or organization_id is not null)
);
create trigger reviews_updated_at before update on reviews
  for each row execute function cf_set_updated_at();
create index on reviews(organization_id, status);
create index on reviews(organization_id, relationship_type_id, status);
create index on reviews(user_id, status);
create index on reviews(status, created_at desc);
create unique index reviews_no_duplicate_active
  on reviews(user_id, organization_id, relationship_type_id)
  where status in ('pending','published');

create table review_answers (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  parameter_id uuid not null references rating_parameters(id) on delete cascade,
  value text not null check (value in ('1','2','3','4','5','not_observed')),
  unique (review_id, parameter_id)
);
create index on review_answers(review_id);

create table review_score_snapshots (
  review_id uuid primary key references reviews(id) on delete cascade,
  template_version_id uuid not null references rating_template_versions(id) on delete restrict,
  score numeric(3,2) check (score is null or (score >= 1 and score <= 5)),
  answered_parameters integer not null,
  weight_coverage numeric not null check (weight_coverage >= 0 and weight_coverage <= 1),
  eligible boolean not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Aggregates (precomputed on publication change)
-- ---------------------------------------------------------------------------
create table organization_score_aggregates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  branch_id uuid references organization_branches(id) on delete cascade,
  category_id uuid not null references organization_categories(id) on delete restrict,
  relationship_type_id uuid not null references reviewer_relationship_types(id) on delete restrict,
  template_version_id uuid not null references rating_template_versions(id) on delete restrict,
  eligible_count integer not null default 0 check (eligible_count >= 0),
  average_score numeric(3,2) check (average_score is null or (average_score >= 1 and average_score <= 5)),
  parameter_scores jsonb not null default '{}'::jsonb, -- {paramId: avg}
  distribution jsonb not null default '{}'::jsonb,    -- {"1":n,"2":n,...}
  computed_at timestamptz not null default now(),
  unique (organization_id, branch_id, category_id, relationship_type_id, template_version_id)
);
create index on organization_score_aggregates(organization_id);
create index on organization_score_aggregates(category_id, relationship_type_id);

-- ---------------------------------------------------------------------------
-- Reports, moderation, appeals
-- ---------------------------------------------------------------------------
create table review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  reporter_user_id uuid not null references profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create index on review_reports(review_id);
create index on review_reports(status);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  actor_user_id uuid not null references profiles(id) on delete restrict,
  action text not null check (action in ('approve','reject','return','hide','restore','withdraw')),
  reason text,
  created_at timestamptz not null default now()
);
create index on moderation_actions(review_id);
create index on moderation_actions(actor_user_id);

create table review_appeals (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null check (char_length(message) >= 10),
  status text not null default 'open' check (status in ('open','accepted','rejected')),
  created_at timestamptz not null default now()
);
create index on review_appeals(review_id);
create index on review_appeals(status);

-- ---------------------------------------------------------------------------
-- Organization claims & representatives
-- ---------------------------------------------------------------------------
create table organization_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  requester_user_id uuid not null references profiles(id) on delete cascade,
  representative_name text not null,
  position text not null,
  evidence text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index on organization_claims(organization_id);
create index on organization_claims(status);

create table organization_representatives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  position text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table organization_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  representative_user_id uuid not null references profiles(id) on delete restrict,
  body text not null check (char_length(body) >= 10 and char_length(body) <= 2000),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
create index on organization_responses(review_id);
create index on organization_responses(organization_id);

-- ---------------------------------------------------------------------------
-- Audit logs
-- ---------------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index on audit_logs(entity_type, entity_id);
create index on audit_logs(created_at desc);

-- ---------------------------------------------------------------------------
-- Platform settings (singleton row id=1)
-- ---------------------------------------------------------------------------
create table platform_settings (
  id integer primary key check (id = 1),
  brand_name text not null default 'CultureFirst',
  tagline text not null default 'Know the culture before you choose.',
  methodology_public text not null default '',
  min_provisional_reviews integer not null default 5 check (min_provisional_reviews > 0),
  min_published_reviews integer not null default 20 check (min_published_reviews >= min_provisional_reviews),
  min_answered_parameters integer not null default 3 check (min_answered_parameters > 0),
  min_weight_coverage numeric not null default 0.6 check (min_weight_coverage >= 0 and min_weight_coverage <= 1),
  maintenance_message text,
  updated_at timestamptz not null default now()
);
create trigger platform_settings_updated_at before update on platform_settings
  for each row execute function cf_set_updated_at();
insert into platform_settings (id) values (1);

-- ---------------------------------------------------------------------------
-- Auth trigger: create profile on signup
-- ---------------------------------------------------------------------------
create or replace function cf_handle_new_user() returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function cf_handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security (enable — policy names reflect intent)
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_aliases enable row level security;
alter table organization_branches enable row level security;
alter table organization_suggestions enable row level security;
alter table organization_categories enable row level security;
alter table reviewer_relationship_types enable row level security;
alter table category_relationships enable row level security;
alter table rating_templates enable row level security;
alter table rating_template_relationships enable row level security;
alter table rating_template_versions enable row level security;
alter table rating_parameters enable row level security;
alter table rating_questions enable row level security;
alter table reviews enable row level security;
alter table review_answers enable row level security;
alter table review_score_snapshots enable row level security;
alter table organization_score_aggregates enable row level security;
alter table review_reports enable row level security;
alter table moderation_actions enable row level security;
alter table review_appeals enable row level security;
alter table organization_claims enable row level security;
alter table organization_representatives enable row level security;
alter table organization_responses enable row level security;
alter table audit_logs enable row level security;
alter table platform_settings enable row level security;

-- Public read: active directory objects, categories, relationships, published templates/params
create policy "public organizations" on organizations for select using (status in ('active','inactive'));
create policy "public categories" on organization_categories for select using (true);
create policy "public relationships" on reviewer_relationship_types for select using (true);
create policy "public category relationships" on category_relationships for select using (true);
create policy "public branches" on organization_branches for select using (true);
create policy "public rating templates" on rating_templates for select using (true);
create policy "public rating template relationships" on rating_template_relationships for select using (true);
create policy "public template versions (published)" on rating_template_versions for select using (status = 'published');
create policy "public parameters (published)" on rating_parameters for select
  using (exists (select 1 from rating_template_versions v where v.id = version_id and v.status = 'published'));
create policy "public questions (published)" on rating_questions for select
  using (exists (select 1 from rating_parameters p
    join rating_template_versions v on v.id = p.version_id
    where p.id = parameter_id and v.status = 'published'));
create policy "public aggregates" on organization_score_aggregates for select using (true);
create policy "public published reviews" on reviews for select using (status = 'published');
create policy "public answers of published reviews" on review_answers for select
  using (exists (select 1 from reviews r where r.id = review_id and r.status = 'published'));
create policy "public published responses" on organization_responses for select using (status = 'published');

-- Own data
create policy "own profile" on profiles for select, update using (auth.uid() = id);
create policy "own reviews" on reviews for select using (auth.uid() = user_id);
create policy "own answers" on review_answers for select using (auth.uid() = (select user_id from reviews r where r.id = review_id));
create policy "own snapshots" on review_score_snapshots for select using (auth.uid() = (select user_id from reviews r where r.id = review_id));
create policy "own reports" on review_reports for all using (auth.uid() = reporter_user_id) with check (auth.uid() = reporter_user_id);
create policy "own appeals" on review_appeals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own claims" on organization_claims for select using (auth.uid() = requester_user_id);
create policy "own responses (representative)" on organization_responses for select
  using (auth.uid() = representative_user_id);

-- Representatives read private organization fields (verified directory data)
create policy "representative aggregates" on organization_score_aggregates for select
  using (exists (select 1 from organization_representatives rep where rep.organization_id = organization_id and rep.user_id = auth.uid()));

-- Admin/moderator (service role bypasses RLS; policies below are for authenticated app roles)
create policy "moderator reads queues" on reviews for select
  using ((select role from profiles where id = auth.uid()) in ('admin','moderator'));
create policy "moderator moderation actions" on moderation_actions for select
  using ((select role from profiles where id = auth.uid()) in ('admin','moderator'));
create policy "admin platform settings" on platform_settings for select
  using ((select role from profiles where id = auth.uid()) in ('admin','moderator'));
create policy "admin audit logs" on audit_logs for select
  using ((select role from profiles where id = auth.uid()) in ('admin','moderator'));

-- All inserts/updates go through server-side validation (service role or owner policies above).
-- No generic anon insert policy is granted on reviews or organizations.
