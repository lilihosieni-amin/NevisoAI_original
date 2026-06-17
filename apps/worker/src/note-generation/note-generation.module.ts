import { Module } from '@nestjs/common';
import { NoteGenerationProcessor } from './note-generation.processor';

@Module({
  providers: [NoteGenerationProcessor],
})
export class NoteGenerationModule {}
