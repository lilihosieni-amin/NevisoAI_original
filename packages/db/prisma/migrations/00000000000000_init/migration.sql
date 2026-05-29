-- Phase 0: enable pgvector (used later by NoteChunk embeddings) and create the
-- foundational app settings table.
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);
