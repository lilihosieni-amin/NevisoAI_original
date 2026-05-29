import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { OtpChannel, UserStatus } from './enums';

/** The authenticated user's own profile (ARD §5.2 `me`). */
@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  mobile!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => Int)
  creditBalance!: number;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => OtpChannel, { nullable: true })
  preferredOtpChannel?: OtpChannel;

  @Field()
  hasPassword!: boolean;

  @Field()
  createdAt!: Date;
}
