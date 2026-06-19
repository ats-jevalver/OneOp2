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
  { accountId: 'acct_acme', aliasValue: 'ACME' }, { accountId: 'acct_acme', aliasValue: 'Acme Corporation' },
  { accountId: 'acct_brightway', aliasValue: 'Brightway Dental Group' }, { accountId: 'acct_northstar', aliasValue: 'Northstar Legal' },
  { accountId: 'acct_greenfield', aliasValue: 'Greenfield MFG' }, { accountId: 'acct_summit', aliasValue: 'Summit Arch' },
  { accountId: 'acct_riverbend', aliasValue: 'Riverbend Foundation' }, { accountId: 'acct_harbor', aliasValue: 'Harbor Medical Associates' }
];

const externalIdentities = [
  { accountExternalIdentityId: 'ext_acme_psa', accountId: 'acct_acme', integrationConnectionId: 'int_psa_demo', sourceSystemType: 'psa', sourceSystemName: 'Demo PSA', externalRecordType: 'company', externalId: 'PSA-1001', externalDisplayName: 'Acme Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 100, matchReason: 'Seeded confirmed PSA identity.' },
  { accountExternalIdentityId: 'ext_acme_rmm', accountId: 'acct_acme', integrationConnectionId: 'int_rmm_demo', sourceSystemType: 'rmm', sourceSystemName: 'Demo RMM', externalRecordType: 'client', externalId: 'RMM-ACME-01', externalDisplayName: 'ACME Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 98, matchReason: 'Domain and normalized name match.' },
  { accountExternalIdentityId: 'ext_acme_security', accountId: 'acct_acme', integrationConnectionId: 'int_security_demo', sourceSystemType: 'security', sourceSystemName: 'Demo Security Platform', externalRecordType: 'tenant', externalId: 'SEC-TENANT-ACME', externalDisplayName: 'Acme Corp', externalDomain: 'acme.example', matchStatus: 'confirmed', matchConfidence: 99, matchReason: 'Domain match.' },
  { accountExternalIdentityId: 'ext_riverbend_rmm_suggested', accountId: 'acct_riverbend', integrationConnectionId: 'int_rmm_demo', sourceSystemType: 'rmm', sourceSystemName: 'Demo RMM', externalRecordType: 'client', externalId: 'RMM-RIVER-UNKNOWN', externalDisplayName: 'River Bend Community', externalDomain: null, matchStatus: 'needs_review', matchConfidence: 62, matchReason: 'Similar name but no domain match.' },
  { accountExternalIdentityId: 'ext_harbor_m365', accountId: 'acct_harbor', integrationConnectionId: 'int_m365_demo', sourceSystemType: 'microsoft365', sourceSystemName: 'Demo Microsoft 365', externalRecordType: 'tenant', externalId: 'M365-HARBOR-TENANT', externalDisplayName: 'Harbor Medical', externalDomain: 'harbormedical.example', matchStatus: 'confirmed', matchConfidence: 100, matchReason: 'Seeded stale security/M365 scenario.' }
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

const tickets = [
  { ticketId: 'ticket_acme_001', accountId: 'acct_acme', sourceSystemName: 'Demo PSA', externalId: 'TCK-ACME-001', title: 'Intermittent VPN connectivity for finance users', status: 'open', priority: 'high', category: 'Network', subcategory: 'VPN', assignedTeam: 'Service Desk', slaStatus: 'at_risk', isEscalated: false, isRecurringIssueCandidate: true, createdAtSource: '2026-06-08T14:20:00Z', ageDays: 10 },
  { ticketId: 'ticket_acme_002', accountId: 'acct_acme', sourceSystemName: 'Demo PSA', externalId: 'TCK-ACME-002', title: 'Server patching failed on accounting server', status: 'open', priority: 'medium', category: 'Server', subcategory: 'Patching', assignedTeam: 'Infrastructure', slaStatus: 'ok', isEscalated: false, isRecurringIssueCandidate: false, createdAtSource: '2026-06-14T09:30:00Z', ageDays: 4 },
  { ticketId: 'ticket_northstar_001', accountId: 'acct_northstar', sourceSystemName: 'Demo PSA', externalId: 'TCK-NORTH-001', title: 'Document management system outage', status: 'open', priority: 'critical', category: 'Line of Business App', subcategory: 'Outage', assignedTeam: 'Escalations', slaStatus: 'breached', isEscalated: true, isRecurringIssueCandidate: true, createdAtSource: '2026-06-03T08:15:00Z', ageDays: 15 },
  { ticketId: 'ticket_greenfield_001', accountId: 'acct_greenfield', sourceSystemName: 'Demo PSA', externalId: 'TCK-GREEN-001', title: 'Renewal planning meeting not yet scheduled', status: 'open', priority: 'high', category: 'Account Management', subcategory: 'Renewal', assignedTeam: 'Account Management', slaStatus: 'ok', isEscalated: false, isRecurringIssueCandidate: false, createdAtSource: '2026-06-10T12:00:00Z', ageDays: 8 },
  { ticketId: 'ticket_brightway_001', accountId: 'acct_brightway', sourceSystemName: 'Demo PSA', externalId: 'TCK-BRIGHT-001', title: 'New user onboarding completed', status: 'closed', priority: 'low', category: 'User Administration', subcategory: 'Onboarding', assignedTeam: 'Service Desk', slaStatus: 'ok', isEscalated: false, isRecurringIssueCandidate: false, createdAtSource: '2026-06-12T10:00:00Z', ageDays: 1 }
];

const devices = [
  { deviceId: 'dev_acme_srv_accounting', accountId: 'acct_acme', sourceSystemName: 'Demo RMM', externalId: 'RMM-DEV-ACME-SRV-01', displayName: 'ACME-ACCT-SRV01', deviceType: 'server', status: 'online', operatingSystem: 'Windows Server 2019', lastSeenAt: '2026-06-18T18:05:00Z', lastPatchedAt: '2026-05-08T02:00:00Z', patchStatus: 'behind', warrantyExpirationDate: '2026-12-31', ageYears: 4.5, isEndOfLife: false, isServer: true, isCritical: true },
  { deviceId: 'dev_acme_ws_legacy_01', accountId: 'acct_acme', sourceSystemName: 'Demo RMM', externalId: 'RMM-DEV-ACME-WS-OLD-01', displayName: 'ACME-FIN-WS07', deviceType: 'workstation', status: 'online', operatingSystem: 'Windows 10 22H2', lastSeenAt: '2026-06-18T18:03:00Z', lastPatchedAt: '2026-04-20T02:00:00Z', patchStatus: 'critical_missing', warrantyExpirationDate: '2025-11-30', ageYears: 5.8, isEndOfLife: true, isServer: false, isCritical: false },
  { deviceId: 'dev_summit_ws_01', accountId: 'acct_summit', sourceSystemName: 'Demo RMM', externalId: 'RMM-DEV-SUMMIT-WS-01', displayName: 'SUMMIT-DESIGN-01', deviceType: 'workstation', status: 'online', operatingSystem: 'Windows 11', lastSeenAt: '2026-06-18T18:01:00Z', lastPatchedAt: '2026-06-10T02:00:00Z', patchStatus: 'current', warrantyExpirationDate: '2027-07-31', ageYears: 1.5, isEndOfLife: false, isServer: false, isCritical: false },
  { deviceId: 'dev_northstar_srv_docs', accountId: 'acct_northstar', sourceSystemName: 'Demo RMM', externalId: 'RMM-DEV-NORTH-SRV-01', displayName: 'NORTH-DOC-SRV01', deviceType: 'server', status: 'offline', operatingSystem: 'Windows Server 2016', lastSeenAt: '2026-06-17T05:00:00Z', lastPatchedAt: '2026-03-01T02:00:00Z', patchStatus: 'critical_missing', warrantyExpirationDate: '2024-08-31', ageYears: 7.2, isEndOfLife: true, isServer: true, isCritical: true }
];

const deviceHealthSignals = [
  { deviceHealthSignalId: 'sig_acme_patch_gap', accountId: 'acct_acme', deviceId: 'dev_acme_ws_legacy_01', sourceSystemName: 'Demo RMM', externalId: 'SIG-ACME-PATCH-01', signalType: 'patch_missing', severity: 'high', summary: 'Legacy finance workstation is missing critical patches.', observedAt: '2026-06-18T18:03:00Z' },
  { deviceHealthSignalId: 'sig_northstar_server_offline', accountId: 'acct_northstar', deviceId: 'dev_northstar_srv_docs', sourceSystemName: 'Demo RMM', externalId: 'SIG-NORTH-OFFLINE-01', signalType: 'offline', severity: 'critical', summary: 'Document management server is offline and out of warranty.', observedAt: '2026-06-18T17:30:00Z' }
];

const securityFindings = [
  { securityFindingId: 'sec_acme_mfa_gap', accountId: 'acct_acme', sourceSystemName: 'Demo Security Platform', externalId: 'SEC-ACME-001', findingType: 'missing_control', severity: 'high', status: 'open', title: 'MFA not enforced for all administrative users', description: 'Two administrative users do not have enforced MFA.', affectedService: 'Identity', businessImpact: 'Increased risk of account takeover and unauthorized administrative access.', recommendedRemediation: 'Enforce MFA for all administrative users and review conditional access policies.', observedAt: '2026-06-18T11:00:00Z', isCustomerFacing: true },
  { securityFindingId: 'sec_summit_coverage_gap', accountId: 'acct_summit', sourceSystemName: 'Demo Security Platform', externalId: 'SEC-SUMMIT-001', findingType: 'coverage_gap', severity: 'medium', status: 'open', title: 'No MDR coverage detected', description: 'Summit is stable but lacks managed detection and response coverage.', affectedService: 'Endpoint Security', businessImpact: 'Security opportunity for improved monitoring and response.', recommendedRemediation: 'Review MDR service fit during next account conversation.', observedAt: '2026-06-16T13:00:00Z', isCustomerFacing: true },
  { securityFindingId: 'sec_harbor_stale_placeholder', accountId: 'acct_harbor', sourceSystemName: 'Demo Microsoft 365', externalId: 'M365-HARBOR-STALE-001', findingType: 'coverage_gap', severity: 'medium', status: 'unknown', title: 'Security data stale due to failed Microsoft 365 sync', description: 'Last successful Microsoft 365 sync was on 2026-06-09.', affectedService: 'Microsoft 365', businessImpact: 'Current Microsoft 365 security posture cannot be verified.', recommendedRemediation: 'Restore Microsoft 365 integration sync before relying on recommendations.', observedAt: '2026-06-09T10:30:00Z', isCustomerFacing: false }
];

const securityCoverage = [
  { securityCoverageId: 'cov_acme_edr', accountId: 'acct_acme', coverageType: 'edr', coverageStatus: 'covered', productName: 'Demo EDR', vendorName: 'Demo Security Vendor', deviceCountCovered: 82, deviceCountMissing: 2, lastVerifiedAt: '2026-06-18T11:00:00Z' },
  { securityCoverageId: 'cov_acme_mfa', accountId: 'acct_acme', coverageType: 'mfa', coverageStatus: 'partial', productName: 'Microsoft Entra ID', vendorName: 'Microsoft', deviceCountCovered: null, deviceCountMissing: null, lastVerifiedAt: '2026-06-18T11:00:00Z' },
  { securityCoverageId: 'cov_summit_mdr', accountId: 'acct_summit', coverageType: 'mdr', coverageStatus: 'missing', productName: null, vendorName: null, deviceCountCovered: 0, deviceCountMissing: 34, lastVerifiedAt: '2026-06-16T13:00:00Z' }
];

const evidenceItems = [
  { evidenceItemId: 'ev_acme_renewal_67', accountId: 'acct_acme', sourceSystemName: 'Demo PSA', sourceRecordType: 'renewal', sourceRecordId: 'ren_acme_2026', evidenceType: 'renewal', summary: 'Agreement renewal is in 67 days.', severity: 'medium', observedAt: '2026-06-18T18:45:00Z' },
  { evidenceItemId: 'ev_acme_ticket_vpn', accountId: 'acct_acme', sourceSystemName: 'Demo PSA', sourceRecordType: 'ticket', sourceRecordId: 'ticket_acme_001', evidenceType: 'ticket', summary: 'High-priority VPN ticket has been open for 10 days and is at SLA risk.', severity: 'high', observedAt: '2026-06-18T18:45:00Z' },
  { evidenceItemId: 'ev_acme_patch_gap', accountId: 'acct_acme', sourceSystemName: 'Demo RMM', sourceRecordType: 'device_health_signal', sourceRecordId: 'sig_acme_patch_gap', evidenceType: 'device', summary: 'Legacy finance workstation is missing critical patches.', severity: 'high', observedAt: '2026-06-18T18:03:00Z' },
  { evidenceItemId: 'ev_acme_mfa_gap', accountId: 'acct_acme', sourceSystemName: 'Demo Security Platform', sourceRecordType: 'security_finding', sourceRecordId: 'sec_acme_mfa_gap', evidenceType: 'security_finding', summary: 'MFA is not enforced for all administrative users.', severity: 'high', observedAt: '2026-06-18T11:00:00Z' },
  { evidenceItemId: 'ev_northstar_outage', accountId: 'acct_northstar', sourceSystemName: 'Demo PSA', sourceRecordType: 'ticket', sourceRecordId: 'ticket_northstar_001', evidenceType: 'ticket', summary: 'Critical document management outage is escalated and SLA-breached.', severity: 'critical', observedAt: '2026-06-18T18:45:00Z' },
  { evidenceItemId: 'ev_northstar_server', accountId: 'acct_northstar', sourceSystemName: 'Demo RMM', sourceRecordType: 'device_health_signal', sourceRecordId: 'sig_northstar_server_offline', evidenceType: 'device', summary: 'Critical document server is offline, end-of-life, and out of warranty.', severity: 'critical', observedAt: '2026-06-18T17:30:00Z' },
  { evidenceItemId: 'ev_greenfield_renewal_27', accountId: 'acct_greenfield', sourceSystemName: 'Demo PSA', sourceRecordType: 'renewal', sourceRecordId: 'ren_greenfield_2026', evidenceType: 'renewal', summary: 'Agreement renewal is in 27 days and marked at risk.', severity: 'critical', observedAt: '2026-06-18T18:45:00Z' },
  { evidenceItemId: 'ev_summit_mdr_gap', accountId: 'acct_summit', sourceSystemName: 'Demo Security Platform', sourceRecordType: 'security_finding', sourceRecordId: 'sec_summit_coverage_gap', evidenceType: 'security_finding', summary: 'No MDR coverage detected for a stable account.', severity: 'medium', observedAt: '2026-06-16T13:00:00Z' },
  { evidenceItemId: 'ev_harbor_stale', accountId: 'acct_harbor', sourceSystemName: 'Demo Microsoft 365', sourceRecordType: 'security_finding', sourceRecordId: 'sec_harbor_stale_placeholder', evidenceType: 'security_finding', summary: 'Microsoft 365 sync is stale; current security posture cannot be verified.', severity: 'medium', observedAt: '2026-06-09T10:30:00Z' }
];

const accountHealthScores = [
  { accountHealthScoreId: 'health_acme_latest', accountId: 'acct_acme', scoreCategory: 'watch', scoreValue: 62, summary: 'Acme has elevated service volume, patch gaps, MFA administrative exposure, and an upcoming renewal.', confidence: 'high', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Renewal in 67 days', 'High-priority VPN ticket at SLA risk', 'Critical patch gap on finance workstation', 'MFA gap for administrative users'], evidenceItemIds: ['ev_acme_renewal_67', 'ev_acme_ticket_vpn', 'ev_acme_patch_gap', 'ev_acme_mfa_gap'] },
  { accountHealthScoreId: 'health_brightway_latest', accountId: 'acct_brightway', scoreCategory: 'healthy', scoreValue: 86, summary: 'Brightway has low ticket volume, healthy renewal timing, and no major seeded technical risks.', confidence: 'medium', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Low service volume', 'Renewal is not near-term', 'No high severity seeded findings'], evidenceItemIds: [] },
  { accountHealthScoreId: 'health_northstar_latest', accountId: 'acct_northstar', scoreCategory: 'at_risk', scoreValue: 38, summary: 'Northstar has a critical escalated outage and an offline end-of-life server.', confidence: 'high', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Critical SLA-breached outage', 'Critical server offline', 'Server is end-of-life and out of warranty'], evidenceItemIds: ['ev_northstar_outage', 'ev_northstar_server'] },
  { accountHealthScoreId: 'health_greenfield_latest', accountId: 'acct_greenfield', scoreCategory: 'renewal_risk', scoreValue: 49, summary: 'Greenfield renewal is in 27 days and no recent QBR is recorded.', confidence: 'high', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Renewal in 27 days', 'Renewal marked at risk', 'No recent QBR recorded'], evidenceItemIds: ['ev_greenfield_renewal_27'] },
  { accountHealthScoreId: 'health_summit_latest', accountId: 'acct_summit', scoreCategory: 'expansion_candidate', scoreValue: 78, summary: 'Summit is stable and appears underpenetrated for managed security services.', confidence: 'medium', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Stable service posture', 'No MDR coverage detected', 'Healthy renewal runway'], evidenceItemIds: ['ev_summit_mdr_gap'] },
  { accountHealthScoreId: 'health_harbor_latest', accountId: 'acct_harbor', scoreCategory: 'watch', scoreValue: 60, summary: 'Harbor requires attention because Microsoft 365/security data is stale.', confidence: 'low', calculatedAt: '2026-06-18T19:00:00Z', topDrivers: ['Security data stale', 'Microsoft 365 token refresh failed'], evidenceItemIds: ['ev_harbor_stale'] }
];

const recommendations = [
  { recommendationId: 'rec_acme_qbr', accountId: 'acct_acme', recommendationType: 'schedule_qbr', title: 'Schedule renewal-focused QBR', reason: 'Renewal is in 67 days and service/security signals create a strong account review conversation.', priority: 'high', status: 'new', suggestedOwnerUserId: 'usr_am_jane', suggestedDueDate: '2026-06-25', confidence: 'high', evidenceItemIds: ['ev_acme_renewal_67', 'ev_acme_ticket_vpn', 'ev_acme_patch_gap'] },
  { recommendationId: 'rec_acme_security_email', accountId: 'acct_acme', recommendationType: 'security_risk_email', title: 'Draft security risk email about MFA administrative gap', reason: 'Two administrative users do not have enforced MFA.', priority: 'high', status: 'new', suggestedOwnerUserId: 'usr_security_sam', suggestedDueDate: '2026-06-24', confidence: 'high', evidenceItemIds: ['ev_acme_mfa_gap'] },
  { recommendationId: 'rec_northstar_service_review', accountId: 'acct_northstar', recommendationType: 'service_manager_review', title: 'Escalate service manager review', reason: 'Critical document management outage is SLA-breached and tied to an offline end-of-life server.', priority: 'critical', status: 'new', suggestedOwnerUserId: 'usr_service_priya', suggestedDueDate: '2026-06-19', confidence: 'high', evidenceItemIds: ['ev_northstar_outage', 'ev_northstar_server'] },
  { recommendationId: 'rec_greenfield_renewal', accountId: 'acct_greenfield', recommendationType: 'renewal_follow_up', title: 'Create urgent renewal follow-up', reason: 'Agreement renewal is in 27 days and no recent QBR is recorded.', priority: 'critical', status: 'new', suggestedOwnerUserId: 'usr_sales_marcus', suggestedDueDate: '2026-06-20', confidence: 'high', evidenceItemIds: ['ev_greenfield_renewal_27'] },
  { recommendationId: 'rec_summit_security_opp', accountId: 'acct_summit', recommendationType: 'open_opportunity', title: 'Open security services expansion opportunity', reason: 'Summit is stable but lacks MDR coverage in the current account posture.', priority: 'medium', status: 'new', suggestedOwnerUserId: 'usr_sales_marcus', suggestedDueDate: '2026-07-01', confidence: 'medium', evidenceItemIds: ['ev_summit_mdr_gap'] }
];

const accountPlans = [
  { accountPlanId: 'plan_acme_2026', accountId: 'acct_acme', planName: 'Acme 2026 Account Plan', status: 'active', planSummary: 'Protect renewal, reduce operational risk, and align security improvements before the August renewal.', ownerUserId: 'usr_am_jane', targetReviewDate: '2026-07-15', updatedAt: '2026-06-19T12:00:00Z' }
];

const accountPlanObjectives = [
  { accountPlanObjectiveId: 'obj_acme_renewal', accountPlanId: 'plan_acme_2026', title: 'Secure renewal commitment', objectiveType: 'renewal', status: 'in_progress', priority: 'high', targetDate: '2026-08-01', successMetric: 'Renewal signed before 2026-08-24', linkedRecommendationId: 'rec_acme_qbr' },
  { accountPlanObjectiveId: 'obj_acme_security', accountPlanId: 'plan_acme_2026', title: 'Close administrative MFA gap', objectiveType: 'risk_reduction', status: 'planned', priority: 'high', targetDate: '2026-07-10', successMetric: 'MFA enforced for all administrative users', linkedRecommendationId: 'rec_acme_security_email' },
  { accountPlanObjectiveId: 'obj_acme_patch', accountPlanId: 'plan_acme_2026', title: 'Remediate legacy workstation patch gap', objectiveType: 'service_health', status: 'planned', priority: 'medium', targetDate: '2026-07-05', successMetric: 'Critical patch gap cleared or device replaced', linkedRecommendationId: null }
];

const accountPlanStakeholders = [
  { accountPlanStakeholderId: 'stake_acme_tina', accountPlanId: 'plan_acme_2026', contactId: 'contact_acme_tina', stakeholderRole: 'economic_buyer', relationshipStrength: 'strong', sentiment: 'neutral_positive', notes: 'Primary renewal sponsor; wants concise business-risk framing.' },
  { accountPlanStakeholderId: 'stake_acme_omar', accountPlanId: 'plan_acme_2026', contactId: 'contact_acme_omar', stakeholderRole: 'technical_champion', relationshipStrength: 'medium', sentiment: 'concerned', notes: 'Owns remediation details for MFA and workstation patch gap.' }
];
const generatedArtifacts = [];
const writeBackAuditEvents = [];
const activities = [];
const productEvents = [];

module.exports = {
  users,
  integrations,
  accounts,
  accountOwners,
  aliases,
  externalIdentities,
  contacts,
  agreements,
  renewals,
  tickets,
  devices,
  deviceHealthSignals,
  securityFindings,
  securityCoverage,
  evidenceItems,
  accountHealthScores,
  recommendations,
  accountPlans,
  accountPlanObjectives,
  accountPlanStakeholders,
  generatedArtifacts,
  writeBackAuditEvents,
  activities,
  productEvents
};

