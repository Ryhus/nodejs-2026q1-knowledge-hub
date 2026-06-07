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
import { CreateUserDto, UpdatePasswordDto, GetUsersQueryDto } from './user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { CurrentUser } from 'src/shared/decorators/currentUser.decorator';
import { JwtPayload } from 'src/shared/types/auth.types';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserPrismaPsService) {}

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get()
  async getAll(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(query);
  }

  @Roles(Role.admin)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Roles(Role.admin)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.deleteUser(id);
  }

  @Roles(Role.admin, Role.viewer, Role.editor)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.userService.findUser(id);
  }

  @Roles(Role.admin, Role.editor)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto, user);
  }
}
