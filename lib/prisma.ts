import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
  config();
}

/** Bump when Prisma schema changes so dev hot-reload recycles a stale global client. */
const PRISMA_DEV_SCHEMA_VERSION = "2026-05-site-footer-trademark";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
  prismaConnectPromise?: Promise<void>;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function clientMissingDelegates(client: PrismaClient): boolean {
  const d = client as unknown as {
    homepageExploreSettings?: unknown;
    siteFooterSettings?: unknown;
  };
  return typeof d.homepageExploreSettings === "undefined" || typeof d.siteFooterSettings === "undefined";
}

function recycleStaleDevPrisma() {
  if (process.env.NODE_ENV === "production") return;
  const cached = globalForPrisma.prisma;
  if (!cached) return;

  const versionStale = globalForPrisma.prismaSchemaVersion !== PRISMA_DEV_SCHEMA_VERSION;
  if (versionStale || clientMissingDelegates(cached)) {
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaSchemaVersion = undefined;
    globalForPrisma.prismaConnectPromise = undefined;
  }
}

export function resetPrismaClient() {
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaVersion = undefined;
  globalForPrisma.prismaConnectPromise = undefined;
}

function ensurePrismaClient(): PrismaClient {
  recycleStaleDevPrisma();

  if (!globalForPrisma.prisma || clientMissingDelegates(globalForPrisma.prisma)) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaConnectPromise = undefined;
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaSchemaVersion = PRISMA_DEV_SCHEMA_VERSION;
    }
  }

  return globalForPrisma.prisma;
}

/** Await before queries — avoids "Engine is not yet connected" after hot reload. */
export async function prismaReady(): Promise<boolean> {
  const client = ensurePrismaClient();
  if (!globalForPrisma.prismaConnectPromise) {
    globalForPrisma.prismaConnectPromise = client.$connect();
  }
  try {
    await globalForPrisma.prismaConnectPromise;
    return true;
  } catch {
    globalForPrisma.prismaConnectPromise = undefined;
    resetPrismaClient();
    return false;
  }
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = ensurePrismaClient();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
