
# Implementation Epics: Buffaly-Powered Account Intelligence Platform MVP

## 1. Purpose

This document converts the PRD, data model/ontology, and first-screen UX into implementation epics for the MVP.

The MVP goal is to deliver an Account Command Center that unifies PSA, RMM, and security/Microsoft 365 data, explains account health, recommends next best actions, generates account artifacts, and writes approved actions back to the PSA.

## 2. MVP Product Outcome

The first MVP should prove this value loop:

1. Select an account.
2. Pull account context from PSA, RMM, and security/M365.
3. Show account health and risks.
4. Generate a Buffaly account brief.
5. Recommend next best actions.
6. Let the user inspect evidence.
7. Let the user create a PSA task, note, or opportunity.
8. Track generated artifacts and actions.

## 3. Epic Summary

### Foundation Epics
- Epic 1: Product Shell and Navigation.
- Epic 2: Identity, Users, Roles, and Permissions.
- Epic 3: Integration Connection Framework.
- Epic 4: Canonical Account Data Model.
- Epic 5: Account Identity Resolution and Mapping.

### Integration Epics
- Epic 6: PSA Read Integration.
- Epic 7: PSA Write-Back Integration.
- Epic 8: RMM Read Integration.
- Epic 9: Security/Microsoft 365 Read Integration.
- Epic 10: Sync, Freshness, and Error Monitoring.

### Intelligence Epics
- Epic 11: Evidence Model and Source Traceability.
- Epic 12: Account Health Scoring.
- Epic 13: Next Best Action Recommendations.
- Epic 14: Buffaly Typed Action Layer.
- Epic 15: Buffaly Prompt/Policy Knowledge.

### UX Epics
- Epic 16: Account Search and Account Header.
- Epic 17: Account Command Center Summary Layout.
- Epic 18: Detail Tabs for Service, RMM, Security, Revenue, Contacts, and Activity.
- Epic 19: Evidence Drawer and Explainability UX.
- Epic 20: Buffaly Assistant Panel.

### Artifact and Workflow Epics
- Epic 21: Account Brief Generator.
- Epic 22: QBR / Account Review Draft Generator.
- Epic 23: Customer Email Drafting.
- Epic 24: PSA Task, Note, and Opportunity Creation UX.
- Epic 25: Generated Artifact Library and Activity Timeline.

### Portfolio and Admin Epics
- Epic 26: Portfolio Views.
- Epic 27: Admin Configuration.
- Epic 28: Analytics and Product Events.
- Epic 29: Audit, Security, and Governance.
- Epic 30: MVP Validation, Demo Data, and Pilot Readiness.

## 4. Recommended MVP Sequencing

### Milestone 1: Data Foundation
Goal: Get trustworthy account data into the system.

Epics:
- Epic 2: Identity, Users, Roles, and Permissions.
- Epic 3: Integration Connection Framework.
- Epic 4: Canonical Account Data Model.
- Epic 5: Account Identity Resolution and Mapping.
- Epic 6: PSA Read Integration.
- Epic 8: RMM Read Integration.
- Epic 9: Security/Microsoft 365 Read Integration.
- Epic 10: Sync, Freshness, and Error Monitoring.

### Milestone 2: Account Command Center
Goal: Let a user open an account and understand the current state.

Epics:
- Epic 16: Account Search and Account Header.
- Epic 17: Account Command Center Summary Layout.
- Epic 18: Detail Tabs.
- Epic 11: Evidence Model and Source Traceability.

### Milestone 3: Intelligence and Recommendations
Goal: Turn account data into explainable insights and next actions.

Epics:
- Epic 12: Account Health Scoring.
- Epic 13: Next Best Action Recommendations.
- Epic 14: Buffaly Typed Action Layer.
- Epic 15: Buffaly Prompt/Policy Knowledge.
- Epic 19: Evidence Drawer and Explainability UX.
- Epic 20: Buffaly Assistant Panel.

### Milestone 4: Action and Artifact Generation
Goal: Let users generate account materials and push approved actions back to the PSA.

Epics:
- Epic 7: PSA Write-Back Integration.
- Epic 21: Account Brief Generator.
- Epic 22: QBR / Account Review Draft Generator.
- Epic 23: Customer Email Drafting.
- Epic 24: PSA Task, Note, and Opportunity Creation UX.
- Epic 25: Generated Artifact Library and Activity Timeline.

### Milestone 5: Portfolio and Pilot Readiness
Goal: Prepare for team-level use and pilot validation.

Epics:
- Epic 26: Portfolio Views.
- Epic 27: Admin Configuration.
- Epic 28: Analytics and Product Events.
- Epic 29: Audit, Security, and Governance.
- Epic 30: MVP Validation, Demo Data, and Pilot Readiness.

## 5. Epics

## Epic 1: Product Shell and Navigation

### Outcome
Users can access the application, navigate between account search, account command center, portfolio views, and admin settings.

### Major Stories
- Create base application shell.
- Add top navigation.
- Add account search entry point.
- Add portfolio navigation entry point.
- Add admin/settings navigation entry point.
- Add responsive layout foundation.

### Acceptance Criteria
- User can open the application shell.
- User can navigate to Account Command Center, Portfolio Views, and Admin Settings.
- Layout works on desktop and tablet widths.

### Dependencies
- None.

## Epic 2: Identity, Users, Roles, and Permissions

### Outcome
The system can identify users and apply basic access controls.

### Major Stories
- Define user model.
- Define roles: AccountManager, Sales, ServiceManager, SecurityLead, Executive, Admin.
- Implement login/authentication path.
- Implement role-based visibility for write-back and admin actions.
- Associate account owners with users.

### Acceptance Criteria
- User identity is available to the application.
- Admin-only settings are restricted.
- PSA write-back actions require authorized role.
- Account owner filtering can use mapped users.

### Dependencies
- Product shell.

## Epic 3: Integration Connection Framework

### Outcome
Admins can configure external PSA, RMM, and security/M365 connections.

### Major Stories
- Create IntegrationConnection model.
- Store connection metadata.
- Store credential references securely.
- Support connection status: Connected, Disconnected, Error, Disabled.
- Show connection status in admin settings.
- Add integration test/check action.

### Acceptance Criteria
- Admin can view configured integrations.
- System can report connection status.
- Credentials are not exposed in the UI.
- Failed connection test shows actionable error.

### Dependencies
- Identity and permissions.

## Epic 4: Canonical Account Data Model

### Outcome
The platform has a canonical account-centered data model that can store normalized PSA, RMM, and security data.

### Major Stories
- Implement Account table/collection.
- Implement AccountExternalIdentity.
- Implement Contact.
- Implement AccountOwner.
- Implement Agreement and Renewal.
- Implement Ticket.
- Implement Device and DeviceHealthSignal.
- Implement SecurityFinding and SecurityCoverage.
- Implement Opportunity and Activity.
- Implement AccountHealthScore, Recommendation, EvidenceItem, GeneratedArtifact.
- Add migration/seed support.

### Acceptance Criteria
- Canonical entities can be created and queried.
- Integrated source records retain external IDs and source system names.
- Account is the aggregate root for MVP queries.

### Dependencies
- None for schema; integration epics depend on this.

## Epic 5: Account Identity Resolution and Mapping

### Outcome
The system can match the same customer across PSA, RMM, and security/M365 sources.

### Major Stories
- Create account mapping admin queue.
- Generate suggested matches using name, domain, tenant ID, and aliases.
- Auto-link high-confidence matches.
- Require review for medium/low-confidence matches.
- Allow manual confirm/reject of suggested matches.
- Preserve rejected matches to prevent repeated suggestions.
- Show mapping warnings in Account Command Center.

### Acceptance Criteria
- Account can have multiple confirmed external identities.
- User can correct an incorrect account mapping.
- Unmapped records are visible to admins.
- Account Command Center warns when mapping is incomplete or uncertain.

### Dependencies
- Canonical Account Data Model.
- Integration read data staging.

## Epic 6: PSA Read Integration

### Outcome
The platform can read account, contact, agreement, ticket, opportunity, and activity data from the selected PSA.

### Major Stories
- Read PSA companies/accounts.
- Read contacts.
- Read account owners/sales reps if available.
- Read agreements/contracts.
- Read renewal/end dates if available.
- Read tickets/service requests.
- Read ticket status, priority, category, age, and SLA status.
- Read opportunities.
- Read recent activities/notes/tasks.
- Normalize PSA records into canonical entities.

### Acceptance Criteria
- PSA accounts sync into canonical Account records.
- PSA tickets are visible under the correct account.
- PSA agreement/renewal data appears in Account Command Center.
- PSA opportunities and activities are visible where available.
- Sync errors are logged with clear messages.

### Dependencies
- Integration Connection Framework.
- Canonical Account Data Model.

## Epic 7: PSA Write-Back Integration

### Outcome
Users can create approved tasks, notes, and opportunities in the PSA from Buffaly recommendations and generated artifacts.

### Major Stories
- Create PSA follow-up task.
- Create PSA note/activity.
- Create PSA opportunity.
- Map required PSA fields.
- Allow user confirmation before write-back.
- Store write-back result and external record ID.
- Handle write-back failure with retry/copy fallback.
- Add audit log for write-back actions.

### Acceptance Criteria
- Authorized user can create a PSA task from a recommendation.
- Authorized user can create a PSA note from an account brief.
- Authorized user can create an opportunity with evidence summary.
- System confirms successful write-back and stores external ID.
- Failed write-back preserves draft payload.

### Dependencies
- PSA Read Integration.
- Recommendations.
- Write-back UX.
- Security and governance.

## Epic 8: RMM Read Integration

### Outcome
The platform can read endpoint/device and health data from the selected RMM.

### Major Stories
- Read RMM clients/customers/sites.
- Read devices/endpoints.
- Read device type, OS, status, and last seen date.
- Read patch status.
- Read device alerts where available.
- Read warranty/lifecycle data where available.
- Normalize RMM records into Device and DeviceHealthSignal.
- Map RMM clients/sites to canonical accounts.

### Acceptance Criteria
- RMM device counts are visible for mapped accounts.
- Offline/stale devices can be identified.
- Patch gaps can be summarized by account.
- RMM mapping issues are visible in admin queue.

### Dependencies
- Integration Connection Framework.
- Canonical Account Data Model.
- Account Identity Resolution.

## Epic 9: Security/Microsoft 365 Read Integration

### Outcome
The platform can read security posture and coverage signals from one selected security/M365 source.

### Major Stories
- Read security tenants/customers.
- Read critical/high alerts or incidents.
- Read vulnerability or finding records where available.
- Read MFA/identity posture gaps where available.
- Read EDR/MDR/security coverage where available.
- Read risky users/sign-ins where available.
- Normalize findings into SecurityFinding and SecurityCoverage.
- Map security tenant/customer to canonical Account.

### Acceptance Criteria
- Security findings are visible for mapped accounts.
- Coverage gaps can be shown in Account Command Center.
- Critical/high findings can drive account recommendations.
- Security data freshness is visible.

### Dependencies
- Integration Connection Framework.
- Canonical Account Data Model.
- Account Identity Resolution.

## Epic 10: Sync, Freshness, and Error Monitoring

### Outcome
Users can trust the data because the system shows sync state, freshness, and integration errors.

### Major Stories
- Implement SyncRun records.
- Track last successful sync per integration.
- Track sync warnings and errors.
- Show freshness in Account Command Center.
- Show integration status in admin settings.
- Show stale/disconnected warnings.
- Support manual refresh for an account.

### Acceptance Criteria
- Account Command Center shows PSA/RMM/security freshness.
- Stale data warnings are visible.
- Admins can see integration sync failures.
- Manual refresh updates account data or shows actionable error.

### Dependencies
- Integration Connection Framework.
- Read integrations.

## Epic 11: Evidence Model and Source Traceability

### Outcome
Scores, recommendations, and generated artifacts are backed by visible source evidence.

### Major Stories
- Implement EvidenceItem storage.
- Create evidence from source records during sync or derivation.
- Attach evidence to health scores.
- Attach evidence to recommendations.
- Attach evidence to generated artifacts.
- Provide source links where available.
- Support evidence drawer queries.

### Acceptance Criteria
- Each recommendation has at least one evidence item.
- Each health score explanation references evidence.
- User can open evidence drawer from risks/recommendations.
- Evidence shows source system, record type, record ID/link, and observed date.

### Dependencies
- Canonical Account Data Model.
- Read integrations.

## Epic 12: Account Health Scoring

### Outcome
Each account receives an explainable health classification based on service, renewal, RMM, and security signals.

### Major Stories
- Define MVP health categories: Healthy, Watch, At Risk, Expansion Candidate, Renewal Risk.
- Define scoring inputs and thresholds.
- Calculate service health component.
- Calculate RMM health component.
- Calculate security health component.
- Calculate renewal risk component.
- Calculate expansion potential component.
- Store AccountHealthScore records.
- Show score explanation and top drivers.

### Acceptance Criteria
- Account health is visible in account header and health card.
- Health explanation includes top contributing factors.
- Score recalculates after data refresh.
- User can see evidence behind score drivers.

### Dependencies
- Evidence Model.
- PSA, RMM, and security data.

## Epic 13: Next Best Action Recommendations

### Outcome
Buffaly recommends 3-5 prioritized, evidence-backed next actions for accounts with sufficient data.

### Major Stories
- Define MVP recommendation types.
- Implement rules/prompts for generating recommendations.
- Rank recommendations by priority and urgency.
- Attach evidence to each recommendation.
- Suggest owner and due date.
- Support recommendation statuses.
- Allow dismiss/snooze/accept.
- Convert recommendation to task or opportunity.

### Acceptance Criteria
- Account displays relevant recommendations.
- Recommendations include reason, priority, evidence, owner, and due date.
- User can dismiss a recommendation with reason.
- User can convert recommendation to PSA task/opportunity where authorized.

### Dependencies
- Account Health Scoring.
- Evidence Model.
- PSA Write-Back Integration for conversion actions.

## Epic 14: Buffaly Typed Action Layer

### Outcome
The product exposes domain-native Buffaly actions for account intelligence, artifact generation, and PSA write-back.

### Major Stories
- Implement ToGetAccountCommandCenterSummary.
- Implement ToRefreshAccountData.
- Implement ToCalculateAccountHealthScore.
- Implement ToFindAccountRisks.
- Implement ToFindExpansionOpportunities.
- Implement ToGenerateAccountBrief.
- Implement ToGenerateQbrDraft.
- Implement ToDraftCustomerEmailForAccount.
- Implement ToCreatePsaFollowUpTask.
- Implement ToCreatePsaNote.
- Implement ToCreatePsaOpportunity.
- Implement ToExplainRecommendationEvidence.
- Implement ToGetIntegrationFreshnessStatus.

### Acceptance Criteria
- UI can call typed actions instead of duplicating business logic.
- Each action validates required inputs.
- Write-back actions require confirmation and authorization.
- Action outputs include structured data suitable for UI rendering.

### Dependencies
- Canonical model.
- Read integrations.
- Evidence model.
- Generated artifacts.
- PSA write-back.

## Epic 15: Buffaly Prompt/Policy Knowledge

### Outcome
Buffaly understands company-specific account health definitions, QBR format, sales process, and communication tone.

### Major Stories
- Define account health policy prompt.
- Define recommendation policy prompt.
- Define QBR/account brief template prompt.
- Define customer email tone prompt.
- Define sales/service/security handoff rules.
- Define opportunity qualification rules.
- Define required PSA field guidance.
- Allow admin-managed policy content where appropriate.

### Acceptance Criteria
- Generated artifacts follow approved format.
- Recommendations align with company rules.
- Customer emails use approved tone.
- Required PSA fields are respected during write-back.

### Dependencies
- Buffaly Typed Action Layer.
- Admin Configuration.

## Epic 16: Account Search and Account Header

### Outcome
Users can search for an account and immediately understand owner, health, renewal, and data status.

### Major Stories
- Build account search box.
- Search by name, domain, contact, alias, and source IDs where available.
- Show search result health and owner metadata.
- Build account header.
- Show account owner, domain, agreement, renewal countdown, and health badge.
- Show action buttons: Generate Brief, QBR Draft, Create Task.
- Show mapping/data freshness warnings.

### Acceptance Criteria
- User can find and open an account.
- Account header shows critical status at a glance.
- Stale/mapping warnings are visible.
- Header actions are available according to permission.

### Dependencies
- Account data model.
- Account identity mapping.
- Account health scoring.

## Epic 17: Account Command Center Summary Layout

### Outcome
Users can see account snapshot, health, renewal context, Buffaly brief, risks, opportunities, and next actions in one screen.

### Major Stories
- Build account snapshot card.
- Build account health card.
- Build renewal context card.
- Build data confidence card.
- Build Buffaly account brief panel.
- Build risk list.
- Build opportunity list.
- Build recent account timeline.
- Build next best actions panel.

### Acceptance Criteria
- Account page renders useful summary without opening tabs.
- Buffaly brief explains current account state.
- Risks/opportunities include evidence links.
- Next best actions are visible and actionable.

### Dependencies
- Account search/header.
- Account health scoring.
- Recommendations.
- Evidence model.

## Epic 18: Detail Tabs for Service, RMM, Security, Revenue, Contacts, and Activity

### Outcome
Users can drill into source detail without leaving the Account Command Center.

### Major Stories
- Build Service tab.
- Build RMM tab.
- Build Security tab.
- Build Revenue tab.
- Build Contacts tab.
- Build Activity tab.
- Add source record links.
- Add tab-specific actions.

### Acceptance Criteria
- Service tab shows tickets and ticket trends.
- RMM tab shows devices and health signals.
- Security tab shows findings and coverage gaps.
- Revenue tab shows agreements, renewals, and opportunities.
- Contacts tab shows key contacts.
- Activity tab shows notes, tasks, artifacts, recommendation history, and audit events.

### Dependencies
- Read integrations.
- Canonical model.
- Generated artifacts.
- PSA write-back audit events.

## Epic 19: Evidence Drawer and Explainability UX

### Outcome
Users can inspect source evidence behind every score, recommendation, and generated insight.

### Major Stories
- Build evidence drawer component.
- Link risks to evidence.
- Link opportunities to evidence.
- Link recommendations to evidence.
- Link health score drivers to evidence.
- Show source system and source record ID/link.
- Support copy/export of evidence summary.

### Acceptance Criteria
- User can open evidence from each recommendation.
- Evidence drawer shows source facts clearly.
- User can distinguish source fact from Buffaly interpretation.

### Dependencies
- Evidence Model.
- Account Command Center Summary Layout.

## Epic 20: Buffaly Assistant Panel

### Outcome
Users can ask account-specific questions and trigger typed Buffaly actions from the screen.

### Major Stories
- Build assistant panel or slide-out.
- Add suggested prompts.
- Support account-scoped questions.
- Render evidence-backed answers.
- Offer next action suggestions.
- Support confirmation flow for write-back actions.

### Acceptance Criteria
- User can ask “Prepare me for my call.”
- User can ask “Why is this account Watch?”
- User can generate draft email or QBR from assistant prompt.
- Assistant requires confirmation before PSA write-back.

### Dependencies
- Buffaly Typed Action Layer.
- Evidence Model.
- Generated artifact actions.
- PSA write-back actions.

## Epic 21: Account Brief Generator

### Outcome
Users can generate a concise internal account brief from current account data.

### Major Stories
- Define account brief template.
- Generate executive summary.
- Summarize service health.
- Summarize RMM health.
- Summarize security posture.
- Include risks, opportunities, and recommended next actions.
- Attach evidence appendix.
- Save as GeneratedArtifact.

### Acceptance Criteria
- User can generate account brief from Account Command Center.
- Brief includes source-backed risks and opportunities.
- Brief is saved and visible in Activity tab.
- User can copy/export the brief.

### Dependencies
- Buffaly Typed Action Layer.
- Evidence Model.
- GeneratedArtifact model.

## Epic 22: QBR / Account Review Draft Generator

### Outcome
Users can generate a structured QBR/account review draft for a selected date range and audience.

### Major Stories
- Define QBR template.
- Support date range selection.
- Support audience: internal, customer-facing, executive.
- Generate service performance section.
- Generate endpoint/RMM section.
- Generate security posture section.
- Generate business risks and recommendations.
- Generate proposed next steps.
- Include source appendix.
- Save as GeneratedArtifact.

### Acceptance Criteria
- User can generate QBR draft for last 90 days.
- Draft includes required sections.
- Draft includes evidence/source details.
- Draft can be copied/exported/attached where supported.

### Dependencies
- Account Brief Generator.
- Evidence Model.
- Buffaly Prompt/Policy Knowledge.

## Epic 23: Customer Email Drafting

### Outcome
Users can generate customer-facing email drafts based on account risks, opportunities, or recommendations.

### Major Stories
- Define email draft types.
- Draft QBR invitation.
- Draft renewal follow-up.
- Draft security risk explanation.
- Draft lifecycle replacement discussion.
- Draft ticket trend concern.
- Draft project follow-up.
- Apply approved tone/policy.
- Save as GeneratedArtifact.

### Acceptance Criteria
- User can draft customer email from recommendation.
- Email references business impact, not just technical details.
- Email remains draft-only.
- User can copy or revise the draft.

### Dependencies
- Buffaly Prompt/Policy Knowledge.
- Recommendations.
- GeneratedArtifact model.

## Epic 24: PSA Task, Note, and Opportunity Creation UX

### Outcome
Users can review and approve PSA write-back actions from recommendations and generated artifacts.

### Major Stories
- Build write-back confirmation modal.
- Pre-fill task fields from recommendation.
- Pre-fill note fields from account brief.
- Pre-fill opportunity fields from opportunity recommendation.
- Allow edit before submit.
- Show success confirmation.
- Show error and retry/copy fallback.
- Store write-back audit event.

### Acceptance Criteria
- User can review payload before write-back.
- Required PSA fields are validated before submit.
- Successful write-back updates Activity tab.
- Failed write-back preserves user input.

### Dependencies
- PSA Write-Back Integration.
- Recommendations.
- Generated Artifacts.
- Security/Governance.

## Epic 25: Generated Artifact Library and Activity Timeline

### Outcome
Users can see generated briefs, QBR drafts, email drafts, write-back actions, and recommendation history in account activity.

### Major Stories
- Store generated artifacts.
- List artifacts in Activity tab.
- List recommendation status changes.
- List PSA write-back events.
- Show who generated/approved actions.
- Support artifact preview.

### Acceptance Criteria
- Generated account brief appears in Activity tab.
- QBR draft appears in Activity tab.
- PSA task creation event appears in Activity tab.
- User can reopen generated artifacts.

### Dependencies
- GeneratedArtifact model.
- PSA write-back UX.
- Audit events.

## Epic 26: Portfolio Views

### Outcome
Leadership and account teams can prioritize accounts across the book of business.

### Major Stories
- Build Accounts At Risk view.
- Build Renewals in Next 90 Days view.
- Build Expansion Candidates view.
- Build Accounts Missing Security Coverage view.
- Build Accounts with Critical Security Findings view.
- Build Accounts with Aging Ticket Problems view.
- Build Accounts Needing QBR view.
- Add filtering by owner and date range.
- Drill into Account Command Center.

### Acceptance Criteria
- User can view at-risk accounts.
- User can view renewals in next 90 days.
- User can view expansion candidates.
- Each row includes account, owner, reason, and recommended action.
- User can filter to their accounts.

### Dependencies
- Account Health Scoring.
- Recommendations.
- Account Command Center.

## Epic 27: Admin Configuration

### Outcome
Admins can configure integrations, mappings, thresholds, recommendation rules, service catalog mappings, and generated artifact settings.

### Major Stories
- Configure integration connections.
- Review account mapping queue.
- Configure health score thresholds.
- Configure recommendation rules.
- Configure required PSA fields.
- Configure service catalog mappings.
- Configure QBR template settings.
- Configure customer email tone/profile.

### Acceptance Criteria
- Admin can manage integration status.
- Admin can review unmatched accounts.
- Admin can adjust score/recommendation basics.
- Admin can configure required PSA write-back fields.

### Dependencies
- Identity/Roles.
- Integration framework.
- Account mapping.
- Buffaly policy prompts.

## Epic 28: Analytics and Product Events

### Outcome
The product can measure adoption, productivity, trust, and revenue/account impact.

### Major Stories
- Track account searched.
- Track account opened.
- Track account brief generated.
- Track QBR draft generated.
- Track recommendation viewed/accepted/dismissed.
- Track recommendation converted to task/opportunity.
- Track customer email drafted.
- Track evidence drawer opened.
- Track account mapping corrected.
- Track PSA write-back success/failure.
- Build basic analytics export or dashboard.

### Acceptance Criteria
- MVP success metrics can be calculated.
- Events include user, account, timestamp, and event type.
- Sensitive data is not unnecessarily logged.

### Dependencies
- Product shell.
- Account Command Center.
- Recommendation and artifact flows.

## Epic 29: Audit, Security, and Governance

### Outcome
The product protects customer data, requires human approval for external actions, and provides traceability.

### Major Stories
- Implement role-based permissions.
- Protect integration credentials.
- Audit PSA write-back actions.
- Audit generated customer-facing drafts.
- Require confirmation before external write-back.
- Prevent silent customer outreach.
- Support tenant/customer data isolation model.
- Show stale data warnings.

### Acceptance Criteria
- Write-back actions are auditable.
- Credentials are not visible to users.
- Customer email drafts are not sent automatically.
- Unauthorized users cannot perform restricted actions.

### Dependencies
- Identity/Roles.
- Integration framework.
- PSA write-back.

## Epic 30: MVP Validation, Demo Data, and Pilot Readiness

### Outcome
The MVP is ready to demo, test with pilot users, and validate product assumptions.

### Major Stories
- Create demo account data set.
- Create test accounts for Healthy, Watch, At Risk, Renewal Risk, and Expansion Candidate states.
- Create integration failure/stale data scenarios.
- Create sample recommendations.
- Create sample QBR/account brief outputs.
- Create pilot onboarding checklist.
- Create user feedback capture flow.
- Validate core workflows end-to-end.

### Acceptance Criteria
- Demo can show complete value loop.
- Pilot users can open accounts and generate briefs/recommendations.
- PSA write-back can be tested safely.
- Feedback can be captured and reviewed.

### Dependencies
- All MVP user-facing epics.

## 6. Recommended First Engineering Sprint

If beginning implementation immediately, the first sprint should focus on:

1. Product shell.
2. Canonical Account model.
3. IntegrationConnection model.
4. PSA read spike for accounts/companies.
5. Account search prototype.
6. Account header prototype.
7. Demo data seed.

The first sprint goal should be:

A user can open the application, search/select a seeded or PSA-synced account, and see a basic account header.

## 7. Dependency Highlights

- PSA read integration should come before most UX work.
- Account identity resolution is required before RMM/security data can be trusted.
- Evidence model should be implemented before recommendations are considered production-ready.
- PSA write-back should wait until task/opportunity field mapping is known.
- Buffaly typed actions should become the orchestration layer before assistant workflows expand.
- Portfolio views depend on account health and recommendations.

## 8. MVP Definition of Done

The MVP is done when:

1. Users can search and open an account.
2. Account Command Center shows PSA, RMM, and security/M365 context.
3. Account health is calculated and explained.
4. Buffaly generates an account brief.
5. Buffaly recommends next best actions with evidence.
6. Users can inspect evidence.
7. Users can create a PSA task, note, or opportunity after confirmation.
8. Users can generate a QBR/account review draft.
9. Portfolio views identify at-risk, renewal, and expansion accounts.
10. Admins can manage integrations and account mappings.
11. Data freshness and sync errors are visible.
12. Write-back actions are audited.
