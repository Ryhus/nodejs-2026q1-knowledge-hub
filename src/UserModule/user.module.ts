import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserPrismaPsService } from './user.service';
import { UsersPrismaPsRepository } from './user.reposiroty';

import { PrismaModule } from 'src/PrismaModule/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserPrismaPsService, UsersPrismaPsRepository],
})
export class UserModule {}
