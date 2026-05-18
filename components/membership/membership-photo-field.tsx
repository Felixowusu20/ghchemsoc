"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { MEMBERSHIP_PHOTO_MAX_BYTES, validateMembershipPhotoFile } from "@/lib/membership-photo-shared";
import { cn } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-medium text-slate-800";

export function MembershipPhotoField({ disabled }: { disabled?: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
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
        setFileName(null);
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
        setFileName(file.name);
        setBusy(false);

        const dt = new DataTransfer();
        dt.items.add(file);
        if (inputRef.current) inputRef.current.files = dt.files;
    }

    return (
        <div className="md:col-span-2">
            <label className={labelClass} htmlFor="membership-photo">
                Passport-style photo
                <span className="ml-1 font-normal text-slate-500">(optional)</span>
            </label>
            <p className="mb-3 text-xs leading-relaxed text-slate-500">
                Clear head-and-shoulders photo for your member portfolio. JPEG, PNG, or WebP — max{" "}
                {Math.round(MEMBERSHIP_PHOTO_MAX_BYTES / 1_000_000)} MB.
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
                    "relative overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                    drag ? "border-gcs-primary bg-sky-50/80" : "border-slate-200 bg-slate-50/40",
                    disabled && "pointer-events-none opacity-60"
                )}
            >
                {preview ? (
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                        <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-2 ring-white sm:mx-0">
                            <Image src={preview} alt="Photo preview" fill className="object-cover" sizes="144px" unoptimized />
                        </div>
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-800 sm:justify-start">
                                <ImageIcon className="h-4 w-4 text-gcs-primary" aria-hidden />
                                {fileName ?? "Photo selected"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">This image will be saved with your application.</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                                <button
                                    type="button"
                                    disabled={disabled || busy}
                                    onClick={() => inputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-gcs-primary/30 hover:text-gcs-primary"
                                >
                                    <Upload className="h-3.5 w-3.5" aria-hidden />
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled || busy}
                                    onClick={clearPhoto}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-600"
                                >
                                    <X className="h-3.5 w-3.5" aria-hidden />
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={disabled || busy}
                        onClick={() => inputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-3 px-4 py-10 text-center transition hover:bg-white/60"
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gcs-primary shadow-sm ring-1 ring-slate-200">
                            {busy ? (
                                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                            ) : (
                                <Camera className="h-6 w-6" strokeWidth={2} aria-hidden />
                            )}
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-slate-800">
                                Drag &amp; drop your photo here
                            </span>
                            <span className="mt-1 block text-xs text-slate-500">
                                or <span className="font-semibold text-gcs-primary">browse files</span>
                            </span>
                        </span>
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

            {err ? <p className="mt-2 text-xs font-medium text-red-600">{err}</p> : null}
        </div>
    );
}
