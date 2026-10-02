import React from 'react';
import {
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle2,
  Play,
  Bot,
  Mic,
  Award,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Users,
  Code2,
  Check,
  BarChart3,
  Lock,
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../data/sampleResumes';
import CodeBackground from './ui/CodeBackground';

export default function HeroLanding({ onStartUpload, onQuickStartSample, onOpenAuth, currentUser }) {
  return (
    <div className="w-full space-y-16 sm:space-y-24 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Spacious, bold, high-converting)           */}
      {/* ============================================================ */}
      <section className="relative text-center max-w-5xl mx-auto space-y-10 px-4 pt-20 pb-32">
        
        {/* Animated Luxury Mesh Gradient Background & Floating Structures */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
          <div className="absolute inset-[-100%] rounded-[100%] bg-gradient-to-b from-transparent to-[#F7EFCF]/20 blur-3xl opacity-50"></div>
          
          <CodeBackground className="opacity-80" />
          
          {/* Subtle Dot Grid Structure */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNENEFGMzciIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] animate-pulse-ring opacity-60"></div>
          
          {/* Floating Words (Premium Watermark Style) */}
          <div className="absolute top-[5%] left-[2%] text-[#D4AF37] opacity-[0.12] font-black tracking-tighter text-3xl md:text-5xl animate-float whitespace-nowrap rotate-[-4deg]">System Design</div>
          <div className="absolute top-[70%] left-[5%] text-[#8C6314] opacity-[0.08] font-bold tracking-widest text-2xl md:text-4xl animate-float animation-delay-2000 whitespace-nowrap rotate-[2deg]">BEHAVIORAL</div>
          <div className="absolute top-[15%] right-[0%] text-[#C59A27] opacity-[0.1] font-semibold text-xl md:text-3xl animate-float animation-delay-4000 whitespace-nowrap rotate-[6deg]">Algorithms</div>
          <div className="absolute top-[75%] right-[8%] text-[#D4AF37] opacity-[0.11] font-black tracking-tight text-3xl md:text-5xl animate-float whitespace-nowrap rotate-[-3deg]">Leadership</div>
          <div className="absolute top-[90%] left-[40%] text-[#8C6314] opacity-[0.09] font-medium text-lg md:text-2xl animate-float animation-delay-2000 whitespace-nowrap">Data Structures</div>

          {/* Original Aurora Mesh */}
          <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-gradient-to-br from-[#D4AF37]/25 to-[#F7EFCF]/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute top-[10%] right-[15%] w-[450px] h-[450px] bg-gradient-to-bl from-[#E3C769]/30 to-[#FCF9EE]/50 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[30%] left-[25%] w-[600px] h-[600px] bg-gradient-to-t from-[#8C6314]/15 to-[#D4AF37]/25 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Top Feature Pill */}
        <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-white/70 backdrop-blur-md text-[#855E15] border border-[#EEDD9E]/50 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default animate-float">
          <Mic className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <span className="tracking-wide">AI Voice Interviewer</span>
        </div>

        {/* Big Bold Headline */}
        <div className="relative">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 tracking-tight leading-[1.15] mb-2 drop-shadow-sm">
            Land Your Dream Role.<br/>
            <span className="gold-gradient-text relative inline-block mt-2">
              Train with Voice AI.
              <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50 blur-sm rounded-full"></div>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="relative text-base sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
          Hyper-realistic voice interviews, tailored to your resume. Get real-time feedback and <strong className="text-gray-800 font-bold border-b-2 border-[#D4AF37]/30 pb-0.5">adaptive follow-ups</strong>.
        </p>

        {/* Action CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10">
          <button
            onClick={onStartUpload}
            className="group w-full sm:w-auto px-8 py-4 text-sm font-bold text-white rounded-2xl gold-gradient-btn flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgb(212,175,55,0.6)] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1"
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            Upload Your Resume (PDF)
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onQuickStartSample(SAMPLE_RESUMES[0])}
            className="group w-full sm:w-auto px-8 py-4 text-sm font-bold text-gray-800 bg-white/80 backdrop-blur-md border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-white rounded-2xl shadow-md flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="bg-[#FCF9EE] p-1.5 rounded-lg border border-[#EEDD9E]/50 group-hover:bg-[#F7EFCF] transition-colors">
              <Play className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
            </div>
            Try 1-Click Instant Demo
          </button>
        </div>

        {/* Email Sign In / Sign Up Quick Access (Hidden once logged in) */}
        <div className="relative z-10">
          {!currentUser ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm">
              <span className="text-gray-500 font-medium">Want to save your scorecards & interview history?</span>
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="font-bold text-[#855E15] hover:text-[#583C15] hover:underline cursor-pointer transition-colors"
              >
                Sign In
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                className="font-bold text-[#855E15] hover:text-[#583C15] hover:underline cursor-pointer transition-colors"
              >
                Create Free Account
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Welcome back, <strong>{currentUser.name}</strong> • All scorecards automatically synced</span>
            </div>
          )}
        </div>


        {/* Trust Badges */}
        <div className="relative flex flex-wrap items-center justify-center gap-5 sm:gap-10 pt-8 text-sm text-gray-600 font-semibold border-t border-gray-100/50 mt-10">
          <span className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs hover:bg-white transition-colors cursor-default">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Guest Practice
          </span>
          <span className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs hover:bg-white transition-colors cursor-default">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" /> 100% Privacy
          </span>
          <span className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs hover:bg-white transition-colors cursor-default">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" /> Live Voice
          </span>
          <span className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs hover:bg-white transition-colors cursor-default">
            <Award className="w-4 h-4 text-blue-500 shrink-0" /> Exec Scorecard
          </span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. INTERACTIVE LIVE VOICE SIMULATION PREVIEW                 */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="luxury-card rounded-3xl border border-[#EEDD9E]/80 shadow-xl overflow-hidden bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out">
          {/* Top Window Bar */}
          <div className="bg-[#FAF8F5] px-5 py-3.5 border-b border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="ml-2 text-xs font-bold text-gray-500 font-mono">
                Live Voice Interview Simulation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Web Audio Connected
              </span>
              <span className="text-[10px] uppercase font-bold text-[#855E15] bg-[#FCF9EE] px-2.5 py-0.5 rounded-full border border-[#EEDD9E]">
                Voice ↔ Voice Mode
              </span>
            </div>
          </div>

          {/* Dialogue Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Visual AI Speaker Node (4 cols) */}
            <div className="lg:col-span-4 bg-gradient-to-b from-[#FCF9EE]/70 to-white p-6 rounded-2xl border border-[#EEDD9E]/60 text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F7EFCF] flex items-center justify-center shadow-lg animate-pulse-ring">
                  <Bot className="w-9 h-9 text-[#583C15]" />
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <Mic className="w-2.5 h-2.5 text-white" />
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900">Alexander</h3>
                <p className="text-xs text-[#A87D1B] font-medium">Principal Systems Architect</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className="w-1 h-3 bg-[#D4AF37] rounded-full animate-bounce"></span>
                  <span className="w-1 h-5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 h-2 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1 h-4 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.45s]"></span>
                </div>
              </div>

              <div className="w-full pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>Latency: <strong className="text-emerald-600">~240ms</strong></span>
                <span>Model: <strong className="text-gray-700">LLaMA 3.3 70B</strong></span>
              </div>
            </div>

            {/* Right Column: Spoken Dialogue Exchange (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              {/* Step 1: AI Prompt */}
              <div className="p-3.5 bg-[#FCF9EE]/90 rounded-2xl border border-[#EEDD9E]/70 space-y-1">
                <div className="flex items-center gap-1.5 text-[#855E15] font-bold text-xs">
                  <Bot className="w-3.5 h-3.5 text-[#D4AF37]" /> AI Interviewer:
                </div>
                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
                  "Can you walk me through the authentication architecture and caching layer in your JobLynk platform?"
                </p>
              </div>

              {/* Step 2: Candidate Spoken Response */}
              <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200 ml-4 sm:ml-6 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" /> You (Spoken Answer):
                </div>
                <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
                  "I implemented stateless JWT authentication with automated token refresh and a distributed Redis caching layer to handle 10k req/sec..."
                </p>
              </div>

              {/* Step 3: Dynamic Follow-Up Probe */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 space-y-1 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> AI Interviewer (Dynamic Reactive Probe):
                  </div>
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Follow-Up Generated
                  </span>
                </div>
                <p className="text-amber-950 font-medium text-xs sm:text-sm leading-relaxed">
                  "You mentioned Redis caching. How did you handle cache invalidation and stampede prevention during peak traffic spikes?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PRE-LOADED 1-CLICK CANDIDATE PROFILES                     */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Try Pre-Loaded Candidate Profiles
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Test instant interview generation with real engineering resumes across various domains and seniorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_RESUMES.map((sample) => (
            <div
              key={sample.id}
              className="group relative p-6 rounded-[2rem] border border-[#EAE6DF] bg-white flex flex-col justify-between space-y-5 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.15)] transition-all duration-500 ease-out overflow-hidden"
            >
              {/* Subtle top glare/gradient effect */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#FCF9EE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="space-y-4 relative z-10">
                {/* Header with Monogram */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#D4AF37]/20 to-[#F7EFCF]/40 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5DE98] via-[#D4AF37] to-[#8C6314] p-[1px] shadow-sm overflow-hidden">
                      <img 
                        src={sample.image} 
                        alt={sample.name} 
                        className="w-full h-full rounded-[14px] object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 shadow-2xs">
                    {sample.experienceLevel.split(' ')[0]}
                  </span>
                </div>

                {/* Name & Target Role */}
                <div>
                  <h3 className="font-extrabold text-[17px] text-gray-900 tracking-tight leading-tight group-hover:text-[#855E15] transition-colors duration-300">
                    {sample.name}
                  </h3>
                  <p className="text-xs text-[#A87D1B] font-semibold mt-0.5">{sample.targetRole}</p>
                </div>

                {/* Summary */}
                <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                  {sample.summary}
                </p>

                {/* Key Skills Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(sample.skills.frontend || Object.values(sample.skills)[0] || []).slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-bold bg-white text-gray-600 rounded-md border border-gray-200 shadow-2xs group-hover:border-[#EEDD9E] group-hover:text-[#855E15] transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onQuickStartSample(sample)}
                className="relative z-10 w-full py-3 text-xs font-bold text-[#855E15] bg-white hover:bg-[#FCF9EE] border border-[#EEDD9E] rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer overflow-hidden group/btn shadow-xs hover:shadow-md hover:border-[#D4AF37]"
              >
                <Play className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] group-hover/btn:scale-110 transition-transform" />
                <span className="relative z-10">Launch Interview</span>
                <ChevronRight className="w-4 h-4 text-[#A87D1B] group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. THE 4-STAGE AUTONOMOUS PIPELINE (HOW IT WORKS)           */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E]">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            From Your Resume to Interview Mastery
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            A frictionless, intelligent workflow designed to simulate real high-stakes engineering interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Resume Extraction',
              icon: FileText,
              tag: 'Instant Setup',
              description:
                'Upload your PDF resume. Our AI instantly extracts your projects, skills, and experience without manual entry.'
            },
            {
              step: '02',
              title: 'Adaptive Questioning',
              icon: Cpu,
              tag: 'Tailored Interview',
              description:
                'Receive a personalized interview roadmap tailored to your specific seniority level and technology stack.'
            },
            {
              step: '03',
              title: 'Live Voice Conversation',
              icon: Mic,
              tag: 'Real-Time AI',
              description:
                'Speak naturally. The AI evaluates your responses instantly and asks dynamic follow-ups to test your true depth.'
            },
            {
              step: '04',
              title: 'Executive Scorecard',
              icon: Award,
              tag: 'Actionable Insights',
              description:
                'Get a detailed performance scorecard with rubric grades, identified strengths, blind spots, and ideal answers.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-7 rounded-[2rem] border border-[#EAE6DF] bg-white flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.15)] transition-all duration-500 ease-out overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#FCF9EE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] to-[#F5DE98] opacity-80 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-sm font-mono">
                      {item.step}
                    </span>
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-tr from-[#D4AF37]/20 to-[#F7EFCF]/40 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5DE98] via-[#D4AF37] to-[#8C6314] p-[1px] shadow-sm">
                        <div className="w-full h-full rounded-[10px] bg-gradient-to-b from-white to-[#FCF9EE] flex items-center justify-center text-[#A87D1B]">
                          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="inline-block text-[10px] font-black tracking-wider uppercase text-[#855E15] bg-[#FCF9EE] px-2.5 py-1 rounded-full border border-[#EEDD9E] shadow-2xs group-hover:bg-[#F7EFCF] transition-colors duration-300">
                    {item.tag}
                  </span>

                  <div>
                    <h3 className="font-extrabold text-[17px] text-gray-900 group-hover:text-[#855E15] transition-colors duration-300 tracking-tight leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. 4 EXECUTIVE INTERVIEWER PERSONAS                          */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E]">
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
            Realistic Personas
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Practice with Four Distinct Interviewers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Choose the style of questioning that fits your upcoming interview stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              name: 'Alexander',
              title: 'Principal Systems Architect',
              focus: 'Systems, DBs, Caching, Edge Cases',
              description:
                'Focuses deeply on latency trade-offs, architecture scalability, data partitioning, and defensive programming.'
            },
            {
              name: 'Sophia',
              title: 'VP of Engineering & Tech Lead',
              focus: 'Full-Stack, Product Vision, Code Quality',
              description:
                'Conversational and balanced. Challenges system design, engineering leadership, and cross-functional decisions.'
            },
            {
              name: 'Elena',
              title: 'Head of Talent & Engineering HR',
              focus: 'STAR Behavioral, Communication, Culture',
              description:
                'Probes team conflict resolution, engineering ownership, stakeholder management, and project execution.'
            },
            {
              name: 'Dave',
              title: 'Supportive Interview Coach',
              focus: 'Guidance, Hints, Growth, Mentorship',
              description:
                'Provides gentle guidance, hints, and acts as a mentor to help you improve and build confidence.'
            }
          ].map((persona, idx) => (
            <div
              key={idx}
              className="group relative p-7 rounded-[2rem] border border-[#EAE6DF] bg-white flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.15)] transition-all duration-500 ease-out overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#FCF9EE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="space-y-4 relative z-10">
                <div className="relative inline-block mb-2">
                  <div className="absolute -inset-1.5 rounded-[18px] bg-gradient-to-tr from-[#D4AF37]/20 to-[#F7EFCF]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5DE98] via-[#D4AF37] to-[#8C6314] p-[1px] shadow-sm">
                    <div className="w-full h-full rounded-[15px] bg-gradient-to-b from-white to-[#FCF9EE] flex items-center justify-center text-[#855E15] font-black text-xl">
                      {persona.name[0]}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-extrabold text-[19px] text-gray-900 group-hover:text-[#855E15] transition-colors duration-300 tracking-tight">
                    {persona.name}
                  </h3>
                  <p className="text-[13px] text-[#A87D1B] font-semibold mt-0.5">
                    {persona.title}
                  </p>
                </div>
                
                <div className="pt-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                    Primary Focus
                  </span>
                  <p className="text-[11px] font-bold text-gray-700 bg-white shadow-2xs p-2.5 rounded-xl border border-gray-200 group-hover:border-[#EEDD9E] transition-colors duration-300 leading-tight">
                    {persona.focus}
                  </p>
                </div>
                
                <p className="text-[13px] text-gray-500 leading-relaxed font-medium pt-1">
                  {persona.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. COMPARISON: WHY MOCKMATE AI LEADS                         */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E]">
            <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            The Data Speaks
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Why MockMate AI is 10x More Effective
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium">
            Stop relying on generic chatbots. Experience the difference of a domain-specific, real-time voice architecture designed strictly for engineering interviews.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "240ms", label: "Ultra-Low Latency", color: "text-emerald-600" },
            { value: "50+", label: "Engineering Roles", color: "text-[#855E15]" },
            { value: "24/7", label: "Availability", color: "text-blue-600" },
            { value: "100%", label: "Free & Private", color: "text-purple-600" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-xs hover:shadow-md transition-shadow">
              <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Premium Comparison Table */}
        <div className="relative luxury-card rounded-[2rem] border border-[#EAE6DF] bg-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-[#FCF9EE]/80 via-[#F7EFCF]/30 to-transparent pointer-events-none"></div>
          
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
              <thead className="border-b border-[#EAE6DF]">
                <tr>
                  <th className="p-6 font-bold text-gray-400 uppercase tracking-wider text-xs">Feature Capability</th>
                  <th className="p-6 font-bold text-gray-400 uppercase tracking-wider text-xs text-center">Traditional Mocks</th>
                  <th className="p-6 font-bold text-gray-400 uppercase tracking-wider text-xs text-center">Generic Chatbots</th>
                  <th className="p-6 font-black text-[#855E15] uppercase tracking-wider text-xs text-center bg-gradient-to-b from-[#F5DE98]/20 to-transparent border-x border-[#EEDD9E]/30 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#A87D1B]"></div>
                    MockMate Voice AI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  {
                    feature: "Resume Understanding",
                    sub: "PDF Context Extraction",
                    trad: { text: "Manual / Human Review", icon: "warn" },
                    bot: { text: "Copy-Paste Only", icon: "fail" },
                    mock: { text: "Deep Gemini Vectorization", icon: "pass" }
                  },
                  {
                    feature: "Interaction Speed",
                    sub: "Response Latency",
                    trad: { text: "Human Dependent", icon: "warn" },
                    bot: { text: "Text-Based (Slow)", icon: "fail" },
                    mock: { text: "Sub-Second Voice Stream", icon: "pass" }
                  },
                  {
                    feature: "Follow-Up Questions",
                    sub: "Adaptive Probing",
                    trad: { text: "Inconsistent Quality", icon: "warn" },
                    bot: { text: "Scripted / Generic", icon: "fail" },
                    mock: { text: "Reactive to Tech Trade-offs", icon: "pass" }
                  },
                  {
                    feature: "Performance Feedback",
                    sub: "Rubric Grading",
                    trad: { text: "Takes 24-48 Hours", icon: "warn" },
                    bot: { text: "Basic 1-10 Rating", icon: "fail" },
                    mock: { text: "Instant 5-Dimension Report", icon: "pass" }
                  },
                  {
                    feature: "Cost Per Session",
                    sub: "Financial Investment",
                    trad: { text: "$100 - $300 / Hour", icon: "fail" },
                    bot: { text: "$20 / Month Subs", icon: "warn" },
                    mock: { text: "100% Free Access", icon: "pass" }
                  }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-gray-900">{row.feature}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{row.sub}</div>
                    </td>
                    <td className="p-6 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center gap-1.5">
                        {row.trad.icon === 'fail' ? <X className="w-5 h-5 text-rose-400" /> : <div className="w-2 h-2 rounded-full bg-amber-400"></div>}
                        <span className="text-xs">{row.trad.text}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center gap-1.5">
                        {row.bot.icon === 'fail' ? <X className="w-5 h-5 text-rose-400" /> : <div className="w-2 h-2 rounded-full bg-amber-400"></div>}
                        <span className="text-xs">{row.bot.text}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center border-x border-[#EEDD9E]/30 bg-gradient-to-b from-[#FCF9EE]/20 to-transparent">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="bg-emerald-100 p-1 rounded-full">
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        </div>
                        <span className="text-xs font-bold text-emerald-800">{row.mock.text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. BIG CALL TO ACTION BANNER                                 */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 mt-20">
        <div className="relative p-8 sm:p-14 rounded-[2rem] bg-gradient-to-br from-[#FCF9EE] via-[#F7EFCF] to-[#FCF9EE] border border-[#EEDD9E]/80 shadow-2xl text-center space-y-6 overflow-hidden hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:-translate-y-1 transition-all duration-500 ease-out z-10">
          
          {/* Internal background blobs for the CTA */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-80 animate-blob pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#D4AF37] rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Ready to Walk In with Complete Confidence?
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Upload your resume or launch a sample profile to experience real-time AI voice interviewing right now. No credit card required.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartUpload}
              className="group w-full sm:w-auto px-8 py-4 text-sm font-bold text-white rounded-2xl gold-gradient-btn flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgb(212,175,55,0.6)] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              Upload Resume (PDF)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onQuickStartSample(SAMPLE_RESUMES[0])}
              className="group w-full sm:w-auto px-8 py-4 text-sm font-bold text-gray-900 bg-white/90 backdrop-blur-md border border-[#EAE6DF] hover:border-[#D4AF37] hover:bg-white rounded-2xl shadow-md flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="bg-[#FCF9EE] p-1.5 rounded-lg border border-[#EEDD9E]/50 group-hover:bg-[#F7EFCF] transition-colors">
                <Play className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
              </div>
              Launch Instant Demo
            </button>
          </div>

          <p className="relative z-10 text-xs text-gray-500 font-medium mt-4">
            100% Free & Private in your browser • Practice as guest or link to your personal email account
          </p>

          <div className="relative z-10 pt-2">
            {!currentUser ? (
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-gray-500 font-medium">Want your performance history saved?</span>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signup')}
                  className="font-bold text-[#855E15] hover:text-[#583C15] hover:underline cursor-pointer"
                >
                  Sign Up with Email
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('login')}
                  className="font-bold text-[#855E15] hover:text-[#583C15] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 text-xs font-bold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Log in active: {currentUser.name} ({currentUser.email})
              </div>
            )}
          </div>
        </div>
      </section>



    </div>
  );
}
