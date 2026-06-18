import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CommentPrismaPsService } from './comments.service';
import {
  CreateCommentDto,
  GetCommentsByArticleDto,
} from './dto/comments-request.dto';
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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';
import {
  GetCommentsResponseDto,
  CommentResponseDto,
} from './dto/comments-response.dto';

@ApiTags('comment')
@Controller('comment')
@ApiBearerAuth('access-token')
export class CommentController {
  constructor(private commentService: CommentPrismaPsService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  @ApiOperation({
    summary: 'Get paginated object with list of comments',
    description:
      'Retrieves object with paginated list of comments, total comments, page number and limit. Supports optional sorting, filtering and pagination via query parameters. All users can get comments',
  })
  @ApiOkResponse({
    type: GetCommentsResponseDto,
    description:
      'Returns the object with list of comments and pagination parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  async getByArticle(@Query() query: GetCommentsByArticleDto) {
    return this.commentService.getAllComments(query);
  }

  @Roles(Role.admin, Role.editor)
  @Post()
  @ApiOperation({
    summary: 'Create the new comment for the article',
    description:
      'Creation of the new comment. Only admin and editor can create the comment',
  })
  @ApiCreatedResponse({
    type: CommentResponseDto,
    description: 'Resource created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Can not process requested entity',
  })
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  @ApiOperation({
    summary: 'Find comment by ID',
    description: 'All users can get comments',
  })
  @ApiParam({ name: 'id', example: '8d25a2e3-1f33-4d3b-89eb-435e4e9a0074' })
  @ApiOkResponse({
    type: CommentResponseDto,
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
    return this.commentService.findComment(id);
  }

  @Roles(Role.admin, Role.editor)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete comment by ID',
    description: 'Only admin and editor can delete the comments',
  })
  @ApiParam({ name: 'id', example: '8d25a2e3-1f33-4d3b-89eb-435e4e9a0074' })
  @ApiNoContentResponse({ description: 'Resource deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.deleteComment(id, user);
  }
}
