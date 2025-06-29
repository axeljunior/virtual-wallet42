import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/solicitation/solicitations.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostgresModule } from './providers/database/postgres.module';
import { CustomConfigModule } from './config/custom-config.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './providers/redis/redis.module';

@Module({
  imports: [
    CustomConfigModule,
    PostgresModule,
    EventEmitterModule.forRoot(),
    RedisModule,
    UsersModule,
    TransactionsModule,
    AuthModule,
  ],
})
export class AppModule {}
