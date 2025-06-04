import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log(config.get<string>('api.nodeEnv'))
        console.log(config.get<string>('postgres.url'))
        console.log(config.get<string>('postgres.schema'))
        return {
          type: 'postgres',
          url: config.get<string>('postgres.url'),
          autoloadEntities: true,
          synchronize: config.get<string>('api.nodeEnv') === 'development' || 'test' ? true : false,
          schema: config.get<string>('api.nodeEnv') === 'test' ? "tests" :  config.get<string>('postgres.schema'),
          // logging: true,
          // logger: 'advanced-console',
          entities: [__dirname + '/../**/*.entity.{ts,js}']
        }
      },
    }),
  ],
})
export class PostgresModule {}