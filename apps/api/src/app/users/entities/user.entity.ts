import { BaseEntity } from 'src/shared/base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { UserGender } from '../enum/user-gender.enum';
import { UserRole } from '../enum/user-role.enum';
import { OtpCode } from 'src/app/auth/otp-codes/entities/otp-code.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  email: string;
  
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender: UserGender;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;


  @Column({ default: false })
  isVerified: boolean;

  @OneToMany(() => OtpCode, (otpCode) => otpCode.user)
  otpCodes: OtpCode[];

//   @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
//   refreshTokens: RefreshToken[];

}
