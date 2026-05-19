import type { MemberAnnouncement } from "@prisma/client";
import { normalizeMembershipEmail } from "@/lib/member-email";
import { sendMemberAnnouncementEmail } from "@/lib/member-announcement-email";
import { prisma } from "@/lib/prisma";

export type MemberResourceKind = "conference" | "video" | "summary" | "document" | "link";

export type MemberResourceLink = {
  label: string;
  url: string;
  kind?: MemberResourceKind;
};

export type MemberAnnouncementDto = {
  id: string;
  title: string;
  subject: string;
  preview: string;
  bodyHtml: string;
  bodyText: string;
  publicHref: string | null;
  goLiveAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  emailSuccessCount: number;
  resourceLinks: MemberResourceLink[];
  createdAt: string;
};

export type MemberNotificationDto = {
  id: string;
  deliveryId: string;
  announcementId: string;
  title: string;
  preview: string;
  bodyHtml: string;
  publicHref: string | null;
  goLiveAt: string | null;
  sentAt: string;
  readAt: string | null;
};

const ALLOWED_RESOURCE_KINDS: ReadonlySet<MemberResourceKind> = new Set([
  "conference",
  "video",
  "summary",
  "document",
  "link",
]);

export function parseResourceLinks(stored: string | null | undefined): MemberResourceLink[] {
  if (!stored) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: MemberResourceLink[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const label = typeof e.label === "string" ? e.label.trim() : "";
    const url = typeof e.url === "string" ? e.url.trim() : "";
    if (!label || !url) continue;
    const rawKind = typeof e.kind === "string" ? (e.kind as MemberResourceKind) : undefined;
    const link: MemberResourceLink = { label, url };
    if (rawKind && ALLOWED_RESOURCE_KINDS.has(rawKind)) {
      link.kind = rawKind;
    }
    out.push(link);
  }
  return out;
}

export function stringifyResourceLinks(links: MemberResourceLink[]): string | null {
  const cleaned = links
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
      kind: link.kind,
    }))
    .filter((link) => link.label.length > 0 && link.url.length > 0);
  if (cleaned.length === 0) return null;
  return JSON.stringify(cleaned);
}

export function mapAnnouncement(row: MemberAnnouncement): MemberAnnouncementDto {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    preview: row.preview,
    bodyHtml: row.bodyHtml,
    bodyText: row.bodyText,
    publicHref: row.publicHref,
    goLiveAt: row.goLiveAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
    recipientCount: row.recipientCount,
    emailSuccessCount: row.emailSuccessCount,
    resourceLinks: parseResourceLinks(row.resourceLinks),
    createdAt: row.createdAt.toISOString(),
  };
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export async function sendAnnouncementToApprovedMembers(
  announcementId: string,
  baseUrl: string
): Promise<{ recipientCount: number; emailSuccessCount: number; errors: string[] }> {
  const announcement = await prisma.memberAnnouncement.findUnique({ where: { id: announcementId } });
  if (!announcement) throw new Error("Announcement not found");
  if (announcement.sentAt) throw new Error("This announcement was already sent.");

  const members = await prisma.membershipApplication.findMany({
    where: { status: "approved", memberId: { not: null } },
    orderBy: { fullName: "asc" },
  });

  const portalUrl = `${baseUrl.replace(/\/$/, "")}/membership/account/inbox`;
  const errors: string[] = [];
  let emailSuccessCount = 0;

  for (const member of members) {
    await prisma.memberAnnouncementDelivery.upsert({
      where: {
        announcementId_applicationId: {
          announcementId,
          applicationId: member.id,
        },
      },
      create: { announcementId, applicationId: member.id },
      update: {},
    });

    const result = await sendMemberAnnouncementEmail({
      to: normalizeMembershipEmail(member.email),
      fullName: member.fullName,
      title: announcement.title,
      subject: announcement.subject,
      preview: announcement.preview,
      bodyHtml: announcement.bodyHtml,
      bodyText: announcement.bodyText,
      portalUrl,
      publicHref: announcement.publicHref,
      goLiveAt: announcement.goLiveAt,
      resourceLinks: parseResourceLinks(announcement.resourceLinks),
    });

    if (result.ok) {
      emailSuccessCount += 1;
      await prisma.memberAnnouncementDelivery.update({
        where: {
          announcementId_applicationId: {
            announcementId,
            applicationId: member.id,
          },
        },
        data: { emailSent: true, emailError: null },
      });
    } else {
      errors.push(`${member.email}: ${result.error}`);
      await prisma.memberAnnouncementDelivery.update({
        where: {
          announcementId_applicationId: {
            announcementId,
            applicationId: member.id,
          },
        },
        data: { emailSent: false, emailError: result.error },
      });
    }
  }

  await prisma.memberAnnouncement.update({
    where: { id: announcementId },
    data: {
      sentAt: new Date(),
      recipientCount: members.length,
      emailSuccessCount,
    },
  });

  return { recipientCount: members.length, emailSuccessCount, errors };
}

export async function getMemberNotificationsForApplication(applicationId: string) {
  const rows = await prisma.memberAnnouncementDelivery.findMany({
    where: { applicationId },
    include: { announcement: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows
    .filter((r) => r.announcement.sentAt != null)
    .map((r) => ({
      id: r.announcement.id,
      deliveryId: r.id,
      announcementId: r.announcementId,
      title: r.announcement.title,
      preview: r.announcement.preview,
      bodyHtml: r.announcement.bodyHtml,
      publicHref: r.announcement.publicHref,
      goLiveAt: r.announcement.goLiveAt?.toISOString() ?? null,
      sentAt: r.announcement.sentAt!.toISOString(),
      readAt: r.readAt?.toISOString() ?? null,
    })) satisfies MemberNotificationDto[];
}

export async function countUnreadMemberNotifications(applicationId: string): Promise<number> {
  return prisma.memberAnnouncementDelivery.count({
    where: {
      applicationId,
      readAt: null,
      announcement: { sentAt: { not: null } },
    },
  });
}
