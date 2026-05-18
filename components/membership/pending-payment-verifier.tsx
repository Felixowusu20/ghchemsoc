"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
        const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null;
        if (cancelled) return;
        if (res.ok && body?.ok) {
          setStatus("done");
          setMessage(body.message ?? "Payment confirmed.");
        } else if (res.status === 402) {
          setStatus("error");
          setMessage(body?.error ?? "Payment was not completed.");
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
    <p
      className={`mt-4 flex items-center justify-center gap-2 text-sm ${
        status === "error" ? "text-red-700" : "text-emerald-800"
      }`}
    >
      {status === "verifying" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Confirming your payment…
        </>
      ) : (
        (message ?? (status === "done" ? "Payment confirmed." : "Could not confirm payment."))
      )}
    </p>
  );
}
