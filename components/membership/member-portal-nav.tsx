"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Award, Bookmark, CreditCard, Inbox, LayoutDashboard, Library, User } from "lucide-react";
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
      className="flex flex-col gap-1 rounded-2xl border border-gcs-border bg-white p-2 shadow-sm"
      aria-label="Member area"
    >
      {links.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const showBadge = badge && unreadCount > 0;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gcs-primary text-white shadow-sm shadow-gcs-primary/20"
                : "text-gcs-muted-text hover:bg-neutral-50 hover:text-gcs-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1 truncate">{label}</span>
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
    </nav>
  );
}
