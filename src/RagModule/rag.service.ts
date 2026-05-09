import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import type {
  ReindexInput,
  ReindexResult,
  SemanticSearchInput,
  RagChatInput,
} from './types/rag-service.types';
import { Status } from 'generated/prisma/enums';
import { v5 as uuid5 } from 'uuid';
import type { ArticleResult } from 'src/ArticlesModule/articles-serivce.types';
import {
  EMBEDDING_PROVIDER,
  TEXT_GENERATION_PROVIDER,
  EmbeddingProvider,
  TextGenerationProvider,
} from 'src/AiProvidersModule/ai-provider.interfaces';

@Injectable()
export class RagService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private embedder: EmbeddingProvider,
    @Inject(TEXT_GENERATION_PROVIDER) private generator: TextGenerationProvider,
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
        return responseData;
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async chat(input: RagChatInput) {
    const { question: query, conversationId } = input;

    const dbResult = await this.search({ query });

    const {
      result: { points },
    } = dbResult;

    const sources = points.map((point) => {
      const {
        payload: {
          article_id: articleId,
          title: articleTitle,
          text: relevantChunk,
        },
      } = point;
      return { articleId, articleTitle, relevantChunk };
    });

    const promt = this.buildPromt(sources, query);

    const modelResponse = await this.generator.generate<any>(promt);

    const answer =
      modelResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return { answer, sources, conversationId };
  }

  async deletePointsById(id: string) {
    const exists = await this.queryPointByArticleId(id);

    if (!exists) {
      throw new NotFoundException();
    }

    try {
      const response = await fetch(
        `http://localhost:6333/collections/${process.env.RAG_VECTOR_COLLECTION}/points/delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              must: [
                {
                  key: 'article_id',
                  match: { value: id },
                },
              ],
            },
          }),
        },
      );

      if (response.ok) {
        return;
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  history() {
    return;
  }

  private buildPromt(source: any[], question: string) {
    const instruction =
      'You are the chat assistant and speak with the user. You must answer user questions using the context';

    return `
    ${instruction}
    
    Context:
    ${source.map((data) => data.relevantChunk).join('\n')}

    Question:
    ${question}
    `;
  }

  private async queryPointByArticleId(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `http://localhost:6333/collections/${process.env.RAG_VECTOR_COLLECTION}/points/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filter: {
              must: [
                {
                  key: 'article_id',
                  match: { value: id },
                },
              ],
            },
            limit: 1,
            with_payload: false,
            with_vector: false,
          }),
        },
      );
      const data = await response.json();
      return data.result.points.length > 0;
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
}
