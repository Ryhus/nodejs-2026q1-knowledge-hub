import {
  Injectable,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { BaseError, mapErrorStatusToError } from '../customErrors';
import { ErrorResponse, ErrorCode } from '../error.types';
import { PrismaClientKnownRequestError } from 'generated/prisma/internal/prismaNamespace';
import { AppLoggerService } from 'src/AppLoggerModule/appLogger.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

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
    } else if (exception instanceof HttpException) {
      responseBody = {
        statusCode: exception.getStatus(),
        message: exception.message,
      };
    } else if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        responseBody = {
          statusCode: HttpStatus.CONFLICT,
          error: ErrorCode.CONFLICT_ERROR,
          message: exception.message,
        };
      } else {
        responseBody = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected DB error occurred',
        };
      }
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      };
    }

    this.logger.error({
      statusCode: responseBody.statusCode,
      error: responseBody.error,
      method: request.method,
      url: request.path,
      trace: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(responseBody.statusCode).json(responseBody);
  }
}
