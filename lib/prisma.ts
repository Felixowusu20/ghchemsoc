import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

/** Dev: global Prisma can outlive `prisma generate`; recycle if the client is missing new models. */
function recycleStaleDevPrisma() {
  if (process.env.NODE_ENV === "production") return;
  const cached = globalForPrisma.prisma;
  if (!cached) return;
  const delegate = (cached as unknown as { homepageExploreSettings?: unknown }).homepageExploreSettings;
  if (typeof delegate === "undefined") {
    void cached.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
}

recycleStaleDevPrisma();

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
