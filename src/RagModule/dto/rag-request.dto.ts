import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  Max,
} from 'class-validator';
import { ArticleStatus } from 'src/shared/enums/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReindexRequestDto {
  @ApiPropertyOptional({
    description: 'Index only published articles. Defaults to true.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean;

  @ApiPropertyOptional({
    description:
      'Specific article IDs to index. If omitted, all matching articles are indexed.',
    type: [String],
    format: 'uuid',
    example: ['3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  articleIds?: string[];
}

export class RagSearchRequestDto {
  @ApiProperty({
    description: 'Text used to find semantically similar article chunks.',
    example: 'How does JWT authorization work?',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of matching chunks to return. Defaults to 5.',
    example: 5,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Max(20)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Limit results to articles with this status.',
    enum: ArticleStatus,
    example: ArticleStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  articleStatus?: ArticleStatus;

  @ApiPropertyOptional({
    description: 'Limit results to a category ID.',
    format: 'uuid',
    example: '650e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Limit results to articles containing any of these tags.',
    type: [String],
    example: ['authentication', 'security'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class RagChatRequestDto {
  @ApiProperty({
    description: 'Question to answer using indexed article content.',
    example: 'What is the recommended token refresh strategy?',
  })
  @IsString()
  question: string;

  @ApiPropertyOptional({
    description:
      'Existing conversation ID. A new conversation is created when omitted.',
    format: 'uuid',
    example: 'de4c4b13-d9a6-4d6d-b7f7-15d263f42bfe',
  })
  @IsOptional()
  @IsUUID('4')
  conversationId?: string;
}
