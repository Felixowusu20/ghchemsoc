"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Link2, Upload } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  folder: string;
  previewUrl: string | null;
  onChange: (url: string, publicId: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  /** When false, hides the “paste image URL” row (upload only). */
  showUrlPaste?: boolean;
};

function isValidImageUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function CmsImageUpload({
  label,
  folder,
  previewUrl,
  onChange,
  onClear,
  disabled,
  required,
  helperText,
  showUrlPaste = true,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState<boolean | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/cms/upload", cmsCredentials);
      if (cancelled || !res.ok) return;
      const body = (await res.json()) as { configured?: boolean };
      if (!cancelled) setCloudinaryConfigured(body.configured === true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErr("Please choose an image file.");
        return;
      }
      setErr(null);
      setBusy(true);
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd, ...cmsCredentials });
      const body = (await res.json().catch(() => null)) as {
        url?: string;
        publicId?: string;
        error?: string;
        hint?: string;
        detail?: string;
      } | null;
      setBusy(false);
      if (!res.ok || !body) {
        let message = "Upload failed.";
        if (body) message = body.hint ?? body.detail ?? body.error ?? message;
        else if (res.status === 401) message = "Sign in again — your session may have expired.";
        setErr(message);
        return;
      }
      if (!body.url || !body.publicId) {
        setErr(body.hint ?? body.error ?? "Upload failed.");
        return;
      }
      onChange(body.url, body.publicId);
      setPasteUrl("");
    },
    [folder, onChange]
  );

  function applyPastedUrl() {
    const trimmed = pasteUrl.trim();
    if (!isValidImageUrl(trimmed)) {
      setErr("Enter a valid image URL (https://…).");
      return;
    }
    setErr(null);
    onChange(trimmed, "");
    setPasteUrl("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
        {previewUrl && onClear ? (
          <button
            type="button"
            className="text-xs font-medium text-slate-500 hover:text-red-600"
            onClick={onClear}
            disabled={disabled || busy}
          >
            Remove image
          </button>
        ) : null}
      </div>
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}

      {cloudinaryConfigured === false ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
          Image uploads are not available right now. Images already saved still show on the public site. Paste an image
          link below, or ask your site administrator to enable uploads.
        </p>
      ) : null}

      {cloudinaryConfigured !== false ? (
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
            "relative flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors",
            drag ? "border-gcs-primary bg-gcs-primary/5" : "border-slate-200 bg-white",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {previewUrl ? (
            <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image src={previewUrl} alt="" fill className="object-cover" sizes="320px" />
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <Upload className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-center text-sm text-slate-600">
                Drag &amp; drop an image here, or{" "}
                <span className="font-semibold text-gcs-primary">choose a file</span>
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
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
      ) : null}

      {showUrlPaste ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="url"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="Or paste image URL (https://…)"
              disabled={disabled || busy}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none ring-gcs-primary/20 placeholder:text-slate-400 focus:border-gcs-primary focus:ring-2"
            />
          </div>
          <button
            type="button"
            disabled={disabled || busy || !pasteUrl.trim()}
            onClick={applyPastedUrl}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-gcs-primary hover:text-gcs-primary disabled:opacity-50"
          >
            Use URL
          </button>
        </div>
      ) : null}

      {err ? <p className="text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
