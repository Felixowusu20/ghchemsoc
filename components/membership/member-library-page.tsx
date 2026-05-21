"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  StickyNote,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useMemberPortal } from "@/components/membership/member-portal-context";
import type { MemberLibraryItemDto, MemberLibraryItemType } from "@/lib/member-library";
import { gooeyToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type AddMode = "link" | "note" | "file" | null;

function formatBytes(n: number | null) {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function TypeIcon({ type }: { type: MemberLibraryItemType }) {
  if (type === "link") return <Link2 className="h-4 w-4" aria-hidden />;
  if (type === "file") return <FileText className="h-4 w-4" aria-hidden />;
  return <StickyNote className="h-4 w-4" aria-hidden />;
}

export function MemberLibraryPage() {
  const { serverSession } = useMemberPortal();
  const [items, setItems] = useState<MemberLibraryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | MemberLibraryItemType>("all");
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MemberLibraryItemDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/member/library", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { items: MemberLibraryItemDto[] };
        setItems(data.items);
      } else if (res.status === 401) {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  async function confirmDeleteItem() {
    const item = pendingDelete;
    if (!item) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/member/library/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        gooeyToast.error("Could not delete", { preset: "smooth", spring: false });
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setPendingDelete(null);
      gooeyToast.success("Removed", { preset: "smooth", spring: false });
    } finally {
      setDeleting(false);
    }
  }

  async function submitLinkOrNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!addMode || addMode === "file") return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      type: addMode,
      title: String(fd.get("title") ?? "").trim(),
      body: String(fd.get("body") ?? "").trim() || null,
      url: addMode === "link" ? String(fd.get("url") ?? "").trim() || null : null,
      tags: String(fd.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const res = await fetch("/api/member/library", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { item?: MemberLibraryItemDto; error?: string };
    setSaving(false);

    if (!res.ok || !data.item) {
      gooeyToast.error("Could not save", { description: data.error, preset: "smooth", spring: false });
      return;
    }
    setItems((prev) => [...prev, data.item!]);
    setAddMode(null);
    gooeyToast.success("Saved to your library", { preset: "smooth", spring: false });
  }

  async function submitFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/member/library/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = (await res.json()) as { item?: MemberLibraryItemDto; error?: string };
    setSaving(false);

    if (!res.ok || !data.item) {
      gooeyToast.error("Upload failed", { description: data.error, preset: "smooth", spring: false });
      return;
    }
    setItems((prev) => [...prev, data.item!]);
    setAddMode(null);
    gooeyToast.success("File uploaded", { preset: "smooth", spring: false });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gcs-foreground md:text-3xl">My library</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
          Private links, notes, and files only you can see. Use this for CPD materials, lab references, or anything you
          want to keep with your membership.
        </p>
        {!serverSession ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Sign in with your email and member ID to save items to your account across devices.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "link", "note", "file"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
              filter === key
                ? "bg-gcs-primary text-white shadow-sm"
                : "border border-gcs-border bg-white text-gcs-muted-text hover:border-gcs-primary/30"
            )}
          >
            {key === "all" ? "All" : key + "s"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!serverSession}
          className="rounded-full border-gcs-border"
          onClick={() => setAddMode("link")}
        >
          <Link2 className="mr-2 h-4 w-4" />
          Add link
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!serverSession}
          className="rounded-full border-gcs-border"
          onClick={() => setAddMode("note")}
        >
          <StickyNote className="mr-2 h-4 w-4" />
          Add note
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!serverSession}
          className="rounded-full border-gcs-border"
          onClick={() => setAddMode("file")}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload file
        </Button>
      </div>

      {addMode ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gcs-primary/20 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gcs-foreground">
              {addMode === "link" ? "New link" : addMode === "note" ? "New note" : "Upload file"}
            </h3>
            <button
              type="button"
              className="text-sm text-gcs-muted-text hover:text-gcs-foreground"
              onClick={() => setAddMode(null)}
            >
              Cancel
            </button>
          </div>

          {addMode === "file" ? (
            <form className="space-y-4" onSubmit={submitFile}>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">File</span>
                <input
                  type="file"
                  name="file"
                  required
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="block w-full text-sm"
                />
                <p className="mt-1 text-xs text-gcs-muted-text">PDF or image, up to 10 MB.</p>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">Title</span>
                <Input name="title" placeholder="Optional display name" className="h-11 rounded-xl" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">Notes</span>
                <textarea
                  name="body"
                  rows={3}
                  className="w-full rounded-xl border border-gcs-border px-3 py-2 text-sm"
                  placeholder="Optional caption"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">Tags</span>
                <Input name="tags" placeholder="CPD, teaching (comma-separated)" className="h-11 rounded-xl" />
              </label>
              <Button type="submit" disabled={saving} className="rounded-full bg-gcs-primary text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={submitLinkOrNote}>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">Title</span>
                <Input name="title" required className="h-11 rounded-xl" />
              </label>
              {addMode === "link" ? (
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">URL</span>
                  <Input name="url" type="url" required placeholder="https://…" className="h-11 rounded-xl" />
                </label>
              ) : null}
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">
                  {addMode === "note" ? "Note" : "Description"}
                </span>
                <textarea
                  name="body"
                  rows={addMode === "note" ? 6 : 2}
                  required={addMode === "note"}
                  className="w-full rounded-xl border border-gcs-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-gcs-muted-text">Tags</span>
                <Input name="tags" placeholder="Optional, comma-separated" className="h-11 rounded-xl" />
              </label>
              <Button type="submit" disabled={saving} className="rounded-full bg-gcs-primary text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </form>
          )}
        </motion.div>
      ) : null}

      {loading ? (
        <p className="text-sm text-gcs-muted-text">Loading your library…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gcs-border px-6 py-14 text-center text-sm text-gcs-muted-text">
          Nothing here yet. Add a link, note, or file to get started.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-2xl border border-gcs-border bg-white p-5 shadow-sm transition hover:border-gcs-primary/25"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gcs-primary/10 text-gcs-primary">
                  <TypeIcon type={item.type} />
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-gcs-muted-text hover:bg-neutral-100 hover:text-red-600"
                    aria-label="Delete"
                    onClick={() => setPendingDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gcs-foreground">{item.title}</h3>
              {item.body ? <p className="mt-2 line-clamp-4 text-sm text-gcs-muted-text">{item.body}</p> : null}
              {item.type === "file" && item.fileBytes != null ? (
                <p className="mt-2 text-xs text-gcs-muted-text">{formatBytes(item.fileBytes)}</p>
              ) : null}
              {item.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-gcs-muted-text"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gcs-primary hover:underline"
                >
                  {item.type === "file" ? "Open file" : "Visit link"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        variant="danger"
        title="Remove this from your library?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-slate-900">&ldquo;{pendingDelete.title}&rdquo;</span>{" "}
              will be permanently deleted from your private library.
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
              {pendingDelete.type === "file" ? (
                <li className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>The uploaded file will also be removed from storage.</span>
                </li>
              ) : null}
            </ul>
          ) : null
        }
        confirmLabel="Remove item"
        cancelLabel="Keep it"
        loading={deleting}
        onConfirm={confirmDeleteItem}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
