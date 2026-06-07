import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import {
  CreateArticleDto,
  GetArticlesQueryDto,
} from 'src/ArticlesModule/articles.dto';
import { plainToInstance } from 'class-transformer';
import { Status } from 'generated/prisma/enums';

describe('CreateArticleDto', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Title';
    dto.content = 'Content';
    dto.status = Status.published;
    dto.authorId = '550e8400-e29b-41d4-a716-446655440000';
    dto.categoryId = '550e8400-e29b-41d4-a716-446655440001';
    dto.tags = ['tag1', 'tag2'];

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when title is missing', async () => {
    const dto = new CreateArticleDto();
    dto.content = 'Content';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid status', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Title';
    dto.content = 'Content';
    dto.status = 'invalid' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid authorId', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Title';
    dto.content = 'Content';
    dto.authorId = 'not-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when tags is not array', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Title';
    dto.content = 'Content';
    dto.tags = 'not-array' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when tags are not unique', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Title';
    dto.content = 'Content';
    dto.tags = ['tag1', 'tag1'];

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('GetArticlesQueryDto', () => {
  it('should pass with valid query', async () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      status: Status.draft,
      page: '1',
      limit: '10',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid status', async () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      status: 'invalid',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid categoryId', async () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      categoryId: 'wrong-id',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid sortBy', async () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      sortBy: 'wrong-field',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when page < 1', async () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      page: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should transform page and limit to numbers', () => {
    const dto = plainToInstance(GetArticlesQueryDto, {
      page: '2',
      limit: '5',
    });

    expect(typeof dto.page).toBe('number');
    expect(typeof dto.limit).toBe('number');
  });
});
