import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, ShieldCheck, RotateCcw, History, User, LogOut, Settings } from 'lucide-react';
import HistoryModal from './HistoryModal';
import AuthModal from './AuthModal';
import ApiKeyModal from './ApiKeyModal';
import { getCurrentUser, onAuthStateChange, signOutUser } from '../services/authService';

export default function Navbar({ onReset, currentStep, currentUser: propUser, onOpenAuth: propOpenAuth }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState('login'); // 'login' | 'signup'
  const [internalUser, setInternalUser] = useState(null);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  const currentUser = propUser !== undefined ? propUser : internalUser;

  useEffect(() => {
    if (propUser === undefined) {
      getCurrentUser().then((u) => setInternalUser(u));
      const unsub = onAuthStateChange((u) => setInternalUser(u));
      return () => unsub();
    }
  }, [propUser]);

  const handleOpenAuth = (mode) => {
    if (propOpenAuth) {
      propOpenAuth(mode);
    } else {
      setInternalAuthMode(mode);
      setInternalAuthOpen(true);
    }
  };


  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAFAF7]/95 backdrop-blur-md border-b border-[#EAE6DF]/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Header */}
          <div 
            onClick={onReset}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* Luxury Gold Dimensional Icon Pod */}
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#D4AF37]/35 via-[#F7EFCF]/50 to-[#A87D1B]/25 blur-xs opacity-75 group-hover:opacity-100 group-hover:blur-sm transition-all duration-300"></div>

              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5DE98] via-[#D4AF37] to-[#8C6314] p-[1px] shadow-md shadow-[#D4AF37]/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none"></div>

                <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#DFB950] via-[#C99E28] to-[#997014] flex items-center justify-center">
                  <div className="flex items-center gap-[3px] text-white">
                    <div className="w-[2px] h-2.5 bg-white/75 rounded-full animate-pulse"></div>
                    <Mic className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    <div className="w-[2px] h-2.5 bg-white/75 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>

                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-white/70 shadow-xs"></span>
                </span>
              </div>
            </div>

            {/* Brand Typography & Luxury AI Badge */}
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-[22px] tracking-tight text-[#0F172A] leading-tight">
                Mock<span className="gold-gradient-text font-black">Mate</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F3D578] ml-0.5 mb-1.5 shadow-sm"></span>
              </span>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FCF9EE] to-white border border-[#EEDD9E]/50 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                <span className="text-[10px] font-black tracking-widest text-[#855E15] uppercase">
                  Voice AI
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-gradient-to-br from-[#D4AF37] to-[#8C6314] text-white rounded font-bold tracking-widest shadow-sm">
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Center Engine Status (Clean Executive SaaS Style) */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-gray-700 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAE6DF] shadow-2xs">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Gemini 3.5 Engine
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <div className="text-[#855E15] font-semibold text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Adaptive Follow-Ups
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Past Interviews History */}
            {currentUser && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-[#EAE6DF] hover:border-[#D4AF37] hover:text-[#855E15] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="View Performance Analytics and History"
              >
                <History className="w-3.5 h-3.5 text-[#A87D1B]" />
                <span className="hidden sm:inline">Analytics & History</span>
              </button>
            )}

            {/* Auth Buttons / User Pill */}
            {currentUser ? (
              <div className="group flex items-center gap-2.5 bg-white/60 hover:bg-white backdrop-blur-md border border-[#EAE6DF] hover:border-[#D4AF37]/40 rounded-full pl-1.5 pr-1.5 py-1.5 text-xs shadow-sm hover:shadow-md transition-all duration-300">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5DE98] via-[#F9E8B6] to-[#EEDD9E] border-2 border-white text-[#855E15] flex items-center justify-center font-black text-sm shadow-xs relative shrink-0">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#D4AF37]/20 pointer-events-none"></div>
                  </div>
                )}
                <div className="flex flex-col text-left leading-tight hidden sm:flex pr-1">
                  <span className="font-extrabold text-gray-900 max-w-[130px] truncate text-[12px] tracking-tight">
                    {(currentUser.name || 'User').replace(/_/g, ' ')}
                  </span>
                  {currentUser.email && (
                    <span className="text-[10px] text-gray-500 font-medium max-w-[130px] truncate">
                      {currentUser.email}
                    </span>
                  )}
                </div>
                
                <div className="w-[1px] h-6 bg-gray-200 hidden sm:block mx-0.5 group-hover:bg-gray-300 transition-colors"></div>
                
                <button
                  onClick={() => signOutUser()}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-gray-950 bg-white hover:bg-gray-50 border border-[#EAE6DF] rounded-xl transition-all duration-300 ease-out shadow-2xs cursor-pointer"
                  title="Sign in with your email"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white gold-gradient-btn rounded-xl transition-all duration-300 ease-out hover:shadow-md shadow-xs flex items-center gap-1 cursor-pointer hover:scale-[1.02]"
                  title="Sign up with your email"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Start New Round Button */}
            {currentStep !== 'home' && (
              <button
                onClick={onReset}
                className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-[#EAE6DF] hover:border-[#D4AF37] hover:text-[#855E15] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#A87D1B]" />
                <span className="hidden md:inline">Start New Round</span>
              </button>
            )}
            {/* Settings / API Key Button */}
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="p-1.5 text-gray-500 hover:text-[#855E15] bg-white hover:bg-[#FCF9EE] border border-[#EAE6DF] hover:border-[#D4AF37] rounded-xl transition-all shadow-2xs flex items-center justify-center cursor-pointer ml-1"
              title="Configure API Keys"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Internal Auth Modal (if not externally controlled) */}
      {!propOpenAuth && (
        <AuthModal
          isOpen={internalAuthOpen}
          initialMode={internalAuthMode}
          onClose={() => setInternalAuthOpen(false)}
          onAuthSuccess={(u) => setInternalUser(u)}
        />
      )}

      {/* API Key Config Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />
    </>
  );
}

