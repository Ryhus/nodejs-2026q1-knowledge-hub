import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { User } from 'src/inmemoryDB/types';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { Prisma } from 'generated/prisma/client';

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

@Injectable()
export class UsersPrismaPsRepository {
  constructor(private prisma: PrismaService) {}

  findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: any;
    where?: any;
  }) {
    return this.prisma.user.findMany(params);
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  updatePassword(id: string, password: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password,
      },
    });
  }

  count() {
    return this.prisma.user.count();
  }
}
