import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersPrismaPsRepository, UsersRepository } from './user.reposiroty';
import { CreateUserDto, UpdatePasswordDto, GetUsersQueryDto } from './user.dto';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';
import { CommentRepository } from 'src/CommentsModule/comments.repository';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { PasswordService } from 'src/PasswordModule/password.service';
import { JwtPayload } from 'src/shared/types/auth.types';
import type { User } from 'src/inmemoryDB/types';

@Injectable()
export class UserService {
  constructor(
    private repo: UsersRepository,
    private articlesRepo: ArticlesRepository,
    private commentsRepo: CommentRepository,
  ) {}

  getAllUsers(getUsersQueryDto: GetUsersQueryDto) {
    const users = [...this.repo.findAll()];

    const sortBy = getUsersQueryDto.sortBy ?? 'createdAt';
    const order = getUsersQueryDto.order ?? 'desc';

    users.sort((a, b) => {
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

    if (!getUsersQueryDto.page && !getUsersQueryDto.limit) {
      return users;
    }

    const page = getUsersQueryDto.page ?? 1;
    const limit = getUsersQueryDto.limit ?? 5;

    const offset = (page - 1) * limit;
    const data = users.slice(offset, offset + limit);
    const total = data.length;

    return { data: data, total: total, page: page, limit: limit };
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

    const { password: _, ...safeUser } = createdUser;

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

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}

@Injectable()
export class UserPrismaPsService {
  constructor(
    private repo: UsersPrismaPsRepository,
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async getAllUsers(query: GetUsersQueryDto) {
    let isPaginate = false;
    if (query.page || query.limit) {
      isPaginate = true;
    }

    const { sortBy = 'createdAt', order = 'desc', page = 1, limit = 5 } = query;

    if (!isPaginate) {
      const users = await this.prisma.user.findMany({
        orderBy: { [sortBy]: order },
      });
      return users;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async createUser(user: CreateUserDto) {
    const hashedPassword = await this.passwordService.hash(user.password);

    const createdUser = await this.repo.create({
      login: user.login,
      password: hashedPassword,
      role: user.role ?? 'viewer',
    });

    const { password: _, ...safeUser } = createdUser;

    return {
      ...safeUser,
      createdAt: safeUser.createdAt.getTime(),
      updatedAt: safeUser.updatedAt.getTime(),
    };
  }

  async deleteUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return {
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
    userPayload: JwtPayload,
  ) {
    if (userPayload.userId !== id && userPayload.role !== 'admin') {
      throw new ForbiddenException();
    }

    const user = await this.repo.findById(id);

    if (!user) {
      throw new NotFoundException();
    }

    const isCorrectPassword = await this.passwordService.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashedNewPassword = await this.passwordService.hash(dto.newPassword);

    const updatedUser = await this.repo.updatePassword(id, hashedNewPassword);

    const { password: _, ...safeUser } = updatedUser;

    return {
      ...safeUser,
      createdAt: safeUser.createdAt.getTime(),
      updatedAt: safeUser.updatedAt.getTime(),
    };
  }
}
