import React from 'react';
import { Mic, MicOff, Send, Volume2, RotateCcw, SkipForward, Pause, Play, Square, MessageSquare, Edit3 } from 'lucide-react';

export default function VoiceControls({
  isListening,
  isSpeaking,
  isPaused,
  isThinking,
  hasAnswerText,
  onToggleMic,
  onSubmitAnswer,
  onRepeatQuestion,
  onSkipQuestion,
  onTogglePause,
  onEndInterview,
  onToggleTranscript,
  onToggleTextInput,
  showTextInput
}) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Primary Control Hub */}
      <div className="p-4 bg-white rounded-3xl border border-[#EAE6DF] shadow-md flex flex-wrap items-center justify-between gap-3">
        {/* Left: Secondary actions (Pause, Repeat, Skip) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              isPaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
            title={isPaused ? 'Resume Interview' : 'Pause Interview'}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>

          <button
            onClick={onRepeatQuestion}
            disabled={isSpeaking || isThinking}
            className="p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
            title="Repeat Current Question"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onSkipQuestion}
            disabled={isSpeaking || isThinking}
            className="p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer text-xs font-semibold flex items-center gap-1"
            title="Skip to Next Question"
          >
            <SkipForward className="w-4 h-4" />
            <span className="hidden sm:inline">Skip</span>
          </button>
        </div>

        {/* Center: Main Mic / Submit Action */}
        <div className="flex items-center gap-2">
          {isListening ? (
            <button
              onClick={onSubmitAnswer}
              disabled={isThinking}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <Send className="w-4 h-4" />
              <span>Submit Answer</span>
            </button>
          ) : (
            <button
              onClick={onToggleMic}
              disabled={isSpeaking || isThinking || isPaused}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-white gold-gradient-btn flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
            >
              <Mic className="w-4 h-4" />
              <span>Tap to Speak</span>
            </button>
          )}
        </div>

        {/* Right: Drawer & End buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTextInput}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              showTextInput
                ? 'bg-[#FCF9EE] border-[#D4AF37] text-[#855E15]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            title="Toggle Text Input"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleTranscript}
            className="p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
            title="Toggle Live Transcript"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={onEndInterview}
            className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="End Interview & Generate Report"
          >
            <Square className="w-3.5 h-3.5 fill-red-600" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>
    </div>
  );
}
