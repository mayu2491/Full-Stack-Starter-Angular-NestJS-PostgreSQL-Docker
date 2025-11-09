import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Marketing Website' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ example: 'A brand new marketing landing page', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['planned', 'active', 'completed'], default: 'planned' })
  @IsIn(['planned', 'active', 'completed'])
  status: 'planned' | 'active' | 'completed' = 'planned';
}
