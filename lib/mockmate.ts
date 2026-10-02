export const SAMPLE_RESUME = `AARAV MEHTA · SOFTWARE ENGINEERING STUDENT
Pune, India · aarav.mehta@example.com · github.com/aaravmehta-demo

PROFILE
Final-year computer science student interested in full-stack engineering and practical AI tools.

PROJECTS
CampusConnect — Built a campus event web app using Next.js, TypeScript and PostgreSQL. Added event discovery, registrations and organizer dashboards. The pilot supported 450 students across 12 clubs.
Reliability work — Added request validation and email reminders after reviewing signup failures. Signup completion improved by 35% during the fictional pilot.
StudyBuddy — Led a four-person team to build a peer study matching tool. Owned API design, weekly planning and the final demo. Delivered the project in six weeks.

SKILLS
TypeScript, React, Next.js, Node.js, PostgreSQL, REST APIs, Git, teamwork, project planning.`;

export const SAMPLE_CLAIMS = [
  { id: "campusconnect", claim: "Built CampusConnect with Next.js, TypeScript and PostgreSQL for a pilot of 450 students across 12 clubs.", category: "Project ownership" },
  { id: "signup-improvement", claim: "Improved signup completion by 35% after adding request validation and email reminders.", category: "Measurable result" },
  { id: "team-leadership", claim: "Led a four-person team to deliver StudyBuddy in six weeks and owned API design and weekly planning.", category: "Teamwork" },
  { id: "backend-skills", claim: "Used Node.js, PostgreSQL and REST APIs across student projects.", category: "Technical skills" },
];

export type EvaluationScores = { technicalAccuracy: number; communication: number; relevance: number; examplesUsed: number; timeManagement: number };
export type AnswerEvaluation = { scores: EvaluationScores; feedback: string; strengths: string[]; improvements: string[]; hint: string; nextQuestion: string; provider?: "Gemini" | "local" };
export type Answer = { question: string; answer: string; claimId: string; evaluation?: AnswerEvaluation };

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function createPracticeReport(answers: Answer[]) {
  const dimensions = [
    { key: "technicalAccuracy", label: "Technical accuracy", hint: "Explain why your solution works; the local estimate cannot verify facts." },
    { key: "communication", label: "Communication", hint: "Lead with the main point, then explain your reasoning." },
    { key: "relevance", label: "Relevance", hint: "Tie each answer directly to the question and selected role." },
    { key: "examplesUsed", label: "Examples used", hint: "Use a concrete project, coursework, club, or volunteer example." },
    { key: "timeManagement", label: "Time management", hint: "Keep the answer focused; this is estimated from answer length." },
  ];
  const words = (answer: string) => countWords(answer);
  const scoreFallback = (answer: Answer, key: keyof EvaluationScores) => {
    if (answer.evaluation) return answer.evaluation.scores[key];
    const text = answer.answer.toLowerCase();
    const wordCount = words(text);
    const hasExample = /\b(project|class|team|college|club|built|created|designed|implemented|tested|led|improved|for example|because)\b|\b\d+\b/.test(text);
    if (key === "technicalAccuracy") return Math.min(10, 3 + (wordCount >= 30 ? 2 : 0) + (hasExample ? 2 : 0));
    if (key === "communication") return Math.min(10, 2 + (wordCount >= 20 ? 2 : 0) + (/[.!?]/.test(text) ? 2 : 0) + (wordCount > 180 ? 0 : 2));
    if (key === "relevance") return Math.min(10, 3 + (wordCount >= 15 ? 2 : 0) + (hasExample ? 2 : 0));
    if (key === "examplesUsed") return Math.min(10, 2 + (hasExample ? 5 : 0));
    return Math.max(2, Math.min(10, wordCount < 12 ? 3 : wordCount > 180 ? 5 : 8));
  };
  const scores = dimensions.map((dimension) => {
    const key = dimension.key as keyof EvaluationScores;
    const score = answers.length ? Math.round(answers.reduce((sum, answer) => sum + scoreFallback(answer, key), 0) / answers.length) : 0;
    return { ...dimension, score };
  });
  const overall = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / Math.max(scores.length, 1) * 10);
  const allStrengths = answers.flatMap((answer) => answer.evaluation?.strengths ?? []);
  const allImprovements = answers.flatMap((answer) => answer.evaluation?.improvements ?? []);
  const distinctTop = (items: string[], fallback: string[]) => [...new Set([...items, ...fallback])].slice(0, 3);
  const nextSteps = [
    ...distinctTop(allImprovements, ["Practice one answer with a clear action and outcome."]),
    "Your example can come from class, a college project, a club, volunteering, or part-time work. You do not need a formal job history.",
  ];
  return { overall, scores, nextSteps, topStrengths: distinctTop(allStrengths, ["You completed a full practice answer set.", "You kept working through each question.", "You built examples from your student experience."]), topImprovements: distinctTop(allImprovements, ["Add a specific example and explain what you personally did.", "Connect your action to a clear result.", "Keep technical explanations focused and checkable."]), answers, percentile: null as number | null, label: "Practice estimate · not a hiring score" };
}
