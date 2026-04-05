import { Injectable } from '@nestjs/common';
import type { User, Article, Category } from './types';

@Injectable()
export class InMemoryDb {
  users: User[] = [];
  articles: Article[] = [];
  categories: Category[] = [];
}
