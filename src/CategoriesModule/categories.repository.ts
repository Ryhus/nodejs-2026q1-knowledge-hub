import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { Category } from 'src/inmemoryDB/types';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly db: InMemoryDb) {}

  create(category: Category) {
    this.db.categories.push(category);
  }

  findAll() {
    return this.db.categories;
  }

  findById(id: string) {
    return this.db.categories.find((u) => u.id === id);
  }

  delete(id: string) {
    this.db.categories = this.db.categories.filter((u) => u.id !== id);
  }
}
