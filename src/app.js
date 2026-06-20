const fs = require('fs');
const path = require('path');
const store = require('./repositories/store');
const dataRepository = require('./repositories/dataRepository');
const { getPsaAdapter } = require('./integrations/psaAdapter');

const productEvents = [];
function data() { return dataRepository.getData(); }
function users() { return data().users; }
function integrations() { return data().integrations; }
function accounts() { return data().accounts; }
function accountOwners() { return data().accountOwners; }
function aliases() { return data().aliases; }
function externalIdentities() { return data().externalIdentities; }
function contacts() { return data().contacts; }
function agreements() { return data().agreements; }
function renewals() { return data().renewals; }
function tickets() { return data().tickets; }
function devices() { return data().devices; }
function deviceHealthSignals() { return data().deviceHealthSignals; }
function securityFindings() { return data().securityFindings; }
function securityCoverage() { return data().securityCoverage; }
function evidenceItems() { return data().evidenceItems; }
function accountHealthScores() { return data().accountHealthScores; }
function recommendations() { return data().recommendations; }
function accountPlans() { return data().accountPlans || []; }
function accountPlanObjectives() { return data().accountPlanObjectives || []; }
function accountPlanStakeholders() { return data().accountPlanStakeholders || []; }
function contactEngagementEvents() { return data().contactEngagementEvents || []; }

function envelope(data, meta = {}, errors = []) {
  return { data, meta: { requestId: `req_${Date.now()}`, timestamp: new Date().toISOString(), ...meta }, errors };
}

function byId(list, key, value) { return list.find(item => item[key] === value) || null; }
function currentUser() { return byId(users(), 'userId', store.getState().settings.currentUserId) || byId(users(), 'userId', 'usr_am_jane'); }
function canWriteBack() { return ['admin','account_manager','sales_rep','service_manager','security_lead','executive'].includes(currentUser()?.role); }
function canAdmin() { return currentUser()?.role === 'admin'; }
function forAccount(list, accountId) { return list.filter(item => item.accountId === accountId); }

function forbidden(res, message = 'Current user is not authorized for this action.') { return json(res, 403, envelope(null, {}, [{ code: 'forbidden', message }])); }
function requireAdmin(res) { if (!canAdmin()) { forbidden(res, 'Admin role is required for this endpoint.'); return false; } return true; }
function requireWriteBack(res) { if (!canWriteBack()) { forbidden(res, 'Write-back permission is required for this endpoint.'); return false; } return true; }
function psaCompanyIdentity(accountId) {
  return externalIdentities().find(e => e.accountId === accountId && e.sourceSystemType === 'psa' && (store.getMappingStatus(e.accountExternalIdentityId)?.matchStatus || e.matchStatus) === 'confirmed') || null;
}

function findOwner(accountId) {
  const owner = accountOwners().find(o => o.accountId === accountId && o.role === 'account_manager' && o.isPrimary) || accountOwners().find(o => o.accountId === accountId);
  if (!owner) return null;
  const user = byId(users(), 'userId', owner.userId);
  return user ? { userId: user.userId, displayName: user.displayName, role: owner.role } : null;
}

function userSummary(userId) {
  const user = byId(users(), 'userId', userId);
  return user ? { userId: user.userId, displayName: user.displayName, role: user.role } : null;
}

function primaryContact(accountId) {
  return contacts().find(c => c.accountId === accountId && c.isPrimaryContact) || contacts().find(c => c.accountId === accountId) || null;
}

function accountWarnings(accountId) {
  const warnings = [];
  const needsReview = externalIdentities().filter(e => e.accountId === accountId && (store.getMappingStatus(e.accountExternalIdentityId)?.matchStatus || e.matchStatus) === 'needs_review');
  for (const item of needsReview) warnings.push({ type: 'mapping_review', message: `${item.sourceSystemName} identity "${item.externalDisplayName}" needs mapping review.` });
  if (accountId === 'acct_harbor') warnings.push({ type: 'data_stale', message: 'Microsoft 365/security data is stale. Last successful sync was 2026-06-09.' });
  return warnings;
}

function latestFreshness(accountId) {
  const identities = externalIdentities().filter(e => e.accountId === accountId);
  return integrations().map(integration => {
    const linked = identities.some(e => e.integrationConnectionId === integration.integrationConnectionId);
    return { systemType: integration.systemType, systemName: integration.systemName, status: linked ? integration.status : 'not_mapped', lastSuccessfulSyncAt: linked ? integration.lastSuccessfulSyncAt : null, message: linked ? integration.lastErrorMessage : 'No confirmed account mapping for this source.' };
  });
}

function latestHealth(accountId) {
  const health = accountHealthScores().find(h => h.accountId === accountId);
  if (health) return { ...health, evidenceCount: health.evidenceItemIds.length };
  const account = byId(accounts(), 'accountId', accountId);
  return account ? { accountHealthScoreId: null, accountId, scoreCategory: account.healthCategory, scoreValue: null, summary: account.healthSummary, confidence: 'placeholder', topDrivers: [], evidenceItemIds: [], evidenceCount: 0 } : null;
}

function recommendationDto(rec) {
  const overlay = store.getRecommendationStatus(rec.recommendationId) || {};
  const merged = { ...rec, ...overlay };
  return {
    ...merged,
    suggestedOwner: userSummary(merged.suggestedOwnerUserId),
    evidenceCount: merged.evidenceItemIds.length,
    availableActions: ['view_evidence', 'create_psa_task_coming_soon', 'dismiss_coming_soon']
  };
}

function accountSummary(account) {
  const agreement = agreements().find(a => a.accountId === account.accountId) || null;
  const renewal = renewals().find(r => r.accountId === account.accountId) || null;
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
  const rows = forAccount(tickets(), accountId);
  const open = rows.filter(t => t.status !== 'closed');
  const topCategories = Object.entries(rows.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})).map(([category, count]) => ({ category, count }));
  return {
    summary: { openTicketCount: open.length, agingTicketCount: open.filter(t => t.ageDays >= 7).length, highPriorityTicketCount: open.filter(t => ['high', 'critical'].includes(t.priority)).length, escalatedTicketCount: open.filter(t => t.isEscalated).length, slaRiskCount: open.filter(t => ['at_risk', 'breached'].includes(t.slaStatus)).length, topCategories },
    tickets: rows
  };
}

function summarizeRmm(accountId) {
  const accountDevices = forAccount(devices(), accountId);
  const signals = forAccount(deviceHealthSignals(), accountId);
  return {
    summary: { deviceCount: accountDevices.length, serverCount: accountDevices.filter(d => d.deviceType === 'server').length, workstationCount: accountDevices.filter(d => d.deviceType === 'workstation').length, offlineDeviceCount: accountDevices.filter(d => d.status === 'offline').length, patchGapCount: accountDevices.filter(d => ['behind', 'critical_missing'].includes(d.patchStatus)).length, endOfLifeDeviceCount: accountDevices.filter(d => d.isEndOfLife).length },
    devices: accountDevices,
    healthSignals: signals
  };
}

function summarizeSecurity(accountId) {
  const findings = forAccount(securityFindings(), accountId);
  const coverage = forAccount(securityCoverage(), accountId);
  return {
    summary: { openFindingCount: findings.filter(f => f.status === 'open').length, criticalFindingCount: findings.filter(f => f.severity === 'critical').length, highFindingCount: findings.filter(f => f.severity === 'high').length, coverageGapCount: coverage.filter(c => ['missing', 'partial'].includes(c.coverageStatus)).length },
    findings,
    coverage,
    warnings: accountWarnings(accountId).filter(w => w.type === 'data_stale')
  };
}

function relationshipSummary(accountId) {
  const plan = accountPlans().find(p => p.accountId === accountId) || null;
  const stakeholders = plan ? accountPlanStakeholders().filter(s => s.accountPlanId === plan.accountPlanId) : [];
  const accountContacts = contacts().filter(c => c.accountId === accountId);
  const events = contactEngagementEvents().filter(e => e.accountId === accountId).sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
  const stakeholderContactIds = new Set(stakeholders.map(s => s.contactId));
  const contactRows = accountContacts.map(contact => {
    const stakeholder = stakeholders.find(s => s.contactId === contact.contactId) || null;
    const contactEvents = events.filter(e => e.contactId === contact.contactId);
    const lastTouch = contactEvents[0] || null;
    const relationshipStrength = stakeholder?.relationshipStrength || (contactEvents.length ? 'medium' : 'unknown');
    const sentiment = stakeholder?.sentiment || lastTouch?.sentiment || 'unknown';
    const relationshipRisk = sentiment.includes('negative') || sentiment.includes('concerned') || !lastTouch ? 'watch' : 'normal';
    return { contact, stakeholderRole: stakeholder?.stakeholderRole || (contact.isPrimaryContact ? 'primary_contact' : contact.isTechnicalContact ? 'technical_contact' : 'contact'), relationshipStrength, sentiment, relationshipRisk, lastTouch, engagementCount: contactEvents.length };
  });
  const gaps = [];
  if (!contactRows.some(row => row.stakeholderRole === 'economic_buyer')) gaps.push({ type: 'missing_economic_buyer', message: 'No economic buyer is mapped in the account plan.' });
  for (const contact of accountContacts.filter(c => !stakeholderContactIds.has(c.contactId) && c.isPrimaryContact)) gaps.push({ type: 'primary_contact_not_in_plan', contactId: contact.contactId, message: `${contact.fullName} is primary contact but is not mapped as an account plan stakeholder.` });
  for (const row of contactRows.filter(r => r.relationshipRisk === 'watch')) gaps.push({ type: 'relationship_watch', contactId: row.contact.contactId, message: `${row.contact.fullName} needs relationship follow-up.` });
  return { summary: { contactCount: accountContacts.length, stakeholderCount: stakeholders.length, engagementEventCount: events.length, relationshipRiskCount: contactRows.filter(r => r.relationshipRisk === 'watch').length }, contacts: contactRows, recentEngagement: events.slice(0, 5), gaps };
}

function searchAccounts(query, page = 1, pageSize = 10) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { results: [], totalCount: 0 };
  const matchedIds = new Set();
  for (const account of accounts()) if ([account.displayName, account.legalName, account.shortName, account.primaryDomain, account.industry].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(account.accountId);
  for (const alias of aliases()) if (alias.aliasValue.toLowerCase().includes(q)) matchedIds.add(alias.accountId);
  for (const contact of contacts()) if ([contact.fullName, contact.email].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(contact.accountId);
  for (const external of externalIdentities()) if ([external.externalId, external.externalDisplayName, external.externalDomain].filter(Boolean).some(f => f.toLowerCase().includes(q))) matchedIds.add(external.accountId);
  const all = accounts().filter(a => matchedIds.has(a.accountId)).map(accountSummary);
  const start = (page - 1) * pageSize;
  return { results: all.slice(start, start + pageSize), totalCount: all.length };
}

function commandCenter(accountId, dateRangePreset = 'last_90_days') {
  const account = byId(accounts(), 'accountId', accountId);
  if (!account) return null;
  const agreement = agreements().find(a => a.accountId === accountId) || null;
  const renewal = renewals().find(r => r.accountId === accountId) || null;
  const health = latestHealth(accountId);
  const recs = forAccount(recommendations(), accountId).filter(r => r.status === 'new').map(recommendationDto);
  return { account, header: accountSummary(account), snapshot: { accountOwner: findOwner(accountId), primaryContact: primaryContact(accountId), agreement, monthlyRecurringRevenue: agreement?.monthlyRecurringRevenue || null, annualRecurringRevenue: agreement?.annualRecurringRevenue || null, openOpportunityCount: 0, lastQbrDate: null }, health, renewal, dataFreshness: latestFreshness(accountId), service: summarizeService(accountId), rmm: summarizeRmm(accountId), security: summarizeSecurity(accountId), relationships: relationshipSummary(accountId), brief: { bodyFormat: 'markdown', body: `${account.displayName} is marked ${health.scoreCategory.replace('_', ' ')}. ${health.summary}` }, risks: health.topDrivers || [], opportunities: recs.filter(r => r.recommendationType === 'open_opportunity'), recommendations: recs, timeline: activityTimeline(accountId), warnings: accountWarnings(accountId), dateRangePreset };
}

function revenue(accountId) {
  return { summary: { monthlyRecurringRevenue: forAccount(agreements(), accountId).reduce((sum, a) => sum + (a.monthlyRecurringRevenue || 0), 0), annualRecurringRevenue: forAccount(agreements(), accountId).reduce((sum, a) => sum + (a.annualRecurringRevenue || 0), 0), nextRenewalDate: renewals().find(r => r.accountId === accountId)?.renewalDate || null, openOpportunityCount: 0 }, agreements: forAccount(agreements(), accountId), renewals: forAccount(renewals(), accountId), opportunities: [] };
}

function evidenceForIds(ids) { return ids.map(id => byId(evidenceItems(), 'evidenceItemId', id)).filter(Boolean); }
function newId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function now() { return new Date().toISOString(); }
function notBlank(value, fallback) { return value && String(value).trim() ? String(value).trim() : fallback; }
function sourceRecordLabel(ev) { return `${ev.sourceSystemName}: ${ev.summary}`; }

function buildTaskPreview(accountId, body = {}) {
  const rec = byId(recommendations(), 'recommendationId', body.recommendationId);
  if (!rec || rec.accountId !== accountId) return { error: { code: 'validation_error', message: 'A recommendation for this account is required.', field: 'recommendationId' } };
  const psaIdentity = psaCompanyIdentity(accountId);
  if (!psaIdentity) return { error: { code: 'mapping_required', message: 'A confirmed PSA company mapping is required before PSA write-back.', field: 'accountId' } };
  const account = byId(accounts(), 'accountId', accountId);
  const evidence = evidenceForIds(rec.evidenceItemIds);
  const title = notBlank(body.title, rec.title);
  const ownerUserId = body.ownerUserId || rec.suggestedOwnerUserId;
  const dueDate = body.dueDate || rec.suggestedDueDate;
  const evidenceSummary = evidence.map(sourceRecordLabel);
  const taskBody = notBlank(body.body, `${rec.reason}\n\nEvidence:\n${evidenceSummary.map(e => `- ${e}`).join('\n')}`);
  return { payload: { accountId, accountName: account.displayName, externalCompanyId: psaIdentity.externalId, recommendationId: rec.recommendationId, title, body: taskBody, ownerUserId, owner: userSummary(ownerUserId), dueDate, evidenceSummary, isStub: true }, warnings: ['Sprint 5 uses a typed mock PSA adapter; no external PSA record is created.'] };
}

function buildSyncSummary(integration) {
  const base = { syncRunId: `sync_${Date.now()}`, status: 'succeeded', mode: 'preview', integrationConnectionId: integration.integrationConnectionId, systemType: integration.systemType };
  if (integration.systemType === 'psa') return { ...base, counts: { scanned: 4, created: 0, updated: 2, skipped: 1, needsReview: 1 }, protectedRules: ['confirmed_mappings_are_never_overwritten', 'preview_before_import'] };
  if (integration.systemType === 'rmm') return { ...base, counts: { scanned: 6, created: 0, updated: 3, skipped: 2, needsReview: 1 }, protectedRules: ['unmapped_clients_need_review'] };
  if (integration.systemType === 'security' || integration.systemType === 'microsoft365') return { ...base, counts: { scanned: 5, created: 0, updated: 2, skipped: 3, needsReview: 0 }, protectedRules: ['stale_tokens_do_not_clear_existing_evidence'] };
  return { ...base, counts: { scanned: 0, created: 0, updated: 0, skipped: 0, needsReview: 0 }, protectedRules: [] };
}

function integrationCapabilitySummary() {
  return integrations().map(integration => ({
    integrationConnectionId: integration.integrationConnectionId,
    systemType: integration.systemType,
    systemName: integration.systemName,
    status: integration.status,
    lastSuccessfulSyncAt: integration.lastSuccessfulSyncAt,
    capabilities: integration.systemType === 'psa'
      ? ['company_sync_preview', 'contact_sync_preview', 'ticket_sync_preview', 'create_task', 'create_note']
      : integration.systemType === 'rmm'
        ? ['device_health_read', 'patch_posture_read', 'alert_summary_read']
        : ['finding_read', 'coverage_read', 'evidence_read']
  }));
}

function integrationConfiguration(integrationConnectionId) {
  const config = store.getState().settings.integrationConfigurations?.[integrationConnectionId] || null;
  if (!config) return null;
  const { clientSecret, password, apiKey, token, accessToken, refreshToken, ...safeConfig } = config;
  return safeConfig;
}

function validateIntegrationConfigurationPatch(body) {
  const errors = [];
  if (body.providerType !== undefined && !['mock_psa', 'connectwise_manage', 'autotask'].includes(body.providerType)) errors.push({ code: 'validation_error', message: 'providerType must be mock_psa, connectwise_manage, or autotask.', field: 'providerType' });
  if (body.baseUrl !== undefined && String(body.baseUrl).trim() === '') errors.push({ code: 'validation_error', message: 'baseUrl cannot be blank.', field: 'baseUrl' });
  if (body.enabledCapabilities !== undefined && (!Array.isArray(body.enabledCapabilities) || body.enabledCapabilities.some(item => typeof item !== 'string'))) errors.push({ code: 'validation_error', message: 'enabledCapabilities must be an array of strings.', field: 'enabledCapabilities' });
  return errors;
}

function buildPsaSyncApply(integrationConnectionId, selectedRowIds = []) {
  const preview = getPsaAdapter().previewCompanyContactSync();
  const selected = new Set(selectedRowIds);
  const rows = [...preview.companies.map(row => ({ ...row, recordType: 'company' })), ...preview.contacts.map(row => ({ ...row, recordType: 'contact' }))];
  const appliedRows = [];
  const skippedRows = [];
  const conflictRows = [];
  for (const row of rows) {
    if (selected.size && !selected.has(row.rowId)) { skippedRows.push({ ...row, skipReason: 'not_selected' }); continue; }
    if (row.action === 'conflict') { conflictRows.push({ ...row, skipReason: 'conflict_requires_review' }); continue; }
    appliedRows.push({ ...row, appliedAt: now() });
  }
  return {
    syncRunId: newId('sync'),
    integrationConnectionId,
    mode: 'apply_stub',
    status: conflictRows.length ? 'completed_with_conflicts' : 'succeeded',
    appliedByUserId: currentUser()?.userId,
    appliedAt: now(),
    counts: { selected: selected.size || rows.length, applied: appliedRows.length, skipped: skippedRows.length, conflicts: conflictRows.length },
    appliedRows,
    skippedRows,
    conflictRows,
    warnings: ['Sprint 7 apply is a controlled import stub. It records selected preview rows and audit history but does not call an external PSA API.']
  };
}

function auditWriteBack({ accountId, actionType, targetRecordType, status, requestPayload, adapterResult = {}, recommendationId = null, generatedArtifactId = null, error = null }) {
  const audit = { writeBackAuditEventId: newId('audit'), accountId, actionType, targetRecordType, status, adapter: adapterResult.adapter || 'mock', requestSummary: requestPayload ? { title: requestPayload.title, accountId: requestPayload.accountId, externalCompanyId: requestPayload.externalCompanyId } : null, responseSummary: adapterResult.requestSummary || null, error, requestPayload, externalId: adapterResult.externalId || null, externalUrl: adapterResult.externalUrl || null, recommendationId, generatedArtifactId, createdAt: now() };
  store.add('writeBackAuditEvents', audit);
  return audit;
}

function createAccountBrief(accountId, requestedByUserId = null) {
  const cc = commandCenter(accountId);
  if (!cc) return null;
  const evidenceIds = new Set([...(cc.health.evidenceItemIds || [])]);
  for (const rec of cc.recommendations) for (const id of rec.evidenceItemIds || []) evidenceIds.add(id);
  const evidence = evidenceForIds([...evidenceIds]);
  const lines = [
    `# ${cc.account.displayName} Account Brief`, '',
    `Generated: ${now()}`, '',
    `## Executive Summary`, cc.brief.body, '',
    `## Health`, `- Category: ${cc.health.scoreCategory}`, `- Score: ${cc.health.scoreValue ?? 'N/A'}`, `- Confidence: ${cc.health.confidence}`, '',
    `### Top Drivers`, ...(cc.health.topDrivers || []).map(d => `- ${d}`), '',
    `## Service Summary`, `- Open tickets: ${cc.service.summary.openTicketCount}`, `- SLA risk tickets: ${cc.service.summary.slaRiskCount}`, `- Aging tickets(): ${cc.service.summary.agingTicketCount}`, '',
    `## RMM Summary`, `- Devices: ${cc.rmm.summary.deviceCount}`, `- Patch gaps: ${cc.rmm.summary.patchGapCount}`, `- End-of-life devices(): ${cc.rmm.summary.endOfLifeDeviceCount}`, '',
    `## Security Summary`, `- Open findings: ${cc.security.summary.openFindingCount}`, `- High findings: ${cc.security.summary.highFindingCount}`, `- Coverage gaps: ${cc.security.summary.coverageGapCount}`, '',
    `## Recommendations`, ...(cc.recommendations.length ? cc.recommendations.map(r => `- ${r.title}: ${r.reason}`) : ['- No active recommendations.']), '',
    `## Evidence Appendix`, ...(evidence.length ? evidence.map(ev => `- ${ev.sourceSystemName} / ${ev.sourceRecordType} / ${ev.sourceRecordId}: ${ev.summary}`) : ['- No evidence linked.'])
  ];
  const artifact = { generatedArtifactId: newId('artifact'), accountId, artifactType: 'account_brief', title: `${cc.account.displayName} Account Brief`, bodyFormat: 'markdown', body: lines.join('\n'), status: 'draft', createdByUserId: requestedByUserId, evidenceItemIds: [...evidenceIds], createdAt: now(), updatedAt: now() };
  store.add('generatedArtifacts', artifact);
  store.add('activities', { activityId: newId('activity'), accountId, activityType: 'generated_artifact', title: artifact.title, body: 'Generated account brief.', status: 'complete', generatedArtifactId: artifact.generatedArtifactId, createdAt: artifact.createdAt });
  return artifact;
}

function activityTimeline(accountId) {
  const artifactItems = store.list('generatedArtifacts', a => a.accountId === accountId).map(a => ({ type: 'generated_artifact', timestamp: a.createdAt, title: a.title, generatedArtifactId: a.generatedArtifactId, status: a.status }));
  const auditItems = store.list('writeBackAuditEvents', e => e.accountId === accountId).map(e => ({ type: 'write_back_audit', timestamp: e.createdAt, title: `${e.actionType} ${e.status}`, writeBackAuditEventId: e.writeBackAuditEventId, externalId: e.externalId, recommendationId: e.recommendationId }));
  const runtimeActivities = store.list('activities', a => a.accountId === accountId);
  return [...artifactItems, ...auditItems, ...runtimeActivities].sort((a, b) => String(b.timestamp || b.createdAt).localeCompare(String(a.timestamp || a.createdAt)));
}

function portfolioRow(account) {
  const health = latestHealth(account.accountId);
  const topRecommendation = recommendations().find(r => r.accountId === account.accountId && r.status === 'new');
  const renewal = renewals().find(r => r.accountId === account.accountId) || null;
  return { accountId: account.accountId, displayName: account.displayName, owner: findOwner(account.accountId), healthCategory: health.scoreCategory, reason: health.summary, renewal, recommendedAction: topRecommendation?.title || null, recommendationId: topRecommendation?.recommendationId || null };
}

function accountPlanDto(accountId) {
  const plan = accountPlans().find(p => p.accountId === accountId) || null;
  if (!plan) return null;
  const objectives = accountPlanObjectives().filter(o => o.accountPlanId === plan.accountPlanId).map(o => ({ ...o, linkedRecommendation: o.linkedRecommendationId ? recommendationDto(byId(recommendations(), 'recommendationId', o.linkedRecommendationId)) : null }));
  const stakeholders = accountPlanStakeholders().filter(s => s.accountPlanId === plan.accountPlanId).map(s => ({ ...s, contact: byId(contacts(), 'contactId', s.contactId) }));
  return { ...plan, owner: userSummary(plan.ownerUserId), objectives, stakeholders };
}

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
function ensureAccount(res, accountId) { const account = byId(accounts(), 'accountId', accountId); if (!account) notFound(res, 'Account not found.'); return account; }

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

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'relationships') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(relationshipSummary(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'health-score' && parts[5] === 'latest') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(latestHealth(parts[3])));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'recommendations') {
    if (!ensureAccount(res, parts[3])) return;
    const status = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit') || 50);
    let rows = forAccount(recommendations(), parts[3]);
    if (status) rows = rows.filter(r => r.status === status);
    return json(res, 200, envelope(rows.slice(0, limit).map(recommendationDto)));
  }

  if (req.method === 'GET' && parts[2] === 'recommendations' && parts[4] === 'evidence') {
    const rec = byId(recommendations(), 'recommendationId', parts[3]);
    if (!rec) return notFound(res, 'Recommendation not found.');
    return json(res, 200, envelope({ recommendationId: rec.recommendationId, summary: rec.reason, evidence: evidenceForIds(rec.evidenceItemIds) }));
  }

  if (req.method === 'GET' && parts[2] === 'account-health-scores' && parts[4] === 'evidence') {
    const score = byId(accountHealthScores(), 'accountHealthScoreId', parts[3]);
    if (!score) return notFound(res, 'Account health score not found.');
    return json(res, 200, envelope({ accountHealthScoreId: score.accountHealthScoreId, summary: score.summary, evidence: evidenceForIds(score.evidenceItemIds) }));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/account-mapping/suggestions') {
    const matchStatus = url.searchParams.get('matchStatus') || 'needs_review';
    const rows = externalIdentities().map(e => ({ ...e, ...(store.getMappingStatus(e.accountExternalIdentityId) || {}) })).filter(e => e.matchStatus === matchStatus).map(e => ({ ...e, account: accountSummary(byId(accounts(), 'accountId', e.accountId)) }));
    return json(res, 200, envelope(rows));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/integrations') return json(res, 200, envelope(integrations()));

  if (req.method === 'GET' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'configuration') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    const config = integrationConfiguration(parts[4]);
    if (!config) return notFound(res, 'Integration configuration not found.');
    return json(res, 200, envelope(config, { secretFieldsReturned: false }));
  }

  if (req.method === 'PATCH' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'configuration') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    const body = await parseBody(req);
    const errors = validateIntegrationConfigurationPatch(body);
    if (errors.length) return json(res, 400, envelope(null, {}, errors));
    const settings = store.getState().settings;
    const existing = settings.integrationConfigurations?.[parts[4]] || { integrationConnectionId: parts[4] };
    const allowedPatch = {};
    for (const key of ['providerType', 'environmentLabel', 'baseUrl', 'tenantOrCompanyId', 'enabledCapabilities', 'secretStatus']) if (body[key] !== undefined) allowedPatch[key] = body[key];
    settings.integrationConfigurations = { ...(settings.integrationConfigurations || {}), [parts[4]]: { ...existing, ...allowedPatch, integrationConnectionId: parts[4], updatedAt: now(), updatedByUserId: currentUser()?.userId } };
    store.updateSettings(settings);
    store.add('activities', { activityId: newId('activity'), accountId: null, activityType: 'integration_configuration_updated', title: `${integration.systemName} configuration updated`, body: `Updated non-secret ${integration.systemType} integration configuration.`, status: 'complete', createdByUserId: currentUser()?.userId, createdAt: now() });
    await store.flush();
    return json(res, 200, envelope(integrationConfiguration(parts[4]), { secretFieldsReturned: false }));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync-preview') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    if (integration.systemType !== 'psa') return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'Sprint 7 sync preview currently supports PSA integrations only.', field: 'integrationConnectionId' }]));
    const preview = getPsaAdapter().previewCompanyContactSync();
    return json(res, 200, envelope({ integrationConnectionId: parts[4], systemName: integration.systemName, ...preview }));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync' && parts[6] === 'apply') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    if (integration.systemType !== 'psa') return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'Sprint 7 sync apply currently supports PSA integrations only.', field: 'integrationConnectionId' }]));
    const body = await parseBody(req);
    if (body.selectedRowIds !== undefined && (!Array.isArray(body.selectedRowIds) || body.selectedRowIds.some(item => typeof item !== 'string'))) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'selectedRowIds must be an array of row ID strings.', field: 'selectedRowIds' }]));
    const summary = buildPsaSyncApply(parts[4], body.selectedRowIds || []);
    store.add('syncHistory', summary);
    store.add('activities', { activityId: newId('activity'), accountId: null, activityType: 'integration_sync_apply_stub', title: `${integration.systemName} sync apply stub`, body: `Applied ${summary.counts.applied} preview rows with ${summary.counts.conflicts} conflicts.`, status: summary.status, createdByUserId: currentUser()?.userId, createdAt: summary.appliedAt });
    await store.flush();
    return json(res, 200, envelope(summary));
  }

  if (req.method === 'GET' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync-history') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    return json(res, 200, envelope(store.list('syncHistory', run => run.integrationConnectionId === parts[4]).sort((a, b) => String(b.appliedAt).localeCompare(String(a.appliedAt)))));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/integrations/status') {
    return json(res, 200, envelope({ store: store.providerInfo(), integrations: integrationCapabilitySummary() }));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/session/current-user') {
    return json(res, 200, envelope(currentUser()));
  }

  if (req.method === 'PATCH' && url.pathname === '/api/v1/session/current-user') {
    const body = await parseBody(req);
    const user = byId(users(), 'userId', body.userId);
    if (!user) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'userId must match a seeded active user.', field: 'userId' }]));
    const settings = store.getState().settings;
    store.updateSettings({ ...settings, currentUserId: user.userId });
    await store.flush();
    return json(res, 200, envelope(user, { localDemoOnly: true }));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'integrations' && parts[5] === 'sync') {
    if (!requireAdmin(res)) return;
    const integration = byId(integrations(), 'integrationConnectionId', parts[4]);
    if (!integration) return notFound(res, 'Integration not found.');
    integration.lastSuccessfulSyncAt = new Date().toISOString();
    integration.status = 'connected';
    integration.lastErrorMessage = null;
    return json(res, 200, envelope(buildSyncSummary(integration)));
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'psa' && parts[5] === 'tasks' && parts[6] === 'preview') {
    if (!requireWriteBack(res)) return;
    if (!ensureAccount(res, parts[3])) return;
    const body = await parseBody(req);
    const preview = buildTaskPreview(parts[3], body);
    if (preview.error) return json(res, 400, envelope(null, {}, [preview.error]));
    return json(res, 200, envelope({ isValid: true, ...preview }));
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'psa' && parts[5] === 'tasks' && !parts[6]) {
    if (!requireWriteBack(res)) return;
    if (!ensureAccount(res, parts[3])) return;
    const body = await parseBody(req);
    if (body.confirmed !== true) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'confirmed must be true before creating a PSA task.', field: 'confirmed' }]));
    const preview = buildTaskPreview(parts[3], body);
    if (preview.error) return json(res, 400, envelope(null, {}, [preview.error]));
    const activity = { activityId: newId('activity'), accountId: parts[3], activityType: 'psa_task_stub', title: preview.payload.title, body: preview.payload.body, status: 'open', dueDate: preview.payload.dueDate, ownerUserId: preview.payload.ownerUserId, recommendationId: preview.payload.recommendationId, createdAt: now() };
    const adapterResult = getPsaAdapter().createTask(preview.payload);
    if (adapterResult.status === 'validation_failed') {
      const audit = auditWriteBack({ accountId: parts[3], actionType: 'create_psa_task_stub', targetRecordType: 'task', status: 'failed', requestPayload: preview.payload, adapterResult, recommendationId: preview.payload.recommendationId, error: { code: 'adapter_validation_failed', message: 'PSA adapter rejected the task payload.', missingFields: adapterResult.missingFields } });
      return json(res, 400, envelope(null, {}, [{ code: 'adapter_validation_failed', message: 'PSA adapter rejected the task payload.', missingFields: adapterResult.missingFields, auditEventId: audit.writeBackAuditEventId }]));
    }
    activity.externalId = adapterResult.externalId; activity.externalUrl = adapterResult.externalUrl;
    store.add('activities', activity);
    store.setRecommendationStatus(preview.payload.recommendationId, { status: 'converted_to_task', updatedAt: now() });
    const audit = auditWriteBack({ accountId: parts[3], actionType: 'create_psa_task_stub', targetRecordType: 'task', status: 'succeeded', requestPayload: preview.payload, adapterResult, recommendationId: preview.payload.recommendationId });
    return json(res, 201, envelope({ activityId: activity.activityId, externalId: audit.externalId, externalUrl: audit.externalUrl, status: 'created_stub', auditEventId: audit.writeBackAuditEventId }));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'write-back-audit-events') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope(store.list('writeBackAuditEvents', e => e.accountId === parts[3])));
  }

  if (req.method === 'PATCH' && parts[2] === 'recommendations') {
    const rec = byId(recommendations(), 'recommendationId', parts[3]);
    if (!rec) return notFound(res, 'Recommendation not found.');
    const body = await parseBody(req);
    const allowed = ['new', 'accepted', 'dismissed', 'snoozed', 'converted_to_task', 'converted_to_opportunity', 'completed'];
    if (!allowed.includes(body.status)) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'Invalid recommendation status.', field: 'status' }]));
    store.setRecommendationStatus(rec.recommendationId, { status: body.status, dismissalReason: body.dismissalReason, snoozedUntil: body.snoozedUntil, updatedAt: now() });
    return json(res, 200, envelope(recommendationDto(rec)));
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'artifacts' && parts[5] === 'account-brief') {
    if (!ensureAccount(res, parts[3])) return;
    const artifact = createAccountBrief(parts[3]);
    return json(res, 201, envelope(artifact));
  }

  if (req.method === 'GET' && parts[2] === 'generated-artifacts' && parts.length === 4) {
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === parts[3]);
    if (!artifact) return notFound(res, 'Generated artifact not found.');
    return json(res, 200, envelope(artifact));
  }

  if (req.method === 'PATCH' && parts[2] === 'generated-artifacts' && parts.length === 4) {
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === parts[3]);
    if (!artifact) return notFound(res, 'Generated artifact not found.');
    const body = await parseBody(req);
    const allowed = ['draft', 'reviewed', 'approved', 'archived'];
    if (!allowed.includes(body.status)) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'Invalid generated artifact status.', field: 'status' }]));
    artifact.status = body.status;
    artifact.reviewedByUserId = body.status === 'reviewed' || body.status === 'approved' ? currentUser()?.userId : artifact.reviewedByUserId;
    artifact.reviewNotes = body.reviewNotes || artifact.reviewNotes || null;
    artifact.updatedAt = now();
    await store.flush();
    return json(res, 200, envelope(artifact));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'generated-artifacts') {
    if (!ensureAccount(res, parts[3])) return;
    const artifactType = url.searchParams.get('artifactType');
    let rows = store.list('generatedArtifacts', a => a.accountId === parts[3]);
    if (artifactType) rows = rows.filter(a => a.artifactType === artifactType);
    return json(res, 200, envelope(rows));
  }

  if (req.method === 'GET' && parts[2] === 'generated-artifacts' && parts[4] === 'evidence') {
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === parts[3]);
    if (!artifact) return notFound(res, 'Generated artifact not found.');
    return json(res, 200, envelope({ generatedArtifactId: artifact.generatedArtifactId, evidence: evidenceForIds(artifact.evidenceItemIds || []) }));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'activity') {
    if (!ensureAccount(res, parts[3])) return;
    return json(res, 200, envelope({ items: activityTimeline(parts[3]) }));
  }

  if (req.method === 'GET' && parts[2] === 'accounts' && parts[4] === 'account-plan') {
    if (!ensureAccount(res, parts[3])) return;
    const plan = accountPlanDto(parts[3]);
    if (!plan) return notFound(res, 'Account plan not found.');
    const overlay = store.getState().accountPlanStatus?.[plan.accountPlanId] || {};
    return json(res, 200, envelope({ ...plan, ...overlay }));
  }

  if (req.method === 'PATCH' && parts[2] === 'accounts' && parts[4] === 'account-plan') {
    if (!ensureAccount(res, parts[3])) return;
    const plan = accountPlanDto(parts[3]);
    if (!plan) return notFound(res, 'Account plan not found.');
    const body = await parseBody(req);
    const allowed = ['planSummary', 'status', 'targetReviewDate'];
    const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    store.getState().accountPlanStatus ||= {};
    store.getState().accountPlanStatus[plan.accountPlanId] = { ...(store.getState().accountPlanStatus[plan.accountPlanId] || {}), ...patch, updatedAt: now() };
    await store.flush();
    return json(res, 200, envelope({ ...plan, ...store.getState().accountPlanStatus[plan.accountPlanId] }));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'account-mapping' && parts[5] === 'confirm') {
    if (!requireAdmin(res)) return;
    const identity = byId(externalIdentities(), 'accountExternalIdentityId', parts[4]);
    if (!identity) return notFound(res, 'Account external identity not found.');
    const overlay = store.setMappingStatus(identity.accountExternalIdentityId, { matchStatus: 'confirmed', matchConfidence: 100, matchedAt: now(), matchedBy: 'runtime_admin' });
    return json(res, 200, envelope({ ...identity, ...overlay }));
  }

  if (req.method === 'POST' && parts[2] === 'admin' && parts[3] === 'account-mapping' && parts[5] === 'reject') {
    if (!requireAdmin(res)) return;
    const identity = byId(externalIdentities(), 'accountExternalIdentityId', parts[4]);
    if (!identity) return notFound(res, 'Account external identity not found.');
    const overlay = store.setMappingStatus(identity.accountExternalIdentityId, { matchStatus: 'rejected', matchedAt: now(), matchedBy: 'runtime_admin' });
    return json(res, 200, envelope({ ...identity, ...overlay }));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/portfolio/accounts-at-risk') {
    const owner = url.searchParams.get('ownerUserId');
    let rows = accounts().filter(a => latestHealth(a.accountId).scoreCategory === 'at_risk').map(portfolioRow);
    if (owner) rows = rows.filter(r => r.owner?.userId === owner);
    return json(res, 200, envelope(rows));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/portfolio/renewals') {
    const days = Number(url.searchParams.get('days') || 90);
    const owner = url.searchParams.get('ownerUserId');
    let rows = accounts().filter(a => { const h = latestHealth(a.accountId); const r = renewals().find(x => x.accountId === a.accountId); return h.scoreCategory === 'renewal_risk' || (r && r.daysUntilRenewal <= days); }).map(portfolioRow);
    if (owner) rows = rows.filter(r => r.owner?.userId === owner);
    return json(res, 200, envelope(rows));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/portfolio/expansion-candidates') {
    const owner = url.searchParams.get('ownerUserId');
    let rows = accounts().filter(a => latestHealth(a.accountId).scoreCategory === 'expansion_candidate' || recommendations().some(r => r.accountId === a.accountId && r.recommendationType === 'open_opportunity')).map(portfolioRow);
    if (owner) rows = rows.filter(r => r.owner?.userId === owner);
    return json(res, 200, envelope(rows));
  }
  if (req.method === 'GET' && url.pathname === '/api/v1/admin/settings/psa-field-mapping') {
    if (!requireAdmin(res)) return;
    return json(res, 200, envelope(store.getState().settings.psaFieldMapping));
  }

  if (req.method === 'PATCH' && url.pathname === '/api/v1/admin/settings/psa-field-mapping') {
    if (!requireAdmin(res)) return;
    const body = await parseBody(req);
    const settings = store.getState().settings;
    settings.psaFieldMapping = { ...settings.psaFieldMapping, ...body };
    store.updateSettings(settings);
    return json(res, 200, envelope(settings.psaFieldMapping));
  }

  if (req.method === 'POST' && url.pathname === '/api/v1/admin/store/reset') {
    await store.resetStore();
    return json(res, 200, envelope({ status: 'reset', storePath: store.storePath }));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/integrations/psa/status') {
    return json(res, 200, envelope(getPsaAdapter().getConnectionStatus()));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/store/status') {
    if (!requireAdmin(res)) return;
    return json(res, 200, envelope(store.providerInfo()));
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/admin/database/status') {
    if (!requireAdmin(res)) return;
    try {
      return json(res, 200, envelope(await dataRepository.databaseStatus(), { secretsReturned: false }));
    } catch (error) {
      return json(res, 503, envelope({ ...store.providerInfo(), connected: false }, {}, [{ code: 'database_unavailable', message: error.message }]));
    }
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'psa' && parts[5] === 'notes' && parts[6] === 'preview') {
    if (!requireWriteBack(res)) return;
    if (!ensureAccount(res, parts[3])) return;
    const body = await parseBody(req);
    const psaIdentity = psaCompanyIdentity(parts[3]);
    if (!psaIdentity) return json(res, 400, envelope(null, {}, [{ code: 'mapping_required', message: 'A confirmed PSA company mapping is required before PSA write-back.', field: 'accountId' }]));
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === body.generatedArtifactId && a.accountId === parts[3]);
    if (!artifact) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'generatedArtifactId is required for this account.', field: 'generatedArtifactId' }]));
    return json(res, 200, envelope({ isValid: true, payload: { accountId: parts[3], externalCompanyId: psaIdentity.externalId, generatedArtifactId: artifact.generatedArtifactId, title: artifact.title, body: artifact.body, noteType: store.getState().settings.psaFieldMapping.defaultNoteType, isStub: true }, warnings: ['Sprint 5 uses a typed mock PSA adapter; no external PSA record is created.'] }));
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'psa' && parts[5] === 'notes' && !parts[6]) {
    if (!requireWriteBack(res)) return;
    if (!ensureAccount(res, parts[3])) return;
    const body = await parseBody(req);
    if (body.confirmed !== true) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'confirmed must be true before creating a PSA note.', field: 'confirmed' }]));
    const psaIdentity = psaCompanyIdentity(parts[3]);
    if (!psaIdentity) return json(res, 400, envelope(null, {}, [{ code: 'mapping_required', message: 'A confirmed PSA company mapping is required before PSA write-back.', field: 'accountId' }]));
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === body.generatedArtifactId && a.accountId === parts[3]);
    if (!artifact) return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'generatedArtifactId is required for this account.', field: 'generatedArtifactId' }]));
    const payload = { accountId: parts[3], externalCompanyId: psaIdentity.externalId, title: artifact.title, body: artifact.body, generatedArtifactId: artifact.generatedArtifactId };
    const adapterResult = getPsaAdapter().createNote(payload);
    if (adapterResult.status === 'validation_failed') {
      const audit = auditWriteBack({ accountId: parts[3], actionType: 'create_psa_note_stub', targetRecordType: 'note', status: 'failed', requestPayload: payload, adapterResult, generatedArtifactId: artifact.generatedArtifactId, error: { code: 'adapter_validation_failed', message: 'PSA adapter rejected the note payload.', missingFields: adapterResult.missingFields } });
      return json(res, 400, envelope(null, {}, [{ code: 'adapter_validation_failed', message: 'PSA adapter rejected the note payload.', missingFields: adapterResult.missingFields, auditEventId: audit.writeBackAuditEventId }]));
    }
    const audit = auditWriteBack({ accountId: parts[3], actionType: 'create_psa_note_stub', targetRecordType: 'note', status: 'succeeded', requestPayload: payload, adapterResult, generatedArtifactId: artifact.generatedArtifactId });
    return json(res, 201, envelope({ externalId: adapterResult.externalId, externalUrl: adapterResult.externalUrl, status: 'created_stub', auditEventId: audit.writeBackAuditEventId }));
  }

  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'artifacts' && ['qbr-draft','customer-email-draft'].includes(parts[5])) {
    if (!ensureAccount(res, parts[3])) return;
    const cc = commandCenter(parts[3]);
    const isQbr = parts[5] === 'qbr-draft';
    const title = isQbr ? `${cc.account.displayName} QBR Draft` : `${cc.account.displayName} Customer Email Draft`;
    const body = isQbr
      ? `# ${title}\n\n## Executive Summary\n${cc.brief.body}\n\n## Service\nOpen tickets: ${cc.service.summary.openTicketCount}\n\n## RMM\nPatch gaps: ${cc.rmm.summary.patchGapCount}\n\n## Security\nOpen findings: ${cc.security.summary.openFindingCount}\n\n## Next Steps\n${cc.recommendations.map(r => `- ${r.title}`).join('\n')}`
      : `Subject: Recommended next steps for ${cc.account.displayName}\n\nHi,\n\nBased on our recent account review, I recommend we discuss: ${cc.recommendations[0]?.title || 'your current technology roadmap'}.\n\n${cc.recommendations[0]?.reason || cc.health.summary}\n\nBest,`;
    const evidenceIds = [...new Set([...(cc.health.evidenceItemIds || []), ...cc.recommendations.flatMap(r => r.evidenceItemIds || [])])];
    const artifact = { generatedArtifactId: newId('artifact'), accountId: parts[3], artifactType: isQbr ? 'qbr_draft' : 'customer_email_draft', title, bodyFormat: 'markdown', body, status: 'draft', evidenceItemIds: evidenceIds, createdAt: now(), updatedAt: now() };
    store.add('generatedArtifacts', artifact);
    store.add('activities', { activityId: newId('activity'), accountId: parts[3], activityType: 'generated_artifact', title: artifact.title, status: 'complete', generatedArtifactId: artifact.generatedArtifactId, createdAt: artifact.createdAt });
    return json(res, 201, envelope(artifact));
  }

  if (req.method === 'GET' && parts[2] === 'generated-artifacts' && parts[4] === 'export') {
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === parts[3]);
    if (!artifact) return notFound(res, 'Generated artifact not found.');
    const evidence = evidenceForIds(artifact.evidenceItemIds || []);
    const evidenceAppendix = evidence.length ? `\n\n## Evidence Appendix\n${evidence.map(ev => `- ${ev.sourceSystemName} / ${ev.sourceRecordType} / ${ev.sourceRecordId}: ${ev.summary}`).join('\n')}` : '';
    return json(res, 200, envelope({ generatedArtifactId: artifact.generatedArtifactId, exportFormat: url.searchParams.get('format') || 'markdown', fileName: `${artifact.generatedArtifactId}.md`, body: `${artifact.body}${evidenceAppendix}`, evidence }));
  }

  if (req.method === 'POST' && parts[2] === 'generated-artifacts' && parts[4] === 'email-handoff') {
    const artifact = store.find('generatedArtifacts', a => a.generatedArtifactId === parts[3]);
    if (!artifact) return notFound(res, 'Generated artifact not found.');
    if (artifact.artifactType !== 'customer_email_draft') return json(res, 400, envelope(null, {}, [{ code: 'validation_error', message: 'Only customer_email_draft artifacts can be prepared for email handoff.', field: 'generatedArtifactId' }]));
    return json(res, 200, envelope({ generatedArtifactId: artifact.generatedArtifactId, status: 'ready_for_review', bodyFormat: 'text', subject: artifact.title, body: artifact.body, guardrails: ['Human approval required before send.', 'Evidence-linked claims only.', 'No direct send is performed by this MVP.'] }));
  }
  if (req.method === 'POST' && parts[2] === 'accounts' && parts[4] === 'assistant' && parts[5] === 'ask') {
    if (!ensureAccount(res, parts[3])) return;
    const body = await parseBody(req);
    const cc = commandCenter(parts[3]);
    const prompt = String(body.message || '').toLowerCase();
    let message = `${cc.account.displayName}: ${cc.health.summary}`;
    if (prompt.includes('call')) message = `Call prep: ${cc.brief.body} Top actions: ${cc.recommendations.map(r => r.title).join('; ') || 'No active recommendations.'}`;
    if (prompt.includes('why')) message = `Health rationale: ${(cc.health.topDrivers || []).join('; ') || cc.health.summary}`;
    if (prompt.includes('next')) message = `Recommended next actions: ${cc.recommendations.map(r => `${r.title} (${r.priority})`).join('; ') || 'No active recommendations.'}`;
    return json(res, 200, envelope({ message, evidence: evidenceForIds(cc.health.evidenceItemIds || []), suggestedActions: ['Generate Account Brief', 'Create PSA Task Stub', 'Generate QBR Draft'] }));
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

async function initializeApp() {
  await store.ensureStore();
  await dataRepository.initialize();
}

module.exports = { createHandler, searchAccounts, commandCenter, revenue, summarizeService, summarizeRmm, summarizeSecurity, latestHealth, envelope, ensureStore: initializeApp };

