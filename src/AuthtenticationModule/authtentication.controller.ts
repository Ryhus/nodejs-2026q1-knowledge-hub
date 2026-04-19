import { Controller, Post, Body } from '@nestjs/common';
import { AuthtenticationService } from './authtentication.service';
import { AuthDto } from './authtentication.dto';
import { HttpCode } from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorators';
import { UnauthorizedException } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthtenticationController {
  constructor(private authService: AuthtenticationService) {}

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('signup')
  async signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(ThrottlerGuard)
  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
