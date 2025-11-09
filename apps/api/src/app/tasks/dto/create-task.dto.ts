import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design landing page' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['todo', 'in_progress', 'done'], default: 'todo' })
  @IsIn(['todo', 'in_progress', 'done'])
  status: 'todo' | 'in_progress' | 'done' = 'todo';

  @ApiProperty({ description: 'Related project id' })
  @IsString()
  projectId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
