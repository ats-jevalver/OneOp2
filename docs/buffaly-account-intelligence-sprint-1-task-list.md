
# Sprint 1 Task List: Buffaly Account Intelligence Platform MVP

## 1. Sprint Goal

Build the first visible product slice:

A user can open the application, search/select a seeded or PSA-synced account, and see a basic Account Command Center header/snapshot with account owner, agreement, renewal, integration status, and placeholder health context.

This sprint should prove the foundation for:

- product shell,
- canonical account model,
- integration connection model,
- first database migration,
- account search API,
- Account Command Center API,
- basic UI rendering,
- demo data seed,
- product event tracking.

## 2. Recommended Sprint Length

2 weeks.

## 3. Sprint Outcome

By the end of Sprint 1, the team should be able to demo:

1. Open the MVP application shell.
2. View the main navigation.
3. Search for an account.
4. Select an account.
5. Load the Account Command Center.
6. See account header and snapshot cards.
7. See account owner, primary domain, agreement, renewal date, and data freshness.
8. Track basic product events.
9. Show seeded/demo data or first PSA account sync results.

## 4. Sprint Scope

### In Scope
- Product shell and basic navigation.
- Initial database migration slice.
- Seed data for demo accounts.
- Integration connection table/model.
- Stub or spike PSA connection/sync endpoint.
- Account search endpoint.
- Account command center endpoint with seeded data.
- Revenue endpoint with agreement/renewal data.
- Basic Account Command Center UI.
- Product event endpoint.
- Basic unit/integration test coverage for core endpoints.

### Out of Scope
- Full PSA write-back.
- Full RMM integration.
- Full security/M365 integration.
- Recommendation generation.
- QBR generation.
- Customer email drafting.
- Evidence drawer.
- Assistant panel.
- Portfolio views.
- Advanced account matching.
- Production-grade health scoring.

## 5. Sprint Assumptions

- MVP starts with PostgreSQL or compatible relational database.
- Authentication can be stubbed or integrated with existing auth depending on current platform readiness.
- Demo data is acceptable if PSA API credentials are not ready.
- Account Command Center endpoint can return partial/stubbed sections for health, recommendations, and warnings.
- The UI should be built against the intended API contract even if some data is seeded.

## 6. Sprint 1 Backlog Summary

### Foundation
- S1-001 Product shell and navigation.
- S1-002 Initial database migration.
- S1-003 Seed demo data.
- S1-004 Basic user/role model.
- S1-005 Integration connection model and admin list endpoint.

### API
- S1-006 Account search endpoint.
- S1-007 Account command center endpoint.
- S1-008 Account revenue endpoint.
- S1-009 Product event tracking endpoint.
- S1-010 Integration sync stub/spike endpoint.

### UI
- S1-011 Account search UI.
- S1-012 Account Command Center header.
- S1-013 Account snapshot card.
- S1-014 Renewal context card.
- S1-015 Data freshness indicator.

### Quality and Delivery
- S1-016 API contract tests.
- S1-017 UI smoke tests.
- S1-018 Demo script and acceptance walkthrough.
- S1-019 Developer setup documentation.
- S1-020 Sprint review feedback capture.

## 7. Detailed Sprint Tickets

## S1-001: Product Shell and Navigation

### Type
Frontend / Product Foundation

### User Story
As a user, I want to open the Account Intelligence application and navigate to the account search and account command center areas so that I can begin account review work.

### Tasks
- Create application shell layout.
- Add top navigation.
- Add product name/logo placeholder.
- Add route for Account Search.
- Add route for Account Command Center.
- Add placeholder route for Admin/Integrations.
- Add responsive layout foundation.

### Acceptance Criteria
- User can load the app shell.
- User can navigate to account search.
- User can navigate to an account command center route by account ID.
- User can navigate to admin/integrations placeholder.
- Layout is usable on desktop and tablet widths.

### Dependencies
None.

### Estimate
3-5 points.

## S1-002: Initial Database Migration

### Type
Backend / Database

### User Story
As an engineer, I need the initial schema migration so that accounts, users, integrations, agreements, renewals, and contacts can be stored and queried.

### Tables
Implement first migration slice:

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

### Tasks
- Create migration.
- Add primary keys and foreign keys.
- Add indexes from schema artifact.
- Add created_at/updated_at defaults.
- Add migration rollback where applicable.
- Validate migration in local environment.

### Acceptance Criteria
- Migration applies successfully to clean database.
- Migration rollback works or is documented.
- Required indexes exist.
- Schema supports seeded account, owner, agreement, renewal, and contact data.

### Dependencies
Database selected and available.

### Estimate
5-8 points.

## S1-003: Seed Demo Data

### Type
Backend / Data

### User Story
As a product team member, I want demo accounts available so that the first Account Command Center flow can be tested without waiting on external integrations.

### Seed Accounts
Create at least five seeded accounts:

1. Healthy account.
2. Watch account.
3. At Risk account.
4. Renewal Risk account.
5. Expansion Candidate account.

For Sprint 1, each seeded account should include:
- account record,
- account alias,
- account owner,
- primary contact,
- agreement,
- renewal,
- integration identity for PSA,
- basic data freshness metadata.

### Acceptance Criteria
- Seed command creates demo accounts idempotently.
- Account search finds seeded accounts.
- Account Command Center endpoint can load seeded account data.
- Renewal dates and owners display correctly.

### Dependencies
S1-002 Initial Database Migration.

### Estimate
3-5 points.

## S1-004: Basic User and Role Model

### Type
Backend / Identity

### User Story
As the system, I need basic user and role data so that account ownership and permissions can be represented in the MVP.

### Tasks
- Implement user entity/model.
- Define role constants.
- Seed test users for account manager, sales rep, service manager, security lead, executive, and admin.
- Associate seeded accounts with account owners.
- Stub current user context if full auth is not ready.

### Acceptance Criteria
- Seeded users exist.
- Seeded accounts have account owners.
- API responses can include account owner display name.
- Current user context is available or safely stubbed.

### Dependencies
S1-002 Initial Database Migration.

### Estimate
2-3 points.

## S1-005: Integration Connection Model and Admin List Endpoint

### Type
Backend / Integration Foundation

### User Story
As an admin, I want to see configured integrations so that I can understand which external systems are connected or stubbed.

### API
```http
GET /api/v1/admin/integrations
```

### Tasks
- Implement IntegrationConnection model/repository.
- Seed PSA, RMM, and Security/M365 integration records in stub status.
- Implement admin integrations list endpoint.
- Return system type, system name, status, and last successful sync.
- Add basic authorization placeholder for admin role.

### Acceptance Criteria
- Endpoint returns seeded integrations.
- Integration records include status and last sync fields.
- UI/admin placeholder can consume the endpoint.

### Dependencies
S1-002 Initial Database Migration.
S1-004 Basic User and Role Model.

### Estimate
3 points.

## S1-006: Account Search Endpoint

### Type
Backend / API

### User Story
As a user, I want to search for accounts by name, domain, alias, contact, or source ID so that I can quickly open the right account.

### API
```http
GET /api/v1/accounts/search?query=acme&page=1&pageSize=10
```

### Tasks
- Implement account search service.
- Search accounts.display_name.
- Search accounts.primary_domain.
- Search account_aliases.alias_value.
- Search contacts.full_name and contacts.email.
- Search account_external_identities.external_id and external_display_name.
- Return account owner, health placeholder, renewal date, and warnings.
- Add pagination.

### Acceptance Criteria
- Searching seeded account name returns expected account.
- Searching domain returns expected account.
- Searching contact email returns expected account.
- Empty search returns validation error or recent/default accounts per product decision.
- Response matches API spec shape.

### Dependencies
S1-002 Initial Database Migration.
S1-003 Seed Demo Data.

### Estimate
5 points.

## S1-007: Account Command Center Endpoint

### Type
Backend / API

### User Story
As a user, I want to load the Account Command Center for a selected account so that I can see account summary, owner, agreement, renewal, freshness, and placeholder intelligence.

### API
```http
GET /api/v1/accounts/{accountId}/command-center?dateRangePreset=last_90_days
```

### Tasks
- Implement account command center query service.
- Load account core fields.
- Load account owner.
- Load primary contact.
- Load current agreement.
- Load next renewal.
- Load integration/data freshness placeholders.
- Return placeholder health object.
- Return empty or placeholder risks/opportunities/recommendations arrays.
- Return mapping/data warnings where applicable.

### Acceptance Criteria
- Endpoint returns complete command center payload for seeded account.
- Missing account returns not_found.
- Account with missing integration mapping returns warning.
- Response can directly render Sprint 1 Account Command Center UI.

### Dependencies
S1-002 Initial Database Migration.
S1-003 Seed Demo Data.
S1-006 Account Search Endpoint.

### Estimate
5-8 points.

## S1-008: Account Revenue Endpoint

### Type
Backend / API

### User Story
As a user, I want to see basic agreement and renewal context for an account so that I can prepare for renewal conversations.

### API
```http
GET /api/v1/accounts/{accountId}/revenue
```

### Tasks
- Implement revenue query service.
- Return agreements.
- Return renewals.
- Calculate next renewal date.
- Return MRR/ARR where seeded.
- Return open opportunities as empty array for Sprint 1.

### Acceptance Criteria
- Endpoint returns agreement and renewal data for seeded accounts.
- Next renewal date is calculated correctly.
- Response shape matches API spec.

### Dependencies
S1-002 Initial Database Migration.
S1-003 Seed Demo Data.

### Estimate
3 points.

## S1-009: Product Event Tracking Endpoint

### Type
Backend / Analytics

### User Story
As a product team, I want to track basic usage events so that we can measure MVP engagement and validate the first product flow.

### API
```http
POST /api/v1/product-events
```

### Tasks
- Add product_events table if not included in first migration or create lightweight event store.
- Implement endpoint to accept event type, account ID, and properties.
- Capture current user ID if available.
- Validate event type is non-empty.
- Avoid logging sensitive payloads.

### Events for Sprint 1
- app_opened.
- account_searched.
- account_opened.
- command_center_loaded.

### Acceptance Criteria
- Frontend can post product events.
- Events are persisted with timestamp.
- Invalid payload returns validation error.

### Dependencies
S1-004 Basic User and Role Model.

### Estimate
3 points.

## S1-010: Integration Sync Stub / PSA Read Spike Endpoint

### Type
Backend / Integration Spike

### User Story
As an engineer, I want a stub or spike endpoint for integration sync so that we can validate the integration workflow shape before full PSA implementation.

### API
```http
POST /api/v1/admin/integrations/{integrationConnectionId}/sync
```

### Tasks
- Implement sync endpoint.
- Create sync_run record with started/succeeded or stubbed status.
- If PSA credentials are available, spike reading companies/accounts.
- If credentials are not available, return stubbed sync response.
- Update integration last_successful_sync_at for successful stub/spike.

### Acceptance Criteria
- Endpoint creates a sync run.
- Endpoint returns job/sync status.
- Integration status/freshness changes after successful stub/spike.
- Any real PSA API errors are logged clearly.

### Dependencies
S1-005 Integration Connection Model.

### Estimate
3-8 points depending on real PSA availability.

## S1-011: Account Search UI

### Type
Frontend / UX

### User Story
As a user, I want to search for accounts from the app header or search page so that I can open the Account Command Center.

### Tasks
- Build search input.
- Call account search API.
- Render search results.
- Show account name, domain, owner, health placeholder, and renewal date.
- Handle loading, empty, and error states.
- Navigate to account command center on selection.
- Track account_searched event.

### Acceptance Criteria
- User can search for seeded account.
- Results render clearly.
- Selecting result navigates to account page.
- Empty and error states are handled.

### Dependencies
S1-001 Product Shell.
S1-006 Account Search Endpoint.
S1-009 Product Event Tracking Endpoint.

### Estimate
5 points.

## S1-012: Account Command Center Header UI

### Type
Frontend / UX

### User Story
As a user, I want the account header to show account identity, owner, health, renewal, and primary actions so that I understand the account at a glance.

### Tasks
- Build account header component.
- Show account name and primary domain.
- Show account owner.
- Show agreement type/name.
- Show renewal countdown.
- Show health placeholder badge.
- Add disabled or placeholder buttons: Generate Brief, QBR Draft, Create Task.
- Show warnings from API.
- Track account_opened or command_center_loaded event.

### Acceptance Criteria
- Header renders for seeded account.
- Renewal countdown displays correctly.
- Warnings display when returned by API.
- Placeholder actions are visibly disabled or marked coming soon.

### Dependencies
S1-007 Account Command Center Endpoint.

### Estimate
5 points.

## S1-013: Account Snapshot Card UI

### Type
Frontend / UX

### User Story
As a user, I want a compact account snapshot so that I can quickly see the most important relationship and account facts.

### Tasks
- Build AccountSnapshotCard component.
- Show account owner.
- Show primary contact.
- Show agreement.
- Show MRR/ARR if available.
- Show open opportunities placeholder.
- Show last QBR placeholder.

### Acceptance Criteria
- Snapshot renders from command center payload.
- Missing optional values show a clear empty state.
- Component works in desktop and tablet layout.

### Dependencies
S1-007 Account Command Center Endpoint.

### Estimate
3 points.

## S1-014: Renewal Context Card UI

### Type
Frontend / UX

### User Story
As a user, I want to see renewal context so that renewal timing is always visible during account review.

### Tasks
- Build RenewalContextCard component.
- Show renewal date.
- Show days until renewal.
- Show agreement status.
- Show renewal status.
- Show renewal risk placeholder if applicable.

### Acceptance Criteria
- Renewal card renders for seeded accounts.
- Accounts without renewal show empty state.
- Renewal within 90 days is visually highlighted.

### Dependencies
S1-007 Account Command Center Endpoint.
S1-008 Account Revenue Endpoint.

### Estimate
3 points.

## S1-015: Data Freshness Indicator UI

### Type
Frontend / UX

### User Story
As a user, I want to see whether account data is current so that I know how much to trust the displayed account summary.

### Tasks
- Build DataFreshnessIndicator component.
- Show PSA/RMM/security sync status from command center payload.
- Show stale/disconnected warning states.
- Add tooltip or detail expansion.
- Show mapping warning if present.

### Acceptance Criteria
- Data freshness indicator renders current/stale/disconnected states.
- Stale data warning is visually distinct.
- Mapping warning is visible when returned by API.

### Dependencies
S1-005 Integration Connection Model.
S1-007 Account Command Center Endpoint.

### Estimate
3 points.

## S1-016: API Contract Tests

### Type
Quality / Backend

### User Story
As an engineer, I want contract tests for the Sprint 1 APIs so that the frontend can safely build against stable response shapes.

### APIs to Test
- GET /api/v1/accounts/search.
- GET /api/v1/accounts/{accountId}/command-center.
- GET /api/v1/accounts/{accountId}/revenue.
- GET /api/v1/admin/integrations.
- POST /api/v1/admin/integrations/{integrationConnectionId}/sync.
- POST /api/v1/product-events.

### Acceptance Criteria
- Happy-path tests pass for seeded data.
- Not-found cases are tested.
- Validation error cases are tested.
- Response shape matches API spec artifact.

### Dependencies
S1-006 through S1-010.

### Estimate
5 points.

## S1-017: UI Smoke Tests

### Type
Quality / Frontend

### User Story
As an engineer, I want smoke tests for the first UI flow so that regressions are caught quickly.

### Flow to Test
1. Open app.
2. Search seeded account.
3. Select account.
4. Verify Account Command Center header renders.
5. Verify snapshot, renewal, and freshness cards render.

### Acceptance Criteria
- Smoke test passes locally.
- Test covers loading and empty search states where practical.
- Basic accessibility checks are included if tooling exists.

### Dependencies
S1-011 through S1-015.

### Estimate
3-5 points.

## S1-018: Demo Script and Acceptance Walkthrough

### Type
Product / QA

### User Story
As a product team, I want a clear demo script so that Sprint 1 can be reviewed consistently and feedback can be captured.

### Tasks
- Write demo script.
- Identify seeded account to use.
- Include happy-path account search.
- Include account command center walkthrough.
- Include stale/mapping warning example if seeded.
- Include known limitations section.

### Acceptance Criteria
- Demo script can be followed by any team member.
- Script validates sprint outcome.
- Known gaps and next sprint hooks are documented.

### Dependencies
Seed data and UI flow.

### Estimate
2 points.

## S1-019: Developer Setup Documentation

### Type
Engineering Enablement

### User Story
As a developer, I want setup instructions so that I can run the MVP locally and contribute to the next sprint.

### Tasks
- Document prerequisites.
- Document database setup.
- Document migration command.
- Document seed command.
- Document frontend startup.
- Document backend startup.
- Document API base URL configuration.
- Document how to run tests.

### Acceptance Criteria
- A new developer can run the app locally using the documentation.
- Migration and seed commands are documented.
- Known environment variables are listed.

### Dependencies
Initial app/backend/database decisions.

### Estimate
2-3 points.

## S1-020: Sprint Review Feedback Capture

### Type
Product / Process

### User Story
As the product team, I want to capture stakeholder feedback from the Sprint 1 demo so that Sprint 2 priorities can be adjusted.

### Tasks
- Create feedback capture template.
- Capture feedback by category: UX, data, integrations, account summary, trust, next actions.
- Identify must-fix issues.
- Identify Sprint 2 candidates.
- Update backlog after review.

### Acceptance Criteria
- Feedback is captured in a structured format.
- Sprint 2 candidate list is produced.
- Must-fix items are clearly identified.

### Dependencies
S1-018 Demo Script.

### Estimate
1-2 points.

## 8. Suggested Sprint 1 Task Order

1. S1-001 Product Shell and Navigation.
2. S1-002 Initial Database Migration.
3. S1-003 Seed Demo Data.
4. S1-004 Basic User and Role Model.
5. S1-005 Integration Connection Model and Admin List Endpoint.
6. S1-006 Account Search Endpoint.
7. S1-007 Account Command Center Endpoint.
8. S1-008 Account Revenue Endpoint.
9. S1-009 Product Event Tracking Endpoint.
10. S1-010 Integration Sync Stub / PSA Read Spike Endpoint.
11. S1-011 Account Search UI.
12. S1-012 Account Command Center Header UI.
13. S1-013 Account Snapshot Card UI.
14. S1-014 Renewal Context Card UI.
15. S1-015 Data Freshness Indicator UI.
16. S1-016 API Contract Tests.
17. S1-017 UI Smoke Tests.
18. S1-018 Demo Script and Acceptance Walkthrough.
19. S1-019 Developer Setup Documentation.
20. S1-020 Sprint Review Feedback Capture.

## 9. Sprint 1 Demo Checklist

The sprint demo should show:

- Application loads.
- Navigation is visible.
- Account search works.
- Seeded account appears in search results.
- User opens Account Command Center.
- Header shows account name, domain, owner, agreement, renewal date, and health placeholder.
- Account snapshot card shows core account info.
- Renewal context card highlights upcoming renewal.
- Data freshness indicator shows PSA/RMM/security status.
- Admin integrations endpoint or placeholder view shows configured integrations.
- Product events are recorded for search/open/load flow.

## 10. Sprint 1 Definition of Done

Sprint 1 is done when:

1. Initial database migration applies cleanly.
2. Seed data can be loaded idempotently.
3. Account search API works against seeded data.
4. Account Command Center API returns renderable payload.
5. Account revenue API returns agreement and renewal data.
6. Product event API records basic events.
7. Integration admin list and sync stub/spike exist.
8. UI can search and open an account.
9. UI renders account header, snapshot, renewal, and data freshness.
10. Contract tests cover Sprint 1 APIs.
11. UI smoke test covers first user flow.
12. Demo script is ready.
13. Developer setup notes are available.

## 11. Risks and Mitigations

### Risk: PSA credentials are not ready
Mitigation: Use seeded data and build integration sync stub; keep PSA read spike optional.

### Risk: Database schema is too broad for Sprint 1
Mitigation: Implement only first migration slice and product_events if needed.

### Risk: UI blocks on full Account Command Center data
Mitigation: Return placeholder health, risks, recommendations, and freshness fields in API contract.

### Risk: Authentication is not ready
Mitigation: Stub current user context but keep role model and permission boundaries visible.

### Risk: Search behavior becomes too complex
Mitigation: Start with simple SQL search over account name/domain/alias/contact; add trigram/fuzzy later.

## 12. Sprint 2 Candidate Backlog

Likely Sprint 2 candidates:

- Service detail tab with PSA tickets.
- RMM device summary with seeded or real data.
- Security summary with seeded or real data.
- Evidence item table and basic evidence drawer.
- First account health score calculation.
- Basic next best action recommendation cards.
- Account mapping admin queue.
- Full PSA company/contact/ticket sync.

## 13. Product Owner Acceptance Questions

Before closing Sprint 1, answer:

1. Can an account manager find the right account quickly?
2. Does the Account Command Center immediately communicate who owns the account and when renewal occurs?
3. Is the first screen direction credible as the core product experience?
4. Are data freshness and integration readiness visible enough?
5. Does the API shape support Sprint 2 without rework?
6. Is the demo compelling enough to show progress to stakeholders?
