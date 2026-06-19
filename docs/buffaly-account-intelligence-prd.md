
# Product Requirements Document: Buffaly-Powered Account Intelligence Platform

## 1. Product Summary

### Product Name
Buffaly Account Intelligence Platform

### Product Concept
A Buffaly-powered sales and account management application for MSPs and technology service providers that integrates PSA, RMM, and security tool data into a unified account command center. The product helps account managers, sales teams, service leaders, and executives understand account health, identify risks and expansion opportunities, generate account-facing artifacts, and push follow-up actions back into the PSA.

### MVP Promise
Help account managers and sales teams understand every customer account, identify risks and opportunities, and take the next best action using data from PSA, RMM, and security tools.

### Product Positioning
The application is not a CRM replacement. It is an account intelligence and action layer that sits above the PSA, RMM, and security stack.

## 2. Problem Statement

MSP account teams have valuable customer data spread across PSA, RMM, Microsoft 365, security platforms, ticketing systems, and finance systems. This creates several problems:

- Account managers do not have a single account view.
- Sales signals hidden in operational tools are missed.
- QBR and renewal preparation is manual and inconsistent.
- Service, sales, and security teams lack a shared account narrative.
- Security and lifecycle risks are not consistently converted into customer conversations or opportunities.
- PSA follow-up hygiene depends heavily on manual effort.
- Leadership lacks a portfolio-level view of account risk and expansion potential.

## 3. Goals

### Business Goals
- Increase account manager productivity.
- Improve renewal readiness and reduce missed follow-ups.
- Convert operational and security signals into tracked sales opportunities.
- Improve consistency and quality of QBR/account review preparation.
- Create a shared account health view across sales, service, and security teams.
- Improve PSA activity and task hygiene.

### User Goals
- Quickly understand what is happening with an account.
- Know which accounts need attention today.
- See why an account is healthy, at risk, or an expansion candidate.
- Generate account briefs, QBR drafts, and customer emails quickly.
- Create follow-up actions in the PSA without duplicate manual entry.
- Trust recommendations because evidence is visible.

### Product Goals
- Provide a unified Account Command Center.
- Generate explainable account health scores.
- Recommend next best actions using PSA, RMM, and security signals.
- Generate account-facing and internal artifacts.
- Push approved actions back into the PSA.
- Support portfolio views for risk, renewals, and expansion.

## 4. Non-Goals for MVP

The MVP will not include:

- Full CRM replacement.
- Quote/proposal generation.
- Commission tracking.
- Full project management.
- Full BI/data warehouse capabilities.
- Advanced custom workflow builder.
- Automated customer outreach without human approval.
- Multi-tenant white-label customer portal.
- Deep ticket sentiment analysis unless available with low implementation cost.
- Integrations with every PSA/RMM/security tool at launch.

## 5. Target Users and Personas

### Account Manager
Responsible for customer relationship, renewals, account growth, and customer communication.

Needs:
- Call prep.
- Account health summary.
- Renewal and QBR readiness.
- Next best actions.
- Customer email drafts.

### Sales Representative
Responsible for identifying and closing expansion opportunities.

Needs:
- Expansion candidates.
- Product/service gaps.
- Technical evidence for business conversations.
- Opportunity creation.

### Service Manager
Responsible for service delivery performance and escalations.

Needs:
- Accounts with recurring service issues.
- Aging tickets and SLA risks.
- Service-related account health signals.

### Security Lead
Responsible for security posture, incidents, and security recommendations.

Needs:
- Accounts with critical security gaps.
- Security findings translated into business impact.
- Customer-ready security summaries.

### Executive / Leadership
Responsible for portfolio performance and revenue/risk visibility.

Needs:
- Accounts at risk.
- Renewals coming due.
- Expansion candidates.
- Account health portfolio view.

## 6. MVP Scope

The MVP consists of six core capabilities:

1. Account Command Center.
2. Account Health Score.
3. Next Best Action Recommendations.
4. PSA Task, Note, and Opportunity Creation.
5. Account Brief and QBR Draft Generator.
6. Portfolio Views for at-risk, renewal, and expansion accounts.

## 7. Core Features

### 7.1 Account Command Center

#### Description
A unified account page that combines PSA, RMM, and security data into one account-level view.

#### Requirements
The Account Command Center must show:

- Account overview:
  - Company name.
  - Account owner.
  - Primary contacts.
  - Agreement type.
  - Renewal date.
  - MRR or recurring revenue when available.
  - Account status.

- Service health:
  - Open tickets.
  - Tickets by priority.
  - Aging tickets.
  - Recurring ticket categories.
  - SLA risk.
  - Recent escalations.

- RMM health:
  - Total endpoints and servers.
  - Offline devices.
  - Devices needing attention.
  - Patch status.
  - Aging operating systems.
  - Warranty/lifecycle risks when available.

- Security posture:
  - Critical/high findings.
  - Endpoint security coverage.
  - MFA or identity security gaps where available.
  - Recent incidents or alerts.
  - Vulnerability/compliance issues where available.

- Revenue and renewal context:
  - Current agreement.
  - Renewal date.
  - Open opportunities.
  - Products/services currently attached.
  - Missing recommended services.

- Buffaly-generated account brief:
  - Plain-English account summary.
  - Key risks.
  - Key opportunities.
  - Recommended next actions.

#### Acceptance Criteria
- User can search/select an account and view unified account data.
- Account data includes at least one PSA source and one technical source.
- Each AI-generated summary includes source evidence or references.
- Missing/stale data is clearly identified.

### 7.2 Account Health Score

#### Description
An explainable account health indicator generated from service, renewal, security, and lifecycle signals.

#### MVP Categories
- Healthy.
- Watch.
- At Risk.
- Expansion Candidate.
- Renewal Risk.

#### Requirements
- Score must include a human-readable explanation.
- Score must show the top contributing factors.
- Score must be recalculated when account data refreshes.
- Admins should be able to configure basic thresholds.

#### Example Output
Watch: Acme has 14 open tickets, 3 tickets aging over 10 days, 22 endpoints missing recent patches, and a renewal in 67 days.

#### Acceptance Criteria
- Each account receives at least one health classification.
- Score explanation references concrete account signals.
- User can see why the score was assigned.

### 7.3 Next Best Action Recommendations

#### Description
Buffaly recommends prioritized actions for each account based on account health, risk, renewal, service, and security signals.

#### MVP Recommendation Types
- Schedule QBR.
- Create renewal follow-up.
- Draft security risk email.
- Review agreement profitability or coverage.
- Open opportunity for endpoint/security/lifecycle need.
- Escalate aging ticket trend.
- Create lifecycle replacement discussion.
- Recommend backup/security assessment.
- Follow up on inactive opportunity.

#### Requirements
Each recommendation must include:
- Action title.
- Reason.
- Evidence/source signals.
- Suggested owner.
- Suggested due date.
- Available action button where applicable.

#### Acceptance Criteria
- User sees 3-5 recommendations for accounts with sufficient data.
- User can understand why each recommendation was made.
- User can dismiss, copy, or convert a recommendation into a PSA task/opportunity where supported.

### 7.4 PSA Task, Note, and Opportunity Creation

#### Description
Approved recommendations can be pushed back into the PSA.

#### Requirements
The MVP must support:
- Create PSA activity/note.
- Create follow-up task.
- Create opportunity.
- Assign task to account owner.
- Set due date.
- Include source summary/evidence in the created record.

#### Acceptance Criteria
- User can create at least one follow-up task in the PSA from a recommendation.
- User can create a note/activity containing the generated account summary.
- User can create an opportunity with title, account, reason, and source evidence.
- System confirms successful write-back or shows actionable error.

### 7.5 Account Brief and QBR Draft Generator

#### Description
Buffaly generates structured account review content using recent account data.

#### Inputs
- Account.
- Date range, default last 90 days.
- Audience: internal, customer-facing, executive.
- Optional focus: security, service, renewal, roadmap.

#### Output Sections
- Executive summary.
- Service performance summary.
- Ticket trends.
- Endpoint/RMM health.
- Security posture.
- Business risks.
- Completed work.
- Recommendations.
- Proposed next steps.
- Source appendix/details.

#### Acceptance Criteria
- User can generate a draft account brief for an account.
- User can generate a QBR/account review draft for the last 90 days.
- Draft includes visible source data/evidence.
- Draft can be copied, exported, or attached to the account where supported.

### 7.6 Portfolio Views

#### Description
Cross-account views that help teams prioritize work across the book of business.

#### MVP Views
- Accounts At Risk.
- Renewals in Next 90 Days.
- Expansion Candidates.
- Accounts Missing Security Coverage.
- Accounts with Critical Security Findings.
- Accounts with Aging Ticket Problems.
- Accounts Needing QBR.
- Accounts with Lifecycle Risk.
- Inactive Opportunities.

#### Requirements
- Each view must show account name, account owner, reason for inclusion, and recommended action.
- User can drill into Account Command Center.
- User can filter by account owner and date range where applicable.

#### Acceptance Criteria
- Leadership can view at-risk accounts across the portfolio.
- Account managers can filter to their own accounts.
- Each account in a portfolio view has an evidence-backed reason.

## 8. Data and Integration Requirements

### First Integration Strategy
Start with one PSA, one RMM, and one security or Microsoft 365 source.

Recommended priority:
1. PSA first.
2. RMM second.
3. Microsoft 365/security third.

### PSA Data
Required:
- Accounts/companies.
- Contacts.
- Account owners.
- Agreements/contracts.
- Renewal dates if available.
- Tickets/service requests.
- Ticket status, priority, category, age.
- Activities/tasks/notes.
- Opportunities.

### RMM Data
Required:
- Clients/sites.
- Devices.
- Servers/workstations.
- Online/offline state.
- Patch status.
- Operating system.
- Device age/lifecycle fields where available.
- Alerts where available.

### Security/M365 Data
Required where available:
- Tenant/account mapping.
- Security incidents/alerts.
- Endpoint protection coverage.
- MFA/identity posture.
- Risky users/sign-ins.
- Vulnerabilities/findings.
- Compliance/control gaps.

### Data Freshness
The system must show:
- Last PSA sync.
- Last RMM sync.
- Last security sync.
- Missing data warnings.
- Disconnected integration warnings.
- Unmatched account mappings.

## 9. Account Mapping and Identity Resolution

### Description
The system must map the same customer across PSA, RMM, and security systems.

### Requirements
- Account mapping table.
- Suggested matches.
- Manual override.
- Confidence score.
- Unmatched records queue.
- Support for aliases/domains.

### Acceptance Criteria
- User can see linked records for an account across systems.
- User can manually correct a bad match.
- Unmapped customers are visible in an admin queue.

## 10. Buffaly-Specific Requirements

### Ontology
Buffaly should model core business objects:
- Account.
- Contact.
- Account owner.
- Agreement.
- Renewal.
- Ticket.
- Device.
- Security finding.
- Opportunity.
- Activity/task.
- QBR/account review.
- Recommendation.
- Account health score.

### Typed Actions / Skills
Buffaly should expose repeatable typed actions:
- Get account command center summary.
- Match account across systems.
- Calculate account health.
- Find account risks.
- Find expansion opportunities.
- Generate account brief.
- Generate QBR draft.
- Draft customer email.
- Create PSA follow-up task.
- Create PSA note.
- Create PSA opportunity.
- List accounts at risk.
- List renewals in next 90 days.
- List expansion candidates.
- Explain recommendation evidence.

### Prompt/Policy Knowledge
Buffaly should learn company-specific rules:
- Account health definitions.
- QBR format.
- Sales/service handoff process.
- Opportunity qualification criteria.
- Customer communication tone.
- Required PSA fields.
- Service catalog and package definitions.

## 11. User Experience Requirements

### Primary User Flow
1. User opens an account.
2. System loads PSA, RMM, and security context.
3. Buffaly summarizes account health.
4. User reviews risks and opportunities.
5. User generates an account brief or QBR draft.
6. User approves a recommended next action.
7. System creates PSA task/note/opportunity.
8. User sees confirmation and source evidence.

### UX Principles
- Evidence-first recommendations.
- Human approval before external action.
- Clear distinction between source data and AI-generated summary.
- Fast account lookup.
- Drill-down from portfolio view to account detail.
- Visible data freshness and confidence.

## 12. Security, Privacy, and Governance

### Requirements
- Role-based access control.
- Integration credential protection.
- Audit log for PSA write-back actions.
- Human approval before customer-facing communication is sent.
- Clear source attribution for AI summaries.
- Tenant/customer data isolation if multi-tenant.
- No silent automated external outreach in MVP.

## 13. Success Metrics

### Adoption Metrics
- Weekly active account managers.
- Number of account briefs generated.
- Number of QBR drafts generated.
- Number of portfolio views used.

### Productivity Metrics
- Reduction in average QBR preparation time.
- Reduction in account research time before customer calls.
- Increase in PSA follow-up task creation.

### Revenue/Account Metrics
- Number of opportunities created from operational/security signals.
- Renewal follow-ups created before renewal date.
- Expansion candidates contacted.
- At-risk accounts reviewed.

### Trust Metrics
- Recommendation acceptance rate.
- Recommendation dismissal rate and reasons.
- User-reported accuracy of account summaries.

## 14. MVP Release Phases

### Phase 1: Data Foundation
- PSA connector.
- RMM connector.
- One security/M365 connector.
- Unified account model.
- Account mapping/admin queue.
- Data freshness indicators.

### Phase 2: Account Command Center
- Unified account page.
- Service/RMM/security summaries.
- Buffaly account brief.
- Evidence drill-down.

### Phase 3: Scoring and Recommendations
- Account health score.
- Next best actions.
- Portfolio views for at-risk, renewal, and expansion accounts.

### Phase 4: Action and Artifact Generation
- Generate account brief.
- Generate QBR draft.
- Draft customer email.
- Create PSA task/note/opportunity.

## 15. Open Questions

- Which PSA should be the first supported integration?
- Which RMM should be the first supported integration?
- Which security/M365 source should be included in MVP?
- Should the MVP target internal MSP usage first or be designed as a sellable SaaS from day one?
- What source system owns account owner and renewal date?
- What fields are required for opportunity creation in the selected PSA?
- What account health thresholds should be configurable at launch?
- Should QBR output initially be markdown/html, PDF, PowerPoint, or PSA attachment?

## 16. Recommended MVP Definition

The first complete MVP should ship with:

1. Account Command Center.
2. Account Health Score.
3. Next Best Action Recommendations.
4. PSA write-back for task, note, and opportunity.
5. Account brief/QBR draft generation.
6. Portfolio views for at-risk accounts, renewals, and expansion candidates.
7. Account mapping and data freshness visibility.

This scope is large enough to prove meaningful value but narrow enough to avoid becoming a full CRM, BI platform, or workflow automation suite.
