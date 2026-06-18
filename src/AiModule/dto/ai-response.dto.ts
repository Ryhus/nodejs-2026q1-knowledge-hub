import { ApiProperty } from '@nestjs/swagger';

export class AiGenerationResponseDto {
  @ApiProperty({
    description: 'LLM generation string',
    example: 'Some content',
  })
  generation: string;
}

export class SummarizeArticleResponseDto {
  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  articleId: string;

  @ApiProperty({ description: 'Summarisation', example: 'Info about the dog' })
  summary: string;

  @ApiProperty({ description: 'Original article length', example: 100 })
  originalLength: number;

  @ApiProperty({ description: 'Summarisation length', example: 50 })
  summaryLength: number;
}

export class TranslateArticleResponseDto {
  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  articleId: string;

  @ApiProperty({
    description: 'Translation of the text',
    example: 'Translated text',
  })
  translatedText: string;

  @ApiProperty({
    description: 'Detected original language',
    example: 'English',
  })
  detectedLanguage: string;
}

export class AnalyzeArticleResponseDto {
  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  articleId: string;

  @ApiProperty({
    description: 'Returned analysis by LLM',
    example: 'Some analysis',
  })
  analysis: string;

  @ApiProperty({ description: 'Some suggestions by LLM' })
  suggestions: string[];

  @ApiProperty({
    description: 'Severity of the problem returned by LLM',
    example: 'info',
  })
  severity: 'info' | 'warning' | 'error';
}
