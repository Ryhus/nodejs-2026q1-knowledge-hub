import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'generated/prisma/enums';

export class ArticleResponseDto {
  @ApiProperty({
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
    description: 'Article ID',
  })
  id: string;

  @ApiProperty({
    enum: Status,
    example: Status.draft,
    description: 'Current status of the article',
  })
  status: Status;

  @ApiProperty({
    example: '650e8400-e29b-41d4-a716-446655440001',
    description: 'Category ID related to the article',
  })
  categoryId: string | null;

  @ApiProperty({
    example: 'Story about my dog',
    description: 'Title of the article',
  })
  title: string;

  @ApiProperty({
    example: 'My dog is amazing',
    description: 'Content of the article',
  })
  content: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Author ID',
  })
  authorId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetArticlesResponseDto {
  @ApiProperty({ description: 'List of articles' })
  data: ArticleResponseDto[];

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 1 })
  limit: number;
}
