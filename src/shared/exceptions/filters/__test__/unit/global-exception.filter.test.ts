import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../global.exception.filter';
import { AppLoggerService } from 'src/AppLoggerModule/appLogger.service';
import { BaseError, mapErrorStatusToError } from '../../../customErrors';
import { ErrorCode } from 'src/shared/exceptions/error.types';
import { PrismaClientKnownRequestError } from 'generated/prisma/internal/prismaNamespace';

vi.mock('../../../customErrors', async (importOriginal) => {
  const actual = await importOriginal<any>();

  return {
    ...actual,

    mapErrorStatusToError: vi.fn(),
  };
});

const jsonMock = vi.fn();
const statusMock = vi.fn(() => ({ json: jsonMock }));

const responseMock = {
  status: statusMock,
};

const requestMock = {
  method: 'GET',
  path: '/test-url',
};

const loggerMock: AppLoggerService = {
  error: vi.fn(),
} as any;

const hostMock: any = {
  switchToHttp: () => ({
    getResponse: () => responseMock,
    getRequest: () => requestMock,
  }),
};

let filter: GlobalExceptionFilter;

describe('Global exception filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filter = new GlobalExceptionFilter(loggerMock);
  });

  it('handles BaseError correctly', () => {
    (mapErrorStatusToError as any).mockReturnValue(ErrorCode.VALIDATION_ERROR);

    const error = new BaseError('Bad request', HttpStatus.BAD_REQUEST);

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ErrorCode.VALIDATION_ERROR,
      message: 'Bad request',
    });
  });

  it('handles Prisma P2002', () => {
    const error = new PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '1',
    });

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);

    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      error: ErrorCode.CONFLICT_ERROR,
      message: error.message,
    });
  });

  it('handles Prisma non-P2002 error', () => {
    const error = new PrismaClientKnownRequestError('db fail', {
      code: 'P2025',
      clientVersion: '1',
    });

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected DB error occurred',
    });
  });

  it('handles unknown error', () => {
    const error = new Error('boom');

    filter.catch(error, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(jsonMock).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
    });

    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/test-url',
        trace: error.stack,
      }),
    );
  });
});
