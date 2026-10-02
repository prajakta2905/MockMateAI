import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, CheckCircle2, ArrowRight, User, Briefcase, GraduationCap, Cpu, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfParser';
import { analyzeResumeWithGemini, cleanCandidateName } from '../services/gemini';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

export default function ResumeUpload({ onResumeAnalyzed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text' | 'samples'
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef(null);

  const processResumeText = async (text, fileName = 'Uploaded Resume') => {
    if (!text || text.trim().length < 20) {
      setErrorMsg('The resume text appears empty. Please paste your resume text or upload another file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStage('Reading document structure...');

    try {
      await new Promise(r => setTimeout(r, 200));
      setProcessingStage('AI extracting actual name, projects, skills & achievements...');
      
      const analysis = await analyzeResumeWithGemini(text);
      setParsedData(analysis);
      setProcessingStage('Profile extracted successfully!');
    } catch (err) {
      console.error('Resume parsing failed:', err);
      setErrorMsg(err.message || 'Failed to analyze resume. Please try a sample resume or paste text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStage('Extracting text from PDF document...');

    try {
      const text = await extractTextFromPDF(file);
      await processResumeText(text, file.name);
    } catch (err) {
      console.error('Error reading file:', err);
      setErrorMsg(err.message || 'Could not parse PDF. Try pasting the text directly in the "Paste Text" tab.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample) => {
    setParsedData({ ...sample });
  };

  const handleConfirmAndProceed = () => {
    if (parsedData) {
      onResumeAnalyzed(parsedData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Premium Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E] shadow-sm">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          Step 1 • Resume Analysis
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Personalize Your Experience
        </h2>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto font-medium">
          Upload your resume to tailor the interview to your unique background and tech stack.
        </p>
      </div>

      {/* Tabs Switcher */}
      {!parsedData && (
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1.5 rounded-2xl border border-[#EAE6DF] inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'text'
                  ? 'bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Paste Text
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'samples'
                  ? 'bg-[#FCF9EE] text-[#855E15] border border-[#EEDD9E] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Sample Profiles
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[11px] font-semibold underline hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload Dropzone (Premium Large) */}
      {!parsedData && activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative p-12 sm:p-20 min-h-[380px] flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-[#D4AF37] bg-[#FCF9EE]/80 scale-[1.02] shadow-xl'
              : 'border-[#EAE6DF] bg-white hover:border-[#D4AF37] hover:bg-[#FCF9EE]/30 shadow-sm hover:shadow-md'
          } ${isProcessing ? 'pointer-events-none' : ''}`}
        >
          {isProcessing ? (
            <div className="space-y-5 py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-md border border-[#EEDD9E] flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-[#D4AF37] animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-900">{processingStage}</h3>
                <p className="text-sm text-gray-500 font-medium">Extracting candidate name, projects, and tech stack...</p>
              </div>
              <div className="w-64 mx-auto h-2 bg-gray-100 rounded-full overflow-hidden mt-4 shadow-inner">
                <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E2B857] animate-pulse w-3/4 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-gradient-to-br from-[#FCF9EE] to-white border border-[#EEDD9E] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-[#A87D1B]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Upload Resume
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Tap here to upload your PDF
                </p>
              </div>
              <div className="pt-6 flex flex-col items-center gap-4 w-full">
                {/* Completely Native, Visible Input - Guaranteed to work */}
                <div className="w-full max-w-sm p-4 bg-[#FCF9EE] border-2 border-[#EEDD9E] rounded-2xl shadow-sm text-left">
                  <p className="text-xs font-bold text-[#855E15] uppercase tracking-wider mb-3 text-center">
                    Upload Your Resume
                  </p>
                  <input
                    type="file"
                    disabled={isProcessing}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                    className="block w-full text-sm text-gray-500 cursor-pointer
                      file:mr-4 file:py-2.5 file:px-6
                      file:rounded-xl file:border-0
                      file:text-sm file:font-bold
                      file:bg-[#D4AF37] file:text-white
                      hover:file:bg-[#8C6314] hover:file:cursor-pointer transition-all"
                  />
                </div>
                
                <span className="text-[11px] text-gray-400 mt-2 max-w-xs mx-auto">
                  Note: A native file picker is being used for maximum mobile compatibility.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Text Tab */}
      {!parsedData && activeTab === 'text' && (
        <div className="luxury-card p-4 rounded-3xl space-y-3 bg-white">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
            Paste Full Resume Text
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={6}
            placeholder="Paste your resume contents here (Name, Projects, Skills, Experience)..."
            className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => processResumeText(pastedText, 'Pasted Resume')}
              disabled={isProcessing || pastedText.trim().length < 20}
              className="px-5 py-2 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Analyze Text
            </button>
          </div>
        </div>
      )}

      {/* Sample Resumes Tab */}
      {!parsedData && activeTab === 'samples' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_RESUMES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="luxury-card p-3.5 rounded-2xl cursor-pointer hover:border-[#D4AF37] hover:shadow-xs transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FCF9EE] border border-[#EEDD9E] flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={sample.image} alt={sample.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#A87D1B] transition-colors">
                      {sample.name}
                    </h4>
                    <p className="text-[10px] text-gray-500">{sample.targetRole}</p>
                  </div>
                </div>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {sample.experienceLevel}
                </span>
              </div>

              <div className="mt-2 text-[11px] text-gray-600 line-clamp-1">
                {sample.summary}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  {(sample.skills.frontend || Object.values(sample.skills)[0] || []).slice(0, 3).join(', ')}
                </span>
                <span className="text-[11px] font-bold text-[#A87D1B] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Use Profile <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extracted Profile Preview Card (Compact Single-Screen View) */}
      {parsedData && (
        <div className="luxury-card p-5 sm:p-6 rounded-3xl space-y-4 border border-[#EEDD9E]/60 bg-white relative overflow-hidden">
          {/* Status Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Profile Extracted & Ready
                </h3>
                <p className="text-[10px] text-gray-500">Review or adjust your details before setup</p>
              </div>
            </div>

            <button
              onClick={() => setParsedData(null)}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Change
            </button>
          </div>

          {/* Editable Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FCF9EE]/50 rounded-2xl border border-[#EEDD9E]/50">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-[#A87D1B]" /> Name
              </label>
              <input
                type="text"
                value={parsedData.name || ''}
                onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-bold text-gray-900 bg-white border border-[#EAE6DF] rounded-lg focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">
                <Briefcase className="w-2.5 h-2.5 text-[#A87D1B]" /> Target Role
              </label>
              <input
                type="text"
                value={parsedData.targetRole || ''}
                onChange={(e) => setParsedData({ ...parsedData, targetRole: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-bold text-gray-900 bg-white border border-[#EAE6DF] rounded-lg focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-500 flex items-center gap-1">
                <GraduationCap className="w-2.5 h-2.5 text-[#A87D1B]" /> Experience
              </label>
              <input
                type="text"
                value={parsedData.experienceLevel || ''}
                onChange={(e) => setParsedData({ ...parsedData, experienceLevel: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-bold text-gray-900 bg-white border border-[#EAE6DF] rounded-lg focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          {/* Skills & Projects Horizontal Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Skills */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#D4AF37]" /> Key Technical Skills
              </span>
              <textarea
                value={Object.entries(parsedData.skills || {}).flatMap(([_, list]) => 
                  Array.isArray(list) ? list : []
                ).join(', ')}
                onChange={(e) => {
                  setParsedData({ 
                    ...parsedData, 
                    skills: { all: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } 
                  });
                }}
                rows={3}
                placeholder="React, Java, System Design..."
                className="w-full p-2 text-[11px] font-medium text-gray-800 bg-white border border-[#EAE6DF] rounded-xl focus:border-[#D4AF37] outline-none resize-none shadow-2xs"
              />
            </div>

            {/* Projects */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#D4AF37]" /> Main Project for Interview
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={parsedData.projects?.[0]?.name || ''}
                  onChange={(e) => {
                    const newProjects = [...(parsedData.projects || [])];
                    if (newProjects.length === 0) newProjects.push({});
                    newProjects[0].name = e.target.value;
                    setParsedData({ ...parsedData, projects: newProjects });
                  }}
                  placeholder="Project Name (e.g. E-commerce API)"
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-gray-900 bg-white border border-[#EAE6DF] rounded-xl focus:border-[#D4AF37] outline-none shadow-2xs"
                />
                <input
                  type="text"
                  value={(parsedData.projects?.[0]?.techStack || []).join(', ')}
                  onChange={(e) => {
                    const newProjects = [...(parsedData.projects || [])];
                    if (newProjects.length === 0) newProjects.push({});
                    newProjects[0].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setParsedData({ ...parsedData, projects: newProjects });
                  }}
                  placeholder="Tech Stack (e.g. React, Node, AWS)"
                  className="w-full px-2.5 py-1.5 text-[11px] text-gray-600 bg-white border border-[#EAE6DF] rounded-xl focus:border-[#D4AF37] outline-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConfirmAndProceed}
              className="px-5 py-2.5 text-xs font-bold text-white rounded-xl gold-gradient-btn flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Proceed to Interview Setup <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
