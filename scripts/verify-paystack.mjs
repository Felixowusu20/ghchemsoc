/**
 * Verifies Paystack test/live keys against the API.
 * Usage: node scripts/verify-paystack.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
const publicKey =
  process.env.PAYSTACK_PUBLIC_KEY?.trim() ||
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim();

function modeForKey(key, prefix) {
  if (key?.startsWith(`${prefix}test_`)) return "test";
  if (key?.startsWith(`${prefix}live_`)) return "live";
  return "unknown";
}

async function main() {
  console.log("Paystack configuration check\n");

  if (!secret) {
    console.error("FAIL: PAYSTACK_SECRET_KEY is missing.");
    process.exit(1);
  }
  if (!publicKey) {
    console.error("FAIL: PAYSTACK_PUBLIC_KEY (or NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) is missing.");
    process.exit(1);
  }

  const secretMode = modeForKey(secret, "sk_");
  const publicMode = modeForKey(publicKey, "pk_");
  console.log(`Secret key:  ${secretMode} (${secret.slice(0, 12)}…)`);
  console.log(`Public key:  ${publicMode} (${publicKey.slice(0, 12)}…)`);

  if (secretMode !== publicMode) {
    console.error("\nFAIL: Secret and public keys must both be test or both be live.");
    process.exit(1);
  }

  const balanceRes = await fetch("https://api.paystack.co/balance", {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const balanceBody = await balanceRes.json().catch(() => null);

  if (!balanceRes.ok || !balanceBody?.status) {
    console.error("\nFAIL: Could not reach Paystack API (balance check).");
    console.error(balanceBody?.message ?? balanceRes.statusText);
    process.exit(1);
  }

  const ghs = balanceBody.data?.find((b) => b.currency === "GHS");
  console.log("\nOK: Paystack API accepted your secret key.");
  if (ghs) {
    console.log(`GHS balance: ${(ghs.balance / 100).toFixed(2)} (available for test charges)`);
  }

  const ref = `GCS-VERIFY-${Date.now().toString(36).toUpperCase()}`;
  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "member@example.com",
      amount: 25000,
      currency: "GHS",
      reference: ref,
      callback_url: "http://localhost:3000/membership/pending",
      channels: ["card"],
      metadata: { verify: true },
    }),
  });
  const initBody = await initRes.json().catch(() => null);

  if (!initRes.ok || !initBody?.status || !initBody.data?.authorization_url) {
    console.error("\nFAIL: Could not initialize a test transaction.");
    console.error(initBody?.message ?? initRes.statusText);
    process.exit(1);
  }

  console.log("OK: Transaction initialize works (GHS 250 membership amount).");
  console.log(`Sample reference: ${initBody.data.reference}`);
  console.log("\nAll checks passed. Restart `npm run dev` if the app was already running.");
  if (secretMode === "test") {
    console.log("\nTest mode: use Paystack test cards at https://paystack.com/docs/payments/test-payments");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
