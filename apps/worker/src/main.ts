import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Standalone worker process: no HTTP server. BullMQ workers keep the event
 * loop alive and consume jobs from Redis.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  Logger.log('Worker started; listening for jobs', 'Bootstrap');
}

void bootstrap();
