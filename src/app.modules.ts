import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/solicitation/solicitations.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostgresModule } from './providers/database/postgres.module';
import { CustomConfigModule } from './config/custom-config.module';
import { TestesModule } from './providers/teste/teste.module';
import { LoggerModule } from 'nestjs-pino';
import { CustomLogger } from './commons/utils/custom-logger';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    CustomConfigModule,
    PostgresModule,
    UsersModule,
    TransactionsModule,
    AuthModule,
    TestesModule, // Teste
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => randomUUID(),
        quietReqLogger: true,
        // autoLogging: false
      }
    }),
  ],
  providers: [CustomLogger],
  exports: [CustomLogger]
})
export class AppModule {}
