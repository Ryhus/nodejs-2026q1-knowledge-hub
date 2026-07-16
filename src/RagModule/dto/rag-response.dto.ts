import { ApiProperty } from '@nestjs/swagger';

export class ReindexResponseDto {
  @ApiProperty({ description: 'Number of indexed articles', example: 3 })
  indexedArticles: number;

  @ApiProperty({ description: 'Number of created vector chunks', example: 12 })
  indexedChunks: number;

  @ApiProperty({
    description: 'Name of the vector collection',
    example: 'articles',
  })
  vectorCollection: string;
}

export class RagSearchResultDto {
  @ApiProperty({ description: 'Source article ID', format: 'uuid' })
  articleId: string;

  @ApiProperty({
    description: 'Source article title',
    example: 'JWT authentication',
  })
  articleTitle: string;

  @ApiProperty({ description: 'Relevant excerpt from the article' })
  chunk: string;

  @ApiProperty({ description: 'Semantic similarity score', example: 0.92 })
  similarity: number;
}

export class RagSearchResponseDto {
  @ApiProperty({ type: [RagSearchResultDto] })
  results: RagSearchResultDto[];
}

export class RagChatSourceDto {
  @ApiProperty({ description: 'Source article ID', format: 'uuid' })
  articleId: string;

  @ApiProperty({
    description: 'Source article title',
    example: 'JWT authentication',
  })
  articleTitle: string;

  @ApiProperty({ description: 'Article excerpt used to generate the answer' })
  relevantChunk: string;
}

export class RagChatResponseDto {
  @ApiProperty({ description: 'Answer generated from indexed article content' })
  answer: string;

  @ApiProperty({ type: [RagChatSourceDto] })
  sources: RagChatSourceDto[];

  @ApiProperty({ description: 'Conversation ID', format: 'uuid' })
  conversationId: string;
}

export class RagConversationMessageDto {
  @ApiProperty({ enum: ['user', 'model'], example: 'model' })
  role: 'user' | 'model';

  @ApiProperty({
    description: 'Message text',
    example: 'Use a short-lived access token.',
  })
  content: string;
}
