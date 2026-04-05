import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './categories.dto';

@Controller('category')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return this.categoriesService.getAllCategories();
  }

  @Post()
  async create(@Body() createCaregoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCaregoryDto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findCategory(id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.categoriesService.deleteCategory(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createCaregoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, createCaregoryDto);
  }
}
