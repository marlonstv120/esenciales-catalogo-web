import { supabase } from './supabase.js';

export async function getAuthorizedSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) return { session: null, authorized: false };

  const { data: authorized, error: authorizationError } = await supabase.rpc(
    'es_administrador_activo',
  );

  if (authorizationError || !authorized) await supabase.auth.signOut();

  return {
    session: authorized ? session : null,
    authorized: Boolean(authorized),
  };
}

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

export function requestPasswordRecovery(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
}

export function updatePassword(password) {
  return supabase.auth.updateUser({ password });
}

export function observeSession(listener) {
  const { data } = supabase.auth.onAuthStateChange(listener);
  return () => data.subscription.unsubscribe();
}
