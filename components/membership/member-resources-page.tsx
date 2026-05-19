"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { useMemberPortal } from "@/components/membership/member-portal-context";

export function MemberResourcesPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const items = portal?.benefits.filter((b) => b.section === "resources") ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Library className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">
            {settings?.resourcesTitle ?? "Members-only resources"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
            {settings?.resourcesLead}
          </p>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gcs-border bg-white p-6 shadow-sm md:p-8"
      >
        <MemberBenefitCards items={items} />
      </motion.section>
    </div>
  );
}
