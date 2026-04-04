import { Module } from '@nestjs/common';
import { UserModule } from './UserModule/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule {}
