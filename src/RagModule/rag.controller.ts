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
import {
  RagChatResponseDto,
  RagConversationMessageDto,
  RagSearchResponseDto,
  ReindexResponseDto,
} from './dto/rag-response.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('rag')
@Controller('ai/rag')
@ApiBearerAuth('access-token')
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('index')
  @HttpCode(200)
  @ApiOperation({ summary: 'Index articles for RAG retrieval' })
  @ApiOkResponse({
    type: ReindexResponseDto,
    description: 'Articles indexed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiServiceUnavailableResponse({
    description: 'Embedding or vector service is unavailable',
  })
  async index(@Body() dto: ReindexRequestDto) {
    return this.rag.index(dto);
  }

  @Post('search')
  @HttpCode(200)
  @ApiOperation({ summary: 'Search indexed article content semantically' })
  @ApiOkResponse({
    type: RagSearchResponseDto,
    description: 'Matching article chunks returned successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiServiceUnavailableResponse({
    description: 'Embedding or vector service is unavailable',
  })
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
  @ApiOperation({ summary: 'Remove an article from the RAG index' })
  @ApiParam({
    name: 'articleId',
    description: 'Article ID',
    format: 'uuid',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @ApiNoContentResponse({ description: 'Article vectors removed successfully' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({ description: 'Invalid article ID' })
  @ApiNotFoundResponse({
    description: 'Article is not present in the RAG index',
  })
  @ApiServiceUnavailableResponse({
    description: 'Vector service is unavailable',
  })
  async delete(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
  ) {
    return this.rag.deletePointsById(articleId);
  }

  @Post('chat')
  @HttpCode(200)
  @ApiOperation({ summary: 'Answer a question using indexed article content' })
  @ApiOkResponse({
    type: RagChatResponseDto,
    description: 'Answer generated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiServiceUnavailableResponse({
    description: 'AI, embedding, or vector service is unavailable',
  })
  async chat(@Body() dto: RagChatRequestDto): Promise<RagChatResponseDto> {
    return this.rag.chat(dto);
  }

  @Get('chat/:conversationId/history')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get RAG chat conversation history' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    format: 'uuid',
    example: 'de4c4b13-d9a6-4d6d-b7f7-15d263f42bfe',
  })
  @ApiOkResponse({
    type: [RagConversationMessageDto],
    description: 'Conversation messages returned successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({ description: 'Invalid conversation ID' })
  async history(
    @Param('conversationId', new ParseUUIDPipe({ version: '4' }))
    conversationId: string,
  ) {
    return this.rag.history(conversationId);
  }
}
