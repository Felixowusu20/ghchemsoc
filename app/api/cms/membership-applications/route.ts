import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { appBaseUrl } from "@/lib/app-url";
import {
  generateMembershipMemberId,
  serializeMembershipApplication,
} from "@/lib/membership-application";
import { sendMembershipApprovalEmail } from "@/lib/membership-approval-email";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const status = request.nextUrl.searchParams.get("status");
  const pendingOnly = request.nextUrl.searchParams.get("pending") === "1";

  const where = pendingOnly
    ? { status: "payment_submitted" as const, paymentStatus: "submitted" as const }
    : status
      ? { status: status as "pending_payment" | "payment_submitted" | "approved" | "rejected" }
      : undefined;

  const [rows, stats] = await Promise.all([
    prisma.membershipApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.membershipApplication.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const verifiedRevenue = await prisma.membershipApplication.aggregate({
    where: { paymentStatus: "verified" },
    _sum: { amountGhs: true },
    _count: { _all: true },
  });

  const submittedRevenue = await prisma.membershipApplication.aggregate({
    where: { status: "payment_submitted" },
    _sum: { amountGhs: true },
    _count: { _all: true },
  });

  const pendingVerifyCount = await prisma.membershipApplication.count({
    where: { status: "payment_submitted", paymentStatus: "submitted" },
  });

  const statusCounts = Object.fromEntries(stats.map((s) => [s.status, s._count._all]));

  return NextResponse.json({
    applications: rows.map(serializeMembershipApplication),
    dashboard: {
      pendingVerification: pendingVerifyCount,
      verifiedRevenueGhs: verifiedRevenue._sum.amountGhs ?? 0,
      verifiedCount: verifiedRevenue._count._all,
      awaitingVerificationGhs: submittedRevenue._sum.amountGhs ?? 0,
      awaitingVerificationCount: submittedRevenue._count._all,
      approved: statusCounts.approved ?? 0,
      rejected: statusCounts.rejected ?? 0,
      pendingPayment: statusCounts.pending_payment ?? 0,
    },
  });
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    applicationId: z.string().min(1),
    adminNote: z.string().optional(),
  }),
  z.object({
    action: z.literal("reject"),
    applicationId: z.string().min(1),
    adminNote: z.string().optional(),
  }),
  z.object({
    action: z.literal("mark_read"),
    applicationId: z.string().min(1),
    read: z.boolean(),
  }),
]);

export async function PATCH(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await prisma.membershipApplication.findUnique({
    where: { id: data.applicationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (data.action === "mark_read") {
    const row = await prisma.membershipApplication.update({
      where: { id: existing.id },
      data: { read: data.read },
    });
    return NextResponse.json({ application: serializeMembershipApplication(row) });
  }

  if (data.action === "reject") {
    const row = await prisma.membershipApplication.update({
      where: { id: existing.id },
      data: {
        status: "rejected",
        paymentStatus: existing.paymentStatus === "verified" ? "verified" : "failed",
        rejectedAt: new Date(),
        adminNote: data.adminNote ?? null,
        read: true,
      },
    });
    return NextResponse.json({ application: serializeMembershipApplication(row) });
  }

  if (existing.status !== "payment_submitted") {
    return NextResponse.json(
      { error: "Only applications with submitted payment can be approved." },
      { status: 400 }
    );
  }

  const memberId = generateMembershipMemberId();
  const now = new Date();

  const row = await prisma.membershipApplication.update({
    where: { id: existing.id },
    data: {
      status: "approved",
      paymentStatus: "verified",
      memberId: memberId.trim(),
      email: existing.email.trim().toLowerCase(),
      approvedAt: now,
      adminNote: data.adminNote ?? null,
      read: true,
    },
  });

  const emailOutcome = await sendMembershipApprovalEmail({
    baseUrl: appBaseUrl(request),
    fullName: row.fullName,
    email: row.email,
    memberId,
    applicationId: row.id,
  });

  return NextResponse.json({
    application: serializeMembershipApplication(row),
    email: {
      sent: emailOutcome.sent,
      to: row.email,
      mode: emailOutcome.sent ? emailOutcome.mode : undefined,
      error: !emailOutcome.sent ? emailOutcome.error : undefined,
      subject: emailOutcome.preview?.subject,
      loginUrl: emailOutcome.preview?.loginUrl,
    },
  });
}
