const crypto = require('crypto');

function deterministicId(prefix, payload) {
  const hash = crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
  return `${prefix}_${hash}`;
}
function validateRequired(payload, fields) {
  const missing = fields.filter(field => !payload[field] || String(payload[field]).trim() === '');
  if (missing.length) return { ok: false, missing };
  return { ok: true, missing: [] };
}
function createMockPsaAdapter() {
  return {
    name: 'Mock PSA Adapter',
    key: 'mock',
    capabilities: ['status', 'company_sync_preview', 'ticket_sync_preview', 'create_task', 'create_note'],
    getConnectionStatus() {
      return {
        status: 'connected',
        adapter: 'mock',
        adapterName: 'Mock PSA Adapter',
        capabilities: this.capabilities,
        message: 'Using safe Sprint 5 mock PSA adapter contract. No external PSA writes are performed.'
      };
    },
    listCompanies() { return [{ externalId: 'PSA-1001', name: 'Acme Corp' }]; },
    listTickets() { return []; },
    createTask(payload) {
      const validation = validateRequired(payload, ['accountId', 'externalCompanyId', 'title', 'body', 'ownerUserId', 'recommendationId']);
      if (!validation.ok) return { status: 'validation_failed', missingFields: validation.missing };
      const externalId = deterministicId('mock_psa_task', payload);
      return { externalId, externalUrl: `mock://psa/tasks/${externalId}`, status: 'created_stub', adapter: 'mock', requestSummary: { title: payload.title, accountId: payload.accountId, externalCompanyId: payload.externalCompanyId } };
    },
    createNote(payload) {
      const validation = validateRequired(payload, ['accountId', 'externalCompanyId', 'title', 'body', 'generatedArtifactId']);
      if (!validation.ok) return { status: 'validation_failed', missingFields: validation.missing };
      const externalId = deterministicId('mock_psa_note', payload);
      return { externalId, externalUrl: `mock://psa/notes/${externalId}`, status: 'created_stub', adapter: 'mock', requestSummary: { title: payload.title, accountId: payload.accountId, externalCompanyId: payload.externalCompanyId } };
    }
  };
}
function getPsaAdapter() { return createMockPsaAdapter(); }
module.exports = { getPsaAdapter, createMockPsaAdapter };
