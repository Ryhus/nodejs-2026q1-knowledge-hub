import { Module } from '@nestjs/common';
import { UserModule } from './UserModule/user.module';
import { ArticlesModule } from './ArticlesModule/articles.module';
import { CategoriesModule } from './CategoriesModule/categories.module';
import { CommentModule } from './CommentsModule/comments.module';
import { AuthtenticationModule } from './AuthtenticationModule/authtentication.module';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './shared/exceptions/prisma.exception';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './AuthtenticationModule/auth.guard';
import { RolesGuard } from './AuthtenticationModule/roles.guard';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    UserModule,
    ArticlesModule,
    CategoriesModule,
    CommentModule,
    AuthtenticationModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
