import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('POSTGRES_URL'),
        autoloadEntities: true,
        synchronize: config.get<string>('ENVIROMENT') === 'dev' ? true : false,
        // logging: true,
        // logger: 'advanced-console',
        entities: [__dirname + '/../**/*.entity.{ts,js}']
      }),
    }),
  ],
})
export class PostgresModule {}