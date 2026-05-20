-- CreateTable
CREATE TABLE "SitePageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorKey" TEXT,

    CONSTRAINT "SitePageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SitePageView_viewedAt_idx" ON "SitePageView"("viewedAt");

-- CreateIndex
CREATE INDEX "SitePageView_visitorKey_idx" ON "SitePageView"("visitorKey");
