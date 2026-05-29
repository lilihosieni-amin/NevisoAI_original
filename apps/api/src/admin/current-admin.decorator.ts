import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Admin } from '@neviso/db';

/** Injects the admin that `AdminAuthGuard` attached to the request. */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Admin => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req.admin as Admin;
  },
);
