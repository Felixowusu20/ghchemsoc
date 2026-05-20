import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import { appBaseUrl } from "@/lib/app-url";
import {
  generateMembershipMemberId,
  serializeMembershipApplication,
} from "@/lib/membership-application";
import { countMembershipAnnualStatuses } from "@/lib/membership-annual-status";
import { sendMembershipApprovalEmail } from "@/lib/membership-approval-email";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function membershipSearchWhere(q: string): Prisma.MembershipApplicationWhereInput {
  return {
    OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { institution: { contains: q, mode: "insensitive" } },
      { memberId: { contains: q, mode: "insensitive" } },
      { paystackReference: { contains: q, mode: "insensitive" } },
      { payerPhone: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { paymentNote: { contains: q, mode: "insensitive" } },
      { id: { contains: q, mode: "insensitive" } },
    ],
  };
}

export async function GET(request: NextRequest) {
  const denied = await assertAdmin(request);
  if (denied) return denied;

  const status = request.nextUrl.searchParams.get("status");
  const pendingOnly = request.nextUrl.searchParams.get("pending") === "1";
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const statusWhere: Prisma.MembershipApplicationWhereInput | undefined = pendingOnly
    ? { status: "payment_submitted", paymentStatus: "submitted" }
    : status
      ? { status: status as "pending_payment" | "payment_submitted" | "approved" | "rejected" }
      : undefined;

  const andParts: Prisma.MembershipApplicationWhereInput[] = [];
  if (statusWhere) andParts.push(statusWhere);
  if (q) andParts.push(membershipSearchWhere(q));
  const listWhere = andParts.length > 0 ? { AND: andParts } : undefined;

  const [rows, stats] = await Promise.all([
    prisma.membershipApplication.findMany({
      where: listWhere,
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

  const approvedRows = await prisma.membershipApplication.findMany({
    where: { status: "approved", memberId: { not: null } },
    select: { status: true, paidAt: true, approvedAt: true },
  });
  const { active: activeMembers, inactive: inactiveMembers } =
    countMembershipAnnualStatuses(approvedRows);

  return NextResponse.json({
    applications: rows.map(serializeMembershipApplication),
    dashboard: {
      pendingVerification: pendingVerifyCount,
      verifiedRevenueGhs: verifiedRevenue._sum.amountGhs ?? 0,
      verifiedCount: verifiedRevenue._count._all,
      awaitingVerificationGhs: submittedRevenue._sum.amountGhs ?? 0,
      awaitingVerificationCount: submittedRevenue._count._all,
      approved: statusCounts.approved ?? 0,
      activeMembers,
      inactiveMembers,
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
  z.object({
    action: z.literal("delete"),
    applicationId: z.string().min(1),
  }),
  z.object({
    action: z.literal("delete_many"),
    applicationIds: z.array(z.string().min(1)).min(1).max(100),
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

  if (data.action === "delete_many") {
    const result = await prisma.membershipApplication.deleteMany({
      where: { id: { in: data.applicationIds } },
    });
    return NextResponse.json({ ok: true, deleted: result.count });
  }

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

  if (data.action === "delete") {
    await prisma.membershipApplication.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, deletedId: existing.id });
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
