import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import type {
  ReindexInput,
  ReindexResult,
  SemanticSearchInput,
  RagChatInput,
} from './types/rag-service.types';
import { Status } from 'generated/prisma/enums';
import { v5 as uuid5, v4 as uuid4 } from 'uuid';
import type { ArticleResult } from 'src/ArticlesModule/articles-serivce.types';
import {
  EMBEDDING_PROVIDER,
  TEXT_GENERATION_PROVIDER,
  EmbeddingProvider,
  TextGenerationProvider,
} from 'src/AiProvidersModule/ai-provider.interfaces';
import { RagConversationStore } from './conversation-store';
import { AiUnavailableError } from 'src/AiProvidersModule/errors/ai.errors';

@Injectable()
export class RagService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private embedder: EmbeddingProvider,
    @Inject(TEXT_GENERATION_PROVIDER) private generator: TextGenerationProvider,
    private articleService: ArticlesPrismaPsService,
    private conversation: RagConversationStore,
  ) {}

  private NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

  async index(input: ReindexInput) {
    try {
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
        const point = await this.queryPointByArticleId(article.id);

        const pointUpdated =
          point?.data?.result?.points[0]?.payload?.updated_at;

        if (new Date(article.updatedAt) < new Date(pointUpdated)) continue;

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
            updated_at: new Date(),
          },
        }));

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
      }
      return result;
    } catch (error) {
      if (error instanceof TypeError || error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }
      throw new InternalServerErrorException();
    }
  }

  async search(input: SemanticSearchInput) {
    const { query, limit = 5, articleStatus, categoryId, tags } = input;

    try {
      const modelResult = await this.embedder.embed<any>([query]);
      const { embeddings } = modelResult;

      const filter = this.buildSearchFilter({
        articleStatus,
        categoryId,
        tags,
      });

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
        const reranked = this.rerankHeuristically(
          query,
          responseData.result.points,
        );

        return { result: { points: reranked } };
      }
    } catch (error) {
      if (error instanceof TypeError || error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }
      throw new InternalServerErrorException();
    }
  }

  async chat(input: RagChatInput) {
    const { question: query } = input;
    let conversationId = input.conversationId;

    if (!conversationId) {
      conversationId = uuid4();
    }

    const dbResult = await this.search({ query });

    try {
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

      const instruction =
        'You are the chat assistant and speak with the user. You must answer user questions using the context';

      const conversation = this.buildConversationContext(
        sources,
        query,
        conversationId,
      );

      const modelResponse = await this.generator.generate<any>(
        '',
        conversation,
        instruction,
      );

      const answer = modelResponse?.candidates[0].content.parts[0].text ?? '';

      this.conversation.addMessage(conversationId, {
        role: 'model',
        content: answer,
      });

      return { answer, sources, conversationId };
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        throw new ServiceUnavailableException();
      }
      throw new InternalServerErrorException();
    }
  }

  async deletePointsById(id: string) {
    const point = await this.queryPointByArticleId(id);

    if (!point.exists) {
      throw new NotFoundException();
    }

    try {
      const response = await fetch(
        `${process.env.RAG_VECTOR_DB_URL}/collections/${process.env.RAG_VECTOR_COLLECTION}/points/delete`,
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
      if (error instanceof TypeError) {
        throw new ServiceUnavailableException();
      }
      throw new InternalServerErrorException();
    }
  }

  history(conversationId: string) {
    const history = this.conversation.getLastMessages(conversationId);
    return history;
  }

  private buildPrompt(source: any[], question: string) {
    return `
    CONTENT:
    ${source.map((data) => data.relevantChunk).join('\n')}
    
    QUESTION:
    ${question}
    `;
  }

  private buildConversationContext(
    source: any[],
    question: string,
    conversationId: string,
  ) {
    const prompt = this.buildPrompt(source, question);

    const historyLength =
      Number(process.env.RAG_CONVERSATION_MAX_MESSAGES) || 20;

    const history = this.conversation.getLastMessages(
      conversationId,
      historyLength,
    );

    const contextGemini = history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const content = [
      ...contextGemini,
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    this.conversation.addMessage(conversationId, {
      role: 'user',
      content: prompt,
    });

    return content;
  }

  private async queryPointByArticleId(id: string): Promise<any> {
    try {
      const response = await fetch(
        `${process.env.RAG_VECTOR_DB_URL}/collections/${process.env.RAG_VECTOR_COLLECTION}/points/query`,
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
            with_payload: true,
            with_vector: false,
          }),
        },
      );
      const data = await response.json();
      const exists = data.result.points.length > 0;
      return { exists, data };
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ServiceUnavailableException();
      }
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

  private rerankHeuristically(query: string, chunks) {
    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = this.tokenize(normalizedQuery);

    const reranked = chunks.map((chunk) => {
      let score = chunk.score;
      const text = chunk.payload.text?.toLowerCase() ?? '';
      const title = chunk.payload.title?.toLowerCase() ?? '';
      const tags = chunk.payload.tags ?? [];

      if (text.includes(normalizedQuery)) {
        score += 0.35;
      }

      if (title.includes(normalizedQuery)) {
        score += 0.3;
      }

      const textTokens = this.tokenize(text);

      const overlapCount = queryTokens.filter((token) =>
        textTokens.includes(token),
      ).length;

      score += overlapCount * 0.05;

      const normalizedTags = tags.map((t) => t.toLowerCase());

      const hasMatchingTag = queryTokens.some((token) =>
        normalizedTags.includes(token),
      );

      if (hasMatchingTag) {
        score += 0.2;
      }

      if (chunk.payload.chunk_index === 0) {
        score += 0.1;
      }

      return {
        ...chunk,

        rerankScore: score,
      };
    });

    return reranked.sort((a, b) => b.rerankScore - a.rerankScore);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }
}
