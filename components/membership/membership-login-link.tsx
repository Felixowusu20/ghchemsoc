import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const MEMBER_LOGIN_HREF = "/login?role=member";

type Variant = "banner" | "compact" | "inline" | "onDark";

export function membershipLoginHref() {
  return MEMBER_LOGIN_HREF;
}

export function MembershipLoginLink({
  variant = "banner",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "inline" || variant === "onDark") {
    return (
      <Link
        href={MEMBER_LOGIN_HREF}
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold underline-offset-2 transition hover:underline",
          variant === "onDark"
            ? "text-white hover:text-sky-100"
            : "text-gcs-primary hover:text-gcs-primary-hover",
          className
        )}
      >
        Member sign-in
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={MEMBER_LOGIN_HREF}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-gcs-primary/25 bg-white px-5 py-2.5 text-sm font-semibold text-gcs-primary shadow-sm transition hover:border-gcs-primary hover:bg-blue-50/80",
          className
        )}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Member sign-in
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-gcs-primary/20 bg-gradient-to-br from-white via-blue-50/40 to-white p-5 shadow-sm ring-1 ring-gcs-primary/10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6",
        className
      )}
    >
      <div className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gcs-primary text-white shadow-md shadow-blue-600/25">
          <LogIn className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-gcs-foreground">Already a GCS member?</p>
          <p className="mt-1 text-sm leading-relaxed text-gcs-muted-text">
            Sign in with the email and member ID from your approval message to open your portfolio, payments, and
            benefits.
          </p>
        </div>
      </div>
      <Link
        href={MEMBER_LOGIN_HREF}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gcs-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-gcs-primary-hover"
      >
        Go to member login
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
