import { Controller, Post, Body } from '@nestjs/common';
import { AuthtenticationService } from './authtentication.service';
import { AuthDto, RefreshTokenDto } from './authtentication.dto';
import { HttpCode } from '@nestjs/common';

@Controller('auth')
export class AuthtenticationController {
  constructor(private authService: AuthtenticationService) {}

  @Post('signup')
  async signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refresh(refreshDto);
  }
}
