import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { RagService } from './rag.service';
import { ReindexRequestDto, RagSearchRequestDto } from './dto/rag-request.dto';

@Controller('ai/rag')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('index')
  @HttpCode(200)
  async index(@Body() dto: ReindexRequestDto) {
    return this.rag.index(dto);
  }

  @Post('search')
  @HttpCode(200)
  async search(@Body() dto: RagSearchRequestDto) {
    return this.rag.search(dto);
  }
}
