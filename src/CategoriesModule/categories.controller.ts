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
  Query,
} from '@nestjs/common';
import { CategoriesPrismaPsService } from './categories.service';
import { CreateCategoryDto, GetCategoriesQueryDto } from './categories.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('category')
@Controller('category')
export class CategoriesController {
  constructor(private categoriesService: CategoriesPrismaPsService) {}

  @Get()
  async getAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.getAllCategories(query);
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
