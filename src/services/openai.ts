import OpenAI from 'openai';
import { FormAIConfig } from '@/utils/formTypes';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const generateAIResponse = async (
  prompt: string,
  config: FormAIConfig,
  context: string
) => {
  try {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: `${config.behaviorGuidelines}\n\nContext: ${context}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}; 