import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.modules';
import helmet from 'helmet';
import { CustomLogger } from './commons/utils/custom-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger("App");
  app.useLogger(app.get(CustomLogger))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors();
  const port = 3000;
  let nodeEnv = "development";

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('42Wallet')
      .setDescription('42Wallet')
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
    logger.log(`Rodando em http://localhost:${port}/swagger#`);
    logger.log(`Rodando em: ${nodeEnv}`);
  });
}

bootstrap();
