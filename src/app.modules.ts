import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/solicitation/solicitations.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostgresModule } from './providers/database/postgres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PostgresModule,
    UsersModule,
    TransactionsModule,
    AuthModule,
  ],
})
export class AppModule {}
