import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, IsUUID, Matches } from 'class-validator';
import { passwordValidation } from 'src/modules/users/constants/regex';


export class LoginDto {
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