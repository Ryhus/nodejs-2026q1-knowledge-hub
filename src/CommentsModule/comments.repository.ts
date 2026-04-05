import { Injectable } from '@nestjs/common';
import { InMemoryDb } from 'src/inmemoryDB/inmemorydb';
import type { Comment } from 'src/inmemoryDB/types';

@Injectable()
export class CommentRepository {
  constructor(private readonly db: InMemoryDb) {}

  create(comment: Comment) {
    this.db.comments.push(comment);
  }

  findAllCommentsForArticle(articleId: string) {
    const commentsForArticle = this.db.comments.filter(
      (comment) => comment.articleId === articleId,
    );

    return commentsForArticle;
  }

  delete(id: string) {
    this.db.comments = this.db.comments.filter((comment) => comment.id !== id);
  }

  findById(id: string) {
    return this.db.comments.find((comment) => comment.id === id);
  }

  findByAutorId(authorId: string) {
    return this.db.comments.filter((comment) => comment.authorId === authorId);
  }
}
