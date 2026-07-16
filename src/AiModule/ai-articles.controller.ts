import {
  Controller,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AiService } from './ai.service';
import {
  SummarizeArticleDto,
  TranslateArticleDto,
  AnalyzeArticleDto,
} from './dto/ai-request.dto';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'generated/prisma/enums';
import { throttlers } from './ai-throttler.config';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
  ApiServiceUnavailableResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  SummarizeArticleResponseDto,
  TranslateArticleResponseDto,
  AnalyzeArticleResponseDto,
} from './dto/ai-response.dto';

@ApiTags('ai')
@Controller('ai/articles')
@SetMetadata('track', 'ai')
@ApiBearerAuth('access-token')
export class AiArticlesController {
  constructor(private aiService: AiService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/summarize')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: throttlers.default })
  @HttpCode(200)
  @ApiOperation({ summary: 'Get summary of the article by LLM' })
  @ApiParam({
    name: 'articleId',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @ApiOkResponse({
    description: 'Request successful',
    type: SummarizeArticleResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded',
  })
  @ApiServiceUnavailableResponse({
    description: 'External service is temporarily unavailable',
  })
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: SummarizeArticleDto,
  ) {
    return this.aiService.summarizeArticle({ articleId, ...dto });
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/translate')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: throttlers.default })
  @HttpCode(200)
  @ApiOperation({ summary: 'Get translation of the article by LLM' })
  @ApiParam({
    name: 'articleId',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @ApiOkResponse({
    description: 'Request successful',
    type: TranslateArticleResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded',
  })
  @ApiServiceUnavailableResponse({
    description: 'External service is temporarily unavailable',
  })
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: TranslateArticleDto,
  ) {
    return this.aiService.translateArticle({ articleId, ...dto });
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/analyze')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: throttlers.default })
  @HttpCode(200)
  @ApiOperation({ summary: 'Get analysis of the article by LLM' })
  @ApiParam({
    name: 'articleId',
    example: '3f9c8d52-7a41-4e6b-9c12-8f5a3d7b2e91',
  })
  @ApiOkResponse({
    description: 'Request successful',
    type: AnalyzeArticleResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded',
  })
  @ApiServiceUnavailableResponse({
    description: 'External service is temporarily unavailable',
  })
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: AnalyzeArticleDto,
  ) {
    return this.aiService.analyzeArticle({ articleId, ...dto });
  }
}
