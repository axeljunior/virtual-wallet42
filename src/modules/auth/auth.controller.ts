import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from './auth.service';
import { LoginDto } from './dto/loginDto.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { email, password } = dto;

    const loginResponse = await this.authService.login(email, password);

    if(!loginResponse.success) throw new HttpException(loginResponse, HttpStatus.UNAUTHORIZED);

    return loginResponse;
  }
}