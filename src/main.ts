import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. DEFINA O PREFIXO GLOBAL
  // Isso fará com que todas as rotas (ex: /patient)
  // agora sejam acessadas como /api/patient
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Essencial Server API')
    .setDescription('Documentação da API do Essencial Server')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // 2. MUDE A ROTA DO SWAGGER PARA APENAS 'docs'
  // O resultado final continuará sendo /api/docs (por causa do prefixo global)
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('PORT') ?? 3002;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
  
  // Atualize os logs para refletir a mudança
  console.log(`Swagger docs is running at http://localhost:${port}/api/docs`);
}
bootstrap();