import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/authorization/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/authorization/decorator/current-user.decorator';
import { Response } from 'express';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.findOne(user.userId);
  }

  @Post('logout')
  logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.usersService.logout(req.user.userId, res);
  }
}
