import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('ProPeers API')
    .setDescription('API for ProPeers application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
  return app;
}

// Export for serverless use
let app;
export default async (req, res) => {
  if (!app) {
    app = await bootstrap();
  }
  return app.getHttpAdapter().getInstance()(req, res);
};

// For local development
if (require.main === module) {
  bootstrap();
}