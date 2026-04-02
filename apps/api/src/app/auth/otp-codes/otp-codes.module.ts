import { Module } from '@nestjs/common';
import { OtpCodesService } from './otp-codes.service';
import { OtpCodesController } from './otp-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { User } from 'src/app/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpCode,User])
  ],
  providers: [OtpCodesService],
  controllers: [OtpCodesController],
  exports:[OtpCodesService]
})
export class OtpCodesModule {}
