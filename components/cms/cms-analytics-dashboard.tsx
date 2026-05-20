"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Loader2, TrendingUp, Users, Eye } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsMetricCard, CmsPageHero } from "@/components/cms/cms-page-chrome";
import { CmsCard } from "@/components/cms/cms-ui";
import type { CmsAnalyticsData, YearlyCount } from "@/lib/cms-analytics";
import { cn } from "@/lib/utils";

function maxCount(rows: YearlyCount[]) {
  return Math.max(1, ...rows.map((r) => r.count));
}

function YearBarChart({
  title,
  description,
  rows,
  barClassName,
}: {
  title: string;
  description: string;
  rows: YearlyCount[];
  barClassName: string;
}) {
  const max = maxCount(rows);
  const display = [...rows].sort((a, b) => b.year - a.year);

  return (
    <CmsCard>
      <h3 className="text-base font-semibold text-gcs-foreground">{title}</h3>
      <p className="mt-1 text-sm text-gcs-muted-text">{description}</p>
      <ul className="mt-6 space-y-2.5">
        {display.map(({ year, count }) => (
          <li key={year} className="grid grid-cols-[3.25rem_1fr_2.75rem] items-center gap-3">
            <span className="text-sm font-medium text-gcs-muted-text">{year}</span>
            <div className="h-8 overflow-hidden rounded-lg bg-slate-100/90">
              <div
                className={cn("flex h-full min-w-0 items-center rounded-lg px-2 transition-all", barClassName)}
                style={{ width: `${Math.max(count > 0 ? 8 : 0, (count / max) * 100)}%` }}
                title={`${count}`}
              >
                {count > 0 && (count / max) * 100 > 18 ? (
                  <span className="text-[0.65rem] font-semibold text-white/95">{count}</span>
                ) : null}
              </div>
            </div>
            <span className="text-right text-sm font-semibold tabular-nums text-gcs-foreground">{count}</span>
          </li>
        ))}
      </ul>
    </CmsCard>
  );
}

export function CmsAnalyticsDashboard() {
  const [data, setData] = useState<CmsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/cms/analytics", cmsCredentials);
      if (!res.ok) {
        setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
        setData(null);
        return;
      }
      setData((await res.json()) as CmsAnalyticsData);
    } catch {
      setErr("Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const trackingLabel = useMemo(() => {
    if (!data?.trackingSince) return "Visitor tracking starts when people browse the public site.";
    return `Visitor tracking since ${new Date(data.trackingSince).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}.`;
  }, [data?.trackingSince]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-gcs-muted-text">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading analytics…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {err ?? "Analytics unavailable."}
      </p>
    );
  }

  const currentYear = new Date().getUTCFullYear();

  return (
    <div className="space-y-8 pb-10">
      <CmsPageHero
        eyebrow="Insights"
        title="Analytics"
        description="Year-by-year view of public site visits and registered members (approved with a member ID)."
        icon={BarChart3}
      />

      {err ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{err}</p>
      ) : null}

      <p className="text-sm text-gcs-muted-text">{trackingLabel}</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CmsMetricCard
          label="Registered members"
          value={String(data.totals.totalRegisteredMembers)}
          hint={`${data.totals.registeredThisYear} joined in ${currentYear}`}
          icon={Users}
          variant="success"
        />
        <CmsMetricCard
          label="Site visits (all time)"
          value={String(data.totals.allTimeVisits)}
          hint={`${data.totals.visitsThisYear} in ${currentYear}`}
          icon={Eye}
        />
        <CmsMetricCard
          label="Unique visitors"
          value={String(data.totals.allTimeUniqueVisitors)}
          hint="Estimated from daily browser visits"
          icon={TrendingUp}
        />
        <CmsMetricCard
          label="Years in report"
          value={String(data.years.length)}
          hint={`${data.years[data.years.length - 1]} – ${data.years[0]}`}
          icon={BarChart3}
          variant="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <YearBarChart
          title="Website visitors by year"
          description="Total page views on the public site (each time someone opens a page)."
          rows={data.visitorsByYear}
          barClassName="bg-gradient-to-r from-sky-500 to-gcs-primary"
        />
        <YearBarChart
          title="Unique visitors by year"
          description="Distinct visitors per calendar year (same person counted once per year)."
          rows={data.uniqueVisitorsByYear}
          barClassName="bg-gradient-to-r from-indigo-400 to-violet-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <YearBarChart
          title="New registered members by year"
          description="Members approved and issued a member ID — registration year is based on approval date."
          rows={data.membersRegisteredByYear}
          barClassName="bg-gradient-to-r from-emerald-500 to-teal-600"
        />
        <YearBarChart
          title="Total registered members (cumulative)"
          description="Running total of registered members at the end of each year."
          rows={data.cumulativeMembersByYear}
          barClassName="bg-gradient-to-r from-gcs-primary to-blue-800"
        />
      </div>

      <CmsCard>
        <h3 className="text-base font-semibold text-gcs-foreground">Yearly summary</h3>
        <p className="mt-1 text-sm text-gcs-muted-text">
          Registered member counts use approval date only. Pending or rejected applications are excluded.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-gcs-muted-text">
                <th className="py-3 pr-4">Year</th>
                <th className="py-3 pr-4 text-right">Site visits</th>
                <th className="py-3 pr-4 text-right">Unique visitors</th>
                <th className="py-3 pr-4 text-right">New members</th>
                <th className="py-3 text-right">Total members</th>
              </tr>
            </thead>
            <tbody>
              {[...data.years].sort((a, b) => b - a).map((year) => {
                const visits = data.visitorsByYear.find((r) => r.year === year)?.count ?? 0;
                const unique = data.uniqueVisitorsByYear.find((r) => r.year === year)?.count ?? 0;
                const members = data.membersRegisteredByYear.find((r) => r.year === year)?.count ?? 0;
                const cumulative = data.cumulativeMembersByYear.find((r) => r.year === year)?.count ?? 0;
                return (
                  <tr key={year} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-gcs-foreground">{year}</td>
                    <td className="py-3 text-right tabular-nums">{visits}</td>
                    <td className="py-3 text-right tabular-nums">{unique}</td>
                    <td className="py-3 text-right tabular-nums text-emerald-700">{members}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{cumulative}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CmsCard>
    </div>
  );
}
