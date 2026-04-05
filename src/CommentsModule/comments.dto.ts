import { IsString, IsUUID, IsOptional } from 'class-validator';

export class createCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  articleId: string;

  @IsOptional()
  @IsUUID()
  authorId: string;
}
