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
import {
  CreateCategoryDto,
  GetCategoriesQueryDto,
} from './dto/categories-request.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import {
  GetCategoriesResponse,
  CategoryResponseDto,
} from './dto/categories-response.dto';

@ApiTags('category')
@Controller('category')
@ApiBearerAuth('access-token')
export class CategoriesController {
  constructor(private categoriesService: CategoriesPrismaPsService) {}

  @Get()
  @Roles(Role.admin, Role.viewer, Role.editor)
  @ApiOperation({
    summary: 'Get categories',
    description:
      'Retrieves object with paginated list of categories, total categories, page number and limit. Supports optional sorting and pagination via query parameters. All users can get categories',
  })
  @ApiOkResponse({
    type: GetCategoriesResponse,
    description: 'Returns object with paginated list of categories',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  async getAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoriesService.getAllCategories(query);
  }

  @Post()
  @Roles(Role.admin)
  @ApiOperation({
    summary: 'Create new category',
    description:
      'New category creation. Only admin can create the new category',
  })
  @ApiCreatedResponse({
    type: CategoryResponseDto,
    description: 'Resource created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  async create(@Body() createCaregoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCaregoryDto);
  }

  @Get(':id')
  @Roles(Role.admin, Role.viewer, Role.editor)
  @ApiParam({ name: 'id', example: '650e8400-e29b-41d4-a716-446655440001' })
  @ApiOperation({
    summary: 'Find category by ID',
    description: 'Get some category by ID. All users can get the category',
  })
  @ApiOkResponse({
    type: CategoryResponseDto,
    description: 'Request successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findCategory(id);
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  @ApiParam({ name: 'id', example: '650e8400-e29b-41d4-a716-446655440001' })
  @ApiOperation({
    summary: 'Delete category by ID',
    description: 'Delete specific category. Only admin can delete the category',
  })
  @ApiNoContentResponse({ description: 'Resource deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @Roles(Role.admin)
  @Put(':id')
  @ApiParam({ name: 'id', example: '650e8400-e29b-41d4-a716-446655440001' })
  @ApiOkResponse({
    type: CategoryResponseDto,
    description: 'Request successful',
  })
  @ApiOperation({
    summary: 'Update category by ID',
    description: 'Apdate some category. Only admin can update the category',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createCaregoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, createCaregoryDto);
  }
}
