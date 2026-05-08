import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ArticleStatus } from 'src/shared/enums/enums';

export class ReindexRequestDto {
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  articleIds?: string[];
}

export class RagSearchRequestDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(ArticleStatus)
  articleStatus?: ArticleStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class RagChatRequestDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsUUID('4')
  conversationId?: string;
}
