import type { Connect } from "vite";

const MAX_BODY_BYTES = 7 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;
const HOUR_MS = 60 * 60 * 1000;
const limits = new Map<string, { count: number; resetAt: number }>();
const BUCKET = "candidate-documents";

type DocKind = "resume" | "job_description";

function reply(res: import("node:http").ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function checkOrigin(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, allowed: Set<string>, required = true) {
  const origin = req.headers.origin;
  if ((required && typeof origin !== "string") || (typeof origin === "string" && !allowed.has(origin))) {
    reply(res, 403, { error: "This site is not allowed to use the MockMate data API.", code: "ORIGIN_DENIED" });
    return false;
  }
  if (typeof origin === "string") { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  return true;
}

async function bodyJson(req: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const part of req) {
    const chunk = Buffer.isBuffer(part) ? part : Buffer.from(part);
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function storageObjectUrl(url: string, path: string) {
  return `${url.replace(/\/$/, "")}/storage/v1/object/${BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function hasValidServerKey(secret: string) {
  return secret.startsWith("sb_secret_") || secret.startsWith("eyJ");
}

function restHeaders(secret: string, extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { apikey: secret, ...extra };
  // Modern sb_secret_ API keys are not JWTs and must never be sent as Bearer.
  // Legacy service_role keys are JWTs, so keep Bearer support for existing setups.
  if (secret.startsWith("eyJ")) headers.Authorization = `Bearer ${secret}`;
  return headers;
}

async function verifySupabaseToken(url: string, anonKey: string, accessToken: unknown) {
  if (typeof accessToken !== "string" || accessToken.length < 40 || accessToken.length > 10_000) return null;
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return null;
  const user = await response.json() as { id?: string; email_confirmed_at?: string | null; confirmed_at?: string | null };
  const uid = user.id;
  return Boolean(user.email_confirmed_at || user.confirmed_at) && typeof uid === "string" && /^[0-9a-f-]{36}$/i.test(uid) ? uid : null;
}

async function getOwnedDocuments(url: string, secret: string, uid: string) {
  const query = new URLSearchParams({ select: "doc_type,file_name,extracted_text,storage_path,created_at", owner_id: `eq.${uid}`, order: "created_at.desc" });
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/candidate_documents?${query}`, { headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error("DATABASE_READ_FAILED");
  return await response.json() as Array<{ doc_type: DocKind; file_name: string; extracted_text: string; storage_path: string | null; created_at: string }>;
}

async function getOwnedHistory(url: string, secret: string, uid: string) {
  const query = new URLSearchParams({ select: "id,role,score,answer_count,duration_minutes,completed_at", owner_id: `eq.${uid}`, order: "completed_at.desc", limit: "100" });
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_history?${query}`, { headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error("HISTORY_READ_FAILED");
  const rows = await response.json() as Array<{ id: string; role: string; score: number; answer_count: number; duration_minutes: number; completed_at: string }>;
  return rows.map((row) => ({ id: row.id, role: row.role, score: row.score, answers: row.answer_count, duration: row.duration_minutes, completedAt: new Date(row.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }), completedAtISO: row.completed_at }));
}

async function getOwnedPlan(url: string, secret: string, uid: string) {
  const query = new URLSearchParams({ select: "tasks", owner_id: `eq.${uid}`, limit: "1" });
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_plans?${query}`, { headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error("PLAN_READ_FAILED");
  const rows = await response.json() as Array<{ tasks: Array<{ text: string; completed: boolean }> }>;
  return Array.isArray(rows[0]?.tasks) ? rows[0].tasks : [];
}

export function dataApi(url: string, secret: string, anonKey: string, allowedOrigins: Set<string>): Connect.HandleFunction {
  return async (req, res, next) => {
    const path = (req.url ?? "/").split("?")[0];
    if (path === "/status" && req.method === "GET") return reply(res, 200, {
      documentStorageAvailable: Boolean(url && hasValidServerKey(secret) && anonKey),
    });
    if (!["/documents", "/history", "/plan"].includes(path) || !["GET", "POST", "PATCH", "DELETE"].includes(req.method ?? "")) return next();
    if (!checkOrigin(req, res, allowedOrigins, req.method !== "GET")) return;
    if (!anonKey || !url || !hasValidServerKey(secret)) return reply(res, 503, { error: "Private storage needs a valid Supabase secret key in .env.local.", code: "DATA_UNAVAILABLE" });
    const remoteAddress = req.socket.remoteAddress ?? "local";
    const now = Date.now();
    const limit = limits.get(remoteAddress);
    if (limit && limit.resetAt > now && limit.count >= 120) return reply(res, 429, { error: "Please wait before making more data requests.", code: "RATE_LIMIT" });
    limits.set(remoteAddress, !limit || limit.resetAt <= now ? { count: 1, resetAt: now + HOUR_MS } : { ...limit, count: limit.count + 1 });
    try {
      const body = req.method === "GET" ? {} : await bodyJson(req);
      if (req.method !== "GET" && !req.headers["content-type"]?.toLowerCase().includes("application/json")) return reply(res, 415, { error: "Send this request as JSON.", code: "INVALID_CONTENT_TYPE" });
      const accessToken = req.method === "GET" ? String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "") : body.accessToken;
      const uid = await verifySupabaseToken(url, anonKey, accessToken);
      if (!uid) return reply(res, 401, { error: "Please sign in again to access saved documents.", code: "AUTH_REQUIRED" });

      if (req.method === "GET") {
        if (path === "/history") return reply(res, 200, { history: await getOwnedHistory(url, secret, uid) });
        if (path === "/plan") return reply(res, 200, { tasks: await getOwnedPlan(url, secret, uid) });
        const docs = await getOwnedDocuments(url, secret, uid);
        return reply(res, 200, { documents: docs.map(({ doc_type, file_name, extracted_text, created_at }) => ({ type: doc_type, fileName: file_name, text: extracted_text, createdAt: created_at })) });
      }
      if (req.method === "DELETE") {
        if (path === "/plan") {
          const query = new URLSearchParams({ owner_id: `eq.${uid}` });
          const deleted = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_plans?${query}`, { method: "DELETE", headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
          if (!deleted.ok) throw new Error("PLAN_DELETE_FAILED");
          return reply(res, 200, { deleted: true });
        }
        if (path === "/history") {
          const query = new URLSearchParams({ owner_id: `eq.${uid}` });
          const deleted = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_history?${query}`, { method: "DELETE", headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
          if (!deleted.ok) throw new Error("HISTORY_DELETE_FAILED");
          return reply(res, 200, { deleted: true });
        }
        const docs = await getOwnedDocuments(url, secret, uid);
        const paths = docs.map((doc) => doc.storage_path).filter((value): value is string => Boolean(value));
        if (paths.length) {
          const removed = await fetch(`${url.replace(/\/$/, "")}/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: restHeaders(secret, { "Content-Type": "application/json" }), body: JSON.stringify({ prefixes: paths }), signal: AbortSignal.timeout(12_000) });
          if (!removed.ok) throw new Error("STORAGE_DELETE_FAILED");
        }
        const query = new URLSearchParams({ owner_id: `eq.${uid}` });
        const deleted = await fetch(`${url.replace(/\/$/, "")}/rest/v1/candidate_documents?${query}`, { method: "DELETE", headers: restHeaders(secret), signal: AbortSignal.timeout(12_000) });
        if (!deleted.ok) throw new Error("DATABASE_DELETE_FAILED");
        return reply(res, 200, { deleted: true });
      }

      if (path === "/plan") {
        let tasks: Array<{ text: string; completed: boolean }>;
        if (req.method === "PATCH") {
          const index = body.index;
          if (!Number.isInteger(index) || (index as number) < 0 || typeof body.completed !== "boolean") return reply(res, 400, { error: "Choose a valid practice-plan task.", code: "INVALID_PLAN" });
          tasks = await getOwnedPlan(url, secret, uid);
          if ((index as number) >= tasks.length) return reply(res, 404, { error: "That practice-plan task is no longer available.", code: "PLAN_TASK_NOT_FOUND" });
          tasks[index as number] = { ...tasks[index as number], completed: body.completed as boolean };
        } else {
          const input = body.tasks;
          const validTasks = Array.isArray(input) && input.length >= 1 && input.length <= 6 && input.every((task) => {
            if (!task || typeof task !== "object") return false;
            const item = task as Record<string, unknown>;
            return typeof item.text === "string" && Boolean(item.text.trim()) && item.text.length <= 400 && typeof item.completed === "boolean";
          });
          if (!validTasks) {
            return reply(res, 400, { error: "Provide one to six valid practice-plan tasks.", code: "INVALID_PLAN" });
          }
          tasks = (input as Array<{ text: string; completed: boolean }>).map((task) => ({ text: task.text.trim(), completed: task.completed }));
        }
        const saved = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_plans?on_conflict=owner_id`, {
          method: "POST", headers: restHeaders(secret, { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify({ owner_id: uid, tasks, updated_at: new Date().toISOString() }), signal: AbortSignal.timeout(15_000),
        });
        if (!saved.ok) throw new Error("PLAN_WRITE_FAILED");
        return reply(res, 200, { saved: true, tasks });
      }

      if (path === "/history") {
        const role = typeof body.role === "string" ? body.role.trim().slice(0, 120) : "";
        const score = body.score;
        const answers = body.answers;
        const duration = body.duration;
        if (!role || !Number.isInteger(score) || (score as number) < 0 || (score as number) > 100 || !Number.isInteger(answers) || (answers as number) < 1 || (answers as number) > 50 || ![20, 30, 45].includes(duration as number)) {
          return reply(res, 400, { error: "Provide a valid practice summary.", code: "INVALID_HISTORY" });
        }
        const saved = await fetch(`${url.replace(/\/$/, "")}/rest/v1/practice_history`, {
          method: "POST", headers: restHeaders(secret, { "Content-Type": "application/json", Prefer: "return=minimal" }),
          body: JSON.stringify({ owner_id: uid, role, score, answer_count: answers, duration_minutes: duration }), signal: AbortSignal.timeout(15_000),
        });
        if (!saved.ok) throw new Error("HISTORY_WRITE_FAILED");
        return reply(res, 200, { saved: true });
      }

      const kind = body.type;
      const fileName = typeof body.fileName === "string" ? body.fileName.trim().replace(/[\\/\0-\x1f]/g, "_").slice(0, 160) : "document.txt";
      const text = body.text;
      if (body.consent !== true || !(kind === "resume" || kind === "job_description") || typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_CHARS) {
        return reply(res, 400, { error: "Confirm storage consent and provide valid document text.", code: "INVALID_DOCUMENT" });
      }
      const previous = (await getOwnedDocuments(url, secret, uid)).find((doc) => doc.doc_type === kind);
      let storagePath: string | null = null;
      const base64 = body.fileBase64;
      if (base64 !== undefined) {
        if (typeof base64 !== "string" || base64.length > 7_050_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return reply(res, 413, { error: "The file must be 5 MB or smaller.", code: "TOO_LARGE" });
        const binary = Buffer.from(base64, "base64");
        if (binary.length > 5 * 1024 * 1024) return reply(res, 413, { error: "The file must be 5 MB or smaller.", code: "TOO_LARGE" });
        const contentType = body.contentType === "application/pdf" ? "application/pdf" : body.contentType === "text/plain" ? "text/plain" : "";
        if (!contentType) return reply(res, 400, { error: "Only PDF or plain text files can be saved.", code: "INVALID_FILE" });
        const ext = contentType === "application/pdf" ? "pdf" : "txt";
        storagePath = `${uid}/${kind}/latest.${ext}`;
        const uploaded = await fetch(storageObjectUrl(url, storagePath), { method: "PUT", headers: restHeaders(secret, { "Content-Type": contentType, "x-upsert": "true" }), body: binary, signal: AbortSignal.timeout(25_000) });
        if (!uploaded.ok) return reply(res, 502, { error: "Could not safely save that file. Check the Supabase Storage setup.", code: "STORAGE_FAILED" });
      }
      const row = { owner_id: uid, doc_type: kind, file_name: fileName, extracted_text: text.trim(), storage_path: storagePath, updated_at: new Date().toISOString() };
      const query = new URLSearchParams({ on_conflict: "owner_id,doc_type" });
      const saved = await fetch(`${url.replace(/\/$/, "")}/rest/v1/candidate_documents?${query}`, {
        method: "POST", headers: restHeaders(secret, { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }), body: JSON.stringify(row), signal: AbortSignal.timeout(15_000),
      });
      if (!saved.ok) return reply(res, 502, { error: "Could not save document text. Check the database schema setup.", code: "DATABASE_WRITE_FAILED" });
      if (previous?.storage_path && previous.storage_path !== storagePath) {
        const removed = await fetch(`${url.replace(/\/$/, "")}/storage/v1/object/${BUCKET}`, { method: "DELETE", headers: restHeaders(secret, { "Content-Type": "application/json" }), body: JSON.stringify({ prefixes: [previous.storage_path] }), signal: AbortSignal.timeout(12_000) });
        if (!removed.ok) console.error("[MockMate] replaced private file cleanup failed:", "storage-delete-failed");
      }
      return reply(res, 200, { saved: true, type: kind, fileName });
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
      const errorName = error instanceof Error ? error.message : "unknown";
      const historyError = ["HISTORY_READ_FAILED", "HISTORY_WRITE_FAILED", "HISTORY_DELETE_FAILED"].includes(errorName);
      const planError = ["PLAN_READ_FAILED", "PLAN_WRITE_FAILED", "PLAN_DELETE_FAILED"].includes(errorName);
      console.error("[MockMate] private data request failed:", tooLarge ? "body-too-large" : error instanceof Error ? error.name : "unknown");
      return reply(res, tooLarge ? 413 : historyError || planError ? 503 : 502, { error: tooLarge ? "The request is too large." : historyError ? "Practice history is not set up yet. Run supabase/practice-history.sql in the Supabase SQL Editor." : planError ? "The practice plan table is not set up yet. Run supabase/practice-plan.sql in the Supabase SQL Editor." : "Private storage is temporarily unavailable. Try again in a moment.", code: tooLarge ? "TOO_LARGE" : historyError || planError ? errorName : "DATA_ERROR" });
    }
  };
}
