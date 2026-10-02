/// <reference types="vite/client" />
import { createClient, type User } from "@supabase/supabase-js";

export type MockMateUser = { email: string; displayName: string };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
export const supabaseAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The public anon key is intended for browser use. Never place a service role/secret key here.
const supabase = supabaseAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.sessionStorage, flowType: "pkce" },
    })
  : null;

function userProfile(user: User): MockMateUser {
  return { email: user.email ?? "", displayName: String(user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? "Student") };
}

function readableAuthError(message = "") {
  const code = message.toLowerCase();
  if (code.includes("invalid login credentials")) return "Email or password is incorrect. Check both and try again.";
  if (code.includes("email not confirmed")) return "Verify your email using the link we sent, then sign in again.";
  if (code.includes("user already registered") || code.includes("already been registered")) return "An account already uses this email. Try signing in instead.";
  if (code.includes("password should be at least")) return "Choose a password with at least 6 characters.";
  if (code.includes("invalid email")) return "Enter a valid email address.";
  if (code.includes("rate limit") || code.includes("too many requests")) return "Too many attempts right now. Wait a few minutes, then try again.";
  if (code.includes("failed to fetch") || code.includes("network")) return "Could not reach Supabase. Check your internet and project URL, then try again.";
  if (code.includes("expired") || code.includes("invalid token") || code.includes("otp")) return "That email link has expired or was already used. Request a new link and try again.";
  if (code.includes("not configured")) return "Supabase sign-in needs setup. Add the Supabase Project URL and public anon key to .env.local, then restart the server.";
  return "Supabase could not complete that request. Check your email, password, and Auth settings, then try again.";
}

function requiredClient() {
  if (!supabase) throw new Error("Supabase sign-in is not configured.");
  return supabase;
}

export async function checkSupabaseAuthConfigured() {
  return supabaseAuthConfigured;
}

export function onSupabaseAuthChange(callback: (event: string) => void) {
  return supabase?.auth.onAuthStateChange((event) => callback(event)).data.subscription;
}

export async function createAccount(email: string, password: string, displayName: string) {
  const client = requiredClient();
  const { data, error } = await client.auth.signUp({
    email: email.trim(), password,
    options: { data: { display_name: displayName.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(readableAuthError(error.message));
  // Supabase returns no session when email confirmation is enabled.
  if (!data.session || !data.user?.email_confirmed_at) return null;
  return userProfile(data.user);
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requiredClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(readableAuthError(error.message));
  if (!data.user.email_confirmed_at) {
    await requiredClient().auth.signOut();
    throw new Error("Verify your email using the link we sent, then sign in again.");
  }
  return userProfile(data.user);
}

export async function updateDisplayName(displayName: string) {
  const { data, error } = await requiredClient().auth.updateUser({ data: { display_name: displayName.trim() } });
  if (error) throw new Error(readableAuthError(error.message));
  return data.user ? userProfile(data.user) : { email: "", displayName: displayName.trim() };
}

export async function updatePassword(password: string) {
  const { error } = await requiredClient().auth.updateUser({ password });
  if (error) throw new Error(readableAuthError(error.message));
}

export async function sendPasswordReset(email: string) {
  const { error } = await requiredClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
  if (error) throw new Error(readableAuthError(error.message));
}

export async function clearSupabaseSession() {
  if (supabase) await supabase.auth.signOut().catch(() => undefined);
}

export async function getSupabaseAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function restoreSupabaseSession(): Promise<MockMateUser | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  // Fetch from Auth so the app checks the current server-side user/confirmation state.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email_confirmed_at) {
    await supabase.auth.signOut().catch(() => undefined);
    return null;
  }
  return userProfile(data.user);
}
