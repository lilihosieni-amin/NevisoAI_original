import { Module } from '@nestjs/common';
import { WorkerConfigModule } from './config/worker-config.module';
import { NoteGenerationModule } from './note-generation/note-generation.module';

@Module({
  imports: [WorkerConfigModule, NoteGenerationModule],
})
export class AppModule {}
