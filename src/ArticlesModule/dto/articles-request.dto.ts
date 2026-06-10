import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  ArrayUnique,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Status } from 'generated/prisma/enums';
import { SortingOrder, SortingArticleFields } from 'src/shared/enums/enums';

export class CreateArticleDto {
  @ApiProperty({
    example: 'Story about my dog',
    description: 'Tittle of the article',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'My dog is amazing',
    description: 'Content of the article',
  })
  @IsString()
  content: string;

  @ApiProperty({
    enum: Status,
    example: Status.draft,
    description: 'Current status of the article',
  })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Author ID',
  })
  @IsOptional()
  @IsUUID()
  authorId: string;

  @ApiProperty({
    example: '650e8400-e29b-41d4-a716-446655440001',
    description: 'Category ID related to the article',
  })
  @IsOptional()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    type: [String],
    example: ['animals', 'dogs'],
    description: 'Array of tags releted to the article',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tags: string[];
}

export class GetArticlesQueryDto {
  @ApiProperty({
    enum: Status,
    example: Status.draft,
    description: 'Filter by current status of the article',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty({
    example: '650e8400-e29b-41d4-a716-446655440001',
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    example: 'animals',
    description: 'Filter by tag applied to the article',
  })
  @IsOptional()
  tag?: string;

  @ApiProperty({
    example: SortingArticleFields.STATUS,
    description: 'Available sorting field',
  })
  @IsOptional()
  @IsEnum(SortingArticleFields)
  sortBy?: SortingArticleFields;

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
    description: 'Number of articles on the page. Minimum 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
