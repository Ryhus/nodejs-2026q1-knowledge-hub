import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserPrismaPsService } from 'src/UserModule/user.service';
import {
  NotFoundError,
  ForbiddenError,
} from 'src/shared/exceptions/customErrors';
import { UsersPrismaPsRepository } from 'src/UserModule/user.reposiroty';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { PasswordService } from 'src/PasswordModule/password.service';

const repoMock = {
  create: vi.fn(),
  findById: vi.fn(),
  updatePassword: vi.fn(),
};

const prismaMock = {
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

const passwordServiceMock = {
  hash: vi.fn(),
  compare: vi.fn(),
};

describe('UserPrismaPsService (prisma)', () => {
  let service: UserPrismaPsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserPrismaPsService,
        { provide: UsersPrismaPsRepository, useValue: repoMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordService, useValue: passwordServiceMock },
      ],
    }).compile();

    service = moduleRef.get(UserPrismaPsService);
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      passwordServiceMock.hash.mockResolvedValue('hashed-pass');

      repoMock.create.mockResolvedValue({
        login: 'test',
        password: 'hashed-pass',
        role: 'viewer',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createUser({
        login: 'test',
        password: '123',
      });

      expect(result.role).toBe('viewer');
      expect(passwordServiceMock.hash).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findUser', () => {
    it('should return user if exists', async () => {
      repoMock.findById.mockResolvedValue({
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findUser('1');

      expect(result.id).toBe('1');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw if user not found', async () => {
      repoMock.findById.mockResolvedValue(null);

      await expect(service.findUser('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user via prisma', async () => {
      repoMock.findById.mockResolvedValue({ id: '1' });

      prismaMock.user.delete.mockResolvedValue({});

      await service.deleteUser('1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw if user not found', async () => {
      repoMock.findById.mockResolvedValue(null);

      await expect(service.deleteUser('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updatePassword', () => {
    it('should update password if correct', async () => {
      repoMock.findById.mockResolvedValue({
        id: '1',
        password: 'hashed-old',
      });

      passwordServiceMock.compare.mockResolvedValue(true);
      passwordServiceMock.hash.mockResolvedValue('hashed-new');

      repoMock.updatePassword.mockResolvedValue({
        password: 'hashed-new',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updatePassword(
        '1',
        {
          oldPassword: 'old',
          newPassword: 'new',
        },
        { userId: '1', role: 'user' } as any,
      );

      expect(result).not.toHaveProperty('password');
    });

    it('should throw if old password incorrect', async () => {
      repoMock.findById.mockResolvedValue({
        password: 'hashed-old',
      });

      passwordServiceMock.compare.mockResolvedValue(false);

      await expect(
        service.updatePassword('1', { oldPassword: 'x', newPassword: 'y' }, {
          userId: '1',
          role: 'user',
        } as any),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw if user not found', async () => {
      repoMock.findById.mockResolvedValue(null);

      await expect(
        service.updatePassword(
          '1',
          {
            oldPassword: 'old',
            newPassword: 'new',
          },
          { userId: '1', role: 'user' } as any,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      await expect(
        service.updatePassword(
          'target-user-id',
          { oldPassword: 'a', newPassword: 'b' },
          { userId: 'another-user-id', role: 'user' } as any,
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated data', async () => {
      prismaMock.$transaction.mockResolvedValue([[{ id: 1 }], 10]);

      const result = await service.getAllUsers({
        page: 1,
        limit: 5,
      });

      if (!Array.isArray(result)) {
        expect(result.data.length).toBe(1);
        expect(result.page).toBe(1);
      }
    });

    it('should return the default paginated result', async () => {
      prismaMock.$transaction.mockResolvedValue([[{ id: 1 }, { id: 2 }], 2]);

      const result = await service.getAllUsers({});

      expect(result).toMatchObject({ total: 2, page: 1, limit: 5 });
      expect(result.data).toHaveLength(2);
    });
  });
});
