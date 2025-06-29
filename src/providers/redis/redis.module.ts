import { Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { TesteService } from '../teste/teste.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 3020,
      },
    }),
  ],
})

export class RedisModule {}