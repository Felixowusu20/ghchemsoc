"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  Lock,
  ShieldCheck,
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
import { cn } from "@/lib/utils";

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

function methodIcon(id: MembershipPaymentMethodId) {
  if (id === "bank_transfer") return Building2;
  return Smartphone;
}

const STEP_LABELS = {
  choose: "Payment method",
  confirm: "Review & pay",
  bank_transfer: "Transfer details",
} as const;

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
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
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
        : "Continue to Paystack";

  const stepIndex = step === "choose" ? 0 : step === "confirm" ? 1 : 2;
  const showFooter = (step === "confirm" || step === "bank_transfer") && method;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-950/60 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden bg-white shadow-2xl",
          "max-h-[min(96dvh,100%)] rounded-t-[1.35rem] sm:max-h-[min(90vh,720px)] sm:max-w-lg sm:rounded-2xl sm:ring-1 sm:ring-slate-200"
        )}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-gcs-primary via-blue-700 to-blue-800 px-4 pb-5 pt-4 text-white sm:px-5 sm:pt-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Secure checkout · Paystack
              </p>
              <h2 id="payment-title" className="mt-1.5 break-words text-lg font-semibold tracking-tight sm:text-xl">
                {step === "choose"
                  ? "Complete your membership payment"
                  : step === "bank_transfer"
                    ? "Bank transfer"
                    : membershipPaymentMethodLabel(method)}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  Amount due
                </p>
                <p className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">{formatGhs(amountGhs)}</p>
                <p className="mt-1 truncate text-xs text-white/80">Annual membership · {email}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Banknote className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="relative mt-4 flex gap-1.5" aria-label="Checkout progress">
            {(["Method", "Review", "Pay"] as const).map((label, i) => (
              <div key={label} className="flex min-w-0 flex-1 flex-col gap-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i <= stepIndex ? "bg-white" : "bg-white/25"
                  )}
                />
                <span
                  className={cn(
                    "truncate text-[9px] font-semibold uppercase tracking-wide",
                    i <= stepIndex ? "text-white" : "text-white/50"
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          <p className="mb-4 text-xs font-medium text-slate-500">{STEP_LABELS[step]}</p>

          {step === "choose" ? (
            <div className="space-y-6">
              {PAYMENT_METHOD_GROUPS.map((group) => (
                <section key={group.id}>
                  <h3 className="text-sm font-semibold text-gcs-foreground">{group.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-gcs-muted-text">{group.subtitle}</p>
                  <ul className="mt-3 space-y-2.5">
                    {group.methods.map((m) => {
                      const Icon = methodIcon(m.id);
                      return (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => pickMethod(m.id)}
                            className="group flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-left shadow-sm transition active:scale-[0.99] hover:border-gcs-primary/35 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcs-primary/30"
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary ring-1 ring-gcs-primary/10 transition group-hover:bg-gcs-primary/15">
                              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-gcs-foreground">{m.label}</span>
                              {m.detail ? (
                                <span className="mt-0.5 block text-xs text-gcs-muted-text">{m.detail}</span>
                              ) : null}
                            </span>
                            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-gcs-primary" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : step === "bank_transfer" && bankTransfer ? (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-gcs-primary/20 bg-gradient-to-br from-blue-50/80 to-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-gcs-foreground">
                  <Building2 className="h-5 w-5 text-gcs-primary" aria-hidden />
                  Transfer to this account
                </p>
                {bankTransfer.displayText ? (
                  <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text">{bankTransfer.displayText}</p>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text">
                    Pay exactly <strong className="text-gcs-foreground">{formatGhs(amountGhs)}</strong> via instant
                    transfer from your bank or MoMo. We confirm automatically when Paystack receives it.
                  </p>
                )}

                {paystackMode === "test" ? (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                    <strong>Test mode:</strong> Use{" "}
                    <a
                      href="https://demobank.paystackintegrations.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gcs-primary underline"
                    >
                      Paystack Demo Bank
                    </a>{" "}
                    to simulate a transfer of {formatGhs(amountGhs)}.
                  </p>
                ) : null}

                <dl className="mt-5 space-y-4 rounded-xl border border-slate-200/80 bg-white p-4">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">Bank</dt>
                    <dd className="mt-0.5 font-medium text-gcs-foreground">{bankTransfer.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">
                      Account name
                    </dt>
                    <dd className="mt-0.5 font-medium text-gcs-foreground">{bankTransfer.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">
                      Account number
                    </dt>
                    <dd className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <span className="break-all font-mono text-xl font-bold tracking-wide text-gcs-primary">
                        {bankTransfer.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyAccountNumber()}
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-gcs-foreground transition hover:border-gcs-primary/30 sm:w-auto"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden />
                            Copy number
                          </>
                        )}
                      </button>
                    </dd>
                  </div>
                  {expiresLabel ? (
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gcs-muted-text">
                        Account expires
                      </dt>
                      <dd className="mt-0.5 text-sm text-gcs-muted-text">{expiresLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              {polling ? (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  Waiting for your transfer — checking every few seconds.
                </p>
              ) : null}
            </div>
          ) : method ? (
            <div className="space-y-4">
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
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-gcs-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Change payment method
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                {(() => {
                  const Icon = methodIcon(method);
                  return (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                  );
                })()}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gcs-foreground">
                    {membershipPaymentMethodLabel(method)}
                  </p>
                  <p className="mt-0.5 text-xs text-gcs-muted-text">You will pay {formatGhs(amountGhs)}</p>
                </div>
              </div>

              {method === "bank_transfer" ? (
                <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-gcs-muted-text">
                  We will generate a one-time account number. Transfer the exact amount from your bank or MoMo —
                  verification is automatic.
                </p>
              ) : null}

              {method === "mobile_money_mtn" ? (
                <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                  {ussdHintForMethod(method)}
                </p>
              ) : null}

              {requiresPayerPhone(method) ? (
                <div>
                  <label htmlFor="pay-phone" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">
                    MTN MoMo number
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-gcs-primary focus-within:ring-2 focus-within:ring-gcs-primary/20">
                    <span className="flex w-12 items-center justify-center border-r border-slate-100 bg-slate-50 text-gcs-primary">
                      <Smartphone className="h-5 w-5" aria-hidden />
                    </span>
                    <input
                      id="pay-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="024 XXX XXXX"
                      className="min-h-[48px] min-w-0 flex-1 border-0 bg-transparent px-3 text-base outline-none"
                      disabled={busy}
                    />
                  </div>
                </div>
              ) : null}

              <p className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-relaxed text-gcs-muted-text">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary/70" aria-hidden />
                {paystackMode === "test"
                  ? "Paystack test mode — use test details only; no real money is charged."
                  : paystackMode === "live"
                    ? "Payments are encrypted and processed by Paystack. GCS never stores your card or PIN."
                    : "You will be redirected to Paystack’s secure payment page."}
              </p>
            </div>
          ) : null}

          {err ? (
            <p
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
              role="alert"
            >
              {err}
            </p>
          ) : null}
        </div>

        {/* Sticky footer CTA */}
        {showFooter ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
            <Button
              type="button"
              disabled={busy || (step === "confirm" && method !== "bank_transfer" && !paystackReady)}
              onClick={() =>
                step === "bank_transfer" ? void checkBankTransferNow() : void submitPayment()
              }
              className="h-12 w-full rounded-2xl bg-gcs-primary text-base font-semibold text-white shadow-lg shadow-gcs-primary/25 hover:bg-gcs-primary-hover disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Processing…
                </>
              ) : step === "confirm" && method !== "bank_transfer" && !paystackReady ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Preparing checkout…
                </>
              ) : (
                confirmLabel
              )}
            </Button>
            <p className="mt-2 text-center text-[10px] text-gcs-muted-text">
              Powered by Paystack · Ghana Chemical Society
            </p>
          </div>
        ) : (
          <div className="shrink-0 border-t border-slate-100 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-center sm:px-5">
            <p className="text-[10px] text-gcs-muted-text">Select a method to continue · Secured by Paystack</p>
          </div>
        )}
      </div>
    </div>
  );
}
