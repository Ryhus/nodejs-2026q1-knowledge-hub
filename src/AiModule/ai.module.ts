import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { AiArticlesController } from './ai-articles.controller';

@Module({
  providers: [GeminiService],
  controllers: [AiController, AiArticlesController],
  exports: [GeminiService],
})
export class AiModule {}
