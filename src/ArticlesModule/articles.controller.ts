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

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  async getAll(@Query() query: GetArticlesQueryDto) {
    return this.articlesService.getAllArticles(query);
  }

  @Roles(Role.admin, Role.editor)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.createArticle(createArticleDto);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const article = await this.articlesService.findArticle(id);
    return article;
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articlesService.deleteArticle(id);
  }

  @Roles(Role.admin, Role.editor)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.articlesService.updateArticle(id, createArticleDto, user);
  }
}
