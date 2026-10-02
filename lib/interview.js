export function redactForAI(text) {
  return text.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "[link removed]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[phone number removed]")
    .replace(/\b(?:email|phone|mobile|address)\s*:\s*[^,;\n]+/gi, "[contact detail removed]").slice(0, 3000);
}

export async function callCoach(payload) {
  let response;
  try {
    response = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, consent: true }) });
  } catch {
    throw new Error("Could not reach the AI coach. Check your internet connection; built-in practice is still available.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const messages = {
      RATE_LIMIT: "The AI coach is busy right now. Wait a little, or continue with built-in practice.",
      QUOTA: "Gemini’s available quota is used for now. Turn off the AI coach to keep practising, then try AI again later.",
      AI_UNAVAILABLE: "The AI coach is not configured. Check the server key; built-in practice is ready meanwhile.",
      AI_TIMEOUT: "The AI coach took too long to answer. Retry once, or continue with built-in practice.",
      TOO_LARGE: "That request is too long. Shorten the resume details or answer, then try again.",
      INVALID_REQUEST: "Some practice details could not be processed. Review them and try again.",
      INVALID_OUTPUT: "The AI response was incomplete. Retry once; built-in practice is still available.",
      NETWORK: "The AI service could not be reached. Check your connection and try again.",
      SERVER_ERROR: "The AI service had a temporary problem. Retry in a moment, or continue with built-in practice.",
      COACH_FAILED: "The AI coach could not finish this request. Retry once, or use built-in practice.",
    };
    throw new Error(messages[result.code] ?? "The AI coach could not finish this request. Retry once, or use built-in practice.");
  }
  return result;
}

export function localClaims(text) {
  const lines = text.split(/[\n•●▪]+/).flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/))
    .map((line) => line.replace(/^[-*\s]+/, "").trim()).filter((line) => line.length > 34 && line.length < 360 && !isResumeContactLine(line));
  return [...new Set(lines)].slice(0, 8).map((claim, index) => ({
    id: `local-${index + 1}`, claim,
    category: /python|java|typescript|javascript|react|node|sql|machine learning|tensorflow|pytorch|excel/i.test(claim) ? "Skills / technical work" : /\b\d+%|increased|reduced|improved|users|students|weeks/i.test(claim) ? "Result / impact" : /team|led|collaborated|organized|volunteer/i.test(claim) ? "Teamwork / leadership" : index === 0 ? "Project / resume detail" : "Experience / coursework",
  }));
}

export function isResumeContactLine(line) {
  const text = String(line);
  const contactLabels = (text.match(/\b(?:e-?mail|linkedin|github|portfolio|phone|mobile|contact|website)\b/gi) || []).length;
  const hasEmail = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text);
  const hasUrl = /(?:https?:\/\/|www\.)\S+/i.test(text);
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);
  const containsWork = /\b(?:built|created|developed|designed|implemented|tested|led|managed|improved|analyzed|analysed|deployed|maintained|automated|reduced|increased|organized|organised|volunteered|worked|used)\b/i.test(text);
  return !containsWork && (contactLabels >= 2 || hasEmail || hasUrl || hasPhone);
}

export async function extractPdf(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error("PDF must be 5 MB or smaller.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Choose a PDF file.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pageText = [];
  for (let number = 1; number <= Math.min(pdf.numPages, 8); number++) {
    const page = await pdf.getPage(number), content = await page.getTextContent();
    let line = "", previousY = null;
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = item.transform[5];
      line += `${previousY !== null && Math.abs(y - previousY) > 2.5 ? "\n" : " "}${item.str.trim()}`;
      previousY = y;
    }
    pageText.push(line);
  }
  const text = pageText.join("\n").replace(/[\t ]+/g, " ").replace(/ *\n */g, "\n").trim();
  if (text.length < 80) throw new Error("This PDF has no selectable text. Scanned PDFs need OCR, which is not included in the free version.");
  return text.slice(0, 20000);
}

export function friendlyResumeError(error) {
  if (!(error instanceof Error)) return "Could not read this resume. Try another PDF or paste a few resume lines.";
  if (["PDF must be 5 MB or smaller.", "Choose a PDF file."].includes(error.message) || /selectable text/i.test(error.message)) return error.message;
  if (/PasswordException/i.test(error.name)) return "This PDF is password-protected. Choose an unlocked, text-based PDF or paste your resume details.";
  if (/InvalidPDFException|FormatError/i.test(error.name)) return "This PDF looks damaged or unreadable. Choose another PDF or paste your project details.";
  return "Could not read this PDF. Try a text-based PDF under 5 MB, or paste a few resume/project lines.";
}

export function normalizeInterviewQuestion(question) {
  return String(question).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function extractShortTopic(claimText) {
  if (!claimText) return "your project";
  const cleaned = claimText.replace(/^[-*•●▪\s]+/, "").trim();
  const titleSplit = cleaned.split(/\s+[—–:]\s+/);
  if (titleSplit.length > 1 && titleSplit[0].length <= 35 && titleSplit[0].length >= 3) {
    return titleSplit[0].trim();
  }
  const actionMatch = cleaned.match(/^(?:built|created|developed|designed|led|delivered|implemented|launched)\s+([A-Za-z0-9+#.-]+(?:\s+[A-Za-z0-9+#.-]+)?)/i);
  if (actionMatch && actionMatch[1] && !/^(?:a|an|the|this|my|several|multiple|various)\b/i.test(actionMatch[1])) {
    return actionMatch[1].trim();
  }
  const clauseMatch = cleaned.match(/^([A-Za-z0-9\s_+/.-]{4,35}?)(?:\s+(?:using|with|for|to|after|by|in|during)\b|[—–:,-])/i);
  if (clauseMatch && clauseMatch[1].trim().length >= 4) {
    return clauseMatch[1].trim();
  }
  if (cleaned.length <= 30) return cleaned;
  const truncated = cleaned.slice(0, 28);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 8 ? truncated.slice(0, lastSpace) : truncated).trim();
}

export function buildLocalQuestionSet(claims, language, role, offset = 0, count = 12, exclude = [], variationSeed = 0) {
  const usableDetails = (claims.length ? claims : [{ claim: "a project or experience from your resume" }])
    .filter((item) => !isResumeContactLine(item.claim));
  const details = usableDetails.length ? usableDetails : [{ claim: "a project or experience from your resume" }];
  const templates = language === "English"
    ? [
        (topic) => `In “${topic}”, what was your specific role?`,
        (topic) => `Why did you choose the tech stack for “${topic}”?`,
        (topic) => `What major challenge did you solve in “${topic}”?`,
        (topic) => `What was the key outcome of “${topic}”?`,
        (topic) => `What would you improve in “${topic}” today?`,
        (topic) => `How did you test and verify “${topic}”?`,
        (topic) => `What was your biggest technical decision in “${topic}”?`,
        (topic) => `How did you handle task planning in “${topic}”?`,
        (topic) => `What trade-off did you make in “${topic}”?`,
        (topic) => `What was your main learning from “${topic}”?`,
        (topic) => `How did you measure success in “${topic}”?`,
        (topic) => `How did you debug issues in “${topic}”?`,
      ]
    : language === "Hindi"
      ? [
          (topic) => `“${topic}” में आपकी मुख्य भूमिका क्या थी?`,
          (topic) => `“${topic}” के लिए यह टेक स्टैक क्यों चुना?`,
          (topic) => `“${topic}” में मुख्य चुनौती क्या थी?`,
          (topic) => `“${topic}” से क्या मुख्य परिणाम मिला?`,
          (topic) => `“${topic}” में अब आप क्या सुधार करेंगे?`,
          (topic) => `“${topic}” में टेस्टिंग और वेरिफिकेशन कैसे किया?`,
          (topic) => `“${topic}” में मुख्य तकनीकी फैसला क्या था?`,
          (topic) => `“${topic}” में प्लानिंग और टास्क कैसे संभाले?`,
          (topic) => `“${topic}” में कौन-सा trade-off किया?`,
          (topic) => `“${topic}” से आपकी सबसे बड़ी सीख क्या रही?`,
          (topic) => `“${topic}” की सफलता कैसे मापी?`,
          (topic) => `“${topic}” में समस्या आने पर कैसे सुलझाया?`,
        ]
      : [
          (topic) => `“${topic}” mein aapka main role kya tha?`,
          (topic) => `“${topic}” ke liye tech stack kyun choose kiya?`,
          (topic) => `“${topic}” mein main challenge kya solve kiya?`,
          (topic) => `“${topic}” ka key result ya outcome kya tha?`,
          (topic) => `“${topic}” ko rebuild karna ho to kya improve karoge?`,
          (topic) => `“${topic}” mein testing kaise ki?`,
          (topic) => `“${topic}” mein sabse important technical decision kya tha?`,
          (topic) => `“${topic}” mein planning kaise manage ki?`,
          (topic) => `“${topic}” mein kaunsa main trade-off liya?`,
          (topic) => `“${topic}” se sabse badi learning kya mili?`,
          (topic) => `“${topic}” ka success outcome kaise measure kiya?`,
          (topic) => `“${topic}” mein bugs ya issues kaise solve kiye?`,
        ];

  const intro = language === "Hindi"
    ? `आपका कौन-सा प्रोजेक्ट आपके टेक्निकल स्किल्स को सबसे बेहतर दिखाता है?`
    : language === "Hinglish"
      ? `Aapka kaunsa project aapke technical skills ko sabse best dikhata hai?`
      : `Which project best highlights your technical skills?`;

  const questions = [];
  const seen = new Set(exclude.map(normalizeInterviewQuestion));
  if (offset === 0 && count > 0 && !seen.has(normalizeInterviewQuestion(intro))) {
    questions.push(intro);
    seen.add(normalizeInterviewQuestion(intro));
  }
  const combinations = details.length * templates.length;
  for (let attempt = 0; questions.length < count && attempt < combinations; attempt++) {
    const index = (offset + variationSeed + attempt) % combinations;
    const detail = details[index % details.length].claim;
    const topic = extractShortTopic(detail);
    const templateFn = templates[Math.floor(index / details.length) % templates.length];
    const candidate = templateFn(topic);
    const key = normalizeInterviewQuestion(candidate);
    if (seen.has(key)) continue;
    questions.push(candidate);
    seen.add(key);
  }
  return questions;
}

export function localEvaluation(question, answer, language) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const concrete = /\b(project|class|team|college|club|built|created|designed|implemented|tested|led|improved|for example|because)\b|\b\d+\b/i.test(answer);
  const structured = /\b(first|then|finally|because|result|outcome|situation|task|action)\b/i.test(answer) || /[.!?]/.test(answer);
  const scores = {
    technicalAccuracy: Math.min(10, 3 + (words >= 30 ? 2 : 0) + (concrete ? 2 : 0) + (structured ? 1 : 0)),
    communication: Math.min(10, 3 + (words >= 20 ? 2 : 0) + (structured ? 2 : 0) + (words <= 180 ? 1 : 0)),
    relevance: Math.min(10, 3 + (words >= 15 ? 2 : 0) + (concrete ? 2 : 0)),
    examplesUsed: Math.min(10, 2 + (concrete ? 5 : 0)),
    timeManagement: Math.max(2, Math.min(10, words < 12 ? 3 : words > 180 ? 5 : 8)),
  };
  const average = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;
  const hint = language === "English"
    ? "State the situation, your specific action, and the final result."
    : language === "Hindi"
      ? "स्थिति, अपनी भूमिका और अंतिम परिणाम संक्षेप में बताएं।"
      : "Situation, apna specific action aur final result short mein batao.";

  const nextQuestion = language === "Hindi"
    ? (average > 8 ? "आगे कौन-सा मुख्य trade-off संभालेंगे?" : average < 5 ? "क्या अपने काम का एक संक्षिप्त उदाहरण दे सकते हैं?" : "इस प्रोजेक्ट से मुख्य सीख क्या रही?")
    : language === "Hinglish"
      ? (average > 8 ? "Agla main trade-off kya handle karoge?" : average < 5 ? "Kya apne kaam ka ek short example share kar sakte hain?" : "Isse aapki main learning kya rahi?")
      : (average > 8 ? "What main trade-off would you handle next?" : average < 5 ? "Can you share a brief specific example?" : "What was your key takeaway from this?");

  return {
    scores,
    feedback: average > 7
      ? "Clear starting point. Highlight your personal contribution and measurable outcome."
      : "Provide a specific example and directly explain your role.",
    strengths: [words >= 20 ? "Good level of detail." : "Crisp and concise response."],
    improvements: [concrete ? "Quantify the outcome or impact." : "Add a concrete project or technical example."],
    hint,
    nextQuestion,
    provider: "local",
  };
}

export function locallyAdaptQuestion(baseQuestion, claims, role, language, level) {
  if (level === "medium") return baseQuestion;
  const claim = claims.length ? claims[Math.min(claims.length - 1, Math.floor(Math.random() * claims.length))].claim : "your project";
  const topic = extractShortTopic(claim);
  if (level === "easy") {
    return language === "English"
      ? `In “${topic}”, what specific task did you personally handle?`
      : language === "Hindi"
        ? `“${topic}” में आपने खुद कौन-सा काम किया?`
        : `“${topic}” mein aapne personally kaunsa kaam kiya?`;
  }
  return language === "English"
    ? `In “${topic}”, what key architectural decision did you make?`
    : language === "Hindi"
      ? `“${topic}” में मुख्य तकनीकी फैसला क्या था?`
      : `“${topic}” mein main architectural decision kya tha?`;
}
