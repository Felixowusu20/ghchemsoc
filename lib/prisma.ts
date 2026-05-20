import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
  config();
}

/** Bump when Prisma schema changes so hot-reload recycles a stale global client. */
const PRISMA_DEV_SCHEMA_VERSION = "2026-05-member-library";

/** Delegates that must exist on a fresh client (schema additions). */
const REQUIRED_DELEGATES = [
  "homepageExploreSettings",
  "siteFooterSettings",
  "memberPortalSettings",
  "memberBenefit",
  "memberLibraryItem",
] as const;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
  prismaConnectPromise?: Promise<void>;
};

/** Prefer Neon pooler URL; cap connections in dev to avoid pool timeouts. */
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return undefined;
  if (/connection_limit=|pool_timeout=|pgbouncer=true/i.test(url)) return url;

  const separator = url.includes("?") ? "&" : "?";
  const limit = process.env.NODE_ENV === "production" ? "10" : "3";
  return `${url}${separator}connection_limit=${limit}&pool_timeout=20`;
}

function disconnectPrismaClient(client: PrismaClient | undefined) {
  if (!client) return;
  void client.$disconnect().catch(() => {
    /* ignore — client may already be closed */
  });
}

function createPrismaClient() {
  const url = databaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

function clientMissingDelegates(client: PrismaClient): boolean {
  const d = client as unknown as Record<string, unknown>;
  return REQUIRED_DELEGATES.some((key) => typeof d[key] === "undefined");
}

function recycleStalePrisma() {
  const cached = globalForPrisma.prisma;
  if (!cached) return;

  const versionStale =
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prismaSchemaVersion !== PRISMA_DEV_SCHEMA_VERSION;

  if (versionStale || clientMissingDelegates(cached)) {
    disconnectPrismaClient(cached);
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaSchemaVersion = undefined;
    globalForPrisma.prismaConnectPromise = undefined;
  }
}

export function resetPrismaClient() {
  disconnectPrismaClient(globalForPrisma.prisma);
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaSchemaVersion = undefined;
  globalForPrisma.prismaConnectPromise = undefined;
}

export function prismaDelegateMissingMessage(delegate: string): string {
  return (
    `Prisma client is missing "${delegate}" (outdated after a schema update). ` +
    `Stop the dev server, run npx prisma generate, then start it again.`
  );
}

function ensurePrismaClient(): PrismaClient {
  recycleStalePrisma();

  if (!globalForPrisma.prisma || clientMissingDelegates(globalForPrisma.prisma)) {
    if (globalForPrisma.prisma) {
      disconnectPrismaClient(globalForPrisma.prisma);
    }
    const client = createPrismaClient();
    if (clientMissingDelegates(client)) {
      const missing = REQUIRED_DELEGATES.filter(
        (key) => typeof (client as unknown as Record<string, unknown>)[key] === "undefined"
      );
      throw new Error(
        `Generated Prisma client is missing: ${missing.join(", ")}. Run npx prisma generate in the project folder.`
      );
    }
    globalForPrisma.prisma = client;
    globalForPrisma.prismaConnectPromise = undefined;
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prismaSchemaVersion = PRISMA_DEV_SCHEMA_VERSION;
    }
  }

  return globalForPrisma.prisma;
}

function isModelDelegateProp(prop: string | symbol): prop is string {
  return typeof prop === "string" && prop.length > 0 && prop[0] !== "$" && prop[0] !== "_";
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
    let client = ensurePrismaClient();
    let value = Reflect.get(client, prop, client);

    if (value === undefined && isModelDelegateProp(prop)) {
      resetPrismaClient();
      client = ensurePrismaClient();
      value = Reflect.get(client, prop, client);
      if (value === undefined && (REQUIRED_DELEGATES as readonly string[]).includes(prop)) {
        throw new Error(prismaDelegateMissingMessage(prop));
      }
    }

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
