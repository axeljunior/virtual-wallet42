import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.modules';
// import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  // const config = app.get<ConfigService>(ConfigService);
  // const env: ConfigService = new ConfigService()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // app.useGlobalFilters(new SequelizeExceptionFilter());

  app.enableCors();
  const port = 3000;
  let nodeEnv = "development";

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Grupo AC Wallet')
      .setDescription('Grupo AC Wallet')
      .setVersion('0.1')
      .addBearerAuth(undefined, 'bearerAuth')
      // .addBearerAuth(undefined, 'refreshBearerAuth')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    // const theme = new SwaggerTheme();
    const options = {
      explorer: true,
      // customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
    };

    SwaggerModule.setup('swagger', app, document, options);
  }

  await app.listen(port, () => {
    logger.log(`Server listening at port ${port}`);
    logger.log(`Rodando em http://localhost:${port}/swagger#`);
    logger.log(`Running in mode: ${nodeEnv}`);
  });
}

bootstrap();
