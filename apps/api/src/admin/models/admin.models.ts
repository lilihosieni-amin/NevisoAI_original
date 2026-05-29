import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AdminRole } from '@neviso/db';

registerEnumType(AdminRole, { name: 'AdminRole' });

@ObjectType()
export class AdminLoginChallenge {
  @Field(() => ID, { description: 'Opaque id for step 2.' })
  challengeId!: string;

  @Field(() => Int, { description: 'Seconds until the challenge + OTP expire.' })
  expiresIn!: number;

  @Field({ description: 'Masked mobile the OTP was sent to, e.g. 0912****567.' })
  maskedMobile!: string;
}

@ObjectType()
export class AdminProfile {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field(() => AdminRole)
  role!: AdminRole;
}

@ObjectType()
export class AdminAuthTokens {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => AdminProfile)
  admin!: AdminProfile;
}

export { AdminRole };
