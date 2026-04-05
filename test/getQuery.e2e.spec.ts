import { request } from './lib';

import {
  usersRoutes,
  articlesRoutes,
  categoriesRoutes,
  commentsRoutes,
} from './endpoints';

describe('GET - pagination & sorting', () => {
  const api = request;
  const headers = { Accept: 'application/json' };

  const getData = (res) => (Array.isArray(res.body) ? res.body : res.body.data);

  const getOwnData = (data, ids) =>
    data.filter((item) => ids.includes(item.id));

  describe('ARTICLES', () => {
    it('should paginate articles', async () => {
      const created = await Promise.all(
        Array.from({ length: 6 }).map((_, i) =>
          api
            .post(articlesRoutes.create)
            .set(headers)
            .send({
              title: `ARTICLE_${i}`,
              content: 'Test',
              status: 'draft',
              authorId: null,
              categoryId: null,
              tags: [],
            }),
        ),
      );

      const res = await api
        .get(articlesRoutes.getAll)
        .query({ page: 1, limit: 5 })
        .set(headers);

      const data = getData(res);

      expect(data.length).toBe(5);

      const createdIds = created.map((c) => c.body.id);
      await Promise.all(
        createdIds.map((id) =>
          api.delete(articlesRoutes.delete(id)).set(headers),
        ),
      );
    });

    it('should sort articles by title asc', async () => {
      const created = await Promise.all(
        ['C', 'A', 'B'].map((title) =>
          api.post(articlesRoutes.create).set(headers).send({
            title,
            content: 'Test',
            status: 'draft',
            authorId: null,
            categoryId: null,
            tags: [],
          }),
        ),
      );

      const createdIds = created.map((c) => c.body.id);

      const res = await api
        .get(articlesRoutes.getAll)
        .query({ sortBy: 'title', order: 'asc' })
        .set(headers);

      const data = getData(res);

      const own = getOwnData(data, createdIds);

      const titles = own.map((a) => a.title);

      expect(titles).toEqual(['A', 'B', 'C']);

      await Promise.all(
        createdIds.map((id) =>
          api.delete(articlesRoutes.delete(id)).set(headers),
        ),
      );
    });
  });

  describe('CATEGORIES', () => {
    it('should paginate categories', async () => {
      const created = await Promise.all(
        Array.from({ length: 6 }).map((_, i) =>
          api
            .post(categoriesRoutes.create)
            .set(headers)
            .send({
              name: `CAT_${i}`,
              description: 'test',
            }),
        ),
      );

      const res = await api
        .get(categoriesRoutes.getAll)
        .query({ page: 1, limit: 5 })
        .set(headers);

      const data = getData(res);

      expect(data.length).toBe(5);

      await Promise.all(
        created.map((item) =>
          api.delete(categoriesRoutes.delete(item.body.id)).set(headers),
        ),
      );
    });

    it('should sort categories by name', async () => {
      const created = await Promise.all(
        ['C', 'A', 'B'].map((name) =>
          api.post(categoriesRoutes.create).set(headers).send({
            name,
            description: 'test',
          }),
        ),
      );

      const createdIds = created.map((c) => c.body.id);

      const res = await api
        .get(categoriesRoutes.getAll)
        .query({ sortBy: 'name', order: 'asc' })
        .set(headers);

      const data = getData(res);

      const own = getOwnData(data, createdIds);

      const names = own.map((c) => c.name);

      expect(names).toEqual(['A', 'B', 'C']);

      await Promise.all(
        createdIds.map((id) =>
          api.delete(categoriesRoutes.delete(id)).set(headers),
        ),
      );
    });
  });

  describe('COMMENTS', () => {
    it('should paginate comments by article', async () => {
      const article = await api.post(articlesRoutes.create).set(headers).send({
        title: 'ARTICLE',
        content: 'Test',
        status: 'draft',
        authorId: null,
        categoryId: null,
        tags: [],
      });

      const articleId = article.body.id;

      const created = await Promise.all(
        Array.from({ length: 6 }).map((_, i) =>
          api
            .post(commentsRoutes.create)
            .set(headers)
            .send({
              content: `COMMENT_${i}`,
              articleId,
              authorId: null,
            }),
        ),
      );

      const res = await api
        .get(commentsRoutes.getByArticle(articleId))
        .query({ page: 1, limit: 5 })
        .set(headers);

      const data = getData(res);

      expect(data.length).toBe(5);

      await Promise.all(
        created.map((item) =>
          api.delete(commentsRoutes.delete(item.body.id)).set(headers),
        ),
      );

      await api.delete(articlesRoutes.delete(articleId)).set(headers);
    });
  });

  describe('USERS', () => {
    it('should paginate users', async () => {
      const created = await Promise.all(
        Array.from({ length: 6 }).map((_, i) =>
          api
            .post(usersRoutes.create)
            .set(headers)
            .send({
              login: `user_${i}`,
              password: '123456',
            }),
        ),
      );

      const res = await api
        .get(usersRoutes.getAll)
        .query({ page: 1, limit: 5 })
        .set(headers);

      const data = getData(res);

      expect(data.length).toBe(5);

      await Promise.all(
        created.map((item) =>
          api.delete(usersRoutes.delete(item.body.id)).set(headers),
        ),
      );
    });

    it('should sort users by login', async () => {
      const created = await Promise.all(
        ['C', 'A', 'B'].map((login) =>
          api.post(usersRoutes.create).set(headers).send({
            login,
            password: '123456',
          }),
        ),
      );

      const createdIds = created.map((c) => c.body.id);

      const res = await api
        .get(usersRoutes.getAll)
        .query({ sortBy: 'login', order: 'asc' })
        .set(headers);

      const data = getData(res);

      const own = getOwnData(data, createdIds);

      const logins = own.map((u) => u.login);

      expect(logins).toEqual(['A', 'B', 'C']);

      await Promise.all(
        createdIds.map((id) => api.delete(usersRoutes.delete(id)).set(headers)),
      );
    });
  });
});
