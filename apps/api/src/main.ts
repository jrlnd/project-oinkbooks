import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Validate/transform all incoming DTOs; strip unknown properties.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Allow the Angular dev server to call the API (and send the JWT header).
  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN') ?? 'http://localhost:4200',
    credentials: true,
  });

  const port = config.get<number>('API_PORT') ?? 3000;
  await app.listen(port);
}
void bootstrap();
