import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { Article } from 'src/inmemoryDB/types';
import { GetArticlesQueryDto } from './articles.dto';
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
    return this.db.articles.find((u) => u.id === id);
  }

  delete(id: string) {
    this.db.articles = this.db.articles.filter((u) => u.id !== id);
  }
}
