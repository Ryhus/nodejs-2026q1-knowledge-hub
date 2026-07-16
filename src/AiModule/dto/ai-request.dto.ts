import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { AnalyzeArticleTask, MaxArticleSummaryLength } from '../enums/ai.enums';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({
    description: 'Session ID',
    example: 'de4c4b13-d9a6-4d6d-b7f7-15d263f42bfe',
  })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Promt LLM', example: 'Lets talk about dogs!' })
  @IsString()
  prompt: string;
}

export class SummarizeArticleDto {
  @ApiProperty({
    enum: MaxArticleSummaryLength,
    description: 'Maximal length of the summary',
    example: MaxArticleSummaryLength.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MaxArticleSummaryLength)
  maxLength?: MaxArticleSummaryLength;
}

export class TranslateArticleDto {
  @ApiProperty({ description: 'Target language', example: 'German' })
  @IsString()
  targetLanguage: string;

  @ApiProperty({ description: 'Optional source language', example: 'English' })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}

export class AnalyzeArticleDto {
  @ApiProperty({
    enum: AnalyzeArticleTask,
    description: 'Task for analysis',
    example: AnalyzeArticleTask.EXPLAIN,
  })
  @IsOptional()
  @IsEnum(AnalyzeArticleTask)
  task?: AnalyzeArticleTask;
}
