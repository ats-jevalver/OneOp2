
# Database Schema: Buffaly Account Intelligence Platform MVP

## 1. Purpose

This document defines the MVP database schema for the Buffaly-powered Account Intelligence Platform. It translates the PRD, data model, ontology, UX, and implementation epics into a relational schema suitable for application development.

The schema is account-centered and designed to support:

- PSA, RMM, and security/Microsoft 365 integrations.
- Account identity resolution across systems.
- Account health scoring.
- Evidence-backed recommendations.
- Generated briefs, QBRs, and email drafts.
- PSA task, note, and opportunity write-back.
- Data freshness, auditability, and pilot analytics.

## 2. Schema Design Principles

- Use `account_id` as the primary aggregate reference for account-facing data.
- Preserve source-system identity with `source_system_name`, `external_id`, and `external_url` fields.
- Store source records in normalized canonical tables, not only raw JSON.
- Allow optional `raw_payload_json` for troubleshooting and future enrichment.
- Store derived intelligence separately from source data.
- Every recommendation, score, and generated artifact should be able to reference evidence.
- Use soft deletion only where source records can disappear but historical context should remain.
- Use UTC timestamps.
- Keep enum values explicit and stable.

## 3. Naming Conventions

- Table names: plural snake_case.
- Primary keys: singular table name plus `_id`, using UUID/ULID.
- Foreign keys: referenced singular name plus `_id`.
- Timestamps: `created_at`, `updated_at`, `deleted_at` where needed.
- External source identifiers: `source_system_name`, `external_id`, `external_url`.
- JSON fields: suffix `_json`.

## 4. Recommended Database

Recommended MVP database: PostgreSQL.

Reasons:
- Strong relational integrity.
- Good JSONB support for source payloads and flexible metadata.
- Good indexing support.
- Mature full-text and trigram search options.

This schema can be adapted to SQL Server or another relational store if needed.

## 5. Common Field Types

- `uuid`: primary and foreign keys.
- `text`: names, descriptions, external identifiers.
- `varchar(n)`: constrained short values where desired.
- `timestamptz`: UTC timestamps.
- `date`: renewal and due dates.
- `numeric(12,2)`: currency values.
- `numeric(5,2)`: percentages.
- `integer`: counts, score values, confidence values.
- `boolean`: flags.
- `jsonb`: raw payloads, metadata, derived structured details.

## 6. Enum / Lookup Values

These may be implemented as PostgreSQL enums, lookup tables, or application-level constants.

### account_status
- active
- inactive
- prospect
- former
- unknown

### source_system_type
- psa
- rmm
- security
- microsoft365
- finance
- other

### match_status
- suggested
- confirmed
- rejected
- needs_review

### owner_role
- account_manager
- sales_rep
- service_manager
- security_lead
- executive_sponsor

### agreement_status
- active
- pending
- expired
- cancelled
- unknown

### renewal_status
- upcoming
- in_progress
- complete
- at_risk
- missed
- unknown

### device_type
- server
- workstation
- network_device
- mobile_device
- virtual_machine
- other
- unknown

### device_status
- online
- offline
- retired
- unknown

### severity
- informational
- low
- medium
- high
- critical

### health_score_category
- healthy
- watch
- at_risk
- expansion_candidate
- renewal_risk

### recommendation_status
- new
- accepted
- dismissed
- snoozed
- converted_to_task
- converted_to_opportunity
- completed

### generated_artifact_type
- account_brief
- qbr_draft
- customer_email_draft
- executive_summary
- internal_handoff
- other

### integration_status
- connected
- disconnected
- error
- disabled

### sync_status
- started
- succeeded
- failed
- partial

## 7. Core Identity and Integration Tables

### 7.1 users

Application users, including account managers, sales reps, service managers, security leads, executives, and admins.

```sql
CREATE TABLE users (
    user_id uuid PRIMARY KEY,
    display_name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    external_identity_provider text NULL,
    external_user_id text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `users_email_idx` on `email`.
- `users_role_idx` on `role`.

### 7.2 integration_connections

Configured connections to PSA, RMM, security, Microsoft 365, or other systems.

```sql
CREATE TABLE integration_connections (
    integration_connection_id uuid PRIMARY KEY,
    system_type text NOT NULL,
    system_name text NOT NULL,
    status text NOT NULL DEFAULT 'disconnected',
    tenant_identifier text NULL,
    api_base_url text NULL,
    credential_reference text NULL,
    last_successful_sync_at timestamptz NULL,
    last_error_at timestamptz NULL,
    last_error_message text NULL,
    owner_user_id uuid NULL REFERENCES users(user_id),
    metadata_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `integration_connections_system_type_idx` on `system_type`.
- `integration_connections_status_idx` on `status`.

### 7.3 sync_runs

Sync history for integrations.

```sql
CREATE TABLE sync_runs (
    sync_run_id uuid PRIMARY KEY,
    integration_connection_id uuid NOT NULL REFERENCES integration_connections(integration_connection_id),
    sync_type text NOT NULL,
    status text NOT NULL,
    started_at timestamptz NOT NULL,
    completed_at timestamptz NULL,
    records_read integer NOT NULL DEFAULT 0,
    records_created integer NOT NULL DEFAULT 0,
    records_updated integer NOT NULL DEFAULT 0,
    records_skipped integer NOT NULL DEFAULT 0,
    warning_count integer NOT NULL DEFAULT 0,
    error_message text NULL,
    metadata_json jsonb NULL
);
```

Indexes:
- `sync_runs_connection_started_idx` on `(integration_connection_id, started_at DESC)`.
- `sync_runs_status_idx` on `status`.

## 8. Account and Relationship Tables

### 8.1 accounts

Canonical customer/account records.

```sql
CREATE TABLE accounts (
    account_id uuid PRIMARY KEY,
    display_name text NOT NULL,
    legal_name text NULL,
    short_name text NULL,
    status text NOT NULL DEFAULT 'unknown',
    primary_domain text NULL,
    industry text NULL,
    segment text NULL,
    employee_count integer NULL,
    location_count integer NULL,
    account_tier text NULL,
    primary_psa_company_id text NULL,
    primary_rmm_client_id text NULL,
    primary_security_tenant_id text NULL,
    notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- `accounts_display_name_idx` on `display_name`.
- `accounts_primary_domain_idx` on `primary_domain`.
- `accounts_status_idx` on `status`.
- Optional PostgreSQL trigram index on `display_name` for search.

### 8.2 account_external_identities

Maps canonical accounts to PSA/RMM/security/M365 source records.

```sql
CREATE TABLE account_external_identities (
    account_external_identity_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    integration_connection_id uuid NOT NULL REFERENCES integration_connections(integration_connection_id),
    source_system_type text NOT NULL,
    source_system_name text NOT NULL,
    external_record_type text NOT NULL,
    external_id text NOT NULL,
    external_display_name text NULL,
    external_domain text NULL,
    external_tenant_id text NULL,
    external_url text NULL,
    match_status text NOT NULL DEFAULT 'suggested',
    match_confidence integer NOT NULL DEFAULT 0,
    matched_by text NULL,
    matched_at timestamptz NULL,
    match_reason text NULL,
    alias_used text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- Unique recommended: `(integration_connection_id, external_record_type, external_id)`.
- `account_external_identities_account_idx` on `account_id`.
- `account_external_identities_match_status_idx` on `match_status`.
- `account_external_identities_external_domain_idx` on `external_domain`.

### 8.3 account_aliases

Optional but useful for identity resolution and search.

```sql
CREATE TABLE account_aliases (
    account_alias_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    alias_value text NOT NULL,
    alias_type text NOT NULL DEFAULT 'name',
    source text NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `account_aliases_account_idx` on `account_id`.
- `account_aliases_value_idx` on `alias_value`.

### 8.4 account_owners

Commercial, service, security, or executive ownership assignments.

```sql
CREATE TABLE account_owners (
    account_owner_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    user_id uuid NOT NULL REFERENCES users(user_id),
    role text NOT NULL,
    is_primary boolean NOT NULL DEFAULT false,
    effective_from date NOT NULL DEFAULT CURRENT_DATE,
    effective_to date NULL,
    source_system_name text NULL,
    external_owner_id text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `account_owners_account_idx` on `account_id`.
- `account_owners_user_idx` on `user_id`.
- `account_owners_role_idx` on `role`.

### 8.5 contacts

Customer-side contacts.

```sql
CREATE TABLE contacts (
    contact_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    full_name text NOT NULL,
    email text NULL,
    phone text NULL,
    mobile_phone text NULL,
    title text NULL,
    department text NULL,
    status text NOT NULL DEFAULT 'unknown',
    is_primary_contact boolean NOT NULL DEFAULT false,
    is_billing_contact boolean NOT NULL DEFAULT false,
    is_technical_contact boolean NOT NULL DEFAULT false,
    is_executive_contact boolean NOT NULL DEFAULT false,
    relationship_strength text NULL,
    last_interaction_at timestamptz NULL,
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- `contacts_account_idx` on `account_id`.
- `contacts_email_idx` on `email`.
- Unique optional: `(source_system_name, external_id)` where `external_id IS NOT NULL`.

### 8.6 agreements

Contracts, managed service agreements, subscriptions, or recurring service plans.

```sql
CREATE TABLE agreements (
    agreement_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    name text NOT NULL,
    status text NOT NULL DEFAULT 'unknown',
    agreement_type text NULL,
    start_date date NULL,
    end_date date NULL,
    renewal_date date NULL,
    auto_renew boolean NULL,
    billing_frequency text NULL,
    monthly_recurring_revenue numeric(12,2) NULL,
    annual_recurring_revenue numeric(12,2) NULL,
    gross_margin_percent numeric(5,2) NULL,
    included_services_json jsonb NULL,
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- `agreements_account_idx` on `account_id`.
- `agreements_renewal_date_idx` on `renewal_date`.
- `agreements_status_idx` on `status`.

### 8.7 renewals

Renewal events for agreements, services, subscriptions, or licenses.

```sql
CREATE TABLE renewals (
    renewal_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    agreement_id uuid NULL REFERENCES agreements(agreement_id),
    opportunity_id uuid NULL,
    renewal_type text NOT NULL,
    renewal_date date NOT NULL,
    status text NOT NULL DEFAULT 'upcoming',
    renewal_amount numeric(12,2) NULL,
    owner_user_id uuid NULL REFERENCES users(user_id),
    days_until_renewal integer NULL,
    risk_reason text NULL,
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `renewals_account_idx` on `account_id`.
- `renewals_date_idx` on `renewal_date`.
- `renewals_status_idx` on `status`.
- `renewals_owner_idx` on `owner_user_id`.

Note: `opportunity_id` can be converted to a foreign key after the `opportunities` table exists in migrations.

## 9. Service, RMM, Security, and Sales Tables

### 9.1 tickets

PSA service tickets, incidents, requests, escalations, or issues.

```sql
CREATE TABLE tickets (
    ticket_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    contact_id uuid NULL REFERENCES contacts(contact_id),
    source_system_name text NOT NULL,
    external_id text NOT NULL,
    external_url text NULL,
    title text NOT NULL,
    summary text NULL,
    status text NOT NULL,
    priority text NULL,
    category text NULL,
    subcategory text NULL,
    ticket_type text NULL,
    assigned_team text NULL,
    assigned_user_id uuid NULL REFERENCES users(user_id),
    sla_status text NULL,
    is_escalated boolean NOT NULL DEFAULT false,
    is_recurring_issue_candidate boolean NOT NULL DEFAULT false,
    created_at_source timestamptz NULL,
    closed_at_source timestamptz NULL,
    last_updated_at_source timestamptz NULL,
    age_days integer NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- Unique recommended: `(source_system_name, external_id)`.
- `tickets_account_idx` on `account_id`.
- `tickets_status_idx` on `status`.
- `tickets_priority_idx` on `priority`.
- `tickets_created_source_idx` on `created_at_source DESC`.
- `tickets_age_idx` on `age_days`.

### 9.2 ticket_trends

Derived service trend summaries.

```sql
CREATE TABLE ticket_trends (
    ticket_trend_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    period_start date NOT NULL,
    period_end date NOT NULL,
    trend_type text NOT NULL,
    summary text NOT NULL,
    ticket_count integer NULL,
    open_ticket_count integer NULL,
    aging_ticket_count integer NULL,
    high_priority_ticket_count integer NULL,
    sla_risk_count integer NULL,
    top_categories_json jsonb NULL,
    previous_period_comparison_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `ticket_trends_account_period_idx` on `(account_id, period_start, period_end)`.
- `ticket_trends_type_idx` on `trend_type`.

### 9.3 devices

RMM/asset records.

```sql
CREATE TABLE devices (
    device_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    source_system_name text NOT NULL,
    external_id text NOT NULL,
    external_url text NULL,
    display_name text NOT NULL,
    site_name text NULL,
    device_type text NOT NULL DEFAULT 'unknown',
    status text NOT NULL DEFAULT 'unknown',
    operating_system text NULL,
    operating_system_version text NULL,
    manufacturer text NULL,
    model text NULL,
    serial_number text NULL,
    last_seen_at timestamptz NULL,
    last_patched_at timestamptz NULL,
    patch_status text NULL,
    warranty_expiration_date date NULL,
    install_date date NULL,
    age_years numeric(5,2) NULL,
    is_end_of_life boolean NOT NULL DEFAULT false,
    is_server boolean NOT NULL DEFAULT false,
    is_critical boolean NOT NULL DEFAULT false,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- Unique recommended: `(source_system_name, external_id)`.
- `devices_account_idx` on `account_id`.
- `devices_status_idx` on `status`.
- `devices_type_idx` on `device_type`.
- `devices_last_seen_idx` on `last_seen_at DESC`.
- `devices_patch_status_idx` on `patch_status`.
- `devices_eol_idx` on `is_end_of_life`.

### 9.4 device_health_signals

Device-level health, lifecycle, or management signals.

```sql
CREATE TABLE device_health_signals (
    device_health_signal_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    device_id uuid NULL REFERENCES devices(device_id),
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    signal_type text NOT NULL,
    severity text NOT NULL DEFAULT 'informational',
    summary text NOT NULL,
    remediation_status text NULL,
    observed_at timestamptz NOT NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `device_health_signals_account_idx` on `account_id`.
- `device_health_signals_device_idx` on `device_id`.
- `device_health_signals_severity_idx` on `severity`.
- `device_health_signals_observed_idx` on `observed_at DESC`.

### 9.5 security_findings

Security alerts, incidents, vulnerabilities, risky configurations, missing controls, or compliance findings.

```sql
CREATE TABLE security_findings (
    security_finding_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    source_system_name text NOT NULL,
    external_id text NOT NULL,
    external_url text NULL,
    finding_type text NOT NULL,
    severity text NOT NULL DEFAULT 'informational',
    status text NOT NULL DEFAULT 'unknown',
    title text NOT NULL,
    description text NULL,
    affected_user text NULL,
    affected_device_id uuid NULL REFERENCES devices(device_id),
    affected_service text NULL,
    business_impact text NULL,
    recommended_remediation text NULL,
    due_date date NULL,
    observed_at timestamptz NOT NULL,
    is_customer_facing boolean NOT NULL DEFAULT false,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- Unique recommended: `(source_system_name, external_id)`.
- `security_findings_account_idx` on `account_id`.
- `security_findings_severity_idx` on `severity`.
- `security_findings_status_idx` on `status`.
- `security_findings_observed_idx` on `observed_at DESC`.

### 9.6 security_coverage

Security product/service coverage by account or device.

```sql
CREATE TABLE security_coverage (
    security_coverage_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    device_id uuid NULL REFERENCES devices(device_id),
    coverage_type text NOT NULL,
    coverage_status text NOT NULL DEFAULT 'unknown',
    product_name text NULL,
    vendor_name text NULL,
    user_count_covered integer NULL,
    device_count_covered integer NULL,
    device_count_missing integer NULL,
    source_system_name text NULL,
    last_verified_at timestamptz NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `security_coverage_account_idx` on `account_id`.
- `security_coverage_type_idx` on `coverage_type`.
- `security_coverage_status_idx` on `coverage_status`.

### 9.7 opportunities

Sales opportunities from the PSA or Buffaly-suggested opportunities.

```sql
CREATE TABLE opportunities (
    opportunity_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    title text NOT NULL,
    status text NOT NULL DEFAULT 'suggested',
    opportunity_type text NOT NULL DEFAULT 'other',
    estimated_amount numeric(12,2) NULL,
    stage text NULL,
    probability numeric(5,2) NULL,
    owner_user_id uuid NULL REFERENCES users(user_id),
    expected_close_date date NULL,
    source text NOT NULL DEFAULT 'manual',
    recommendation_id uuid NULL,
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL
);
```

Indexes:
- `opportunities_account_idx` on `account_id`.
- `opportunities_status_idx` on `status`.
- `opportunities_owner_idx` on `owner_user_id`.
- `opportunities_expected_close_idx` on `expected_close_date`.

### 9.8 activities

Tasks, notes, calls, meetings, follow-ups, or PSA activity records.

```sql
CREATE TABLE activities (
    activity_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    activity_type text NOT NULL,
    title text NOT NULL,
    body text NULL,
    status text NOT NULL DEFAULT 'open',
    due_date date NULL,
    owner_user_id uuid NULL REFERENCES users(user_id),
    source text NOT NULL DEFAULT 'manual',
    recommendation_id uuid NULL,
    generated_artifact_id uuid NULL,
    source_system_name text NULL,
    external_id text NULL,
    external_url text NULL,
    raw_payload_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz NULL,
    deleted_at timestamptz NULL
);
```

Indexes:
- `activities_account_idx` on `account_id`.
- `activities_owner_idx` on `owner_user_id`.
- `activities_status_idx` on `status`.
- `activities_due_date_idx` on `due_date`.
- `activities_created_idx` on `created_at DESC`.

## 10. Intelligence, Evidence, Artifact, and Audit Tables

### 10.1 evidence_items

Source-backed facts used to explain account health, recommendations, and generated artifacts.

```sql
CREATE TABLE evidence_items (
    evidence_item_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    source_system_name text NOT NULL,
    source_record_type text NOT NULL,
    source_record_id text NOT NULL,
    source_record_url text NULL,
    evidence_type text NOT NULL,
    summary text NOT NULL,
    severity text NULL,
    observed_at timestamptz NOT NULL,
    raw_value text NULL,
    normalized_value text NULL,
    confidence integer NULL,
    metadata_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `evidence_items_account_idx` on `account_id`.
- `evidence_items_type_idx` on `evidence_type`.
- `evidence_items_source_idx` on `(source_system_name, source_record_type, source_record_id)`.
- `evidence_items_observed_idx` on `observed_at DESC`.

### 10.2 account_health_scores

Derived account health classifications.

```sql
CREATE TABLE account_health_scores (
    account_health_score_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    score_category text NOT NULL,
    score_value integer NULL,
    summary text NOT NULL,
    period_start date NULL,
    period_end date NULL,
    service_health_component integer NULL,
    rmm_health_component integer NULL,
    security_health_component integer NULL,
    renewal_risk_component integer NULL,
    expansion_potential_component integer NULL,
    confidence text NULL,
    calculated_at timestamptz NOT NULL DEFAULT now(),
    metadata_json jsonb NULL
);
```

Indexes:
- `account_health_scores_account_calculated_idx` on `(account_id, calculated_at DESC)`.
- `account_health_scores_category_idx` on `score_category`.

### 10.3 account_health_score_evidence

Many-to-many relationship between health scores and evidence items.

```sql
CREATE TABLE account_health_score_evidence (
    account_health_score_id uuid NOT NULL REFERENCES account_health_scores(account_health_score_id) ON DELETE CASCADE,
    evidence_item_id uuid NOT NULL REFERENCES evidence_items(evidence_item_id) ON DELETE CASCADE,
    PRIMARY KEY (account_health_score_id, evidence_item_id)
);
```

### 10.4 recommendations

Buffaly-generated next best actions.

```sql
CREATE TABLE recommendations (
    recommendation_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    recommendation_type text NOT NULL,
    title text NOT NULL,
    reason text NOT NULL,
    priority text NOT NULL DEFAULT 'medium',
    status text NOT NULL DEFAULT 'new',
    suggested_owner_user_id uuid NULL REFERENCES users(user_id),
    suggested_due_date date NULL,
    related_opportunity_id uuid NULL REFERENCES opportunities(opportunity_id),
    related_activity_id uuid NULL REFERENCES activities(activity_id),
    related_generated_artifact_id uuid NULL,
    confidence text NULL,
    dismissal_reason text NULL,
    snoozed_until date NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz NULL,
    metadata_json jsonb NULL
);
```

Indexes:
- `recommendations_account_idx` on `account_id`.
- `recommendations_status_idx` on `status`.
- `recommendations_priority_idx` on `priority`.
- `recommendations_due_date_idx` on `suggested_due_date`.
- `recommendations_owner_idx` on `suggested_owner_user_id`.

### 10.5 recommendation_evidence

Many-to-many relationship between recommendations and evidence items.

```sql
CREATE TABLE recommendation_evidence (
    recommendation_id uuid NOT NULL REFERENCES recommendations(recommendation_id) ON DELETE CASCADE,
    evidence_item_id uuid NOT NULL REFERENCES evidence_items(evidence_item_id) ON DELETE CASCADE,
    PRIMARY KEY (recommendation_id, evidence_item_id)
);
```

### 10.6 generated_artifacts

Buffaly-generated account briefs, QBR drafts, customer email drafts, executive summaries, and internal handoff notes.

```sql
CREATE TABLE generated_artifacts (
    generated_artifact_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    artifact_type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    body_format text NOT NULL DEFAULT 'markdown',
    audience text NULL,
    period_start date NULL,
    period_end date NULL,
    status text NOT NULL DEFAULT 'draft',
    created_by_user_id uuid NULL REFERENCES users(user_id),
    external_attachment_id text NULL,
    external_url text NULL,
    metadata_json jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    approved_at timestamptz NULL,
    archived_at timestamptz NULL
);
```

Indexes:
- `generated_artifacts_account_idx` on `account_id`.
- `generated_artifacts_type_idx` on `artifact_type`.
- `generated_artifacts_created_idx` on `created_at DESC`.
- `generated_artifacts_user_idx` on `created_by_user_id`.

### 10.7 generated_artifact_evidence

Many-to-many relationship between generated artifacts and evidence items.

```sql
CREATE TABLE generated_artifact_evidence (
    generated_artifact_id uuid NOT NULL REFERENCES generated_artifacts(generated_artifact_id) ON DELETE CASCADE,
    evidence_item_id uuid NOT NULL REFERENCES evidence_items(evidence_item_id) ON DELETE CASCADE,
    PRIMARY KEY (generated_artifact_id, evidence_item_id)
);
```

### 10.8 generated_artifact_recommendations

Relationship between generated artifacts and recommendations used or referenced.

```sql
CREATE TABLE generated_artifact_recommendations (
    generated_artifact_id uuid NOT NULL REFERENCES generated_artifacts(generated_artifact_id) ON DELETE CASCADE,
    recommendation_id uuid NOT NULL REFERENCES recommendations(recommendation_id) ON DELETE CASCADE,
    PRIMARY KEY (generated_artifact_id, recommendation_id)
);
```

### 10.9 write_back_audit_events

Audit records for external write-back actions.

```sql
CREATE TABLE write_back_audit_events (
    write_back_audit_event_id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES accounts(account_id),
    user_id uuid NULL REFERENCES users(user_id),
    integration_connection_id uuid NULL REFERENCES integration_connections(integration_connection_id),
    action_type text NOT NULL,
    target_record_type text NOT NULL,
    status text NOT NULL,
    request_payload_json jsonb NULL,
    response_payload_json jsonb NULL,
    external_id text NULL,
    external_url text NULL,
    error_message text NULL,
    recommendation_id uuid NULL REFERENCES recommendations(recommendation_id),
    generated_artifact_id uuid NULL REFERENCES generated_artifacts(generated_artifact_id),
    created_at timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `write_back_audit_account_idx` on `account_id`.
- `write_back_audit_user_idx` on `user_id`.
- `write_back_audit_created_idx` on `created_at DESC`.
- `write_back_audit_status_idx` on `status`.

### 10.10 product_events

Analytics/product usage events for MVP validation.

```sql
CREATE TABLE product_events (
    product_event_id uuid PRIMARY KEY,
    user_id uuid NULL REFERENCES users(user_id),
    account_id uuid NULL REFERENCES accounts(account_id),
    event_type text NOT NULL,
    event_timestamp timestamptz NOT NULL DEFAULT now(),
    event_properties_json jsonb NULL
);
```

Indexes:
- `product_events_type_time_idx` on `(event_type, event_timestamp DESC)`.
- `product_events_user_time_idx` on `(user_id, event_timestamp DESC)`.
- `product_events_account_time_idx` on `(account_id, event_timestamp DESC)`.

## 11. Recommended Read Models / Views

These are not required as physical tables, but are useful as SQL views or API read models.

### 11.1 account_command_center_view

Combines account header fields with current owner, current agreement, renewal date, latest health score, and data freshness.

Suggested fields:
- account_id.
- display_name.
- primary_domain.
- account_owner_name.
- agreement_name.
- agreement_type.
- renewal_date.
- days_until_renewal.
- latest_health_category.
- latest_health_summary.
- psa_last_sync_at.
- rmm_last_sync_at.
- security_last_sync_at.
- mapping_warning_count.

### 11.2 account_service_summary_view

Aggregates service health by account.

Suggested fields:
- account_id.
- open_ticket_count.
- aging_ticket_count.
- high_priority_ticket_count.
- escalated_ticket_count.
- sla_risk_count.
- top_categories_json.

### 11.3 account_rmm_summary_view

Aggregates device/RMM health by account.

Suggested fields:
- account_id.
- device_count.
- server_count.
- workstation_count.
- offline_device_count.
- patch_gap_count.
- end_of_life_device_count.
- warranty_expiring_count.

### 11.4 account_security_summary_view

Aggregates security posture by account.

Suggested fields:
- account_id.
- open_finding_count.
- critical_finding_count.
- high_finding_count.
- missing_security_coverage_count.
- top_findings_json.

### 11.5 portfolio_accounts_at_risk_view

Supports portfolio prioritization.

Suggested fields:
- account_id.
- display_name.
- owner_user_id.
- latest_health_category.
- latest_health_summary.
- top_recommendation_id.
- top_recommendation_title.
- renewal_date.

## 12. Foreign Key Notes and Migration Ordering

Because `opportunities`, `activities`, `recommendations`, and `generated_artifacts` reference each other, use this migration order:

1. users.
2. integration_connections.
3. sync_runs.
4. accounts.
5. account_external_identities.
6. account_aliases.
7. account_owners.
8. contacts.
9. agreements.
10. renewals without opportunity FK enforcement.
11. tickets.
12. ticket_trends.
13. devices.
14. device_health_signals.
15. security_findings.
16. security_coverage.
17. opportunities without recommendation FK enforcement.
18. activities without recommendation/artifact FK enforcement.
19. evidence_items.
20. account_health_scores.
21. account_health_score_evidence.
22. recommendations.
23. recommendation_evidence.
24. generated_artifacts.
25. generated_artifact_evidence.
26. generated_artifact_recommendations.
27. write_back_audit_events.
28. product_events.
29. Add deferred foreign keys between renewals/opportunities/activities/recommendations/generated_artifacts if desired.

For MVP, it is acceptable to keep some cross-derived references nullable without strict FK constraints to reduce migration complexity.

## 13. Search Requirements

MVP account search should query:

- accounts.display_name.
- accounts.legal_name.
- accounts.short_name.
- accounts.primary_domain.
- account_aliases.alias_value.
- contacts.full_name.
- contacts.email.
- account_external_identities.external_display_name.
- account_external_identities.external_id.

Recommended PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Recommended indexes:

```sql
CREATE INDEX accounts_display_name_trgm_idx ON accounts USING gin (display_name gin_trgm_ops);
CREATE INDEX account_aliases_alias_value_trgm_idx ON account_aliases USING gin (alias_value gin_trgm_ops);
CREATE INDEX contacts_full_name_trgm_idx ON contacts USING gin (full_name gin_trgm_ops);
```

## 14. Data Freshness Model

Data freshness should be derived from:

- integration_connections.last_successful_sync_at.
- latest sync_runs per integration.
- account_external_identities per account.
- source-specific latest timestamps on tickets, devices, security findings, and activities.

Account Command Center should show:

- PSA last sync.
- RMM last sync.
- Security/M365 last sync.
- mapping warnings.
- stale/disconnected status.

## 15. MVP Query Patterns to Optimize

### Account Command Center Load
Primary query path:

1. Get account.
2. Get current owners.
3. Get external identities.
4. Get current agreement/renewal.
5. Get latest health score.
6. Get active recommendations.
7. Get recent evidence.
8. Get service/RMM/security summaries.
9. Get generated artifacts and activities.

Required indexes:
- All `account_id` indexes.
- latest timestamp indexes for health, activities, generated artifacts, findings, tickets, and syncs.

### Portfolio Views
Primary query path:

- account + latest health score + recommendations + owner + renewal.

Required indexes:
- `account_health_scores(account_id, calculated_at DESC)`.
- `recommendations(status, priority, suggested_due_date)`.
- `renewals(renewal_date, status)`.
- `account_owners(user_id, role)`.

### Evidence Drawer
Primary query path:

- recommendation -> recommendation_evidence -> evidence_items.
- health score -> account_health_score_evidence -> evidence_items.
- artifact -> generated_artifact_evidence -> evidence_items.

Required indexes:
- primary keys on join tables.
- `evidence_items(account_id)`.

## 16. MVP Seed Data

For demo and pilot testing, seed accounts for:

1. Healthy account.
2. Watch account.
3. At Risk account.
4. Renewal Risk account.
5. Expansion Candidate account.
6. Account with mapping issue.
7. Account with stale security data.
8. Account with PSA write-back failure simulation.

Each seeded account should include:
- account owner.
- contacts.
- agreement/renewal.
- tickets.
- devices.
- security findings or coverage records.
- health score.
- recommendations.
- evidence items.

## 17. Security and Governance Considerations

- `credential_reference` should point to a secure secrets store; never store raw secrets in this schema.
- Write-back payloads may contain sensitive data; restrict access to `write_back_audit_events`.
- Generated artifacts may contain customer-sensitive content; enforce account-level access control.
- Product event logging should avoid unnecessary sensitive payloads.
- If multi-tenant SaaS is planned, add `tenant_id` to every table before launch.
- If internal-only MVP is planned, still design for future tenant isolation.

## 18. Optional SaaS Multi-Tenant Extension

If the product is intended as SaaS from day one, add:

```sql
CREATE TABLE tenants (
    tenant_id uuid PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

Then add `tenant_id uuid NOT NULL REFERENCES tenants(tenant_id)` to all business tables and include tenant-scoped unique indexes.

## 19. MVP Schema Acceptance Criteria

The schema is MVP-ready when:

1. It can store accounts and source-system identities.
2. It can store PSA contacts, agreements, renewals, tickets, activities, and opportunities.
3. It can store RMM devices and health signals.
4. It can store security findings and coverage gaps.
5. It can store sync status and integration freshness.
6. It can store evidence-backed health scores.
7. It can store evidence-backed recommendations.
8. It can store generated account briefs, QBR drafts, and email drafts.
9. It can audit PSA write-back attempts.
10. It can support account search and Account Command Center load performance.
11. It can support portfolio views for at-risk, renewal, and expansion accounts.

## 20. Recommended First Migration Slice

For the first engineering sprint, implement:

1. users.
2. integration_connections.
3. sync_runs.
4. accounts.
5. account_external_identities.
6. account_aliases.
7. account_owners.
8. contacts.
9. agreements.
10. renewals.

This supports:
- product shell,
- account search,
- account header,
- PSA account/company sync spike,
- account owner display,
- agreement and renewal display.

The second migration slice should add:

1. tickets.
2. devices.
3. device_health_signals.
4. security_findings.
5. security_coverage.
6. evidence_items.
7. account_health_scores.
8. recommendations.

The third migration slice should add:

1. generated_artifacts.
2. write_back_audit_events.
3. product_events.
4. join tables for evidence relationships.
