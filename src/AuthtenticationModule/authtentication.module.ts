import { Module } from '@nestjs/common';
import { AuthtenticationService } from './authtentication.service';
import { AuthtenticationController } from './authtentication.controller';
import { PasswordModule } from 'src/PasswordModule/password.module';
import { PrismaModule } from 'src/PrismaModule/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    PasswordModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_ACCESS_TTL) || 900 },
    }),
  ],
  controllers: [AuthtenticationController],
  providers: [AuthtenticationService],
})
export class AuthtenticationModule {}
