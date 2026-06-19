const fs = require('fs');
const path = require('path');
const data = require('./data');
const {
  users, integrations, accounts, accountOwners, aliases, externalIdentities, contacts, agreements, renewals,
  tickets, devices, deviceHealthSignals, securityFindings, securityCoverage, evidenceItems, accountHealthScores,
  recommendations, productEvents
} = data;

function envelope(data, meta = {}, errors = []) {
  return { data, meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), ...meta }, errors };
}

function byId(list, key, value) { return list.find(item => item[key] === value) || null; }
function forAccount(list, accountId) { return list.filter(item => item.accountId === accountId); }

function findOwner(accountId) {
  const owner = accountOwners.find(o => o.accountId === accountId && o.role === 'account_manager' && o.isPrimary) || accountOwners.find(o => o.accountId === accountId);
  if (!owner) return null;
  const user = byId(users, 'userId', owner.userId);
  return user ? { userId: user.userId, displayName: user.displayName, role: owner.role } : null;
}

function userSummary(userId) {
  const user = byId(users, 'userId', userId);
  return user ? { userId: user.userId, displayName: user.displayName, role: user.role } : null;
}

function primaryContact(accountId) {
  return contacts.find(c => c.accountId === accountId && c.isPrimaryContact) || contacts.find(c => c.accountId === accountId) || null;
}

function accountWarnings(accountId) {
  const warnings = [];
  const needsReview = externalIdentities.filter(e => e.accountId === accountId && e.matchStatus === 'needs_review');
  for (const item of needsReview) warnings.push({ type: 'mapping_review', message: `${item.sourceSystemName} identity "${item.externalDisplayName}" needs mapping review.` });
  if (accountId === 'acct_harbor') warnings.push({ type: 'data_stale', message: 'Microsoft 365/security data is stale. Last successful sync was 2026-06-09.' });
  return warnings;
}

function latestFreshness(accountId) {
  const identities = externalIdentities.filter(e => e.accountId === accountId);
  return integrations.map(integration => {
    const linked = identities.some(e => e.integrationConnectionId === integration.integrationConnectionId);
    return { systemType: integration.systemType, systemName: integration.systemName, status: linked ? integration.status : 'not_mapped', lastSuccessfulSyncAt: linked ? integration.lastSuccessfulSyncAt : null, message: linked ? integration.lastErrorMessage : 'No confirmed account mapping for this source.' };
  });
}

function latestHealth(accountId) {
  const health = accountHealthScores.find(h => h.accountId === accountId);
  if (health) return { ...health, evidenceCount: health.evidenceItemIds.length };
  const account = byId(accounts, 'accountId', accountId);
  return account ? { accountHealthScoreId: null, accountId, scoreCategory: account.healthCategory, scoreValue: null, summary: account.healthSummary, confidence: 'placeholder', topDrivers: [], evidenceItemIds: [], evidenceCount: 0 } : null;
}

function recommendationDto(rec) {
  return {
    ...rec,
    suggestedOwner: userSummary(rec.suggestedOwnerUserId),
    evidenceCount: rec.evidenceItemIds.length,
    availableActions: ['view_evidence', 'create_psa_task_coming_soon', 'dismiss_coming_soon']
  };
}

function accountSummary(account) {
  const agreement = agreements.find(a => a.accountId === account.accountId) || null;
  const renewal = renewals.find(r => r.accountId === account.accountId) || null;
  const health = latestHealth(account.accountId);
  return {
    accountId: account.accountId,
    displayName: account.displayName,
    primaryDomain: account.primaryDomain,
    status: account.status,
    accountOwner: findOwner(account.accountId),
    health: { category: health.scoreCategory, summary: health.summary, scoreValue: health.scoreValue },
    renewal: renewal ? { renewalDate: renewal.renewalDate, daysUntilRenewal: renewal.daysUntilRenewal, status: renewal.status } : null,
    agreement: agreement ? { agreementId: agreement.agreementId, name: agreement.name, agreementType: agreement.agreementType } : null,
    warnings: accountWarnings(account.accountId)
  };
}

function summarizeService(accountId) {
  const rows = forAccount(tickets, accountId);
  const open = rows.filter(t => t.status !== 'closed');
  const topCategories = Object.entries(rows.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})).map(([category, count]) => ({ category, count }));
  return {
    summary: { openTicketCount: open.length, agingTicketCount: open.filter(t => t.ageDays >= 7).length, highPriorityTicketCount: open.filter(t => ['high', 'critical'].includes(t.priority)).length, escalatedTicketCount: open.filter(t => t.isEscalated).length, slaRiskCount: open.filter(t => ['at_risk', 'breached'].includes(t.slaStatus)).length, topCategories },
    tickets: rows
  };
}

function summarizeRmm(accountId) {
  const accountDevices = forAccount(devices, accountId);
  const signals = forAccount(deviceHealthSignals, accountId);
  return {
    summary: { deviceCount: accountDevices.length, serverCount: accountDevices.filter(d => d.deviceType === 'server').length, workstationCount: accountDevices.filter(d => d.deviceType === 'workstation').length, offlineDeviceCount: accountDevices.filter(d => d.status === 'offline').length, patchGapCount: accountDevices.filter(d => ['behind', 'critical_missing'].includes(d.patchStatus)).length, endOfLifeDeviceCount: accountDevices.filter(d => d.isEndOfLife).length },
    devices: accountDevices,
    healthSignals: signals
  };
}

function summarizeSecurity(accountId) {
  const findings = forAccount(securityFindings, accountId);
  const coverage = forAccount(securityCoverage, accountId);
  return {
    summary: { openFindingCount: findings.filter(f => f.status === 'open').length, criticalFindingCount: findings.filter(f => f.severity === 'critical').length, highFindingCount: findings.filter(f => f.severity === 'high').length, coverageGapCount: coverage.filter(c => ['missing', 'partial'].includes(c.coverageStatus)).length },
    findings,
    coverage,
    warnings: accountWarnings(accountId).filter(w => w.type === 'data_stale')
  };
}

function searchAccounts(query, page = 1, pageSize = 10) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { results: [], totalCount: 0 };
  const matchedIds = new Set();
  for (const account of accounts) if ([account.displayName, account.legalName, account.shortName, account.primaryDomain, account.industry].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(account.accountId);
  for (const alias of aliases) if (alias.aliasValue.toLowerCase().includes(q)) matchedIds.add(alias.accountId);
  for (const contact of contacts) if ([contact.fullName, contact.email].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(contact.accountId);
  for (const external of externalIdentities) if ([external.externalId, external.externalDisplayName, external.externalDomain].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(external.accountId);
  const all = accounts.filter(a => matchedIds.has(a.accountId)).map(accountSummary);
  const start = (page - 1) * pageSize;
  return { results: all.slice(start, start + pageSize), totalCount: all.length };
}

function commandCenter(accountId, dateRangePreset = 'last_90_days') {
  const account = byId(accounts, 'accountId', accountId);
  if (!account) return null;
  const agreement = agreements.find(a => a.accountId === accountId) || null;
  const renewal = renewals.find(r => r.accountId === accountId) || null;
  const health = latestHealth(accountId);
  const recs = forAccount(recommendations, accountId).filter(r => r.status === 'new').map(recommendationDto);
  return { account, header: accountSummary(account), snapshot: { accountOwner: findOwner(accountId), primaryContact: primaryContact(accountId), agreement, monthlyRecurringRevenue: agreement?.monthlyRecurringRevenue || null, annualRecurringRevenue: agreement?.annualRecurringRevenue || null, openOpportunityCount: 0, lastQbrDate: null }, health, renewal, dataFreshness: latestFreshness(accountId), service: summarizeService(accountId), rmm: summarizeRmm(accountId), security: summarizeSecurity(accountId), brief: { bodyFormat: 'markdown', body: `${account.displayName} is marked ${health.scoreCategory.replace('_', ' ')}. ${health.summary}` }, risks: health.topDrivers || [], opportunities: recs.filter(r => r.recommendationType === 'open_opportunity'), recommendations: recs, timeline: [], warnings: accountWarnings(accountId), dateRangePreset };
}

function revenue(accountId) {
  return { summary: { monthlyRecurringRevenue: forAccount(agreements, accountId).reduce((sum, a) => sum + (a.monthlyRecurringRevenue || 0), 0), annualRecurringRevenue: forAccount(agreements, accountId).reduce((sum, a) => sum + (a.annualRecurringRevenue || 0), 0), nextRenewalDate: renewals.find(r => r.accountId === accountId)?.renewalDate || null, openOpportunityCount: 0 }, agreements: forAccount(agreements, accountId), renewals: forAccount(renewals, accountId), opportunities: [] };
}

function evidenceForIds(ids) { return ids.map(id => byId(evidenceItems, 'evidenceItemId', id)).filter(Boolean); }

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body, null, 2));
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

function notFound(res, message = 'Endpoint not found.') { return json(res, 404, envelope(null, {}, [{ code: 'not_found', message }])); }
function ensureAccount(res, accountId) { const account = byId(accounts, 'accountId', accountId); if (!account) notFound(res, 'Account not found.'); return account; }

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
    if (!payload) return notFound(res, 'Account not found.');
    return json(res, 200, envelope(payload));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'revenue') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(revenue(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'service') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(summarizeService(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'rmm') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(summarizeRmm(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'security') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(summarizeSecurity(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'health-score' && parts[5] === 'latest') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(latestHealth(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'recommendations') {
    if (!ensureAccount(res, parts[3])) return;
    const status = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit') || 50);
    let rows = forAccount(recommendations, parts[3]);
    if (status) rows = rows.filter(r => r.status === status);
    return json(res, 200, envelope(rows.slice(0, limit).map(recommendationDto)));
  }

  if (req.method === 'GET' && parts[2] === 'recommendations' && parts[4] === 'evidence') {
    const rec = byId(recommendations, 'recommendationId', parts[3]);
    if (!rec) return notFound(res, 'Recommendation not found.');
    return json(res, 200, envelope({ recommendationId: rec.recommendationId, summary: rec.reason, evidence: evidenceForIds(rec.evidenceItemIds) }));
  }

  if (req.method === 'GET' && parts[2] === 'account-health-scores' && parts[4] === 'evidence') {
    const score = byId(accountHealthScores, 'accountHealthScoreId', parts[3]);
    if (!score) return notFound(res, 'Account health score not found.');
    return json(res, 200, envelope({ accountHealthScoreId: score.accountHealthScoreId, summary: score.summary, evidence: evidenceForIds(score.evidenceItemIds) }));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/account-mapping/suggestions') {
    const matchStatus = url.searchParams.get('matchStatus') || 'needs_review';
    const rows = externalIdentities.filter(e => e.matchStatus === matchStatus).map(e => ({ ...e, account: accountSummary(byId(accounts, 'accountId', e.accountId)) }));
    return json(res, 200, envelope(rows));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/integrations') return json(res, 200, envelope(integrations));

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync') {
    const integration = byId(integrations, 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
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

  return notFound(res);
}

function serveStatic(req, res, url) {
  const publicRoot = path.join(__dirname, '..', 'public');
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(publicRoot, requested));
  if (!filePath.startsWith(publicRoot)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
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

module.exports = { createHandler, searchAccounts, commandCenter, revenue, summarizeService, summarizeRmm, summarizeSecurity, latestHealth, envelope };
