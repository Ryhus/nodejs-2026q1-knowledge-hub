import { Injectable } from '@nestjs/common';
import { ArticlesRepository } from './articles.repository';
import { Article } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { CreateArticleDto, GetArticlesQueryDto } from './articles.dto';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { JwtPayload } from 'src/shared/types/auth.types';
import {
  NotFoundError,
  ForbiddenError,
} from 'src/shared/exceptions/customErrors';
import { ArticlesFiltersInput } from './articles-serivce.types';

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
      throw new NotFoundError();
    }
    return article;
  }

  deleteArticle(id: string) {
    const article = this.repo.findById(id);
    if (!article) {
      throw new NotFoundError();
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
      throw new NotFoundError();
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

  async getAllArticles(params: ArticlesFiltersInput) {
    let isPaginate = false;
    if (params.page || params.limit) {
      isPaginate = true;
    }

    const {
      ids,
      status,
      categoryId,
      tag,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 5,
    } = params;

    const where: Prisma.ArticleWhereInput = {
      ...(ids?.length && {
        id: {
          in: ids,
        },
      }),
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

    if (!isPaginate) {
      const articles = await this.prisma.article.findMany({
        where,
        orderBy,
        include: {
          tags: {
            select: {
              name: true,
            },
          },
          category: { select: { name: true } },
        },
      });
      return articles.map((a) => ({
        ...a,
        tags: a.tags.map((t) => t.name),
      }));
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take,
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

  async createArticle(dto: CreateArticleDto) {
    const createdArticle = await this.prisma.article.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        content: dto.content,
        status: dto.status ?? 'draft',
        authorId: dto.authorId,
        categoryId: dto.categoryId,
        tags: dto.tags?.length
          ? {
              connectOrCreate: dto.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },

      include: {
        tags: true,
      },
    });

    return {
      ...createdArticle,
      tags: createdArticle.tags.map((tag) => tag.name),
      createdAt: createdArticle.createdAt.getTime(),
      updatedAt: createdArticle.updatedAt.getTime(),
    };
  }

  async findArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!article) {
      throw new NotFoundError();
    }

    return {
      ...article,
      tags: article.tags.map((tag) => tag.name),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundError();
    }
    const deleted = await this.prisma.article.delete({
      where: { id },
    });

    return deleted;
  }

  async updateArticle(id: string, dto: CreateArticleDto, user: JwtPayload) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundError();
    }

    if (user.role !== 'admin' && user.userId !== article.authorId) {
      throw new ForbiddenError();
    }

    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? 'draft',
        authorId: dto.authorId ?? null,
        categoryId: dto.categoryId ?? null,

        tags: dto.tags?.length
          ? {
              connectOrCreate: dto.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    return {
      ...updatedArticle,
      tags: updatedArticle.tags.map((tag) => tag.name),
      createdAt: updatedArticle.createdAt.getTime(),
      updatedAt: updatedArticle.updatedAt.getTime(),
    };
  }
}
