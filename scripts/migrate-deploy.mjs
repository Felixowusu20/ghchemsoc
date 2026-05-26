#!/usr/bin/env node
/**
 * Run migrations on a direct Postgres URL when available (Neon pooler cannot hold advisory locks).
 * Falls back to DATABASE_URL for local/dev.
 */
import { spawnSync } from "node:child_process";

const direct = process.env.DIRECT_URL?.trim();
if (direct) {
  process.env.DATABASE_URL = direct;
  console.log("[migrate-deploy] Using DIRECT_URL for prisma migrate deploy");
} else {
  console.warn(
    "[migrate-deploy] DIRECT_URL is not set; using DATABASE_URL. " +
      "If migrate times out (P1002), set DIRECT_URL to your non-pooler connection string."
  );
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
