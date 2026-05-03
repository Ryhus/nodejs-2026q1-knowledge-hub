import { Injectable } from '@nestjs/common';
import type { AiProvider } from '../../interfaces/ai-provider.interface';
import { AiError, AiUnavailableError } from 'src/AiModule/errors/ai.errors';
import type { GeminiResponse } from './providers.type';

@Injectable()
export class GeminiProvider implements AiProvider {
  url = new URL(
    `v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
    process.env.GEMINI_API_BASE_URL,
  );

  async callLLM(promt: string) {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promt }] }],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        const message = errorBody?.error?.message ?? 'Unknown error';
        const error = errorBody?.error?.status;

        if (error === 'UNAVAILABLE') {
          throw new AiUnavailableError(message, error, response.status);
        }

        throw new AiError(message, error, response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
