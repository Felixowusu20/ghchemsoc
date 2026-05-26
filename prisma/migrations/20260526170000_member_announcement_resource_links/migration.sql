-- Add resourceLinks after MemberAnnouncement exists (see 20260520120000_member_announcements).
-- Idempotent for production recovery.

ALTER TABLE "MemberAnnouncement"
    ADD COLUMN IF NOT EXISTS "resourceLinks" TEXT;
