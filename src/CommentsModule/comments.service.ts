import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommentRepository } from './comments.repository';
import { randomUUID } from 'node:crypto';
import { createCommentDto } from './comments.dto';
import type { Comment } from 'src/inmemoryDB/types';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';

@Injectable()
export class CommentService {
  constructor(
    private commentRepo: CommentRepository,
    private inMemoSharedRepo: InMemoSharedRepo,
  ) {}

  getAllComments(articleId: string) {
    return this.commentRepo.findAllCommentsForArticle(articleId);
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
