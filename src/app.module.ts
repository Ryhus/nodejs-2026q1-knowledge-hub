import { Module } from '@nestjs/common';
import { UserModule } from './UserModule/user.module';
import { ArticlesModule } from './ArticlesModule/articles.module';
import { CategoriesModule } from './CategoriesModule/categories.module';

@Module({
  imports: [UserModule, ArticlesModule, CategoriesModule],
})
export class AppModule {}
