import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiArticlesController } from './ai-articles.controller';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import { AI_PROVIDER } from './interfaces/ai-provider.interface';

@Module({
  imports: [ArticlesModule],
  providers: [
    GeminiProvider,
    { provide: AI_PROVIDER, useClass: GeminiProvider },
    AiService,
  ],
  controllers: [AiController, AiArticlesController],
  exports: [AiService],
})
export class AiModule {}
