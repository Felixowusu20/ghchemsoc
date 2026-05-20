import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import {
  buildMembershipPaymentsCsv,
  filterApplicationsByFinanceYear,
  serializeRowsForExport,
} from "@/lib/membership-payments-export";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  /** payments = any row with payment activity; all = every application in that finance year */
  scope: z.enum(["payments", "all"]).default("payments"),
});

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const parsed = querySchema.safeParse({
    year: request.nextUrl.searchParams.get("year"),
    scope: request.nextUrl.searchParams.get("scope") ?? "payments",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid year or scope." }, { status: 400 });
  }

  const { year, scope } = parsed.data;

  const rows = await prisma.membershipApplication.findMany({
    orderBy: [{ paidAt: "desc" }, { approvedAt: "desc" }, { createdAt: "desc" }],
  });

  let filtered = filterApplicationsByFinanceYear(rows, year);

  if (scope === "payments") {
    filtered = filtered.filter(
      (r) =>
        r.paidAt != null ||
        r.paymentStatus === "submitted" ||
        r.paymentStatus === "verified" ||
        r.status === "payment_submitted" ||
        r.status === "approved"
    );
  }

  const serialized = serializeRowsForExport(filtered);
  const csv = buildMembershipPaymentsCsv(serialized);
  const filename = `gcs-membership-payments-${year}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Export-Count": String(serialized.length),
    },
  });
}
