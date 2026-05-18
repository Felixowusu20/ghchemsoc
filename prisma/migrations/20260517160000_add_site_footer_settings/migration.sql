-- CreateTable (additive — does not modify or drop existing app data)
CREATE TABLE IF NOT EXISTS "SiteFooterSettings" (
    "id" TEXT NOT NULL,
    "headlineLine1" TEXT NOT NULL,
    "headlineLine2" TEXT NOT NULL,
    "helplineText" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "copyrightText" TEXT NOT NULL,
    "navLinks" JSONB NOT NULL DEFAULT '[]',
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "leftImageMediaId" TEXT,
    "rightImageMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFooterSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteFooterSettings_leftImageMediaId_key" ON "SiteFooterSettings"("leftImageMediaId");
CREATE UNIQUE INDEX IF NOT EXISTS "SiteFooterSettings_rightImageMediaId_key" ON "SiteFooterSettings"("rightImageMediaId");

DO $$ BEGIN
  ALTER TABLE "SiteFooterSettings" ADD CONSTRAINT "SiteFooterSettings_leftImageMediaId_fkey" FOREIGN KEY ("leftImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "SiteFooterSettings" ADD CONSTRAINT "SiteFooterSettings_rightImageMediaId_fkey" FOREIGN KEY ("rightImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
