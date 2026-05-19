-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberLibraryItem" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "filePublicId" TEXT,
    "fileMime" TEXT,
    "fileBytes" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberLibraryItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MemberLibraryItem_applicationId_idx" ON "MemberLibraryItem"("applicationId");
CREATE INDEX IF NOT EXISTS "MemberLibraryItem_type_idx" ON "MemberLibraryItem"("type");
CREATE INDEX IF NOT EXISTS "MemberLibraryItem_sortOrder_idx" ON "MemberLibraryItem"("sortOrder");

DO $$ BEGIN
    ALTER TABLE "MemberLibraryItem" ADD CONSTRAINT "MemberLibraryItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "MembershipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
