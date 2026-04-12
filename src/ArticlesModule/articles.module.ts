import { Module } from '@nestjs/common';
import { ArticlesPrismaPsService } from './articles.service';
import { ArticlesController } from './articles.controller';

import { PrismaModule } from 'src/PrismaModule/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArticlesController],
  providers: [ArticlesPrismaPsService],
})
export class ArticlesModule {}
