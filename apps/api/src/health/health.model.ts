import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum HealthState {
  ok = 'ok',
  degraded = 'degraded',
  down = 'down',
}

registerEnumType(HealthState, { name: 'HealthState' });

@ObjectType()
export class Health {
  @Field(() => HealthState)
  status!: HealthState;

  @Field()
  service!: string;

  @Field()
  timestamp!: string;

  @Field()
  database!: boolean;
}
