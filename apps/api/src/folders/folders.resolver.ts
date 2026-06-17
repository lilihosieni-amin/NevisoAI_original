import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-payload';
import { FoldersService } from './folders.service';
import {
  CreateFolderInput,
  FolderCoverUpload,
  FolderObject,
  UpdateFolderInput,
} from './dto/folders.types';

/** Folder management (ARD §5.3). All operations are owner-scoped in the service. */
@Resolver(() => FolderObject)
@UseGuards(GqlAuthGuard)
export class FoldersResolver {
  constructor(private readonly service: FoldersService) {}

  @Query(() => [FolderObject], { description: "The signed-in user's folders." })
  folders(@CurrentUser() user: AuthenticatedUser): Promise<FolderObject[]> {
    return this.service.listByUser(user.id);
  }

  @Mutation(() => FolderObject)
  createFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateFolderInput,
  ): Promise<FolderObject> {
    return this.service.create(user.id, input);
  }

  @Mutation(() => FolderObject)
  updateFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateFolderInput,
  ): Promise<FolderObject> {
    return this.service.update(user.id, id, input);
  }

  @Mutation(() => Boolean)
  deleteFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.service.delete(user.id, id);
  }

  @Mutation(() => FolderCoverUpload, { description: 'Presigned PUT for a folder cover image.' })
  requestFolderCoverUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Args('contentType') contentType: string,
    @Args('contentLength', { type: () => Int, nullable: true }) contentLength?: number,
  ): Promise<FolderCoverUpload> {
    return this.service.requestCoverUploadUrl(user.id, contentType, contentLength);
  }
}
