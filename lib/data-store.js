import { getSupabaseAccessToken } from "./supabase-auth.ts";

async function responseJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages = {
      AUTH_REQUIRED: "Sign in to save and retrieve your private documents.",
      DATA_UNAVAILABLE: "Private saving needs the Supabase Project URL, public key, and a server secret key beginning with sb_secret_ in .env.local. Save the file and restart the dev server.",
      DATA_ERROR: "Private saving could not reach Supabase. Check the server secret key in .env.local and confirm it belongs to this project, then restart the dev server.",
      STORAGE_FAILED: "The file could not be saved. Check the Supabase private bucket setup.",
      DATABASE_WRITE_FAILED: "The document text could not be saved. Check that the Supabase SQL setup was run.",
      DATABASE_READ_FAILED: "Saved documents could not be loaded. Check the Supabase setup and try again.",
      HISTORY_READ_FAILED: "Practice history is not set up yet. Run supabase/practice-history.sql in the Supabase SQL Editor, then refresh.",
      HISTORY_WRITE_FAILED: "This practice summary could not be saved. Run the practice-history SQL setup in Supabase, then try again.",
      HISTORY_DELETE_FAILED: "Your practice history could not be deleted. Please try again.",
      INVALID_HISTORY: "This practice summary is incomplete and could not be saved.",
      PLAN_READ_FAILED: "Your practice plan could not be loaded. Check Supabase and try again.",
      PLAN_WRITE_FAILED: "Your practice plan could not be saved. Run supabase/practice-plan.sql in the Supabase SQL Editor, then try again.",
      PLAN_DELETE_FAILED: "Your practice plan could not be cleared. Please try again.",
      PLAN_TASK_NOT_FOUND: "That practice-plan task has changed. Refresh the page and try again.",
      INVALID_PLAN: "This practice plan contains an invalid task.",
      RATE_LIMIT: "Please wait a little before trying this data action again.",
      TOO_LARGE: "The file must be 5 MB or smaller. Choose a smaller PDF or text file.",
    };
    throw new Error(messages[body.code] || "MockMate could not access private storage. Check your connection and Supabase setup.");
  }
  return body;
}

function fileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export async function getDataStoreStatus() {
  try {
    const r = await fetch("/api/data/status");
    const data = await r.json();
    return {
      documentStorageAvailable: r.ok && (data.documentStorageAvailable === true || data.available === true),
    };
  } catch { return { documentStorageAvailable: false }; }
}


export async function getSavedDocuments() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to load your saved documents.");
  return responseJson(await fetch("/api/data/documents", { headers: { Authorization: `Bearer ${accessToken}` } }));
}

export async function saveDocument({ type, fileName, text, file }) {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to save documents to your private account.");
  const body = { accessToken, consent: true, type, fileName, text };
  if (file) {
    body.fileBase64 = await fileAsBase64(file);
    body.contentType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "text/plain";
  }
  return responseJson(await fetch("/api/data/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

export async function deleteSavedDocuments() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in again to delete your saved documents.");
  return responseJson(await fetch("/api/data/documents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) }));
}

export async function getPracticeHistory() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to load your private practice history.");
  return responseJson(await fetch("/api/data/history", { headers: { Authorization: `Bearer ${accessToken}` } }));
}

export async function savePracticeHistory({ role, score, answers, duration }) {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to save your practice history across visits.");
  return responseJson(await fetch("/api/data/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken, role, score, answers, duration }) }));
}

export async function deletePracticeHistory() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in again to delete your practice history.");
  return responseJson(await fetch("/api/data/history", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) }));
}

export async function getPracticePlan() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to load your private practice plan.");
  return responseJson(await fetch("/api/data/plan", { headers: { Authorization: `Bearer ${accessToken}` } }));
}

export async function savePracticePlan(tasks) {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to save your practice plan across visits.");
  return responseJson(await fetch("/api/data/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken, tasks }) }));
}

export async function updatePracticePlanTask(index, completed) {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in to update your practice plan.");
  return responseJson(await fetch("/api/data/plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken, index, completed }) }));
}

export async function deletePracticePlan() {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Sign in again to clear your practice plan.");
  return responseJson(await fetch("/api/data/plan", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken }) }));
}
