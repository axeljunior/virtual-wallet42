import { Module } from '@nestjs/common';
import { UsersModule } from './config/modules/users/users.module';
import { TransactionsModule } from './config/modules/transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    TransactionsModule,
  ],
})
export class AppModule {}
