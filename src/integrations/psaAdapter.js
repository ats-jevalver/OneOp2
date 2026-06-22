const crypto = require('crypto');
const { configCompleteness } = require('../security/integrationSecrets');
const { createAutotaskClient } = require('./autotaskClient');

function deterministicId(prefix, payload) {
  const hash = crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
  return `${prefix}_${hash}`;
}
function validateRequired(payload, fields) {
  const missing = fields.filter(field => !payload[field] || String(payload[field]).trim() === '');
  if (missing.length) return { ok: false, missing };
  return { ok: true, missing: [] };
}
function sourceMetadata(providerType, adapterMode) {
  return { adapterMode, providerType, source: providerType === 'mock_psa' ? 'seeded_mock' : 'real_connector_dry_run', externalMutationAllowed: false };
}
function validationResult({ providerType, adapterMode, recordType, rows, status = 'ready', warnings = [], query = {} }) {
  return {
    mode: 'read_only_validation',
    recordType,
    adapterMode,
    providerType,
    source: sourceMetadata(providerType, adapterMode),
    diagnosticStatus: status,
    generatedAt: new Date().toISOString(),
    query,
    counts: { total: rows.length },
    rows,
    warnings,
    secretsReturned: false
  };
}
function containsIgnoreCase(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(String(query).toLowerCase());
}
function filterRows(rows, query = {}, fields = []) {
  return rows.filter(row => {
    if (query.search && !fields.some(field => containsIgnoreCase(row[field], query.search))) return false;
    if (query.externalCompanyId && row.externalCompanyId !== query.externalCompanyId) return false;
    if (query.status && row.status !== query.status) return false;
    if (query.accountId && row.accountId !== query.accountId) return false;
    return true;
  });
}
function configValue(config, env, primaryKey, aliases = []) {
  if (config[primaryKey] && String(config[primaryKey]).trim()) return config[primaryKey];
  const envKeys = [primaryKey, ...aliases];
  for (const key of envKeys) if (env[key] && String(env[key]).trim()) return env[key];
  return null;
}
function createAutotaskClientForConfig(config, env) {
  return createAutotaskClient({
    baseUrl: config.baseUrl || configValue(config, env, 'ONEOP2_PSA_BASE_URL', ['ONEOP2_AUTOTASK_BASE_URL']),
    username: configValue(config, env, 'ONEOP2_PSA_USERNAME', ['ONEOP2_AUTOTASK_USERNAME']),
    secret: configValue(config, env, 'ONEOP2_PSA_SECRET', ['ONEOP2_AUTOTASK_SECRET']),
    integrationCode: configValue(config, env, 'ONEOP2_AUTOTASK_INTEGRATION_CODE')
  });
}
function autotaskCompanyRow(row) {
  return {
    externalCompanyId: row.externalCompanyId,
    displayName: row.displayName,
    status: row.status,
    accountId: row.displayName === 'Acme Corp' ? 'acct_acme' : row.displayName === 'Riverbend Logistics' ? 'acct_riverbend' : null,
    primaryDomain: row.primaryDomain || null,
    lastUpdatedAt: row.lastUpdatedAt || null,
    matchCandidate: {
      action: row.displayName === 'Acme Corp' ? 'matched' : row.displayName === 'Riverbend Logistics' ? 'conflict' : 'new',
      matchConfidence: row.displayName === 'Acme Corp' ? 0.98 : row.displayName === 'Riverbend Logistics' ? 0.61 : 0.25,
      reason: row.displayName === 'Acme Corp' ? 'Autotask company name/domain match an existing OneOp2 account.' : row.displayName === 'Riverbend Logistics' ? 'Autotask company resembles an account with mapping ambiguity.' : 'No existing OneOp2 account match found.'
    }
  };
}
function previewCompanyFromValidation(row) {
  return {
    rowId: `autotask_company_${row.externalCompanyId}`,
    externalCompanyId: row.externalCompanyId,
    displayName: row.displayName,
    action: row.matchCandidate.action,
    matchConfidence: row.matchCandidate.matchConfidence,
    accountId: row.accountId,
    reason: row.matchCandidate.reason
  };
}
function autotaskContactRow(row) {
  return {
    externalContactId: row.externalContactId,
    externalCompanyId: row.externalCompanyId,
    fullName: row.fullName,
    email: row.email,
    status: row.status,
    contactId: row.email === 'tina.reynolds@acme.example' ? 'con_acme_tina' : row.email === 'marcus.lee@acme.example' ? 'con_acme_marcus' : null,
    accountId: row.externalCompanyId === 'AT-1001' ? 'acct_acme' : null,
    title: row.title || null,
    isPrimaryContact: Boolean(row.isPrimaryContact),
    lastUpdatedAt: row.lastUpdatedAt || null,
    matchCandidate: {
      action: row.email === 'tina.reynolds@acme.example' ? 'matched' : row.email === 'marcus.lee@acme.example' ? 'changed' : 'new',
      matchConfidence: row.email === 'tina.reynolds@acme.example' ? 0.99 : row.email === 'marcus.lee@acme.example' ? 0.9 : 0.3,
      reason: row.email === 'tina.reynolds@acme.example' ? 'Autotask contact email matches an existing primary OneOp2 contact.' : row.email === 'marcus.lee@acme.example' ? 'Autotask contact matches an existing contact with possible changed fields.' : 'No existing OneOp2 contact match found.'
    }
  };
}
function previewContactFromValidation(row) {
  return {
    rowId: `autotask_contact_${row.externalContactId}`,
    externalContactId: row.externalContactId,
    externalCompanyId: row.externalCompanyId,
    fullName: row.fullName,
    email: row.email,
    action: row.matchCandidate.action,
    matchConfidence: row.matchCandidate.matchConfidence,
    contactId: row.contactId,
    accountId: row.accountId,
    reason: row.matchCandidate.reason
  };
}
function createMockPsaAdapter(config = {}) {
  const providerType = config.providerType || 'mock_psa';
  return {
    name: 'Mock PSA Adapter',
    key: 'mock',
    providerType,
    adapterMode: 'mock',
    capabilities: ['status', 'company_sync_preview', 'contact_sync_preview', 'ticket_sync_preview', 'company_read_validation', 'contact_read_validation', 'ticket_read_validation', 'create_task', 'create_note'],
    getConnectionStatus() {
      return {
        status: 'connected',
        adapter: 'mock',
        adapterMode: 'mock',
        providerType,
        adapterName: 'Mock PSA Adapter',
        source: sourceMetadata(providerType, 'mock'),
        capabilities: this.capabilities,
        message: 'Using safe Sprint 8 mock PSA adapter contract. No external PSA writes are performed.'
      };
    },
    listCompanies(query = {}) {
      const rows = [
        { externalCompanyId: 'PSA-1001', displayName: 'Acme Corp', status: 'active', accountId: 'acct_acme', lastUpdatedAt: '2026-06-15T14:30:00Z' },
        { externalCompanyId: 'PSA-1002', displayName: 'Greenfield Dental', status: 'active', accountId: 'acct_greenfield', lastUpdatedAt: '2026-06-14T18:15:00Z' },
        { externalCompanyId: 'PSA-2001', displayName: 'Riverbend Logistics', status: 'active', accountId: 'acct_riverbend', lastUpdatedAt: '2026-06-12T09:10:00Z' },
        { externalCompanyId: 'PSA-3001', displayName: 'Contoso Manufacturing', status: 'prospect', accountId: null, lastUpdatedAt: '2026-06-11T16:45:00Z' }
      ];
      return validationResult({ providerType, adapterMode: 'mock', recordType: 'company', rows: filterRows(rows, query, ['externalCompanyId', 'displayName', 'accountId']), query });
    },
    listContacts(query = {}) {
      const rows = [
        { externalContactId: 'PSA-C-5001', externalCompanyId: 'PSA-1001', fullName: 'Tina Reynolds', email: 'tina.reynolds@acme.example', status: 'active', contactId: 'con_acme_tina' },
        { externalContactId: 'PSA-C-5002', externalCompanyId: 'PSA-1001', fullName: 'Marcus Lee', email: 'marcus.lee@acme.example', status: 'active', contactId: 'con_acme_marcus' },
        { externalContactId: 'PSA-C-6001', externalCompanyId: 'PSA-3001', fullName: 'Priya Shah', email: 'priya.shah@contoso.example', status: 'active', contactId: null }
      ];
      return validationResult({ providerType, adapterMode: 'mock', recordType: 'contact', rows: filterRows(rows, query, ['externalContactId', 'externalCompanyId', 'fullName', 'email', 'contactId']), query });
    },
    previewCompanyContactSync() {
      const companies = [
        { rowId: 'psa_company_1001', externalCompanyId: 'PSA-1001', displayName: 'Acme Corp', action: 'matched', matchConfidence: 0.99, accountId: 'acct_acme', reason: 'Confirmed PSA external identity already exists.' },
        { rowId: 'psa_company_1002', externalCompanyId: 'PSA-1002', displayName: 'Greenfield Dental', action: 'matched', matchConfidence: 0.95, accountId: 'acct_greenfield', reason: 'Domain and company name match seeded account.' },
        { rowId: 'psa_company_2001', externalCompanyId: 'PSA-2001', displayName: 'Riverbend Logistics', action: 'conflict', matchConfidence: 0.61, accountId: 'acct_riverbend', reason: 'Potential duplicate mapping requires admin review.' },
        { rowId: 'psa_company_3001', externalCompanyId: 'PSA-3001', displayName: 'Contoso Manufacturing', action: 'new', matchConfidence: 0.2, accountId: null, reason: 'No existing account match found.' }
      ];
      const contacts = [
        { rowId: 'psa_contact_5001', externalContactId: 'PSA-C-5001', externalCompanyId: 'PSA-1001', fullName: 'Tina Reynolds', email: 'tina.reynolds@acme.example', action: 'matched', matchConfidence: 0.99, contactId: 'con_acme_tina' },
        { rowId: 'psa_contact_5002', externalContactId: 'PSA-C-5002', externalCompanyId: 'PSA-1001', fullName: 'Marcus Lee', email: 'marcus.lee@acme.example', action: 'changed', matchConfidence: 0.9, contactId: 'con_acme_marcus' },
        { rowId: 'psa_contact_6001', externalContactId: 'PSA-C-6001', externalCompanyId: 'PSA-3001', fullName: 'Priya Shah', email: 'priya.shah@contoso.example', action: 'new', matchConfidence: 0.3, contactId: null }
      ];
      const allRows = [...companies, ...contacts];
      const count = action => allRows.filter(row => row.action === action).length;
      return {
        mode: 'preview',
        adapter: 'mock',
        adapterMode: 'mock',
        providerType,
        source: sourceMetadata(providerType, 'mock'),
        generatedAt: new Date().toISOString(),
        counts: { total: allRows.length, new: count('new'), matched: count('matched'), changed: count('changed'), skipped: count('skipped'), conflicts: count('conflict') },
        companies,
        contacts,
        warnings: ['Preview only. No PSA company or contact rows were imported.', 'Conflict rows require explicit admin review before apply.']
      };
    },
    listTickets(query = {}) {
      const rows = [
        { externalTicketId: 'PSA-T-9001', externalCompanyId: 'PSA-1001', title: 'MFA rollout follow-up', status: 'open', priority: 'high', accountId: 'acct_acme' },
        { externalTicketId: 'PSA-T-9002', externalCompanyId: 'PSA-1001', title: 'Aging workstation patch gap', status: 'open', priority: 'medium', accountId: 'acct_acme' },
        { externalTicketId: 'PSA-T-9101', externalCompanyId: 'PSA-2001', title: 'Duplicate company mapping review', status: 'waiting_customer', priority: 'medium', accountId: 'acct_riverbend' }
      ];
      return validationResult({ providerType, adapterMode: 'mock', recordType: 'ticket', rows: filterRows(rows, query, ['externalTicketId', 'externalCompanyId', 'title', 'accountId']), query });
    },
    createTask(payload) {
      const validation = validateRequired(payload, ['accountId', 'externalCompanyId', 'title', 'body', 'ownerUserId', 'recommendationId']);
      if (!validation.ok) return { status: 'validation_failed', missingFields: validation.missing };
      const externalId = deterministicId('mock_psa_task', payload);
      return { externalId, externalUrl: `mock://psa/tasks/${externalId}`, status: 'created_stub', adapter: 'mock', adapterMode: 'mock', requestSummary: { title: payload.title, accountId: payload.accountId, externalCompanyId: payload.externalCompanyId } };
    },
    createNote(payload) {
      const validation = validateRequired(payload, ['accountId', 'externalCompanyId', 'title', 'body', 'generatedArtifactId']);
      if (!validation.ok) return { status: 'validation_failed', missingFields: validation.missing };
      const externalId = deterministicId('mock_psa_note', payload);
      return { externalId, externalUrl: `mock://psa/notes/${externalId}`, status: 'created_stub', adapter: 'mock', adapterMode: 'mock', requestSummary: { title: payload.title, accountId: payload.accountId, externalCompanyId: payload.externalCompanyId } };
    }
  };
}
function createRealPsaAdapter(config = {}, env = process.env) {
  const providerType = config.providerType;
  const completeness = configCompleteness(config, env);
  const adapterName = providerType === 'autotask' ? 'Autotask PSA Adapter Spike' : 'ConnectWise Manage PSA Adapter Spike';
  const capabilities = ['status', 'company_sync_preview', 'contact_sync_preview', 'ticket_sync_preview', 'company_read_validation', 'contact_read_validation', 'ticket_read_validation'];
  function statusPayload() {
    return {
      status: completeness.complete ? 'ready_dry_run' : 'not_configured',
      adapter: providerType,
      adapterMode: 'real_dry_run',
      providerType,
      adapterName,
      source: sourceMetadata(providerType, 'real_dry_run'),
      capabilities,
      config: { complete: completeness.complete, hasBaseUrl: completeness.hasBaseUrl, hasTenantOrCompanyId: completeness.hasTenantOrCompanyId },
      secrets: completeness.secrets,
      message: completeness.complete
        ? 'Real PSA connector spike is configured for read-only dry-run diagnostics. External writes remain disabled.'
        : `Real PSA connector is missing required configuration or secrets: ${completeness.secrets.missingKeys.join(', ') || 'base URL'}.`
    };
  }
  return {
    name: adapterName,
    key: providerType,
    providerType,
    adapterMode: 'real_dry_run',
    capabilities,
    getConnectionStatus: statusPayload,
    listCompanies(query = {}) {
      const status = statusPayload();
      if (providerType === 'autotask' && status.status !== 'not_configured') {
        const clientResult = createAutotaskClientForConfig(config, env).listCompanies(query);
        const rows = clientResult.ok ? clientResult.rows.map(autotaskCompanyRow) : [];
        return validationResult({ providerType, adapterMode: 'real_dry_run', recordType: 'company', rows, status: clientResult.status || status.status, query, warnings: clientResult.ok ? ['Autotask company rows are mapped from deterministic read-only fixtures; no external Autotask call was made.'] : [clientResult.message] });
      }
      return validationResult({ providerType, adapterMode: 'real_dry_run', recordType: 'company', rows: [], status: status.status, query, warnings: [status.message, 'Read-only company validation is dry-run only in Sprint 8; no external PSA call was made.'] });
    },
    listContacts(query = {}) {
      const status = statusPayload();
      if (providerType === 'autotask' && status.status !== 'not_configured') {
        const clientResult = createAutotaskClientForConfig(config, env).listContacts(query);
        const rows = clientResult.ok ? clientResult.rows.map(autotaskContactRow) : [];
        return validationResult({ providerType, adapterMode: 'real_dry_run', recordType: 'contact', rows, status: clientResult.status || status.status, query, warnings: clientResult.ok ? ['Autotask contact rows are mapped from deterministic read-only fixtures; no external Autotask call was made.'] : [clientResult.message] });
      }
      return validationResult({ providerType, adapterMode: 'real_dry_run', recordType: 'contact', rows: [], status: status.status, query, warnings: [status.message, 'Read-only contact validation is dry-run only in Sprint 8; no external PSA call was made.'] });
    },
    previewCompanyContactSync() {
      const status = statusPayload();
      if (providerType === 'autotask' && status.status !== 'not_configured') {
        const companyValidation = this.listCompanies({});
        const contactValidation = this.listContacts({});
        const companies = companyValidation.rows.map(previewCompanyFromValidation);
        const contacts = contactValidation.rows.map(previewContactFromValidation);
        const allRows = [...companies, ...contacts];
        const count = action => allRows.filter(row => row.action === action).length;
        return {
          mode: 'preview',
          adapter: providerType,
          adapterMode: 'real_dry_run',
          providerType,
          source: sourceMetadata(providerType, 'real_dry_run'),
          generatedAt: new Date().toISOString(),
          diagnosticStatus: companyValidation.diagnosticStatus,
          counts: { total: allRows.length, new: count('new'), matched: count('matched'), changed: count('changed'), skipped: count('skipped'), conflicts: count('conflict') },
          companies,
          contacts,
          warnings: ['Autotask company/contact preview uses deterministic read-only fixture mapping in Sprint 9. No external Autotask records were mutated.']
        };
      }
      return {
        mode: 'preview',
        adapter: providerType,
        adapterMode: 'real_dry_run',
        providerType,
        source: sourceMetadata(providerType, 'real_dry_run'),
        generatedAt: new Date().toISOString(),
        diagnosticStatus: status.status,
        counts: { total: 0, new: 0, matched: 0, changed: 0, skipped: 0, conflicts: 0 },
        companies: [],
        contacts: [],
        warnings: [status.message, 'Sprint 8 real connector spike performs diagnostics only and does not call or mutate the external PSA.']
      };
    },
    listTickets(query = {}) {
      const status = statusPayload();
      return validationResult({ providerType, adapterMode: 'real_dry_run', recordType: 'ticket', rows: [], status: status.status, query, warnings: [status.message, 'Read-only ticket validation is dry-run only in Sprint 8; no external PSA call was made.'] });
    },
    createTask() { return { status: 'write_disabled', adapter: providerType, adapterMode: 'real_dry_run', message: 'External PSA writes are disabled for Sprint 8 real connector spike.' }; },
    createNote() { return { status: 'write_disabled', adapter: providerType, adapterMode: 'real_dry_run', message: 'External PSA writes are disabled for Sprint 8 real connector spike.' }; }
  };
}
function getPsaAdapter(config = {}) {
  const providerType = config.providerType || 'mock_psa';
  if (providerType === 'mock_psa') return createMockPsaAdapter(config);
  if (['connectwise_manage', 'autotask'].includes(providerType)) return createRealPsaAdapter(config);
  return createMockPsaAdapter({ ...config, providerType: 'mock_psa' });
}
module.exports = { getPsaAdapter, createMockPsaAdapter, createRealPsaAdapter };

