import { Injectable, Inject } from '@nestjs/common';
import { AI_PROVIDER, AiProvider } from './interfaces/ai-provider.interface';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import type {
  SummarizeArticleInput,
  TranslateArticleInput,
  AnalyzeArticleInput,
  GenerateContentInput,
} from './interfaces/ai-service.interfaces';
import { MaxArticleSummaryLength, AnalyzeArticleTask } from './enums/ai.enums';
import { buildSummarizePrompt } from './promts/summarize.promt';
import { buildTranslatePrompt } from './promts/translate.promt';
import { buildAnalizePrompt } from './promts/analize.promt';
import { AiUnavailableError } from './errors/ai.errors';
import {
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GeminiResponse } from './providers/gemini/providers.type';
import { AiCacheService } from './ai-cache.service';
import { validateAnalysis, validateTranslation } from './ai-validation';
import { ConversationService } from './converssation/conversation.service';
import { AiObservabilityService } from './ai-observability.service';

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    private readonly articleSevice: ArticlesPrismaPsService,
    private readonly aiCache: AiCacheService,
    private readonly conversation: ConversationService,
    private readonly obs: AiObservabilityService,
  ) {}

  async generateContent(input: GenerateContentInput) {
    const start = this.obs.startTimer();

    const { sessionId, prompt } = input;

    const context = this.conversation.getContext(sessionId);
    this.conversation.addUserMessage(sessionId, prompt);
    const messages = [...context, { role: 'user', content: prompt }];
    const contextGemini = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    try {
      const data = await this.provider.callLLM<GeminiResponse>(
        prompt,
        contextGemini,
      );
      const latency = this.obs.endTimer(start);
      this.obs.recordRequest(latency);

      const generation = data?.candidates[0].content.parts[0].text ?? '';
      this.conversation.addAssistantMessage(sessionId, generation);
      return {
        generation,
      };
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }

      throw new InternalServerErrorException();
    }
  }

  async summarizeArticle(input: SummarizeArticleInput) {
    const start = this.obs.startTimer();
    const { articleId, maxLength = MaxArticleSummaryLength.MEDIUM } = input;

    const article = await this.articleSevice.findArticle(articleId);

    const key = this.aiCache.buildKey(articleId, article.updatedAt, {
      maxLength,
    });

    const cached = this.aiCache.get(key);
    if (cached) {
      this.obs.recordCacheHit();
      return cached;
    }

    this.obs.recordCacheMiss();

    const prompt = buildSummarizePrompt(article.content, maxLength);
    try {
      const data = await this.provider.callLLM<GeminiResponse>(prompt);

      const latency = this.obs.endTimer(start);
      this.obs.recordRequest(latency);

      const summary = data?.candidates[0].content.parts[0].text;
      const response = {
        articleId,
        summary,
        originalLength: article.content.length,
        summaryLength: summary.length,
      };

      this.aiCache.set(key, response);

      return response;
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }

      throw new InternalServerErrorException();
    }
  }

  async translateArticle(input: TranslateArticleInput) {
    const start = this.obs.startTimer();
    const { articleId, targetLanguage, sourceLanguage } = input;

    const article = await this.articleSevice.findArticle(articleId);

    const key = this.aiCache.buildKey(articleId, article.updatedAt, {
      targetLanguage,
      sourceLanguage,
    });

    const cached = this.aiCache.get(key);

    if (cached) {
      this.obs.recordCacheHit();
      return cached;
    }

    this.obs.recordCacheMiss();

    const prompt = buildTranslatePrompt(
      article.content,
      targetLanguage,
      sourceLanguage,
    );

    try {
      const data = await this.provider.callLLM<GeminiResponse>(prompt);

      const latency = this.obs.endTimer(start);
      this.obs.recordRequest(latency);

      const generaion = data?.candidates[0].content.parts[0].text;

      const validatedGeneration = validateTranslation(generaion);

      const { translatedText, detectedLanguage } = validatedGeneration;
      const response = { articleId, translatedText, detectedLanguage };

      this.aiCache.set(key, response);

      return response;
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }

      throw new InternalServerErrorException();
    }
  }

  async analyzeArticle(input: AnalyzeArticleInput) {
    const start = this.obs.startTimer();
    const { articleId, task = AnalyzeArticleTask.REVIEW } = input;

    const article = await this.articleSevice.findArticle(articleId);
    const prompt = buildAnalizePrompt(article.content, task);

    try {
      const data = await this.provider.callLLM<GeminiResponse>(prompt);

      const latency = this.obs.endTimer(start);
      this.obs.recordRequest(latency);

      const generaion = data?.candidates[0].content.parts[0].text;

      const validatedGeneration = validateAnalysis(generaion);

      const { analysis, suggestions, severity } = validatedGeneration;

      return { articleId, analysis, suggestions, severity };
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }

      throw new InternalServerErrorException();
    }
  }
}
