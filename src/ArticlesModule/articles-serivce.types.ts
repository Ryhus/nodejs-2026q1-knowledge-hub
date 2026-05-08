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
