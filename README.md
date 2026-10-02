<div align="center">
  <img src="https://img.icons8.com/color/96/000000/microphone--v1.png" alt="MockMate AI Logo" width="100"/>
  
  <h1 align="center">MockMate AI</h1>
  
  <p align="center">
    <strong>A next-generation browser-first AI mock interview practice platform for students and freshers.</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=googlebard" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Groq_%26_xAI-Live_Interview-F55036?style=for-the-badge&logo=lightning" alt="Groq/Grok" />
  </p>
</div>

<hr />

## ✨ Features

- 🎙️ **Real-time Voice Interactions**: Talk directly to the AI interviewer using built-in browser speech recognition. No extra software needed!
- 📄 **Smart Resume Parsing**: Upload your PDF resume, and the system instantly parses the data *client-side* for complete privacy.
- 🤖 **Dynamic AI Coaching (Powered by Gemini)**: Experience adaptive follow-up questions, real-time rubric grading, and highly personalized feedback.
- 📊 **Actionable Analytics**: Track your progress over time with visual charts and detailed history logs.
- 🔐 **Secure Authentication**: Seamless login and private session tracking powered by Supabase.
- 🚀 **Blazing Fast UI**: Built with React 19, styled with Tailwind CSS, and smoothly animated using Framer Motion.

---

## 🛠️ Tech Stack

This project uses a modern, high-performance web development stack:

| Category | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite |
| **Styling & UI** | Tailwind CSS, Framer Motion (Animations), Lucide React (Icons) |
| **Data Visualization** | Recharts |
| **Backend & Auth** | Supabase (Database, Storage, Authentication) |
| **AI Integration** | Google Gemini API (Coaching), Groq LPU / xAI Grok (Live Voice Interviewer) |
| **Document Processing**| PDF.js (Client-Side Document Parsing) |

---

## 🚀 Quick Start (Local Setup)

To get MockMate AI running locally on your machine, follow these steps. 

**Prerequisite:** Requires **Node.js 20+**.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/prajakta2905/MockMateAI.git
cd MockMateAI

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory and configure your keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY

# Security & Redirection
APP_ORIGIN=http://127.0.0.1:5173

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Groq / xAI API (For Live Ultra-Fast Interviewer)
VITE_GROK_API_KEY=gsk_your_groq_api_key_or_xai_key
```

### 3. Run the App
```bash
# Start the development server
npm run dev
```
Open **`http://127.0.0.1:5173/`** in your browser to start practicing!

---

## 🔐 Supabase Configuration

To enable user accounts, history tracking, and private resume storage, you must configure Supabase:

1. **Authentication**: Go to **Authentication → Providers** and enable **Email**.
2. **URL Config**: Set Site URL to `http://127.0.0.1:5173`. Add Redirect URLs: `http://127.0.0.1:5173/**` & `http://localhost:5173/**`.
3. **Database Schema**: Execute the following scripts in the **Supabase SQL Editor**:
   - `supabase/schema.sql` (Creates private bucket & RLS policies)
   - `supabase/practice-history.sql` (Tables for scores and durations)
   - `supabase/practice-plan.sql` (Tables for improvement tasks)

---

## 🧠 AI Coaching & Live Interviewer Setup (Optional)

Unlock the full potential of MockMate AI by connecting **Google Gemini** for coaching and **Groq (LPU)** or **xAI (Grok)** for ultra-low latency conversational follow-ups.

1. **Gemini API Key**: Get it from [Google AI Studio](https://aistudio.google.com/app/apikey). Add as `GEMINI_API_KEY`.
2. **Groq API Key**: For blazing-fast voice interview speed, get a key from [GroqCloud](https://console.groq.com/). Add as `VITE_GROK_API_KEY`. (Alternatively, use an xAI API key).
3. Restart your dev server.

*(Note: The built-in practice functionality is completely usable even without an API key!)*

---

## 🏗️ Architecture & Privacy

- **Frontend First**: Maximum parsing and processing is offloaded to the client for speed.
- **Privacy First**: Resumes are parsed locally in your browser. Audio data never leaves the client unless explicitly saved.
- **Vite Proxy**: Backend requests (Gemini, Supabase Admin) are proxied securely through Vite to protect API secrets.

> ⚠️ **Security Note:** Never expose your `SUPABASE_SECRET_KEY` or `GEMINI_API_KEY` to the frontend bundle via `VITE_` prefixes.

---

<div align="center">
  <b>Developed by <a href="https://github.com/prajakta2905">Prajakta</a></b>
</div>
