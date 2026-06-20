const crypto = require('crypto');
const { configCompleteness } = require('../security/integrationSecrets');

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
function createMockPsaAdapter(config = {}) {
  const providerType = config.providerType || 'mock_psa';
  return {
    name: 'Mock PSA Adapter',
    key: 'mock',
    providerType,
    adapterMode: 'mock',
    capabilities: ['status', 'company_sync_preview', 'ticket_sync_preview', 'create_task', 'create_note'],
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
    listCompanies() { return [{ externalId: 'PSA-1001', name: 'Acme Corp' }]; },
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
    listTickets() { return []; },
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
  const capabilities = ['status', 'company_sync_preview', 'contact_sync_preview', 'ticket_sync_preview'];
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
    listCompanies() { return []; },
    previewCompanyContactSync() {
      const status = statusPayload();
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
    listTickets() { return []; },
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