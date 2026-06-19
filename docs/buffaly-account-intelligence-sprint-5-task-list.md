# Buffaly Account Intelligence MVP - Sprint 5 Task List

## Sprint Goal

Move OneOp2 from a durable local-demo MVP toward an integration-ready operator tool by adding the first production-shaped persistence and integration seams: PostgreSQL schema/migration planning, real PSA write-back adapter contracts, sync hardening, and customer-facing artifact handoff requirements.

Sprint 5 should keep the app demoable while creating clear seams for replacing Sprint 4 mock/local components with production infrastructure.

## Sprint Theme

**Integration-ready foundation.**

Sprint 4 proved durable runtime workflow state with a local JSON store and mock PSA adapter. Sprint 5 should introduce production-shaped boundaries without overbuilding:

- Database migration path from JSON store to PostgreSQL.
- Real PSA adapter interface and configuration contract.
- Safer sync/write-back behavior with auditability.
- First export/handoff flows for QBR and customer email artifacts.
- Authentication/RBAC preparation for production use.

## Assumptions

- The app remains a dependency-light Node.js MVP unless a specific implementation task adds a dependency.
- Existing Sprint 1-4 API contracts should remain backward compatible.
- Real vendor credentials are not required for this sprint; adapter contracts and test doubles are acceptable unless credentials are explicitly provided.
- PostgreSQL does not need to run in production during the sprint, but schema, migration scripts, and repository seams should be ready for local validation.
- All write-back and sync actions must remain auditable.

## In Scope

1. PostgreSQL migration design and starter implementation.
2. Repository abstraction updates so persistence can use either local JSON or PostgreSQL.
3. PSA adapter contract hardening for task and note creation.
4. PSA sync contract for companies, contacts, and tickets.
5. RMM/security read integration spike interfaces.
6. QBR and customer email handoff/export requirements.
7. Account plan and contact relationship model design.
8. Authentication/RBAC implementation plan and first middleware seam.
9. Tests and documentation updates.

## Out of Scope

- Full production deployment.
- Multi-tenant billing or subscription management.
- Real-time background job orchestration beyond deterministic sync stubs.
- Sending customer email directly from the app.
- Full PDF/PowerPoint rendering if it requires a heavy rendering stack.
- Direct storage of vendor credentials in source code.

## Sprint 5 Backlog

### S5-01 - Create PostgreSQL migration plan and schema scripts

**User story:** As a product owner, I want a clear PostgreSQL migration path so OneOp2 can move beyond local JSON persistence safely.

**Tasks:**

- Create `docs/buffaly-account-intelligence-postgresql-migration-plan.md`.
- Create initial SQL schema script under `db/schema.sql`.
- Map existing seed/static entities and Sprint 4 runtime store collections to database tables.
- Define migration order, rollback notes, and local setup assumptions.
- Identify which fields need indexes for account search, recommendation filtering, generated artifacts, and audit history.

**Acceptance criteria:**

- Schema covers accounts, contacts, integrations, external identities, health scores, recommendations, evidence, generated artifacts, write-back audit events, activities, settings, and mapping decisions.
- README documents how the schema is intended to be used.
- Existing tests continue to pass.

**Priority:** High

---

### S5-02 - Add persistence provider boundary

**User story:** As a developer, I want persistence behind a provider interface so the app can switch from JSON store to PostgreSQL without rewriting API handlers.

**Tasks:**

- Refactor `src/repositories/store.js` into a provider-oriented API if needed.
- Add a provider selector via environment variable such as `ONEOP2_STORE_PROVIDER=json|postgres`.
- Keep JSON as the default provider.
- Add placeholder/postgres provider module with explicit not-configured diagnostics if a database connection is unavailable.
- Document provider behavior.

**Acceptance criteria:**

- JSON persistence remains fully functional.
- App fails fast with a clear message if `postgres` is selected without required config.
- Tests verify default JSON provider behavior.

**Priority:** High

---

### S5-03 - Harden PSA task and note adapter contract

**User story:** As an account manager, I want task/note write-back behavior to match a real PSA contract so work created in OneOp2 can be safely synchronized later.

**Tasks:**

- Define a PSA adapter interface with typed methods for `createTask`, `createNote`, and `getStatus`.
- Require external account/company mapping before write-back.
- Validate required fields before adapter calls.
- Add deterministic external IDs for mock responses.
- Improve audit events with request summary, response summary, adapter name, status, and error details.

**Acceptance criteria:**

- Existing PSA task and note endpoints still work.
- Missing mapping or required fields returns explicit validation errors.
- Audit history records both successful and failed write-back attempts.
- Tests cover at least one success and one validation failure.

**Priority:** High

---

### S5-04 - Define PSA company/contact/ticket sync contracts

**User story:** As an operations lead, I want predictable PSA sync contracts so account and service data can be refreshed from PSA without corrupting account identity mappings.

**Tasks:**

- Add documentation for inbound PSA sync payloads.
- Define canonical matching rules for company, contact, agreement, renewal, and ticket records.
- Add sync preview endpoint specification before destructive/import behavior.
- Extend integration sync stub response with counts for created, updated, skipped, and needs-review records.
- Add test coverage for sync response shape.

**Acceptance criteria:**

- Sync docs define source ID, display name, domain, and account matching behavior.
- Sync endpoint returns a deterministic preview-style summary.
- No sync action silently overwrites confirmed mappings.

**Priority:** High

---

### S5-05 - Add RMM and security read integration spike contracts

**User story:** As a service/security leader, I want RMM and security adapter seams so OneOp2 can eventually pull live device and security posture signals.

**Tasks:**

- Define adapter interfaces for RMM device health and security findings/coverage.
- Document minimum normalized fields for device risk, alert severity, coverage status, and evidence links.
- Add integration status endpoints or extend existing status payloads to show supported capabilities.
- Keep seeded data as the active demo source.

**Acceptance criteria:**

- Docs identify normalized fields and source-specific mapping notes.
- Integration status includes PSA, RMM, and security capability summaries.
- No existing command-center behavior regresses.

**Priority:** Medium

---

### S5-06 - Design QBR export handoff

**User story:** As an account manager, I want a QBR draft that can be exported or handed off so customer review preparation is faster.

**Tasks:**

- Document export options: markdown download, PDF, PowerPoint, and Buffaly-generated deck handoff.
- Add an artifact export endpoint specification.
- Add a lightweight markdown export endpoint if feasible.
- Ensure generated artifact evidence remains traceable.

**Acceptance criteria:**

- QBR draft includes artifact body and evidence references.
- Export/handoff API shape is documented.
- If implemented, markdown export returns a usable markdown payload.

**Priority:** Medium

---

### S5-07 - Design customer email prepare/send handoff

**User story:** As a sales rep, I want a generated customer email draft that can be reviewed before sending so I can communicate risks and next steps safely.

**Tasks:**

- Define email draft review states: draft, reviewed, approved, sent externally.
- Add endpoint spec for prepare-send handoff.
- Document guardrails: no direct send without human approval, evidence-linked claims only, tone control.
- Optionally add API response shape compatible with a future Buffaly `prepare email` UI card.

**Acceptance criteria:**

- Email artifact model supports review status.
- Documentation clearly separates draft generation from actual sending.
- Tests cover customer email draft generation still working.

**Priority:** Medium

---

### S5-08 - Add account plan and relationship/contact engagement model design

**User story:** As an account team member, I want account planning and relationship context so recommendations can become coordinated account motions.

**Tasks:**

- Extend data model docs with account plans, objectives, stakeholders, relationship strength, meetings, and next steps.
- Define API endpoints for account plan retrieval/update.
- Identify UI placement on the Account Command Center.
- Add seed examples for one strategic account if implementation time allows.

**Acceptance criteria:**

- Data model doc or Sprint 5 companion doc defines account plan entities.
- API specification lists planned account plan endpoints.
- Future sprint implementation tasks are clear.

**Priority:** Medium

---

### S5-09 - Add authentication and RBAC middleware seam

**User story:** As an administrator, I want role-based enforcement to be explicit so production deployment can safely limit write-back/admin actions.

**Tasks:**

- Add middleware seam for current-user resolution.
- Move existing role checks behind named authorization helpers.
- Document roles and permissions by endpoint class.
- Add tests for one allowed and one forbidden admin/write-back path.

**Acceptance criteria:**

- Existing default demo user still works.
- Forbidden responses use a consistent error shape.
- README documents demo auth limitations.

**Priority:** High

---

### S5-10 - Update API smoke tests and README

**User story:** As a developer/tester, I want clear tests and docs so I can validate Sprint 5 behavior quickly.

**Tasks:**

- Update `tests/api.test.js` for Sprint 5 contract changes.
- Update README expected test output to Sprint 5.
- Add new endpoints to README if implemented.
- Add manual test checklist.

**Acceptance criteria:**

- `npm test` passes.
- README accurately describes Sprint 5 features and setup.
- New docs are committed under `docs/`.

**Priority:** High

## Suggested Sprint 5 Demo Script

1. Start the app with default JSON persistence.
2. Search for `acme` and open the Account Command Center.
3. Create or preview a PSA task/note and show improved audit details.
4. Generate a QBR draft and customer email draft.
5. Show the integration status response with PSA/RMM/security capabilities.
6. Show the PostgreSQL migration plan and schema script.
7. Run `npm test` and confirm Sprint 5 smoke tests pass.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| PostgreSQL work expands too far | Keep JSON default; add schema/provider seam first |
| Real PSA integrations require vendor-specific credentials | Define adapter contract and mock deterministic behavior first |
| Write-back actions could be unsafe | Require validation, mapping, audit trail, and human-triggered actions |
| Export features could introduce heavy dependencies | Start with markdown/export contract before PDF/PowerPoint |
| RBAC could block demo workflows | Keep explicit default demo user and document limitations |

## Definition of Done

- Sprint 5 planning doc is committed under `docs/`.
- Any implemented Sprint 5 code is covered by smoke tests.
- README reflects the current sprint and validation command.
- All changes are committed and pushed to GitHub.
- Existing Sprint 1-4 demo flows remain functional.
