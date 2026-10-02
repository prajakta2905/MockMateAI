import React, { useEffect, useRef } from 'react';
import { MessageSquare, User, Bot, Sparkles, X, ChevronRight } from 'lucide-react';

export default function TranscriptDrawer({
  isOpen,
  onClose,
  transcript = [],
  currentInterimAnswer = ''
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, currentInterimAnswer]);

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-[#EAE6DF] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAFAF7]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center text-[#A87D1B]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Live Interview Transcript</h3>
            <p className="text-[11px] text-gray-500">{transcript.length} turns recorded</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Transcript Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {transcript.length === 0 && !currentInterimAnswer && (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
            <p>Live transcript will appear here as you speak.</p>
          </div>
        )}

        {transcript.map((item, idx) => {
          const isInterviewer = item.role === 'interviewer';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isInterviewer ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isInterviewer
                    ? 'bg-[#FCF9EE] border border-[#EEDD9E] text-[#A87D1B]'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {isInterviewer ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] p-3.5 rounded-2xl ${
                  isInterviewer
                    ? 'bg-[#FCF9EE]/50 border border-[#EEDD9E]/60 text-gray-900 rounded-tl-xs'
                    : 'bg-emerald-50/70 border border-emerald-200/60 text-gray-900 rounded-tr-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[11px] text-gray-700">
                    {isInterviewer ? 'AI Interviewer' : 'You (Candidate)'}
                  </span>
                  {item.isFollowUp && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Follow-Up
                    </span>
                  )}
                  {item.timestamp && (
                    <span className="text-[10px] text-gray-400 font-mono">{item.timestamp}</span>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
              </div>
            </div>
          );
        })}

        {/* Current Interim Candidate Speech */}
        {currentInterimAnswer && (
          <div className="flex gap-3 items-start flex-row-reverse">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-pulse">
              <User className="w-4 h-4" />
            </div>
            <div className="max-w-[82%] p-3 bg-emerald-50 border border-emerald-300 rounded-2xl rounded-tr-xs text-gray-800 italic">
              <span className="text-[10px] text-emerald-700 font-bold block mb-1">
                Listening (live)...
              </span>
              "{currentInterimAnswer}"
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 text-center">
        Full transcript is analyzed by Gemini upon completing the interview.
      </div>
    </div>
  );
}
