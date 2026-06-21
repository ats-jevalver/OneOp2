const SECRET_KEYS_BY_PROVIDER = {
  connectwise_manage: ['ONEOP2_PSA_BASE_URL', 'ONEOP2_PSA_COMPANY_ID', 'ONEOP2_PSA_PUBLIC_KEY', 'ONEOP2_PSA_PRIVATE_KEY'],
  autotask: ['ONEOP2_PSA_BASE_URL', 'ONEOP2_PSA_USERNAME', 'ONEOP2_PSA_SECRET'],
  mock_psa: []
};

const SECRET_ALIASES_BY_PROVIDER = {
  autotask: {
    ONEOP2_PSA_BASE_URL: ['ONEOP2_AUTOTASK_BASE_URL'],
    ONEOP2_PSA_USERNAME: ['ONEOP2_AUTOTASK_USERNAME'],
    ONEOP2_PSA_SECRET: ['ONEOP2_AUTOTASK_SECRET'],
    ONEOP2_AUTOTASK_INTEGRATION_CODE: []
  }
};

function configured(value) { return Boolean(value && String(value).trim()); }
function configuredFromAny(keys, env = process.env) { return keys.some(key => configured(env[key])); }
function secretPresenceForProvider(providerType = 'mock_psa', env = process.env) {
  const keys = SECRET_KEYS_BY_PROVIDER[providerType] || [];
  const aliases = SECRET_ALIASES_BY_PROVIDER[providerType] || {};
  const providerSpecificKeys = Object.keys(aliases).filter(key => !keys.includes(key));
  const allKeys = [...keys, ...providerSpecificKeys];
  const presence = Object.fromEntries(allKeys.map(key => [key, configuredFromAny([key, ...(aliases[key] || [])], env)]));
  const aliasPresence = Object.fromEntries(Object.entries(aliases).map(([key, aliasKeys]) => [key, Object.fromEntries(aliasKeys.map(alias => [alias, configured(env[alias])]))]));
  return {
    providerType,
    requiredKeys: keys,
    optionalKeys: providerSpecificKeys,
    presence,
    aliasPresence,
    configured: keys.length === 0 || keys.every(key => presence[key]),
    missingKeys: keys.filter(key => !presence[key])
  };
}
function safeBaseUrlConfigured(config = {}, env = process.env, providerType = config.providerType || 'mock_psa') {
  const baseUrlKeys = providerType === 'autotask' ? ['ONEOP2_PSA_BASE_URL', 'ONEOP2_AUTOTASK_BASE_URL'] : ['ONEOP2_PSA_BASE_URL'];
  return configured(config.baseUrl) || configuredFromAny(baseUrlKeys, env);
}
function configCompleteness(config = {}, env = process.env) {
  const providerType = config.providerType || 'mock_psa';
  const secretStatus = secretPresenceForProvider(providerType, env);
  const hasBaseUrl = providerType === 'mock_psa' ? Boolean(config.baseUrl) : safeBaseUrlConfigured(config, env, providerType);
  const hasTenantOrCompanyId = providerType === 'mock_psa'
    ? Boolean(config.tenantOrCompanyId)
    : providerType === 'connectwise_manage'
      ? Boolean(config.tenantOrCompanyId || env.ONEOP2_PSA_COMPANY_ID)
      : true;
  return {
    providerType,
    hasBaseUrl,
    hasTenantOrCompanyId,
    secrets: secretStatus,
    complete: providerType === 'mock_psa' || (hasBaseUrl && hasTenantOrCompanyId && secretStatus.configured)
  };
}

module.exports = { SECRET_KEYS_BY_PROVIDER, SECRET_ALIASES_BY_PROVIDER, secretPresenceForProvider, configCompleteness };
