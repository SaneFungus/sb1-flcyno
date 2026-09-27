import OpenAI from 'openai';
import { MODEL, buildSystemPrompt, buildUserPrompt } from './prompt.js';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeEmotions(emotions) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(emotions.length) },
        { role: "user", content: buildUserPrompt(emotions) }
      ],
      temperature: 0.7,
      // 6 sekcji po polsku nie mieści się w 500 tokenach
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    throw error;
  }
}
