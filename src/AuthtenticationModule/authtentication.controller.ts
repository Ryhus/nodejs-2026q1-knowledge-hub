import { Controller, Post, Body } from '@nestjs/common';
import { AuthtenticationService } from './authtentication.service';
import { AuthDto } from './dto/auth-request.dto';
import { HttpCode } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorators';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UnauthorizedError } from 'src/shared/exceptions/customErrors';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UserResponseDto } from 'src/UserModule/dto/user-response.dto';
import { AuthTokensResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthtenticationController {
  constructor(private authService: AuthtenticationService) {}

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('signup')
  @ApiOperation({
    summary: 'Sign up the new user',
    description:
      'Creates the new user in the system with the login and password',
  })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse()
  async signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login the user',
    description:
      'Login the user in the system using login and password. Creates access and refresh tokens',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh the access token, and update the refresh token',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError();
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout the user from the system',
    description: 'Logout the user from the system, deleting refresh token',
  })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
