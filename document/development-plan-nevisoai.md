# Neviso (nevisoai.ir) — Development Plan (0 → 100, detailed)

| Field | Value |
|---|---|
| Document | Development Plan (task-level) |
| Version | 2.0 |
| Built by | Claude Code (agentic) |
| Source of truth | `ard-neviso.md` (architecture) + `prd-neviso.md` (product) |
| Backoffice | In scope for v1 |

Phased, vertical-slice plan. Each phase has backend **and** frontend work and ends with something the user can open and test. Every task is a checkbox. A phase is done only when **all its tasks are checked and the full test gate is green** (Section 2). Where a task says "per ARD §X," implement exactly what that section specifies.

---

## 0. Working agreement (Claude Code)

- [ ] Do phases **in order**; finish a phase's gate before the next.
- [ ] Treat `ard-neviso.md` + `prd-neviso.md` as source of truth; never contradict them.
- [ ] After each phase: run lint, type-check, unit, integration, e2e, build — all green.
- [ ] Commit per task or per logical group; keep the tree clean.
- [ ] **Mock all external services in tests** (Metis, SMS Web Service, Bale, Zarinpal) behind interfaces; real calls only in manual/prod.
- [ ] Add Prisma models + a migration in the phase that first needs them.
- [ ] Honor global conventions (Section 1) in every task.

---

## 1. Global conventions

- [ ] Monorepo: `apps/api`, `apps/worker`, `apps/web`, `apps/admin`, shared `packages/` (types, Prisma client). (ARD §3, §15.1)
- [ ] Persian + **RTL** in `web` and `admin`; **Vazirmatn self-hosted** (vendored/bundled, never Google Fonts). (ARD §3.2.1, §3.2)
- [ ] **No foreign CDNs** — all assets vendored + served from own infra/Arvan; CI check fails build on any external host in built output. (ARD §3.2)
- [ ] `web` visual design follows **`Ui_sample.html`**; its tokens (paper/ink/saffron/ruby/sage/indigo, spacing/radius/shadow) go into the Tailwind theme. (ARD §3.2.1)
- [ ] **Persian-only user errors**: server returns `{code, data?, traceId}` (no stack, `message` never shown); frontend maps `code`→Persian via one Apollo `errorLink` + fallback + error boundary. Each phase adds its codes. (ARD §16)
- [ ] **Ownership** check on every user-scoped operation; **idempotent** credit ops (`CreditTransaction.idempotencyKey`) and note job (keyed by `noteId`); **status enforcement** (suspended/banned blocked); **admin token isolation** (`aud:"admin"`). (ARD §6.4.2–6.4.3, §7.3–7.6)

---

## 2. Test gate (every phase)

- [ ] **Unit** (Jest backend / RTL frontend) — logic & components.
- [ ] **Integration** — NestJS testing module vs ephemeral Postgres+Redis, real resolvers/Prisma, external services faked; one test per GraphQL op / worker step.
- [ ] **e2e** (Playwright) — drives `web`/`admin` against a running stack with providers faked; covers the phase's user outcome.
- [ ] **Static** — `tsc --noEmit`, ESLint, Prettier.
- [ ] **Build** — `next build` (web, admin), Nest build (api, worker).
- [ ] **CI** runs all of the above on every push; merge requires green. Auth, credits/payments, and the worker need failure-path tests, not just happy path.

**Universal DoD:** all phase tasks checked · migration written/applied · UI matches sample & RTL · new errors mapped to Persian · gate green · manual test steps pass · no foreign-CDN introduced.

---

## Phase 0 — Foundation & tooling

**Outcome:** all four apps run locally and in CI; DB, queue, tests, and the no-CDN check work.

Setup
- [ ] Init monorepo workspaces + root scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`).
- [ ] TypeScript base config, ESLint, Prettier, EditorConfig shared across packages.
- [ ] `docker-compose.dev.yml` (Postgres + Redis) and `docker-compose.test.yml` (ephemeral test DB/Redis).
- [ ] `.env.example` with **every** var from ARD §14 (JWT + admin JWT + challenge secrets, Metis base/key/model/embedding/timeouts, SMS Web Service, Bale, Arvan, Zarinpal, OTP TTLs) as placeholders; config validation on boot.

Backend
- [ ] `apps/api`: NestJS + `@nestjs/graphql` code-first + Apollo; `health` query; playground dev-only.
- [ ] Prisma: connect Postgres, enable `pgvector` extension via migration; set up migrate workflow.
- [ ] `apps/worker`: NestJS standalone + BullMQ on Redis; a no-op job to prove the queue.
- [ ] Shared `packages/`: generated Prisma client + shared TS types.

Frontend
- [ ] `apps/web`: Next.js 14 App Router, TS, Tailwind (tokens from sample), **RTL root layout**, **Vazirmatn vendored**, Apollo client + `errorLink` scaffold + Persian-map stub + root error boundary; health page.
- [ ] `apps/admin`: same baseline, desktop-first, separate admin Apollo client + token storage; health page.

CI
- [ ] GitHub Actions running the full gate (Section 2).
- [ ] **No-foreign-CDN check** scanning built output for disallowed hosts; fails build on hit.

Tests
- [ ] Unit: trivial api/worker service test; error-mapper returns fallback for unknown code.
- [ ] Integration: `health` ok vs test DB; worker runs the no-op job.
- [ ] e2e: `web` and `admin` home pages load.

Manual: `docker-compose up`, run all apps; both UIs render Persian RTL with Vazirmatn served locally (devtools Network shows no foreign host).

ARD: §3, §14, §16.2, §15.1.

---

## Phase 1 — Auth (OTP, 2 channels) + profile + admin login

**Outcome:** a user logs in by OTP (SMS or Bale, picker when both), gets free credits once, sees profile; admin logs into the empty backoffice via password→OTP.

Database
- [ ] Models: `User`, `OtpRecord` (+`OtpChannel`), `AppSetting`, `Admin` (+`AdminRole`), `AdminOtp`, `CreditTransaction` (+`TransactionType`). Migration.
- [ ] Seed: `AppSetting otp.channels="BOTH"`; one `SUPER_ADMIN` from env creds (bcrypt).

Backend — OTP delivery (ARD §7.2.1–7.2.3)
- [ ] `OtpSender` interface + `SmsWebServiceProvider` (`SendTokenSingle` P1=code; `AccountInfo`) + fake.
- [ ] `BaleProvider`: OAuth `auth/token` cached in Redis (~12h, refresh on expiry/401); `send_otp {phone,otp}`; **phone normalize** `0XXXXXXXXXX`→`98XXXXXXXXXX`; map `404 code17`→no-account, `402`→balance, `429`→rate; fake.
- [ ] `OtpChannelService`: read `AppSetting`; resolve channel (single → forced; BOTH → user choice or `preferredOtpChannel`, reject if absent); BOTH + Bale 404 → **fallback to SMS**; BALE_ONLY + 404 → `OTP_BALE_NO_ACCOUNT`.

Backend — user auth (ARD §5.2, §7.1–7.3)
- [ ] `requestOtp(mobile, channel?)`: rate-limit 1/2min per mobile (Redis); generate 6-digit; store `OtpRecord(+channel,+smsMessageId)` + Redis TTL; dispatch; return `{expiresIn, channel}`.
- [ ] `verifyOtp(mobile, code)`: validate code+expiry, mark used, upsert `User`, **grant free credits once** (`freeCreditsGiven`), return tokens.
- [ ] JWT access (15m, memory) + refresh (30d, HttpOnly cookie); `refreshToken` (rotate), `logout`, `changePassword`.
- [ ] `me` query + `updateProfile`; `otpChannels` public query.
- [ ] `GqlAuthGuard` (+reject SUSPENDED/BANNED), `GqlOwnerGuard`.

Backend — admin auth (ARD §7.4–7.6)
- [ ] `adminLoginStep1(email,password)`: verify bcrypt + `isActive`, create challenge + `AdminOtp`, send OTP to admin mobile, return `{challengeId, maskedMobile, expiresIn}`; no email-existence leak.
- [ ] `adminLoginStep2(challengeId,code)`: validate, issue admin tokens (separate secrets, `aud:"admin"`, short TTLs); `adminRefreshToken`, `adminLogout`.
- [ ] `AdminAuthGuard`, `AdminRoleGuard` + `@RequireRole`; admin-login rate limit; minimal `AuditLog` write `ADMIN_LOGIN`.

Errors
- [ ] Add `OTP_INVALID/OTP_EXPIRED/OTP_TOO_SOON/OTP_CHANNEL_REQUIRED/OTP_BALE_NO_ACCOUNT/OTP_PROVIDER_UNAVAILABLE`, `ADMIN_CREDENTIALS_INVALID/ADMIN_CHALLENGE_INVALID/ADMIN_OTP_INVALID`, `ACCOUNT_SUSPENDED/ACCOUNT_BANNED`, `UNAUTHENTICATED` → Persian catalog (ARD §16.3).

Frontend — web
- [ ] Login: Iranian-mobile input + validation → call `otpChannels` → channel picker only if both → submit.
- [ ] OTP screen: 6-digit input, 120s resend timer, verify, store tokens, redirect; fallback notice ("sent by پیامک") when Bale falls back.
- [ ] Auth context + guarded routes; refresh handling.
- [ ] Profile page (name, avatar, credit balance) + edit; logout.

Frontend — admin
- [ ] Admin login: email+password step → OTP step → dashboard shell (empty); admin auth context; short idle timeout.

Tests
- [ ] Unit: OTP gen/validate/expire; JWT issue/verify/rotate; phone normalize (ARD valid/invalid table); channel resolution + 404 fallback; free-grant idempotency; status rejection.
- [ ] Integration: `requestOtp→verifyOtp→tokens` (fake SMS/Bale); refresh rotation; suspended/banned rejected at login + guarded query; admin step1→step2 issues tokens; **user token rejected by admin resolver and vice versa**.
- [ ] e2e: user OTP login (test code) → dashboard with free credits; admin two-step login.

Manual: log in via mobile (both channels offered), enter code, see free credits; log into admin with seeded super-admin.

ARD: §4.2, §5.2, §5.9.1, §7.1–7.6, §16. PRD: US-01, US-02, US-11.

---

## Phase 2 — Folders & notes shell (CRUD, no AI)

**Outcome:** user manages folders and navigates notes (read-only render).

Database
- [ ] Models: `Folder`, `Note` (+`NoteStatus`). Migration. Add a fixture/seed note for view testing.

Backend (ARD §5.3–5.4)
- [ ] `folders`, `createFolder`, `renameFolder`, `deleteFolder` (ownership).
- [ ] `notes(folderId)`, `note(id)`, `moveNote(id,targetFolderId)`, `deleteNote(id)` (ownership). Deleting a note does not refund (PRD).

Frontend — web
- [ ] Dashboard layout per `Ui_sample.html`: sidebar/folder list with create/rename/delete; note list per folder + empty state.
- [ ] Note detail view rendering `contentJson` **read-only** via TipTap; loading/empty/error states; RTL.

Tests
- [ ] Unit: folder/note resolver logic; ownership rejection.
- [ ] Integration: full folder CRUD; note list/get/move/delete with ownership.
- [ ] e2e: create folder → rename → move seeded note → delete folder.

Manual: create/rename/delete folders; open a seeded note and confirm RTL render.

ARD: §4.2, §5.3, §5.4. PRD: US-06–US-08.

---

## Phase 3 — Upload & AI note generation ★ MVP core

**Outcome:** user records/photographs a lecture → uploads → gets a structured note; credits charged; failures refund with a Persian message.

Database
- [ ] Models: `NoteFile`, `JobRecord` (+`JobStatus`, `errorClass`, `metisFileUrls`). Extend `Note`: `failureReason`, `isIndexed`, `originalContentJson`, `isEdited`, token fields, `creditCost`. Add `CreditTransaction.idempotencyKey @unique`, `NoteTokenUsage`. Migration.

Backend — upload (ARD §6.1, §8)
- [ ] `requestUploadUrls(folderId, files[])`: validate credit estimate + mime/size; presigned Arvan PUT URLs (content-type/length conditions, 10-min); temp `UploadSession`(Redis).
- [ ] `confirmUpload(uploadSessionId, recordedAt?)`: HeadObject verify; **reserve credits** (`USAGE`, key `usage:{noteId}`); create `Note`(PENDING)+`NoteFile`+`JobRecord`; enqueue BullMQ job `jobId=noteId`.

Backend — worker (ARD §6.0–6.2, §6.4)
- [ ] Pipeline: status PROCESSING + publish → download from Arvan → **HEIC/HEIF→JPEG via sharp** → upload media to **Metis storage** (cache URLs on JobRecord) → **single multimodal `generateContent` via Metis** with the combined prompt (ARD §6.2) → **validate** `{title, contentJson}` ProseMirror → save **both `contentJson` and `originalContentJson`** + title → DONE → finalize credit → publish `noteStatusChanged` + `creditUpdated`. Capture `NoteTokenUsage`.
- [ ] `MetisClient` (generateContent) behind interface + fake; base URL/key/model from env; timeouts (`METIS_GEN_TIMEOUT`).
- [ ] Error taxonomy + handling (ARD §6.4.1–6.4.3, §6.4.5–6.4.6): classify (transient retry w/ backoff vs fatal 400/401/402/oversized fail-fast); refund (`REFUND`, key `refund:{noteId}`) on terminal fail; idempotent step guards (skip if `contentJson` present, delete-before-reinsert chunks later); stalled-job re-queue safe; limited regeneration on malformed output.
- [ ] Subscriptions infra (graphql-ws) + `noteStatusChanged`, `creditUpdated`.

Errors
- [ ] Add `INSUFFICIENT_CREDITS`, `PROCESSING_FAILED`, `NOTE_INPUT_TOO_LONG`, `AI_PROVIDER_UNAVAILABLE`, `FILE_TOO_LARGE`, `UNSUPPORTED_FORMAT`, `NOTE_NOT_FOUND`, `FOLDER_NOT_FOUND` → Persian catalog.

Frontend — web
- [ ] Upload screen: **MediaRecorder** record (low-bitrate mono) + image picker; **client-side image compression** (browser-image-compression: downscale ~2000px + JPEG ~80%); show optimized size; direct PUT to presigned URLs with progress.
- [ ] Processing UX: note shows PROCESSING → live update to DONE (open note) / FAILED (Persian message) via subscription; credit balance updates live; low-credit prompt when insufficient.

Tests
- [ ] Unit: credit reserve/finalize/refund idempotency; error classifier per class; prompt builder; ProseMirror validation (accept/reject); HEIC convert; image-compression helper.
- [ ] Integration (fake Metis): `confirmUpload→job→DONE` writes both content columns + finalizes credit; fatal 402/401 fails fast + refunds exactly once; transient retries then succeeds; duplicate/re-queued job no double-charge/dup.
- [ ] e2e (faked Metis): upload audio+image → PROCESSING → DONE → note renders; credits dropped; injected failure → Persian error + refund.

Manual: record a short clip + photo, upload, watch it finish into a note; verify content + credit drop; force a failure in staging → refund + Persian message.

ARD: §6.0–6.2, §6.4, §8, §9, §5.5. PRD: US-03–US-05.

---

## Phase 4 — Note editing & restore-to-original

**Outcome:** user edits a note; can revert to the AI original.

Backend (ARD §5.4)
- [ ] `updateNote(id,input)`: edit `contentJson` only, set `isEdited=true` (ownership).
- [ ] `resetNoteToOriginal(id)`: copy `originalContentJson`→`contentJson`, `isEdited=false` (ownership).

Frontend — web
- [ ] TipTap **editable** mode; save (autosave or explicit); "edited" indicator; "restore original" («بازگردانی به نسخه اصلی») with confirm.

Tests
- [ ] Unit: update sets flag; reset restores + clears flag.
- [ ] Integration: edit persists; reset returns exact original; ownership.
- [ ] e2e: edit → reload persists → restore → matches AI version.

Manual: edit a note, refresh, then restore original.

ARD: §4.2, §5.4.

---

## Phase 5 — Embeddings indexing & RAG chatbot

**Outcome:** user chats with their notes and gets grounded answers.

Database
- [ ] Models: `NoteChunk` (`vector(1536)`), `ChatSession`, `ChatMessage` (+`MessageRole`). Migration.

Backend — indexing (ARD §6.1 step i, §6.4.4)
- [ ] After DONE: chunk plain text of **`originalContentJson`** (~500 tokens) → embeddings via **Metis OpenAI `text-embedding-3-small`** → save `NoteChunk` (delete-before-reinsert) → `isIndexed=true`.
- [ ] Graceful: indexing failure does **not** fail/refund the note; index-retry job re-attempts; chat blocked for a note until `isIndexed`. **No re-index on edit.**
- [ ] `MetisEmbeddingsClient` behind interface + fake.

Backend — chat (ARD §5.6)
- [ ] `chatSessions`, `createChatSession(folderId, selectedNoteIds)`, `sendChatMessage`: embed query → cosine top-5 over selected notes' chunks (pgvector) → RAG prompt + chunks + query → Gemini-via-Metis → save user+assistant `ChatMessage`; charge 1 credit/message (idempotent).

Frontend — web
- [ ] Chat UI: select folder + notes, ask, see answer + history; "still being prepared for chat" when `isIndexed=false`.

Tests
- [ ] Unit: chunking; retrieval query; per-message credit charge.
- [ ] Integration (fakes): index note → chat grounded in chunks; un-indexed note excluded/blocked; index failure leaves note DONE + retried.
- [ ] e2e: process a note → chat about it → relevant answer.

Manual: after a note finishes, chat about its content and verify the answer reflects it.

ARD: §4.2, §5.6, §6.1, §6.4.4. PRD: US (chatbot).

---

## Phase 6 — In-app notifications (real-time)

**Outcome:** user is notified when a note finishes/fails.

Database
- [ ] Model: `Notification` (+`NotificationType`). Migration.

Backend (ARD §9, §17)
- [ ] Worker creates `NOTE_DONE`/`NOTE_FAILED` + publishes `notificationReceived`.
- [ ] Queries/mutations: list (last 50, persisted), unread count, mark-read, mark-all-read.

Frontend — web
- [ ] Header bell + unread counter; slide-in panel (title, folder, status, time); tap ready→note, failed→upload page w/ Persian reason; read/unread styles; persists across refresh/re-login.

Tests
- [ ] Unit: creation on done/fail; counting; mark-read.
- [ ] Integration: note finish → notification created + pushed; mark-all-read clears; unread persists.
- [ ] e2e: process note → counter increments → open panel → tap → navigate.

Manual: upload, watch bell update on finish, tap to navigate.

ARD: §4.2, §9, §17. PRD: US-10.

---

## Phase 7 — Payments & credits (Zarinpal)

**Outcome:** user buys credit packs/bundles; credits added (idempotent, never expire); balance + history visible.

Database
- [ ] Models: `Plan` (+`PlanType`), `PaymentRecord` (+`PaymentStatus`), `Subscription` (+`SubscriptionStatus`, `grantedByAdminId`, `cancelReason`). Seed packs + bundles (amounts/prices = your pricing decision). Migration.

Backend (ARD §6.3, §12)
- [ ] `plans` query; `initiatePayment(planId)`: create pending `PaymentRecord` → Zarinpal request → return redirect URL.
- [ ] `GET /api/payments/verify` (REST callback): verify with Zarinpal → success: add credits (`PURCHASE`, idempotent), create `Subscription` for bundles, mark PAID; failure: mark FAILED, no credits.
- [ ] Credit ledger query + purchase history.
- [ ] Nightly cron: mark subs `EXPIRED` past `expiresAt` + reminder; **never removes credits** (ARD §6.3).
- [ ] `ZarinpalClient` behind interface + fake.

Errors
- [ ] Add `PAYMENT_FAILED` (final refund wording = your policy) → Persian catalog.

Frontend — web
- [ ] Pricing page (packs + discounted bundles, per design) — one-time payment, "credits never expire" copy.
- [ ] Buy → Zarinpal redirect → return/verify result page (success/failure, Persian); live balance; purchase history.

Tests
- [ ] Unit: credit add math; `PURCHASE` idempotency; subscription term; expiry cosmetic (no balance change).
- [ ] Integration (fake Zarinpal): `initiate→verify(success)` credits once + PAID; duplicate verify no double-credit; failed verify FAILED + no credits; expiry flips status only.
- [ ] e2e (mock gateway): purchase → balance + history update; failed payment → Persian failure page.

Manual: buy via Zarinpal sandbox → credits added + history; fail a payment → clear message, no credits.

ARD: §4.2, §6.3, §12, §5.7. PRD: US-09.

---

## Phase 8 — Backoffice / admin panel (full) ★ v1

**Outcome:** ops/support manage users, plans, payments, analytics, settings — fully audited. (Admin login done in Phase 1.)

Database
- [ ] Model: `AuditLog` (+`AuditAction`). Migration. (Others already exist.)

Backend (ARD §5.9)
- [ ] `AuditInterceptor` writing `AuditLog` on every state-changing admin op; `AdminRoleGuard` per op.
- [ ] Users: `adminUsers` (search/filter/paginate), `adminUser` (detail), `adminAdjustCredit` (reason required, idempotent ledger), `adminSetUserStatus` (suspend/ban/reactivate + reason), `adminImpersonateUser` (short user token w/ `act`; `NoImpersonationGuard` blocks payments/credit-spend/password/deletes).
- [ ] Subscriptions: `adminGrantSubscription`, `adminCancelSubscription`.
- [ ] Plans: `adminPlans`, `adminCreatePlan`, `adminUpdatePlan`, `adminSetPlanActive`.
- [ ] Payments: `adminPayments` (filter), `adminPayment`.
- [ ] Analytics: `adminDashboardStats`, `adminRevenueSeries`, `adminSignupSeries`, `adminNotesSeries`.
- [ ] Audit: `adminAuditLogs`. Admin mgmt (SUPER_ADMIN): list/create/update-role/deactivate.
- [ ] Settings: `adminOtpChannelMode` / `adminSetOtpChannelMode` (writes `AppSetting`, audited `OTP_CHANNEL_CONFIG`).

Errors
- [ ] Add `ADMIN_FORBIDDEN`, `IMPERSONATION_FORBIDDEN`, `ADJUSTMENT_REASON_REQUIRED`, `PLAN_IN_USE` → Persian catalog (admin).

Frontend — admin
- [ ] Dashboard: KPI cards + trend charts (Recharts), range selector.
- [ ] Users: TanStack Table (search/filter) + detail with actions (credit/status/subscription/impersonate) + confirm prompts.
- [ ] Plans management; payments table + detail; audit log viewer; admin management; OTP channel mode setting.

Frontend — web
- [ ] Persistent **impersonation banner** + one-click exit while an impersonation token is active.

Tests
- [ ] Unit: role gating per op; impersonation block-list; analytics calc; audit entry build.
- [ ] Integration: each admin write performs effect **and** writes audit; SUPPORT blocked from ADMIN-only ops; impersonation token blocked from payments/credit-spend/password/deletes; `adminSetOtpChannelMode` changes public `otpChannels`.
- [ ] e2e: admin login → search user → adjust credit (reason) → ban→reactivate → grant subscription → impersonate (banner, blocked from buying) → change OTP mode.

Manual: exercise every screen as super-admin; verify audit records each action; impersonation can view but not spend.

ARD: §5.9, §7.4–7.7, §13. PRD: US-11–US-20.

---

## Phase 9 — PWA, PDF export & media polish

**Outcome:** installable, offline-resilient app; branded PDF export.

Backend (ARD §11)
- [ ] PDF export: `contentJson`→HTML→PDF (choose Puppeteer or @react-pdf/renderer and record it) with watermark «نویسو | nevisoai.ir» + PDF metadata; serve via signed URL; reject non-owned.

Frontend — web (ARD §10)
- [ ] PWA: next-pwa/Workbox, manifest, icons, install prompt, offline shell, **cache-first for self-hosted assets/fonts**.
- [ ] PDF export button on a note; Wavesurfer.js audio player on notes with source audio.

Tests
- [ ] Unit: PDF builder outputs file w/ watermark + metadata.
- [ ] Integration: export returns valid PDF for owned note; rejects others.
- [ ] e2e: PWA installable/manifest+SW registered; offline shell loads; export → open PDF.

Manual: install to home screen; go offline (shell loads); export a note (watermark present).

ARD: §10, §11. PRD: export, Design.

---

## Phase 10 — Hardening: errors, security, observability

**Outcome:** all error paths Persian & safe; monitoring/alerts live; security locked down.

Backend (ARD §16, §13, §6.4.7)
- [ ] Finalize `formatError` (codes + `traceId`, strip stack/internal); verify the **entire** error-code catalog implemented incl. fallbacks.
- [ ] Structured logging with `traceId`; metrics (job success/failure-by-class, p95 latency, queue depth); **alerts** for Metis `402`/`401`, failure-rate threshold, queue backlog.
- [ ] Rate limits on all public/auth ops; security headers; strict CORS (only `nevisoai.ir` + subdomains); CSP; audit retention; optional admin IP allowlist.

Frontend — web + admin (ARD §16.2–16.3)
- [ ] Confirm `errorLink` maps **every** code to Persian + generic fallback; error boundaries (full-page Persian); correct surfaces (inline/toast/redirect/full-screen); suspended/banned full-screen; `UNAUTHENTICATED` redirect.

Tests
- [ ] Unit: every code → Persian; sanitizer strips stack/message; unknown→fallback.
- [ ] Integration: representative errors return `{code,traceId}` only; suspended/banned flows; rate limit triggers.
- [ ] e2e: force network fail / insufficient credits / invalid OTP / suspended account → correct Persian messages, nothing technical leaks; render crash → Persian boundary.

Manual: trigger several errors; confirm Persian-only and no leakage.

ARD: §16, §13, §6.4.7.

---

## Phase 11 — Pre-launch & go-live

**Outcome:** decisions resolved, full regression green, accounts/secrets live, app launched on `nevisoai.ir`.

Engineering
- [ ] Resolve open decisions (ARD §18): **long-audio chunking** (split over-limit recordings), final PDF engine, others.
- [ ] Full regression green across all apps; load/perf sanity (worker concurrency, Puppeteer memory, DB indexes); a11y pass on key screens.
- [ ] Re-verify: both content columns written; credits never expire; no-CDN check green.

Operational
- [ ] Metis funded + monitored; Zarinpal merchant approved; **SMS Web Service OTP template approved**; Bale credentials; Arvan storage+CDN.
- [ ] DNS + SSL for `nevisoai.ir`, `www`, `app`, `api`, `admin`; Nginx per-subdomain routing.
- [ ] Seed first **SUPER_ADMIN** + initial **plans/prices**; `otp.channels=BOTH`.
- [ ] DB backups + tested restore; monitoring dashboards + alerts verified; staging mirrors prod; all real secrets set.

Launch
- [ ] Soft launch to a small group → monitor errors/processing/OTP/payments → fix → public launch.

ARD: §18, §13, §15. PRD: §9, §10.

---

## Decisions needed from you (not blocking Phase 0–2)

- [ ] **Pricing** — credit amounts + Toman prices (by Phase 7).
- [ ] **`PAYMENT_FAILED` wording** — real refund policy (Phase 7 / §16).
- [ ] **Chat history retention** (Phase 5/6).
- [ ] **Long-audio chunking** strategy (Phase 11; MVP can ship with a max-length limit first).

## Build order & dependencies

```
0 → 1 → 2 → 3(core) → {4, 5, 6} → 7 → 8(backoffice) → 9 → 10 → 11(launch)
```
4/5/6 may reorder among themselves; everything after 3 depends on the core loop. 7 and 8 can proceed in parallel with 4–6 if capacity allows, but 8's analytics benefit from real data from 3/7.

*Implementation roadmap for Neviso (nevisoai.ir); governed by `ard-neviso.md` and `prd-neviso.md`.*
