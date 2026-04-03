import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../enum/task-status.enum';
 
export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, {
    message:
      'Status must be one of: BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, QA, DONE, REOPENED',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: TaskStatus;
}