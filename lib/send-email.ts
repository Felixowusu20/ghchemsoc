const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { ok: true; mode: "resend" | "logged"; id?: string }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim();
  if (!isValidEmail(to)) {
    return { ok: false, error: "Invalid recipient email address." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MEMBERSHIP_EMAIL_FROM?.trim() ?? process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev] — not sent (configure RESEND_API_KEY + MEMBERSHIP_EMAIL_FROM to send for real)");
      console.info("[email:dev] To:", to);
      console.info("[email:dev] Subject:", input.subject);
      console.info("[email:dev]\n", input.text);
      return { ok: true, mode: "logged" };
    }
    return {
      ok: false,
      error: "Email is not configured. Set RESEND_API_KEY and MEMBERSHIP_EMAIL_FROM in your environment.",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    let detail = await res.text();
    try {
      const parsed = JSON.parse(detail) as { message?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      /* plain text */
    }
    return { ok: false, error: detail || `Email provider error (${res.status})` };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, mode: "resend", id: data.id };
}
