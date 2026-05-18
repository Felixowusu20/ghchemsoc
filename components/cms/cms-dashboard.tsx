import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { CmsDashboardTabs, type DashboardModuleSection } from "@/components/cms/cms-dashboard-tabs";
import { CmsCard } from "@/components/cms/cms-ui";
import type { CmsDashboardStats } from "@/lib/cms-dashboard-stats";
import type { CmsNotificationCounts } from "@/lib/cms-notifications";
import { cn } from "@/lib/utils";

function buildSections(counts: CmsNotificationCounts): DashboardModuleSection[] {
  return [
    {
      id: "homepage",
      tabLabel: "Homepage",
      title: "Homepage & branding",
      description: "What visitors see first — hero, mission, partners, and footer.",
      items: [
        { href: "/cms/hero", title: "Hero carousel", desc: "Slides, imagery, and calls to action.", icon: "ImageIcon" },
        {
          href: "/cms/homepage-explore",
          title: "Mission strip",
          desc: "Headline and imagery below the hero.",
          icon: "House",
        },
        { href: "/cms/join", title: "Join block", desc: "Membership headline and steps.", icon: "Users" },
        { href: "/cms/partnerships", title: "Partnerships", desc: "Partner cards on the homepage.", icon: "Handshake" },
        { href: "/cms/site-footer", title: "Site footer", desc: "Links, socials, and footer imagery.", icon: "PanelBottom" },
      ],
    },
    {
      id: "content",
      tabLabel: "Pages & content",
      title: "Pages & content",
      description: "Editorial pages and listings on the public site.",
      items: [
        { href: "/cms/about", title: "About page", desc: "Mission, sections, and images.", icon: "FileText" },
        { href: "/cms/news", title: "News", desc: "Articles, slugs, and publish dates.", icon: "Newspaper" },
        { href: "/cms/publications", title: "Publications", desc: "Journals, bulletins, and links.", icon: "BookOpen" },
        { href: "/cms/events", title: "Events", desc: "Conferences, workshops, and dates.", icon: "Calendar" },
        { href: "/cms/contact", title: "Contact page", desc: "Hero copy and detail cards.", icon: "MessageCircle" },
      ],
    },
    {
      id: "operations",
      tabLabel: "Inbox & members",
      title: "Inbox & membership",
      description: "Review submissions and keep member records up to date.",
      items: [
        {
          href: "/cms/contact-inquiries",
          title: "Contact messages",
          desc: "Inquiries from the public contact form.",
          icon: "Inbox",
          badge: counts.unreadContactInquiries,
        },
        {
          href: "/cms/membership",
          title: "Membership",
          desc: "Verify payments, approve applications, member IDs.",
          icon: "Wallet",
          badge: counts.pendingMembershipPayments,
        },
        {
          href: "/cms/registration-inbox",
          title: "Event registrations",
          desc: "Registrations from event pages.",
          icon: "ClipboardList",
          badge: counts.unreadRegistrations,
        },
      ],
    },
  ];
}

function formatDashboardDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm", className)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-blue-100/90">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-blue-100/75">{hint}</p> : null}
    </div>
  );
}

function ActionCard({
  href,
  label,
  count,
  description,
  cta,
  tone,
}: {
  href: string;
  label: string;
  count: number;
  description: string;
  cta: string;
  tone: "primary" | "amber";
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200/90 bg-gradient-to-br from-amber-50 to-white ring-amber-100"
      : "border-gcs-primary/20 bg-gradient-to-br from-gcs-primary/[0.04] to-white ring-gcs-primary/10";

  return (
    <Link href={href} className="group block h-full">
      <CmsCard className={cn("h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md", styles)}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <span
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white",
              tone === "amber" ? "bg-amber-600" : "bg-gcs-primary"
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{count}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gcs-primary">
          {cta}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </CmsCard>
    </Link>
  );
}

export type CmsDashboardProps = {
  counts: CmsNotificationCounts;
  stats: CmsDashboardStats;
  degraded: boolean;
};

export function CmsDashboard({ counts, stats, degraded }: CmsDashboardProps) {
  const sections = buildSections(counts);
  const today = formatDashboardDate(new Date());

  const actionItems = [
    counts.unreadContactInquiries > 0
      ? {
          href: "/cms/contact-inquiries",
          label: "Contact messages",
          count: counts.unreadContactInquiries,
          description: "Unread inquiries from the contact form.",
          cta: "Open inbox",
          tone: "primary" as const,
        }
      : null,
    counts.pendingMembershipPayments > 0
      ? {
          href: "/cms/membership",
          label: "Membership payments",
          count: counts.pendingMembershipPayments,
          description: "Applications awaiting payment verification.",
          cta: "Review payments",
          tone: "amber" as const,
        }
      : null,
    counts.unreadRegistrations > 0
      ? {
          href: "/cms/registration-inbox",
          label: "Event registrations",
          count: counts.unreadRegistrations,
          description: "New registrations to review.",
          cta: "Open registration inbox",
          tone: "primary" as const,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      <section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gcs-primary via-[#1e40af] to-[#172554] px-6 py-8 text-white shadow-lg shadow-gcs-primary/20 md:px-8 md:py-10"
        aria-labelledby="dashboard-welcome"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">{today}</p>
            <h1 id="dashboard-welcome" className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Dashboard overview
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-50/90 md:text-[0.9375rem]">
              Manage the Ghana Chemical Society public site. Published changes go live immediately — use{" "}
              <strong className="font-semibold text-white">Visit site</strong> in the header to preview.
            </p>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Preview live site
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[28rem]">
            <StatTile
              label="Needs attention"
              value={counts.totalUnread}
              hint={counts.totalUnread === 1 ? "1 item" : "items"}
            />
            <StatTile label="News live" value={stats.publishedNews} />
            <StatTile label="Events live" value={stats.publishedEvents} />
            <StatTile label="Publications" value={stats.publishedPublications} />
          </div>
        </div>

        <p className="relative mt-6 flex items-center gap-2 text-xs text-blue-100/80">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {stats.publishedHeroSlides} hero slide{stats.publishedHeroSlides === 1 ? "" : "s"} published
        </p>
      </section>

      {degraded ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Some counts could not be loaded right now. You can still edit content — refresh in a moment if needed.
        </p>
      ) : null}

      <section aria-labelledby="action-required-heading">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gcs-primary" aria-hidden />
          <h2 id="action-required-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
            Action required
          </h2>
          {counts.totalUnread > 0 ? (
            <span className="rounded-full bg-gcs-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {counts.totalUnread}
            </span>
          ) : null}
        </div>

        {actionItems.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actionItems.map((item) =>
              item ? (
                <li key={item.href}>
                  <ActionCard {...item} />
                </li>
              ) : null
            )}
          </ul>
        ) : (
          <CmsCard className="flex flex-col items-center border-dashed border-slate-200/90 bg-slate-50/50 py-10 text-center sm:flex-row sm:justify-center sm:gap-4 sm:py-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </span>
            <div className="mt-4 sm:mt-0 sm:text-left">
              <p className="font-semibold text-slate-900">You&apos;re all caught up</p>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                No unread contact messages, pending membership verifications, or event registrations.
              </p>
            </div>
          </CmsCard>
        )}
      </section>

      <CmsDashboardTabs sections={sections} />

      <CmsCard className="border-gcs-border/60 bg-gcs-muted-bg/40 p-5">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Tip:</span> Switch tabs above to see each group of edit areas.
          Items with a blue badge need your attention.
        </p>
      </CmsCard>
    </div>
  );
}
