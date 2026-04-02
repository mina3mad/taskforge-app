import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/app/users/dto/user-response.dto';

export class LoginResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  user: UserResponseDto;
}