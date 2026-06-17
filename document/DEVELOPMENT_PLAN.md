# Neviso — Development Plan

> Build plan for **Neviso (nevisoai.ir)**, derived from PRD v1.5 and ARD v1.5.
> **Step 1** sets up the foundation (repo, infra, DB, scaffolding). **Every step after that is a pure vertical slice** — one feature built end-to-end (DB → API → worker if needed → UI) so you can test it on its own.

---

## How to use this plan

Each step (from Step 2 onward) is self-contained and has the same shape:

- **Goal** — one sentence.
- **Refs** — which PRD user stories / FRs and ARD sections it implements.
- **Depends on** — earlier steps that must be done first.
- **Backend** — what to build on the API/worker side, with key files, commands, and gotchas.
- **Frontend** — what to build on the user app (`web`) or admin app (`admin`), same format.
- **Automated tests** — the unit / integration / e2e tests to add. **Run the whole suite after the step.**
- **Manual self-test** — the exact things *you* click through to confirm the feature works.
- **Definition of Done (DoD)** — the checklist that closes the step.

**The loop for every step:**

```
1. Build backend  → 2. Build frontend  → 3. Write the step's tests
4. Run the FULL automated suite:  pnpm test  (and pnpm test:e2e for journeys)
5. Only if green → go through the "Manual self-test" list by hand
6. Tick the DoD checklist → commit → next step
```

Nothing technical ever reaches the user (ARD §16): all user-facing errors are Persian, mapped centrally by `code`. Keep that rule alive in every slice.

---

## Tech stack (from the ARD, for quick reference)

| Layer | Choice |
|---|---|
| Monorepo | `apps/api`, `apps/worker`, `apps/web`, `apps/admin` + `packages/*` shared |
| Backend | NestJS, code-first GraphQL (Apollo), Prisma, BullMQ |
| Frontend | Next.js 14 (App Router), Apollo Client, Zustand, Tailwind (RTL), TipTap |
| DB | PostgreSQL + `pgvector`, Prisma ORM |
| Cache/Queue/PubSub | Redis (BullMQ + GraphQL Subscriptions pubsub) |
| AI | Google Gemini + OpenAI embeddings, **all via the Metis gateway** |
| Storage | Arvan Object Storage (S3-compatible), presigned URLs |
| Payment | Zarinpal REST |
| OTP | SMS Web Service (پیامک) + Bale (بله), admin-selectable mode |
| Hosting | Liara (Docker), Arvan DNS/CDN, Nginx |

**Hard rules that apply to every step** (don't let a slice violate these):

- **UI must match the design template exactly.** The full UI design lives in **`document/design-Tempelet/`**. Every user-facing screen (the `web` app) must be built to **match that template exactly** — same layout, spacing, typography, colors, components, and states — not "inspired by" it. Before building any screen in any slice, open the template, find the matching screen, and reproduce it faithfully. Where the template doesn't cover a screen, follow its established design language and tokens rather than inventing a new look. (The admin app may reuse the same tokens/typography but is desktop-first and data-dense, so it need not match the template screen-for-screen — ARD §3.2.1.)
- **No foreign CDNs.** Every asset (Vazirmatn font, libs, icons) is vendored and served from your own infra (ARD §3.2 asset policy).
- **Jalali only at the UI/output boundary.** Store all dates as UTC ISO; convert to Shamsi + Persian numerals only when displaying or rendering a PDF/receipt (FR-57, ARD §3.2).
- **Two token worlds.** User JWTs and admin JWTs use **different secrets** and an `aud` claim; neither works on the other's resolvers (ARD §7.4).
- **Errors are centralized.** Server returns `{ code, data?, traceId }`; the frontend maps `code` → Persian (ARD §16).

---

## Step index

| # | Step | Type | Apps touched |
|---|---|---|---|
| 1 | Foundation & scaffolding | Setup | all |
| 2 | Authentication + free credits | Slice | api, web |
| 3 | Folder management | Slice | api, web |
| 4 | Upload & AI note generation (async) | Slice | api, worker, web |
| 5 | In-app notifications | Slice | api, web |
| 6 | Note viewing & editing | Slice | api, web |
| 7 | AI chatbot (RAG) | Slice | api, worker, web |
| 8 | PDF export | Slice | api/worker, web |
| 9 | Credit packs & Zarinpal payment | Slice | api, web |
| 10 | PWA polish | Slice | web |
| 11 | Public landing page | Slice | web |
| 12 | Admin auth + audit-log infra | Slice | api, admin |
| 13 | Admin user management | Slice | api, admin |
| 14 | Admin plans & payments | Slice | api, admin |
| 15 | Admin analytics dashboard | Slice | api, admin |
| 16 | Admin settings (OTP mode) + admin management | Slice | api, admin |
| 17 | Hardening, observability & deployment | Setup | all |

---

# Step 1 — Foundation & Scaffolding

**Goal:** A working monorepo where every app boots, the full DB schema exists, infra clients (DB/Redis/S3) connect, the central error + auth + Jalali plumbing is in place, and CI runs green on an empty feature set — so every later slice just plugs in.

**Refs:** ARD §3 (stack), §4 (schema), §14 (env), §15 (deploy/test), §16 (errors), §3.2 (assets, dates).

**Depends on:** nothing.

> This is the only "non-slice" step at the start. It has no user-facing feature, so its "test" is *infra checks* and *green CI*, not a click-through.

### 1.1 Repo & tooling

- Create monorepo with **pnpm workspaces** (Turborepo optional for caching).
  ```
  neviso/
  ├─ apps/{api,worker,web,admin}
  ├─ packages/
  │  ├─ db/            → Prisma schema + generated client (shared by api + worker)
  │  ├─ jalali/        → Shamsi<->UTC + Persian-numeral helpers
  │  ├─ errors/        → error codes enum + Persian catalog (shared front/back)
  │  ├─ config/        → env loading/validation (zod), shared tsconfig/eslint
  │  └─ ui/            → shared Tailwind preset + design tokens (optional)
  ├─ docker-compose.yml   → local postgres(+pgvector) + redis
  ├─ .github/workflows/ci.yml
  └─ document/            → design-Tempelet + Metis/SMS/Bale provider docs (already given)
  ```
- Root tooling: TypeScript (strict), ESLint, Prettier, Jest (unit+integration), Playwright (e2e), Husky pre-commit (lint+type).
- Commands to verify: `pnpm install`, `pnpm -r build`, `pnpm -r lint`, `pnpm -r typecheck`.

### 1.2 Local infra (docker-compose)

- Postgres image with `pgvector` (e.g. `pgvector/pgvector:pg16`) and Redis.
- `docker compose up -d` → both reachable. Enable the extension once: `CREATE EXTENSION IF NOT EXISTS vector;` (also encode it in the first Prisma migration).

### 1.3 Database (packages/db)

- Paste the **full Prisma schema from ARD §4.2** verbatim (User, OtpRecord, AppSetting, Folder, Note, NoteFile, NoteChunk, NoteTokenUsage, ChatSession, ChatMessage, CreditTransaction, Plan, JobRecord, Notification, PaymentRecord, Admin, AdminOtp, AuditLog + all enums).
- `NoteChunk.embedding` is `Unsupported("vector(1536)")` — keep the dimension in sync with `METIS_EMBEDDING_MODEL`.
- Commands: `pnpm prisma migrate dev --name init` → `pnpm prisma generate`.
- **Gotcha:** the `vector` column needs the extension created *before* the table; add a raw SQL step at the top of the init migration.

### 1.4 Seed script

- Seed: first **SUPER_ADMIN** (mobile + temp password, ARD §5.9.7), `AppSetting` key `otp.channels = "BOTH"` (ARD §5.9.8), and 2–3 sample `Plan` rows (credit packs).
- Command: `pnpm db:seed`.

### 1.5 API skeleton (apps/api)

- NestJS + `@nestjs/graphql` (code-first, Apollo Driver). Single `/graphql` endpoint; WS enabled via `graphql-ws`.
- Wire infra providers as injectable services (no business logic yet, just clients):
  - `PrismaService`, `RedisService` (ioredis), `StorageService` (Arvan S3 SDK: `presignPut`, `presignGet`, `headObject`), `PubSubService` (Redis-backed for subscriptions).
- **Central error filter** (`formatError`): strip internals in prod, guarantee a `code` (unknown → `INTERNAL_ERROR`), attach `traceId`, log full error to console/Sentry-later (ARD §16.1).
- **Auth foundation:** JWT module (user secrets from env), `GqlAuthGuard` (validates token + rejects `aud:"admin"` + rejects SUSPENDED/BANNED), `GqlOwnerGuard`, `GqlCreditGuard` shells. Implement guards now; resolvers come per slice.
- Health endpoint `GET /health` (checks DB + Redis).
- `zod` env validation at boot — refuse to start if a required env var is missing.

### 1.6 Worker skeleton (apps/worker)

- NestJS **standalone application** consuming BullMQ. Register the `note-generation` queue with `WORKER_CONCURRENCY`. Empty processor for now (logs "received job").
- Shares `packages/db` and the same Redis.

### 1.7 Web skeleton (apps/web)

- Next.js 14 App Router, TypeScript, Tailwind with **RTL plugin**, `dir="rtl"` + `lang="fa"` on `<html>`.
- **Vendored Vazirmatn** font (woff2 files committed, loaded via `next/font/local` — never Google Fonts).
- Map the **design tokens** from ARD §3.2.1 into the Tailwind theme: `--paper/-2`, `--card`, `--ink…--ink-4`, `--saffron (#E8A53D)`, ruby/sage/indigo/slate, spacing/radius/shadow scales. **The full UI design is in `document/design-Tempelet/` — treat it as the visual source of truth and build every screen to match it exactly** (see the hard rule above). Extract its tokens/components here so later slices just assemble template-faithful screens.
- Apollo Client (httpLink + wsLink split, auth via context), Zustand store, **Apollo `errorLink`** that maps `extensions.code` → Persian via `packages/errors` (generic fallback for unknown/network).
- Top-level **React error boundary** → full-page Persian fallback.

### 1.8 Admin skeleton (apps/admin)

- Separate Next.js 14 app (deploys to `admin.nevisoai.ir`), desktop-first, RTL, same tokens, **not** a PWA.
- Apollo Client pointed at the same API but sends the **admin** token; TanStack Table + Recharts installed; same error layer.

### 1.9 CI (gates every push)

- `.github/workflows/ci.yml`: install → lint → typecheck → unit tests → integration tests (spin up Postgres+Redis services). **Red build never builds an image** (ARD §15.3/§15.9).

### Automated tests (Step 1)
- **Unit:** `packages/jalali` round-trip (Shamsi→UTC→Shamsi), Persian-numeral formatting; `packages/errors` every code has a Persian entry (or falls back).
- **Integration:** API boots, `GET /health` returns ok with DB+Redis connected; a trivial `__typename` GraphQL query succeeds; Prisma can write+read one row in the test DB.
- Run: `pnpm test`.

### Manual self-test (Step 1)
1. `docker compose up -d` then `pnpm db:migrate && pnpm db:seed` → no errors; super-admin + plans rows exist (check with `pnpm prisma studio`).
2. `pnpm --filter api dev` → open `http://localhost:3000/health` → `{status:"ok"}`.
3. `pnpm --filter web dev` → blank dashboard shell renders RTL, Vazirmatn font loads from your own server (check Network tab → no `fonts.gstatic.com`).
4. `pnpm --filter admin dev` → admin shell renders on its own port.
5. `pnpm --filter worker dev` → logs "worker ready", connects to Redis.

### Definition of Done
- [ ] `pnpm install && pnpm -r build` succeeds from a clean clone.
- [ ] All four apps boot locally and connect to Postgres/Redis.
- [ ] Full Prisma schema migrated; `vector` extension enabled; seed runs.
- [ ] Central error filter, user JWT guards, Jalali utils, error catalog, Apollo error link, error boundary all in place (even if unused).
- [ ] No external CDN references anywhere; font is self-hosted.
- [ ] CI is green on `main`.

---

# Step 2 — Authentication + Free Credits

**Goal:** A new user logs in with mobile + OTP (or mobile + password after they set one), receives a one-time free credit grant on first login, and can set a password from their profile.

**Refs:** US-01, US-02; FR-01..04, FR-55; ARD §5.2, §7.1, §7.2 (+7.2.1/2/3 providers).

**Depends on:** Step 1.

> **Free grant = 60 credits** (PRD §FR-55/US-02, and now consistent in the ARD). Set `FREE_CREDIT_GRANT=60` and read the amount from env — don't hard-code it.

### Backend
**Build**
- Auth resolver: `otpChannels` (Public), `requestOtp(mobile, channel?)`, `verifyOtp(mobile, code)`, `login(mobile, password)`, `refreshToken`, `logout`, `changePassword`.
- OTP service with **channel resolution** logic (ARD §7.2): read `AppSetting otp.channels`; single channel → use it; `BOTH` → require/remember `User.preferredOtpChannel`.
- **Provider adapters behind one interface** (`OtpSender`): `SmsWebServiceSender` (`SendTokenSingle`, §7.2.2) and `BaleSender` (OAuth token cached in Redis + `send_otp`, §7.2.3). Plus a `FakeOtpSender` for tests/dev (logs the code).
- Phone normalization util (`9XXXXXXXXX`, regex `^9\d{9}$`); Bale gets `98`+digits, SMS gets the 10 digits.
- Cross-channel fallback in `BOTH` mode: Bale `404 code 17` → resend via SMS, return `channel: SMS`.
- Rate limit: 1 OTP / 2 min per mobile (Redis key).
- `verifyOtp`: upsert User → if `freeCreditsGiven=false` grant **60** credits (`CreditTransaction FREE_GRANT`, set flag), issue tokens, return `isNewUser`.
- JWT: 15-min access (returned to client), 30-day refresh (**HttpOnly cookie**, SameSite=Strict), rotation on refresh, invalidated tokens tracked in Redis (§7.1).
- `myCredits` query (balance) — needed by the dashboard badge.

**Key files:** `apps/api/src/auth/{auth.module,auth.resolver,auth.service}.ts`, `apps/api/src/auth/otp/{otp.service,sms-webservice.sender,bale.sender,fake.sender}.ts`, `apps/api/src/auth/jwt.strategy.ts`, `packages/...` phone util.

**Commands:** `pnpm --filter api dev`; provider creds from `.env` (use Fake sender locally).

**Gotchas**
- Bale token must be **cached** (≈12h) and refreshed on `401`; don't fetch per send.
- `login` and OTP must both run the SUSPENDED/BANNED check so a blocked user can't get fresh tokens (§7.3).
- OTP code is always generated by *you* (Bale needs the code supplied, not templated).
- The refresh cookie must be readable by the API domain; set `Domain`/`Secure`/`SameSite` correctly.

### Frontend (web)
**Build**
- `/login` page: single page showing **both** methods; for an unknown mobile, password field is disabled (OTP only) until they’ve logged in once.
- Channel picker (پیامک / بله) shown **only** when `otpChannels` returns both; remember the choice.
- OTP entry with 120s countdown + resend; inline Persian errors (`OTP_INVALID`, `OTP_EXPIRED`, `OTP_TOO_SOON`, `OTP_BALE_NO_ACCOUNT`, …).
- Store access token in memory (Zustand); rely on the HttpOnly cookie for refresh; silent refresh on 401.
- Auth route guard → redirect unauthenticated users to `/login`.
- Profile → "set password" form (enabled after first login); credit balance visible in the dashboard header.

**Key files:** `apps/web/app/login/page.tsx`, `apps/web/components/auth/*`, `apps/web/lib/auth-store.ts`, `apps/web/app/(app)/profile/page.tsx`.

**Gotchas:** keep `+98`/`۹۸` as display-only; submit the bare 10 digits. Don’t render any raw server message — only mapped Persian.

### Automated tests
- **Unit:** phone normalization; channel resolution table (SMS_ONLY/BALE_ONLY/BOTH); free-grant-once logic; OTP rate-limit window.
- **Integration (real test Postgres + fakes):** request→verify happy path mints tokens + grants 60 once (second login grants nothing); wrong/expired code rejected; `BOTH`-mode Bale-404 → SMS fallback; refresh rotation; suspended user blocked at login.
- Run: `pnpm test`.

### Manual self-test
1. Open `/login` with a brand-new mobile → only OTP enabled; request code → (dev: read code from Fake sender log) → verify → land on dashboard.
2. Header shows **60** credit balance; new user.
3. Profile → set a password; log out; log in again with **mobile + password** → works; balance still 60 (no second grant).
4. In `BOTH` mode, the channel picker appears; pick Bale for a non-Bale number → UI says code sent by پیامک instead.
5. Try requesting two codes within 2 min → `OTP_TOO_SOON` Persian message inline.

### Definition of Done
- [ ] OTP + password login both work; first-login-only free grant of the agreed amount.
- [ ] Channel modes + Bale→SMS fallback behave per §7.2.1.
- [ ] Tokens: 15m access in memory, 30d refresh cookie, rotation, blocked-user enforcement.
- [ ] All errors shown as Persian; suite green; manual list passes.

---

# Step 3 — Folder Management

**Goal:** A user creates subject folders (name + spine color + optional cover image), sees them on the dashboard, edits/deletes them, and (later) moves notes between them.

**Refs:** US-05; FR-10..13; ARD §5.3.

**Depends on:** Steps 1–2 (auth, `StorageService`).

### Backend
**Build**
- Resolver: `folders` (mine), `createFolder(input)`, `updateFolder(id,input)`, `deleteFolder(id)` — all behind `GqlAuthGuard` + `GqlOwnerGuard`.
- Folder cover image upload: reuse `StorageService.presignPut` (a small generic image presign; the note-upload slice extends this). Client uploads cover to Arvan, sends back `coverUrl`.
- Delete semantics: decide cascade vs block-if-not-empty (recommend: block delete if folder has notes, or soft-confirm on the client; document the choice).

**Key files:** `apps/api/src/folders/{folders.module,folders.resolver,folders.service}.ts`.

**Gotchas:** never trust a client-supplied `userId`; derive owner from the token. Validate `coverUrl` actually lives under that user's storage prefix.

### Frontend (web)
**Build**
- Dashboard folder grid/list (cards with cover + name + note count).
- "New folder" modal: name + spine color (preset palette) + optional cover (image compressed client-side via `browser-image-compression`, presign → PUT → save).
- Edit/rename, delete with confirm prompt.

**Key files:** `apps/web/app/(app)/dashboard/page.tsx`, `apps/web/components/folders/*`.

### Automated tests
- **Unit:** create/update input validation (Zod).
- **Integration:** CRUD scoped to the owner (user B cannot read/update/delete user A's folder → `FORBIDDEN`/`FOLDER_NOT_FOUND`); cover URL ownership check.
- Run: `pnpm test`.

### Manual self-test
1. Create a folder "ریاضی ۱" with a cover photo → appears as a card.
2. Rename it; change cover → updates.
3. Create one with no cover → still valid.
4. Delete an empty folder (confirm prompt) → gone. Try the chosen empty/non-empty rule.
5. Log in as a second user → you cannot see the first user's folders.

### Definition of Done
- [ ] Folder CRUD works and is strictly owner-scoped.
- [ ] Cover upload works via presigned PUT; client-side compression in place.
- [ ] Confirm prompt on delete; suite green; manual list passes.

---

# Step 4 — Upload & AI Note Generation (async)

**Goal:** The big one. A user picks a folder, uploads audio/images, the system checks credits, uploads directly to storage, enqueues a job; the worker generates the note via Gemini-over-Metis, and the user sees live status until the note is ready — with credits reserved, finalized on success, refunded on failure.

**Refs:** US-03; FR-05..09, FR-31, FR-54; ARD §5.4, §6.0, §6.1, §6.4, §6.5, §8, §9, §17.2.

**Depends on:** Steps 1–3.

> This slice produces a *readable* note (`status=DONE`). RAG indexing (chunk+embed) is added in Step 7; notification **creation** happens here, but the bell/panel UI is Step 5.

### Backend (API)
**Build**
- `requestUploadUrls(input)` (`GqlCreditGuard`): validate folder ownership, **file counts/formats/declared sizes + per-session 300 MB** (§8.3), estimate credits from sizes/duration, **presigned PUT URLs (30-min, Content-Type + Content-Length conditions)**, create UploadSession (Redis), return keys+URLs.
- `confirmUpload(input)`: `HeadObject` each file exists → **pre-deduct estimated credits** (`CreditTransaction USAGE`, `idempotencyKey usage:{noteId}`) → create `Note(PENDING)` + `NoteFile`s + `JobRecord` → enqueue BullMQ `note-generation` → return `{noteId, jobId, status}`.
- `noteAudioUrl` presigned GET (15-min) for later playback.
- Subscriptions: `noteStatusChanged`, `creditUpdated` (Redis PubSub, filtered by user — §9).

### Backend (Worker)
**Build the pipeline (§6.1 steps 6a–6h):**
1. status → PROCESSING, publish `noteStatusChanged`.
2. Download files from Arvan (server creds); **convert HEIC/HEIF → JPEG via `sharp`**.
3. Re-verify audio **duration ≤ 90 min** from the real file (`NOTE_INPUT_TOO_LONG` + refund if over).
4. Upload media to **Metis storage** (`POST /api/v1/storage`), cache URLs on `JobRecord.metisFileUrls` (idempotent retry).
5. `generateContent` to `METIS_GEMINI_MODEL` (single multimodal request, `responseMimeType: application/json`) → `{title, contentJson}`.
6. **Validate** it's a well-formed ProseMirror doc; save `contentJson` **and** `originalContentJson` + title; capture `usageMetadata` into `NoteTokenUsage` + denormalized totals.
7. status → DONE; **create `Notification(NOTE_DONE)`**; publish `noteStatusChanged(DONE)` + `notificationReceived`.
8. Finalize credit charge (keep reserved USAGE) → publish `creditUpdated`.
- **Error taxonomy + retries** (§6.4): transient/rate-limited → backoff retry; fatal (malformed/bad_request/auth/balance/oversized) → terminal. Terminal: status FAILED, `failureReason`, **refund** (`idempotencyKey refund:{noteId}`), `Notification(NOTE_FAILED)`, publish events, keep job in dead-letter.
- Guard rails: `WORKER_CONCURRENCY`, shared Redis limiter `METIS_MAX_CONCURRENCY`, per-user `USER_MAX_INFLIGHT_JOBS` (§6.5). Per-call timeouts (§6.4.6).

**Key files:** `apps/api/src/upload/*`, `apps/api/src/notes/notes.resolver.ts` (read side), `apps/worker/src/note-generation/{processor,metis.client,prompt.ts}`, `apps/worker/src/notifications/notifications.service.ts`, shared `MetisClient` in a package.

**Gotchas**
- Credit is **reserved at confirm**, not at request; refund must be idempotent so a retry/double-callback never double-refunds.
- Worker fetches files **server-side**, not via the presigned PUT URL — queue wait time is irrelevant to the 30-min expiry (§6.1 note).
- Metis: two auth styles, one key (`x-goog-api-key` for generate, `Bearer` for storage/embeddings). `402` = top-up needed → alert, fatal.
- Validate the model's JSON strictly; a malformed doc is a fatal class (no infinite retry).

### Frontend (web)
**Build**
- A global **"بارگذاری / Upload" button** (header / dashboard) → opens a dedicated **upload page** (`/upload`). The flow is upload-first, not folder-first: the user starts from the button, then chooses the destination *on the upload page*.
- On the upload page, **destination-folder selection is the first, mandatory field** (FR-10): a folder picker listing her folders **plus a "+ پوشه جدید / new folder"** option that creates one inline during the flow (FR-11, name + optional cover). No folder selected → can't proceed.
- File picker (audio mp3/m4a/aac/wav/ogg + in-app webm; images jpg/png/heic), **client-side image compression** + **read audio duration** to send with the request, optional **Jalali date picker** for `recordedAt` (blank → today).
- Credit pre-check UI: if insufficient, show `INSUFFICIENT_CREDITS` + link to pricing.
- Direct PUT to presigned URLs with progress bars; **navigation guard** warning if leaving mid-upload.
- After `confirmUpload`: route back to the dashboard / chosen folder and show the note card in **PROCESSING**; subscribe to `noteStatusChanged` → flip to DONE (link to note) or FAILED (error + re-upload). Live credit balance via `creditUpdated`.

**Key files:** `apps/web/app/(app)/upload/page.tsx`, `apps/web/components/upload/*` (incl. `FolderSelect` with inline-create), `apps/web/lib/upload.ts`, `apps/web/components/notes/NoteCard.tsx`.

**Gotchas:** enforce the same caps client-side for fast feedback, but the server is the source of truth. HEIC may not preview in-browser — upload as-is, server converts.

### Automated tests
- **Unit:** credit estimate/rounding (audio per-minute round-up, image ×2); idempotency-key construction; file-limit validator; prompt builder; error-class mapping.
- **Integration:** `requestUploadUrls`→`confirmUpload` reserves credits and creates Note/JobRecord; **worker lifecycle with a fake Metis** — DONE finalizes the charge, failure refunds exactly once; duration over cap → `NOTE_INPUT_TOO_LONG` + refund; HEIC conversion path; subscription publishes on each transition.
- **E2E (later, Step 17 suite):** upload → processing → generated note appears.
- Run: `pnpm test`.

### Manual self-test
1. Click the global **Upload** button → on the upload page, the folder picker is first; pick a folder (or create one inline), then upload one short audio + one board photo, pick a Jalali lecture date → submit → see live "در حال پردازش".
2. Credit balance drops by the estimate; when done, card flips to "آماده" and the note opens with a title + body.
3. Force a failure (point Metis at a bad key in dev) → card shows failed, **credits refunded**, balance restored.
4. Upload with too little credit → blocked with Persian message + pricing link.
5. Try to navigate away mid-upload → warning prompt. Upload an over-90-min file → rejected with refund.

### Definition of Done
- [ ] Upload starts from a global Upload button → upload page where **folder selection is mandatory** (FR-10) with inline new-folder create (FR-11).
- [ ] Presigned direct upload with full server-side limit enforcement.
- [ ] Worker generates a valid note via Metis; tokens captured; HEIC handled.
- [ ] Credits reserved→finalized on success, **refunded once** on failure.
- [ ] Live status + balance via subscriptions; navigation guard; all Persian errors.
- [ ] Suite green; manual list passes.

---

# Step 5 — In-App Notifications

**Goal:** The user sees a notification bell with an unread badge, a slide-in panel of recent events, and a real-time toast when a note finishes — surviving refresh/re-login.

**Refs:** US-10; FR-27..34; ARD §5.8, §17.

**Depends on:** Step 4 (worker already creates `Notification` rows + publishes `notificationReceived`).

### Backend
**Build**
- Resolver: `notifications` (latest 50, newest first), `unreadNotificationCount`, `markNotificationRead(id)`, `markAllNotificationsRead`, `deleteNotification(id)`. `notificationReceived` subscription already exists from Step 4.
- Nightly BullMQ cron: delete notifications older than **90 days** (§17.7).

**Key files:** `apps/api/src/notifications/{notifications.resolver,notifications.service}.ts`, `apps/worker/src/cron/notification-cleanup.ts`.

### Frontend (web)
**Build**
- `NotificationBell` (badge from `unreadNotificationCount`, increments on subscription event), `NotificationPanel` (slide-in, up to 50, unread styled distinctly, "mark all read", closes on outside-click/Esc), `NotificationItem`.
- Real-time **toast** on `notificationReceived` (auto-dismiss 6s; "مشاهده جزوه" deep-links + marks read).
- Routing: `NOTE_DONE` → `/notes/{id}` (mark read); `NOTE_FAILED` → upload page with error toast.
- Offline resilience: on load/focus, refetch `unreadNotificationCount` + list.

**Key files:** `apps/web/components/notifications/*`, header integration.

**Gotchas:** subscription filter is server-side by `userId` — never trust client filtering. Badge state is DB-backed; don't keep it only in memory.

### Automated tests
- **Unit:** unread-count reducer; mark-read transitions.
- **Integration:** creating a notification (simulate worker) increments count; `markAllNotificationsRead` zeroes it; list capped at 50 newest-first; 90-day cleanup deletes only old rows.
- Run: `pnpm test`.

### Manual self-test
1. Trigger a note generation; while on any page, a toast pops when it's ready → click it → opens the note, badge decrements.
2. Open the panel → recent events with title/folder/status/time; unread look different.
3. "Mark all read" → badge clears; refresh the page → still cleared (persisted).
4. Generate, then refresh before it finishes → on reload the unread badge reflects the completed job.
5. A failed note shows a failed notification → clicking goes to upload with an error message.

### Definition of Done
- [ ] Bell + badge + panel + real-time toast all working.
- [ ] Read/unread persists across refresh and re-login; max 50; 90-day purge.
- [ ] Deep-links correct for DONE/FAILED; suite green; manual list passes.

---

# Step 6 — Note Viewing & Editing

**Goal:** The user opens a note in a full RTL rich-text editor, edits title/body/lecture-date, plays the original audio inline, and can reset to the AI original, move, or delete the note.

**Refs:** US-04, US-06; FR-08, FR-12, FR-14, FR-15; ARD §5.4, §3.2 (TipTap extensions).

**Depends on:** Steps 4 (notes exist), 3 (folders for move).

### Backend
**Build**
- Resolver: `note(id)`, `notes(folderId)`, `updateNote(id,input)` (edits `contentJson`/`title`/`recordedAt`, sets `isEdited=true`), `resetNoteToOriginal(id)` (restore from `originalContentJson`, `isEdited=false`), `moveNote(id,targetFolderId)`, `deleteNote(id)`. `noteAudioUrl(noteId)` signed GET.
- Owner-scope everything; `deleteNote` does **not** refund credits (US-06).

**Key files:** `apps/api/src/notes/{notes.resolver,notes.service}.ts`.

**Gotchas:** `originalContentJson` is set once at generation and **never** changed by edits (it's the chat/RAG source and the reset source). Validate incoming `contentJson` is a sane ProseMirror doc.

### Frontend (web)
**Build**
- Note editor page: **TipTap** with the exact extensions from ARD §3.2 — Heading, Bold/Italic/Underline, TextStyle+Color, Highlight, FontFamily, Bullet/Ordered lists, **Table**, TextAlign (left/right/center), **per-block direction (LTR/RTL)**.
- Editable title; **Jalali date picker** for `recordedAt`.
- **Wavesurfer.js** audio player (fetches `noteAudioUrl`).
- Save: autosave (debounced) and/or explicit save button; "reset to AI original" with confirm; move-to-folder; delete with confirm (warns credits aren't refunded).

**Key files:** `apps/web/app/(app)/notes/[id]/page.tsx`, `apps/web/components/editor/*`.

**Gotchas:** TipTap output must be sanitized (XSS, §13). Show dates in Jalali + Persian numerals but store/send UTC. Don't lose unsaved edits on navigation.

### Automated tests
- **Unit:** ProseMirror doc validation; `isEdited` flag transitions; Jalali picker → UTC conversion on save.
- **Integration:** `updateNote` sets `isEdited`; `resetNoteToOriginal` restores original + clears flag; `moveNote` re-parents within the same owner; delete is owner-scoped and refunds nothing.
- **E2E (Step 17):** open note → edit → reset.
- Run: `pnpm test`.

### Manual self-test
1. Open a generated note → edit text, add a table, change color/highlight, switch a paragraph to LTR → save → reload shows changes.
2. Change the lecture date with the Jalali picker → persists, displays in Persian numerals.
3. Play the original audio inline.
4. "Reset to original" → body reverts to the AI version, edit flag clears.
5. Move the note to another folder; delete a note (confirm) → balance unchanged.

### Definition of Done
- [ ] Full RTL TipTap editor with all required marks/blocks/alignment/direction.
- [ ] Title + lecture-date editing; inline audio playback; autosave/save.
- [ ] Reset/move/delete correct; original content immutable; no credit refund on delete.
- [ ] Suite green; manual list passes.

---

# Step 7 — AI Chatbot (RAG)

**Goal:** The user picks a folder (all its notes selected by default, can narrow), asks questions, and gets answers grounded **only** in their notes — with multi-turn follow-ups and indefinitely-saved history.

**Refs:** US-08; FR-19..23; ARD §5.6, §6.0 (embeddings), §4.2 (`NoteChunk`).

**Depends on:** Steps 4 + 6 (notes + `originalContentJson`).

### Backend — indexing (extend the worker)
**Build**
- After a note hits DONE, chunk `originalContentJson` (~500-token plain-text chunks), batch-embed via **Metis embeddings** (`text-embedding-3-small`, 1536-dim), store `NoteChunk` rows, set `Note.isIndexed=true`. Capture embedding token usage into `NoteTokenUsage`.
- Note stays readable while `isIndexed=false`; chat waits for `true`.

### Backend — chat
**Build**
- Resolver: `chatSessions`, `chatSession(id)`, `createChatSession(folderId, selectedNoteIds)`, `sendChatMessage(sessionId, content)`, `deleteChatSession(id)`.
- `sendChatMessage` flow (§5.6): (1) condense follow-up into a standalone query using recent history; (2) embed the standalone query; (3) **pgvector cosine search** over `NoteChunk` filtered to `selectedNoteIds`; (4) top-5 chunks; (5) `generateContent` with the RAG system prompt + chunks + **last 15 messages** + new message; (6) save both messages. Charge **10 credits/message** (`GqlCreditGuard`).
- Strict grounding: the system prompt forbids outside knowledge; answer from retrieved chunks only.

**Key files:** `apps/worker/src/note-generation/indexer.ts`, `apps/api/src/chat/{chat.resolver,chat.service,rag.service}.ts`.

**Gotchas:** retrieval uses the **condensed** query (so "explain that" still finds the right chunks); generation replays only the last 15 turns (older turns stay stored). Chunks come from `originalContentJson`, **not** user edits. pgvector needs an index for speed at scale (start simple; add IVFFlat/HNSW later).

### Frontend (web)
**Build**
- Chat entry: **must** select a folder (required) → all notes auto-selected; allow deselecting down to a single note.
- ChatGPT-style thread UI; session list/history; reopen + continue any past session; new-message streaming-ish UX (or await response). Show the 10-credit cost and update balance via `creditUpdated`.

**Key files:** `apps/web/app/(app)/chat/*`, `apps/web/components/chat/*`.

### Automated tests
- **Unit:** chunker; follow-up condensation prompt; top-K selection; credit charge (10/msg).
- **Integration:** indexing creates `NoteChunk`s + sets `isIndexed`; RAG retrieval returns chunks only from `selectedNoteIds`; chat persists user+assistant messages; history retained; out-of-scope question yields a "not in your notes" style answer (grounding).
- Run: `pnpm test`.

### Manual self-test
1. Open chat, pick a folder → all notes selected → ask a question answered from those notes.
2. Deselect to a single note → answers narrow to it.
3. Ask a vague follow-up ("بیشتر توضیح بده") → still on-topic (condensation works).
4. Ask something not in the notes → it declines / says it's not in your material (no outside knowledge).
5. Reopen a past session later → full history present, continue it. Balance drops 10/message.

### Definition of Done
- [ ] Notes are chunked + embedded; `isIndexed` gates chat.
- [ ] RAG answers are grounded in selected notes only; multi-turn follow-ups work.
- [ ] History saved indefinitely + resumable; 10 credits/message charged.
- [ ] Suite green; manual list passes.

---

# Step 8 — PDF Export

**Goal:** The user downloads a single note — or a whole folder — as a watermarked PDF with Jalali dates.

**Refs:** US-07; FR-16..18; ARD §5.5, §11.

**Depends on:** Step 6 (note content).

### Backend
**Build**
- Queries: `exportNotePdf(noteId)`, `exportFolderPdf(folderId)` → render `contentJson` → HTML → **PDF** (Puppeteer on the worker container, or `@react-pdf/renderer` — see §18 note), with a semi-transparent diagonal **watermark** «نویسو | nevisoai.ir» on every page, PDF metadata (§11.3), and **all dates converted to Jalali + Persian numerals server-side**.
- Folder export: concatenate notes with page breaks + an auto table of contents; each section header = title + lecture date.
- Store the PDF temporarily in `neviso-exports`, return a **15-min signed URL**; client fetches the binary directly.

**Key files:** `apps/worker/src/export/{pdf.service,template.tsx}` (or in api), `apps/api/src/export/export.resolver.ts`.

**Gotchas:** Puppeteer/headless Chrome spikes memory under load (§18) — set memory limits, reuse a browser instance, consider `@react-pdf/renderer` if it strains the container. RTL + Persian font must be embedded in the PDF (vendored Vazirmatn), not pulled from a CDN.

### Frontend (web)
**Build**
- "Export PDF" on the note page and "Export folder" on the folder view → call query → download from the signed URL with a progress/spinner; handle failure with a Persian toast.

**Key files:** `apps/web/components/export/*`.

### Automated tests
- **Unit:** ProseMirror→HTML conversion; date→Jalali in rendered output; watermark present; TOC generation for folder export.
- **Integration:** export query returns a working signed URL; folder export includes all notes + TOC.
- Run: `pnpm test`.

### Manual self-test
1. Export a single note → PDF downloads, opens RTL with correct Persian text, dates in Jalali, watermark on every page.
2. Export a folder with several notes → one combined PDF, TOC at the front, page breaks between notes, each with its title + lecture date.
3. Confirm the download link stops working after ~15 minutes.

### Definition of Done
- [ ] Single + folder PDF export with watermark, Jalali dates, embedded font, metadata.
- [ ] Temporary signed-URL delivery; failures handled in Persian.
- [ ] Suite green; manual list passes.

---

# Step 9 — Credit Packs & Zarinpal Payment

**Goal:** The user views credit packs, buys one through Zarinpal (one-time), and credits land instantly and permanently — with a receipt and purchase history, robust against double-callbacks and lost captures.

**Refs:** US-09; FR-24..26; ARD §5.7, §12.

**Depends on:** Steps 1–2 (auth, credit ledger).

### Backend
**Build**
- Queries: `plans` (Public, active packs, both prices), `myTransactions`. Mutation: `initiatePayment(planId)`.
- `initiatePayment`: create `PaymentRecord(PENDING, amount=plan.priceIRT)` → Zarinpal `request.json` (`currency:"IRT"`, amount in Toman, `callback_url`, `metadata.mobile`) → store `authority` → return `StartPay` URL.
- **REST callback** `GET /api/payments/verify?Authority=&Status=` (the *only* REST endpoint): on `OK` → `verify.json` (same amount); **treat code 100 and 101 as success**; idempotently mark `PAID`, store `ref_id`+masked `card_pan`, add credits **exactly once** (`CreditTransaction PURCHASE`, `idempotencyKey purchase:{paymentRecordId}`), publish `creditUpdated`; redirect `/dashboard?payment=success`. Non-OK / bad code → `FAILED` → `?payment=failed`.
- **Reconciliation cron**: re-verify `PENDING` records that have an `authority` but no callback (buyer closed the tab) so a captured payment is never lost.

**Key files:** `apps/api/src/payments/{payments.resolver,payments.service,zarinpal.client}.ts`, `apps/api/src/payments/payments.controller.ts` (REST callback), `apps/worker/src/cron/payment-reconcile.ts`.

**Gotchas:** the verify `amount` **must equal** the request amount or Zarinpal returns `-50`. Idempotency is the whole game — double callback, refresh, and reconciliation must never grant credits twice. Editing a pack's price never changes past `PaymentRecord` amounts.

### Frontend (web)
**Build**
- Pricing page: cards per pack with **struck-through original price + highlighted discounted price** and credit amount; "buy" → `initiatePayment` → redirect to Zarinpal.
- Result handling on `/dashboard?payment=success|failed`: success toast + updated balance (live via `creditUpdated`) + receipt; failure → Persian `PAYMENT_FAILED`.
- Purchase history (from `myTransactions`), dates in Jalali.

**Key files:** `apps/web/app/(app)/pricing/page.tsx`, `apps/web/app/(app)/billing/*`.

### Automated tests
- **Unit:** Toman amount mapping; success-code set {100,101}; idempotency-key build.
- **Integration (fake gateway):** initiate creates PENDING + authority; verify grants credits **once** even if the callback fires twice (code 100 then 101); amount-mismatch (-50) → FAILED, no credits; reconciliation verifies an orphaned PENDING.
- **E2E (Step 17):** buy a pack against a mock gateway.
- Run: `pnpm test`.

### Manual self-test
1. Pricing page shows packs with both prices; buy one → redirect to Zarinpal (sandbox) → pay → back on dashboard with success + credits added.
2. Hit the callback URL twice manually → credits added only once.
3. Start a payment, abandon it (close tab) → reconciliation later marks it correctly (no phantom credits).
4. Cancel/fail a payment → Persian failure message, no credits.
5. Purchase history lists the transaction with a Jalali date + receipt.

### Definition of Done
- [ ] One-time pack purchase end-to-end; credits instant + non-expiring.
- [ ] Verify idempotent (100/101); amount-checked; reconciliation for lost captures.
- [ ] Receipt + history; live balance; Persian failure handling.
- [ ] Suite green; manual list passes.

---

# Step 10 — PWA Polish

**Goal:** The user dashboard installs to the home screen, has an app icon/splash, and behaves gracefully offline.

**Refs:** PRD §6 (PWA); ARD §10.

**Depends on:** core dashboard (Steps 2–9 enough to be meaningful).

### Frontend (web)
**Build**
- `next-pwa` (Workbox) service worker with the §10.1 caching strategies: **Cache First** for vendored static/fonts/icons, **Network First** for notes/folders, **Stale-While-Revalidate** for profile/credit balance.
- `manifest.json` (§10.2): name «نویسو», `start_url:/dashboard`, `display:standalone`, `dir:rtl`, `lang:fa`, icons 192/512.
- Install prompt UX; offline fallback page in Persian.

**Key files:** `apps/web/next.config.js` (pwa), `apps/web/public/manifest.json`, `apps/web/public/icons/*`.

**Gotchas:** never cache the GraphQL **auth/mutation** responses; don't let the SW serve stale credit balances as truth. Admin app is intentionally **not** a PWA — leave it alone.

### Automated tests
- **Unit/build check:** manifest validity; SW registers; caching rules wired.
- (Most verification here is manual / Lighthouse.)
- Run: `pnpm test` + a Lighthouse PWA check in CI (optional).

### Manual self-test
1. On mobile (or Chrome devtools), the install prompt appears → install → app opens standalone with the Neviso icon, RTL.
2. Go offline → cached pages still render; an action needing the network shows a Persian offline message, not a crash.
3. Come back online → data refreshes; credit balance is current (not a stale cached value).

### Definition of Done
- [ ] Installable PWA with correct manifest/icons, RTL, standalone.
- [ ] Caching strategies match §10.1; offline fallback in Persian.
- [ ] Auth/mutations never cached; suite green; manual list passes.

---

# Step 11 — Public Landing Page

**Goal:** A fast, SEO-friendly Persian homepage that explains the product, shows features and credit packs, and drives sign-up/login.

**Refs:** PRD §6 (Landing); ARD §1 (Public Landing, SSG).

**Depends on:** Step 9 (`plans` query for pricing).

### Frontend (web)
**Build**
- SSG/SSR marketing page: hero, problem/solution, feature highlights (voice→note, images, editor, PDF, chatbot), **pricing section reading live `plans`**, clear login/sign-up CTA, footer.
- SEO: metadata, OpenGraph, Persian `lang`/`dir`, sitemap/robots; vendored assets only.
- Responsive (mobile/tablet/desktop), consistent with the design tokens.

**Key files:** `apps/web/app/(marketing)/page.tsx`, `apps/web/app/(marketing)/*`.

### Automated tests
- **Unit:** pricing section renders from `plans` data; CTA links route to `/login`.
- **E2E (Step 17):** landing loads, pricing shows, CTA navigates to login.
- Run: `pnpm test`.

### Manual self-test
1. Visit `/` → loads fast, RTL, no layout shift; fonts/images all from your own domain.
2. Pricing on the landing page matches the active packs (deactivate a pack in admin later → it disappears here).
3. CTA → login; responsive at mobile/tablet/desktop widths.

### Definition of Done
- [ ] Landing page complete, responsive, SEO-ready, live pricing, working CTA.
- [ ] No external assets; suite green; manual list passes.

---

# Step 12 — Admin Auth + Audit-Log Infrastructure

**Goal:** An admin signs into the separate backoffice with two-step login (phone + password → OTP), gets admin-only tokens that never work on the user API, and every state-changing admin action is recorded immutably.

**Refs:** US-11; FR-35..39, FR-50; ARD §5.9.1, §7.4–7.7, §13.

**Depends on:** Steps 1 (admin app skeleton, seeded super-admin), 2 (OTP senders).

### Backend
**Build**
- Admin GraphQL **isolated module** on the same `/graphql`, guarded so user tokens are rejected. Mutations: `adminLoginStep1(mobile,password)`, `adminLoginStep2(challengeId,code)`, `adminRefreshToken`, `adminLogout`.
- Step 1: verify bcrypt + `isActive`; on any failure return `ADMIN_CREDENTIALS_INVALID` (**no mobile-existence leak**); generate `challengeId` + 6-digit OTP → `AdminOtp` + Redis (5-min) → send OTP to admin mobile via configured channel → return `{challengeId, expiresIn, maskedMobile}`.
- Step 2: validate challenge+code, mark used, set `lastLoginAt`, write `AuditLog(ADMIN_LOGIN, ip)`, issue admin tokens.
- **Admin tokens** (separate secrets, `aud:"admin"`, `role`): access 15m, refresh **8h** HttpOnly cookie scoped to `admin.nevisoai.ir`, rotation, idle re-login (§7.4).
- Guards: `AdminAuthGuard`, `AdminRoleGuard` + `@RequireRole`, **`AuditInterceptor`** (writes an `AuditLog` row on every successful state-changing admin resolver). Optional `NoImpersonationGuard` defined here, used in Step 13.

**Key files:** `apps/api/src/admin/auth/*`, `apps/api/src/admin/common/{admin-auth.guard,admin-role.guard,audit.interceptor}.ts`.

**Gotchas:** the admin OTP uses the **same** channel-mode setting as users. Rate-limit step 1 (5/15min per mobile+IP); repeated bad OTP invalidates the challenge. Audit rows are **append-only** — app code never updates/deletes them.

### Frontend (admin)
**Build**
- Two-step login screen (mobile+password → OTP with `maskedMobile`), admin Zustand store (access token in memory, refresh cookie), idle-logout, route guard. Force password change on first login (temp password).
- App shell: desktop-first nav, role-aware menu (hide actions a role can't do).

**Key files:** `apps/admin/app/login/*`, `apps/admin/lib/admin-auth.ts`, `apps/admin/components/shell/*`.

### Automated tests
- **Unit:** credential-invalid never leaks existence; challenge/OTP validation; role hierarchy (SUPER⊃ADMIN⊃SUPPORT).
- **Integration:** full two-step login issues admin tokens; a **user token is rejected** by admin resolvers and an **admin token is rejected** by user resolvers; `ADMIN_LOGIN` audited; idle/refresh expiry after 8h; `AuditInterceptor` writes a row for a sample state-changing op.
- Run: `pnpm test`.

### Manual self-test
1. On `admin.` (local: admin app port) log in with the seeded super-admin → step 1 then OTP → dashboard shell.
2. Wrong password → generic Persian error that doesn't reveal if the mobile exists.
3. Try the user app's API with the admin token (devtools) → rejected; and vice-versa.
4. Idle past the refresh window → forced re-login.
5. Check the `AuditLog` table → an `ADMIN_LOGIN` row with admin id, ip, timestamp.

### Definition of Done
- [ ] Two-step admin login; separate-secret admin tokens; cross-rejection enforced.
- [ ] Role guard + audit interceptor working; admin OTP via the shared channel setting.
- [ ] Rate-limited; first-login password change; suite green; manual list passes.

---

# Step 13 — Admin User Management

**Goal:** Support staff search users, open a full profile, adjust credits (reason required), suspend/ban/reactivate (reason required), and impersonate a user in a safe read-mostly mode — all audited.

**Refs:** US-12..15; FR-40..46; ARD §5.9.2, §7.7.

**Depends on:** Step 12.

### Backend
**Build**
- Queries `[SUPPORT]`: `adminUsers(filter,page)` (search mobile/name/id, filter status + hasPaid, paginated), `adminUser(id)` (profile, balance, status, folder/note counts, transactions; **never expose the hash** — only `hasPassword`).
- Mutations `[SUPPORT]`: `adminAdjustCredit` (**reason required** → `CreditTransaction ADMIN_ADJUSTMENT` + `AuditLog`, live balance update + `creditUpdated`), `adminSetUserStatus` (reason required for SUSPEND/BAN, optional `suspendedUntil`; blocks login/API + Persian status message), `adminImpersonateUser` (mint **user-scoped** token with `act:{adminId}`, short TTL, non-refreshable; `USER_IMPERSONATE_START` audited).
- Enforce `NoImpersonationGuard` on `initiatePayment`, `requestUploadUrls`, `confirmUpload`, `sendChatMessage`, `changePassword`, all `delete*` → `IMPERSONATION_FORBIDDEN`.

**Key files:** `apps/api/src/admin/users/*`, reuse `NoImpersonationGuard`.

**Gotchas:** missing reason → `ADJUSTMENT_REASON_REQUIRED`. Status check must run in `GqlAuthGuard` *and* at login (Step 2) so a ban takes effect immediately. Impersonation end is best-effort (stateless token) — audit on explicit exit.

### Frontend (admin)
**Build**
- Users table (TanStack Table): search, status/paid filters, pagination, Jalali dates.
- User detail drawer/page: profile + balance + transactions + counts; credit-adjust form (amount + **required reason**); status actions with **confirm prompts** on destructive ones + required reason; "impersonate" button.
- **Impersonation:** open the user app carrying the impersonation token, render a **persistent banner** + one-click exit; sensitive actions are blocked (show `IMPERSONATION_FORBIDDEN`).

**Key files:** `apps/admin/app/users/*`, `apps/admin/components/users/*`, impersonation banner in `apps/web` (reads the `act` token).

### Automated tests
- **Unit:** filter/pagination params; reason-required validation.
- **Integration:** search/filter returns correct sets; credit adjust writes both a transaction **and** an audit row + updates balance; suspend blocks login + API; reactivate restores; impersonation token blocks each sensitive mutation; every mutation writes an audit row.
- **E2E (Step 17):** admin login → adjust credit → impersonate → spending is blocked.
- Run: `pnpm test`.

### Manual self-test
1. Search a user by mobile → open profile → see balance, transactions, counts (no password).
2. Add +50 credits without a reason → blocked; with a reason → balance jumps, transaction + audit row appear.
3. Suspend a user with a reason → that user can't log in (sees Persian suspended message); reactivate → can again.
4. Impersonate a user → banner shows; try to buy credits / upload / delete → all blocked with the impersonation message; exit returns to admin.
5. Check `AuditLog` for credit-adjust, suspend, impersonate-start rows.

### Definition of Done
- [ ] Search/filter/detail; reason-required credit + status changes; live balance.
- [ ] Suspend/ban actually blocks; reactivate works; impersonation safe + audited.
- [ ] Confirm prompts on destructive actions; suite green; manual list passes.

---

# Step 14 — Admin Plans & Payments

**Goal:** Admins create/edit/activate credit packs (without touching past purchases) and review/reconcile all payments and per-user credit history.

**Refs:** US-16, US-17; FR-47, FR-48; ARD §5.9.3, §5.9.4.

**Depends on:** Steps 9 (payments exist), 12.

### Backend
**Build**
- Plans `[ADMIN]`: `adminPlans` (incl. inactive), `adminCreatePlan`, `adminUpdatePlan`, `adminSetPlanActive`. Two prices per pack (original + discounted). Deactivate hides from the public `plans`/landing without affecting history. Every change audited (`PLAN_*`). Block hard-delete of a referenced pack → `PLAN_IN_USE` (deactivate instead).
- Payments `[ADMIN]`: `adminPayments(filter,page)` (status/plan/date-range/user search; returns `totalPaidIRT` for the filter), `adminPayment(id)` (user, pack, amount, authority, ref_id, timestamps). Per-user credit transaction history reuses Step 13's detail.

**Key files:** `apps/api/src/admin/plans/*`, `apps/api/src/admin/payments/*`.

**Gotchas:** editing a price must **not** retroactively change past `PaymentRecord.amountIRT`. Date-range filters take Jalali input from the UI but query on stored UTC.

### Frontend (admin)
**Build**
- Plans manager: list (active+inactive), create/edit form (name, original price, discounted price, credits), activate/deactivate toggle with confirm.
- Payments table: filters (status, plan, **Jalali date-range picker**, user search), summary of total paid in range, detail view.

**Key files:** `apps/admin/app/plans/*`, `apps/admin/app/payments/*`.

### Automated tests
- **Unit:** price validation (discounted ≤ original); date-range Jalali→UTC.
- **Integration:** create/edit/activate audited; deactivated pack disappears from public `plans` but old payments keep their amount; payment filters + `totalPaidIRT` correct.
- Run: `pnpm test`.

### Manual self-test
1. Create a pack → appears on the public pricing page; deactivate it → disappears there, past purchases unchanged.
2. Edit a pack's price → previously recorded payments still show the old amount.
3. Filter payments by PAID + a Jalali date range → list + correct total; open one → see ref_id/authority.
4. Check `AuditLog` for `PLAN_CREATE/UPDATE/SET_ACTIVE`.

### Definition of Done
- [ ] Plan CRUD + activate/deactivate, audited, no retroactive price change.
- [ ] Payments list/detail with working filters + range total; Jalali I/O.
- [ ] Suite green; manual list passes.

---

# Step 15 — Admin Analytics Dashboard

**Goal:** Admins see headline KPIs and trend charts (signups, revenue, notes) over a selectable range.

**Refs:** US-18; FR-49; ARD §5.9.5.

**Depends on:** Steps 12–14 (data to aggregate).

### Backend
**Build**
- `[ADMIN]` queries: `adminDashboardStats(range)` (total/active users, new signups, notes generated, **processing success rate** = DONE/(DONE+FAILED), revenue, paying-user conversion) + `adminRevenueSeries`/`adminSignupSeries`/`adminNotesSeries(range,interval)`. All respect the range; "active user" = created a note/chat message in range (§18 note).

**Key files:** `apps/api/src/admin/analytics/*` (efficient `groupBy`/date-bucket SQL).

**Gotchas:** bucket on UTC, **label** in Jalali on the client. Heavy aggregates — index `createdAt`/`status`; consider caching for big ranges.

### Frontend (admin)
**Build**
- Dashboard: KPI cards + **Recharts** trend lines; range switch (7/30/90 days); all dates Jalali + Persian numerals.

**Key files:** `apps/admin/app/dashboard/*`, `apps/admin/components/charts/*`.

### Automated tests
- **Unit:** success-rate + conversion math; date bucketing per interval.
- **Integration:** seed a known dataset → stats + series match expected counts for each range.
- Run: `pnpm test`.

### Manual self-test
1. Open the dashboard → KPIs populate; switch 7/30/90 days → numbers and charts change accordingly.
2. Generate a note and complete a payment → totals and the relevant trend tick up.
3. Chart axes/labels are Jalali with Persian numerals.

### Definition of Done
- [ ] All KPIs + three trend series, range-aware and correct against seeded data.
- [ ] Jalali labels; performant queries; suite green; manual list passes.

---

# Step 16 — Admin Settings (OTP Mode) + Admin Management

**Goal:** Admins switch the OTP delivery mode at runtime (audited), and super-admins provision/role/deactivate other admins. Plus the audit-log viewer.

**Refs:** US-19; FR-51..53, FR-39; ARD §5.9.7, §5.9.8, §5.9.6, §7.2.1.

**Depends on:** Step 12.

### Backend
**Build**
- `[ADMIN]`: `adminOtpChannelMode`, `adminSetOtpChannelMode(mode)` → persist `AppSetting otp.channels`, audit `OTP_CHANNEL_CONFIG`, takes effect at runtime (public `otpChannels` derives from it).
- `[SUPER_ADMIN]`: `adminListAdmins`, `adminCreateAdmin(input)` (temp password, must change on first login), `adminUpdateAdminRole`, `adminDeactivateAdmin`. No public admin sign-up. Audited (`ADMIN_CREATE/UPDATE_ROLE/DEACTIVATE`).
- `[ADMIN]`: `adminAuditLogs(filter,page)` viewer.

**Key files:** `apps/api/src/admin/settings/*`, `apps/api/src/admin/admins/*`, `apps/api/src/admin/audit/*`.

**Gotchas:** changing to `BALE_ONLY` is risky (no-Bale-account users get `OTP_BALE_NO_ACCOUNT`) — surface a warning in the UI. Switching the mode must immediately change what the **user** login screen shows.

### Frontend (admin)
**Build**
- Settings page: OTP-mode selector (SMS only / Bale only / Both) with the Bale-only warning + confirm.
- Admin management (super-admin only): admins table, create-admin form, role change, deactivate — hidden from non-super roles.
- Audit-log viewer: filterable table (admin, action, target, date-range), Jalali dates, read-only.

**Key files:** `apps/admin/app/settings/*`, `apps/admin/app/admins/*`, `apps/admin/app/audit/*`.

### Automated tests
- **Unit:** mode validation; role-gating of admin-management resolvers.
- **Integration:** setting the mode updates `AppSetting` + audits + flips public `otpChannels`; a non-super admin is blocked from admin management (`ADMIN_FORBIDDEN`); create-admin writes audit + forces password change; audit filters work.
- Run: `pnpm test`.

### Manual self-test
1. As ADMIN, switch OTP mode to SMS-only → user login screen stops showing the channel picker; switch back to Both → picker returns.
2. As a non-super admin, the "Admins" menu is hidden / blocked.
3. As SUPER_ADMIN, create a new admin → they must change the temp password on first login; change a role; deactivate one → they can't log in.
4. Open the audit log → see entries for the mode change and admin actions, filterable, Jalali dates.

### Definition of Done
- [ ] Runtime OTP-mode switch (audited) that the user app respects immediately.
- [ ] Super-admin-only admin management; audit-log viewer; role gating enforced.
- [ ] Suite green; manual list passes.

---

# Step 17 — Hardening, Observability & Deployment

**Goal:** Take the feature-complete system to production on Liara: real Nginx routing per subdomain, Docker images, security hardening, monitoring/alerts, backups/DR, and the full e2e suite gating promotion.

**Refs:** ARD §13 (security), §15 (deploy/devops/testing/observability/backup), §6.4.7, §12 (reconciliation).

**Depends on:** all prior steps.

> Not a user feature — its "manual test" is a production smoke test and a deliberate failure drill.

### Backend / Infra
**Build**
- **Dockerize** `api`, `worker`, `web`, `admin`; `docker-compose.yml`; Nginx `neviso.conf` (nevisoai.ir/www/app + WS upgrade) and `admin.neviso.conf` (admin subdomain + optional IP allowlist).
- **Security (§13):** Nginx rate limit 10 req/s per IP; OTP 1/2min; magic-byte file validation; bcrypt cost 12; CSP/security headers; CORS whitelist (nevisoai.ir, www, admin); Arvan bucket CORS (PUT only from the app origins); presigned-URL Content-Type/Length conditions; admin login rate limit; admin token isolation; impersonation safety.
- **Observability (§15.5):** structured JSON logs correlated by `traceId`; **Sentry** in all four apps; metrics (request rate/p95/error rate, **BullMQ queue depth/oldest-job age/failure-by-class**, payment verify success/fail, OTP send success by channel, per-provider latency); health endpoints; **alerts** (Metis 402/401 immediate, queue backlog, payment-verify spike, OTP balance low, elevated 5xx).
- **Backup/DR (§15.6):** daily managed Postgres backups + **periodic tested restore**; Arvan versioning; restore runbook (restore → `prisma migrate deploy` → smoke check). Targets RPO≈24h, RTO few hours.
- **Reconciliation cron** live in prod (payments + stalled jobs).
- **Connection pooling** (PgBouncer / managed pooler) before scaling replicas.

### Frontend
**Build**
- Production builds for `web` (PWA) + `admin`; verify **no external asset references** in the built output; CSP allows only your own origins; error boundaries + Apollo error link confirmed catching everything in prod mode.

### CI/CD (§15.3/15.4)
- Pipeline: lint → typecheck → unit → integration **gate** the build; build images; deploy to preview/staging; **Playwright e2e gates promotion** to production:
  - OTP login; upload→generated note; edit + reset-to-original; PDF export; buy a pack (mock gateway); admin happy path (login → adjust credit → impersonation blocked from spending).

### Automated tests
- **Full e2e suite** green against the deployed preview.
- **Load smoke:** a burst of uploads drains via the queue (backpressure = longer wait, not errors); `METIS_MAX_CONCURRENCY` + `USER_MAX_INFLIGHT_JOBS` hold.
- Run: `pnpm test && pnpm test:e2e`.

### Manual self-test (production smoke + drills)
1. Each subdomain resolves over HTTPS and routes correctly (app, api, admin); WS subscriptions connect in prod.
2. Run the e2e journeys against staging → all green → promote.
3. **Failure drill:** point Metis at a bad key → a note fails, is refunded, alert fires; restore the key → recovers.
4. **Payment drill:** double-fire the verify callback in sandbox → credits once; abandon a payment → reconciliation fixes it.
5. **DR drill:** restore the latest Postgres backup into a scratch env → run the runbook → smoke login + open a note succeeds.
6. Inspect logs/Sentry → errors carry `traceId`, no PII/secrets, mobiles masked.

### Definition of Done
- [ ] All four services containerized + deployed on Liara behind Nginx with correct per-subdomain routing + SSL.
- [ ] Security checklist (§13) fully applied; CORS/CSP/rate limits/file validation verified.
- [ ] Sentry + metrics + alerts live; health checks wired to Liara.
- [ ] Daily backups + a **tested** restore; reconciliation + cleanup crons running.
- [ ] CI gates builds; e2e gates promotion; full suite green.
- [ ] Production smoke + failure/payment/DR drills pass.

---

## Cross-cutting checklist (verify at the end of every slice)

- [ ] No user-facing text is non-Persian; every error goes through the `code → Persian` map (ARD §16).
- [ ] Every `web` screen matches the template in `document/design-Tempelet/` exactly (layout, spacing, typography, colors, components).
- [ ] Every displayed/exported date is Jalali + Persian numerals; every stored date is UTC (FR-57).
- [ ] No foreign CDN/asset references (ARD §3.2 asset policy).
- [ ] All resolvers owner-scoped; admin and user tokens never cross.
- [ ] Credit changes always go through the ledger with the right `idempotencyKey`.
- [ ] New state-changing admin action → writes an `AuditLog` row.
- [ ] Step's automated suite green **before** the manual checklist; manual checklist passes before commit.

## Suggested build order recap

Foundation (1) → Auth (2) → Folders (3) → Upload/AI (4) → Notifications (5) → Editor (6) → Chatbot (7) → PDF (8) → Payment (9) → PWA (10) → Landing (11) → Admin auth (12) → Admin users (13) → Admin plans/payments (14) → Admin analytics (15) → Admin settings/management (16) → Hardening/deploy (17).

You can ship a usable student product after Step 9, layer PWA/landing (10–11), then build the backoffice (12–16), and harden for production (17).
