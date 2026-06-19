const assert = require('assert');
const { spawnSync } = require('child_process');

const result = spawnSync(process.execPath, ['-e', "const store=require('./src/repositories/store'); store.ensureStore().then(()=>process.exit(0)).catch(err=>{ console.error(err.message); process.exit(7); });"], {
  cwd: process.cwd(),
  env: { ...process.env, ONEOP2_STORE_PROVIDER: 'postgres', ONEOP2_DATABASE_URL: '' },
  encoding: 'utf8'
});

assert.equal(result.status, 7);
assert.ok(result.stderr.includes('ONEOP2_DATABASE_URL is required'));
console.log('Store provider diagnostics test passed.');
