# OneOp2

OneOp2 is a Buffaly-powered Account Intelligence MVP for sales and account management teams.

Sprint 1 delivered the first visible product slice: search/select an account and render a basic Account Command Center.

Sprint 2 added the first account intelligence loop: seeded service, RMM, and security signals; explainable health scores; evidence-backed recommendations; and an evidence modal.

Sprint 3 made the intelligence actionable with stubbed PSA task creation, write-back audit history, generated account briefs, activity timeline, mapping admin actions, and portfolio views.

Sprint 4 added durable local JSON persistence, a repository-style store boundary, a mock PSA adapter, persisted runtime workflow state, PSA note stubs, QBR/email artifacts, portfolio filters, and deterministic assistant prompts.

Sprint 5 starts the integration-ready foundation: persistence provider diagnostics, PostgreSQL starter schema, hardened PSA adapter contracts, safer write-back audits, sync preview counts, integration capability status, artifact export, and email handoff guardrails. Sprint 6 begins by activating a PostgreSQL-backed runtime-state provider behind the existing store interface.

## Current Features

- Dependency-light Node.js HTTP API.
- Static Account Command Center UI.
- Seeded demo users, accounts, integrations, contacts, agreements, renewals, tickets, devices, security findings, evidence, health scores, and recommendations.
- Account search by name, domain, alias, contact email/name, and external source ID.
- Account Command Center endpoint.
- Revenue endpoint.
- Service summary/detail endpoint.
- RMM summary/detail endpoint.
- Security summary/detail endpoint.
- Latest account health score endpoint.
- Recommendation list endpoint.
- Recommendation and health-score evidence endpoints.
- Account mapping suggestions endpoint stub.
- PSA task preview and stub creation endpoints.
- Write-back audit events endpoint.
- Recommendation status update endpoint.
- Account brief generation endpoint.
- Generated artifact list/retrieve/evidence endpoints.
- Portfolio At Risk, Renewal Risk, and Expansion Candidate endpoints.
- Durable local JSON persistence for generated artifacts, audits, activities, recommendation statuses, and mapping decisions.
- Persistence provider status endpoint with JSON default and PostgreSQL seam diagnostics.
- PostgreSQL starter schema under `db/schema.sql`.
- Typed mock PSA adapter for task and note stubs with deterministic IDs, required-field validation, and richer audit details.
- QBR draft and customer email draft artifact endpoints.
- Generated artifact markdown export and customer email review handoff endpoints.
- Integration capability status and sync preview count responses.
- Assistant prompt endpoint for call prep, risk rationale, and next actions.
- Integration list and sync stub endpoint.
- Product event tracking endpoint.
- API smoke tests.
- Planning docs committed under `docs/`.

## Run locally

```bash
npm start
```

Open:

```text
http://localhost:3000
```

If port 3000 is in use:

```bash
PORT=3001 npm start
```

PowerShell:

```powershell
$env:PORT=3001; npm start
```

## Run tests

```bash
npm test
```

Expected result:

```text
All Sprint 5 API smoke tests passed.
```

## Demo searches

- `acme` - Watch account with renewal, service, RMM, and security evidence.
- `greenfield` - Renewal Risk account.
- `northstar` - At Risk service escalation account.
- `summit` - Expansion Candidate account.
- `riverbend` - Mapping issue account.
- `harbor` - Stale Microsoft 365/security data account.
- `PSA-1001` - External ID search for Acme.

## Key API endpoints

```text
GET  /api/v1/accounts/search?query=acme
GET  /api/v1/accounts/:accountId/command-center
GET  /api/v1/accounts/:accountId/revenue
GET  /api/v1/accounts/:accountId/service
GET  /api/v1/accounts/:accountId/rmm
GET  /api/v1/accounts/:accountId/security
GET  /api/v1/accounts/:accountId/health-score/latest
GET  /api/v1/accounts/:accountId/recommendations?status=new&limit=5
GET  /api/v1/recommendations/:recommendationId/evidence
GET  /api/v1/account-health-scores/:accountHealthScoreId/evidence
GET  /api/v1/admin/account-mapping/suggestions?matchStatus=needs_review
POST /api/v1/admin/account-mapping/:accountExternalIdentityId/confirm
POST /api/v1/admin/account-mapping/:accountExternalIdentityId/reject
POST /api/v1/accounts/:accountId/psa/tasks/preview
POST /api/v1/accounts/:accountId/psa/tasks
GET  /api/v1/accounts/:accountId/write-back-audit-events
PATCH /api/v1/recommendations/:recommendationId
POST /api/v1/accounts/:accountId/artifacts/account-brief
GET  /api/v1/generated-artifacts/:generatedArtifactId
GET  /api/v1/accounts/:accountId/generated-artifacts
GET  /api/v1/generated-artifacts/:generatedArtifactId/evidence
GET  /api/v1/portfolio/accounts-at-risk
GET  /api/v1/portfolio/renewals?days=90
GET  /api/v1/portfolio/expansion-candidates
GET  /api/v1/integrations/psa/status
GET  /api/v1/admin/settings/psa-field-mapping
PATCH /api/v1/admin/settings/psa-field-mapping
POST /api/v1/admin/store/reset
POST /api/v1/accounts/:accountId/psa/notes/preview
POST /api/v1/accounts/:accountId/psa/notes
POST /api/v1/accounts/:accountId/artifacts/qbr-draft
POST /api/v1/accounts/:accountId/artifacts/customer-email-draft
POST /api/v1/accounts/:accountId/assistant/ask
GET  /api/v1/admin/integrations
POST /api/v1/admin/integrations/:integrationConnectionId/sync
POST /api/v1/product-events
```

## Project Structure

```text
docs/      Planning artifacts
public/    Static frontend
src/       Seed data, API handlers, server
tests/     API contract smoke tests
```

## Persistence

Sprint 4 uses a lightweight local JSON store at:

```text
src/../data-store/oneop2-store.json
```

The store is intentionally ignored by Git. It persists generated artifacts, write-back audit events, activity timeline entries, recommendation status overlays, mapping decisions, and settings between app restarts. Sprint 5 keeps `ONEOP2_STORE_PROVIDER=json` as the default and reserves `ONEOP2_STORE_PROVIDER=postgres` plus `ONEOP2_DATABASE_URL` for the future PostgreSQL provider.

Reset local demo state:

```bash
ONEOP2_RESET_STORE=1 npm start
```

Or call:

```text
POST /api/v1/admin/store/reset
```


## PostgreSQL provider

JSON remains the default provider for local demos:

```bash
npm start
```

To run against PostgreSQL, create the database, apply the schema, and start with provider settings:

```bash
psql "$ONEOP2_DATABASE_URL" -f db/schema.sql
ONEOP2_STORE_PROVIDER=postgres ONEOP2_DATABASE_URL="postgres://user:password@localhost:5432/oneop2" npm start
```

PowerShell:

```powershell
$env:ONEOP2_STORE_PROVIDER="postgres"
$env:ONEOP2_DATABASE_URL="postgres://user:password@localhost:5432/oneop2"
npm start
```

The PostgreSQL provider stores OneOp2 runtime workflow state in `app_settings` under key `oneop2_runtime_state`. The seed loader also populates normalized reference and operational tables for users, accounts, integrations, mappings, owners, aliases, contacts, agreements, renewals, tickets, devices, RMM health signals, security findings, security coverage, evidence, health scores, and recommendations. When `ONEOP2_STORE_PROVIDER=postgres`, API read paths hydrate from the normalized PostgreSQL tables at startup. JSON mode continues to read from `src/data.js` for local demos.

Validate PostgreSQL-backed API reads after setting `ONEOP2_DATABASE_URL`:

```bash
npm run test:postgres
```


Sprint 6 foundation endpoints:

```text
GET   /api/v1/session/current-user
PATCH /api/v1/session/current-user
GET   /api/v1/admin/database/status
```

`PATCH /api/v1/session/current-user` is a local-demo helper for RBAC testing. Do not expose it as-is in production authentication flows. `GET /api/v1/admin/database/status` returns seed/table health without returning connection secrets.

## Sprint 6 Candidates

- Activate PostgreSQL provider implementation.
- Real PSA write-back for task and note creation.
- Real PSA company/contact/ticket sync hardening.
- Real RMM read integration spike.
- Real Microsoft 365/security read integration spike.
- QBR export to PDF or PowerPoint.
- Customer email prepare/send handoff.
- Buffaly assistant with conversational memory.
- Account plan editor.
- Relationship/contact engagement model.
- Deployment packaging.
- Production authentication.
- Multi-tenant architecture design.

