"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  Bookmark,
  CreditCard,
  Library,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { MemberPortalEyebrow, MemberPortalPanel } from "@/components/membership/member-portal-ui";
import { MemberProfileHero } from "@/components/membership/member-profile-hero";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import { cn } from "@/lib/utils";

const quickLinks: {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    href: "/membership/account/library",
    label: "My library",
    desc: "Links, notes & files",
    icon: Bookmark,
    accent: "from-violet-500/10 to-violet-600/5 text-violet-700 ring-violet-500/15",
  },
  {
    href: "/membership/account/benefits",
    label: "Benefits",
    desc: "Programmes & perks",
    icon: Award,
    accent: "from-amber-500/10 to-amber-600/5 text-amber-800 ring-amber-500/15",
  },
  {
    href: "/membership/account/resources",
    label: "Resources",
    desc: "Publications & tools",
    icon: Library,
    accent: "from-emerald-500/10 to-emerald-600/5 text-emerald-800 ring-emerald-500/15",
  },
  {
    href: "/membership/account/payments",
    label: "Payments",
    desc: "Dues & receipts",
    icon: CreditCard,
    accent: "from-sky-500/10 to-sky-600/5 text-sky-800 ring-sky-500/15",
  },
];

export function MemberDashboardPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const highlights = portal?.benefits.filter((b) => b.section === "dashboard") ?? [];

  return (
    <div className="space-y-7 sm:space-y-9">
      <div className="min-w-0">
        <MemberPortalEyebrow>{settings?.dashboardEyebrow ?? "Member area"}</MemberPortalEyebrow>
        <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-gcs-foreground sm:text-3xl">
          {settings?.dashboardTitle ?? "Your GCS portfolio"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gcs-muted-text md:text-[15px]">
          {settings?.dashboardLead}
        </p>
      </div>

      <MemberProfileHero />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {quickLinks.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
          >
            <Link
              href={card.href}
              className="group flex min-h-[104px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gcs-primary/25 hover:shadow-[0_8px_28px_-12px_rgba(29,78,216,0.2)]"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1",
                  card.accent
                )}
              >
                <card.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="mt-4">
                <p className="text-sm font-semibold text-gcs-foreground group-hover:text-gcs-primary">
                  {card.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gcs-muted-text">{card.desc}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gcs-primary">
                Open
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
      >
        <MemberPortalPanel>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gcs-foreground">Quick highlights</h3>
              <p className="mt-1 text-sm text-gcs-muted-text">Pinned from your membership benefits</p>
            </div>
            <Link
              href="/membership/account/benefits"
              className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-gcs-primary/10 px-4 text-sm font-semibold text-gcs-primary transition hover:bg-gcs-primary/15 sm:min-h-0"
            >
              All benefits
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <MemberBenefitCards items={highlights} />
        </MemberPortalPanel>
      </motion.div>
    </div>
  );
}
