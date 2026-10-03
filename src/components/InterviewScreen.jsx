import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  Mic,
  MicOff,
  AlertCircle,
  Volume2,
  ShieldAlert,
  ArrowRight,
  CornerDownLeft,
  CheckCircle2,
  RotateCcw,
  SkipForward,
  Pause,
  Play,
  Square,
  Edit3,
  UserCheck,
  RefreshCw,
  SkipBack
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import Timer from './Timer';
import TranscriptDrawer from './TranscriptDrawer';
import { speechService } from '../services/speechService';
import { evaluateAnswerAndGenerateNextQuestion } from '../services/grok';
import { cleanCandidateName, getCandidateFirstName } from '../services/gemini';

export default function InterviewScreen({
  resume,
  setup,
  questionPool = [],
  onInterviewFinished,
  onCancel
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(questionPool[0] || null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpRationale, setFollowUpRationale] = useState('');

  // Voice & Interaction states
  const [interviewerStatus, setInterviewerStatus] = useState('speaking'); // 'speaking' | 'listening' | 'thinking' | 'idle' | 'paused'
  const [isMicListening, setIsMicListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  // Candidate Answer input
  const [candidateAnswerText, setCandidateAnswerText] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');

  // UI state
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Statistics & History
  const [transcript, setTranscript] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(1);
  const [followUpsCount, setFollowUpsCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isMountedRef = useRef(true);
  const interviewerStatusRef = useRef('speaking');
  const candidateName = cleanCandidateName(resume?.name);
  const firstName = getCandidateFirstName(candidateName);

  const updateInterviewerStatus = (status) => {
    interviewerStatusRef.current = status;
    setInterviewerStatus(status);
  };

  // Initialize Audio, STT & speak initial question on mount
  useEffect(() => {
    isMountedRef.current = true;

    // Check browser support
    const support = speechService.isSupported();
    setHasSpeechSupport(support.speechRecognition);

    // Speak first question
    if (currentQuestion) {
      speakQuestion(currentQuestion.question);
    }

    // Setup live audio analyser for visualizer
    speechService.setupAudioAnalyser((vol) => {
      if (isMountedRef.current) {
        setMicVolume(vol);
      }
    });

    // Initialize speech recognition with robust callbacks
    speechService.initRecognition(
      (result) => {
        if (!isMountedRef.current) return;

        // Ignore incoming audio if AI is speaking or thinking
        if (interviewerStatusRef.current === 'speaking' || interviewerStatusRef.current === 'thinking' || speechService.isSpeaking) {
          return;
        }

        if (result.final) {
          setCandidateAnswerText((prev) => {
            const trimmed = prev ? `${prev} ${result.final}` : result.final;
            return trimmed.trim();
          });
          setInterimSpeech('');
        } else if (result.interim !== undefined) {
          setInterimSpeech(result.interim);
        }
      },
      () => {
        // Recognition ended normally
      },
      (err) => {
        if (!isMountedRef.current) return;
        console.warn('Speech recognition notice:', err);
        if (typeof err === 'string' && err.includes('denied')) {
          setMicError('Microphone permission is blocked. Please allow mic access in your browser bar.');
        }
      },
      (isListeningNow) => {
        if (!isMountedRef.current) return;
        setIsMicListening(isListeningNow);
      }
    );

    return () => {
      isMountedRef.current = false;
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  // Speak question function
  const speakQuestion = (text) => {
    updateInterviewerStatus('speaking');
    setInterimSpeech('');
    speechService.stopListening();

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTranscript((prev) => [
      ...prev,
      {
        role: 'interviewer',
        text,
        timestamp: timeStr,
        isFollowUp
      }
    ]);

    speechService.speak(
      text,
      () => {
        if (isMountedRef.current) {
          updateInterviewerStatus('speaking');
          speechService.stopListening();
        }
      },
      () => {
        if (isMountedRef.current) {
          updateInterviewerStatus('listening');
          if (setup.voiceMode !== 'text-to-voice') {
            speechService.startListening();
          }
        }
      }
    );
  };

  // Toggle Microphone: Allows candidate to interrupt AI or mute/unmute mic anytime
  const handleToggleMic = () => {
    if (isMicListening || interviewerStatus === 'listening') {
      speechService.stopListening();
      updateInterviewerStatus('idle');
    } else {
      // Immediately stop AI voice if it was speaking and open candidate mic
      speechService.stopSpeaking();
      updateInterviewerStatus('listening');
      speechService.startListening();
    }
  };

  // Submit Answer & Evaluate Follow-Up
  const handleSubmitAnswer = async () => {
    const combinedAnswer = `${candidateAnswerText} ${interimSpeech}`.trim();
    if (!combinedAnswer) return;

    speechService.stopListening();
    speechService.stopSpeaking();
    updateInterviewerStatus('thinking');

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const updatedTranscript = [
      ...transcript,
      {
        role: 'candidate',
        text: combinedAnswer,
        timestamp: timeStr
      }
    ];
    setTranscript(updatedTranscript);

    setCandidateAnswerText('');
    setInterimSpeech('');

    if (currentQuestion?.id === 'end-q') {
      updateInterviewerStatus('idle');
      setShowEndModal(true);
      return;
    }

    try {
      const evaluation = await evaluateAnswerAndGenerateNextQuestion({
        currentQuestion: currentQuestion.question,
        candidateAnswer: combinedAnswer,
        conversationHistory: updatedTranscript,
        questionPool,
        currentQuestionIndex,
        targetRole: resume.targetRole,
        interviewType: setup.type,
        resume
      });

      if (!isMountedRef.current) return;

      if (evaluation.action === 'previous') {
        setIsFollowUp(false);
        setFollowUpRationale('');
        const prevIdx = Math.max(0, currentQuestionIndex - 1);
        setCurrentQuestionIndex(prevIdx);
        const prevQ = questionPool[prevIdx];
        setCurrentQuestion(prevQ);
        speakQuestion(prevQ.question);
        return;
      }

      if (evaluation.action === 'repeat') {
        speakQuestion(currentQuestion.question);
        return;
      }

      if (evaluation.isFollowUp) {
        setIsFollowUp(true);
        setFollowUpRationale(evaluation.rationale || 'Probing deeper into technical rationale');
        setFollowUpsCount((prev) => prev + 1);
        const fuQuestion = {
          id: `fu-${Date.now()}`,
          category: 'Dynamic Follow-Up',
          question: evaluation.nextQuestion,
          isFollowUp: true
        };
        setCurrentQuestion(fuQuestion);
        speakQuestion(evaluation.nextQuestion);
      } else {
        setIsFollowUp(false);
        setFollowUpRationale('');
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        setQuestionsCount((prev) => prev + 1);

        const nextQ = questionPool[nextIdx] || {
          id: `end-q`,
          category: 'Summary',
          question: `Thank you ${firstName}. We have covered the primary architecture topics. Do you have any final project achievements you would like to highlight?`
        };

        setCurrentQuestion(nextQ);
        speakQuestion(nextQ.question);
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = questionPool[nextIdx] || {
        id: `end-q`,
        category: 'Summary',
        question: `Thank you ${firstName}. We have covered the primary architecture topics. Do you have any final project achievements you would like to highlight?`
      };
      setCurrentQuestion(nextQ);
      speakQuestion(nextQ.question);
    }
  };

  const handleRepeatQuestion = () => {
    if (currentQuestion) {
      speakQuestion(currentQuestion.question);
    }
  };

  const handleSkipQuestion = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    
    setCandidateAnswerText('');
    setInterimSpeech('');

    if (currentQuestion?.id === 'end-q') {
      updateInterviewerStatus('idle');
      setShowEndModal(true);
      return;
    }

    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);
    setIsFollowUp(false);
    const nextQ = questionPool[nextIdx] || {
      id: `end-q`,
      category: 'Summary',
      question: `Thank you ${firstName}. We have covered the primary architecture topics. Do you have any final project achievements you would like to highlight?`
    };
    setCurrentQuestion(nextQ);
    speakQuestion(nextQ.question);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      speechService.stopSpeaking();
      speechService.stopListening();
      
      setCandidateAnswerText('');
      setInterimSpeech('');

      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      setIsFollowUp(false);
      const prevQ = questionPool[prevIdx];
      setCurrentQuestion(prevQ);
      speakQuestion(prevQ.question);
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      updateInterviewerStatus('idle');
    } else {
      setIsPaused(true);
      updateInterviewerStatus('paused');
      speechService.stopSpeaking();
      speechService.stopListening();
    }
  };

  const handleFinalizeInterview = () => {
    speechService.cleanupAudio();
    const formattedMinutes = Math.floor(elapsedSeconds / 60);
    const formattedSecs = elapsedSeconds % 60;

    onInterviewFinished({
      resume,
      interviewSetup: setup,
      transcript,
      stats: {
        totalQuestions: questionsCount,
        followUpsGenerated: followUpsCount,
        durationSeconds: elapsedSeconds,
        durationFormatted: `${formattedMinutes}m ${formattedSecs}s`
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-3 h-[calc(100dvh-5.5rem)] animate-in fade-in duration-300 pb-2">
      {/* Top Compact Navigation Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-5 lg:py-3 bg-white rounded-xl lg:rounded-2xl border border-[#EAE6DF] shadow-xs shrink-0">
        {/* Left: Candidate Info & Category */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center text-[#A87D1B] font-black text-[10px] sm:text-xs">
            Q{currentQuestionIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-gray-900 truncate max-w-[130px] sm:max-w-[200px]">{candidateName}</span>
              <span className="text-[8px] sm:text-[10px] text-gray-400 hidden sm:inline">•</span>
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium truncate max-w-[100px] sm:max-w-none hidden sm:inline">{resume.targetRole}</span>
              <span className="text-[8px] sm:text-[10px] bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E] px-1.5 py-0.5 rounded-md font-semibold hidden sm:inline">
                {setup.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Stats & Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <span><strong className="text-gray-900">{questionsCount}</strong> Questions</span>
            <span className="text-gray-300">|</span>
            <span><strong className="text-[#A87D1B]">{followUpsCount}</strong> Follow-ups</span>
          </div>

          <Timer
            totalMinutes={setup.durationMinutes}
            isPaused={isPaused}
            onTimeUp={handleFinalizeInterview}
            onTick={(elapsed) => setElapsedSeconds(elapsed)}
          />
        </div>
      </div>

      {/* Main Horizontal 2-Column Arena */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 items-stretch flex-1 min-h-0">
        {/* Left Column (5 Cols): AI Voice Orb & Persona Pod */}
        <div className="lg:col-span-5 luxury-card p-2 lg:p-5 rounded-2xl lg:rounded-3xl border border-[#EEDD9E]/70 flex flex-col items-center justify-between relative bg-gradient-to-b from-white via-[#FCF9EE]/30 to-white shadow-sm h-[110px] lg:h-full shrink-0 lg:shrink">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#E2B857] to-[#A87D1B] rounded-t-2xl lg:rounded-t-3xl overflow-hidden"></div>

          {/* Dynamic Follow-Up Tag */}
          <div className="w-full flex justify-between items-center">
            {isFollowUp ? (
              <span className="px-2 py-1 bg-amber-100 text-amber-900 text-[10px] lg:text-[11px] font-bold rounded-full border border-amber-300 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> <span className="hidden sm:inline">Reactive </span>Follow-Up
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[9px] lg:text-[10px] font-semibold rounded-full whitespace-nowrap">
                Main Question Pool
              </span>
            )}

            <span className="text-[9px] lg:text-[10px] text-gray-400 font-mono whitespace-nowrap overflow-hidden text-ellipsis ml-2">
              Interviewer: {setup.persona?.name || 'Alexander'}
            </span>
          </div>

          {/* Golden Orb Centerpiece */}
          <div className="flex-1 flex items-center justify-center -mt-12 -mb-12 lg:mt-0 lg:mb-0 transform scale-[0.45] lg:scale-100 origin-center pointer-events-none">
            <AudioVisualizer
              status={interviewerStatus}
              volume={micVolume}
              personaName={setup.persona?.name || 'AI Interviewer'}
            />
          </div>

          {/* Persona Card Footer Info */}
          <div className="hidden lg:block w-full p-3 bg-white/90 rounded-2xl border border-[#EAE6DF] text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900">
              <span>{setup.persona?.name || 'Alexander'}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-normal text-[11px]">{setup.persona?.title}</span>
            </div>
            {isFollowUp && followUpRationale && (
              <p className="text-[11px] text-amber-800 italic">
                "{followUpRationale}"
              </p>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Question Card, Live Answer & Control Toolbar */}
        <div className="lg:col-span-7 flex flex-col gap-3 flex-1 lg:flex-auto h-full min-h-0 overflow-hidden">
          {/* Current Question Card */}
          <div className="luxury-card p-2.5 lg:p-4 rounded-2xl lg:rounded-3xl border border-[#EAE6DF] space-y-1 bg-white shadow-xs shrink-0 max-h-[30%] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#A87D1B] bg-[#FCF9EE] px-2.5 py-1 rounded-md border border-[#EEDD9E]">
                {currentQuestion?.category || 'Question'}
              </span>
              <button
                onClick={handleRepeatQuestion}
                disabled={interviewerStatus === 'thinking'}
                className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Replay Question
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug pt-1">
              "{currentQuestion?.question}"
            </h3>
          </div>

          {/* Live Spoken Answer Display & Text Area */}
          <div className="luxury-card p-2.5 lg:p-4 rounded-2xl lg:rounded-3xl border border-[#EAE6DF] flex-1 flex flex-col bg-white shadow-xs space-y-1 lg:space-y-2 min-h-[100px] lg:min-h-0">
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Mic className="w-3.5 h-3.5" /> Your Spoken or Typed Answer:
              </span>
              <div className="flex items-center gap-2">
                {isMicListening ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Microphone Live ({micVolume}%)
                  </span>
                ) : interviewerStatus === 'speaking' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E]">
                    <Volume2 className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                    Interviewer Speaking
                  </span>
                ) : interviewerStatus === 'thinking' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                    AI Evaluating Answer...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                    Mic Standby
                  </span>
                )}
              </div>
            </div>

            {/* Permission or Browser Support Notice if needed */}
            {!hasSpeechSupport && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Speech-to-text is best supported in Chrome or Edge. You can comfortably type your answers below!</span>
              </div>
            )}
            {micError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{micError}</span>
                </div>
                <button
                  onClick={() => {
                    setMicError('');
                    speechService.startListening();
                  }}
                  className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold hover:bg-red-200 text-[10px]"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="relative flex-1 min-h-0">
              <textarea
                value={candidateAnswerText + (interimSpeech ? ` ${interimSpeech}` : '')}
                onChange={(e) => {
                  setCandidateAnswerText(e.target.value);
                  setInterimSpeech('');
                }}
                placeholder={
                  isMicListening
                    ? 'Listening... Speak into your microphone and your words will appear here in real-time.'
                    : 'Speak into your microphone or type your answer here...'
                }
                rows={4}
                className="w-full h-full p-3 text-xs sm:text-sm bg-gray-50/70 border border-[#EEDD9E]/70 rounded-2xl focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none text-gray-800"
              />
              {(candidateAnswerText || interimSpeech) && (
                <button
                  onClick={handleSubmitAnswer}
                  className="absolute right-2.5 bottom-2.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  Submit Answer <CornerDownLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Integrated Voice Control Toolbar */}
          <div className="p-1.5 lg:p-3 bg-white rounded-2xl lg:rounded-3xl border border-[#EAE6DF] shadow-md flex flex-wrap justify-center lg:justify-between items-center gap-2 shrink-0">
            {/* Left Controls: Pause, Skip */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleTogglePause}
                className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-center gap-1 text-[11px] lg:text-xs font-bold cursor-pointer ${
                  isPaused
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                title={isPaused ? 'Resume Interview' : 'Pause Interview'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleSkipQuestion}
                disabled={interviewerStatus === 'thinking'}
                className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer text-[11px] lg:text-xs font-semibold flex items-center justify-center gap-1"
                title="Skip Question"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Skip</span>
              </button>

              <button
                onClick={handlePreviousQuestion}
                disabled={interviewerStatus === 'thinking' || currentQuestionIndex === 0}
                className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer text-[11px] lg:text-xs font-semibold flex items-center justify-center gap-1"
                title="Previous Question"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Prev</span>
              </button>
            </div>

            {/* Center: Explicit Mic Toggle & Submit Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleToggleMic}
                disabled={interviewerStatus === 'thinking' || isPaused}
                className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[11px] lg:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isMicListening
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 animate-pulse'
                    : interviewerStatus === 'speaking'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
                title={isMicListening ? 'Mute Microphone' : 'Start Speaking'}
              >
                {isMicListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    <Mic className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Mic Live</span>
                  </>
                ) : interviewerStatus === 'speaking' ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Interrupt</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>Mic Off</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={interviewerStatus === 'thinking' || (!candidateAnswerText && !interimSpeech)}
                className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[11px] lg:text-xs font-bold text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md ${
                  candidateAnswerText || interimSpeech
                    ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed opacity-60'
                }`}
              >
                <CornerDownLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Submit</span>
              </button>
            </div>

            {/* Right: End */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowEndModal(true)}
                className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-[11px] lg:text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                title="End Interview"
              >
                <Square className="w-3 h-3 fill-red-600" />
                <span className="hidden lg:inline">End</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Live Transcript Drawer */}
      <TranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        transcript={transcript}
        currentInterimAnswer={interimSpeech}
      />

      {/* End Interview Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE6DF] shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Finish & Evaluate Interview?</h3>
              <p className="text-xs text-gray-500">
                You have answered {transcript.filter((t) => t.role === 'candidate').length} questions. Gemini will analyze your technical answers, communication, and resume alignment to generate your final scorecard.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  handleFinalizeInterview();
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Generate Final Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
