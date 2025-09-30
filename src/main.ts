import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Server } from 'http';

let server: Server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001); 
}

if (require.main === module) {
  bootstrap();
}

export default async function handler(req: any, res: any) {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }
  server.emit('request', req, res); // Executa como função serverless
}