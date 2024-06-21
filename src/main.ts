import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: configuration().global.whitelist,
      forbidNonWhitelisted: configuration().global.forbidNonWhitelisted,
    }),
  );
  await app.listen(configuration().port);
}
bootstrap();
