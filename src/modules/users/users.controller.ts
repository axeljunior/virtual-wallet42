import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendConfirmationEmailEvent } from 'src/events/send-confirmation-email.event';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const newUser = await this.userService.createUser(dto);

    this.eventEmitter.emit('user.createdSendEmail', new SendConfirmationEmailEvent(newUser));

    return newUser;
  }
}
