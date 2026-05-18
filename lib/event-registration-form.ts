import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const registrationFieldDefSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(200),
  type: z.enum(["text", "email", "tel", "textarea", "select"]),
  required: z.boolean().optional(),
  options: z.array(z.string().min(1)).max(50).optional(),
});

export type RegistrationFieldDef = z.infer<typeof registrationFieldDefSchema>;

export const registrationFormFieldsSchema = z.array(registrationFieldDefSchema).max(40);

export function parseRegistrationFormFields(raw: Prisma.JsonValue | null | undefined): RegistrationFieldDef[] {
  if (raw == null) return [];
  const parsed = registrationFormFieldsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function hasRegistrationForm(raw: Prisma.JsonValue | null | undefined): boolean {
  return parseRegistrationFormFields(raw).length > 0;
}

/** New row in CMS registration form builders (stable id generated per row). */
export function createEmptyRegistrationField(): RegistrationFieldDef {
  return {
    id: `field_${Math.random().toString(36).slice(2, 9)}`,
    label: "",
    type: "text",
    required: true,
  };
}

function normalizeAnswers(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return out;
}

export function validateRegistrationAnswers(
  fields: RegistrationFieldDef[],
  answers: unknown
): { ok: true; answers: Record<string, string> } | { ok: false; error: string } {
  const normalized = normalizeAnswers(answers);
  for (const f of fields) {
    const val = (normalized[f.id] ?? "").trim();
    if (f.required && !val) {
      return { ok: false, error: `Missing required field: ${f.label}` };
    }
    if (!val) continue;
    if (f.type === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return { ok: false, error: `Invalid email in: ${f.label}` };
    }
    if (f.type === "select" && f.options?.length) {
      if (!f.options.includes(val)) return { ok: false, error: `Invalid choice for: ${f.label}` };
    }
  }
  for (const key of Object.keys(normalized)) {
    if (!fields.some((f) => f.id === key)) delete normalized[key];
  }
  return { ok: true, answers: normalized };
}

export function buildRegistrationSummaryLine(fields: RegistrationFieldDef[], answers: Record<string, string>): string {
  const emailField = fields.find((f) => f.type === "email");
  const nameField = fields.find((f) => /name/i.test(f.label) || f.id === "full_name");
  const parts: string[] = [];
  if (nameField) {
    const v = answers[nameField.id]?.trim();
    if (v) parts.push(v);
  }
  if (emailField) {
    const v = answers[emailField.id]?.trim();
    if (v) parts.push(v);
  }
  if (parts.length) return parts.slice(0, 3).join(" · ");
  const first = fields[0];
  const v = first ? answers[first.id]?.trim() : "";
  return v || "Registration";
}

export function registrationRowsForAdmin(
  fields: RegistrationFieldDef[],
  answers: Record<string, string>
): { label: string; value: string }[] {
  return fields.map((f) => ({
    label: f.label,
    value: (answers[f.id] ?? "").trim() || "—",
  }));
}
