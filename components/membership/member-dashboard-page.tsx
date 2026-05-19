"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { MemberProfileHero } from "@/components/membership/member-profile-hero";
import { useMemberPortal } from "@/components/membership/member-portal-context";

export function MemberDashboardPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const highlights = portal?.benefits.filter((b) => b.section === "dashboard") ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gcs-muted-text">
          {settings?.dashboardEyebrow ?? "Member area"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">
          {settings?.dashboardTitle ?? "Your GCS portfolio"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
          {settings?.dashboardLead}
        </p>
      </div>

      <MemberProfileHero />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/membership/account/library", label: "My library", desc: "Your links, notes & files" },
          { href: "/membership/account/benefits", label: "Membership benefits", desc: "Programmes & perks" },
          { href: "/membership/account/resources", label: "Resources", desc: "Publications & tools" },
          { href: "/membership/account/payments", label: "Payments", desc: "Dues & receipts" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-gcs-border bg-white p-5 shadow-sm transition hover:border-gcs-primary/30 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gcs-foreground group-hover:text-gcs-primary">{card.label}</p>
            <p className="mt-1 text-xs text-gcs-muted-text">{card.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gcs-primary">
              View
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-gcs-border bg-white p-6 shadow-sm md:p-8"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gcs-foreground">Quick highlights</h3>
            <p className="mt-1 text-sm text-gcs-muted-text">Pinned from your membership benefits</p>
          </div>
          <Link href="/membership/account/benefits" className="text-sm font-semibold text-gcs-primary hover:underline">
            All benefits
          </Link>
        </div>
        <MemberBenefitCards items={highlights} />
      </motion.section>
    </div>
  );
}
