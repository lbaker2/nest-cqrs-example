import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggerService } from './common/utils/logger.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new LoggerService(),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS CQRS API')
    .setDescription('API documentation for NestJS CQRS application with Event Sourcing')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('teams', 'Team management endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Serve AsyncAPI documentation
  app.useStaticAssets(join(__dirname, '..', 'docs', 'asyncapi-html'), {
    prefix: '/async-docs',
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api-docs`);
  console.log(`🔄 AsyncAPI Documentation available at: http://localhost:${port}/async-docs`);
}

bootstrap();