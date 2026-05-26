-- CreateEnum
CREATE TYPE "SocietyResourceKind" AS ENUM ('video', 'document', 'link', 'other');

-- CreateEnum
CREATE TYPE "MembershipApplicationStatus" AS ENUM ('pending_payment', 'payment_submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "MembershipPaymentStatus" AS ENUM ('pending', 'submitted', 'verified', 'failed');

-- CreateEnum
CREATE TYPE "MembershipPaymentMethod" AS ENUM ('mobile_money_mtn', 'mobile_money_telecel', 'mobile_money_airteltigo', 'bank_transfer', 'debit_credit_card', 'ussd');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepagePartnershipsSettings" (
    "id" TEXT NOT NULL DEFAULT 'homepage_partnerships',
    "eyebrow" TEXT NOT NULL DEFAULT 'Partnerships',
    "title" TEXT NOT NULL DEFAULT 'Our partners',
    "searchPlaceholder" TEXT NOT NULL DEFAULT 'Search partners…',
    "showSearch" BOOLEAN NOT NULL DEFAULT true,
    "ctaLabel" TEXT NOT NULL DEFAULT 'View all',
    "ctaHref" TEXT NOT NULL DEFAULT '/contact',
    "footerNote" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepagePartnershipsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnershipCard" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tag" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accentPill" TEXT,
    "href" TEXT,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnershipCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietyEvent" (
    "id" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "timeLabel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "href" TEXT,
    "badge" TEXT,
    "registrationFormFields" JSONB,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocietyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "summaryLine" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSettings" (
    "id" TEXT NOT NULL DEFAULT 'contact',
    "eyebrow" TEXT NOT NULL DEFAULT 'Contact',
    "headline" TEXT NOT NULL,
    "subtext" TEXT NOT NULL,
    "cards" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteFooterSettings" (
    "id" TEXT NOT NULL DEFAULT 'site_footer',
    "headlineLine1" TEXT NOT NULL,
    "headlineLine2" TEXT NOT NULL,
    "helplineText" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "copyrightText" TEXT NOT NULL,
    "trademarkLabel" TEXT NOT NULL DEFAULT 'Trademark & legal',
    "trademarkHref" TEXT NOT NULL DEFAULT '/contact',
    "trademarkNotice" TEXT,
    "navLinks" JSONB NOT NULL DEFAULT '[]',
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "leftImageMediaId" TEXT,
    "rightImageMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFooterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageExploreSettings" (
    "id" TEXT NOT NULL DEFAULT 'homepage_explore',
    "missionEyebrow" TEXT NOT NULL,
    "headlineLine1" TEXT NOT NULL,
    "headlineLine2" TEXT NOT NULL,
    "aboutEyebrow" TEXT NOT NULL,
    "aboutBody" TEXT NOT NULL,
    "imageBadge" TEXT NOT NULL,
    "imageHoverQuote" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "secondaryBadge" TEXT NOT NULL,
    "bottomBlurb" TEXT NOT NULL,
    "mainImageMediaId" TEXT,
    "secondaryImageMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageExploreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageEventsSettings" (
    "id" TEXT NOT NULL DEFAULT 'homepage_events',
    "spotlightEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sectionEyebrow" TEXT NOT NULL DEFAULT 'Upcoming',
    "sectionTitle" TEXT NOT NULL DEFAULT 'Conferences & events',
    "spotlightEyebrow" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metaLine" TEXT,
    "imagePosition" TEXT NOT NULL DEFAULT 'left',
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "imageBadge" TEXT,
    "imageMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageEventsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "mediaId" TEXT,
    "imageAlt" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "headlineLine1" TEXT NOT NULL,
    "headlineLine2" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "secondaryLabel" TEXT,
    "secondaryHref" TEXT,
    "statValue" TEXT,
    "statLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutSection" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'default',
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Executive" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Executive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinStep" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "stepKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinPageHeader" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'join_page_header',
    "eyebrow" TEXT NOT NULL DEFAULT 'Membership',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "mediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinPageHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT,
    "authorName" TEXT,
    "authorRole" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourcesPageSettings" (
    "id" TEXT NOT NULL DEFAULT 'resources_page',
    "eyebrow" TEXT NOT NULL DEFAULT 'Resources',
    "headline" TEXT NOT NULL DEFAULT 'Learning & reference materials',
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
    "urlPublicId" TEXT,
    "mediaId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocietyResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "journalTitle" TEXT,
    "meta" TEXT,
    "description" TEXT NOT NULL,
    "issue" TEXT,
    "href" TEXT,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "readerEmails" JSONB NOT NULL DEFAULT '[]',
    "authorEmails" JSONB NOT NULL DEFAULT '[]',
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationArticle" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "pdfHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicationArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipApplication" (
    "id" TEXT NOT NULL,
    "status" "MembershipApplicationStatus" NOT NULL DEFAULT 'pending_payment',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "institution" TEXT NOT NULL,
    "jobTitle" TEXT,
    "highestDegree" TEXT,
    "declarationLegalName" TEXT NOT NULL,
    "declarationDate" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "amountGhs" INTEGER NOT NULL DEFAULT 250,
    "paymentStatus" "MembershipPaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentMethod" "MembershipPaymentMethod",
    "paystackReference" TEXT,
    "payerPhone" TEXT,
    "paymentNote" TEXT,
    "paidAt" TIMESTAMP(3),
    "memberId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberLibraryItem" (
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

-- CreateTable
CREATE TABLE "MemberAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "publicHref" TEXT,
    "goLiveAt" TIMESTAMP(3),
    "resourceLinks" TEXT,
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "emailSuccessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberAnnouncementDelivery" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAnnouncementDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberPortalSettings" (
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
CREATE TABLE "MemberBenefit" (
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

-- CreateTable
CREATE TABLE "SitePageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorKey" TEXT,

    CONSTRAINT "SitePageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "PartnershipCard_published_idx" ON "PartnershipCard"("published");

-- CreateIndex
CREATE INDEX "PartnershipCard_sortOrder_idx" ON "PartnershipCard"("sortOrder");

-- CreateIndex
CREATE INDEX "SocietyEvent_published_idx" ON "SocietyEvent"("published");

-- CreateIndex
CREATE INDEX "SocietyEvent_featured_idx" ON "SocietyEvent"("featured");

-- CreateIndex
CREATE INDEX "SocietyEvent_sortOrder_idx" ON "SocietyEvent"("sortOrder");

-- CreateIndex
CREATE INDEX "SocietyEvent_startDate_idx" ON "SocietyEvent"("startDate");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_createdAt_idx" ON "EventRegistration"("createdAt");

-- CreateIndex
CREATE INDEX "EventRegistration_read_idx" ON "EventRegistration"("read");

-- CreateIndex
CREATE INDEX "ContactInquiry_createdAt_idx" ON "ContactInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_read_idx" ON "ContactInquiry"("read");

-- CreateIndex
CREATE UNIQUE INDEX "SiteFooterSettings_leftImageMediaId_key" ON "SiteFooterSettings"("leftImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteFooterSettings_rightImageMediaId_key" ON "SiteFooterSettings"("rightImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageExploreSettings_mainImageMediaId_key" ON "HomepageExploreSettings"("mainImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageExploreSettings_secondaryImageMediaId_key" ON "HomepageExploreSettings"("secondaryImageMediaId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageEventsSettings_imageMediaId_key" ON "HomepageEventsSettings"("imageMediaId");

-- CreateIndex
CREATE INDEX "HeroSlide_published_idx" ON "HeroSlide"("published");

-- CreateIndex
CREATE INDEX "HeroSlide_sortOrder_idx" ON "HeroSlide"("sortOrder");

-- CreateIndex
CREATE INDEX "AboutSection_published_idx" ON "AboutSection"("published");

-- CreateIndex
CREATE INDEX "AboutSection_sortOrder_idx" ON "AboutSection"("sortOrder");

-- CreateIndex
CREATE INDEX "Executive_published_idx" ON "Executive"("published");

-- CreateIndex
CREATE INDEX "Executive_sortOrder_idx" ON "Executive"("sortOrder");

-- CreateIndex
CREATE INDEX "JoinStep_published_idx" ON "JoinStep"("published");

-- CreateIndex
CREATE INDEX "JoinStep_sortOrder_idx" ON "JoinStep"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JoinPageHeader_key_key" ON "JoinPageHeader"("key");

-- CreateIndex
CREATE UNIQUE INDEX "NewsItem_slug_key" ON "NewsItem"("slug");

-- CreateIndex
CREATE INDEX "NewsItem_published_idx" ON "NewsItem"("published");

-- CreateIndex
CREATE INDEX "NewsItem_sortOrder_idx" ON "NewsItem"("sortOrder");

-- CreateIndex
CREATE INDEX "NewsItem_date_idx" ON "NewsItem"("date");

-- CreateIndex
CREATE INDEX "SocietyResource_published_idx" ON "SocietyResource"("published");

-- CreateIndex
CREATE INDEX "SocietyResource_kind_idx" ON "SocietyResource"("kind");

-- CreateIndex
CREATE INDEX "SocietyResource_sortOrder_idx" ON "SocietyResource"("sortOrder");

-- CreateIndex
CREATE INDEX "SocietyResource_publishedAt_idx" ON "SocietyResource"("publishedAt");

-- CreateIndex
CREATE INDEX "Publication_published_idx" ON "Publication"("published");

-- CreateIndex
CREATE INDEX "Publication_featured_idx" ON "Publication"("featured");

-- CreateIndex
CREATE INDEX "Publication_sortOrder_idx" ON "Publication"("sortOrder");

-- CreateIndex
CREATE INDEX "Publication_publishedAt_idx" ON "Publication"("publishedAt");

-- CreateIndex
CREATE INDEX "PublicationArticle_publicationId_idx" ON "PublicationArticle"("publicationId");

-- CreateIndex
CREATE INDEX "PublicationArticle_sortOrder_idx" ON "PublicationArticle"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipApplication_memberId_key" ON "MembershipApplication"("memberId");

-- CreateIndex
CREATE INDEX "MembershipApplication_status_idx" ON "MembershipApplication"("status");

-- CreateIndex
CREATE INDEX "MembershipApplication_paymentStatus_idx" ON "MembershipApplication"("paymentStatus");

-- CreateIndex
CREATE INDEX "MembershipApplication_read_idx" ON "MembershipApplication"("read");

-- CreateIndex
CREATE INDEX "MembershipApplication_createdAt_idx" ON "MembershipApplication"("createdAt");

-- CreateIndex
CREATE INDEX "MembershipApplication_email_idx" ON "MembershipApplication"("email");

-- CreateIndex
CREATE INDEX "MemberLibraryItem_applicationId_idx" ON "MemberLibraryItem"("applicationId");

-- CreateIndex
CREATE INDEX "MemberLibraryItem_type_idx" ON "MemberLibraryItem"("type");

-- CreateIndex
CREATE INDEX "MemberLibraryItem_sortOrder_idx" ON "MemberLibraryItem"("sortOrder");

-- CreateIndex
CREATE INDEX "MemberAnnouncement_sentAt_idx" ON "MemberAnnouncement"("sentAt");

-- CreateIndex
CREATE INDEX "MemberAnnouncement_createdAt_idx" ON "MemberAnnouncement"("createdAt");

-- CreateIndex
CREATE INDEX "MemberAnnouncementDelivery_applicationId_idx" ON "MemberAnnouncementDelivery"("applicationId");

-- CreateIndex
CREATE INDEX "MemberAnnouncementDelivery_readAt_idx" ON "MemberAnnouncementDelivery"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAnnouncementDelivery_announcementId_applicationId_key" ON "MemberAnnouncementDelivery"("announcementId", "applicationId");

-- CreateIndex
CREATE INDEX "MemberBenefit_published_idx" ON "MemberBenefit"("published");

-- CreateIndex
CREATE INDEX "MemberBenefit_section_idx" ON "MemberBenefit"("section");

-- CreateIndex
CREATE INDEX "MemberBenefit_sortOrder_idx" ON "MemberBenefit"("sortOrder");

-- CreateIndex
CREATE INDEX "SitePageView_viewedAt_idx" ON "SitePageView"("viewedAt");

-- CreateIndex
CREATE INDEX "SitePageView_visitorKey_idx" ON "SitePageView"("visitorKey");

-- AddForeignKey
ALTER TABLE "PartnershipCard" ADD CONSTRAINT "PartnershipCard_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyEvent" ADD CONSTRAINT "SocietyEvent_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SocietyEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteFooterSettings" ADD CONSTRAINT "SiteFooterSettings_leftImageMediaId_fkey" FOREIGN KEY ("leftImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteFooterSettings" ADD CONSTRAINT "SiteFooterSettings_rightImageMediaId_fkey" FOREIGN KEY ("rightImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageExploreSettings" ADD CONSTRAINT "HomepageExploreSettings_mainImageMediaId_fkey" FOREIGN KEY ("mainImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageExploreSettings" ADD CONSTRAINT "HomepageExploreSettings_secondaryImageMediaId_fkey" FOREIGN KEY ("secondaryImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageEventsSettings" ADD CONSTRAINT "HomepageEventsSettings_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboutSection" ADD CONSTRAINT "AboutSection_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Executive" ADD CONSTRAINT "Executive_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinStep" ADD CONSTRAINT "JoinStep_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinPageHeader" ADD CONSTRAINT "JoinPageHeader_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyResource" ADD CONSTRAINT "SocietyResource_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationArticle" ADD CONSTRAINT "PublicationArticle_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberLibraryItem" ADD CONSTRAINT "MemberLibraryItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "MembershipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAnnouncementDelivery" ADD CONSTRAINT "MemberAnnouncementDelivery_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "MemberAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAnnouncementDelivery" ADD CONSTRAINT "MemberAnnouncementDelivery_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "MembershipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
