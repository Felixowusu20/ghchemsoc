"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCheck,
  ExternalLink,
  Inbox as InboxIcon,
  Loader2,
  MailOpen,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type InboxItem = {
  deliveryId: string;
  announcementId: string;
  title: string;
  preview: string;
  bodyHtml: string;
  publicHref: string | null;
  goLiveAt: string | null;
  sentAt: string;
  readAt: string | null;
};

function formatSentAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export function MemberInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InboxItem | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/member/notifications", { credentials: "include" });
      if (!res.ok) {
        setError(res.status === 401 ? "Sign in to view your inbox." : "Could not load your inbox.");
        setItems([]);
        setUnreadCount(0);
        return;
      }
      const data = (await res.json()) as { items: InboxItem[]; unreadCount: number };
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markOneRead(deliveryId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.deliveryId === deliveryId && !item.readAt
          ? { ...item, readAt: new Date().toISOString() }
          : item
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch(`/api/member/notifications/${deliveryId}`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {
      void load();
    }
  }

  async function markAllRead() {
    if (unreadCount === 0) return;
    setMarking(true);
    setItems((prev) =>
      prev.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() }
      )
    );
    setUnreadCount(0);
    try {
      await fetch("/api/member/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      void load();
    } finally {
      setMarking(false);
    }
  }

  function toggleExpanded(item: InboxItem) {
    setExpandedId((current) => (current === item.deliveryId ? null : item.deliveryId));
    if (!item.readAt) {
      void markOneRead(item.deliveryId);
    }
  }

  function requestDelete(item: InboxItem) {
    if (!item.readAt) return;
    setPendingDelete(item);
  }

  async function confirmDelete() {
    const item = pendingDelete;
    if (!item) return;
    setDeletingId(item.deliveryId);
    setError(null);
    try {
      const res = await fetch(`/api/member/notifications/${item.deliveryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Could not delete this message.");
        return;
      }
      setItems((prev) => prev.filter((it) => it.deliveryId !== item.deliveryId));
      if (expandedId === item.deliveryId) setExpandedId(null);
      setPendingDelete(null);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <InboxIcon className="h-5 w-5" aria-hidden />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">Inbox</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
              Bulletins, conference resources, videos, and other members-only updates from the Ghana Chemical
              Society. The same content is also delivered to your registered email address. Open a message to read it
              — you can remove it from your inbox after viewing.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0 || marking}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
            unreadCount === 0 || marking
              ? "cursor-not-allowed border-gcs-border/60 text-gcs-muted-text/60"
              : "border-gcs-border text-gcs-foreground hover:bg-gcs-primary/5 hover:text-gcs-primary"
          )}
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCheck className="h-4 w-4" aria-hidden />}
          Mark all as read
        </button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gcs-border bg-white shadow-sm"
      >
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gcs-muted-text">Loading your inbox…</p>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MailOpen className="mx-auto h-8 w-8 text-gcs-muted-text/60" aria-hidden />
            <p className="mt-3 text-sm font-medium text-gcs-foreground">No messages yet</p>
            <p className="mt-1 text-sm text-gcs-muted-text">
              You will see Society bulletins, resources, and announcements here as soon as they are sent.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gcs-border/60">
            {items.map((item) => {
              const unread = !item.readAt;
              const isOpen = expandedId === item.deliveryId;
              return (
                <li key={item.deliveryId} className={cn("transition-colors", unread ? "bg-blue-50/40" : "bg-white")}>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-blue-50/60"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        "mt-1.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full",
                        unread ? "bg-blue-600" : "bg-transparent ring-1 ring-gcs-border"
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("truncate text-sm md:text-base", unread ? "font-semibold text-gcs-foreground" : "text-gcs-foreground/90")}>
                          {item.title}
                        </p>
                        {unread ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                            New
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gcs-muted-text">{item.preview}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-gcs-muted-text/70">
                        {formatSentAt(item.sentAt)}
                      </p>
                    </div>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-gcs-border/40 bg-white px-5 py-5">
                      <div
                        className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gcs-foreground/90"
                        dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                      />
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        {item.publicHref ? (
                          <a
                            href={item.publicHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gcs-primary hover:underline"
                          >
                            View public version
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => requestDelete(item)}
                          disabled={deletingId === item.deliveryId}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.deliveryId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                          Delete message
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </motion.section>

      <ConfirmDialog
        open={pendingDelete !== null}
        variant="danger"
        title="Remove this message from your inbox?"
        description={
          pendingDelete ? (
            <>
              You are about to delete{" "}
              <span className="font-semibold text-slate-900">&ldquo;{pendingDelete.title}&rdquo;</span>{" "}
              from your portal inbox. The email already delivered to your inbox is not affected.
            </>
          ) : null
        }
        highlights={
          pendingDelete ? (
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>This action cannot be undone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>Attachments and resource links will no longer be accessible from this inbox.</span>
              </li>
            </ul>
          ) : null
        }
        confirmLabel="Delete message"
        cancelLabel="Keep it"
        loading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (deletingId === null) setPendingDelete(null);
        }}
      />
    </div>
  );
}
