# Neviso Backend Skill

You are building the **Neviso (nevisoai.ir)** backend — a NestJS GraphQL API + background worker for a Persian-language AI note-taking platform. Read this document completely before implementing any feature.

---

## 1. Architecture overview

```
apps/
  api/      NestJS GraphQL API (user + admin schemas, same process)
  worker/   NestJS standalone background worker (BullMQ consumer)
  web/      Next.js user PWA
  admin/    Next.js admin backoffice
```

- **API endpoint:** `POST https://api.nevisoai.ir/graphql` (queries + mutations) / `WSS wss://api.nevisoai.ir/graphql` (subscriptions)
- **Payment callback:** `GET /api/payments/verify` — the **only** REST endpoint (Zarinpal browser redirect)
- **Admin on the same API server** — isolated GraphQL module with separate JWT secrets and `aud: "admin"`

---

## 2. Technology stack

| Layer            | Choice                                                        |
| ---------------- | ------------------------------------------------------------- |
| Framework        | NestJS (TypeScript, modular, DI)                              |
| API              | `@nestjs/graphql` + Apollo Server, code-first                 |
| ORM              | Prisma + PostgreSQL                                           |
| Queue            | BullMQ + Redis                                                |
| Real-time        | GraphQL Subscriptions via `graphql-ws` + Redis PubSub         |
| Auth             | JWT (access + refresh tokens)                                 |
| File storage     | Arvan Object Storage (S3-compatible, `@aws-sdk/client-s3`)    |
| AI               | Google Gemini via Metis gateway (`https://api.metisai.ir`)    |
| Embeddings       | OpenAI `text-embedding-3-small` via Metis, stored in pgvector |
| PDF              | Puppeteer (headless Chrome)                                   |
| Image processing | `sharp` (HEIC → JPEG conversion)                              |
| OTP SMS          | SMS Web Service (`api.sms-webservice.com` V3)                 |
| OTP messenger    | Bale Safir API (`safir.bale.ai/api/v2`)                       |
| Payment          | Zarinpal REST API                                             |
| Validation       | `class-validator` + `class-transformer`                       |
| Password         | `bcrypt` (cost 12)                                            |
| Rate limiting    | Nginx (10 req/s per IP) + guard (1 OTP per 2 min per mobile)  |

---

## 3. Database schema (Prisma)

```prisma
model User {
  id                   String              @id @default(uuid())
  mobile               String              @unique
  passwordHash         String?
  displayName          String?
  avatarUrl            String?
  creditBalance        Int                 @default(0)
  freeCreditsGiven     Boolean             @default(false)
  status               UserStatus          @default(ACTIVE)
  statusReason         String?
  suspendedUntil       DateTime?
  preferredOtpChannel  OtpChannel?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  folders              Folder[]
  chatSessions         ChatSession[]
  transactions         CreditTransaction[]
  subscriptions        Subscription[]
  otpRecords           OtpRecord[]
  notifications        Notification[]
  paymentRecords       PaymentRecord[]
}

enum UserStatus { ACTIVE  SUSPENDED  BANNED }

model OtpRecord {
  id           String     @id @default(uuid())
  userId       String?
  mobile       String
  code         String
  channel      OtpChannel @default(SMS)
  smsMessageId String?
  expiresAt    DateTime
  usedAt       DateTime?
  createdAt    DateTime   @default(now())
  user         User?      @relation(fields: [userId], references: [id])
}

enum OtpChannel { SMS  BALE }

model AppSetting {
  key         String   @id           // e.g. "otp.channels"
  value       Json
  updatedById String?
  updatedAt   DateTime @updatedAt
}

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

model Note {
  id                  String           @id @default(uuid())
  folderId            String
  userId              String
  title               String
  contentJson         Json
  originalContentJson Json?
  isEdited            Boolean          @default(false)
  recordedAt          DateTime
  status              NoteStatus       @default(PENDING)
  failureReason       String?
  isIndexed           Boolean          @default(false)
  creditCost          Int              @default(0)
  totalInputTokens    Int              @default(0)
  totalOutputTokens   Int              @default(0)
  totalTokens         Int              @default(0)
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  folder              Folder           @relation(fields: [folderId], references: [id])
  files               NoteFile[]
  chunks              NoteChunk[]
  tokenUsage          NoteTokenUsage[]
}

enum NoteStatus { PENDING  PROCESSING  DONE  FAILED }

model NoteFile {
  id          String   @id @default(uuid())
  noteId      String
  type        FileType
  storageKey  String
  mimeType    String
  sizeBytes   Int
  durationSec Int?
  createdAt   DateTime @default(now())
  note        Note     @relation(fields: [noteId], references: [id])
}

enum FileType { AUDIO  IMAGE }

model NoteChunk {
  id         String    @id @default(uuid())
  noteId     String
  chunkIndex Int
  content    String
  embedding  Unsupported("vector(1536)")
  createdAt  DateTime  @default(now())
  note       Note      @relation(fields: [noteId], references: [id], onDelete: Cascade)
  @@index([noteId])
}

model NoteTokenUsage {
  id           String   @id @default(uuid())
  noteId       String
  model        String
  inputTokens  Int      @default(0)
  outputTokens Int      @default(0)
  totalTokens  Int      @default(0)
  createdAt    DateTime @default(now())
  note         Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  @@index([noteId])
}

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

model ChatMessage {
  id        String      @id @default(uuid())
  sessionId String
  role      MessageRole
  content   String
  createdAt DateTime    @default(now())
  session   ChatSession @relation(fields: [sessionId], references: [id])
}

enum MessageRole { USER  ASSISTANT }

model CreditTransaction {
  id             String          @id @default(uuid())
  userId         String
  type           TransactionType
  amount         Int
  description    String?
  refId          String?
  idempotencyKey String?         @unique   // "usage:{noteId}" / "refund:{noteId}"
  createdAt      DateTime        @default(now())
  user           User            @relation(fields: [userId], references: [id])
}

enum TransactionType { PURCHASE  USAGE  FREE_GRANT  REFUND  ADMIN_ADJUSTMENT }

model Subscription {
  id               String             @id @default(uuid())
  userId           String
  planId           String
  status           SubscriptionStatus
  creditsPerCycle  Int
  startedAt        DateTime
  expiresAt        DateTime
  grantedByAdminId String?
  cancelReason     String?
  createdAt        DateTime           @default(now())
  user             User               @relation(fields: [userId], references: [id])
  plan             Plan               @relation(fields: [planId], references: [id])
}

enum SubscriptionStatus { ACTIVE  EXPIRED  CANCELLED }

model Plan {
  id             String         @id @default(uuid())
  name           String
  type           PlanType
  priceIRT       Int
  credits        Int
  durationDays   Int?
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  subscriptions  Subscription[]
  paymentRecords PaymentRecord[]
}

enum PlanType { SUBSCRIPTION  CREDIT_PACK }

model JobRecord {
  id            String    @id @default(uuid())
  noteId        String    @unique
  status        JobStatus @default(QUEUED)
  attempts      Int       @default(0)
  error         String?
  errorClass    String?   // transient | rate_limited | malformed | bad_request | auth | balance | oversized
  metisFileUrls Json?
  startedAt     DateTime?
  finishedAt    DateTime?
  createdAt     DateTime  @default(now())
}

enum JobStatus { QUEUED  PROCESSING  DONE  FAILED }

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false)
  metadata  Json?            // { noteId, folderId, folderName }
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, isRead])
  @@index([userId, createdAt(sort: Desc)])
}

enum NotificationType { NOTE_DONE  NOTE_FAILED }

model PaymentRecord {
  id        String        @id @default(uuid())
  userId    String
  planId    String
  amountIRT Int
  authority String?       @unique
  refId     String?
  status    PaymentStatus @default(PENDING)
  createdAt DateTime      @default(now())
  paidAt    DateTime?
  user      User          @relation(fields: [userId], references: [id])
  plan      Plan          @relation(fields: [planId], references: [id])
  @@index([status, createdAt(sort: Desc)])
  @@index([userId])
}

enum PaymentStatus { PENDING  PAID  FAILED }

model Admin {
  id          String     @id @default(uuid())
  email       String     @unique
  passwordHash String
  mobile      String
  displayName String
  role        AdminRole  @default(SUPPORT)
  isActive    Boolean    @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  auditLogs   AuditLog[]
  otps        AdminOtp[]
}

enum AdminRole { SUPER_ADMIN  ADMIN  SUPPORT }

model AdminOtp {
  id          String    @id @default(uuid())
  adminId     String
  challengeId String    @unique
  code        String
  expiresAt   DateTime
  usedAt      DateTime?
  createdAt   DateTime  @default(now())
  admin       Admin     @relation(fields: [adminId], references: [id])
}

model AuditLog {
  id         String      @id @default(uuid())
  adminId    String
  action     AuditAction
  targetType String
  targetId   String?
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime    @default(now())
  admin      Admin       @relation(fields: [adminId], references: [id])
  @@index([adminId, createdAt(sort: Desc)])
  @@index([targetType, targetId])
}

enum AuditAction {
  ADMIN_LOGIN  USER_CREDIT_ADJUST  USER_SUSPEND  USER_BAN  USER_REACTIVATE
  USER_IMPERSONATE_START  USER_IMPERSONATE_END
  SUBSCRIPTION_GRANT  SUBSCRIPTION_CANCEL
  PLAN_CREATE  PLAN_UPDATE  PLAN_SET_ACTIVE
  ADMIN_CREATE  ADMIN_UPDATE_ROLE  ADMIN_DEACTIVATE
  OTP_CHANNEL_CONFIG
}
```

---

## 4. Authentication & authorization

### 4.1 User tokens

| Token       | TTL     | Storage          |
| ----------- | ------- | ---------------- |
| Access JWT  | 15 min  | Zustand (memory) |
| Refresh JWT | 30 days | HttpOnly cookie  |

- Env: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Refresh rotation on every call; invalidated tokens tracked in Redis
- `GqlAuthGuard` validates access token + checks `status` (SUSPENDED/BANNED → reject)
- `GqlOwnerGuard` confirms resource belongs to current user
- `GqlCreditGuard` pre-checks credit balance before upload/chat mutations

### 4.2 OTP flow

```
1. query otpChannels()           // returns [SMS] | [BALE] | [SMS, BALE]
2. mutation requestOtp(mobile, channel?)
   - Rate-limit: 1 request per 2 min per mobile (Redis key)
   - Generate 6-digit code
   - Save OtpRecord + Redis (2-min TTL)
   - Dispatch via resolved channel (SMS or Bale — see §4.4)
   - Return { expiresIn: 120, channel }
3. mutation verifyOtp(mobile, code)
   - Validate OtpRecord (not used, not expired, code matches)
   - Upsert User; save preferredOtpChannel
   - If new user & !freeCreditsGiven → grant FREE_CREDIT_GRANT credits
   - Return { accessToken, refreshToken, isNewUser }
```

### 4.3 Admin tokens (separate from user)

| Token             | TTL    | Secret                       |
| ----------------- | ------ | ---------------------------- |
| Admin Access JWT  | 15 min | `JWT_ADMIN_ACCESS_SECRET`    |
| Admin Refresh JWT | 8 h    | `JWT_ADMIN_REFRESH_SECRET`   |
| Login Challenge   | 5 min  | `JWT_ADMIN_CHALLENGE_SECRET` |

- Admin JWTs carry `aud: "admin"` — user resolvers reject `aud: "admin"`, admin resolvers reject tokens without it
- Two-step login: step 1 (password) → challengeId; step 2 (OTP code) → admin tokens
- Step 1 **never reveals if email exists** — always return `ADMIN_CREDENTIALS_INVALID` on failure
- `AdminAuthGuard` validates token + `isActive`; `AdminRoleGuard` + `@RequireRole()` enforces SUPPORT ⊂ ADMIN ⊂ SUPER_ADMIN
- `AuditInterceptor` wraps state-changing admin resolvers → writes `AuditLog` on success

### 4.4 OTP delivery channels

Mode stored in `AppSetting` key `otp.channels` (`SMS_ONLY | BALE_ONLY | BOTH`), seeded to `BOTH`.

**SMS via SMS Web Service:**

```
POST https://api.sms-webservice.com/api/V3/SendTokenSingle
{ "ApiKey": "...", "TemplateKey": "...", "Destination": 9121234567, "P1": "123456" }
```

- Phone format: `09xxxxxxxxx` or `989xxxxxxxxx`
- Store returned `id` on `OtpRecord.smsMessageId`

**Bale via Safir API:**

```
1. POST /auth/token (form-urlencoded, client_credentials) → bearer token (cache 12h in Redis)
2. POST /send_otp { "phone": "98912...", "otp": 123456 }
```

- Phone **must** be `98XXXXXXXXXX` (normalize `09...` → `989...` before calling)
- `404 code 17` = no Bale account → in BOTH mode fall back to SMS; in BALE_ONLY mode → `OTP_BALE_NO_ACCOUNT` error
- `402 code 20` = balance empty → ops alert + `OTP_PROVIDER_UNAVAILABLE`

### 4.5 Impersonation

- `adminImpersonateUser(userId)` mints a short-lived user-scoped token (`IMPERSONATION_TOKEN_TTL=1800s`) with `act: { adminId }` claim
- `NoImpersonationGuard` blocks: `initiatePayment`, `requestUploadUrls`, `confirmUpload`, `sendChatMessage`, `changePassword`, all `delete*` mutations → `IMPERSONATION_FORBIDDEN`
- Non-refreshable; audit `USER_IMPERSONATE_START` at mint, `USER_IMPERSONATE_END` on explicit exit

---

## 5. GraphQL API — user schema

### 5.1 Auth

```graphql
query otpChannels: [OtpChannel!]!                                   # [Public]
mutation requestOtp(mobile, channel?): OtpResponse!                 # [Public]
mutation verifyOtp(mobile, code): AuthTokens!                       # [Public]
mutation login(mobile, password): AuthTokens!                       # [Public]
mutation refreshToken: AuthTokens!                                  # [Public]
mutation logout: Boolean!
mutation changePassword(currentPassword?, newPassword): Boolean!
```

### 5.2 Folders

```graphql
query folders: [Folder!]!
mutation createFolder(input: { name, coverUrl? }): Folder!
mutation updateFolder(id, input: { name?, coverUrl? }): Folder!
mutation deleteFolder(id): Boolean!
```

### 5.3 Notes / Upload

```graphql
query notes(folderId): [Note!]!
query note(id): Note!
query noteAudioUrl(noteId): SignedUrl!
mutation requestUploadUrls(input: { folderId, files[{ fileName, mimeType, sizeBytes }] }): UploadSession!
  # → { uploadSessionId, files[{ storageKey, uploadUrl, expiresIn }] }
mutation confirmUpload(input: { uploadSessionId, recordedAt? }): UploadConfirmation!
  # → { noteId, jobId, status, message }
mutation updateNote(id, input: { title?, contentJson? }): Note!     # sets isEdited=true
mutation resetNoteToOriginal(id): Note!                             # restores from originalContentJson
mutation moveNote(id, targetFolderId): Note!
mutation deleteNote(id): Boolean!
```

### 5.4 Export

```graphql
query exportNotePdf(noteId): PdfExport!         # → { downloadUrl, expiresIn }
query exportFolderPdf(folderId): PdfExport!
```

### 5.5 Chat (RAG)

```graphql
query chatSessions: [ChatSession!]!
query chatSession(id): ChatSession!
mutation createChatSession(input: { folderId, selectedNoteIds }): ChatSession!
mutation sendChatMessage(sessionId, content): ChatMessage!
mutation deleteChatSession(id): Boolean!
```

**sendChatMessage flow:**

1. Embed user query → Metis embeddings endpoint
2. pgvector cosine similarity search on `NoteChunk` filtered to `selectedNoteIds`
3. Retrieve top 5 chunks
4. RAG prompt + chunks → Gemini via Metis `generateContent`
5. Save both messages (`USER` + `ASSISTANT`), return AI response
6. Deduct 1 credit (idempotency key: `chat:{messageId}`)

### 5.6 Subscriptions & Payment

```graphql
query plans: [Plan!]!                # [Public]
query myCredits: CreditBalance!
query myTransactions: [CreditTransaction!]!
query mySubscription: UserSubscription
mutation initiatePayment(planId): PaymentLink!   # → { paymentUrl }
```

REST callback: `GET /api/payments/verify?Authority=...&Status=OK`

### 5.7 Notifications

```graphql
query notifications: NotificationList!
query unreadNotificationCount: Int!
mutation markNotificationRead(id): Notification!
mutation markAllNotificationsRead: Boolean!
mutation deleteNotification(id): Boolean!
```

### 5.8 Real-time subscriptions

```graphql
subscription noteStatusChanged(noteId?): NoteStatusEvent!
subscription creditUpdated: CreditUpdateEvent!
subscription notificationReceived: Notification!
```

- Auth: JWT in `connectionParams.authToken` at WebSocket handshake
- Server filters by `userId` (Redis PubSub for multi-instance support)

---

## 6. Admin GraphQL schema

All admin operations require `Authorization: Bearer <admin_access_token>`. Role levels: **SUPPORT ⊂ ADMIN ⊂ SUPER_ADMIN**.

### 6.1 Auth

```graphql
mutation adminLoginStep1(email, password): AdminLoginChallenge!     # [Public]
mutation adminLoginStep2(challengeId, code): AdminAuthTokens!       # [Public]
mutation adminRefreshToken: AdminAuthTokens!                        # [Public]
mutation adminLogout: Boolean!
```

### 6.2 User management [SUPPORT]

```graphql
query adminUsers(filter: { search, status, hasPaid }, page: { limit=25, offset=0 }): AdminUserList!
query adminUser(id): AdminUserDetail!
mutation adminAdjustCredit(input: { userId, amount, reason! }): AdminUserDetail!
mutation adminSetUserStatus(input: { userId, status, reason, suspendedUntil? }): AdminUserDetail!
mutation adminImpersonateUser(userId): ImpersonationToken!
mutation adminGrantSubscription(input: { userId, planId, expiresAt? }): UserSubscription!
mutation adminCancelSubscription(input: { subscriptionId, reason! }): Boolean!
```

### 6.3 Plan management [ADMIN]

```graphql
query adminPlans: [Plan!]!
mutation adminCreatePlan(input: { name, type, priceIRT, credits, durationDays? }): Plan!
mutation adminUpdatePlan(id, input): Plan!
mutation adminSetPlanActive(id, isActive): Plan!
```

### 6.4 Payments [ADMIN]

```graphql
query adminPayments(filter: { status, planId, search, from, to }, page): AdminPaymentList!
query adminPayment(id): AdminPaymentDetail!
```

### 6.5 Analytics [ADMIN]

```graphql
query adminDashboardStats(range: LAST_7_DAYS | LAST_30_DAYS | LAST_90_DAYS): DashboardStats!
query adminRevenueSeries(range, interval): [SeriesPoint!]!
query adminSignupSeries(range, interval): [SeriesPoint!]!
query adminNotesSeries(range, interval): [SeriesPoint!]!
```

### 6.6 Audit log [ADMIN]

```graphql
query adminAuditLogs(filter: { adminId, action, targetType, targetId, from, to }, page): AuditLogList!
```

### 6.7 Admin management [SUPER_ADMIN]

```graphql
query adminListAdmins: [AdminProfile!]!
mutation adminCreateAdmin(input: { email, mobile, displayName, role, temporaryPassword }): AdminProfile!
mutation adminUpdateAdminRole(id, role): AdminProfile!
mutation adminDeactivateAdmin(id): Boolean!
```

### 6.8 OTP channel config [ADMIN]

```graphql
query adminOtpChannelMode: OtpChannelMode!
mutation adminSetOtpChannelMode(mode: SMS_ONLY | BALE_ONLY | BOTH): OtpChannelMode!
# persisted in AppSetting("otp.channels"); writes OTP_CHANNEL_CONFIG to AuditLog
```

---

## 7. AI processing pipeline (background worker)

### 7.1 Upload → Note flow

```
1. requestUploadUrls mutation:
   a. Validate credit balance (estimated from file sizes)
   b. Validate MIME types and sizes
   c. Generate S3 presigned PUT URLs (10-min expiry, Content-Type + Content-Length conditions)
   d. Cache UploadSession in Redis

2. Client uploads directly to Arvan via presigned URLs

3. confirmUpload mutation:
   a. HeadObject check — verify files exist in S3
   b. Pre-deduct estimated credits (USAGE transaction, idempotencyKey="usage:{noteId}")
   c. Create Note (PENDING) + NoteFile records + JobRecord
   d. Enqueue job to BullMQ "note-generation" queue (jobId = noteId)
   e. Return { noteId, jobId, status: "PENDING" }

4. Worker processes job:
   a. Note.status = PROCESSING; publish noteStatusChanged
   b. Download files from Arvan; convert HEIC/HEIF → JPEG via sharp
   c. Upload media to Metis storage (POST /api/v1/storage); cache URLs on JobRecord
   d. Single multimodal generateContent call → { title, contentJson }
   e. Validate ProseMirror doc structure (up to 2 re-gen attempts on malformed output)
   f. Save contentJson + originalContentJson + title; Note.status = DONE, isIndexed = false
   g. Create Notification (NOTE_DONE); publish noteStatusChanged + notificationReceived
   h. Finalize credit charge; publish creditUpdated
   i. Index (separate failure domain): chunk originalContentJson (~500 tokens/chunk)
      → Metis embeddings → save NoteChunk rows → isIndexed = true
      On failure: leave isIndexed=false, enqueue index-retry job (note stays DONE, no refund)

5. Terminal failure:
   a. Note.status = FAILED; set failureReason
   b. Refund: REFUND transaction (idempotencyKey="refund:{noteId}")
   c. Create Notification (NOTE_FAILED); publish all events
   d. Job moves to BullMQ dead-letter (failed set)
```

### 7.2 Metis provider integration

| Purpose         | Method                                                     | Auth                                    |
| --------------- | ---------------------------------------------------------- | --------------------------------------- |
| Note generation | `POST /v1beta/models/{METIS_GEMINI_MODEL}:generateContent` | `x-goog-api-key: <METIS_API_KEY>`       |
| Embeddings      | `POST /api/v1/embeddings`                                  | `Authorization: Bearer <METIS_API_KEY>` |
| Media upload    | `POST /api/v1/storage`                                     | `Authorization: Bearer <METIS_API_KEY>` |

```
Base URL: METIS_BASE_URL (default: https://api.metisai.ir)
Fallback (CI / blocked networks): https://api.tapsage.com
```

**Embeddings request:**

```json
{
  "model": { "name": "openai", "model": "text-embedding-3-small" },
  "input": ["chunk 1", "chunk 2", "..."]
}
```

Response: `data[].embedding` (1536 floats) + `usage.total_tokens`.

**Media upload response:** `{ "files": [{ "objectName", "url", "size", "contentType" }] }`

### 7.3 Error taxonomy and retry policy

| Class          | Examples                                            | Retryable?  | Policy                                            |
| -------------- | --------------------------------------------------- | ----------- | ------------------------------------------------- |
| `transient`    | network error, timeout, Metis/Gemini 500, Arvan 5xx | Yes         | 3 attempts, exponential backoff (10s → 30s → 90s) |
| `rate_limited` | provider 429                                        | Yes         | Honor `Retry-After`; longer backoff               |
| `malformed`    | invalid JSON, bad ProseMirror schema                | Yes (max 2) | 2 re-gen attempts; if still invalid → fatal       |
| `bad_request`  | 400 malformed request                               | **Fatal**   | Log for engineering (it is a code bug)            |
| `auth`         | Metis 401                                           | **Fatal**   | Ops alert immediately                             |
| `balance`      | Metis 402                                           | **Fatal**   | Ops alert; don't burn retries                     |
| `oversized`    | audio > model limit                                 | **Fatal**   | User-facing message (`NOTE_INPUT_TOO_LONG`)       |

### 7.4 Idempotency rules

- BullMQ `jobId = noteId` — duplicate enqueues collapse
- Skip steps already completed (check `Note.status`, existing data)
- Delete existing `NoteChunk` rows before re-insert
- Cache Metis file URLs on `JobRecord.metisFileUrls` — retries reuse them
- Credit transactions guarded by `idempotencyKey` (`UNIQUE` index)

### 7.5 Credit calculation

| Action                | Cost                                      |
| --------------------- | ----------------------------------------- |
| Audio                 | 1 credit / minute (rounded up)            |
| Image                 | 2 credits / image                         |
| Chat message          | 1 credit                                  |
| New user signup grant | `FREE_CREDIT_GRANT` (default: 20 credits) |

Credits never expire. Subscription expiry only removes the "active plan" badge — it never removes balance.

### 7.6 Gemini note generation prompt

The prompt (stored in `apps/worker/src/ai/prompts/note-generation.ts`) instructs Gemini to:

- Analyze content type dynamically: instructional → study guide; operational → meeting minutes; transactional → sales report; narrative → log/chronicle
- Output **only** a JSON object `{ title: string, contentJson: ProseMirror doc }`
- Match output language to the audio language (Persian, English, or other)
- Use only allowed ProseMirror node types: `doc`, `heading` (level 1–4), `paragraph`, `bulletList`, `orderedList`, `listItem`, `blockquote`, `codeBlock`; marks: `bold`, `italic`, `code`

**RAG chatbot system prompt:** Answer strictly from retrieved context chunks; respond in Persian; say clearly if information is not found; never use outside knowledge.

---

## 8. File storage (Arvan Object Storage)

### 8.1 Bucket structure

```
neviso-uploads/users/{userId}/audio/{noteId}/{filename}.mp3
neviso-uploads/users/{userId}/images/{noteId}/{filename}.jpg
neviso-exports/users/{userId}/exports/{noteId}-{timestamp}.pdf
neviso-exports/users/{userId}/exports/folder-{folderId}-{timestamp}.pdf
```

### 8.2 Rules

- All buckets are **private** — never public
- Access via presigned URLs (15-min expiry for reads)
- Presigned PUT URLs enforce Content-Type allowlist + Content-Length limit + 10-min expiry
- S3 bucket CORS: allow `PUT` only from `https://nevisoai.ir` and `https://www.nevisoai.ir`; restrict headers to `Content-Type`

### 8.3 File limits

| Type  | Max size                      | Allowed MIME types                                                |
| ----- | ----------------------------- | ----------------------------------------------------------------- |
| Audio | 200 MB                        | `audio/mpeg`, `audio/mp4`, `audio/ogg`, `audio/wav`, `audio/webm` |
| Image | 10 MB each, max 10 per upload | `image/jpeg`, `image/png`, `image/webp`, `image/heic`             |

Magic byte validation required (not just extension).

---

## 9. Payment flow (Zarinpal)

```
1. mutation initiatePayment(planId)
   → Create PaymentRecord (PENDING)
   → POST Zarinpal /pg/v4/payment/request.json
   → Store authority; return { paymentUrl }

2. User completes payment on Zarinpal

3. GET /api/payments/verify?Authority=...&Status=OK
   → POST Zarinpal /pg/v4/payment/verify.json
   → On success:
      - PaymentRecord → PAID, set refId + paidAt
      - CreditTransaction (PURCHASE)
      - If SUBSCRIPTION plan → create Subscription
      - Publish creditUpdated
      - Redirect to /dashboard?payment=success
   → On failure → redirect to /dashboard?payment=failed
```

Zarinpal request body:

```json
{
  "merchant_id": "{{ZARINPAL_MERCHANT_ID}}",
  "amount": 150000,
  "currency": "IRT",
  "description": "خرید اشتراک نویسو",
  "callback_url": "https://api.nevisoai.ir/api/payments/verify",
  "metadata": { "mobile": "09121234567" }
}
```

---

## 10. PDF export

- **Tool:** Puppeteer (headless Chrome on Liara worker container; `PUPPETEER_EXECUTABLE_PATH`)
- Note `contentJson` (ProseMirror JSON) → rendered HTML → PDF
- Watermark: semi-transparent diagonal text `نویسو | nevisoai.ir` on every page (`PDF_WATERMARK_TEXT`)
- Folder export: concatenated notes with page breaks + auto-generated table of contents
- PDF metadata: `Title={note title}`, `Author=نویسو (nevisoai.ir)`, `Creator=Neviso AI Platform`
- Export stored in Arvan `neviso-exports`; returned as short-lived signed URL

---

## 11. Error handling standard

### 11.1 Server contract

Every GraphQL error must have `extensions.code` (stable, camelCase), optional `extensions.data` (safe interpolation values), and `extensions.traceId`. The `message` field is for logs only — **never displayed to users**.

A NestJS `formatError` filter strips stack traces in production, guarantees a `code`, logs full error + `traceId`, and returns only `{ code, data?, traceId }`.

### 11.2 Error code catalog

| Code                         | Surface         | Persian message (shown to user)                                            |
| ---------------------------- | --------------- | -------------------------------------------------------------------------- |
| `INSUFFICIENT_CREDITS`       | toast/inline    | اعتبار شما کافی نیست. برای ادامه، اعتبار خود را شارژ کنید.                 |
| `OTP_EXPIRED`                | inline          | کد تأیید منقضی شده است. لطفاً دوباره کد دریافت کنید.                       |
| `OTP_INVALID`                | inline          | کد تأیید نادرست است. دوباره تلاش کنید.                                     |
| `OTP_TOO_SOON`               | inline          | کمی صبر کنید و سپس برای دریافت کد جدید تلاش کنید.                          |
| `OTP_CHANNEL_REQUIRED`       | inline          | لطفاً روش دریافت کد را انتخاب کنید: پیامک یا بله.                          |
| `OTP_BALE_NO_ACCOUNT`        | inline          | این شماره در بله حساب ندارد. لطفاً «پیامک» را انتخاب کنید.                 |
| `OTP_PROVIDER_UNAVAILABLE`   | toast           | ارسال کد در حال حاضر ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.            |
| `NOTE_NOT_FOUND`             | toast           | این جزوه پیدا نشد.                                                         |
| `FOLDER_NOT_FOUND`           | toast           | این پوشه پیدا نشد.                                                         |
| `PROCESSING_FAILED`          | note card/toast | پردازش جزوه ناموفق بود. اعتبار شما بازگردانده شد.                          |
| `NOTE_INPUT_TOO_LONG`        | inline          | طول فایل صوتی بیش از حد مجاز است. لطفاً فایل کوتاه‌تری بارگذاری کنید.      |
| `AI_PROVIDER_UNAVAILABLE`    | toast           | سرویس پردازش موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.               |
| `PAYMENT_FAILED`             | payment page    | پرداخت ناموفق بود. در صورت کسر مبلغ، طبق قوانین درگاه بازگردانده می‌شود.   |
| `FILE_TOO_LARGE`             | inline          | حجم فایل بیش از حد مجاز است.                                               |
| `UNSUPPORTED_FORMAT`         | inline          | این نوع فایل پشتیبانی نمی‌شود.                                             |
| `UNAUTHENTICATED`            | redirect+toast  | برای ادامه وارد حساب کاربری خود شوید.                                      |
| `FORBIDDEN`                  | toast           | شما به این بخش دسترسی ندارید.                                              |
| `ACCOUNT_SUSPENDED`          | full-screen     | حساب شما موقتاً مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید. |
| `ACCOUNT_BANNED`             | full-screen     | حساب شما مسدود شده است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.        |
| `ADMIN_CREDENTIALS_INVALID`  | inline (admin)  | ایمیل یا رمز عبور نادرست است.                                              |
| `ADMIN_CHALLENGE_INVALID`    | inline (admin)  | نشست ورود نامعتبر یا منقضی شده است. دوباره وارد شوید.                      |
| `ADMIN_OTP_INVALID`          | inline (admin)  | کد تأیید نادرست است.                                                       |
| `ADMIN_FORBIDDEN`            | toast (admin)   | اجازهٔ انجام این عملیات را ندارید.                                         |
| `IMPERSONATION_FORBIDDEN`    | toast (admin)   | این عملیات در حالت «مشاهده به‌جای کاربر» مجاز نیست.                        |
| `ADJUSTMENT_REASON_REQUIRED` | inline (admin)  | وارد کردن دلیل برای این عملیات الزامی است.                                 |
| `PLAN_IN_USE`                | toast (admin)   | این پلن قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید.                     |
| `NETWORK_ERROR`              | generic toast   | ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.                |
| `INTERNAL_ERROR`             | generic toast   | خطایی رخ داد. لطفاً دوباره تلاش کنید.                                      |

---

## 12. Security requirements

| Concern          | Implementation                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| SQL injection    | Prisma parameterized queries — no raw SQL                                  |
| XSS              | TipTap sanitizes HTML; CSP headers on Next.js                              |
| CSRF             | HttpOnly cookie + `SameSite=Strict`                                        |
| Rate limiting    | Nginx: 10 req/s per IP; OTP: 1 per 2 min per mobile                        |
| File abuse       | Magic byte validation + size limits enforced on presigned URL conditions   |
| Passwords        | bcrypt cost 12                                                             |
| Secrets          | Environment variables only — never in codebase                             |
| Storage          | Private buckets; time-limited signed URLs only                             |
| CORS             | Whitelist: `nevisoai.ir`, `www.nevisoai.ir`, `admin.nevisoai.ir`           |
| Admin isolation  | Separate JWT secrets + `aud: "admin"`; cross-contamination impossible      |
| Admin 2FA        | Step 1 never leaks email existence; OTP single-use, 5-min TTL              |
| Admin sessions   | 15-min access, 8-h refresh; idle forces re-login                           |
| Admin rate limit | `adminLoginStep1`: max 5 / 15 min per email + per IP                       |
| Audit            | All state-changing admin actions recorded immutably; never updated/deleted |
| Impersonation    | Short-lived, non-refreshable, blocked from sensitive mutations             |

---

## 13. Notification system

### 13.1 Worker creates notification at job end

```typescript
// type: NOTE_DONE or NOTE_FAILED
// title: 'جزوه آماده شد ✅' or 'پردازش جزوه ناموفق بود ❌'
// body: dynamic Persian message with note title + folder name
// metadata: { noteId, folderId, folderName }
// Then: pubSub.publish('notificationReceived', { notificationReceived: notification, userId })
```

### 13.2 Frontend components

```
NotificationBell.tsx   ← unread count badge in header
NotificationPanel.tsx  ← slide-in panel (max 50, newest first)
NotificationItem.tsx   ← row with icon/title/body/time/read state
```

- `NOTE_DONE` click → navigate to `/notes/{noteId}`, mark read
- `NOTE_FAILED` click → navigate to `/dashboard` with error toast
- Toast on `notificationReceived` event; auto-dismiss after 6s

### 13.3 Retention

- Nightly BullMQ cron deletes notifications older than 90 days
- API returns max 50 per call (newest first)

---

## 14. Environment variables

```env
NODE_ENV=production
APP_PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/neviso
REDIS_URL=redis://host:6379

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

JWT_ADMIN_ACCESS_SECRET=...
JWT_ADMIN_REFRESH_SECRET=...
JWT_ADMIN_CHALLENGE_SECRET=...
JWT_ADMIN_ACCESS_EXPIRES=15m
JWT_ADMIN_REFRESH_EXPIRES=8h
ADMIN_OTP_TTL=300
ADMIN_LOGIN_CHALLENGE_TTL=300
IMPERSONATION_TOKEN_TTL=1800
ADMIN_WEB_ORIGIN=https://admin.nevisoai.ir
ADMIN_IP_ALLOWLIST=       # comma-separated CIDRs; empty = allow all

SMS_WEBSERVICE_BASE_URL=https://api.sms-webservice.com/api/V3
SMS_WEBSERVICE_API_KEY=...
SMS_WEBSERVICE_OTP_TEMPLATE_KEY=...

BALE_BASE_URL=https://safir.bale.ai/api/v2
BALE_CLIENT_ID=...
BALE_CLIENT_SECRET=...

ARVAN_ACCESS_KEY=...
ARVAN_SECRET_KEY=...
ARVAN_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
ARVAN_BUCKET_UPLOADS=neviso-uploads
ARVAN_BUCKET_EXPORTS=neviso-exports

METIS_BASE_URL=https://api.metisai.ir
METIS_API_KEY=tpsg-...
METIS_GEMINI_MODEL=gemini-2.5-pro
METIS_EMBEDDING_PROVIDER=openai
METIS_EMBEDDING_MODEL=text-embedding-3-small
METIS_GEN_TIMEOUT=180000
METIS_IO_TIMEOUT=60000

ZARINPAL_MERCHANT_ID=...
ZARINPAL_SANDBOX=false

FREE_CREDIT_GRANT=20
CREDIT_COST_PER_AUDIO_MINUTE=1
CREDIT_COST_PER_IMAGE=2
CREDIT_COST_PER_CHAT_MESSAGE=1

PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PDF_WATERMARK_TEXT=نویسو | nevisoai.ir
```

---

## 15. Monorepo structure & deployment

```
neviso/
├── apps/
│   ├── api/      NestJS API server (user + admin GraphQL modules)
│   ├── worker/   NestJS standalone worker (BullMQ consumer)
│   ├── web/      Next.js frontend (landing + user PWA)
│   └── admin/    Next.js admin backoffice (admin.nevisoai.ir)
├── docker-compose.yml
└── nginx/
    ├── neviso.conf       → nevisoai.ir routing
    └── admin.neviso.conf → admin.nevisoai.ir (optional IP allowlist)
```

**Liara containers:** API (1 vCPU / 512MB), Worker (1 vCPU / 1GB), Web (1 vCPU / 512MB), Admin (1 vCPU / 512MB) + managed PostgreSQL + managed Redis.

**CI/CD (GitHub Actions → main):** lint → tsc → Jest → Docker build → push → Liara deploy → `prisma migrate deploy`.

---

## 16. Implementation rules

1. **No foreign CDNs ever.** All assets (fonts, JS libs) must be vendored and served from Neviso's own infrastructure (Arvan CDN). No `<link>` or `<script>` pointing at Google Fonts, cdnjs, unpkg, jsdelivr, or any external host. This is a hard requirement — Iran blocks foreign CDNs.
2. **Errors never leak to users.** All error codes map to Persian messages (see §11.2); raw messages, stack traces, and upstream provider text are stripped in production.
3. **Credits are idempotent.** Every credit operation uses `idempotencyKey`; duplicate operations are no-ops.
4. **Audit everything admin-side.** Every state-changing admin action writes an `AuditLog` row before returning. The `AuditInterceptor` handles this centrally — do not write ad-hoc audit calls per resolver.
5. **Generation and indexing are separate failure domains.** A failed indexing step must never set the note to FAILED and must never trigger a credit refund.
6. **Separate admin and user token spaces.** Admin tokens carry `aud: "admin"`. User resolvers must reject admin tokens. Admin resolvers must reject user tokens.
7. **No raw SQL.** Use Prisma for all DB access; pgvector cosine queries use Prisma's `$queryRaw` with parameterized inputs only.
8. **No auto-recurring billing.** Zarinpal is one-off redirect only. Do not implement Zarinpal Direct Debit.
9. **The `originalContentJson` is immutable after generation.** `updateNote` only touches `contentJson`. Embeddings are built from `originalContentJson` and are never rebuilt on user edits.
10. **First SUPER_ADMIN is seeded by migration.** There is no public admin sign-up endpoint.
