import {
  Controller,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  SummarizeArticleDto,
  TranslateArticleDto,
  AnalyzeArticleDto,
} from './ai.dto';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'generated/prisma/enums';

@Controller('ai/articles')
export class AiArticlesController {
  constructor(private aiService: AiService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/summarize')
  @HttpCode(200)
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: SummarizeArticleDto,
  ) {
    return this.aiService.summarizeArticle({ articleId, ...dto });
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/translate')
  @HttpCode(200)
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: TranslateArticleDto,
  ) {
    return this.aiService.translateArticle({ articleId, ...dto });
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post(':articleId/analyze')
  @HttpCode(200)
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() dto: AnalyzeArticleDto,
  ) {
    return this.aiService.analyzeArticle({ articleId, ...dto });
  }
}
