const fs = require('fs');
const path = require('path');
const { users, integrations, accounts, accountOwners, aliases, externalIdentities, contacts, agreements, renewals, productEvents } = require('./data');

function envelope(data, meta = {}, errors = []) {
  return { data, meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), ...meta }, errors };
}

function findOwner(accountId) {
  const owner = accountOwners.find(o => o.accountId === accountId && o.role === 'account_manager' && o.isPrimary) || accountOwners.find(o => o.accountId === accountId);
  if (!owner) return null;
  const user = users.find(u => u.userId === owner.userId);
  return user ? { userId: user.userId, displayName: user.displayName, role: owner.role } : null;
}

function primaryContact(accountId) {
  return contacts.find(c => c.accountId === accountId && c.isPrimaryContact) || contacts.find(c => c.accountId === accountId) || null;
}

function accountWarnings(accountId) {
  const warnings = [];
  const needsReview = externalIdentities.filter(e => e.accountId === accountId && e.matchStatus === 'needs_review');
  for (const item of needsReview) {
    warnings.push({ type: 'mapping_review', message: `${item.sourceSystemName} identity "${item.externalDisplayName}" needs mapping review.` });
  }
  if (accountId === 'acct_harbor') {
    warnings.push({ type: 'data_stale', message: 'Microsoft 365/security data is stale. Last successful sync was 2026-06-09.' });
  }
  return warnings;
}

function latestFreshness(accountId) {
  const identities = externalIdentities.filter(e => e.accountId === accountId);
  return integrations.map(integration => {
    const linked = identities.some(e => e.integrationConnectionId === integration.integrationConnectionId);
    return {
      systemType: integration.systemType,
      systemName: integration.systemName,
      status: linked ? integration.status : 'not_mapped',
      lastSuccessfulSyncAt: linked ? integration.lastSuccessfulSyncAt : null,
      message: linked ? integration.lastErrorMessage : 'No confirmed account mapping for this source.'
    };
  });
}

function accountSummary(account) {
  const agreement = agreements.find(a => a.accountId === account.accountId) || null;
  const renewal = renewals.find(r => r.accountId === account.accountId) || null;
  return {
    accountId: account.accountId,
    displayName: account.displayName,
    primaryDomain: account.primaryDomain,
    status: account.status,
    accountOwner: findOwner(account.accountId),
    health: { category: account.healthCategory, summary: account.healthSummary },
    renewal: renewal ? { renewalDate: renewal.renewalDate, daysUntilRenewal: renewal.daysUntilRenewal, status: renewal.status } : null,
    agreement: agreement ? { agreementId: agreement.agreementId, name: agreement.name, agreementType: agreement.agreementType } : null,
    warnings: accountWarnings(account.accountId)
  };
}

function searchAccounts(query, page = 1, pageSize = 10) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { results: [], totalCount: 0 };
  const matchedIds = new Set();

  for (const account of accounts) {
    const fields = [account.displayName, account.legalName, account.shortName, account.primaryDomain, account.industry].filter(Boolean);
    if (fields.some(f => f.toLowerCase().includes(q))) matchedIds.add(account.accountId);
  }
  for (const alias of aliases) {
    if (alias.aliasValue.toLowerCase().includes(q)) matchedIds.add(alias.accountId);
  }
  for (const contact of contacts) {
    if ([contact.fullName, contact.email].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(contact.accountId);
  }
  for (const external of externalIdentities) {
    if ([external.externalId, external.externalDisplayName, external.externalDomain].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(external.accountId);
  }

  const all = accounts.filter(a => matchedIds.has(a.accountId)).map(accountSummary);
  const start = (page - 1) * pageSize;
  return { results: all.slice(start, start + pageSize), totalCount: all.length };
}

function commandCenter(accountId, dateRangePreset = 'last_90_days') {
  const account = accounts.find(a => a.accountId === accountId);
  if (!account) return null;
  const agreement = agreements.find(a => a.accountId === accountId) || null;
  const renewal = renewals.find(r => r.accountId === accountId) || null;
  const contact = primaryContact(accountId);
  return {
    account,
    header: accountSummary(account),
    snapshot: {
      accountOwner: findOwner(accountId),
      primaryContact: contact,
      agreement,
      monthlyRecurringRevenue: agreement?.monthlyRecurringRevenue || null,
      annualRecurringRevenue: agreement?.annualRecurringRevenue || null,
      openOpportunityCount: 0,
      lastQbrDate: null
    },
    health: { category: account.healthCategory, scoreValue: null, summary: account.healthSummary, confidence: 'placeholder', topDrivers: [] },
    renewal,
    dataFreshness: latestFreshness(accountId),
    brief: { bodyFormat: 'markdown', body: `${account.displayName} is marked ${account.healthCategory.replace('_', ' ')}. ${account.healthSummary}` },
    risks: [],
    opportunities: [],
    recommendations: [],
    timeline: [],
    warnings: accountWarnings(accountId),
    dateRangePreset
  };
}

function revenue(accountId) {
  return {
    summary: {
      monthlyRecurringRevenue: agreements.filter(a => a.accountId === accountId).reduce((sum, a) => sum + (a.monthlyRecurringRevenue || 0), 0),
      annualRecurringRevenue: agreements.filter(a => a.accountId === accountId).reduce((sum, a) => sum + (a.annualRecurringRevenue || 0), 0),
      nextRenewalDate: renewals.find(r => r.accountId === accountId)?.renewalDate || null,
      openOpportunityCount: 0
    },
    agreements: agreements.filter(a => a.accountId === accountId),
    renewals: renewals.filter(r => r.accountId === accountId),
    opportunities: []
  };
}

function json(res, status, body) {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(text);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
    });
  });
}

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && url.pathname === '/api/v1/accounts/search') {
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 10);
    const { results, totalCount } = searchAccounts(url.searchParams.get('query'), page, pageSize);
    return json(res, 200, envelope(results, { page, pageSize, totalCount }));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'command-center') {
    const payload = commandCenter(parts[3], url.searchParams.get('dateRangePreset') || 'last_90_days');
    if (!payload) return json(res, 404, envelope(null, {}, [{ code: 'not_found', message: 'Account not found.' }]));
    return json(res, 200, envelope(payload));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'revenue') {
    if (!accounts.some(a => a.accountId === parts[3])) return json(res, 404, envelope(null, {}, [{ code: 'not_found', message: 'Account not found.' }]));
    return json(res, 200, envelope(revenue(parts[3])));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/integrations') {
    return json(res, 200, envelope(integrations));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync') {
    const integration = integrations.find(i => i.integrationConnectionId === parts[4]);
    if (!integration) return json(res, 404, envelope(null, {}, [{ code: 'not_found', message: 'Integration not found.' }]));
    integration.lastSuccessfulSyncAt = new Date().toISOString();
    integration.status = 'connected';
    integration.lastErrorMessage = null;
    return json(res, 200, envelope({ syncRunId: `sync_${Date.now()}`, status: 'succeeded', integrationConnectionId: integration.integrationConnectionId }));
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/product-events') {
    const body = await parseBody(req);
    if (!body.eventType) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'eventType is required.', field: 'eventType' }]));
    const event = { productEventId: `evt_${Date.now()}`, eventTimestamp: new Date().toISOString(), ...body };
    productEvents.push(event);
    return json(res, 201, envelope(event));
  }

  return json(res, 404, envelope(null, {}, [{ code: 'not_found', message: 'Endpoint not found.' }]));
}

function serveStatic(req, res, url) {
  const publicRoot = path.join(__dirname, '..', 'public');
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(publicRoot, requested));
  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); return res.end('Not found');
  }
  const ext = path.extname(filePath);
  const type = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'text/plain';
  res.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
  fs.createReadStream(filePath).pipe(res);
}

function createHandler() {
  return async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
      return serveStatic(req, res, url);
    } catch (err) {
      return json(res, 500, envelope(null, {}, [{ code: 'internal_error', message: err.message }]));
    }
  };
}

module.exports = { createHandler, searchAccounts, commandCenter, revenue, envelope };
