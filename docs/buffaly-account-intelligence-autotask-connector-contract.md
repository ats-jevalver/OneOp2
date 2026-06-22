# OneOp2 Autotask PSA Connector Contract

## Purpose

Define the Sprint 9 contract for adding Autotask PSA as the first real PSA connector target in OneOp2.

This contract must fit the existing Sprint 8 seams:

- `src/integrations/psaAdapter.js` exposes the provider-neutral PSA adapter contract.
- `src/security/integrationSecrets.js` reports secret presence without values.
- Admin endpoints already expose diagnostics, read-only validation, sync preview/apply stubs, and sync history.
- External mutation remains disabled unless a later sprint explicitly approves write-back behavior.

## Provider Identity

Autotask provider type:

```text
autotask
```

Adapter modes:

```text
mock              deterministic local demo data
real_dry_run      configured/dry-run Autotask readiness, no external mutation
real_read_only    future live Autotask reads only, no writes
```

Sprint 9 should move Autotask from generic `real_dry_run` toward `real_read_only` only for safe reads. Write operations remain disabled.

## Runtime Configuration Contract

Non-secret integration configuration fields:

| Field | Required | Source | Notes |
| --- | --- | --- | --- |
| `providerType` | yes | integration configuration | Must be `autotask`. |
| `environmentLabel` | no | integration configuration | Human label such as `Autotask sandbox`. |
| `baseUrl` | yes | integration configuration or env | Autotask API base URL/zone URL. Must not contain credentials. |
| `tenantOrCompanyId` | optional | integration configuration | Optional tenant/account label for operator clarity. Autotask auth does not use ConnectWise company id semantics. |
| `enabledCapabilities` | no | integration configuration | Read-only capability list. |

Current secret keys already recognized by OneOp2:

```text
ONEOP2_PSA_BASE_URL
ONEOP2_PSA_USERNAME
ONEOP2_PSA_SECRET
```

Sprint 9 supports Autotask-specific aliases that resolve into the same internal contract and must not be returned by APIs:

```text
ONEOP2_AUTOTASK_BASE_URL
ONEOP2_AUTOTASK_USERNAME
ONEOP2_AUTOTASK_SECRET
ONEOP2_AUTOTASK_INTEGRATION_CODE
```

If an Autotask integration code is required by the pilot API environment, it should be treated as secret material and surfaced only as a presence flag.

## Secret and Redaction Rules

- Never commit secrets.
- Never return secret values from API responses.
- Never include secret values in validation output, logs, errors, README examples, or demo scripts.
- Diagnostics may return:
  - required key names
  - boolean presence flags
  - missing key names
  - redacted URL status
- Diagnostics must not return:
  - username values
  - API secret values
  - integration code values
  - auth headers
  - raw request/response bodies that could include credentials

## Adapter Capabilities

Autotask read-only capability names:

```text
status
company_sync_preview
contact_sync_preview
ticket_sync_preview
company_read_validation
contact_read_validation
ticket_read_validation
```

Write capabilities remain disabled in real Autotask modes:

```text
create_task        disabled for autotask real modes
create_note        disabled for autotask real modes
```

## Autotask Client Boundary

Sprint 9 adds a small client boundary:

```text
src/integrations/autotaskClient.js
```

Suggested exported factory:

```js
function createAutotaskClient({ baseUrl, username, secret, integrationCode, timeoutMs, fetchImpl })
```

The initial boundary validates configuration, redacts credential-bearing URLs, returns deterministic fixture reads when live reads are not enabled, and fails closed for live reads until an explicit transport implementation is added.

Required methods:

```js
getStatus()
listCompanies(query)
listContacts(query)
listTickets(query)
```

The client must return normalized client results and must not know about OneOp2 account matching. Mapping into OneOp2 preview rows belongs in the adapter layer.

## Client Query Contract

Common query fields:

| Field | Applies to | Notes |
| --- | --- | --- |
| `search` | companies, contacts, tickets | Case-insensitive operator search. |
| `externalCompanyId` | contacts, tickets | Autotask account/company id. |
| `accountId` | mapped validation only | OneOp2 account id; adapter may resolve to external identity. |
| `status` | companies, contacts, tickets | Provider status filter. |
| `updatedSince` | future | Optional incremental read filter. |
| `limit` | all | Must have safe max/default. |

## Normalized Client DTOs

### Autotask company DTO

```js
{
  externalCompanyId: string,
  displayName: string,
  status: string,
  primaryDomain: string | null,
  phone: string | null,
  city: string | null,
  state: string | null,
  country: string | null,
  ownerExternalId: string | null,
  lastUpdatedAt: string | null,
  rawShapeVersion: 'autotask.company.v1'
}
```

### Autotask contact DTO

```js
{
  externalContactId: string,
  externalCompanyId: string,
  fullName: string,
  email: string | null,
  title: string | null,
  phone: string | null,
  status: string,
  isPrimaryContact: boolean,
  lastUpdatedAt: string | null,
  rawShapeVersion: 'autotask.contact.v1'
}
```

### Autotask ticket DTO

```js
{
  externalTicketId: string,
  externalCompanyId: string,
  title: string,
  status: string,
  priority: string | null,
  category: string | null,
  queue: string | null,
  assignedResourceExternalId: string | null,
  createdAt: string | null,
  dueAt: string | null,
  lastUpdatedAt: string | null,
  slaStatus: string | null,
  rawShapeVersion: 'autotask.ticket.v1'
}
```

## Adapter Mapping Contract

`createRealPsaAdapter(config, env)` should route `providerType === 'autotask'` through the Autotask client boundary.

The adapter remains responsible for mapping client DTOs into current OneOp2 response contracts.

Sprint 9 now maps Autotask company and contact fixture DTOs into OneOp2 read-validation rows and sync-preview rows. Ticket mapping remains a follow-up Sprint 9 slice.

### Read validation response shape

Autotask validation endpoints must keep the Sprint 8 shape:

```js
{
  mode: 'read_only_validation',
  recordType: 'company' | 'contact' | 'ticket',
  adapterMode: 'real_dry_run' | 'real_read_only',
  providerType: 'autotask',
  source: {
    adapterMode,
    providerType: 'autotask',
    source: 'autotask_read_only' | 'real_connector_dry_run',
    externalMutationAllowed: false
  },
  diagnosticStatus: 'ready' | 'not_configured' | 'remote_unavailable' | 'auth_failed' | 'validation_failed',
  generatedAt: string,
  query: object,
  counts: { total: number },
  rows: array,
  warnings: string[],
  secretsReturned: false
}
```

### Company validation row

```js
{
  externalCompanyId,
  displayName,
  status,
  accountId,
  primaryDomain,
  lastUpdatedAt,
  matchCandidate: {
    action: 'matched' | 'new' | 'changed' | 'conflict' | 'skipped',
    matchConfidence: number,
    reason: string
  }
}
```

### Contact validation row

```js
{
  externalContactId,
  externalCompanyId,
  fullName,
  email,
  status,
  contactId,
  accountId,
  matchCandidate: {
    action,
    matchConfidence,
    reason
  }
}
```

### Ticket validation row

```js
{
  externalTicketId,
  externalCompanyId,
  title,
  status,
  priority,
  category,
  accountId,
  serviceSignal: {
    ageDays: number | null,
    slaStatus: string | null,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' | null
  }
}
```

## Sync Preview Contract

Autotask company/contact sync preview should continue using the existing preview shape:

```js
{
  mode: 'preview',
  adapter: 'autotask',
  adapterMode,
  providerType: 'autotask',
  source,
  generatedAt,
  diagnosticStatus,
  counts: {
    total,
    new,
    matched,
    changed,
    skipped,
    conflicts
  },
  companies,
  contacts,
  warnings
}
```

The preview must be read-only. Apply behavior remains the existing internal controlled import stub unless future scope changes.

## Error Contract

Client/adapter errors should map to safe statuses:

| Status | Meaning | Safe message behavior |
| --- | --- | --- |
| `not_configured` | Required config/secret is missing | Name missing keys only, no values. |
| `validation_failed` | Query/config input invalid | Return field names and operator guidance. |
| `auth_failed` | Autotask authentication rejected | Do not echo username/secret/integration code. |
| `remote_unavailable` | Autotask endpoint timeout/network/server issue | Include status category and retry guidance only. |
| `ready` | Configured and validation/read succeeded | Include counts and source metadata. |

Raw remote response bodies must not be returned until explicitly reviewed for sensitive content.

## Admin API Endpoint Mapping

Existing endpoints remain valid for Autotask:

```text
GET  /api/v1/admin/integrations/:integrationConnectionId/diagnostics
POST /api/v1/admin/integrations/:integrationConnectionId/sync-preview
GET  /api/v1/admin/integrations/:integrationConnectionId/psa/companies
GET  /api/v1/admin/integrations/:integrationConnectionId/psa/contacts
GET  /api/v1/admin/integrations/:integrationConnectionId/psa/tickets
```

Configuration continues through:

```text
GET   /api/v1/admin/integrations/:integrationConnectionId/configuration
PATCH /api/v1/admin/integrations/:integrationConnectionId/configuration
```

All endpoints must remain admin-only except general integration status.

## Testing Requirements

Required tests without real credentials:

- Autotask missing secret diagnostics return `not_configured` and no secret values.
- Autotask partial secret diagnostics identify missing keys only.
- Autotask configured dry-run can return deterministic fixture rows without calling external APIs.
- Company/contact/ticket validation endpoints preserve current response shape.
- Sync preview identifies provider type `autotask` and external mutation disabled.
- Non-admin users receive `403`.
- `npm test` and `npm run validate:environment` pass with no real credentials.

Optional tests with real pilot credentials:

- Run only when explicit environment flag enables live read validation.
- Must be read-only.
- Must skip safely when credentials are absent.
- Must redact all credential-bearing values.

## Implementation Sequence

1. Extend secret/config contract if Autotask-specific aliases are needed.
2. Add Autotask client boundary with no external call unless complete config is present.
3. Add deterministic Autotask fixtures for tests.
4. Route `providerType === 'autotask'` through Autotask-specific mapping in the PSA adapter.
5. Update diagnostics and validation endpoints to show Autotask source metadata.
6. Extend API tests.
7. Update Admin Integrations UI copy.
8. Update README and Sprint 9 demo docs.

## Non-Goals

- No Autotask writes in this contract.
- No silent fallback from failed Autotask auth to mock data in real modes.
- No raw remote payload exposure in API responses.
- No credential storage in repository files.
- No DattoRMM implementation in this contract; DattoRMM has a separate connector contract.
