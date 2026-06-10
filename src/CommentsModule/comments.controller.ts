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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';

@ApiTags('comment')
@Controller('comment')
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private commentService: CommentPrismaPsService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  async getByArticle(@Query() query: GetCommentsByArticleDto) {
    return this.commentService.getAllComments(query);
  }

  @Roles(Role.admin, Role.editor)
  @Post()
  async create(@Body() createCommentDto: createCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findComment(id);
  }

  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.deleteComment(id, user);
  }
}
