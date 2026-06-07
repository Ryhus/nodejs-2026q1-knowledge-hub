import { Module } from '@nestjs/common';
import { UserModule } from './UserModule/user.module';
import { ArticlesModule } from './ArticlesModule/articles.module';
import { CategoriesModule } from './CategoriesModule/categories.module';
import { CommentModule } from './CommentsModule/comments.module';
import { AuthtenticationModule } from './AuthtenticationModule/authtentication.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/exceptions/filters/global.exception.filter';
import { AuthGuard } from './AuthtenticationModule/auth.guard';
import { RolesGuard } from './AuthtenticationModule/roles.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggingInerceptor } from './shared/interceptors/logging.interceptor';
import { AppLoggerModule } from './AppLoggerModule/appLoger.module';
import { AiModule } from './AiModule/ai.module';
import { UsageModule } from './UsageModule/usage.module';
import { UsageInerceptor } from './shared/interceptors/usage.interceptor';
import { RagModule } from './RagModule/rag.module';

@Module({
  imports: [
    UserModule,
    ArticlesModule,
    CategoriesModule,
    CommentModule,
    AuthtenticationModule,
    AppLoggerModule,
    AiModule,
    UsageModule,
    RagModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 30,
        },
      ],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInerceptor },
    { provide: APP_INTERCEPTOR, useClass: UsageInerceptor },
  ],
})
export class AppModule {}
