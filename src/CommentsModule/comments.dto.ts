import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createCommentDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsUUID()
  articleId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  authorId: string;
}
