import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { CommentRepository } from './comments.repository';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';

@Module({
  imports: [InmemoryDatabaseModule, ArticlesModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
})
export class CommentModule {}
