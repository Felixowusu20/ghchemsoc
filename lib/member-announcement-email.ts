import { sendEmail } from "@/lib/send-email";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
}) {
  const goLiveLine =
    params.goLiveAt != null
      ? `\nPublic release: ${params.goLiveAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}`
      : "";
  const publicLine = params.publicHref ? `\nWhen public: ${params.publicHref}` : "";

  const text = `Dear ${params.fullName},

${params.bodyText}

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
}) {
  const built = buildMemberAnnouncementEmail(params);
  return sendEmail({ to: params.to, subject: built.subject, html: built.html, text: built.text });
}
