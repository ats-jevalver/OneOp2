# Buffaly Account Intelligence MVP - Sprint 6 Task List

## Sprint Goal

Turn the PostgreSQL-backed OneOp2 MVP into a more production-shaped application by moving beyond startup hydration and mock contracts toward query-backed repositories, secure demo administration, real integration adapter readiness, and a clearer operator experience.

Sprint 5/Sprint 6 foundation work already proved that OneOp2 can:

- Create and seed a local PostgreSQL database.
- Persist runtime workflow state in PostgreSQL.
- Load normalized seed/reference data into PostgreSQL tables.
- Hydrate API reads from PostgreSQL when `ONEOP2_STORE_PROVIDER=postgres`.
- Keep JSON mode available for portable demos.

Sprint 6 should harden that foundation and reduce the remaining gap between demo and production architecture.

## Sprint Theme

**PostgreSQL-backed operator readiness.**

## Assumptions

- Local PostgreSQL is available for development and test validation.
- JSON provider remains supported as a fallback/demo mode.
- The MVP is still a dependency-light Node.js app, but the `pg` dependency is now accepted.
- Real PSA/RMM/security credentials are not assumed for this sprint.
- No customer email should be sent automatically; human review remains required.

## In Scope

1. Replace startup hydration with query-oriented PostgreSQL repositories for high-value read paths.
2. Add admin/demo user switching so RBAC can be tested without editing the store manually.
3. Add database health and seed validation endpoints.
4. Harden PostgreSQL runtime persistence and error handling.
5. Prepare real PSA/RMM/security adapter configuration models.
6. Update the UI to expose PostgreSQL/provider status and Sprint 6 workflows.
7. Add stronger integration tests for JSON and PostgreSQL modes.
8. Document local database setup, reset, seed, and troubleshooting.

## Out of Scope

- Production multi-tenant isolation.
- Hosted deployment automation.
- Real vendor credential onboarding UX.
- Sending real customer email.
- Full replacement of every static read with SQL if not needed for MVP validation.

## Sprint 6 Backlog

### S6-01 - Build PostgreSQL query repositories for core read paths

**User story:** As a developer, I want PostgreSQL-backed API reads to query the database directly so the app does not rely on startup hydration for operational data.

**Tasks:**

- Create repository modules for accounts, integrations, evidence, recommendations, and health scores.
- Convert account search to SQL-backed search in PostgreSQL mode.
- Convert command-center supporting reads to repository calls where practical.
- Keep JSON provider behavior unchanged.
- Add repository-level tests or API smoke tests for SQL-backed paths.

**Acceptance criteria:**

- `GET /api/v1/accounts/search` queries PostgreSQL directly in Postgres mode.
- `GET /api/v1/accounts/:accountId/command-center` uses PostgreSQL-backed repository data in Postgres mode.
- JSON mode still passes existing smoke tests.
- PostgreSQL mode passes `npm run test:postgres`.

**Priority:** High

---

### S6-02 - Add admin/demo current-user switching

**User story:** As a tester, I want to switch the current demo user so I can validate admin and non-admin RBAC flows without editing persistence manually.

**Tasks:**

- Add endpoint to inspect current user.
- Add admin-only or local-demo-only endpoint to set current user.
- Persist current user in JSON/PostgreSQL runtime state.
- Add tests for account manager, admin, and forbidden flows.
- Document safe demo-only behavior.

**Acceptance criteria:**

- Default user remains `usr_am_jane`.
- Tester can switch to `usr_admin_alex` locally.
- Admin-only endpoints succeed for admin and return `403` for non-admin.

**Priority:** High

---

### S6-03 - Add database health and seed validation endpoints

**User story:** As an operator, I want to see whether the database is connected and seeded correctly so I can troubleshoot local and production environments quickly.

**Tasks:**

- Add `GET /api/v1/admin/database/status`.
- Return provider, database configured flag, connection status, runtime state key, and table counts.
- Add seed validation checks for required tables and minimum row counts.
- Hide connection secrets from all responses.

**Acceptance criteria:**

- Endpoint returns healthy state for local Postgres.
- Endpoint returns clear diagnostics if Postgres is selected but unavailable.
- No password or connection secret is returned.

**Priority:** High

---

### S6-04 - Harden PostgreSQL persistence behavior

**User story:** As a developer, I want runtime persistence to be reliable so generated artifacts and audit events are not lost during app shutdown or errors.

**Tasks:**

- Ensure all store mutations are flushed before API responses where correctness matters.
- Add graceful shutdown handling for PostgreSQL pool close.
- Add retry or explicit error handling for failed persistence writes.
- Add test coverage for generated artifact persistence in Postgres mode.

**Acceptance criteria:**

- Generated artifacts persist in PostgreSQL runtime state.
- Write-back audit events persist in PostgreSQL runtime state.
- Failed persistence produces explicit diagnostics.

**Priority:** High

---

### S6-05 - Add PSA integration configuration model

**User story:** As an administrator, I want PSA connection configuration represented safely so OneOp2 can move from mock write-back to real adapter integration.

**Tasks:**

- Define `integration_credentials` or secure configuration model without storing secrets in source.
- Add non-secret adapter configuration fields to PostgreSQL schema.
- Add adapter selection by integration connection.
- Add docs for required PSA credentials and scopes.
- Keep mock adapter as default.

**Acceptance criteria:**

- Mock PSA still works.
- Real PSA adapter can be configured later without changing API payload contracts.
- Secrets are not committed or returned by APIs.

**Priority:** Medium

---

### S6-06 - Add RMM/security adapter configuration model

**User story:** As a service or security leader, I want RMM/security adapter configuration represented so live posture reads can be added safely.

**Tasks:**

- Extend integration configuration docs for RMM and security tools.
- Add normalized capability metadata in PostgreSQL.
- Add placeholder adapter loader for RMM/security.
- Document minimum required scopes and source records.

**Acceptance criteria:**

- Integration status reflects configured capabilities from PostgreSQL where available.
- No live credentials are required for this sprint.

**Priority:** Medium

---

### S6-07 - Update UI for provider/database status

**User story:** As a tester, I want the UI to show whether I am using JSON or PostgreSQL so I can trust what I am testing.

**Tasks:**

- Add visible provider/database status to the static UI.
- Add health indicators for integration status.
- Add quick links for account search, QBR draft generation, and email handoff.
- Add clear admin-disabled messaging when current user lacks permission.

**Acceptance criteria:**

- UI shows `json` or `postgres` provider.
- UI can demonstrate PostgreSQL-backed Acme command center.
- Admin limitations are visible instead of confusing.

**Priority:** Medium

---

### S6-08 - Add account plan model and first API slice

**User story:** As an account manager, I want account plan objectives and stakeholders so recommendations can become an ongoing account strategy.

**Tasks:**

- Add account plan tables to schema.
- Seed an Acme account plan.
- Add `GET /api/v1/accounts/:accountId/account-plan`.
- Add `PATCH /api/v1/accounts/:accountId/account-plan` for local/demo updates.
- Link account plan items to recommendations where useful.

**Acceptance criteria:**

- Acme has a seeded account plan.
- API returns objectives, stakeholders, risks, and next steps.
- Updates persist in the active provider.

**Priority:** Medium

---

### S6-09 - Improve QBR/email artifact workflow

**User story:** As an account manager, I want generated artifacts to behave like reviewable work products so I can prepare customer-facing output safely.

**Tasks:**

- Add artifact review states: draft, reviewed, approved, archived.
- Add endpoint to update artifact status.
- Add evidence appendix to QBR export.
- Add email handoff response compatible with future Buffaly prepare-email UI.
- Add tests for artifact lifecycle.

**Acceptance criteria:**

- Artifact status can be updated and persisted.
- QBR export includes evidence references.
- Email handoff remains review-only.

**Priority:** Medium

---

### S6-10 - Documentation and operational checklist

**User story:** As a developer/operator, I want clear local database and provider instructions so I can reset, seed, run, and troubleshoot OneOp2 quickly.

**Tasks:**

- Update README with local Postgres setup/reset/seed commands.
- Document `ONEOP2_STORE_PROVIDER`, `ONEOP2_DATABASE_URL`, and JSON fallback behavior.
- Add troubleshooting section for authentication failures and stale seed data.
- Add manual demo script for PostgreSQL provider mode.

**Acceptance criteria:**

- A new developer can create, seed, and run the local database from docs.
- The test commands are clear.
- Secrets are never shown in docs.

**Priority:** High

## Suggested Sprint 6 Demo Script

1. Start OneOp2 in PostgreSQL mode.
2. Show provider status as `postgres`.
3. Search by PSA external ID `PSA-1001`.
4. Open Acme command center and show service/RMM/security counts from database-backed reads.
5. Switch current demo user to admin and show admin endpoint access.
6. Generate a QBR draft and verify it persists in PostgreSQL runtime state.
7. Run `npm test` and `npm run test:postgres`.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Query repository refactor breaks JSON mode | Keep provider-specific repository branches and run both test modes |
| Database credentials leak into docs/logs | Use environment variables and never echo passwords |
| Direct SQL grows quickly | Prioritize high-value read paths first |
| Runtime state JSONB becomes a bottleneck | Move generated artifacts/audits to normalized write tables in a later sprint |
| Admin switching could be unsafe | Mark endpoint local-demo-only unless production auth exists |

## Definition of Done

- Sprint 6 tasks are implemented in small committed batches.
- JSON and PostgreSQL tests both pass.
- PostgreSQL local database can be reset and reseeded.
- Provider/database status is visible to testers.
- No credentials are committed or displayed.
