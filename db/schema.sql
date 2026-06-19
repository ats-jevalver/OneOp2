-- OneOp2 Sprint 5 PostgreSQL starter schema
-- Purpose: production-shaped target for replacing the Sprint 4/Sprint 5 JSON store.

create table if not exists users (
  user_id text primary key,
  display_name text not null,
  email text not null unique,
  role text not null,
  status text not null default 'active'
);

create table if not exists accounts (
  account_id text primary key,
  display_name text not null,
  legal_name text,
  short_name text,
  status text not null,
  primary_domain text,
  industry text,
  segment text,
  employee_count integer,
  account_tier text,
  health_category text,
  health_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_display_name on accounts using btree (display_name);
create index if not exists idx_accounts_primary_domain on accounts using btree (primary_domain);

create table if not exists integrations (
  integration_connection_id text primary key,
  system_type text not null,
  system_name text not null,
  status text not null,
  last_successful_sync_at timestamptz,
  last_error_at timestamptz,
  last_error_message text
);

create table if not exists account_external_identities (
  account_external_identity_id text primary key,
  account_id text not null references accounts(account_id),
  integration_connection_id text not null references integrations(integration_connection_id),
  source_system_type text not null,
  source_system_name text not null,
  external_record_type text not null,
  external_id text not null,
  external_display_name text,
  external_domain text,
  match_status text not null,
  match_confidence integer,
  match_reason text,
  matched_at timestamptz,
  matched_by text,
  unique (integration_connection_id, external_record_type, external_id)
);

create index if not exists idx_external_identity_account on account_external_identities(account_id);
create index if not exists idx_external_identity_match_status on account_external_identities(match_status);

create table if not exists contacts (
  contact_id text primary key,
  account_id text not null references accounts(account_id),
  full_name text not null,
  email text,
  title text,
  is_primary_contact boolean not null default false,
  is_technical_contact boolean not null default false
);

create table if not exists account_health_scores (
  account_health_score_id text primary key,
  account_id text not null references accounts(account_id),
  score_category text not null,
  score_value integer,
  summary text not null,
  confidence text,
  top_drivers jsonb not null default '[]'::jsonb,
  evidence_item_ids jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now()
);

create index if not exists idx_health_account_category on account_health_scores(account_id, score_category);

create table if not exists recommendations (
  recommendation_id text primary key,
  account_id text not null references accounts(account_id),
  recommendation_type text not null,
  title text not null,
  reason text not null,
  priority text not null,
  status text not null default 'new',
  suggested_owner_user_id text references users(user_id),
  suggested_due_date date,
  evidence_item_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recommendations_account_status on recommendations(account_id, status);
create index if not exists idx_recommendations_type on recommendations(recommendation_type);

create table if not exists evidence_items (
  evidence_item_id text primary key,
  account_id text not null references accounts(account_id),
  source_system_type text not null,
  source_system_name text not null,
  source_record_type text not null,
  source_record_id text not null,
  summary text not null,
  observed_at timestamptz
);

create table if not exists generated_artifacts (
  generated_artifact_id text primary key,
  account_id text not null references accounts(account_id),
  artifact_type text not null,
  title text not null,
  body_format text not null,
  body text not null,
  status text not null default 'draft',
  created_by_user_id text references users(user_id),
  evidence_item_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_generated_artifacts_account_type on generated_artifacts(account_id, artifact_type);

create table if not exists write_back_audit_events (
  write_back_audit_event_id text primary key,
  account_id text not null references accounts(account_id),
  action_type text not null,
  target_record_type text not null,
  status text not null,
  adapter text,
  request_summary jsonb,
  response_summary jsonb,
  error jsonb,
  request_payload jsonb,
  external_id text,
  external_url text,
  recommendation_id text,
  generated_artifact_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_write_back_audit_account_created on write_back_audit_events(account_id, created_at desc);

create table if not exists activities (
  activity_id text primary key,
  account_id text not null references accounts(account_id),
  activity_type text not null,
  title text not null,
  body text,
  status text,
  generated_artifact_id text,
  recommendation_id text,
  external_id text,
  external_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_account_created on activities(account_id, created_at desc);

create table if not exists app_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);
