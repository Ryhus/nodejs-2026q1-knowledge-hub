import { Module } from '@nestjs/common';
import { AuthtenticationService } from './authtentication.service';
import { AuthtenticationController } from './authtentication.controller';
import { PasswordModule } from 'src/PasswordModule/password.module';
import { PrismaModule } from 'src/PrismaModule/prisma.module';

@Module({
  imports: [PrismaModule, PasswordModule],
  controllers: [AuthtenticationController],
  providers: [AuthtenticationService],
})
export class AuthtenticationModule {}
