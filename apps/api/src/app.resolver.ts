import { Query, Resolver } from '@nestjs/graphql';

/**
 * Minimal root resolver so the code-first schema is non-empty in Step 1.
 * Feature resolvers replace the need for this placeholder from Step 2 onward,
 * but `health` remains a handy unauthenticated GraphQL probe.
 */
@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Liveness probe; returns "ok".' })
  health(): string {
    return 'ok';
  }
}
