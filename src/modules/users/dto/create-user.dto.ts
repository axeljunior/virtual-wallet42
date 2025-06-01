import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, IsUUID, Matches } from 'class-validator';

import { passwordValidation } from '../constants/regex';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@teste.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

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