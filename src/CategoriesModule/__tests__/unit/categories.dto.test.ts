import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateCategoryDto,
  GetCategoriesQueryDto,
  SortingCategories,
  SortingOrder,
} from 'src/CategoriesModule/categories.dto';

describe('CreateCategoryDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 'Tech',
      description: 'Technology category',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when name is missing', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      description: 'desc',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when name is not string', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 123,
      description: 'desc',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('GetCategoriesQueryDto', () => {
  it('should pass with valid query params', async () => {
    const dto = plainToInstance(GetCategoriesQueryDto, {
      sortBy: SortingCategories.NAME,
      order: SortingOrder.ASC,
      page: '1',
      limit: '10',
    });

    const errors = await validate(dto);

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid sortBy enum', async () => {
    const dto = plainToInstance(GetCategoriesQueryDto, {
      sortBy: 'invalid',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid order enum', async () => {
    const dto = plainToInstance(GetCategoriesQueryDto, {
      order: 'wrong',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when page is 0', async () => {
    const dto = plainToInstance(GetCategoriesQueryDto, {
      page: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when limit is 0', async () => {
    const dto = plainToInstance(GetCategoriesQueryDto, {
      limit: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
