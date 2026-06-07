import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiArticlesController } from './ai-articles.controller';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';
import { AiProvidersModule } from 'src/AiProvidersModule/ai-providers.module';
import { AI_PROVIDER } from './interfaces/ai-provider.interface';
import { AiCacheService } from './ai-cache.service';
import { ConversationService } from './converssation/conversation.service';
import { ConversationStore } from './converssation/conversation.store';
import { AiObservabilityService } from './ai-observability.service';

@Module({
  imports: [ArticlesModule, AiProvidersModule],
  providers: [
    AiService,
    AiCacheService,
    ConversationStore,
    ConversationService,
    AiObservabilityService,
  ],
  controllers: [AiController, AiArticlesController],
  exports: [AiService],
})
export class AiModule {}
