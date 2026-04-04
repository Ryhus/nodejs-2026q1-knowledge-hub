import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './user.reposiroty';
import { CreateUserDto, UpdatePasswordDto } from './user.dto';
import { randomUUID } from 'node:crypto';
import type { User } from 'src/inmemoryDB/types';
@Injectable()
export class UserService {
  constructor(private repo: UsersRepository) {}

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

    this.repo.delete(id);
  }

  findUser(id: string) {
    const user = this.repo.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return this.repo.findById(id);
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
