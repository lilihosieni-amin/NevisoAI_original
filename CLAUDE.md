# Neviso — rules for Claude Code

Build strictly by DEVELOPMENT_PLAN.md, ONE step at a time.
Specs of record: PRD.md (product), ARD.md (architecture), DEVELOPMENT_PLAN.md (build order).
If they conflict, STOP and ask me.

## Always-on rules (every change)
- UI: every user-facing `web` screen must match document/design-Tempelet/ EXACTLY. Open the matching template screen before building.
- Persian (RTL) UI. Jalali dates only at display/output; store UTC ISO.
- No foreign CDNs — vendor every asset (Vazirmatn, libs, icons).
- User vs admin JWTs: different secrets + aud claim; never cross.
- All user-facing errors are Persian, mapped centrally by `code`.
- Stack: NestJS + code-first GraphQL + Prisma; Next.js 14; Postgres+pgvector; Redis/BullMQ; AI via Metis; Arvan S3; Zarinpal.
- Never invent real secrets/keys — use .env placeholders.
- Don't add anything not in the plan.

## Per-step workflow (follow for EVERY step)
1. Re-read the step in DEVELOPMENT_PLAN.md + the PRD/ARD sections it references.
2. Propose a short plan + file list. Wait for my OK on anything non-trivial.
3. Implement backend, then frontend.
4. Write the step's automated tests; run the full suite (pnpm test).
5. STOP. Give me the step's manual self-test checklist. Do NOT start the next step.