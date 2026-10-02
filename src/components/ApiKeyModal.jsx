import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, CheckCircle2, ShieldAlert, ExternalLink, Zap } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey } from '../services/gemini';
import { getGrokApiKey, setGrokApiKey } from '../services/grok';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [geminiKey, setGemini] = useState('');
  const [grokKey, setGrok] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGemini(getGeminiApiKey());
      setGrok(getGrokApiKey());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(geminiKey);
    setGrokApiKey(grokKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setGemini('');
    setGrok('');
    setGeminiApiKey('');
    setGrokApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EAE6DF] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#E2B857] to-[#A87D1B]"></div>

        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center text-[#A87D1B]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">API Credentials & Keys</h3>
              <p className="text-xs text-gray-500">Connected to Gemini API & GroqCloud high-speed inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {/* Info Banner */}
          <div className="p-3 bg-[#FCF9EE] border border-[#EEDD9E]/70 rounded-xl text-xs text-[#6B4916] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Live AI Ready:</span> Your keys are active for resume analysis, question generation, real-time live follow-ups, and scorecard evaluation.
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                Google Gemini API Key
                <span className="text-[10px] text-gray-400 font-normal">(Resume & Final Report)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#A87D1B] hover:underline flex items-center gap-1 font-medium"
              >
                Gemini Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGemini(e.target.value)}
              placeholder="AQ.Ab8... or AIzaSy..."
              className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-mono"
            />
          </div>

          {/* Groq / Grok API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                Groq / Grok API Key
                <span className="text-[10px] text-emerald-600 font-semibold">(Ultra-fast Follow-Ups)</span>
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#A87D1B] hover:underline flex items-center gap-1 font-medium"
              >
                Groq Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={grokKey}
              onChange={(e) => setGrok(e.target.value)}
              placeholder="gsk_... or xai-..."
              className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium px-2 py-1"
          >
            Clear Keys
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  Saved!
                </>
              ) : (
                'Save Keys'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
