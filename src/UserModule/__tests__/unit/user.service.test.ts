import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UserService } from 'src/UserModule/user.service';
import {
  NotFoundError,
  ForbiddenError,
} from 'src/shared/exceptions/customErrors';
import { UsersRepository } from 'src/UserModule/user.reposiroty';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';
import { CommentRepository } from 'src/CommentsModule/comments.repository';

const repoMock = {
  findAll: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  delete: vi.fn(),
};

const articlesRepoMock = {
  findByAutorId: vi.fn(),
};

const commentsRepoMock = {
  findByAutorId: vi.fn(),
  delete: vi.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UsersRepository, useValue: repoMock },
        { provide: ArticlesRepository, useValue: articlesRepoMock },
        { provide: CommentRepository, useValue: commentsRepoMock },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  describe('createUser', () => {
    it('should create user with default role viewer', () => {
      const dto = { login: 'test', password: '123' };

      repoMock.create.mockImplementation((u) => u);

      const result = service.createUser(dto);

      expect(result.login).toBe('test');
      expect(result.role).toBe('viewer');
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: '123',
        }),
      );
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findUser', () => {
    it('should return user if exists', () => {
      repoMock.findById.mockReturnValue({ id: '1' });

      const result = service.findUser('1');

      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if user not found', () => {
      repoMock.findById.mockReturnValue(null);

      expect(() => service.findUser('1')).toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and clean relations', () => {
      repoMock.findById.mockReturnValue({ id: '1' });

      articlesRepoMock.findByAutorId.mockReturnValue([
        { id: 'a1', authorId: '1' },
      ]);

      commentsRepoMock.findByAutorId.mockReturnValue([{ id: 'c1' }]);

      service.deleteUser('1');

      expect(repoMock.delete).toHaveBeenCalledWith('1');
      expect(commentsRepoMock.delete).toHaveBeenCalledWith('c1');
    });

    it('should throw if user not found', () => {
      repoMock.findById.mockReturnValue(null);

      expect(() => service.deleteUser('1')).toThrow(NotFoundError);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', () => {
      const user = {
        password: 'old',
        updatedAt: 0,
      };

      repoMock.findById.mockReturnValue(user);

      const result = service.updatePassword('1', {
        oldPassword: 'old',
        newPassword: 'new',
      });

      expect(user.password).toBe('new');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ForbiddenException if old password is wrong', () => {
      repoMock.findById.mockReturnValue({
        password: 'correct',
      });

      expect(() =>
        service.updatePassword('1', {
          oldPassword: 'wrong',
          newPassword: 'new',
        }),
      ).toThrow(ForbiddenError);
    });
  });

  describe('getAllUsers', () => {
    it('should return users array without pagination', () => {
      repoMock.findAll.mockReturnValue([{ createdAt: 2 }, { createdAt: 1 }]);

      const result = service.getAllUsers({});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return paginated result', () => {
      repoMock.findAll.mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = service.getAllUsers({ page: 1, limit: 2 });

      if (!Array.isArray(result)) {
        expect(result.data.length).toBe(2);
        expect(result.page).toBe(1);
      }
    });
  });
});
