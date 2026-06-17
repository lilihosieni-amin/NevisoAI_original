-- Enable pgvector before any vector(...) column is created (ARD §1.3 gotcha).
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'BALE');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('AUDIO', 'IMAGE');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'USAGE', 'FREE_GRANT', 'REFUND', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NOTE_DONE', 'NOTE_FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ADMIN_LOGIN', 'USER_CREDIT_ADJUST', 'USER_SUSPEND', 'USER_BAN', 'USER_REACTIVATE', 'USER_IMPERSONATE_START', 'USER_IMPERSONATE_END', 'PLAN_CREATE', 'PLAN_UPDATE', 'PLAN_SET_ACTIVE', 'ADMIN_CREATE', 'ADMIN_UPDATE_ROLE', 'ADMIN_DEACTIVATE', 'OTP_CHANNEL_CONFIG');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "creditBalance" INTEGER NOT NULL DEFAULT 0,
    "freeCreditsGiven" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "statusReason" TEXT,
    "suspendedUntil" TIMESTAMP(3),
    "preferredOtpChannel" "OtpChannel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "mobile" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL DEFAULT 'SMS',
    "smsMessageId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "originalContentJson" JSONB,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "status" "NoteStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "creditCost" INTEGER NOT NULL DEFAULT 0,
    "totalInputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalOutputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteFile" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteChunk" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteTokenUsage" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "selectedNoteIds" TEXT[],
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "refId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalPriceIRT" INTEGER NOT NULL,
    "priceIRT" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRecord" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "errorClass" TEXT,
    "metisFileUrls" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amountIRT" INTEGER NOT NULL,
    "authority" TEXT,
    "refId" TEXT,
    "cardPan" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPPORT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOtp" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "NoteChunk_noteId_idx" ON "NoteChunk"("noteId");

-- CreateIndex
CREATE INDEX "NoteTokenUsage_noteId_idx" ON "NoteTokenUsage"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_idempotencyKey_key" ON "CreditTransaction"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobRecord_noteId_key" ON "JobRecord"("noteId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRecord_authority_key" ON "PaymentRecord"("authority");

-- CreateIndex
CREATE INDEX "PaymentRecord_status_createdAt_idx" ON "PaymentRecord"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentRecord_userId_idx" ON "PaymentRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_mobile_key" ON "Admin"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "AdminOtp_challengeId_key" ON "AdminOtp"("challengeId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_createdAt_idx" ON "AuditLog"("adminId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "OtpRecord" ADD CONSTRAINT "OtpRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteFile" ADD CONSTRAINT "NoteFile_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteChunk" ADD CONSTRAINT "NoteChunk_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteTokenUsage" ADD CONSTRAINT "NoteTokenUsage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOtp" ADD CONSTRAINT "AdminOtp_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

