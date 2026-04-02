import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { OtpCodesModule } from './otp-codes/otp-codes.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [AuthenticationModule, OtpCodesModule, TokensModule]
})
export class AuthModule {}
