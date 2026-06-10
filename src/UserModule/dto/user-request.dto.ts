import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from 'generated/prisma/enums';

export enum SortingUsersFields {
  LOGIN = 'login',
  ROLE = 'role',
  CREATEDAT = 'createdAt',
  UPDATEDAT = 'updatedAt',
}

export enum SortingOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CreateUserDto {
  @ApiProperty({ example: 'userLogin' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'userPassword' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    enum: ['admin', 'editor', 'viewer'],
    example: 'viewer',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdatePasswordDto {
  @ApiProperty({ example: 'oldPassword' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'newPassword' })
  @IsString()
  newPassword: string;
}

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    enum: SortingUsersFields,
    description: 'Field to sort users by',
  })
  @IsOptional()
  @IsEnum(SortingUsersFields)
  sortBy?: SortingUsersFields;

  @ApiPropertyOptional({
    enum: SortingOrder,
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SortingOrder)
  order?: SortingOrder;

  @ApiPropertyOptional({
    description: 'One-based page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of users to return per page',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
