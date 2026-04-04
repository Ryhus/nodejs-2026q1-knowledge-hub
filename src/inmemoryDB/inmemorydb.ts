import { Injectable } from '@nestjs/common';
import type { User, Article } from './types';

@Injectable()
export class InMemoryDb {
  users: User[] = [];
  articles: Article[] = [];
}
