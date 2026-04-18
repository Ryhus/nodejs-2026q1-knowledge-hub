import { Injectable } from '@nestjs/common';
import { AuthDto, RefreshTokenDto } from './authtentication.dto';
import { PasswordService } from 'src/PasswordModule/password.service';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthtenticationService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    const { login, password } = dto;

    const hashedPasssword = await this.passwordService.hash(password);

    const createdUser = await this.prismaService.user.create({
      data: { login, password: hashedPasssword },
    });

    const { password: _, ...safeUser } = createdUser;

    return safeUser;
  }

  async login(dto: AuthDto) {
    const { login, password } = dto;

    const logedUser = await this.prismaService.user.findUnique({
      where: { login },
    });

    if (!logedUser) {
      throw new ForbiddenException();
    }

    const { password: hashedPassword } = logedUser;
    const isCorrectPassword = await this.passwordService.compare(
      password,
      hashedPassword,
    );

    if (!isCorrectPassword) {
      throw new ForbiddenException();
    }

    const accessToken = await this.jwtService.signAsync({
      userId: logedUser.id,
      login: logedUser.login,
      role: logedUser.role,
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        userId: logedUser.id,
        login: logedUser.login,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: Number(process.env.JWT_REFRESH_TTL) || 604800,
      },
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async refresh(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
  }
}
