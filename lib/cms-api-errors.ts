import type { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/** Shown in the admin UI when the session cookie is missing or expired. */
export const CMS_UNAUTHORIZED_MESSAGE = "Your session has expired. Please sign in again.";

export function formatZodError(error: ZodError): string {
  const flat = error.flatten();
  const parts: string[] = [...flat.formErrors];
  for (const [field, messages] of Object.entries(flat.fieldErrors)) {
    if (messages?.length) parts.push(`${field}: ${messages.join(", ")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Invalid form data.";
}

export function prismaCmsErrorMessage(err: unknown, context = "save"): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2021") {
      return "The site database is not fully set up yet. Ask your site administrator to complete setup.";
    }
    if (err.code === "P1001" || err.code === "P1002" || err.code === "P1017") {
      return "Could not reach the database. Wait a moment and try again.";
    }
  }
  if (process.env.NODE_ENV === "development") {
    const msg = err instanceof Error ? err.message : String(err);
    return `Could not ${context}: ${msg}`;
  }
  return `Could not ${context}. Please try again.`;
}

export async function readCmsErrorResponse(res: Response): Promise<string> {
  if (res.status === 401) return CMS_UNAUTHORIZED_MESSAGE;
  const text = await res.text();
  if (!text.trim()) return `Request failed (${res.status})`;
  try {
    const data = JSON.parse(text) as { error?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (data.error && typeof data.error === "object") {
      const flat = data.error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
      const parts: string[] = [...(flat.formErrors ?? [])];
      for (const [field, messages] of Object.entries(flat.fieldErrors ?? {})) {
        if (messages?.length) parts.push(`${field}: ${messages.join(", ")}`);
      }
      if (parts.length) return parts.join(" · ");
    }
  } catch {
    /* plain text */
  }
  return text.trim().slice(0, 600);
}
