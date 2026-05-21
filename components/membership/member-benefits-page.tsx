"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { MemberBenefitCards } from "@/components/membership/member-benefit-cards";
import { MemberPortalPageHeader, MemberPortalPanel } from "@/components/membership/member-portal-ui";
import { useMemberPortal } from "@/components/membership/member-portal-context";

export function MemberBenefitsPage() {
  const { portal } = useMemberPortal();
  const settings = portal?.settings;
  const items = portal?.benefits.filter((b) => b.section === "benefits") ?? [];

  return (
    <div className="space-y-7 sm:space-y-9">
      <MemberPortalPageHeader
        icon={Award}
        iconClassName="bg-gcs-primary/10 text-gcs-primary ring-gcs-primary/10"
        title={settings?.benefitsTitle ?? "Membership benefits"}
        description={settings?.benefitsLead}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <MemberPortalPanel>
          <MemberBenefitCards items={items} />
        </MemberPortalPanel>
      </motion.div>
    </div>
  );
}
