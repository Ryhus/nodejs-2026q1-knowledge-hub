import {
  Controller,
  Post,
  Body,
  HttpCode,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
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

  @Delete('index/articles/:articleId')
  @HttpCode(204)
  async delete(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
  ) {
    return this.rag.deletePointsById(articleId);
  }
}
