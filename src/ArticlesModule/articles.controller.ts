import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ArticlesPrismaPsService } from './articles.service';
import {
  CreateArticleDto,
  GetArticlesQueryDto,
} from './dto/articles-request.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'generated/prisma/enums';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';
import {
  ArticleResponseDto,
  GetArticlesResponseDto,
} from './dto/articles-response.dto';

@ApiTags('article')
@Controller('article')
@ApiBearerAuth('access-token')
export class ArticlesController {
  constructor(private articlesService: ArticlesPrismaPsService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  @ApiOperation({
    summary: 'Get list of articles',
    description:
      'Returns list of articles.Paginateion, filtration and sorting can be applied. All users can get articles',
  })
  @ApiOkResponse({
    type: GetArticlesResponseDto,
    description:
      'Returns the object with list of articles and pagination parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  async getAll(@Query() query: GetArticlesQueryDto) {
    return this.articlesService.getAllArticles(query);
  }

  @Roles(Role.admin, Role.editor)
  @Post()
  @ApiOperation({
    summary: 'Create the new article',
    description: 'Only admin and editor can create articles',
  })
  @ApiCreatedResponse({
    type: ArticleResponseDto,
    description: 'Resource created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.createArticle(createArticleDto);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  @ApiOperation({
    summary: 'Find article by ID',
    description: 'All users can get articles',
  })
  @ApiParam({ name: 'id', example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91' })
  @ApiOkResponse({
    type: ArticleResponseDto,
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
    const article = await this.articlesService.findArticle(id);
    return article;
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete article by ID',
    description: 'Only admin can delete the article',
  })
  @ApiParam({ name: 'id', example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91' })
  @ApiNoContentResponse({ description: 'Resource deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articlesService.deleteArticle(id);
  }

  @Roles(Role.admin, Role.editor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update the article',
    description: 'Only admin or the author can update the article',
  })
  @ApiOkResponse({ description: 'Request successful' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  @ApiForbiddenResponse({ description: 'Forbidden. Insufficient permissions' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.articlesService.updateArticle(id, createArticleDto, user);
  }
}
