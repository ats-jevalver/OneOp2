const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const data = require('../src/data');

const databaseUrl = process.env.ONEOP2_DATABASE_URL;
if (!databaseUrl) {
  console.error('ONEOP2_DATABASE_URL is required.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const runtimeStateKey = 'oneop2_runtime_state';
const runtimeInitialState = {
  generatedArtifacts: [],
  writeBackAuditEvents: [],
  activities: [],
  syncHistory: [],
  recommendationStatus: {},
  mappingStatus: {},
  accountPlanStatus: {},
  settings: {
    currentUserId: 'usr_am_jane',
    psaFieldMapping: {
      defaultTaskType: 'Account Management',
      defaultTaskStatus: 'Open',
      defaultTaskPriority: 'Normal',
      defaultBoard: 'Account Management',
      defaultNoteType: 'Account Note'
    },
    integrationConfigurations: {
      int_psa_demo: {
        integrationConnectionId: 'int_psa_demo',
        providerType: 'mock_psa',
        environmentLabel: 'Sprint 7 Pilot Sandbox',
        baseUrl: 'mock://psa',
        tenantOrCompanyId: 'demo-tenant',
        enabledCapabilities: ['company_sync_preview', 'contact_sync_preview', 'create_task', 'create_note'],
        secretStatus: 'not_configured',
        updatedAt: null,
        updatedByUserId: null
      }
    }
  }
};

function asJson(value) { return JSON.stringify(value ?? null); }
function toDate(value) { return value || null; }

async function insertMany(client, rows, sql, mapper) {
  for (const row of rows) await client.query(sql, mapper(row));
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(fs.readFileSync(schemaPath, 'utf8'));
    await client.query(`
      truncate table
        integration_sync_history,
        integration_configurations,
        contact_engagement_events,
        account_plan_next_steps,
        account_plan_risks,
        activities,
        write_back_audit_events,
        generated_artifacts,
        recommendations,
        account_health_scores,
        evidence_items,
        contacts,
        account_external_identities,
        integrations,
        accounts,
        users,
        app_settings
      restart identity cascade
    `);

    await insertMany(client, data.users, `
      insert into users (user_id, display_name, email, role, status)
      values ($1,$2,$3,$4,$5)
    `, u => [u.userId, u.displayName, u.email, u.role, u.status]);

    await insertMany(client, data.accounts, `
      insert into accounts (account_id, display_name, legal_name, short_name, status, primary_domain, industry, segment, employee_count, account_tier, health_category, health_summary)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, a => [a.accountId, a.displayName, a.legalName, a.shortName, a.status, a.primaryDomain, a.industry, a.segment, a.employeeCount, a.accountTier, a.healthCategory, a.healthSummary]);

    await insertMany(client, data.integrations, `
      insert into integrations (integration_connection_id, system_type, system_name, status, last_successful_sync_at, last_error_at, last_error_message)
      values ($1,$2,$3,$4,$5,$6,$7)
    `, i => [i.integrationConnectionId, i.systemType, i.systemName, i.status, toDate(i.lastSuccessfulSyncAt), toDate(i.lastErrorAt), i.lastErrorMessage]);

    await insertMany(client, data.externalIdentities, `
      insert into account_external_identities (account_external_identity_id, account_id, integration_connection_id, source_system_type, source_system_name, external_record_type, external_id, external_display_name, external_domain, match_status, match_confidence, match_reason)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `, e => [e.accountExternalIdentityId, e.accountId, e.integrationConnectionId, e.sourceSystemType, e.sourceSystemName, e.externalRecordType, e.externalId, e.externalDisplayName, e.externalDomain, e.matchStatus, e.matchConfidence, e.matchReason]);

    await insertMany(client, data.accountOwners, `
      insert into account_owners (account_id, user_id, role, is_primary)
      values ($1,$2,$3,$4)
    `, o => [o.accountId, o.userId, o.role, Boolean(o.isPrimary)]);

    await insertMany(client, data.aliases, `
      insert into account_aliases (account_id, alias_value)
      values ($1,$2)
    `, a => [a.accountId, a.aliasValue]);

    await insertMany(client, data.contacts, `
      insert into contacts (contact_id, account_id, full_name, email, title, is_primary_contact, is_technical_contact)
      values ($1,$2,$3,$4,$5,$6,$7)
    `, c => [c.contactId, c.accountId, c.fullName, c.email, c.title, Boolean(c.isPrimaryContact), Boolean(c.isTechnicalContact)]);

    await insertMany(client, data.agreements, `
      insert into agreements (agreement_id, account_id, name, status, agreement_type, renewal_date, monthly_recurring_revenue, annual_recurring_revenue)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
    `, a => [a.agreementId, a.accountId, a.name, a.status, a.agreementType, a.renewalDate, a.monthlyRecurringRevenue, a.annualRecurringRevenue]);

    await insertMany(client, data.renewals, `
      insert into renewals (renewal_id, account_id, agreement_id, renewal_date, status, renewal_amount, owner_user_id, days_until_renewal, risk_reason)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, r => [r.renewalId, r.accountId, r.agreementId, r.renewalDate, r.status, r.renewalAmount, r.ownerUserId, r.daysUntilRenewal, r.riskReason]);

    await insertMany(client, data.tickets, `
      insert into tickets (ticket_id, account_id, source_system_name, external_id, title, status, priority, category, subcategory, assigned_team, sla_status, is_escalated, is_recurring_issue_candidate, created_at_source, age_days)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `, t => [t.ticketId, t.accountId, t.sourceSystemName, t.externalId, t.title, t.status, t.priority, t.category, t.subcategory, t.assignedTeam, t.slaStatus, Boolean(t.isEscalated), Boolean(t.isRecurringIssueCandidate), toDate(t.createdAtSource), t.ageDays]);

    await insertMany(client, data.devices, `
      insert into devices (device_id, account_id, source_system_name, external_id, display_name, device_type, status, operating_system, last_seen_at, last_patched_at, patch_status, warranty_expiration_date, age_years, is_end_of_life, is_server, is_critical)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    `, d => [d.deviceId, d.accountId, d.sourceSystemName, d.externalId, d.displayName, d.deviceType, d.status, d.operatingSystem, toDate(d.lastSeenAt), toDate(d.lastPatchedAt), d.patchStatus, d.warrantyExpirationDate, d.ageYears, Boolean(d.isEndOfLife), Boolean(d.isServer), Boolean(d.isCritical)]);

    await insertMany(client, data.deviceHealthSignals, `
      insert into device_health_signals (device_health_signal_id, account_id, device_id, source_system_name, external_id, signal_type, severity, summary, observed_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, s => [s.deviceHealthSignalId, s.accountId, s.deviceId, s.sourceSystemName, s.externalId, s.signalType, s.severity, s.summary, toDate(s.observedAt)]);

    await insertMany(client, data.securityFindings, `
      insert into security_findings (security_finding_id, account_id, source_system_name, external_id, finding_type, severity, status, title, description, affected_service, business_impact, recommended_remediation, observed_at, is_customer_facing)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    `, f => [f.securityFindingId, f.accountId, f.sourceSystemName, f.externalId, f.findingType, f.severity, f.status, f.title, f.description, f.affectedService, f.businessImpact, f.recommendedRemediation, toDate(f.observedAt), Boolean(f.isCustomerFacing)]);

    await insertMany(client, data.securityCoverage, `
      insert into security_coverage (security_coverage_id, account_id, coverage_type, coverage_status, product_name, vendor_name, device_count_covered, device_count_missing, last_verified_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, c => [c.securityCoverageId, c.accountId, c.coverageType, c.coverageStatus, c.productName, c.vendorName, c.deviceCountCovered, c.deviceCountMissing, toDate(c.lastVerifiedAt)]);

    await insertMany(client, data.evidenceItems, `
      insert into evidence_items (evidence_item_id, account_id, source_system_type, source_system_name, source_record_type, source_record_id, summary, observed_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
    `, e => [e.evidenceItemId, e.accountId, e.sourceSystemName.toLowerCase().includes('rmm') ? 'rmm' : e.sourceSystemName.toLowerCase().includes('security') ? 'security' : e.sourceSystemName.toLowerCase().includes('microsoft') ? 'microsoft365' : 'psa', e.sourceSystemName, e.sourceRecordType, e.sourceRecordId, e.summary, toDate(e.observedAt)]);

    await insertMany(client, data.accountHealthScores, `
      insert into account_health_scores (account_health_score_id, account_id, score_category, score_value, summary, confidence, top_drivers, evidence_item_ids, calculated_at)
      values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)
    `, h => [h.accountHealthScoreId, h.accountId, h.scoreCategory, h.scoreValue, h.summary, h.confidence, asJson(h.topDrivers || []), asJson(h.evidenceItemIds || []), toDate(h.calculatedAt)]);

    await insertMany(client, data.recommendations, `
      insert into recommendations (recommendation_id, account_id, recommendation_type, title, reason, priority, status, suggested_owner_user_id, suggested_due_date, evidence_item_ids, created_at, updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,now(),now())
    `, r => [r.recommendationId, r.accountId, r.recommendationType, r.title, r.reason, r.priority, r.status, r.suggestedOwnerUserId, r.suggestedDueDate, asJson(r.evidenceItemIds || [])]);

    await insertMany(client, data.accountPlans || [], `
      insert into account_plans (account_plan_id, account_id, plan_name, status, plan_summary, owner_user_id, target_review_date, updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
    `, p => [p.accountPlanId, p.accountId, p.planName, p.status, p.planSummary, p.ownerUserId, p.targetReviewDate, toDate(p.updatedAt)]);

    await insertMany(client, data.accountPlanObjectives || [], `
      insert into account_plan_objectives (account_plan_objective_id, account_plan_id, title, objective_type, status, priority, target_date, success_metric, linked_recommendation_id)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, o => [o.accountPlanObjectiveId, o.accountPlanId, o.title, o.objectiveType, o.status, o.priority, o.targetDate, o.successMetric, o.linkedRecommendationId]);

    await insertMany(client, data.accountPlanRisks || [], `
      insert into account_plan_risks (account_plan_risk_id, account_plan_id, title, severity, status, mitigation, updated_at)
      values ($1,$2,$3,$4,$5,$6,now())
    `, r => [r.accountPlanRiskId, r.accountPlanId, r.title, r.severity, r.status, r.mitigation]);

    await insertMany(client, data.accountPlanNextSteps || [], `
      insert into account_plan_next_steps (account_plan_next_step_id, account_plan_id, title, owner_user_id, due_date, status, linked_objective_id, updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,now())
    `, s => [s.accountPlanNextStepId, s.accountPlanId, s.title, s.ownerUserId, s.dueDate, s.status, s.linkedObjectiveId]);

    await insertMany(client, data.accountPlanStakeholders || [], `
      insert into account_plan_stakeholders (account_plan_stakeholder_id, account_plan_id, contact_id, stakeholder_role, relationship_strength, sentiment, notes)
      values ($1,$2,$3,$4,$5,$6,$7)
    `, s => [s.accountPlanStakeholderId, s.accountPlanId, s.contactId, s.stakeholderRole, s.relationshipStrength, s.sentiment, s.notes]);

    await insertMany(client, data.contactEngagementEvents || [], `
      insert into contact_engagement_events (engagement_event_id, account_id, contact_id, event_type, occurred_at, summary, sentiment, source_system_type)
      values ($1,$2,$3,$4,$5,$6,$7,$8)
    `, e => [e.engagementEventId, e.accountId, e.contactId, e.eventType, toDate(e.occurredAt), e.summary, e.sentiment, e.sourceSystemType]);

    await client.query(`
      insert into integration_configurations (integration_connection_id, provider_type, environment_label, base_url, tenant_or_company_id, enabled_capabilities, secret_status, updated_at)
      values ($1,$2,$3,$4,$5,$6::jsonb,$7,now())
    `, ['int_psa_demo', 'mock_psa', 'Sprint 7 Pilot Sandbox', 'mock://psa', 'demo-tenant', asJson(['company_sync_preview', 'contact_sync_preview', 'create_task', 'create_note']), 'not_configured']);

    await client.query(`
      insert into app_settings (setting_key, setting_value, updated_at)
      values ($1, $2::jsonb, now())
    `, [runtimeStateKey, JSON.stringify(runtimeInitialState)]);

    await client.query('commit');

    const tables = ['users','accounts','integrations','account_external_identities','account_owners','account_aliases','contacts','agreements','renewals','tickets','devices','device_health_signals','security_findings','security_coverage','evidence_items','account_health_scores','recommendations','account_plans','account_plan_objectives','account_plan_risks','account_plan_next_steps','account_plan_stakeholders','contact_engagement_events','integration_configurations','integration_sync_history','app_settings'];
    const counts = {};
    for (const table of tables) {
      const result = await pool.query(`select count(*)::int as count from ${table}`);
      counts[table] = result.rows[0].count;
    }
    console.log(JSON.stringify({ status: 'seeded', databaseUrlConfigured: true, counts }, null, 2));
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});

