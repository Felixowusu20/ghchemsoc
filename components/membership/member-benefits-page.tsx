"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { useMemberPortal } from "@/components/membership/member-portal-context";

export function MemberBenefitsPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const items = portal?.benefits.filter((b) => b.section === "benefits") ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
          <Award className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">
            {settings?.benefitsTitle ?? "Membership benefits"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
            {settings?.benefitsLead}
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
