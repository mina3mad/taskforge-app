import {
  IsEmail,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserGender } from '../enum/user-gender.enum';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  // @Length(6, 100, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one number and one special character (!@#$%^&*)',
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName: string;

  @IsEnum(UserGender, {
    message:
      'Gender must be one of the following values: Male, Female, or PreferNotToSay',
  })
  @IsOptional()
  gender?: UserGender;

  @IsEnum(UserRole, {
    message:
      'Role must be one of the following values: ADMIN, PROJECT_MANAGER, MEMBER, or QA',
  })
  @IsOptional()
  role?: UserRole;
}
