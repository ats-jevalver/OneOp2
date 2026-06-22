# OneOp2 DattoRMM Data Model

## Purpose

Define the Sprint 9 data model for DattoRMM as OneOp2's first real RMM connector target.

The model aligns DattoRMM sites, devices, alerts, patch posture, and monitoring signals with OneOp2's existing account intelligence structures:

- account identity and external source mappings
- RMM summary cards in the Account Command Center
- device inventory and device health signals
- evidence and recommendation generation
- future admin integration diagnostics/read validation

## Provider Identity

```text
providerType: datto_rmm
systemType: rmm
sourceSystemName: DattoRMM
```

Adapter modes should mirror the PSA safety model:

```text
mock                  deterministic local demo fixtures
real_dry_run          configured/dry-run readiness, no external calls or mutation
real_read_only        future live DattoRMM reads, no writes
```

External mutation is out of scope for DattoRMM in Sprint 9.

## Runtime Configuration and Secrets

Non-secret configuration fields:

| Field | Required | Notes |
| --- | --- | --- |
| `providerType` | yes | `datto_rmm` |
| `environmentLabel` | no | Human label such as `DattoRMM sandbox` |
| `baseUrl` | yes for live/dry-run | API base URL, no credentials |
| `tenantOrCompanyId` | optional | Operator-facing tenant label only |
| `enabledCapabilities` | no | RMM read capability list |

Proposed runtime secret keys:

```text
ONEOP2_DATTORMM_BASE_URL
ONEOP2_DATTORMM_API_KEY
ONEOP2_DATTORMM_API_SECRET
```

Optional future keys if required by the pilot environment:

```text
ONEOP2_DATTORMM_ACCOUNT_UID
ONEOP2_DATTORMM_REGION
```

Secret handling rules:

- Never commit values.
- Return presence flags only.
- Do not log auth headers, API key, API secret, or raw token responses.
- Redact credential-bearing URLs.
- Live validation must skip safely when required secrets are absent.

## Source Identity Model

DattoRMM source identities should map DattoRMM site/client records to OneOp2 accounts.

### DattoRMM site identity

```js
{
  sourceSystemType: 'rmm',
  sourceSystemName: 'DattoRMM',
  externalIdentityType: 'site',
  externalId: string,
  externalDisplayName: string,
  accountId: string | null,
  matchStatus: 'confirmed' | 'needs_review' | 'rejected',
  matchConfidence: number,
  matchReason: string,
  lastSeenAt: string
}
```

Matching signals:

- site name to account display/legal/short name
- primary domain if DattoRMM exposes one through custom fields
- PSA company id cross-reference if available
- address/city/state hints when safe and available
- existing confirmed mappings must never be overwritten automatically

## Canonical Entities

### DattoRMM site

Represents a DattoRMM customer site/client container.

```js
{
  dattoRmmSiteId: string,
  externalSiteId: string,
  displayName: string,
  status: 'active' | 'inactive' | 'archived' | 'unknown',
  accountId: string | null,
  primaryDomain: string | null,
  deviceCount: number | null,
  lastSeenAt: string | null,
  sourceUpdatedAt: string | null,
  rawShapeVersion: 'dattormm.site.v1'
}
```

### DattoRMM device

Maps to the existing OneOp2 `devices` concept.

```js
{
  deviceId: string,
  accountId: string,
  integrationConnectionId: string,
  externalDeviceId: string,
  externalSiteId: string,
  hostname: string,
  deviceType: 'server' | 'workstation' | 'network' | 'mobile' | 'unknown',
  operatingSystem: string | null,
  status: 'online' | 'offline' | 'degraded' | 'unknown',
  patchStatus: 'current' | 'behind' | 'critical_missing' | 'unknown',
  isEndOfLife: boolean,
  lastSeenAt: string | null,
  lastRebootAt: string | null,
  warrantyEndDate: string | null,
  sourceUpdatedAt: string | null,
  rawShapeVersion: 'dattormm.device.v1'
}
```

### DattoRMM alert

Maps monitoring alerts into service/risk evidence and future recommendations.

```js
{
  dattoRmmAlertId: string,
  accountId: string,
  externalSiteId: string,
  externalDeviceId: string | null,
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational',
  status: 'open' | 'resolved' | 'muted' | 'unknown',
  alertType: string,
  title: string,
  description: string | null,
  firstSeenAt: string | null,
  lastSeenAt: string | null,
  resolvedAt: string | null,
  sourceUpdatedAt: string | null,
  rawShapeVersion: 'dattormm.alert.v1'
}
```

### DattoRMM patch posture

Can be stored as either device fields or separate posture rows when richer history is needed.

```js
{
  dattoRmmPatchPostureId: string,
  accountId: string,
  externalDeviceId: string,
  missingPatchCount: number,
  criticalMissingPatchCount: number,
  failedPatchCount: number,
  lastPatchScanAt: string | null,
  patchStatus: 'current' | 'behind' | 'critical_missing' | 'unknown',
  sourceUpdatedAt: string | null,
  rawShapeVersion: 'dattormm.patch_posture.v1'
}
```

### DattoRMM health signal

Maps to the existing OneOp2 `deviceHealthSignals` concept.

```js
{
  deviceHealthSignalId: string,
  accountId: string,
  deviceId: string | null,
  externalDeviceId: string,
  signalType: 'offline' | 'patch_gap' | 'disk_space' | 'cpu_memory' | 'backup' | 'endpoint_security' | 'warranty' | 'other',
  severity: 'critical' | 'high' | 'medium' | 'low',
  summary: string,
  observedAt: string,
  sourceSystemName: 'DattoRMM',
  sourceRecordType: 'device' | 'alert' | 'patch_posture',
  sourceRecordId: string
}
```

## Account Command Center Summary Mapping

Existing `summarizeRmm(accountId)` summary fields should be hydrated from DattoRMM data:

| Summary field | DattoRMM source |
| --- | --- |
| `deviceCount` | count of mapped DattoRMM devices |
| `serverCount` | devices with normalized `deviceType = server` |
| `workstationCount` | devices with normalized `deviceType = workstation` |
| `offlineDeviceCount` | devices with `status = offline` or open offline alerts |
| `patchGapCount` | devices/posture rows with `behind` or `critical_missing` |
| `endOfLifeDeviceCount` | normalized EOL/warranty/OS lifecycle flags |

Future summary candidates:

- `openAlertCount`
- `criticalAlertCount`
- `backupRiskCount`
- `staleAgentCount`
- `lastSuccessfulSyncAt`

## Admin Read Validation Endpoints

Recommended Sprint 9 endpoints:

```text
GET /api/v1/admin/integrations/:integrationConnectionId/rmm/sites
GET /api/v1/admin/integrations/:integrationConnectionId/rmm/devices
GET /api/v1/admin/integrations/:integrationConnectionId/rmm/alerts
GET /api/v1/admin/integrations/:integrationConnectionId/rmm/patch-posture
```

Common response shape:

```js
{
  mode: 'read_only_validation',
  recordType: 'site' | 'device' | 'alert' | 'patch_posture',
  adapterMode: 'mock' | 'real_dry_run' | 'real_read_only',
  providerType: 'datto_rmm',
  source: {
    adapterMode,
    providerType: 'datto_rmm',
    source: 'dattormm_fixture' | 'dattormm_read_only' | 'real_connector_dry_run',
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

Supported query fields:

```js
{
  search: string | undefined,
  accountId: string | undefined,
  externalSiteId: string | undefined,
  externalDeviceId: string | undefined,
  status: string | undefined,
  severity: string | undefined,
  updatedSince: string | undefined,
  limit: number | undefined
}
```

## Evidence Mapping

DattoRMM data should generate evidence items for account health and recommendations.

Examples:

| DattoRMM signal | Evidence type | Recommendation candidate |
| --- | --- | --- |
| critical missing patches | `rmm_patch_gap` | Create patch remediation plan |
| server offline > threshold | `rmm_offline_device` | Escalate device health review |
| repeated backup alert | `rmm_backup_risk` | Review backup coverage |
| EOL OS/device | `rmm_lifecycle_risk` | Propose lifecycle refresh |
| stale agent/no check-in | `rmm_stale_agent` | Validate monitoring coverage |

Evidence source fields:

```js
{
  sourceSystemName: 'DattoRMM',
  sourceRecordType: 'site' | 'device' | 'alert' | 'patch_posture',
  sourceRecordId: string,
  summary: string,
  observedAt: string
}
```

## Normalization Rules

### Device type

- DattoRMM server-like types -> `server`
- laptop/desktop/workstation -> `workstation`
- firewall/switch/router/AP -> `network`
- phone/tablet/mobile -> `mobile`
- unknown/unmapped -> `unknown`

### Device status

- online/checking in -> `online`
- offline/no recent check-in -> `offline`
- degraded/open critical alert -> `degraded`
- missing/ambiguous -> `unknown`

### Patch status

- no missing patches -> `current`
- missing non-critical patches -> `behind`
- critical missing/failed patches -> `critical_missing`
- no recent scan -> `unknown`

### Alert severity

Normalize provider severities into:

```text
critical, high, medium, low, informational
```

## Safety and Data Governance

- DattoRMM connector starts read-only.
- No remote mutations are planned for Sprint 9.
- Raw payloads should not be returned from APIs by default.
- Secrets and auth headers must never be logged or returned.
- Confirmed account mappings must not be overwritten by automatic matching.
- Stale DattoRMM data should create warnings, not erase prior evidence.

## Initial Fixture Scenarios

Minimum deterministic fixture set for implementation:

1. Acme Corp mapped site with:
   - one server with critical missing patches
   - one workstation offline
   - one high alert tied to patch posture
2. Riverbend Logistics needs-review site mapping with:
   - one stale agent
   - one medium alert
3. Unmatched DattoRMM site with:
   - one device and no OneOp2 account mapping

## Implementation Sequence

1. Add DattoRMM connector contract doc or adapter contract from this model.
2. Add DattoRMM secret/config provider keys.
3. Add deterministic fixture adapter for sites/devices/alerts/patch posture.
4. Add admin read-validation endpoints.
5. Map fixture devices into existing `summarizeRmm` shape or a preview endpoint.
6. Add API smoke tests and UI readiness copy.
7. Update Sprint 9 demo script and acceptance evidence.

## Acceptance Criteria

- DattoRMM data model is documented and committed.
- Model maps cleanly to existing `devices`, `deviceHealthSignals`, RMM summary, evidence, and recommendation concepts.
- Secret/config requirements are named without values.
- Future endpoints have a consistent response shape.
- The model supports deterministic fixture implementation before live DattoRMM API calls.
