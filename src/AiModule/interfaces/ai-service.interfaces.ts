import { MaxArticleSummaryLength, AnalyzeArticleTask } from '../enums/ai.enums';

export interface SummarizeArticleInput {
  articleId: string;
  maxLength?: MaxArticleSummaryLength;
}

export interface TranslateArticleInput {
  articleId: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface AnalyzeArticleInput {
  articleId: string;
  task?: AnalyzeArticleTask;
}

export interface GenerateContentInput {
  prompt: string;
}

export interface SummarizeArticleResponse {
  articleId: string;
  summary: string;
  originalLength: number;
  summaryLength: number;
}

export interface TranslateArticleResponse {
  articleId: string;
  translatedText: string;
  detectedLanguage: string;
}

export interface AnalyzeArticleResponse {
  articleId: string;
  analysis: string;
  suggestions: string[];
  severity: 'info' | 'warning' | 'error';
}
