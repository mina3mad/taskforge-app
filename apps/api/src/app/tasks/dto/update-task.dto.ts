import { IsOptional, IsString, Length } from 'class-validator';
 
export class UpdateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  @Length(1, 255, { message: 'Title must be between 1 and 255 characters' })
  title?: string;
 
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
}