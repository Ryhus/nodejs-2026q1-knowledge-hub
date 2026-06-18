import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '650e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({ description: 'Category name', example: 'Animals' })
  name: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Articles about animals',
  })
  descripion: string;
}

export class GetCategoriesResponse {
  @ApiProperty({ description: 'List of categories' })
  data: CategoryResponseDto[];

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 1 })
  limit: number;
}
