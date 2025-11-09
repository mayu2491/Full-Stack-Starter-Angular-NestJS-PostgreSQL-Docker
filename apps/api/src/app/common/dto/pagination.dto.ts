import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Min(1)
  @Max(100)
  pageSize = 10;
}
