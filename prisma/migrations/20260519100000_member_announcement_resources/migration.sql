-- Add members-only resource attachments to MemberAnnouncement.
-- Idempotent: re-runnable without errors on environments where the column already exists.

ALTER TABLE "MemberAnnouncement"
    ADD COLUMN IF NOT EXISTS "resourceLinks" TEXT;
