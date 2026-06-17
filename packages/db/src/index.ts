/**
 * `@neviso/db` — the single shared Prisma client + types for api and worker.
 *
 * The package entry resolves to the generated client at runtime
 * (package.json `main` → `generated/client`); this re-export exists so the
 * `@neviso/db` path alias type-checks. Run `pnpm db:generate` before building.
 */
export * from '../generated/client';
