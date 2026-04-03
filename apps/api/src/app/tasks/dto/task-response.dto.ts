import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/app/users/dto/user-response.dto';
import { TaskStatus } from '../enum/task-status.enum';
 
export class TaskResponseDto {
  @Expose()
  id: string;
 
  @Expose()
  title: string;
 
  @Expose()
  description: string;
 
  @Expose()
  status: TaskStatus;
 
  @Expose()
  projectId: string;
 
  @Expose()
  @Type(() => UserResponseDto)
  assignee: UserResponseDto;
 
  @Expose()
  @Type(() => UserResponseDto)
  createdBy: UserResponseDto;
 
  @Expose()
  createdAt: Date;
 
  @Expose()
  updatedAt: Date;
}