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
    <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#D4AF37]/10 rounded-full filter blur-[60px] pointer-events-none animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#D4AF37]/5 rounded-full filter blur-[60px] pointer-events-none animate-blob animation-delay-2000"></div>

      {/* Top Session Bar - Glassmorphism */}
      <div className="glass-panel px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 border border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCF9EE] to-white border border-[#EEDD9E] flex items-center justify-center text-[#A87D1B] shadow-sm transform hover:scale-105 transition-transform duration-300">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900 tracking-tight">{candidateName}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-[#FCF9EE] text-[#855E15] rounded-full font-bold border border-[#EEDD9E] uppercase tracking-wider">
                {interviewSetup?.type}
              </span>
              {isSupabaseSynced && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Synced
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium mt-0.5">{resume?.targetRole}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopySummary}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-[#D4AF37] hover:text-[#A87D1B] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* Account Cloud Sync Callout for Guests */}
      {!currentUser && (
        <div className="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-[#FCF9EE] via-white to-[#FCF9EE] rounded-2xl border border-[#EEDD9E]/60 text-sm shadow-sm hover:shadow-md transition-shadow duration-300 z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-2xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-1.5 bg-gradient-to-br from-[#D4AF37] to-[#C59A27] rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium leading-relaxed">
              Save this full interview scorecard and turn-by-turn voice transcript to your personal email account:
            </span>
          </div>
          <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth && onOpenAuth('signup')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white gold-gradient-btn rounded-xl cursor-pointer shadow-md transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up
            </button>
            <button
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer shadow-sm transition-colors duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      )}


      {/* 2-Column Horizontal Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
        
        {/* Left Column (4 Cols): Overall Scorecard & Competency Bars */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          <div className="luxury-card luxury-card-hover p-6 rounded-[24px] border border-white/60 bg-gradient-to-b from-white to-[#FAFAF7] flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            {/* Score Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#A87D1B] opacity-80">
                  Verdict & Rating
                </span>
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  <span className="gold-gradient-text">{verdict}</span>
                </h3>
                <p className={`text-[11px] font-semibold flex items-center gap-1.5 mt-2 ${
                  overallScore >= 75 ? 'text-emerald-600' : overallScore >= 50 ? 'text-amber-600' : 'text-rose-500'
                }`}>
                  {overallScore >= 75 ? (
                    <><ShieldCheck className="w-3.5 h-3.5" /> Ready for Next Round</>
                  ) : overallScore >= 50 ? (
                    <><AlertTriangle className="w-3.5 h-3.5" /> Additional Practice</>
                  ) : (
                    <><AlertTriangle className="w-3.5 h-3.5" /> More Practice Needed</>
                  )}
                </p>
              </div>

              {/* Circular Score Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-md animate-pulse"></div>
                <svg className="w-full h-full transform -rotate-90 relative z-10 drop-shadow-sm" viewBox="0 0 36 36">
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
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(212, 175, 55, 0.3))' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center z-10">
                  <span className="text-2xl font-black text-gray-900 leading-none">{overallScore}</span>
                  <span className="text-[9px] font-bold text-gray-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center relative z-10">
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-300">
                <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1 tracking-wider">Questions</span>
                <p className="font-black text-gray-900 text-lg leading-none">{stats?.totalQuestions || 8}</p>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-300">
                <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1 tracking-wider">Follow-Ups</span>
                <p className="font-black text-[#A87D1B] text-lg leading-none">{stats?.followUpsGenerated || 3}</p>
              </div>
              <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 duration-300">
                <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1 tracking-wider">Duration</span>
                <p className="font-black text-gray-900 text-lg leading-none">{stats?.durationFormatted || '15m'}</p>
              </div>
            </div>

            {/* 5-Dimension Competency Score Bars */}
            <div className="pt-2 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-4">
                Competency Breakdown
              </span>
              <div className="space-y-4">
                {[
                  { label: 'Technical Architecture', score: categoryScores.technicalKnowledge || 84 },
                  { label: 'Communication & Clarity', score: categoryScores.communicationClarity || 78 },
                  { label: 'Problem Solving', score: categoryScores.problemSolving || 80 },
                  { label: 'Resume Alignment', score: categoryScores.resumeAlignment || 88 },
                  { label: 'Answer Relevance', score: categoryScores.answerRelevance || 82 }
                ].map((cat, idx) => (
                  <div key={idx} className="space-y-1.5 group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{cat.label}</span>
                      <span className="font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">{cat.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C07B] rounded-full transition-all duration-1500 ease-out shadow-[0_0_10px_rgba(212,175,55,0.4)]"
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
          </div>

          {/* Retake Action */}
          <button
            onClick={onRetake}
            className="w-full py-3.5 text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-[#D4AF37] hover:text-[#A87D1B] hover:shadow-lg rounded-[20px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 group"
          >
            <RotateCcw className="w-4 h-4 text-[#D4AF37] group-hover:-rotate-90 transition-transform duration-500" />
            Start Another Practice Round
          </button>
        </div>

        {/* Right Column (7 Cols): Strengths, Improvement & Question Deep Dive */}
        <div className="lg:col-span-7 flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-1 pb-4 scroll-smooth">
          
          {/* Executive Feedback & Summary */}
          <div className="luxury-card p-5 rounded-[24px] border border-white/60 bg-gradient-to-br from-white to-[#FCF9EE]/30 space-y-3 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-colors duration-500">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-[#A87D1B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Executive Summary
              </span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm ${
                overallScore >= 70 
                  ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200' 
                  : 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 border-amber-200'
              }`}>
                {overallScore >= 70 ? 'Competency Verified' : 'Action Required'}
              </span>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-inner font-medium relative z-10">
              {executiveSummary}
            </p>
          </div>

          {/* Strengths and Areas to Improve in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 rounded-[24px] border border-emerald-100 hover:border-emerald-200 transition-colors duration-300 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths
              </span>
              <ul className="space-y-2 text-xs text-emerald-950">
                {strengths.slice(0, 3).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-700 font-bold" />
                    </div>
                    <span className="font-medium text-gray-700 leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-gradient-to-br from-amber-50/50 to-amber-100/30 rounded-[24px] border border-amber-100 hover:border-amber-200 transition-colors duration-300 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas to Focus
              </span>
              <ul className="space-y-2 text-xs text-amber-950">
                {areasToImprove.slice(0, 3).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-amber-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-amber-100 rounded-full w-3.5 h-3.5 shrink-0 mt-0.5 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                    </div>
                    <span className="font-medium text-gray-700 leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Deep Dive (Premium Accordions) */}
          <div className="luxury-card p-5 rounded-[24px] border border-white/60 bg-white space-y-4 flex-1 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-600 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Question-by-Question Deep Dive
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{questionAssessments.length} Questions</span>
            </div>

            <div className="space-y-3">
              {questionAssessments.map((qa, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 text-sm ${
                      isExpanded ? 'border-[#EEDD9E] shadow-lg ring-1 ring-[#D4AF37]/20 bg-gradient-to-b from-white to-[#FAFAF7]' : 'border-gray-200 hover:border-[#D4AF37]/50 hover:shadow-md bg-white'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-3.5 flex items-center justify-between cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isExpanded ? 'bg-gradient-to-br from-[#D4AF37] to-[#C59A27] border-transparent text-white shadow-md' : 'bg-[#FCF9EE] border-[#EEDD9E] text-[#A87D1B] group-hover:bg-[#f6ebd0]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`font-semibold truncate transition-colors duration-300 ${isExpanded ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {qa.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-[11px] font-black px-2 py-1 rounded-md border transition-colors duration-300 ${
                          isExpanded ? 'text-white bg-[#C59A27] border-transparent shadow-inner' : 'text-[#A87D1B] bg-[#FCF9EE] border-[#EEDD9E]'
                        }`}>
                          {qa.score || 85}%
                        </span>
                        <div className={`p-1 rounded-full transition-colors duration-300 ${isExpanded ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white/50 border-t border-[#EAE6DF]/50 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="space-y-1.5">
                          <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] ml-1">Your Response</span>
                          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-gray-700 text-[13px] leading-relaxed shadow-inner">
                            <span className="text-gray-400 font-serif text-lg leading-none mr-1">"</span>
                            {qa.candidateAnswer}
                            <span className="text-gray-400 font-serif text-lg leading-none ml-1">"</span>
                          </div>
                        </div>
                        
                        {qa.followUpAsked && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-[#A87D1B] uppercase tracking-wider text-[10px] ml-1">Follow-Up Asked</span>
                            <div className="bg-gradient-to-r from-[#FCF9EE] to-white p-3 rounded-xl border border-[#EEDD9E]/50 text-amber-900 text-[13px] leading-relaxed relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                              <span className="text-amber-300 font-serif text-lg leading-none mr-1">"</span>
                              {qa.followUpAsked}
                              <span className="text-amber-300 font-serif text-lg leading-none ml-1">"</span>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-12">
                          <div className="sm:col-span-12 space-y-1.5">
                             <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] ml-1">Assessment</span>
                             <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm text-gray-700 text-[13px] leading-relaxed flex gap-3">
                                <div className="mt-0.5 shrink-0">
                                  <UserCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <p>{qa.feedback}</p>
                             </div>
                          </div>
                        </div>

                        {qa.idealAnswerKeyPoints && (
                          <div className="space-y-1.5 mt-2">
                            <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px] ml-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Pro Tip / Ideal Answer
                            </span>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 p-3.5 rounded-xl border border-emerald-100/80 text-emerald-900 text-[13px] leading-relaxed flex gap-3 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full filter blur-xl pointer-events-none"></div>
                              <div className="mt-0.5 shrink-0 bg-emerald-100 rounded-full p-1 h-fit relative z-10">
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                              </div>
                              <p className="relative z-10">{qa.idealAnswerKeyPoints}</p>
                            </div>
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
