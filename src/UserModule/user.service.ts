import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './user.reposiroty';
import { CreateUserDto, UpdatePasswordDto } from './user.dto';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';
import { CommentRepository } from 'src/CommentsModule/comments.repository';
import { randomUUID } from 'node:crypto';
import type { User } from 'src/inmemoryDB/types';

@Injectable()
export class UserService {
  constructor(
    private repo: UsersRepository,
    private articlesRepo: ArticlesRepository,
    private commentsRepo: CommentRepository,
  ) {}

  getAllUsers() {
    const users = this.repo.findAll();

    return users.map(({ password, ...user }) => user);
  }

  createUser(user: CreateUserDto) {
    const createdUser = {} as User;
    const currentTimestamp = Date.now();

    createdUser.id = randomUUID();
    createdUser.login = user.login;
    createdUser.password = user.password;
    createdUser.role = user?.role || 'viewer';
    createdUser.createdAt = currentTimestamp;
    createdUser.updatedAt = currentTimestamp;

    this.repo.create(createdUser);
    const { password, ...safeUser } = createdUser;

    return safeUser;
  }

  deleteUser(id: string) {
    const user = this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    const userArticles = this.articlesRepo.findByAutorId(id);
    userArticles.forEach((article) => {
      article.authorId = null;
    });

    const userComments = this.commentsRepo.findByAutorId(id);
    userComments.forEach((comment) => {
      this.commentsRepo.delete(comment.id);
    });

    this.repo.delete(id);
  }

  findUser(id: string) {
    const user = this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    if (user.password != updatePasswordDto.oldPassword) {
      throw new ForbiddenException();
    }

    user.password = updatePasswordDto.newPassword;
    user.updatedAt = Date.now();

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
