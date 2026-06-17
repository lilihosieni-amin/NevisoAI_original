# Architecture Requirements Document (ARD)
## Neviso (nevisoai.ir) — Technical Specification

---

| Field | Value |
|---|---|
| Product | Neviso (nevisoai.ir) |
| Document Version | 1.5 |
| Based on PRD | v1.5 |
| Backend | NestJS (Node.js) |
| Frontend | Next.js 14 (React) |
| Database | PostgreSQL |
| AI Provider | Google Gemini via Metis (متیس) gateway |
| Hosting | Iranian Cloud (Arvan / Liara) |
| AI Processing | Asynchronous (background job queue + real-time notify) |

---

## 1. System Overview

Neviso follows a **monorepo, layered microservice-ready architecture**. The system is composed of:

- **Public Landing** — Next.js static/SSR page (SEO-optimized)
- **User Dashboard (PWA)** — Next.js app with service worker
- **Admin Backoffice** — Separate Next.js app on `admin.nevisoai.ir` (internal-only, desktop-first, not a PWA) for operations & support staff
- **API Server** — NestJS GraphQL API (modular, code-first, domain-driven). Hosts both the user-facing schema and an isolated admin schema/module guarded by admin-only authentication
- **Background Worker** — NestJS standalone process consuming a job queue
- **AI Orchestration Layer** — Google Gemini for note generation and the RAG chatbot, plus OpenAI for embeddings — all accessed through the Metis gateway
- **File Storage** — Arvan Object Storage (S3-compatible)
- **Database** — PostgreSQL via Prisma ORM
- **Cache & Queue** — Redis (BullMQ for job queue, session/cache store)
- **Real-time** — GraphQL Subscriptions (over WebSocket) for job status push
- **Payment** — Zarinpal REST API

---

## 2. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                              │
│                                                                        │
│  ┌─────────────┐     ┌────────────────────┐    ┌───────────────────┐  │
│  │ Landing Page│     │ User Dashboard(PWA) │    │ Admin Backoffice  │  │
│  │ Next.js(SSG)│     │ Next.js + SW        │    │ Next.js           │  │
│  │             │     │ (app.nevisoai.ir)     │    │ (admin.nevisoai.ir) │  │
│  └──────┬──────┘     └──────────┬──────────┘    └─────────┬─────────┘  │
└─────────┼───────────────────────┼────────────────────────┼────────────┘
          │ HTTPS                  │ HTTPS + WS              │ HTTPS
┌─────────▼───────────────────────▼────────────────────────▼────────────┐
│                          API GATEWAY (Nginx)                           │
│       Rate limiting · SSL termination · per-subdomain routing          │
└────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                          NESTJS API SERVER                              │
│                                                                         │
│  ─ User schema (GqlAuthGuard) ──────────────────────────────────────┐  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐            │  │
│  │   Auth   │ │  Notes   │ │ Folders  │ │   Payments   │            │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘            │  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐            │  │
│  │  Upload  │ │   Chat   │ │  Export  │ │ Notifications│            │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘            │  │
│  ─ Admin schema (AdminAuthGuard + AdminRoleGuard) ───────────────────┐  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │  │
│  │ Admin Auth   │ │ Admin Users  │ │ Admin Plans/ │ │  Analytics │  │  │
│  │ (2-step+OTP) │ │ (CRUD/credit/│ │ Payments     │ │ + Audit Log│  │  │
│  │              │ │ status/imp.) │ │              │ │            │  │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘  │  │
└──────┬──────────────┬─────────────┬──────────────┬─────────────────────┘
       │              │             │              │
┌──────▼───┐   ┌──────▼───┐  ┌─────▼──────┐ ┌────▼──────────┐
│PostgreSQL│   │  Redis   │  │   Arvan    │ │ Metis Gateway │
│(Prisma)  │   │(BullMQ + │  │  Object    │ │  → Gemini     │
│          │   │  Cache)  │  │  Storage   │ │ Notes + Embed │
│          │   │          │  │            │ │ + Chat        │
└──────────┘   └────┬─────┘  └────────────┘ └───────────────┘
                    │
          ┌─────────▼──────────┐
          │  BACKGROUND WORKER │
          │  (NestJS Standalone│
          │   + BullMQ consumer│
          │   + PubSub publish) │
          └────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Backend — NestJS

| Component | Technology | Reason |
|---|---|---|
| Framework | NestJS (Node.js) | Modular, TypeScript-first, dependency injection |
| Language | TypeScript | Type safety across the stack |
| ORM | Prisma | Type-safe DB queries, migration support |
| Job Queue | BullMQ + Redis | Reliable async job processing |
| GraphQL | @nestjs/graphql + Apollo Server | Code-first GraphQL API with auto-generated schema |
| Real-time | GraphQL Subscriptions (Apollo + graphql-ws) | Job status + notification push to client |
| Validation | class-validator + class-transformer | Input DTO validation (used with GraphQL inputs) |
| Auth | JWT (access + refresh tokens) | Stateless auth |
| OTP delivery | SMS Web Service (پیامک) + Bale (بله) | Two channels; admin-selectable mode (SMS / Bale / both) |
| File upload | Arvan S3 SDK (presigned URLs) | Client uploads directly to object storage |
| Image processing | sharp | Convert HEIC/HEIF (iPhone) images to JPEG before sending to the model (Section 6.1) |
| PDF generation | Puppeteer or @react-pdf/renderer | Server-side PDF with watermark |
| Rich text parsing | ProseMirror JSON / TipTap schema | Store editor state as JSON |
| Vector embeddings | pgvector (PostgreSQL extension) | Cosine similarity search for RAG chatbot |
| Embeddings API | Metis embeddings endpoint (OpenAI `text-embedding-3-small`) | Generate vector embeddings for note chunks via Metis |

### 3.2 Frontend — Next.js 14

| Component | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State management | Zustand |
| Server state / caching | Apollo Client cache |
| Rich text editor | TipTap (ProseMirror-based) — extensions: Heading, Bold/Italic/Underline, TextStyle+Color, Highlight, FontFamily, BulletList/OrderedList, Table, TextAlign (left/right/center), and per-block text direction (LTR/RTL) |
| Audio player | Wavesurfer.js |
| Audio capture | MediaRecorder (low-bitrate mono, speech-friendly) — keeps in-app recordings small |
| Image optimization | browser-image-compression — downscale + JPEG re-encode before upload |
| Real-time | Apollo Client (graphql-ws) |
| Styling | Tailwind CSS (RTL plugin) |
| PWA | next-pwa (Workbox) |
| Form handling | React Hook Form + Zod |
| GraphQL client | Apollo Client |
| Date & calendar | Jalali (Shamsi) date library + Jalali date picker (e.g. `react-multi-date-picker` with the Persian calendar/locale, or `dayjs`+`jalaliday`), Persian-numeral formatting — vendored per the asset policy |

> **Dates & calendar — Jalali only (display + input).** The **Shamsi (Jalali) calendar is the only calendar any user or admin ever sees.** All dates are **stored** in one canonical format — Gregorian/UTC (`DateTime` columns are UTC ISO) — for consistency and querying, and converted to Jalali **only at the UI/output boundary**. Every user-facing and admin-facing date renders in Jalali with **Persian numerals** (e.g. ۱۴۰۴/۰۳/۱۶): the editable lecture date (`Note.recordedAt`), note `createdAt`, dates on exported PDFs (Section 11), payment receipts, and the admin tables/filters. **Input is also Jalali** — wherever a user or admin picks a date (above all the lecture date in the editor, and the admin date-range filters), they use a **Jalali date picker**; the client converts the picked Jalali date to the canonical Gregorian/UTC value before sending it. No Gregorian date is ever displayed. The same rule applies to the **admin app** and to **server-rendered output** (PDF/receipts), so the PDF pipeline converts dates to Jalali server-side.

> **Asset policy — no foreign CDNs (hard requirement).** Foreign/public CDNs (Google Fonts, `fonts.gstatic.com`, cdnjs, unpkg, jsdelivr, Cloudflare, Google APIs, etc.) are unreliable or blocked from inside Iran, so they must **never** be referenced at runtime. Every third-party asset — fonts (Vazirmatn), JS/CSS libraries, icons, images — is **downloaded once, committed to the repository (vendored), bundled by the build, and served only from Neviso's own infrastructure** (the app server / Arvan, which is a domestic Iranian provider). No `<link>`/`<script>` tags pointing at external hosts, no remote font imports. This applies to the user app, the landing page, and the admin backoffice. (Arvan CDN in Section 3.3 is domestic and is the allowed delivery path for static assets.)

### 3.2.1 UI / Design Reference

> **When building any UI, read the full design in the `./document/design-Tempelet` folder (in the project) — it is the visual source of truth for the user-facing app.** Developers should review the design there and match its layout, components, spacing, typography, and styling on every screen; where it doesn't cover a screen, follow its established design language rather than inventing a new one.

The design language the sample establishes (lift these as the app's design tokens):

- **Aesthetic:** a warm "paper / notebook" feel suited to study notes (including a subtle notebook-"spine" shadow), clean and editorial — not a generic dashboard look.
- **Typography:** Vazirmatn, Persian, **RTL** throughout — **self-hosted** (font files vendored in the repo and bundled; never loaded from Google Fonts).
- **Color (CSS variables in the sample):** layered paper surfaces (`--paper`, `--paper-2`, `--card`), layered ink text (`--ink` … `--ink-4`), a **saffron** gold primary accent (`--saffron`, `~#E8A53D`), and muted secondary/semantic colors — ruby (`--ruby`), sage (`--sage`), indigo (`--indigo`), slate (`--slate`).
- **Tokens:** defined scales for spacing (`--s-1` … `--s-8`), radius (`--r-xs` … `--r-xl`), and shadows (`--sh-1` … `--sh-3`). New components should reuse these tokens (mapped into the Tailwind theme) rather than hard-coded values, so the whole app stays visually consistent with the sample.

The admin backoffice (3.2.2) may reuse the same tokens/typography but is desktop-first and data-dense, so it does not need to match the sample screen-for-screen.

### 3.2.2 Admin Backoffice — Next.js 14 (separate app)

| Component | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Separate app in monorepo (`apps/admin`), deployed to its own subdomain |
| Language | TypeScript | |
| Auth | Admin JWT (separate secrets) | Two-step login (password → OTP); short-lived sessions |
| State management | Zustand | |
| GraphQL client | Apollo Client | Points at the same API endpoint; sends admin token |
| Data tables | TanStack Table | Dense, sortable, paginated user/payment tables |
| Charts | Recharts | Analytics dashboard trend charts |
| Styling | Tailwind CSS (RTL plugin) | Persian RTL, desktop-first |
| Date & calendar | Same Jalali (Shamsi) date library + Persian numerals as the user app | All tables, filters, and date-range pickers are Jalali (Section 3.2) |
| Form handling | React Hook Form + Zod | |
| PWA | — | Intentionally **not** a PWA |

### 3.3 Infrastructure

| Component | Provider | Notes |
|---|---|---|
| Compute (API + Worker) | Liara (Docker containers) | Separate containers per service |
| Object Storage | Arvan Cloud S3 | Voice files, images, exports |
| CDN | Arvan CDN | Static assets + public downloads |
| Database | Liara PostgreSQL (managed) | Daily automated backups (DR + restore testing in §15.6); pgvector extension enabled |
| Cache + Queue | Liara Redis (managed) | BullMQ + session cache |
| DNS + SSL | Arvan DNS + Let's Encrypt | Automated certificate renewal |
| Reverse proxy | Nginx | Rate limiting, SSL termination, routing |

---

## 4. Database Schema

### 4.1 Entity Relationship Overview

```
User ──< Folder ──< Note ──< NoteFile
 │                  │    └──< NoteChunk (vector embeddings)
 │                  │
 │                  └──< ChatSession ──< ChatMessage
 │
 ├──< CreditTransaction
 └──< PaymentRecord >── Plan          (Plan = credit pack)

Admin ──< AuditLog        (admin actions over Users / Plans)
 └──< AdminOtp            (two-step login codes)
```

> **Note:** `AuditLog` and the manual `ADMIN_ADJUSTMENT` credit transaction type are the links between an `Admin` and the user-side records they act on. `PaymentRecord` was previously referenced only implicitly in the payment flow (Section 12) and is now a first-class model, required by the backoffice payments view.

### 4.2 Full Schema (Prisma format)

```prisma
// ─── USER ───────────────────────────────────────────────
model User {
  id                String              @id @default(uuid())
  mobile            String              @unique
  passwordHash      String?
  displayName       String?
  avatarUrl         String?
  creditBalance     Int                 @default(0)
  freeCreditsGiven  Boolean             @default(false)
  isActive          Boolean             @default(true)   // DEPRECATED: superseded by `status`; kept for backward-compat
  status            UserStatus          @default(ACTIVE)
  statusReason      String?             // reason set by an admin on suspend/ban
  suspendedUntil    DateTime?           // for time-bound suspensions; null = indefinite/banned
  preferredOtpChannel OtpChannel?       // remembered channel choice when both channels are enabled
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  folders           Folder[]
  chatSessions      ChatSession[]
  transactions      CreditTransaction[]
  otpRecords        OtpRecord[]
  notifications     Notification[]
  paymentRecords    PaymentRecord[]
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

// ─── OTP ────────────────────────────────────────────────
model OtpRecord {
  id           String     @id @default(uuid())
  userId       String?
  mobile       String
  code         String
  channel      OtpChannel @default(SMS)   // which channel delivered this code
  smsMessageId String?    // `id` from SMS Web Service SendTokenSingle (SMS channel), for delivery-status lookup
  expiresAt    DateTime
  usedAt       DateTime?
  createdAt    DateTime   @default(now())

  user         User?      @relation(fields: [userId], references: [id])
}

enum OtpChannel {
  SMS    // SMS Web Service (پیامک)
  BALE   // Bale messenger (بله)
}

// ─── APP SETTING (admin-managed key/value config) ────────
model AppSetting {
  key         String   @id           // e.g. "otp.channels"
  value       Json                   // e.g. "SMS_ONLY" | "BALE_ONLY" | "BOTH" — seeded to "BOTH" at launch
  updatedById String?                // Admin who last changed it
  updatedAt   DateTime @updatedAt
}

// ─── FOLDER ─────────────────────────────────────────────
model Folder {
  id           String        @id @default(uuid())
  userId       String
  name         String
  coverUrl     String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user         User          @relation(fields: [userId], references: [id])
  notes        Note[]
  chatSessions ChatSession[]
}

// ─── NOTE ───────────────────────────────────────────────
model Note {
  id            String      @id @default(uuid())
  folderId      String
  userId        String
  title         String
  contentJson   Json                          // current (possibly user-edited) note body
  originalContentJson Json?                    // the AI's first version; set once at generation, never changed by edits
  isEdited      Boolean     @default(false)    // true once the user edits the note (contentJson diverges from original)
  recordedAt    DateTime                      // the note's date (date it refers to, e.g. the lecture day); user-editable, independent of createdAt (upload date)
  status        NoteStatus  @default(PENDING)
  failureReason String?                       // operator-facing reason when status = FAILED (not shown verbatim to user)
  isIndexed     Boolean     @default(false)   // RAG embeddings complete? note is readable while false; chat waits on true
  creditCost    Int         @default(0)   // billing units charged to the user
  totalInputTokens  Int     @default(0)   // Gemini input tokens summed across all AI steps
  totalOutputTokens Int     @default(0)   // Gemini output tokens summed across all AI steps
  totalTokens       Int     @default(0)   // input + output; denormalized for fast admin list display
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  folder        Folder           @relation(fields: [folderId], references: [id])
  files         NoteFile[]
  chunks        NoteChunk[]
  tokenUsage    NoteTokenUsage[]
}

enum NoteStatus {
  PENDING
  PROCESSING
  DONE
  FAILED
}

// ─── NOTE FILE ──────────────────────────────────────────
model NoteFile {
  id          String      @id @default(uuid())
  noteId      String
  type        FileType
  storageKey  String
  mimeType    String
  sizeBytes   Int
  durationSec Int?
  createdAt   DateTime    @default(now())

  note        Note        @relation(fields: [noteId], references: [id])
}

enum FileType {
  AUDIO
  IMAGE
}

// ─── NOTE CHUNK (RAG Embeddings) ────────────────────────
model NoteChunk {
  id          String    @id @default(uuid())
  noteId      String
  chunkIndex  Int
  content     String    // plain text chunk (~500 tokens)
  embedding   Unsupported("vector(1536)") // OpenAI text-embedding-3-small (1536-dim) via Metis; must match METIS_EMBEDDING_MODEL
  createdAt   DateTime  @default(now())

  note        Note      @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([noteId])
}

// ─── NOTE TOKEN USAGE (per AI step) ─────────────────────
// One row per Gemini call made while processing a note. Captured from each
// response's usageMetadata by the worker. Used for cost monitoring and
// surfaced in the backoffice (Section 5.9.2). Distinct from credits, which
// are the billing units charged to the user (Note.creditCost).
model NoteTokenUsage {
  id            String   @id @default(uuid())
  noteId        String
  model         String   // e.g. "gemini-2.5-pro" or the embedding model
  inputTokens   Int      @default(0)   // promptTokenCount
  outputTokens  Int      @default(0)   // candidatesTokenCount (0 for embeddings)
  totalTokens   Int      @default(0)   // totalTokenCount
  createdAt     DateTime @default(now())

  note          Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([noteId])
}

// ─── CHAT SESSION ───────────────────────────────────────
model ChatSession {
  id              String        @id @default(uuid())
  userId          String
  folderId        String
  selectedNoteIds String[]
  title           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation(fields: [userId], references: [id])
  folder          Folder        @relation(fields: [folderId], references: [id])
  messages        ChatMessage[]
}

// ─── CHAT MESSAGE ───────────────────────────────────────
model ChatMessage {
  id          String      @id @default(uuid())
  sessionId   String
  role        MessageRole
  content     String
  createdAt   DateTime    @default(now())

  session     ChatSession @relation(fields: [sessionId], references: [id])
}

enum MessageRole {
  USER
  ASSISTANT
}

// ─── CREDIT TRANSACTION ─────────────────────────────────
model CreditTransaction {
  id             String          @id @default(uuid())
  userId         String
  type           TransactionType
  amount         Int
  description    String?
  refId          String?
  idempotencyKey String?         @unique   // e.g. "usage:{noteId}" / "refund:{noteId}" — guarantees at most one charge and one refund per note
  createdAt      DateTime        @default(now())

  user           User            @relation(fields: [userId], references: [id])
}

enum TransactionType {
  PURCHASE
  USAGE
  FREE_GRANT
  REFUND
  ADMIN_ADJUSTMENT   // manual add/subtract by an admin (reason stored in description, admin id in refId)
}

// ─── PLAN (credit pack) ─────────────────────────────────
model Plan {
  id                String        @id @default(uuid())
  name              String        // e.g. "بسته ۱۰۰ اعتباری"
  originalPriceIRT  Int           // original/regular price in Toman (shown struck-through)
  priceIRT          Int           // discounted price actually charged (== originalPriceIRT when not discounted)
  credits           Int           // credits granted on purchase
  isActive          Boolean       @default(true)   // false hides it from the pricing page
  createdAt         DateTime      @default(now())

  paymentRecords    PaymentRecord[]
}

// ─── JOB RECORD ─────────────────────────────────────────
model JobRecord {
  id            String    @id @default(uuid())
  noteId        String    @unique
  status        JobStatus @default(QUEUED)
  attempts      Int       @default(0)
  error         String?
  errorClass    String?   // taxonomy class of the last error (see 6.4.1): transient | rate_limited | malformed | bad_request | auth | balance | oversized
  metisFileUrls Json?     // cached Metis storage URLs so a retry reuses the upload (idempotency, 6.4.2)
  startedAt     DateTime?
  finishedAt    DateTime?
  createdAt     DateTime  @default(now())
}

enum JobStatus {
  QUEUED
  PROCESSING
  DONE
  FAILED
}

// ─── NOTIFICATION ────────────────────────────────────────
model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false)
  metadata  Json?            // e.g. { noteId, folderId, folderName }
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt(sort: Desc)])
}

enum NotificationType {
  NOTE_DONE
  NOTE_FAILED
}

// ─── PAYMENT RECORD ──────────────────────────────────────
// Persists every gateway payment attempt. Referenced by the Zarinpal flow
// (Section 12) and surfaced in the backoffice payments view (Section 5.9).
model PaymentRecord {
  id          String        @id @default(uuid())
  userId      String
  planId      String
  amountIRT   Int
  authority   String?       @unique   // Zarinpal authority token
  refId       String?                 // Zarinpal ref_id on success (financial reference)
  cardPan     String?                 // masked card number from verify (e.g. 502229******5995)
  status      PaymentStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  paidAt      DateTime?

  user        User          @relation(fields: [userId], references: [id])
  plan        Plan          @relation(fields: [planId], references: [id])

  @@index([status, createdAt(sort: Desc)])
  @@index([userId])
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

// ─── ADMIN ───────────────────────────────────────────────
model Admin {
  id            String      @id @default(uuid())
  mobile        String      @unique   // login identifier (phone) + where the step-2 OTP is sent
  passwordHash  String
  displayName   String
  role          AdminRole   @default(SUPPORT)
  isActive      Boolean     @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  auditLogs     AuditLog[]
  otps          AdminOtp[]
}

enum AdminRole {
  SUPER_ADMIN   // everything, including managing other admins
  ADMIN         // users, plans, payments, analytics
  SUPPORT       // view users, adjust credits, impersonate; no plan/payment edits, no admin management
}

// ─── ADMIN OTP (login step 2) ────────────────────────────
model AdminOtp {
  id          String    @id @default(uuid())
  adminId     String
  challengeId String    @unique   // ties the OTP to a specific step-1 challenge token
  code        String
  expiresAt   DateTime
  usedAt      DateTime?
  createdAt   DateTime  @default(now())

  admin       Admin     @relation(fields: [adminId], references: [id])
}

// ─── AUDIT LOG ───────────────────────────────────────────
// Immutable record of every state-changing admin action. Never updated or
// deleted by application code.
model AuditLog {
  id          String      @id @default(uuid())
  adminId     String
  action      AuditAction
  targetType  String                  // "USER" | "PLAN" | "ADMIN"
  targetId    String?
  metadata    Json?                   // e.g. { amount, reason, before, after }
  ipAddress   String?
  createdAt   DateTime    @default(now())

  admin       Admin       @relation(fields: [adminId], references: [id])

  @@index([adminId, createdAt(sort: Desc)])
  @@index([targetType, targetId])
}

enum AuditAction {
  ADMIN_LOGIN
  USER_CREDIT_ADJUST
  USER_SUSPEND
  USER_BAN
  USER_REACTIVATE
  USER_IMPERSONATE_START
  USER_IMPERSONATE_END
  PLAN_CREATE
  PLAN_UPDATE
  PLAN_SET_ACTIVE
  ADMIN_CREATE
  ADMIN_UPDATE_ROLE
  ADMIN_DEACTIVATE
  OTP_CHANNEL_CONFIG
}
```

---

## 5. API Design

### 5.1 GraphQL Endpoint

```
POST https://api.nevisoai.ir/graphql        # Queries & Mutations
WSS  wss://api.nevisoai.ir/graphql           # Subscriptions (graphql-ws protocol)
```

All operations require `Authorization: Bearer <access_token>` header unless marked **[Public]**.

**Note:** The Zarinpal payment callback remains as a dedicated REST endpoint (`GET /api/payments/verify`) since it is an external redirect, not a client-initiated GraphQL operation.

### 5.2 Authentication Operations

```graphql
type Query {
  otpChannels: [OtpChannel!]!                                       # [Public] channels the admin has enabled
}

type Mutation {
  requestOtp(mobile: String!, channel: OtpChannel): OtpResponse!    # [Public] channel required only when BOTH enabled
  verifyOtp(mobile: String!, code: String!): AuthTokens!            # [Public]
  login(mobile: String!, password: String!): AuthTokens!            # [Public]
  refreshToken: AuthTokens!                                         # [Public]
  logout: Boolean!
  changePassword(currentPassword: String, newPassword: String!): Boolean!
}

enum OtpChannel { SMS  BALE }

type OtpResponse {
  expiresIn: Int!
  channel: OtpChannel!     # the channel the code was actually sent through (after any fallback)
}

type AuthTokens {
  accessToken: String!
  refreshToken: String!
  isNewUser: Boolean!
}
```

### 5.3 Folder Operations

```graphql
type Query {
  folders: [Folder!]!
}

type Mutation {
  createFolder(input: CreateFolderInput!): Folder!
  updateFolder(id: ID!, input: UpdateFolderInput!): Folder!
  deleteFolder(id: ID!): Boolean!
}

input CreateFolderInput {
  name: String!
  coverUrl: String
}

input UpdateFolderInput {
  name: String
  coverUrl: String
}

type Folder {
  id: ID!
  name: String!
  coverUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
  notes: [Note!]!
}
```

### 5.4 Note Operations

```graphql
type Query {
  notes(folderId: ID!): [Note!]!
  note(id: ID!): Note!
  noteAudioUrl(noteId: ID!): SignedUrl!
}

type Mutation {
  requestUploadUrls(input: RequestUploadUrlsInput!): UploadSession!
  confirmUpload(input: ConfirmUploadInput!): UploadConfirmation!
  updateNote(id: ID!, input: UpdateNoteInput!): Note!     # edits contentJson only; sets isEdited = true
  resetNoteToOriginal(id: ID!): Note!                     # restores contentJson from originalContentJson; sets isEdited = false
  moveNote(id: ID!, targetFolderId: ID!): Note!
  deleteNote(id: ID!): Boolean!
}

input RequestUploadUrlsInput {
  folderId: ID!
  files: [FileInput!]!
}

input FileInput {
  fileName: String!
  mimeType: String!
  sizeBytes: Int!
}

type UploadSession {
  uploadSessionId: ID!
  files: [PresignedFile!]!
}

type PresignedFile {
  storageKey: String!
  uploadUrl: String!
  expiresIn: Int!
}

input ConfirmUploadInput {
  uploadSessionId: ID!
  recordedAt: DateTime
}

type UploadConfirmation {
  noteId: ID!
  jobId: String!
  status: NoteStatus!
  message: String!
}

input UpdateNoteInput {
  title: String
  contentJson: JSON      # full ProseMirror doc incl. tables, color/highlight/underline/font marks, alignment, and per-block direction
  recordedAt: DateTime   # the note's date (the date it refers to), user-editable; independent of createdAt (upload date)
}

type SignedUrl {
  url: String!
  expiresIn: Int!
}

type Note {
  id: ID!
  folderId: ID!
  title: String!
  contentJson: JSON!
  originalContentJson: JSON   # the AI's first version; null only for legacy notes created before this field existed
  isEdited: Boolean!          # has the user edited it since generation?
  recordedAt: DateTime!
  status: NoteStatus!
  creditCost: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  files: [NoteFile!]!
}
```

### 5.5 Export Operations

```graphql
type Query {
  exportNotePdf(noteId: ID!): PdfExport!
  exportFolderPdf(folderId: ID!): PdfExport!
}

type PdfExport {
  downloadUrl: String!
  expiresIn: Int!
}
```

The `downloadUrl` is a temporary signed URL. The client fetches the PDF binary from this URL directly (outside GraphQL).

### 5.6 Chat Operations

```graphql
type Query {
  chatSessions: [ChatSession!]!
  chatSession(id: ID!): ChatSession!
}

type Mutation {
  createChatSession(input: CreateChatSessionInput!): ChatSession!
  sendChatMessage(sessionId: ID!, content: String!): ChatMessage!
  deleteChatSession(id: ID!): Boolean!
}

input CreateChatSessionInput {
  folderId: ID!
  selectedNoteIds: [ID!]!
}

type ChatSession {
  id: ID!
  folderId: ID!
  selectedNoteIds: [ID!]!
  title: String
  createdAt: DateTime!
  messages: [ChatMessage!]!
}

type ChatMessage {
  id: ID!
  role: MessageRole!
  content: String!
  createdAt: DateTime!
}
```

**Send message flow (RAG):**
When `sendChatMessage` mutation is called:
1. **Condense the follow-up.** If the session already has prior messages, make a lightweight `generateContent` call that rewrites the user's latest message into a **standalone query** using the recent conversation history — so a vague follow-up like "explain that more" becomes self-contained (e.g. "explain RAG indexing in more detail"). On the first message of a session, the message is used as-is.
2. Generate a vector embedding for the **condensed standalone query** via the Metis embeddings endpoint (Section 6.0)
3. Perform a cosine similarity search in pgvector on the `NoteChunk` table, filtered by the notes belonging to the session's `selectedNoteIds` (which are within the selected `folderId`)
4. Retrieve the top 5 most relevant chunks
5. Send to Gemini via Metis (`generateContent`): the RAG chatbot system prompt + the retrieved chunks + the **recent conversation history (the last 15 messages of the session — user + assistant combined)** + the new user message (original wording). The history is what lets multi-turn follow-ups keep their meaning.
6. Return the AI response and save both messages (user + assistant) to `ChatMessage`

> **What's sent to the model.** Retrieval (steps 1–4) is driven by the **condensed standalone query**, so follow-ups that refer back to earlier turns ("explain that", "the second one") still retrieve the right chunks. Generation (step 5) replays only the **last 15 messages** (user + assistant) — not the entire thread — because chat is retained indefinitely and a long conversation would otherwise overflow the model's context and waste tokens. Older turns beyond the 15-message window stay stored and visible to the user; they're just not re-sent to the model. The user pays a flat 10 credits per message (Section 6.3) regardless of how much history is replayed or that condensation adds one extra internal call, so this affects only backend token usage.

> **Indexing source:** `NoteChunk` embeddings are built from the note's `originalContentJson` (the AI version), and are **not** rebuilt when a user edits the note. The chatbot therefore always answers from the original AI note, not the user's edits. This is intentional — it keeps chat grounded in the faithful generated record and avoids an embedding call on every edit. (Re-indexing on edit can be added later if needed.)

> **Chat history retention:** `ChatSession` and `ChatMessage` are retained **indefinitely** — chat history is never auto-deleted. (Unlike notifications, which are purged after 90 days — Section 17.) A user can always reopen and continue any past conversation.

### 5.7 Credit Pack & Payment Operations

```graphql
type Query {
  plans: [Plan!]!                      # [Public] available credit packs
  myCredits: CreditBalance!
  myTransactions: [CreditTransaction!]!
}

type Mutation {
  initiatePayment(planId: ID!): PaymentLink!   # buy a credit pack (one-time)
}

type Plan {                            # a credit pack
  id: ID!
  name: String!
  originalPriceIRT: Int!               # regular price (shown struck-through)
  priceIRT: Int!                       # discounted price actually charged
  credits: Int!
}

type CreditBalance {
  balance: Int!
}

type PaymentLink {
  paymentUrl: String!
}
```

> **REST exception:** Zarinpal payment callback is handled at `GET /api/payments/verify?Authority=...&Status=OK` — see Section 12.1.

### 5.8 Notification Operations

```graphql
type Query {
  notifications: NotificationList!
  unreadNotificationCount: Int!
}

type Mutation {
  markNotificationRead(id: ID!): Notification!
  markAllNotificationsRead: Boolean!
  deleteNotification(id: ID!): Boolean!
}

type NotificationList {
  items: [Notification!]!
  unreadCount: Int!
}

type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  body: String!
  isRead: Boolean!
  metadata: JSON
  createdAt: DateTime!
}
```

### 5.9 Admin (Backoffice) Operations

All admin operations live in an **isolated GraphQL module** on the same API server. Every admin operation (except the two public login steps) requires `Authorization: Bearer <admin_access_token>` — a token signed with a **separate secret** from user tokens (see Section 7.4). Resolvers are protected by `AdminAuthGuard` and, where noted, `AdminRoleGuard`. The admin token is rejected by all user resolvers and vice versa.

Role requirements are shown as **[SUPPORT]**, **[ADMIN]**, or **[SUPER_ADMIN]** (each role implies the ones below it: SUPER_ADMIN ⊃ ADMIN ⊃ SUPPORT).

#### 5.9.1 Admin Authentication (Two-Step)

```graphql
type Mutation {
  adminLoginStep1(mobile: String!, password: String!): AdminLoginChallenge!   # [Public]
  adminLoginStep2(challengeId: ID!, code: String!): AdminAuthTokens!         # [Public]
  adminRefreshToken: AdminAuthTokens!                                        # [Public — refresh cookie]
  adminLogout: Boolean!
}

type AdminLoginChallenge {
  challengeId: ID!     # opaque id for step 2
  expiresIn: Int!      # seconds until the challenge + OTP expire
  maskedMobile: String! # e.g. "912****567" — where the OTP was sent
}

type AdminAuthTokens {
  accessToken: String!
  refreshToken: String!
  admin: AdminProfile!
}

type AdminProfile {
  id: ID!
  mobile: String!
  displayName: String!
  role: AdminRole!
}

enum AdminRole { SUPER_ADMIN  ADMIN  SUPPORT }
```

> Step 1 always returns success-shaped responses for valid input format and **does not reveal whether the mobile is registered**; on bad credentials it returns the standard `ADMIN_CREDENTIALS_INVALID` error without distinguishing "no such admin" from "wrong password". The OTP is only sent when credentials are valid.

#### 5.9.2 User Management

```graphql
type Query {
  adminUsers(filter: AdminUserFilter, page: PageInput): AdminUserList!   # [SUPPORT]
  adminUser(id: ID!): AdminUserDetail!                                   # [SUPPORT]
}

type Mutation {
  adminAdjustCredit(input: AdjustCreditInput!): AdminUserDetail!         # [SUPPORT]
  adminSetUserStatus(input: SetUserStatusInput!): AdminUserDetail!       # [SUPPORT]
  adminImpersonateUser(userId: ID!): ImpersonationToken!                 # [SUPPORT]
}

input AdminUserFilter {
  search: String          # matches mobile, displayName, or id
  status: UserStatus
  hasPaid: Boolean
}

input PageInput {
  limit: Int = 25
  offset: Int = 0
}

input AdjustCreditInput {
  userId: ID!
  amount: Int!            # positive to add, negative to subtract
  reason: String!        # REQUIRED — stored on the CreditTransaction + AuditLog
}

input SetUserStatusInput {
  userId: ID!
  status: UserStatus!    # ACTIVE | SUSPENDED | BANNED
  reason: String         # REQUIRED for SUSPENDED/BANNED
  suspendedUntil: DateTime # optional, only for SUSPENDED (null = indefinite)
}

type AdminUserList {
  items: [AdminUserSummary!]!
  total: Int!
}

type AdminUserSummary {
  id: ID!
  mobile: String!
  displayName: String
  creditBalance: Int!
  status: UserStatus!
  createdAt: DateTime!
}

type AdminUserDetail {
  id: ID!
  mobile: String!
  displayName: String
  hasPassword: Boolean!          # never expose the hash
  creditBalance: Int!
  status: UserStatus!
  statusReason: String
  suspendedUntil: DateTime
  folderCount: Int!
  noteCount: Int!
  transactions: [CreditTransaction!]!
  createdAt: DateTime!
}

type ImpersonationToken {
  accessToken: String!   # a USER access token scoped to the target user, flagged impersonated
  expiresIn: Int!        # short (e.g. 1800s)
  user: AdminUserSummary!
}

enum UserStatus { ACTIVE  SUSPENDED  BANNED }
```

**Impersonation semantics:** `adminImpersonateUser` returns a user-scoped access token whose JWT carries an `act` claim (`{ adminId }`). When the API sees a token with `act` set, it allows read operations and benign mutations but **rejects** `initiatePayment`, any credit-spending mutation (`requestUploadUrls`/`confirmUpload`/`sendChatMessage`), `changePassword`, and all delete mutations with `IMPERSONATION_FORBIDDEN`. The token has a short TTL and cannot be refreshed. Start and (best-effort) end are written to the audit log.

#### 5.9.3 Plan Management

```graphql
type Query {
  adminPlans: [Plan!]!                                   # [ADMIN]  (includes inactive)
}

type Mutation {
  adminCreatePlan(input: AdminPlanInput!): Plan!         # [ADMIN]
  adminUpdatePlan(id: ID!, input: AdminPlanInput!): Plan! # [ADMIN]
  adminSetPlanActive(id: ID!, isActive: Boolean!): Plan! # [ADMIN]
}

input AdminPlanInput {
  name: String!
  originalPriceIRT: Int!     # regular price
  priceIRT: Int!             # discounted price actually charged (set equal to originalPriceIRT for no discount)
  credits: Int!
}
```

> A `Plan` is a credit pack: a one-time purchase that grants `credits`. Each pack carries **two prices** — `originalPriceIRT` (regular, shown struck-through) and `priceIRT` (the discounted price actually charged); set them equal when a pack has no discount. There are no subscriptions, terms, or expiry. Deactivating a pack (`adminSetPlanActive`) hides it from the pricing page without affecting past purchases.

#### 5.9.4 Payments

```graphql
type Query {
  adminPayments(filter: AdminPaymentFilter, page: PageInput): AdminPaymentList!  # [ADMIN]
  adminPayment(id: ID!): AdminPaymentDetail!                                     # [ADMIN]
}

input AdminPaymentFilter {
  status: PaymentStatus
  planId: ID
  search: String         # by user mobile / id
  from: DateTime
  to: DateTime
}

type AdminPaymentList {
  items: [AdminPaymentSummary!]!
  total: Int!
  totalPaidIRT: Int!     # sum of PAID amounts within the current filter
}

type AdminPaymentSummary {
  id: ID!
  userMobile: String!
  planName: String!
  amountIRT: Int!
  status: PaymentStatus!
  createdAt: DateTime!
  paidAt: DateTime
}

type AdminPaymentDetail {
  id: ID!
  user: AdminUserSummary!
  plan: Plan!
  amountIRT: Int!
  authority: String
  refId: String
  status: PaymentStatus!
  createdAt: DateTime!
  paidAt: DateTime
}

enum PaymentStatus { PENDING  PAID  FAILED }
```

#### 5.9.5 Analytics Dashboard

```graphql
type Query {
  adminDashboardStats(range: StatRange = LAST_30_DAYS): DashboardStats!         # [ADMIN]
  adminRevenueSeries(range: StatRange!, interval: Interval = DAY): [SeriesPoint!]! # [ADMIN]
  adminSignupSeries(range: StatRange!, interval: Interval = DAY): [SeriesPoint!]! # [ADMIN]
  adminNotesSeries(range: StatRange!, interval: Interval = DAY): [SeriesPoint!]!  # [ADMIN]
}

enum StatRange { LAST_7_DAYS  LAST_30_DAYS  LAST_90_DAYS }
enum Interval { DAY  WEEK }

type DashboardStats {
  totalUsers: Int!
  activeUsers: Int!          # users active within the range
  newSignups: Int!           # within the range
  totalNotesGenerated: Int!
  processingSuccessRate: Float! # DONE / (DONE + FAILED) within range
  totalRevenueIRT: Int!      # PAID within range
  payingUserConversion: Float! # paying / active users
}

type SeriesPoint {
  date: String!   # ISO date bucket
  value: Float!
}
```

#### 5.9.6 Audit Log

```graphql
type Query {
  adminAuditLogs(filter: AuditFilter, page: PageInput): AuditLogList!   # [ADMIN]
}

input AuditFilter {
  adminId: ID
  action: AuditAction
  targetType: String
  targetId: ID
  from: DateTime
  to: DateTime
}

type AuditLogList {
  items: [AuditLogEntry!]!
  total: Int!
}

type AuditLogEntry {
  id: ID!
  admin: AdminProfile!
  action: AuditAction!
  targetType: String!
  targetId: ID
  metadata: JSON
  ipAddress: String
  createdAt: DateTime!
}
```

#### 5.9.7 Admin Management (SUPER_ADMIN only)

```graphql
type Query {
  adminListAdmins: [AdminProfile!]!                              # [SUPER_ADMIN]
}

type Mutation {
  adminCreateAdmin(input: CreateAdminInput!): AdminProfile!      # [SUPER_ADMIN]
  adminUpdateAdminRole(id: ID!, role: AdminRole!): AdminProfile! # [SUPER_ADMIN]
  adminDeactivateAdmin(id: ID!): Boolean!                        # [SUPER_ADMIN]
}

input CreateAdminInput {
  mobile: String!              # login identifier + OTP destination
  displayName: String!
  role: AdminRole!
  temporaryPassword: String!   # admin must change on first login
}
```

> There is **no public admin sign-up**. The first SUPER_ADMIN is created via a one-off seed script / migration; all others are provisioned through `adminCreateAdmin`.

#### 5.9.8 Platform Settings — OTP Channels

```graphql
type Query {
  adminOtpChannelMode: OtpChannelMode!                            # [ADMIN]
}

type Mutation {
  adminSetOtpChannelMode(mode: OtpChannelMode!): OtpChannelMode!  # [ADMIN]
}

enum OtpChannelMode {
  SMS_ONLY    # OTP via SMS Web Service only
  BALE_ONLY   # OTP via Bale only
  BOTH        # user picks SMS or Bale at login
}
```

Persisted in `AppSetting` (key `otp.channels`); changes are written to the audit log (`OTP_CHANNEL_CONFIG`). **The default at launch is `BOTH`** (both SMS and Bale offered; the user picks). The public `otpChannels` query (Section 5.2) derives its result from this setting, so the login UI shows a channel picker only in `BOTH` mode. See Section 7.2.1 for delivery behavior and Bale-account fallback.

---

## 6. AI Processing Pipeline

All AI processing — multimodal note generation, embeddings, and the RAG chatbot — runs on **Google Gemini accessed through the Metis (متیس) gateway**, an Iran-accessible AI provider. Neviso never calls Google's endpoints directly; every AI request goes to Metis, which proxies to Gemini (and to other providers for embeddings). This keeps the service reachable from inside Iran and consolidates keys and billing under a single Metis account.

### 6.0 Provider Integration (Gemini via Metis)

> **Reference doc:** the Metis API documentation is in the `./document` folder; consult it for exact request/response shapes and any endpoint details beyond what's summarized here.

**Base URL**

All AI calls go to `https://api.metisai.ir`, configured via `METIS_BASE_URL`. A single Metis API key (prefix `tpsg-`) is used for every call, stored as `METIS_API_KEY`.

**Endpoints used**

| Purpose | Method & Path | Auth header |
|---|---|---|
| Note generation (multimodal: text + audio + image) | `POST /v1beta/models/{model}:generateContent` | `x-goog-api-key: <METIS_API_KEY>` |
| Embeddings (RAG) | `POST /api/v1/embeddings` | `Authorization: Bearer <METIS_API_KEY>` |
| Media upload (hand files to the model) | `POST /api/v1/storage` | `Authorization: Bearer <METIS_API_KEY>` |
| List available models | `GET /api/v1/meta` | `Authorization: Bearer <METIS_API_KEY>` |

> Two auth styles, one key: the **Gemini-compatible** endpoint expects the key in an `x-goog-api-key` header (mirroring Google's own API), while **Metis-native** endpoints (embeddings, storage, meta) expect `Authorization: Bearer`.

**Generation request** — the Gemini-compatible endpoint is a drop-in for Google's API, so the existing request/response shape is unchanged; only the host and auth header differ:

```
POST https://api.metisai.ir/v1beta/models/gemini-2.5-pro:generateContent
x-goog-api-key: tpsg-...
content-type: application/json

{
  "contents": [ { "role": "user", "parts": [ /* prompt text + inline media */ ] } ],
  "generationConfig": { "responseMimeType": "application/json" }
}
```

The generation model is set via `METIS_GEMINI_MODEL` (e.g. `gemini-2.5-pro`). Because the response is the standard Gemini shape, `usageMetadata` (token counts) is returned exactly as before — so the per-note token capture in Section 4.2 is unaffected by the move to Metis.

> **Implementation note (NestJS):** the worker calls this endpoint with a plain HTTPS request (or the `@google/genai` SDK pointed at `METIS_BASE_URL`). No Google service account or GCP project is required — only the Metis key.

**Embeddings request** — Neviso uses **OpenAI** embeddings through Metis (Gemini is not required for embeddings). The endpoint accepts a batch, so all of a note's chunks are embedded in one request:

```
POST https://api.metisai.ir/api/v1/embeddings
Authorization: Bearer tpsg-...
content-type: application/json

{
  "model": { "name": "openai", "model": "text-embedding-3-small" },
  "input": ["chunk 1 text", "chunk 2 text", "..."]
}
```

Response contains `data[].embedding` (one float array per input, in order) plus `usage.total_tokens`.

> **Embedding dimension:** the `NoteChunk.embedding` column is `vector(1536)`, matching OpenAI `text-embedding-3-small` (1536 dimensions), set in `METIS_EMBEDDING_MODEL` / `METIS_EMBEDDING_PROVIDER`. Available models can be listed via `GET /api/v1/meta` (field `embeddingProviders`). **If a model with a different dimension is chosen (e.g. `text-embedding-3-large` at 3072, or a Google 768-dim model), the `vector(N)` column must be changed to match.**

**Media handling** — user files are still stored durably in Arvan Object Storage (Section 8) as the app's source-of-truth (originals, re-processing, exports, avatars). To feed media to the model, the worker uploads the note's audio/image files to **Metis storage** (`POST /api/v1/storage`) and passes the returned `url`(s) to the `generateContent` request. The storage response shape is:

```
{ "files": [ { "objectName": "String", "url": "String", "size": Int, "contentType": "String" } ] }
```

**Provider error handling** — Metis returns `402 Payment Required` when the account balance is too low; the worker marks the note `FAILED` with an operator-facing reason (see Section 6.4) and the platform team tops up the Metis account. `401` = bad/missing key; `400` = malformed request; `500` = Metis or upstream provider error (retryable).

### 6.1 Flow: Voice + Image → Note

```
0. Client-side optimization (before requesting URLs):
   - Images: downscale each photo to a max long-edge (~2000px) and re-encode JPEG (~80% quality) using `browser-image-compression`. Typically cuts a multi-MB phone photo to a few hundred KB with no meaningful loss for reading board text. (HEIC that the browser can't decode is uploaded as-is and converted server-side — Section 6.1 step c.)
   - Audio: in-app recordings are captured at a speech-friendly, low-bitrate mono setting (small files). Audio files the user picks from their device are uploaded as-is within the size limit (in-browser transcoding is too heavy for mobile).
   - The optimized file size/type is what's sent in `files[]` below.

1. Client → mutation requestUploadUrls { folderId, files[] }
2. API Server:
   a. Validate credit balance (estimate from file sizes/count) → abort if insufficient
   b. Validate file types (mime) and sizes against limits
   c. Generate S3 presigned PUT URLs (**30-min expiry**) with Content-Type and Content-Length conditions
   d. Create temporary UploadSession record (or Redis cache entry) with file metadata
   e. Return { uploadSessionId, files[].uploadUrl, files[].storageKey }

3. Client uploads each (optimized) file directly to Arvan Object Storage via PUT to presigned URL

> **Why 30 minutes (and why the queue doesn't matter here).** This expiry is the window for the **client's direct upload** only (step 3), which completes **before** `confirmUpload` enqueues the job — so the time a job later spends waiting in the BullMQ queue does **not** consume this URL. The worker fetches the file from Arvan **server-side with its own credentials** (Section 6.1), not via this presigned PUT URL. The bump from 10→30 minutes is purely to give large files (audio up to 200 MB, Section 8.3) enough time to upload over slow mobile connections; it has nothing to do with processing/queue time.

4. Client → mutation confirmUpload { uploadSessionId, recordedAt? }
5. API Server:
   a. Verify all files exist in S3 (HeadObject check)
   b. Pre-deduct estimated credits
   c. Create Note record (status: PENDING)
   d. Create NoteFile records with storage keys
   e. Create JobRecord
   f. Push job to BullMQ queue "note-generation"
   g. Return { noteId, jobId, status: "PENDING" }

6. Background Worker picks up job:
   a. Note status → PROCESSING
   b. Publish to noteStatusChanged subscription: { noteId, status: "PROCESSING" }
   c. Download files from Arvan (temp); **normalize images for the model — convert any HEIC/HEIF images (common from iPhones) to JPEG via `sharp`** before the next step
   d. Upload the media to Metis storage (`POST /api/v1/storage`, Section 6.0) → receive a Metis file `url` for each audio/image
   e. Send the combined prompt + Metis file URL(s) to Gemini **via Metis** (`generateContent`, Section 6.0) in a **single multimodal request** → returns a JSON object `{ title, contentJson }` where `contentJson` is the note body as a TipTap / ProseMirror document
   f. Parse **and validate** the JSON (must be a well-formed ProseMirror doc — see 6.4.1); save **both** contentJson and originalContentJson to the AI output + title; **Note status → DONE, `isIndexed` = false** (the note is now readable)
   g. **Create Notification (type: NOTE_DONE)**; publish `noteStatusChanged` { noteId, status: "DONE", title } + `notificationReceived`
   h. Finalize the credit charge (keep the reserved USAGE transaction; see 6.4.3); publish `creditUpdated`
   i. **Indexing (graceful — see 6.4.4):** chunk the plain text of **`originalContentJson`** (~500 tokens) → Metis embeddings (OpenAI `text-embedding-3-small`) → save `NoteChunk` rows (vector(1536)) → set `isIndexed` = true. If indexing fails, leave `isIndexed` = false and enqueue a separate index-retry job; **the note stays DONE and is not refunded.**

7. Client receives subscription event → query note(id)
```

### 6.2 Gemini Prompt Strategy

**Combined note generation prompt (single multimodal call):**

The audio file(s) and image(s) are attached to **one** Gemini request alongside the prompt below. Gemini analyzes the content, adapts its formatting to the detected context (instructional, operational, transactional, narrative), and returns a single JSON object containing the title and the note body as a TipTap / ProseMirror document.

```
You are an advanced Audio-to-Documentation AI Specialist.
Your goal is to transform audio transcripts into **exhaustive, highly detailed, and professionally structured notes**.

### CORE INSTRUCTIONS
1.  **Analyze Context Dynamically:** Do not rely on hardcoded lists. Instead, analyze the **intent** and **speaker relationship**:
    * *Is it instructional?* (One teaching many) -> Format as a **Detailed Study Guide/Textbook**.
    * *Is it operational?* (Team discussing tasks) -> Format as **Meeting Minutes**.
    * *Is it persuasive/transactional?* (Selling, negotiating, pitching) -> Format as a **Business/Sales Report**. (CRITICAL: Do NOT confuse a salesperson explaining a product with a professor teaching a class).
    * *Is it narrative/personal?* (Story, diary, interview) -> Format as a **Detailed Log/Chronicle**.

2.  **Maximize Detail (Anti-Summary Mode):**
    * **NEVER summarize briefly.** Your output must be a comprehensive documentation of the content.
    * If a speaker tells a 5-minute story or explanation, write a full paragraph about it. Do not reduce it to one bullet point.
    * Capture specific numbers, names, dates, technical terms, prices, and objections exactly as stated.

3.  **Language:** The output `title` and all text inside `contentJson` MUST be in the **same language** as the spoken audio.

### CONTENT STRUCTURE GUIDELINES (Field: `contentJson`)
`contentJson` MUST be a valid TipTap / ProseMirror document. The root is: { "type": "doc", "content": [ ...nodes ] }.
Use ONLY these node and mark types:
* Heading: { "type": "heading", "attrs": { "level": 1 to 4 }, "content": [ { "type": "text", "text": "..." } ] }
* Paragraph: { "type": "paragraph", "content": [ { "type": "text", "text": "..." } ] }
* Bullet list: { "type": "bulletList", "content": [ { "type": "listItem", "content": [ { "type": "paragraph", ... } ] } ] }
* Numbered list: { "type": "orderedList", "content": [ { "type": "listItem", "content": [ { "type": "paragraph", ... } ] } ] }
* Blockquote: { "type": "blockquote", "content": [ { "type": "paragraph", ... } ] }
* Code block: { "type": "codeBlock", "content": [ { "type": "text", "text": "..." } ] }
* Inline emphasis: add marks to a text node, e.g. { "type": "text", "text": "...", "marks": [ { "type": "bold" } ] } (allowed marks: "bold", "italic", "code").

Adapt the headings to the detected context:
* **If Instructional (Lecture/Training):** Focus on *Concepts, Detailed Explanations, Examples, Formulas/Code*.
* **If Operational (Meeting):** Focus on *Agenda, Discussion Details, Decisions, Action Items (Who/When)*.
* **If Transactional (Sales/Negotiation):** Focus on *Customer Needs, Proposed Solution, Handling Objections, Commercial Terms, Next Steps*.
* **If General/Personal:** Focus on *Main Topics, Detailed Thoughts, Key Insights*.

### OUTPUT FORMAT (Strict JSON)
Output **ONLY** a single valid JSON object. No markdown fencing, no reasoning text outside JSON.

**JSON Rules:**
1.  `title`: A descriptive, professional title in the detected language (e.g., "صورت‌جلسه بررسی بودجه سه ماهه" or "مذاکره فروش محصول X با مشتری").
2.  `contentJson`: A valid TipTap / ProseMirror document OBJECT (not a string, not HTML).
3.  Use only the node and mark types listed above so the note renders correctly in the editor.

**JSON Template:**
{
  "title": "Generated Title Based on Content",
  "contentJson": {
    "type": "doc",
    "content": [
      { "type": "heading", "attrs": { "level": 1 }, "content": [ { "type": "text", "text": "Main Topic" } ] },
      { "type": "paragraph", "content": [ { "type": "text", "text": "Detailed content goes here..." } ] }
    ]
  }
}
```

> Notes:
> - The prompt is **language-agnostic** — output is produced in whatever language the audio is spoken in (Persian, English, or other).
> - The prompt is **context-adaptive** — the same flow produces lecture notes, meeting minutes, sales reports, or chronicles depending on what's in the audio. Neviso's primary student audience is unchanged; this just means a non-lecture recording is still rendered usefully.
> - `contentJson` is a ProseMirror document object, matching the `Note.contentJson` column, the GraphQL `note.contentJson` field, the TipTap editor, and the PDF export pipeline — so no format conversion is needed anywhere.
> - **AI output is a subset of what the editor supports.** The prompt above emits headings, paragraphs, lists, blockquotes, code, and basic marks. The TipTap editor and the ProseMirror schema additionally support tables, text color, highlight, underline, font family, text alignment, and per-block direction (LTR/RTL) — so anything the **user** adds while editing is valid and persists in `contentJson`, and the PDF export (Section 11) must render the full set.
> - If a note has only audio or only images, the same prompt applies — Gemini works from whichever modality is present.
> - Embeddings (the indexing step, step i in Section 6.1) are a separate call to the **Metis embeddings endpoint** (Section 6.0), not the generation endpoint, and are handled as a separate failure domain (Section 6.4.4).

**RAG Chatbot system prompt:**
```
You are a helpful academic assistant for Persian university students.
Answer the user's question based STRICTLY on the provided context chunks
retrieved from their lecture notes. If the answer is not found in the
provided context, say so clearly — do not hallucinate or use outside knowledge.
Respond in Persian. Use clear, concise language suitable for studying.
```

### 6.3 Credit Calculation

| Action | Credit Cost |
|---|---|
| Audio processing | 1 credit per minute (rounded up) |
| Image processing | 2 credits per image |
| Chat message | 10 credits per message |
| New user free grant | 60 credits (configurable via env) |

**Credit & billing policy:**

- **Prepaid credits are the core model.** Users buy credits up front (like a phone top-up / شارژ) and spend them on the actions above. There is **one** `creditBalance` per user.
- **Credits never expire.** Once purchased or granted, credits stay on the account indefinitely. This keeps the model fair for seasonal student usage and removes any expiry/rollover logic.
- **One purchase type: credit packs.** A `Plan` is a credit pack — a one-time purchase that adds its `credits` to the single balance. Each pack has **two prices**: an `originalPriceIRT` (regular, shown struck-through) and a `priceIRT` (the discounted price actually charged); the gateway charges `priceIRT`. Packs come in different sizes, but there are **no subscriptions, terms, auto-renewal, or recurring billing** of any kind.
- **Buying is a one-time charge.** Every purchase is a single Zarinpal payment; the user simply buys another pack when they want more credits.

### 6.4 Error Handling & Resilience (AI Worker)

The note-generation job calls several external systems (Metis storage, Metis/Gemini generation, Metis embeddings, Arvan, PostgreSQL) and runs asynchronously with retries, so failure handling is a first-class concern governed by three principles: **(1) classify before retrying** — not every error should be retried; **(2) every step is idempotent** — a retried or re-queued job must never double-charge, double-refund, or duplicate data; **(3) fail the smallest unit** — an indexing failure must not discard a successfully generated note.

#### 6.4.1 Error taxonomy & retry policy

| Class | Examples | Retryable? | Policy |
|---|---|---|---|
| Transient infra | network error, timeout, Metis/Gemini `500`, Arvan 5xx | Yes | BullMQ 3 attempts, exponential backoff (10s → 30s → 90s) |
| Rate limited | provider `429` | Yes | Honor `Retry-After`; longer backoff; counts against the attempt budget |
| Malformed model output | response not valid JSON, `contentJson` fails ProseMirror schema validation, missing `title` | Yes (limited) | Up to **2** regeneration attempts; if still invalid → fatal |
| Bad request | `400` malformed request, unsupported media type | **No (fatal)** | Fail immediately; log for engineering (it is a bug, not a transient fault) |
| Auth | Metis `401` bad/missing key | **No (fatal)** | Fail immediately; **ops alert** (misconfiguration) |
| Provider balance | Metis `402` insufficient balance | **No (fatal)** | Fail immediately; **ops alert**; do **not** burn retries (balance won't refill in 90s) |
| Oversized input | audio longer than the active model's limit | **No (fatal)** | Fail immediately with a specific user message (see chunking, Section 18) |

"Fatal" = skip remaining retries and go straight to terminal failure (6.4.5). The worker inspects the provider status code / exception type to classify; unclassified errors default to transient (retryable).

#### 6.4.2 Idempotency

Each note-generation job uses `noteId` as its BullMQ `jobId`, so duplicate enqueues collapse into one job. Every side-effecting step is guarded so that a retry, or a re-queued **stalled** job (worker died mid-run), is safe:

- **State-machine guard:** steps check current `Note.status` / existing data and skip work already done — e.g. if `contentJson` is already populated, generation is not re-run on a mid-job retry.
- **Embeddings:** existing `NoteChunk` rows for the note are deleted before re-insert (or the step is skipped when `isIndexed = true`), so chunks never duplicate.
- **Metis storage:** the uploaded file URL is cached on the `JobRecord` so a retry reuses it rather than re-uploading.
- **Credit operations:** idempotent via `CreditTransaction.idempotencyKey` (`usage:{noteId}`, `refund:{noteId}`), unique-indexed. At most one charge and one refund can ever exist per note, regardless of how many times the job runs.

#### 6.4.3 Credit lifecycle

```
confirmUpload  → reserve : CreditTransaction(USAGE,  key="usage:{noteId}")  + decrement balance   (idempotent)
generation OK  → finalize: keep USAGE; if actual cost ≠ estimate, post a single adjusting txn      (idempotent)
terminal fail  → refund  : CreditTransaction(REFUND, key="refund:{noteId}") + restore balance       (idempotent)
```

The user is **always refunded on terminal failure**, including platform-side failures (`402`/`401`) — a Neviso infrastructure problem must never cost the user credits. Whether the cause was the user's input or the platform is recorded in `Note.failureReason` for ops, but it does not change the refund decision.

#### 6.4.4 Graceful degradation: generation vs indexing

Generation (steps c–h) and RAG indexing (step i) are **separate failure domains**:

- Once generation is saved, the note is `DONE` and **readable**, with `isIndexed = false`.
- An indexing/embeddings failure does **not** fail the note and does **not** refund — it is retried by a separate lightweight index-retry job. Until it succeeds, `isIndexed` stays false and the chatbot shows "this note is still being prepared for chat."
- This avoids re-running (and re-paying for) Gemini generation just because the embeddings step failed, and never discards a good note over a RAG-only problem.

#### 6.4.5 Terminal failure handling

When a job fails terminally (a fatal class, or retryable attempts exhausted):

- `Note.status = FAILED`; `Note.failureReason` set (operator-facing)
- Credits refunded (6.4.3)
- Notification `NOTE_FAILED` created; `noteStatusChanged` published with a **user-friendly** message; `creditUpdated` published
- The job is retained in BullMQ's **failed set (dead-letter)** for inspection / debugging by the platform team

#### 6.4.6 Timeouts & stalled jobs

- Per-call timeouts: generation `METIS_GEN_TIMEOUT` (default 180s), storage/embeddings `METIS_IO_TIMEOUT` (default 60s); a timeout is classified transient (retryable)
- BullMQ lock is renewed during long generation; if the worker process dies, the job is detected as stalled and re-queued — safe because of idempotency (6.4.2)
- A maximum overall attempt count is enforced across stalls so a persistently failing job cannot loop forever

#### 6.4.7 Observability & alerting

- Every failure is logged with structured fields: `noteId`, error class, provider status code, attempt number, latency
- Metrics: job success rate, failure rate **by class**, p95 processing latency, queue depth
- **Alerts** routed to the platform team: Metis `402`/`401` (immediate), failure rate above threshold, queue backlog / stalled jobs
- The backoffice analytics `processingSuccessRate` (Section 5.9.5) is the product-level view of the same signal

### 6.5 Scalability & Concurrency

The async queue is what lets the product absorb many simultaneous users: `confirmUpload` only **enqueues** a job and returns immediately, so a burst of uploads becomes a backlog of jobs in Redis — never a wall of blocked requests or timeouts. Users see a "processing" state and are notified when their note is ready (Section 9). Throughput is then a function of how fast the worker tier drains that queue.

**How throughput scales:**

- **Worker concurrency.** A note-generation job is almost entirely **I/O-bound** (it spends its time awaiting Metis), so a single worker process runs many jobs in parallel. Concurrency is set via `WORKER_CONCURRENCY` (default **10** jobs per worker process).
- **Horizontal scaling.** The worker is its own Liara service (Section 15.1), and every replica consumes the **same** BullMQ queue. Throughput scales roughly linearly by adding worker replicas — no code change, no coordination, because jobs are idempotent and `noteId`-keyed (Section 6.4.2).
- **Stateless API.** The API carries no session state (JWT, Section 7.1), so it also scales horizontally behind Nginx independently of the worker.

**Guard rails (these are the knobs that actually bound load):**

- **Global Metis concurrency cap.** Even though Metis publishes no rate limit today, the system must **not** assume it is infinite — many workers × high concurrency could cause runaway cost, or hit an undocumented throttle. A **shared, Redis-backed limiter** (BullMQ group/limiter) caps the **total** in-flight Metis generation calls across **all** workers at `METIS_MAX_CONCURRENCY` (default **50**, conservative). This is a single safety valve to raise or lower as real Metis behaviour is observed; it works together with the existing `429` backoff (Section 6.4.1), which remains the runtime safety net if a limit does exist or is added later.
- **Per-user fairness.** A per-user in-flight cap (`USER_MAX_INFLIGHT_JOBS`, default **3**) prevents one user who submits many notes at once from monopolizing the worker tier — their extra jobs simply **queue** and run after their in-flight ones finish, so other users keep flowing. (This complements the per-note file caps in Section 8.3.)
- **Backpressure, not errors.** When the queue is deep, the effect is a **longer wait**, not failures — jobs persist in Redis and are processed in order. Ops scales the worker tier on **queue depth / oldest-job age** (the alert in Section 6.4.7 / 15.5); this can be wired to Liara autoscaling so replicas grow with backlog and shrink when idle.

**Cost note:** at the database/connection layer, total Postgres connections = (API replicas + worker replicas) × pool size, so when scaling replicas up, use connection pooling (e.g. PgBouncer / the managed pooler) so many replicas don't exhaust Postgres connections.

> **Interactive vs. background:** the `METIS_MAX_CONCURRENCY` limiter governs the **background** note-generation tier (the high-volume, bursty path). Chat (Section 5.6) is interactive and synchronous — its volume is bounded by active users in a session — and is not gated by the batch limiter, so a backlog of note generations never blocks someone mid-conversation.

---

## 7. Authentication & Authorization

### 7.1 Token Strategy

| Token | TTL | Storage |
|---|---|---|
| Access Token (JWT) | 15 minutes | Memory (Zustand) |
| Refresh Token (JWT) | 30 days | HttpOnly cookie |

- Refresh token rotation on every `refreshToken` mutation call
- Invalidated tokens tracked in Redis with matching TTL

### 7.2 OTP Flow

> **Reference docs:** the SMS Web Service and Bale OTP provider documentation is in the `./document` folder; consult it for exact endpoints, parameters, and response/error codes for each channel.

> **Mobile number format (input + storage).** The user (and admin) enters their mobile as a **10-digit national number without the leading zero — e.g. `9111234567`** (starts with `9`). The UI may show a fixed `+98` / `۹۸` prefix for clarity, but the value entered and **stored** (`User.mobile`, `Admin.mobile`) is the bare 10 digits. Validation: `^9\d{9}$` — reject `0912…`, `+98…`, or anything not exactly 10 digits starting with 9. The backend adds the country code per provider when sending OTP: **Bale** needs `98` + the 10 digits (`989111234567`); **SMS Web Service** uses the 10-digit `Destination` directly (see 7.2.2–7.2.3). All persisted mobiles are this single canonical 10-digit form.

```
0. query otpChannels()                          # [Public]
   → returns the channel(s) the admin has enabled: [SMS], [BALE], or [SMS, BALE]
   → the login UI shows a channel picker only when more than one is returned

1. mutation requestOtp(mobile, channel?)
   → Resolve channel:
       • enabled = admin OTP-mode setting (SMS_ONLY | BALE_ONLY | BOTH)
       • if one channel enabled → use it (ignore client `channel`)
       • if BOTH → use the user-selected `channel` (or User.preferredOtpChannel); reject if absent
   → Check Redis: OTP sent within last 2 min for this mobile? → reject if yes
   → Generate 6-digit code
   → Store in OtpRecord (DB, with `channel`) + Redis key (2-min TTL)
   → Dispatch via the resolved provider (see 7.2.1):
       • SMS  → SMS Web Service SendTokenSingle (P1 = code)
       • BALE → Bale send_otp ({ phone, otp: code })
   → Return { expiresIn: 120, channel }

2. mutation verifyOtp(mobile, code)
   → Find latest unused OtpRecord
   → Validate code + expiry
   → Mark OtpRecord as used
   → Upsert User record; persist preferredOtpChannel if the user chose one
   → If new user + freeCreditsGiven = false → grant credits
   → Return { accessToken, refreshToken, isNewUser }
```

> The OTP code is generated by Neviso in **all** cases; only the delivery channel differs. This matters because Bale requires the caller to supply the code (it is not template-rendered like SMS).

#### 7.2.1 OTP delivery channels & provider selection

OTP can be delivered over two channels, and the **admin chooses the mode** in the backoffice (Section 5.9.8):

| Mode | Behavior |
|---|---|
| `SMS_ONLY` | All OTPs sent via SMS Web Service (پیامک). |
| `BALE_ONLY` | All OTPs sent via the Bale messenger. |
| `BOTH` | The login screen lets the **user pick** the channel (پیامک or بله); a returning user's choice is remembered in `User.preferredOtpChannel`. |

The mode is stored as an admin-managed setting (`AppSetting` key `otp.channels`, **seeded to `BOTH` at launch**) and exposed publicly via `otpChannels` so the login UI knows whether to show a picker. The same mode governs both user login and admin step-2 OTP.

**Cross-channel fallback (BOTH mode):** Bale can only deliver to a phone that has a Bale account — a send returns `404` (`code 17`, "no Bale account") otherwise. In `BOTH` mode, a Bale `404` automatically falls back to SMS for that request and the UI informs the user their code was sent by پیامک instead. In `BALE_ONLY` mode a `404` surfaces as a clear Persian error (`OTP_BALE_NO_ACCOUNT`) prompting the user to contact support / try another method — so **enabling Bale as the only channel is discouraged** unless the user base is known to use Bale.

#### 7.2.2 SMS provider — SMS Web Service (پیامک)

OTP codes are delivered through **SMS Web Service** (`api.sms-webservice.com`, API V3), an Iranian SMS gateway, using the **template / pattern method** `SendTokenSingle`: the body is a panel-defined, support-approved template and the gateway auto-selects the fastest service line (no sender number specified).

| Item | Value |
|---|---|
| Base URL | `https://api.sms-webservice.com/api/V3` (`SMS_WEBSERVICE_BASE_URL`) |
| Auth | `ApiKey` parameter (`SMS_WEBSERVICE_API_KEY`) — query string for GET, JSON body for POST |
| OTP send | `POST /SendTokenSingle` |
| Credit & active lines | `POST /AccountInfo` → `{ Credit, AvailableSenders[] }` |
| Delivery status | `POST /GetStatus` (by message `id`) |

**OTP send request:**

```
POST https://api.sms-webservice.com/api/V3/SendTokenSingle
content-type: application/json

{
  "ApiKey": "<SMS_WEBSERVICE_API_KEY>",
  "TemplateKey": "<SMS_WEBSERVICE_OTP_TEMPLATE_KEY>",
  "Destination": 9121234567,
  "P1": "<6-digit code>"
}
```

- The OTP template is created and approved in the SMS Web Service panel, e.g. `کد ورود نویسو: {1}`. `{1}` is substituted by `P1` (the generated code).
- **Response:** a `Result` object with `id` (stored on `OtpRecord` for status tracking), `userTraceId`, `Sender`, and `FinalText`.
- **Phone format:** the stored 10-digit national mobile (e.g. `9111234567`) is sent directly as `Destination`.

> **SMS length:** a Persian SMS page is 70 chars; the OTP template is kept to one page. **Balance monitoring:** the platform team watches `Credit` via `AccountInfo` so OTP never silently fails on empty balance.

#### 7.2.3 Messenger provider — Bale (بله) Safir API

OTP codes can also be delivered in-app through **Bale** (`safir.bale.ai`, API v2). Delivery is to the user's Bale messenger account, so the recipient must have a Bale account.

| Item | Value |
|---|---|
| Base URL | `https://safir.bale.ai/api/v2` (`BALE_BASE_URL`) |
| Auth | OAuth2 client-credentials → bearer token (`BALE_CLIENT_ID`, `BALE_CLIENT_SECRET`) |
| Token endpoint | `POST /auth/token` (form-urlencoded) |
| OTP send | `POST /send_otp` (JSON, `Authorization: Bearer <token>`) |

**1. Get token** (cache it — valid `expires_in` ≈ 43200s / 12h; refresh on expiry or `401`):

```
POST https://safir.bale.ai/api/v2/auth/token
content-type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=<BALE_CLIENT_ID>&client_secret=<BALE_CLIENT_SECRET>&scope=read
→ { "access_token": "...", "expires_in": 43200, "scope": "read", "token_type": "bearer" }
```

**2. Send OTP** (Neviso supplies the code):

```
POST https://safir.bale.ai/api/v2/send_otp
Authorization: Bearer <access_token>
content-type: application/json

{ "phone": "989123456789", "otp": 123456 }
→ { "balance": 985 }   # remaining account balance
```

- **Phone format:** must be `98XXXXXXXXXX` — international form, **no leading zero**. Neviso prepends `98` to the stored 10-digit mobile (`9111234567` → `989111234567`) before calling Bale.
- **Code:** the same 6-digit code generated in 7.2 (Bale accepts 3–8 digits).
- **Errors:** `400 code 8` invalid phone; `404 code 17` no Bale account (→ fallback/`OTP_BALE_NO_ACCOUNT`, see 7.2.1); `402 code 20` insufficient balance (→ `AI_PROVIDER_UNAVAILABLE`-style platform error + ops alert); `500` server error (retryable); `429`/`code 18` rate limit.
- **Rate limits:** 30 requests/hour per phone and 300/min per organization; **burst control** — requests must be spread out, not sent in sudden bursts. Neviso's existing 1-per-2-min-per-mobile limit keeps well under the per-phone cap.
- **Token + balance** are monitored like the SMS provider; the bearer token is cached in Redis.

### 7.3 NestJS Guards

| Guard | Purpose |
|---|---|
| `GqlAuthGuard` | Validates access token from GraphQL context on all protected resolvers |
| `GqlOwnerGuard` | Confirms resource belongs to the current user (extracted from GQL context) |
| `GqlCreditGuard` | Pre-checks credit balance before upload/chat mutations |

> **Status enforcement:** `GqlAuthGuard` also rejects any user whose `status` is `SUSPENDED` (and `suspendedUntil` is in the future or null) or `BANNED`, returning `ACCOUNT_SUSPENDED` / `ACCOUNT_BANNED`. The same check runs during OTP/password login so a blocked user cannot obtain new tokens.

### 7.4 Admin Token Strategy

Admin tokens are completely separate from user tokens — different secrets, different audience claim, shorter lifetimes.

| Token | TTL | Storage | Secret |
|---|---|---|---|
| Admin Access Token (JWT) | 15 minutes | Memory (Zustand) | `JWT_ADMIN_ACCESS_SECRET` |
| Admin Refresh Token (JWT) | 8 hours | HttpOnly cookie (scoped to `admin.nevisoai.ir`) | `JWT_ADMIN_REFRESH_SECRET` |
| Login Challenge Token (step 1→2) | 5 minutes | Returned as `challengeId`; backing record in `AdminOtp` + Redis | `JWT_ADMIN_CHALLENGE_SECRET` |

- Admin JWTs carry `aud: "admin"`, `adminId`, and `role`. User resolvers reject any token with `aud: "admin"`; admin resolvers reject any token without it.
- Refresh rotation on every `adminRefreshToken`; invalidated tokens tracked in Redis.
- Idle timeout: refresh is denied after 8h, forcing a fresh two-step login.

### 7.5 Admin Two-Step Login Flow

```
1. mutation adminLoginStep1(mobile, password)
   → Look up Admin by mobile
   → Verify bcrypt(password); verify isActive
   → On any failure: return ADMIN_CREDENTIALS_INVALID (no mobile-existence leak)
   → Generate challengeId + 6-digit OTP
   → Store AdminOtp { adminId, challengeId, code, expiresAt = now+5m }
   → Store challenge in Redis (5-min TTL)
   → Dispatch the OTP to admin.mobile via the configured channel (Section 7.2.1; defaults to SMS)
   → Return { challengeId, expiresIn: 300, maskedMobile }

2. mutation adminLoginStep2(challengeId, code)
   → Load AdminOtp by challengeId; validate not used + not expired + code matches
   → Mark AdminOtp used; set Admin.lastLoginAt
   → Write AuditLog { action: ADMIN_LOGIN, ipAddress }
   → Issue { accessToken, refreshToken, admin }
```

Step-1 is rate-limited (see Section 13). Repeated wrong OTP codes invalidate the challenge.

### 7.6 Admin Guards

| Guard / Decorator | Purpose |
|---|---|
| `AdminAuthGuard` | Validates admin access token (`aud: "admin"`); loads `Admin`, confirms `isActive`; attaches to context |
| `AdminRoleGuard` + `@RequireRole(role)` | Enforces minimum role per resolver (SUPER_ADMIN ⊃ ADMIN ⊃ SUPPORT) |
| `AuditInterceptor` | Wraps state-changing admin resolvers and writes an `AuditLog` entry on success (action, target, metadata, IP) |

### 7.7 Impersonation

- `adminImpersonateUser(userId)` mints a **user-scoped** access token (passes `GqlAuthGuard`) containing an extra `act: { adminId }` claim and a short TTL (default 30 min, non-refreshable).
- A request bearing an `act` claim is allowed for reads and benign mutations, but a dedicated `NoImpersonationGuard` blocks sensitive mutations: `initiatePayment`, `requestUploadUrls`, `confirmUpload`, `sendChatMessage`, `changePassword`, and all `delete*` operations → `IMPERSONATION_FORBIDDEN`.
- The admin frontend renders a persistent banner while an impersonation token is active; "exit" simply discards the token.
- `USER_IMPERSONATE_START` is audited at mint time. (Token expiry is stateless, so `USER_IMPERSONATE_END` is recorded on explicit exit / best-effort.)

---

## 8. File Storage

### 8.1 Arvan Object Storage Structure

```
neviso-uploads/
  users/{userId}/
    audio/{noteId}/{filename}.mp3
    images/{noteId}/{filename}.jpg

neviso-exports/
  users/{userId}/
    exports/{noteId}-{timestamp}.pdf
    exports/folder-{folderId}-{timestamp}.pdf
```

### 8.2 Access Control

- All buckets are **private**
- Files accessed via signed URLs (15-min expiry) generated by the API server
- Export PDFs stored temporarily in S3; accessed via short-lived signed URLs returned by `exportNotePdf`/`exportFolderPdf` queries

### 8.3 File Limits

| Type | Allowed formats | Max size per file |
|---|---|---|
| Audio | `mp3`, `m4a`, `aac`, `wav`, `ogg` (plus `webm`/opus for in-app recordings) | 200 MB |
| Image | `jpg`, `jpeg`, `png`, `heic` | 10 MB |

**Per-note and per-session limits (enforced server-side):**

| Limit | Value |
|---|---|
| Max audio duration per recording | 90 minutes |
| Max total audio duration per note | 90 minutes |
| Max audio files per note | 5 |
| Max images per note | 10 |
| Max total files per note | 15 (audio + images) |
| Max total upload size per session | 300 MB (sum of all files in one upload) |

> **Why a duration cap:** audio is billed per minute and is the main AI-cost driver, so an uncapped recording is both a cost risk (PRD §10) and a reliability risk (timeouts, oversized single requests). The 90-minute cap keeps every request comfortably within the model's limit and bounds refund exposure on failure. Lectures longer than 90 minutes are split into separate notes (this is the chosen alternative to in-request audio chunking for v1 — see Section 18).
>
> **Enforcement:** counts, formats, declared sizes, and the per-session total are validated at `requestUploadUrls`; audio **duration** is read client-side and sent with the request (used for the credit estimate at `confirmUpload`) and **re-verified by the worker** from the actual file (`NoteFile.durationSec`), which fails fast with `NOTE_INPUT_TOO_LONG` + refund if a recording exceeds the cap. These checks are in addition to the presigned-URL `Content-Type`/`Content-Length` conditions and magic-byte validation (Section 13).

---

## 9. Real-time (GraphQL Subscriptions)

### 9.1 Connection

- Endpoint: `wss://api.nevisoai.ir/graphql` (same endpoint as queries/mutations, upgraded via `graphql-ws` protocol)
- Auth: JWT passed as `connectionParams.authToken` during WebSocket handshake
- Server: `@nestjs/graphql` subscription support with `graphql-ws` + Redis PubSub (for multi-instance support)
- Server filters subscription events by `userId` so each client only receives their own events

### 9.2 Subscription Definitions

```graphql
type Subscription {
  noteStatusChanged(noteId: ID): NoteStatusEvent!
  creditUpdated: CreditUpdateEvent!
  notificationReceived: Notification!
}

type NoteStatusEvent {
  noteId: ID!
  status: NoteStatus!
  title: String
  error: String
}

type CreditUpdateEvent {
  newBalance: Int!
}
```

### 9.3 Subscription Triggers

| Subscription | Trigger | Published By |
|---|---|---|
| `noteStatusChanged` | Worker changes note status (PROCESSING, DONE, FAILED) | Background Worker via Redis PubSub |
| `creditUpdated` | Any credit balance change (usage, refund, purchase) | API Server / Worker via Redis PubSub |
| `notificationReceived` | A new Notification record is created | Background Worker via Redis PubSub |

---

## 10. PWA Configuration

### 10.1 Service Worker Caching Strategies

| Strategy | Applies To |
|---|---|
| Cache First | Static assets, fonts, icons |
| Network First | API responses (notes list, folders) |
| Stale While Revalidate | User profile, credit balance |

### 10.2 manifest.json

```json
{
  "name": "نویسو",
  "short_name": "نویسو",
  "description": "جزوه‌نویسی هوشمند با هوش مصنوعی",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "dir": "rtl",
  "lang": "fa",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 11. PDF Export

### 11.1 Generation Strategy

- **Puppeteer** (headless Chrome) on Liara worker container
- Note contentJson → rendered HTML → PDF
- Watermark: semi-transparent diagonal text "نویسو | nevisoai.ir" on every page
- **All dates in the PDF render in the Jalali calendar with Persian numerals** (server-side conversion from the stored UTC value — see the Dates & calendar rule in Section 3.2)

### 11.2 Folder Export

- All folder notes fetched, concatenated with page breaks
- Auto-generated table of contents at start
- Each note section has a header: note title + recorded date

### 11.3 PDF Metadata

```
Title:    {Note title}
Author:   نویسو (nevisoai.ir)
Creator:  Neviso AI Platform
Subject:  Academic Notes
```

---

## 12. Payment Integration (Zarinpal)

### 12.1 Payment Flow

All Zarinpal endpoints are JSON and return the envelope `{ "data": { … }, "errors": [] }` — on error, `data` is `null` and `errors` is non-empty. Neviso sends **`currency: "IRT"`**, so every `amount` is in **Toman** and equals the pack's `priceIRT` (the discounted price actually charged).

```
1. mutation initiatePayment(planId)
   → Create PaymentRecord (PENDING, amountIRT = plan.priceIRT)
   → POST https://payment.zarinpal.com/pg/v4/payment/request.json
        headers: Content-Type: application/json, Accept: application/json
        body:    { merchant_id, amount: <priceIRT>, currency: "IRT", description, callback_url, metadata: { mobile } }
   → If data.code == 100 → store data.authority (36-char, starts "A") on the PaymentRecord
        (any other code, or non-empty errors → mark FAILED + surface a Persian error)
   → Return { paymentUrl: "https://payment.zarinpal.com/pg/StartPay/{authority}" }

2. Browser redirects to paymentUrl; the buyer pays on Zarinpal.

3. Zarinpal redirects back to callback_url with ?Authority=...&Status=OK|NOK
   GET /api/payments/verify?Authority=...&Status=...        [REST — external browser redirect]
   → Status != "OK"  → cancelled/failed: mark PaymentRecord FAILED → redirect /dashboard?payment=failed
   → Status == "OK"  → POST https://payment.zarinpal.com/pg/v4/payment/verify.json
        body: { merchant_id, amount: <same amountIRT as the request>, authority }
      • data.code == 100 (verified now) OR 101 (already verified — also success):
          a. Idempotently mark PaymentRecord PAID; store data.ref_id (+ masked data.card_pan); set paidAt
          b. Add the pack's credits exactly once (CreditTransaction PURCHASE, idempotencyKey `purchase:{paymentRecordId}`)
          c. Publish creditUpdated
          → redirect /dashboard?payment=success
      • any other code (e.g. -50 amount mismatch, -51 not paid, -54 invalid authority) or non-empty errors:
          → mark FAILED, no credits → redirect /dashboard?payment=failed
```

> **Verify is idempotent — handle `code 100` vs `101`.** Zarinpal returns `code 100` only the **first** time a transaction is verified; every later verify of the same transaction returns `code 101` ("already verified"). Both indicate success, so Neviso treats 100 and 101 identically and relies on `CreditTransaction.idempotencyKey` plus the `PaymentRecord` already being `PAID` to guarantee credits are granted **exactly once** — even if the callback is hit twice, the user refreshes, or a reconciliation job re-verifies. The `amount` sent to verify **must equal** the amount sent in the request, otherwise Zarinpal returns `-50`.

> **`auto_verify` (optional, `metadata.auto_verify`).** This per-transaction flag overrides the panel's verify setting: `true` = Zarinpal auto-verifies with the bank after a successful payment; `false` = the merchant **must** call verify within the allowed window or the payment is reversed and refunded to the buyer; if omitted, the panel setting applies. Neviso calls `verify` on the callback regardless (handling 100/101), so the flow works under either setting — sending the flag is only needed to force a specific behavior. A **reconciliation job** can re-verify any `PENDING` record that has an `authority` but never received its callback (e.g. the buyer closed the tab), so a captured payment is never silently lost.

> **Note:** This `GET /api/payments/verify` callback is the only REST endpoint in the system — Zarinpal redirects the user's browser to it after payment, so it cannot be a GraphQL operation.

> **Out of scope:** Zarinpal's OAuth 2.0 + GraphQL panel API (`next.zarinpal.com`, with `client_id`/`client_secret`) is for managing the merchant account programmatically and is **not** used by Neviso's checkout, which only needs `merchant_id`.

### 12.2 Zarinpal request body

```json
{
  "merchant_id": "{{ZARINPAL_MERCHANT_ID}}",
  "amount": 150000,
  "currency": "IRT",
  "description": "خرید بسته اعتبار نویسو",
  "callback_url": "https://api.nevisoai.ir/api/payments/verify",
  "metadata": { "mobile": "9121234567" }
}
```

`amount` is the pack's `priceIRT` in **Toman** (150,000 here is only an example). A successful request returns `{ "data": { "code": 100, "authority": "A0000…", "fee_type": "Merchant", "fee": … }, "errors": [] }`; the buyer is then redirected to `https://payment.zarinpal.com/pg/StartPay/{authority}`.

---

## 13. Security Requirements

| Concern | Implementation |
|---|---|
| SQL Injection | Prisma parameterized queries — no raw SQL |
| XSS | TipTap sanitizes HTML output; CSP headers on Next.js |
| CSRF | HttpOnly refresh token cookie + SameSite=Strict |
| Rate Limiting | Nginx: 10 req/s per IP; OTP: 1 per 2 min per mobile |
| File Upload Abuse | Magic byte validation (not just extension); size limits enforced |
| Password Security | bcrypt hash with cost factor 12 |
| Secret Management | All secrets via environment variables; never in codebase |
| Storage Access | Private buckets; time-limited signed URLs only |
| CORS | Whitelist: nevisoai.ir, www.nevisoai.ir, admin.nevisoai.ir |
| S3 Bucket CORS | Arvan Object Storage bucket CORS configured to allow `PUT` requests only from `https://nevisoai.ir` and `https://www.nevisoai.ir` origins; restrict allowed headers to `Content-Type` |
| Presigned URL Validation | Presigned PUT URLs enforce `Content-Type` condition (allowlist: `audio/mpeg`, `audio/mp4`, `audio/aac`, `audio/wav`, `audio/ogg`, `audio/webm`, `image/jpeg`, `image/png`, `image/heic`) and `Content-Length` condition (max per file-type limits, Section 8.3); 30-minute expiry; unique key per file prevents reuse |
| Admin token isolation | Admin JWTs use separate secrets + `aud: "admin"`; user resolvers reject admin tokens and admin resolvers reject user tokens |
| Admin 2FA | Mandatory two-step login (phone + password → OTP); step 1 does not leak whether the mobile is registered; OTP single-use, 5-min TTL |
| Admin session lifetime | Short access (15m) and refresh (8h) TTLs; refresh rotation; idle re-login |
| Admin login rate limiting | `adminLoginStep1`: max 5 attempts / 15 min per mobile + per IP; repeated bad OTP invalidates the challenge |
| Audit logging | All state-changing admin actions recorded immutably (`AuditLog`); application code never updates or deletes audit rows |
| Impersonation safety | Impersonation tokens are short-lived, non-refreshable, and blocked from payments, credit spend, password change, and deletions |
| Admin IP allowlist (optional) | Nginx `geo`/`allow`-`deny` on the `admin.nevisoai.ir` server block restricts access to known office/VPN IP ranges (configurable; off by default) |
| Privilege separation | Role-based access (SUPER_ADMIN / ADMIN / SUPPORT); admin provisioning is SUPER_ADMIN-only; no public admin sign-up |

---

## 14. Environment Variables

```env
# App
NODE_ENV=production
APP_PORT=3000
GRAPHQL_ENDPOINT=https://api.nevisoai.ir/graphql

# Database
DATABASE_URL=postgresql://user:pass@host:5432/neviso

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Admin JWT (Backoffice — separate secrets)
JWT_ADMIN_ACCESS_SECRET=...
JWT_ADMIN_REFRESH_SECRET=...
JWT_ADMIN_CHALLENGE_SECRET=...
JWT_ADMIN_ACCESS_EXPIRES=15m
JWT_ADMIN_REFRESH_EXPIRES=8h
ADMIN_OTP_TTL=300
ADMIN_LOGIN_CHALLENGE_TTL=300
IMPERSONATION_TOKEN_TTL=1800
ADMIN_WEB_ORIGIN=https://admin.nevisoai.ir
# Optional: comma-separated CIDR allowlist for the admin subdomain (empty = allow all)
ADMIN_IP_ALLOWLIST=

# OTP SMS — SMS Web Service (sms-webservice.com)
SMS_WEBSERVICE_BASE_URL=https://api.sms-webservice.com/api/V3
SMS_WEBSERVICE_API_KEY=...
SMS_WEBSERVICE_OTP_TEMPLATE_KEY=...   # panel-defined, support-approved OTP template (placeholder {1} = code)

# OTP Messenger — Bale (bale.ai) Safir API
BALE_BASE_URL=https://safir.bale.ai/api/v2
BALE_CLIENT_ID=...
BALE_CLIENT_SECRET=...
# OTP channel mode (SMS_ONLY | BALE_ONLY | BOTH) is admin-managed at runtime (AppSetting "otp.channels"), not an env var

# Arvan Object Storage
ARVAN_ACCESS_KEY=...
ARVAN_SECRET_KEY=...
ARVAN_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
ARVAN_BUCKET_UPLOADS=neviso-uploads
ARVAN_BUCKET_EXPORTS=neviso-exports

# AI Provider — Gemini via Metis (متیس)
METIS_BASE_URL=https://api.metisai.ir
METIS_API_KEY=tpsg-...                  # single key for all Metis calls
METIS_GEMINI_MODEL=gemini-2.5-pro       # generation model (generateContent)
METIS_EMBEDDING_PROVIDER=openai         # embeddings provider (name field)
METIS_EMBEDDING_MODEL=text-embedding-3-small  # 1536-dim; if changed, update vector(N) column to match
METIS_GEN_TIMEOUT=180000                # generateContent timeout (ms) — see 6.4.6
METIS_IO_TIMEOUT=60000                  # storage/embeddings timeout (ms) — see 6.4.6

# Worker scaling & concurrency (Section 6.5)
WORKER_CONCURRENCY=10                    # note-generation jobs run in parallel per worker process
METIS_MAX_CONCURRENCY=50                # shared cap on total in-flight Metis generation calls across ALL workers (safety valve; raise/lower as Metis behaviour is learned)
USER_MAX_INFLIGHT_JOBS=3                # max concurrently-processing jobs per user (extra jobs queue) — fairness

# Zarinpal
ZARINPAL_MERCHANT_ID=...
ZARINPAL_SANDBOX=false

# Credits
FREE_CREDIT_GRANT=20
CREDIT_COST_PER_AUDIO_MINUTE=1
CREDIT_COST_PER_IMAGE=2
CREDIT_COST_PER_CHAT_MESSAGE=10

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PDF_WATERMARK_TEXT=نویسو | nevisoai.ir
```

---

## 15. Deployment & DevOps

### 15.1 Container Structure

```
neviso/
├── apps/
│   ├── api/        → NestJS API server (user + admin GraphQL modules)
│   ├── worker/     → NestJS background worker
│   ├── web/        → Next.js frontend (landing + user dashboard PWA)
│   └── admin/      → Next.js admin backoffice (admin.nevisoai.ir)
├── docker-compose.yml
└── nginx/
    ├── neviso.conf        → nevisoai.ir, www, app
    └── admin.neviso.conf  → admin.nevisoai.ir (optional IP allowlist)
```

### 15.2 Liara Services

| Service | App Type | Instance |
|---|---|---|
| API Server | Docker | 1 vCPU / 512MB RAM |
| Background Worker | Docker | 1 vCPU / 1GB RAM |
| Next.js Frontend | Docker | 1 vCPU / 512MB RAM |
| Admin Backoffice | Docker | 1 vCPU / 512MB RAM |
| PostgreSQL | Liara DB (managed) | Standard plan |
| Redis | Liara Redis (managed) | Standard plan |

### 15.3 CI/CD (GitHub Actions)

```yaml
on: push to main
steps:
  1. Lint + type-check (tsc --noEmit)
  2. Unit + integration tests (Jest)         # ← deploy gate: if this fails, the pipeline stops and nothing below runs
  3. Build Docker images
  4. Push to Liara container registry
  5. Deploy API → Liara
  6. Deploy Worker → Liara
  7. Deploy Web → Liara
  8. Deploy Admin → Liara
  9. Run DB migrations (prisma migrate deploy)
```

> Steps 1–2 **gate** the deploy: a lint, type, unit, or integration failure stops the pipeline before any image is built, so a red build never reaches production. End-to-end (Playwright) tests run against the deployed preview/staging and gate promotion (see 15.4).

### 15.4 Testing Strategy

Every vertical slice in the development plan ships with passing tests (each phase defines its own test list + Definition of Done). The pyramid:

- **Unit (Jest)** — pure logic with no I/O: credit math and rounding, `idempotencyKey` behaviour, phone normalization (`9XXXXXXXXX` → `98…`), Jalali ↔ Gregorian helpers, prompt building, error-code → Persian mapping. All external services (Metis, Zarinpal, SMS Web Service, Bale, Arvan S3) sit behind interfaces with **fakes**.
- **Integration** — NestJS resolvers + Prisma against a **real Postgres test database** with third-party fakes: auth/OTP (incl. channel fallback), `requestUploadUrls`→`confirmUpload` credit reserve, the worker job lifecycle (reserve → finalize on DONE / refund on fail), embeddings + RAG retrieval, **payment verify idempotency (code 100 vs 101)**, and that every state-changing admin op also writes an `AuditLog` row.
- **End-to-end (Playwright)** — critical journeys against a deployed preview: OTP login, upload → generated note, edit + reset-to-original, PDF export, buy a credit pack (mock gateway), and the admin happy path (login → adjust credit → impersonate is blocked from spending).

**What gates a deploy:** lint + type-check + unit + integration must pass on the push to `main` before any image is built or deployed (15.3); e2e must pass against the preview before promoting to production.

### 15.5 Observability, Monitoring & Alerting

This is the **system-wide** ops view; Section 6.4.7 covers the AI-pipeline slice in detail and feeds the same dashboards/alerts.

- **Logging** — structured JSON logs in the API and worker, correlated by `traceId`. The GraphQL `formatError` filter logs the full original error + `traceId` to the error tracker while returning only the sanitized `{ code, data?, traceId }` to the client (Section 16). No PII or secrets in logs (mobiles masked, tokens/keys never logged).
- **Error tracking** — Sentry (or equivalent) wired into API, worker, web, and admin: unhandled exceptions, fatal job failures, and frontend errors, grouped and tagged with `traceId` + release/version.
- **Metrics** — request rate / p95 latency / error rate per service; **BullMQ queue depth, oldest-job age, job success vs failure rate by error class, p95 processing latency**; payment request/verify success vs failure counts; OTP send success by channel; and latency + error codes for each external call (Metis, SMS, Bale, Zarinpal, Arvan).
- **Health checks** — every service exposes a health endpoint (used by Liara and the CI smoke check).
- **Alerts → platform team:**
  - **Metis balance low / `402`, or `401`** — *immediate* (a paid AI dependency can fail mid-job, and balance won't refill on retry).
  - **Queue backing up / stalled jobs** — queue depth or oldest-job age over threshold.
  - **Payment verify failures** — a spike in verify errors, or `PENDING` `PaymentRecord`s with an `authority` but no callback (possible lost capture or gateway/config issue — ties to the reconciliation job in Section 12.1).
  - **OTP provider balance low or send-error spike** (SMS Web Service / Bale) — OTP must never silently fail.
  - **Elevated 5xx / unhandled-exception rate** across API or worker.

### 15.6 Backup & Disaster Recovery

**Postgres is the system of record and the must-not-lose asset** — it holds users, the notes' `contentJson` **and** `originalContentJson`, the credit ledger, and payment history. Liara managed Postgres runs **daily automated backups**; in addition, a restore is **periodically tested** into a scratch environment so backups are known-good rather than assumed. Object storage (Arvan) holds the uploaded audio/images and generated PDFs; bucket **versioning/retention** is enabled where available, and exports are reproducible from the note data. A generated note can in principle be regenerated from its original media if retained, but a user's **edited** `contentJson` and the **credit/payment** records cannot be reconstructed — which is why Postgres backups take priority.

**Targets (v1):** RPO ≈ 24h (daily backup cadence — acceptable for an early-stage product) and RTO of a few hours. A short **restore runbook** lives with the deploy docs: (1) restore the latest Postgres backup, (2) re-point services and run `prisma migrate deploy` if needed, (3) verify health endpoints and a smoke login + note-open. As the product grows, the cadence can tighten to point-in-time recovery without changing the application.

---

## 16. Error Handling Standards

Two hard rules govern every error in the product:

1. **Users never see a technical error.** No error code, stack trace, raw exception, HTTP status, GraphQL `message`, or upstream provider text is ever rendered to a user — only a clear, friendly **Persian** message.
2. **This is enforced centrally, not per screen.** Every error — on every page, from every query/mutation, plus network failures and render crashes — passes through one mapping layer, so no screen can accidentally leak a raw error, and there is always a safe fallback.

### 16.1 Server-side error contract

Each GraphQL error carries machine-readable metadata in `extensions`; the top-level `message` is **for developers and logs only and is never displayed**:

```json
{
  "errors": [
    {
      "message": "InsufficientCreditsException: balance 2 < required 5",
      "extensions": {
        "code": "INSUFFICIENT_CREDITS",
        "data": { "required": 5, "available": 2 },
        "traceId": "5f3c8a91"
      }
    }
  ]
}
```

- `code` — a **stable** identifier (catalog in 16.3) that the frontend maps to a Persian message. This is the back/front contract: wording can change freely, codes cannot.
- `data` — optional, safe, non-sensitive values for interpolation (e.g. required/available credits). Never internal detail.
- `traceId` — correlates to the full server-side log entry; may be shown to the user as a support reference («کد پیگیری») but carries no technical content.
- A NestJS GraphQL exception filter (`formatError`) **sanitizes every outgoing error in production**: strips stack traces and internal messages, guarantees a `code` (unknown/unhandled → `INTERNAL_ERROR`), logs the full original error + `traceId` to monitoring, and returns only `{ code, data?, traceId }` with a generic `message`.

### 16.2 Frontend error presentation

A single layer turns codes into Persian and guarantees nothing raw reaches the screen:

- **Apollo `errorLink`** intercepts every GraphQL and network error, reads `extensions.code`, looks up the Persian message, and routes it to the right surface. Unknown codes and network failures fall back to a generic Persian message — the raw error is logged, never shown.
- **React error boundaries** wrap the app and major route subtrees, so a render/runtime crash shows a full-page Persian fallback («مشکلی پیش آمد») with a retry/back action — never a white screen or a stack trace.
- All messages are Persian (RTL); the admin backoffice uses the same layer.

**Display surface by category:**

| Category | Examples | How it's shown |
|---|---|---|
| Field / validation | invalid mobile, missing reason | Inline, next to the field |
| Business rule | `INSUFFICIENT_CREDITS`, `OTP_INVALID`, `FILE_TOO_LARGE` | Toast / inline message |
| Auth required | `UNAUTHENTICATED` | Redirect to login + brief toast |
| Account blocked | `ACCOUNT_SUSPENDED`, `ACCOUNT_BANNED` | Full-screen blocking state + sign-out |
| Forbidden | `FORBIDDEN`, `ADMIN_FORBIDDEN` | Toast (and route guard) |
| Processing | `PROCESSING_FAILED`, `AI_PROVIDER_UNAVAILABLE` | Note-card status / toast + retry |
| Network / unknown / 500 | timeouts, `INTERNAL_ERROR` | Generic Persian toast + retry; `traceId` shown as support reference |
| Render crash | uncaught JS error | Error-boundary full-page Persian fallback |

### 16.3 Persian message catalog

The frontend maps each `code` to the Persian message below. Wording is illustrative (final copy can be tuned); the **codes are fixed**. `data` values are interpolated where braces appear. Any code with no entry falls back to the generic `INTERNAL_ERROR` message, so an unmapped error is still shown safely in Persian.

| Code | پیام فارسی (به کاربر نمایش داده می‌شود) | Surface |
|---|---|---|
| `INSUFFICIENT_CREDITS` | اعتبار شما کافی نیست. برای ادامه، اعتبار خود را شارژ کنید. | toast / inline |
| `OTP_EXPIRED` | کد تأیید منقضی شده است. لطفاً دوباره کد دریافت کنید. | inline |
| `OTP_INVALID` | کد تأیید نادرست است. دوباره تلاش کنید. | inline |
| `OTP_TOO_SOON` | کمی صبر کنید و سپس برای دریافت کد جدید تلاش کنید. | inline |
| `OTP_CHANNEL_REQUIRED` | لطفاً روش دریافت کد را انتخاب کنید: پیامک یا بله. | inline |
| `OTP_BALE_NO_ACCOUNT` | این شماره در بله حساب ندارد. لطفاً «پیامک» را انتخاب کنید. | inline |
| `OTP_PROVIDER_UNAVAILABLE` | ارسال کد در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید. | toast |
| `NOTE_NOT_FOUND` | این جزوه پیدا نشد. | toast |
| `FOLDER_NOT_FOUND` | این پوشه پیدا نشد. | toast |
| `PROCESSING_FAILED` | پردازش جزوه ناموفق بود. اعتبار شما بازگردانده شد. می‌توانید فایل را دوباره بارگذاری کنید. | note card / toast |
| `NOTE_INPUT_TOO_LONG` | طول فایل صوتی بیش از حد مجاز است. لطفاً فایل کوتاه‌تری بارگذاری کنید. | inline |
| `AI_PROVIDER_UNAVAILABLE` | سرویس پردازش موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید. | toast |
| `PAYMENT_FAILED` | پرداخت ناموفق بود. در صورت کسر مبلغ، طبق قوانین درگاه بازگردانده می‌شود. | payment result page |
| `FILE_TOO_LARGE` | حجم فایل بیش از حد مجاز است. | inline |
| `UNSUPPORTED_FORMAT` | این نوع فایل پشتیبانی نمی‌شود. | inline |
| `UNAUTHENTICATED` | برای ادامه وارد حساب کاربری خود شوید. | redirect + toast |
| `FORBIDDEN` | شما به این بخش دسترسی ندارید. | toast |
| `ACCOUNT_SUSPENDED` | حساب شما موقتاً مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید. | full-screen |
| `ACCOUNT_BANNED` | حساب شما مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید. | full-screen |
| `ADMIN_CREDENTIALS_INVALID` | شماره موبایل یا رمز عبور نادرست است. | inline (admin) |
| `ADMIN_CHALLENGE_INVALID` | نشست ورود نامعتبر یا منقضی شده است. دوباره وارد شوید. | inline (admin) |
| `ADMIN_OTP_INVALID` | کد تأیید نادرست است. | inline (admin) |
| `ADMIN_FORBIDDEN` | اجازهٔ انجام این عملیات را ندارید. | toast (admin) |
| `IMPERSONATION_FORBIDDEN` | این عملیات در حالت «مشاهده به‌جای کاربر» مجاز نیست. | toast (admin) |
| `ADJUSTMENT_REASON_REQUIRED` | وارد کردن دلیل برای این عملیات الزامی است. | inline (admin) |
| `PLAN_IN_USE` | این بسته قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید. | toast (admin) |
| `NETWORK_ERROR` | ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید. | generic toast |
| `INTERNAL_ERROR` (default/fallback) | خطایی رخ داد. لطفاً دوباره تلاش کنید. | generic toast |

> The two technical examples in the message column are deliberately the *only* English left anywhere near a user — `code` and `traceId` — and neither is ever displayed: they exist for logs and support correlation. Everything the user reads is the Persian column.

---

## 17. In-App Notification System

### 17.1 Overview

Notifications are created server-side by the background worker at the end of every AI processing job (success or failure). They are persisted in PostgreSQL and delivered to the connected client in real-time via the `notificationReceived` GraphQL Subscription. If the client is offline, unread notifications are fetched on next load via the `notifications` and `unreadNotificationCount` queries.

### 17.2 Notification Creation (Worker)

```typescript
// notifications.service.ts
async createNoteNotification(
  userId: string,
  type: NotificationType,
  note: { id: string; title: string; folderId: string; folderName: string }
) {
  const isSuccess = type === NotificationType.NOTE_DONE;

  const notification = await this.prisma.notification.create({
    data: {
      userId,
      type,
      title: isSuccess ? 'جزوه آماده شد ✅' : 'پردازش جزوه ناموفق بود ❌',
      body: isSuccess
        ? `جزوه «${note.title}» در پوشه «${note.folderName}» آماده است.`
        : `پردازش «${note.title}» با خطا مواجه شد. اعتبار شما برگشت داده شد.`,
      metadata: {
        noteId: note.id,
        folderId: note.folderId,
        folderName: note.folderName,
      },
    },
  });

  // Publish to GraphQL Subscription if user is connected
  this.pubSub.publish('notificationReceived', { notificationReceived: notification, userId });

  return notification;
}
```

### 17.3 GraphQL Subscription Delivery

```typescript
// notifications.resolver.ts
@Resolver()
export class NotificationsResolver {
  @Subscription(() => Notification, {
    filter: (payload, variables, context) =>
      payload.userId === context.req.user.id,
  })
  notificationReceived() {
    return this.pubSub.asyncIterableIterator('notificationReceived');
  }
}
```

The server filters subscription events by `userId` so each client only receives their own notifications. PubSub uses Redis for cross-instance delivery.

### 17.4 Frontend — Notification Bell Component

```
components/notifications/
  NotificationBell.tsx      ← Bell icon + unread count badge in header
  NotificationPanel.tsx     ← Slide-in panel listing all notifications
  NotificationItem.tsx      ← Single row: icon + title + body + time + read state
```

**NotificationBell behavior:**
- On mount: runs `unreadNotificationCount` query → shows badge
- On `notificationReceived` subscription event: increments badge count in real-time, shows toast
- On click: opens `NotificationPanel`, runs `notifications` query

**NotificationPanel behavior:**
- Lists up to 50 notifications, newest first
- Unread items have a colored left border and bold text
- Clicking a `NOTE_DONE` item: marks as read + navigates to `/notes/{noteId}`
- Clicking a `NOTE_FAILED` item: marks as read + navigates to `/dashboard` with error toast
- "Mark all as read" button calls `markAllNotificationsRead` mutation
- Panel closes on outside click or Escape key

### 17.5 Toast Notification (Real-time)

When a `notificationReceived` subscription event arrives while the user is on any page, a toast popup appears (bottom-right corner):

```
┌────────────────────────────────────┐
│ ✅  جزوه آماده شد                  │
│  «معادلات دیفرانسیل - جلسه ۳»     │
│  [مشاهده جزوه]           [✕]       │
└────────────────────────────────────┘
```

Toast auto-dismisses after 6 seconds. Clicking "مشاهده جزوه" navigates directly to the note and marks the notification as read.

### 17.6 Offline Resilience

If the user is not connected via GraphQL Subscription when a job completes:
- The notification is persisted in DB regardless
- On next app load / page focus: `unreadNotificationCount` query is called
- Unread count badge reflects the stored state
- Full list is available via `notifications` query

### 17.7 Notification Retention Policy

- Notifications older than **90 days** are auto-deleted by a nightly BullMQ cron job
- Maximum 50 notifications returned per API call (newest first)
- No hard cap on total stored per user within the 90-day window

---

## 18. Open Technical Decisions

- **Gemini audio limits:** ~~Resolved for v1~~ — audio is capped at **90 minutes per recording** (Section 8.3), well within the model's per-request limit, so no in-request chunking is needed in v1; longer lectures are split into separate notes. The model stays configurable via `METIS_GEMINI_MODEL`. If a future plan needs single notes longer than the cap, a chunking strategy can be introduced then.
- **TipTap JSON storage:** `contentJson` stored as `jsonb` in PostgreSQL. Full-text search indexing strategy (pg_trgm or dedicated search) to be decided in v2.
- **Chat context window:** ~~Resolved~~ — RAG implemented via pgvector + Metis embeddings (OpenAI `text-embedding-3-small`). Note content is chunked and embedded during processing; chat queries retrieve top 5 relevant chunks via cosine similarity instead of sending full note content.
- **Puppeteer on Liara:** Headless Chrome memory spikes under load. Consider replacing with `@react-pdf/renderer` (pure JS) for better container efficiency.
- **Credit packs:** the only purchase type is a one-time credit pack (Section 6.3); credits never expire and there is no subscription, renewal, or expiry machinery to maintain.
- **HEIC image support:** ~~Resolved~~ — the worker converts HEIC/HEIF images to JPEG via `sharp` before sending them to the model (Section 6.1, step c). HEIC is an accepted upload type (Section 16 limits); conversion happens server-side during processing.
- **Admin GraphQL surface:** Admin operations share the API server but live in an isolated module guarded by `aud: "admin"`. Open question: whether to expose them on the same `/graphql` endpoint (current plan) or a dedicated `/admin/graphql` path for an extra layer of network separation behind Nginx.
- **Active-user definition:** "Active user" in the analytics dashboard currently means a user who created a note or chat message within the range. The exact event set may be refined once usage data exists.
- **Audit log retention:** Audit logs are immutable and currently retained indefinitely. A long-term archival/retention policy (e.g., cold storage after N years) is TBD.
- **Impersonation end-event:** Because impersonation tokens are stateless JWTs, `USER_IMPERSONATE_END` is only reliably recorded on explicit exit. A server-side impersonation-session record could be added if exact session bounds become a compliance requirement.

---

*This document is maintained by the Neviso engineering team and is the primary technical reference for implementation.*
