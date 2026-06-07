import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticlesService } from 'src/ArticlesModule/articles.service';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';
import { InMemoSharedRepo } from 'src/inmemoryDB/shared.repository';
import { NotFoundError } from 'src/shared/exceptions/customErrors';

const repoMock = {
  findAll: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  delete: vi.fn(),
};

const sharedRepoMock = {
  findAllCommentsForArticle: vi.fn(),
  deleteComment: vi.fn(),
};

let service: ArticlesService;

describe('ArticlesService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: ArticlesRepository, useValue: repoMock },
        { provide: InMemoSharedRepo, useValue: sharedRepoMock },
      ],
    }).compile();

    service = module.get(ArticlesService);
  });

  describe('createArticle', () => {
    it('should create article with defaults', () => {
      const dto = { title: 't', content: 'c' };

      repoMock.create.mockImplementation((a) => a);

      const result = service.createArticle(dto as any);

      expect(result.status).toBe('draft');
      expect(result.tags).toEqual([]);
    });

    describe('findArticle', () => {
      it('should return article', () => {
        repoMock.findById.mockReturnValue({ id: '1' });

        const result = service.findArticle('1');

        expect(result.id).toBe('1');
      });

      it('should throw if not found', () => {
        repoMock.findById.mockReturnValue(null);

        expect(() => service.findArticle('1')).toThrow(NotFoundError);
      });
    });
  });

  describe('deleteArticle', () => {
    it('should delete article and its comments', () => {
      repoMock.findById.mockReturnValue({ id: '1' });

      sharedRepoMock.findAllCommentsForArticle.mockReturnValue([
        { id: 'c1' },
        { id: 'c2' },
      ]);

      service.deleteArticle('1');

      expect(sharedRepoMock.deleteComment).toHaveBeenCalledWith('c1');
      expect(sharedRepoMock.deleteComment).toHaveBeenCalledWith('c2');
      expect(repoMock.delete).toHaveBeenCalledWith('1');
    });

    it('should throw if article not found', () => {
      repoMock.findById.mockReturnValue(null);

      expect(() => service.deleteArticle('1')).toThrow(NotFoundError);
    });
  });

  describe('updateArticle', () => {
    it('should update article', () => {
      const article = { updatedAt: 0 };

      repoMock.findById.mockReturnValue(article);

      const result = service.updateArticle('1', {
        title: 'new',
        content: 'new',
      } as any);

      expect(result.title).toBe('new');
    });

    it('should throw if not found', () => {
      repoMock.findById.mockReturnValue(null);

      expect(() => service.updateArticle('1', {} as any)).toThrow(
        NotFoundError,
      );
    });
  });

  describe('getAllArticles', () => {
    it('should return array without pagination', () => {
      repoMock.findAll.mockReturnValue([{ createdAt: 2 }, { createdAt: 1 }]);

      const result = service.getAllArticles({});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return paginated result', () => {
      repoMock.findAll.mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = service.getAllArticles({ page: 1, limit: 2 });

      if (!Array.isArray(result)) {
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBe(2);
      }
    });
  });
});
