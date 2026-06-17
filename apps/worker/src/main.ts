import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Standalone NestJS worker (no HTTP server). The BullMQ worker registered in
 * NoteGenerationProcessor keeps the process alive via its Redis connection.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  Logger.log('Neviso worker started', 'Bootstrap');
}

void bootstrap();
