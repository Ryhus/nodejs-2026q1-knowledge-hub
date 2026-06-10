import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({ example: 'userLogin' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'userPassword' })
  @IsString()
  password: string;
}
