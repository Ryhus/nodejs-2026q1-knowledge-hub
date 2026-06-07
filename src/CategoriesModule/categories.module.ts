import { Module } from '@nestjs/common';
import { CategoriesPrismaPsService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/PrismaModule/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesPrismaPsService],
})
export class CategoriesModule {}
