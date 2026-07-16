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
import { GenerateContentDto } from './dto/ai-request.dto';
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
} from '@nestjs/swagger';
import { AiGenerationResponseDto } from './dto/ai-response.dto';

@ApiTags('ai')
@Controller('ai')
@SetMetadata('track', 'ai')
@ApiBearerAuth('access-token')
export class AiController {
  constructor(private aiService: AiService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Post('generate')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: throttlers.default })
  @HttpCode(200)
  @ApiOperation({ summary: 'Return generated answer from the LLM' })
  @ApiOkResponse({
    description: 'Request successful',
    type: AiGenerationResponseDto,
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
  async generate(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }
}
