import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.modules';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  
  const configService = app.get(ConfigService);
  console.log('Config Service:',  configService.get<string>('api.nodeEnv'));

  app.enableCors();
  const port = 3000;
  let nodeEnv = "development";

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Grupo AC Wallet')
      .setDescription('Grupo AC Wallet')
      .setVersion('0.1')
      .addBearerAuth(undefined, 'bearerAuth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const options = {
      explorer: true,
    };

    SwaggerModule.setup('swagger', app, document, options);
  }

  app.use(helmet())

  await app.listen(port, () => {
    logger.log(`Server listening at port ${port}`);
    logger.log(`Rodando em http://localhost:${port}/swagger#`);
    logger.log(`Running in mode: ${nodeEnv}`);
  });
}

bootstrap();
