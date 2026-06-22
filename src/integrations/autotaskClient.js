function configured(value) { return Boolean(value && String(value).trim()); }
function redactUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username) url.username = '***';
    if (url.password) url.password = '***';
    return url.toString();
  } catch {
    return '[configured-redacted]';
  }
}
function normalizeBaseUrl(baseUrl) {
  if (!configured(baseUrl)) return null;
  const parsed = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Autotask baseUrl must use http or https.');
  return parsed.toString().replace(/\/$/, '');
}
function createSafeError(status, message, details = {}) {
  return { ok: false, status, message, details, secretsReturned: false };
}
function fixtureResult(recordType, rows, query = {}, status = 'ready') {
  return { ok: true, status, mode: 'fixture', recordType, query, counts: { total: rows.length }, rows, warnings: [], secretsReturned: false };
}
function defaultFixtures() {
  const companies = [
    { externalCompanyId: 'AT-1001', displayName: 'Acme Corp', status: 'active', primaryDomain: 'acme.example', phone: null, city: 'Tampa', state: 'FL', country: 'US', ownerExternalId: null, lastUpdatedAt: '2026-06-15T14:30:00Z', rawShapeVersion: 'autotask.company.v1' },
    { externalCompanyId: 'AT-2001', displayName: 'Riverbend Logistics', status: 'active', primaryDomain: 'riverbend.example', phone: null, city: 'Atlanta', state: 'GA', country: 'US', ownerExternalId: null, lastUpdatedAt: '2026-06-12T09:10:00Z', rawShapeVersion: 'autotask.company.v1' }
  ];
  const contacts = [
    { externalContactId: 'AT-C-5001', externalCompanyId: 'AT-1001', fullName: 'Tina Reynolds', email: 'tina.reynolds@acme.example', title: 'CFO', phone: null, status: 'active', isPrimaryContact: true, lastUpdatedAt: '2026-06-15T14:45:00Z', rawShapeVersion: 'autotask.contact.v1' },
    { externalContactId: 'AT-C-5002', externalCompanyId: 'AT-1001', fullName: 'Marcus Lee', email: 'marcus.lee@acme.example', title: 'IT Director', phone: null, status: 'active', isPrimaryContact: false, lastUpdatedAt: '2026-06-14T18:15:00Z', rawShapeVersion: 'autotask.contact.v1' }
  ];
  const tickets = [
    { externalTicketId: 'AT-T-9001', externalCompanyId: 'AT-1001', title: 'MFA rollout follow-up', status: 'open', priority: 'high', category: 'security', queue: 'Managed Services', assignedResourceExternalId: null, createdAt: '2026-06-10T10:00:00Z', dueAt: null, lastUpdatedAt: '2026-06-15T16:00:00Z', slaStatus: 'at_risk', rawShapeVersion: 'autotask.ticket.v1' }
  ];
  return { companies, contacts, tickets };
}
function filterRows(rows, query = {}, fields = []) {
  return rows.filter(row => {
    if (query.search) {
      const text = String(query.search).toLowerCase();
      if (!fields.some(field => String(row[field] || '').toLowerCase().includes(text))) return false;
    }
    if (query.externalCompanyId && row.externalCompanyId !== query.externalCompanyId) return false;
    if (query.status && row.status !== query.status) return false;
    return true;
  });
}
function validateConfig(config = {}) {
  const missing = [];
  if (!configured(config.baseUrl)) missing.push('baseUrl');
  if (!configured(config.username)) missing.push('username');
  if (!configured(config.secret)) missing.push('secret');
  if (missing.length) return { ok: false, missing };
  try { normalizeBaseUrl(config.baseUrl); } catch (error) { return { ok: false, missing: [], error: error.message }; }
  return { ok: true, missing: [] };
}
function createAutotaskClient(options = {}) {
  const config = {
    baseUrl: options.baseUrl,
    username: options.username,
    secret: options.secret,
    integrationCode: options.integrationCode || null
  };
  const fixtures = options.fixtures || defaultFixtures();
  const liveReadsEnabled = options.liveReadsEnabled === true;
  const fetchImpl = options.fetchImpl;
  const timeoutMs = options.timeoutMs || 15000;
  function status() {
    const validation = validateConfig(config);
    return {
      ok: validation.ok,
      status: validation.ok ? (liveReadsEnabled ? 'ready_read_only' : 'ready_dry_run') : 'not_configured',
      adapterMode: liveReadsEnabled ? 'real_read_only' : 'real_dry_run',
      redactedBaseUrl: redactUrl(config.baseUrl),
      config: { hasBaseUrl: configured(config.baseUrl), hasUsername: configured(config.username), hasSecret: configured(config.secret), hasIntegrationCode: configured(config.integrationCode), timeoutMs },
      missing: validation.missing || [],
      message: validation.ok ? 'Autotask client boundary is configured. Live reads require explicit enablement.' : `Autotask client is missing required configuration: ${(validation.missing || []).join(', ') || validation.error}.`,
      secretsReturned: false
    };
  }
  function guardedRead(recordType, query, fixtureRows, fields) {
    const current = status();
    if (!current.ok) return createSafeError('not_configured', current.message, { missing: current.missing });
    if (!liveReadsEnabled) return fixtureResult(recordType, filterRows(fixtureRows, query, fields), query, current.status);
    if (typeof fetchImpl !== 'function') return createSafeError('remote_unavailable', 'Autotask live reads require an injected fetch implementation.', { adapterMode: current.adapterMode });
    return createSafeError('remote_unavailable', 'Autotask live read transport is not implemented in Sprint 9 client boundary yet.', { adapterMode: current.adapterMode });
  }
  return {
    getStatus: status,
    listCompanies(query = {}) { return guardedRead('company', query, fixtures.companies || [], ['externalCompanyId', 'displayName', 'primaryDomain']); },
    listContacts(query = {}) { return guardedRead('contact', query, fixtures.contacts || [], ['externalContactId', 'externalCompanyId', 'fullName', 'email']); },
    listTickets(query = {}) { return guardedRead('ticket', query, fixtures.tickets || [], ['externalTicketId', 'externalCompanyId', 'title', 'priority', 'category']); }
  };
}

module.exports = { createAutotaskClient, defaultFixtures, validateConfig, redactUrl };
