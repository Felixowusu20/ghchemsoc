"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MemberBenefitPublic } from "@/lib/member-portal";
import { memberBenefitIcon } from "@/lib/member-portal";

export function MemberBenefitCards({ items }: { items: MemberBenefitPublic[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gcs-border bg-neutral-50/80 px-6 py-12 text-center text-sm text-gcs-muted-text">
        No items published in this section yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = memberBenefitIcon(item.iconKey);
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary ring-1 ring-gcs-primary/15">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              {item.hint ? (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gcs-muted-text">
                  {item.hint}
                </span>
              ) : null}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gcs-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text">{item.description}</p>
            {item.body ? <p className="mt-3 text-sm leading-relaxed text-gcs-foreground/80">{item.body}</p> : null}
            {item.href ? (
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gcs-primary">
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-xl border border-gcs-border/60 bg-white p-5 shadow-sm transition hover:border-gcs-primary/25 hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex h-full flex-col rounded-xl border border-gcs-border/60 bg-white p-5 shadow-sm">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
