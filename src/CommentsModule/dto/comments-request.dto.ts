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

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content for the article',
    example: 'This is realy interesing article!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @IsUUID()
  articleId: string;
}

export class GetCommentsByArticleDto {
  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @IsUUID()
  articleId: string;

  @ApiProperty({
    example: SortingCommentFields.AUTHORID,
    description: 'Available sorting field',
  })
  @IsOptional()
  @IsEnum(SortingCommentFields)
  sortBy?: SortingCommentFields;

  @ApiProperty({ example: SortingOrder.ASC, description: 'Sorting direction' })
  @IsOptional()
  @IsEnum(SortingOrder)
  order?: SortingOrder;

  @ApiProperty({
    example: 1,
    description: 'Page for pagination. Starts with 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    example: 5,
    description: 'Number of comments on the page. Minimum 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
