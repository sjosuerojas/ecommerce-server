import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';

async function bootstrap() {
  const logger = new Logger('MainInstance');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: configuration().global.whitelist,
      forbidNonWhitelisted: configuration().global.forbidNonWhitelisted,
    }),
  );
  await app.listen(configuration().port);
  logger.log(`Server running on port ${configuration().port}`);
}

bootstrap().catch((error) =>
  console.error('Error starting the application:', error),
);
