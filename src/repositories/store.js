const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data-store');
const storePath = path.join(dataDir, 'oneop2-store.json');
const providerName = (process.env.ONEOP2_STORE_PROVIDER || 'json').toLowerCase();

const initialState = {
  generatedArtifacts: [],
  writeBackAuditEvents: [],
  activities: [],
  recommendationStatus: {},
  mappingStatus: {},
  settings: {
    currentUserId: 'usr_am_jane',
    psaFieldMapping: {
      defaultTaskType: 'Account Management',
      defaultTaskStatus: 'Open',
      defaultTaskPriority: 'Normal',
      defaultBoard: 'Account Management',
      defaultNoteType: 'Account Note'
    }
  }
};

let state = null;
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function providerInfo() {
  return {
    provider: providerName,
    active: providerName === 'json',
    storePath: providerName === 'json' ? storePath : null,
    message: providerName === 'json'
      ? 'Using local JSON persistence provider.'
      : 'PostgreSQL provider seam is defined but not configured in this dependency-light MVP.'
  };
}
function assertSupportedProvider() {
  if (providerName !== 'json') {
    const required = ['ONEOP2_DATABASE_URL'];
    const missing = required.filter(key => !process.env[key]);
    const suffix = missing.length ? ` Missing: ${missing.join(', ')}.` : '';
    throw new Error(`ONEOP2_STORE_PROVIDER=${providerName} is not active yet. Sprint 5 ships the provider seam and schema while JSON remains the default.${suffix}`);
  }
}
function normalizeState() {
  state.generatedArtifacts ||= [];
  state.writeBackAuditEvents ||= [];
  state.activities ||= [];
  state.recommendationStatus ||= {};
  state.mappingStatus ||= {};
  state.settings ||= clone(initialState.settings);
  state.settings.psaFieldMapping ||= clone(initialState.settings.psaFieldMapping);
}
function ensureStore() {
  assertSupportedProvider();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (process.env.ONEOP2_RESET_STORE === '1' && fs.existsSync(storePath)) fs.rmSync(storePath, { force: true });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, JSON.stringify(initialState, null, 2));
  state = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  normalizeState();
  save();
  return state;
}
function getState() { if (!state) ensureStore(); return state; }
function save() { assertSupportedProvider(); fs.writeFileSync(storePath, JSON.stringify(state, null, 2)); }
function resetStore() { assertSupportedProvider(); state = clone(initialState); if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); save(); return state; }
function add(collection, item) { getState()[collection].push(item); save(); return item; }
function list(collection, predicate = () => true) { return getState()[collection].filter(predicate); }
function find(collection, predicate) { return getState()[collection].find(predicate) || null; }
function setRecommendationStatus(recommendationId, patch) { getState().recommendationStatus[recommendationId] = { ...(getState().recommendationStatus[recommendationId] || {}), ...patch }; save(); return getState().recommendationStatus[recommendationId]; }
function getRecommendationStatus(recommendationId) { return getState().recommendationStatus[recommendationId] || null; }
function setMappingStatus(identityId, patch) { getState().mappingStatus[identityId] = { ...(getState().mappingStatus[identityId] || {}), ...patch }; save(); return getState().mappingStatus[identityId]; }
function getMappingStatus(identityId) { return getState().mappingStatus[identityId] || null; }
function updateSettings(patch) { getState().settings = { ...getState().settings, ...patch }; save(); return getState().settings; }

module.exports = { storePath, providerName, providerInfo, ensureStore, getState, resetStore, add, list, find, setRecommendationStatus, getRecommendationStatus, setMappingStatus, getMappingStatus, updateSettings };
