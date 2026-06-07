import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { AiProvidersModule } from 'src/AiProvidersModule/ai-providers.module';
import { ArticlesModule } from 'src/ArticlesModule/articles.module';
import { RagController } from './rag.controller';
import { RagConversationStore } from './conversation-store';
import { QdrantService } from './qdrant.service';
@Module({
  imports: [AiProvidersModule, ArticlesModule],
  controllers: [RagController],
  providers: [RagService, RagConversationStore, QdrantService],
})
export class RagModule {}
