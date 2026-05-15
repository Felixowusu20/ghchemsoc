"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard, CmsFieldLabel, CmsInput } from "@/components/cms/cms-ui";

export default function CmsRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registrationSecret, setRegistrationSecret] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me", cmsCredentials);
      if (res.ok) router.replace("/cms");
    })();
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gcs-primary/25 via-slate-950 to-slate-950" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Ghana Chemical Society</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Create admin</h1>
          <p className="mt-2 text-sm text-slate-400">
            First account: no secret. After that, set <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">ADMIN_REGISTRATION_SECRET</code> in{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">.env</code>.
          </p>
        </div>
        <CmsCard className="border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {err ? <p className="mb-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">{err}</p> : null}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setErr(null);
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
                    registrationSecret: registrationSecret || undefined,
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
            <label>
              <CmsFieldLabel className="text-slate-300">Email</CmsFieldLabel>
              <CmsInput
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
              />
            </label>
            <label>
              <CmsFieldLabel className="text-slate-300">Password (min 8)</CmsFieldLabel>
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
              <CmsFieldLabel className="text-slate-300">Display name (optional)</CmsFieldLabel>
              <CmsInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
              />
            </label>
            <label>
              <CmsFieldLabel className="text-slate-300">Registration secret (after first user)</CmsFieldLabel>
              <CmsInput
                type="password"
                value={registrationSecret}
                onChange={(e) => setRegistrationSecret(e.target.value)}
                autoComplete="off"
                className="border-slate-600 bg-slate-800/80 text-white placeholder:text-slate-500"
              />
            </label>
            <CmsButton type="submit" disabled={loading} className="mt-2 w-full py-3">
              {loading ? "Creating…" : "Register & sign in"}
            </CmsButton>
          </form>
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
