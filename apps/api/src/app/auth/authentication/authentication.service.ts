import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/app/users/entities/user.entity';
import { Repository } from 'typeorm';
import { OtpCode } from '../otp-codes/entities/otp-code.entity';
import { OtpCodesService } from '../otp-codes/otp-codes.service';
import { CreateUserDto } from 'src/app/users/dto/create-user.dto';
import { UserResponseDto } from 'src/app/users/dto/user-response.dto';
import { compareSync, hashSync } from 'bcrypt';
import { OtpCodeType } from '../otp-codes/enum/otp-code-type.enum';
import { plainToInstance } from 'class-transformer';
import { LoginInputDto } from './dto/login-input.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpCodeStatus } from '../otp-codes/enum/otp-code-status.enum';

@Injectable()
export class AuthenticationService {
    constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    private readonly otpCodeService: OtpCodesService,
    // private readonly tokensService: TokensService,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; otp: string}> {
    const { email, password } = createUserDto;

    const emailLowerCase = email.toLocaleLowerCase();

    const existingEmail = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });
    if (existingEmail) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = hashSync(password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      email: emailLowerCase,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    //create otp
    const otp = await this.otpCodeService.generateOtp(
      email,
      OtpCodeType.SignUp,
    );

    if (!otp) {
      throw new BadRequestException("Failed to generate OTP code");
    }

    const userRes = plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });

    return {
      message: "Signup successfully please verify your account using this otp",
      otp: otp,
    };
  }


  async login(
    loginInput:LoginInputDto,
  ): Promise<LoginResponseDto> {
    const emailLowerCase = loginInput.email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if(!user.isVerified){
        throw new UnauthorizedException("Account not verified"); 
    }

    // Compare the input password with the stored hash
    const isMatch = compareSync(loginInput.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate an access and refresh token for the authenticated user
    // ......token generation logic here

    //  const { password, ...userResponse } = user;
    const userRes = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      accessToken:"",
      refreshToken:"",
      user: userRes,
    };
  }
  
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;
    const emailLowerCase = email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: emailLowerCase },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        type: OtpCodeType.ForgetPassword,
        state: OtpCodeStatus.Used,
      },
      relations: ['user'],
    });
    if (!otpCode || new Date() > otpCode.expireAt) {
      throw new UnauthorizedException(
        "Invalid or expired OTP code",
      );
    }
    await this.otpRepository.softDelete(otpCode.id);
    user.password = hashSync(newPassword, 10);
    await this.userRepository.save(user);

    return { message: "Password reset successfully" };
  }
}
