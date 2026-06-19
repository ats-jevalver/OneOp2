function newStubId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function createMockPsaAdapter() {
  return {
    name: 'Mock PSA Adapter',
    getConnectionStatus() { return { status: 'connected', adapter: 'mock', message: 'Using safe Sprint 4 mock PSA adapter.' }; },
    listCompanies() { return [{ externalId: 'PSA-1001', name: 'Acme Corp' }]; },
    listTickets() { return []; },
    createTask(payload) { const externalId = newStubId('mock_psa_task'); return { externalId, externalUrl: `mock://psa/tasks/${externalId}`, status: 'created_stub', payload }; },
    createNote(payload) { const externalId = newStubId('mock_psa_note'); return { externalId, externalUrl: `mock://psa/notes/${externalId}`, status: 'created_stub', payload }; }
  };
}
function getPsaAdapter() { return createMockPsaAdapter(); }
module.exports = { getPsaAdapter };
