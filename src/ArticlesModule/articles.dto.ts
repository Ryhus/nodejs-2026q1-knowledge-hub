import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @IsOptional()
  @IsUUID()
  authorId: string;

  @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tags: string[];
}

export class GetArticlesQueryDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  tag: string;
}
