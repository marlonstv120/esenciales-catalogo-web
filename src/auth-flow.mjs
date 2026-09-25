const PASSWORD_SETUP_FLOWS = new Set(['invite', 'recovery']);

export function getPasswordSetupFlow(url) {
  const flow = new URLSearchParams(new URL(url).hash.slice(1)).get('type');
  return PASSWORD_SETUP_FLOWS.has(flow) ? flow : null;
}
