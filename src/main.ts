import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true
    })
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,     
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('API documentation for the Auth Service')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document());

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
