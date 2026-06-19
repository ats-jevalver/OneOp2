
# Sprint 2 Task List: Buffaly Account Intelligence Platform MVP

## 1. Sprint Goal

Move OneOp2 from a Sprint 1 account shell into the first useful account intelligence experience.

By the end of Sprint 2, a user should be able to open an account and see seeded or synced service, RMM, and security signals; understand an explainable account health score; inspect evidence behind that score; and see initial next-best-action recommendation cards.

## 2. Recommended Sprint Length

2 weeks.

## 3. Sprint 2 Product Outcome

A user can:

1. Search/select an account.
2. Open the Account Command Center.
3. View Service, RMM, and Security summaries.
4. See a calculated or seeded account health score with top drivers.
5. Inspect evidence behind score drivers and recommendations.
6. See 3-5 next-best-action recommendation cards for accounts with enough signals.
7. Review mapping/data freshness warnings.
8. Use Sprint 1 APIs/UI without regression.

## 4. Sprint 2 Scope

### In Scope
- Extend data model/runtime seed data with tickets, devices, security findings, evidence, health scores, and recommendations.
- Add Service, RMM, and Security summary APIs.
- Add latest health score API.
- Add recommendation list API.
- Add evidence APIs for recommendations and health scores.
- Add Service/RMM/Security tabs or summary cards in the UI.
- Add health score card with top drivers.
- Add next-best-action recommendation panel.
- Add evidence drawer/modal.
- Add account mapping warning UI improvements.
- Expand tests.

### Out of Scope
- Real PSA/RMM/security production sync.
- PSA write-back task/opportunity creation.
- QBR generation.
- Customer email drafting.
- Full Buffaly assistant panel.
- Full database persistence layer if the team chooses to continue seeded in-memory Sprint 2.
- Authentication hardening.

## 5. Sprint 2 Assumptions

- Sprint 1 remains the baseline and must not regress.
- The team may continue using seeded/in-memory data for Sprint 2 while APIs and UX mature.
- Evidence-backed UX is more important than perfect scoring sophistication.
- Recommendation generation may be deterministic/rule-based for Sprint 2.
- Real integration work can start in parallel but should not block the UX demo.

## 6. Sprint 2 Backlog Summary

### Data and API
- S2-001 Extend seed data with tickets, devices, security findings, evidence, health scores, and recommendations.
- S2-002 Add Service summary/detail endpoint.
- S2-003 Add RMM summary/detail endpoint.
- S2-004 Add Security summary/detail endpoint.
- S2-005 Add latest account health score endpoint.
- S2-006 Add recommendation list endpoint.
- S2-007 Add evidence endpoints.
- S2-008 Add account mapping suggestions endpoint stub.

### Intelligence
- S2-009 Implement deterministic health score calculation service.
- S2-010 Implement deterministic recommendation rules.
- S2-011 Attach evidence to health score drivers and recommendations.

### UI
- S2-012 Add Health Score card with drivers.
- S2-013 Add Service/RMM/Security summary tabs or cards.
- S2-014 Add Next Best Actions panel.
- S2-015 Add Evidence drawer/modal.
- S2-016 Improve warning and data freshness UX.

### Quality and Delivery
- S2-017 Expand API contract tests.
- S2-018 Expand UI smoke tests.
- S2-019 Create Sprint 2 demo script.
- S2-020 Update README and docs.

## 7. Detailed Sprint Tickets

## S2-001: Extend Seed Data for Account Intelligence

### Type
Backend / Data

### User Story
As a developer, I need seeded operational and security signals so that the Account Command Center can show service, RMM, security, health, evidence, and recommendations without waiting on production integrations.

### Tasks
- Add seeded tickets for Acme, Northstar, Greenfield, and Brightway.
- Add seeded devices for Acme, Summit, and Northstar.
- Add seeded device health signals.
- Add seeded security findings and security coverage records.
- Add seeded evidence items.
- Add seeded account health scores.
- Add seeded recommendations.
- Ensure data is linked by account ID and source record ID.

### Acceptance Criteria
- Acme has enough data to show Watch status with evidence.
- Northstar has enough data to show At Risk status with evidence.
- Greenfield has enough data to show Renewal Risk status.
- Summit has enough data to show Expansion Candidate status.
- Harbor keeps stale-data warning behavior.
- Riverbend keeps mapping warning behavior.

### Dependencies
Sprint 1 data module.

### Estimate
5 points.

## S2-002: Add Service Summary/Detail Endpoint

### Type
Backend / API

### User Story
As a user, I want to view service ticket health for an account so that I can understand service friction and escalations.

### API
```http
GET /api/v1/accounts/{accountId}/service?dateRangePreset=last_90_days
```

### Tasks
- Return open ticket count.
- Return aging ticket count.
- Return high-priority ticket count.
- Return escalated ticket count.
- Return SLA risk count.
- Return ticket list.
- Return simple category summary.

### Acceptance Criteria
- Acme service endpoint returns open and aging tickets.
- Northstar service endpoint returns critical/escalated/SLA-breached ticket.
- Unknown account returns 404.
- Response shape matches API spec.

### Dependencies
S2-001.

### Estimate
3 points.

## S2-003: Add RMM Summary/Detail Endpoint

### Type
Backend / API

### User Story
As a user, I want endpoint/device health summarized for an account so that I can identify lifecycle, patching, and device health issues.

### API
```http
GET /api/v1/accounts/{accountId}/rmm
```

### Tasks
- Return device counts by type.
- Return offline device count.
- Return patch gap count.
- Return end-of-life device count.
- Return devices.
- Return device health signals.

### Acceptance Criteria
- Acme RMM endpoint returns patch gap and legacy workstation example.
- Summit RMM endpoint supports expansion/lifecycle story.
- Unknown account returns 404.

### Dependencies
S2-001.

### Estimate
3 points.

## S2-004: Add Security Summary/Detail Endpoint

### Type
Backend / API

### User Story
As a user, I want account security posture summarized so that I can discuss security risk and coverage gaps with customers.

### API
```http
GET /api/v1/accounts/{accountId}/security
```

### Tasks
- Return open finding count.
- Return critical/high finding count.
- Return coverage gap count.
- Return findings.
- Return coverage records.
- Preserve stale security warning for Harbor.

### Acceptance Criteria
- Acme security endpoint returns MFA administrative gap.
- Harbor security endpoint returns stale data warning or stale placeholder finding.
- Unknown account returns 404.

### Dependencies
S2-001.

### Estimate
3 points.

## S2-005: Add Latest Account Health Score Endpoint

### Type
Backend / API

### User Story
As a user, I want to see the latest explainable account health score so that I know whether the account is healthy, at risk, renewal-risk, or an expansion candidate.

### API
```http
GET /api/v1/accounts/{accountId}/health-score/latest
```

### Tasks
- Return latest health score for account.
- Include score category, score value, summary, confidence, calculated date, and top drivers.
- Include evidence count.
- Return placeholder score if no calculated score exists.

### Acceptance Criteria
- Acme returns Watch health score.
- Northstar returns At Risk health score.
- Greenfield returns Renewal Risk health score.
- Summit returns Expansion Candidate health score.
- Unknown account returns 404.

### Dependencies
S2-001.

### Estimate
3 points.

## S2-006: Add Recommendation List Endpoint

### Type
Backend / API

### User Story
As a user, I want to see recommended next actions for an account so that I know what to do next.

### API
```http
GET /api/v1/accounts/{accountId}/recommendations?status=new&limit=5
```

### Tasks
- Return recommendations for account.
- Support status filter.
- Support limit.
- Include title, reason, priority, owner, due date, evidence count, and available actions.
- Return empty array for accounts without recommendations.

### Acceptance Criteria
- Acme returns QBR and security email recommendations.
- Greenfield returns urgent renewal follow-up recommendation.
- Summit returns security expansion opportunity recommendation.
- Response powers Next Best Actions panel.

### Dependencies
S2-001.
S2-010.

### Estimate
3 points.

## S2-007: Add Evidence Endpoints

### Type
Backend / API

### User Story
As a user, I want to inspect evidence behind health scores and recommendations so that I can trust the account intelligence.

### APIs
```http
GET /api/v1/recommendations/{recommendationId}/evidence
GET /api/v1/account-health-scores/{accountHealthScoreId}/evidence
```

### Tasks
- Add evidence item data structure.
- Link evidence to recommendations.
- Link evidence to health scores.
- Return source system, record type, source ID, summary, severity, and observed date.
- Return 404 for unknown recommendation/health score.

### Acceptance Criteria
- Acme QBR recommendation returns renewal, ticket, and patch evidence.
- Acme Watch score returns service/RMM/security evidence.
- Northstar At Risk score returns ticket escalation evidence.
- Evidence response distinguishes source fact from generated interpretation.

### Dependencies
S2-001.
S2-011.

### Estimate
5 points.

## S2-008: Add Account Mapping Suggestions Endpoint Stub

### Type
Backend / API

### User Story
As an admin, I want to see account mapping issues so that I can resolve uncertain source-system matches.

### API
```http
GET /api/v1/admin/account-mapping/suggestions?matchStatus=needs_review
```

### Tasks
- Return external identities with matchStatus needs_review.
- Include account, source system, external display name, confidence, and reason.
- Add endpoint for Riverbend mapping issue.

### Acceptance Criteria
- Riverbend RMM suggested match appears in mapping suggestions.
- Endpoint supports future admin queue UI.

### Dependencies
Sprint 1 external identities.

### Estimate
2 points.

## S2-009: Implement Deterministic Health Score Calculation Service

### Type
Backend / Intelligence

### User Story
As the system, I need a deterministic health score service so that health classifications are explainable and testable before adding more advanced AI reasoning.

### Tasks
- Define scoring components: service, RMM, security, renewal, expansion.
- Implement simple rules over seeded data.
- Calculate category and score value.
- Generate top drivers.
- Attach evidence item IDs.
- Keep output deterministic for tests.

### Acceptance Criteria
- Acme calculates Watch.
- Northstar calculates At Risk.
- Greenfield calculates Renewal Risk.
- Summit calculates Expansion Candidate.
- Brightway calculates Healthy.
- Calculation output includes top drivers and evidence references.

### Dependencies
S2-001.
S2-007.

### Estimate
5 points.

## S2-010: Implement Deterministic Recommendation Rules

### Type
Backend / Intelligence

### User Story
As the system, I need deterministic recommendation rules so that next-best-action cards are useful and explainable in Sprint 2.

### Rules
- Renewal inside 90 days + risk signals -> schedule QBR / renewal follow-up.
- Critical/high security finding -> draft security risk email.
- End-of-life or patch gap signals -> lifecycle/patch review recommendation.
- Stable account with missing security coverage -> expansion opportunity recommendation.
- Critical escalated ticket/SLA breach -> service manager review recommendation.

### Acceptance Criteria
- Acme gets QBR and security/patch recommendations.
- Greenfield gets urgent renewal follow-up.
- Northstar gets service escalation review.
- Summit gets expansion opportunity recommendation.
- Recommendations include evidence links.

### Dependencies
S2-001.
S2-011.

### Estimate
5 points.

## S2-011: Attach Evidence to Health and Recommendations

### Type
Backend / Intelligence / Trust

### User Story
As a user, I want every health driver and recommendation to cite source evidence so that I can trust the system.

### Tasks
- Create evidence records for tickets, devices, security findings, agreements, and renewals.
- Link health scores to evidence.
- Link recommendations to evidence.
- Include evidence count in API responses.
- Include evidence summaries in tests.

### Acceptance Criteria
- No recommendation is returned without evidence.
- No non-placeholder health score is returned without evidence.
- Evidence can be rendered by the evidence drawer.

### Dependencies
S2-001.
S2-007.
S2-009.
S2-010.

### Estimate
5 points.

## S2-012: Add Health Score Card with Drivers

### Type
Frontend / UX

### User Story
As a user, I want a health score card with top drivers so that I can quickly understand why an account is healthy or risky.

### Tasks
- Build HealthScoreCard component.
- Show category badge.
- Show score value if available.
- Show summary.
- Show confidence.
- Show top 3 drivers.
- Add evidence action for each driver or score.

### Acceptance Criteria
- Acme renders Watch card with drivers.
- Greenfield renders Renewal Risk card.
- Northstar renders At Risk card.
- Evidence action opens drawer/modal.

### Dependencies
S2-005.
S2-015.

### Estimate
5 points.

## S2-013: Add Service/RMM/Security Summary Tabs or Cards

### Type
Frontend / UX

### User Story
As a user, I want service, endpoint, and security summaries on the Account Command Center so that I can understand account health without leaving the page.

### Tasks
- Add Service summary card/tab.
- Add RMM summary card/tab.
- Add Security summary card/tab.
- Show counts and top items.
- Handle empty and loading states.
- Handle stale/mapping warnings.

### Acceptance Criteria
- Acme displays service, RMM, and security summaries.
- Northstar displays critical service issue.
- Harbor displays stale security warning.
- Unknown/empty data states are clear.

### Dependencies
S2-002.
S2-003.
S2-004.

### Estimate
8 points.

## S2-014: Add Next Best Actions Panel

### Type
Frontend / UX

### User Story
As a user, I want next-best-action recommendation cards so that account intelligence becomes actionable.

### Tasks
- Build NextBestActionsPanel component.
- Render recommendation cards.
- Show priority, title, reason, owner, due date, and evidence count.
- Add action buttons as disabled/coming soon for write-back actions.
- Add dismiss/snooze UI placeholder if desired.

### Acceptance Criteria
- Acme shows at least two recommendations.
- Greenfield shows urgent renewal recommendation.
- Summit shows expansion candidate recommendation.
- Recommendation evidence action opens drawer/modal.

### Dependencies
S2-006.
S2-015.

### Estimate
5 points.

## S2-015: Add Evidence Drawer/Modal

### Type
Frontend / UX

### User Story
As a user, I want to open an evidence drawer so that I can see the source facts behind a health score or recommendation.

### Tasks
- Build evidence drawer/modal component.
- Fetch evidence for recommendation.
- Fetch evidence for health score.
- Show source system, source record type, source ID, severity, observed date, and summary.
- Add loading, empty, and error states.

### Acceptance Criteria
- User can open evidence from a recommendation.
- User can open evidence from health score card.
- Drawer clearly labels evidence as source data.

### Dependencies
S2-007.

### Estimate
5 points.

## S2-016: Improve Warning and Data Freshness UX

### Type
Frontend / UX

### User Story
As a user, I want mapping and stale-data warnings to be clear so that I know when recommendations may be incomplete.

### Tasks
- Improve warning banner styling.
- Group data freshness by source.
- Highlight stale/error states.
- Link mapping warnings to admin placeholder route.
- Preserve Sprint 1 warning behavior.

### Acceptance Criteria
- Riverbend mapping warning is prominent.
- Harbor stale security warning is prominent.
- Acme current data appears healthy/current.

### Dependencies
Sprint 1 UI.
S2-008 optional for admin route.

### Estimate
3 points.

## S2-017: Expand API Contract Tests

### Type
Quality / Backend

### User Story
As an engineer, I want expanded API tests so that Sprint 2 endpoints are stable and safe for the UI.

### APIs to Test
- GET /api/v1/accounts/{accountId}/service.
- GET /api/v1/accounts/{accountId}/rmm.
- GET /api/v1/accounts/{accountId}/security.
- GET /api/v1/accounts/{accountId}/health-score/latest.
- GET /api/v1/accounts/{accountId}/recommendations.
- GET /api/v1/recommendations/{recommendationId}/evidence.
- GET /api/v1/account-health-scores/{accountHealthScoreId}/evidence.
- GET /api/v1/admin/account-mapping/suggestions.

### Acceptance Criteria
- Happy paths pass for seeded data.
- Unknown account and unknown recommendation cases return 404.
- Evidence endpoints return expected source facts.
- Sprint 1 API tests still pass.

### Dependencies
S2-002 through S2-008.

### Estimate
5 points.

## S2-018: Expand UI Smoke Tests

### Type
Quality / Frontend

### User Story
As an engineer, I want smoke tests for the enhanced Account Command Center so that the core account intelligence experience does not regress.

### Flow to Test
1. Open app.
2. Search Acme.
3. Select Acme.
4. Verify health score card.
5. Verify Service/RMM/Security summaries.
6. Verify recommendation cards.
7. Open evidence drawer.
8. Search Harbor and verify stale warning.
9. Search Riverbend and verify mapping warning.

### Acceptance Criteria
- Smoke test covers Acme account intelligence flow.
- Smoke test covers stale-data warning.
- Smoke test covers mapping warning.
- Sprint 1 UI smoke behavior still works.

### Dependencies
S2-012 through S2-016.

### Estimate
5 points.

## S2-019: Create Sprint 2 Demo Script

### Type
Product / QA

### User Story
As a product team, I want a Sprint 2 demo script so that the new intelligence loop can be reviewed consistently.

### Demo Flow
1. Search Acme.
2. Show Watch health score.
3. Show service/RMM/security summaries.
4. Show next-best-action recommendations.
5. Open evidence for QBR recommendation.
6. Search Greenfield and show Renewal Risk.
7. Search Northstar and show At Risk service escalation.
8. Search Riverbend and show mapping warning.
9. Search Harbor and show stale security warning.

### Acceptance Criteria
- Demo script validates the Sprint 2 product outcome.
- Known limitations are documented.
- Sprint 3 candidates are captured.

### Dependencies
Sprint 2 UI/API completion.

### Estimate
2 points.

## S2-020: Update README and Docs

### Type
Documentation

### User Story
As a developer or stakeholder, I want documentation updated so that I can run, test, and understand the Sprint 2 additions.

### Tasks
- Update README with Sprint 2 features.
- Add API endpoint list for Sprint 2.
- Add demo account scenarios.
- Add test instructions.
- Add known limitations.
- Add Sprint 3 candidate list.

### Acceptance Criteria
- README accurately describes Sprint 2 capabilities.
- Developer can run tests and demo from docs.
- Planning docs include Sprint 2 task list.

### Dependencies
Sprint 2 completion.

### Estimate
2 points.

## 8. Suggested Sprint 2 Task Order

1. S2-001 Extend Seed Data for Account Intelligence.
2. S2-011 Attach Evidence to Health and Recommendations.
3. S2-009 Implement Deterministic Health Score Calculation Service.
4. S2-010 Implement Deterministic Recommendation Rules.
5. S2-002 Add Service Summary/Detail Endpoint.
6. S2-003 Add RMM Summary/Detail Endpoint.
7. S2-004 Add Security Summary/Detail Endpoint.
8. S2-005 Add Latest Account Health Score Endpoint.
9. S2-006 Add Recommendation List Endpoint.
10. S2-007 Add Evidence Endpoints.
11. S2-008 Add Account Mapping Suggestions Endpoint Stub.
12. S2-012 Add Health Score Card with Drivers.
13. S2-013 Add Service/RMM/Security Summary Tabs or Cards.
14. S2-014 Add Next Best Actions Panel.
15. S2-015 Add Evidence Drawer/Modal.
16. S2-016 Improve Warning and Data Freshness UX.
17. S2-017 Expand API Contract Tests.
18. S2-018 Expand UI Smoke Tests.
19. S2-019 Create Sprint 2 Demo Script.
20. S2-020 Update README and Docs.

## 9. Sprint 2 Demo Checklist

The Sprint 2 demo should show:

- Sprint 1 search and Account Command Center still work.
- Acme shows Watch health with top drivers.
- Acme shows service, RMM, and security summaries.
- Acme shows at least two recommendations.
- Evidence drawer opens from health score or recommendation.
- Greenfield shows Renewal Risk.
- Northstar shows At Risk due to service escalation.
- Summit shows Expansion Candidate recommendation.
- Riverbend mapping warning remains visible.
- Harbor stale-data warning remains visible.

## 10. Sprint 2 Definition of Done

Sprint 2 is done when:

1. Sprint 1 tests still pass.
2. Seed data includes service, RMM, security, health, evidence, and recommendation records.
3. Service, RMM, and Security APIs return useful seeded account data.
4. Latest health score API returns explainable account health.
5. Recommendation API returns next-best-action cards.
6. Evidence APIs return source-backed evidence.
7. Account Command Center UI renders health, operational summaries, recommendations, and evidence drawer.
8. Mapping and stale-data warnings are visible and understandable.
9. API and UI smoke tests cover the new flows.
10. Sprint 2 demo script is ready.
11. README/docs are updated.

## 11. Risks and Mitigations

### Risk: Too much data modeling for one sprint
Mitigation: Keep seeded/in-memory records simple and directly shaped for API responses.

### Risk: Health scoring becomes subjective
Mitigation: Use deterministic, documented rules and seeded expected outcomes.

### Risk: Recommendations feel generic
Mitigation: Require every recommendation to cite evidence and account-specific reason.

### Risk: Evidence drawer delays UI progress
Mitigation: Start with a simple modal listing evidence records; improve UI later.

### Risk: Real integration work competes with UX work
Mitigation: Keep real integration as a separate spike unless Sprint 2 core demo is complete.

## 12. Sprint 3 Candidate Backlog

Likely Sprint 3 candidates:

- PSA write-back preview and create task.
- PSA note creation from account brief.
- First generated account brief artifact.
- Account mapping admin queue UI.
- Begin real PSA ticket sync.
- Add lightweight persistence/database layer.
- Add portfolio views for At Risk, Renewal Risk, and Expansion Candidate accounts.
- Add Buffaly assistant suggested prompts.

## 13. Product Owner Acceptance Questions

Before closing Sprint 2, answer:

1. Does the Account Command Center now explain why an account is risky or healthy?
2. Are the Service/RMM/Security summaries useful enough for account review?
3. Do recommendation cards feel specific and actionable?
4. Does the evidence drawer make recommendations trustworthy?
5. Are stale data and mapping warnings clear enough?
6. Is the product ready to move into PSA write-back and generated artifacts in Sprint 3?
