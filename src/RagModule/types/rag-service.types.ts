export type ReindexInput = {
  onlyPublished?: boolean;
  articleIds?: string[];
};

export type ReindexResult = {
  indexedArticles: number;
  indexedChunks: number;
  vectorCollection: string;
};
