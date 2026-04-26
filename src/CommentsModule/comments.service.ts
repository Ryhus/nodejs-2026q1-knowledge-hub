import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { randomUUID } from 'node:crypto';
import { createCommentDto, GetCommentsByArticleDto } from './comments.dto';
import type { Comment } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { JwtPayload } from 'src/shared/types/auth.types';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/shared/exceptions/customErrors';
import { UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor(
    private commentRepo: CommentRepository,
    private inMemoSharedRepo: InMemoSharedRepo,
  ) {}

  getAllComments(getCommentByArticleDto: GetCommentsByArticleDto) {
    const commentsForArticle = [
      ...this.commentRepo.findAllCommentsForArticle(
        getCommentByArticleDto.articleId,
      ),
    ];

    const sortBy = getCommentByArticleDto.sortBy ?? 'createdAt';
    const order = getCommentByArticleDto.order ?? 'desc';

    commentsForArticle.sort((a, b) => {
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

    if (!getCommentByArticleDto.page && !getCommentByArticleDto.limit) {
      return commentsForArticle;
    }

    const page = getCommentByArticleDto.page ?? 1;
    const limit = getCommentByArticleDto.limit ?? 5;

    const offset = (page - 1) * limit;
    const data = commentsForArticle.slice(offset, offset + limit);
    const total = data.length;
    return { data: data, total: total, page: page, limit: limit };
  }

  createComment(createCommentDto: createCommentDto) {
    const article = this.inMemoSharedRepo.findArticleById(
      createCommentDto.articleId,
    );
    if (!article) {
      throw new NotFoundError();
    }

    const createdComment = {} as Comment;
    const currentTimestamp = Date.now();

    createdComment.id = randomUUID();
    createdComment.content = createCommentDto.content;
    createdComment.articleId = createCommentDto.articleId;
    createdComment.authorId = createCommentDto.authorId || null;

    createdComment.createdAt = currentTimestamp;

    this.commentRepo.create(createdComment);

    return createdComment;
  }

  deleteComment(id: string) {
    const comment = this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundError();
    }

    this.commentRepo.delete(id);
  }

  findComment(id: string) {
    const comment = this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundError();
    }
    return comment;
  }
}

@Injectable()
export class CommentPrismaPsService {
  constructor(private prisma: PrismaService) {}

  async getAllComments(dto: GetCommentsByArticleDto) {
    let isPaginate = false;
    if (dto.page || dto.limit) {
      isPaginate = true;
    }

    const {
      articleId,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 5,
    } = dto;

    if (!isPaginate) {
      const commentsByArticle = await this.prisma.comment.findMany({
        where: { articleId },
        orderBy: {
          [sortBy]: order,
        },
        include: {
          author: true,
        },
      });

      return commentsByArticle;
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: { articleId },
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take,
        include: {
          author: true,
        },
      }),
      this.prisma.comment.count({
        where: { articleId },
      }),
    ]);

    return {
      data,
      total,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
  }

  async createComment(dto: createCommentDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
    });

    if (!article) {
      throw new UnprocessableEntityException('Article not found');
    }

    const createdComment = await this.prisma.comment.create({
      data: {
        id: randomUUID(),
        content: dto.content,
        articleId: dto.articleId,
        authorId: dto.authorId ?? null,
      },
    });
    return {
      ...createdComment,
      createdAt: createdComment.createdAt.getTime(),
    };
  }

  async deleteComment(id: string, user: JwtPayload) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundError();
    }

    if (user.role !== 'admin' && user.userId !== comment.authorId) {
      throw new ForbiddenError();
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }

  async findComment(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        article: true,
      },
    });

    if (!comment) {
      throw new NotFoundError();
    }

    return comment;
  }
}
