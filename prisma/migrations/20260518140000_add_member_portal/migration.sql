-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberPortalSettings" (
    "id" TEXT NOT NULL DEFAULT 'member_portal',
    "dashboardEyebrow" TEXT NOT NULL DEFAULT 'Member area',
    "dashboardTitle" TEXT NOT NULL DEFAULT 'Your GCS portfolio',
    "dashboardLead" TEXT NOT NULL,
    "benefitsTitle" TEXT NOT NULL DEFAULT 'Membership benefits',
    "benefitsLead" TEXT NOT NULL,
    "resourcesTitle" TEXT NOT NULL DEFAULT 'Members-only resources',
    "resourcesLead" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberPortalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberBenefit" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT NOT NULL DEFAULT 'resources',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "iconKey" TEXT NOT NULL DEFAULT 'book',
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberBenefit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MemberBenefit_published_idx" ON "MemberBenefit"("published");
CREATE INDEX IF NOT EXISTS "MemberBenefit_section_idx" ON "MemberBenefit"("section");
CREATE INDEX IF NOT EXISTS "MemberBenefit_sortOrder_idx" ON "MemberBenefit"("sortOrder");
