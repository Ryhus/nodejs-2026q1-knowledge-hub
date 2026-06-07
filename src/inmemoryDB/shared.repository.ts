import { Injectable } from '@nestjs/common';
import { InMemoryDb } from './inmemorydb';

@Injectable()
export class InMemoSharedRepo {
  constructor(private readonly db: InMemoryDb) {}

  findCommentByAutorId(authorId: string) {
    return this.db.comments.filter((comment) => comment.authorId === authorId);
  }

  findArticleById(articleId: string) {
    return this.db.articles.find((article) => article.id === articleId);
  }

  findAllCommentsForArticle(articleId: string) {
    const commentsForArticle = this.db.comments.filter(
      (comment) => comment.articleId === articleId,
    );

    return commentsForArticle;
  }

  deleteComment(id: string) {
    this.db.comments = this.db.comments.filter((comment) => comment.id !== id);
  }
}
