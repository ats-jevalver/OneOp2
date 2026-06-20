const assert = require('assert');
const http = require('http');
const { createHandler, ensureStore } = require('../src/app');

function startServer() { return new Promise(resolve => { const server = http.createServer(createHandler()); server.listen(0, () => resolve(server)); }); }
async function request(baseUrl, path, options = {}) { const response = await fetch(`${baseUrl}${path}`, options); const body = await response.json(); return { response, body }; }

(async () => {
  await ensureStore();
  const server = await startServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await request(baseUrl, '/api/v1/admin/store/reset', { method: 'POST' });

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
    assert.equal(result.body.data.health.scoreCategory, 'watch');
    assert.ok(result.body.data.recommendations.length >= 2);
    assert.ok(result.body.data.relationships.summary.stakeholderCount >= 2);
    assert.ok(result.body.data.relationships.recentEngagement.length >= 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/relationships');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.contactCount, 2);
    assert.ok(result.body.data.contacts.some(row => row.stakeholderRole === 'economic_buyer'));
    assert.ok(result.body.data.recentEngagement.some(event => event.eventType === 'qbr'));

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/service');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.openTicketCount, 2);
    assert.equal(result.body.data.summary.slaRiskCount, 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/rmm');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.patchGapCount, 2);
    assert.equal(result.body.data.summary.endOfLifeDeviceCount, 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/security');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.highFindingCount, 1);
    assert.equal(result.body.data.summary.coverageGapCount, 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_greenfield/revenue');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.summary.nextRenewalDate, '2026-07-15');

    result = await request(baseUrl, '/api/v1/accounts/acct_northstar/health-score/latest');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.scoreCategory, 'at_risk');
    assert.ok(result.body.data.evidenceCount >= 2);

    result = await request(baseUrl, '/api/v1/accounts/acct_summit/recommendations?status=new&limit=5');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data[0].recommendationType, 'open_opportunity');

    result = await request(baseUrl, '/api/v1/recommendations/rec_acme_qbr/evidence');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.evidence.length >= 3);

    result = await request(baseUrl, '/api/v1/account-health-scores/health_acme_latest/evidence');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.evidence.some(e => e.evidenceItemId === 'ev_acme_mfa_gap'));

    result = await request(baseUrl, '/api/v1/admin/account-mapping/suggestions?matchStatus=needs_review');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(e => e.accountId === 'acct_riverbend'));

    result = await request(baseUrl, '/api/v1/admin/integrations');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.length >= 3);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync', { method: 'POST' });
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/integrations/status');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.store.provider, 'json');
    assert.ok(result.body.data.integrations.some(i => i.capabilities.includes('create_task')));

    result = await request(baseUrl, '/api/v1/session/current-user');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.userId, 'usr_am_jane');

    result = await request(baseUrl, '/api/v1/session/current-user', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'usr_admin_alex' }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.role, 'admin');

    result = await request(baseUrl, '/api/v1/admin/store/status');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.provider, 'json');

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/configuration');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.providerType, 'mock_psa');
    assert.equal(result.body.meta.secretFieldsReturned, false);
    assert.equal(result.body.data.apiKey, undefined);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/configuration', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ environmentLabel: 'Sprint 7 Smoke Test', baseUrl: 'mock://psa/sprint7', enabledCapabilities: ['company_sync_preview', 'contact_sync_preview', 'create_task'] }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.environmentLabel, 'Sprint 7 Smoke Test');
    assert.equal(result.body.data.updatedByUserId, 'usr_admin_alex');

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/configuration', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerType: 'unsupported_psa' }) });
    assert.equal(result.response.status, 400);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync-preview', { method: 'POST' });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.mode, 'preview');
    assert.ok(result.body.data.counts.total >= 1);
    assert.ok(result.body.data.companies.some(row => row.action === 'conflict'));

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selectedRowIds: ['psa_company_1001', 'psa_company_2001', 'psa_contact_5002'] }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.mode, 'apply_stub');
    assert.equal(result.body.data.counts.applied, 2);
    assert.equal(result.body.data.counts.conflicts, 1);
    assert.ok(result.body.data.conflictRows.some(row => row.rowId === 'psa_company_2001'));

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync-history');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(run => run.mode === 'apply_stub' && run.counts.applied === 2));

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selectedRowIds: 'psa_company_1001' }) });
    assert.equal(result.response.status, 400);

    result = await request(baseUrl, '/api/v1/session/current-user', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'usr_am_jane' }) });
    assert.equal(result.response.status, 200);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/configuration');
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync-preview', { method: 'POST' });
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/admin/integrations/int_psa_demo/sync/apply', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ selectedRowIds: ['psa_company_1001'] }) });
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventType: 'test_event', accountId: 'acct_acme' }) });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.data.eventType, 'test_event');

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/psa/tasks/preview', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId: 'rec_acme_qbr' })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.isValid, true);
    assert.equal(result.body.data.payload.recommendationId, 'rec_acme_qbr');
    assert.equal(result.body.data.payload.externalCompanyId, 'PSA-1001');

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/psa/tasks', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId: 'rec_acme_qbr', confirmed: true })
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.data.status, 'created_stub');

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/write-back-audit-events');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(e => e.recommendationId === 'rec_acme_qbr' && e.adapter === 'mock' && e.requestSummary.externalCompanyId === 'PSA-1001'));

    result = await request(baseUrl, '/api/v1/accounts/acct_riverbend/psa/tasks/preview', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId: 'rec_acme_qbr' })
    });
    assert.equal(result.response.status, 400);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/artifacts/account-brief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    assert.equal(result.response.status, 201);
    const artifactId = result.body.data.generatedArtifactId;
    assert.ok(result.body.data.body.includes('Evidence Appendix'));

    result = await request(baseUrl, `/api/v1/generated-artifacts/${artifactId}`);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.generatedArtifactId, artifactId);

    result = await request(baseUrl, `/api/v1/generated-artifacts/${artifactId}/evidence`);
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.evidence.length >= 1);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/generated-artifacts');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(a => a.generatedArtifactId === artifactId));

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/account-plan');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.accountPlanId, 'plan_acme_2026');
    assert.ok(result.body.data.objectives.length >= 3);
    assert.ok(result.body.data.risks.length >= 2);
    assert.ok(result.body.data.nextSteps.length >= 2);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/account-plan', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'active', planSummary: 'Updated test account plan summary.' }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.planSummary, 'Updated test account plan summary.');

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/account-plan', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ objectives: [{ accountPlanObjectiveId: 'obj_acme_security', status: 'in_progress' }], nextSteps: [{ accountPlanNextStepId: 'step_acme_mfa_plan', status: 'complete' }, { title: 'Prepare executive sponsor follow-up', ownerUserId: 'usr_am_jane', dueDate: '2026-06-30', status: 'open', linkedObjectiveId: 'obj_acme_renewal' }], risks: [{ title: 'Executive sponsor unavailable before QBR', severity: 'medium', status: 'open', mitigation: 'Confirm alternate sponsor.' }] }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.objectives.find(o => o.accountPlanObjectiveId === 'obj_acme_security').status, 'in_progress');
    assert.equal(result.body.data.nextSteps.find(s => s.accountPlanNextStepId === 'step_acme_mfa_plan').status, 'complete');
    assert.ok(result.body.data.nextSteps.some(s => s.title === 'Prepare executive sponsor follow-up'));
    assert.ok(result.body.data.risks.some(r => r.title === 'Executive sponsor unavailable before QBR'));

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/account-plan', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ objectives: [{ accountPlanObjectiveId: 'missing_objective', status: 'complete' }] }) });
    assert.equal(result.response.status, 400);

    result = await request(baseUrl, '/api/v1/portfolio/accounts-at-risk');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(a => a.accountId === 'acct_northstar'));

    result = await request(baseUrl, '/api/v1/portfolio/renewals?days=90');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(a => a.accountId === 'acct_greenfield'));
    assert.ok(result.body.data.some(a => a.accountId === 'acct_acme'));

    result = await request(baseUrl, '/api/v1/portfolio/expansion-candidates');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.some(a => a.accountId === 'acct_summit'));

    result = await request(baseUrl, '/api/v1/admin/account-mapping/ext_riverbend_rmm_suggested/confirm', { method: 'POST' });
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/integrations/psa/status');
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.adapter, 'mock');
    assert.ok(result.body.data.capabilities.includes('create_note'));

    result = await request(baseUrl, '/api/v1/admin/store/status');
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/admin/settings/psa-field-mapping');
    assert.equal(result.response.status, 403);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/artifacts/qbr-draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.data.artifactType, 'qbr_draft');
    const qbrArtifactId = result.body.data.generatedArtifactId;

    result = await request(baseUrl, `/api/v1/generated-artifacts/${qbrArtifactId}/export?format=markdown`);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.exportFormat, 'markdown');
    assert.ok(result.body.data.body.includes('Executive Summary'));
    assert.ok(result.body.data.body.includes('Evidence Appendix'));
    assert.ok(result.body.data.evidence.length >= 1);

    result = await request(baseUrl, `/api/v1/generated-artifacts/${qbrArtifactId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'reviewed', reviewNotes: 'Validated in Sprint 6 smoke test.' }) });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.status, 'reviewed');
    assert.equal(result.body.data.reviewNotes, 'Validated in Sprint 6 smoke test.');

    result = await request(baseUrl, `/api/v1/generated-artifacts/${qbrArtifactId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'published' }) });
    assert.equal(result.response.status, 400);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/artifacts/customer-email-draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recommendationId: 'rec_acme_security_email' }) });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.data.artifactType, 'customer_email_draft');
    const emailArtifactId = result.body.data.generatedArtifactId;

    result = await request(baseUrl, `/api/v1/generated-artifacts/${emailArtifactId}/email-handoff`, { method: 'POST' });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.data.status, 'ready_for_review');
    assert.ok(result.body.data.guardrails.length >= 2);

    const brief = await request(baseUrl, '/api/v1/accounts/acct_acme/artifacts/account-brief', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    const notePreview = await request(baseUrl, '/api/v1/accounts/acct_acme/psa/notes/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ generatedArtifactId: brief.body.data.generatedArtifactId }) });
    assert.equal(notePreview.response.status, 200);
    assert.equal(notePreview.body.data.payload.externalCompanyId, 'PSA-1001');
    const noteCreate = await request(baseUrl, '/api/v1/accounts/acct_acme/psa/notes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ generatedArtifactId: brief.body.data.generatedArtifactId, confirmed: true }) });
    assert.equal(noteCreate.response.status, 201);

    result = await request(baseUrl, '/api/v1/accounts/acct_acme/assistant/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Prepare me for my call' }) });
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.message.includes('Call prep'));

    result = await request(baseUrl, '/api/v1/portfolio/renewals?days=90&ownerUserId=usr_am_jane');
    assert.equal(result.response.status, 200);
    assert.ok(result.body.data.every(row => row.owner.userId === 'usr_am_jane'));

    console.log('All Sprint 7 foundation API smoke tests passed.');
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exit(1); });

