
# Sprint 3 Task List: Buffaly Account Intelligence Platform MVP

## 1. Sprint Goal

Make OneOp2 actionable.

Sprint 1 proved the account shell and search experience. Sprint 2 proved account intelligence with service/RMM/security signals, health scoring, recommendations, and evidence. Sprint 3 should let users convert intelligence into approved actions and reusable account artifacts.

By the end of Sprint 3, a user should be able to:

1. Open an account.
2. Review health, recommendations, and evidence.
3. Convert a recommendation into a previewed PSA task.
4. Confirm task creation through a stubbed PSA write-back flow.
5. See the write-back result in activity/audit history.
6. Generate an account brief from account intelligence.
7. Preview/copy the generated brief.
8. View basic portfolio lists for At Risk, Renewal Risk, and Expansion Candidate accounts.
9. Review account mapping suggestions in an admin queue.

## 2. Recommended Sprint Length

2 weeks.

## 3. Sprint 3 Product Outcome

OneOp2 moves from an evidence-backed insight dashboard to an action-oriented account management workflow.

The value loop becomes:

Account intelligence -> recommendation -> evidence -> approved action -> audit/activity trail -> generated account artifact.

## 4. Sprint 3 Scope

### In Scope
- Runtime stores for generated artifacts and write-back audit events.
- Generated account brief endpoint.
- Generated artifact list/retrieve endpoints.
- PSA task preview endpoint.
- PSA task creation stub endpoint.
- Write-back audit events endpoint.
- Recommendation action confirmation modal.
- Create PSA Task flow from recommendation cards.
- Generate Account Brief UI flow.
- Generated artifact preview/copy UI.
- Basic Activity timeline.
- Account mapping suggestions admin UI.
- Confirm/reject mapping stub endpoints.
- Portfolio views for At Risk, Renewal Risk, and Expansion Candidates.
- Expanded API/UI tests.
- README/docs updates.
- Sprint 3 demo script.

### Out of Scope
- Real PSA production write-back.
- Real PSA field mapping UI.
- Real email sending.
- Full QBR generator.
- Full Buffaly assistant panel.
- Full persistent database layer unless separately prioritized.
- Authentication and RBAC hardening.
- Multi-tenant SaaS controls.

## 5. Sprint 3 Assumptions

- PSA task creation remains a safe stub for this sprint.
- Generated account briefs can be deterministic/template-based using Sprint 2 data.
- Activity timeline can use in-memory runtime data.
- Portfolio views can be derived from seeded health scores and recommendations.
- Mapping confirm/reject can update in-memory data for demo purposes.
- Real persistence is a likely Sprint 4 candidate.

## 6. Sprint 3 Backlog Summary

### Action and Audit
- S3-001 Add runtime stores for generated artifacts and write-back audit events.
- S3-002 Add PSA task preview endpoint.
- S3-003 Add PSA task creation stub endpoint.
- S3-004 Add write-back audit events endpoint.
- S3-005 Add recommendation status update endpoint.

### Generated Artifacts
- S3-006 Add account brief generation endpoint.
- S3-007 Add generated artifact retrieval/list endpoints.
- S3-008 Add generated artifact evidence support.

### UI Workflows
- S3-009 Add Create PSA Task confirmation modal.
- S3-010 Add Create PSA Task flow from recommendations.
- S3-011 Add Generate Account Brief button and preview.
- S3-012 Add copy-to-clipboard support for generated briefs.
- S3-013 Add Activity timeline section.

### Admin and Portfolio
- S3-014 Add mapping suggestions admin UI.
- S3-015 Add confirm/reject mapping stub endpoints.
- S3-016 Add Portfolio At Risk view.
- S3-017 Add Portfolio Renewal Risk view.
- S3-018 Add Portfolio Expansion Candidates view.

### Quality and Delivery
- S3-019 Expand API tests for actions/artifacts/portfolio/mapping.
- S3-020 Expand UI smoke tests for action and artifact flows.
- S3-021 Update README and docs.
- S3-022 Create Sprint 3 demo script.

## 7. Detailed Sprint Tickets

## S3-001: Add Runtime Stores for Generated Artifacts and Write-Back Audit Events

### Type
Backend / Data

### User Story
As the system, I need runtime stores for generated artifacts and write-back audit events so that action and artifact flows can be demonstrated safely before a database layer is added.

### Tasks
- Add `generatedArtifacts` in-memory collection.
- Add `writeBackAuditEvents` in-memory collection.
- Add ID generation helpers.
- Add created/updated timestamp helpers.
- Add simple account-scoped query helpers.
- Ensure test isolation where needed.

### Acceptance Criteria
- Generated artifacts can be created and retrieved by ID.
- Write-back audit events can be created and listed by account.
- Runtime stores do not break existing seeded data.
- Sprint 1 and Sprint 2 tests still pass.

### Dependencies
Sprint 2 data module.

### Estimate
3 points.

## S3-002: Add PSA Task Preview Endpoint

### Type
Backend / API

### User Story
As a user, I want to preview a PSA task before creation so that I can verify the task title, body, owner, due date, and evidence summary.

### API
```http
POST /api/v1/accounts/{accountId}/psa/tasks/preview
```

### Request Shape
```json
{
  "recommendationId": "rec_acme_qbr",
  "title": "Schedule renewal-focused QBR",
  "body": "...",
  "ownerUserId": "usr_am_jane",
  "dueDate": "2026-06-25"
}
```

### Tasks
- Validate account exists.
- Validate recommendation exists and belongs to account.
- Generate default task title/body from recommendation if omitted.
- Include evidence summary.
- Return preview payload and validation warnings.

### Acceptance Criteria
- Acme QBR recommendation can generate a valid task preview.
- Missing recommendation returns validation error.
- Recommendation for another account returns conflict/validation error.
- Preview includes title, body, owner, due date, recommendation ID, and evidence summary.

### Dependencies
S3-001.

### Estimate
3 points.

## S3-003: Add PSA Task Creation Stub Endpoint

### Type
Backend / API

### User Story
As a user, I want to confirm task creation so that a recommendation becomes a tracked action, even while real PSA write-back is still stubbed.

### API
```http
POST /api/v1/accounts/{accountId}/psa/tasks
```

### Tasks
- Require `confirmed: true`.
- Validate account and recommendation.
- Create local activity/task object or write-back result object.
- Create write-back audit event.
- Mark recommendation as `converted_to_task`.
- Return stub external ID and URL.

### Acceptance Criteria
- Confirmed Acme QBR recommendation creates a stub PSA task.
- Unconfirmed request returns validation error.
- Write-back audit event is created.
- Recommendation status updates to converted_to_task.
- Response includes local activity ID, external ID, external URL, and status.

### Dependencies
S3-001.
S3-002.
S3-005.

### Estimate
5 points.

## S3-004: Add Write-Back Audit Events Endpoint

### Type
Backend / API

### User Story
As a user or admin, I want to see write-back audit events so that external actions are traceable.

### API
```http
GET /api/v1/accounts/{accountId}/write-back-audit-events
```

### Tasks
- Validate account exists.
- Return account-scoped write-back audit events.
- Include user, action type, target record type, status, external ID, error message, recommendation ID, artifact ID, and timestamp.

### Acceptance Criteria
- After task creation, audit event appears for the account.
- Empty state returns empty array.
- Unknown account returns 404.

### Dependencies
S3-001.
S3-003.

### Estimate
2 points.

## S3-005: Add Recommendation Status Update Endpoint

### Type
Backend / API

### User Story
As a user, I want recommendation statuses to change when I accept, dismiss, snooze, or convert them so that recommendations reflect workflow progress.

### API
```http
PATCH /api/v1/recommendations/{recommendationId}
```

### Tasks
- Validate recommendation exists.
- Support statuses: new, accepted, dismissed, snoozed, converted_to_task, converted_to_opportunity, completed.
- Support dismissal reason.
- Support snoozed until date.
- Return updated recommendation.

### Acceptance Criteria
- Recommendation can be dismissed with reason.
- Recommendation can be marked accepted.
- Task creation can mark recommendation converted_to_task.
- Invalid status returns validation error.

### Dependencies
Sprint 2 recommendations.

### Estimate
3 points.

## S3-006: Add Account Brief Generation Endpoint

### Type
Backend / API / Artifact Generation

### User Story
As an account manager, I want to generate an account brief from account intelligence so that I can quickly prepare for customer calls, QBRs, and internal reviews.

### API
```http
POST /api/v1/accounts/{accountId}/artifacts/account-brief
```

### Tasks
- Validate account exists.
- Pull command center data.
- Generate deterministic markdown account brief.
- Include executive summary.
- Include health score and drivers.
- Include service, RMM, and security sections.
- Include recommendations.
- Include evidence appendix.
- Save artifact to runtime store.
- Return generated artifact.

### Acceptance Criteria
- Acme brief includes health, service, RMM, security, recommendations, and evidence appendix.
- Greenfield brief includes renewal risk context.
- Generated artifact can be retrieved later by ID.
- Response includes artifact ID, title, body, body format, type, status, and created timestamp.

### Dependencies
S3-001.
Sprint 2 command center data.

### Estimate
5 points.

## S3-007: Add Generated Artifact Retrieval/List Endpoints

### Type
Backend / API

### User Story
As a user, I want to reopen generated account briefs so that useful account artifacts are not lost after generation.

### APIs
```http
GET /api/v1/generated-artifacts/{generatedArtifactId}
GET /api/v1/accounts/{accountId}/generated-artifacts
```

### Tasks
- Retrieve generated artifact by ID.
- List generated artifacts by account.
- Support artifact type filter.
- Return empty array for accounts with no artifacts.

### Acceptance Criteria
- Generated account brief can be retrieved by ID.
- Account artifact list includes generated brief.
- Unknown artifact returns 404.

### Dependencies
S3-001.
S3-006.

### Estimate
3 points.

## S3-008: Add Generated Artifact Evidence Support

### Type
Backend / API / Trust

### User Story
As a user, I want generated account briefs to preserve source evidence so that generated text remains traceable.

### API
```http
GET /api/v1/generated-artifacts/{generatedArtifactId}/evidence
```

### Tasks
- Store evidence item IDs on generated artifacts.
- Return artifact evidence.
- Include evidence appendix in account brief body.

### Acceptance Criteria
- Acme generated brief has evidence records.
- Evidence endpoint returns source evidence for generated brief.
- Evidence appendix appears in brief body.

### Dependencies
S3-006.
Sprint 2 evidence model.

### Estimate
3 points.

## S3-009: Add Create PSA Task Confirmation Modal

### Type
Frontend / UX

### User Story
As a user, I want to review a task before it is created so that I stay in control of external actions.

### Tasks
- Add task confirmation modal/dialog.
- Prefill title, body, owner, due date from preview endpoint.
- Allow basic edits.
- Show evidence summary.
- Add Confirm and Cancel actions.
- Handle loading/error/success states.

### Acceptance Criteria
- User can click Create PSA Task on recommendation card.
- Preview modal opens with populated task fields.
- User can cancel without creating anything.
- User can confirm to create stub PSA task.

### Dependencies
S3-002.
S3-003.

### Estimate
5 points.

## S3-010: Add Create PSA Task Flow from Recommendations

### Type
Frontend / Workflow

### User Story
As a user, I want to convert a recommendation into a task so that account insights become tracked follow-up.

### Tasks
- Enable Create PSA Task button on recommendation cards.
- Call preview endpoint.
- Show confirmation modal.
- Call create endpoint on confirm.
- Update recommendation status in UI.
- Show success message and external/stub task link.
- Refresh activity timeline.

### Acceptance Criteria
- Acme QBR recommendation can be converted to stub PSA task.
- Recommendation card updates after conversion.
- Activity/audit entry appears after conversion.
- Error state preserves draft payload.

### Dependencies
S3-009.
S3-013.

### Estimate
5 points.

## S3-011: Add Generate Account Brief Button and Preview

### Type
Frontend / Artifact UX

### User Story
As a user, I want to generate and preview an account brief directly from the Account Command Center.

### Tasks
- Add Generate Account Brief button to account header or brief card.
- Call account brief generation endpoint.
- Show generated markdown preview.
- Save generated artifact in runtime store.
- Show generated artifact metadata.

### Acceptance Criteria
- User can generate Acme account brief.
- Brief preview includes health, service, RMM, security, recommendations, and evidence appendix.
- Generated artifact appears in activity timeline.

### Dependencies
S3-006.
S3-007.
S3-013.

### Estimate
5 points.

## S3-012: Add Copy-to-Clipboard Support for Generated Briefs

### Type
Frontend / UX

### User Story
As a user, I want to copy a generated account brief so that I can paste it into a PSA note, email, or document.

### Tasks
- Add Copy Brief button.
- Use browser clipboard API.
- Show copied confirmation.
- Provide fallback select text behavior if clipboard API fails.

### Acceptance Criteria
- User can copy generated brief body.
- Success/failure state is clear.

### Dependencies
S3-011.

### Estimate
2 points.

## S3-013: Add Activity Timeline Section

### Type
Frontend / UX

### User Story
As a user, I want to see generated artifacts and write-back actions in account activity so that work is traceable.

### Tasks
- Add Activity section/card to Account Command Center.
- Show generated artifacts.
- Show write-back audit events.
- Show recommendation status changes if available.
- Add refresh after account brief generation and task creation.

### Acceptance Criteria
- Generated account brief appears in Activity.
- Stub PSA task creation appears in Activity.
- Empty state is clear.

### Dependencies
S3-004.
S3-007.

### Estimate
5 points.

## S3-014: Add Mapping Suggestions Admin UI

### Type
Frontend / Admin UX

### User Story
As an admin, I want to review account mapping suggestions so that uncertain RMM/security identity matches can be resolved.

### Tasks
- Add Admin Mapping route or section.
- Call mapping suggestions endpoint.
- Display account name, source system, external display name, confidence, and reason.
- Show Riverbend mapping suggestion.
- Add Confirm and Reject buttons.

### Acceptance Criteria
- Admin Mapping UI lists Riverbend suggestion.
- User can see confidence and match reason.
- Confirm/reject actions call stub endpoints after S3-015.

### Dependencies
Sprint 2 mapping suggestions endpoint.
S3-015.

### Estimate
5 points.

## S3-015: Add Confirm/Reject Mapping Stub Endpoints

### Type
Backend / API

### User Story
As an admin, I want to confirm or reject suggested account mappings so that mapping warnings can be resolved.

### APIs
```http
POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/confirm
POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/reject
```

### Tasks
- Validate external identity exists.
- Confirm endpoint sets matchStatus to confirmed and matchConfidence to 100.
- Reject endpoint sets matchStatus to rejected.
- Return updated identity.
- Update command center warnings accordingly.

### Acceptance Criteria
- Riverbend mapping can be confirmed.
- Riverbend warning disappears after confirm in current runtime session.
- Rejected match no longer appears in needs_review list.

### Dependencies
Sprint 2 external identity data.

### Estimate
3 points.

## S3-016: Add Portfolio At Risk View

### Type
Backend + Frontend / Portfolio

### User Story
As a leader, I want to see at-risk accounts across the book of business so that I can prioritize attention.

### API
```http
GET /api/v1/portfolio/accounts-at-risk
```

### Tasks
- Add portfolio API for accounts with health score category at_risk.
- Add Portfolio section or route.
- Display account, owner, reason, health category, and recommended action.
- Link to Account Command Center.

### Acceptance Criteria
- Northstar appears in At Risk view.
- User can click through to Northstar Account Command Center.

### Dependencies
Sprint 2 health scores and recommendations.

### Estimate
5 points.

## S3-017: Add Portfolio Renewal Risk View

### Type
Backend + Frontend / Portfolio

### User Story
As an account leader, I want to see renewal-risk accounts so that upcoming renewals do not get missed.

### API
```http
GET /api/v1/portfolio/renewals?days=90
```

### Tasks
- Add portfolio renewals API.
- Include accounts with renewal inside days parameter or health category renewal_risk.
- Display account, owner, renewal date, days until renewal, and reason.
- Link to Account Command Center.

### Acceptance Criteria
- Greenfield appears in Renewal Risk view.
- Acme appears as upcoming renewal/watch account when days=90.

### Dependencies
Sprint 2 renewals and health scores.

### Estimate
5 points.

## S3-018: Add Portfolio Expansion Candidates View

### Type
Backend + Frontend / Portfolio

### User Story
As a sales leader, I want to see expansion candidate accounts so that growth opportunities are visible.

### API
```http
GET /api/v1/portfolio/expansion-candidates
```

### Tasks
- Add portfolio expansion API.
- Include accounts with health category expansion_candidate or open opportunity recommendation.
- Display account, owner, reason, health category, and top recommendation.
- Link to Account Command Center.

### Acceptance Criteria
- Summit appears in Expansion Candidates view.
- View shows security services expansion recommendation.

### Dependencies
Sprint 2 recommendations and health scores.

### Estimate
5 points.

## S3-019: Expand API Tests for Actions, Artifacts, Portfolio, and Mapping

### Type
Quality / Backend

### User Story
As an engineer, I want API tests for Sprint 3 flows so that action and artifact workflows are reliable.

### APIs to Test
- POST /api/v1/accounts/{accountId}/psa/tasks/preview.
- POST /api/v1/accounts/{accountId}/psa/tasks.
- GET /api/v1/accounts/{accountId}/write-back-audit-events.
- PATCH /api/v1/recommendations/{recommendationId}.
- POST /api/v1/accounts/{accountId}/artifacts/account-brief.
- GET /api/v1/generated-artifacts/{generatedArtifactId}.
- GET /api/v1/accounts/{accountId}/generated-artifacts.
- GET /api/v1/generated-artifacts/{generatedArtifactId}/evidence.
- POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/confirm.
- POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/reject.
- GET /api/v1/portfolio/accounts-at-risk.
- GET /api/v1/portfolio/renewals.
- GET /api/v1/portfolio/expansion-candidates.

### Acceptance Criteria
- Acme task preview and creation tests pass.
- Write-back audit event appears after task creation.
- Account brief generation/retrieval tests pass.
- Generated artifact evidence tests pass.
- Riverbend mapping confirm/reject tests pass.
- Portfolio views return expected seeded accounts.
- Sprint 1 and Sprint 2 tests still pass.

### Dependencies
S3-001 through S3-018.

### Estimate
8 points.

## S3-020: Expand UI Smoke Tests for Action and Artifact Flows

### Type
Quality / Frontend

### User Story
As an engineer, I want UI smoke tests for Sprint 3 workflows so that action and artifact flows do not regress.

### Flow to Test
1. Search Acme.
2. Open Account Command Center.
3. Create PSA task from QBR recommendation through modal.
4. Verify success and activity entry.
5. Generate account brief.
6. Verify preview and copy action.
7. Open Portfolio At Risk and click Northstar.
8. Open Admin Mapping queue and confirm/reject Riverbend mapping.

### Acceptance Criteria
- Smoke test validates the core Sprint 3 action loop.
- Smoke test validates generated brief flow.
- Smoke test validates at least one portfolio view.
- Smoke test validates mapping admin interaction.

### Dependencies
S3-009 through S3-018.

### Estimate
8 points.

## S3-021: Update README and Docs

### Type
Documentation

### User Story
As a developer or stakeholder, I want documentation updated so that Sprint 3 capabilities are easy to run, test, and demo.

### Tasks
- Update README current features.
- Add Sprint 3 API endpoint list.
- Add task creation demo flow.
- Add account brief generation demo flow.
- Add portfolio demo flow.
- Add mapping admin demo flow.
- Add known limitations and Sprint 4 candidates.

### Acceptance Criteria
- README accurately describes Sprint 3 features.
- Developer can run and test Sprint 3 from docs.
- Known limitations are clear.

### Dependencies
Sprint 3 implementation completion.

### Estimate
2 points.

## S3-022: Create Sprint 3 Demo Script

### Type
Product / QA

### User Story
As a product team, I want a Sprint 3 demo script so that the actionable workflow can be reviewed consistently.

### Demo Flow
1. Open Acme.
2. Review health, service/RMM/security, recommendations, and evidence.
3. Create PSA task from QBR recommendation.
4. Show write-back audit/activity entry.
5. Generate account brief.
6. Preview and copy account brief.
7. Open Portfolio At Risk and click Northstar.
8. Open Portfolio Renewal Risk and click Greenfield.
9. Open Portfolio Expansion Candidates and click Summit.
10. Open Admin Mapping Queue and review Riverbend.

### Acceptance Criteria
- Demo script validates Sprint 3 product outcome.
- Known limitations are documented.
- Sprint 4 candidate list is produced.

### Dependencies
Sprint 3 feature completion.

### Estimate
2 points.

## 8. Suggested Sprint 3 Task Order

1. S3-001 Add runtime stores for generated artifacts and write-back audit events.
2. S3-005 Add recommendation status update endpoint.
3. S3-002 Add PSA task preview endpoint.
4. S3-003 Add PSA task creation stub endpoint.
5. S3-004 Add write-back audit events endpoint.
6. S3-006 Add account brief generation endpoint.
7. S3-007 Add generated artifact retrieval/list endpoints.
8. S3-008 Add generated artifact evidence support.
9. S3-015 Add confirm/reject mapping stub endpoints.
10. S3-016 Add Portfolio At Risk view.
11. S3-017 Add Portfolio Renewal Risk view.
12. S3-018 Add Portfolio Expansion Candidates view.
13. S3-009 Add Create PSA Task confirmation modal.
14. S3-010 Add Create PSA Task flow from recommendations.
15. S3-011 Add Generate Account Brief button and preview.
16. S3-012 Add copy-to-clipboard support for generated briefs.
17. S3-013 Add Activity timeline section.
18. S3-014 Add mapping suggestions admin UI.
19. S3-019 Expand API tests.
20. S3-020 Expand UI smoke tests.
21. S3-021 Update README and docs.
22. S3-022 Create Sprint 3 demo script.

## 9. Sprint 3 Demo Checklist

The Sprint 3 demo should show:

- Sprint 1 account search still works.
- Sprint 2 health/evidence/recommendations still work.
- Acme QBR recommendation can be previewed as a PSA task.
- User can confirm stub PSA task creation.
- Task creation produces a write-back audit event.
- Recommendation status updates after conversion.
- User can generate an Acme account brief.
- Generated account brief includes evidence appendix.
- Generated brief appears in activity timeline.
- User can copy generated brief.
- At Risk portfolio view shows Northstar.
- Renewal Risk portfolio view shows Greenfield and Acme.
- Expansion Candidates portfolio view shows Summit.
- Mapping admin queue shows Riverbend.
- Riverbend mapping can be confirmed/rejected in runtime session.

## 10. Sprint 3 Definition of Done

Sprint 3 is done when:

1. Sprint 1 and Sprint 2 tests still pass.
2. PSA task preview endpoint returns editable task payload.
3. PSA task creation stub creates audit event and updates recommendation status.
4. Write-back audit events endpoint works.
5. Account brief generation endpoint creates deterministic markdown brief.
6. Generated artifacts can be listed, retrieved, and linked to evidence.
7. UI supports Create PSA Task flow from recommendation cards.
8. UI supports Generate Account Brief and copy brief flow.
9. Activity timeline shows generated artifacts and write-back events.
10. Mapping suggestions admin UI supports confirm/reject stub flow.
11. Portfolio At Risk, Renewal Risk, and Expansion Candidate views work.
12. API and UI smoke tests cover the new workflows.
13. README/docs are updated.
14. Sprint 3 demo script is ready.

## 11. Risks and Mitigations

### Risk: Stub PSA write-back is mistaken for production integration
Mitigation: Clearly label stub status in UI, response payloads, audit records, and README.

### Risk: Activity timeline becomes too broad
Mitigation: Limit Sprint 3 timeline to generated artifacts and write-back audit events.

### Risk: Portfolio views distract from action workflow
Mitigation: Keep portfolio views simple list pages/cards derived from seeded data.

### Risk: Account brief generation gets too complex
Mitigation: Use deterministic markdown template with evidence appendix; defer advanced QBR generation.

### Risk: Runtime-only stores lose data on restart
Mitigation: Document limitation and make persistence a Sprint 4 candidate.

## 12. Sprint 4 Candidate Backlog

Likely Sprint 4 candidates:

- Add lightweight database persistence.
- Real PSA write-back integration using configured field mapping.
- PSA note creation from generated account brief.
- Real PSA ticket/company/contact sync.
- Generated QBR draft.
- Customer email draft generation.
- Buffaly assistant panel with suggested prompts.
- Portfolio filters by owner/date range.
- Authentication/RBAC hardening.

## 13. Product Owner Acceptance Questions

Before closing Sprint 3, answer:

1. Can a user move from recommendation to task without confusion?
2. Is the write-back confirmation flow safe and clear?
3. Does the activity timeline provide enough traceability?
4. Is the generated account brief useful as a call-prep/account-review artifact?
5. Do portfolio views help prioritize which accounts to open?
6. Is the mapping admin queue understandable enough for non-engineers?
7. Is the product now ready for real PSA write-back and persistence work?
