import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from '../auth/tokens/entities/refresh-token.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

@Injectable()
export class UsersService {
    constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } 
      // , relations: ['ownedProjects', 'projects']
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async logout(userId: string, res: Response) {
    await this.refreshTokenRepository.delete({
      user: { id: userId },
    });

    res.clearCookie('refreshToken', {
      path: '/api/token/refresh',
    });

    return { message:"Logout successfully"};
  }
}
