-- CreateEnum
CREATE TYPE "SocietyResourceKind" AS ENUM ('video', 'document', 'link', 'other');

-- CreateTable
CREATE TABLE "ResourcesPageSettings" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT 'Resources',
    "headline" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourcesPageSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietyResource" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "kind" "SocietyResourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "mediaId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocietyResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocietyResource_published_idx" ON "SocietyResource"("published");

-- CreateIndex
CREATE INDEX "SocietyResource_kind_idx" ON "SocietyResource"("kind");

-- CreateIndex
CREATE INDEX "SocietyResource_sortOrder_idx" ON "SocietyResource"("sortOrder");

-- CreateIndex
CREATE INDEX "SocietyResource_publishedAt_idx" ON "SocietyResource"("publishedAt");

-- AddForeignKey
ALTER TABLE "SocietyResource" ADD CONSTRAINT "SocietyResource_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default page copy
INSERT INTO "ResourcesPageSettings" ("id", "eyebrow", "headline", "lead", "updatedAt")
VALUES (
    'resources_page',
    'Resources',
    'Videos, documents & tools',
    'Conference recordings, slide decks, technical guides, and useful links curated by the Ghana Chemical Society for members and the wider chemistry community.',
    CURRENT_TIMESTAMP
);
