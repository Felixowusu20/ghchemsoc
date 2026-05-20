import { withDbFallback } from "@/lib/db-fallback";
import { pageViewYear } from "@/lib/site-page-views";
import { prisma } from "@/lib/prisma";

export type YearlyCount = {
  year: number;
  count: number;
};

export type CmsAnalyticsData = {
  years: number[];
  visitorsByYear: YearlyCount[];
  uniqueVisitorsByYear: YearlyCount[];
  membersRegisteredByYear: YearlyCount[];
  cumulativeMembersByYear: YearlyCount[];
  totals: {
    allTimeVisits: number;
    allTimeUniqueVisitors: number;
    totalRegisteredMembers: number;
    registeredThisYear: number;
    visitsThisYear: number;
  };
  trackingSince: string | null;
};

function buildYearRange(startYear: number, endYear: number): number[] {
  const years: number[] = [];
  for (let y = endYear; y >= startYear; y--) years.push(y);
  return years;
}

function countByYear<T>(items: T[], getYear: (item: T) => number | null): Map<number, number> {
  const map = new Map<number, number>();
  for (const item of items) {
    const year = getYear(item);
    if (year == null) continue;
    map.set(year, (map.get(year) ?? 0) + 1);
  }
  return map;
}

function mapToYearlySeries(map: Map<number, number>, years: number[]): YearlyCount[] {
  return years.map((year) => ({ year, count: map.get(year) ?? 0 }));
}

function cumulativeFromNewMembers(newByYear: YearlyCount[]): YearlyCount[] {
  const sorted = [...newByYear].sort((a, b) => a.year - b.year);
  let running = 0;
  return sorted.map(({ year, count }) => {
    running += count;
    return { year, count: running };
  });
}

function emptyAnalytics(): CmsAnalyticsData {
  const y = new Date().getUTCFullYear();
  return {
    years: [y],
    visitorsByYear: [{ year: y, count: 0 }],
    uniqueVisitorsByYear: [{ year: y, count: 0 }],
    membersRegisteredByYear: [{ year: y, count: 0 }],
    cumulativeMembersByYear: [{ year: y, count: 0 }],
    totals: {
      allTimeVisits: 0,
      allTimeUniqueVisitors: 0,
      totalRegisteredMembers: 0,
      registeredThisYear: 0,
      visitsThisYear: 0,
    },
    trackingSince: null,
  };
}

export async function getCmsAnalytics(): Promise<CmsAnalyticsData> {
  return withDbFallback("getCmsAnalytics", async () => {
    const currentYear = new Date().getUTCFullYear();

    const [views, members, firstView] = await Promise.all([
      prisma.sitePageView.findMany({
        select: { viewedAt: true, visitorKey: true },
      }),
      prisma.membershipApplication.findMany({
        where: {
          status: "approved",
          memberId: { not: null },
          approvedAt: { not: null },
        },
        select: { approvedAt: true },
      }),
      prisma.sitePageView.findFirst({
        orderBy: { viewedAt: "asc" },
        select: { viewedAt: true },
      }),
    ]);

    const visitsByYear = countByYear(views, (v) => pageViewYear(v.viewedAt));

    const uniqueByYear = new Map<number, Set<string>>();
    for (const v of views) {
      const year = pageViewYear(v.viewedAt);
      const key = v.visitorKey ?? `anon-${v.viewedAt.getTime()}`;
      if (!uniqueByYear.has(year)) uniqueByYear.set(year, new Set());
      uniqueByYear.get(year)!.add(key);
    }
    const uniqueVisitorsMap = new Map<number, number>();
    for (const [year, set] of uniqueByYear) {
      uniqueVisitorsMap.set(year, set.size);
    }

    const membersByYear = countByYear(members, (m) =>
      m.approvedAt ? pageViewYear(m.approvedAt) : null
    );

    const memberYears = [...membersByYear.keys()];
    const visitYears = [...visitsByYear.keys()];
    const startYear = Math.min(
      currentYear - 9,
      memberYears.length ? Math.min(...memberYears) : currentYear,
      visitYears.length ? Math.min(...visitYears) : currentYear,
      firstView ? pageViewYear(firstView.viewedAt) : currentYear
    );
    const years = buildYearRange(startYear, currentYear);

    const visitorsByYear = mapToYearlySeries(visitsByYear, years);
    const uniqueVisitorsByYear = mapToYearlySeries(uniqueVisitorsMap, years);
    const membersRegisteredByYear = mapToYearlySeries(membersByYear, years);
    const cumulativeMembersByYear = cumulativeFromNewMembers(membersRegisteredByYear);

    const allVisitorKeys = new Set(
      views.map((v) => v.visitorKey).filter((k): k is string => Boolean(k))
    );

    return {
      years,
      visitorsByYear,
      uniqueVisitorsByYear,
      membersRegisteredByYear,
      cumulativeMembersByYear,
      totals: {
        allTimeVisits: views.length,
        allTimeUniqueVisitors: allVisitorKeys.size > 0 ? allVisitorKeys.size : views.length,
        totalRegisteredMembers: members.length,
        registeredThisYear: membersByYear.get(currentYear) ?? 0,
        visitsThisYear: visitsByYear.get(currentYear) ?? 0,
      },
      trackingSince: firstView?.viewedAt.toISOString() ?? null,
    };
  }, emptyAnalytics());
}
