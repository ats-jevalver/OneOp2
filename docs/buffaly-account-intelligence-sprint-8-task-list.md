# Buffaly Account Intelligence MVP - Sprint 8 Task List

## Sprint Goal

Move OneOp2 from a Sprint 7 PSA-pilot-ready demo toward an operator-safe pilot foundation by replacing demo-only assumptions with production-shaped authentication seams, real PSA connector readiness, export handoff improvements, and deployment/environment preparation.

Sprint 7 delivered:

- PostgreSQL-backed Sprint 7 schema, seed, and read hydration alignment.
- Admin integration configuration, PSA sync preview/apply stub, and sync history.
- Relationship intelligence and account plan editing.
- Generated artifact links to account plan execution.
- PSA write-back preview fingerprints and audit hardening.
- Admin Integrations UI and pilot demo documentation.

Sprint 8 should reduce the remaining gap between a safe local pilot and a deployable limited customer pilot without overcommitting to every external integration at once.

## Sprint Theme

**Production-shaped pilot hardening.**

## Assumptions

- PostgreSQL remains the primary provider for Sprint 8 validation.
- JSON mode remains supported for portable demos.
- Real PSA credentials may be provided for connector testing, but secrets must not be committed or exposed.
- External writes remain human-confirmed and auditable.
- Production authentication may be introduced as an abstraction/adapter first rather than a full hosted identity deployment.
- QBR/email output remains human-reviewed; no automatic customer send is in scope.

## In Scope

1. Add a production-shaped authentication/session abstraction while preserving local demo switching for development.
2. Add secure secret-loading seams for integration credentials using environment variables or user-provided runtime secrets.
3. Build a real PSA connector spike behind the existing adapter contract.
4. Add connector diagnostics and safe read-only PSA company/contact/ticket validation endpoints.
5. Improve sync preview/apply to distinguish mock vs real connector mode.
6. Add QBR markdown-to-file export and prepare-email handoff readiness.
7. Add deployment/environment documentation and validation scripts.
8. Add tests for authentication seams, secret redaction, connector mode behavior, and export/handoff flows.

## Out of Scope

- Full production multi-tenant authorization model.
- Full RMM production integration.
- Full Microsoft 365/security production integration.
- Automatic customer email sending.
- Payment/billing/licensing.
- Fully hosted CI/CD deployment pipeline.

## Sprint 8 Backlog

### S8-01 - Introduce authentication/session provider abstraction

**User story:** As a developer/operator, I want OneOp2 authentication to flow through a provider abstraction so local demo switching can be replaced by production identity later without rewriting business endpoints.

**Tasks:**

- Create an auth/session provider module with local-demo implementation.
- Move current-user lookup and permission helpers behind the provider.
- Keep `PATCH /api/v1/session/current-user` explicitly local-demo-only.
- Add provider metadata to `/api/v1/session/current-user`.
- Add tests proving admin/account-manager RBAC still works.

**Acceptance criteria:**

- Existing RBAC tests pass through the provider abstraction.
- Current user responses identify auth provider mode.
- Local demo switching remains available in development.
- Code comments mark demo switching as unsafe for production.

**Priority:** High

---

### S8-02 - Add secure integration secret-loading seam

**User story:** As an administrator, I want integration secrets loaded from runtime configuration rather than committed files so pilot credentials can be tested safely.

**Tasks:**

- Define supported secret keys/environment variables for PSA connector credentials.
- Add secret-status diagnostics that report presence/absence without values.
- Update integration configuration API to continue returning no secret values.
- Add tests proving secret-like fields are not returned.
- Document local secret setup without including real credentials.

**Acceptance criteria:**

- API responses never include passwords/tokens/API keys.
- Admin can see whether required secret material is configured.
- README documents secret setup patterns safely.
- Tests cover redaction behavior.

**Priority:** High

---
### S8-03 - Build real PSA connector adapter spike

**User story:** As an administrator, I want a real PSA connector implementation behind the existing adapter contract so OneOp2 can validate company/contact/ticket reads against a pilot PSA system.

**Tasks:**

- Add adapter factory support for `mock_psa` and one real PSA provider mode.
- Implement connection status using configured provider settings/secrets.
- Implement read-only company/contact/ticket lookup methods for the real mode.
- Keep create task/note writes disabled or stubbed unless explicitly confirmed and supported.
- Add clear diagnostics for missing credentials or unreachable PSA.

**Acceptance criteria:**

- Mock mode remains deterministic and passes existing tests.
- Real mode can be enabled by environment/configuration.
- Missing credentials return safe diagnostic errors without secrets.
- Connector code is isolated behind existing adapter contract.

**Priority:** High

---

### S8-04 - Add PSA connector diagnostics endpoint

**User story:** As an administrator, I want a diagnostics endpoint for PSA connector readiness so I can validate pilot setup before running sync preview.

**Tasks:**

- Add `GET /api/v1/admin/integrations/:integrationConnectionId/diagnostics`.
- Return adapter mode, config completeness, secret presence flags, capabilities, and last diagnostic result.
- Do not return secret values or raw credential-bearing URLs.
- Add tests for mock mode and missing-secret real mode.

**Acceptance criteria:**

- Admin diagnostics endpoint returns 200 in mock mode.
- Non-admin users receive 403.
- Real-mode missing secret response is actionable and safe.
- No secret values appear in response snapshots.

**Priority:** High

---

### S8-05 - Improve PSA sync preview/apply for connector mode awareness

**User story:** As an administrator, I want sync preview/apply to clearly show whether data came from mock or real connector mode so I can trust pilot results.

**Tasks:**

- Add adapter mode and source metadata to sync preview responses.
- Add connector-mode warnings when real mode is not fully configured.
- Add dry-run behavior for real connector preview.
- Keep apply behavior controlled and explicit.
- Persist adapter mode/source in sync history.

**Acceptance criteria:**

- Sync preview identifies mock vs real mode.
- Sync history records adapter mode and source metadata.
- Real-mode dry-run never mutates external PSA.
- Tests cover mock mode and missing real configuration.

**Priority:** High

---

### S8-06 - Add QBR export-to-file workflow

**User story:** As an account manager, I want to export reviewed QBR drafts to a file artifact so I can share or refine them outside the app.

**Tasks:**

- Add server-side export artifact writer under a safe local artifacts/output folder.
- Add endpoint to export generated artifact markdown to a file path/metadata response.
- Require artifact status reviewed or approved for export-to-file, or return warning for drafts.
- Include evidence appendix and account plan links in export body.
- Add tests for export metadata and body contents.

**Acceptance criteria:**

- Reviewed QBR can be exported as markdown file.
- Export response includes file name, format, and safe relative path.
- Evidence appendix remains included.
- Tests validate file creation and no path traversal.

**Priority:** Medium

---

### S8-07 - Add Buffaly prepare-email handoff readiness

**User story:** As an account manager, I want reviewed customer email drafts to produce a structured handoff payload so Buffaly can prepare the email without sending automatically.

**Tasks:**

- Extend email handoff response with recipient suggestions from primary contacts.
- Add subject/body/bodyFormat fields aligned with Buffaly prepare-email result payload conventions.
- Require reviewed/approved status or return review-required warning.
- Keep no-send guardrails explicit.
- Add tests for handoff payload shape.

**Acceptance criteria:**

- Customer email draft handoff includes To suggestions, subject, body, and guardrails.
- No automatic send occurs.
- Draft status behavior is explicit.
- Tests cover reviewed and draft cases.

**Priority:** Medium

---
### S8-08 - Add deployment/environment validation script

**User story:** As a developer/operator, I want one validation command that checks Node, PostgreSQL, provider settings, seed health, and tests so pilot setup is repeatable.

**Tasks:**

- Add `scripts/validate-environment.js`.
- Check Node version, package install, database URL presence, database connectivity, and seed status.
- Run or recommend `npm test` and `npm run test:postgres`.
- Return machine-readable JSON plus readable summary.
- Document command in README.

**Acceptance criteria:**

- Validation script succeeds on current local dev environment.
- Missing database URL produces actionable message.
- No secrets are printed.
- README includes usage.

**Priority:** Medium

---

### S8-09 - Update UI for auth/connector/export readiness

**User story:** As a pilot tester, I want the UI to show auth mode, connector mode, export readiness, and email handoff readiness so I understand what is real, mock, or review-only.

**Tasks:**

- Add auth provider mode to status panel.
- Add connector diagnostics to Admin Integrations screen.
- Add reviewed/approved status cues for generated artifacts.
- Add export-to-file action for QBR artifacts if implemented.
- Add prepare-email handoff action copy that makes review-only behavior clear.

**Acceptance criteria:**

- UI distinguishes mock from real connector mode.
- UI explains local-demo auth mode.
- Review-only safeguards are visible.
- UI remains usable in JSON and PostgreSQL modes.

**Priority:** Medium

---

### S8-10 - Sprint 8 tests, docs, and demo script

**User story:** As a stakeholder, I want Sprint 8 to include clear tests and a pilot demo script so the new production-shaped seams can be evaluated safely.

**Tasks:**

- Expand API smoke tests for auth provider metadata.
- Expand tests for secret redaction and connector diagnostics.
- Expand tests for export-to-file and email handoff payload shape.
- Update README endpoint list and pilot setup notes.
- Add Sprint 8 demo script with mock-mode and optional real-mode branches.

**Acceptance criteria:**

- `npm test` passes.
- `npm run test:postgres` passes when configured.
- README documents Sprint 8 setup and limitations.
- Demo script includes no secrets.

**Priority:** High

## Suggested Sprint 8 Demo Script

1. Start OneOp2 in PostgreSQL mode.
2. Show auth/session provider mode in current-user response or UI.
3. Switch to admin demo user for local testing.
4. Open Admin Integrations and review PSA connector diagnostics.
5. Show mock connector mode and secret-status diagnostics.
6. Run PSA sync preview and apply safe selected rows.
7. Open Acme command center and generate a QBR draft.
8. Mark the QBR reviewed, link it to the account plan, and export it to markdown file.
9. Generate a customer email draft and show prepare-email handoff payload without sending.
10. Run validation script, `npm test`, and `npm run test:postgres`.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Real PSA connector scope expands too far | Limit Sprint 8 to connection/read diagnostics and safe preview paths |
| Secrets leak in logs or APIs | Use redaction tests and never echo secret values |
| Auth abstraction becomes over-engineered | Keep provider interface minimal and preserve demo provider |
| Export-to-file path traversal risk | Restrict exports to known output folder and sanitize file names |
| Email handoff could be mistaken for sending | Keep no-send guardrails and result naming explicit |
| Real connector tests become environment-dependent | Keep mock tests required and real tests optional/diagnostic |

## Definition of Done

- Sprint 8 tasks are implemented in committed batches.
- JSON smoke tests pass.
- PostgreSQL smoke tests pass when configured.
- Auth provider mode and connector mode are visible in diagnostics/UI.
- Secret values are never returned or logged.
- Real PSA connector spike is isolated and safe when unconfigured.
- QBR export and email handoff remain human-reviewed.
- README and demo script are updated.

## Sprint 9 Candidate Backlog

- Full production identity provider integration.
- Real PSA write-back enablement with field mapping approval.
- RMM read integration implementation.
- Microsoft 365/security integration implementation.
- Hosted deployment package and environment templates.
- Multi-tenant authorization and data isolation model.
- Management dashboard for account plan execution analytics.
