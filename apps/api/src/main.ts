import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // CORS whitelist (ARD §13): user app + admin app origins only.
  app.enableCors({
    origin: [config.env.WEB_ORIGIN, config.env.ADMIN_WEB_ORIGIN],
    credentials: true,
  });

  await app.listen(config.env.APP_PORT);
  Logger.log(`API listening on http://localhost:${config.env.APP_PORT}`, 'Bootstrap');
  Logger.log(`GraphQL at http://localhost:${config.env.APP_PORT}/graphql`, 'Bootstrap');
}

void bootstrap();
