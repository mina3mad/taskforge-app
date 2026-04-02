import { Body, Controller, Patch, Post } from '@nestjs/common';
import { OtpCodesService } from './otp-codes.service';
import { ResendOtpCodeDto } from './dto/resend-otp.dto';
import { Verify } from 'crypto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { OtpCodeType } from './enum/otp-code-type.enum';

@Controller('otp')
export class OtpCodesController {
    constructor(
    private readonly otpCodesService: OtpCodesService,
  ) {}

  @Post('resendOtp')
  //for signUp & reset password
  async ResendOtpCode(
    @Body() body: ResendOtpCodeDto,
  ): Promise<string> {
    return await this.otpCodesService.resendOtpCode(body);
  }

  @Patch('verifyUser')
  async verifyUserForSignUp(
    @Body() verifyUserDto: VerifyUserDto,
  ): Promise<{ message: string }> {
    return await this.otpCodesService.verifyUserForSignUp(verifyUserDto);
  }

  @Post('sendResetPassOtp')
  async sendResetPasswordOtp(@Body('email') email: string) {
    return await this.otpCodesService.generateOtp(
      email,
      OtpCodeType.ForgetPassword,
    );
  }

  @Patch('checkResetOtp')
  async UseResetPasswordOtpCode(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    return await this.otpCodesService.UseResetPasswordOtpCode(code, email);
  }
}
