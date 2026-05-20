import { Prisma } from "@prisma/client";

export function prismaSaveErrorMessage(err: unknown, context = "save"): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2021") {
      return "Membership database tables are not set up yet. Run: npx prisma db push — then restart the dev server.";
    }
    if (err.code === "P1001" || err.code === "P1002" || err.code === "P1017" || err.code === "P2024") {
      return "The database is busy or waking up. Wait a few seconds and try again.";
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/Unknown arg [`']?paymentMethod|paymentNote/i.test(msg)) {
    return "Server is using an outdated database client. Stop the dev server, run npx prisma generate, then start it again.";
  }
  if (/membershipApplication|Cannot read properties of undefined/i.test(msg)) {
    return "Server needs a refresh after the membership update. Stop the dev server, run npx prisma generate, then start it again.";
  }
  if (process.env.NODE_ENV === "development") {
    return `Could not ${context}: ${msg}`;
  }
  return `Could not ${context}. Please try again.`;
}
