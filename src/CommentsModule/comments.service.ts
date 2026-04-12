import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { randomUUID } from 'node:crypto';
import { createCommentDto, GetCommentsByArticleDto } from './comments.dto';
import type { Comment } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { PrismaService } from 'src/PrismaModule/prisma.service';

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
      throw new UnprocessableEntityException();
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
      throw new NotFoundException();
    }

    this.commentRepo.delete(id);
  }

  findComment(id: string) {
    const comment = this.commentRepo.findById(id);
    if (!comment) {
      throw new NotFoundException();
    }
    return comment;
  }
}

@Injectable()
export class CommentPrismaPsService {
  constructor(private prisma: PrismaService) {}

  async getAllComments(dto: GetCommentsByArticleDto) {
    const {
      articleId,
      sortBy = 'createdAt',
      order = 'desc',
      page,
      limit,
    } = dto;

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

    return this.prisma.comment.create({
      data: {
        id: randomUUID(),
        content: dto.content,
        articleId: dto.articleId,
        authorId: dto.authorId ?? null,
      },
    });
  }

  async deleteComment(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException();
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
      throw new NotFoundException();
    }

    return comment;
  }
}
