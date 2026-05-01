import { Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: GeminiService) {}

  @Post('generate')
  async generate() {
    return;
  }
}
