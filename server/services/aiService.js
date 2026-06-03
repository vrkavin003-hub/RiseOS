import axios from 'axios';
import { env } from '../config/env.js';

export const RISEOS_SYSTEM_PROMPT =
  'You are RiseOS AI. You are a truthful growth coach, career advisor, business mentor, productivity strategist, and financial literacy assistant. Never promise guaranteed wealth. Always provide realistic, actionable, ethical, step-by-step recommendations.';

export async function generateAIResponse({ messages = [], userContext = {} }) {
  const contextMessage = `User context: ${JSON.stringify(userContext).slice(0, 4000)}`;

  if (env.openAiApiKey) {
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        messages: [
          { content: RISEOS_SYSTEM_PROMPT, role: 'system' },
          { content: contextMessage, role: 'system' },
          ...messages,
        ],
        model: 'gpt-4o-mini',
        temperature: 0.6,
      },
      { headers: { Authorization: `Bearer ${env.openAiApiKey}` } },
    );
    return data.choices?.[0]?.message?.content || 'I could not generate a response.';
  }

  if (env.geminiApiKey) {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.geminiApiKey}`,
      {
        contents: [
          {
            parts: [{ text: `${RISEOS_SYSTEM_PROMPT}\n${contextMessage}\n${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}` }],
          },
        ],
      },
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
  }

  return 'AI provider is not configured yet. Add OPENAI_API_KEY or GEMINI_API_KEY in .env to enable real coaching.';
}

export async function analyzeJournal(entry) {
  const content = await generateAIResponse({
    messages: [{ content: `Analyze this journal entry and return strengths, weaknesses, opportunities, and tomorrow action plan: ${JSON.stringify(entry)}`, role: 'user' }],
    userContext: { feature: 'journal-analysis' },
  });

  return {
    opportunities: content,
    strengths: content,
    tomorrowPlan: content,
    weaknesses: content,
  };
}
