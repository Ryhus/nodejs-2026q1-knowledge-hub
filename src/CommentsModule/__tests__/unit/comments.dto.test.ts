import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import {
  CreateCommentDto,
  GetCommentsByArticleDto,
} from 'src/CommentsModule/dto/comments-request.dto';
import { SortingOrder } from 'src/CommentsModule/dto/comments-request.dto';
import { SortingCommentFields } from 'src/CommentsModule/dto/comments-request.dto';
import { plainToInstance } from 'class-transformer';

describe('createCommentDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'hello';
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when content is missing', async () => {
    const dto = new CreateCommentDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when articleId is not UUID', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'text';
    dto.articleId = 'invalid-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass without authorId', async () => {
    const dto = new CreateCommentDto();
    dto.content = 'text';
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});

describe('GetCommentsByArticleDto', () => {
  it('should pass with valid data', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';
    dto.page = 1;
    dto.limit = 10;
    dto.sortBy = SortingCommentFields.createdAt;
    dto.order = SortingOrder.ASC;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail without articleId', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.page = 1;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid sortBy enum', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';
    dto.sortBy = 'invalid' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid order enum', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';
    dto.order = 'wrong' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when page < 1', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';
    dto.page = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when limit < 1', async () => {
    const dto = new GetCommentsByArticleDto();
    dto.articleId = '550e8400-e29b-41d4-a716-446655440000';
    dto.limit = 0;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
  it('should transform page from string to number and pass validation', async () => {
    const dto = plainToInstance(GetCommentsByArticleDto, {
      articleId: '550e8400-e29b-41d4-a716-446655440000',
      page: '1',
      limit: '10',
    });

    const errors = await validate(dto);

    expect(dto.page).toBe(1);
    expect(typeof dto.page).toBe('number');
    expect(errors.length).toBe(0);
  });

  it('should fail when page < 1', async () => {
    const dto = plainToInstance(GetCommentsByArticleDto, {
      articleId: '550e8400-e29b-41d4-a716-446655440000',
      page: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
