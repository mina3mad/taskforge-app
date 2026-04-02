import { Body, Controller, HttpCode, Patch, Post, Res } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from 'src/app/users/dto/create-user.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { Response } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signUp')
  //   @HttpCode(201)
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; otp: string }> {
    return await this.authenticationService.signUp(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() authLoginInput: LoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    // return await this.authenticationService.login(authLoginInput);
    const { accessToken, refreshToken, user } =
      await this.authenticationService.login(authLoginInput);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/token/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user,
    };
  }

  @Patch('resetPassword')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authenticationService.resetPassword(body);
  }
}
