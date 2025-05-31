import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Matches } from 'class-validator';

import { passwordValidation } from '../constants/regex';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @ApiProperty({
    example: 'Password@123',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(passwordValidation.regex, {
    message: passwordValidation.message,
  })
  password: string;
}