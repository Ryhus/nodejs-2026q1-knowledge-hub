import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ArticlesPrismaPsService } from './articles.service';
import { CreateArticleDto, GetArticlesQueryDto } from './articles.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'generated/prisma/enums';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';

@ApiTags('article')
@Controller('article')
export class ArticlesController {
  constructor(private articlesService: ArticlesPrismaPsService) {}

  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  @Get()
  async getAll(@Query() query: GetArticlesQueryDto) {
    return this.articlesService.getAllArticles(query);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Post()
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.articlesService.createArticle(createArticleDto, userId);
  }

  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articlesService.findArticle(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articlesService.deleteArticle(id);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.articlesService.updateArticle(id, createArticleDto, user);
  }
}
