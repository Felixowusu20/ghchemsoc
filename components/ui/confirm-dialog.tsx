"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Send, Trash2, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "warning" | "primary";

export type ConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  description?: ReactNode;
  /** Optional small list / highlight block shown under the description. */
  highlights?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  icon?: ReactNode;
  /** Show "Permanent action" / "Confirm" badge above the title. Defaults to true. */
  showBadge?: boolean;
};

const VARIANTS = {
  danger: {
    iconBg: "bg-red-50 text-red-700 ring-red-100",
    accent: "from-red-400/35 via-red-300/10 to-transparent",
    badge: "bg-red-50 text-red-700 ring-red-100",
    badgeLabel: "Permanent action",
    confirm:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500/40 shadow-red-600/20",
    defaultIcon: Trash2,
  },
  warning: {
    iconBg: "bg-amber-50 text-amber-700 ring-amber-100",
    accent: "from-amber-400/30 via-amber-300/10 to-transparent",
    badge: "bg-amber-50 text-amber-800 ring-amber-100",
    badgeLabel: "Please confirm",
    confirm:
      "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus-visible:ring-amber-500/40 shadow-amber-600/20",
    defaultIcon: AlertTriangle,
  },
  primary: {
    iconBg: "bg-blue-50 text-blue-700 ring-blue-100",
    accent: "from-blue-400/30 via-blue-300/10 to-transparent",
    badge: "bg-blue-50 text-blue-800 ring-blue-100",
    badgeLabel: "Confirm",
    confirm:
      "bg-gcs-primary hover:bg-gcs-primary-hover focus-visible:ring-gcs-primary/40 shadow-gcs-primary/20",
    defaultIcon: Send,
  },
} as const;

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  highlights,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  icon,
  showBadge = true,
}: ConfirmDialogProps) {
  const cfg = VARIANTS[variant];
  const DefaultIcon = cfg.defaultIcon;
  const titleId = useId();
  const descId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            onClick={() => !loading && onCancel()}
            className="absolute inset-0 cursor-default bg-slate-900/55 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)]"
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 -top-32 h-56 bg-gradient-to-b blur-3xl",
                cfg.accent
              )}
              aria-hidden
            />

            <button
              type="button"
              onClick={() => !loading && onCancel()}
              disabled={loading}
              className="absolute right-3.5 top-3.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                    cfg.iconBg
                  )}
                  aria-hidden
                >
                  {icon ?? <DefaultIcon className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  {showBadge ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1",
                        cfg.badge
                      )}
                    >
                      {cfg.badgeLabel}
                    </span>
                  ) : null}
                  <h2
                    id={titleId}
                    className="mt-2 text-lg font-semibold leading-snug tracking-tight text-slate-900"
                  >
                    {title}
                  </h2>
                  {description ? (
                    <p
                      id={descId}
                      className="mt-2 text-sm leading-relaxed text-slate-600"
                    >
                      {description}
                    </p>
                  ) : null}
                  {highlights ? (
                    <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-600">
                      {highlights}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void onConfirm()}
                  disabled={loading}
                  autoFocus
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2 disabled:opacity-60",
                    cfg.confirm
                  )}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
