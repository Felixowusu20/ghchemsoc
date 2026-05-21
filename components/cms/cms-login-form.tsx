"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cmsCredentials } from "@/lib/cms-fetch";
import { cn } from "@/lib/utils";

const field =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-gcs-primary focus:outline-none focus:ring-2 focus:ring-gcs-primary/20";

const label = "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-700";

export function CmsLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/auth/me", cmsCredentials);
      if (res.ok) router.replace("/cms");
    })();
  }, [router]);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_40px_-12px_rgba(15,23,42,0.1)] sm:p-8">
      <div className="text-left">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Sign in with your administrator email and password to manage the public website.
        </p>
      </div>

      {err ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          {err}
        </p>
      ) : null}

      <form
        className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              ...cmsCredentials,
              body: JSON.stringify({ email, password }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
              setErr(data.error ?? "Sign in failed");
              return;
            }
            router.push("/cms");
            router.refresh();
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label className={label} htmlFor="cms-login-email">
            Email
          </label>
          <Input
            id="cms-login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(field)}
          />
        </div>
        <div>
          <label className={label} htmlFor="cms-login-password">
            Password
          </label>
          <Input
            id="cms-login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(field)}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-xl bg-gcs-primary text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-gcs-primary-hover disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
        First time here?{" "}
        <Link
          href="/cms/register"
          className="font-semibold text-gcs-primary underline-offset-2 hover:text-gcs-primary-hover hover:underline"
        >
          Create your admin account
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-slate-600">
        GCS member?{" "}
        <Link
          href="/login?role=member"
          className="font-semibold text-gcs-primary underline-offset-2 hover:text-gcs-primary-hover hover:underline"
        >
          Member sign-in
        </Link>
      </p>
    </div>
  );
}
