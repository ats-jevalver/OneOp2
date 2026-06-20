const form = document.getElementById('searchForm');
const query = document.getElementById('query');
const results = document.getElementById('results');
const commandCenter = document.getElementById('commandCenter');
const evidenceDialog = document.getElementById('evidenceDialog');
const evidenceBody = document.getElementById('evidenceBody');
const dialogTitle = document.getElementById('dialogTitle');
const taskDialog = document.getElementById('taskDialog');
const taskBody = document.getElementById('taskBody');
const briefDialog = document.getElementById('briefDialog');
const briefBody = document.getElementById('briefBody');
const systemStatus = document.getElementById('systemStatus');
let currentAccountId = null;
document.getElementById('closeEvidence').addEventListener('click', () => evidenceDialog.close());
document.getElementById('closeTask').addEventListener('click', () => taskDialog.close());
document.getElementById('closeBrief').addEventListener('click', () => briefDialog.close());
document.getElementById('showPortfolio').addEventListener('click', e => { e.preventDefault(); showPortfolio(); });
document.getElementById('showMapping').addEventListener('click', e => { e.preventDefault(); showMapping(); });
document.getElementById('showAdminIntegrations').addEventListener('click', e => { e.preventDefault(); showAdminIntegrations(); });

async function api(path, options) { const response = await fetch(path, options); const json = await response.json(); if (!response.ok) throw new Error(json.errors?.[0]?.message || 'Request failed'); return json.data; }
async function track(eventType, accountId, eventProperties = {}) { try { await api('/api/v1/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType, accountId, eventProperties }) }); } catch {} }
function money(value) { return value == null ? 'Not available' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
function badge(value) { return `<span class="badge ${value}">${String(value || 'unknown').replaceAll('_', ' ')}</span>`; }
function esc(value) { return String(value ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
async function search() { const q = encodeURIComponent(query.value.trim()); results.innerHTML = '<p class="muted">Searching...</p>'; const data = await api(`/api/v1/accounts/search?query=${q}&page=1&pageSize=10`); await track('account_searched', null, { query: query.value.trim(), resultCount: data.length }); if (!data.length) { results.innerHTML = '<p class="muted">No accounts found.</p>'; return; } results.innerHTML = data.map(item => `<div class="result" data-account-id="${item.accountId}"><strong>${item.displayName}</strong><br /><span class="muted">${item.primaryDomain || ''}</span><br />${badge(item.health.category)} <span class="muted">Renewal: ${item.renewal?.renewalDate || 'N/A'}</span></div>`).join(''); for (const node of document.querySelectorAll('.result')) node.addEventListener('click', () => loadAccount(node.dataset.accountId)); }
function renderSummaryCard(title, metrics, details = '') { return `<div class="card"><h3>${title}</h3>${metrics.map(m => `<p><span class="metric">${m.value}</span><br><span class="muted">${m.label}</span></p>`).join('')}${details}</div>`; }
function renderRecommendations(recommendations) { if (!recommendations.length) return '<p class="muted">No active recommendations for this account.</p>'; return recommendations.map(rec => `<div class="recommendation"><div>${badge(rec.priority)} <strong>${rec.title}</strong></div><p>${rec.reason}</p><p class="muted small">Owner: ${rec.suggestedOwner?.displayName || 'Unassigned'} | Due: ${rec.suggestedDueDate || 'N/A'} | Evidence: ${rec.evidenceCount}</p><button class="secondary evidence-btn" data-kind="recommendation" data-id="${rec.recommendationId}">View Evidence</button> <button class="task-btn" data-id="${rec.recommendationId}">Create PSA Task Stub</button></div>`).join(''); }
function renderRelationships(relationships) { if (!relationships) return ''; const contacts = relationships.contacts || []; const gaps = relationships.gaps || []; return `<div class="card full"><h3>Relationships</h3><p><span class="metric">${relationships.summary?.stakeholderCount || 0}</span><br><span class="muted">Mapped stakeholders</span></p><p><span class="metric">${relationships.summary?.relationshipRiskCount || 0}</span><br><span class="muted">Relationship watch items</span></p>${gaps.length ? `<div class="warning"><strong>Relationship gaps:</strong><ul class="clean">${gaps.slice(0,3).map(g => `<li>${esc(g.message)}</li>`).join('')}</ul></div>` : ''}<h4>Key Contacts</h4><ul class="clean">${contacts.slice(0,4).map(row => `<li><strong>${esc(row.contact.fullName)}</strong> - ${esc(row.stakeholderRole)} ${badge(row.relationshipRisk)}<br><span class="muted small">${esc(row.relationshipStrength)} | ${esc(row.sentiment)} | Last touch: ${esc(row.lastTouch?.occurredAt || 'No recent touch')}</span></li>`).join('') || '<li>No relationship data yet.</li>'}</ul><h4>Recent Engagement</h4><ul class="clean">${(relationships.recentEngagement || []).slice(0,3).map(e => `<li>${badge(e.eventType)} ${esc(e.summary)} <span class="muted small">${esc(e.occurredAt)}</span></li>`).join('') || '<li>No engagement events recorded.</li>'}</ul></div>`; }

async function loadSystemStatus() {
  try {
    const [status, user] = await Promise.all([api('/api/v1/integrations/status'), api('/api/v1/session/current-user')]);
    const provider = status.store?.provider || 'unknown';
    const active = status.store?.active ? 'active' : 'not active';
    systemStatus.innerHTML = `<div><strong>Provider:</strong> ${badge(provider)} <span class="muted">${active}</span></div><div><strong>User:</strong> ${esc(user.displayName)} <span class="muted">${esc(user.role)}</span></div><p><button class="secondary" id="beAdmin">Use Admin Demo User</button> <button class="secondary" id="beManager">Use Account Manager</button> <button class="secondary" id="refreshStatus">Refresh</button></p><div id="databaseStatus" class="muted small">Admin database status is available after switching to admin.</div>`;
    document.getElementById('beAdmin').onclick = () => switchUser('usr_admin_alex');
    document.getElementById('beManager').onclick = () => switchUser('usr_am_jane');
    document.getElementById('refreshStatus').onclick = loadSystemStatus;
    if (user.role === 'admin') loadDatabaseStatus().catch(() => {});
  } catch (error) {
    systemStatus.innerHTML = `<p class="warning">Could not load system status: ${esc(error.message)}</p>`;
  }
}
async function switchUser(userId) {
  await api('/api/v1/session/current-user', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId }) });
  await loadSystemStatus();
}
async function loadDatabaseStatus() {
  const db = await api('/api/v1/admin/database/status');
  const node = document.getElementById('databaseStatus');
  if (!node) return;
  node.innerHTML = `<strong>Database:</strong> ${db.connected ? 'connected' : 'not connected'} | Seed valid: ${db.seedValid ? 'yes' : 'no'} | Accounts: ${db.tableCounts?.accounts ?? 'n/a'} | Tickets: ${db.tableCounts?.tickets ?? 'n/a'}`;
}
async function generateArtifact(kind) {
  const artifact = await api(`/api/v1/accounts/${currentAccountId}/artifacts/${kind}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
  if (kind === 'qbr-draft') await api(`/api/v1/generated-artifacts/${artifact.generatedArtifactId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accountPlanObjectiveId: 'obj_acme_renewal' }) });
  const exportLink = `/api/v1/generated-artifacts/${artifact.generatedArtifactId}/export?format=markdown`;
  briefBody.innerHTML = `<p><strong>${artifact.title}</strong></p><textarea class="brief-text" readonly>${artifact.body}</textarea><p><a href="${exportLink}" target="_blank" rel="noreferrer">Open markdown export</a>${artifact.artifactType === 'customer_email_draft' ? ` <button id="emailHandoff">Prepare Email Handoff</button>` : ''}</p><div id="artifactActionResult" class="muted small"></div>`;
  briefDialog.showModal();
  const handoff = document.getElementById('emailHandoff');
  if (handoff) handoff.onclick = async () => { const result = await api(`/api/v1/generated-artifacts/${artifact.generatedArtifactId}/email-handoff`, { method: 'POST' }); document.getElementById('artifactActionResult').textContent = `Ready for review: ${result.subject}`; };
  await loadAccount(currentAccountId);
}
async function openEvidence(kind, id) { dialogTitle.textContent = 'Evidence'; evidenceBody.innerHTML = '<p class="muted">Loading evidence...</p>'; evidenceDialog.showModal(); const path = kind === 'recommendation' ? `/api/v1/recommendations/${id}/evidence` : kind === 'artifact' ? `/api/v1/generated-artifacts/${id}/evidence` : `/api/v1/account-health-scores/${id}/evidence`; const data = await api(path); evidenceBody.innerHTML = `<p>${data.summary || ''}</p>${data.evidence.length ? data.evidence.map(ev => `<div class="evidence"><div>${badge(ev.severity || 'medium')} <strong>${ev.sourceSystemName}</strong></div><p>${ev.summary}</p><p class="muted small">${ev.sourceRecordType} / ${ev.sourceRecordId} / observed ${ev.observedAt}</p></div>`).join('') : '<p class="muted">No evidence records linked.</p>'}`; }
async function createTaskFlow(recommendationId) { const preview = await api(`/api/v1/accounts/${currentAccountId}/psa/tasks/preview`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId }) }); taskBody.innerHTML = `<label>Title<input id="taskTitle" value="${esc(preview.payload.title)}"></label><label>Body<textarea id="taskText">${esc(preview.payload.body)}</textarea></label><p class="warning">${preview.warnings.join(' ')}</p><p class="muted small">Evidence: ${preview.payload.evidenceSummary.join(' | ')}</p><button id="confirmTask">Confirm Stub Task</button>`; taskDialog.showModal(); document.getElementById('confirmTask').onclick = async () => { const created = await api(`/api/v1/accounts/${currentAccountId}/psa/tasks`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId, title: document.getElementById('taskTitle').value, body: document.getElementById('taskText').value, confirmed: true }) }); taskBody.innerHTML = `<p>Created stub PSA task: <strong>${created.externalId}</strong></p><p class="muted">${created.externalUrl}</p>`; await loadAccount(currentAccountId); }; }
async function generateBrief() { const artifact = await api(`/api/v1/accounts/${currentAccountId}/artifacts/account-brief`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) }); briefBody.innerHTML = `<p><strong>${artifact.title}</strong></p><textarea class="brief-text" readonly>${artifact.body}</textarea><p><button id="copyBrief">Copy Brief</button> <button class="secondary evidence-artifact" data-id="${artifact.generatedArtifactId}">View Artifact Evidence</button></p>`; briefDialog.showModal(); document.getElementById('copyBrief').onclick = async () => { await navigator.clipboard.writeText(artifact.body); document.getElementById('copyBrief').textContent = 'Copied'; }; document.querySelector('.evidence-artifact').onclick = () => openEvidence('artifact', artifact.generatedArtifactId); await loadAccount(currentAccountId); }
function renderActivity(items) { if (!items?.length) return '<p class="muted">No generated artifacts or write-back events yet.</p>'; return `<ul class="clean">${items.map(i => `<li><strong>${i.type || i.activityType}</strong>: ${i.title || i.actionType || 'Activity'} <span class="muted small">${i.timestamp || i.createdAt || ''}</span></li>`).join('')}</ul>`; }

async function loadAccountPlan() {
  if (!currentAccountId) return '';
  try {
    const plan = await api(`/api/v1/accounts/${currentAccountId}/account-plan`);
    return `<div class="card full"><h3>Account Plan</h3><p><strong>${esc(plan.planName)}</strong> ${badge(plan.status)}</p><p>${esc(plan.planSummary)}</p><p class="muted small">Owner: ${esc(plan.owner?.displayName || 'Unassigned')} | Review: ${esc(plan.targetReviewDate || 'N/A')}</p><h4>Objectives</h4><ul class="clean">${plan.objectives.map(o => `<li>${badge(o.priority)} ${esc(o.title)} <span class="muted small">${esc(o.status)} | ${esc(o.successMetric || '')}</span>${o.linkedArtifacts?.length ? `<br><span class="muted small">Artifacts: ${o.linkedArtifacts.map(a => esc(a.title)).join(', ')}</span>` : ''}</li>`).join('')}</ul><h4>Risks</h4><ul class="clean">${(plan.risks || []).map(r => `<li>${badge(r.severity)} ${esc(r.title)} <span class="muted small">${esc(r.status || '')}</span></li>`).join('') || '<li>No plan risks recorded.</li>'}</ul><h4>Next Steps</h4><ul class="clean">${(plan.nextSteps || []).map(s => `<li>${badge(s.status)} ${esc(s.title)} <span class="muted small">Owner: ${esc(s.owner?.displayName || s.ownerUserId || 'Unassigned')} | Due: ${esc(s.dueDate || 'N/A')}</span>${s.linkedArtifacts?.length ? `<br><span class="muted small">Artifacts: ${s.linkedArtifacts.map(a => esc(a.title)).join(', ')}</span>` : ''}</li>`).join('') || '<li>No next steps recorded.</li>'}</ul><h4>Stakeholders</h4><ul class="clean">${plan.stakeholders.map(s => `<li><strong>${esc(s.contact?.fullName || s.contactId)}</strong> - ${esc(s.stakeholderRole)} <span class="muted small">${esc(s.relationshipStrength || '')} ${esc(s.sentiment || '')}</span></li>`).join('')}</ul><p><button class="secondary" id="refreshPlanSummary">Mark Plan Reviewed</button> <button class="secondary" id="completeFirstStep">Complete First Next Step</button> <button class="secondary" id="addPlanRisk">Add Demo Risk</button></p></div>`;
  } catch {
    return '';
  }
}
async function loadAccount(accountId) {
  currentAccountId = accountId;
  commandCenter.className = 'command-center';
  commandCenter.innerHTML = '<p class="muted">Loading account intelligence...</p>';
  const data = await api(`/api/v1/accounts/${accountId}/command-center?dateRangePreset=last_90_days`);
  const accountPlanHtml = await loadAccountPlan();
  await track('command_center_loaded', accountId);
  const h = data.header;
  commandCenter.innerHTML = `<div class="header-card"><div><h2>${h.displayName}</h2><div class="muted">${h.primaryDomain} | Owner: ${h.accountOwner?.displayName || 'Unassigned'}</div><div class="muted">Agreement: ${h.agreement?.name || 'N/A'}</div></div><div>${badge(h.health.category)}<div class="muted">Renewal: ${h.renewal?.daysUntilRenewal ?? 'N/A'} days</div><p><button id="generateBrief">Generate Account Brief</button> <button class="secondary" id="generateQbr">Generate QBR Draft</button> <button class="secondary" id="generateEmail">Generate Email Draft</button></p></div></div>${data.warnings.map(w => `<div class="warning"><strong>${w.type.replaceAll('_', ' ')}</strong>: ${w.message}</div>`).join('')}<div class="cards"><div class="card wide"><h3>Health Score</h3>${badge(data.health.scoreCategory)} <span class="metric">${data.health.scoreValue ?? '-'}</span><p>${data.health.summary}</p><ul class="clean">${(data.health.topDrivers || []).map(d => `<li>${d}</li>`).join('')}</ul>${data.health.accountHealthScoreId ? `<button class="secondary evidence-btn" data-kind="health" data-id="${data.health.accountHealthScoreId}">View Health Evidence (${data.health.evidenceCount})</button>` : ''}</div><div class="card"><h3>Account Snapshot</h3><p><strong>Primary contact:</strong> ${data.snapshot.primaryContact?.fullName || 'N/A'}</p><p><strong>MRR:</strong> ${money(data.snapshot.monthlyRecurringRevenue)}</p><p><strong>ARR:</strong> ${money(data.snapshot.annualRecurringRevenue)}</p></div><div class="card"><h3>Renewal Context</h3><p><strong>Date:</strong> ${data.renewal?.renewalDate || 'N/A'}</p><p><strong>Status:</strong> ${data.renewal?.status || 'N/A'}</p><p>${data.renewal?.riskReason || 'No renewal risk reason recorded.'}</p></div>${accountPlanHtml}${renderRelationships(data.relationships)}${renderSummaryCard('Service', [{ label: 'Open tickets', value: data.service.summary.openTicketCount }, { label: 'SLA risk', value: data.service.summary.slaRiskCount }, { label: 'Aging', value: data.service.summary.agingTicketCount }], `<ul class="clean">${data.service.tickets.slice(0,3).map(t => `<li>${badge(t.priority)} ${t.title}</li>`).join('')}</ul>`)}${renderSummaryCard('RMM', [{ label: 'Devices', value: data.rmm.summary.deviceCount }, { label: 'Patch gaps', value: data.rmm.summary.patchGapCount }, { label: 'End-of-life', value: data.rmm.summary.endOfLifeDeviceCount }], `<ul class="clean">${data.rmm.healthSignals.slice(0,3).map(s => `<li>${badge(s.severity)} ${s.summary}</li>`).join('') || '<li>No active RMM signals.</li>'}</ul>`)}${renderSummaryCard('Security', [{ label: 'Open findings', value: data.security.summary.openFindingCount }, { label: 'High', value: data.security.summary.highFindingCount }, { label: 'Coverage gaps', value: data.security.summary.coverageGapCount }], `<ul class="clean">${data.security.findings.slice(0,3).map(f => `<li>${badge(f.severity)} ${f.title}</li>`).join('') || '<li>No active security findings.</li>'}</ul>`)}<div class="card full"><h3>Next Best Actions</h3>${renderRecommendations(data.recommendations)}</div><div class="card full"><h3>Activity Timeline</h3>${renderActivity(data.timeline)}</div><div class="card full"><h3>Data Freshness</h3>${data.dataFreshness.map(f => `<p><strong>${f.systemName}:</strong> ${f.status} ${f.lastSuccessfulSyncAt ? `(${f.lastSuccessfulSyncAt})` : ''}</p>`).join('')}</div></div>`;
  document.getElementById('generateBrief').onclick = generateBrief; document.getElementById('generateQbr').onclick = () => generateArtifact('qbr-draft'); document.getElementById('generateEmail').onclick = () => generateArtifact('customer-email-draft'); const reviewPlan = document.getElementById('refreshPlanSummary'); if (reviewPlan) reviewPlan.onclick = async () => { await api(`/api/v1/accounts/${currentAccountId}/account-plan`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'reviewed' }) }); await loadAccount(currentAccountId); }; const completeStep = document.getElementById('completeFirstStep'); if (completeStep) completeStep.onclick = async () => { await api(`/api/v1/accounts/${currentAccountId}/account-plan`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nextSteps: [{ accountPlanNextStepId: 'step_acme_schedule_qbr', status: 'complete' }] }) }); await loadAccount(currentAccountId); }; const addRisk = document.getElementById('addPlanRisk'); if (addRisk) addRisk.onclick = async () => { await api(`/api/v1/accounts/${currentAccountId}/account-plan`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ risks: [{ title: 'Demo follow-up risk added from UI', severity: 'medium', status: 'open', mitigation: 'Assign owner during next account review.' }] }) }); await loadAccount(currentAccountId); };
  for (const btn of document.querySelectorAll('.evidence-btn')) btn.addEventListener('click', () => openEvidence(btn.dataset.kind, btn.dataset.id));
  for (const btn of document.querySelectorAll('.task-btn')) btn.addEventListener('click', () => createTaskFlow(btn.dataset.id));
}

async function showPortfolio() {
  const [atRisk, renewals, expansion] = await Promise.all([api('/api/v1/portfolio/accounts-at-risk'), api('/api/v1/portfolio/renewals?days=90'), api('/api/v1/portfolio/expansion-candidates')]);
  const section = (title, rows) => `<div class="card"><h3>${title}</h3>${rows.length ? rows.map(r => `<div class="result" data-account-id="${r.accountId}"><strong>${r.displayName}</strong><br>${badge(r.healthCategory)} <span class="muted">${r.recommendedAction || r.reason}</span></div>`).join('') : '<p class="muted">None.</p>'}</div>`;
  commandCenter.className='command-center';
  commandCenter.innerHTML = `<h2>Portfolio Views</h2><div class="cards">${section('At Risk', atRisk)}${section('Renewal Risk / Next 90 Days', renewals)}${section('Expansion Candidates', expansion)}</div>`;
  for (const node of commandCenter.querySelectorAll('.result')) node.onclick = () => loadAccount(node.dataset.accountId);
}
async function showMapping() {
  const rows = await api('/api/v1/admin/account-mapping/suggestions?matchStatus=needs_review');
  commandCenter.className='command-center';
  commandCenter.innerHTML = `<h2>Mapping Admin</h2>${rows.length ? rows.map(r => `<div class="card"><h3>${r.account.displayName}</h3><p>${r.sourceSystemName}: ${r.externalDisplayName}</p><p>Confidence: ${r.matchConfidence}. ${r.matchReason}</p><button class="confirm-map" data-id="${r.accountExternalIdentityId}">Confirm</button> <button class="secondary reject-map" data-id="${r.accountExternalIdentityId}">Reject</button></div>`).join('') : '<p class="muted">No mapping suggestions need review.</p>'}`;
  for (const btn of document.querySelectorAll('.confirm-map')) btn.onclick = async () => { await api(`/api/v1/admin/account-mapping/${btn.dataset.id}/confirm`, { method: 'POST' }); showMapping(); };
  for (const btn of document.querySelectorAll('.reject-map')) btn.onclick = async () => { await api(`/api/v1/admin/account-mapping/${btn.dataset.id}/reject`, { method: 'POST' }); showMapping(); };
}
async function showAdminIntegrations() {
  commandCenter.className = 'command-center';
  commandCenter.innerHTML = '<p class="muted">Loading admin integration settings...</p>';
  try {
    const [status, config, history] = await Promise.all([
      api('/api/v1/integrations/status'),
      api('/api/v1/admin/integrations/int_psa_demo/configuration'),
      api('/api/v1/admin/integrations/int_psa_demo/sync-history')
    ]);
    const psa = status.integrations.find(i => i.integrationConnectionId === 'int_psa_demo');
    commandCenter.innerHTML = `<h2>Admin Integrations</h2><div class="cards"><div class="card"><h3>Provider</h3><p><strong>Store:</strong> ${badge(status.store.provider)} ${esc(status.store.message || '')}</p><p><strong>PSA:</strong> ${esc(psa?.systemName || 'Demo PSA')} ${badge(psa?.status || 'unknown')}</p><p class="muted small">Capabilities: ${(psa?.capabilities || []).map(esc).join(', ')}</p></div><div class="card"><h3>PSA Configuration</h3><label>Environment<input id="psaEnvironment" value="${esc(config.environmentLabel || '')}"></label><label>Base URL<input id="psaBaseUrl" value="${esc(config.baseUrl || '')}"></label><label>Tenant/Company<input id="psaTenant" value="${esc(config.tenantOrCompanyId || '')}"></label><p class="muted small">Secret status: ${esc(config.secretStatus || 'not_configured')}. Secrets are never returned by this UI.</p><button id="savePsaConfig">Save Non-Secret Config</button></div><div class="card full"><h3>Sync Preview / Apply</h3><p><button id="previewPsaSync">Preview PSA Company/Contact Sync</button> <button class="secondary" id="applySafePsaRows" disabled>Apply Safe Selected Rows</button></p><div id="syncPreviewResult" class="muted">Run preview to inspect rows before applying.</div></div><div class="card full"><h3>Sync History</h3><ul class="clean" id="syncHistoryList">${history.length ? history.map(run => `<li><strong>${esc(run.status)}</strong>: applied ${run.counts.applied}, conflicts ${run.counts.conflicts} <span class="muted small">${esc(run.appliedAt)}</span></li>`).join('') : '<li>No Sprint 7 sync apply runs yet.</li>'}</ul></div></div>`;
    document.getElementById('savePsaConfig').onclick = async () => { await api('/api/v1/admin/integrations/int_psa_demo/configuration', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ environmentLabel: document.getElementById('psaEnvironment').value, baseUrl: document.getElementById('psaBaseUrl').value, tenantOrCompanyId: document.getElementById('psaTenant').value }) }); await showAdminIntegrations(); };
    document.getElementById('previewPsaSync').onclick = async () => { const preview = await api('/api/v1/admin/integrations/int_psa_demo/sync-preview', { method: 'POST' }); const safeRows = [...preview.companies, ...preview.contacts].filter(row => row.action !== 'conflict').slice(0, 3).map(row => row.rowId); document.getElementById('applySafePsaRows').dataset.rows = safeRows.join(','); document.getElementById('applySafePsaRows').disabled = false; document.getElementById('syncPreviewResult').innerHTML = `<p><strong>Total:</strong> ${preview.counts.total} | New: ${preview.counts.new} | Matched: ${preview.counts.matched} | Changed: ${preview.counts.changed} | Conflicts: ${preview.counts.conflicts}</p><ul class="clean">${preview.companies.map(row => `<li>${badge(row.action)} ${esc(row.displayName)} <span class="muted small">${esc(row.reason)}</span></li>`).join('')}</ul>`; };
    document.getElementById('applySafePsaRows').onclick = async event => { const selectedRowIds = event.target.dataset.rows.split(',').filter(Boolean); await api('/api/v1/admin/integrations/int_psa_demo/sync/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selectedRowIds }) }); await showAdminIntegrations(); };
  } catch (error) {
    commandCenter.innerHTML = `<h2>Admin Integrations</h2><p class="warning">${esc(error.message)} Switch to the Admin demo user to operate integration settings.</p>`;
  }
}
form.addEventListener('submit', event => { event.preventDefault(); search().catch(err => results.innerHTML = `<p class="warning">${err.message}</p>`); });
track('app_opened');
loadSystemStatus().catch(console.error);
search().catch(console.error);

