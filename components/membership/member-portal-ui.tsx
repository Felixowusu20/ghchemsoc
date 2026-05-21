"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared page chrome for member portfolio routes. */
export function MemberPortalPageHeader({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-inset",
            iconClassName ?? "bg-gcs-primary/10 text-gcs-primary ring-gcs-primary/10"
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 pt-0.5">
          <h1 className="break-words text-xl font-semibold tracking-tight text-gcs-foreground sm:text-2xl lg:text-[1.65rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function MemberPortalPanel({
  children,
  className,
  noPadding,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.1)]",
        !noPadding && "p-5 sm:p-6 md:p-8",
        className
      )}
    >
      {children}
    </section>
  );
}

export function MemberPortalEmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <p className="text-sm font-medium text-gcs-foreground">{message}</p>
      {hint ? <p className="mt-2 text-sm text-gcs-muted-text">{hint}</p> : null}
    </div>
  );
}

export function MemberPortalEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gcs-muted-text sm:text-[11px]">
      {children}
    </p>
  );
}
