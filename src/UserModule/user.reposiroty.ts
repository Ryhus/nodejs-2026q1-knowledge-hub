import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { User } from 'src/inmemoryDB/types';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: InMemoryDb) {}

  create(user: User) {
    this.db.users.push(user);
  }

  findAll() {
    return this.db.users;
  }

  findById(id: string) {
    return this.db.users.find((u) => u.id === id);
  }

  delete(id: string) {
    this.db.users = this.db.users.filter((u) => u.id !== id);
  }
}
