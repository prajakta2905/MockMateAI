import React, { useState } from 'react';
import { Sparkles, Clock, Mic, Code2, Users, Shuffle, ArrowRight, UserCheck, Volume2 } from 'lucide-react';
import { cleanCandidateName } from '../services/gemini';
import { speechService } from '../services/speechService';

export default function InterviewSetup({ resume, onSetupComplete, onBack }) {
  const [interviewType, setInterviewType] = useState('mixed'); // 'technical' | 'behavioral' | 'mixed'
  const [duration, setDuration] = useState(15); // 15 | 30 | 45
  const [interviewerPersona, setInterviewerPersona] = useState('alex'); // 'alex' | 'sophia' | 'marcus'
  const [voiceMode, setVoiceMode] = useState('voice-to-voice'); // 'voice-to-voice' | 'voice-to-text' | 'text-to-voice'

  const personas = [
    {
      id: 'alex',
      name: 'Alexander',
      title: 'Principal Systems Architect',
      description: 'Focuses on system tradeoffs, code clarity, and architectural depth.'
    },
    {
      id: 'sophia',
      name: 'Sophia',
      title: 'VP of Engineering & Tech Lead',
      description: 'Conversational, balances deep technical probes with product vision.'
    },
    {
      id: 'marcus',
      name: 'Elena',
      title: 'Head of Talent & Engineering HR',
      description: 'Focuses on problem-solving mindset, STAR stories, and team collaboration.'
    },
    {
      id: 'dave',
      name: 'Dave',
      title: 'Supportive Interview Coach',
      description: 'Provides gentle guidance, hints, and acts as a mentor to help you improve.'
    }
  ];

  const handleStart = () => {
    speechService.warmup(); // Initialize TTS engine synchronously on user click to bypass mobile autoplay blocking
    const selectedPersona = personas.find(p => p.id === interviewerPersona) || personas[0];
    onSetupComplete({
      type: interviewType,
      durationMinutes: duration,
      persona: selectedPersona,
      voiceMode
    });
  };

  return (
    <div className="max-w-5xl mx-auto relative z-10 py-10 px-4">
      {/* --- Premium Animated Background Elements --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem] z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/15 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A87D1B]/15 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        
        {/* Floating Space Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#D4AF37]/60 rounded-full animate-float shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
        <div className="absolute bottom-40 right-10 w-3 h-3 bg-[#A87D1B]/50 rounded-full animate-float-delayed shadow-[0_0_15px_rgba(168,125,27,0.8)]"></div>
        <div className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-pulse-ring"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/80 rounded-full animate-float shadow-[0_0_12px_rgba(255,255,255,0.9)]"></div>
      </div>

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">

      
      {/* Top Session Breadcrumb (Stagger 1) */}
      <div className="animate-in slide-in-from-top-4 fade-in duration-700 ease-out fill-mode-both flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 px-6 py-4 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:bg-white/80 transition-all duration-500">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCF9EE] to-white border border-[#EEDD9E]/50 flex items-center justify-center text-[#A87D1B] font-bold shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#D4AF37]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <UserCheck className="w-5 h-5 relative z-10" />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-gray-900 tracking-tight">{cleanCandidateName(resume.name)}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500 font-semibold">{resume.targetRole}</span>
            <span className="text-[10px] uppercase tracking-wider bg-emerald-50/80 text-emerald-600 px-2.5 py-1 rounded-full font-bold border border-emerald-100/50 shadow-sm animate-pulse">
              Verified
            </span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-[#A87D1B] font-bold hover:text-[#8C6314] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Change Profile
        </button>
      </div>

      {/* 2-Column Split Horizontal Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Format & Duration (Stagger 2) */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-[150ms] ease-out fill-mode-both p-8 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-gray-200/30 bg-white/70 backdrop-blur-2xl flex flex-col justify-between space-y-10 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEDD9E]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#EEDD9E]/30 group-hover:scale-125 transition-all duration-1000"></div>

          {/* Section 1: Type */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#A87D1B]/80 block">
              1. Interview Type
              <div className="h-px bg-[#EEDD9E]/50 flex-grow ml-2"></div>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mixed', title: 'Mixed', subtitle: 'Tech + Behav', icon: Shuffle },
                { id: 'technical', title: 'Technical', subtitle: 'Arch & Stack', icon: Code2 },
                { id: 'behavioral', title: 'Behavioral', subtitle: 'STAR & Culture', icon: Users }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = interviewType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInterviewType(item.id)}
                    className={`group relative p-4 rounded-2xl border text-left transition-all duration-500 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FCF9EE] to-white border-[#D4AF37] shadow-[0_8px_25px_-5px_rgba(212,175,55,0.4)] -translate-y-1 ring-2 ring-[#D4AF37]/40 scale-[1.02]'
                        : 'bg-white/40 border-gray-100 hover:border-[#D4AF37]/60 hover:bg-white hover:shadow-[0_8px_20px_-5px_rgba(212,175,55,0.25)] hover:-translate-y-1 hover:scale-[1.02]'
                    }`}
                  >
                    {/* Selected Shine Effect */}
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <Icon className={`w-6 h-6 mb-3 transition-all duration-300 ${isSelected ? 'text-[#D4AF37] scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-gray-400 group-hover:text-[#D4AF37]/80 group-hover:scale-110'}`} />
                      <div>
                        <p className={`font-bold text-[14px] transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{item.title}</p>
                        <p className={`text-[10px] mt-0.5 truncate transition-colors ${isSelected ? 'text-[#A87D1B] font-semibold' : 'text-gray-400 group-hover:text-[#A87D1B]/80'}`}>{item.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Duration */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#A87D1B]/80 block">
              2. Target Duration
              <div className="h-px bg-[#EEDD9E]/50 flex-grow ml-2"></div>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { mins: 15, label: '15 Min', desc: 'Screening' },
                { mins: 30, label: '30 Min', desc: 'Standard' },
                { mins: 45, label: '45 Min', desc: 'Full Mock' }
              ].map((item) => {
                const isSelected = duration === item.mins;
                return (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => setDuration(item.mins)}
                    className={`group relative p-3 rounded-2xl text-center border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-center min-h-[80px] ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FCF9EE] to-white border-[#D4AF37] shadow-[0_8px_25px_-5px_rgba(212,175,55,0.4)] -translate-y-1 ring-2 ring-[#D4AF37]/40 scale-[1.02]'
                        : 'bg-white/40 border-gray-100 hover:border-[#D4AF37]/60 hover:bg-white hover:shadow-[0_8px_20px_-5px_rgba(212,175,55,0.25)] hover:-translate-y-1 hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                    <div className="relative z-10">
                      <p className={`text-[14px] font-extrabold transition-colors duration-300 ${isSelected ? 'text-gray-900 drop-shadow-sm' : 'text-gray-500 group-hover:text-gray-800'}`}>{item.label}</p>
                      <p className={`text-[10px] mt-1 transition-colors duration-300 ${isSelected ? 'text-[#A87D1B] font-bold' : 'text-gray-400 group-hover:text-[#A87D1B]/80'}`}>{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Persona & Mode (Stagger 3) */}
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-[300ms] ease-out fill-mode-both p-8 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-gray-200/30 bg-white/70 backdrop-blur-2xl flex flex-col justify-between space-y-10 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
          {/* Subtle bg glow */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FCF9EE]/40 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FCF9EE]/70 group-hover:scale-125 transition-all duration-1000"></div>

          {/* Section 3: Persona */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#A87D1B]/80 block">
              3. Interviewer Persona
              <div className="h-px bg-[#EEDD9E]/50 flex-grow ml-2"></div>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personas.map((p) => {
                const isSelected = interviewerPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setInterviewerPersona(p.id)}
                    className={`group relative p-4 rounded-2xl border text-left transition-all duration-500 cursor-pointer overflow-hidden min-h-[90px] flex flex-col justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FCF9EE] to-white border-[#D4AF37] shadow-[0_8px_25px_-5px_rgba(212,175,55,0.4)] -translate-y-1 ring-2 ring-[#D4AF37]/40 scale-[1.02]'
                        : 'bg-white/40 border-gray-100 hover:border-[#D4AF37]/60 hover:bg-white hover:shadow-[0_8px_20px_-5px_rgba(212,175,55,0.25)] hover:-translate-y-1 hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                    <div className="relative z-10">
                      <p className={`font-extrabold text-[14px] transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{p.name}</p>
                      <p className={`text-[11px] mt-1 font-semibold truncate transition-colors duration-300 ${isSelected ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]/80'}`}>{p.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Voice Mode */}
          <div className="space-y-4 relative z-10">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#A87D1B]/80 block">
              4. Interaction Mode
              <div className="h-px bg-[#EEDD9E]/50 flex-grow ml-2"></div>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'voice-to-voice', title: 'Voice ↔ Voice', desc: 'Main Demo' },
                { id: 'voice-to-text', title: 'Voice → Text', desc: 'Transcript' },
                { id: 'text-to-voice', title: 'Text → Voice', desc: 'Narration' }
              ].map((mode) => {
                const isSelected = voiceMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setVoiceMode(mode.id)}
                    className={`group relative p-3 rounded-2xl text-left border transition-all duration-500 cursor-pointer overflow-hidden min-h-[80px] flex flex-col justify-center ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FCF9EE] to-white border-[#D4AF37] shadow-[0_8px_25px_-5px_rgba(212,175,55,0.4)] -translate-y-1 ring-2 ring-[#D4AF37]/40 scale-[1.02]'
                        : 'bg-white/40 border-gray-100 hover:border-[#D4AF37]/60 hover:bg-white hover:shadow-[0_8px_20px_-5px_rgba(212,175,55,0.25)] hover:-translate-y-1 hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                    <div className="relative z-10">
                      <p className={`font-bold text-[12px] transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'}`}>{mode.title}</p>
                      <p className={`text-[10px] mt-1 transition-colors duration-300 font-medium ${isSelected ? 'text-[#A87D1B]' : 'text-gray-400 group-hover:text-[#A87D1B]/80'}`}>{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Single Screen Action Bar (Stagger 4) */}
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-[450ms] ease-out fill-mode-both flex flex-col-reverse sm:flex-row items-center justify-between gap-6 sm:gap-0 pt-8 px-2 relative z-10">
        <button
          onClick={onBack}
          className="group text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Resume
        </button>

        <button
          onClick={handleStart}
          className="group relative px-10 py-5 text-sm font-black text-white rounded-2xl gold-gradient-btn flex items-center gap-3 cursor-pointer shadow-[0_8px_30px_-4px_rgba(212,175,55,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(212,175,55,0.7)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative z-10 text-[15px] tracking-wide">Initialize Interview Environment</span>
          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      </div>
    </div>
  );
}
