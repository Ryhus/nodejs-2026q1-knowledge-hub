import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { Article } from 'src/inmemoryDB/types';
import { GetArticlesQueryDto } from './articles.dto';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/PrismaModule/prisma.service';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly db: InMemoryDb) {}

  create(article: Article) {
    this.db.articles.push(article);
  }

  findAll(query?: GetArticlesQueryDto) {
    let articles = this.db.articles;

    if (query.status) {
      articles = articles.filter((a) => a.status === query.status);
    }

    if (query.categoryId) {
      articles = articles.filter((a) => a.categoryId === query.categoryId);
    }

    if (query.tag) {
      articles = articles.filter((a) => a.tags.includes(query.tag));
    }

    return articles;
  }

  findById(id: string) {
    return this.db.articles.find((article) => article.id === id);
  }

  findByAutorId(authorId: string) {
    return this.db.articles.filter((article) => article.authorId === authorId);
  }

  delete(id: string) {
    this.db.articles = this.db.articles.filter((article) => article.id !== id);
  }
}

@Injectable()
export class ArticlesPrismaPsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ArticleCreateInput) {
    return this.prisma.article.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
    });
  }

  delete(id: string) {
    return this.prisma.article.delete({
      where: { id },
    });
  }

  update(id: string, data: Prisma.ArticleUpdateInput) {
    return this.prisma.article.update({
      where: { id },
      data,
    });
  }
}
