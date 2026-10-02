import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_PROJECT_REF')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Returns a stable unique User ID:
 * 1. Supabase Auth user ID if logged in.
 * 2. Or persistent guest device ID stored in localStorage.
 */
export function getOrCreateUserId() {
  if (typeof window === 'undefined') return 'server-session';

  try {
    // 1. If user is logged in via Supabase Auth
    const authId = localStorage.getItem('mockmate_auth_user_id');
    if (authId) {
      return authId;
    }

    // 2. Persistent guest device ID
    const existing = localStorage.getItem('mockmate_device_user_id');
    if (existing) {
      return existing;
    }

    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    localStorage.setItem('mockmate_device_user_id', newId);
    return newId;
  } catch (_) {
    return `temp-${Date.now()}`;
  }
}
