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
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';

@ApiTags('category')
@Controller('category')
export class CategoriesController {
  constructor(private categoriesService: CategoriesPrismaPsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  async getAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.getAllCategories(query);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createCaregoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCaregoryDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.VIEWER, Role.EDITOR)
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findCategory(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createCaregoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, createCaregoryDto);
  }
}
