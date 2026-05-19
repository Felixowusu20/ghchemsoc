import { Prisma } from "@prisma/client";
import { prisma, prismaReady } from "@/lib/prisma";
import { withDbFallback } from "@/lib/db-fallback";
import { prismaCmsErrorMessage } from "@/lib/cms-api-errors";
import {
  mapMemberBenefitRow,
  mapMemberPortalSettings,
  memberPortalCreateData,
  memberPortalCmsFallback,
  memberPortalDefaults,
  MEMBER_BENEFIT_DEFAULTS,
  MEMBER_PORTAL_ID,
  type MemberPortalPublic,
} from "@/lib/member-portal";

function isMissingMemberPortalTable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022";
  }
  const msg = error instanceof Error ? error.message : String(error);
  return /MemberPortalSettings|MemberBenefit|does not exist/i.test(msg);
}

function isStalePrismaDelegate(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    /Cannot read properties of undefined \(reading 'findUnique'\)/i.test(msg) ||
    /Prisma client is missing|outdated after a schema update/i.test(msg)
  );
}

async function seedDefaultBenefitsIfEmpty() {
  const count = await prisma.memberBenefit.count();
  if (count > 0) return;

  await prisma.$transaction(
    MEMBER_BENEFIT_DEFAULTS.map((b, i) =>
      prisma.memberBenefit.create({
        data: {
          section: b.section,
          title: b.title,
          description: b.description,
          body: b.body,
          href: b.href,
          iconKey: b.iconKey,
          hint: b.hint,
          sortOrder: i,
          published: true,
        },
      })
    )
  );
}

async function loadMemberPortalFromDb() {
  let settings = await prisma.memberPortalSettings.findUnique({
    where: { id: MEMBER_PORTAL_ID },
  });
  if (!settings) {
    settings = await prisma.memberPortalSettings.create({
      data: memberPortalCreateData(),
    });
  }

  await seedDefaultBenefitsIfEmpty();

  const rows = await prisma.memberBenefit.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
  });

  return {
    settings: mapMemberPortalSettings(settings),
    benefits: rows.map((r) => ({
      ...mapMemberBenefitRow(r),
      published: r.published,
      sortOrder: r.sortOrder,
    })),
    meta: { dbReady: true as const },
  };
}

export async function getMemberPortalForPublic(): Promise<MemberPortalPublic> {
  return withDbFallback(
    "getMemberPortalForPublic",
    async () => {
      const data = await loadMemberPortalFromDb();
      return {
        settings: data.settings,
        benefits: data.benefits.filter((b) => b.published),
      };
    },
    memberPortalDefaults()
  );
}

export async function getMemberPortalForCms() {
  if (!(await prismaReady())) {
    return memberPortalCmsFallback("Database is offline. Check DATABASE_URL and try again.");
  }

  try {
    return await loadMemberPortalFromDb();
  } catch (error) {
    if (isMissingMemberPortalTable(error) || isStalePrismaDelegate(error)) {
      return memberPortalCmsFallback(prismaCmsErrorMessage(error, "load member portal"));
    }
    throw error;
  }
}
