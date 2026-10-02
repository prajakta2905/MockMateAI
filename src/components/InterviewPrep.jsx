import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, CheckCircle2, Play, RefreshCw, Cpu, Layers, Users } from 'lucide-react';
import { generateQuestionPoolWithGemini, cleanCandidateName } from '../services/gemini';
import { speechService } from '../services/speechService';

export default function InterviewPrep({ resume, setup, onReadyToStart, onBack }) {
  const [loading, setLoading] = useState(true);
  const [questionPool, setQuestionPool] = useState(null);
  const [micStatus, setMicStatus] = useState('checking'); // 'checking' | 'ready' | 'denied'
  const [micVolume, setMicVolume] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        const pool = await generateQuestionPoolWithGemini(
          resume,
          setup.type,
          setup.durationMinutes
        );
        if (isMounted) {
          setQuestionPool(pool);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error generating question pool:', err);
        if (isMounted) setLoading(false);
      }
    }

    async function checkMic() {
      const ok = await speechService.setupAudioAnalyser((vol) => {
        if (isMounted) setMicVolume(vol);
      });
      if (isMounted) {
        setMicStatus(ok ? 'ready' : 'denied');
      }
    }

    loadQuestions();
    checkMic();

    return () => {
      isMounted = false;
      speechService.stopVolumeCheck();
    };
  }, [resume, setup]);

  const handleBegin = () => {
    let allQuestions = [];

    // 1. Warm-up introduction ("Tell me about yourself")
    if (questionPool?.warmupQuestion) {
      allQuestions.push(questionPool.warmupQuestion);
    }

    // 2. Medium engineering fundamentals & approach
    if (questionPool?.foundationalQuestion) {
      allQuestions.push(questionPool.foundationalQuestion);
    }

    // 3. Core technical skills & frameworks
    if (questionPool?.skillsQuestions?.length > 0) {
      allQuestions.push(...questionPool.skillsQuestions);
    } else if (questionPool?.technicalQuestions?.length > 0) {
      allQuestions.push(...questionPool.technicalQuestions);
    }

    // 4. Project deep-dive & blockers
    if (questionPool?.projectQuestions?.length > 0) {
      allQuestions.push(...questionPool.projectQuestions);
    }

    // 5. Behavioral / STAR scenarios
    if (questionPool?.behavioralQuestions?.length > 0) {
      allQuestions.push(...questionPool.behavioralQuestions);
    }

    const firstName = cleanCandidateName(resume?.name).split(' ')[0];
    const targetRole = resume?.targetRole || 'Software Engineer';

    onReadyToStart({
      questionPool: allQuestions.length > 0 ? allQuestions : [
        {
          id: 'q1-warmup',
          category: 'Introduction & Background',
          question: `Hello ${firstName}, welcome to the interview today! To start us off, could you please give a brief overview of yourself, your background, and what you specialize in as a ${targetRole}?`,
          focus: 'Career overview, communication clarity, and introduction',
          difficulty: 'warm-up'
        },
        {
          id: 'q2-fundamentals',
          category: 'Engineering Mindset & Approach',
          question: `When starting a new project or tackling a complex feature from scratch, what is your standard approach for planning architecture, choosing the right stack, and ensuring maintainability?`,
          focus: 'Systematic problem breakdown, architectural thinking, and best practices',
          difficulty: 'medium'
        },
        {
          id: 'q3-project',
          category: 'Project Deep-Dive',
          question: `Looking at your project ${resume?.projects?.[0]?.name || 'primary engineering project'}, can you walk me through the end-to-end architecture and key trade-offs?`,
          focus: 'Architectural trade-offs, scalability, and system modularity',
          difficulty: 'hard'
        }
      ]
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Compact Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E]">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Step 3 • Audio Check & Question Roadmap
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Your Personalized Interview Room is Ready
        </h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Progressive questions tailored for <strong className="text-gray-900">{cleanCandidateName(resume.name)}</strong> ({resume.targetRole}).
        </p>
      </div>

      {loading ? (
        <div className="luxury-card p-6 rounded-3xl space-y-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Synthesizing Progressive Question Flow...</h4>
            <p className="text-[10px] text-gray-500">Structuring: Introduction → Medium Fundamentals → Technical Skills → Project Deep-Dives → STAR Behavioral</p>
          </div>
          <div className="w-48 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2B857] animate-pulse w-3/4 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progressive Question Sequence Overview (4 cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-[#A87D1B] block">Phase 1</span>
              <p className="text-xs font-bold text-gray-900">Introduction</p>
              <p className="text-[9px] text-gray-400 truncate">Tell me about yourself</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-blue-600 block">Phase 2</span>
              <p className="text-xs font-bold text-gray-900">Fundamentals</p>
              <p className="text-[9px] text-gray-400 truncate">Core approach & stack</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-emerald-600 block">Phase 3</span>
              <p className="text-xs font-bold text-gray-900">Project Probes</p>
              <p className="text-[9px] text-gray-400 truncate">Architecture & blockers</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-purple-600 block">Phase 4</span>
              <p className="text-xs font-bold text-gray-900">Behavioral</p>
              <p className="text-[9px] text-gray-400 truncate">Team & STAR scenarios</p>
            </div>
          </div>

          {/* Audio & Mic Health Check Card (Compact) */}
          <div className="luxury-card p-4 rounded-3xl space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Microphone & Speech Check
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                micStatus === 'ready'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {micStatus === 'ready' ? 'Microphone Active' : 'Speech Enabled'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-200">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                micStatus === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
                  <span>Speak into mic to test volume:</span>
                  <span className="font-mono text-gray-500">{Math.round(micVolume)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#D4AF37] transition-all duration-100"
                    style={{ width: `${Math.min(100, Math.max(micVolume * 1.5, 5))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onBack}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 cursor-pointer"
            >
              ← Back to Setup
            </button>

            <button
              onClick={handleBegin}
              className="px-7 py-3 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Enter Live Interview Room</span>
              <span className="font-bold text-sm">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
