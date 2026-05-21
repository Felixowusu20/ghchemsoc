"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { MEMBERSHIP_PHOTO_MAX_BYTES, validateMembershipPhotoFile } from "@/lib/membership-photo-shared";
import { cn } from "@/lib/utils";

export function MembershipPhotoField({ disabled }: { disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearPhoto() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setErr(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function applyFile(file: File) {
    const validation = validateMembershipPhotoFile(file);
    if (validation) {
      setErr(validation);
      return;
    }
    setErr(null);
    setBusy(true);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setBusy(false);
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  return (
    <div className="flex h-full flex-col">
      <label className="mb-1.5 block text-xs font-semibold text-slate-600" htmlFor="membership-photo">
        Photo <span className="font-normal text-slate-500">(optional)</span>
      </label>
      <p className="mb-2 text-[11px] leading-snug text-slate-500">
        Passport-style · max {Math.round(MEMBERSHIP_PHOTO_MAX_BYTES / 1_000_000)} MB
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (disabled) return;
          const f = e.dataTransfer.files?.[0];
          if (f) applyFile(f);
        }}
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden rounded-xl border border-dashed transition-colors",
          drag ? "border-gcs-primary bg-sky-50/60" : "border-slate-200 bg-slate-50/50",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {preview ? (
          <div className="flex flex-1 flex-col p-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[140px] flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <Image src={preview} alt="Photo preview" fill className="object-cover" sizes="140px" unoptimized />
            </div>
            <div className="mt-2 flex justify-center gap-1.5">
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-gcs-primary/40 hover:text-gcs-primary disabled:cursor-not-allowed"
              >
                <Upload className="h-3 w-3" aria-hidden />
                Replace
              </button>
              <button
                type="button"
                disabled={disabled || busy}
                onClick={clearPhoto}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-red-200 hover:text-red-600"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
            className="flex min-h-[168px] flex-1 flex-col items-center justify-center gap-2 px-3 py-4 text-center transition hover:bg-white/70 cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gcs-primary shadow-sm ring-1 ring-slate-200">
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Camera className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </span>
            <span className="text-[11px] font-semibold leading-snug text-slate-600">Upload photo</span>
          </button>
        )}

        <input
          ref={inputRef}
          id="membership-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) applyFile(f);
          }}
        />
      </div>

      {err ? <p className="mt-1.5 text-[11px] font-medium text-red-600">{err}</p> : null}
    </div>
  );
}
