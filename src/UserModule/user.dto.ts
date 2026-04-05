import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

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
  @ApiProperty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: ['admin', 'editor', 'viewer'] })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string;
}

export class GetUsersQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(SortingUsersFields)
  sortBy?: SortingUsersFields;

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
