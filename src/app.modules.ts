import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    TransactionsModule,
  ],
})
export class AppModule {}
