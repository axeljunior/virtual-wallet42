import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { apiConfig, authConfig, postgresConfig } from './custom-config';

export class ConfigValidationDto {
  @IsOptional()
  @IsString()
  PORT?: number;

  @IsOptional()
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET?: string;

  @IsNotEmpty()
  @IsString()
  JWT_EXPIRATION_TIME?: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig, authConfig, postgresConfig],
      isGlobal: true,
      envFilePath: '.env',
      validate: (config: Record<string, any>) => {
        const validatedConfig = plainToInstance(ConfigValidationDto, config);
        const errors = validateSync(validatedConfig);
        if (errors.length > 0) {
          throw new Error(`Config validation failed: ${errors}`);
        }
        return config;
      },
    }),
  ],
  exports: [ConfigModule],
})
export class CustomConfigModule {}
