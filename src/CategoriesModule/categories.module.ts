import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { CategoriesRepository } from './categories.repository';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';

@Module({
  imports: [InmemoryDatabaseModule, ArticlesModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
