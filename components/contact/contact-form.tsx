"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone: phone.trim() || null,
        message,
        companyWebsite: honeypot,
      }),
    });
    setStatus("idle");
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }
    setStatus("success");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMessage("");
  }

  return (
    <form className="relative mt-8 space-y-5" onSubmit={onSubmit}>
      <input
        type="text"
        name="companyWebsite"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">First name</label>
          <Input
            required
            className="h-12 rounded-xl border-gcs-border bg-white shadow-sm"
            placeholder="Ama"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">Last name</label>
          <Input
            required
            className="h-12 rounded-xl border-gcs-border bg-white shadow-sm"
            placeholder="Mensah"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">Email</label>
        <Input
          required
          type="email"
          className="h-12 rounded-xl border-gcs-border bg-white shadow-sm"
          placeholder="you@institution.edu.gh"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">Phone (optional)</label>
        <Input
          type="tel"
          className="h-12 rounded-xl border-gcs-border bg-white shadow-sm"
          placeholder="+233 …"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gcs-muted-text">Message</label>
        <textarea
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[140px] w-full resize-none rounded-xl border border-gcs-border bg-white px-3 py-3 text-sm shadow-sm outline-none ring-gcs-primary/20 focus:border-gcs-primary focus:ring-2"
          placeholder="How can we help?"
        />
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {status === "success" ? (
        <p className="text-sm font-medium text-emerald-700">Thank you — your message has been sent. The secretariat will respond when they can.</p>
      ) : null}
      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-12 rounded-full bg-gcs-primary px-8 font-semibold text-white hover:bg-gcs-primary-hover disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
        <Send className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
