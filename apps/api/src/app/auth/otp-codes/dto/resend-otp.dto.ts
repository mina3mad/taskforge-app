import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { OtpCodeType } from "../enum/otp-code-type.enum";

export class ResendOtpCodeDto {

  @IsNotEmpty({message:"Email is required"})
  @IsEmail({}, { message:"Invalid email address" })
  email: string;

  @IsNotEmpty({message:"OTP type is required"})
  @IsEnum(OtpCodeType, { message: "OTP type must be one of the following: SignUp or ForgetPassword" })
  type: OtpCodeType;
}