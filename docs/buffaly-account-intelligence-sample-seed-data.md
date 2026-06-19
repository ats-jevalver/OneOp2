
# Sample Seed Data: Buffaly Account Intelligence Platform MVP

## 1. Purpose

This artifact defines sample seed data for the Account Intelligence MVP. It is intended for Sprint 1 local development, demos, API contract tests, and UI smoke tests.

The seed data supports these first flows:

1. Open application shell.
2. Search for an account.
3. Select an account.
4. Render Account Command Center header and snapshot.
5. Show account owner, primary contact, agreement, renewal, and data freshness.
6. Show realistic placeholder health context.
7. Prepare for Sprint 2 service/RMM/security/evidence/recommendation work.

## 2. Seed Data Principles

- Use stable deterministic IDs so tests can rely on known records.
- Keep Sprint 1 required data small but realistic.
- Include five account scenarios: Healthy, Watch, At Risk, Renewal Risk, Expansion Candidate.
- Include one mapping issue scenario and one stale data scenario.
- Include optional Sprint 2 data for tickets, devices, security findings, evidence, health scores, and recommendations.
- Keep all data fictional.

## 3. ID Conventions

Use UUID-like deterministic values in real implementation, but readable placeholders are shown here for clarity.

Example implementation mapping:

- `usr_am_jane` -> UUID in actual seed script.
- `acct_acme` -> UUID in actual seed script.
- `agr_acme_managed_services` -> UUID in actual seed script.

## 4. Demo Users

```json
[
  {
    "userId": "usr_admin_alex",
    "displayName": "Alex Admin",
    "email": "alex.admin@example-msp.local",
    "role": "admin",
    "status": "active"
  },
  {
    "userId": "usr_am_jane",
    "displayName": "Jane Smith",
    "email": "jane.smith@example-msp.local",
    "role": "account_manager",
    "status": "active"
  },
  {
    "userId": "usr_sales_marcus",
    "displayName": "Marcus Lee",
    "email": "marcus.lee@example-msp.local",
    "role": "sales_rep",
    "status": "active"
  },
  {
    "userId": "usr_service_priya",
    "displayName": "Priya Patel",
    "email": "priya.patel@example-msp.local",
    "role": "service_manager",
    "status": "active"
  },
  {
    "userId": "usr_security_sam",
    "displayName": "Sam Rivera",
    "email": "sam.rivera@example-msp.local",
    "role": "security_lead",
    "status": "active"
  },
  {
    "userId": "usr_exec_taylor",
    "displayName": "Taylor Morgan",
    "email": "taylor.morgan@example-msp.local",
    "role": "executive",
    "status": "active"
  }
]
```

## 5. Demo Integration Connections

```json
[
  {
    "integrationConnectionId": "int_psa_demo",
    "systemType": "psa",
    "systemName": "Demo PSA",
    "status": "connected",
    "tenantIdentifier": "demo-psa-tenant",
    "apiBaseUrl": "https://psa.example.local/api",
    "credentialReference": "secret://demo/psa",
    "lastSuccessfulSyncAt": "2026-06-18T18:45:00Z",
    "lastErrorAt": null,
    "lastErrorMessage": null
  },
  {
    "integrationConnectionId": "int_rmm_demo",
    "systemType": "rmm",
    "systemName": "Demo RMM",
    "status": "connected",
    "tenantIdentifier": "demo-rmm-tenant",
    "apiBaseUrl": "https://rmm.example.local/api",
    "credentialReference": "secret://demo/rmm",
    "lastSuccessfulSyncAt": "2026-06-18T18:10:00Z",
    "lastErrorAt": null,
    "lastErrorMessage": null
  },
  {
    "integrationConnectionId": "int_security_demo",
    "systemType": "security",
    "systemName": "Demo Security Platform",
    "status": "connected",
    "tenantIdentifier": "demo-security-tenant",
    "apiBaseUrl": "https://security.example.local/api",
    "credentialReference": "secret://demo/security",
    "lastSuccessfulSyncAt": "2026-06-18T11:00:00Z",
    "lastErrorAt": null,
    "lastErrorMessage": null
  },
  {
    "integrationConnectionId": "int_m365_demo",
    "systemType": "microsoft365",
    "systemName": "Demo Microsoft 365",
    "status": "error",
    "tenantIdentifier": "demo-m365-tenant",
    "apiBaseUrl": "https://graph.microsoft.com/v1.0",
    "credentialReference": "secret://demo/m365",
    "lastSuccessfulSyncAt": "2026-06-09T10:30:00Z",
    "lastErrorAt": "2026-06-18T18:00:00Z",
    "lastErrorMessage": "Demo stale-data scenario: token refresh failed."
  }
]
```

## 6. Demo Account Scenarios

### Scenario Matrix

| Account | Scenario | Purpose |
|---|---|---|
| Acme Corp | Watch + upcoming renewal | Primary Sprint 1 demo account |
| Brightway Dental | Healthy | Baseline healthy account |
| Northstar Legal Group | At Risk | Service/security risk example |
| Greenfield Manufacturing | Renewal Risk | Renewal workflow example |
| Summit Architecture | Expansion Candidate | Sales opportunity example |
| Riverbend Nonprofit | Mapping Issue | Account identity resolution example |
| Harbor Medical | Stale Security Data | Data freshness warning example |

## 7. Accounts

```json
[
  {
    "accountId": "acct_acme",
    "displayName": "Acme Corp",
    "legalName": "Acme Corporation",
    "shortName": "Acme",
    "status": "active",
    "primaryDomain": "acme.example",
    "industry": "Professional Services",
    "segment": "Mid-Market",
    "employeeCount": 185,
    "locationCount": 3,
    "accountTier": "Premium",
    "notes": "Primary Sprint 1 demo account. Watch status with upcoming renewal."
  },
  {
    "accountId": "acct_brightway",
    "displayName": "Brightway Dental",
    "legalName": "Brightway Dental Group",
    "shortName": "Brightway",
    "status": "active",
    "primaryDomain": "brightwaydental.example",
    "industry": "Healthcare",
    "segment": "SMB",
    "employeeCount": 42,
    "locationCount": 2,
    "accountTier": "Standard",
    "notes": "Healthy account demo scenario."
  },
  {
    "accountId": "acct_northstar",
    "displayName": "Northstar Legal Group",
    "legalName": "Northstar Legal Group LLP",
    "shortName": "Northstar",
    "status": "active",
    "primaryDomain": "northstarlegal.example",
    "industry": "Legal",
    "segment": "Mid-Market",
    "employeeCount": 96,
    "locationCount": 1,
    "accountTier": "Premium",
    "notes": "At Risk account demo scenario."
  },
  {
    "accountId": "acct_greenfield",
    "displayName": "Greenfield Manufacturing",
    "legalName": "Greenfield Manufacturing Co.",
    "shortName": "Greenfield",
    "status": "active",
    "primaryDomain": "greenfieldmfg.example",
    "industry": "Manufacturing",
    "segment": "Mid-Market",
    "employeeCount": 260,
    "locationCount": 4,
    "accountTier": "Premium",
    "notes": "Renewal Risk account demo scenario."
  },
  {
    "accountId": "acct_summit",
    "displayName": "Summit Architecture",
    "legalName": "Summit Architecture Studio",
    "shortName": "Summit",
    "status": "active",
    "primaryDomain": "summitarch.example",
    "industry": "Architecture",
    "segment": "SMB",
    "employeeCount": 58,
    "locationCount": 1,
    "accountTier": "Standard",
    "notes": "Expansion Candidate account demo scenario."
  },
  {
    "accountId": "acct_riverbend",
    "displayName": "Riverbend Nonprofit",
    "legalName": "Riverbend Community Foundation",
    "shortName": "Riverbend",
    "status": "active",
    "primaryDomain": "riverbendfoundation.example",
    "industry": "Nonprofit",
    "segment": "SMB",
    "employeeCount": 35,
    "locationCount": 1,
    "accountTier": "Standard",
    "notes": "Mapping issue demo scenario."
  },
  {
    "accountId": "acct_harbor",
    "displayName": "Harbor Medical",
    "legalName": "Harbor Medical Associates",
    "shortName": "Harbor",
    "status": "active",
    "primaryDomain": "harbormedical.example",
    "industry": "Healthcare",
    "segment": "Mid-Market",
    "employeeCount": 120,
    "locationCount": 2,
    "accountTier": "Premium",
    "notes": "Stale security data demo scenario."
  }
]
```

## 8. Account Owners

```json
[
  { "accountOwnerId": "own_acme_am", "accountId": "acct_acme", "userId": "usr_am_jane", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_acme_sales", "accountId": "acct_acme", "userId": "usr_sales_marcus", "role": "sales_rep", "isPrimary": false, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_brightway_am", "accountId": "acct_brightway", "userId": "usr_am_jane", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_northstar_am", "accountId": "acct_northstar", "userId": "usr_am_jane", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_northstar_service", "accountId": "acct_northstar", "userId": "usr_service_priya", "role": "service_manager", "isPrimary": false, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_greenfield_am", "accountId": "acct_greenfield", "userId": "usr_sales_marcus", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_summit_am", "accountId": "acct_summit", "userId": "usr_sales_marcus", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_riverbend_am", "accountId": "acct_riverbend", "userId": "usr_am_jane", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_harbor_am", "accountId": "acct_harbor", "userId": "usr_am_jane", "role": "account_manager", "isPrimary": true, "effectiveFrom": "2026-01-01" },
  { "accountOwnerId": "own_harbor_security", "accountId": "acct_harbor", "userId": "usr_security_sam", "role": "security_lead", "isPrimary": false, "effectiveFrom": "2026-01-01" }
]
```

## 9. Account Aliases

```json
[
  { "accountAliasId": "alias_acme_1", "accountId": "acct_acme", "aliasValue": "ACME", "aliasType": "name", "source": "seed" },
  { "accountAliasId": "alias_acme_2", "accountId": "acct_acme", "aliasValue": "Acme Corporation", "aliasType": "legal_name", "source": "seed" },
  { "accountAliasId": "alias_brightway_1", "accountId": "acct_brightway", "aliasValue": "Brightway Dental Group", "aliasType": "legal_name", "source": "seed" },
  { "accountAliasId": "alias_northstar_1", "accountId": "acct_northstar", "aliasValue": "Northstar Legal", "aliasType": "name", "source": "seed" },
  { "accountAliasId": "alias_greenfield_1", "accountId": "acct_greenfield", "aliasValue": "Greenfield MFG", "aliasType": "name", "source": "seed" },
  { "accountAliasId": "alias_summit_1", "accountId": "acct_summit", "aliasValue": "Summit Arch", "aliasType": "name", "source": "seed" },
  { "accountAliasId": "alias_riverbend_1", "accountId": "acct_riverbend", "aliasValue": "Riverbend Foundation", "aliasType": "name", "source": "seed" },
  { "accountAliasId": "alias_harbor_1", "accountId": "acct_harbor", "aliasValue": "Harbor Medical Associates", "aliasType": "legal_name", "source": "seed" }
]
```

## 10. Account External Identities

```json
[
  {
    "accountExternalIdentityId": "ext_acme_psa",
    "accountId": "acct_acme",
    "integrationConnectionId": "int_psa_demo",
    "sourceSystemType": "psa",
    "sourceSystemName": "Demo PSA",
    "externalRecordType": "company",
    "externalId": "PSA-1001",
    "externalDisplayName": "Acme Corp",
    "externalDomain": "acme.example",
    "externalUrl": "https://psa.example.local/companies/PSA-1001",
    "matchStatus": "confirmed",
    "matchConfidence": 100,
    "matchedBy": "seed",
    "matchedAt": "2026-06-18T18:45:00Z",
    "matchReason": "Seeded confirmed PSA identity."
  },
  {
    "accountExternalIdentityId": "ext_acme_rmm",
    "accountId": "acct_acme",
    "integrationConnectionId": "int_rmm_demo",
    "sourceSystemType": "rmm",
    "sourceSystemName": "Demo RMM",
    "externalRecordType": "client",
    "externalId": "RMM-ACME-01",
    "externalDisplayName": "ACME Corp",
    "externalDomain": "acme.example",
    "externalUrl": "https://rmm.example.local/clients/RMM-ACME-01",
    "matchStatus": "confirmed",
    "matchConfidence": 98,
    "matchedBy": "seed",
    "matchedAt": "2026-06-18T18:10:00Z",
    "matchReason": "Domain and normalized name match."
  },
  {
    "accountExternalIdentityId": "ext_acme_security",
    "accountId": "acct_acme",
    "integrationConnectionId": "int_security_demo",
    "sourceSystemType": "security",
    "sourceSystemName": "Demo Security Platform",
    "externalRecordType": "tenant",
    "externalId": "SEC-TENANT-ACME",
    "externalDisplayName": "Acme Corp",
    "externalDomain": "acme.example",
    "externalUrl": "https://security.example.local/tenants/SEC-TENANT-ACME",
    "matchStatus": "confirmed",
    "matchConfidence": 99,
    "matchedBy": "seed",
    "matchedAt": "2026-06-18T11:00:00Z",
    "matchReason": "Domain match."
  },
  {
    "accountExternalIdentityId": "ext_riverbend_rmm_suggested",
    "accountId": "acct_riverbend",
    "integrationConnectionId": "int_rmm_demo",
    "sourceSystemType": "rmm",
    "sourceSystemName": "Demo RMM",
    "externalRecordType": "client",
    "externalId": "RMM-RIVER-UNKNOWN",
    "externalDisplayName": "River Bend Community",
    "externalDomain": null,
    "externalUrl": "https://rmm.example.local/clients/RMM-RIVER-UNKNOWN",
    "matchStatus": "needs_review",
    "matchConfidence": 62,
    "matchedBy": "system",
    "matchedAt": null,
    "matchReason": "Similar name but no domain match."
  },
  {
    "accountExternalIdentityId": "ext_harbor_m365",
    "accountId": "acct_harbor",
    "integrationConnectionId": "int_m365_demo",
    "sourceSystemType": "microsoft365",
    "sourceSystemName": "Demo Microsoft 365",
    "externalRecordType": "tenant",
    "externalId": "M365-HARBOR-TENANT",
    "externalDisplayName": "Harbor Medical",
    "externalDomain": "harbormedical.example",
    "externalTenantId": "tenant-harbor-demo",
    "externalUrl": "https://admin.microsoft.com/tenant/M365-HARBOR-TENANT",
    "matchStatus": "confirmed",
    "matchConfidence": 100,
    "matchedBy": "seed",
    "matchedAt": "2026-06-09T10:30:00Z",
    "matchReason": "Seeded stale security/M365 scenario."
  }
]
```

Implementation note: create PSA external identities for every account. RMM/security identities can be added selectively for demo scenarios.

## 11. Contacts

```json
[
  {
    "contactId": "contact_acme_tina",
    "accountId": "acct_acme",
    "fullName": "Tina Reynolds",
    "email": "tina.reynolds@acme.example",
    "phone": "555-0101",
    "title": "Chief Operating Officer",
    "department": "Operations",
    "status": "active",
    "isPrimaryContact": true,
    "isExecutiveContact": true,
    "relationshipStrength": "strong",
    "lastInteractionAt": "2026-06-12T15:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-ACME-1"
  },
  {
    "contactId": "contact_acme_omar",
    "accountId": "acct_acme",
    "fullName": "Omar Castillo",
    "email": "omar.castillo@acme.example",
    "phone": "555-0102",
    "title": "IT Manager",
    "department": "IT",
    "status": "active",
    "isTechnicalContact": true,
    "relationshipStrength": "medium",
    "lastInteractionAt": "2026-06-17T20:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-ACME-2"
  },
  {
    "contactId": "contact_brightway_lena",
    "accountId": "acct_brightway",
    "fullName": "Lena Brooks",
    "email": "lena.brooks@brightwaydental.example",
    "title": "Practice Administrator",
    "status": "active",
    "isPrimaryContact": true,
    "isBillingContact": true,
    "relationshipStrength": "strong",
    "lastInteractionAt": "2026-06-10T13:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-BRIGHT-1"
  },
  {
    "contactId": "contact_northstar_evelyn",
    "accountId": "acct_northstar",
    "fullName": "Evelyn Hart",
    "email": "evelyn.hart@northstarlegal.example",
    "title": "Managing Partner",
    "status": "active",
    "isPrimaryContact": true,
    "isExecutiveContact": true,
    "relationshipStrength": "medium",
    "lastInteractionAt": "2026-06-05T16:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-NORTH-1"
  },
  {
    "contactId": "contact_greenfield_ryan",
    "accountId": "acct_greenfield",
    "fullName": "Ryan Miller",
    "email": "ryan.miller@greenfieldmfg.example",
    "title": "VP Operations",
    "status": "active",
    "isPrimaryContact": true,
    "isExecutiveContact": true,
    "relationshipStrength": "medium",
    "lastInteractionAt": "2026-05-21T18:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-GREEN-1"
  },
  {
    "contactId": "contact_summit_ava",
    "accountId": "acct_summit",
    "fullName": "Ava Chen",
    "email": "ava.chen@summitarch.example",
    "title": "Principal Architect",
    "status": "active",
    "isPrimaryContact": true,
    "isExecutiveContact": true,
    "relationshipStrength": "strong",
    "lastInteractionAt": "2026-06-14T19:00:00Z",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-CONT-SUMMIT-1"
  }
]
```

## 12. Agreements

```json
[
  {
    "agreementId": "agr_acme_managed_services",
    "accountId": "acct_acme",
    "name": "Managed Services Premium",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2025-08-24",
    "endDate": "2026-08-24",
    "renewalDate": "2026-08-24",
    "autoRenew": false,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 12500.00,
    "annualRecurringRevenue": 150000.00,
    "grossMarginPercent": 42.5,
    "includedServices": ["Helpdesk", "Endpoint Management", "Backup Monitoring", "Security Essentials"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-ACME-1"
  },
  {
    "agreementId": "agr_brightway_standard",
    "accountId": "acct_brightway",
    "name": "Managed Services Standard",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "renewalDate": "2026-12-31",
    "autoRenew": true,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 4200.00,
    "annualRecurringRevenue": 50400.00,
    "grossMarginPercent": 48.0,
    "includedServices": ["Helpdesk", "Endpoint Management", "Backup Monitoring"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-BRIGHT-1"
  },
  {
    "agreementId": "agr_northstar_premium",
    "accountId": "acct_northstar",
    "name": "Managed Services Premium",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2025-11-01",
    "endDate": "2026-10-31",
    "renewalDate": "2026-10-31",
    "autoRenew": false,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 9800.00,
    "annualRecurringRevenue": 117600.00,
    "grossMarginPercent": 31.0,
    "includedServices": ["Helpdesk", "Endpoint Management", "Backup Monitoring", "Security Essentials"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-NORTH-1"
  }
]
```

Additional agreement records:

```json
[
  {
    "agreementId": "agr_greenfield_premium",
    "accountId": "acct_greenfield",
    "name": "Managed Services Premium + Network Operations",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2025-07-15",
    "endDate": "2026-07-15",
    "renewalDate": "2026-07-15",
    "autoRenew": false,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 18400.00,
    "annualRecurringRevenue": 220800.00,
    "grossMarginPercent": 38.0,
    "includedServices": ["Helpdesk", "Endpoint Management", "Network Monitoring", "Backup Monitoring"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-GREEN-1"
  },
  {
    "agreementId": "agr_summit_standard",
    "accountId": "acct_summit",
    "name": "Managed Services Standard",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2026-03-01",
    "endDate": "2027-02-28",
    "renewalDate": "2027-02-28",
    "autoRenew": true,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 5300.00,
    "annualRecurringRevenue": 63600.00,
    "grossMarginPercent": 51.0,
    "includedServices": ["Helpdesk", "Endpoint Management"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-SUMMIT-1"
  },
  {
    "agreementId": "agr_riverbend_standard",
    "accountId": "acct_riverbend",
    "name": "Managed Services Standard",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2025-10-01",
    "endDate": "2026-09-30",
    "renewalDate": "2026-09-30",
    "autoRenew": false,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 3100.00,
    "annualRecurringRevenue": 37200.00,
    "grossMarginPercent": 45.0,
    "includedServices": ["Helpdesk", "Endpoint Management"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-RIVER-1"
  },
  {
    "agreementId": "agr_harbor_premium",
    "accountId": "acct_harbor",
    "name": "Managed Services Premium Healthcare",
    "status": "active",
    "agreementType": "Managed Services",
    "startDate": "2025-12-01",
    "endDate": "2026-11-30",
    "renewalDate": "2026-11-30",
    "autoRenew": false,
    "billingFrequency": "monthly",
    "monthlyRecurringRevenue": 11200.00,
    "annualRecurringRevenue": 134400.00,
    "grossMarginPercent": 40.0,
    "includedServices": ["Helpdesk", "Endpoint Management", "Backup Monitoring", "Security Essentials"],
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-AGR-HARBOR-1"
  }
]
```

## 13. Renewals

Assume demo date around 2026-06-18.

```json
[
  {
    "renewalId": "ren_acme_2026",
    "accountId": "acct_acme",
    "agreementId": "agr_acme_managed_services",
    "renewalType": "agreement",
    "renewalDate": "2026-08-24",
    "status": "upcoming",
    "renewalAmount": 150000.00,
    "ownerUserId": "usr_am_jane",
    "daysUntilRenewal": 67,
    "riskReason": "Upcoming renewal with elevated service and patch concerns.",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-REN-ACME-2026"
  },
  {
    "renewalId": "ren_brightway_2026",
    "accountId": "acct_brightway",
    "agreementId": "agr_brightway_standard",
    "renewalType": "agreement",
    "renewalDate": "2026-12-31",
    "status": "upcoming",
    "renewalAmount": 50400.00,
    "ownerUserId": "usr_am_jane",
    "daysUntilRenewal": 196,
    "riskReason": null,
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-REN-BRIGHT-2026"
  },
  {
    "renewalId": "ren_northstar_2026",
    "accountId": "acct_northstar",
    "agreementId": "agr_northstar_premium",
    "renewalType": "agreement",
    "renewalDate": "2026-10-31",
    "status": "at_risk",
    "renewalAmount": 117600.00,
    "ownerUserId": "usr_am_jane",
    "daysUntilRenewal": 135,
    "riskReason": "Service escalations and margin pressure may affect renewal sentiment.",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-REN-NORTH-2026"
  }
]
```

Additional renewal records:

```json
[
  {
    "renewalId": "ren_greenfield_2026",
    "accountId": "acct_greenfield",
    "agreementId": "agr_greenfield_premium",
    "renewalType": "agreement",
    "renewalDate": "2026-07-15",
    "status": "at_risk",
    "renewalAmount": 220800.00,
    "ownerUserId": "usr_sales_marcus",
    "daysUntilRenewal": 27,
    "riskReason": "Renewal is inside 30 days and no recent QBR is recorded.",
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-REN-GREEN-2026"
  },
  {
    "renewalId": "ren_summit_2027",
    "accountId": "acct_summit",
    "agreementId": "agr_summit_standard",
    "renewalType": "agreement",
    "renewalDate": "2027-02-28",
    "status": "upcoming",
    "renewalAmount": 63600.00,
    "ownerUserId": "usr_sales_marcus",
    "daysUntilRenewal": 255,
    "riskReason": null,
    "sourceSystemName": "Demo PSA",
    "externalId": "PSA-REN-SUMMIT-2027"
  }
]
```

## 14. Optional Sprint 2 Service Signals

These are not required for Sprint 1, but help prepare service detail tabs and health scoring.

```json
[
  {
    "ticketId": "ticket_acme_001",
    "accountId": "acct_acme",
    "sourceSystemName": "Demo PSA",
    "externalId": "TCK-ACME-001",
    "title": "Intermittent VPN connectivity for finance users",
    "status": "open",
    "priority": "high",
    "category": "Network",
    "subcategory": "VPN",
    "assignedTeam": "Service Desk",
    "slaStatus": "at_risk",
    "isEscalated": false,
    "isRecurringIssueCandidate": true,
    "createdAtSource": "2026-06-08T14:20:00Z",
    "ageDays": 10
  },
  {
    "ticketId": "ticket_northstar_001",
    "accountId": "acct_northstar",
    "sourceSystemName": "Demo PSA",
    "externalId": "TCK-NORTH-001",
    "title": "Document management system outage",
    "status": "open",
    "priority": "critical",
    "category": "Line of Business App",
    "subcategory": "Outage",
    "assignedTeam": "Escalations",
    "slaStatus": "breached",
    "isEscalated": true,
    "isRecurringIssueCandidate": true,
    "createdAtSource": "2026-06-03T08:15:00Z",
    "ageDays": 15
  }
]
```

## 15. Optional Sprint 2 RMM Signals

```json
[
  {
    "deviceId": "dev_acme_srv_accounting",
    "accountId": "acct_acme",
    "sourceSystemName": "Demo RMM",
    "externalId": "RMM-DEV-ACME-SRV-01",
    "displayName": "ACME-ACCT-SRV01",
    "deviceType": "server",
    "status": "online",
    "operatingSystem": "Windows Server",
    "operatingSystemVersion": "2019",
    "lastSeenAt": "2026-06-18T18:05:00Z",
    "lastPatchedAt": "2026-05-08T02:00:00Z",
    "patchStatus": "behind",
    "warrantyExpirationDate": "2026-12-31",
    "ageYears": 4.5,
    "isEndOfLife": false,
    "isServer": true,
    "isCritical": true
  },
  {
    "deviceId": "dev_acme_ws_legacy_01",
    "accountId": "acct_acme",
    "sourceSystemName": "Demo RMM",
    "externalId": "RMM-DEV-ACME-WS-OLD-01",
    "displayName": "ACME-FIN-WS07",
    "deviceType": "workstation",
    "status": "online",
    "operatingSystem": "Windows 10",
    "operatingSystemVersion": "22H2",
    "lastSeenAt": "2026-06-18T18:03:00Z",
    "lastPatchedAt": "2026-04-20T02:00:00Z",
    "patchStatus": "critical_missing",
    "warrantyExpirationDate": "2025-11-30",
    "ageYears": 5.8,
    "isEndOfLife": true,
    "isServer": false,
    "isCritical": false
  }
]
```

## 16. Optional Sprint 2 Security Signals

```json
[
  {
    "securityFindingId": "sec_acme_mfa_gap",
    "accountId": "acct_acme",
    "sourceSystemName": "Demo Security Platform",
    "externalId": "SEC-ACME-001",
    "findingType": "missing_control",
    "severity": "high",
    "status": "open",
    "title": "MFA not enforced for all administrative users",
    "description": "Two administrative users do not have enforced MFA.",
    "affectedService": "Identity",
    "businessImpact": "Increased risk of account takeover and unauthorized administrative access.",
    "recommendedRemediation": "Enforce MFA for all administrative users and review conditional access policies.",
    "observedAt": "2026-06-18T11:00:00Z",
    "isCustomerFacing": true
  },
  {
    "securityFindingId": "sec_harbor_stale_placeholder",
    "accountId": "acct_harbor",
    "sourceSystemName": "Demo Microsoft 365",
    "externalId": "M365-HARBOR-STALE-001",
    "findingType": "coverage_gap",
    "severity": "medium",
    "status": "unknown",
    "title": "Security data stale due to failed Microsoft 365 sync",
    "description": "Last successful Microsoft 365 sync was on 2026-06-09.",
    "affectedService": "Microsoft 365",
    "businessImpact": "Current Microsoft 365 security posture cannot be verified.",
    "recommendedRemediation": "Restore Microsoft 365 integration sync before relying on recommendations.",
    "observedAt": "2026-06-09T10:30:00Z",
    "isCustomerFacing": false
  }
]
```

## 17. Optional Sprint 2 Health Scores and Recommendations

```json
{
  "healthScores": [
    {
      "accountHealthScoreId": "health_acme_latest",
      "accountId": "acct_acme",
      "scoreCategory": "watch",
      "scoreValue": 62,
      "summary": "Acme has elevated service volume, patch gaps, and an upcoming renewal in 67 days.",
      "confidence": "high",
      "calculatedAt": "2026-06-18T19:00:00Z"
    },
    {
      "accountHealthScoreId": "health_brightway_latest",
      "accountId": "acct_brightway",
      "scoreCategory": "healthy",
      "scoreValue": 86,
      "summary": "Brightway has low ticket volume, current endpoint health, and no near-term renewal risk.",
      "confidence": "medium",
      "calculatedAt": "2026-06-18T19:00:00Z"
    },
    {
      "accountHealthScoreId": "health_northstar_latest",
      "accountId": "acct_northstar",
      "scoreCategory": "at_risk",
      "scoreValue": 38,
      "summary": "Northstar has a critical escalated outage, SLA breach, and renewal sentiment risk.",
      "confidence": "high",
      "calculatedAt": "2026-06-18T19:00:00Z"
    }
  ],
  "recommendations": [
    {
      "recommendationId": "rec_acme_qbr",
      "accountId": "acct_acme",
      "recommendationType": "schedule_qbr",
      "title": "Schedule renewal-focused QBR",
      "reason": "Renewal is in 67 days, service volume is elevated, and patch compliance is behind target.",
      "priority": "high",
      "status": "new",
      "suggestedOwnerUserId": "usr_am_jane",
      "suggestedDueDate": "2026-06-25",
      "confidence": "high"
    },
    {
      "recommendationId": "rec_greenfield_renewal",
      "accountId": "acct_greenfield",
      "recommendationType": "renewal_follow_up",
      "title": "Create urgent renewal follow-up",
      "reason": "Agreement renewal is in 27 days and no recent QBR is recorded.",
      "priority": "critical",
      "status": "new",
      "suggestedOwnerUserId": "usr_sales_marcus",
      "suggestedDueDate": "2026-06-20",
      "confidence": "high"
    }
  ]
}
```

## 18. Seed Implementation Notes

### Idempotency
Seed scripts should be idempotent. Use upsert by stable ID or natural unique key.

Recommended natural keys:
- users.email.
- integration_connections.system_name + system_type.
- accounts.primary_domain or account_id.
- account_external_identities.integration_connection_id + external_record_type + external_id.
- contacts.source_system_name + external_id.
- agreements.source_system_name + external_id.
- renewals.source_system_name + external_id.

### Date Handling
Use a configurable seed base date if possible:

```text
SEED_BASE_DATE=2026-06-18
```

Then calculate relative renewal dates and sync freshness dynamically for long-lived demos.

### Sprint 1 Required Seed Tables
Required:
- users.
- integration_connections.
- sync_runs optional but recommended.
- accounts.
- account_external_identities.
- account_aliases.
- account_owners.
- contacts.
- agreements.
- renewals.

Optional for Sprint 1 but useful for Sprint 2:
- tickets.
- devices.
- device_health_signals.
- security_findings.
- security_coverage.
- account_health_scores.
- recommendations.
- evidence_items.

## 19. Expected Demo Searches

These searches should return results:

- `acme` -> Acme Corp.
- `acme.example` -> Acme Corp.
- `tina.reynolds@acme.example` -> Acme Corp.
- `brightway` -> Brightway Dental.
- `northstar` -> Northstar Legal Group.
- `greenfield` -> Greenfield Manufacturing.
- `summit arch` -> Summit Architecture.
- `riverbend` -> Riverbend Nonprofit.
- `harbor` -> Harbor Medical.
- `PSA-1001` -> Acme Corp.

## 20. Expected Sprint 1 UI States

- Acme Corp: Watch placeholder, renewal in 67 days, current PSA/RMM/security data.
- Brightway Dental: Healthy placeholder, not urgent, current data.
- Northstar Legal Group: At Risk placeholder, service escalation scenario.
- Greenfield Manufacturing: Renewal Risk placeholder, renewal in 27 days.
- Summit Architecture: Expansion Candidate placeholder.
- Riverbend Nonprofit: mapping warning for RMM match review.
- Harbor Medical: stale Microsoft 365/security data warning.

## 21. Acceptance Criteria for Seed Data

Seed data is acceptable when:

1. It can be loaded repeatedly without duplicate records.
2. Account search can find all demo accounts.
3. Each demo account has an account owner.
4. Each demo account has at least one contact.
5. Each demo account has an agreement.
6. Each primary demo account has a renewal.
7. Acme shows a Watch/upcoming renewal scenario.
8. Greenfield shows a renewal risk scenario.
9. Riverbend shows a mapping issue scenario.
10. Harbor shows a stale data scenario.
11. Sprint 1 Account Command Center can render from the data.
12. Optional Sprint 2 data supports service, RMM, security, health, and recommendation demos.
