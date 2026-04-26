import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLoggerService } from 'src/AppLogerModule/appLogger.service';

@Injectable()
export class LoggingInerceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, query, body } = request;

    const sanitizedBody = this.sanitize(body);

    this.logger.log({ method, url, query, body: sanitizedBody });

    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.log({
          statusCode: response.statusCode,
          responseTime: `${Date.now() - now}ms`,
        }),
      ),
    );
  }

  private sanitize(body: any) {
    if (!body) return body;

    const clone = { ...body };

    if (clone.password) {
      clone.password = '[REDACTED]';
    }

    if (clone.refreshToken) {
      clone.refreshToken = '[REDACTED]';
    }

    if (clone.accessToken) {
      clone.accessToken = '[REDACTED]';
    }

    return clone;
  }
}
