"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { MemberBenefitPublic } from "@/lib/member-portal";
import { memberBenefitIcon } from "@/lib/member-portal";
import { MemberPortalEmptyState } from "@/components/membership/member-portal-ui";

export function MemberBenefitCards({ items }: { items: MemberBenefitPublic[] }) {
  if (items.length === 0) {
    return (
      <MemberPortalEmptyState
        message="No items published in this section yet."
        hint="Check back soon — the secretariat may add programmes and resources here."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item, i) => {
        const Icon = memberBenefitIcon(item.iconKey);
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gcs-primary/12 to-sky-500/8 text-gcs-primary ring-1 ring-gcs-primary/12">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              {item.hint ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gcs-muted-text">
                  {item.hint}
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 break-words text-[15px] font-semibold leading-snug text-gcs-foreground">
              {item.title}
            </h3>
            <p className="mt-2 break-words text-sm leading-relaxed text-gcs-muted-text">{item.description}</p>
            {item.body ? (
              <p className="mt-3 text-sm leading-relaxed text-gcs-foreground/75">{item.body}</p>
            ) : null}
            {item.href ? (
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gcs-primary">
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </>
        );

        const cardClass =
          "group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gcs-primary/20 hover:shadow-[0_12px_32px_-16px_rgba(29,78,216,0.15)]";

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
          >
            {item.href ? (
              <Link href={item.href} className={cardClass}>
                {inner}
              </Link>
            ) : (
              <div className={cardClass}>{inner}</div>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
