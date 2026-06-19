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
  recommendationStatus: {},
  mappingStatus: {},
  settings: {
    currentUserId: 'usr_am_jane',
    psaFieldMapping: {
      defaultTaskType: 'Account Management',
      defaultTaskStatus: 'Open',
      defaultTaskPriority: 'Normal',
      defaultBoard: 'Account Management',
      defaultNoteType: 'Account Note'
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

    await insertMany(client, data.contacts, `
      insert into contacts (contact_id, account_id, full_name, email, title, is_primary_contact, is_technical_contact)
      values ($1,$2,$3,$4,$5,$6,$7)
    `, c => [c.contactId, c.accountId, c.fullName, c.email, c.title, Boolean(c.isPrimaryContact), Boolean(c.isTechnicalContact)]);

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

    await client.query(`
      insert into app_settings (setting_key, setting_value, updated_at)
      values ($1, $2::jsonb, now())
    `, [runtimeStateKey, JSON.stringify(runtimeInitialState)]);

    await client.query('commit');

    const tables = ['users','accounts','integrations','account_external_identities','contacts','evidence_items','account_health_scores','recommendations','app_settings'];
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
