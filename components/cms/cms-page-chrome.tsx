"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CmsPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        {Icon ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gcs-primary/10 text-gcs-primary ring-1 ring-gcs-primary/10">
            <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gcs-muted-text">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-[1.65rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CmsSectionHeading({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-gcs-primary">
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold text-gcs-foreground">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-gcs-muted-text">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CmsMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "neutral";
}) {
  const styles = {
    default: "border-slate-200/90 bg-white",
    warning: "border-amber-200/70 bg-amber-50/40",
    success: "border-emerald-200/70 bg-emerald-50/30",
    neutral: "border-slate-200/90 bg-slate-50/50",
  };
  const iconStyles = {
    default: "bg-gcs-primary/10 text-gcs-primary",
    warning: "bg-amber-100 text-amber-800",
    success: "bg-emerald-100 text-emerald-700",
    neutral: "bg-slate-100 text-slate-600",
  };

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", styles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gcs-muted-text">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-gcs-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-gcs-muted-text">{hint}</p> : null}
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconStyles[variant])}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </div>
  );
}

export function CmsWelcomeBanner({
  greeting,
  dateLabel,
  children,
}: {
  greeting: string;
  dateLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gcs-primary/15 bg-gradient-to-r from-gcs-primary/[0.06] via-white to-sky-50/40 p-6 shadow-sm md:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gcs-muted-text">{dateLabel}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">{greeting}</h1>
      {children}
    </section>
  );
}
