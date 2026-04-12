import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { Category } from 'src/inmemoryDB/types';
import { randomUUID } from 'node:crypto';
import { CreateCategoryDto, GetCategoriesQueryDto } from './categories.dto';
import { ArticlesRepository } from 'src/ArticlesModule/articles.repository';
import { PrismaService } from 'src/PrismaModule/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private categoriesRepo: CategoriesRepository,
    private articlesRepo: ArticlesRepository,
  ) {}

  getAllCategories(getCategoriesQueryDto: GetCategoriesQueryDto) {
    const categories = [...this.categoriesRepo.findAll()];

    const sortBy = getCategoriesQueryDto.sortBy ?? 'name';
    const order = getCategoriesQueryDto.order ?? 'desc';

    categories.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }

      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    if (!getCategoriesQueryDto.page && !getCategoriesQueryDto.limit) {
      return categories;
    }

    const page = getCategoriesQueryDto.page ?? 1;
    const limit = getCategoriesQueryDto.limit ?? 5;

    const offset = (page - 1) * limit;
    const data = categories.slice(offset, offset + limit);
    const total = data.length;

    return { data: data, total: total, page: page, limit: limit };
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

@Injectable()
export class CategoriesPrismaPsService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories(query: GetCategoriesQueryDto) {
    const { sortBy = 'name', order = 'desc', page, limit } = query;

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const categories = await this.prisma.category.findMany({
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take,
    });

    const total = await this.prisma.category.count();

    return {
      data: categories,
      total,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        articles: true,
      },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException();
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }
}
