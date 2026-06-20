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


create table if not exists account_owners (
  account_id text not null references accounts(account_id),
  user_id text not null references users(user_id),
  role text not null,
  is_primary boolean not null default false,
  primary key (account_id, user_id, role)
);

create index if not exists idx_account_owners_user on account_owners(user_id);

create table if not exists account_aliases (
  account_id text not null references accounts(account_id),
  alias_value text not null,
  primary key (account_id, alias_value)
);

create index if not exists idx_account_aliases_alias on account_aliases(alias_value);

create table if not exists agreements (
  agreement_id text primary key,
  account_id text not null references accounts(account_id),
  name text not null,
  status text not null,
  agreement_type text not null,
  renewal_date date,
  monthly_recurring_revenue numeric(12,2),
  annual_recurring_revenue numeric(12,2)
);

create index if not exists idx_agreements_account on agreements(account_id);

create table if not exists renewals (
  renewal_id text primary key,
  account_id text not null references accounts(account_id),
  agreement_id text references agreements(agreement_id),
  renewal_date date not null,
  status text not null,
  renewal_amount numeric(12,2),
  owner_user_id text references users(user_id),
  days_until_renewal integer,
  risk_reason text
);

create index if not exists idx_renewals_account_date on renewals(account_id, renewal_date);

create table if not exists tickets (
  ticket_id text primary key,
  account_id text not null references accounts(account_id),
  source_system_name text not null,
  external_id text not null,
  title text not null,
  status text not null,
  priority text,
  category text,
  subcategory text,
  assigned_team text,
  sla_status text,
  is_escalated boolean not null default false,
  is_recurring_issue_candidate boolean not null default false,
  created_at_source timestamptz,
  age_days integer
);

create index if not exists idx_tickets_account_status on tickets(account_id, status);
create index if not exists idx_tickets_priority on tickets(priority);

create table if not exists devices (
  device_id text primary key,
  account_id text not null references accounts(account_id),
  source_system_name text not null,
  external_id text not null,
  display_name text not null,
  device_type text,
  status text,
  operating_system text,
  last_seen_at timestamptz,
  last_patched_at timestamptz,
  patch_status text,
  warranty_expiration_date date,
  age_years numeric(5,2),
  is_end_of_life boolean not null default false,
  is_server boolean not null default false,
  is_critical boolean not null default false
);

create index if not exists idx_devices_account_status on devices(account_id, status);
create index if not exists idx_devices_patch_status on devices(patch_status);

create table if not exists device_health_signals (
  device_health_signal_id text primary key,
  account_id text not null references accounts(account_id),
  device_id text references devices(device_id),
  source_system_name text not null,
  external_id text not null,
  signal_type text not null,
  severity text not null,
  summary text not null,
  observed_at timestamptz
);

create index if not exists idx_device_health_signals_account on device_health_signals(account_id);
create index if not exists idx_device_health_signals_severity on device_health_signals(severity);

create table if not exists security_findings (
  security_finding_id text primary key,
  account_id text not null references accounts(account_id),
  source_system_name text not null,
  external_id text not null,
  finding_type text not null,
  severity text not null,
  status text not null,
  title text not null,
  description text,
  affected_service text,
  business_impact text,
  recommended_remediation text,
  observed_at timestamptz,
  is_customer_facing boolean not null default false
);

create index if not exists idx_security_findings_account_status on security_findings(account_id, status);
create index if not exists idx_security_findings_severity on security_findings(severity);

create table if not exists security_coverage (
  security_coverage_id text primary key,
  account_id text not null references accounts(account_id),
  coverage_type text not null,
  coverage_status text not null,
  product_name text,
  vendor_name text,
  device_count_covered integer,
  device_count_missing integer,
  last_verified_at timestamptz
);

create index if not exists idx_security_coverage_account_status on security_coverage(account_id, coverage_status);

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

alter table generated_artifacts add column if not exists account_plan_objective_id text references account_plan_objectives(account_plan_objective_id);
alter table generated_artifacts add column if not exists account_plan_next_step_id text;
alter table generated_artifacts add column if not exists reviewed_by_user_id text references users(user_id);
alter table generated_artifacts add column if not exists review_notes text;

create index if not exists idx_generated_artifacts_account_type on generated_artifacts(account_id, artifact_type);
create index if not exists idx_generated_artifacts_plan_objective on generated_artifacts(account_plan_objective_id);

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


create table if not exists account_plans (
  account_plan_id text primary key,
  account_id text not null references accounts(account_id),
  plan_name text not null,
  status text not null,
  plan_summary text,
  owner_user_id text references users(user_id),
  target_review_date date,
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_plans_account on account_plans(account_id);

create table if not exists account_plan_objectives (
  account_plan_objective_id text primary key,
  account_plan_id text not null references account_plans(account_plan_id) on delete cascade,
  title text not null,
  objective_type text not null,
  status text not null,
  priority text not null,
  target_date date,
  success_metric text,
  linked_recommendation_id text
);

create index if not exists idx_account_plan_objectives_plan on account_plan_objectives(account_plan_id);

create table if not exists account_plan_risks (
  account_plan_risk_id text primary key,
  account_plan_id text not null references account_plans(account_plan_id) on delete cascade,
  title text not null,
  severity text not null,
  status text not null default 'open',
  mitigation text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_plan_risks_plan on account_plan_risks(account_plan_id);

create table if not exists account_plan_next_steps (
  account_plan_next_step_id text primary key,
  account_plan_id text not null references account_plans(account_plan_id) on delete cascade,
  title text not null,
  owner_user_id text references users(user_id),
  due_date date,
  status text not null default 'open',
  linked_objective_id text references account_plan_objectives(account_plan_objective_id),
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_plan_next_steps_plan on account_plan_next_steps(account_plan_id);

create table if not exists account_plan_stakeholders (
  account_plan_stakeholder_id text primary key,
  account_plan_id text not null references account_plans(account_plan_id) on delete cascade,
  contact_id text references contacts(contact_id),
  stakeholder_role text not null,
  relationship_strength text,
  sentiment text,
  notes text
);

create index if not exists idx_account_plan_stakeholders_plan on account_plan_stakeholders(account_plan_id);

create table if not exists contact_engagement_events (
  engagement_event_id text primary key,
  account_id text not null references accounts(account_id),
  contact_id text references contacts(contact_id),
  event_type text not null,
  occurred_at timestamptz not null,
  summary text not null,
  sentiment text,
  source_system_type text
);

create index if not exists idx_contact_engagement_account_occurred on contact_engagement_events(account_id, occurred_at desc);

create table if not exists integration_configurations (
  integration_connection_id text primary key references integrations(integration_connection_id),
  provider_type text not null,
  environment_label text,
  base_url text,
  tenant_or_company_id text,
  enabled_capabilities jsonb not null default '[]'::jsonb,
  secret_status text not null default 'not_configured',
  updated_by_user_id text references users(user_id),
  updated_at timestamptz not null default now()
);

create table if not exists integration_sync_history (
  sync_run_id text primary key,
  integration_connection_id text not null references integrations(integration_connection_id),
  mode text not null,
  status text not null,
  counts jsonb not null default '{}'::jsonb,
  applied_rows jsonb not null default '[]'::jsonb,
  skipped_rows jsonb not null default '[]'::jsonb,
  conflict_rows jsonb not null default '[]'::jsonb,
  applied_by_user_id text references users(user_id),
  applied_at timestamptz not null default now()
);

create index if not exists idx_integration_sync_history_connection_applied on integration_sync_history(integration_connection_id, applied_at desc);

create table if not exists app_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

