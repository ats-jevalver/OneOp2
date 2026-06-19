const form = document.getElementById('searchForm');
const query = document.getElementById('query');
const results = document.getElementById('results');
const commandCenter = document.getElementById('commandCenter');
const evidenceDialog = document.getElementById('evidenceDialog');
const evidenceBody = document.getElementById('evidenceBody');
document.getElementById('closeEvidence').addEventListener('click', () => evidenceDialog.close());

async function api(path, options) {
  const response = await fetch(path, options);
  const json = await response.json();
  if (!response.ok) throw new Error(json.errors?.[0]?.message || 'Request failed');
  return json.data;
}
async function track(eventType, accountId, eventProperties = {}) {
  try { await api('/api/v1/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType, accountId, eventProperties }) }); } catch {}
}
function money(value) { return value == null ? 'Not available' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
function badge(value) { return `<span class="badge ${value}">${String(value || 'unknown').replaceAll('_', ' ')}</span>`; }

async function search() {
  const q = encodeURIComponent(query.value.trim());
  results.innerHTML = '<p class="muted">Searching...</p>';
  const data = await api(`/api/v1/accounts/search?query=${q}&page=1&pageSize=10`);
  await track('account_searched', null, { query: query.value.trim(), resultCount: data.length });
  if (!data.length) { results.innerHTML = '<p class="muted">No accounts found.</p>'; return; }
  results.innerHTML = data.map(item => `<div class="result" data-account-id="${item.accountId}"><strong>${item.displayName}</strong><br /><span class="muted">${item.primaryDomain || ''}</span><br />${badge(item.health.category)} <span class="muted">Renewal: ${item.renewal?.renewalDate || 'N/A'}</span></div>`).join('');
  for (const node of document.querySelectorAll('.result')) node.addEventListener('click', () => loadAccount(node.dataset.accountId));
}

function renderSummaryCard(title, metrics, details = '') {
  return `<div class="card"><h3>${title}</h3>${metrics.map(m => `<p><span class="metric">${m.value}</span><br><span class="muted">${m.label}</span></p>`).join('')}${details}</div>`;
}

function renderRecommendations(recommendations) {
  if (!recommendations.length) return '<p class="muted">No active recommendations for this account.</p>';
  return recommendations.map(rec => `<div class="recommendation"><div>${badge(rec.priority)} <strong>${rec.title}</strong></div><p>${rec.reason}</p><p class="muted small">Owner: ${rec.suggestedOwner?.displayName || 'Unassigned'} | Due: ${rec.suggestedDueDate || 'N/A'} | Evidence: ${rec.evidenceCount}</p><button class="secondary evidence-btn" data-kind="recommendation" data-id="${rec.recommendationId}">View Evidence</button> <button class="secondary" disabled>Create PSA Task (Sprint 3)</button></div>`).join('');
}

async function openEvidence(kind, id) {
  evidenceBody.innerHTML = '<p class="muted">Loading evidence...</p>';
  evidenceDialog.showModal();
  const path = kind === 'recommendation' ? `/api/v1/recommendations/${id}/evidence` : `/api/v1/account-health-scores/${id}/evidence`;
  const data = await api(path);
  evidenceBody.innerHTML = `<p>${data.summary}</p>${data.evidence.length ? data.evidence.map(ev => `<div class="evidence"><div>${badge(ev.severity || 'medium')} <strong>${ev.sourceSystemName}</strong></div><p>${ev.summary}</p><p class="muted small">${ev.sourceRecordType} / ${ev.sourceRecordId} / observed ${ev.observedAt}</p></div>`).join('') : '<p class="muted">No evidence records linked.</p>'}`;
}

async function loadAccount(accountId) {
  commandCenter.className = 'command-center';
  commandCenter.innerHTML = '<p class="muted">Loading account intelligence...</p>';
  const data = await api(`/api/v1/accounts/${accountId}/command-center?dateRangePreset=last_90_days`);
  await track('command_center_loaded', accountId);
  const h = data.header;
  commandCenter.innerHTML = `
    <div class="header-card"><div><h2>${h.displayName}</h2><div class="muted">${h.primaryDomain} | Owner: ${h.accountOwner?.displayName || 'Unassigned'}</div><div class="muted">Agreement: ${h.agreement?.name || 'N/A'}</div></div><div>${badge(h.health.category)}<div class="muted">Renewal: ${h.renewal?.daysUntilRenewal ?? 'N/A'} days</div></div></div>
    ${data.warnings.map(w => `<div class="warning"><strong>${w.type.replaceAll('_', ' ')}</strong>: ${w.message}</div>`).join('')}
    <div class="cards">
      <div class="card wide"><h3>Health Score</h3>${badge(data.health.scoreCategory)} <span class="metric">${data.health.scoreValue ?? '-'}</span><p>${data.health.summary}</p><ul class="clean">${(data.health.topDrivers || []).map(d => `<li>${d}</li>`).join('')}</ul>${data.health.accountHealthScoreId ? `<button class="secondary evidence-btn" data-kind="health" data-id="${data.health.accountHealthScoreId}">View Health Evidence (${data.health.evidenceCount})</button>` : ''}</div>
      <div class="card"><h3>Account Snapshot</h3><p><strong>Primary contact:</strong> ${data.snapshot.primaryContact?.fullName || 'N/A'}</p><p><strong>MRR:</strong> ${money(data.snapshot.monthlyRecurringRevenue)}</p><p><strong>ARR:</strong> ${money(data.snapshot.annualRecurringRevenue)}</p></div>
      <div class="card"><h3>Renewal Context</h3><p><strong>Date:</strong> ${data.renewal?.renewalDate || 'N/A'}</p><p><strong>Status:</strong> ${data.renewal?.status || 'N/A'}</p><p>${data.renewal?.riskReason || 'No renewal risk reason recorded.'}</p></div>
      ${renderSummaryCard('Service', [{ label: 'Open tickets', value: data.service.summary.openTicketCount }, { label: 'SLA risk', value: data.service.summary.slaRiskCount }, { label: 'Aging', value: data.service.summary.agingTicketCount }], `<ul class="clean">${data.service.tickets.slice(0,3).map(t => `<li>${badge(t.priority)} ${t.title}</li>`).join('')}</ul>`)}
      ${renderSummaryCard('RMM', [{ label: 'Devices', value: data.rmm.summary.deviceCount }, { label: 'Patch gaps', value: data.rmm.summary.patchGapCount }, { label: 'End-of-life', value: data.rmm.summary.endOfLifeDeviceCount }], `<ul class="clean">${data.rmm.healthSignals.slice(0,3).map(s => `<li>${badge(s.severity)} ${s.summary}</li>`).join('') || '<li>No active RMM signals.</li>'}</ul>`)}
      ${renderSummaryCard('Security', [{ label: 'Open findings', value: data.security.summary.openFindingCount }, { label: 'High', value: data.security.summary.highFindingCount }, { label: 'Coverage gaps', value: data.security.summary.coverageGapCount }], `<ul class="clean">${data.security.findings.slice(0,3).map(f => `<li>${badge(f.severity)} ${f.title}</li>`).join('') || '<li>No active security findings.</li>'}</ul>`)}
      <div class="card full"><h3>Next Best Actions</h3>${renderRecommendations(data.recommendations)}</div>
      <div class="card full"><h3>Data Freshness</h3>${data.dataFreshness.map(f => `<p><strong>${f.systemName}:</strong> ${f.status} ${f.lastSuccessfulSyncAt ? `(${f.lastSuccessfulSyncAt})` : ''}</p>`).join('')}</div>
    </div>`;
  for (const btn of document.querySelectorAll('.evidence-btn')) btn.addEventListener('click', () => openEvidence(btn.dataset.kind, btn.dataset.id).catch(err => evidenceBody.innerHTML = `<p class="warning">${err.message}</p>`));
}

form.addEventListener('submit', event => { event.preventDefault(); search().catch(err => results.innerHTML = `<p class="warning">${err.message}</p>`); });
track('app_opened');
search().catch(console.error);
