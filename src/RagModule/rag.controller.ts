import {
  Controller,
  Post,
  Body,
  HttpCode,
  Delete,
  Param,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';
import { RagService } from './rag.service';
import {
  ReindexRequestDto,
  RagSearchRequestDto,
  RagChatRequestDto,
} from './dto/rag-request.dto';
import { RagSearchResponseDto } from './dto/rag-response.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('rag')
@Controller('ai/rag')
@ApiBearerAuth('access-token')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('index')
  @HttpCode(200)
  async index(@Body() dto: ReindexRequestDto) {
    return this.rag.index(dto);
  }

  @Post('search')
  @HttpCode(200)
  async search(
    @Body() dto: RagSearchRequestDto,
  ): Promise<RagSearchResponseDto> {
    const responseData = await this.rag.search(dto);

    const {
      result: { points },
    } = responseData;

    const data = points.map((point) => {
      const {
        score: similarity,
        payload: { article_id: articleId, title: articleTitle, text: chunk },
      } = point;
      return { articleId, articleTitle, chunk, similarity };
    });

    return { results: data };
  }

  @Delete('index/articles/:articleId')
  @HttpCode(204)
  async delete(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
  ) {
    return this.rag.deletePointsById(articleId);
  }

  @Post('chat')
  @HttpCode(200)
  async chat(@Body() dto: RagChatRequestDto) {
    return this.rag.chat(dto);
  }

  @Get('chat/:conversationId/history')
  @HttpCode(200)
  async history(
    @Param('conversationId', new ParseUUIDPipe({ version: '4' }))
    conversationId: string,
  ) {
    return this.rag.history(conversationId);
  }
}
