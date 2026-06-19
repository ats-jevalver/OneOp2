# OneOp2

OneOp2 is a Buffaly-powered Account Intelligence MVP for sales and account management teams.

Sprint 1 delivered the first visible product slice: search/select an account and render a basic Account Command Center.

Sprint 2 adds the first account intelligence loop: seeded service, RMM, and security signals; explainable health scores; evidence-backed recommendations; and an evidence modal.

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
All Sprint 2 API smoke tests passed.
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

## Sprint 3 Candidates

- PSA write-back preview and create task.
- PSA note creation from account brief.
- First generated account brief artifact.
- Account mapping admin queue UI.
- Real PSA ticket sync.
- Lightweight persistence/database layer.
- Portfolio views for At Risk, Renewal Risk, and Expansion Candidate accounts.
- Buffaly assistant suggested prompts.
