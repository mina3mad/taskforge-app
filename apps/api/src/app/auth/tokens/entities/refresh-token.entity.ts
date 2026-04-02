import { User } from "src/app/users/entities/user.entity";
import { BaseEntity } from "src/shared/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity("refresh_tokens")
export class RefreshToken extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "timestamp" })
  expireAt: Date;
}
