import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ProjectQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['planned', 'active', 'completed'] })
  @IsIn(['planned', 'active', 'completed'], { message: 'Invalid project status' })
  @IsOptional()
  status?: 'planned' | 'active' | 'completed';
}
