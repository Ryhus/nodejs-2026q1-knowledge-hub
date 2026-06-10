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
import { UserPrismaPsService } from './user.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  GetUsersQueryDto,
} from './dto/user-request.dto';
import { GetUsersResponseDto, UserResponseDto } from './dto/user-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private userService: UserPrismaPsService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  @ApiOperation({
    summary: 'Returns array of users',
    description:
      'Retrieves a paginated list of users. Supports optional sorting and pagination via query parameters.',
  })
  @ApiOkResponse({
    type: GetUsersResponseDto,
    description: 'Request successful',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  async getAll(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Roles(Role.admin)
  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user account in the system',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Resource created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Deletes an existing user account from the system by their unique ID',
  })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiNoContentResponse({ description: 'Resource deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.deleteUser(id);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieves a single user account by their unique identifier',
  })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Request successful' })
  @ApiUnauthorizedResponse({
    description: 'Client must be authorized to use API',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, query or params arguments',
  })
  @ApiNotFoundResponse({ description: 'Requested Entity not found' })
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.findUser(id);
  }

  @Roles(Role.admin, Role.editor)
  @Put(':id')
  @ApiOperation({
    summary: 'Update users password',
    description: 'Updating user password',
  })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Request successful' })
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
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto, user);
  }
}
