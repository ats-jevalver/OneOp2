const SECRET_KEYS_BY_PROVIDER = {
  connectwise_manage: ['ONEOP2_PSA_BASE_URL', 'ONEOP2_PSA_COMPANY_ID', 'ONEOP2_PSA_PUBLIC_KEY', 'ONEOP2_PSA_PRIVATE_KEY'],
  autotask: ['ONEOP2_PSA_BASE_URL', 'ONEOP2_PSA_USERNAME', 'ONEOP2_PSA_SECRET'],
  mock_psa: []
};

function configured(value) { return Boolean(value && String(value).trim()); }
function secretPresenceForProvider(providerType = 'mock_psa', env = process.env) {
  const keys = SECRET_KEYS_BY_PROVIDER[providerType] || [];
  const presence = Object.fromEntries(keys.map(key => [key, configured(env[key])]));
  return {
    providerType,
    requiredKeys: keys,
    presence,
    configured: keys.length === 0 || keys.every(key => presence[key]),
    missingKeys: keys.filter(key => !presence[key])
  };
}
function safeBaseUrlConfigured(config = {}, env = process.env) { return configured(config.baseUrl) || configured(env.ONEOP2_PSA_BASE_URL); }
function configCompleteness(config = {}, env = process.env) {
  const providerType = config.providerType || 'mock_psa';
  const secretStatus = secretPresenceForProvider(providerType, env);
  return {
    providerType,
    hasBaseUrl: providerType === 'mock_psa' ? Boolean(config.baseUrl) : safeBaseUrlConfigured(config, env),
    hasTenantOrCompanyId: providerType === 'mock_psa' ? Boolean(config.tenantOrCompanyId) : Boolean(config.tenantOrCompanyId || env.ONEOP2_PSA_COMPANY_ID),
    secrets: secretStatus,
    complete: providerType === 'mock_psa' || (safeBaseUrlConfigured(config, env) && secretStatus.configured)
  };
}

module.exports = { SECRET_KEYS_BY_PROVIDER, secretPresenceForProvider, configCompleteness };