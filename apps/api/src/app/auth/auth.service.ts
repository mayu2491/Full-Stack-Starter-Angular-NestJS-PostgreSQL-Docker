import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionUser, AuthResponse } from '@fullstack/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashed,
        name: dto.name,
        role: 'MEMBER'
      }
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, false);
    await this.persistRefreshToken(user.id, tokens.refreshToken, false);

    return { user: this.toSessionUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.issueTokens(user.id, user.email, user.role, dto.rememberMe);
    await this.persistRefreshToken(user.id, tokens.refreshToken, dto.rememberMe);
    return { user: this.toSessionUser(user), tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.jwt.verifyAsync(refreshToken, {
      secret: this.config.get<string>('auth.refreshSecret')
    });

    const user = await this.validateRefreshToken(payload.sub, refreshToken);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { userId: user.id } });
    const rememberMe = stored?.rememberMe ?? false;
    const tokens = await this.issueTokens(user.id, user.email, user.role, rememberMe);
    await this.persistRefreshToken(user.id, tokens.refreshToken, rememberMe);
    return { user: this.toSessionUser(user), tokens };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { userId } });
    if (!stored) {
      return null;
    }
    const valid = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!valid) {
      return null;
    }
    if (stored.expiresAt && stored.expiresAt < new Date()) {
      return null;
    }
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async me(userId: string): Promise<SessionUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user ? this.toSessionUser(user) : null;
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    rememberMe: boolean
  ): Promise<AuthResponse['tokens']> {
    const normalizedRole = role.toLowerCase();
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role: normalizedRole },
      {
        secret: this.config.get<string>('auth.jwtSecret'),
        expiresIn: this.config.get<string>('auth.jwtExpiresIn') ?? '15m'
      }
    );

    const refreshExpires = rememberMe
      ? '30d'
      : this.config.get<string>('auth.refreshExpiresIn') ?? '7d';
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email, role: normalizedRole },
      {
        secret: this.config.get<string>('auth.refreshSecret'),
        expiresIn: refreshExpires
      }
    );

    const decoded = this.jwt.decode(accessToken) as { exp: number };

    return {
      accessToken,
      refreshToken,
      expiresAt: decoded?.exp ? decoded.exp * 1000 : Date.now() + 15 * 60 * 1000
    };
  }

  private async persistRefreshToken(userId: string, refreshToken: string, rememberMe: boolean) {
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.upsert({
      where: { userId },
      update: { tokenHash, expiresAt, rememberMe },
      create: { userId, tokenHash, expiresAt, rememberMe }
    });
  }

  private toSessionUser(user: { id: string; email: string; role: string }): SessionUser {
    const role = user.role.toLowerCase() as SessionUser['role'];
    return { id: user.id, email: user.email, role };
  }
}
