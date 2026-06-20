function createSessionProvider({ users, store }) {
  function byId(userId) { return users().find(user => user.userId === userId) || null; }
  function metadata() {
    return {
      authProvider: 'local_demo',
      authMode: 'local_demo',
      localDemoOnly: true,
      unsafeForProduction: true,
      message: 'Local demo session provider. User switching is for development only and must be replaced before production.'
    };
  }
  function currentUser() { return byId(store.getState().settings.currentUserId) || byId('usr_am_jane'); }
  function currentUserEnvelope() { return { ...currentUser(), auth: metadata() }; }
  function canWriteBack() { return ['admin','account_manager','sales_rep','service_manager','security_lead','executive'].includes(currentUser()?.role); }
  function canAdmin() { return currentUser()?.role === 'admin'; }
  async function switchCurrentUser(userId) {
    const user = byId(userId);
    if (!user) return { user: null, metadata: metadata() };
    const settings = store.getState().settings;
    store.updateSettings({ ...settings, currentUserId: user.userId });
    await store.flush();
    return { user, metadata: metadata() };
  }
  return { mode: 'local_demo', metadata, currentUser, currentUserEnvelope, canWriteBack, canAdmin, switchCurrentUser };
}

module.exports = { createSessionProvider };