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
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentPrismaPsService) {}

  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  @Get()
  async getByArticle(@Query() query: GetCommentsByArticleDto) {
    return this.commentService.getAllComments(query);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Post()
  async create(@Body() createCommentDto: createCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findComment(id);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.deleteComment(id, user);
  }
}
