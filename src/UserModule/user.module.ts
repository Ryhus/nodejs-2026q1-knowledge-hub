import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { UserService } from './user.service';
import { UsersRepository } from './user.reposiroty';
import { CommentModule } from 'src/CommentsModule/comments.module';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';

@Module({
  imports: [InmemoryDatabaseModule, CommentModule, ArticlesModule],
  controllers: [UserController],
  providers: [UserService, UsersRepository],
})
export class UserModule {}
