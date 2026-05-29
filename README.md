# Neviso (nevisoai.ir)

Persian-language AI note-taking platform. Monorepo with NestJS (API + worker) and
Next.js (web + admin). Source of truth: `document/ard-neviso.md` (architecture) and
`document/prd-neviso.md` (product). Roadmap: `document/development-plan-nevisoai.md`.

## Layout

```
apps/
  api/      NestJS GraphQL API (user + admin schemas) — code-first + Apollo
  worker/   NestJS standalone worker (BullMQ consumer)
  web/      Next.js 14 user PWA (RTL, Vazirmatn self-hosted)
  admin/    Next.js 14 admin backoffice
packages/
  types/    shared TS types + error-code catalog (@neviso/types)
  db/        Prisma schema + generated client (@neviso/db)
```

## Prerequisites

- Node 20 (`.nvmrc`)
- Docker (for Postgres + Redis)

## Quick start

```bash
npm install
cp .env.example .env                 # fill values as phases need them
docker compose -f docker-compose.dev.yml up -d
npm run db:generate                  # generate Prisma client
npm run db:migrate                   # apply migrations (enables pgvector)
npm run dev                          # api:3000 worker web:4000 admin:5000
```

## Test gate (every phase)

```bash
docker compose -f docker-compose.test.yml up -d   # ephemeral pg:5433 / redis:6380
npm run db:generate
npm run lint
npm run typecheck
npm run format:check
npm test                # unit + integration (Jest)
npm run build           # nest build + next build
npm run check:no-cdn    # fails on any foreign CDN host in built output
npm run test:e2e        # Playwright (web + admin)
```

CI runs the full gate on every push (`.github/workflows/ci.yml`).

## Conventions (non-negotiable)

- **No foreign CDNs** — all assets vendored (Iran blocks them). Enforced by `check:no-cdn`.
- **Persian + RTL** everywhere in `web`/`admin`; Vazirmatn is self-hosted in `public/fonts`.
- **Persian-only user errors** — server returns `{ code, data?, traceId }`; clients map
  `code` → Persian (`apps/*/lib/error-map.ts`), unknown codes fall back to a generic message.
- **Models added per phase** — Phase 0 only enables `pgvector`; app models land in later phases.
