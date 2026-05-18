-- Add publication contact email lists (existing rows get empty arrays).
ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "readerEmails" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Publication" ADD COLUMN IF NOT EXISTS "authorEmails" JSONB NOT NULL DEFAULT '[]';
