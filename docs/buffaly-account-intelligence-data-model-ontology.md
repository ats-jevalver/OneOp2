
# Data Model and Buffaly Ontology: Account Intelligence Platform

## 1. Purpose

This document defines the MVP data model and Buffaly ontology for the Buffaly-powered Account Intelligence Platform. The model is designed to unify PSA, RMM, Microsoft 365, and security data into account-level intelligence, recommendations, generated account artifacts, and PSA write-back workflows.

The data model has four goals:

1. Create a canonical account view across systems.
2. Preserve source-system evidence and traceability.
3. Give Buffaly typed business objects it can reason over.
4. Support repeatable typed actions for account summaries, scoring, recommendations, QBRs, and PSA write-back.

## 2. Design Principles

- Account is the central aggregate root.
- Source systems remain systems of record.
- Buffaly stores canonical references, summaries, mappings, and derived intelligence.
- Every AI-generated recommendation must be explainable from source evidence.
- Write-back actions require human approval.
- Use stable external IDs for all integrated records.
- Do not silently merge uncertain account identities.
- Separate raw source observations from derived Buffaly insights.
- Keep MVP schema simple enough to implement, but structured enough to extend.

## 3. Canonical Domain Areas

The MVP ontology is organized into these domains:

1. Account identity and ownership.
2. Contacts and relationships.
3. Agreements, renewals, and revenue context.
4. Service/ticket health.
5. Endpoint and RMM health.
6. Security posture.
7. Opportunities and sales activity.
8. Account health scoring.
9. Recommendations and next best actions.
10. Generated account artifacts.
11. Source-system mappings and data freshness.
12. Buffaly actions, skills, and prompts.

## 4. Core Entity List

### Account
The canonical customer/company record used by the application.

### AccountExternalIdentity
A mapping between the canonical Account and records in PSA, RMM, security, Microsoft 365, or other systems.

### AccountOwner
The person responsible for the commercial or relationship management of an account.

### Contact
A customer-side person associated with an account.

### Agreement
A customer agreement, contract, managed service plan, or recurring service relationship.

### Renewal
A renewal event associated with an agreement, subscription, license, or service.

### Ticket
A PSA service ticket, incident, request, escalation, or issue.

### TicketTrend
A derived summary of ticket volume, aging, category recurrence, or SLA risk.

### Device
An endpoint, server, workstation, network device, or managed asset discovered through RMM or another technical system.

### DeviceHealthSignal
A specific RMM or lifecycle signal associated with a device.

### SecurityFinding
A security alert, incident, vulnerability, risky configuration, missing control, or compliance issue.

### SecurityCoverage
A representation of whether an account or device is covered by key security services.

### Opportunity
A sales opportunity, expansion opportunity, renewal opportunity, or recommended opportunity.

### Activity
A PSA note, task, call, meeting, or follow-up activity.

### AccountHealthScore
A derived, explainable classification of account condition.

### Recommendation
A Buffaly-generated next best action for an account.

### EvidenceItem
A source-backed fact used to explain a score, recommendation, or generated artifact.

### GeneratedArtifact
A Buffaly-generated account brief, QBR draft, email draft, executive summary, or internal handoff note.

### IntegrationConnection
A configured PSA, RMM, security, Microsoft 365, or other integration.

### SyncRun
A record of a sync attempt, success/failure state, and freshness metadata.

## 5. High-Level Relationship Model

- Account has many AccountExternalIdentities.
- Account has many Contacts.
- Account has one or more AccountOwners over time.
- Account has many Agreements.
- Agreement has many Renewals.
- Account has many Tickets.
- Account has many TicketTrends.
- Account has many Devices.
- Device has many DeviceHealthSignals.
- Account has many SecurityFindings.
- Account has many SecurityCoverage records.
- Account has many Opportunities.
- Account has many Activities.
- Account has many AccountHealthScores over time.
- Account has many Recommendations.
- Recommendation has many EvidenceItems.
- AccountHealthScore has many EvidenceItems.
- GeneratedArtifact has many EvidenceItems.
- GeneratedArtifact may reference Recommendations.
- IntegrationConnection has many SyncRuns.
- AccountExternalIdentity belongs to one IntegrationConnection.

## 6. Entity Definitions

### 6.1 Account

#### Description
Canonical customer/account object. This is the primary object users open, search, score, and act on.

#### Required Fields
- AccountId: internal canonical ID.
- DisplayName: customer/account name.
- Status: Active, Inactive, Prospect, Former, Unknown.
- PrimaryDomain: customer primary email/domain when known.
- CreatedAt.
- UpdatedAt.

#### Recommended Fields
- LegalName.
- ShortName.
- Industry.
- Segment.
- EmployeeCount.
- LocationCount.
- AccountTier.
- AccountManagerUserId.
- ServiceManagerUserId.
- SecurityOwnerUserId.
- PrimaryPsaCompanyId.
- PrimaryRmmClientId.
- PrimarySecurityTenantId.
- Notes.

#### Source Systems
- PSA is usually the initial system of record.
- RMM and security tools provide supplemental identity records.

#### Buffaly Ontology Prototype
AccountEntity.

### 6.2 AccountExternalIdentity

#### Description
Maps one canonical account to a source-system record.

#### Required Fields
- AccountExternalIdentityId.
- AccountId.
- IntegrationConnectionId.
- SourceSystemType: PSA, RMM, Security, Microsoft365, Finance, Other.
- SourceSystemName.
- ExternalRecordType.
- ExternalRecordId.
- ExternalDisplayName.
- MatchStatus: Suggested, Confirmed, Rejected, NeedsReview.
- MatchConfidence: 0-100.

#### Recommended Fields
- ExternalDomain.
- ExternalTenantId.
- ExternalUrl.
- MatchedBy: System, User, Import.
- MatchedAt.
- MatchReason.
- AliasUsed.

#### Buffaly Ontology Prototype
AccountExternalIdentityEntity.

### 6.3 AccountOwner

#### Description
A user responsible for the account commercially, operationally, or from a security perspective.

#### Required Fields
- AccountOwnerId.
- AccountId.
- UserId.
- Role: AccountManager, SalesRep, ServiceManager, SecurityLead, ExecutiveSponsor.
- EffectiveFrom.

#### Recommended Fields
- EffectiveTo.
- IsPrimary.
- SourceSystemName.
- ExternalOwnerId.

#### Buffaly Ontology Prototype
AccountOwnerEntity.

### 6.4 Contact

#### Description
A customer-side person related to an account.

#### Required Fields
- ContactId.
- AccountId.
- FullName.
- Email.
- Status: Active, Inactive, Unknown.

#### Recommended Fields
- Title.
- Phone.
- MobilePhone.
- Department.
- IsPrimaryContact.
- IsBillingContact.
- IsTechnicalContact.
- IsExecutiveContact.
- RelationshipStrength: Strong, Medium, Weak, Unknown.
- LastInteractionAt.
- SourceSystemName.
- ExternalContactId.

#### Buffaly Ontology Prototype
ContactEntity.

### 6.5 Agreement

#### Description
A contract, managed service agreement, subscription, or recurring service plan.

#### Required Fields
- AgreementId.
- AccountId.
- Name.
- Status: Active, Pending, Expired, Cancelled, Unknown.
- StartDate.

#### Recommended Fields
- EndDate.
- RenewalDate.
- AutoRenew.
- AgreementType.
- BillingFrequency.
- MonthlyRecurringRevenue.
- AnnualRecurringRevenue.
- GrossMarginPercent.
- IncludedServices.
- SourceSystemName.
- ExternalAgreementId.

#### Buffaly Ontology Prototype
AgreementEntity.

### 6.6 Renewal

#### Description
A renewal event or renewal risk associated with an agreement, subscription, service, or license.

#### Required Fields
- RenewalId.
- AccountId.
- RenewalType: Agreement, License, Service, SecurityProduct, Other.
- RenewalDate.
- Status: Upcoming, InProgress, Complete, AtRisk, Missed, Unknown.

#### Recommended Fields
- AgreementId.
- OpportunityId.
- RenewalAmount.
- OwnerUserId.
- DaysUntilRenewal.
- RiskReason.
- SourceSystemName.
- ExternalRecordId.

#### Buffaly Ontology Prototype
RenewalEntity.

### 6.7 Ticket

#### Description
A PSA service ticket, incident, request, problem, or escalation.

#### Required Fields
- TicketId.
- AccountId.
- ExternalTicketId.
- SourceSystemName.
- Title.
- Status.
- Priority.
- CreatedAt.

#### Recommended Fields
- ClosedAt.
- LastUpdatedAt.
- AgeDays.
- Category.
- Subcategory.
- Type.
- AssignedTeam.
- AssignedUserId.
- SlaStatus.
- IsEscalated.
- IsRecurringIssueCandidate.
- ContactId.
- Summary.
- ExternalUrl.

#### Buffaly Ontology Prototype
TicketEntity.

### 6.8 TicketTrend

#### Description
A derived account-level summary of service patterns.

#### Required Fields
- TicketTrendId.
- AccountId.
- PeriodStart.
- PeriodEnd.
- TrendType: Volume, Aging, Recurrence, SLA, Escalation, Category.
- Summary.

#### Recommended Fields
- TicketCount.
- OpenTicketCount.
- AgingTicketCount.
- HighPriorityTicketCount.
- TopCategories.
- SlaRiskCount.
- PreviousPeriodComparison.
- EvidenceItemIds.

#### Buffaly Ontology Prototype
TicketTrendEntity.

### 6.9 Device

#### Description
An endpoint, server, workstation, network device, or other managed asset.

#### Required Fields
- DeviceId.
- AccountId.
- SourceSystemName.
- ExternalDeviceId.
- DisplayName.
- DeviceType: Server, Workstation, NetworkDevice, MobileDevice, VirtualMachine, Other, Unknown.
- Status: Online, Offline, Retired, Unknown.

#### Recommended Fields
- SiteName.
- OperatingSystem.
- OperatingSystemVersion.
- Manufacturer.
- Model.
- SerialNumber.
- LastSeenAt.
- LastPatchedAt.
- PatchStatus: Current, Behind, CriticalMissing, Unknown.
- WarrantyExpirationDate.
- InstallDate.
- AgeYears.
- IsEndOfLife.
- IsServer.
- IsCritical.
- ExternalUrl.

#### Buffaly Ontology Prototype
DeviceEntity.

### 6.10 DeviceHealthSignal

#### Description
A device-level health, lifecycle, or management signal.

#### Required Fields
- DeviceHealthSignalId.
- AccountId.
- DeviceId.
- SignalType: Offline, PatchMissing, RebootRequired, DiskSpace, BackupIssue, WarrantyExpired, EndOfLife, AgentIssue, Other.
- Severity: Informational, Low, Medium, High, Critical.
- ObservedAt.
- Summary.

#### Recommended Fields
- SourceSystemName.
- ExternalAlertId.
- RemediationStatus.
- ExternalUrl.

#### Buffaly Ontology Prototype
DeviceHealthSignalEntity.

### 6.11 SecurityFinding

#### Description
A security alert, vulnerability, risky configuration, missing control, or compliance finding.

#### Required Fields
- SecurityFindingId.
- AccountId.
- SourceSystemName.
- ExternalFindingId.
- FindingType: Alert, Incident, Vulnerability, MissingControl, RiskyUser, RiskySignIn, ComplianceGap, CoverageGap, Other.
- Severity: Informational, Low, Medium, High, Critical.
- Status: Open, InProgress, Resolved, AcceptedRisk, Unknown.
- Title.
- ObservedAt.

#### Recommended Fields
- AffectedUser.
- AffectedDeviceId.
- AffectedService.
- BusinessImpact.
- RecommendedRemediation.
- DueDate.
- ExternalUrl.
- IsCustomerFacing.

#### Buffaly Ontology Prototype
SecurityFindingEntity.

### 6.12 SecurityCoverage

#### Description
Represents security service/product coverage for an account or device.

#### Required Fields
- SecurityCoverageId.
- AccountId.
- CoverageType: EDR, MDR, AV, Backup, MFA, EmailSecurity, DNSFiltering, VulnerabilityManagement, SIEM, AwarenessTraining, Other.
- CoverageStatus: Covered, Partial, Missing, Unknown.

#### Recommended Fields
- DeviceId.
- UserCountCovered.
- DeviceCountCovered.
- DeviceCountMissing.
- ProductName.
- VendorName.
- SourceSystemName.
- LastVerifiedAt.
- EvidenceItemIds.

#### Buffaly Ontology Prototype
SecurityCoverageEntity.

### 6.13 Opportunity

#### Description
A sales opportunity from the PSA or a Buffaly-recommended opportunity based on account evidence.

#### Required Fields
- OpportunityId.
- AccountId.
- Title.
- Status: Suggested, Open, Won, Lost, Dismissed, Unknown.
- OpportunityType: Renewal, Expansion, Security, Lifecycle, Project, ServiceChange, Other.

#### Recommended Fields
- EstimatedAmount.
- Stage.
- Probability.
- OwnerUserId.
- ExpectedCloseDate.
- Source: PSA, BuffalyRecommendation, Manual.
- RecommendationId.
- ExternalOpportunityId.
- ExternalUrl.
- CreatedAt.
- UpdatedAt.

#### Buffaly Ontology Prototype
OpportunityEntity.

### 6.14 Activity

#### Description
A task, note, call, meeting, or follow-up activity, usually synchronized with the PSA.

#### Required Fields
- ActivityId.
- AccountId.
- ActivityType: Task, Note, Call, Meeting, EmailDraft, FollowUp, Other.
- Title.
- Status: Draft, Open, Complete, Cancelled, Unknown.
- CreatedAt.

#### Recommended Fields
- DueDate.
- OwnerUserId.
- Body.
- Source: PSA, Buffaly, Manual.
- ExternalActivityId.
- ExternalUrl.
- RecommendationId.
- GeneratedArtifactId.

#### Buffaly Ontology Prototype
ActivityEntity.

### 6.15 AccountHealthScore

#### Description
A derived, explainable account classification produced by Buffaly.

#### Required Fields
- AccountHealthScoreId.
- AccountId.
- ScoreCategory: Healthy, Watch, AtRisk, ExpansionCandidate, RenewalRisk.
- ScoreValue: 0-100 when numeric scoring is enabled.
- Summary.
- CalculatedAt.

#### Recommended Fields
- PeriodStart.
- PeriodEnd.
- ServiceHealthComponent.
- RmmHealthComponent.
- SecurityHealthComponent.
- RenewalRiskComponent.
- ExpansionPotentialComponent.
- Confidence: Low, Medium, High.
- EvidenceItemIds.

#### Buffaly Ontology Prototype
AccountHealthScoreEntity.

### 6.16 Recommendation

#### Description
A Buffaly-generated next best action for an account.

#### Required Fields
- RecommendationId.
- AccountId.
- RecommendationType: ScheduleQBR, RenewalFollowUp, SecurityRiskEmail, ReviewAgreement, OpenOpportunity, EscalateTicketTrend, LifecycleDiscussion, SecurityAssessment, FollowUpOpportunity, Other.
- Title.
- Reason.
- Priority: Low, Medium, High, Critical.
- Status: New, Accepted, Dismissed, ConvertedToTask, ConvertedToOpportunity, Completed.
- CreatedAt.

#### Recommended Fields
- SuggestedOwnerUserId.
- SuggestedDueDate.
- RelatedOpportunityId.
- RelatedActivityId.
- RelatedGeneratedArtifactId.
- Confidence: Low, Medium, High.
- DismissalReason.
- EvidenceItemIds.

#### Buffaly Ontology Prototype
RecommendationEntity.

### 6.17 EvidenceItem

#### Description
A source-backed fact used to explain generated scores, recommendations, and artifacts.

#### Required Fields
- EvidenceItemId.
- AccountId.
- SourceSystemName.
- SourceRecordType.
- SourceRecordId.
- EvidenceType: Ticket, Device, SecurityFinding, Agreement, Renewal, Opportunity, Contact, DerivedMetric, Other.
- Summary.
- ObservedAt.

#### Recommended Fields
- Severity.
- ExternalUrl.
- RawValue.
- NormalizedValue.
- Confidence.
- UsedByType: HealthScore, Recommendation, GeneratedArtifact, Other.
- UsedById.

#### Buffaly Ontology Prototype
EvidenceItemEntity.

### 6.18 GeneratedArtifact

#### Description
A Buffaly-generated document or message draft.

#### Required Fields
- GeneratedArtifactId.
- AccountId.
- ArtifactType: AccountBrief, QBRDraft, CustomerEmailDraft, ExecutiveSummary, InternalHandoff, Other.
- Title.
- Body.
- BodyFormat: Markdown, Html, Text.
- CreatedAt.

#### Recommended Fields
- CreatedByUserId.
- Audience: Internal, CustomerFacing, Executive, Technical.
- PeriodStart.
- PeriodEnd.
- Status: Draft, Approved, Sent, Attached, Archived.
- SourceEvidenceItemIds.
- RelatedRecommendationIds.
- ExternalAttachmentId.
- ExternalUrl.

#### Buffaly Ontology Prototype
GeneratedArtifactEntity.

### 6.19 IntegrationConnection

#### Description
A configured connection to a PSA, RMM, security, Microsoft 365, or other source system.

#### Required Fields
- IntegrationConnectionId.
- SystemType: PSA, RMM, Security, Microsoft365, Finance, Other.
- SystemName.
- Status: Connected, Disconnected, Error, Disabled.
- CreatedAt.

#### Recommended Fields
- TenantIdentifier.
- ApiBaseUrl.
- CredentialReference.
- LastSuccessfulSyncAt.
- LastErrorAt.
- LastErrorMessage.
- OwnerUserId.

#### Buffaly Ontology Prototype
IntegrationConnectionEntity.

### 6.20 SyncRun

#### Description
A record of data synchronization from an external system.

#### Required Fields
- SyncRunId.
- IntegrationConnectionId.
- SyncType: Full, Incremental, Manual, Webhook.
- Status: Started, Succeeded, Failed, Partial.
- StartedAt.

#### Recommended Fields
- CompletedAt.
- RecordsRead.
- RecordsCreated.
- RecordsUpdated.
- RecordsSkipped.
- ErrorMessage.
- WarningCount.

#### Buffaly Ontology Prototype
SyncRunEntity.

## 7. Recommended MVP Tables / Collections

For an MVP implementation, these are the minimum persistent collections:

1. Accounts.
2. AccountExternalIdentities.
3. Contacts.
4. AccountOwners.
5. Agreements.
6. Renewals.
7. Tickets.
8. Devices.
9. DeviceHealthSignals.
10. SecurityFindings.
11. SecurityCoverage.
12. Opportunities.
13. Activities.
14. AccountHealthScores.
15. Recommendations.
16. EvidenceItems.
17. GeneratedArtifacts.
18. IntegrationConnections.
19. SyncRuns.

Derived collections that can be added after MVP:

- TicketTrends.
- AccountTimelineEvents.
- ProductServiceCatalog.
- ServiceGapAnalysis.
- AccountPlan.
- RelationshipMap.
- QBRHistory.

## 8. Source System Mapping

### PSA Mapping

PSA records usually map as follows:

- Company -> Account.
- Contact -> Contact.
- Account Manager / Sales Rep -> AccountOwner.
- Agreement / Contract -> Agreement.
- Agreement End Date -> Renewal.
- Ticket / Service Request -> Ticket.
- Activity / Task / Note -> Activity.
- Opportunity -> Opportunity.

### RMM Mapping

RMM records usually map as follows:

- Client / Customer / Site -> AccountExternalIdentity.
- Endpoint / Asset / Device -> Device.
- Device Alert -> DeviceHealthSignal.
- Patch Status -> DeviceHealthSignal.
- Offline Device -> DeviceHealthSignal.
- Warranty / Lifecycle data -> DeviceHealthSignal.

### Security / Microsoft 365 Mapping

Security and Microsoft 365 records usually map as follows:

- Tenant -> AccountExternalIdentity.
- Incident / Alert -> SecurityFinding.
- Vulnerability -> SecurityFinding.
- Risky User / Risky Sign-in -> SecurityFinding.
- Missing MFA / Conditional Access gap -> SecurityFinding or SecurityCoverage.
- Defender/EDR coverage -> SecurityCoverage.
- Email security coverage -> SecurityCoverage.

## 9. Account Identity Resolution Rules

### Matching Inputs
Use these fields to suggest account matches:

- PSA company name.
- RMM client name.
- Microsoft 365 tenant name.
- Security tenant/customer name.
- Primary email domain.
- Website domain.
- Billing domain.
- Known aliases.
- External tenant IDs.

### Match Confidence Guidelines

High confidence:
- Exact domain match.
- Exact external tenant ID match.
- Exact normalized company name plus matching domain.

Medium confidence:
- Similar normalized company name and similar domain.
- Known alias match.
- RMM site name clearly belongs to PSA company.

Low confidence:
- Similar company name only.
- Abbreviated names with no domain match.
- Multiple possible matches.

### Required Rules
- Auto-link only high-confidence matches.
- Send medium and low-confidence matches to review.
- Never merge two canonical accounts automatically.
- Keep rejected matches so they are not suggested repeatedly.

## 10. Derived Intelligence Model

Buffaly-generated intelligence should be stored separately from source data.

### AccountHealthScore Inputs
- Open ticket count.
- Aging ticket count.
- High-priority ticket count.
- SLA risk count.
- Recurring ticket categories.
- Offline/at-risk device count.
- Missing patch count.
- End-of-life device count.
- Critical/high security findings.
- Security coverage gaps.
- Renewal date proximity.
- Inactive opportunities.
- Missing QBR or stale customer engagement.

### Recommendation Inputs
- AccountHealthScore.
- EvidenceItems.
- Open renewals.
- Service trends.
- Security gaps.
- Lifecycle risks.
- Missing services.
- Open/inactive opportunities.
- Account owner and role mapping.

### Evidence Requirements
Every AccountHealthScore and Recommendation should have:

- Evidence summary.
- Source system name.
- Source record type.
- Source record ID or external URL when available.
- Observation date.

## 11. Buffaly Ontology Design

### Entity Root
Create a domain root such as:

- AccountIntelligenceEntityRoot.

### Entity Prototypes
Recommended Buffaly entity prototypes:

- AccountEntity.
- AccountExternalIdentityEntity.
- AccountOwnerEntity.
- ContactEntity.
- AgreementEntity.
- RenewalEntity.
- TicketEntity.
- TicketTrendEntity.
- DeviceEntity.
- DeviceHealthSignalEntity.
- SecurityFindingEntity.
- SecurityCoverageEntity.
- OpportunityEntity.
- ActivityEntity.
- AccountHealthScoreEntity.
- RecommendationEntity.
- EvidenceItemEntity.
- GeneratedArtifactEntity.
- IntegrationConnectionEntity.
- SyncRunEntity.

### Skill Prototypes
Recommended Buffaly skills:

- AccountIntelligenceSkill.
- AccountMappingSkill.
- PsaIntegrationSkill.
- RmmIntegrationSkill.
- SecurityIntegrationSkill.
- AccountRecommendationSkill.
- AccountArtifactGenerationSkill.

### Typed Action Prototypes
Recommended Buffaly typed actions:

- ToGetAccountCommandCenterSummary.
- ToMatchAccountAcrossSystems.
- ToListUnmappedAccountRecords.
- ToConfirmAccountExternalIdentityMatch.
- ToRejectAccountExternalIdentityMatch.
- ToCalculateAccountHealthScore.
- ToFindAccountRisks.
- ToFindExpansionOpportunities.
- ToGenerateAccountBrief.
- ToGenerateQbrDraft.
- ToDraftCustomerEmailForAccount.
- ToCreatePsaFollowUpTask.
- ToCreatePsaNote.
- ToCreatePsaOpportunity.
- ToListAccountsAtRisk.
- ToListRenewalsInNextDays.
- ToListExpansionCandidateAccounts.
- ToExplainRecommendationEvidence.
- ToRefreshAccountData.
- ToGetIntegrationFreshnessStatus.

## 12. Example Account Aggregate Shape

```json
{
  "account": {
    "accountId": "acct_123",
    "displayName": "Acme Corp",
    "status": "Active",
    "primaryDomain": "acme.com"
  },
  "externalIdentities": [
    {
      "sourceSystemType": "PSA",
      "sourceSystemName": "Example PSA",
      "externalRecordId": "12345",
      "matchStatus": "Confirmed"
    }
  ],
  "healthScore": {
    "scoreCategory": "Watch",
    "summary": "Acme has aging tickets, patch gaps, and a renewal in 67 days."
  },
  "recommendations": [
    {
      "recommendationType": "ScheduleQBR",
      "title": "Schedule renewal-focused QBR",
      "priority": "High",
      "reason": "Renewal is within 90 days and service issues are trending upward."
    }
  ]
}
```

## 13. Implementation Notes

- Use PSA company as the initial seed for Accounts.
- Sync RMM/security records into staging before matching.
- Require source-system IDs on all integrated records.
- Store generated summaries and recommendations with timestamps.
- Use EvidenceItems as the bridge between raw data and AI explanations.
- Keep write-back operations idempotent where possible.
- Log every PSA write-back action for auditability.
- Keep customer-facing artifacts in draft state until human approval.

## 14. MVP Data Model Acceptance Criteria

- Each account has at least one confirmed source identity.
- Each account can show PSA-derived account/service context.
- Each account can show at least one technical context source from RMM or security.
- Health scores include evidence-backed explanations.
- Recommendations include evidence, owner, priority, and suggested action.
- Users can review and correct account mappings.
- Generated artifacts preserve source evidence.
- PSA write-back records are traceable to recommendations or artifacts.
