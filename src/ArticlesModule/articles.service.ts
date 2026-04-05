import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { Article } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { CreateArticleDto, GetArticlesQueryDto } from './articles.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ArticlesService {
  constructor(
    private repo: ArticlesRepository,
    private inMemoSharedRepo: InMemoSharedRepo,
  ) {}

  getAllArticles(getArticlesQueryDto: GetArticlesQueryDto) {
    const articles = [...this.repo.findAll(getArticlesQueryDto)];

    const sortBy = getArticlesQueryDto.sortBy ?? 'createdAt';
    const order = getArticlesQueryDto.order ?? 'desc';

    articles.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }

      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    if (!getArticlesQueryDto.page && !getArticlesQueryDto.limit) {
      return articles;
    }

    const page = getArticlesQueryDto.page ?? 1;
    const limit = getArticlesQueryDto.limit ?? 5;

    const offset = (page - 1) * limit;
    const data = articles.slice(offset, offset + limit);
    const total = data.length;

    return { data: data, total: total, page: page, limit: limit };
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

    const articleComments = this.inMemoSharedRepo.findAllCommentsForArticle(id);

    articleComments.forEach((comment) =>
      this.inMemoSharedRepo.deleteComment(comment.id),
    );

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
