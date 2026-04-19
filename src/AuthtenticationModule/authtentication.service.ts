import { Injectable } from '@nestjs/common';
import { AuthDto } from './authtentication.dto';
import { PasswordService } from 'src/PasswordModule/password.service';
import { PrismaService } from 'src/PrismaModule/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { JwtPayload } from 'src/shared/types/auth.types';

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

    const payload = {
      userId: logedUser.id,
      login: logedUser.login,
      role: logedUser.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: Number(process.env.JWT_REFRESH_TTL) || 604800,
    });

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const { exp, iat, ...cleanPayload } = payload;

      const newAccessToken = await this.jwtService.signAsync(cleanPayload);
      const newRefreshToken = await this.jwtService.signAsync(cleanPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: Number(process.env.JWT_REFRESH_TTL) || 604800,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new ForbiddenException('Token is not valid!');
    }
  }
}
