export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SortingOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortingArticleFields {
  AUTHORID = 'authorId',
  CATEGORYID = 'categoryID',
  TITLE = 'title',
  STATUS = 'status',
  CREATEDAT = 'createdAt',
  UPDATEDAT = 'updatedAt',
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  viewer = 'viewer',
}
