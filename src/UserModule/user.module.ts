import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserPrismaPsService, UserService } from './user.service';
import { UsersPrismaPsRepository } from './user.reposiroty';
import { PrismaModule } from 'src/PrismaModule/prisma.module';
import { PasswordModule } from 'src/PasswordModule/password.module';
@Module({
  imports: [PrismaModule, PasswordModule],
  controllers: [UserController],
  providers: [UserPrismaPsService, UsersPrismaPsRepository],
})
export class UserModule {}
