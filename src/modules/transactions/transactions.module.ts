import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from 'src/providers/database/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])], // Assuming you have entities to import here
  controllers: [TransactionsController],
  providers: [TransactionsService, UsersService],
})
export class TransactionsModule {}
