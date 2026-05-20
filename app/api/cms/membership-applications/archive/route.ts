import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import {
  filterApplicationsByFinanceYear,
  isArchivableMembershipRecord,
} from "@/lib/membership-payments-export";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  year: z.number().int().min(2020).max(2100),
  /** Must match export year; prevents accidental deletes */
  confirmYear: z.number().int(),
});

export async function POST(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { year, confirmYear } = parsed.data;
  const currentYear = new Date().getUTCFullYear();

  if (year !== confirmYear) {
    return NextResponse.json({ error: "Confirmation year does not match." }, { status: 400 });
  }

  if (year >= currentYear) {
    return NextResponse.json(
      { error: "Only records from past calendar years can be archived. Export the current year first." },
      { status: 400 }
    );
  }

  const candidates = await prisma.membershipApplication.findMany({
    select: {
      id: true,
      status: true,
      paidAt: true,
      approvedAt: true,
      createdAt: true,
      fullName: true,
      email: true,
    },
  });

  const inYear = filterApplicationsByFinanceYear(candidates, year);
  const archivable = inYear.filter((r) => isArchivableMembershipRecord(r, year));

  if (archivable.length === 0) {
    return NextResponse.json({
      ok: true,
      deleted: 0,
      skipped: inYear.length,
      message:
        "Nothing to remove. Only incomplete or rejected applications from past years can be deleted. Approved members are kept.",
    });
  }

  const result = await prisma.membershipApplication.deleteMany({
    where: { id: { in: archivable.map((r) => r.id) } },
  });

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    skipped: inYear.length - archivable.length,
    year,
    message: `Removed ${result.count} incomplete/rejected record(s) from ${year}. Approved members were not deleted.`,
  });
}

/** Preview counts before archive */
export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? Number.parseInt(yearParam, 10) : NaN;
  if (!Number.isFinite(year)) {
    return NextResponse.json({ error: "year query param required" }, { status: 400 });
  }

  const currentYear = new Date().getUTCFullYear();
  const rows = await prisma.membershipApplication.findMany({
    select: { id: true, status: true, paidAt: true, approvedAt: true, createdAt: true },
  });

  const inYear = filterApplicationsByFinanceYear(rows, year);
  const archivable = inYear.filter((r) => isArchivableMembershipRecord(r, year));
  const approved = inYear.filter((r) => r.status === "approved").length;
  const paymentSubmitted = inYear.filter((r) => r.status === "payment_submitted").length;

  return NextResponse.json({
    year,
    totalInYear: inYear.length,
    canDelete: archivable.length,
    keptApproved: approved,
    keptPendingVerification: paymentSubmitted,
    canArchiveYear: year < currentYear,
  });
}
