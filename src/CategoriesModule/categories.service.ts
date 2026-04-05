import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from 'src/inmemoryDB/types';
import { randomUUID } from 'node:crypto';
import { CreateCategoryDto } from './categories.dto';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private categoriesRepo: CategoriesRepository,
    private articlesRepo: ArticlesRepository,
  ) {}

  getAllCategories() {
    const categories = this.categoriesRepo.findAll();

    return categories;
  }

  createCategory(createCategoryDto: CreateCategoryDto) {
    const category = {} as Category;

    category.id = randomUUID();
    category.name = createCategoryDto.name;
    category.description = createCategoryDto.description;

    this.categoriesRepo.create(category);

    return category;
  }

  findCategory(id: string) {
    const category = this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  deleteCategory(id: string) {
    const category = this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException();
    }

    const articles = this.articlesRepo.findAll({ categoryId: id });
    articles.forEach((article) => (article.categoryId = null));

    this.categoriesRepo.delete(id);
  }

  updateCategory(id: string, createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException();
    }
    category.name = createCategoryDto.name;
    category.description = createCategoryDto.description;

    return category;
  }
}
