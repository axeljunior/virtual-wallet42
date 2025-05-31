import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [],
  controllers: [TransactionsController],
  providers: [TransactionsService, UsersService],
})
export class TransactionsModule {}
