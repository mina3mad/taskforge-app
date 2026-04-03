import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
 
export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title: string;
 
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
 

  @IsOptional()
  assigneeId?: string;
}