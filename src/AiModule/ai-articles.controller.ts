import { Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('ai/articles')
export class AiArticlesController {
  constructor(private aiService: GeminiService) {}

  @Post(':articleId/summarize')
  async summarize() {
    return;
  }

  @Post(':articleId/translate')
  async translate() {
    return;
  }

  @Post(':articleId/analyze')
  async analyze() {
    return;
  }
}
