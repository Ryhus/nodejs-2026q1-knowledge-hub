import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import type {
  ReindexInput,
  ReindexResult,
  SemanticSearchInput,
} from './types/rag-service.types';
import { Status } from 'generated/prisma/enums';
import { v5 as uuid5 } from 'uuid';
import type { ArticleResult } from 'src/ArticlesModule/articles-serivce.types';
import {
  EMBEDDING_PROVIDER,
  EmbeddingProvider,
} from 'src/AiProvidersModule/ai-provider.interfaces';

@Injectable()
export class RagService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private embedder: EmbeddingProvider,
    private articleService: ArticlesPrismaPsService,
  ) {}

  private NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

  async index(input: ReindexInput) {
    const { onlyPublished = true, articleIds } = input;

    const articleStatus = onlyPublished ? Status.published : undefined;

    const articles = (await this.articleService.getAllArticles({
      status: articleStatus,
      ids: articleIds,
    })) as ArticleResult[];

    const result: ReindexResult = {
      indexedArticles: 0,
      indexedChunks: 0,
      vectorCollection: process.env.RAG_VECTOR_COLLECTION,
    };

    for (const article of articles) {
      const chunks = this.chunkText(article.content);
      const texts = chunks.map((c) => c.text);

      const embeddingData = await this.embedder.embed<any>(texts);
      const { embeddings } = embeddingData;

      const points = chunks.map((chunk, i) => ({
        id: uuid5(`${article.id}:${chunk.index}`, this.NAMESPACE),
        vector: embeddings[i].values,
        payload: {
          chunk_index: chunk.index,
          article_id: article.id,
          title: article.title,
          text: chunk.text,
          status: article.status,
          categoryId: article.categoryId,
          tags: article.tags,
          category: article.category?.name,
        },
      }));

      try {
        const response = await fetch(
          `${process.env.RAG_VECTOR_DB_URL}/collections/${process.env.RAG_VECTOR_COLLECTION}/points`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points }),
          },
        );

        if (response.ok) {
          result.indexedArticles++;
          result.indexedChunks += chunks.length;
        }
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }

    return result;
  }

  private chunkText(text: string) {
    const chunkSize = Number(process.env.RAG_CHUNK_SIZE ?? 800);
    const overlap = Number(process.env.RAG_CHUNK_OVERLAP ?? 200);

    const step = chunkSize - overlap;

    const chunks: {
      text: string;
      index: number;
      start: number;
      end: number;
    }[] = [];

    let index = 0;

    for (let start = 0; start < text.length; start += step) {
      const end = Math.min(start + chunkSize, text.length);

      chunks.push({
        text: text.slice(start, end),
        index,
        start,
        end,
      });

      index++;
    }

    return chunks;
  }

  async search(input: SemanticSearchInput) {
    const { query, limit = 5, articleStatus, categoryId, tags } = input;

    const modelResult = await this.embedder.embed<any>([query]);
    const { embeddings } = modelResult;

    const filter = this.buildSearchFilter({ articleStatus, categoryId, tags });

    try {
      const response = await fetch(
        `${process.env.RAG_VECTOR_DB_URL}/collections/${process.env.RAG_VECTOR_COLLECTION}/points/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: embeddings[0].values,
            filter: filter,
            limit,
            with_payload: true,
          }),
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        const {
          result: { points },
        } = responseData;

        const data = points.map((point) => {
          const {
            score: similarity,
            payload: {
              article_id: articleId,
              title: articleTitle,
              text: chunk,
            },
          } = point;
          return { articleId, articleTitle, chunk, similarity };
        });

        return { results: data };
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private buildSearchFilter(params) {
    const must: any[] = [];

    if (params.tags && params.tags.length > 0) {
      must.push({
        key: 'tags',
        match: { any: params.tags },
      });
    }

    if (params.categoryId) {
      must.push({
        key: 'categoryId',
        match: { value: params.categoryId },
      });
    }

    if (params.articleStatus) {
      must.push({
        key: 'status',
        match: { value: params.articleStatus },
      });
    }

    return must.length > 0 ? { must } : undefined;
  }

  chat() {
    return;
  }

  delete() {
    return;
  }

  history() {
    return;
  }
}
