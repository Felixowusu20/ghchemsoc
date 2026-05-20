"use client";

import { cn } from "@/lib/utils";

export function CmsCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CmsFieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-sm font-medium text-slate-700", className)}>{children}</span>;
}

export function CmsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gcs-foreground shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-gcs-primary focus:ring-2 focus:ring-gcs-primary/15",
        props.className
      )}
    />
  );
}

export function CmsTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-gcs-foreground shadow-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-gcs-primary focus:ring-2 focus:ring-gcs-primary/15",
        props.className
      )}
    />
  );
}

export function CmsButton({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "danger" | "ghost" }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        variant === "primary" && "bg-gcs-primary text-white hover:bg-gcs-primary-hover",
        variant === "danger" && "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
        variant === "ghost" && "border border-gcs-border bg-white text-gcs-foreground hover:bg-neutral-50",
        className
      )}
    >
      {children}
    </button>
  );
}
