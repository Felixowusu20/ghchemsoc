-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "publicHref" TEXT,
    "goLiveAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "emailSuccessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MemberAnnouncementDelivery" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAnnouncementDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MemberAnnouncement_sentAt_idx" ON "MemberAnnouncement"("sentAt");
CREATE INDEX IF NOT EXISTS "MemberAnnouncement_createdAt_idx" ON "MemberAnnouncement"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "MemberAnnouncementDelivery_announcementId_applicationId_key" ON "MemberAnnouncementDelivery"("announcementId", "applicationId");
CREATE INDEX IF NOT EXISTS "MemberAnnouncementDelivery_applicationId_idx" ON "MemberAnnouncementDelivery"("applicationId");
CREATE INDEX IF NOT EXISTS "MemberAnnouncementDelivery_readAt_idx" ON "MemberAnnouncementDelivery"("readAt");

DO $$ BEGIN
    ALTER TABLE "MemberAnnouncementDelivery" ADD CONSTRAINT "MemberAnnouncementDelivery_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "MemberAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "MemberAnnouncementDelivery" ADD CONSTRAINT "MemberAnnouncementDelivery_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "MembershipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
