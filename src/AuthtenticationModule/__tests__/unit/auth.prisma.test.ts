import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { AuthtenticationService } from 'src/AuthtenticationModule/authtentication.service';
import { PasswordService } from 'src/PasswordModule/password.service';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { JwtService } from '@nestjs/jwt';

const passwordServiceMock = {
  hash: vi.fn(),
  compare: vi.fn(),
};

const prismaMock = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  refreshToken: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const jwtMock = {
  signAsync: vi.fn(),
  verifyAsync: vi.fn(),
};

let service: AuthtenticationService;

describe('AuthenticationService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthtenticationService,
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get(AuthtenticationService);
  });

  describe('singUp', () => {
    it('should signup user and return safe user', async () => {
      passwordServiceMock.hash.mockResolvedValue('hashed');

      prismaMock.user.create.mockResolvedValue({
        id: '1',
        login: 'test',
        password: 'hashed',
        role: 'user',
      });

      const result = await service.signup({
        login: 'test',
        password: '123',
      });

      expect(result.login).toBe('test');
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ login: 'x', password: '123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if password incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        login: 'test',
        password: 'hashed',
        role: 'user',
      });

      passwordServiceMock.compare.mockResolvedValue(false);

      await expect(
        service.login({ login: 'test', password: 'wrong' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return tokens and store refresh token', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        login: 'test',
        password: 'hashed',
        role: 'user',
      });

      passwordServiceMock.compare.mockResolvedValue(true);

      jwtMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      prismaMock.refreshToken.upsert.mockResolvedValue({});

      const result = await service.login({
        login: 'test',
        password: '123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('refresh', () => {
    it('should throw if refresh token invalid', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.refresh('bad-token')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  it('should throw if token mismatch', async () => {
    jwtMock.verifyAsync.mockResolvedValue({
      userId: '1',
    });

    prismaMock.refreshToken.findUnique.mockResolvedValue({
      token: 'different-token',
    });

    await expect(service.refresh('token')).rejects.toThrow(ForbiddenException);
  });

  it('should rotate tokens', async () => {
    jwtMock.verifyAsync.mockResolvedValue({
      userId: '1',
      login: 'test',
      role: 'user',
    });

    prismaMock.refreshToken.findUnique.mockResolvedValue({
      token: 'token',
    });

    jwtMock.signAsync
      .mockResolvedValueOnce('new-access')
      .mockResolvedValueOnce('new-refresh');

    prismaMock.refreshToken.update.mockResolvedValue({});

    const result = await service.refresh('token');

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
  });

  describe('logout', () => {
    it('should throw on invalid logout token', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error());

      await expect(service.logout('bad')).rejects.toThrow(ForbiddenException);
    });

    it('should delete refresh token', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        userId: '1',
      });

      prismaMock.refreshToken.delete.mockResolvedValue({});

      const result = await service.logout('token');

      expect(result.success).toBe(true);
    });
  });
});
