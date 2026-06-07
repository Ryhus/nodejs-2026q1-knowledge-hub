export type ReindexResponseDto = {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
};

export type RagSearchResponseDto = {
  results: Array<{
    articleId: string;
    articleTitle: string;
    chunk: string;
    similarity: number;
  }>;
};

export type RagChatResponseDto = {
  answer: string;
  sources: Array<{
    articleId: string;
    articleTitle: string;
    relevantChunk: string;
  }>;
  conversationId: string;
};
