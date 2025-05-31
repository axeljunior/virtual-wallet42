import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Post()
  // @JwtAuth()
  // @Permissions({
  //   name: PermissionName.CREATE,
  //   scope: PermissionScope.USER,
  // })
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  // @JwtAuth()
  // @Permissions({
  //   name: PermissionName.CREATE,
  //   scope: PermissionScope.USER,
  // })
  teste(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }
}
