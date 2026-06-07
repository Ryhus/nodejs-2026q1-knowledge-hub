import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { UsageService } from 'src/UsageModule/usage.service';
import { tap } from 'rxjs';

@Injectable()
export class UsageInerceptor implements NestInterceptor {
  constructor(
    private readonly tracker: UsageService,
    private reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const metaType = this.reflector.get<string>('track', context.getClass());
    const request = context.switchToHttp().getRequest<Request>();
    const { path } = request;

    if (metaType !== 'ai') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.tracker.track({
          domain: metaType,
          endpoint: path,
        });
      }),
    );
  }
}
