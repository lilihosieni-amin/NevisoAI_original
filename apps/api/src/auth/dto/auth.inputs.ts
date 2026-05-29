import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
