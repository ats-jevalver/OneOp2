const form = document.getElementById('searchForm');
const query = document.getElementById('query');
const results = document.getElementById('results');
const commandCenter = document.getElementById('commandCenter');

async function api(path, options) {
  const response = await fetch(path, options);
  const json = await response.json();
  if (!response.ok) throw new Error(json.errors?.[0]?.message || 'Request failed');
  return json.data;
}

async function track(eventType, accountId, eventProperties = {}) {
  try {
    await api('/api/v1/product-events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType, accountId, eventProperties })
    });
  } catch { /* best-effort analytics */ }
}

function money(value) {
  if (value == null) return 'Not available';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

async function search() {
  const q = encodeURIComponent(query.value.trim());
  results.innerHTML = '<p class="muted">Searching...</p>';
  const data = await api(`/api/v1/accounts/search?query=${q}&page=1&pageSize=10`);
  await track('account_searched', null, { query: query.value.trim(), resultCount: data.length });
  if (!data.length) {
    results.innerHTML = '<p class="muted">No accounts found.</p>';
    return;
  }
  results.innerHTML = data.map(item => `
    <div class="result" data-account-id="${item.accountId}">
      <strong>${item.displayName}</strong><br />
      <span class="muted">${item.primaryDomain || ''}</span><br />
      <span class="badge ${item.health.category}">${item.health.category.replace('_', ' ')}</span>
      <span class="muted">Renewal: ${item.renewal?.renewalDate || 'N/A'}</span>
    </div>
  `).join('');
  for (const node of document.querySelectorAll('.result')) {
    node.addEventListener('click', () => loadAccount(node.dataset.accountId));
  }
}

async function loadAccount(accountId) {
  commandCenter.className = 'command-center';
  commandCenter.innerHTML = '<p class="muted">Loading account...</p>';
  const data = await api(`/api/v1/accounts/${accountId}/command-center?dateRangePreset=last_90_days`);
  await track('command_center_loaded', accountId);
  const h = data.header;
  commandCenter.innerHTML = `
    <div class="header-card">
      <div>
        <h2>${h.displayName}</h2>
        <div class="muted">${h.primaryDomain} | Owner: ${h.accountOwner?.displayName || 'Unassigned'}</div>
        <div class="muted">Agreement: ${h.agreement?.name || 'N/A'}</div>
      </div>
      <div>
        <span class="badge ${h.health.category}">${h.health.category.replace('_', ' ')}</span>
        <div class="muted">Renewal: ${h.renewal?.daysUntilRenewal ?? 'N/A'} days</div>
      </div>
    </div>
    ${data.warnings.map(w => `<div class="warning"><strong>${w.type.replace('_', ' ')}</strong>: ${w.message}</div>`).join('')}
    <div class="cards">
      <div class="card"><h3>Account Snapshot</h3><p><strong>Primary contact:</strong> ${data.snapshot.primaryContact?.fullName || 'N/A'}</p><p><strong>MRR:</strong> ${money(data.snapshot.monthlyRecurringRevenue)}</p><p><strong>ARR:</strong> ${money(data.snapshot.annualRecurringRevenue)}</p></div>
      <div class="card"><h3>Renewal Context</h3><p><strong>Date:</strong> ${data.renewal?.renewalDate || 'N/A'}</p><p><strong>Status:</strong> ${data.renewal?.status || 'N/A'}</p><p>${data.renewal?.riskReason || 'No renewal risk reason recorded.'}</p></div>
      <div class="card"><h3>Data Freshness</h3>${data.dataFreshness.map(f => `<p><strong>${f.systemName}:</strong> ${f.status} ${f.lastSuccessfulSyncAt ? `(${f.lastSuccessfulSyncAt})` : ''}</p>`).join('')}</div>
      <div class="card"><h3>Buffaly Brief Placeholder</h3><p>${data.brief.body}</p></div>
    </div>
  `;
}

form.addEventListener('submit', event => { event.preventDefault(); search().catch(err => results.innerHTML = `<p class="warning">${err.message}</p>`); });
track('app_opened');
search().catch(console.error);
