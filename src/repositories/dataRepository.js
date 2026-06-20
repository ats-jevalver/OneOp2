const { Pool } = require('pg');
const staticData = require('../data');

let activeData = staticData;
let pgPool = null;

function providerName() { return (process.env.ONEOP2_STORE_PROVIDER || 'json').toLowerCase(); }
function getPool() {
  if (!process.env.ONEOP2_DATABASE_URL) throw new Error('ONEOP2_DATABASE_URL is required to load PostgreSQL read data.');
  if (!pgPool) pgPool = new Pool({ connectionString: process.env.ONEOP2_DATABASE_URL });
  return pgPool;
}
function rows(result) { return result.rows; }
function toNumber(value) { return value == null ? value : Number(value); }
function toBool(value) { return Boolean(value); }
function toDateString(value) { return value instanceof Date ? value.toISOString().slice(0, 10) : value; }
function toIso(value) { return value instanceof Date ? value.toISOString() : value; }

async function query(client, sql) { return rows(await client.query(sql)); }

async function loadPostgresData() {
  const client = await getPool().connect();
  try {
    const users = (await query(client, 'select * from users order by user_id')).map(u => ({ userId: u.user_id, displayName: u.display_name, email: u.email, role: u.role, status: u.status }));
    const accounts = (await query(client, 'select * from accounts order by account_id')).map(a => ({ accountId: a.account_id, displayName: a.display_name, legalName: a.legal_name, shortName: a.short_name, status: a.status, primaryDomain: a.primary_domain, industry: a.industry, segment: a.segment, employeeCount: a.employee_count, accountTier: a.account_tier, healthCategory: a.health_category, healthSummary: a.health_summary }));
    const integrations = (await query(client, 'select * from integrations order by integration_connection_id')).map(i => ({ integrationConnectionId: i.integration_connection_id, systemType: i.system_type, systemName: i.system_name, status: i.status, lastSuccessfulSyncAt: toIso(i.last_successful_sync_at), lastErrorAt: toIso(i.last_error_at), lastErrorMessage: i.last_error_message }));
    const externalIdentities = (await query(client, 'select * from account_external_identities order by account_external_identity_id')).map(e => ({ accountExternalIdentityId: e.account_external_identity_id, accountId: e.account_id, integrationConnectionId: e.integration_connection_id, sourceSystemType: e.source_system_type, sourceSystemName: e.source_system_name, externalRecordType: e.external_record_type, externalId: e.external_id, externalDisplayName: e.external_display_name, externalDomain: e.external_domain, matchStatus: e.match_status, matchConfidence: e.match_confidence, matchReason: e.match_reason }));
    const accountOwners = (await query(client, 'select * from account_owners order by account_id, user_id')).map(o => ({ accountId: o.account_id, userId: o.user_id, role: o.role, isPrimary: toBool(o.is_primary) }));
    const aliases = (await query(client, 'select * from account_aliases order by account_id, alias_value')).map(a => ({ accountId: a.account_id, aliasValue: a.alias_value }));
    const contacts = (await query(client, 'select * from contacts order by contact_id')).map(c => ({ contactId: c.contact_id, accountId: c.account_id, fullName: c.full_name, email: c.email, title: c.title, isPrimaryContact: toBool(c.is_primary_contact), isTechnicalContact: toBool(c.is_technical_contact) }));
    const agreements = (await query(client, 'select * from agreements order by agreement_id')).map(a => ({ agreementId: a.agreement_id, accountId: a.account_id, name: a.name, status: a.status, agreementType: a.agreement_type, renewalDate: toDateString(a.renewal_date), monthlyRecurringRevenue: toNumber(a.monthly_recurring_revenue), annualRecurringRevenue: toNumber(a.annual_recurring_revenue) }));
    const renewals = (await query(client, 'select * from renewals order by renewal_id')).map(r => ({ renewalId: r.renewal_id, accountId: r.account_id, agreementId: r.agreement_id, renewalDate: toDateString(r.renewal_date), status: r.status, renewalAmount: toNumber(r.renewal_amount), ownerUserId: r.owner_user_id, daysUntilRenewal: r.days_until_renewal, riskReason: r.risk_reason }));
    const tickets = (await query(client, 'select * from tickets order by ticket_id')).map(t => ({ ticketId: t.ticket_id, accountId: t.account_id, sourceSystemName: t.source_system_name, externalId: t.external_id, title: t.title, status: t.status, priority: t.priority, category: t.category, subcategory: t.subcategory, assignedTeam: t.assigned_team, slaStatus: t.sla_status, isEscalated: toBool(t.is_escalated), isRecurringIssueCandidate: toBool(t.is_recurring_issue_candidate), createdAtSource: toIso(t.created_at_source), ageDays: t.age_days }));
    const devices = (await query(client, 'select * from devices order by device_id')).map(d => ({ deviceId: d.device_id, accountId: d.account_id, sourceSystemName: d.source_system_name, externalId: d.external_id, displayName: d.display_name, deviceType: d.device_type, status: d.status, operatingSystem: d.operating_system, lastSeenAt: toIso(d.last_seen_at), lastPatchedAt: toIso(d.last_patched_at), patchStatus: d.patch_status, warrantyExpirationDate: toDateString(d.warranty_expiration_date), ageYears: toNumber(d.age_years), isEndOfLife: toBool(d.is_end_of_life), isServer: toBool(d.is_server), isCritical: toBool(d.is_critical) }));
    const deviceHealthSignals = (await query(client, 'select * from device_health_signals order by device_health_signal_id')).map(s => ({ deviceHealthSignalId: s.device_health_signal_id, accountId: s.account_id, deviceId: s.device_id, sourceSystemName: s.source_system_name, externalId: s.external_id, signalType: s.signal_type, severity: s.severity, summary: s.summary, observedAt: toIso(s.observed_at) }));
    const securityFindings = (await query(client, 'select * from security_findings order by security_finding_id')).map(f => ({ securityFindingId: f.security_finding_id, accountId: f.account_id, sourceSystemName: f.source_system_name, externalId: f.external_id, findingType: f.finding_type, severity: f.severity, status: f.status, title: f.title, description: f.description, affectedService: f.affected_service, businessImpact: f.business_impact, recommendedRemediation: f.recommended_remediation, observedAt: toIso(f.observed_at), isCustomerFacing: toBool(f.is_customer_facing) }));
    const securityCoverage = (await query(client, 'select * from security_coverage order by security_coverage_id')).map(c => ({ securityCoverageId: c.security_coverage_id, accountId: c.account_id, coverageType: c.coverage_type, coverageStatus: c.coverage_status, productName: c.product_name, vendorName: c.vendor_name, deviceCountCovered: c.device_count_covered, deviceCountMissing: c.device_count_missing, lastVerifiedAt: toIso(c.last_verified_at) }));
    const evidenceItems = (await query(client, 'select * from evidence_items order by evidence_item_id')).map(e => ({ evidenceItemId: e.evidence_item_id, accountId: e.account_id, sourceSystemName: e.source_system_name, sourceRecordType: e.source_record_type, sourceRecordId: e.source_record_id, evidenceType: e.source_record_type, summary: e.summary, severity: null, observedAt: toIso(e.observed_at) }));
    const accountHealthScores = (await query(client, 'select * from account_health_scores order by account_health_score_id')).map(h => ({ accountHealthScoreId: h.account_health_score_id, accountId: h.account_id, scoreCategory: h.score_category, scoreValue: h.score_value, summary: h.summary, confidence: h.confidence, calculatedAt: toIso(h.calculated_at), topDrivers: h.top_drivers || [], evidenceItemIds: h.evidence_item_ids || [] }));
    const recommendations = (await query(client, 'select * from recommendations order by recommendation_id')).map(r => ({ recommendationId: r.recommendation_id, accountId: r.account_id, recommendationType: r.recommendation_type, title: r.title, reason: r.reason, priority: r.priority, status: r.status, suggestedOwnerUserId: r.suggested_owner_user_id, suggestedDueDate: toDateString(r.suggested_due_date), confidence: r.confidence, evidenceItemIds: r.evidence_item_ids || [] }));
    const accountPlans = (await query(client, 'select * from account_plans order by account_plan_id')).map(p => ({ accountPlanId: p.account_plan_id, accountId: p.account_id, planName: p.plan_name, status: p.status, planSummary: p.plan_summary, ownerUserId: p.owner_user_id, targetReviewDate: toDateString(p.target_review_date), updatedAt: toIso(p.updated_at) }));
    const accountPlanObjectives = (await query(client, 'select * from account_plan_objectives order by account_plan_objective_id')).map(o => ({ accountPlanObjectiveId: o.account_plan_objective_id, accountPlanId: o.account_plan_id, title: o.title, objectiveType: o.objective_type, status: o.status, priority: o.priority, targetDate: toDateString(o.target_date), successMetric: o.success_metric, linkedRecommendationId: o.linked_recommendation_id }));
    const accountPlanRisks = (await query(client, 'select * from account_plan_risks order by account_plan_risk_id')).map(r => ({ accountPlanRiskId: r.account_plan_risk_id, accountPlanId: r.account_plan_id, title: r.title, severity: r.severity, status: r.status, mitigation: r.mitigation, updatedAt: toIso(r.updated_at) }));
    const accountPlanNextSteps = (await query(client, 'select * from account_plan_next_steps order by account_plan_next_step_id')).map(s => ({ accountPlanNextStepId: s.account_plan_next_step_id, accountPlanId: s.account_plan_id, title: s.title, ownerUserId: s.owner_user_id, dueDate: toDateString(s.due_date), status: s.status, linkedObjectiveId: s.linked_objective_id, updatedAt: toIso(s.updated_at) }));
    const accountPlanStakeholders = (await query(client, 'select * from account_plan_stakeholders order by account_plan_stakeholder_id')).map(s => ({ accountPlanStakeholderId: s.account_plan_stakeholder_id, accountPlanId: s.account_plan_id, contactId: s.contact_id, stakeholderRole: s.stakeholder_role, relationshipStrength: s.relationship_strength, sentiment: s.sentiment, notes: s.notes }));
    const contactEngagementEvents = (await query(client, 'select * from contact_engagement_events order by engagement_event_id')).map(e => ({ engagementEventId: e.engagement_event_id, accountId: e.account_id, contactId: e.contact_id, eventType: e.event_type, occurredAt: toIso(e.occurred_at), summary: e.summary, sentiment: e.sentiment, sourceSystemType: e.source_system_type }));

    activeData = { ...staticData, users, accounts, integrations, externalIdentities, accountOwners, aliases, contacts, agreements, renewals, tickets, devices, deviceHealthSignals, securityFindings, securityCoverage, evidenceItems, accountHealthScores, recommendations, accountPlans, accountPlanObjectives, accountPlanRisks, accountPlanNextSteps, accountPlanStakeholders, contactEngagementEvents };
    return activeData;
  } finally {
    client.release();
  }
}

async function initialize() {
  if (providerName() === 'postgres') return loadPostgresData();
  activeData = staticData;
  return activeData;
}
function getData() { return activeData; }
async function databaseStatus() {
  const tableNames = ['users','accounts','integrations','account_external_identities','account_owners','account_aliases','contacts','agreements','renewals','tickets','devices','device_health_signals','security_findings','security_coverage','evidence_items','account_health_scores','recommendations','account_plans','account_plan_objectives','account_plan_risks','account_plan_next_steps','account_plan_stakeholders','contact_engagement_events','integration_configurations','integration_sync_history','app_settings'];
  const status = { provider: providerName(), databaseConfigured: Boolean(process.env.ONEOP2_DATABASE_URL), connected: false, tableCounts: {}, requiredTablesPresent: false, seedValid: false };
  if (providerName() !== 'postgres') return status;
  const client = await getPool().connect();
  try {
    await client.query('select 1');
    status.connected = true;
    for (const table of tableNames) {
      const result = await client.query(`select count(*)::int as count from ${table}`);
      status.tableCounts[table] = result.rows[0].count;
    }
    status.requiredTablesPresent = tableNames.every(table => Object.prototype.hasOwnProperty.call(status.tableCounts, table));
    status.seedValid = status.tableCounts.users >= 1 && status.tableCounts.accounts >= 1 && status.tableCounts.recommendations >= 1 && status.tableCounts.app_settings >= 1;
    return status;
  } finally {
    client.release();
  }
}
async function close() { if (pgPool) await pgPool.end(); }

module.exports = { initialize, getData, databaseStatus, close };

