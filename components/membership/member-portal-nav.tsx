"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Bookmark, CreditCard, LayoutDashboard, Library, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/membership/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/membership/account/benefits", label: "Benefits", icon: Award, exact: false },
  { href: "/membership/account/resources", label: "Resources", icon: Library, exact: false },
  { href: "/membership/account/library", label: "My library", icon: Bookmark, exact: false },
  { href: "/membership/account/profile", label: "My profile", icon: User, exact: false },
  { href: "/membership/account/payments", label: "Payments", icon: CreditCard, exact: false },
] as const;

export function MemberPortalNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col gap-1 rounded-2xl border border-gcs-border bg-white p-2 shadow-sm"
      aria-label="Member area"
    >
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
