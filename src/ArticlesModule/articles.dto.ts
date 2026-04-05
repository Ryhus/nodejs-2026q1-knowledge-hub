import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  authorId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tags: string[];
}

export class GetArticlesQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsOptional()
  tag?: string;
}
