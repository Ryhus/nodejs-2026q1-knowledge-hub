import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Animals', description: 'Name of the category ' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Articles about animals',
    description: 'Description of the category',
  })
  @IsString()
  description: string;
}

export enum SortingOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortingCategories {
  ID = 'id',
  NAME = 'name',
}

export class GetCategoriesQueryDto {
  @ApiProperty({
    enum: SortingCategories,
    example: SortingCategories.NAME,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsEnum(SortingCategories)
  sortBy?: SortingCategories;

  @ApiProperty({
    enum: SortingOrder,
    example: SortingOrder.ASC,
    description: 'Sorting direction',
  })
  @IsOptional()
  @IsEnum(SortingOrder)
  order?: SortingOrder;

  @ApiProperty({
    description: 'One-based page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of users to return per page',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
