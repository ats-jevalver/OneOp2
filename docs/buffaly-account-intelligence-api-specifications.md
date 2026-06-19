
# API Endpoint Specifications: Buffaly Account Intelligence Platform MVP

## 1. Purpose

This document defines MVP API endpoint specifications for the Buffaly-powered Account Intelligence Platform. The API supports the Account Command Center UX, integrations, account identity resolution, account health scoring, recommendations, generated artifacts, PSA write-back, portfolio views, admin settings, and analytics.

The API should expose product-oriented endpoints to the frontend while using Buffaly typed actions for reasoning, artifact generation, recommendations, and orchestration.

## 2. API Style

Recommended MVP style: REST over HTTPS with JSON request/response bodies.

Future options:
- GraphQL for highly flexible Account Command Center queries.
- Webhooks for integration sync updates.
- Streaming endpoints for long-running Buffaly generation tasks.

## 3. Base URL

```text
/api/v1
```

## 4. Authentication and Authorization

### Authentication
All endpoints require authenticated user context unless explicitly marked public. The MVP assumes session, JWT, or identity-provider-backed authentication.

### Authorization Roles
Recommended roles:

- admin
- account_manager
- sales_rep
- service_manager
- security_lead
- executive
- viewer

### Permission Principles
- Read access can be broad for internal MVP, but should be account-scoped if customer data isolation is required.
- Integration configuration requires admin.
- Account mapping changes require admin or authorized operations role.
- PSA write-back requires account_manager, sales_rep, service_manager, security_lead, executive, or admin depending on action type.
- Customer-facing artifact generation is allowed, but sending customer communication is not part of MVP.

## 5. Common Response Envelope

Use a consistent API envelope.

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-06-18T20:00:00Z"
  },
  "errors": []
}
```

For list endpoints:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-06-18T20:00:00Z",
    "page": 1,
    "pageSize": 25,
    "totalCount": 100
  },
  "errors": []
}
```

## 6. Common Error Shape

```json
{
  "code": "validation_error",
  "message": "AccountId is required.",
  "field": "accountId",
  "details": {}
}
```

Common error codes:
- unauthorized
- forbidden
- not_found
- validation_error
- conflict
- stale_data
- mapping_required
- integration_error
- write_back_failed
- generation_failed
- rate_limited
- internal_error

## 7. Common Query Parameters

### Pagination
- page
- pageSize

### Sorting
- sortBy
- sortDirection: asc, desc

### Filtering
Use explicit filters per endpoint when possible.

### Date Range
- startDate
- endDate
- dateRangePreset: last_30_days, last_90_days, last_180_days, year_to_date, custom

## 8. Common DTOs

### AccountSummaryDto

```json
{
  "accountId": "uuid",
  "displayName": "Acme Corp",
  "primaryDomain": "acme.com",
  "status": "active",
  "accountOwner": {
    "userId": "uuid",
    "displayName": "Jane Smith"
  },
  "health": {
    "category": "watch",
    "summary": "Aging tickets, patch gaps, and renewal in 67 days."
  },
  "renewal": {
    "renewalDate": "2026-08-24",
    "daysUntilRenewal": 67,
    "status": "upcoming"
  },
  "warnings": [
    {
      "type": "data_stale",
      "message": "Security data last synced 9 days ago."
    }
  ]
}
```

### EvidenceItemDto

```json
{
  "evidenceItemId": "uuid",
  "sourceSystemName": "Example RMM",
  "sourceRecordType": "device_health_signal",
  "sourceRecordId": "abc123",
  "sourceRecordUrl": "https://example/source/abc123",
  "evidenceType": "device",
  "summary": "22 endpoints are missing recent patches.",
  "severity": "high",
  "observedAt": "2026-06-18T18:00:00Z"
}
```

### RecommendationDto

```json
{
  "recommendationId": "uuid",
  "accountId": "uuid",
  "type": "schedule_qbr",
  "title": "Schedule renewal-focused QBR",
  "reason": "Renewal is in 67 days and service volume is elevated.",
  "priority": "high",
  "status": "new",
  "suggestedOwner": {
    "userId": "uuid",
    "displayName": "Jane Smith"
  },
  "suggestedDueDate": "2026-06-25",
  "evidenceCount": 5,
  "availableActions": ["create_psa_task", "generate_qbr_draft", "dismiss"]
}
```

## 9. Account Search and Account Command Center

### 9.1 Search Accounts

```http
GET /api/v1/accounts/search?query=acme&page=1&pageSize=10
```

#### Purpose
Search accounts by name, domain, alias, contact, or external source ID.

#### Roles
viewer and above.

#### Response
```json
{
  "data": [
    {
      "accountId": "uuid",
      "displayName": "Acme Corp",
      "primaryDomain": "acme.com",
      "accountOwnerName": "Jane Smith",
      "healthCategory": "watch",
      "renewalDate": "2026-08-24",
      "warnings": []
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 1
  },
  "errors": []
}
```

### 9.2 Get Account Command Center Summary

```http
GET /api/v1/accounts/{accountId}/command-center?dateRangePreset=last_90_days
```

#### Purpose
Load the primary Account Command Center payload.

#### Buffaly Action Mapping
- ToGetAccountCommandCenterSummary.
- ToGetIntegrationFreshnessStatus.

#### Roles
viewer and above.

#### Response Shape
```json
{
  "data": {
    "account": {},
    "header": {},
    "snapshot": {},
    "health": {},
    "renewal": {},
    "dataFreshness": {},
    "brief": {},
    "risks": [],
    "opportunities": [],
    "recommendations": [],
    "timeline": [],
    "warnings": []
  },
  "meta": {},
  "errors": []
}
```

### 9.3 Refresh Account Data

```http
POST /api/v1/accounts/{accountId}/refresh
```

#### Purpose
Trigger account-scoped refresh from configured integrations.

#### Buffaly Action Mapping
- ToRefreshAccountData.

#### Roles
account_manager, service_manager, security_lead, admin.

#### Request
```json
{
  "sources": ["psa", "rmm", "security"],
  "force": false
}
```

#### Response
```json
{
  "data": {
    "refreshId": "uuid",
    "status": "started",
    "message": "Account refresh started."
  },
  "meta": {},
  "errors": []
}
```

## 10. Account Detail Tab Endpoints

### 10.1 Get Service Detail

```http
GET /api/v1/accounts/{accountId}/service?startDate=2026-03-01&endDate=2026-06-18
```

#### Purpose
Return tickets, trends, SLA risks, escalations, and recurring issue candidates.

#### Response Shape
```json
{
  "data": {
    "summary": {
      "openTicketCount": 14,
      "agingTicketCount": 3,
      "highPriorityTicketCount": 2,
      "slaRiskCount": 1
    },
    "trends": [],
    "tickets": []
  },
  "meta": {},
  "errors": []
}
```

### 10.2 Get RMM Detail

```http
GET /api/v1/accounts/{accountId}/rmm
```

#### Purpose
Return devices, patch status, offline devices, lifecycle risks, and RMM health signals.

#### Response Shape
```json
{
  "data": {
    "summary": {
      "deviceCount": 84,
      "serverCount": 9,
      "offlineDeviceCount": 4,
      "patchGapCount": 22,
      "endOfLifeDeviceCount": 7
    },
    "devices": [],
    "healthSignals": []
  },
  "meta": {},
  "errors": []
}
```

### 10.3 Get Security Detail

```http
GET /api/v1/accounts/{accountId}/security
```

#### Purpose
Return security findings, incidents, coverage gaps, risky users/sign-ins, vulnerabilities, and compliance posture where available.

#### Response Shape
```json
{
  "data": {
    "summary": {
      "openFindingCount": 8,
      "criticalFindingCount": 1,
      "highFindingCount": 3,
      "coverageGapCount": 2
    },
    "findings": [],
    "coverage": []
  },
  "meta": {},
  "errors": []
}
```

### 10.4 Get Revenue Detail

```http
GET /api/v1/accounts/{accountId}/revenue
```

#### Purpose
Return agreements, renewals, opportunities, MRR/ARR, and service coverage context.

#### Response Shape
```json
{
  "data": {
    "summary": {
      "monthlyRecurringRevenue": 12500.00,
      "annualRecurringRevenue": 150000.00,
      "nextRenewalDate": "2026-08-24",
      "openOpportunityCount": 2
    },
    "agreements": [],
    "renewals": [],
    "opportunities": []
  },
  "meta": {},
  "errors": []
}
```

### 10.5 Get Contacts Detail

```http
GET /api/v1/accounts/{accountId}/contacts
```

#### Purpose
Return customer contacts and relationship metadata.

#### Response Shape
```json
{
  "data": {
    "contacts": []
  },
  "meta": {},
  "errors": []
}
```

### 10.6 Get Activity Detail

```http
GET /api/v1/accounts/{accountId}/activity?page=1&pageSize=25
```

#### Purpose
Return activities, generated artifacts, recommendation history, and write-back audit events.

#### Response Shape
```json
{
  "data": {
    "items": []
  },
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 50
  },
  "errors": []
}
```

## 11. Evidence and Explainability Endpoints

### 11.1 Get Evidence for Recommendation

```http
GET /api/v1/recommendations/{recommendationId}/evidence
```

#### Purpose
Return evidence items backing a recommendation.

#### Buffaly Action Mapping
- ToExplainRecommendationEvidence.

#### Roles
viewer and above.

#### Response
```json
{
  "data": {
    "recommendationId": "uuid",
    "summary": "This recommendation is based on renewal timing, ticket trend, and patch compliance evidence.",
    "evidence": []
  },
  "meta": {},
  "errors": []
}
```

### 11.2 Get Evidence for Health Score

```http
GET /api/v1/account-health-scores/{accountHealthScoreId}/evidence
```

#### Purpose
Return evidence items backing an account health score.

#### Response
```json
{
  "data": {
    "accountHealthScoreId": "uuid",
    "summary": "The Watch score is driven by service aging, patch gaps, and renewal proximity.",
    "evidence": []
  },
  "meta": {},
  "errors": []
}
```

### 11.3 Get Evidence for Generated Artifact

```http
GET /api/v1/generated-artifacts/{generatedArtifactId}/evidence
```

#### Purpose
Return source evidence used in an account brief, QBR draft, or email draft.

#### Response
```json
{
  "data": {
    "generatedArtifactId": "uuid",
    "evidence": []
  },
  "meta": {},
  "errors": []
}
```

## 12. Account Health Endpoints

### 12.1 Calculate Account Health Score

```http
POST /api/v1/accounts/{accountId}/health-score/calculate
```

#### Purpose
Calculate or recalculate account health.

#### Buffaly Action Mapping
- ToCalculateAccountHealthScore.

#### Roles
account_manager, service_manager, security_lead, executive, admin.

#### Request
```json
{
  "dateRangePreset": "last_90_days",
  "forceRecalculate": true
}
```

#### Response
```json
{
  "data": {
    "accountHealthScoreId": "uuid",
    "category": "watch",
    "scoreValue": 62,
    "summary": "Aging tickets, patch gaps, and renewal proximity put this account in Watch status.",
    "topDrivers": [],
    "evidenceCount": 8,
    "calculatedAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 12.2 Get Latest Account Health Score

```http
GET /api/v1/accounts/{accountId}/health-score/latest
```

#### Purpose
Return latest health score for account.

#### Response
```json
{
  "data": {
    "accountHealthScoreId": "uuid",
    "category": "watch",
    "scoreValue": 62,
    "summary": "Aging tickets, patch gaps, and renewal proximity put this account in Watch status.",
    "calculatedAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

## 13. Recommendation Endpoints

### 13.1 List Account Recommendations

```http
GET /api/v1/accounts/{accountId}/recommendations?status=new&limit=5
```

#### Purpose
Return recommendations for an account.

#### Roles
viewer and above.

#### Response
```json
{
  "data": [
    {
      "recommendationId": "uuid",
      "type": "schedule_qbr",
      "title": "Schedule renewal-focused QBR",
      "reason": "Renewal is in 67 days and ticket volume is elevated.",
      "priority": "high",
      "status": "new",
      "evidenceCount": 5,
      "availableActions": ["create_psa_task", "generate_qbr_draft", "dismiss"]
    }
  ],
  "meta": {},
  "errors": []
}
```

### 13.2 Generate Account Recommendations

```http
POST /api/v1/accounts/{accountId}/recommendations/generate
```

#### Purpose
Generate or refresh next best action recommendations.

#### Buffaly Action Mapping
- ToFindAccountRisks.
- ToFindExpansionOpportunities.

#### Roles
account_manager, sales_rep, service_manager, security_lead, executive, admin.

#### Request
```json
{
  "dateRangePreset": "last_90_days",
  "maxRecommendations": 5,
  "forceRegenerate": false
}
```

#### Response
```json
{
  "data": {
    "recommendations": [],
    "generatedAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 13.3 Update Recommendation Status

```http
PATCH /api/v1/recommendations/{recommendationId}
```

#### Purpose
Dismiss, snooze, accept, or complete a recommendation.

#### Request
```json
{
  "status": "dismissed",
  "dismissalReason": "Not relevant this quarter",
  "snoozedUntil": null
}
```

#### Response
```json
{
  "data": {
    "recommendationId": "uuid",
    "status": "dismissed"
  },
  "meta": {},
  "errors": []
}
```

## 14. Generated Artifact Endpoints

### 14.1 Generate Account Brief

```http
POST /api/v1/accounts/{accountId}/artifacts/account-brief
```

#### Purpose
Generate an internal account brief.

#### Buffaly Action Mapping
- ToGenerateAccountBrief.

#### Roles
account_manager, sales_rep, service_manager, security_lead, executive, admin.

#### Request
```json
{
  "dateRangePreset": "last_90_days",
  "audience": "internal",
  "includeEvidenceAppendix": true
}
```

#### Response
```json
{
  "data": {
    "generatedArtifactId": "uuid",
    "artifactType": "account_brief",
    "title": "Acme Corp Account Brief",
    "bodyFormat": "markdown",
    "body": "# Acme Corp Account Brief\n...",
    "evidenceCount": 12,
    "createdAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 14.2 Generate QBR Draft

```http
POST /api/v1/accounts/{accountId}/artifacts/qbr-draft
```

#### Purpose
Generate a QBR/account review draft.

#### Buffaly Action Mapping
- ToGenerateQbrDraft.

#### Request
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-06-18",
  "audience": "customer_facing",
  "focus": ["service", "security", "renewal"],
  "includeEvidenceAppendix": true
}
```

#### Response
```json
{
  "data": {
    "generatedArtifactId": "uuid",
    "artifactType": "qbr_draft",
    "title": "Acme Corp QBR Draft",
    "bodyFormat": "markdown",
    "body": "# Quarterly Business Review\n...",
    "evidenceCount": 18,
    "createdAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 14.3 Draft Customer Email

```http
POST /api/v1/accounts/{accountId}/artifacts/customer-email-draft
```

#### Purpose
Draft customer-facing email based on account context, recommendation, or specific focus.

#### Buffaly Action Mapping
- ToDraftCustomerEmailForAccount.

#### Request
```json
{
  "emailType": "security_risk_explanation",
  "recommendationId": "uuid",
  "tone": "consultative",
  "recipientContactIds": ["uuid"],
  "includeTechnicalDetails": false
}
```

#### Response
```json
{
  "data": {
    "generatedArtifactId": "uuid",
    "artifactType": "customer_email_draft",
    "title": "Security Posture Follow-Up for Acme Corp",
    "bodyFormat": "text",
    "subject": "Recommended security posture review",
    "body": "Hi ...",
    "createdAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 14.4 Get Generated Artifact

```http
GET /api/v1/generated-artifacts/{generatedArtifactId}
```

#### Purpose
Retrieve a generated brief, QBR draft, email draft, or summary.

#### Response
```json
{
  "data": {
    "generatedArtifactId": "uuid",
    "accountId": "uuid",
    "artifactType": "account_brief",
    "title": "Acme Corp Account Brief",
    "bodyFormat": "markdown",
    "body": "...",
    "status": "draft",
    "createdAt": "2026-06-18T20:00:00Z"
  },
  "meta": {},
  "errors": []
}
```

### 14.5 List Account Generated Artifacts

```http
GET /api/v1/accounts/{accountId}/generated-artifacts?artifactType=qbr_draft&page=1&pageSize=25
```

#### Purpose
List generated artifacts for an account.

## 15. PSA Write-Back Endpoints

### 15.1 Preview PSA Task Creation

```http
POST /api/v1/accounts/{accountId}/psa/tasks/preview
```

#### Purpose
Preview and validate a PSA task payload before write-back.

#### Request
```json
{
  "recommendationId": "uuid",
  "title": "Schedule renewal-focused QBR",
  "body": "Renewal is in 67 days. Ticket volume is elevated.",
  "ownerUserId": "uuid",
  "dueDate": "2026-06-25"
}
```

#### Response
```json
{
  "data": {
    "isValid": true,
    "payload": {},
    "requiredFields": [],
    "warnings": []
  },
  "meta": {},
  "errors": []
}
```

### 15.2 Create PSA Task

```http
POST /api/v1/accounts/{accountId}/psa/tasks
```

#### Purpose
Create a task/follow-up in the PSA after user confirmation.

#### Buffaly Action Mapping
- ToCreatePsaFollowUpTask.

#### Roles
account_manager, sales_rep, service_manager, security_lead, executive, admin.

#### Request
```json
{
  "recommendationId": "uuid",
  "title": "Schedule renewal-focused QBR",
  "body": "Renewal is in 67 days. Ticket volume is elevated.",
  "ownerUserId": "uuid",
  "dueDate": "2026-06-25",
  "confirmed": true
}
```

#### Response
```json
{
  "data": {
    "activityId": "uuid",
    "externalId": "psa_task_123",
    "externalUrl": "https://psa/tasks/123",
    "status": "created"
  },
  "meta": {},
  "errors": []
}
```

### 15.3 Create PSA Note

```http
POST /api/v1/accounts/{accountId}/psa/notes
```

#### Buffaly Action Mapping
- ToCreatePsaNote.

#### Request
```json
{
  "generatedArtifactId": "uuid",
  "title": "Account Brief Generated by Buffaly",
  "body": "...",
  "confirmed": true
}
```

### 15.4 Create PSA Opportunity

```http
POST /api/v1/accounts/{accountId}/psa/opportunities
```

#### Buffaly Action Mapping
- ToCreatePsaOpportunity.

#### Request
```json
{
  "recommendationId": "uuid",
  "title": "Endpoint Lifecycle Refresh Opportunity",
  "opportunityType": "lifecycle",
  "estimatedAmount": 25000.00,
  "ownerUserId": "uuid",
  "expectedCloseDate": "2026-09-30",
  "reason": "7 devices are end-of-life and 18 are Windows 10.",
  "confirmed": true
}
```

#### Response
```json
{
  "data": {
    "opportunityId": "uuid",
    "externalId": "psa_opp_123",
    "externalUrl": "https://psa/opportunities/123",
    "status": "created"
  },
  "meta": {},
  "errors": []
}
```

### 15.5 Get Write-Back Audit Events

```http
GET /api/v1/accounts/{accountId}/write-back-audit-events?page=1&pageSize=25
```

#### Purpose
Return write-back history for account activity and governance.

## 16. Portfolio View Endpoints

### 16.1 List Accounts At Risk

```http
GET /api/v1/portfolio/accounts-at-risk?ownerUserId=uuid&page=1&pageSize=25
```

### 16.2 List Renewals

```http
GET /api/v1/portfolio/renewals?days=90&ownerUserId=uuid&page=1&pageSize=25
```

### 16.3 List Expansion Candidates

```http
GET /api/v1/portfolio/expansion-candidates?ownerUserId=uuid&page=1&pageSize=25
```

### 16.4 List Accounts Missing Security Coverage

```http
GET /api/v1/portfolio/security-coverage-gaps?coverageType=edr&page=1&pageSize=25
```

### 16.5 List Accounts Needing QBR

```http
GET /api/v1/portfolio/accounts-needing-qbr?daysSinceLastQbr=180&page=1&pageSize=25
```

#### Portfolio Response Shape
```json
{
  "data": [
    {
      "accountId": "uuid",
      "displayName": "Acme Corp",
      "ownerName": "Jane Smith",
      "reason": "Renewal in 67 days and elevated service volume.",
      "healthCategory": "watch",
      "recommendedAction": "Schedule renewal-focused QBR",
      "recommendationId": "uuid"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 1
  },
  "errors": []
}
```

## 17. Account Mapping Endpoints

### 17.1 List Unmapped External Records

```http
GET /api/v1/admin/account-mapping/unmapped?sourceSystemType=rmm&page=1&pageSize=25
```

#### Roles
admin.

#### Purpose
Show unmapped PSA/RMM/security/M365 records that need review.

### 17.2 List Suggested Matches

```http
GET /api/v1/admin/account-mapping/suggestions?matchStatus=needs_review&page=1&pageSize=25
```

#### Purpose
Return suggested account identity matches.

### 17.3 Confirm Account Match

```http
POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/confirm
```

#### Buffaly Action Mapping
- ToConfirmAccountExternalIdentityMatch.

#### Request
```json
{
  "accountId": "uuid",
  "note": "Domain and client name match."
}
```

### 17.4 Reject Account Match

```http
POST /api/v1/admin/account-mapping/{accountExternalIdentityId}/reject
```

#### Buffaly Action Mapping
- ToRejectAccountExternalIdentityMatch.

#### Request
```json
{
  "reason": "Different company with similar name."
}
```

### 17.5 Run Account Matching

```http
POST /api/v1/admin/account-mapping/run
```

#### Buffaly Action Mapping
- ToMatchAccountAcrossSystems.

#### Request
```json
{
  "sourceSystemTypes": ["rmm", "security"],
  "autoConfirmHighConfidence": true
}
```

## 18. Integration Admin Endpoints

### 18.1 List Integrations

```http
GET /api/v1/admin/integrations
```

#### Roles
admin.

### 18.2 Get Integration

```http
GET /api/v1/admin/integrations/{integrationConnectionId}
```

### 18.3 Create Integration

```http
POST /api/v1/admin/integrations
```

#### Request
```json
{
  "systemType": "psa",
  "systemName": "Example PSA",
  "apiBaseUrl": "https://api.example-psa.com",
  "credentialReference": "secret_ref_123",
  "metadata": {}
}
```

### 18.4 Update Integration

```http
PATCH /api/v1/admin/integrations/{integrationConnectionId}
```

### 18.5 Test Integration Connection

```http
POST /api/v1/admin/integrations/{integrationConnectionId}/test
```

#### Response
```json
{
  "data": {
    "status": "connected",
    "message": "Connection test succeeded."
  },
  "meta": {},
  "errors": []
}
```

### 18.6 Trigger Integration Sync

```http
POST /api/v1/admin/integrations/{integrationConnectionId}/sync
```

#### Request
```json
{
  "syncType": "incremental"
}
```

### 18.7 List Sync Runs

```http
GET /api/v1/admin/integrations/{integrationConnectionId}/sync-runs?page=1&pageSize=25
```

## 19. Admin Configuration Endpoints

### 19.1 Get Health Score Settings

```http
GET /api/v1/admin/settings/health-score
```

### 19.2 Update Health Score Settings

```http
PATCH /api/v1/admin/settings/health-score
```

### 19.3 Get Recommendation Settings

```http
GET /api/v1/admin/settings/recommendations
```

### 19.4 Update Recommendation Settings

```http
PATCH /api/v1/admin/settings/recommendations
```

### 19.5 Get QBR Template Settings

```http
GET /api/v1/admin/settings/qbr-template
```

### 19.6 Update QBR Template Settings

```http
PATCH /api/v1/admin/settings/qbr-template
```

### 19.7 Get Customer Email Tone Settings

```http
GET /api/v1/admin/settings/customer-email-tone
```

### 19.8 Update Customer Email Tone Settings

```http
PATCH /api/v1/admin/settings/customer-email-tone
```

## 20. Buffaly Assistant Endpoint

### 20.1 Ask Account Assistant

```http
POST /api/v1/accounts/{accountId}/assistant/ask
```

#### Purpose
Ask account-scoped natural-language questions and receive evidence-backed Buffaly responses.

#### Buffaly Action Mapping
The assistant should route to typed actions when possible, including:
- ToGetAccountCommandCenterSummary.
- ToExplainRecommendationEvidence.
- ToGenerateAccountBrief.
- ToGenerateQbrDraft.
- ToDraftCustomerEmailForAccount.
- ToCreatePsaFollowUpTask only after confirmation.

#### Request
```json
{
  "message": "Prepare me for my call with this account.",
  "dateRangePreset": "last_90_days",
  "conversationId": "uuid"
}
```

#### Response
```json
{
  "data": {
    "conversationId": "uuid",
    "message": "Here are the key points for your call...",
    "evidence": [],
    "suggestedActions": [
      {
        "type": "generate_qbr_draft",
        "label": "Generate QBR Draft"
      },
      {
        "type": "create_psa_task",
        "label": "Create PSA Follow-Up Task",
        "requiresConfirmation": true
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

## 21. Product Event Endpoints

### 21.1 Track Product Event

```http
POST /api/v1/product-events
```

#### Purpose
Track frontend and workflow events for MVP analytics.

#### Request
```json
{
  "accountId": "uuid",
  "eventType": "recommendation_accepted",
  "eventProperties": {
    "recommendationId": "uuid"
  }
}
```

#### Roles
authenticated user.

## 22. Async Job Pattern

For long-running generation or sync operations, use a job-style response.

### Start Job Response
```json
{
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "statusUrl": "/api/v1/jobs/uuid"
  },
  "meta": {},
  "errors": []
}
```

### Get Job Status

```http
GET /api/v1/jobs/{jobId}
```

### Job Status Response
```json
{
  "data": {
    "jobId": "uuid",
    "status": "running",
    "progressPercent": 45,
    "message": "Generating QBR draft...",
    "resultResourceUrl": null
  },
  "meta": {},
  "errors": []
}
```

Recommended async operations:
- integration sync,
- account refresh,
- recommendation generation,
- QBR generation,
- large account brief generation,
- portfolio recalculation.

## 23. Endpoint-to-Screen Mapping

### Account Search
- GET /accounts/search.

### Account Header
- GET /accounts/{accountId}/command-center.
- GET /accounts/{accountId}/health-score/latest.

### Left Column Cards
- GET /accounts/{accountId}/command-center.
- GET /accounts/{accountId}/revenue.

### Center Account Brief
- GET /accounts/{accountId}/command-center.
- POST /accounts/{accountId}/artifacts/account-brief.

### Next Best Actions
- GET /accounts/{accountId}/recommendations.
- POST /accounts/{accountId}/recommendations/generate.
- PATCH /recommendations/{recommendationId}.

### Evidence Drawer
- GET /recommendations/{recommendationId}/evidence.
- GET /account-health-scores/{accountHealthScoreId}/evidence.
- GET /generated-artifacts/{generatedArtifactId}/evidence.

### Detail Tabs
- GET /accounts/{accountId}/service.
- GET /accounts/{accountId}/rmm.
- GET /accounts/{accountId}/security.
- GET /accounts/{accountId}/revenue.
- GET /accounts/{accountId}/contacts.
- GET /accounts/{accountId}/activity.

### PSA Write-Back Modal
- POST /accounts/{accountId}/psa/tasks/preview.
- POST /accounts/{accountId}/psa/tasks.
- POST /accounts/{accountId}/psa/notes.
- POST /accounts/{accountId}/psa/opportunities.

### Portfolio Views
- GET /portfolio/accounts-at-risk.
- GET /portfolio/renewals.
- GET /portfolio/expansion-candidates.
- GET /portfolio/security-coverage-gaps.
- GET /portfolio/accounts-needing-qbr.

## 24. MVP API Acceptance Criteria

The API layer is MVP-ready when:

1. Account search returns useful matches by name/domain/alias/contact/source ID.
2. Account Command Center endpoint returns account header, snapshot, health, brief, risks, opportunities, recommendations, freshness, and warnings.
3. Detail tab endpoints return service, RMM, security, revenue, contact, and activity data.
4. Health score calculation endpoint returns explainable score and evidence count.
5. Recommendation endpoints can list, generate, dismiss, snooze, and accept recommendations.
6. Evidence endpoints explain recommendations, health scores, and generated artifacts.
7. Artifact endpoints generate and retrieve account briefs, QBR drafts, and customer email drafts.
8. PSA write-back endpoints support preview, confirmation, creation, error handling, and audit trail.
9. Portfolio endpoints support at-risk, renewal, expansion, security gap, and QBR-needed views.
10. Admin endpoints support integrations, syncs, and account mapping review.
11. Assistant endpoint can answer account-scoped questions and route to typed Buffaly actions.
12. Product events can be tracked for MVP success metrics.

## 25. Recommended First API Build Slice

For the first engineering sprint, build:

1. GET /api/v1/accounts/search.
2. GET /api/v1/accounts/{accountId}/command-center with seeded/demo data.
3. GET /api/v1/accounts/{accountId}/revenue.
4. GET /api/v1/admin/integrations.
5. POST /api/v1/admin/integrations/{integrationConnectionId}/sync as a stub/spike.
6. POST /api/v1/product-events.

This enables the first visible product flow: search/select account and render the Account Command Center header/snapshot using real or seeded account data.
