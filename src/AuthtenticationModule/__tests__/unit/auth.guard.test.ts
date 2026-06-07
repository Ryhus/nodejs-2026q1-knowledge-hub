import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedError } from 'src/shared/exceptions/customErrors';
import { AuthGuard } from 'src/AuthtenticationModule/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

const jwtMock = {
  verifyAsync: vi.fn(),
};

const reflectorMock = {
  getAllAndOverride: vi.fn(),
};

const mockRequest: any = {
  headers: {},
};

const mockContext: any = {
  switchToHttp: () => ({
    getRequest: () => mockRequest,
  }),

  getHandler: () => ({}),
  getClass: () => ({}),
};

let guard: AuthGuard;

describe('AuthGuard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  it('should allow public route', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);

    const result = await guard.canActivate(mockContext as any);

    expect(result).toBe(true);
  });

  it('should throw if header is not Bearer', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    mockRequest.headers = {
      authorization: 'Basic token',
    };

    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('should throw if jwt verify fails', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    mockRequest.headers = {
      authorization: 'Bearer token',
    };

    jwtMock.verifyAsync.mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(mockContext as any)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('should attach user and allow request', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    mockRequest.headers = {
      authorization: 'Bearer token',
    };

    jwtMock.verifyAsync.mockResolvedValue({
      userId: '1',
      login: 'test',
      role: 'user',
    });

    const result = await guard.canActivate(mockContext as any);

    expect(result).toBe(true);

    expect(mockRequest.user).toEqual({
      userId: '1',
      login: 'test',
      role: 'user',
    });
  });
});
