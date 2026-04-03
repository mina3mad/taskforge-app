import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/app/users/dto/user-response.dto';
 
export class ProjectResponseDto {
  @Expose()
  id: string;
 
  @Expose()
  name: string;
 
  @Expose()
  description: string;
 
  @Expose()
  @Type(() => UserResponseDto)
  owner: UserResponseDto;
 
  @Expose()
  @Type(() => UserResponseDto)
  members: UserResponseDto[];
 
  @Expose()
  createdAt: Date;
 
  @Expose()
  updatedAt: Date;
}