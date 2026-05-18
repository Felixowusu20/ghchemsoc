"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { RegistrationFieldDef } from "@/lib/event-registration-form";
import { gooeyToast } from "@/lib/toast";

const fieldClass =
  "mt-1.5 h-12 w-full rounded-xl border border-gcs-border bg-white px-4 text-[15px] text-gcs-foreground shadow-sm transition-all placeholder:text-gcs-muted-text/70 focus:border-gcs-primary focus:outline-none focus:ring-2 focus:ring-gcs-primary/20";

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text";

type Props = {
  eventId: string;
  fields: RegistrationFieldDef[];
};

export function EventRegistrationForm({ eventId, fields }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, answers: values }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        gooeyToast.error("Could not submit registration", {
          description: data.error ?? "Please check the form and try again.",
          preset: "smooth",
          spring: false,
        });
        return;
      }
      gooeyToast.success("Registration submitted", {
        description: "The organisers will follow up if needed.",
        preset: "smooth",
        spring: false,
      });
      router.push(`/events/${eventId}?registered=1`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {fields.map((f) => (
        <div key={f.id}>
          <label htmlFor={`reg-${f.id}`} className={labelClass}>
            {f.label}
            {f.required ? <span className="text-red-600"> *</span> : null}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={`reg-${f.id}`}
              name={f.id}
              required={f.required}
              rows={4}
              className={`${fieldClass} h-auto min-h-[7rem] resize-y py-3`}
              value={values[f.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            />
          ) : f.type === "select" ? (
            <select
              id={`reg-${f.id}`}
              name={f.id}
              required={f.required}
              className={fieldClass}
              value={values[f.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            >
              <option value="">{f.required ? "Select an option…" : "Optional"}</option>
              {(f.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`reg-${f.id}`}
              name={f.id}
              type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
              required={f.required}
              className={fieldClass}
              value={values[f.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <div className="border-t border-gcs-border/60 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gcs-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-gcs-primary-hover disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Submit registration
        </button>
        <p className="mt-4 text-xs leading-relaxed text-gcs-muted-text">
          By submitting, you agree that the Ghana Chemical Society may contact you about this event.
        </p>
      </div>
    </form>
  );
}
