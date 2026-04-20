import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { Article } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { CreateArticleDto, GetArticlesQueryDto } from './articles.dto';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { JwtPayload } from 'src/shared/types/auth.types';

@Injectable()
export class ArticlesService {
  constructor(
    private repo: ArticlesRepository,
    private inMemoSharedRepo: InMemoSharedRepo,
  ) {}

  getAllArticles(getArticlesQueryDto: GetArticlesQueryDto) {
    const articles = [...this.repo.findAll(getArticlesQueryDto)];

    const sortBy = getArticlesQueryDto.sortBy ?? 'createdAt';
    const order = getArticlesQueryDto.order ?? 'desc';

    articles.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }

      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    if (!getArticlesQueryDto.page && !getArticlesQueryDto.limit) {
      return articles;
    }

    const page = getArticlesQueryDto.page ?? 1;
    const limit = getArticlesQueryDto.limit ?? 5;

    const offset = (page - 1) * limit;
    const data = articles.slice(offset, offset + limit);
    const total = data.length;

    return { data: data, total: total, page: page, limit: limit };
  }

  createArticle(createArticleDto: CreateArticleDto) {
    const createdArticle = {} as Article;
    const currentTimestamp = Date.now();

    createdArticle.id = randomUUID();
    createdArticle.title = createArticleDto.title;
    createdArticle.content = createArticleDto.content;
    createdArticle.status = createArticleDto.status || 'draft';
    createdArticle.authorId = createArticleDto.authorId || null;
    createdArticle.categoryId = createArticleDto.categoryId || null;
    createdArticle.tags = createArticleDto.tags || [];
    createdArticle.createdAt = currentTimestamp;
    createdArticle.updatedAt = currentTimestamp;

    this.repo.create(createdArticle);

    return createdArticle;
  }

  findArticle(id: string) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }
    return article;
  }

  deleteArticle(id: string) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }

    const articleComments = this.inMemoSharedRepo.findAllCommentsForArticle(id);

    articleComments.forEach((comment) =>
      this.inMemoSharedRepo.deleteComment(comment.id),
    );

    this.repo.delete(id);
  }

  updateArticle(id: string, createArticleDto: CreateArticleDto) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundException();
    }

    article.title = createArticleDto.title;
    article.content = createArticleDto.content;
    article.status = createArticleDto.status || 'draft';
    article.authorId = createArticleDto.authorId || null;
    article.categoryId = createArticleDto.categoryId || null;
    article.tags = createArticleDto.tags || [];
    article.updatedAt = Date.now();

    return article;
  }
}

@Injectable()
export class ArticlesPrismaPsService {
  constructor(private prisma: PrismaService) {}

  async getAllArticles(query: GetArticlesQueryDto) {
    const {
      status,
      categoryId,
      tag,
      sortBy = 'createdAt',
      order = 'desc',
      page,
      limit,
    } = query;

    const where: Prisma.ArticleWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(tag && {
        tags: {
          some: {
            name: tag,
          },
        },
      }),
    };

    const orderBy = {
      [sortBy]: order,
    };

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          author: true,
          category: true,
          tags: true,
          comments: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data,
      total,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
  }

  async createArticle(dto: CreateArticleDto, userId: string) {
    return this.prisma.article.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        content: dto.content,
        status: dto.status ?? 'draft',
        authorId: userId,
        tags: {
          connectOrCreate: dto.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  }

  async findArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: true,
        comments: true,
      },
    });

    if (!article) {
      throw new NotFoundException();
    }

    return article;
  }

  async deleteArticle(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({
        where: { id },
      });

      if (!article) {
        throw new NotFoundException();
      }

      const deleted = await tx.article.delete({
        where: { id },
      });

      return deleted;
    });
  }

  async updateArticle(id: string, dto: CreateArticleDto, user: JwtPayload) {
    return this.prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({
        where: { id },
      });

      if (!article) {
        throw new NotFoundException();
      }

      if (user.role !== 'admin' && user.userId !== article.authorId) {
        throw new ForbiddenException();
      }

      const updated = await tx.article.update({
        where: { id },
        data: {
          title: dto.title,
          content: dto.content,
          status: dto.status ?? 'draft',
          authorId: dto.authorId ?? null,
          categoryId: dto.categoryId ?? null,

          tags: dto.tags
            ? {
                set: [],
                connectOrCreate: dto.tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              }
            : undefined,
        },
      });

      return updated;
    });
  }
}
