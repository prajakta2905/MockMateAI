/**
 * Groq (console.groq.com) & Grok (x.ai) Live Interviewer Service
 * Provides ultra-fast real-time follow-up question generation & candidate answer evaluation.
 */

export const getGrokApiKey = () => {
  const fromMeta = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROK_API_KEY) || '';
  const fromProcess = (typeof process !== 'undefined' && process.env?.VITE_GROK_API_KEY) || '';
  const fromStorage = (typeof localStorage !== 'undefined' && localStorage.getItem('AURAHIRE_GROK_KEY')) || '';
  return fromMeta || fromProcess || fromStorage || '';
};

export const setGrokApiKey = (key) => {
  if (typeof localStorage === 'undefined') return;
  if (key) {
    localStorage.setItem('AURAHIRE_GROK_KEY', key.trim());
  } else {
    localStorage.removeItem('AURAHIRE_GROK_KEY');
  }
};

/**
 * Evaluates candidate answer and decides whether to ask a sharp follow-up or proceed to next question
 */
export async function evaluateAnswerAndGenerateNextQuestion({
  currentQuestion,
  candidateAnswer,
  conversationHistory = [],
  questionPool = [],
  currentQuestionIndex = 0,
  targetRole = 'Senior Software Engineer',
  interviewType = 'mixed',
  resume = null
}) {
  const apiKey = getGrokApiKey();

  // 1. If key is provided (Groq "gsk_..." or xAI "xai-..."), call live high-speed LLM
  if (apiKey) {
    try {
      if (apiKey.startsWith('gsk_')) {
        // GroqCloud API (Ultra-low latency LLaMA 3.3 70B / 3.1 8B)
        return await callGroqCloudApi({
          currentQuestion,
          candidateAnswer,
          conversationHistory,
          questionPool,
          currentQuestionIndex,
          targetRole,
          apiKey,
          resume
        });
      } else {
        // xAI Grok API
        return await callXaiGrokApi({
          currentQuestion,
          candidateAnswer,
          conversationHistory,
          questionPool,
          currentQuestionIndex,
          targetRole,
          apiKey,
          resume
        });
      }
    } catch (err) {
      console.warn('Groq/Grok API error, transitioning smoothly to smart engine:', err);
    }
  }

  // 2. Intelligent local conversational follow-up engine
  return generateIntelligentFollowUpLocal({
    currentQuestion,
    candidateAnswer,
    conversationHistory,
    questionPool,
    currentQuestionIndex,
    targetRole,
    resume
  });
}

/**
 * GroqCloud API implementation (https://api.groq.com/openai/v1/chat/completions)
 */
async function callGroqCloudApi({
  currentQuestion,
  candidateAnswer,
  conversationHistory,
  questionPool,
  currentQuestionIndex,
  targetRole,
  apiKey,
  resume
}) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const candidateFirstName = resume?.name?.split(' ')?.[0] || 'there';

  const systemPrompt = `You are a concise, sharp technical interviewer conducting a live voice interview for a ${targetRole} position.
CRITICAL RULES FOR QUESTIONS:
1. Every question MUST be SHORT and DIRECT (strictly 8 to 14 words max).
2. NO long compound sentences or multi-part questions.
3. If asking a follow-up, probe ONE specific trade-off or technical decision sharply and briefly.
4. Keep the question natural and conversational so Text-to-Speech reads it quickly.
5. GIBBERISH HANDLING: If the candidate's answer contains random letters, gibberish, or completely irrelevant nonsense, you MUST set "isFollowUp" to true, and set "nextQuestion" to politely ask them to repeat or clarify (e.g., "I didn't quite catch that. Could you please clarify?"). Do not advance to the next question.
6. REPEAT / PREVIOUS REQUESTS: If the candidate asks you to repeat the question, go back, or what the previous question was, you MUST return "action": "previous".

You MUST respond strictly with valid JSON with this exact schema:
{
  "action": "next" | "previous" | "repeat",
  "isFollowUp": true,
  "nextQuestion": "Short, punchy spoken question under 14 words",
  "rationale": "1-sentence reason"
}`;

  const nextPlannedQ = questionPool[currentQuestionIndex + 1]?.question || 'Can you describe another significant engineering achievement?';

  const userPrompt = `
Candidate Name: ${resume?.name || 'Candidate'}
Candidate Projects: ${JSON.stringify(resume?.projects?.map(p => p.name) || [])}
Current Question Asked: "${currentQuestion}"
Candidate Answer Spoken: "${candidateAnswer}"
Next Planned Main Question: "${nextPlannedQ}"

Decide whether to ask a follow-up probe on their answer or move forward. Return strictly valid JSON.
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const fbController = new AbortController();
      const fbTimeoutId = setTimeout(() => fbController.abort(), 15000);
      try {
        const fallbackResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          signal: fbController.signal,
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          })
        });
        clearTimeout(fbTimeoutId);
        if (!fallbackResponse.ok) {
          throw new Error(`Groq API error: HTTP ${fallbackResponse.status}`);
        }
        const data = await fallbackResponse.json();
        const content = data.choices?.[0]?.message?.content;
        return JSON.parse(content);
      } catch (err) {
        clearTimeout(fbTimeoutId);
        throw err;
      }
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * xAI Grok API implementation
 */
async function callXaiGrokApi({
  currentQuestion,
  candidateAnswer,
  conversationHistory,
  questionPool,
  currentQuestionIndex,
  targetRole,
  apiKey,
  resume
}) {
  const endpoint = 'https://api.x.ai/v1/chat/completions';

  const systemPrompt = `You are a live AI technical interviewer conducting a voice interview for ${targetRole}. 
CRITICAL RULE: If the candidate answers with gibberish, random letters, or nonsense, set isFollowUp to true and ask them to repeat/clarify. 
CRITICAL RULE: If the candidate asks you to repeat the question or go to the previous question, you MUST return "action": "previous".
Return strictly valid JSON with keys: action (string, optional), isFollowUp (boolean), nextQuestion (string), rationale (string).`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Current Question: "${currentQuestion}"\nAnswer: "${candidateAnswer}"\nNext Pool Question: "${questionPool[currentQuestionIndex + 1]?.question || ''}"` }
        ],
        temperature: 0.3
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`xAI Grok HTTP ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Smart Local Heuristic Engine for Instant Zero-Latency Follow-ups
 */
function generateIntelligentFollowUpLocal({
  currentQuestion,
  candidateAnswer = '',
  conversationHistory = [],
  questionPool = [],
  currentQuestionIndex = 0,
  resume
}) {
  const lowerAnswer = candidateAnswer.toLowerCase();
  const lastTurn = conversationHistory[conversationHistory.length - 1];
  const lastWasFollowUp = lastTurn?.isFollowUp || false;
  const projectName = resume?.projects?.[0]?.name || 'your project';

  // Basic Gibberish Detection (long string without spaces or repeated characters)
  const isGibberish = candidateAnswer.trim().length > 10 && (!/\s/.test(candidateAnswer.trim()) || /(.)\1{4,}/.test(candidateAnswer));
  if (isGibberish) {
    return {
      isFollowUp: true,
      nextQuestion: "I didn't quite catch that. Could you please repeat or clarify your answer?",
      rationale: "Candidate answered with gibberish or an incomprehensible string."
    };
  }

  // Previous Question Detection
  if (lowerAnswer.includes('previous question') || lowerAnswer.includes('go back')) {
    return {
      action: 'previous',
      isFollowUp: false,
      nextQuestion: "",
      rationale: "Candidate asked to go to the previous question."
    };
  }

  // Repeat Request Detection
  if (lowerAnswer.includes('repeat the question') || lowerAnswer.includes('can you repeat') || lowerAnswer.includes('what was the question') || lowerAnswer.trim() === 'repeat') {
    return {
      action: 'repeat',
      isFollowUp: false,
      nextQuestion: currentQuestion,
      rationale: "Candidate asked to repeat the question."
    };
  }

  // If candidate just answered the initial introduction question (index 0), smoothly transition to Question 2
  if (currentQuestionIndex === 0) {
    const nextQ = questionPool[1] || questionPool[0];
    return {
      isFollowUp: false,
      nextQuestion: nextQ ? nextQ.question : "Could you tell me about your technical approach?",
      rationale: "Introductory answer complete; moving to fundamental engineering questions."
    };
  }

  // Don't ask more than 1 consecutive follow-up on the same topic to keep interview moving smoothly
  if (!lastWasFollowUp && candidateAnswer.trim().length > 12) {
    if (lowerAnswer.includes('jwt') || lowerAnswer.includes('token') || lowerAnswer.includes('auth')) {
      return {
        isFollowUp: true,
        nextQuestion: "In your auth setup, how did you handle token revocation and security?",
        rationale: "Candidate highlighted JWT authentication; probing security tradeoffs."
      };
    }

    if (lowerAnswer.includes('redis') || lowerAnswer.includes('cache') || lowerAnswer.includes('caching')) {
      return {
        isFollowUp: true,
        nextQuestion: "How did you handle cache invalidation and stampedes in Redis?",
        rationale: "Candidate mentioned caching; probing invalidation and concurrency."
      };
    }

    if (lowerAnswer.includes('microservice') || lowerAnswer.includes('microservices') || lowerAnswer.includes('distributed')) {
      return {
        isFollowUp: true,
        nextQuestion: "In your microservices, how did you maintain data consistency across services?",
        rationale: "Probing distributed systems consistency patterns."
      };
    }

    if (lowerAnswer.includes('websocket') || lowerAnswer.includes('realtime') || lowerAnswer.includes('real-time')) {
      return {
        isFollowUp: true,
        nextQuestion: "With WebSockets, how did you manage connection state and reconnections at scale?",
        rationale: "Probing real-time infrastructure scalability."
      };
    }

    if (lowerAnswer.includes('next.js') || lowerAnswer.includes('ssr') || lowerAnswer.includes('server component')) {
      return {
        isFollowUp: true,
        nextQuestion: "When do you choose Server Components versus Client Components in Next.js?",
        rationale: "Evaluating Next.js architectural boundaries."
      };
    }

    if (lowerAnswer.includes('postgres') || lowerAnswer.includes('database') || lowerAnswer.includes('sql') || lowerAnswer.includes('mongodb')) {
      return {
        isFollowUp: true,
        nextQuestion: "How did you optimize your database queries and indexes for performance?",
        rationale: "Deep dive into database reliability and index performance."
      };
    }

    if (lowerAnswer.includes('rag') || lowerAnswer.includes('vector') || lowerAnswer.includes('embedding') || lowerAnswer.includes('llm')) {
      return {
        isFollowUp: true,
        nextQuestion: "How did you reduce retrieval latency and hallucinations in your RAG pipeline?",
        rationale: "Probing generative AI engineering precision and latency mitigation."
      };
    }

    // Short answers trigger an elaboration follow-up
    if (candidateAnswer.trim().split(/\s+/).length < 10) {
      return {
        isFollowUp: true,
        nextQuestion: "Could you expand on that? What primary tradeoff did you consider?",
        rationale: "Answer was brief; requesting structured elaboration."
      };
    }
  }

  // Move to next question in pool
  const nextPoolIndex = currentQuestionIndex + 1;
  const nextQ = questionPool[nextPoolIndex] || questionPool[0];

  return {
    isFollowUp: false,
    nextQuestion: nextQ ? nextQ.question : "Could you tell me about another significant project you led?",
    rationale: "Answer was sufficiently explored; transitioning to the next planned question."
  };
}
