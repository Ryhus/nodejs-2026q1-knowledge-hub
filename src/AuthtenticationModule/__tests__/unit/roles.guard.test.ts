import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesGuard } from 'src/AuthtenticationModule/roles.guard';
import { Reflector } from '@nestjs/core';

const mockRequest: any = {
  user: {
    role: 'viewer',
  },
};

const reflectorMock = {
  getAllAndOverride: vi.fn(),
};

const mockContext: any = {
  getHandler: () => ({}),

  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => mockRequest,
  }),
};

let guard: RolesGuard;

describe('RolesGuard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get(RolesGuard);
  });

  it('should allow access if no roles required', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext as any);

    expect(result).toBe(true);
  });

  it('should allow access if user has required role', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin', 'editor']);

    mockRequest.user.role = 'admin';

    const result = guard.canActivate(mockContext as any);

    expect(result).toBe(true);
  });

  it('should deny access if role does not match', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin', 'editor']);

    mockRequest.user.role = 'viewer';

    const result = guard.canActivate(mockContext as any);

    expect(result).toBe(false);
  });
});
