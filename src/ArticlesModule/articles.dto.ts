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
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsEnum(Status)
  status: Status;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  authorId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  tags: string[];
}

export class GetArticlesQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsOptional()
  tag?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(SortingArticleFields)
  sortBy?: SortingArticleFields;

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
