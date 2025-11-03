import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('StartApplication')
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Essencial Server API')
    .setDescription('Documentação da API do Essencial Server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Disponibilizar o JSON do Swagger
  SwaggerModule.setup('api', app, document);

  // Configurar Scalar
  app.use(
    '/docs',
    apiReference({
      theme: 'purple',
      url: '/api-json',
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('PORT') ?? 3002;
  await app.listen(port);
  logger.debug(`Application is running on: http://localhost:${port}`);
  logger.debug(`Scalar docs available at: http://localhost:${port}/docs`);
}
bootstrap();
