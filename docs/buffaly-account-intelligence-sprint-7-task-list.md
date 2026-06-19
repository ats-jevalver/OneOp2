# Buffaly Account Intelligence MVP - Sprint 7 Task List

## Sprint Goal

Turn OneOp2 from a PostgreSQL-backed demo application into a PSA pilot-ready account management workflow by adding real integration configuration foundations, a safer PSA synchronization/write-back path, an editable account plan experience, and the first relationship intelligence model.

Sprint 6 proved that OneOp2 can:

- Run against PostgreSQL as the active provider.
- Hydrate API reads from normalized PostgreSQL tables.
- Persist runtime workflow state in PostgreSQL.
- Expose provider/database status to testers.
- Support admin/non-admin demo user flows.
- Manage account plans and generated artifact review lifecycle.

Sprint 7 should make the application feel more like an operational tool for account managers and service leaders preparing for a limited PSA-connected pilot.

## Sprint Theme

**PSA pilot readiness and account plan execution.**

## Assumptions

- PostgreSQL remains the primary runtime provider for Sprint 7 validation.
- JSON provider remains supported for simple demos and smoke tests.
- Real vendor credentials may not be available in every development environment.
- External PSA writes must remain human-confirmed and auditable.
- Customer emails and customer-facing artifacts must remain review-only unless explicitly approved by a user.
- Sprint 7 should preserve the dependency-light Node/static UI approach unless a change is justified by a ticket.

## In Scope

1. Add secure integration configuration storage shape for PSA pilot settings.
2. Add PSA company/contact sync preview and import flow using mock/provider abstraction.
3. Add stronger PSA write-back confirmation and audit detail for tasks and notes.
4. Add editable account plan UI and API improvements for objectives, stakeholders, risks, and next steps.
5. Add relationship/contact engagement model and first contact timeline view.
6. Add generated artifact approval workflow improvements tied to account plans and PSA notes.
7. Add admin integration settings screen for provider status, sync preview, and sync execution.
8. Add PostgreSQL migrations/schema updates for Sprint 7 data.
9. Add tests for PSA pilot workflows, account plan editing, relationship intelligence, and RBAC.
10. Update docs and demo script for Sprint 7 pilot walkthrough.

## Out of Scope

- Full production OAuth/secret vault implementation.
- Multi-tenant production isolation.
- Real outbound customer email sending.
- Full RMM/security vendor production integrations.
- Automated deployment to cloud infrastructure.
- Billing, licensing, or commercial packaging.

## Sprint 7 Backlog

### S7-01 - Add integration configuration model for PSA pilot readiness

**User story:** As an administrator, I want a clear configuration model for PSA integration settings so OneOp2 can move from mock-only behavior toward a controlled pilot connection.

**Tasks:**

- Add `integration_configurations` or equivalent PostgreSQL-backed configuration model.
- Store non-secret configuration fields such as provider type, base URL, tenant/company identifier, enabled capabilities, and environment label.
- Keep credentials out of committed files and API responses.
- Add API endpoints to read and update non-secret integration configuration.
- Add validation for required PSA configuration fields.
- Add audit event when integration configuration changes.

**Acceptance criteria:**

- Admin can retrieve PSA integration configuration without exposing secrets.
- Admin can update non-secret PSA pilot settings.
- Non-admin users receive 403 for update attempts.
- Invalid configuration returns explicit validation errors.
- Configuration changes are auditable.

**Priority:** High

---

### S7-02 - Add PSA sync preview for companies and contacts

**User story:** As an administrator, I want to preview PSA company/contact sync results before importing so I can avoid duplicate or incorrect account mappings.

**Tasks:**

- Extend the PSA adapter interface with `previewCompanyContactSync`.
- Implement deterministic mock preview data for companies and contacts.
- Add endpoint `POST /api/v1/admin/integrations/:integrationConnectionId/sync-preview`.
- Include counts for new, matched, changed, skipped, and conflict rows.
- Include sample rows and mapping confidence details.
- Add RBAC enforcement for admin-only sync preview.

**Acceptance criteria:**

- Admin can request PSA sync preview.
- Response includes company/contact counts and sample records.
- Preview does not mutate account data.
- Non-admin requests return 403.
- Tests cover success, invalid integration, and RBAC denial.

**Priority:** High

---
### S7-03 - Add PSA company/contact import stub with mapping decisions

**User story:** As an administrator, I want to apply approved PSA sync preview results so account and contact data can be refreshed in a controlled way.

**Tasks:**

- Add endpoint `POST /api/v1/admin/integrations/:integrationConnectionId/sync/apply`.
- Require a preview or explicit request payload with selected row IDs.
- Upsert matched mock PSA company/contact records into PostgreSQL-backed tables.
- Record source identity mappings and match confidence.
- Create sync history and audit records.
- Keep JSON mode behavior deterministic for tests.

**Acceptance criteria:**

- Admin can apply selected sync preview rows.
- Applied rows update account/contact source mappings.
- Sync history records counts, actor, timestamp, and result.
- Conflicts are skipped unless explicitly confirmed.
- Tests prove no import occurs for non-admin users.

**Priority:** High

---

### S7-04 - Harden PSA write-back confirmation workflow

**User story:** As an account manager, I want PSA task/note write-backs to show exactly what will be sent so I can confirm safely and trust the audit trail.

**Tasks:**

- Add confirmation tokens or request fingerprints for PSA task/note preview results.
- Require confirmed writes to reference the preview fingerprint.
- Persist preview payload summary in audit state.
- Add richer audit fields for actor, source artifact, recommendation, adapter, target external ID, and request fingerprint.
- Improve validation error responses for missing PSA company mappings.
- Update UI confirmation modal copy.

**Acceptance criteria:**

- PSA task and note creation require a valid confirmed preview payload or fingerprint.
- Audit records can prove what the user reviewed before confirmation.
- Failed write-back attempts include actionable error details.
- Existing Sprint 3-6 write-back tests continue to pass after updates.

**Priority:** High

---

### S7-05 - Build editable account plan UI

**User story:** As an account manager, I want to edit account plan summary, objectives, risks, stakeholders, and next steps from the command center so the plan becomes a living workflow.

**Tasks:**

- Add edit controls to the Account Plan card.
- Support editing plan summary and status.
- Support adding/updating/completing next steps.
- Support adding/updating objectives and risks in a simple MVP form.
- Persist updates through the active provider.
- Show success/error states in the UI.

**Acceptance criteria:**

- User can update Acme account plan from the UI.
- API persists updates across page refreshes and app restarts in PostgreSQL mode.
- Invalid plan payloads show clear errors.
- Non-admin/account-manager permission behavior is documented and tested.

**Priority:** High

---

### S7-06 - Add relationship/contact engagement model

**User story:** As an account manager, I want to understand key contacts, engagement gaps, and relationship risk so I know who to involve before a QBR or renewal.

**Tasks:**

- Add PostgreSQL schema for contact engagement events or extend existing contacts/activity data.
- Seed engagement examples for Acme, Northstar, and Greenfield.
- Add derived fields for last touch, engagement level, role influence, and relationship risk.
- Add endpoint `GET /api/v1/accounts/:accountId/relationships`.
- Connect relationship risk to account command center insights.

**Acceptance criteria:**

- Relationship endpoint returns contacts grouped by stakeholder role/influence.
- At least one account shows a relationship risk signal.
- Command center can surface a relationship insight without breaking existing layout.
- Tests cover seeded engagement output.

**Priority:** Medium

---
### S7-07 - Add contact timeline and relationship UI card

**User story:** As an account manager, I want to see recent stakeholder engagement on the command center so I can prepare for customer conversations.

**Tasks:**

- Add Relationship card to the command center UI.
- Show key stakeholders, last touch date, and engagement status.
- Show contact timeline entries for meetings, tickets, emails, QBRs, or notes using seeded data.
- Add empty state for accounts with no engagement history.
- Add quick action to create a next step from a relationship gap.

**Acceptance criteria:**

- UI displays relationship data for Acme.
- UI highlights at least one relationship gap/risk.
- Empty state is readable for sparse accounts.
- Relationship data does not expose unsupported personal data beyond seeded demo fields.

**Priority:** Medium

---

### S7-08 - Tie generated artifacts to account plan execution

**User story:** As an account manager, I want approved QBRs, account briefs, and email drafts to connect back to account plan objectives so generated work products support the plan.

**Tasks:**

- Add optional `accountPlanObjectiveId` and/or `nextStepId` references to generated artifacts.
- Add artifact list filters by status and linked account plan item.
- Add API support for linking/unlinking artifacts to account plan items.
- Show linked artifacts in the Account Plan card.
- Preserve evidence appendix and review lifecycle behavior from Sprint 6.

**Acceptance criteria:**

- A generated QBR can be linked to an account plan objective.
- Account plan response includes linked artifact summaries.
- Artifact status updates remain persisted and tested.
- Linked artifacts appear in the UI in a useful place.

**Priority:** Medium

---

### S7-09 - Add admin integration settings screen

**User story:** As an administrator, I want one screen to review provider status, integration configuration, sync preview, and sync execution so I can operate the pilot safely.

**Tasks:**

- Add Admin/Integrations navigation entry or extend existing admin UI.
- Show active store provider and database status.
- Show integration capabilities and configuration status.
- Add sync preview action with counts and warnings.
- Add sync apply action gated behind confirmation.
- Show RBAC-disabled state for non-admin users.

**Acceptance criteria:**

- Admin can use UI to preview sync results.
- Admin can see configuration completeness without secrets.
- Non-admin users see a clear permission message.
- UI does not expose connection secrets.

**Priority:** Medium

---

### S7-10 - Add Sprint 7 schema migration and seed updates

**User story:** As a developer, I want schema and seed updates for Sprint 7 data so local environments can be reset and tested consistently.

**Tasks:**

- Update `db/schema.sql` with Sprint 7 tables/columns.
- Update seed loader for relationship data, integration configuration, sync history, and artifact links.
- Ensure seed scripts are idempotent.
- Add reset/reseed instructions if commands change.
- Validate local PostgreSQL database after migration.

**Acceptance criteria:**

- Fresh database can be created and seeded from scratch.
- Existing local database can be reset/reseeded for Sprint 7 testing.
- `npm run test:postgres` passes after migration.
- No credentials are committed.

**Priority:** High

---

### S7-11 - Expand automated tests for pilot workflows

**User story:** As a developer, I want tests that cover the PSA pilot workflow and account plan execution so Sprint 7 can be validated quickly.

**Tasks:**

- Add API smoke tests for integration configuration read/update.
- Add API smoke tests for sync preview/apply.
- Add API smoke tests for account plan edits and artifact linking.
- Add API smoke tests for relationships endpoint.
- Add RBAC tests for admin-only endpoints.
- Keep JSON and PostgreSQL mode test coverage aligned where practical.

**Acceptance criteria:**

- `npm test` passes.
- `npm run test:postgres` passes when PostgreSQL is configured.
- Tests verify admin and non-admin behavior.
- Tests verify no secret values appear in API responses.

**Priority:** High

---

### S7-12 - Documentation and Sprint 7 pilot demo script

**User story:** As a tester or stakeholder, I want a clear Sprint 7 walkthrough so I can evaluate PSA pilot readiness without guessing which flows to run.

**Tasks:**

- Update README current feature list and endpoint list.
- Add Sprint 7 pilot setup notes.
- Add admin/non-admin test instructions.
- Add demo script for integration configuration, sync preview, account plan editing, relationship review, QBR approval, and PSA note write-back.
- Document limitations and production gaps remaining after Sprint 7.

**Acceptance criteria:**

- README accurately describes Sprint 7 behavior.
- Demo script can be followed from a clean local setup.
- Known limitations are explicit.
- No secrets are documented.

**Priority:** Medium

## Suggested Sprint 7 Demo Script

1. Start OneOp2 in PostgreSQL mode.
2. Switch to admin demo user.
3. Open Admin/Integrations and verify provider/database status.
4. Review PSA integration configuration completeness.
5. Run PSA company/contact sync preview and inspect match/conflict counts.
6. Apply selected safe sync rows and show sync audit history.
7. Switch to account manager demo user.
8. Open Acme command center and review account plan plus relationship card.
9. Edit an account plan next step or objective.
10. Generate a QBR draft, link it to an account plan objective, mark it reviewed/approved, and export markdown with evidence appendix.
11. Preview a PSA note write-back from the approved artifact and confirm the stub write-back.
12. Show write-back audit history proving what was reviewed and confirmed.
13. Run `npm test` and `npm run test:postgres`.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| PSA pilot scope expands into full production integration | Keep Sprint 7 focused on configuration, preview, controlled import, and audited stubs |
| Sync apply creates duplicate accounts or contacts | Require preview, confidence scoring, selected rows, and conflict skip behavior |
| Credentials leak through settings APIs | Store only non-secret config in normal app tables; never return secrets in API responses |
| Account plan editing becomes too complex | Keep MVP forms simple: summary, status, objectives, risks, stakeholders, next steps |
| Relationship intelligence lacks enough source data | Use seeded engagement events and clearly mark derived/demo fields |
| UI grows crowded | Add focused cards and admin screen rather than overloading the command center |
| Tests become slow/flaky across providers | Keep deterministic mock adapter and idempotent seed/reset behavior |

## Definition of Done

- Sprint 7 implementation is delivered in small committed batches.
- JSON smoke tests pass.
- PostgreSQL smoke tests pass when local PostgreSQL is configured.
- Admin/non-admin RBAC is validated for new endpoints.
- PSA sync preview/apply flows are auditable and non-secret.
- Account plan edits persist in PostgreSQL mode.
- Relationship data is visible in API and UI.
- Generated artifacts can be linked to account plan execution.
- README and demo script are updated.
- No credentials are committed or displayed.

## Sprint 8 Candidate Backlog

- Real PSA API connector spike using stored user-provided credentials.
- Production authentication and user/session model.
- RMM integration read spike for device health and patch gaps.
- Security/Microsoft 365 integration read spike for coverage and risk signals.
- QBR export to PDF or PowerPoint.
- Buffaly prepare-email handoff with reviewed customer email draft.
- Deployment packaging and environment configuration.
- Multi-tenant architecture design.
- Advanced account plan analytics and management review dashboard.
