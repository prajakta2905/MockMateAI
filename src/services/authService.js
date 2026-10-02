import { supabase, isSupabaseConfigured } from './supabaseClient';

export function isAuthAvailable() {
  return isSupabaseConfigured && Boolean(supabase);
}

function formatAuthError(msg = '') {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Invalid email or password. Please verify and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email has not been verified yet. Please check your inbox for the confirmation link, then sign in.';
  }
  if (lower.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts right now. Please wait a minute and try again.';
  }
  return msg || 'Authentication failed. Please try again.';
}

/**
 * Format raw Supabase user to standardized app user object
 */
function mapUser(user) {
  if (!user) return null;
  const name = user.user_metadata?.full_name || user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Candidate';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  return {
    id: user.id,
    email: user.email,
    name,
    avatarUrl,
    createdAt: user.created_at
  };
}

/**
 * Sign up with Email, Password, and Full Name
 */
export async function signUpWithEmail({ email, password, fullName }) {
  if (!supabase) return { user: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || 'Candidate',
          display_name: fullName?.trim() || 'Candidate'
        },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });

    if (error) {
      return { user: null, error: formatAuthError(error.message) };
    }

    if (data?.user) {
      localStorage.setItem('mockmate_auth_user_id', data.user.id);
      localStorage.setItem('mockmate_user_name', fullName?.trim() || 'Candidate');
    }

    return { user: mapUser(data?.user), session: data?.session, error: null };
  } catch (err) {
    return { user: null, error: formatAuthError(err.message) };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail({ email, password }) {
  if (!supabase) return { user: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { user: null, error: formatAuthError(error.message) };
    }

    if (data?.user) {
      localStorage.setItem('mockmate_auth_user_id', data.user.id);
      const name = data.user.user_metadata?.full_name || data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Candidate';
      localStorage.setItem('mockmate_user_name', name);
    }

    return { user: mapUser(data?.user), session: data?.session, error: null };
  } catch (err) {
    return { user: null, error: formatAuthError(err.message) };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (!supabase) return { error: null };

  try {
    localStorage.removeItem('mockmate_auth_user_id');
    localStorage.removeItem('mockmate_user_name');
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Get currently authenticated user from session
 */
export async function getCurrentUser() {
  if (!supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Candidate';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    return {
      id: user.id,
      email: user.email,
      name,
      avatarUrl,
      createdAt: user.created_at
    };
  } catch (_) {
    return null;
  }
}

/**
 * Subscribe to Supabase auth state changes
 */
export function onAuthStateChange(callback) {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      localStorage.setItem('mockmate_auth_user_id', session.user.id);
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Candidate';
      const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;
      localStorage.setItem('mockmate_user_name', name);
      callback({
        id: session.user.id,
        email: session.user.email,
        name,
        avatarUrl
      });
    } else {
      localStorage.removeItem('mockmate_auth_user_id');
      localStorage.removeItem('mockmate_user_name');
      callback(null);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}


/**
 * Send password reset email
 */
export async function resetPasswordForEmail(email) {
  if (!supabase) return { error: 'Supabase is not configured' };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    });
    return { error: error ? formatAuthError(error.message) : null };
  } catch (err) {
    return { error: formatAuthError(err.message) };
  }
}

/**
 * Send 6-digit OTP code / Magic link directly to Email
 */
export async function sendEmailOtp(email) {
  if (!supabase) return { data: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });

    if (error) {
      return { data: null, error: formatAuthError(error.message) };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err.message) };
  }
}

/**
 * Verify 6-digit Email OTP code entered by candidate
 */
export async function verifyEmailOtp(email, token) {
  if (!supabase) return { user: null, session: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email'
    });

    if (error) {
      return { user: null, session: null, error: formatAuthError(error.message) };
    }

    if (data?.user) {
      localStorage.setItem('mockmate_auth_user_id', data.user.id);
      const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Candidate';
      localStorage.setItem('mockmate_user_name', name);
    }

    return { user: data?.user, session: data?.session, error: null };
  } catch (err) {
    return { user: null, session: null, error: formatAuthError(err.message) };
  }
}

/**
 * Direct 1-Click Sign In with Google
 */
export async function signInWithGoogle() {
  if (!supabase) return { data: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    });

    if (error) {
      return { data: null, error: formatAuthError(error.message) };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: formatAuthError(err.message) };
  }
}


