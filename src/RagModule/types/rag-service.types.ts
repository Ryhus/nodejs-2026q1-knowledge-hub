export type ReindexInput = {
  onlyPublished?: boolean;
  articleIds?: string[];
};

export type ReindexResult = {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
};

export type SemanticSearchInput = {
  query: string;
  limit?: number;
  articleStatus?: 'draft' | 'published' | 'archived';
  categoryId?: string;
  tags?: string[];
};

export type RagChatInput = {
  question: string;
  conversationId?: string;
};

export type Message = {
  role: 'user' | 'model';
  content: string;
};
