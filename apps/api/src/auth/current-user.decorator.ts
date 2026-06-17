import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import type { AuthenticatedUser } from './jwt-payload';

/** Resolver param decorator: the authenticated user attached by GqlAuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined => {
    const req = GqlExecutionContext.create(context).getContext().req as Request & {
      user?: AuthenticatedUser;
    };
    return req.user;
  },
);
