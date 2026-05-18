import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MembershipRegistrationForm } from "@/components/membership/membership-registration-form";
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Check,
    FileText,
    FlaskConical,
    KeyRound,
    Shield,
    Sparkles,
    Users,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Membership registration and renewal | Ghana Chemical Society",
    description:
        "Register or renew your Ghana Chemical Society membership—certificate name, affiliation, and declaration.",
};

const steps = [
    { icon: FileText, label: "Complete the form", detail: "Certificate name & declaration" },
    { icon: Sparkles, label: "Receive member ID", detail: "Shown after you submit" },
    { icon: KeyRound, label: "Open your portfolio", detail: "Sign in on this device" },
];

const benefits = [
    {
        icon: CalendarDays,
        text: "Reduced rates at GCS conferences and symposia",
    },
    {
        icon: BookOpen,
        text: "Publications and technical notices",
    },
    {
        icon: Users,
        text: "Networking across universities, industry, and regulators",
    },
    {
        icon: Shield,
        text: "Voting and committees (by tier)",
    },
];

export default function MembershipPage() {
    return (
        <>
            <Header />
            <main className="relative min-h-screen overflow-hidden bg-white pb-20 pt-28 md:pb-28 md:pt-32">
                <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-50/40 via-white to-white -z-10"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl -z-10"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,#1e40af_1px,transparent_0)] [background-size:28px_28px] -z-10"
                    aria-hidden
                />

                <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12">
                    <header className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gcs-muted-text shadow-sm">
                            <FlaskConical className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
                            Membership
                        </div>
                        <h1 className="gcs-page-title">
                            Membership registration and renewal
                        </h1>
                        <p className="gcs-lead mx-auto mt-5 max-w-2xl lg:mx-0 lg:max-w-xl">
                            Complete the form below for new membership or annual renewal. The secretariat will confirm your
                            record and share payment details where they apply.
                        </p>

                        <ol className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3 lg:mx-0 lg:max-w-3xl">
                            {steps.map((step, i) => (
                                <li
                                    key={step.label}
                                    className="flex flex-col items-center gap-2 rounded-2xl border border-gcs-border/70 bg-white px-4 py-4 text-center shadow-sm ring-1 ring-gcs-border/10 sm:items-start sm:text-left"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                                        <step.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gcs-muted-text">
                                        Step {i + 1}
                                    </span>
                                    <span className="text-sm font-semibold text-gcs-foreground">{step.label}</span>
                                    <span className="text-xs leading-snug text-gcs-muted-text">{step.detail}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-4 rounded-2xl border border-gcs-primary/15 bg-gradient-to-br from-gcs-primary/[0.04] via-white to-white p-5 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between lg:mx-0 lg:max-w-2xl">
                            <div className="flex gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gcs-primary text-white shadow-md shadow-blue-500/20">
                                    <KeyRound className="h-5 w-5" strokeWidth={2} aria-hidden />
                                </span>
                                <p className="text-sm text-gcs-muted-text">
                                    <span className="font-semibold text-gcs-foreground">Returning member?</span>
                                    <br />
                                    Sign in with your email and GCS member ID to open your portfolio.
                                </p>
                            </div>
                            <Link
                                href="/login?role=member"
                                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-gcs-primary/20 bg-gcs-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gcs-primary-hover"
                            >
                                Member sign-in
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </div>
                    </header>

                    <div className="mx-auto mt-14 max-w-3xl lg:mt-16 lg:grid lg:max-w-none lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
                        <div className="lg:col-span-7 xl:col-span-8">
                            <MembershipRegistrationForm />
                        </div>

                        <aside className="mt-12 lg:col-span-5 lg:mt-0 xl:col-span-4">
                            <div className="lg:sticky lg:top-32 space-y-6">
                                <div className="overflow-hidden rounded-[1.75rem] border border-gcs-border/80 bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-gcs-border/15">
                                    <div className="border-b border-gcs-border/60 bg-gradient-to-br from-gcs-primary via-blue-700 to-sky-700 px-6 py-6 text-white">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Member benefits</p>
                                        <p className="mt-2 text-sm leading-relaxed text-white/90">
                                            What you unlock as part of the GCS community.
                                        </p>
                                    </div>
                                    <ul className="divide-y divide-gcs-border/50 p-2">
                                        {benefits.map(({ icon: Icon, text }) => (
                                            <li key={text} className="flex gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-neutral-50/80">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                                    <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                                                </span>
                                                <span className="pt-1.5 text-sm leading-relaxed text-gcs-foreground">{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t border-gcs-border/50 bg-neutral-50/50 px-6 py-5">
                                        <p className="text-sm font-semibold text-gcs-foreground">Offline or bulk applications</p>
                                        <p className="mt-2 text-sm leading-relaxed text-gcs-muted-text">
                                            Request a PDF or discuss institutional membership with the secretariat.
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gcs-primary shadow-sm ring-1 ring-gcs-border/60 transition hover:bg-gcs-primary hover:text-white"
                                        >
                                            Contact the secretariat
                                            <ArrowRight className="h-4 w-4" aria-hidden />
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex gap-3 rounded-2xl border border-gcs-border/80 bg-white p-4 shadow-sm ring-1 ring-gcs-border/10">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                                        <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
                                    </span>
                                    <p className="text-xs leading-relaxed text-gcs-muted-text">
                                        GCS uses your data only to manage membership. We do not sell personal information.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-dashed border-gcs-border bg-white/80 px-4 py-4">
                                    <ul className="space-y-2 text-xs text-gcs-muted-text">
                                        {["Secure submission", "Secretariat review", "Member ID on this device"].map((item) => (
                                            <li key={item} className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
