"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gooeyToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
    loadMemberProfile,
    saveMemberAuthSession,
    saveMemberProfile,
    type MemberProfile,
    verifyMemberCredentials,
} from "@/lib/member-profile";

const field =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-gcs-primary focus:outline-none focus:ring-2 focus:ring-gcs-primary/20";

const label = "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-700";

const tabBtn =
    "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gcs-primary focus-visible:ring-offset-2";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const memberIdFromUrl = searchParams.get("memberId")?.trim() ?? "";
    const memberEmailFromUrl = searchParams.get("email")?.trim() ?? "";
    const urlWantsMember = searchParams.get("role") === "member";
    const [tabOverride, setTabOverride] = useState<"staff" | "member" | null>(null);

    useEffect(() => {
        queueMicrotask(() => setTabOverride(null));
    }, [urlWantsMember]);

    const mode = tabOverride ?? (urlWantsMember ? "member" : "staff");

    return (
        <form
            className="w-full"
            onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);

                if (mode === "member") {
                    const email = String(fd.get("member-email") ?? "").trim();
                    const memberId = String(fd.get("memberId") ?? "").trim();
                    if (!email) {
                        gooeyToast.error("Email required", {
                            description: "Use the same email you submitted on your membership application.",
                            preset: "smooth",
                            spring: false,
                        });
                        return;
                    }
                    if (!memberId) {
                        gooeyToast.error("Member ID required", {
                            description: "Enter the GCS member ID you received after applying (e.g. GCS-26-…).",
                            preset: "smooth",
                            spring: false,
                        });
                        return;
                    }
                    startTransition(async () => {
                        let profile: MemberProfile | null = null;

                        const local = verifyMemberCredentials(email, memberId);
                        if (local.ok) {
                            profile = loadMemberProfile();
                        } else {
                            try {
                                const res = await fetch("/api/public/member-login", {
                                    method: "POST",
                                    credentials: "include",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email, memberId }),
                                });
                                const data = (await res.json()) as {
                                    ok?: boolean;
                                    profile?: MemberProfile;
                                    message?: string;
                                };
                                if (data.ok && data.profile) {
                                    profile = data.profile;
                                } else {
                                    gooeyToast.error("Could not verify member access", {
                                        description:
                                            data.message ??
                                            "Check your approval email for the correct member ID.",
                                        preset: "smooth",
                                        spring: false,
                                    });
                                    return;
                                }
                            } catch {
                                gooeyToast.error("Could not verify member access", {
                                    description: "Network error. Try again in a moment.",
                                    preset: "smooth",
                                    spring: false,
                                });
                                return;
                            }
                        }

                        if (!profile) return;
                        saveMemberProfile(profile);
                        saveMemberAuthSession(profile);
                        gooeyToast.success("Welcome back", {
                            description: "Your member account is signed in on this device.",
                            preset: "smooth",
                            spring: false,
                        });
                        router.push("/membership/account");
                    });
                    return;
                }

                const email = String(fd.get("email") ?? "").trim();
                const password = String(fd.get("password") ?? "");
                if (!email) {
                    gooeyToast.error("Email required", {
                        description: "Enter the email associated with your account.",
                        preset: "smooth",
                        spring: false,
                    });
                    return;
                }
                if (!password) {
                    gooeyToast.error("Password required", {
                        description: "Enter your password to continue.",
                        preset: "smooth",
                        spring: false,
                    });
                    return;
                }
                startTransition(() => {
                    gooeyToast.success("Logged in", {
                        description: "Welcome back to the Ghana Chemical Society portal.",
                        preset: "smooth",
                        spring: false,
                    });
                    router.push("/dashboard");
                });
            }}
        >
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_4px_40px_-12px_rgba(15,23,42,0.1)] sm:p-8">
                <div className="text-left">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Members use email and member ID. Staff use email and password.
                    </p>
                </div>

                <div
                    className="mt-8 flex rounded-xl border border-slate-200 bg-slate-50/80 p-1"
                    role="tablist"
                    aria-label="Sign-in type"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "member"}
                        onClick={() => setTabOverride("member")}
                        className={cn(
                            tabBtn,
                            mode === "member"
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Member
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "staff"}
                        onClick={() => setTabOverride("staff")}
                        className={cn(
                            tabBtn,
                            mode === "staff"
                                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                                : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        Staff / admin
                    </button>
                </div>

                <div className="mt-8 space-y-5">
                    {mode === "member" ? (
                        <>
                            <div>
                                <label className={label} htmlFor="member-email">
                                    Email
                                </label>
                                <Input
                                    id="member-email"
                                    name="member-email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    key={memberEmailFromUrl || "member-email-default"}
                                    defaultValue={memberEmailFromUrl}
                                    placeholder="Same email as on your application"
                                    className={cn(field)}
                                />
                            </div>
                            <div>
                                <label className={label} htmlFor="memberId">
                                    Member ID
                                </label>
                                <Input
                                    id="memberId"
                                    name="memberId"
                                    key={memberIdFromUrl || "default"}
                                    defaultValue={memberIdFromUrl}
                                    required
                                    placeholder="e.g. GCS-26-A1B2C3D4"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    className={cn(field, "font-mono text-[13px] tracking-wide")}
                                />
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    Use the email and member ID from your approval message (after payment is verified).
                                    Works on any device once approved.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className={label} htmlFor="login-email">
                                    Email
                                </label>
                                <Input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="you@example.com"
                                    className={cn(field)}
                                />
                            </div>
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <label className={label} htmlFor="login-password">
                                        Password
                                    </label>
                                    <Link
                                        href="/contact"
                                        className="text-xs font-semibold text-gcs-primary hover:text-gcs-primary-hover hover:underline"
                                    >
                                        Need help?
                                    </Link>
                                </div>
                                <Input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className={cn(field)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="mt-8 h-12 w-full rounded-xl bg-gcs-primary text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-gcs-primary-hover disabled:opacity-60"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                            {mode === "member" ? "Verifying…" : "Signing in…"}
                        </>
                    ) : mode === "member" ? (
                        "Unlock member portfolio"
                    ) : (
                        "Sign in"
                    )}
                </Button>

                <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
                    New to GCS?{" "}
                    <Link
                        href="/membership"
                        className="font-semibold text-gcs-primary underline-offset-2 hover:text-gcs-primary-hover hover:underline"
                    >
                        Apply for membership
                    </Link>
                </p>
            </div>
        </form>
    );
}
