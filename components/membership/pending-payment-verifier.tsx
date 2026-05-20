"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  applicationId: string;
  reference: string;
};

/** If Paystack redirects here with a reference, verify payment server-side. */
export function PendingPaymentVerifier({ applicationId, reference }: Props) {
  const [status, setStatus] = useState<"idle" | "verifying" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("verifying");

    void (async () => {
      try {
        const res = await fetch(
          `/api/public/membership-applications/${applicationId}/pay/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
          }
        );
        const body = (await res.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
          error?: string;
        } | null;
        if (cancelled) return;
        if (res.ok && body?.ok) {
          setStatus("done");
          setMessage(body.message ?? "Your payment has been recorded.");
        } else if (res.status === 402) {
          setStatus("error");
          setMessage(body?.error ?? "We could not confirm this payment yet. The secretariat will review it manually.");
        } else {
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applicationId, reference]);

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm",
        status === "error"
          ? "border-amber-200/90 bg-amber-50/80 text-amber-950"
          : status === "done"
            ? "border-emerald-200/90 bg-emerald-50/80 text-emerald-900"
            : "border-sky-200/90 bg-sky-50/80 text-sky-900"
      )}
      role="status"
    >
      {status === "verifying" ? (
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" aria-hidden />
      ) : status === "done" ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      )}
      <div>
        <p className="font-semibold">
          {status === "verifying"
            ? "Confirming your payment…"
            : status === "done"
              ? "Payment recorded"
              : "Manual review may be needed"}
        </p>
        {message ? <p className="mt-1 leading-relaxed opacity-90">{message}</p> : null}
      </div>
    </div>
  );
}
