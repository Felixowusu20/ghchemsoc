import type { ZodError } from "zod";
import { Prisma } from "@prisma/client";

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
      return "Database tables are not set up yet. Apply pending migrations, then restart the dev server.";
    }
    if (err.code === "P1001" || err.code === "P1002" || err.code === "P1017") {
      return "Could not reach the database. Wait a moment and try again.";
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/Cannot read properties of undefined \(reading 'findUnique'\)/i.test(msg)) {
    return "Server is using an outdated Prisma client. Stop the dev server, run npx prisma generate, then start it again.";
  }
  if (/Prisma client is missing|outdated after a schema update/i.test(msg)) {
    return msg;
  }
  if (/MemberPortalSettings|MemberBenefit/i.test(msg)) {
    return "Member portal tables are not set up yet. Run: npx prisma db push — then restart the dev server.";
  }
  if (/SiteFooterSettings|trademarkLabel|trademarkHref|trademarkNotice/i.test(msg)) {
    return "Footer database is missing trademark fields. Run: npx prisma db execute --file prisma/migrations/20260517180000_add_footer_trademark_fields/migration.sql — then restart the dev server.";
  }
  if (/Unknown arg [`']?trademark/i.test(msg)) {
    return "Server is using an outdated database client. Stop the dev server, run npx prisma generate, then start it again.";
  }
  if (process.env.NODE_ENV === "development") {
    return `Could not ${context}: ${msg}`;
  }
  return `Could not ${context}. Please try again.`;
}

export async function readCmsErrorResponse(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in at /cms/login";
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
