<div align="center">
  <img src="https://img.icons8.com/color/96/000000/microphone--v1.png" alt="MockMate AI Logo" width="80"/>
  <h1>MockMate AI</h1>
  <p><strong>A browser-first mock interview practice app for students and freshers.</strong></p>
</div>

<p align="center">
  Runs locally in your browser, extracts resume data intelligently, and supports real-time voice interviews.
</p>

---

## 🚀 Quick Start (Local Setup)

Requires **Node.js 20+**.

```powershell
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open `http://localhost:5173/` in Chrome or Edge. *Keep the terminal running while practicing.*

---

## 🔐 Supabase Authentication (Email)

Enable secure accounts and progress tracking. Guest practice remains available.

1. **Enable Auth**: In Supabase, go to **Authentication → Providers** and enable **Email** (keep confirmations on).
2. **URL Config**: Set Site URL to `http://127.0.0.1:5173`. Add Redirect URLs: `http://127.0.0.1:5173/**` & `http://localhost:5173/**`.
3. **Get Keys**: Copy **Project URL** and **Publishable (anon) key** from Project Settings.
4. **Environment Setup**: Add to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```
5. Restart the server (`npm run dev`).

---

## 🗄️ Private Storage & History

Securely save resumes and track performance across sessions.

1. **Secret Key**: Copy your Supabase **service-role (secret) key**.
2. **Database Setup**: Run these scripts in the **Supabase SQL Editor**:
   - `supabase/schema.sql` *(Creates private bucket & RLS)*
   - `supabase/practice-history.sql` *(Saves scores/durations safely)*
   - `supabase/practice-plan.sql` *(Tracks improvement tasks)*
3. **Environment Setup**: Update `.env.local`:
   ```env
   SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
   APP_ORIGIN=http://127.0.0.1:5173
   ```
4. Restart the server. Sign in to view history and plans automatically.

---

## 🧠 Optional AI Coaching (Gemini)

Unlock dynamic follow-ups, real-time rubric grading, and personalized feedback.

1. Get a **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it to `.env.local`:
   ```env
   GEMINI_API_KEY=your_key
   ```
3. Restart the server.

*(AI coaching remains disabled until opted in. Built-in practice remains usable without an API key.)*

---

## 🎯 How It Works

- **Client-Side Parsing**: Resumes (PDFs) are securely parsed entirely in the browser.
- **Voice Interactions**: Uses built-in browser speech recognition (zero setup required).
- **Dynamic Grading**: 5-axis scoring (*Accuracy, Communication, Relevance, Examples, Timing*) adapting to your skill level.
- **Privacy First**: Documents and answers remain local unless explicitly saved to your private cloud.

---

## 🏗️ Architecture Overview

- **Frontend UI**: Built for speed and simplicity.
- **Auth & State**: Secured by Supabase for smooth session handling.
- **Backend Proxy**: Vite securely proxies Gemini & Supabase requests locally to protect API keys.
- **Security**: Strict Row-Level Security (RLS) ensures private files stay in a private Storage bucket.

> ⚠️ **Security Note:** Never place `SUPABASE_SECRET_KEY` or `GEMINI_API_KEY` in frontend variables (`VITE_...`) or ship them in the static build.
