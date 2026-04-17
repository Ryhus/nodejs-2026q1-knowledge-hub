import { Injectable } from '@nestjs/common';
import { AuthDto } from './authtentication.dto';
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

    await this.prismaService.user.create({
      data: { login, password: hashedPasssword },
    });

    return { message: 'User is registred' };
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

    const tokenTtl = Number(process.env.JWT_ACCESS_TTL) || 900;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: tokenTtl,
    });

    return logedUser;
  }
}
