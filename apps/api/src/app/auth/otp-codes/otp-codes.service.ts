import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { IsNull, Repository } from 'typeorm';
import { User } from 'src/app/users/entities/user.entity';
import { OtpCodeType } from './enum/otp-code-type.enum';
import { OtpCodeStatus } from './enum/otp-code-status.enum';
import { ResendOtpCodeDto } from './dto/resend-otp.dto';
import { VerifyUserDto } from './dto/verify-user.dto';

@Injectable()
export class OtpCodesService {
    constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateOtp(email: string, type: OtpCodeType): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }

    // Delete any existing OTPs for this user and type
    const otpCodes=await this.otpRepository.find({
      where: { user: { id: user.id }, type, deletedAt: IsNull(),state:OtpCodeStatus.Generated },
      relations: ['user'],
    });

    if (otpCodes.length > 0) {
      await this.otpRepository.softDelete(otpCodes.map((otp) => otp.id));
    }

    const code = this.generateSecureCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);

    const otp = this.otpRepository.create({
      user,
      code,
      type,
      state:OtpCodeStatus.Generated,
      expireAt: expirationDate,
    });

    await this.otpRepository.save(otp);
    return otp.code;
  }


  async resendOtpCode(resendOtpCodeDto:ResendOtpCodeDto): Promise<string> {
    const { email, type } = resendOtpCodeDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }

    const lastOtp = await this.otpRepository.findOne({
      where: { user: { id: user.id }, type },
      order: { createdAt: "DESC" }, 
    });

    if (lastOtp) {
      const oneMinuteAgo = new Date();
      oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

      if (new Date(lastOtp.createdAt) > oneMinuteAgo) {
        throw new BadRequestException("OTP was sent less than 1 minute ago. Please wait");
      }
    }

    await this.otpRepository.softDelete({
      user: { id: user.id },
      type: type,
      state:OtpCodeStatus.Generated,
    });

    const code = this.generateSecureCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);

    const otpCode = this.otpRepository.create({
      code,
      user: { id: user.id },
      type,
      state:OtpCodeStatus.Generated,
      expireAt: expirationDate,
    });

    await this.otpRepository.save(otpCode);
    return otpCode.code;
  }

  async verifyUserForSignUp(
    body:VerifyUserDto
  ): Promise<{ message: string }> {
    const { email, code } = body;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    if (user.isVerified) {
      throw new BadRequestException("user is already verified");
    }

    await this.verifyOtp(email, code, OtpCodeType.SignUp);

    user.isVerified = true;
    await this.userRepository.save(user);

    return { message: "User verified successfully" };
  }

  async UseResetPasswordOtpCode(code: string, email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    await this.verifyOtp(email, code, OtpCodeType.ForgetPassword);
    return true;
  }

  async verifyOtp(
    email: string,
    code: string,
    type: OtpCodeType,
  ): Promise<Boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("user not found");
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        code,
        user: { id: user.id },
        type,
        state:OtpCodeStatus.Generated,
        deletedAt: IsNull(),
      },
    });

    if (!otpCode || new Date() > otpCode.expireAt) {
      throw new BadRequestException("Invalid or expired OTP code");
    }

    //mark code as used
    otpCode.state=OtpCodeStatus.Used;
    await this.otpRepository.save(otpCode);

    return true;
  }

  // Generate secure random code
  generateSecureCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString().slice(0, 6);
  }
}
