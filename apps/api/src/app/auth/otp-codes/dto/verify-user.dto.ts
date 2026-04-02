import { IsEmail, IsEnum, IsNotEmpty, Length } from "class-validator";

export class VerifyUserDto {

  @IsNotEmpty({message:"Email is required"})
  @IsEmail({}, { message:"Invalid email address" })
  email: string;

  @IsNotEmpty({message:"OTP code is required"})
  @Length(6, 6, { message: "OTP code must be exactly 6 characters long" })
  code: string;
}