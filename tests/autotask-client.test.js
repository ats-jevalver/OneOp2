const assert = require('assert');
const { createAutotaskClient, validateConfig, redactUrl } = require('../src/integrations/autotaskClient');

(async () => {
  assert.equal(validateConfig({}).ok, false);
  assert.deepEqual(validateConfig({}).missing, ['baseUrl', 'username', 'secret']);
  assert.equal(redactUrl('https://user:secret@autotask.example.test/api'), 'https://***:***@autotask.example.test/api');

  let client = createAutotaskClient({ baseUrl: 'https://autotask.example.test', username: 'DO_NOT_LEAK_USER', secret: 'DO_NOT_LEAK_SECRET', integrationCode: 'DO_NOT_LEAK_CODE' });
  let status = client.getStatus();
  assert.equal(status.ok, true);
  assert.equal(status.status, 'ready_dry_run');
  assert.equal(status.config.hasIntegrationCode, true);
  assert.equal(JSON.stringify(status).includes('DO_NOT_LEAK'), false);

  let companies = await client.listCompanies({ search: 'acme' });
  assert.equal(companies.ok, true);
  assert.equal(companies.recordType, 'company');
  assert.equal(companies.counts.total, 1);
  assert.equal(companies.rows[0].externalCompanyId, 'AT-1001');
  assert.equal(JSON.stringify(companies).includes('DO_NOT_LEAK'), false);

  let contacts = await client.listContacts({ externalCompanyId: 'AT-1001' });
  assert.equal(contacts.counts.total, 2);
  assert.ok(contacts.rows.some(row => row.email === 'tina.reynolds@acme.example'));

  let tickets = await client.listTickets({ status: 'open' });
  assert.equal(tickets.counts.total, 1);
  assert.equal(tickets.rows[0].slaStatus, 'at_risk');

  client = createAutotaskClient({ baseUrl: 'https://autotask.example.test', username: 'user', secret: 'secret', liveReadsEnabled: true });
  companies = await client.listCompanies({ search: 'acme' });
  assert.equal(companies.ok, false);
  assert.equal(companies.status, 'remote_unavailable');

  client = createAutotaskClient({ baseUrl: 'https://autotask.example.test', username: 'user' });
  companies = await client.listCompanies({ search: 'acme' });
  assert.equal(companies.ok, false);
  assert.equal(companies.status, 'not_configured');
  assert.ok(companies.details.missing.includes('secret'));

  console.log('Autotask client boundary test passed.');
})();
