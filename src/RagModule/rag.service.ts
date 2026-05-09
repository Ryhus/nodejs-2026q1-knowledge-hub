import { Injectable, Inject } from '@nestjs/common';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import type { ReindexInput, ReindexResult } from './types/rag-service.types';
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
          tittle: article.title,
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
        throw error;
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

  search() {
    return;
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
