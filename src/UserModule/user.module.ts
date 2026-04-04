import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { InmemoryDatabaseModule } from 'src/inmemoryDB/module.inmemoryDb';
import { UserService } from './user.service';
import { UsersRepository } from './user.reposiroty';

@Module({
  imports: [InmemoryDatabaseModule],
  controllers: [UserController],
  providers: [UserService, UsersRepository],
})
export class UserModule {}
