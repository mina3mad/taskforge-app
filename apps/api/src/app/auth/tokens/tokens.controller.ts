import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { Request, Response } from 'express';

@Controller('token')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}
  
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;
    return await this.tokensService.refreshToken(refreshToken, res);
  }
}
