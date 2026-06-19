const users = [
  { userId: 'usr_admin_alex', displayName: 'Alex Admin', email: 'alex.admin@example-msp.local', role: 'admin', status: 'active' },
  { userId: 'usr_am_jane', displayName: 'Jane Smith', email: 'jane.smith@example-msp.local', role: 'account_manager', status: 'active' },
  { userId: 'usr_sales_marcus', displayName: 'Marcus Lee', email: 'marcus.lee@example-msp.local', role: 'sales_rep', status: 'active' },
  { userId: 'usr_service_priya', displayName: 'Priya Patel', email: 'priya.patel@example-msp.local', role: 'service_manager', status: 'active' },
  { userId: 'usr_security_sam', displayName: 'Sam Rivera', email: 'sam.rivera@example-msp.local', role: 'security_lead', status: 'active' },
  { userId: 'usr_exec_taylor', displayName: 'Taylor Morgan', email: 'taylor.morgan@example-msp.local', role: 'executive', status: 'active' }
];

const integrations = [
  { integrationConnectionId: 'int_psa_demo', systemType: 'psa', systemName: 'Demo PSA', status: 'connected', lastSuccessfulSyncAt: '2026-06-18T18:45:00Z', lastErrorAt: null, lastErrorMessage: null },
  { integrationConnectionId: 'int_rmm_demo', systemType: 'rmm', systemName: 'Demo RMM', status: 'connected', lastSuccessfulSyncAt: '2026-06-18T18:10:00Z', lastErrorAt: null, lastErrorMessage: null },
  { integrationConnectionId: 'int_security_demo', systemType: 'security', systemName: 'Demo Security Platform', status: 'connected', lastSuccessfulSyncAt: '2026-06-18T11:00:00Z', lastErrorAt: null, lastErrorMessage: null },
  { integrationConnectionId: 'int_m365_demo', systemType: 'microsoft365', systemName: 'Demo Microsoft 365', status: 'error', lastSuccessfulSyncAt: '2026-06-09T10:30:00Z', lastErrorAt: '2026-06-18T18:00:00Z', lastErrorMessage: 'Demo stale-data scenario: token refresh failed.' }
];

const accounts = [
  { accountId: 'acct_acme', displayName: 'Acme Corp', legalName: 'Acme Corporation', shortName: 'Acme', status: 'active', primaryDomain: 'acme.example', industry: 'Professional Services', segment: 'Mid-Market', employeeCount: 185, accountTier: 'Premium', healthCategory: 'watch', healthSummary: 'Elevated service volume, patch gaps, and renewal in 67 days.' },
  { accountId: 'acct_brightway', displayName: 'Brightway Dental', legalName: 'Brightway Dental Group', shortName: 'Brightway', status: 'active', primaryDomain: 'brightwaydental.example', industry: 'Healthcare', segment: 'SMB', employeeCount: 42, accountTier: 'Standard', healthCategory: 'healthy', healthSummary: 'Low ticket volume, current endpoint health, and no near-term renewal risk.' },
  { accountId: 'acct_northstar', displayName: 'Northstar Legal Group', legalName: 'Northstar Legal Group LLP', shortName: 'Northstar', status: 'active', primaryDomain: 'northstarlegal.example', industry: 'Legal', segment: 'Mid-Market', employeeCount: 96, accountTier: 'Premium', healthCategory: 'at_risk', healthSummary: 'Critical escalated outage, SLA breach, and renewal sentiment risk.' },
  { accountId: 'acct_greenfield', displayName: 'Greenfield Manufacturing', legalName: 'Greenfield Manufacturing Co.', shortName: 'Greenfield', status: 'active', primaryDomain: 'greenfieldmfg.example', industry: 'Manufacturing', segment: 'Mid-Market', employeeCount: 260, accountTier: 'Premium', healthCategory: 'renewal_risk', healthSummary: 'Renewal is in 27 days and no recent QBR is recorded.' },
  { accountId: 'acct_summit', displayName: 'Summit Architecture', legalName: 'Summit Architecture Studio', shortName: 'Summit', status: 'active', primaryDomain: 'summitarch.example', industry: 'Architecture', segment: 'SMB', employeeCount: 58, accountTier: 'Standard', healthCategory: 'expansion_candidate', healthSummary: 'Stable and underpenetrated for security and backup services.' },
  { accountId: 'acct_riverbend', displayName: 'Riverbend Nonprofit', legalName: 'Riverbend Community Foundation', shortName: 'Riverbend', status: 'active', primaryDomain: 'riverbendfoundation.example', industry: 'Nonprofit', segment: 'SMB', employeeCount: 35, accountTier: 'Standard', healthCategory: 'watch', healthSummary: 'RMM account mapping requires review before full recommendations.' },
  { accountId: 'acct_harbor', displayName: 'Harbor Medical', legalName: 'Harbor Medical Associates', shortName: 'Harbor', status: 'active', primaryDomain: 'harbormedical.example', industry: 'Healthcare', segment: 'Mid-Market', employeeCount: 120, accountTier: 'Premium', healthCategory: 'watch', healthSummary: 'Security/Microsoft 365 data is stale and must be refreshed.' }
];

const accountOwners = [
  { accountId: 'acct_acme', userId: 'usr_am_jane', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_brightway', userId: 'usr_am_jane', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_northstar', userId: 'usr_am_jane', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_greenfield', userId: 'usr_sales_marcus', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_summit', userId: 'usr_sales_marcus', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_riverbend', userId: 'usr_am_jane', role: 'account_manager', isPrimary: true },
  { accountId: 'acct_harbor', userId: 'usr_am_jane', role: 'account_manager', isPrimary: true }
];

const aliases = [
  { accountId: 'acct_acme', aliasValue: 'ACME' },
  { accountId: 'acct_acme', aliasValue: 'Acme Corporation' },
  { accountId: 'acct_brightway', aliasValue: 'Brightway Dental Group' },
  { accountId: 'acct_northstar', aliasValue: 'Northstar Legal' },
  { accountId: 'acct_greenfield', aliasValue: 'Greenfield MFG' },
  { accountId: 'acct_summit', aliasValue: 'Summit Arch' },
  { accountId: 'acct_riverbend', aliasValue: 'Riverbend Foundation' },
  { accountId: 'acct_harbor', aliasValue: 'Harbor Medical Associates' }
];

const externalIdentities = [
  { accountId: 'acct_acme', integrationConnectionId: 'int_psa_demo', sourceSystemType: 'psa', sourceSystemName: 'Demo PSA', externalRecordType: 'company', externalId: 'PSA-1001', externalDisplayName: 'Acme Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 100 },
  { accountId: 'acct_acme', integrationConnectionId: 'int_rmm_demo', sourceSystemType: 'rmm', sourceSystemName: 'Demo RMM', externalRecordType: 'client', externalId: 'RMM-ACME-01', externalDisplayName: 'ACME Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 98 },
  { accountId: 'acct_acme', integrationConnectionId: 'int_security_demo', sourceSystemType: 'security', sourceSystemName: 'Demo Security Platform', externalRecordType: 'tenant', externalId: 'SEC-TENANT-ACME', externalDisplayName: 'Acme Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 99 },
  { accountId: 'acct_riverbend', integrationConnectionId: 'int_rmm_demo', sourceSystemType: 'rmm', sourceSystemName: 'Demo RMM', externalRecordType: 'client', externalId: 'RMM-RIVER-UNKNOWN', externalDisplayName: 'River Bend Community', externalDomain: null, matchStatus: 'needs_review', matchConfidence: 62 },
  { accountId: 'acct_harbor', integrationConnectionId: 'int_m365_demo', sourceSystemType: 'microsoft365', sourceSystemName: 'Demo Microsoft 365', externalRecordType: 'tenant', externalId: 'M365-HARBOR-TENANT', externalDisplayName: 'Harbor Medical', externalDomain: 'harbormedical.example', matchStatus: 'confirmed', matchConfidence: 100 }
];

const contacts = [
  { contactId: 'contact_acme_tina', accountId: 'acct_acme', fullName: 'Tina Reynolds', email: 'tina.reynolds@acme.example', title: 'Chief Operating Officer', isPrimaryContact: true },
  { contactId: 'contact_acme_omar', accountId: 'acct_acme', fullName: 'Omar Castillo', email: 'omar.castillo@acme.example', title: 'IT Manager', isTechnicalContact: true },
  { contactId: 'contact_brightway_lena', accountId: 'acct_brightway', fullName: 'Lena Brooks', email: 'lena.brooks@brightwaydental.example', title: 'Practice Administrator', isPrimaryContact: true },
  { contactId: 'contact_northstar_evelyn', accountId: 'acct_northstar', fullName: 'Evelyn Hart', email: 'evelyn.hart@northstarlegal.example', title: 'Managing Partner', isPrimaryContact: true },
  { contactId: 'contact_greenfield_ryan', accountId: 'acct_greenfield', fullName: 'Ryan Miller', email: 'ryan.miller@greenfieldmfg.example', title: 'VP Operations', isPrimaryContact: true },
  { contactId: 'contact_summit_ava', accountId: 'acct_summit', fullName: 'Ava Chen', email: 'ava.chen@summitarch.example', title: 'Principal Architect', isPrimaryContact: true }
];

const agreements = [
  { agreementId: 'agr_acme_managed_services', accountId: 'acct_acme', name: 'Managed Services Premium', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-08-24', monthlyRecurringRevenue: 12500, annualRecurringRevenue: 150000 },
  { agreementId: 'agr_brightway_standard', accountId: 'acct_brightway', name: 'Managed Services Standard', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-12-31', monthlyRecurringRevenue: 4200, annualRecurringRevenue: 50400 },
  { agreementId: 'agr_northstar_premium', accountId: 'acct_northstar', name: 'Managed Services Premium', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-10-31', monthlyRecurringRevenue: 9800, annualRecurringRevenue: 117600 },
  { agreementId: 'agr_greenfield_premium', accountId: 'acct_greenfield', name: 'Managed Services Premium + Network Operations', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-07-15', monthlyRecurringRevenue: 18400, annualRecurringRevenue: 220800 },
  { agreementId: 'agr_summit_standard', accountId: 'acct_summit', name: 'Managed Services Standard', status: 'active', agreementType: 'Managed Services', renewalDate: '2027-02-28', monthlyRecurringRevenue: 5300, annualRecurringRevenue: 63600 },
  { agreementId: 'agr_riverbend_standard', accountId: 'acct_riverbend', name: 'Managed Services Standard', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-09-30', monthlyRecurringRevenue: 3100, annualRecurringRevenue: 37200 },
  { agreementId: 'agr_harbor_premium', accountId: 'acct_harbor', name: 'Managed Services Premium Healthcare', status: 'active', agreementType: 'Managed Services', renewalDate: '2026-11-30', monthlyRecurringRevenue: 11200, annualRecurringRevenue: 134400 }
];

const renewals = [
  { renewalId: 'ren_acme_2026', accountId: 'acct_acme', agreementId: 'agr_acme_managed_services', renewalDate: '2026-08-24', status: 'upcoming', renewalAmount: 150000, ownerUserId: 'usr_am_jane', daysUntilRenewal: 67, riskReason: 'Upcoming renewal with elevated service and patch concerns.' },
  { renewalId: 'ren_brightway_2026', accountId: 'acct_brightway', agreementId: 'agr_brightway_standard', renewalDate: '2026-12-31', status: 'upcoming', renewalAmount: 50400, ownerUserId: 'usr_am_jane', daysUntilRenewal: 196, riskReason: null },
  { renewalId: 'ren_northstar_2026', accountId: 'acct_northstar', agreementId: 'agr_northstar_premium', renewalDate: '2026-10-31', status: 'at_risk', renewalAmount: 117600, ownerUserId: 'usr_am_jane', daysUntilRenewal: 135, riskReason: 'Service escalations and margin pressure may affect renewal sentiment.' },
  { renewalId: 'ren_greenfield_2026', accountId: 'acct_greenfield', agreementId: 'agr_greenfield_premium', renewalDate: '2026-07-15', status: 'at_risk', renewalAmount: 220800, ownerUserId: 'usr_sales_marcus', daysUntilRenewal: 27, riskReason: 'Renewal is inside 30 days and no recent QBR is recorded.' },
  { renewalId: 'ren_summit_2027', accountId: 'acct_summit', agreementId: 'agr_summit_standard', renewalDate: '2027-02-28', status: 'upcoming', renewalAmount: 63600, ownerUserId: 'usr_sales_marcus', daysUntilRenewal: 255, riskReason: null }
];

const productEvents = [];

module.exports = { users, integrations, accounts, accountOwners, aliases, externalIdentities, contacts, agreements, renewals, productEvents };
