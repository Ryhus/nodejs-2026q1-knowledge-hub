import { Injectable } from '@nestjs/common';
import {
  EmbeddingProvider,
  TextGenerationProvider,
} from '../../ai-provider.interfaces';
import { AiError, AiUnavailableError } from '../../errors/ai.errors';

@Injectable()
export class GeminiProvider
  implements EmbeddingProvider, TextGenerationProvider
{
  private url = new URL(
    `v1beta/models/${process.env.GEMINI_MODEL}:generateContent`,
    process.env.GEMINI_API_BASE_URL,
  );

  private embedderUrl = new URL(
    `v1beta/models/${process.env.GEMINI_EMBEDDING_MODEL}:batchEmbedContents`,
    process.env.GEMINI_API_BASE_URL,
  );

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generate(prompt: string, context?: any[]) {
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
            contents: context ? context : [{ parts: [{ text: prompt }] }],
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

  async embed<T>(data: string[]): Promise<T> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.embedderUrl, {
          method: 'POST',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: data.map((text) => ({
              model: `models/${process.env.GEMINI_EMBEDDING_MODEL}`,
              output_dimensionality: 768,
              content: {
                parts: [{ text }],
              },
            })),
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
