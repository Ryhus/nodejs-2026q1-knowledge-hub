import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';
import { ReindexRequestDto } from './dto/rag-request.dto';

@Controller('ai/rag')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('index')
  async index(@Body() dto: ReindexRequestDto) {
    return this.rag.index(dto);
  }
}
