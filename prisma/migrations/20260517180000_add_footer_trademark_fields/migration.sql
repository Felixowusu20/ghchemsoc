-- Add trademark fields to site footer (safe — no data loss).
ALTER TABLE "SiteFooterSettings" ADD COLUMN IF NOT EXISTS "trademarkLabel" TEXT NOT NULL DEFAULT 'Trademark & legal';
ALTER TABLE "SiteFooterSettings" ADD COLUMN IF NOT EXISTS "trademarkHref" TEXT NOT NULL DEFAULT '/contact';
ALTER TABLE "SiteFooterSettings" ADD COLUMN IF NOT EXISTS "trademarkNotice" TEXT;
