import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, Cpu, MessageSquare, Award, FileText } from 'lucide-react';
import { generateFinalReportWithGemini } from '../services/gemini';

export default function ProcessingScreen({ interviewData, onReportReady }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = [
    {
      title: 'Synthesizing Audio Transcript & Answers',
      description: 'Parsing spoken explanations, architectural trade-offs, and technical vocabulary.',
      icon: MessageSquare
    },
    {
      title: 'Evaluating Technical Depth & Reasoning',
      description: 'Analyzing system design decisions, edge-case mitigation, and framework mastery.',
      icon: Cpu
    },
    {
      title: 'Cross-Verifying Resume Project Claims',
      description: 'Comparing claimed resume achievements with answers given during the live interview.',
      icon: FileText
    },
    {
      title: 'Compiling Final Executive Scorecard & Feedback',
      description: 'Generating overall rating, categorical breakdown, strengths, and targeted improvement points.',
      icon: Award
    }
  ];

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    async function evaluate() {
      try {
        const report = await generateFinalReportWithGemini(interviewData);
        if (isMounted) {
          setTimeout(() => {
            onReportReady(report);
          }, 3200);
        }
      } catch (err) {
        console.error('Report evaluation failed:', err);
      }
    }

    evaluate();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [interviewData, onReportReady]);

  return (
    <div className="max-w-xl mx-auto space-y-4 py-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-6 h-6 text-[#D4AF37] animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Analyzing Your Spoken Performance
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Synthesizing architectural trade-offs, response clarity, and resume alignment.
        </p>
      </div>

      {/* Progressive Step Cards (Compact) */}
      <div className="luxury-card p-4 rounded-3xl space-y-2 border border-[#EEDD9E]/60 bg-white">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                isCurrent
                  ? 'bg-[#FCF9EE] border-[#D4AF37] shadow-2xs'
                  : isDone
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-gray-50/50 border-gray-200 opacity-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-[#D4AF37] text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-[#855E15]' : isDone ? 'text-emerald-900' : 'text-gray-700'}`}>
                    {stage.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[9px] bg-[#D4AF37] text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0 ml-1">
                      Analyzing
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[9px] text-emerald-700 font-bold shrink-0 ml-1">
                      ✓ Done
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-48 mx-auto h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2B857] animate-pulse w-3/4 rounded-full"></div>
      </div>
    </div>
  );
}
