const { spawnSync } = require('child_process');

function parseMajor(version) {
  return Number(String(version || '').replace(/^v/, '').split('.')[0] || 0);
}
function redact(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.password) url.password = '***';
    if (url.username) url.username = '***';
    return url.toString();
  } catch {
    return '[configured-redacted]';
  }
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32', ...options });
  return { command: `${command} ${args.join(' ')}`, status: result.status, ok: result.status === 0, stdout: result.stdout?.trim() || '', stderr: result.stderr?.trim() || '' };
}
async function checkPostgres() {
  if (!process.env.ONEOP2_DATABASE_URL) {
    return { configured: false, connected: false, message: 'ONEOP2_DATABASE_URL is not set. PostgreSQL validation will be skipped.', redactedConnection: null };
  }
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.ONEOP2_DATABASE_URL });
    const result = await pool.query('select 1 as ok');
    await pool.end();
    return { configured: true, connected: result.rows[0]?.ok === 1, message: 'PostgreSQL connection succeeded.', redactedConnection: redact(process.env.ONEOP2_DATABASE_URL) };
  } catch (error) {
    return { configured: true, connected: false, message: error.message, redactedConnection: redact(process.env.ONEOP2_DATABASE_URL) };
  }
}
async function main() {
  const nodeMajor = parseMajor(process.version);
  const packageInstall = run('node', ['-e', "require('pg'); require('./src/app'); console.log('ok')"]);
  const npmTest = run('npm', ['test']);
  const uiTest = run('npm', ['run', 'test:ui']);
  const postgres = await checkPostgres();
  let postgresTest = null;
  if (postgres.configured) postgresTest = run('npm', ['run', 'test:postgres']);

  const checks = {
    node: { version: process.version, requiredMajor: 20, ok: nodeMajor >= 20 },
    packageInstall: { ok: packageInstall.ok, message: packageInstall.ok ? 'Dependencies and app modules load.' : packageInstall.stderr || packageInstall.stdout },
    storeProvider: { selected: process.env.ONEOP2_STORE_PROVIDER || 'json', ok: ['json', 'postgres', undefined].includes(process.env.ONEOP2_STORE_PROVIDER || undefined) || ['json', 'postgres'].includes(process.env.ONEOP2_STORE_PROVIDER || 'json') },
    postgres,
    tests: { npmTest: { ok: npmTest.ok, status: npmTest.status }, uiTest: { ok: uiTest.ok, status: uiTest.status }, postgresTest: postgresTest ? { ok: postgresTest.ok, status: postgresTest.status } : { ok: true, skipped: true, message: 'Skipped because ONEOP2_DATABASE_URL is not set.' } }
  };
  const ok = checks.node.ok && checks.packageInstall.ok && checks.storeProvider.ok && npmTest.ok && uiTest.ok && (!postgresTest || postgresTest.ok) && (!postgres.configured || postgres.connected);
  const summary = {
    ok,
    generatedAt: new Date().toISOString(),
    checks,
    recommendations: []
  };
  if (!checks.node.ok) summary.recommendations.push('Install Node.js 20 or newer.');
  if (!checks.packageInstall.ok) summary.recommendations.push('Run npm install and inspect module load errors.');
  if (!postgres.configured) summary.recommendations.push('Set ONEOP2_DATABASE_URL to validate PostgreSQL-backed pilot mode.');
  if (postgres.configured && !postgres.connected) summary.recommendations.push('Verify PostgreSQL is running and the redacted ONEOP2_DATABASE_URL points to the OneOp2 database.');
  if (!npmTest.ok) summary.recommendations.push('Fix failing JSON-mode smoke tests before pilot demo.');
  if (!uiTest.ok) summary.recommendations.push('Fix failing public UI syntax/readiness checks before pilot demo.');
  if (postgresTest && !postgresTest.ok) summary.recommendations.push('Fix failing PostgreSQL read smoke tests before PostgreSQL pilot demo.');

  console.log(JSON.stringify(summary, null, 2));
  if (!ok) process.exit(1);
}
main().catch(error => { console.error(JSON.stringify({ ok: false, error: error.message }, null, 2)); process.exit(1); });
