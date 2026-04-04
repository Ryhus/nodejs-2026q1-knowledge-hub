import { Module } from '@nestjs/common';
import { UserModule } from './UserModule/user.module';
import { ArticlesModule } from './ArticlesModule/articles.module';

@Module({
  imports: [UserModule, ArticlesModule],
})
export class AppModule {}
