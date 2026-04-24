import { describe, it, expect, vi } from 'vitest';
import { PrismaExceptionFilter } from '../../prisma.exception';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

const jsonMock = vi.fn();
const statusMock = vi.fn(() => ({ json: jsonMock }));

const responseMock: any = {
  status: statusMock,
};

const hostMock: any = {
  switchToHttp: () => ({
    getResponse: () => responseMock,
  }),
};

const filter = new PrismaExceptionFilter();

describe('PrismaExceptionFilter', () => {
  it('should return 400 for P2002', () => {
    const error = {
      code: 'P2002',
    } as PrismaClientKnownRequestError;

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Entity is already exist',
    });
  });

  it('should return 500 for unknown prisma error', () => {
    const error = {
      code: 'P9999',
    } as PrismaClientKnownRequestError;

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(500);

    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Database error',
    });
  });
});
