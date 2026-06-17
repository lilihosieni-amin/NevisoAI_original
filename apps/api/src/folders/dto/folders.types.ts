import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Folder')
export class FolderObject {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true, description: 'Presigned GET URL for the cover, or null.' })
  coverUrl?: string | null;

  @Field(() => String, { nullable: true, description: 'Spine color (hex from the preset palette).' })
  color?: string | null;

  @Field(() => Int, { description: 'Number of notes in this folder.' })
  noteCount!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@InputType()
export class CreateFolderInput {
  @Field()
  name!: string;

  @Field(() => String, { nullable: true, description: 'Cover object key from requestFolderCoverUpload.' })
  coverUrl?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;
}

@InputType()
export class UpdateFolderInput {
  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  coverUrl?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;
}

@ObjectType()
export class FolderCoverUpload {
  @Field({ description: 'Presigned PUT URL — the client uploads the image directly here.' })
  uploadUrl!: string;

  @Field({ description: 'Object key to send back as createFolder/updateFolder coverUrl.' })
  objectKey!: string;
}
