import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { BaseError, mapErrorStatusToError } from '../customErrors';
import { ErrorResponse, ErrorCode } from '../error.types';
import { PrismaClientKnownRequestError } from 'generated/prisma/internal/prismaNamespace';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let responseBody: ErrorResponse;

    if (exception instanceof BaseError) {
      responseBody = {
        statusCode: exception.statusCode,
        error: mapErrorStatusToError(exception),
        message: exception.message,
      };
    } else if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        responseBody = {
          statusCode: HttpStatus.CONFLICT,
          error: ErrorCode.CONFLICT_ERROR,
          message: exception.message,
        };
      }
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      };
    }

    this.logger.error(
      `${responseBody.statusCode} ${responseBody.error} ${responseBody.message} ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(responseBody.statusCode).json(responseBody);
  }
}
