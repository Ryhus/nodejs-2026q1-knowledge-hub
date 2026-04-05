import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export enum SortingCategories {
  ID = 'id',
  NAME = 'name',
}

export enum SortingOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetCategoriesQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(SortingCategories)
  sortBy?: SortingCategories;

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
