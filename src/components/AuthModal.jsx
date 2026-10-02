import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  resetPasswordForEmail,
  signInWithGoogle 
} from '../services/authService';


export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  // mode: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState(initialMode || 'login');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError('');
      setNotice('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const { user, session, error: err } = await signUpWithEmail({
          email,
          password,
          fullName
        });

        if (err) {
          setError(err);
        } else if (session) {
          setNotice('Account created successfully! You are now signed in.');
          if (onAuthSuccess) onAuthSuccess(user);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          // If email confirmation is enabled in user's Supabase dashboard
          setNotice(`Account registered! We sent a confirmation link to ${email}. Please check your inbox to verify and sign in.`);
          setTimeout(() => {
            setMode('login');
          }, 3500);
        }
      } else if (mode === 'login') {
        const { user, session, error: err } = await signInWithEmail({
          email,
          password
        });

        if (err) {
          setError(err);
        } else {
          setNotice('Welcome back! Signed in successfully.');
          if (onAuthSuccess) onAuthSuccess(user || session?.user);
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else if (mode === 'forgot') {
        const { error: err } = await resetPasswordForEmail(email);
        if (err) {
          setError(err);
        } else {
          setNotice(`Password reset email sent to ${email}! Please check your inbox.`);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE6DF] shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-out">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5DE98] via-[#D4AF37] to-[#8C6314] p-[1px] mx-auto shadow-md shadow-[#D4AF37]/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#DFB950] via-[#C99E28] to-[#997014] flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <h3 className="text-xl font-black text-gray-900 tracking-tight pt-1">
            {mode === 'login' && 'Sign in to MockMate'}
            {mode === 'signup' && 'Create Your Candidate Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {mode === 'login' && 'Enter your email and password to access your saved interview history.'}
            {mode === 'signup' && 'Sign up with your personal or work email to save your scores and AI reports.'}
            {mode === 'forgot' && 'Enter your registered email to receive a password reset link.'}
          </p>
        </div>

        {/* Mode Toggle Tabs: [ Sign In ] vs [ Sign Up ] */}
        {mode !== 'forgot' && (
          <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-gray-900"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-gray-900"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setNotice('');
                    }}
                    className="text-[11px] font-semibold text-[#855E15] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'signup' ? (
              <>
                <span>Sign Up with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'forgot' ? (
              <span>Send Reset Email</span>
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Continue with Google (At Bottom) */}
        {mode !== 'forgot' && (
          <div className="space-y-3 pt-0.5">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-gray-400 absolute">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Bottom Switcher & Guest Fallback */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">

          {mode === 'forgot' ? (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setNotice('');
              }}
              className="font-semibold text-gray-700 hover:text-black cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : (
            <span>Just testing out?</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="font-bold text-gray-700 hover:text-[#855E15] underline cursor-pointer ml-auto"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
