import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SortingCommentFields {
  AUTHORID = 'authorId',
  createdAt = 'createdAt',
}

export enum SortingOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class createCommentDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsUUID()
  articleId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  authorId: string;
}

export class GetCommentsByArticleDto {
  @ApiProperty()
  @IsUUID()
  articleId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(SortingCommentFields)
  sortBy?: SortingCommentFields;

  @ApiProperty()
  @IsOptional()
  @IsEnum(SortingOrder)
  order?: SortingOrder;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
