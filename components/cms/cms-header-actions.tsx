"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, ExternalLink } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import type { CmsNotificationCounts } from "@/lib/cms-notifications";

const empty: CmsNotificationCounts = {
  unreadContactInquiries: 0,
  unreadRegistrations: 0,
  pendingMembershipPayments: 0,
  totalUnread: 0,
};

export function CmsHeaderActions() {
  const [counts, setCounts] = useState<CmsNotificationCounts>(empty);

  const load = useCallback(async () => {
    const res = await fetch("/api/cms/notifications", cmsCredentials);
    if (!res.ok) return;
    setCounts((await res.json()) as CmsNotificationCounts);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-2 text-sm font-semibold text-gcs-foreground shadow-sm transition-colors hover:border-gcs-primary hover:text-gcs-primary"
      >
        Visit site
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </Link>
      <Link
        href="/cms"
        className="relative inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-2 text-sm font-semibold text-gcs-foreground shadow-sm transition-colors hover:border-gcs-primary hover:text-gcs-primary"
        aria-label={counts.totalUnread ? `${counts.totalUnread} unread notifications` : "Notifications"}
      >
        <Bell className="h-4 w-4 text-gcs-primary" aria-hidden />
        Notifications
        {counts.totalUnread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gcs-primary px-1.5 text-[0.65rem] font-bold text-white">
            {counts.totalUnread > 99 ? "99+" : counts.totalUnread}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
