"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Award, Bookmark, CreditCard, Inbox, LayoutDashboard, Library, User } from "lucide-react";
import { MemberAnnualStatusBadge } from "@/components/membership/member-annual-status-badge";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "/membership/account", label: "Overview", icon: LayoutDashboard, exact: true, badge: false },
  { href: "/membership/account/inbox", label: "Inbox", icon: Inbox, exact: false, badge: true },
  { href: "/membership/account/benefits", label: "Benefits", icon: Award, exact: false, badge: false },
  { href: "/membership/account/resources", label: "Resources", icon: Library, exact: false, badge: false },
  { href: "/membership/account/library", label: "My library", icon: Bookmark, exact: false, badge: false },
  { href: "/membership/account/profile", label: "My profile", icon: User, exact: false, badge: false },
  { href: "/membership/account/payments", label: "Payments", icon: CreditCard, exact: false, badge: false },
] as const;

export function MemberPortalNav() {
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
      /* ignore — surface a 0 badge */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread, pathname]);

  return (
    <nav
      className="flex flex-col gap-1 rounded-2xl border border-gcs-border bg-white p-2 shadow-sm lg:max-w-none"
      aria-label="Member area"
    >
      {profile ? (
        <div className="mb-1 shrink-0 px-1 pt-1 lg:mb-1">
          <MemberAnnualStatusBadge profile={profile} variant="pill" />
        </div>
      ) : null}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const showBadge = badge && unreadCount > 0;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:shrink lg:gap-3",
              active
                ? "bg-gcs-primary text-white shadow-sm shadow-gcs-primary/20"
                : "text-gcs-muted-text hover:bg-neutral-50 hover:text-gcs-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap lg:flex-1 lg:truncate">{label}</span>
            {showBadge ? (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  active ? "bg-white text-gcs-primary" : "bg-red-500 text-white"
                )}
                aria-label={`${unreadCount} unread`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
