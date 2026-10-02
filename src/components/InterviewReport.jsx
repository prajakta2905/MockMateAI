import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, AlertTriangle, Sparkles, MessageSquare, Clock, RotateCcw, Download, Copy, Check, ChevronDown, ChevronUp, ShieldCheck, UserCheck } from 'lucide-react';
import { cleanCandidateName } from '../services/gemini';

export default function InterviewReport({ reportData, interviewData, isSupabaseSynced, onRetake, onOpenAuth, currentUser }) {
  const [copied, setCopied] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const {
    overallScore = 82,
    verdict = 'Hire (Strong Ready)',
    categoryScores = {
      technicalKnowledge: 84,
      communicationClarity: 78,
      problemSolving: 80,
      resumeAlignment: 88,
      answerRelevance: 82
    },
    strengths = reportData?.strengths || [],
    areasToImprove = reportData?.areasToImprove || reportData?.areasForImprovement || [],
    executiveSummary = reportData?.executiveSummary || '',
    questionAssessments = reportData?.questionAssessments || []
  } = reportData || {};

  const { stats, resume, interviewSetup } = interviewData;
  const candidateName = cleanCandidateName(resume?.name);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E5C07B', '#C59A27', '#10B981', '#6366F1']
      });
    } catch (e) {
      console.warn('Confetti notice:', e);
    }
  }, []);

  const handleCopySummary = () => {
    const text = `MockMate AI Interview Report
Candidate: ${candidateName} (${resume?.targetRole})
Overall Score: ${overallScore}/100 - ${verdict}
Technical Knowledge: ${categoryScores.technicalKnowledge}%
Communication: ${categoryScores.communicationClarity}%
Problem Solving: ${categoryScores.problemSolving}%
Resume Alignment: ${categoryScores.resumeAlignment}%

Summary:
${executiveSummary}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 animate-in fade-in duration-300">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white rounded-2xl border border-[#EAE6DF] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center text-[#A87D1B] font-bold text-xs">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-gray-900">{candidateName}</span>
            <span className="text-[10px] text-gray-400">•</span>
            <span className="text-xs text-gray-600 font-medium">{resume?.targetRole}</span>
            <span className="text-[9px] bg-[#FCF9EE] text-[#855E15] px-1.5 py-0.5 rounded font-bold border border-[#EEDD9E]">
              {interviewSetup?.type?.toUpperCase()}
            </span>
            {isSupabaseSynced && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Supabase Synced
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 text-xs font-bold text-white rounded-lg gold-gradient-btn flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* Account Cloud Sync Callout for Guests */}
      {!currentUser && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FCF9EE] via-white to-[#FCF9EE] rounded-2xl border border-[#EEDD9E] text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="text-gray-700 font-medium">
              Save this full interview scorecard and turn-by-turn voice transcript to your personal email account:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth && onOpenAuth('signup')}
              className="px-3 py-1 text-[11px] font-bold text-white gold-gradient-btn rounded-xl cursor-pointer shadow-xs"
            >
              Sign Up with Email
            </button>
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="px-3 py-1 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      )}


      {/* 2-Column Horizontal Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Left Column (5 Cols): Overall Scorecard & Competency Bars */}
        <div className="lg:col-span-5 luxury-card p-4 rounded-3xl border border-[#EEDD9E]/70 bg-gradient-to-b from-white via-[#FCF9EE]/25 to-white flex flex-col justify-between space-y-3">
          {/* Score Header Card */}
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-black tracking-wider text-[#A87D1B]">
                Verdict & Rating
              </span>
              <h3 className="text-base font-black text-gray-900">
                <span className="gold-gradient-text">{verdict}</span>
              </h3>
              <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                overallScore >= 75 ? 'text-emerald-700' : overallScore >= 50 ? 'text-amber-700' : 'text-rose-600'
              }`}>
                {overallScore >= 75 ? (
                  <><ShieldCheck className="w-3 h-3 text-emerald-600" /> Ready for Next Round</>
                ) : overallScore >= 50 ? (
                  <><AlertTriangle className="w-3 h-3 text-amber-600" /> Additional Practice Recommended</>
                ) : (
                  <><AlertTriangle className="w-3 h-3 text-rose-500" /> More Practice Needed Before Round</>
                )}
              </p>
            </div>

            {/* Circular Score Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#D4AF37]"
                  strokeDasharray={`${overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-base font-black text-gray-900">{overallScore}</span>
                <span className="text-[8px] font-bold text-gray-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border border-gray-100">
              <span className="text-[8px] uppercase font-bold text-gray-400 block">Questions</span>
              <p className="font-bold text-gray-900">{stats?.totalQuestions || 8}</p>
            </div>
            <div className="p-2 bg-white rounded-xl border border-gray-100">
              <span className="text-[8px] uppercase font-bold text-gray-400 block">Follow-Ups</span>
              <p className="font-bold text-[#A87D1B]">{stats?.followUpsGenerated || 3}</p>
            </div>
            <div className="p-2 bg-white rounded-xl border border-gray-100">
              <span className="text-[8px] uppercase font-bold text-gray-400 block">Duration</span>
              <p className="font-bold text-gray-900">{stats?.durationFormatted || '15m'}</p>
            </div>
          </div>

          {/* 5-Dimension Competency Score Bars */}
          <div className="space-y-2 p-3 bg-white rounded-2xl border border-gray-100 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full filter blur-2xl pointer-events-none"></div>
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 block relative z-10">
              Core Competency Breakdown
            </span>
            <div className="space-y-2.5 relative z-10">
              {[
                { label: 'Technical Architecture', score: categoryScores.technicalKnowledge || 84 },
                { label: 'Communication & Clarity', score: categoryScores.communicationClarity || 78 },
                { label: 'Problem Solving', score: categoryScores.problemSolving || 80 },
                { label: 'Resume Alignment', score: categoryScores.resumeAlignment || 88 },
                { label: 'Answer Relevance', score: categoryScores.answerRelevance || 82 }
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-700">{cat.label}</span>
                    <span className="font-bold text-gray-900">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C59A27] rounded-full transition-all duration-1500 ease-out"
                      style={{ 
                        width: '0%', 
                        animation: `fillBar 1.5s ease-out ${idx * 0.15}s forwards` 
                      }}
                      onAnimationStart={(e) => {
                        e.target.style.width = `${cat.score}%`;
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake Action */}
          <button
            onClick={onRetake}
            className="w-full py-2.5 text-xs font-bold text-gray-700 bg-white border border-[#EAE6DF] hover:border-[#D4AF37] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            Start Another Practice Round →
          </button>
        </div>

        {/* Right Column (7 Cols): Strengths, Improvement & Question Deep Dive */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 max-h-[calc(100vh-130px)] overflow-y-auto pr-0.5">
          
          {/* Executive Feedback & Summary */}
          <div className="luxury-card p-3.5 rounded-2xl border border-[#EEDD9E]/60 bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A87D1B] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Executive Evaluator Summary
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                overallScore >= 70 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {overallScore >= 70 ? 'Competency Verified' : 'Action Required'}
              </span>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed bg-[#FCF9EE]/40 p-2.5 rounded-xl border border-[#EEDD9E]/40 font-medium">
              {executiveSummary}
            </p>
          </div>

          {/* Strengths and Areas to Improve in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/70 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
              </span>
              <ul className="space-y-1 text-[11px] text-emerald-950">
                {strengths.slice(0, 3).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span className="font-medium text-gray-800 leading-snug">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Areas to Focus
              </span>
              <ul className="space-y-1 text-[11px] text-amber-950">
                {areasToImprove.slice(0, 3).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-amber-100">
                    <span className="text-amber-600 font-bold shrink-0">•</span>
                    <span className="font-medium text-gray-800 leading-snug">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Deep Dive (Compact Accordions) */}
          <div className="luxury-card p-3.5 rounded-2xl border border-[#EAE6DF] bg-white space-y-2 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#D4AF37]" /> Question-by-Question Deep Dive
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {questionAssessments.map((qa, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#EAE6DF] rounded-xl overflow-hidden transition-all text-xs"
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-2.5 bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-5 h-5 rounded bg-[#FCF9EE] border border-[#EEDD9E] text-[#A87D1B] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-900 truncate">
                          {qa.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-[#A87D1B] bg-[#FCF9EE] px-1.5 py-0.5 rounded border border-[#EEDD9E]">
                          {qa.score || 85}%
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-2.5 bg-[#FAFAF7] border-t border-[#EAE6DF] space-y-2 text-[11px]">
                        <div>
                          <span className="font-bold text-gray-500 uppercase text-[9px] block mb-0.5">Your Response:</span>
                          <p className="text-gray-800 italic bg-white p-2 rounded-lg border border-gray-200 text-xs">
                            "{qa.candidateAnswer}"
                          </p>
                        </div>
                        {qa.followUpAsked && (
                          <div>
                            <span className="font-bold text-[#A87D1B] uppercase text-[9px] block mb-0.5">Follow-Up Question:</span>
                            <p className="text-amber-950 bg-[#FCF9EE] p-2 rounded-lg border border-[#EEDD9E] text-xs">
                              "{qa.followUpAsked}"
                            </p>
                          </div>
                        )}
                        <div className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200">
                          <span className="font-bold text-gray-500 uppercase text-[9px] shrink-0 mt-0.5">Assessment:</span>
                          <p className="text-gray-700 text-xs">{qa.feedback}</p>
                        </div>
                        {qa.idealAnswerKeyPoints && (
                          <div className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                            <span className="font-bold text-emerald-800 uppercase text-[9px] shrink-0 mt-0.5">Pro Tip:</span>
                            <p className="text-emerald-900 text-xs">{qa.idealAnswerKeyPoints}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
