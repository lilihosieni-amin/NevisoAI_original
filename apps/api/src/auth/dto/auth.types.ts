import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OtpChannel } from '@neviso/db';

// Expose the Prisma OtpChannel enum to the code-first GraphQL schema.
registerEnumType(OtpChannel, {
  name: 'OtpChannel',
  description: 'OTP delivery channel: SMS (پیامک) or BALE (بله).',
});

export { OtpChannel };

@ObjectType()
export class OtpResponse {
  @Field(() => Int, { description: 'Seconds until the code expires / resend is allowed.' })
  expiresIn!: number;

  @Field(() => OtpChannel, { description: 'Channel the code was actually sent through (after any fallback).' })
  channel!: OtpChannel;
}

@ObjectType()
export class AuthTokens {
  @Field(() => String, { description: '15-minute access token; kept in client memory.' })
  accessToken!: string;

  @Field(() => Boolean, { description: 'True when this login created the account (first login).' })
  isNewUser!: boolean;
}
