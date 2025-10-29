import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Essencial Server API')
    .setDescription('Documentação da API do Essencial Server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('PORT') ?? 3002;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Swagger docs is running at http://localhost:${port}/api/docs`);
}
bootstrap();
