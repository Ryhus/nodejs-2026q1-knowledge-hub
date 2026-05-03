import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { Request, Response } from 'express';
import { UsageService } from 'src/UsageModule/usage.service';

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

    if (metaType !== 'ai') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    const { path } = request;
    const trackingRequestData = { domain: metaType, endpoint: path };

    this.tracker.track(trackingRequestData);
  }
}
