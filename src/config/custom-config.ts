import { registerAs } from '@nestjs/config';

export const apiConfig = registerAs('api', () => ({
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
}));

export const postgresConfig = registerAs('postgres', () => ({
  url: process.env.POSTGRES_URL || 'secret',
  schema: process.env.POSTGRES_SCHEMA,
}));
