"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Award,
  Bookmark,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Library,
  MoreHorizontal,
  User,
  X,
} from "lucide-react";
import { MemberAnnualStatusBadge } from "@/components/membership/member-annual-status-badge";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/membership/account", label: "Overview", shortLabel: "Home", icon: LayoutDashboard, exact: true, badge: false },
  { href: "/membership/account/inbox", label: "Inbox", shortLabel: "Inbox", icon: Inbox, exact: false, badge: true },
  { href: "/membership/account/benefits", label: "Benefits", shortLabel: "Benefits", icon: Award, exact: false, badge: false },
  { href: "/membership/account/profile", label: "Profile", shortLabel: "Profile", icon: User, exact: false, badge: false },
] as const;

const moreLinks = [
  { href: "/membership/account/resources", label: "Resources", icon: Library },
  { href: "/membership/account/library", label: "My library", icon: Bookmark },
  { href: "/membership/account/payments", label: "Payments", icon: CreditCard },
] as const;

const desktopLinks = [
  ...primaryLinks,
  ...moreLinks.map((l) => ({ ...l, exact: false as const, badge: false as const })),
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function useMemberNavState() {
  const pathname = usePathname();
  const { profile } = useMemberPortal();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/member/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { unreadCount?: number };
      if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  return { pathname, profile, unreadCount };
}

export function MemberPortalSidebar() {
  const { pathname, profile, unreadCount } = useMemberNavState();

  return (
      <nav
        className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_12px_32px_-16px_rgba(15,23,42,0.12)]"
        aria-label="Member area"
      >
        {profile ? (
          <div className="mb-2 px-1 pt-1">
            <MemberAnnualStatusBadge profile={profile} variant="pill" className="w-full" />
          </div>
        ) : null}

        <p className="mb-1.5 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">
          Menu
        </p>
        <ul className="space-y-0.5">
          {desktopLinks.map(({ href, label, icon: Icon, exact, badge }) => {
            const active = isActive(pathname, href, exact);
            const showBadge = badge && unreadCount > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-gcs-primary text-white shadow-md shadow-gcs-primary/25"
                      : "text-gcs-muted-text hover:bg-slate-50 hover:text-gcs-foreground"
                  )}
                >
                  {active ? (
                    <span
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90"
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  <span className="flex-1 truncate">{label}</span>
                  {showBadge ? (
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        active ? "bg-white text-gcs-primary" : "bg-red-500 text-white"
                      )}
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
  );
}

export function MemberPortalTabBar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/member/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data = (await res.json()) as { unreadCount?: number };
      if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

  const moreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  return (
      <div
        ref={moreRef}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.1)] lg:hidden"
        role="navigation"
        aria-label="Member area"
      >
        {moreOpen ? (
          <div className="border-b border-slate-100 bg-slate-50/95 px-3 py-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1.5 text-gcs-muted-text hover:bg-white hover:text-gcs-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {moreLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[11px] font-semibold transition",
                        active
                          ? "border-gcs-primary/30 bg-gcs-primary/5 text-gcs-primary"
                          : "border-slate-200/80 bg-white text-gcs-muted-text hover:border-gcs-primary/20"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="flex items-stretch justify-around px-1 pt-1.5">
          {primaryLinks.map(({ href, label, shortLabel, icon: Icon, exact, badge }) => {
            const active = isActive(pathname, href, exact);
            const showBadge = badge && unreadCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold transition",
                  active ? "text-gcs-primary" : "text-slate-500"
                )}
              >
                {active ? (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gcs-primary" aria-hidden />
                ) : null}
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
                  {showBadge ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">{shortLabel}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold transition",
              moreActive || moreOpen ? "text-gcs-primary" : "text-slate-500"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            {(moreActive || moreOpen) && !moreOpen ? (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gcs-primary" aria-hidden />
            ) : null}
            <MoreHorizontal className="h-5 w-5" strokeWidth={moreOpen ? 2.25 : 2} aria-hidden />
            More
          </button>
        </div>
      </div>
  );
}

/** @deprecated Use MemberPortalSidebar + MemberPortalTabBar */
export function MemberPortalNav() {
  return (
    <>
      <div className="hidden lg:block">
        <MemberPortalSidebar />
      </div>
      <MemberPortalTabBar />
    </>
  );
}

/** Compact membership status — mobile only, above page content. */
export function MemberPortalMobileStatus() {
  const { profile } = useMemberPortal();
  if (!profile) return null;
  return (
    <div className="mb-4 lg:hidden">
      <MemberAnnualStatusBadge profile={profile} variant="pill" className="w-full" />
    </div>
  );
}
