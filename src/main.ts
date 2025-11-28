import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const logger = new Logger('StartApplication');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Essencial Server API')
    .setDescription('Documentação da API do Essencial Server')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Users')
    .addTag('Appointments')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'default',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Disponibilizar o JSON do Swagger
  SwaggerModule.setup('api', app, document);

  // Configurar Scalar (agora disponível em produção também)
  try {
    const { apiReference } = await import('@scalar/nestjs-api-reference');
    app.use(
      '/docs',
      apiReference({
        theme: 'purple',
        url: '/api-json',
      }),
    );
    logger.log(`📚 Scalar documentation available`);
  } catch (error) {
    logger.warn('Scalar documentation not available');
  }

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://essencial-dev.vercel.app',],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('PORT') ?? 3002;
  await app.listen(port);
  logger.log(`📚 Scalar UI: http://localhost:${port}/docs`);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
