import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    example: 'userLogin',
  })
  login: string;

  @ApiProperty({
    example: 'viewer',
  })
  role: Role;

  @ApiProperty({
    example: '2025-08-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-01T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class GetUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    example: 100,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  limit: number;
}
