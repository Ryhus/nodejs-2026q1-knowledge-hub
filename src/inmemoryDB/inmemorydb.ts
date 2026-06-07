import { Injectable } from '@nestjs/common';
import type { User, Article, Category, Comment } from './types';

@Injectable()
export class InMemoryDb {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
  comments: Comment[] = [];
}
