const assert = require('assert');
const http = require('http');

if (!process.env.ONEOP2_DATABASE_URL) {
  console.log('PostgreSQL read smoke test skipped: ONEOP2_DATABASE_URL is not set.');
  process.exit(0);
}
process.env.ONEOP2_STORE_PROVIDER = 'postgres';

const { createHandler, ensureStore } = require('../src/app');

function startServer() { return new Promise(resolve => { const server = http.createServer(createHandler()); server.listen(0, () => resolve(server)); }); }
async function request(baseUrl, path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); const body = await response.json(); return { response, body }; }

(async () => {
  await ensureStore();
  const server = await startServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    let result = await request(baseUrl, '/api/v1/integrations/status');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.store.provider, 'postgres');
    assert.equal(result.body.data.store.active, true);

    result = await request(baseUrl, '/api/v1/accounts/search?query=PSA-1001&page=1&pageSize=5');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data[0].accountId, 'acct_acme');

    result = await request(baseUrl, '/api/v1/session/current-user', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'usr_admin_alex' }) });
    assert.equal(result.response.status, 200);

    result = await request(baseUrl, '/api/v1/admin/database/status');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.connected, true);
    assert.equal(result.body.data.seedValid, true);
    assert.ok(result.body.data.tableCounts.accounts >= 7);

    result = await request(baseUrl, '/api/v1/session/current-user', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'usr_am_jane' }) });
    assert.equal(result.response.status, 200);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/command-center');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.service.summary.openTicketCount, 2);
    assert.equal(result.body.data.rmm.summary.patchGapCount, 2);
    assert.equal(result.body.data.security.summary.highFindingCount, 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/account-plan');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.accountPlanId, 'plan_acme_2026');
    assert.ok(result.body.data.stakeholders.length >= 2);

    console.log('PostgreSQL API read smoke test passed.');
  } finally {
    server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });

