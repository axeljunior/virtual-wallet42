import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from '../../providers/database/entities/user.entity';
import { SendConfirmationEmailListener } from 'src/events/send-confirmation-email.listener';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, SendConfirmationEmailListener],
})
export class UsersModule {}
