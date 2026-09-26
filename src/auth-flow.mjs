const PASSWORD_SETUP_FLOWS = new Set(['invite', 'recovery']);

export function getPasswordSetupFlow(url) {
  const flow = new URLSearchParams(new URL(url).hash.slice(1)).get('type');
  return PASSWORD_SETUP_FLOWS.has(flow) ? flow : null;
}

export function shouldShowPasswordUpdate(event, url) {
  return event === 'PASSWORD_RECOVERY' || Boolean(getPasswordSetupFlow(url));
}

export function shouldRenderPasswordUpdate(
  event,
  url,
  passwordUpdateActive = false,
) {
  return !passwordUpdateActive && shouldShowPasswordUpdate(event, url);
}

export function getPostPasswordUpdateView(authorized) {
  return authorized ? 'authorized' : 'sign-in';
}
