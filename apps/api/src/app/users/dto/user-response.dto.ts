import { Exclude, Expose } from "class-transformer";
import { UserGender } from "../enum/user-gender.enum";
import { UserRole } from "../enum/user-role.enum";

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  gender: UserGender;

  @Expose()
  role: UserRole;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

}