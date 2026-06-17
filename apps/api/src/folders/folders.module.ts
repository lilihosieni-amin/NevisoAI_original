import { Module } from '@nestjs/common';
import { FoldersResolver } from './folders.resolver';
import { FoldersService } from './folders.service';

/**
 * Folder slice (Step 3 / ARD §5.3). PrismaService + StorageService come from the
 * global CommonModule; GqlAuthGuard from the global AuthModule.
 */
@Module({
  providers: [FoldersResolver, FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
