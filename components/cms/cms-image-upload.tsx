"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
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
};

export function CmsImageUpload({
  label,
  folder,
  previewUrl,
  onChange,
  onClear,
  disabled,
  required,
  helperText,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
      const body = (await res.json().catch(() => null)) as { url?: string; publicId?: string; error?: string; hint?: string; detail?: string } | null;
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
    },
    [folder, onChange]
  );

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
        {err ? <p className="text-xs text-red-600">{err}</p> : null}
      </div>
    </div>
  );
}
