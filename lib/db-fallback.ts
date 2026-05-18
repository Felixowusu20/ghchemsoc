import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prismaReady, resetPrismaClient } from "@/lib/prisma";

const CONNECTION_CODES = new Set(["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"]);

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** True when Postgres/Neon is unreachable — not for missing tables or bad queries. */
export function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError && CONNECTION_CODES.has(error.code)) {
    return true;
  }
  const msg = errorMessage(error);
  return /Can't reach database server|ECONNREFUSED|ETIMEDOUT|connection timed out|Connection terminated/i.test(
    msg
  );
}

/** Stale/disconnected Prisma engine (common after dev hot reload). */
export function isPrismaEngineDisconnected(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return /Engine is not yet connected|Response from the Engine was empty/i.test(errorMessage(error));
  }
  const msg = errorMessage(error);
  return /Engine is not yet connected|Response from the Engine was empty|Client has already been closed|prisma client has already been closed/i.test(
    msg
  );
}

function isRecoverablePrismaError(error: unknown): boolean {
  return isDbConnectionError(error) || isPrismaEngineDisconnected(error);
}

/** One connectivity check per request (for layout banners, etc.). */
export const getDatabaseOnline = cache(async (): Promise<boolean> => prismaReady());

/**
 * Run a Prisma query; on connection/engine issues return fallback.
 * Connects explicitly first; in dev retries once after resetting the singleton.
 */
export async function withDbFallback<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  void label;

  if (!(await prismaReady())) {
    return fallback;
  }

  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && isRecoverablePrismaError(error)) {
      resetPrismaClient();
      if (await prismaReady()) {
        try {
          return await fn();
        } catch (retryError) {
          if (isRecoverablePrismaError(retryError)) return fallback;
          throw retryError;
        }
      }
      return fallback;
    }

    if (!isRecoverablePrismaError(error)) throw error;
    return fallback;
  }
}
