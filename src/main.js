import { createPracticeReport, SAMPLE_CLAIMS } from "../lib/mockmate.ts";
import { checkSupabaseAuthConfigured, clearSupabaseSession, createAccount, onSupabaseAuthChange, supabaseAuthConfigured, restoreSupabaseSession, sendPasswordReset, signIn, updateDisplayName, updatePassword } from "../lib/supabase-auth.ts";
import { deletePracticeHistory, deleteSavedDocuments, getDataStoreStatus, getPracticeHistory, getPracticePlan, getSavedDocuments, saveDocument, savePracticeHistory, savePracticePlan, updatePracticePlanTask } from "../lib/data-store.js";
import { buildLocalQuestionSet, callCoach, extractPdf, extractShortTopic, friendlyResumeError, isResumeContactLine, localClaims, localEvaluation, locallyAdaptQuestion, normalizeInterviewQuestion, redactForAI } from "../lib/interview.js";

const root = document.querySelector("#root");
const practiceRole = "Resume-based fresher interview";
const rubricNames = { technicalAccuracy: "Technical accuracy", communication: "Communication", relevance: "Relevance", examplesUsed: "Examples used", timeManagement: "Time management" };
const readSavedTheme = () => { try { return localStorage.getItem("mockmate-theme") === "dark" ? "dark" : "light"; } catch { return "light"; } };
const state = { user: null, guest: false, authChecking: true, authMode: "login", authError: "", authNotice: "", authBusy: false, screen: "dashboard", analyticsRange: "all", theme: readSavedTheme(), role: practiceRole, language: "English", durationMinutes: 20, interviewEndsAt: 0, interviewStartedAt: 0, claims: SAMPLE_CLAIMS, source: "sample", fileName: "", resumeText: "", resumeFile: null, jobDescription: "", jdFile: null, saveConsent: false, savedDocuments: [], documentStorageAvailable: false, historyAvailable: false, planAvailable: false, planSaving: false, planError: "", practicePlan: [], storageBusy: false, deletingDocuments: false, deletingHistory: false, aiOptIn: false, aiAvailable: false, busy: false, loadingQuestions: false, questionSeed: 0, error: "", notice: "", questions: [], questionIndex: 0, phase: "main", followUp: "", followUpsUsed: 0, answers: [], answer: "", evaluation: null, evalBusy: false, difficulty: "medium", report: null, history: [], profileOpen: false, profileName: "", profileError: "", profileSaving: false, pasted: "", listening: false, micActive: false, micBaseAnswer: "", recognition: null, finalTranscript: "" };
let lastRenderedView = "";
let interviewTimer = null;

const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const displayName = (value = "") => String(value).replace(/[_.]+/g, " ").replace(/\s+/g, " ").trim();
const button = (label, action, cls = "", extra = "") => `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const themeToggle = () => button(state.theme === "dark" ? "☀" : "☾", "theme-toggle", "icon-button theme-toggle", `aria-label="Switch to ${state.theme === "dark" ? "light" : "dark"} mode" title="Switch to ${state.theme === "dark" ? "light" : "dark"} mode"`);
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", state.theme === "dark" ? "#171511" : "#FAF8F4");
}
const plannedQuestionCount = () => ({ 20: 6, 30: 8, 45: 12 }[state.durationMinutes] || 6);
const formatTime = (milliseconds) => { const seconds = Math.max(0, Math.ceil(milliseconds / 1000)); return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; };
const logo = `<div class="brand"><span class="brand-mark"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M4 13v-2m4 6V7m4 12V5m4 14V7m4 6v-2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="10.2" stroke="currentColor" stroke-opacity=".24"/></svg></span><span>MockMate<span class="brand-ai"> AI</span></span></div>`;
const footer = `<footer class="global-footer"><span>MOCKMATE AI</span><span>YOUR PRACTICE, YOUR PACE</span><span>LOCAL DEMO · ₹0</span></footer>`;
const icon = (name) => ({ dash: "▦", history: "◷", plan: "◎", analytics: "▥", mic: "●", arrow: "→", lock: "▣", sparkle: "✦", file: "▤", check: "✓", close: "×" }[name] || "·");
const authWorkspacePreview = `<section class="auth-workspace-preview" aria-label="What is inside MockMate AI"><div class="auth-workspace-heading"><span>YOUR TOOLS</span><span>5 tools</span></div><div class="auth-feature-grid"><article><span aria-hidden="true">▦</span><div><strong>Dashboard</strong><small>Your overview</small></div></article><article><span aria-hidden="true">✦</span><div><strong>New practice</strong><small>Start a round</small></div></article><article><span aria-hidden="true">◷</span><div><strong>History</strong><small>Past rounds</small></div></article><article><span aria-hidden="true">◎</span><div><strong>Practice plan</strong><small>Next steps</small></div></article><article><span aria-hidden="true">▥</span><div><strong>Analytics</strong><small>Scores and feedback</small></div></article></div></section>`;

function renderAuth() {
  const signup = state.authMode === "signup", reset = state.authMode === "reset", newPassword = state.authMode === "new-password";
  return `<main class="auth-page"><header class="auth-topbar">${logo}<div class="auth-topbar-actions">${themeToggle()}<span class="free-pill"><span></span> STUDENT PRACTICE</span></div></header><div class="auth-layout"><section class="auth-intro"><span class="eyebrow">✦ YOUR NEXT INTERVIEW STARTS HERE</span><h1>Practice with<br/><span>confidence.</span></h1><p>Build clear answers for the roles you want.</p><div class="auth-points auth-points-compact"><span>Resume stays private</span><span>Optional AI</span><span>Free guest practice</span></div>${authWorkspacePreview}</section><section class="auth-card"><div class="auth-card-icon">♧</div><h2>${signup ? "Create your student account" : reset ? "Reset your password" : newPassword ? "Choose a new password" : "Welcome back"}</h2><p>${signup ? "Create an account to keep a sign-in for this browser." : reset ? "We’ll send a password reset email if the account is registered." : newPassword ? "Set a new password for your MockMate account." : "Sign in to MockMate AI to continue your practice."}</p>${!supabaseAuthConfigured ? `<div class="auth-config-notice"><b>Account sign-in needs Supabase setup.</b><span>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local. Guest practice still works.</span></div>` : ""}<form id="auth-form">${signup ? `<label>Your name</label><div class="auth-input-wrap"><input name="name" autocomplete="name" required minlength="2" maxlength="60" placeholder="e.g. Aanya Sharma"/></div>` : ""}${newPassword ? "" : `<label>Email address</label><div class="auth-input-wrap"><input name="email" type="email" autocomplete="email" required placeholder="you@example.com"/></div>`}${reset ? "" : `<label>${newPassword ? "New password" : "Password"}</label><div class="auth-input-wrap"><input name="password" type="password" autocomplete="${signup || newPassword ? "new-password" : "current-password"}" minlength="6" required placeholder="At least 6 characters"/></div>`}${signup || newPassword ? `<label>Confirm password</label><div class="auth-input-wrap"><input name="confirm" type="password" autocomplete="new-password" minlength="6" required/></div>` : ""}${state.authError ? `<div class="auth-error" role="alert">${esc(state.authError)}</div>` : ""}${state.authNotice ? `<div class="auth-notice" role="status">${esc(state.authNotice)}</div>` : ""}<button class="primary-button auth-submit" type="submit" ${!supabaseAuthConfigured || state.authBusy ? "disabled" : ""}>${state.authBusy ? "Please wait…" : signup ? "Create account" : reset ? "Send reset email" : newPassword ? "Save new password" : "Sign in"} →</button></form><div class="auth-switch">${reset || newPassword ? button("Back to sign in", "auth-login", "auth-link") : signup ? `Already have an account? ${button("Sign in", "auth-login", "auth-link")}` : `New to MockMate? ${button("Create an account", "auth-signup", "auth-link")}`}</div>${!signup && !reset && !newPassword ? button("Forgot password?", "auth-reset", "auth-link auth-forgot") : ""}<div class="auth-divider"><span>OR</span></div>${button("Continue as guest →", "guest", "guest-button")}<small class="auth-privacy">Account sign-in is securely handled by Supabase.</small></section></div><footer class="auth-footer"><span>MOCKMATE AI</span><span>LOCAL PRACTICE · NO PAYMENT NEEDED</span></footer></main>`;
}

function nav() { return `<header class="topbar">${logo}<div class="topbar-right"><nav class="workspace-nav" aria-label="Main navigation">${[["dashboard", "Dashboard"], ["setup", "New practice"], ["history", "History"], ["plan", "Practice plan"], ["analytics", "Analytics"]].map(([s, t]) => { const active = state.screen === s || (s === "analytics" && state.screen === "report"); return `<button class="${active ? "active" : ""}" data-screen="${s}" ${active ? 'aria-current="page"' : ""}>${t}</button>`; }).join("")}</nav><span class="free-pill">FREE PRACTICE</span>${themeToggle()}${button(`<span class="profile-avatar" aria-hidden="true">♙</span><span>${esc(displayName(state.user?.displayName || state.profileName || "Guest"))}</span>`, "profile", "profile-chip", 'aria-label="Edit display name"')}${button("↪", "signout", "icon-button", `aria-label="Sign out" title="Sign out"`)}</div></header>`; }

function analytics() {
  const allSessions = Array.isArray(state.history) ? state.history : [];
  const days = state.analyticsRange === "7" ? 7 : state.analyticsRange === "30" ? 30 : 0;
  const cutoff = days ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;
  const timestamp = (session) => {
    const value = Date.parse(session.completedAtISO || "");
    return Number.isFinite(value) ? value : 0;
  };
  const sessions = allSessions.filter((session) => !days || (timestamp(session) && timestamp(session) >= cutoff));
  const chronological = [...sessions].sort((a, b) => timestamp(a) - timestamp(b));
  const scores = sessions.map((session) => Number(session.score)).filter(Number.isFinite);
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const minutes = sessions.reduce((sum, session) => sum + (Number(session.duration) || 0), 0);
  const chartSessions = chronological.slice(-8);
  const chartPoints = chartSessions.map((session, index) => {
    const x = chartSessions.length < 2 ? 390 : 58 + (index / (chartSessions.length - 1)) * 665;
    const y = 190 - (Math.max(0, Math.min(100, Number(session.score) || 0)) / 100) * 150;
    return { x, y, session, index };
  });
  const linePoints = chartPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  let comparison = "Complete another round to see your score trend.";
  let comparisonTone = "steady";
  if (chronological.length >= 2) {
    const windowSize = Math.min(3, Math.floor(chronological.length / 2));
    const recent = chronological.slice(-windowSize).reduce((sum, session) => sum + Number(session.score || 0), 0) / windowSize;
    const previous = chronological.slice(-windowSize * 2, -windowSize).reduce((sum, session) => sum + Number(session.score || 0), 0) / windowSize;
    const delta = Math.round(recent - previous);
    comparisonTone = delta > 0 ? "up" : delta < 0 ? "down" : "steady";
    comparison = `${delta > 0 ? `Up ${delta} points` : delta < 0 ? `Down ${Math.abs(delta)} points` : "Holding steady"} ${windowSize === 1 ? "since your previous round." : `across your latest ${windowSize} rounds.`}`;
  }
  const roleCounts = new Map();
  for (const session of sessions) roleCounts.set(session.role, (roleCounts.get(session.role) || 0) + 1);
  const mostPractisedRole = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const planTasks = Array.isArray(state.practicePlan) ? state.practicePlan : [];
  const completedTasks = planTasks.filter((task) => task.completed).length;
  const nextTask = planTasks.find((task) => !task.completed);
  const rangeLabel = days ? `Last ${days} days` : "All time";
  const dateLabel = (session) => timestamp(session)
    ? new Date(timestamp(session)).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : session.completedAt || "Recent";
  const rangeButtons = [["7", "7 days"], ["30", "30 days"], ["all", "All time"]];
  const rows = [...sessions].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, 8);
  const chartSummary = chartPoints.length
    ? `Your ${chartPoints.length} most recent scores range from ${Math.min(...chartPoints.map(({ session }) => Number(session.score) || 0))} to ${Math.max(...chartPoints.map(({ session }) => Number(session.score) || 0))} out of 100.`
    : "Complete a practice round to start your score trend.";
  const historyNote = state.user
    ? state.historyAvailable ? "Private session summaries from your account." : "Showing this visit only; private history is not available right now."
    : "Guest sessions stay in this browser tab.";

  return `<section class="analytics-page">
    <div class="analytics-heading"><div><span class="eyebrow">✦ YOUR PRACTICE, IN FOCUS</span><h1>Progress, made <em>visible.</em></h1><p>See your consistency, scores, and what to work on next.</p></div><div class="analytics-range" role="group" aria-label="Filter analytics by time period">${rangeButtons.map(([value, label]) => `<button type="button" data-range="${value}" aria-pressed="${state.analyticsRange === value}" class="${state.analyticsRange === value ? "selected" : ""}">${label}</button>`).join("")}</div></div>
    <div class="analytics-stats">
      <article class="analytics-stat"><span class="analytics-stat-icon">◷</span><span class="analytics-stat-label">PRACTICE ROUNDS</span><strong>${sessions.length}</strong><small>${rangeLabel}</small></article>
      <article class="analytics-stat"><span class="analytics-stat-icon violet">◎</span><span class="analytics-stat-label">AVERAGE SCORE</span><strong>${scores.length ? average : "—"}<small>${scores.length ? "/100" : ""}</small></strong><small>${scores.length ? "Across selected rounds" : "Complete a round to begin"}</small></article>
      <article class="analytics-stat"><span class="analytics-stat-icon mint">✦</span><span class="analytics-stat-label">PERSONAL BEST</span><strong>${scores.length ? best : "—"}<small>${scores.length ? "/100" : ""}</small></strong><small>Your highest practice score</small></article>
      <article class="analytics-stat"><span class="analytics-stat-icon blue">◷</span><span class="analytics-stat-label">SELECTED MINUTES</span><strong>${minutes}<small> min</small></strong><small>Chosen session lengths</small></article>
    </div>
    <div class="analytics-grid">
      <section class="analytics-card analytics-trend-card"><div class="analytics-card-heading"><div><span class="eyebrow">SCORE TREND</span><h2>Your practice over time</h2></div><span class="analytics-period">${rangeLabel}</span></div>
        ${chartPoints.length ? `<p class="analytics-chart-summary" role="status">${esc(chartSummary)}</p><div class="analytics-chart-wrap"><svg class="analytics-chart" viewBox="0 0 760 226" role="img" aria-label="${esc(chartSummary)}"><defs><linearGradient id="analytics-area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#e8a33d" stop-opacity=".23"/><stop offset="100%" stop-color="#e8a33d" stop-opacity="0"/></linearGradient></defs>${[0,25,50,75,100].map((value) => { const y = 190 - value * 1.5; return `<line x1="48" x2="744" y1="${y}" y2="${y}" class="analytics-grid-line"/><text x="35" y="${y + 4}" class="analytics-axis-label" text-anchor="end">${value}</text>`; }).join("")}${chartPoints.length > 1 ? `<polygon class="analytics-area" points="${linePoints} 723,190 58,190"/>` : ""}${chartPoints.length > 1 ? `<polyline class="analytics-line" points="${linePoints}"/>` : ""}${chartPoints.map(({ x, y, session, index }) => `<g><circle class="analytics-point" cx="${x}" cy="${y}" r="5"><title>Round ${index + 1}: ${Number(session.score) || 0} out of 100</title></circle><text class="analytics-point-score" x="${x}" y="${Math.max(27, y - 12)}" text-anchor="middle">${Number(session.score) || 0}</text></g>`).join("")}${chartPoints.map(({ x, session }, index) => `<text class="analytics-date-label" x="${x}" y="214" text-anchor="middle">${esc(dateLabel(session))}</text>`).join("")}</svg></div>` : `<div class="analytics-chart-empty"><span>◎</span><strong>${sessions.length ? "No rounds in this period" : "Your first insight starts here"}</strong><p>${sessions.length ? "Choose a wider time range to see more of your practice." : "Complete a practice interview and your score trend will appear here."}</p>${sessions.length ? button("View all time", "analytics-all", "secondary-button") : button("Start practising →", "goto-setup", "primary-button")}</div>`}
        <div class="analytics-trend-insight ${comparisonTone}"><span class="analytics-insight-mark">${comparisonTone === "up" ? "↗" : comparisonTone === "down" ? "↘" : "→"}</span><div><strong>${esc(comparison)}</strong><small>Practice scores are estimates, not hiring predictions.</small></div></div>
      </section>
      <aside class="analytics-card analytics-insights"><span class="eyebrow">YOUR NEXT MOVE</span><h2>Make your next round count.</h2><div class="analytics-insight-block"><span class="analytics-insight-icon">✦</span><div><small>CONSISTENCY</small><strong>${sessions.length ? `${sessions.length} ${sessions.length === 1 ? "round" : "rounds"} practised` : "Ready when you are"}</strong><p>${mostPractisedRole ? `Most practised: ${esc(mostPractisedRole[0])}` : "Pick a role and start with one focused round."}</p></div></div><div class="analytics-insight-block"><span class="analytics-insight-icon violet">◎</span><div><small>PRACTICE PLAN</small><strong>${planTasks.length ? `${completedTasks} of ${planTasks.length} steps done` : "Your next step"}</strong><p>${nextTask ? esc(nextTask.text) : planTasks.length ? "Your plan is complete. Build on that momentum." : "Finish a round to get personal next steps."}</p></div></div>${button("Open practice plan →", "goto-plan", "secondary-button analytics-plan-link")}</aside>
    </div>
    <section class="analytics-card analytics-sessions"><div class="analytics-card-heading"><div><span class="eyebrow">SESSION DETAIL</span><h2>Recent practice</h2></div><span class="analytics-period">${rows.length} shown</span></div>${rows.length ? `<div class="analytics-table-wrap"><table class="analytics-table"><caption class="visually-hidden">Recent mock interview sessions with score, duration, and answers</caption><thead><tr><th scope="col">Date</th><th scope="col">Role</th><th scope="col">Time</th><th scope="col">Answers</th><th scope="col">Score</th></tr></thead><tbody>${rows.map((session) => `<tr><td>${esc(dateLabel(session))}</td><td>${esc(session.role)}</td><td>${Number(session.duration) || 0} min</td><td>${Number(session.answers) || 0}</td><td><span class="analytics-table-score">${Number(session.score) || 0}<small>/100</small></span></td></tr>`).join("")}</tbody></table></div>` : `<p class="analytics-session-empty">Your completed rounds will appear here.</p>`}<p class="analytics-footnote">${esc(historyNote)} <span>·</span> ${allSessions.length} total sessions</p></section>
  </section>`;
}

function dashboard() {
  const last = state.history[0];
  const greetingName = displayName(state.user?.displayName || state.profileName || "student");
  return `<section class="dashboard-page">
    <div class="dashboard-welcome"><div><span class="eyebrow">✦ YOUR PRACTICE SPACE</span><h1>Good to see you, ${esc(greetingName)}.</h1><p>One question at a time.</p></div>${button("＋ Start a new interview →", "goto-setup", "primary-button")}</div>
    <div class="dashboard-stats">
      <article class="dashboard-stat"><span class="stat-icon">▦</span><span class="stat-label">RECENT ROUNDS</span><strong>${state.history.length}</strong><small>${state.history.length ? "Keep going" : "Start your first round"}</small></article>
      <article class="dashboard-stat"><span class="stat-icon violet">◎</span><span class="stat-label">LATEST SCORE</span><strong>${last ? last.score : "—"}<small>${last ? "/100" : ""}</small></strong><small>${last ? "Practice estimate" : "Finish a round to see your score"}</small></article>
      <article class="dashboard-stat"><span class="stat-icon mint">◷</span><span class="stat-label">LAST SESSION</span><strong>${last?.duration || state.durationMinutes}<small> min</small></strong><small>${last ? "Selected interview time" : "Choose 20, 30, or 45 min"}</small></article>
    </div>
    <div class="dashboard-content">
      <section class="dashboard-panel"><div class="dashboard-panel-heading"><div><span class="eyebrow">YOUR ACTIVITY</span><h2>Recent practice</h2></div>${button("View history →", "goto-history", "secondary-button")}</div>
        ${state.history.length ? `<div class="history-list">${state.history.slice(0, 3).map((h) => `<article class="history-entry"><span class="history-icon">◷</span><div class="history-detail"><strong>${esc(h.role)} practice</strong><small>${esc(h.completedAt)} · ${h.duration || 20} min · ${h.answers} answers</small></div><span class="history-score">${h.score}<small>/100</small></span></article>`).join("")}</div>` : `<div class="dashboard-empty"><span class="empty-icon">◷</span><strong>No rounds yet</strong><p>Your score appears after your first round.</p>${button("Start practice →", "goto-setup", "secondary-button")}</div>`}
      </section>
      <section class="dashboard-panel quickstart-panel"><span class="quickstart-icon">✦</span><span class="eyebrow">QUICK START</span><h2>Start an interview.</h2><p>Resume optional · Speak or type · AI optional</p>${button("Start interview →", "goto-setup", "primary-button")}</section>
    </div>
  </section>`;
}

function serviceSetupPanel() {
  const services = [
    { name: "Supabase sign-in", ready: supabaseAuthConfigured, need: "Email verification, login, and password reset", next: "Add your Supabase Project URL and public anon key to .env.local; enable Email in Supabase Authentication." },
    { name: "Gemini AI coach", ready: state.aiAvailable, need: "AI-personalized questions and coaching; local questions and estimates keep working", next: "Create a key in Google AI Studio, add GEMINI_API_KEY to .env.local, then restart the VS Code dev server." },
    { name: "Supabase private saves", ready: state.documentStorageAvailable, need: "Saving resume and job-description files to a signed-in private account", next: "Configure Supabase Auth and server keys, run supabase/schema.sql, sign in, and explicitly enable document saving." },
  ];
  const missing = services.filter((service) => !service.ready);
  return `<p class="service-setup-local"><b>Local practice is ready.</b> Start without optional setup.</p><details class="service-setup-panel"><summary><span class="service-setup-title">Setup status</span><span class="service-setup-state ${missing.length ? "needs-setup" : "all-ready"}">${missing.length ? `${missing.length} optional service${missing.length === 1 ? "" : "s"} need setup` : "All services detected"}</span><span class="service-setup-chevron" aria-hidden="true">⌄</span></summary><div class="service-setup-list">${services.map((service) => `<article class="service-setup-item"><div class="service-setup-item-head"><strong>${esc(service.name)}</strong><span class="service-pill ${service.ready ? "is-ready" : "is-missing"}">${service.ready ? "Setup detected" : "Not configured"}</span></div><p>${esc(service.need)}.</p>${service.ready ? "" : `<small>Next step: ${esc(service.next)}</small>`}</article>`).join("")}</div><p class="service-setup-footnote">Only the Supabase URL and public key use the VITE_ prefix. Keep SUPABASE_SECRET_KEY and GEMINI_API_KEY server-only. Restart <code>npm.cmd run dev</code> after changing .env.local.</p></details>`;
}

function setup() {
  const storageControl = state.documentStorageAvailable ? state.user
    ? `<label class="storage-consent"><input type="checkbox" data-field="saveConsent" ${state.saveConsent ? "checked" : ""}/><span><b>Save my resume privately</b><small>Keep the resume text and a private copy of the PDF in your Supabase account. Delete it anytime.</small></span></label>${state.savedDocuments.length ? `<div class="saved-documents"><strong>Saved in your account</strong>${state.savedDocuments.map((d) => `<span>${d.type === "resume" ? "Resume" : "Job description"}: ${esc(d.fileName)}</span>`).join("")}${button(state.deletingDocuments ? "Deleting…" : "Delete my saved documents", "delete-documents", "text-button delete-documents", state.deletingDocuments ? "disabled" : "")}</div>` : ""}`
    : `<div class="storage-setup-note">Sign in to save your documents privately and retrieve them next time. Guest mode keeps them in this browser only.${button("Sign in to enable saving", "open-login", "auth-link")}</div>`
    : `<div class="storage-setup-note">Private resume saves need Supabase setup. You can still practise now; the resume stays in this browser.</div>`;
  return `<section class="setup-page"><div class="setup-layout"><div class="setup-main"><span class="eyebrow">✦ BUILT FOR YOUR NEXT CONVERSATION</span><h1>Get interviewed<br/>on your <em>own resume.</em></h1><p class="hero-copy">Upload once. Practise your projects, skills, and experience.</p>${serviceSetupPanel()}<div class="flow-guide"><span class="flow-step active"><b>01</b> Add resume</span><i></i><span class="flow-step"><b>02</b> Set your pace</span><i></i><span class="flow-step"><b>03</b> Start interview</span></div><div class="setup-form">
    <div class="setup-form-heading"><span class="eyebrow">YOUR INTERVIEW, BUILT FROM YOUR RESUME</span><p>No role or experience form. We’ll build your questions from the details you share.</p></div>
    <div class="drop-zone ${state.source !== "sample" ? "file-selected" : ""}" id="drop-zone"><div class="drop-icon">▤</div><div class="drop-copy"><strong>${esc(state.fileName || "Add your student resume")}</strong><span>${state.source === "sample" ? "PDF up to 5 MB · projects and coursework count" : `${state.claims.length} resume details found · ${state.resumeText.length.toLocaleString()} characters`}</span></div><input type="file" accept="application/pdf,.pdf" data-field="file" hidden/>${button(state.source === "sample" ? "Browse PDF" : "Remove", state.source === "sample" ? "browse" : "remove-resume", "browse-button")}</div>
    <div class="resume-alternatives"><div class="resume-language field-row"><span class="field-label">PRACTICE LANGUAGE</span><div class="language-row">${["English", "Hinglish"].map((l) => `<button class="language-chip ${state.language === l ? "selected" : ""}" data-language="${l}" aria-pressed="${state.language === l}">${l}</button>`).join("")}</div></div>${button("✦ Use a fictional sample resume", "sample", "sample-link")}</div>
    <div class="field-row"><span class="field-label" id="duration-label">CHOOSE YOUR INTERVIEW LENGTH</span><div class="duration-options" role="group" aria-labelledby="duration-label">${[20, 30, 45].map((minutes) => `<button type="button" class="duration-option ${state.durationMinutes === minutes ? "selected" : ""}" data-duration="${minutes}" aria-pressed="${state.durationMinutes === minutes}"><strong>${minutes}<small> min</small></strong><span>${({20:"Quick practice",30:"Full practice",45:"Deep practice"})[minutes]}</span></button>`).join("")}</div><small class="field-help">${plannedQuestionCount()} resume-based questions · Up to 2 follow-ups. Finish whenever you like.</small></div>
    ${storageControl}
    <label class="ai-optin"><input type="checkbox" data-field="ai" ${state.aiOptIn ? "checked" : ""} ${state.aiAvailable ? "" : "disabled"}/><span><b>Use the optional AI coach</b><p>${state.aiAvailable ? "Shares redacted resume details and your answers with Gemini for coaching." : "AI is unavailable; resume-based practice still works."}</p></span></label>
    <details class="privacy-notice"><summary>Privacy: what is sent, stored, and how to clear it</summary><p>Your PDF is read in this browser first. If you sign in and enable save consent, the original PDF and extracted text are stored in your private Supabase account. You may delete saved documents here. Completed practice summaries and your personal practice-plan tasks are saved privately for signed-in users; clear them from History or Practice plan. Answer transcripts are not stored in your account. If you opt into AI, redacted resume details and answers are sent to Gemini.</p></details>
    <details class="paste-fallback"><summary>Or paste resume or project details</summary><label class="visually-hidden" for="resume-paste">Paste resume or project details</label><textarea id="resume-paste" data-field="pasted" rows="3" placeholder="Paste resume text or project descriptions…">${esc(state.pasted)}</textarea>${button("Use pasted details", "paste-resume", "browse-button")}</details>
    ${state.error ? `<div class="error-message" role="alert">${esc(state.error)}</div>` : ""}
    ${button(`${state.busy || state.storageBusy ? "Preparing…" : "Start practice →"}`, "start", "primary-button start-button", state.busy || state.storageBusy ? "disabled" : "")}<div class="under-button">Free practice · Private saves are optional · Delete saved files anytime</div></div></div>
    <aside class="preview-panel"><div class="preview-heading">YOUR PRACTICE SPACE <span>QUESTION 01 / ${plannedQuestionCount()}</span></div><div class="question-preview"><div class="question-tag">RESUME-BASED PRACTICE</div><p>“In your key project, what was your exact role and result?”</p><div class="preview-wave">${Array.from({ length: 30 }, (_, i) => `<i style="height:${9 + i * 7 % 28}px"></i>`).join("")}</div><div class="preview-duration"><span>${state.durationMinutes} minutes · ${plannedQuestionCount()} main questions</span><span>Speak or type</span></div></div><div class="preview-feature"><div class="feature-icon amber">✓</div><div><strong>Practice feedback</strong><span>For practice—not hiring.</span></div></div><div class="preview-feature"><div class="feature-icon mint">▣</div><div><strong>Questions from your resume</strong><span>Projects, skills, and experience you share.</span></div></div></aside></div></section>`;
}
function interview() {
  const mainQuestion = state.questions[state.questionIndex] || "In your key project, what was your exact role and result?";
  const question = state.phase === "followup" ? state.followUp : mainQuestion;
  const claim = resumeClaimFor(mainQuestion, state.questionIndex);
  const scores = state.evaluation?.scores || {};
  const timePercent = state.interviewStartedAt ? Math.min(100, ((Date.now() - state.interviewStartedAt) / (state.durationMinutes * 60_000)) * 100) : 0;
  if (state.loadingQuestions) return `<section class="interview-page"><div class="interview-top">${button("← Exit practice", "goto-dashboard", "back-button")}<span class="session-mode">${esc(state.role)} · ${state.aiOptIn ? "AI COACH" : "STUDENT PRACTICE"}</span><span class="session-countdown" role="timer" aria-label="Time remaining">${state.interviewEndsAt ? formatTime(state.interviewEndsAt - Date.now()) : "--:--"}</span>${button("Finish early", "finish", "text-button")}</div><div class="progress-line" role="progressbar" aria-label="Interview time elapsed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(timePercent)}"><div class="time-progress-fill" style="width:${timePercent}%"></div></div><div class="question-column question-loading" aria-busy="true"><span class="eyebrow">NEXT RESUME-BASED QUESTION</span><h2>Finding your next question…</h2><div class="question-loading-lines" aria-hidden="true"><i></i><i></i><i></i></div><p>The interview timer is still running. You can finish whenever you are ready.</p></div></section>`;
  return `<section class="interview-page"><div class="interview-top">${button("← Exit practice", "goto-dashboard", "back-button")}<span class="session-mode">${esc(state.role)} · ${state.aiOptIn ? "AI COACH" : "STUDENT PRACTICE"}</span><span class="session-countdown" role="timer" aria-label="Time remaining">${state.interviewEndsAt ? formatTime(state.interviewEndsAt - Date.now()) : "--:--"}</span>${button("Finish early", "finish", "text-button")}</div>${state.notice ? `<div class="coach-notice">${esc(state.notice)}</div>` : ""}<div class="progress-line" role="progressbar" aria-label="Interview time elapsed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(timePercent)}"><div class="time-progress-fill" style="width:${timePercent}%"></div></div><div class="interview-grid"><div class="question-column"><div class="question-meta">${state.phase === "main" ? `QUESTION ${String(state.questionIndex + 1).padStart(2, "0")}` : `FOLLOW-UP ${String(state.followUpsUsed).padStart(2, "0")} / 2`} <span class="question-type">${state.phase === "main" ? "RESUME DEEP DIVE" : "CHECKING YOUR EXAMPLE"} · ${state.difficulty.toUpperCase()}</span></div><h2>${esc(question)}</h2><p class="question-prompt">${state.phase === "main" ? "Be direct: explain your personal role, the tools used, and the result." : "Give one specific detail or example from your experience."}</p><div class="claim-focus"><span class="claim-focus-label">✦ RESUME DETAIL TO EXPLORE</span><span>${esc(claim.claim)}</span></div>${state.evaluation ? `<section class="answer-evaluation"><div class="evaluation-title">✦ <strong>${state.phase === "main" ? "Answer feedback" : "Follow-up feedback"}</strong><span>${state.evaluation.provider === "Gemini" ? "Gemini coach" : "Quick local estimate"}</span></div>${state.evalBusy ? `<p class="evaluation-wait">AI is checking your answer. Your quick estimate is shown meanwhile…</p>` : ""}<p class="evaluation-summary">${esc(state.evaluation.feedback)}</p><div class="evaluation-scores">${Object.entries(scores).map(([k,v]) => `<div class="evaluation-score"><span>${rubricNames[k]}</span><b>${v}/10</b></div>`).join("")}</div><div class="evaluation-columns"><div><strong>What worked</strong>${(state.evaluation.strengths || []).map((x) => `<p>${esc(x)}</p>`).join("")}</div><div><strong>Try next</strong>${(state.evaluation.improvements || []).map((x) => `<p>${esc(x)}</p>`).join("")}</div></div><div class="better-answer"><strong>A clearer answer shape</strong><p>“In a class, project, or team situation, I needed to <em>[goal]</em>. I <em>[specific action]</em>, which led to <em>[result or learning]</em>.”</p></div><div class="evaluation-actions">${button(state.phase === "main" ? (state.followUp ? "Answer this follow-up →" : "Next interview question →") : "Next interview question →", "continue", "primary-button", state.evalBusy ? "disabled" : "")}</div></section>` : `<div class="answer-area"><label for="answer-box">${state.phase === "main" ? "YOUR ANSWER" : "YOUR FOLLOW-UP ANSWER"}</label><textarea id="answer-box" data-field="answer" rows="7" placeholder="Type here, or press Speak & type…">${esc(state.answer)}</textarea><div id="transcript-status" class="transcript-status" aria-live="polite">${state.listening ? "Listening — your speech is appearing above. Press Stop mic when done." : state.answer.trim() ? "Transcript is saved here. Edit it before continuing." : "Press Speak & type and allow microphone access."}</div><div class="answer-tools"><span><span id="answer-word-count">${state.answer.trim().split(/\s+/).filter(Boolean).length}</span> words · Transcript is editable</span><div class="answer-actions">${button(`<svg class="mic-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6"/></svg><span>${state.listening ? "Stop listening" : "Speak & type"}</span>${state.listening ? `<span class="mic-wave" aria-hidden="true">${Array.from({length:7},()=>"<i></i>").join("")}</span>` : ""}`, "mic", `voice-button mic-control ${state.listening ? "recording" : ""}`, `aria-pressed="${state.listening}" aria-label="${state.listening ? "Stop microphone and keep transcript" : "Start microphone and transcribe answer"}"`)} ${button("▶ Listen", "listen", "listen-button", 'aria-label="Read the question aloud"')}</div></div></div>${state.error ? `<div class="error-message" role="alert">${esc(state.error)}</div>` : ""}<div class="submit-row"><span class="keyboard-hint">Tip: try STAR — Situation · Task · Action · Result</span>${button("Next →", "evaluate", "primary-button submit-answer", !state.answer.trim() ? "disabled" : "")}</div><p class="speech-note">Speak or type your answer. You can edit the transcript.</p>`}</div><aside class="interview-sidebar"><div class="sidebar-title">YOUR RESUME MAP <span>${state.claims.length} details</span></div>${state.claims.map((c,i) => `<div class="resume-map-item ${i === state.questionIndex % state.claims.length ? "current" : ""}"><span class="map-marker">${i+1}</span><span><strong>${esc(c.category)}</strong><small>${esc(c.claim)}</small></span></div>`).join("")}<div class="sidebar-note">✧ One thought at a time. Pause between ideas.</div></aside></div></section>`;
}

function report() {
  if (!state.report) return `<section class="history-empty"><h2>No report yet</h2>${button("Start practice →", "goto-setup", "primary-button")}</section>`;
  const r = state.report;
  const radarPoints = (scale) => r.scores.map((item, index) => {
    const angle = (-Math.PI / 2) + index * (2 * Math.PI / r.scores.length);
    const radius = 76 * scale;
    return `${(130 + Math.cos(angle) * radius).toFixed(1)},${(108 + Math.sin(angle) * radius).toFixed(1)}`;
  }).join(" ");
  const radarValuePoints = r.scores.map((item, index) => {
    const angle = (-Math.PI / 2) + index * (2 * Math.PI / r.scores.length);
    const radius = 76 * Math.max(0, Math.min(10, item.score)) / 10;
    return `${(130 + Math.cos(angle) * radius).toFixed(1)},${(108 + Math.sin(angle) * radius).toFixed(1)}`;
  }).join(" ");
  return `<section class="report-page"><div class="report-heading"><span class="eyebrow">✦ A MOMENT TO REFLECT</span><h1>Your next answer<br/>starts <span>here.</span></h1><p>Practice feedback only—not a hiring score.</p>${state.notice ? `<p class="coach-notice" role="status">${esc(state.notice)}</p>` : ""}</div><div class="analytics-highlights"><section class="radar-card"><div class="card-heading"><h3>Five-skill snapshot</h3><span>0–10 practice rubric</span></div><div class="radar-visual"><svg viewBox="0 0 260 216" role="img" aria-labelledby="radar-title radar-description"><title id="radar-title">Five skill practice score radar</title><desc id="radar-description">${r.scores.map((item) => `${item.label}: ${item.score} out of 10`).join("; ")}</desc>${[0.25,0.5,0.75,1].map((scale) => `<polygon class="radar-grid" points="${radarPoints(scale)}"/>`).join("")}${r.scores.map((item, index) => { const angle = (-Math.PI / 2) + index * (2 * Math.PI / r.scores.length); return `<line class="radar-spoke" x1="130" y1="108" x2="${(130 + Math.cos(angle) * 76).toFixed(1)}" y2="${(108 + Math.sin(angle) * 76).toFixed(1)}"/>`; }).join("")}<polygon class="radar-area" points="${radarValuePoints}"/>${r.scores.map((item, index) => { const angle = (-Math.PI / 2) + index * (2 * Math.PI / r.scores.length); const radius = 76 * Math.max(0, Math.min(10, item.score)) / 10; return `<circle class="radar-point" cx="${(130 + Math.cos(angle) * radius).toFixed(1)}" cy="${(108 + Math.sin(angle) * radius).toFixed(1)}" r="4"/>`; }).join("")}</svg></div><div class="report-radar">${r.scores.map((s) => `<div class="score-row"><div class="score-row-top"><strong>${esc(s.label)}</strong><span>${s.score}/10</span></div><div class="score-track"><i style="width:${s.score * 10}%"></i></div></div>`).join("")}</div></section><section class="insights-card"><h3>Top strengths</h3><ul>${r.topStrengths.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h3>Top improvements</h3><ul>${r.topImprovements.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><div class="percentile-note"><b>Peer percentile</b><span>Unavailable until we have comparable practice data. We don’t invent rankings.</span></div></section></div><div class="report-grid"><section class="score-card"><div class="score-orb" role="img" aria-label="Practice score ${r.overall} out of 100" style="--score:${r.overall}%"><div><strong>${r.overall}</strong><small>/100</small></div></div><div class="score-summary"><span class="question-tag">PRACTICE SNAPSHOT</span><h3>Good work showing up.</h3><p>${r.answers.length} answers in your ${state.durationMinutes}-minute session. Your feedback is shown here. Your history stores only a round summary.</p></div></section><section class="feedback-card"><div class="card-heading"><h3>Try this in your next round</h3></div>${r.nextSteps.map((s,i) => `<div class="next-step"><span>${String(i+1).padStart(2,"0")}</span><p>${esc(s)}</p></div>`).join("")}</section><section class="answers-card"><div class="card-heading"><h3>Your answers</h3><span>${r.answers.length} reviewed</span></div>${r.answers.slice(-3).map((a) => `<div class="answer-review"><strong>${esc(a.question)}</strong><p>“${esc(a.answer)}”</p></div>`).join("")}</section></div><div class="report-disclaimer">Feedback is a practice estimate, not a hiring assessment. Check technical claims and use your judgement.</div>${button("Practice another round →", "goto-setup", "primary-button retry-button")}</section>`;
}

function historyScreen() { const privateHistory = Boolean(state.user && state.historyAvailable); const note = privateHistory ? "Saved privately to your account. Only round summaries are stored; your answers and resume are not part of this history." : state.user ? "Private history is not ready yet. Run the practice-history SQL setup. This visit’s rounds remain in this tab." : "Sign in to keep your practice history across visits. Guest history stays in this tab."; return `<section class="history-page"><div class="screen-intro"><span class="eyebrow">◷ YOUR PRACTICE</span><h1>Your practice <em>history.</em></h1></div>${state.history.length ? `<section class="history-card"><div class="history-card-heading"><strong>${state.history.length} recent round${state.history.length === 1 ? "" : "s"}</strong>${button(state.deletingHistory ? "Deleting…" : "Delete history", "delete-history", "secondary-button", state.deletingHistory ? "disabled" : "aria-label=\"Delete all practice history\"")}</div>${state.history.map((h) => `<article class="history-entry"><span class="history-icon">◷</span><div><strong>${esc(h.role)} practice</strong><small>${esc(h.completedAt)} · ${h.duration || 20} min · ${h.answers} answers</small></div><span class="history-score">${h.score}<small>/100</small></span></article>`).join("")}<p class="history-note">${note}</p>${state.error ? `<p class="error-message" role="alert">${esc(state.error)}</p>` : ""}</section>` : `<section class="history-empty"><div class="empty-illustration">◷</div><h2>No rounds yet</h2><p>Finish a round to see it here. ${privateHistory ? "Completed rounds will be saved privately to your account." : note}</p>${state.notice ? `<p class="history-note" role="status">${esc(state.notice)}</p>` : ""}${state.error ? `<p class="error-message" role="alert">${esc(state.error)}</p>` : ""}${button("Start practice →", "goto-setup", "primary-button")}</section>`}</section>`; }
function planScreen() {
  const tasks = state.practicePlan;
  const completeCount = tasks.filter((task) => task.completed).length;
  const hasPrivatePlan = Boolean(state.user && state.planAvailable);
  const saveNote = hasPrivatePlan ? "Saved privately to your account. Your progress stays up to date across visits." : state.user ? "Your plan is not saved yet. Run supabase/practice-plan.sql in the Supabase SQL Editor." : "Sign in to save your plan and completion progress across visits.";
  return `<section class="plan-page"><div class="screen-intro"><span class="eyebrow">◎ YOUR NEXT STEPS</span><h1>A small plan. <em>Progress.</em></h1><p>Small, focused tasks based on your interview feedback.</p></div>${tasks.length ? `<section class="plan-card"><div class="plan-card-heading"><div><span class="eyebrow">PERSONAL PRACTICE PLAN</span><h2>Build on what you learned.</h2><p>Complete a task when you have practised it.</p></div>${button("Clear plan", "delete-plan", "secondary-button", state.planSaving ? "disabled" : "aria-label=\"Clear my practice plan\"")}</div><div class="plan-progress"><div class="plan-progress-label"><strong>${completeCount} of ${tasks.length} complete</strong><span>${Math.round((completeCount / tasks.length) * 100)}%</span></div><div class="plan-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${tasks.length}" aria-valuenow="${completeCount}" aria-label="Practice plan progress"><span style="width:${(completeCount / tasks.length) * 100}%"></span></div></div><div class="plan-steps">${tasks.map((task, index) => `<article class="plan-step ${task.completed ? "is-complete" : ""}"><span>${String(index+1).padStart(2,"0")}</span><div><small>FOCUS ${index+1}</small><p>${esc(task.text)}</p></div><button class="plan-task-toggle" type="button" data-action="toggle-plan-task" data-plan-index="${index}" aria-pressed="${task.completed}" ${state.planSaving ? "disabled" : ""}><span aria-hidden="true">${task.completed ? "✓" : "○"}</span><span>${task.completed ? "Completed" : "Mark complete"}</span></button></article>`).join("")}</div><p class="history-note">${saveNote}</p>${state.planError ? `<p class="error-message" role="alert">${esc(state.planError)}</p>` : ""}<div class="plan-actions">${button("Practice these skills →", "goto-setup", "primary-button")}</div></section>` : `<section class="history-empty"><h2>${state.planError ? "Your plan needs setup" : "Complete one practice round first"}</h2><p>${state.planError || "Your feedback will turn into a short plan with useful next steps."}</p>${button("Start practice →", "goto-setup", "primary-button")}</section>`}</section>`;
}

function profileModal() { if (!state.profileOpen) return ""; return `<div class="profile-modal-backdrop"><section class="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button class="profile-modal-close" data-action="close-profile" aria-label="Close profile dialog">×</button><div class="profile-modal-icon" aria-hidden="true">♙</div><h2 id="profile-title">Your profile</h2><p>Choose the name MockMate shows on your dashboard.</p><label for="display-name">Display name</label><input id="display-name" data-field="profileName" value="${esc(state.profileName)}" maxlength="60"/>${state.profileError ? `<div class="auth-error" role="alert">${esc(state.profileError)}</div>` : ""}${button(state.profileSaving ? "Saving…" : "Save name →", "save-profile", "primary-button profile-save", state.profileSaving ? "disabled" : "")}</section></div>`; }

function render() {
  applyTheme();
  const viewKey = state.authChecking ? "loading" : !state.user && !state.guest ? `auth-${state.authMode}` : `app-${state.screen}`;
  if (viewKey !== lastRenderedView) { window.scrollTo(0, 0); lastRenderedView = viewKey; }
  if (state.authChecking) { root.innerHTML = `<main class="auth-loading" aria-busy="true" aria-label="Loading MockMate"><section class="auth-loading-card"><span class="skeleton-mark loading-skeleton"></span><span class="loading-skeleton skeleton-title"></span><span class="loading-skeleton skeleton-copy"></span><span class="loading-skeleton skeleton-copy short"></span><span class="loading-skeleton skeleton-action"></span><span class="loading-caption">Preparing your practice space…</span></section></main>`; return; }
  if (!state.user && !state.guest) { root.innerHTML = renderAuth(); return; }
  const screen = state.screen === "dashboard" ? dashboard() : state.screen === "setup" ? setup() : state.screen === "interview" ? interview() : state.screen === "analytics" ? analytics() : state.screen === "report" ? report() : state.screen === "history" ? historyScreen() : planScreen();
  root.innerHTML = `<main class="app-shell">${nav()}${screen}${footer}${profileModal()}</main>`;
}

function showGlobalError() {
  root.innerHTML = `<main class="global-error-page"><span class="eyebrow">MOCKMATE AI</span><h1>Something went wrong.</h1><p>Your practice details remain in this browser tab. Refresh the page to continue; if this keeps happening, share the browser console error with the project maintainer.</p><button class="primary-button" type="button" onclick="location.reload()">Refresh MockMate →</button></main>`;
}
window.addEventListener("error", (event) => { console.error("MockMate frontend error:", event.error || event.message); showGlobalError(); });
window.addEventListener("unhandledrejection", (event) => { console.error("MockMate unhandled promise rejection:", event.reason); showGlobalError(); });

async function refreshPracticeHistory() {
  if (!state.user || !state.documentStorageAvailable) return;
  try {
    const data = await getPracticeHistory();
    state.history = Array.isArray(data.history) ? data.history : [];
    state.historyAvailable = true;
  } catch (error) {
    state.historyAvailable = false;
    console.error("[MockMate] Could not restore private practice history:", error instanceof Error ? error.name : "unknown");
  }
}

async function refreshPracticePlan() {
  if (!state.user || !state.documentStorageAvailable) return;
  try {
    const data = await getPracticePlan();
    state.practicePlan = Array.isArray(data.tasks) ? data.tasks : [];
    state.planAvailable = true;
    state.planError = "";
  } catch (error) {
    state.planAvailable = false;
    state.planError = error instanceof Error ? error.message : "Your practice plan could not be loaded.";
    console.error("[MockMate] Could not restore private practice plan:", error instanceof Error ? error.name : "unknown");
  }
}

async function init() {
  // Guest mode is an explicit choice for each page load. Returning visitors
  // start at sign-in instead of being dropped straight into the dashboard.
  sessionStorage.removeItem("mockmate-guest");
  state.profileName = sessionStorage.getItem("mockmate-guest-name") || "";
  onSupabaseAuthChange((event) => {
    if (event === "PASSWORD_RECOVERY") { state.authMode = "new-password"; state.authError = ""; state.authNotice = ""; state.authChecking = false; render(); }
  });
  await checkSupabaseAuthConfigured();
  if (new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery") state.authMode = "new-password";
  state.user = await restoreSupabaseSession();
  state.authNotice = sessionStorage.getItem("mockmate-auth-notice") || "";
  sessionStorage.removeItem("mockmate-auth-notice");
  const dataStatus = await getDataStoreStatus();
  state.documentStorageAvailable = dataStatus.documentStorageAvailable;
  if (state.user && state.documentStorageAvailable) {
    await refreshPracticeHistory();
    await refreshPracticePlan();
    try {
      const data = await getSavedDocuments();
      state.savedDocuments = data.documents || [];
      const resume = state.savedDocuments.find((doc) => doc.type === "resume");
      const jd = state.savedDocuments.find((doc) => doc.type === "job_description");
      if (resume) { state.resumeText = resume.text; state.claims = localClaims(resume.text); state.fileName = resume.fileName; state.source = "local"; }
      if (jd) state.jobDescription = jd.text;
    } catch (error) { console.error("[MockMate] Could not restore private documents:", error instanceof Error ? error.name : "unknown"); }
  }
  try { const response = await fetch("/api/coach/status"); const status = response.ok ? await response.json() : null; state.aiAvailable = status?.available === true; }
  catch { state.aiAvailable = false; }
  state.authChecking = false;
  render();
}

async function startPractice() {
  state.busy = true; state.error = ""; state.notice = ""; state.report = null; state.answers = []; state.questions = []; state.questionIndex = 0; state.phase = "main"; state.followUp = ""; state.followUpsUsed = 0; state.evaluation = null; state.questionSeed = Math.floor(Math.random() * 30);
  if (state.saveConsent && !state.user) { state.error = "Sign in before saving personal documents to your Supabase account."; state.busy = false; render(); return; }
  if (state.saveConsent && !state.documentStorageAvailable) { state.error = "Private document saving is unavailable. Your resume stays in this browser and you can still practise. Configure Supabase in .env.local to enable account saves."; state.busy = false; render(); return; }
  if (state.saveConsent) {
    state.storageBusy = true; render();
    try {
      let savedCount = 0;
      const oldResume = state.savedDocuments.find((doc) => doc.type === "resume");
      const oldJob = state.savedDocuments.find((doc) => doc.type === "job_description");
      if (state.source !== "sample" && state.resumeText.trim() && (state.resumeFile || !oldResume || oldResume.text !== state.resumeText)) { await saveDocument({ type: "resume", fileName: state.fileName || "Pasted resume text", text: state.resumeText, file: state.resumeFile }); savedCount++; }
      if (state.jobDescription.trim() && (state.jdFile || !oldJob || oldJob.text !== state.jobDescription)) { await saveDocument({ type: "job_description", fileName: state.jdFile?.name || "Pasted job description", text: state.jobDescription, file: state.jdFile }); savedCount++; }
      const saved = await getSavedDocuments(); state.savedDocuments = saved.documents || [];
      state.notice = savedCount ? "Your resume/job description was saved privately to your account. You can delete it from setup any time." : "No new document changes needed saving. Your saved files are still private in your account.";
    } catch (error) { state.error = error instanceof Error ? error.message : "Could not save your documents."; state.storageBusy = false; state.busy = false; render(); return; }
    state.storageBusy = false;
  }
  const questionCount = plannedQuestionCount();
  const local = buildLocalQuestionSet(state.claims, state.language, practiceRole, 0, questionCount, [], state.questionSeed);
  state.questions = local;
  state.screen = "interview"; startInterviewTimer(); render();
  if (state.aiOptIn && state.aiAvailable) {
    try {
      const r = await callCoach({ action: "questions", role: practiceRole, language: state.language, variationId: `${Date.now()}-${Math.random().toString(36).slice(2)}`, questionCount, claims: state.claims.map((c) => redactForAI(c.claim)) });
      if (Array.isArray(r.questions) && r.questions.length === questionCount) {
        const seen = new Set();
        const aiQuestions = r.questions.map((question) => question.trim()).filter((question) => {
          const key = normalizeInterviewQuestion(question);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const localFill = buildLocalQuestionSet(state.claims, state.language, practiceRole, 0, questionCount, aiQuestions, state.questionSeed);
        state.questions = [...aiQuestions, ...localFill].slice(0, questionCount);
      }
      else throw new Error("The AI returned an incomplete question list.");
    } catch (e) { state.notice = `${e.message} Using built-in questions for this round.`; }
  }
  state.busy = false; render();
}

function updateInterviewTimer() {
  const remaining = Math.max(0, state.interviewEndsAt - Date.now());
  const elapsedPercent = state.interviewStartedAt
    ? Math.min(100, ((Date.now() - state.interviewStartedAt) / (state.durationMinutes * 60_000)) * 100)
    : 0;
  const display = document.querySelector(".session-countdown");
  if (display) { display.textContent = formatTime(remaining); display.classList.toggle("is-ending", remaining < 60_000); }
  const progress = document.querySelector(".progress-line");
  const fill = document.querySelector(".time-progress-fill");
  if (progress) progress.setAttribute("aria-valuenow", String(Math.round(elapsedPercent)));
  if (fill) fill.style.width = `${elapsedPercent}%`;
  if (remaining <= 0 && !state.evalBusy) finish();
}

function startInterviewTimer() {
  if (interviewTimer) clearInterval(interviewTimer);
  state.interviewStartedAt = Date.now();
  state.interviewEndsAt = state.interviewStartedAt + state.durationMinutes * 60_000;
  interviewTimer = window.setInterval(updateInterviewTimer, 1_000);
  updateInterviewTimer();
}

function stopInterviewTimer() {
  if (interviewTimer) clearInterval(interviewTimer);
  interviewTimer = null;
}

function stopMic() {
  state.micActive = false;
  state.listening = false;
  if (state.recognition) {
    try { state.recognition.abort(); } catch {}
    state.recognition = null;
  }
  updateMicUI();
}

function showLiveTranscript() {
  const box = document.querySelector("#answer-box");
  if (box && box.value !== state.answer) {
    box.value = state.answer;
    box.setAttribute("aria-label", "Live speech transcript. You can edit this answer.");
  }
  const status = document.querySelector("#transcript-status");
  if (status) status.textContent = state.listening
    ? "Listening — your speech is appearing above. Press Stop listening when done."
    : state.answer.trim()
      ? "Transcript is saved here. Edit it before continuing."
      : "Press Speak & type and allow microphone access.";
  const wordCount = document.querySelector("#answer-word-count");
  if (wordCount) wordCount.textContent = String(state.answer.trim().split(/\s+/).filter(Boolean).length);
  const submit = document.querySelector(".submit-answer");
  if (submit) submit.disabled = !state.answer.trim();
}

function updateMicUI() {
  const micBtn = document.querySelector('[data-action="mic"]');
  if (micBtn) {
    micBtn.className = `voice-button mic-control ${state.listening ? "recording" : ""}`;
    micBtn.setAttribute("aria-pressed", String(state.listening));
    micBtn.setAttribute("aria-label", state.listening ? "Stop microphone and keep transcript" : "Start microphone and transcribe answer");
    micBtn.innerHTML = `
      <svg class="mic-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6"/></svg>
      <span>${state.listening ? "Stop listening" : "Speak & type"}</span>
      ${state.listening ? `<span class="mic-wave" aria-hidden="true">${Array.from({length:7},()=>"<i></i>").join("")}</span>` : ""}
    `;
  }
  const status = document.querySelector("#transcript-status");
  if (status) {
    status.textContent = state.listening
      ? "Listening — your speech is appearing above. Press Stop listening when done."
      : state.answer.trim()
        ? "Transcript is saved here. Edit it before continuing."
        : "Press Speak & type and allow microphone access.";
  }
}

async function startMic() {
  state.error = "";
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname === "::1";
  if (!window.isSecureContext && !isLocal) {
    state.error = "Microphone requires a secure page (HTTPS or localhost).";
    render();
    return;
  }

  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    state.error = "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your answer.";
    render();
    return;
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        state.error = "Microphone access is blocked. Click the site/lock icon in your browser address bar and set Microphone to 'Allow', then try again.";
        state.listening = false;
        state.micActive = false;
        render();
        return;
      }
    }
  }

  state.micActive = true;
  state.listening = true;
  const currentBox = document.querySelector("#answer-box");
  state.micBaseAnswer = currentBox ? currentBox.value : state.answer;
  state.finalTranscript = "";
  updateMicUI();

  startRecognitionInstance();
}

function startRecognitionInstance() {
  if (!state.micActive) return;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return;

  try {
    if (state.recognition) {
      try { state.recognition.abort(); } catch {}
      state.recognition = null;
    }

    const rec = new Ctor();
    state.recognition = rec;
    rec.lang = state.language === "Hindi" ? "hi-IN" : "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let sessionFinal = "";

    rec.onstart = () => {
      if (!state.micActive) {
        try { rec.stop(); } catch {}
        return;
      }
      state.listening = true;
      state.error = "";
      updateMicUI();
    };

    rec.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript || "";
        if (item.isFinal) {
          finalChunk += (finalChunk ? " " : "") + text;
        } else {
          interimChunk += (interimChunk ? " " : "") + text;
        }
      }

      sessionFinal = finalChunk;
      const combinedSpoken = [sessionFinal, interimChunk].filter(Boolean).join(" ");
      const base = state.micBaseAnswer.trim();
      state.answer = [base, combinedSpoken].filter(Boolean).join(base && combinedSpoken ? "\n" : "");
      showLiveTranscript();
    };

    rec.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      const errors = {
        "not-allowed": "Microphone permission is blocked. Please allow Microphone access in your browser settings.",
        "service-not-allowed": "Speech recognition service is blocked or unavailable in this browser window. Allow microphone permissions in Chrome or Edge.",
        "audio-capture": "No microphone found or another application is using it.",
        "network": "Speech-to-text service network error. Check your internet connection.",
        "language-not-supported": "Speech recognition does not support this language on this browser.",
      };

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        state.micActive = false;
        state.listening = false;
      }
      state.error = errors[event.error] || `Microphone stopped (${event.error}).`;
      updateMicUI();
      render();
    };

    rec.onend = () => {
      if (sessionFinal) {
        const base = state.micBaseAnswer.trim();
        state.micBaseAnswer = [base, sessionFinal].filter(Boolean).join(base && sessionFinal ? "\n" : "");
        sessionFinal = "";
      }

      if (state.micActive) {
        try {
          rec.start();
        } catch {
          setTimeout(() => {
            if (state.micActive) startRecognitionInstance();
          }, 200);
        }
      } else {
        state.listening = false;
        state.recognition = null;
        updateMicUI();
      }
    };

    rec.start();
  } catch (cause) {
    if (cause?.name === "InvalidStateError") return;
    state.micActive = false;
    state.listening = false;
    state.recognition = null;
    state.error = "Could not start microphone. Please check browser microphone permissions in Chrome or Edge.";
    render();
  }
}

function makeVerificationQuestion(answer, resumeDetail, language) {
  const topic = extractShortTopic(resumeDetail);
  if (language === "Hindi") return `“${topic}” में आपका व्यक्तिगत योगदान क्या था और क्या परिणाम मिला?`;
  if (language === "Hinglish") return `“${topic}” mein aapka exact contribution kya tha aur kya result mila?`;
  return `In “${topic}”, what was your exact contribution and the final outcome?`;
}

function resumeClaimFor(question, index) {
  const sourceClaims = state.claims.length ? state.claims : SAMPLE_CLAIMS;
  const relevantClaims = sourceClaims.filter((item) => !isResumeContactLine(item.claim));
  const claims = relevantClaims.length ? relevantClaims : SAMPLE_CLAIMS;
  const words = String(question).toLowerCase().match(/[a-z0-9+#.-]{4,}/g) || [];
  const ignored = new Set(["your", "what", "when", "where", "which", "would", "could", "should", "about", "explain", "describe", "tell", "project", "resume", "student", "role", "example"]);
  const terms = [...new Set(words.filter((word) => !ignored.has(word)))];
  const ranked = claims.map((item) => ({ item, score: terms.reduce((score, word) => score + (item.claim.toLowerCase().includes(word) || item.category.toLowerCase().includes(word) ? 1 : 0), 0) }));
  const best = Math.max(...ranked.map((entry) => entry.score));
  return best > 0 ? ranked.find((entry) => entry.score === best).item : claims[index % claims.length];
}

function adaptNextMainQuestion(score) {
  state.difficulty = score > 8 ? "hard" : score < 5 ? "easy" : "medium";
  if (state.questionIndex < state.questions.length - 1) state.questions[state.questionIndex + 1] = locallyAdaptQuestion(state.questions[state.questionIndex + 1], state.claims, practiceRole, state.language, state.difficulty);
}

async function evaluate() {
  const answer = state.answer.trim(); if (!answer) return;
  stopMic();
  const mainQuestion = state.questions[state.questionIndex];
  const q = state.phase === "followup" ? state.followUp : mainQuestion; const claim = resumeClaimFor(mainQuestion, state.questionIndex);
  const local = localEvaluation(q, answer, state.language);
  const entry = { question: q, answer, claimId: claim.id, evaluation: local };
  state.answers.push(entry); state.answer = ""; 
  
  // Use local estimate to transition instantly
  const avg = Object.values(local.scores).reduce((a,b) => a+b, 0) / 5;
  if (state.phase === "main") { 
    state.followUp = state.followUpsUsed < 2 ? makeVerificationQuestion(answer, claim.claim, state.language) : ""; 
    adaptNextMainQuestion(avg); 
  }

  // Fire-and-forget AI evaluation in the background
  if (state.aiOptIn && state.aiAvailable) {
    callCoach({ action: "evaluate", role: practiceRole, language: state.language, question: redactForAI(q), answer: redactForAI(answer), context: redactForAI(claim.claim), difficulty: state.difficulty })
      .then(result => {
        entry.evaluation = { ...result.evaluation, provider: "Gemini" };
      })
      .catch(e => console.warn("Background AI evaluation failed:", e));
  }
  
  state.error = "";
  if (state.phase === "main" && state.followUp) {
    state.phase = "followup";
    state.followUpsUsed++;
  } else {
    state.phase = "main";
    state.followUp = "";
    state.questionIndex++;
    if (state.questionIndex >= plannedQuestionCount()) {
      finish();
      return;
    }
  }
  render();
}

async function finish() {
  stopMic(); stopInterviewTimer(); state.interviewEndsAt = 0; if (!state.answers.length) { state.screen = "setup"; render(); return; }
  state.report = createPracticeReport(state.answers);
  const session = { role: "Resume-based practice", score: state.report.overall, answers: state.answers.length, duration: state.durationMinutes, completedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }), completedAtISO: new Date().toISOString() };
  state.practicePlan = state.report.nextSteps.slice(0, 6).map((text) => ({ text, completed: false }));
  state.planError = "";
  state.history.unshift(session);
  state.history = state.history.slice(0, 100); state.screen = "report"; state.notice = state.user && state.documentStorageAvailable ? "Saving your private practice summary…" : ""; render();
  if (state.user && state.documentStorageAvailable) {
    state.planSaving = true;
    const [historyResult, planResult] = await Promise.allSettled([savePracticeHistory(session), savePracticePlan(state.practicePlan)]);
    state.planSaving = false;
    if (historyResult.status === "fulfilled") state.historyAvailable = true;
    if (planResult.status === "fulfilled") state.planAvailable = true;
    else state.planError = planResult.reason instanceof Error ? planResult.reason.message : "Your practice plan could not be saved.";
    state.notice = historyResult.status === "fulfilled" && planResult.status === "fulfilled"
      ? "Your practice summary and personal plan were saved privately to your account."
      : historyResult.status === "rejected"
        ? historyResult.reason instanceof Error ? historyResult.reason.message : "Your practice summary could not be saved."
        : "Your practice summary was saved, but the plan could not be saved yet.";
    render();
  }
}

root.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action], [data-screen], [data-language], [data-duration], [data-range]"); if (!target) return;
  if (target.dataset.screen) { state.screen = target.dataset.screen; render(); return; }
  if (target.dataset.language) { state.language = target.dataset.language; render(); return; }
  if (target.dataset.duration) { state.durationMinutes = Number(target.dataset.duration); render(); return; }
  if (target.dataset.range) { state.analyticsRange = target.dataset.range; render(); return; }
  const action = target.dataset.action;
  if (action === "theme-toggle") { state.theme = state.theme === "dark" ? "light" : "dark"; try { localStorage.setItem("mockmate-theme", state.theme); } catch {} render(); }
  else if (action === "auth-signup" || action === "auth-login" || action === "auth-reset") { state.authMode = action.slice(5); state.authError = ""; state.authNotice = ""; render(); }
  else if (action === "guest") { state.guest = true; sessionStorage.removeItem("mockmate-guest"); render(); }
  else if (action === "goto-setup") { state.screen = "setup"; state.error = ""; render(); }
  else if (action === "goto-dashboard") { state.screen = "dashboard"; state.answer = ""; stopMic(); stopInterviewTimer(); state.interviewEndsAt = 0; render(); }
  else if (action === "goto-history") { state.screen = "history"; render(); }
  else if (action === "goto-plan") { state.screen = "plan"; render(); }
  else if (action === "analytics-all") { state.analyticsRange = "all"; render(); }
  else if (action === "start") await startPractice();
  else if (action === "browse") document.querySelector('[data-field="file"]')?.click();
  else if (action === "browse-jd") document.querySelector('[data-field="jdFile"]')?.click();
  else if (action === "sample") { state.claims = SAMPLE_CLAIMS; state.source = "sample"; state.resumeText = ""; state.resumeFile = null; state.fileName = ""; state.error = ""; render(); }
  else if (action === "remove-resume") { state.claims = SAMPLE_CLAIMS; state.source = "sample"; state.resumeText = ""; state.resumeFile = null; state.fileName = ""; render(); }
  else if (action === "paste-resume") { const found = localClaims(state.pasted); if (!found.length) state.error = "Paste a few resume lines or project descriptions (at least 35 characters each)."; else { state.claims = found; state.source = "local"; state.resumeText = state.pasted.slice(0, 20000); state.resumeFile = null; state.fileName = "Pasted resume text"; state.error = ""; } render(); }
  else if (action === "open-login") { state.guest = false; sessionStorage.removeItem("mockmate-guest"); state.authMode = "login"; render(); }
  else if (action === "delete-documents") {
    if (!window.confirm("Delete your saved resume and job description from Supabase? This cannot be undone.")) return;
    state.deletingDocuments = true; render();
    try { await deleteSavedDocuments(); state.savedDocuments = []; state.resumeText = ""; state.resumeFile = null; state.jobDescription = ""; state.jdFile = null; state.claims = SAMPLE_CLAIMS; state.source = "sample"; state.fileName = ""; state.notice = "Your saved documents and private file copies were deleted."; }
    catch (error) { state.error = error instanceof Error ? error.message : "Could not delete saved documents."; }
    finally { state.deletingDocuments = false; render(); }
  }
  else if (action === "delete-history") {
    if (!window.confirm("Delete all your practice history? This cannot be undone.")) return;
    state.deletingHistory = true; state.error = ""; render();
    try { if (state.user && state.documentStorageAvailable) await deletePracticeHistory(); state.history = []; state.notice = "Your practice history was deleted."; }
    catch (error) { state.error = error instanceof Error ? error.message : "Could not delete your practice history."; }
    finally { state.deletingHistory = false; render(); }
  }
  else if (action === "toggle-plan-task") {
    const index = Number(target.dataset.planIndex);
    if (!Number.isInteger(index) || !state.practicePlan[index] || state.planSaving) return;
    const previous = state.practicePlan.map((task) => ({ ...task }));
    state.practicePlan[index].completed = !state.practicePlan[index].completed;
    state.planSaving = true; state.planError = ""; render();
    try {
      if (state.user && state.documentStorageAvailable) {
        await updatePracticePlanTask(index, state.practicePlan[index].completed);
        state.planAvailable = true;
      }
    } catch (error) {
      state.practicePlan = previous;
      state.planError = error instanceof Error ? error.message : "Your progress could not be saved.";
    } finally { state.planSaving = false; render(); }
  }
  else if (action === "delete-plan") {
    if (!window.confirm("Clear your personal practice plan and its completion progress?")) return;
    state.planSaving = true; state.planError = ""; render();
    try {
      if (state.user && state.documentStorageAvailable) await deletePracticePlan();
      state.practicePlan = []; state.planAvailable = Boolean(state.user && state.documentStorageAvailable); state.notice = "Your practice plan was cleared.";
    } catch (error) { state.planError = error instanceof Error ? error.message : "Your practice plan could not be cleared."; }
    finally { state.planSaving = false; render(); }
  }
  else if (action === "mic") state.listening ? stopMic() : startMic();
  else if (action === "listen") { const u = new SpeechSynthesisUtterance(state.questions[state.questionIndex]); u.lang = "en-US"; window.speechSynthesis?.speak(u); }
  else if (action === "evaluate") await evaluate();
  else if (action === "continue") { state.evaluation = null; state.answer = ""; state.error = ""; if (state.phase === "main" && state.followUp) { state.phase = "followup"; state.followUpsUsed++; } else { state.phase = "main"; state.followUp = ""; state.questionIndex++; if (state.questionIndex >= plannedQuestionCount()) { finish(); return; } } render(); }
  else if (action === "finish") finish();
  else if (action === "signout") { await clearSupabaseSession(); sessionStorage.removeItem("mockmate-guest"); sessionStorage.removeItem("mockmate-guest-name"); state.profileName = ""; state.user = null; state.guest = false; state.history = []; state.historyAvailable = false; state.practicePlan = []; state.planAvailable = false; state.planError = ""; state.report = null; state.authMode = "login"; render(); }
  else if (action === "profile") { state.profileOpen = true; state.profileName = state.user?.displayName || state.profileName || ""; render(); }
  else if (action === "close-profile") { state.profileOpen = false; render(); }
  else if (action === "save-profile") { const name = state.profileName.trim(); if (name.length < 2 || name.length > 60) { state.profileError = "Enter a name between 2 and 60 characters."; render(); return; } if (!state.user) { state.profileName = name; sessionStorage.setItem("mockmate-guest-name", name); state.profileOpen = false; render(); return; } state.profileSaving = true; render(); try { state.user = await updateDisplayName(name); state.profileOpen = false; } catch (e) { state.profileError = e.message; } finally { state.profileSaving = false; render(); } }
});

root.addEventListener("input", (event) => { const el = event.target; if (el.dataset.field === "answer") { state.answer = el.value; state.micBaseAnswer = el.value; const submit = document.querySelector(".submit-answer"); if (submit) submit.disabled = !state.answer.trim(); const wordCount = document.querySelector("#answer-word-count"); if (wordCount) wordCount.textContent = String(state.answer.trim().split(/\s+/).filter(Boolean).length); } if (el.dataset.field === "pasted") state.pasted = el.value; if (el.dataset.field === "profileName") state.profileName = el.value; if (el.dataset.field === "jobDescription") state.jobDescription = el.value.slice(0, 20000); });
root.addEventListener("change", async (event) => {
  const el = event.target;
  // Leaving an auth input fires `change`; rerendering here replaces the form
  // and clears the value the user just entered. Auth fields are read on submit.
  if (el.closest("#auth-form")) return;
  if (el.dataset.field === "ai") state.aiOptIn = el.checked;
  if (el.dataset.field === "saveConsent") state.saveConsent = el.checked;
  if (el.dataset.field === "file" && el.files?.[0]) {
    state.busy = true; state.error = ""; render();
    try { const text = await extractPdf(el.files[0]); const claims = localClaims(text); if (!claims.length) throw new Error("I couldn’t find enough selectable text. Paste a few project lines instead."); state.claims = claims; state.resumeText = text; state.resumeFile = el.files[0]; state.fileName = el.files[0].name; state.source = "local"; }
    catch (e) { state.error = friendlyResumeError(e); }
    finally { state.busy = false; render(); }
    return;
  }
  if (el.dataset.field === "jdFile" && el.files?.[0]) {
    const file = el.files[0]; state.busy = true; state.error = ""; render();
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("File must be 5 MB or smaller.");
      const text = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? await extractPdf(file) : await file.text();
      if (text.trim().length < 40) throw new Error("This job description has too little readable text. Paste the text or choose another file.");
      state.jobDescription = text.slice(0, 20000); state.jdFile = file;
    } catch (error) { state.error = error instanceof Error ? error.message : "Could not read that job description file."; }
    finally { state.busy = false; render(); }
    return;
  }
  render();
});

root.addEventListener("submit", async (event) => {
  if (event.target.id !== "auth-form") return; event.preventDefault(); const fd = new FormData(event.target); const email = String(fd.get("email") || ""); const password = String(fd.get("password") || ""); state.authError = ""; state.authNotice = "";
  if ((state.authMode === "signup" || state.authMode === "new-password") && password !== String(fd.get("confirm") || "")) { state.authError = "Your passwords don’t match."; render(); return; }
  state.authBusy = true; render(); try {
    if (state.authMode === "reset") { await sendPasswordReset(email); state.authNotice = "If that account exists, Supabase will send a password reset email."; }
    else if (state.authMode === "new-password") { await updatePassword(password); await clearSupabaseSession(); state.authMode = "login"; state.authNotice = "Your password has been changed. Sign in with your new password."; history.replaceState(null, "", window.location.pathname); }
    else if (state.authMode === "signup") {
      state.user = await createAccount(email, password, String(fd.get("name") || ""));
      if (!state.user) { state.authMode = "login"; state.authNotice = `Verification link sent to ${email}. Open that email, verify your address, then sign in here.`; }
      else { state.guest = false; sessionStorage.removeItem("mockmate-guest"); state.screen = "dashboard"; await Promise.all([refreshPracticeHistory(), refreshPracticePlan()]); }
    } else { state.user = await signIn(email, password); state.guest = false; sessionStorage.removeItem("mockmate-guest"); state.screen = "dashboard"; await Promise.all([refreshPracticeHistory(), refreshPracticePlan()]); }
  } catch (e) { state.authError = e.message; } finally { state.authBusy = false; render(); }
});

const dropZone = () => document.querySelector("#drop-zone");
root.addEventListener("dragover", (e) => { if (e.target.closest("#drop-zone")) { e.preventDefault(); e.target.closest("#drop-zone").classList.add("dragging"); } });
root.addEventListener("dragleave", (e) => { if (e.target.closest("#drop-zone")) e.target.closest("#drop-zone").classList.remove("dragging"); });
root.addEventListener("drop", async (e) => { if (!e.target.closest("#drop-zone")) return; e.preventDefault(); dropZone()?.classList.remove("dragging"); const file = e.dataTransfer.files[0]; if (!file) return; const input = document.querySelector('[data-field="file"]'); const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true })); });
window.addEventListener("beforeunload", stopMic);
init();
