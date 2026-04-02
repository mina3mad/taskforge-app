import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/app/users/entities/user.entity';
import { OtpCode } from '../otp-codes/entities/otp-code.entity';
import { OtpCodesService } from '../otp-codes/otp-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,OtpCode])],
  providers: [AuthenticationService,OtpCodesService],
  controllers: [AuthenticationController]
})
export class AuthenticationModule {}
