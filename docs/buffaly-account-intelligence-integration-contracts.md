# OneOp2 Sprint 5 Integration Contracts

## PSA Write-Back Contract

The PSA adapter exposes:

- `getConnectionStatus()`
- `createTask(payload)`
- `createNote(payload)`

Task payloads require `accountId`, `externalCompanyId`, `title`, `body`, `ownerUserId`, and `recommendationId`.

Note payloads require `accountId`, `externalCompanyId`, `title`, `body`, and `generatedArtifactId`.

All write-back attempts must create audit events with request summary, response summary, adapter name, external ID/URL when available, and validation errors when rejected.

## PSA Sync Preview Contract

`POST /api/v1/admin/integrations/:integrationConnectionId/sync` returns preview-shaped counts:

- `scanned`
- `created`
- `updated`
- `skipped`
- `needsReview`

Confirmed mappings are protected and cannot be silently overwritten.

## RMM Read Contract

Normalized RMM read adapters should emit:

- device identifier and display name
- device type
- online/offline status
- patch posture
- end-of-life flag
- alert/risk summary
- evidence links

## Security Read Contract

Normalized security adapters should emit:

- finding identifier
- severity
- status
- source product
- coverage category
- evidence summary
- observed timestamp

## Artifact Handoff Contracts

- `GET /api/v1/generated-artifacts/:generatedArtifactId/export?format=markdown` returns a markdown handoff payload with linked evidence.
- `POST /api/v1/generated-artifacts/:generatedArtifactId/email-handoff` prepares a customer email draft for human review. It does not send email.
