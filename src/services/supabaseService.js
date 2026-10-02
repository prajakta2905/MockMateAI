import { supabase, isSupabaseConfigured, getOrCreateUserId } from './supabaseClient';
import { cleanCandidateName } from './gemini';

/**
 * 1. Save Candidate Profile (Name, Role, Skills, Projects only)
 */
export async function saveResumeToSupabase(resumeData) {
  if (!isSupabaseConfigured || !supabase || !resumeData) {
    return { resumeId: null, error: 'Supabase not configured' };
  }

  try {
    const userId = getOrCreateUserId();
    const candidateName = cleanCandidateName(resumeData.name) || 'Candidate';

    const payload = {
      user_id: userId,
      candidate_name: candidateName,
      target_role: resumeData.targetRole || 'Software Engineer',
      skills: resumeData.skills || [],
      projects: (resumeData.projects || []).map(p => ({
        name: p.name || 'Project',
        techStack: p.techStack || p.tech || [],
        description: p.description || ''
      }))
    };

    const { data, error } = await supabase
      .from('resumes')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase saveResume warning:', error.message);
      return { resumeId: null, error: error.message };
    }

    return { resumeId: data?.id, error: null };
  } catch (err) {
    console.warn('Supabase saveResume error:', err);
    return { resumeId: null, error: err.message };
  }
}

/**
 * 2. Save Final Interview Scorecard + Session Info + Full Q&A Transcript in one clean record
 */
export async function saveInterviewReportToSupabase({ report, interviewData, resumeId }) {
  if (!isSupabaseConfigured || !supabase || !report || !interviewData) {
    return { success: false, error: 'Missing report or interview data' };
  }

  try {
    const userId = getOrCreateUserId();
    const candidateName = cleanCandidateName(interviewData.resume?.name) || 'Candidate';
    const targetRole = interviewData.resume?.targetRole || 'Software Engineer';
    const interviewType = interviewData.interviewSetup?.type?.toUpperCase() || 'FULL MOCK';
    const durationFormatted = interviewData.stats?.durationFormatted || '15m 0s';

    // Format clean Q&A transcript (only question, answer, and speaker)
    const cleanTranscript = (interviewData.transcript || []).map((t) => ({
      speaker: t.role || 'speaker',
      text: t.text || '',
      timestamp: t.timestamp || '',
      isFollowUp: Boolean(t.isFollowUp)
    }));

    const payload = {
      user_id: userId,
      resume_id: resumeId || null,
      candidate_name: candidateName,
      target_role: targetRole,
      interview_type: interviewType,
      duration_formatted: durationFormatted,
      overall_score: Number(report.overallScore) || 75,
      hiring_decision: report.verdict || report.recommendation || 'Hire',
      category_scores: report.categoryScores || {},
      executive_summary: report.executiveSummary || report.summary || '',
      strengths: report.strengths || [],
      areas_for_improvement: report.areasToImprove || report.areasForImprovement || [],
      transcript: cleanTranscript
    };

    const { data, error } = await supabase
      .from('interview_reports')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase saveReport warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, reportId: data?.id, error: null };
  } catch (err) {
    console.warn('Supabase saveReport error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Fetch all past interview sessions for the user
 */
export async function fetchInterviewHistory() {
  if (!isSupabaseConfigured || !supabase) {
    return { history: [], error: 'Supabase not configured' };
  }

  try {
    const userId = getOrCreateUserId();

    const { data, error } = await supabase
      .from('interview_reports')
      .select('id, candidate_name, target_role, interview_type, duration_formatted, overall_score, hiring_decision, category_scores, executive_summary, transcript, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchHistory warning:', error.message);
      return { history: [], error: error.message };
    }

    return { history: data || [], error: null };
  } catch (err) {
    console.warn('Supabase fetchHistory error:', err);
    return { history: [], error: err.message };
  }
}
