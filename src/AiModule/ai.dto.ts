import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { AnalyzeArticleTask, MaxArticleSummaryLength } from './enums/ai.enums';

export class GenerateContentDto {
  @IsUUID()
  sessionId: string;

  @IsString()
  prompt: string;
}

export class SummarizeArticleDto {
  @IsOptional()
  @IsEnum(MaxArticleSummaryLength)
  maxLength?: MaxArticleSummaryLength;
}

export class TranslateArticleDto {
  @IsString()
  targetLanguage: string;

  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}

export class AnalyzeArticleDto {
  @IsOptional()
  @IsEnum(AnalyzeArticleTask)
  task?: AnalyzeArticleTask;
}
