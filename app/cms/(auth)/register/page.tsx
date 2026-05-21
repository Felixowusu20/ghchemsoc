"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import type { AdminRegistrationStatus } from "@/lib/admin-registration";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput } from "@/components/cms/cms-ui";

function RegisterIntro({ status }: { status: AdminRegistrationStatus }) {
  if (status.isFirstAdmin) {
    return (
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        You are creating the <strong className="font-medium text-slate-200">first</strong> administrator account for
        this site. Choose a work email and a strong password — you will use these each time you sign in to the admin area.
      </p>
    );
  }

  if (status.openRegistration) {
    return (
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Create your administrator account to manage the Ghana Chemical Society website. After signing up you can edit
        pages, events, news, and membership from the dashboard.
      </p>
    );
  }

  if (status.requiresSetupCode) {
    return (
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Enter the <strong className="font-medium text-slate-200">setup code</strong> you received from your web
        developer or site owner, then choose your email and password.
      </p>
    );
  }

  return (
    <p className="mt-2 text-sm leading-relaxed text-amber-200/90">
      New accounts are not open on this site. If you already have access,{" "}
      <Link href="/cms/login" className="font-semibold text-sky-400 hover:text-sky-300">
        sign in
      </Link>
      . Otherwise ask your administrator to enable registration or send you a setup code.
    </p>
  );
}

export default function CmsRegisterPage() {
  const router = useRouter();
  const [status, setStatus] = useState<AdminRegistrationStatus | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const [meRes, statusRes] = await Promise.all([
        fetch("/api/auth/me", cmsCredentials),
        fetch("/api/auth/register/status"),
      ]);
      if (meRes.ok) {
        router.replace("/cms");
        return;
      }
      if (statusRes.ok) {
        setStatus((await statusRes.json()) as AdminRegistrationStatus);
      }
    })();
  }, [router]);

  const canSubmit =
    status &&
    (status.isFirstAdmin || status.openRegistration || status.requiresSetupCode);

  const showSetupCode = status?.requiresSetupCode ?? false;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gcs-primary/25 via-slate-950 to-slate-950"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Ghana Chemical Society</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Create your admin account</h1>
          {status ? <RegisterIntro status={status} /> : (
            <p className="mt-2 text-sm text-slate-500">Loading…</p>
          )}
        </div>

        <CmsCard className="border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {err ? <p className="mb-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">{err}</p> : null}

          {canSubmit ? (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setErr(null);

                if (password !== confirmPassword) {
                  setErr("Passwords do not match.");
                  return;
                }

                setLoading(true);
                try {
                  const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    ...cmsCredentials,
                    body: JSON.stringify({
                      email,
                      password,
                      name: name.trim() || undefined,
                      registrationSecret: showSetupCode ? setupCode.trim() : undefined,
                    }),
                  });
                  const data = (await res.json().catch(() => ({}))) as { error?: string };
                  if (!res.ok) {
                    setErr(data.error ?? `Registration failed (${res.status})`);
                    return;
                  }
                  router.push("/cms");
                  router.refresh();
                } finally {
                  setLoading(false);
                }
              }}
            >
              {showSetupCode ? (
                <label>
                  <CmsFieldLabel className="text-slate-300">Setup code</CmsFieldLabel>
                  <CmsInput
                    type="password"
                    required
                    autoComplete="off"
                    placeholder="From your site administrator"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
                  />
                </label>
              ) : null}

              <label>
                <CmsFieldLabel className="text-slate-300">Work email</CmsFieldLabel>
                <CmsInput
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </label>

              <label>
                <CmsFieldLabel className="text-slate-300">Your name (optional)</CmsFieldLabel>
                <CmsInput
                  placeholder="e.g. Secretariat team"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </label>

              <label>
                <CmsFieldLabel className="text-slate-300">Password (at least 8 characters)</CmsFieldLabel>
                <CmsInput
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </label>

              <label>
                <CmsFieldLabel className="text-slate-300">Confirm password</CmsFieldLabel>
                <CmsInput
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </label>

              <CmsButton type="submit" disabled={loading} className="mt-2 w-full py-3">
                {loading ? "Creating account…" : "Create account & open dashboard"}
              </CmsButton>
            </form>
          ) : status ? (
            <p className="text-center text-sm text-slate-400">
              <Link href="/cms/login" className="font-semibold text-sky-400 hover:text-sky-300">
                Go to sign in
              </Link>
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/cms/login" className="font-semibold text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </CmsCard>
      </div>
    </main>
  );
}
