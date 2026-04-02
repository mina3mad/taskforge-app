import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from 'src/app/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwt: JwtService,
  ) {}
  async generateTokens(user: User) {
    const accessToken = this.jwt.sign(
      { userId: user.id, userRole: user.role },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: Number(process.env.JWT_EXPIRATION),
      },
    );

    const refreshToken = this.jwt.sign(
      { userId: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRATION),
      },
    );

    const hashedRefresh = hashSync(refreshToken, 10);

    await this.refreshTokenRepository.save({
      user,
      token: hashedRefresh,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string, res: Response) {
    try {
      if (!oldRefreshToken) throw new UnauthorizedException('No refresh token');

      const payload = this.jwt.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user) throw new UnauthorizedException();

      const storedTokens = await this.refreshTokenRepository.find({
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      const token = storedTokens.find((token) =>
        compareSync(oldRefreshToken, token.token),
      );

      if (!token) {
        // possible token reuse attack
        await this.refreshTokenRepository.delete({
          user: { id: user.id },
        });
        throw new UnauthorizedException('Token reuse detected');
      }

      // ROTATION
      await this.refreshTokenRepository.delete(token.id);

      const { accessToken, refreshToken } = await this.generateTokens(user);

      const hashedNewRefresh = hashSync(refreshToken, 10);

      await this.refreshTokenRepository.save({
        user,
        token: hashedNewRefresh,
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Update Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/token/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
