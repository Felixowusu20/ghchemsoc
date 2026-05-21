"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { MemberPortalPageHeader, MemberPortalPanel } from "@/components/membership/member-portal-ui";
import { useMemberPortal } from "@/components/membership/member-portal-context";

export function MemberResourcesPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const items = portal?.benefits.filter((b) => b.section === "resources") ?? [];

  return (
    <div className="space-y-7 sm:space-y-9">
      <MemberPortalPageHeader
        icon={Library}
        iconClassName="bg-emerald-50 text-emerald-700 ring-emerald-500/15"
        title={settings?.resourcesTitle ?? "Members-only resources"}
        description={settings?.resourcesLead}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <MemberPortalPanel>
          <MemberBenefitCards items={items} />
        </MemberPortalPanel>
      </motion.div>
    </div>
  );
}
