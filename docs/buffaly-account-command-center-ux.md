
# First Screen UX Design: Account Command Center

## 1. Screen Purpose

The first screen of the MVP should be the Account Command Center.

Its job is to answer four questions quickly:

1. What is happening with this account?
2. Why does it matter?
3. What should we do next?
4. Can I act on it immediately?

This screen should not feel like a generic dashboard. It should feel like an account briefing and action workspace powered by Buffaly.

## 2. Primary Users

### Account Manager
Uses the screen to prepare for calls, QBRs, renewals, and customer follow-up.

### Sales Representative
Uses the screen to find expansion opportunities and convert technical signals into sales motions.

### Service Manager
Uses the screen to understand service friction, escalations, and recurring issues.

### Security Lead
Uses the screen to identify security posture gaps and communicate business risk.

### Executive
Uses the screen to understand account risk, renewal risk, and expansion potential.

## 3. UX Principle

The screen should combine:

- source data from PSA/RMM/security systems,
- Buffaly-generated interpretation,
- evidence-backed recommendations,
- and action buttons that write back to the PSA.

The user should never wonder: “Where did this recommendation come from?”

## 4. Screen Name

Recommended name:

**Account Command Center**

Alternative names:

- Account Intelligence View
- Account 360
- Account Briefing Center
- Customer Command Center

## 5. Top-Level Layout

Recommended desktop layout:

```text
+--------------------------------------------------------------------------------+
| Global Header / Account Search / Date Range / Data Freshness                   |
+--------------------------------------------------------------------------------+
| Account Header                                                                 |
| Acme Corp | Health: Watch | Renewal: 67 days | Owner: Jane | Actions           |
+----------------------------+-------------------------------+-------------------+
| Left Column                | Center Column                  | Right Column      |
| Account Snapshot           | Buffaly Account Brief          | Next Best Actions |
| Health Score               | Key Risks                      | Assistant Panel   |
| Renewal Context            | Key Opportunities              | PSA Write-back    |
| Data Freshness             | Evidence Timeline              |                   |
+----------------------------+-------------------------------+-------------------+
| Lower Detail Tabs: Service | RMM | Security | Revenue | Contacts | Activity      |
+--------------------------------------------------------------------------------+
```

Recommended responsive behavior:

- On desktop, use three columns.
- On tablet, collapse right column under account brief.
- On mobile, use stacked cards with sticky action bar.

## 6. Global Header

### Components
- Product name or logo.
- Account search.
- Portfolio shortcut.
- Date range selector.
- Refresh/sync indicator.
- User/profile menu.

### Account Search Behavior
The account search should support:

- account name,
- domain,
- contact name,
- PSA company ID if pasted,
- alias or alternate spelling.

Search result row should show:

- account name,
- account owner,
- health status,
- renewal date,
- mapping confidence/data warnings if relevant.

### Date Range Selector
Default: last 90 days.

Options:
- Last 30 days.
- Last 90 days.
- Last 180 days.
- Year to date.
- Custom.

### Data Freshness Indicator
Show a compact indicator such as:

- PSA: synced 12 min ago.
- RMM: synced 1 hr ago.
- Security: synced 7 hrs ago.

Use warning state if data is stale or disconnected.

## 7. Account Header

### Purpose
Give immediate orientation and account status.

### Content
- Account name.
- Primary domain.
- Account owner.
- Agreement type.
- Renewal countdown.
- Health status badge.
- Expansion candidate badge when applicable.
- Key action buttons.

### Example
```text
Acme Corp                                  Health: Watch
acme.com | Owner: Jane Smith              Renewal in 67 days
Agreement: Managed Services Premium       Expansion Candidate
```

### Header Actions
Primary actions:
- Generate Account Brief.
- Generate QBR Draft.
- Create PSA Task.
- Create Opportunity.

Secondary actions:
- Refresh Account Data.
- View Source Records.
- Edit Account Mapping.

## 8. Left Column: Account Snapshot

### Purpose
Provide a fast, scannable account summary.

### Cards

#### 8.1 Account Summary Card
Fields:
- Account owner.
- Primary contact.
- Agreement.
- MRR/ARR when available.
- Renewal date.
- Last QBR date.
- Open opportunities.

#### 8.2 Account Health Card
Show:
- Health category: Healthy, Watch, At Risk, Renewal Risk, Expansion Candidate.
- Numeric score if used.
- Top 3 drivers.
- Confidence indicator.

Example:
```text
Watch
Top drivers:
- 14 open tickets, 3 aging over 10 days
- 22 endpoints missing recent patches
- Renewal in 67 days
Confidence: High
```

#### 8.3 Renewal Context Card
Show:
- renewal date,
- days until renewal,
- agreement status,
- open renewal opportunity,
- renewal owner,
- renewal risk reason.

#### 8.4 Data Confidence Card
Show:
- PSA freshness,
- RMM freshness,
- security freshness,
- account mapping state,
- missing data warnings.

Example states:
- All data current.
- Security data stale.
- RMM account mapping needs review.

## 9. Center Column: Buffaly Account Brief

### Purpose
This is the main narrative area. It should explain what the data means.

### Sections

#### 9.1 Executive Summary
A short paragraph generated by Buffaly.

Example:
Acme is generally stable but should be watched ahead of renewal. Service volume is elevated, patch compliance is behind target, and several security coverage gaps create a strong QBR conversation opportunity.

#### 9.2 Key Risks
List 3-5 risks.

Each risk should include:
- title,
- business impact,
- source evidence,
- severity,
- recommended action.

Example:
```text
Patch compliance gap
22 endpoints are missing recent patches, including 4 servers.
Impact: increased vulnerability exposure and possible compliance issues.
Evidence: RMM patch status, observed today.
Recommended action: Schedule remediation review.
```

#### 9.3 Key Opportunities
List 3-5 expansion or account growth opportunities.

Examples:
- missing MDR/EDR coverage,
- lifecycle refresh,
- backup coverage gap,
- Microsoft 365 security hardening,
- renewal expansion,
- project opportunity from recurring tickets.

#### 9.4 Recent Account Timeline
A compact timeline of meaningful events:

- critical tickets opened/closed,
- security incidents,
- major RMM alerts,
- renewal milestones,
- last QBR,
- opportunity changes,
- PSA notes/tasks.

#### 9.5 Evidence Links
Every generated insight should have an “Evidence” link or expansion panel showing source records.

Evidence panel should show:
- source system,
- source record type,
- source record ID/link,
- observed date,
- summary.

## 10. Right Column: Next Best Actions

### Purpose
Turn account intelligence into action.

### Layout
Show 3-5 ranked action cards.

Each card includes:
- action title,
- priority,
- reason,
- evidence count/link,
- suggested owner,
- suggested due date,
- primary action button,
- dismiss or snooze option.

### Example Action Card
```text
High Priority
Schedule renewal-focused QBR
Reason: Renewal is in 67 days, ticket volume is up 24%, and patch compliance is below target.
Evidence: 5 source records
Owner: Jane Smith
Due: Next 7 days
[Create PSA Task] [Generate QBR Draft] [Dismiss]
```

### MVP Action Types
- Create PSA task.
- Create PSA note.
- Create PSA opportunity.
- Generate account brief.
- Generate QBR draft.
- Draft customer email.
- Snooze recommendation.
- Dismiss recommendation with reason.

### Recommendation Statuses
- New.
- Accepted.
- Dismissed.
- Snoozed.
- Converted to task.
- Converted to opportunity.
- Completed.

## 11. Buffaly Assistant Panel

### Purpose
Allow the user to ask natural-language account questions and trigger typed actions.

### Placement
Right column below Next Best Actions, or as a slide-out panel.

### Suggested Prompts
Show clickable prompts such as:

- Prepare me for a call with this account.
- Why is this account marked Watch?
- What should I discuss in the QBR?
- Draft a customer email about the security gaps.
- Create a PSA follow-up task for the account owner.
- What changed since the last review?
- Which risks could become sales opportunities?

### Assistant Response Requirements
Buffaly responses should:
- answer in plain business language,
- cite evidence,
- offer next actions,
- distinguish source facts from generated interpretation,
- require confirmation before write-back.

### Confirmation Pattern
Before write-back:

```text
I can create this PSA task:
Title: Schedule renewal-focused QBR with Acme
Owner: Jane Smith
Due: Friday
Notes: Renewal is in 67 days. Ticket volume is up 24%. Patch compliance is below target.

[Create Task] [Edit] [Cancel]
```

## 12. Lower Detail Tabs

The lower section provides source detail without overwhelming the top summary.

### 12.1 Service Tab
Shows:
- open tickets,
- aging tickets,
- tickets by priority,
- ticket categories,
- SLA risks,
- escalations,
- recurring issue candidates.

Primary actions:
- View ticket in PSA.
- Create service manager review task.
- Add ticket trend to QBR draft.

### 12.2 RMM Tab
Shows:
- devices by type,
- offline devices,
- patch status,
- end-of-life devices,
- warranty/lifecycle issues,
- critical RMM alerts.

Primary actions:
- View device in RMM.
- Create lifecycle opportunity.
- Add endpoint health summary to QBR.

### 12.3 Security Tab
Shows:
- open critical/high findings,
- coverage gaps,
- MFA/identity posture issues,
- risky users/sign-ins,
- vulnerabilities,
- recent security incidents.

Primary actions:
- Draft security risk email.
- Create security remediation task.
- Create security service opportunity.

### 12.4 Revenue Tab
Shows:
- agreements,
- renewal dates,
- MRR/ARR if available,
- open opportunities,
- missing services,
- products/services attached.

Primary actions:
- Create renewal follow-up.
- Create expansion opportunity.
- Review agreement coverage.

### 12.5 Contacts Tab
Shows:
- primary contacts,
- billing contacts,
- technical contacts,
- executive contacts,
- relationship notes,
- last interaction date.

Primary actions:
- Draft customer email.
- Create contact follow-up.

### 12.6 Activity Tab
Shows:
- recent PSA notes,
- recent tasks,
- generated artifacts,
- recommendation history,
- write-back audit events.

Primary actions:
- View PSA activity.
- Add account note.
- Attach generated brief.

## 13. Key User Flows

### Flow 1: Account Call Preparation
1. User searches for account.
2. Account Command Center loads.
3. User reads Buffaly Account Brief.
4. User asks: “Prepare me for my call.”
5. Buffaly returns call prep summary, risks, opportunities, and suggested talking points.
6. User creates follow-up task or drafts email.

### Flow 2: Renewal Review
1. User opens account with renewal badge.
2. User reviews renewal context and health score.
3. Buffaly recommends QBR or renewal follow-up.
4. User generates QBR draft.
5. User creates PSA task for account owner.

### Flow 3: Security Opportunity
1. User opens account with security coverage gap.
2. User expands evidence for missing MDR/EDR/MFA.
3. Buffaly drafts business-impact explanation.
4. User creates opportunity in PSA.
5. User drafts customer email for approval.

### Flow 4: Service Escalation
1. User opens account marked At Risk.
2. User sees aging tickets and SLA risk.
3. Buffaly recommends service manager review.
4. User creates PSA task and adds note to account.

## 14. Loading, Empty, and Error States

### Loading State
Show skeleton cards for:
- account header,
- health card,
- brief,
- recommendations,
- detail tabs.

Display message:
Loading PSA, RMM, and security context...

### Partial Data State
If one integration fails or is stale, show available data and warn clearly.

Example:
Security data is stale. Last successful sync was 9 days ago. Recommendations may be incomplete.

### Empty Account State
If no account is selected:
- show account search,
- show portfolio shortcuts,
- show recently viewed accounts,
- show suggested views: At Risk, Renewals, Expansion Candidates.

### No Recommendations State
If no recommendations exist:
No urgent recommendations found. You can still generate an account brief or ask Buffaly a question.

### Mapping Issue State
If account identity is uncertain:
This account has possible unmatched RMM or security records. Review mappings before relying on recommendations.

Actions:
- Review suggested matches.
- Dismiss suggested matches.
- Continue with PSA-only view.

### Write-back Error State
If PSA task/opportunity creation fails:
- show what failed,
- preserve draft payload,
- allow retry,
- allow copy to clipboard,
- show technical details in expandable section.

## 15. Visual Priority

The visual hierarchy should be:

1. Account health and renewal status.
2. Buffaly narrative summary.
3. Next best actions.
4. Evidence and source detail.
5. Historical activity.

Use badges for:
- Healthy.
- Watch.
- At Risk.
- Renewal Risk.
- Expansion Candidate.
- Data Stale.
- Mapping Review Needed.

Suggested colors:
- Healthy: green.
- Watch: yellow/amber.
- At Risk: red.
- Renewal Risk: purple or orange.
- Expansion Candidate: blue.
- Data warning: gray/amber.

## 16. MVP Wireframe Detail

```text
Header
--------------------------------------------------------------------------------
[Logo] [Search accounts...]                         [Last 90 days v] [Sync ✓]

Account Header
--------------------------------------------------------------------------------
Acme Corp                              [Generate Brief] [QBR Draft] [Create Task]
acme.com | Owner: Jane Smith | Managed Services Premium
Health: Watch | Renewal in 67 days | Expansion Candidate | Data current

Main Content
--------------------------------------------------------------------------------
LEFT                         CENTER                         RIGHT

Account Snapshot             Buffaly Account Brief          Next Best Actions
- Owner                      Executive Summary              1. Schedule QBR
- Primary Contact            Key Risks                      2. Create patch review
- Agreement                  Key Opportunities              3. Open security opp
- MRR/ARR                    Recent Timeline                4. Draft email

Health Score                 Evidence-backed Insights       Buffaly Assistant
Watch                        - Patch gap                    Ask about this account...
Top Drivers                  - Ticket trend                 Suggested prompts
- Tickets aging              - Renewal coming
- Patch gaps
- Renewal soon

Renewal Context
- Renewal date
- Opportunity status
- Owner

Data Confidence
- PSA synced
- RMM synced
- Security synced

Detail Tabs
--------------------------------------------------------------------------------
[Service] [RMM] [Security] [Revenue] [Contacts] [Activity]
```

## 17. Component Inventory

### Required MVP Components
- AccountSearchBox.
- DateRangeSelector.
- DataFreshnessIndicator.
- AccountHeader.
- AccountSnapshotCard.
- AccountHealthCard.
- RenewalContextCard.
- DataConfidenceCard.
- BuffalyAccountBriefPanel.
- RiskList.
- OpportunityList.
- EvidenceDrawer.
- NextBestActionPanel.
- RecommendationCard.
- BuffalyAssistantPanel.
- DetailTabs.
- ServiceHealthTab.
- RmmHealthTab.
- SecurityPostureTab.
- RevenueTab.
- ContactsTab.
- ActivityTab.
- PsaWriteBackConfirmationModal.
- AccountMappingWarningBanner.

### Post-MVP Components
- QBR deck export.
- Relationship map.
- Account plan editor.
- Playbook builder.
- Advanced portfolio filters.
- Team performance dashboard.

## 18. Data Requirements by Screen Area

### Account Header
Requires:
- Account.
- AccountOwner.
- Agreement.
- Renewal.
- AccountHealthScore.
- AccountExternalIdentity.

### Left Column
Requires:
- Account.
- Contact.
- Agreement.
- Renewal.
- Opportunity.
- AccountHealthScore.
- IntegrationConnection.
- SyncRun.

### Center Column
Requires:
- AccountHealthScore.
- TicketTrend.
- DeviceHealthSignal.
- SecurityFinding.
- SecurityCoverage.
- Recommendation.
- EvidenceItem.
- GeneratedArtifact.

### Right Column
Requires:
- Recommendation.
- EvidenceItem.
- Activity.
- Opportunity.
- GeneratedArtifact.

### Detail Tabs
Require:
- Ticket.
- Device.
- DeviceHealthSignal.
- SecurityFinding.
- SecurityCoverage.
- Agreement.
- Renewal.
- Contact.
- Activity.
- Opportunity.

## 19. Buffaly Typed Actions Used by the Screen

The screen should primarily call typed Buffaly actions rather than directly binding every UI component to raw source APIs.

Recommended screen actions:

- ToGetAccountCommandCenterSummary.
- ToRefreshAccountData.
- ToCalculateAccountHealthScore.
- ToFindAccountRisks.
- ToFindExpansionOpportunities.
- ToGenerateAccountBrief.
- ToGenerateQbrDraft.
- ToDraftCustomerEmailForAccount.
- ToCreatePsaFollowUpTask.
- ToCreatePsaNote.
- ToCreatePsaOpportunity.
- ToExplainRecommendationEvidence.
- ToGetIntegrationFreshnessStatus.
- ToMatchAccountAcrossSystems.
- ToConfirmAccountExternalIdentityMatch.
- ToRejectAccountExternalIdentityMatch.

## 20. Analytics and Product Events

Track these MVP events:

- Account searched.
- Account opened.
- Account brief generated.
- QBR draft generated.
- Recommendation viewed.
- Recommendation accepted.
- Recommendation dismissed.
- Recommendation converted to PSA task.
- Recommendation converted to opportunity.
- Customer email drafted.
- Evidence drawer opened.
- Account mapping corrected.
- Integration stale warning displayed.
- PSA write-back succeeded.
- PSA write-back failed.

These events support the MVP success metrics from the PRD.

## 21. Accessibility Requirements

- All actions must be keyboard accessible.
- Health and priority states must not rely on color alone.
- Badges need text labels.
- Evidence drawers and modals must support focus trapping.
- Generated summaries should be selectable/copyable.
- Loading and error states should be announced to screen readers where applicable.

## 22. Security and Governance UX Requirements

- Show confirmation before PSA write-back.
- Show source evidence before creating opportunities from recommendations.
- Customer email drafts must remain draft-only unless future explicit send capability is approved.
- Display stale data warnings prominently.
- Show audit trail for write-back actions in Activity tab.
- Do not expose integration credentials in UI.

## 23. MVP Acceptance Criteria

The first screen is acceptable for MVP when:

1. User can search for and open an account.
2. User can see account owner, agreement, renewal, and health status.
3. User can see service, RMM, and security summaries when data is available.
4. Buffaly generates an account brief with evidence-backed risks and opportunities.
5. User can view 3-5 next best actions for accounts with sufficient signals.
6. User can expand evidence for a recommendation or risk.
7. User can create a PSA task from a recommendation after confirmation.
8. User can generate a QBR/account review draft.
9. User can see whether PSA, RMM, and security data are fresh or stale.
10. User is warned when account mapping needs review.
11. Empty, partial, loading, and write-back error states are handled.

## 24. Recommended First Build Slice

If engineering needs an even smaller first implementation slice, build this:

1. Account search.
2. Account header.
3. Account snapshot card.
4. Health score card.
5. Buffaly account brief panel.
6. Next best action panel.
7. Evidence drawer.
8. Create PSA task confirmation flow.
9. Service/RMM/security tabs with basic summary tables.
10. Data freshness indicator.

This slice proves the product value: account context, interpretation, evidence, recommendation, and action.
