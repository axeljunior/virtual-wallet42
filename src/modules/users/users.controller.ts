import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAuth } from '../../commons/decorators/jwt-auth.decorator';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { ICurrentUser } from '../../commons/interfaces/current-user.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post()
  // @JwtAuth()
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  @Get()
  @JwtAuth()
  testeGetUser(@CurrentUser() currentUser: ICurrentUser) {
    return this.userService.getUserByEmail(currentUser.email);
  }
}
