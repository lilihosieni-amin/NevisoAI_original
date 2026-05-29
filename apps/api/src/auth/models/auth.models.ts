import { Field, Int, ObjectType } from '@nestjs/graphql';
import { OtpChannel } from './enums';

@ObjectType()
export class OtpResponse {
  @Field(() => Int, { description: 'Seconds until the code expires.' })
  expiresIn!: number;

  @Field(() => OtpChannel, {
    description: 'Channel the code was actually sent through (after any fallback).',
  })
  channel!: OtpChannel;
}

@ObjectType()
export class AuthTokens {
  @Field()
  accessToken!: string;

  @Field({ description: 'Also set as an HttpOnly cookie; returned for non-browser clients.' })
  refreshToken!: string;

  @Field()
  isNewUser!: boolean;
}
