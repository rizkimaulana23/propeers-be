import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

// Create a variable to cache the server instance
let server: any;

export default async function handler(req: any, res: any) {
  if (!server) {
    // Initialize NestJS app
    const app = await NestFactory.create(AppModule);
    
    // Apply global pipes and settings
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();
    
    server = app.getHttpAdapter().getInstance();
  }
  
  return server(req, res);
}