import { ErrorCode } from './error.types';
import { HttpStatus } from '@nestjs/common';

export function mapErrorStatusToError(error: BaseError) {
  const status = error.statusCode;

  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.VALIDATION_ERROR;

    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED_ERROR;

    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN_ERROR;

    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND_ERROR;

    default:
      return ErrorCode.INTERNAL_SERVER_ERROR;
  }
}

export class BaseError extends Error {
  public statusCode: HttpStatus;

  constructor(message: string, statusCode: HttpStatus) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ValidationError extends BaseError {
  constructor(message = 'Validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
