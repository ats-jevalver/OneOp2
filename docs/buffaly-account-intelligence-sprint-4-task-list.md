
# Sprint 4 Task List: Buffaly Account Intelligence Platform MVP

## 1. Sprint Goal

Make OneOp2 durable and integration-ready.

Sprint 1 created the account shell. Sprint 2 added evidence-backed intelligence. Sprint 3 made intelligence actionable through stubbed task creation, generated briefs, portfolio views, and mapping admin workflows. Sprint 4 should replace fragile runtime-only state with persistence foundations and prepare the product for real PSA integration and richer generated artifacts.

By the end of Sprint 4, a user/team should be able to:

1. Restart the app without losing generated artifacts, write-back audit events, recommendation status changes, and mapping decisions.
2. Use a persistent repository layer instead of direct in-memory mutation.
3. Configure a basic PSA integration profile and field mapping stub.
4. Run a real-or-mocked PSA company/ticket sync adapter behind a clean interface.
5. Generate a PSA note draft from an account brief.
6. Generate a first QBR draft and customer email draft as saved artifacts.
7. Use portfolio filters by owner and date range.
8. See basic user/role permission boundaries in the UI and API.
9. Use first assistant-style suggested prompts from the Account Command Center.

## 2. Recommended Sprint Length

2 weeks.

## 3. Sprint 4 Product Outcome

OneOp2 moves from a strong prototype to a durable MVP foundation.

The product value loop becomes persistent and integration-ready:

Account intelligence -> recommendation -> approved action -> persisted audit trail -> generated artifact -> integration-ready PSA workflow.

## 4. Sprint 4 Scope

### In Scope
- Lightweight persistence layer.
- Repository abstraction for accounts, recommendations, artifacts, audit events, activities, and mappings.
- Startup seed/migration path.
- Persistence for generated artifacts, write-back audit events, activities, recommendation statuses, and mapping decisions.
- Basic PSA integration adapter interface.
- Mock PSA adapter and optional real PSA adapter spike.
- PSA field mapping settings stub.
- PSA note draft from generated account brief.
- First QBR draft artifact generator.
- First customer email draft generator.
- Portfolio filters by owner and date range.
- Basic current-user/role model enforcement in API and UI.
- Assistant suggested prompts panel.
- Expanded tests.
- README/docs updates.
- Sprint 4 demo script.

### Out of Scope
- Production-grade database migrations.
- Multi-tenant SaaS isolation.
- Full OAuth flow.
- Real email sending.
- Full QBR slide deck/PDF export.
- Full CRM/opportunity workflow.
- Production RBAC policy system.
- Advanced AI orchestration beyond deterministic assistant prompt shortcuts.

## 5. Sprint 4 Assumptions

- A lightweight local JSON or SQLite persistence layer is acceptable for Sprint 4 if PostgreSQL is not yet selected.
- The API should be designed so the persistence implementation can later be swapped for PostgreSQL.
- Real PSA work can start as an adapter spike but must not destabilize the demo.
- Mock PSA behavior should remain available for tests and demos.
- Role enforcement can be simple and explicit for this sprint.

## 6. Sprint 4 Backlog Summary

### Persistence Foundation
- S4-001 Choose and document Sprint 4 persistence approach.
- S4-002 Add repository abstraction layer.
- S4-003 Persist generated artifacts and activity timeline.
- S4-004 Persist write-back audit events.
- S4-005 Persist recommendation status changes.
- S4-006 Persist mapping confirm/reject decisions.
- S4-007 Add startup seed/migration behavior.

### PSA Integration Readiness
- S4-008 Add PSA adapter interface.
- S4-009 Add mock PSA adapter implementation.
- S4-010 Add PSA field mapping settings stub.
- S4-011 Add real PSA company/ticket sync spike behind feature flag.
- S4-012 Add PSA note draft from generated account brief.

### Generated Artifacts
- S4-013 Add QBR draft generator.
- S4-014 Add customer email draft generator.
- S4-015 Add artifact type filters and artifact actions in UI.

### Portfolio, Roles, and Assistant
- S4-016 Add portfolio filters by owner and date range.
- S4-017 Add basic current user and role enforcement.
- S4-018 Add assistant suggested prompts panel.
- S4-019 Add assistant prompt actions for call prep, risk explanation, and next actions.

### Quality and Delivery
- S4-020 Expand API tests for persistence and PSA adapter behavior.
- S4-021 Expand UI smoke tests for persistence, filters, and assistant prompts.
- S4-022 Update README and architecture docs.
- S4-023 Create Sprint 4 demo script.

## 7. Detailed Sprint Tickets

## S4-001: Choose and Document Sprint 4 Persistence Approach

### Type
Architecture / Product Engineering

### User Story
As an engineering team, we need to choose a lightweight persistence approach so that Sprint 3 runtime state survives app restarts without overbuilding the database layer.

### Options
- JSON file persistence for fastest local MVP durability.
- SQLite for local relational persistence.
- PostgreSQL if environment and deployment path are ready.

### Recommended Sprint 4 Decision
Use a repository abstraction and a JSON-file or SQLite implementation for Sprint 4. Keep interfaces compatible with later PostgreSQL migration.

### Tasks
- Compare JSON file, SQLite, and PostgreSQL tradeoffs.
- Choose Sprint 4 implementation.
- Document storage path/configuration.
- Document data reset behavior.
- Document future PostgreSQL migration path.

### Acceptance Criteria
- Persistence approach is documented in README or architecture doc.
- Team understands what persists and what remains seeded/static.
- Future database migration is not blocked by Sprint 4 implementation.

### Dependencies
None.

### Estimate
2 points.

## S4-002: Add Repository Abstraction Layer

### Type
Backend / Architecture

### User Story
As an engineer, I want data access behind repositories so that the app can move from in-memory data to durable persistence without rewriting API handlers.

### Tasks
- Create repository module/folder.
- Add AccountRepository read helpers.
- Add RecommendationRepository read/update helpers.
- Add ArtifactRepository create/list/get helpers.
- Add AuditRepository create/list helpers.
- Add ActivityRepository create/list helpers.
- Add MappingRepository confirm/reject helpers.
- Refactor API handlers to call repositories for mutable state.

### Acceptance Criteria
- Existing API behavior remains unchanged.
- Generated artifacts use repository create/list/get.
- Write-back audit events use repository create/list.
- Recommendation status changes use repository update.
- Mapping confirm/reject uses repository update.
- Tests still pass.

### Dependencies
S4-001.

### Estimate
8 points.

## S4-003: Persist Generated Artifacts and Activity Timeline

### Type
Backend / Persistence

### User Story
As a user, I want generated account briefs and activity entries to remain after restart so that account work is not lost.

### Tasks
- Persist generated artifacts.
- Persist generated artifact activity entries.
- Load persisted artifacts on startup.
- Ensure artifact list/retrieve endpoints read from persistence.
- Ensure activity timeline includes persisted artifact activities.

### Acceptance Criteria
- Generate account brief.
- Restart app.
- Generated artifact still appears in account artifacts and activity timeline.
- Artifact body can still be retrieved.

### Dependencies
S4-002.

### Estimate
5 points.

## S4-004: Persist Write-Back Audit Events

### Type
Backend / Persistence / Governance

### User Story
As a user or admin, I want write-back audit events to survive restart so that action history remains traceable.

### Tasks
- Persist write-back audit events.
- Load persisted audit events on startup.
- Ensure audit endpoint reads persisted events.
- Ensure activity timeline includes persisted audit events.

### Acceptance Criteria
- Create stub PSA task.
- Restart app.
- Write-back audit event still appears.
- Activity timeline still shows task creation event.

### Dependencies
S4-002.

### Estimate
3 points.

## S4-005: Persist Recommendation Status Changes

### Type
Backend / Persistence

### User Story
As a user, I want recommendation status changes to persist so that completed/dismissed/converted recommendations do not reappear after restart.

### Tasks
- Persist recommendation status overlays or full records.
- Load recommendation status updates on startup.
- Ensure list recommendations endpoint reflects persisted statuses.
- Ensure task creation status change persists.

### Acceptance Criteria
- Convert Acme QBR recommendation to task.
- Restart app.
- Recommendation remains converted_to_task.
- New recommendation list excludes converted recommendation when filtering status=new.

### Dependencies
S4-002.

### Estimate
5 points.

## S4-006: Persist Mapping Confirm/Reject Decisions

### Type
Backend / Persistence / Admin

### User Story
As an admin, I want mapping decisions to persist so that confirmed/rejected source identities do not return to needs-review after restart.

### Tasks
- Persist mapping status changes.
- Load mapping decisions on startup.
- Ensure mapping suggestions endpoint reflects persisted decisions.
- Ensure account warnings reflect persisted mapping state.

### Acceptance Criteria
- Confirm Riverbend mapping.
- Restart app.
- Riverbend mapping suggestion no longer appears.
- Riverbend warning no longer appears.

### Dependencies
S4-002.

### Estimate
5 points.

## S4-007: Add Startup Seed/Migration Behavior

### Type
Backend / Data Initialization

### User Story
As a developer, I want predictable startup behavior so that seeded demo data and persisted runtime data are both handled safely.

### Tasks
- Add startup initialization routine.
- Seed baseline data if persistence file/database is missing.
- Do not duplicate seeded records on restart.
- Add reset command or environment variable for demo reset.
- Log startup persistence status.

### Acceptance Criteria
- Fresh app start creates required data store.
- Restart does not duplicate data.
- Reset command restores demo baseline.
- README documents reset behavior.

### Dependencies
S4-001.
S4-002.

### Estimate
5 points.

## S4-008: Add PSA Adapter Interface

### Type
Backend / Integration Architecture

### User Story
As an engineer, I want a PSA adapter interface so that stubbed and real PSA behavior can share the same API workflow.

### Tasks
- Define PSA adapter methods:
  - listCompanies.
  - listTickets.
  - createTask.
  - createNote.
  - getConnectionStatus.
- Refactor Sprint 3 task creation to call adapter.
- Support adapter selection by config/env.

### Acceptance Criteria
- Mock adapter can create task using existing stub behavior.
- API handlers do not directly create PSA stub external IDs.
- Future real PSA adapter can implement same interface.

### Dependencies
S4-002.

### Estimate
5 points.

## S4-009: Add Mock PSA Adapter Implementation

### Type
Backend / Integration

### User Story
As a developer, I want a mock PSA adapter so that tests and demos remain safe while real PSA integration is being built.

### Tasks
- Implement mock listCompanies.
- Implement mock listTickets.
- Implement mock createTask.
- Implement mock createNote.
- Implement mock connection status.
- Use mock adapter in tests by default.

### Acceptance Criteria
- Existing task creation flow works through mock adapter.
- Mock adapter returns stable external IDs/URLs.
- Tests do not require external credentials.

### Dependencies
S4-008.

### Estimate
3 points.

## S4-010: Add PSA Field Mapping Settings Stub

### Type
Backend + Admin / Integration Configuration

### User Story
As an admin, I want to define required PSA field mapping placeholders so that real write-back can be configured safely later.

### Tasks
- Add PSA field mapping settings object.
- Include task type/status/priority/default board/default owner fields.
- Add GET settings endpoint.
- Add PATCH settings endpoint.
- Add UI placeholder in admin area.

### Acceptance Criteria
- Admin can view PSA field mapping settings.
- Admin can update stub settings in current persistence layer.
- Task preview includes mapped defaults where applicable.

### Dependencies
S4-002.
S4-008.

### Estimate
5 points.

## S4-011: Add Real PSA Company/Ticket Sync Spike Behind Feature Flag

### Type
Backend / Integration Spike

### User Story
As an engineer, I want a safely isolated real PSA sync spike so that we can validate the adapter architecture without risking the demo.

### Tasks
- Add feature flag for real PSA adapter.
- Add credential/config validation without logging secrets.
- Implement read-only listCompanies spike if credentials are available.
- Implement read-only listTickets spike if credentials are available.
- Keep mock adapter as default.
- Document setup requirements.

### Acceptance Criteria
- App works with mock adapter when real credentials are absent.
- Real adapter code path is isolated behind feature flag.
- Failed real sync returns actionable error without breaking demo.

### Dependencies
S4-008.
S4-009.

### Estimate
8 points.

## S4-012: Add PSA Note Draft from Generated Account Brief

### Type
Backend + UI / Workflow

### User Story
As an account manager, I want to convert a generated account brief into a PSA note draft so that account research can be logged back to the PSA.

### APIs
```http
POST /api/v1/accounts/{accountId}/psa/notes/preview
POST /api/v1/accounts/{accountId}/psa/notes
```

### Tasks
- Add note preview endpoint from generated artifact.
- Add note creation stub through PSA adapter.
- Add note write-back audit event.
- Add UI action on generated brief preview.
- Label as stubbed PSA note until real adapter is ready.

### Acceptance Criteria
- Generate Acme account brief.
- Preview PSA note from brief.
- Confirm note creation stub.
- Audit/activity entry appears.

### Dependencies
S4-008.
S4-009.
S4-003.
S4-004.

### Estimate
5 points.

## S4-013: Add QBR Draft Generator

### Type
Backend + UI / Artifact Generation

### User Story
As an account manager, I want a first QBR draft so that account intelligence can be turned into a structured customer review artifact.

### API
```http
POST /api/v1/accounts/{accountId}/artifacts/qbr-draft
```

### Tasks
- Generate deterministic markdown QBR draft.
- Include executive summary.
- Include service performance.
- Include RMM/endpoint health.
- Include security posture.
- Include renewal context.
- Include recommendations and next steps.
- Include evidence appendix.
- Add UI button and preview support.

### Acceptance Criteria
- Acme QBR draft includes service/RMM/security/recommendations/evidence.
- QBR draft is saved as generated artifact.
- QBR draft appears in artifact list and activity timeline.

### Dependencies
S4-003.
Sprint 2 account intelligence data.

### Estimate
5 points.

## S4-014: Add Customer Email Draft Generator

### Type
Backend + UI / Artifact Generation

### User Story
As an account manager, I want to draft a customer-facing email from a recommendation so that I can communicate risk or next steps quickly.

### API
```http
POST /api/v1/accounts/{accountId}/artifacts/customer-email-draft
```

### Tasks
- Generate deterministic customer email draft from recommendation.
- Support email types: QBR invitation, renewal follow-up, security risk explanation, lifecycle discussion.
- Include subject and body.
- Save as generated artifact.
- Add UI action from recommendation card.
- Keep send action out of scope.

### Acceptance Criteria
- Acme MFA recommendation can generate security risk email draft.
- Greenfield renewal recommendation can generate renewal follow-up email draft.
- Email draft is saved and appears in activity timeline.
- UI clearly labels draft-only, not sent.

### Dependencies
S4-003.
Sprint 2 recommendations/evidence.

### Estimate
5 points.

## S4-015: Add Artifact Type Filters and Artifact Actions in UI

### Type
Frontend / UX

### User Story
As a user, I want to filter generated artifacts and take simple actions so that briefs, QBRs, and email drafts are easy to find.

### Tasks
- Add artifact list section or tab.
- Filter by artifact type.
- Open artifact preview.
- Copy artifact body.
- View artifact evidence.
- Trigger PSA note draft for account brief.

### Acceptance Criteria
- User can filter to account briefs.
- User can filter to QBR drafts.
- User can filter to customer email drafts.
- User can copy any artifact body.

### Dependencies
S4-003.
S4-012.
S4-013.
S4-014.

### Estimate
5 points.

## S4-016: Add Portfolio Filters by Owner and Date Range

### Type
Backend + Frontend / Portfolio

### User Story
As a manager, I want to filter portfolio views by owner and date range so that I can manage my team/book of business.

### Tasks
- Add ownerUserId filter to portfolio APIs.
- Add days/date range filter where applicable.
- Add UI controls for owner and date range.
- Preserve default views.

### Acceptance Criteria
- Portfolio At Risk can filter by owner.
- Portfolio Renewals can filter by days/date range.
- Portfolio Expansion Candidates can filter by owner.
- UI shows active filter state.

### Dependencies
Sprint 3 portfolio views.

### Estimate
5 points.

## S4-017: Add Basic Current User and Role Enforcement

### Type
Backend + Frontend / Security

### User Story
As a product owner, I want basic role boundaries so that admin and write-back workflows are not presented as universally available.

### Tasks
- Add current user stub/config.
- Add role helper functions.
- Restrict admin mapping/settings endpoints to admin role.
- Restrict write-back actions to allowed roles.
- Hide or disable UI actions based on role.
- Add tests for forbidden access.

### Acceptance Criteria
- Viewer cannot create PSA task.
- Viewer cannot confirm/reject mapping.
- Admin can access mapping admin.
- Account manager can create stub PSA task.
- UI reflects current role limitations.

### Dependencies
S4-002.

### Estimate
8 points.

## S4-018: Add Assistant Suggested Prompts Panel

### Type
Frontend / UX

### User Story
As a user, I want suggested prompts in the Account Command Center so that I know what Buffaly can help me do next.

### Suggested Prompts
- Prepare me for my call.
- Why is this account marked this way?
- What should I discuss in the QBR?
- Draft a customer email from this recommendation.
- Create a PSA task from the top recommendation.
- What changed recently?

### Tasks
- Add assistant prompt panel.
- Display account-scoped suggested prompts.
- Wire prompts to deterministic local actions where available.
- Use existing endpoints for account brief, QBR draft, email draft, task preview, and evidence.

### Acceptance Criteria
- Prompt panel appears on Account Command Center.
- Clicking “Prepare me for my call” generates or displays call prep summary.
- Clicking “What should I discuss in the QBR?” triggers QBR draft preview or guidance.

### Dependencies
S4-013.
S4-014.

### Estimate
5 points.

## S4-019: Add Assistant Prompt Actions for Call Prep, Risk Explanation, and Next Actions

### Type
Backend + Frontend / Assistant UX

### User Story
As a user, I want simple assistant-style prompt actions so that account intelligence is easier to consume.

### API Option
```http
POST /api/v1/accounts/{accountId}/assistant/ask
```

### Tasks
- Implement deterministic assistant responses for selected prompts.
- Route supported prompts to existing data/actions.
- Return message, evidence, and suggested actions.
- Add UI rendering for assistant response.

### Acceptance Criteria
- “Prepare me for my call” returns account-specific summary.
- “Why is this account marked Watch/At Risk/etc.” returns health drivers and evidence links.
- “What should I do next?” returns recommendations.

### Dependencies
S4-018.
Sprint 2 health/recommendations/evidence.

### Estimate
5 points.

## S4-020: Expand API Tests for Persistence and PSA Adapter Behavior

### Type
Quality / Backend

### User Story
As an engineer, I want tests for persistence and adapter behavior so that Sprint 4 durability work is reliable.

### Tests
- Generated artifact persists across app/repository reload.
- Audit event persists across app/repository reload.
- Recommendation status persists.
- Mapping decision persists.
- Mock PSA adapter createTask works.
- PSA note preview/create stub works.
- QBR draft generation works.
- Customer email draft generation works.
- Portfolio filters work.
- Role restrictions work.

### Acceptance Criteria
- Sprint 1-3 tests still pass.
- New persistence tests pass.
- Mock adapter tests pass.
- Forbidden role tests pass.

### Dependencies
S4-001 through S4-019.

### Estimate
8 points.

## S4-021: Expand UI Smoke Tests for Persistence, Filters, and Assistant Prompts

### Type
Quality / Frontend

### User Story
As an engineer, I want UI smoke tests for Sprint 4 flows so that durable workflows remain reliable.

### Flow to Test
1. Generate account brief.
2. Restart/reload app and verify brief remains.
3. Create PSA task and verify audit remains.
4. Use portfolio owner/date filters.
5. Generate QBR draft.
6. Generate customer email draft.
7. Use assistant suggested prompt.
8. Verify role-based admin/write-back visibility.

### Acceptance Criteria
- UI smoke tests cover persistence-visible behavior.
- Portfolio filters are tested.
- Assistant prompt panel is tested.

### Dependencies
S4-003 through S4-019.

### Estimate
8 points.

## S4-022: Update README and Architecture Docs

### Type
Documentation

### User Story
As a developer or stakeholder, I want documentation updated so that Sprint 4 persistence, adapters, artifacts, and role behavior are understandable.

### Tasks
- Document persistence approach.
- Document data reset behavior.
- Document PSA adapter architecture.
- Document mock vs real adapter feature flag.
- Document new artifact endpoints.
- Document portfolio filters.
- Document role behavior.
- Document assistant prompt behavior.
- Add Sprint 5 candidate list.

### Acceptance Criteria
- README reflects Sprint 4 capabilities.
- Architecture notes explain persistence and adapter boundaries.
- Developer can run/reset demo from docs.

### Dependencies
Sprint 4 implementation.

### Estimate
3 points.

## S4-023: Create Sprint 4 Demo Script

### Type
Product / QA

### User Story
As a product team, I want a Sprint 4 demo script so that persistence, integration-readiness, and generated artifacts can be reviewed consistently.

### Demo Flow
1. Open Acme.
2. Generate account brief.
3. Create PSA task stub.
4. Restart app and show artifact/audit persisted.
5. Generate QBR draft.
6. Generate customer email draft.
7. Use portfolio owner/date filters.
8. Use assistant prompt for call prep.
9. Show mapping decision persistence.
10. Show PSA adapter/mock configuration.

### Acceptance Criteria
- Demo script validates Sprint 4 product outcome.
- Known limitations are documented.
- Sprint 5 candidate list is produced.

### Dependencies
Sprint 4 completion.

### Estimate
2 points.

## 8. Suggested Sprint 4 Task Order

1. S4-001 Choose and document Sprint 4 persistence approach.
2. S4-002 Add repository abstraction layer.
3. S4-007 Add startup seed/migration behavior.
4. S4-003 Persist generated artifacts and activity timeline.
5. S4-004 Persist write-back audit events.
6. S4-005 Persist recommendation status changes.
7. S4-006 Persist mapping confirm/reject decisions.
8. S4-008 Add PSA adapter interface.
9. S4-009 Add mock PSA adapter implementation.
10. S4-010 Add PSA field mapping settings stub.
11. S4-012 Add PSA note draft from generated account brief.
12. S4-013 Add QBR draft generator.
13. S4-014 Add customer email draft generator.
14. S4-015 Add artifact type filters and artifact actions in UI.
15. S4-016 Add portfolio filters by owner and date range.
16. S4-017 Add basic current user and role enforcement.
17. S4-018 Add assistant suggested prompts panel.
18. S4-019 Add assistant prompt actions.
19. S4-011 Add real PSA company/ticket sync spike behind feature flag.
20. S4-020 Expand API tests.
21. S4-021 Expand UI smoke tests.
22. S4-022 Update README and architecture docs.
23. S4-023 Create Sprint 4 demo script.

## 9. Sprint 4 Demo Checklist

The Sprint 4 demo should show:

- Sprint 1 search still works.
- Sprint 2 account intelligence still works.
- Sprint 3 action/artifact flows still work.
- Generate Acme account brief.
- Restart app or reload repository and show account brief remains.
- Create Acme PSA task stub.
- Restart app or reload repository and show audit event remains.
- Convert/dismiss a recommendation and show status persists.
- Confirm Riverbend mapping and show decision persists.
- Generate QBR draft.
- Generate customer email draft.
- Filter portfolio by owner and date range.
- Use assistant prompt for call prep.
- Show mock PSA adapter configuration.
- If available, show real PSA sync spike behind feature flag.

## 10. Sprint 4 Definition of Done

Sprint 4 is done when:

1. Persistence approach is documented.
2. Repository abstraction is in place for mutable state.
3. Generated artifacts persist across restart/reload.
4. Write-back audit events persist across restart/reload.
5. Recommendation status changes persist.
6. Mapping decisions persist.
7. Startup seed/migration/reset behavior is documented and tested.
8. PSA adapter interface exists.
9. Mock PSA adapter powers task/note stubs.
10. PSA field mapping settings stub exists.
11. PSA note draft from account brief works.
12. QBR draft generator works.
13. Customer email draft generator works.
14. Artifact list supports filters/actions.
15. Portfolio views support owner/date filters.
16. Basic role enforcement exists in API and UI.
17. Assistant suggested prompts panel works for selected deterministic prompts.
18. API and UI tests cover new behavior.
19. README and architecture docs are updated.
20. Sprint 4 demo script is ready.

## 11. Risks and Mitigations

### Risk: Persistence layer becomes throwaway
Mitigation: Use repository interfaces and keep implementation swappable.

### Risk: JSON/SQLite persistence creates concurrency limitations
Mitigation: Document local MVP limitation and keep PostgreSQL migration path clear.

### Risk: Real PSA spike delays core durability work
Mitigation: Keep real PSA work behind feature flag and prioritize mock adapter plus interface.

### Risk: Role enforcement becomes too broad
Mitigation: Implement only simple explicit checks for admin and write-back actions.

### Risk: Assistant prompts look like generic chat
Mitigation: Keep prompt actions deterministic and tied to existing account intelligence and endpoints.

### Risk: Too many generated artifact types in one sprint
Mitigation: Use shared artifact generator helpers and deterministic markdown templates.

## 12. Sprint 5 Candidate Backlog

Likely Sprint 5 candidates:

- PostgreSQL migration.
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

## 13. Product Owner Acceptance Questions

Before closing Sprint 4, answer:

1. Does generated/action history survive restart reliably?
2. Is the repository/persistence boundary clear enough for PostgreSQL later?
3. Does the PSA adapter boundary make real integration safer?
4. Are QBR and email drafts useful enough to justify deeper artifact generation?
5. Do portfolio filters make leadership views more useful?
6. Are role restrictions clear and non-disruptive?
7. Do assistant suggested prompts help users discover the product’s capabilities?
8. Is the product ready for real PSA/RMM/security integration hardening in Sprint 5?
