import { sendEmail } from "@/lib/send-email";

export type AnnouncementResourceLink = {
  label: string;
  url: string;
  kind?: "conference" | "video" | "summary" | "document" | "link";
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resourceKindLabel(kind: AnnouncementResourceLink["kind"]): string {
  switch (kind) {
    case "conference":
      return "Conference";
    case "video":
      return "Video";
    case "summary":
      return "Summary";
    case "document":
      return "Document";
    default:
      return "Resource";
  }
}

function renderResourceListHtml(links: AnnouncementResourceLink[]): string {
  if (links.length === 0) return "";
  const items = links
    .map(
      (link) => `
      <li style="margin:0 0 0.5rem;padding:0">
        <a href="${escapeHtml(link.url)}" style="color:#1d4ed8;font-weight:600;text-decoration:none">${escapeHtml(link.label)}</a>
        <span style="margin-left:0.4rem;display:inline-block;padding:0.05rem 0.45rem;border-radius:999px;background:#e0e7ff;color:#1e3a8a;font-size:0.7rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase">${escapeHtml(resourceKindLabel(link.kind))}</span>
      </li>`
    )
    .join("");
  return `
  <div style="margin:1.25rem 0;padding:1rem 1.25rem;border-radius:0.75rem;border:1px solid #c7d2fe;background:#eef2ff">
    <p style="margin:0 0 0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#1e3a8a">Members-only resources</p>
    <ul style="margin:0;padding:0 0 0 1rem;color:#1f2937">${items}</ul>
  </div>`;
}

function renderResourceListText(links: AnnouncementResourceLink[]): string {
  if (links.length === 0) return "";
  const lines = links.map((link) => `- ${link.label} (${resourceKindLabel(link.kind)}): ${link.url}`);
  return `\n\nMembers-only resources:\n${lines.join("\n")}`;
}

export function buildMemberAnnouncementEmail(params: {
  fullName: string;
  title: string;
  subject: string;
  preview: string;
  bodyHtml: string;
  bodyText: string;
  portalUrl: string;
  publicHref?: string | null;
  goLiveAt?: Date | null;
  resourceLinks?: AnnouncementResourceLink[];
}) {
  const goLiveLine =
    params.goLiveAt != null
      ? `\nPublic release: ${params.goLiveAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}`
      : "";
  const publicLine = params.publicHref ? `\nWhen public: ${params.publicHref}` : "";
  const resourceLinks = params.resourceLinks ?? [];

  const text = `Dear ${params.fullName},

${params.bodyText}${renderResourceListText(resourceLinks)}

This message was sent to members before the wider public announcement.
Open your member portal: ${params.portalUrl}${goLiveLine}${publicLine}

Ghana Chemical Society`;

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a;max-width:36rem;margin:0 auto;padding:1.5rem">
  <p style="margin:0 0 0.5rem;font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#1d4ed8">Members first</p>
  <p>Dear ${escapeHtml(params.fullName)},</p>
  <div style="margin:1.25rem 0;padding:1rem 1.25rem;border-radius:0.75rem;background:#f8fafc;border:1px solid #e2e8f0">
    ${params.bodyHtml}
  </div>
  ${renderResourceListHtml(resourceLinks)}
  <p style="margin:1.25rem 0">
    <a href="${escapeHtml(params.portalUrl)}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:0.65rem 1.1rem;border-radius:0.65rem;font-weight:600">View in member portal</a>
  </p>
  ${
    params.publicHref
      ? `<p style="font-size:0.875rem;color:#64748b">Will appear publicly at: <a href="${escapeHtml(params.publicHref)}">${escapeHtml(params.publicHref)}</a></p>`
      : ""
  }
  ${
    params.goLiveAt
      ? `<p style="font-size:0.875rem;color:#64748b">Scheduled for public release: ${escapeHtml(
          params.goLiveAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
        )}</p>`
      : ""
  }
  <p style="margin-top:2rem;font-size:0.875rem;color:#94a3b8">Ghana Chemical Society — member bulletin</p>
</body>
</html>`;

  return { subject: params.subject, text, html };
}

export async function sendMemberAnnouncementEmail(params: {
  to: string;
  fullName: string;
  title: string;
  subject: string;
  preview: string;
  bodyHtml: string;
  bodyText: string;
  portalUrl: string;
  publicHref?: string | null;
  goLiveAt?: Date | null;
  resourceLinks?: AnnouncementResourceLink[];
}) {
  const built = buildMemberAnnouncementEmail(params);
  return sendEmail({ to: params.to, subject: built.subject, html: built.html, text: built.text });
}
