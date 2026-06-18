import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({
    description: 'CommentId',
    example: '8d25a2e3-1f33-4d3b-89eb-435e4e9a0074',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content for some article',
    example: 'This is realy interesting article',
  })
  content: string;

  @ApiProperty({
    description: 'Article ID',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  articleId: string;

  @ApiProperty({ description: 'Timestamp of creation' })
  createdAt: number;
}

export class GetCommentsResponseDto {
  @ApiProperty({ description: 'List of comments' })
  data: CommentResponseDto[];

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 1 })
  limit: number;
}
