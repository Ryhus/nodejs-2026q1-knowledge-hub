import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { AiService } from './ai.service';
import { GenerateContentDto } from './ai.dto';
import { throttlers } from './ai-throttler.config';

@Controller('ai')
@SetMetadata('track', 'ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post('generate')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: throttlers.default })
  @HttpCode(200)
  async generate(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }
}
