import { Injectable } from '@nestjs/common';
import type { AiProvider } from '../../interfaces/ai-provider.interface';
import { AiError, AiUnavailableError } from 'src/AiModule/errors/ai.errors';

@Injectable()
export class GeminiProvider implements AiProvider {
  url = new URL(
    `v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
    process.env.GEMINI_API_BASE_URL,
  );

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async callLLM(prompt: string) {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (response.ok) {
          return await response.json();
        }

        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error?.message ?? 'Unknown error';
        const error = errorBody?.error?.status;
        const status = response.status;

        const isRetryable =
          status === 429 || status >= 500 || error === 'UNAVAILABLE';

        if (!isRetryable) {
          throw new AiError(message, error, status);
        }

        if (attempt === maxRetries) {
          throw new AiUnavailableError(message, error, status);
        }

        const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
        await this.sleep(delay);
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }

        const delay = Math.pow(2, attempt) * 200 + Math.random() * 100;
        await this.sleep(delay);
      }
    }
  }
}
