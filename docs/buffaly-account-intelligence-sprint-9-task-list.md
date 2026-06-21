# Buffaly Account Intelligence MVP - Sprint 9 Task List

## Sprint Goal

Implement the first real-integration planning and foundation slice for OneOp2 using Autotask PSA as the primary PSA target and DattoRMM as the primary RMM target.

Sprint 8 proved production-shaped seams without external mutation: auth/session abstraction, secret-safe diagnostics, real-provider dry-run modes, read-only PSA validation endpoints, export/handoff readiness, environment validation, and UI cues. Sprint 9 should convert those seams into concrete Autotask and DattoRMM connector contracts while preserving the safety posture.

## Sprint Theme

**Autotask-first live read readiness with DattoRMM read-shape design.**

## Target Systems

- PSA: Autotask PSA.
- RMM: DattoRMM.

## Assumptions

- External writes remain out of scope unless separately approved with field-level confirmation and audit controls.
- Autotask work starts with read-only company/contact/ticket validation and sync preview hydration.
- DattoRMM work starts with read-shape contracts and mocked deterministic adapter behavior before live API calls.
- Secrets are provided only through runtime environment variables or future secure secret-provider seams; no credentials are committed.
- JSON mode remains supported for demos; PostgreSQL remains the preferred limited-pilot persistence provider.
- Existing mock adapters remain deterministic and must keep tests stable.

## In Scope

1. Define Autotask-specific connector configuration, secret names, and diagnostics.
2. Replace generic real PSA dry-run language with Autotask-specific read-readiness behavior where appropriate.
3. Add Autotask read-only client module/interface boundaries for company, contact, and ticket reads.
4. Add safe Autotask response mapping into the existing OneOp2 PSA adapter contract.
5. Extend tests for missing/partial Autotask credentials and sanitized diagnostics.
6. Design DattoRMM adapter contract, secret/config shape, and deterministic read validation payloads.
7. Add DattoRMM endpoint specs for devices, alerts, patch posture, and account/client mapping readiness.
8. Update Admin Integrations UI copy so Autotask and DattoRMM are visible as the planned real targets.
9. Update validation/demo docs for Sprint 9 setup and no-secret handling.
10. Produce Sprint 9 acceptance evidence and Sprint 10 follow-up recommendations.

## Out of Scope

- Automatic PSA writes to Autotask.
- DattoRMM live API calls unless credentials and API contract details are validated early enough to safely include them.
- Microsoft 365/security live connector implementation.
- Production identity provider implementation beyond planning and dependency identification.
- Hosted deployment/CI-CD automation.
- PDF/PowerPoint export.

## Sprint 9 Backlog

### S9-01 - Define Autotask connector configuration and secret contract

**User story:** As an operator, I want Autotask configuration and secret requirements documented and encoded so connector diagnostics can guide setup without exposing credentials.

**Tasks:**

- Define Autotask environment variables and non-secret config fields.
- Align secret names with current `integrationSecrets` patterns or add Autotask-specific aliases if needed.
- Document required vs optional fields.
- Ensure diagnostics report presence/absence only.
- Add tests proving Autotask secret values are not returned.

**Acceptance criteria:**

- Autotask config contract is documented in README and Sprint 9 docs.
- Missing Autotask secrets produce actionable diagnostics.
- Secret values never appear in API/test snapshots.

**Priority:** High

---

### S9-02 - Add Autotask read-only client boundary

**User story:** As a developer, I want Autotask API calls isolated behind a small client boundary so connector behavior is testable and safe.

**Tasks:**

- Add `src/integrations/autotaskClient.js` or equivalent boundary.
- Define methods for company, contact, and ticket lookup/read validation.
- Keep network calls disabled or guarded until credentials and base URL are configured.
- Return typed client errors for missing credentials, invalid base URL, auth failure, and remote unavailability.
- Avoid adding new dependencies unless justified.

**Acceptance criteria:**

- Client boundary can be unit/smoke tested without real credentials.
- No external calls happen when Autotask is not fully configured.
- Error shapes are safe and actionable.

**Priority:** High

---

### S9-03 - Map Autotask companies into OneOp2 account identity previews

**User story:** As an administrator, I want Autotask company reads mapped into OneOp2 preview rows so I can validate account matching before import.

**Tasks:**

- Define Autotask company fields needed for matching.
- Map Autotask company id/name/status/domain fields into existing PSA preview shape.
- Preserve `matched`, `new`, `changed`, `conflict`, and `skipped` semantics.
- Keep preview dry-run/read-only.
- Add tests using deterministic Autotask-shaped fixtures.

**Acceptance criteria:**

- Company validation endpoint can return Autotask-shaped mapped rows in test mode.
- Sync preview clearly identifies Autotask provider/source mode.
- Conflict rows still require explicit admin review.

**Priority:** High

---

### S9-04 - Map Autotask contacts into OneOp2 contact previews

**User story:** As an administrator, I want Autotask contact reads mapped into OneOp2 preview rows so contact updates are visible before any import.

**Tasks:**

- Define Autotask contact fields needed for identity matching.
- Map contact id/company id/name/email/status into existing preview shape.
- Validate contacts can be filtered by company/account context.
- Add deterministic fixture tests.

**Acceptance criteria:**

- Contact validation endpoint returns mapped contact rows.
- Contacts include external company references for account mapping.
- No write-back or contact mutation occurs.

**Priority:** High

---

### S9-05 - Map Autotask tickets into service intelligence read shape

**User story:** As an account manager, I want Autotask ticket reads to support service risk summaries for an account.

**Tasks:**

- Define Autotask ticket fields needed for open ticket, priority, SLA, aging, and category summaries.
- Map ticket read validation rows into current PSA ticket validation shape.
- Identify future path from Autotask tickets to OneOp2 service summary/evidence.
- Add tests for priority/status filtering and no-secret diagnostics.

**Acceptance criteria:**

- Ticket validation endpoint supports Autotask-shaped fixture rows.
- Service-risk mapping assumptions are documented.
- No external mutation occurs.

**Priority:** High

---

### S9-06 - Design DattoRMM connector contract and config shape

**User story:** As an operator, I want DattoRMM configuration and read contracts defined so RMM integration work can start safely after Autotask foundations.

**Tasks:**

- Define DattoRMM provider type and environment variable names.
- Define client/account mapping assumptions between DattoRMM sites and OneOp2 accounts.
- Define read methods for devices, alerts, and patch posture.
- Document expected response fields and freshness metadata.
- Add secret-redaction expectations.

**Acceptance criteria:**

- DattoRMM contract doc exists or README section is updated.
- Required secret/config fields are named without values.
- Read shapes map to existing RMM summary concepts.

**Priority:** High

---

### S9-07 - Add deterministic DattoRMM adapter fixtures and validation endpoints

**User story:** As a developer, I want deterministic DattoRMM fixture reads so UI/API work can proceed before live credentials are connected.

**Tasks:**

- Add a DattoRMM adapter module or RMM adapter factory seam.
- Add fixture rows for devices, alerts, and patch posture.
- Add admin-only RMM read validation endpoints.
- Keep the existing `/accounts/:accountId/rmm` summary stable.
- Add smoke tests for endpoint shape and RBAC.

**Acceptance criteria:**

- Admin can validate DattoRMM-shaped fixture reads.
- Non-admin access is denied.
- RMM fixtures include source metadata and external mutation disabled state.

**Priority:** Medium

---

### S9-08 - Update Admin Integrations UI for Autotask and DattoRMM readiness

**User story:** As a pilot tester, I want the UI to show that Autotask and DattoRMM are the intended real connectors so setup and demos match the actual plan.

**Tasks:**

- Update Admin Integrations copy from generic PSA/RMM language to Autotask/DattoRMM target language.
- Show Autotask provider mode and diagnostics clearly.
- Add DattoRMM readiness placeholder/validation card if backend endpoints are implemented.
- Keep no-secret and no-external-mutation cues visible.

**Acceptance criteria:**

- UI names Autotask PSA and DattoRMM as planned real targets.
- Mock mode remains clear for demos.
- Validation actions do not imply writes or live calls unless configured.

**Priority:** Medium

---

### S9-09 - Extend validation and tests for connector target readiness

**User story:** As a developer/operator, I want repeatable tests that prove Autotask/DattoRMM connector readiness stays safe.

**Tasks:**

- Add tests for Autotask missing/partial/full configuration diagnostics.
- Add tests for Autotask mapped fixture reads.
- Add tests for DattoRMM config/fixture reads if implemented.
- Ensure `npm test` and `npm run validate:environment` remain green without real credentials.
- Keep UI syntax readiness in the validation path.

**Acceptance criteria:**

- Required local validation passes without real credentials.
- Real-credential paths are optional and safely skipped when not configured.
- Secret values are not printed in failure output.

**Priority:** High

---

### S9-10 - Sprint 9 docs, demo script, and acceptance report

**User story:** As a stakeholder, I want Sprint 9 outcomes and limitations documented so pilot readiness can be reviewed honestly.

**Tasks:**

- Add/update README sections for Autotask and DattoRMM setup.
- Add Sprint 9 demo script.
- Add Sprint 9 completion report when implementation batches are done.
- Document Sprint 10 follow-up recommendations.

**Acceptance criteria:**

- Docs identify what is live, mocked, dry-run, or deferred.
- Demo script includes no secrets.
- Completion report maps backlog items to commits and validation evidence.

**Priority:** Medium

## Suggested Task Order

1. S9-01 - Autotask config and secret contract.
2. S9-02 - Autotask client boundary.
3. S9-03 - Autotask company mapping.
4. S9-04 - Autotask contact mapping.
5. S9-05 - Autotask ticket mapping.
6. S9-09 - Expand validation for Autotask readiness.
7. S9-06 - DattoRMM contract/config shape.
8. S9-07 - DattoRMM fixtures/endpoints.
9. S9-08 - Admin UI target-readiness updates.
10. S9-10 - Docs, demo script, and acceptance report.

## Sprint 9 Demo Checklist

- Show current integration target documentation: Autotask PSA and DattoRMM.
- Show Autotask diagnostics with missing/partial secret status and no values.
- Show Autotask company/contact/ticket validation using deterministic fixtures or live dry-run if configured.
- Show sync preview remains dry-run/read-only unless explicitly approved.
- Show DattoRMM read-shape plan or fixture validation if implemented.
- Run `npm test` and `npm run validate:environment`.
- Confirm no secrets appear in output, UI, or logs.

## Definition of Done

- Sprint 9 task list is committed.
- Autotask connector target is represented in config, diagnostics, tests, and docs.
- DattoRMM connector target has a clear contract and at least deterministic fixture/read-shape coverage if included in the implementation slice.
- All required local tests pass without real credentials.
- Any real external calls are read-only, explicitly configured, and safe to skip locally.
- No secret values are committed, logged, returned, or displayed.
- Sprint 9 demo/readiness docs are updated.

## Sprint 10 Candidate Backlog

- Production identity provider integration.
- Live Autotask company/contact/ticket reads if not completed in Sprint 9.
- Autotask write-back approval and field mapping workflow.
- Live DattoRMM devices/alerts/patch posture reads.
- Microsoft 365/security connector planning and first read adapter.
- Hosted deployment package and environment templates.
