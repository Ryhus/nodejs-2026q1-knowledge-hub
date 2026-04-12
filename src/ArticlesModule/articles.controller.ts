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

@ApiTags('article')
@Controller('article')
export class ArticlesController {
  constructor(private articlesService: ArticlesPrismaPsService) {}

  @Get()
  async getAll(@Query() query: GetArticlesQueryDto) {
    return this.articlesService.getAllArticles(query);
  }

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.createArticle(createArticleDto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articlesService.findArticle(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.articlesService.deleteArticle(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articlesService.updateArticle(id, createArticleDto);
  }
}
