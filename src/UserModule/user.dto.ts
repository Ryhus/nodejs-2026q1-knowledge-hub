import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsString()
  login: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
