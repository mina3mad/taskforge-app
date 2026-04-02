import {Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { OtpCodeType } from "../enum/otp-code-type.enum";
import { BaseEntity } from "src/shared/base.entity";
import { OtpCodeStatus } from "../enum/otp-code-status.enum";
import { User } from "src/app/users/entities/user.entity";


@Entity("otp_codes")
export class OtpCode extends BaseEntity{
  @Column()
  code: string;

  @Column({
    type: "enum",
    enum: OtpCodeType,
  })
  type: OtpCodeType;

  @Column({
    type: "enum",
    enum: OtpCodeStatus,
  })
  state: OtpCodeStatus;

  @ManyToOne(() => User, (user) => user.otpCodes, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column("timestamp", { nullable: false })
  expireAt: Date;
}
