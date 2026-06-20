# OneOp2

OneOp2 is a Buffaly-powered Account Intelligence MVP for sales and account management teams.

Sprint 1 delivered the first visible product slice: search/select an account and render a basic Account Command Center.

Sprint 2 added the first account intelligence loop: seeded service, RMM, and security signals; explainable health scores; evidence-backed recommendations; and an evidence modal.

Sprint 3 made the intelligence actionable with stubbed PSA task creation, write-back audit history, generated account briefs, activity timeline, mapping admin actions, and portfolio views.

Sprint 4 added durable local JSON persistence, a repository-style store boundary, a mock PSA adapter, persisted runtime workflow state, PSA note stubs, QBR/email artifacts, portfolio filters, and deterministic assistant prompts.

Sprint 5 starts the integration-ready foundation: persistence provider diagnostics, PostgreSQL starter schema, hardened PSA adapter contracts, safer write-back audits, sync preview counts, integration capability status, artifact export, and email handoff guardrails. Sprint 6 activates PostgreSQL-backed runtime state, normalized-table reads, provider status UX, account plans, and generated-artifact review lifecycle controls.

Sprint 7 begins PSA pilot readiness with non-secret PSA integration configuration, admin-only sync preview for PSA companies/contacts, controlled sync apply stubs, and safer foundations for future imports. Sprint 8 starts production-shaped pilot hardening with a local-demo auth provider abstraction, secret-safe PSA connector diagnostics, real-connector dry-run mode metadata, and sync history source tracking.

## Current Features

- Dependency-light Node.js HTTP API.
- Static Account Command Center UI.
- Seeded demo users, accounts, integrations, contacts, agreements, renewals, tickets, devices, security findings, evidence, health scores, and recommendations.
- Account search by name, domain, alias, contact email/name, and external source ID.
- Account Command Center endpoint.
- Relationship intelligence endpoint and command-center relationship card.
- Editable account plan objectives, risks, and next steps.
- Generated artifacts can be linked to account plan objectives and next steps.
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
- PSA task/note write-back confirmations require preview fingerprints and record reviewed request fingerprints in audit events.
- QBR draft and customer email draft artifact endpoints.
- Generated artifact markdown export, evidence appendix, review lifecycle, and customer email review handoff endpoints.
- Integration capability status and sync preview count responses.
- Sprint 7 admin PSA integration configuration, company/contact sync preview, controlled apply stub, and sync history endpoints.
- Sprint 8 local-demo auth/session provider metadata and explicitly demo-only user switching.
- Sprint 8 secret-safe PSA connector diagnostics with mock and real dry-run adapter modes.
- Admin Integrations UI for PSA configuration, sync preview/apply, and history.
- PostgreSQL schema alignment for Sprint 7 account plan, relationship, artifact-link, and integration pilot tables.
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
All Sprint 7/Sprint 8 foundation API smoke tests passed.
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
GET  /api/v1/accounts/:accountId/relationships
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
PATCH /api/v1/generated-artifacts/:generatedArtifactId
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
GET  /api/v1/generated-artifacts/:generatedArtifactId/export?format=markdown
POST /api/v1/accounts/:accountId/artifacts/customer-email-draft
POST /api/v1/generated-artifacts/:generatedArtifactId/email-handoff
POST /api/v1/accounts/:accountId/assistant/ask
GET  /api/v1/admin/integrations
POST /api/v1/admin/integrations/:integrationConnectionId/sync
GET  /api/v1/admin/integrations/:integrationConnectionId/configuration
PATCH /api/v1/admin/integrations/:integrationConnectionId/configuration
POST /api/v1/admin/integrations/:integrationConnectionId/sync-preview
POST /api/v1/admin/integrations/:integrationConnectionId/sync/apply
GET  /api/v1/admin/integrations/:integrationConnectionId/sync-history
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

The PostgreSQL provider stores OneOp2 runtime workflow state in `app_settings` under key `oneop2_runtime_state`. The seed loader also populates normalized reference and operational tables for users, accounts, integrations, mappings, owners, aliases, contacts, agreements, renewals, tickets, devices, RMM health signals, security findings, security coverage, evidence, health scores, recommendations, account plan risks/next steps, contact engagement events, and Sprint 7 integration pilot configuration. When `ONEOP2_STORE_PROVIDER=postgres`, API read paths hydrate from the normalized PostgreSQL tables at startup. JSON mode continues to read from `src/data.js` for local demos.

Validate PostgreSQL-backed API reads after setting `ONEOP2_DATABASE_URL`:

```bash
npm run test:postgres
```


Sprint 7 and Sprint 8 pilot endpoints:

```text
GET   /api/v1/session/current-user
PATCH /api/v1/session/current-user
GET   /api/v1/admin/database/status
GET   /api/v1/accounts/:accountId/account-plan
PATCH /api/v1/accounts/:accountId/account-plan
GET   /api/v1/accounts/:accountId/relationships
GET   /api/v1/admin/integrations/:integrationConnectionId/configuration
PATCH /api/v1/admin/integrations/:integrationConnectionId/configuration
POST  /api/v1/admin/integrations/:integrationConnectionId/sync-preview
POST  /api/v1/admin/integrations/:integrationConnectionId/sync/apply
GET   /api/v1/admin/integrations/:integrationConnectionId/sync-history
PATCH /api/v1/generated-artifacts/:generatedArtifactId
```

`PATCH /api/v1/session/current-user` is a local-demo helper for RBAC testing. Do not expose it as-is in production authentication flows. `GET /api/v1/admin/database/status` returns seed/table health without returning connection secrets.


Sprint 7 UI additions:

- Provider/database status panel on the Account Search screen.
- Local demo current-user switch buttons for account manager/admin testing.
- Account plan card with editable objectives, risks, next steps, and linked artifacts.
- Relationship card with key contacts, recent engagement, and relationship watch items.
- QBR draft and customer email draft quick actions on the Account Command Center.
- Markdown export and email handoff links for generated artifacts.
- Admin Integrations screen for PSA configuration, sync preview/apply, and sync history.

## Sprint 7 Pilot Demo Script

1. Start OneOp2 in PostgreSQL mode.
2. Switch to the Admin demo user from the provider status panel.
3. Open Admin Integrations and verify provider/database status.
4. Review and save non-secret PSA configuration fields.
5. Run PSA company/contact sync preview and inspect matched/new/conflict rows.
6. Apply safe selected rows and verify sync history updates.
7. Switch to the Account Manager demo user.
8. Search `acme` and open the Account Command Center.
9. Review the Account Plan card, relationship card, and generated next-best actions.
10. Complete a next step or add a demo risk from the Account Plan card.
11. Generate a QBR draft; it links to the renewal objective and exports markdown with evidence.
12. Preview and confirm a PSA task/note write-back using the returned preview fingerprint.
13. Review write-back audit history to confirm the reviewed request fingerprint was stored.
14. Run `npm test` and `npm run test:postgres`.

## Sprint 7 Validation Checklist

- `node --check public/app.js`
- `npm test`
- `node scripts/seed-postgres.js` with `ONEOP2_DATABASE_URL` set
- `npm run test:postgres` with `ONEOP2_DATABASE_URL` set
- Confirm no secrets are committed or returned by configuration APIs.

## Sprint 8 Candidates

- Real PSA connector spike using user-provided credentials.
- Production authentication/session model to replace demo user switching.
- Real RMM read integration spike.
- Real Microsoft 365/security read integration spike.
- QBR export to PDF or PowerPoint.
- Buffaly prepare-email handoff for reviewed customer email drafts.
- Buffaly assistant with conversational memory.
- Deployment packaging.
- Multi-tenant architecture design.


## Sprint 8 PSA connector diagnostics

Sprint 8 keeps `mock_psa` as the default safe adapter and adds real-provider dry-run modes for connector readiness checks. Real-provider modes do not call external PSA APIs yet and external writes remain disabled.

Supported PSA provider modes:

```text
mock_psa
connectwise_manage
autotask
```

Secret material is loaded only from runtime environment variables and is never returned by API responses. Diagnostics return presence flags and missing key names only.

ConnectWise Manage dry-run secret keys:

```text
ONEOP2_PSA_BASE_URL
ONEOP2_PSA_COMPANY_ID
ONEOP2_PSA_PUBLIC_KEY
ONEOP2_PSA_PRIVATE_KEY
```

Autotask dry-run secret keys:

```text
ONEOP2_PSA_BASE_URL
ONEOP2_PSA_USERNAME
ONEOP2_PSA_SECRET
```

Admin diagnostics endpoint:

```text
GET /api/v1/admin/integrations/:integrationConnectionId/diagnostics
```

The response includes adapter mode, provider type, config completeness, secret presence flags, capabilities, and source metadata. It intentionally excludes credential values and raw secret-bearing URLs.
