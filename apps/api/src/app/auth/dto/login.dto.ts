import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'super-secret' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  rememberMe = false;
}
