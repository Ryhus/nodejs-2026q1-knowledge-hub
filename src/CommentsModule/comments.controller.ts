import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CommentPrismaPsService } from './comments.service';
import { createCommentDto, GetCommentsByArticleDto } from './comments.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentPrismaPsService) {}

  @Get()
  async getByArticle(@Query() query: GetCommentsByArticleDto) {
    return this.commentService.getAllComments(query);
  }

  @Post()
  async create(@Body() createCommentDto: createCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findComment(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.commentService.deleteComment(id);
  }
}
