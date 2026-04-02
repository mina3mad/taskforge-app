import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { OtpCodesModule } from './otp-codes/otp-codes.module';

@Module({
  imports: [AuthenticationModule, OtpCodesModule]
})
export class AuthModule {}
