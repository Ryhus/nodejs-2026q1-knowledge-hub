import { Status } from 'generated/prisma/enums';
import type {
  SortingArticleFields,
  SortingOrder,
} from 'src/shared/enums/enums';

export type ArticlesFiltersInput = {
  status?: Status;
  categoryId?: string;
  tag?: string;
  sortBy?: SortingArticleFields;
  order?: SortingOrder;
  page?: number;
  limit?: number;
  ids?: string[];
};

export type ArticleResult = {
  id: string;
  title: string;
  content: string;
  status: Status;
  authorId: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { name: string };
  tags?: string[];
};
