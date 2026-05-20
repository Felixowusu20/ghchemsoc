"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ImageIcon,
  FileText,
  Users,
  Newspaper,
  BookOpen,
  Calendar,
  ClipboardList,
  MessageCircle,
  Inbox,
  Wallet,
  House,
  Handshake,
  PanelBottom,
  UserCircle,
  Megaphone,
  Menu,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { CmsLogoutButton } from "@/components/cms/cms-logout";
import { CmsNavBadge, useCmsNotificationCounts } from "@/components/cms/cms-nav-badges";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: "contact" | "registrations" | "membership" | "total";
};

type NavGroup = {
  id: string;
  label: string;
  description?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/cms", label: "Overview", icon: LayoutDashboard, badge: "total" },
      { href: "/cms/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    id: "site",
    label: "Public site",
    description: "Pages visible to everyone.",
    items: [
      { href: "/cms/homepage-explore", label: "Homepage · mission", icon: House },
      { href: "/cms/hero", label: "Hero", icon: ImageIcon },
      { href: "/cms/about", label: "About", icon: FileText },
      { href: "/cms/join", label: "Join / membership", icon: Users },
      { href: "/cms/partnerships", label: "Partnerships", icon: Handshake },
      { href: "/cms/news", label: "News", icon: Newspaper },
      { href: "/cms/publications", label: "Publications", icon: BookOpen },
      { href: "/cms/events", label: "Events", icon: Calendar },
      { href: "/cms/site-footer", label: "Site footer", icon: PanelBottom },
      { href: "/cms/contact", label: "Contact page", icon: MessageCircle },
    ],
  },
  {
    id: "members",
    label: "Members & community",
    description: "Approvals, portal copy, and resources shared only with registered members.",
    items: [
      { href: "/cms/membership", label: "Membership approvals", icon: Wallet, badge: "membership" },
      { href: "/cms/member-announcements", label: "Member announcements", icon: Megaphone },
      { href: "/cms/member-portal", label: "Member portal", icon: UserCircle },
    ],
  },
  {
    id: "inbox",
    label: "Inboxes",
    description: "Messages and registrations that need a reply.",
    items: [
      { href: "/cms/registration-inbox", label: "Event registrations", icon: ClipboardList, badge: "registrations" },
      { href: "/cms/contact-inquiries", label: "Contact messages", icon: Inbox, badge: "contact" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [{ href: "/cms/settings", label: "Settings", icon: Settings }],
  },
];

function isNavActive(href: string, pathname: string) {
  if (href === "/cms") return pathname === "/cms";
  if (href === "/cms/contact") return pathname === "/cms/contact";
  if (href === "/cms/homepage-explore") return pathname === "/cms/homepage-explore";
  if (href === "/cms/settings") return pathname === "/cms/settings";
  if (href === "/cms/analytics") return pathname === "/cms/analytics";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function badgeCount(badge: NavItem["badge"], counts: ReturnType<typeof useCmsNotificationCounts>["counts"]) {
  if (badge === "contact") return counts.unreadContactInquiries;
  if (badge === "registrations") return counts.unreadRegistrations;
  if (badge === "membership") return counts.pendingMembershipPayments;
  if (badge === "total") return counts.totalUnread;
  return 0;
}

export function CmsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { counts } = useCmsNotificationCounts();

  const linkCls = (href: string) => {
    const active = isNavActive(href, pathname);
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-gcs-primary/10 text-gcs-primary shadow-sm"
        : "text-gcs-muted-text hover:bg-neutral-50 hover:text-gcs-foreground"
    }`;
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-gcs-border bg-white text-gcs-foreground shadow-md md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-gcs-border bg-white px-3 pb-6 pt-16 shadow-xl transition-transform md:static md:translate-x-0 md:pt-8 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gcs-primary">GCS</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-gcs-foreground">Admin</p>
          <p className="mt-1 text-xs leading-snug text-gcs-muted-text">Marketing &amp; content</p>
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-1">
          {navGroups.map((group, groupIndex) => (
            <div key={group.id} className={groupIndex === 0 ? "" : "border-t border-gcs-border/40 pt-3"}>
              {group.id === "overview" ? null : (
                <div className="px-3 pb-2">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gcs-muted-text/80">
                    {group.label}
                  </p>
                  {group.description ? (
                    <p className="mt-0.5 text-[0.7rem] leading-snug text-gcs-muted-text/70">{group.description}</p>
                  ) : null}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon: Icon, badge }) => (
                  <Link key={href} href={href} className={linkCls(href)} onClick={() => setOpen(false)}>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isNavActive(href, pathname) ? "text-gcs-primary" : "text-gcs-muted-text"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    <CmsNavBadge count={badgeCount(badge, counts)} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-gcs-border/60 pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gcs-primary transition-colors hover:bg-gcs-primary/5"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
            Visit live site
          </Link>
          <CmsLogoutButton />
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-gcs-foreground/25 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
