import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { Article } from 'src/inmemoryDB/types';
import { CreateArticleDto, GetArticlesQueryDto } from './articles.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ArticlesService {
  constructor(private repo: ArticlesRepository) {}

  getAllArticles(getArticlesQueryDto: GetArticlesQueryDto) {
    return this.repo.findAll(getArticlesQueryDto);
  }

  createArticle(createArticleDto: CreateArticleDto) {
    const createdArticle = {} as Article;
    const currentTimestamp = Date.now();

    createdArticle.id = randomUUID();
    createdArticle.title = createArticleDto.title;
    createdArticle.content = createArticleDto.content;
    createdArticle.status = createArticleDto.status || 'draft';
    createdArticle.authorId = createArticleDto.authorId || null;
    createdArticle.categoryId = createArticleDto.categoryId || null;
    createdArticle.tags = createArticleDto.tags || [];
    createdArticle.createdAt = currentTimestamp;
    createdArticle.updatedAt = currentTimestamp;

    this.repo.create(createdArticle);

    return createdArticle;
  }

  findArticle(id: string) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }
    return article;
  }

  deleteArticle(id: string) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }

    this.repo.delete(id);
  }

  updateArticle(id: string, createArticleDto: CreateArticleDto) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }

    article.title = createArticleDto.title;
    article.content = createArticleDto.content;
    article.status = createArticleDto.status || 'draft';
    article.authorId = createArticleDto.authorId || null;
    article.categoryId = createArticleDto.categoryId || null;
    article.tags = createArticleDto.tags || [];
    article.updatedAt = Date.now();

    return article;
  }
}
