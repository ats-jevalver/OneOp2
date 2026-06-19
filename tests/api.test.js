const assert = require('assert');
const http = require('http');
const { createHandler } = require('../src/app');

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer(createHandler());
    server.listen(0, () => resolve(server));
  });
}

function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, options).then(async response => {
    const body = await response.json();
    return { response, body };
  });
}

(async () => {
  const server = await startServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    let result = await request(baseUrl, '/api/v1/accounts/search?query=acme&page=1&pageSize=10');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(a => a.accountId === 'acct_acme'));

    result = await request(baseUrl, '/api/v1/accounts/search?query=tina.reynolds@acme.example&page=1&pageSize=10');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data[0].accountId, 'acct_acme');

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/command-center?dateRangePreset=last_90_days');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.header.displayName, 'Acme Corp');
    assert.equal(result.body.data.renewal.daysUntilRenewal, 67);

    result = await request(baseUrl, '/api/v1/accounts/acct_greenfield/revenue');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.nextRenewalDate, '2026-07-15');

    result = await request(baseUrl, '/api/v1/admin/integrations');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.length >= 3);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync', { method: 'POST' });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.status, 'succeeded');

    result = await request(baseUrl, '/api/v1/product-events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'test_event', accountId: 'acct_acme' })
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.data.eventType, 'test_event');

    console.log('All API smoke tests passed.');
  } finally {
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
