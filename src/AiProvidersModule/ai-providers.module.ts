import { Module } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini/gemini.provider';
import {
  TEXT_GENERATION_PROVIDER,
  EMBEDDING_PROVIDER,
} from './ai-provider.interfaces';

@Module({
  providers: [
    {
      provide: TEXT_GENERATION_PROVIDER,
      useClass: GeminiProvider,
    },
    {
      provide: EMBEDDING_PROVIDER,
      useClass: GeminiProvider,
    },
  ],
  exports: [TEXT_GENERATION_PROVIDER, EMBEDDING_PROVIDER],
})
export class AiProvidersModule {}
