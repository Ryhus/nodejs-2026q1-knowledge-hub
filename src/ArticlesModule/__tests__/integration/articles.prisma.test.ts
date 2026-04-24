import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArticlesPrismaPsService } from 'src/ArticlesModule/articles.service';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

const prismaMock = {
  article: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

let service: ArticlesPrismaPsService;

describe('ArticlesPrismaPsService (Nest)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ArticlesPrismaPsService,

        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ArticlesPrismaPsService);
  });

  describe('getAllArticles', () => {
    it('should return non-paginated result', async () => {
      prismaMock.article.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await service.getAllArticles({});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return paginated data', async () => {
      prismaMock.$transaction.mockResolvedValue([[{ id: 1 }], 5]);

      const result = await service.getAllArticles({ page: 1 });

      if (!Array.isArray(result)) {
        expect(result.data.length).toBe(1);
        expect(result.page).toBe(1);
      }
    });
  });

  describe('createArticle', () => {
    it('should create article with tags', async () => {
      prismaMock.article.create.mockResolvedValue({
        id: '1',
        tags: [{ name: 't1' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createArticle({
        title: 't',
        content: 'c',
        tags: ['t1'],
      } as any);

      expect(result.tags).toEqual(['t1']);
    });

    it('should create article without tags', async () => {
      prismaMock.article.create.mockResolvedValue({
        id: '1',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createArticle({
        title: 't',
        content: 'c',
      } as any);

      expect(result.tags).toEqual([]);
    });
  });

  describe('findArticle', () => {
    it('should return article', async () => {
      prismaMock.article.findUnique.mockResolvedValue({
        id: '1',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.findArticle('1');

      expect(result.id).toBe('1');
    });

    it('should throw if not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.findArticle('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if article not found', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.findArticle('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteArticle', () => {
    it('should throw when deleting non-existing article', async () => {
      prismaMock.article.findUnique.mockResolvedValue(null);

      await expect(service.deleteArticle('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateArticle', () => {
    it('should throw Forbidden if not owner and not admin', async () => {
      prismaMock.article.findUnique.mockResolvedValue({
        authorId: 'owner',
      });

      await expect(
        service.updateArticle(
          '1',
          {} as any,
          { userId: 'other', role: 'user' } as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner', async () => {
      prismaMock.article.findUnique.mockResolvedValue({
        authorId: '1',
      });

      prismaMock.article.update.mockResolvedValue({
        id: '1',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateArticle(
        '1',
        {} as any,
        { userId: '1', role: 'user' } as any,
      );

      expect(result.id).toBe('1');
    });
  });

  it('should throw if article not found', async () => {
    prismaMock.article.findUnique.mockResolvedValue(null);

    await expect(
      service.updateArticle('1', {} as any, {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update with tags', async () => {
    prismaMock.article.findUnique.mockResolvedValue({
      authorId: '1',
    });

    prismaMock.article.update.mockResolvedValue({
      id: '1',
      tags: [{ name: 'tag1' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.updateArticle(
      '1',
      { tags: ['tag1'] } as any,
      { userId: '1', role: 'user' } as any,
    );

    expect(result.tags).toEqual(['tag1']);
  });
});
