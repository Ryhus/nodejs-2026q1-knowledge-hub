import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { ArticlesRepository } from './articles.repository';

@Module({
  imports: [InmemoryDatabaseModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesRepository],
  exports: [ArticlesRepository],
})
export class ArticlesModule {}
