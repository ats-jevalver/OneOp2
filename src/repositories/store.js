const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data-store');
const storePath = path.join(dataDir, 'oneop2-store.json');
const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
const providerName = (process.env.ONEOP2_STORE_PROVIDER || 'json').toLowerCase();
const postgresStateKey = 'oneop2_runtime_state';

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
let pgPool = null;
let savePromise = Promise.resolve();
let lastProviderError = null;
let initialized = false;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function normalizeState() {
  state.generatedArtifacts ||= [];
  state.writeBackAuditEvents ||= [];
  state.activities ||= [];
  state.recommendationStatus ||= {};
  state.mappingStatus ||= {};
  state.settings ||= clone(initialState.settings);
  state.settings.psaFieldMapping ||= clone(initialState.settings.psaFieldMapping);
}
function providerInfo() {
  return {
    provider: providerName,
    active: initialized,
    storePath: providerName === 'json' ? storePath : null,
    databaseConfigured: providerName === 'postgres' ? Boolean(process.env.ONEOP2_DATABASE_URL) : false,
    stateKey: providerName === 'postgres' ? postgresStateKey : null,
    lastError: lastProviderError,
    message: providerName === 'json'
      ? 'Using local JSON persistence provider.'
      : initialized
        ? 'Using PostgreSQL persistence provider for OneOp2 runtime state.'
        : 'PostgreSQL provider selected but not initialized yet.'
  };
}
function assertKnownProvider() {
  if (!['json', 'postgres'].includes(providerName)) throw new Error(`Unsupported ONEOP2_STORE_PROVIDER=${providerName}. Use json or postgres.`);
}
function getPgPool() {
  if (!process.env.ONEOP2_DATABASE_URL) throw new Error('ONEOP2_DATABASE_URL is required when ONEOP2_STORE_PROVIDER=postgres.');
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: process.env.ONEOP2_DATABASE_URL });
  }
  return pgPool;
}
async function ensurePostgresStore() {
  const pool = getPgPool();
  if (fs.existsSync(schemaPath)) await pool.query(fs.readFileSync(schemaPath, 'utf8'));
  await pool.query('create table if not exists app_settings (setting_key text primary key, setting_value jsonb not null, updated_at timestamptz not null default now())');
  const existing = await pool.query('select setting_value from app_settings where setting_key = $1', [postgresStateKey]);
  if (process.env.ONEOP2_RESET_STORE === '1' || existing.rowCount === 0) {
    state = clone(initialState);
    normalizeState();
    await pool.query(
      `insert into app_settings (setting_key, setting_value, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (setting_key) do update set setting_value = excluded.setting_value, updated_at = now()`,
      [postgresStateKey, JSON.stringify(state)]
    );
  } else {
    state = existing.rows[0].setting_value;
    normalizeState();
  }
}
function ensureJsonStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (process.env.ONEOP2_RESET_STORE === '1' && fs.existsSync(storePath)) fs.rmSync(storePath, { force: true });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, JSON.stringify(initialState, null, 2));
  state = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  normalizeState();
  fs.writeFileSync(storePath, JSON.stringify(state, null, 2));
}
async function ensureStore() {
  assertKnownProvider();
  if (initialized && state) return state;
  try {
    if (providerName === 'postgres') await ensurePostgresStore(); else ensureJsonStore();
    initialized = true;
    lastProviderError = null;
    return state;
  } catch (error) {
    lastProviderError = error.message;
    initialized = false;
    throw error;
  }
}
function getState() { if (!state) throw new Error('Store is not initialized. Call ensureStore() before using store state.'); return state; }
function saveJson() { fs.writeFileSync(storePath, JSON.stringify(state, null, 2)); }
async function savePostgres() {
  const pool = getPgPool();
  await pool.query(
    `insert into app_settings (setting_key, setting_value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (setting_key) do update set setting_value = excluded.setting_value, updated_at = now()`,
    [postgresStateKey, JSON.stringify(state)]
  );
}
function save() {
  if (!state) return Promise.resolve();
  if (providerName === 'json') { saveJson(); return Promise.resolve(); }
  savePromise = savePromise.then(() => savePostgres()).catch(error => { lastProviderError = error.message; throw error; });
  return savePromise;
}
async function flush() { await savePromise; }
function resetStore() { state = clone(initialState); normalizeState(); return save().then(() => state); }
function add(collection, item) { getState()[collection].push(item); save(); return item; }
function list(collection, predicate = () => true) { return getState()[collection].filter(predicate); }
function find(collection, predicate) { return getState()[collection].find(predicate) || null; }
function setRecommendationStatus(recommendationId, patch) { getState().recommendationStatus[recommendationId] = { ...(getState().recommendationStatus[recommendationId] || {}), ...patch }; save(); return getState().recommendationStatus[recommendationId]; }
function getRecommendationStatus(recommendationId) { return getState().recommendationStatus[recommendationId] || null; }
function setMappingStatus(identityId, patch) { getState().mappingStatus[identityId] = { ...(getState().mappingStatus[identityId] || {}), ...patch }; save(); return getState().mappingStatus[identityId]; }
function getMappingStatus(identityId) { return getState().mappingStatus[identityId] || null; }
function updateSettings(patch) { getState().settings = { ...getState().settings, ...patch }; save(); return getState().settings; }
async function close() { await flush(); if (pgPool) await pgPool.end(); }

module.exports = { storePath, providerName, providerInfo, ensureStore, getState, resetStore, add, list, find, flush, close, setRecommendationStatus, getRecommendationStatus, setMappingStatus, getMappingStatus, updateSettings };
