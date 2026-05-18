"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Hash,
  Loader2,
  Lock,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGhs } from "@/lib/membership-application";
import {
  GCS_MEMBERSHIP_BANK_DETAILS,
  membershipPaymentMethodLabel,
  PAYMENT_METHOD_GROUPS,
  paystackChannels,
  requiresPaymentNote,
  requiresPayerPhone,
  usesPaystack,
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
  reference?: string;
  publicKey?: string;
  email?: string;
  amountPesewas?: number;
  currency?: string;
  channels?: string[];
  paymentMethod?: string;
  error?: string;
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
  const [step, setStep] = useState<"choose" | "confirm">("choose");
  const [method, setMethod] = useState<MembershipPaymentMethodId | null>(null);
  const [payerPhone, setPayerPhone] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paystackReady, setPaystackReady] = useState(false);

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

  const resetAndClose = useCallback(() => {
    if (busy) return;
    setStep("choose");
    setMethod(null);
    setPayerPhone("");
    setPaymentNote("");
    setErr(null);
    onClose();
  }, [busy, onClose]);

  if (!open) return null;

  function pickMethod(id: MembershipPaymentMethodId) {
    setMethod(id);
    setStep("confirm");
    setErr(null);
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

    if (!res.ok || !body?.ok) {
      throw new Error(body?.error ?? "Payment verification failed.");
    }

    onSuccess({
      paystackReference: body.paystackReference ?? reference,
      message: body.message ?? "Payment received.",
      paymentMethod: body.paymentMethod ?? paymentMethod,
    });
  }

  async function submitBankTransfer() {
    const res = await fetch(`/api/public/membership-applications/${applicationId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod: method,
        paymentNote: paymentNote.trim(),
      }),
    });
    const body = await parseJsonResponse<{
      ok?: boolean;
      paystackReference?: string;
      message?: string;
      error?: string;
      paymentMethod?: string;
    }>(res);

    if (!res.ok || !body?.ok) {
      throw new Error(body?.error ?? "Payment could not be recorded.");
    }

    onSuccess({
      paystackReference: body.paystackReference ?? "",
      message: body.message ?? "Transfer details submitted.",
      paymentMethod: body.paymentMethod ?? method!,
    });
  }

  async function submitPaystackPayment() {
    if (!method || !usesPaystack(method)) return;

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

    if (!initRes.ok || !init?.ok || !init.reference || !init.publicKey || !init.amountPesewas) {
      throw new Error(init?.error ?? "Could not start Paystack checkout.");
    }

    await loadPaystackInline();

    const channels = init.channels ?? paystackChannels(method);
    const paymentMethod = init.paymentMethod ?? method;
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
                await verifyPaystackPayment(response.reference, paymentMethod);
                resolve();
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

    if (requiresPaymentNote(method) && paymentNote.trim().length < 4) {
      setErr("Enter your bank transfer reference or transaction ID.");
      return;
    }

    if (usesPaystack(method) && !paystackReady) {
      setErr("Loading secure checkout… try again in a moment.");
      return;
    }

    setBusy(true);
    try {
      if (usesPaystack(method)) {
        await submitPaystackPayment();
      } else {
        await submitBankTransfer();
      }
      setBusy(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment could not be completed.";
      if (message !== "Payment window closed before completion.") {
        setErr(message);
      }
      setBusy(false);
    }
  }

  const confirmLabel = method && usesPaystack(method) ? "Pay with Paystack" : "Submit transfer details";

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
              {method && usesPaystack(method) ? "Paystack · Secure checkout" : "Membership dues"}
            </p>
            <h2 id="payment-title" className="text-lg font-semibold">
              {step === "choose" ? "Choose payment method" : membershipPaymentMethodLabel(method)}
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
            <p className="text-2xl font-bold tracking-tight text-slate-900">{formatGhs(amountGhs)}</p>
            <p className="mt-1 text-xs text-slate-500">Annual membership · {email}</p>
          </div>

          {step === "choose" ? (
            <div className="mt-5 space-y-5">
              {PAYMENT_METHOD_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                  <p className="text-xs text-slate-500">{group.subtitle}</p>
                  <ul className="mt-2 space-y-2">
                    {group.methods.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => pickMethod(m.id)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 shadow-sm transition hover:border-[#011B33]/40 hover:bg-sky-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#011B33]/30"
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
          ) : method ? (
            <div className="mt-5 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep("choose");
                  setMethod(null);
                  setErr(null);
                }}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#011B33] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Change method
              </button>

              {method === "bank_transfer" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    <Building2 className="h-4 w-4 text-[#011B33]" aria-hidden />
                    Transfer to this account
                  </p>
                  <dl className="mt-3 space-y-2 text-slate-700">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Bank</dt>
                      <dd className="text-right font-medium">{GCS_MEMBERSHIP_BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Account name</dt>
                      <dd className="text-right font-medium">{GCS_MEMBERSHIP_BANK_DETAILS.accountName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Account no.</dt>
                      <dd className="font-mono text-right font-semibold">
                        {GCS_MEMBERSHIP_BANK_DETAILS.accountNumber}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Branch</dt>
                      <dd className="text-right">{GCS_MEMBERSHIP_BANK_DETAILS.branch}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    After transferring, enter your transaction reference below. The secretariat will verify before
                    your member ID is issued.
                  </p>
                </div>
              ) : null}

              {method === "debit_credit_card" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CreditCard className="h-4 w-4 text-[#011B33]" aria-hidden />
                    Visa · Mastercard
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    You will complete card payment securely in the Paystack window.
                  </p>
                </div>
              ) : null}

              {(method === "ussd" || method.startsWith("mobile_money_")) && method !== "bank_transfer" ? (
                <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                  {ussdHintForMethod(method)}
                </p>
              ) : null}

              {requiresPayerPhone(method) ? (
                <div>
                  <label htmlFor="pay-phone" className="mb-2 block text-sm font-medium text-slate-800">
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

              {requiresPaymentNote(method) ? (
                <div>
                  <label htmlFor="pay-note" className="mb-2 block text-sm font-medium text-slate-800">
                    Transfer reference / transaction ID
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm focus-within:border-[#011B33] focus-within:ring-2 focus-within:ring-[#011B33]/20">
                    <span className="flex w-11 items-center justify-center border-r border-slate-200 bg-slate-50 text-[#011B33]">
                      <Hash className="h-4 w-4" aria-hidden />
                    </span>
                    <input
                      id="pay-note"
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="e.g. TRF-20260515-ABC"
                      className="min-w-0 flex-1 border-0 bg-white px-3 py-3 text-[15px] outline-none"
                      disabled={busy}
                    />
                  </div>
                </div>
              ) : null}

              <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {method && usesPaystack(method)
                  ? "Payments are processed by Paystack. Use test credentials in sandbox mode."
                  : "Bank transfers are verified manually by the secretariat before your member ID is issued."}
              </p>
            </div>
          ) : null}

          {err ? <p className="mt-4 text-sm font-medium text-red-600">{err}</p> : null}
        </div>

        {step === "confirm" && method ? (
          <div className="shrink-0 border-t border-slate-100 p-5 pt-0">
            <Button
              type="button"
              disabled={busy || (usesPaystack(method) && !paystackReady)}
              onClick={() => void submitPayment()}
              className="h-12 w-full rounded-xl bg-[#011B33] text-base font-semibold text-white hover:bg-[#022a4d]"
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {usesPaystack(method) ? "Processing…" : "Submitting…"}
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
