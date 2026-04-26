import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CallHandler } from '@nestjs/common';
import { LoggingInerceptor } from '../../logging.interceptor';

const loggerMock = {
  log: vi.fn(),
};

const requestMock: any = {
  method: 'POST',
  url: '/test',
  query: { page: 1 },
  body: {
    login: 'test',
    password: '123',
    refreshToken: 'r',
    accessToken: 'a',
  },
};

const responseMock: any = {
  statusCode: 200,
};

const contextMock: any = {
  switchToHttp: () => ({
    getRequest: () => requestMock,
    getResponse: () => responseMock,
  }),
};

const nextMock: CallHandler = {
  handle: () => of('result'),
};

let interceptor: LoggingInerceptor;

const runInterceptor = async () => {
  const result = interceptor.intercept(contextMock, nextMock);

  if (result instanceof Promise) {
    return result;
  }

  return result;
};

describe('Logging interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    interceptor = new LoggingInerceptor(loggerMock as any);
  });

  it('logs request with sanitized body', async () => {
    const result = await runInterceptor();

    result.subscribe();

    expect(loggerMock.log).toHaveBeenCalledWith({
      method: 'POST',
      url: '/test',
      query: { page: 1 },
      body: {
        login: 'test',
        password: '[REDACTED]',
        refreshToken: '[REDACTED]',
        accessToken: '[REDACTED]',
      },
    });
  });

  it('logs response after request completes', async () => {
    vi.useFakeTimers();

    const result = await runInterceptor();

    result.subscribe();

    vi.advanceTimersByTime(50);

    expect(loggerMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 200,
        responseTime: expect.any(String),
      }),
    );

    vi.useRealTimers();
  });

  it('does not sanitize empty body', async () => {
    const ctx: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          ...requestMock,
          body: undefined,
        }),
        getResponse: () => responseMock,
      }),
    };

    await interceptor.intercept(ctx, nextMock);

    expect(loggerMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        body: undefined,
      }),
    );
  });

  it('sanitizes only password field', async () => {
    const ctx: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          ...requestMock,
          body: {
            password: 'secret',
          },
        }),
        getResponse: () => responseMock,
      }),
    };

    await interceptor.intercept(ctx, nextMock);

    const body = loggerMock.log.mock.calls[0][0].body;

    expect(body.password).toBe('[REDACTED]');
  });
});
