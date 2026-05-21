"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Link2, Upload, X } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  urlPublicId: string | null;
  onChange: (url: string, publicId: string | null) => void;
  onClear?: () => void;
  disabled?: boolean;
};

type SourceMode = "upload" | "link";

export function CmsDocumentSource({ url, urlPublicId, onChange, onClear, disabled }: Props) {
  const [mode, setMode] = useState<SourceMode>(urlPublicId ? "upload" : "link");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState(url && !urlPublicId ? url : "");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/cms/upload", cmsCredentials);
      if (cancelled || !res.ok) return;
      const body = (await res.json()) as { configured?: boolean };
      if (!cancelled) setConfigured(body.configured === true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setErr(null);
      setBusy(true);
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "resources/documents");
      fd.set("assetType", "document");
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd, ...cmsCredentials });
      const body = (await res.json().catch(() => null)) as {
        url?: string;
        publicId?: string;
        error?: string;
        hint?: string;
      } | null;
      setBusy(false);
      if (!res.ok || !body?.url || !body.publicId) {
        setErr(body?.hint ?? body?.error ?? "Upload failed.");
        return;
      }
      onChange(body.url, body.publicId);
      setLinkInput("");
      setMode("upload");
    },
    [onChange]
  );

  function applyLink() {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setErr("Enter a document link.");
      return;
    }
    try {
      const u = new URL(trimmed);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error();
    } catch {
      setErr("Enter a valid https:// link.");
      return;
    }
    setErr(null);
    onChange(trimmed, null);
    setLinkInput("");
  }

  function clearAll() {
    onClear?.();
    setLinkInput("");
    setErr(null);
  }

  const hasFile = Boolean(url.trim());

  return (
    <div className="space-y-4">
      {!hasFile ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "upload" as const, label: "Upload file", icon: Upload },
              { id: "link" as const, label: "Link to file", icon: Link2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={disabled || busy}
              onClick={() => setMode(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                mode === id
                  ? "bg-gcs-primary text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-gcs-primary/40"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {hasFile ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <FileText className="h-5 w-5 text-gcs-primary" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {urlPublicId ? "Document uploaded" : "Document linked"}
            </p>
          </div>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Remove
          </button>
        </div>
      ) : null}

      {!hasFile && mode === "upload" ? (
        configured === false ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            File uploads need Cloudinary on the server. Use “Link to file” instead.
          </p>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void uploadFile(f);
            }}
            className={cn(
              "relative flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors",
              drag ? "border-gcs-primary bg-gcs-primary/5" : "border-slate-200 bg-slate-50/80",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <Upload className="h-5 w-5 text-gcs-primary" aria-hidden />
            <p className="text-center text-sm text-slate-700">PDF, PowerPoint, Word, or ZIP — up to 50 MB</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,application/pdf"
              disabled={disabled || busy}
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadFile(f);
                e.target.value = "";
              }}
            />
            {busy ? <p className="text-xs font-medium text-gcs-primary">Uploading…</p> : null}
          </div>
        )
      ) : !hasFile ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-1.5">
            <span className="text-xs font-medium text-slate-600">Document link</span>
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste link to PDF or file…"
              disabled={disabled || busy}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gcs-primary focus:ring-2 focus:ring-gcs-primary/20"
            />
          </label>
          <button
            type="button"
            disabled={disabled || busy || !linkInput.trim()}
            onClick={applyLink}
            className="shrink-0 rounded-xl bg-gcs-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-gcs-primary-hover disabled:opacity-50"
          >
            Add link
          </button>
        </div>
      ) : null}

      {err ? <p className="text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
