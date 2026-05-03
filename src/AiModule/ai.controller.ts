import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { AiService } from './ai.service';
import { GenerateContentDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post('generate')
  @HttpCode(200)
  async generate(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }
}
