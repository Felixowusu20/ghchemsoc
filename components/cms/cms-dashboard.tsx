import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ExternalLink,
  FileText,
  Megaphone,
  PlusCircle,
  Sparkles,
  Users,
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
          href: "/cms/member-portal",
          title: "Member portal",
          desc: "Signed-in member dashboard copy and benefit cards.",
          icon: "Users",
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

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "just now";
  if (diffMs < hour) {
    const m = Math.round(diffMs / minute);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day) {
    const h = Math.round(diffMs / hour);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diffMs < 7 * day) {
    const dd = Math.round(diffMs / day);
    return `${dd} day${dd === 1 ? "" : "s"} ago`;
  }
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/[0.12]",
        className
      )}
    >
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

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Megaphone;
  tone: "blue" | "violet" | "emerald" | "amber";
}) {
  const tones = {
    blue: {
      iconBg: "bg-blue-50 text-blue-700 ring-blue-100",
      hover: "hover:border-blue-200 hover:shadow-blue-200/40",
    },
    violet: {
      iconBg: "bg-violet-50 text-violet-700 ring-violet-100",
      hover: "hover:border-violet-200 hover:shadow-violet-200/40",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      hover: "hover:border-emerald-200 hover:shadow-emerald-200/40",
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-700 ring-amber-100",
      hover: "hover:border-amber-200 hover:shadow-amber-200/40",
    },
  }[tone];

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.02] transition-all hover:-translate-y-0.5 hover:shadow-lg",
        tones.hover
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105",
          tones.iconBg
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gcs-primary" />
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
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
  const now = new Date();
  const today = formatDashboardDate(now);
  const greeting = greetingFor(now);
  const lastSentRelative = formatRelative(stats.latestAnnouncementSentAt);

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
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-400/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 left-1/4 h-32 w-32 rounded-full bg-fuchsia-400/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {today}
            </p>
            <h1
              id="dashboard-welcome"
              className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {greeting}, admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-50/90 md:text-[0.9375rem]">
              Manage the Ghana Chemical Society public site. Published changes go live immediately — use{" "}
              <strong className="font-semibold text-white">Visit site</strong> in the header to preview.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Preview live site
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link
                href="/cms/member-announcements"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gcs-primary shadow-sm transition-colors hover:bg-blue-50"
              >
                <Megaphone className="h-3.5 w-3.5" aria-hidden />
                Compose announcement
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            <StatTile
              label="Needs attention"
              value={counts.totalUnread}
              hint={counts.totalUnread === 1 ? "1 item" : "items"}
            />
            <StatTile
              label="Members"
              value={stats.approvedMembers}
              hint={stats.approvedMembers === 1 ? "approved" : "approved"}
            />
            <StatTile
              label="Bulletins"
              value={stats.sentAnnouncements}
              hint={stats.draftAnnouncements > 0 ? `${stats.draftAnnouncements} draft` : "sent"}
            />
            <StatTile label="News live" value={stats.publishedNews} />
            <StatTile label="Events live" value={stats.publishedEvents} />
            <StatTile label="Publications" value={stats.publishedPublications} />
          </div>
        </div>

        <p className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100/80">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {stats.publishedHeroSlides} hero slide{stats.publishedHeroSlides === 1 ? "" : "s"} published
          </span>
          {lastSentRelative ? (
            <span className="inline-flex items-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Last bulletin sent {lastSentRelative}
            </span>
          ) : null}
        </p>
      </section>

      {degraded ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Some counts could not be loaded right now. You can still edit content — refresh in a moment if needed.
        </p>
      ) : null}

      <section aria-labelledby="quick-actions-heading">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gcs-primary" aria-hidden />
          <h2
            id="quick-actions-heading"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-gcs-muted-text"
          >
            Quick actions
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <QuickAction
              href="/cms/member-announcements"
              title="New bulletin"
              description="Email and post a message to all registered members."
              icon={Megaphone}
              tone="violet"
            />
          </li>
          <li>
            <QuickAction
              href="/cms/news"
              title="Add news article"
              description="Publish a story to the public news feed."
              icon={PlusCircle}
              tone="blue"
            />
          </li>
          <li>
            <QuickAction
              href="/cms/events"
              title="Create event"
              description="Conferences, workshops, and registration forms."
              icon={FileText}
              tone="emerald"
            />
          </li>
          <li>
            <QuickAction
              href="/cms/membership"
              title="Review members"
              description="Verify payments and approve new applications."
              icon={Users}
              tone="amber"
            />
          </li>
        </ul>
      </section>

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
