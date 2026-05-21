"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGhs } from "@/lib/membership-application";
import {
  membershipPaymentMethodLabel,
  PAYMENT_METHOD_GROUPS,
  paystackChannels,
  requiresPayerPhone,
  type MembershipPaymentMethodId,
  ussdHintForMethod,
} from "@/lib/membership-payment-methods";
import { loadPaystackInline, openPaystackCheckout } from "@/lib/paystack-inline";

type Props = {
  open: boolean;
  applicationId: string;
  amountGhs: number;
  email: string;
  onClose: () => void;
  onSuccess: (payload: { paystackReference: string; message: string; paymentMethod: string }) => void;
};

type PayInitResponse = {
  ok?: boolean;
  flow?: "popup" | "bank_transfer";
  reference?: string;
  publicKey?: string;
  email?: string;
  amountPesewas?: number;
  currency?: string;
  channels?: string[];
  paymentMethod?: string;
  mode?: "test" | "live" | null;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  accountExpiresAt?: string;
  displayText?: string;
  error?: string;
};

type BankTransferDetails = {
  reference: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountExpiresAt: string;
  displayText?: string;
};

async function parseJsonResponse<T>(res: Response): Promise<T | null> {
  const raw = await res.text();
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function MembershipPaymentModal({
  open,
  applicationId,
  amountGhs,
  email,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<"choose" | "confirm" | "bank_transfer">("choose");
  const [method, setMethod] = useState<MembershipPaymentMethodId | null>(null);
  const [payerPhone, setPayerPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paystackReady, setPaystackReady] = useState(false);
  const [paystackMode, setPaystackMode] = useState<"test" | "live" | null>(null);
  const [bankTransfer, setBankTransfer] = useState<BankTransferDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void loadPaystackInline()
      .then(() => {
        if (!cancelled) setPaystackReady(true);
      })
      .catch(() => {
        if (!cancelled) setPaystackReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const resetAndClose = useCallback(() => {
    if (busy) return;
    stopPolling();
    setStep("choose");
    setMethod(null);
    setPayerPhone("");
    setErr(null);
    setPaystackMode(null);
    setBankTransfer(null);
    setCopied(false);
    onClose();
  }, [busy, onClose, stopPolling]);

  if (!open) return null;

  function pickMethod(id: MembershipPaymentMethodId) {
    setMethod(id);
    setStep("confirm");
    setErr(null);
    setBankTransfer(null);
  }

  async function verifyPaystackPayment(reference: string, paymentMethod: string) {
    const res = await fetch(
      `/api/public/membership-applications/${applicationId}/pay/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      }
    );
    const body = await parseJsonResponse<{
      ok?: boolean;
      paystackReference?: string;
      message?: string;
      error?: string;
      paymentMethod?: string;
    }>(res);

    if (res.status === 402) {
      return { ok: false as const, pending: true };
    }

    if (!res.ok || !body?.ok) {
      throw new Error(body?.error ?? "Payment verification failed.");
    }

    return {
      ok: true as const,
      pending: false,
      paystackReference: body.paystackReference ?? reference,
      message: body.message ?? "Payment received.",
      paymentMethod: body.paymentMethod ?? paymentMethod,
    };
  }

  function startBankTransferPolling(reference: string, paymentMethod: string) {
    stopPolling();
    setPolling(true);

    const tick = async () => {
      try {
        const result = await verifyPaystackPayment(reference, paymentMethod);
        if (result.ok) {
          stopPolling();
          setBusy(false);
          onSuccess({
            paystackReference: result.paystackReference,
            message: result.message,
            paymentMethod: result.paymentMethod,
          });
        }
      } catch (e) {
        stopPolling();
        setBusy(false);
        setErr(e instanceof Error ? e.message : "Could not verify payment.");
      }
    };

    void tick();
    pollRef.current = setInterval(() => void tick(), 8000);
  }

  async function submitPaystackPopup(init: PayInitResponse, paymentMethod: MembershipPaymentMethodId) {
    if (!init.reference || !init.publicKey || !init.amountPesewas) {
      throw new Error("Could not start Paystack checkout.");
    }

    setPaystackMode(init.mode ?? null);
    await loadPaystackInline();

    const channels = init.channels ?? paystackChannels(paymentMethod);
    const reference = init.reference;

    return new Promise<void>((resolve, reject) => {
      let completed = false;
      try {
        const handler = openPaystackCheckout({
          key: init.publicKey!,
          email: init.email ?? email,
          amount: init.amountPesewas!,
          currency: init.currency ?? "GHS",
          ref: reference,
          channels,
          metadata: {
            applicationId,
            paymentMethod,
          },
          callback: (response) => {
            completed = true;
            void (async () => {
              try {
                const result = await verifyPaystackPayment(response.reference, paymentMethod);
                if (result.ok) {
                  onSuccess({
                    paystackReference: result.paystackReference,
                    message: result.message,
                    paymentMethod: result.paymentMethod,
                  });
                  resolve();
                } else {
                  reject(new Error("Payment not confirmed yet. Try again in a moment."));
                }
              } catch (e) {
                reject(e);
              }
            })();
          },
          onClose: () => {
            if (!completed) {
              reject(new Error("Payment window closed before completion."));
            }
          },
        });
        handler.openIframe();
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Could not open Paystack."));
      }
    });
  }

  async function submitPayment() {
    if (!method) return;
    setErr(null);

    if (requiresPayerPhone(method)) {
      const digits = payerPhone.replace(/\D/g, "");
      if (digits.length < 9) {
        setErr("Enter the phone number linked to your wallet or USSD account.");
        return;
      }
    }

    if (method !== "bank_transfer" && !paystackReady) {
      setErr("Loading secure checkout… try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      const initRes = await fetch(
        `/api/public/membership-applications/${applicationId}/pay/init`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethod: method,
            ...(requiresPayerPhone(method) ? { payerPhone } : {}),
          }),
        }
      );
      const init = await parseJsonResponse<PayInitResponse>(initRes);

      if (!initRes.ok || !init?.ok || !init.reference) {
        throw new Error(init?.error ?? "Could not start payment.");
      }

      if (init.flow === "bank_transfer" && init.accountNumber) {
        setPaystackMode(init.mode ?? null);
        setBankTransfer({
          reference: init.reference,
          accountName: init.accountName ?? "Paystack",
          accountNumber: init.accountNumber,
          bankName: init.bankName ?? "Bank",
          accountExpiresAt: init.accountExpiresAt ?? "",
          displayText: init.displayText,
        });
        setStep("bank_transfer");
        setBusy(false);
        startBankTransferPolling(init.reference, init.paymentMethod ?? method);
        return;
      }

      await submitPaystackPopup(init, method);
      setBusy(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment could not be completed.";
      if (message !== "Payment window closed before completion.") {
        setErr(message);
      }
      setBusy(false);
      stopPolling();
    }
  }

  async function checkBankTransferNow() {
    if (!bankTransfer || !method) return;
    setErr(null);
    setBusy(true);
    try {
      const result = await verifyPaystackPayment(bankTransfer.reference, method);
      if (result.ok) {
        stopPolling();
        onSuccess({
          paystackReference: result.paystackReference,
          message: result.message,
          paymentMethod: result.paymentMethod,
        });
      } else {
        setErr("Transfer not detected yet. Pay the exact amount to the account below, then check again.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not verify payment.");
    } finally {
      setBusy(false);
    }
  }

  async function copyAccountNumber() {
    if (!bankTransfer) return;
    try {
      await navigator.clipboard.writeText(bankTransfer.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const expiresLabel =
    bankTransfer?.accountExpiresAt &&
    !Number.isNaN(new Date(bankTransfer.accountExpiresAt).getTime())
      ? new Date(bankTransfer.accountExpiresAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const confirmLabel =
    step === "bank_transfer"
      ? "Check payment status"
      : method === "bank_transfer"
        ? "Get transfer account"
        : "Pay with Paystack";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-[#011B33] px-5 py-4 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Paystack · Secure checkout
            </p>
            <h2 id="payment-title" className="text-lg font-semibold">
              {step === "choose"
                ? "Choose payment method"
                : step === "bank_transfer"
                  ? "Bank transfer"
                  : membershipPaymentMethodLabel(method)}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={busy}
            className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Amount due</p>
            <p className="text-2xl font-bold tracking-tight text-slate-700">{formatGhs(amountGhs)}</p>
            <p className="mt-1 text-xs text-slate-500">Annual membership · {email}</p>
          </div>

          {step === "choose" ? (
            <div className="mt-5 space-y-5">
              {PAYMENT_METHOD_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-semibold text-slate-700">{group.title}</p>
                  <p className="text-xs text-slate-500">{group.subtitle}</p>
                  <ul className="mt-2 space-y-2">
                    {group.methods.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => pickMethod(m.id)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#011B33]/40 hover:bg-sky-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011B33]/30"
                        >
                          <span>{m.label}</span>
                          {m.detail ? (
                            <span className="shrink-0 font-mono text-[11px] text-slate-400">{m.detail}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : step === "bank_transfer" && bankTransfer ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border-2 border-[#011B33]/20 bg-sky-50/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 className="h-4 w-4 text-[#011B33]" aria-hidden />
                  Transfer to this Paystack account
                </p>
                {bankTransfer.displayText ? (
                  <p className="mt-2 text-xs text-slate-600">{bankTransfer.displayText}</p>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Use instant transfer (GIP) from your bank app or MoMo. Pay exactly {formatGhs(amountGhs)} — we
                    confirm automatically when Paystack receives it.
                  </p>
                )}
                {paystackMode === "test" ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
                    <strong>Test mode:</strong> You cannot send real money to this number. Open{" "}
                    <a
                      href="https://demobank.paystackintegrations.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#011B33] underline"
                    >
                      Paystack Demo Bank
                    </a>
                    , transfer exactly {formatGhs(amountGhs)} to the account above (bank may show as &quot;Test
                    Bank&quot;), then wait for auto-confirmation or tap Check payment status.
                  </p>
                ) : null}
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank</dt>
                    <dd className="font-medium text-slate-700">{bankTransfer.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account name</dt>
                    <dd className="font-medium text-slate-700">{bankTransfer.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account number</dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-lg font-bold tracking-wide text-[#011B33]">
                        {bankTransfer.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyAccountNumber()}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium hover:border-[#011B33]/30"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden />
                            Copy
                          </>
                        )}
                      </button>
                    </dd>
                  </div>
                  {expiresLabel ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expires</dt>
                      <dd className="text-slate-600">{expiresLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              {polling ? (
                <p className="flex items-center gap-2 text-xs text-emerald-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Waiting for your transfer… checking every few seconds.
                </p>
              ) : null}
            </div>
          ) : method ? (
            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={() => {
                  stopPolling();
                  setStep("choose");
                  setMethod(null);
                  setBankTransfer(null);
                  setErr(null);
                }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#011B33] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Change method
              </button>

              {method === "bank_transfer" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Paystack will generate a one-time account number for this payment. Transfer the exact amount from
                    your bank or MoMo — no manual reference entry; verification is automatic.
                  </p>
                </div>
              ) : null}

              {method === "debit_credit_card" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CreditCard className="h-4 w-4 text-[#011B33]" aria-hidden />
                    Visa · Mastercard
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    You will complete card payment securely in the Paystack window.
                  </p>
                </div>
              ) : null}

              {method === "ussd" || method.startsWith("mobile_money_") ? (
                <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                  {ussdHintForMethod(method)}
                </p>
              ) : null}

              {requiresPayerPhone(method) ? (
                <div>
                  <label htmlFor="pay-phone" className="mb-2 block text-sm font-medium text-slate-600">
                    {method === "ussd" ? "Phone number (USSD wallet)" : "Mobile money number"}
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm focus-within:border-[#011B33] focus-within:ring-2 focus-within:ring-[#011B33]/20">
                    <span className="flex w-11 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#011B33]">
                      <Smartphone className="h-4 w-4" aria-hidden />
                    </span>
                    <input
                      id="pay-phone"
                      type="tel"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="024 XXX XXXX"
                      className="min-w-0 flex-1 border-0 bg-white px-3 py-3 text-[15px] outline-none"
                      disabled={busy}
                    />
                  </div>
                </div>
              ) : null}

              <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {paystackMode === "test"
                  ? "Paystack test mode — use test payment details only; no real money is charged."
                  : paystackMode === "live"
                    ? "Payments are processed securely by Paystack and verified automatically."
                    : "Payments are processed by Paystack."}
              </p>
            </div>
          ) : null}

          {err ? <p className="mt-4 text-sm font-medium text-red-600">{err}</p> : null}
        </div>

        {(step === "confirm" || step === "bank_transfer") && method ? (
          <div className="shrink-0 border-t border-slate-100 p-5 pt-0">
            <Button
              type="button"
              disabled={
                busy ||
                (step === "confirm" && method !== "bank_transfer" && !paystackReady)
              }
              onClick={() =>
                step === "bank_transfer" ? void checkBankTransferNow() : void submitPayment()
              }
              className="h-12 w-full rounded-xl bg-[#011B33] text-base font-semibold text-white hover:bg-[#022a4d]"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
