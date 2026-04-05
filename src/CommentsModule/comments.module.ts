import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommentController } from './comments.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { CommentRepository } from './comments.repository';

@Module({
  imports: [InmemoryDatabaseModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentRepository],
})
export class CommentModule {}
