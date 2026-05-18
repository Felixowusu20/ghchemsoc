"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Atom,
    BookOpen,
    Building2,
    CalendarDays,
    Check,
    Copy,
    CreditCard,
    FlaskConical,
    GraduationCap,
    Lock,
    LogOut,
    Mail,
    Microscope,
    Phone,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    clearMemberAuthSession,
    formatDeclarationDate,
    isMemberPortfolioUnlocked,
    loadMemberProfile,
    memberDisplayName,
    memberInitials,
    memberJobTitle,
    memberPhotoSrc,
    normalizeMemberId,
    type MemberProfile,
} from "@/lib/member-profile";

function formatDate(iso: string) {
    try {
        return new Intl.DateTimeFormat("en-GH", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function statusStyles(status: MemberProfile["payments"][number]["status"]) {
    switch (status) {
        case "completed":
            return "bg-emerald-50 text-emerald-800 ring-emerald-600/15";
        case "pending":
            return "bg-amber-50 text-amber-900 ring-amber-600/15";
        case "failed":
            return "bg-rose-50 text-rose-800 ring-rose-600/15";
        default:
            return "bg-neutral-100 text-gcs-foreground ring-gcs-border/40";
    }
}

const memberResources: {
    title: string;
    description: string;
    href: string;
    icon: typeof BookOpen;
    hint: string;
}[] = [
    {
        title: "Member publications shelf",
        description: "Curated notices, society journals, and technical digests reserved for members.",
        href: "/publications",
        icon: BookOpen,
        hint: "Updated quarterly",
    },
    {
        title: "Events & symposia",
        description: "Priority booking and member-only sessions at GCS conferences across Ghana.",
        href: "/events",
        icon: CalendarDays,
        hint: "Member rates apply",
    },
    {
        title: "Laboratory safety briefings",
        description: "Downloadable checklists and hazard communication templates for educators.",
        href: "/contact",
        icon: Microscope,
        hint: "Request access codes from secretariat",
    },
    {
        title: "Research ethics primer",
        description: "Guidance aligned with national standards for chemical research integrity.",
        href: "/about",
        icon: Shield,
        hint: "Member reading list",
    },
];

export function MemberAccountDashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<MemberProfile | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [idCopied, setIdCopied] = useState(false);

    const refreshFromStorage = useCallback(() => {
        setProfile(loadMemberProfile());
        setUnlocked(isMemberPortfolioUnlocked());
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            refreshFromStorage();
            setHydrated(true);
        });
    }, [refreshFromStorage]);

    const initials = useMemo(() => {
        if (!profile) return "";
        return memberInitials(profile);
    }, [profile]);

    const photoSrc = useMemo(() => (profile ? memberPhotoSrc(profile) : null), [profile]);

    const displayMemberId = useMemo(
        () => (profile ? normalizeMemberId(profile.memberId) : ""),
        [profile]
    );

    const copyMemberId = async () => {
        if (!displayMemberId) return;
        try {
            await navigator.clipboard.writeText(displayMemberId);
            setIdCopied(true);
            window.setTimeout(() => setIdCopied(false), 2000);
        } catch {
            setIdCopied(false);
        }
    };

    if (!hydrated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-gcs-muted-text">
                Loading your portfolio…
            </div>
        );
    }

    if (!profile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mx-auto max-w-lg rounded-[1.75rem] border border-gcs-border bg-white p-10 text-center shadow-[0_2px_32px_-12px_rgba(15,23,42,0.12)]"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gcs-primary/10 to-sky-100 text-gcs-primary ring-1 ring-gcs-primary/15">
                    <Lock className="h-8 w-8" aria-hidden />
                </div>
                <h1 className="mt-6 text-xl font-semibold tracking-tight text-gcs-foreground">Member portfolio</h1>
                <p className="mt-3 text-sm leading-relaxed text-gcs-muted-text">
                    Apply for membership on this device, then use{" "}
                    <Link href="/login?role=member" className="font-medium text-gcs-primary hover:underline">
                        member sign-in
                    </Link>{" "}
                    with your email and GCS member ID to unlock your portfolio.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-sm text-white hover:bg-gcs-primary-hover">
                        <Link href="/membership">Register / apply</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11 rounded-full border-gcs-border bg-transparent px-8 text-sm">
                        <Link href="/login?role=member">Member sign-in</Link>
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (profile && !unlocked) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mx-auto max-w-lg rounded-[1.75rem] border border-gcs-border bg-white p-10 text-center shadow-[0_2px_32px_-12px_rgba(15,23,42,0.12)]"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/90">
                    <Lock className="h-8 w-8" aria-hidden />
                </div>
                <h1 className="mt-6 text-xl font-semibold tracking-tight text-gcs-foreground">Sign in to view your portfolio</h1>
                <p className="mt-3 text-sm leading-relaxed text-gcs-muted-text">
                    We found your membership application on this browser. Enter the same email and your GCS member ID on
                    the member sign-in page—we verify them before showing resources and payment history.
                </p>
                <p className="mt-4 font-mono text-sm font-medium text-gcs-foreground">{displayMemberId}</p>
                <div className="mt-8 flex justify-center">
                    <Button asChild className="h-11 rounded-full bg-gcs-primary px-8 text-sm text-white hover:bg-gcs-primary-hover">
                        <Link
                            href={`/login?role=member&memberId=${encodeURIComponent(displayMemberId)}`}
                        >
                            Member sign-in
                        </Link>
                    </Button>
                </div>
            </motion.div>
        );
    }

    const profileFieldRows = [
        { label: "Email", value: profile.email, Icon: Mail },
        { label: "Phone", value: profile.phone || "—", Icon: Phone },
        { label: "Job title", value: memberJobTitle(profile) || "—", Icon: Building2 },
        { label: "Highest degree", value: profile.highestDegree || "—", Icon: GraduationCap },
        {
            label: "Declaration signed",
            value: ("declarationLegalName" in profile && profile.declarationLegalName) || "—",
            Icon: Shield,
        },
        {
            label: "Declaration date",
            value:
                "declarationDate" in profile && profile.declarationDate
                    ? formatDeclarationDate(profile.declarationDate)
                    : "—",
            Icon: CalendarDays,
        },
        { label: "Application submitted", value: formatDate(profile.registeredAt), Icon: CalendarDays },
    ];

    return (
        <div className="space-y-10 pb-4 md:space-y-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gcs-muted-text">Ghana Chemical Society</p>

            <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[1.75rem] border border-gcs-border bg-white shadow-[0_2px_48px_-16px_rgba(15,23,42,0.14)]"
            >
                <div
                    className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-200/35 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle_at_1px_1px,#1e40af_1px,transparent_0)] [background-size:22px_22px]"
                    aria-hidden
                />

                <div className="relative p-8 md:p-10 lg:p-12">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
                        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start lg:items-center">
                            <div className="relative shrink-0">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gcs-primary via-blue-600 to-sky-500 p-[3px] shadow-lg shadow-blue-500/25 md:h-36 md:w-36">
                                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-white/80">
                                        {photoSrc ? (
                                            <Image
                                                src={photoSrc}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                sizes="144px"
                                                unoptimized={photoSrc.startsWith("data:")}
                                            />
                                        ) : (
                                            <span className="text-3xl font-semibold tracking-tight text-gcs-primary md:text-4xl">
                                                {initials}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-gcs-primary to-blue-700 text-white shadow-md">
                                    <FlaskConical className="h-5 w-5" aria-hidden />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gcs-muted-text">Member profile</p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gcs-foreground md:text-4xl">
                                    {memberDisplayName(profile)}
                                </h1>
                                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-gcs-muted-text sm:justify-start md:text-base">
                                    <Building2 className="h-4 w-4 shrink-0 text-gcs-primary opacity-80" aria-hidden />
                                    <span>{profile.institution}</span>
                                </p>

                                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-stretch">
                                    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-2xl border border-gcs-border/80 bg-white px-4 py-3.5 shadow-sm sm:min-w-[240px] sm:max-w-md">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gcs-muted-text">
                                                Member credential
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => void copyMemberId()}
                                                className="flex shrink-0 items-center gap-1 rounded-lg border border-gcs-border bg-white px-2 py-1 text-xs font-medium text-gcs-foreground transition hover:border-gcs-primary/40 hover:text-gcs-primary"
                                            >
                                                {idCopied ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" aria-hidden />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-2 break-all font-mono text-base font-semibold tracking-tight text-gcs-foreground md:text-lg">
                                            {displayMemberId}
                                        </p>
                                    </div>
                                    <span className="inline-flex h-fit items-center justify-center gap-2 self-start rounded-full border border-blue-100 bg-blue-50/90 px-4 py-2.5 text-sm font-medium text-blue-950 shadow-sm">
                                        <Atom className="h-4 w-4 text-gcs-primary" aria-hidden />
                                        GCS member
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 border-t border-gcs-border/60 pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    clearMemberAuthSession();
                                    refreshFromStorage();
                                    router.refresh();
                                }}
                                className="h-11 rounded-full border-gcs-border bg-white text-gcs-foreground hover:bg-neutral-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                                Sign out
                            </Button>
                            <p className="max-w-[220px] text-center text-xs leading-relaxed text-gcs-muted-text lg:text-left">
                                Sign out locks the portfolio until you verify your email and member ID again on this device.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.section>

            <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 }}
                    className="xl:col-span-5"
                >
                    <div className="rounded-2xl border border-gcs-border bg-white p-6 shadow-sm md:p-8">
                        <div className="flex items-center gap-2 border-b border-gcs-border/60 pb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                                <FlaskConical className="h-4 w-4" aria-hidden />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold tracking-tight text-gcs-foreground">Laboratory profile</h2>
                                <p className="text-xs text-gcs-muted-text">Contact &amp; affiliation on file</p>
                            </div>
                        </div>
                        <ul className="mt-6 space-y-0 divide-y divide-gcs-border/50 rounded-xl border border-gcs-border/60 bg-white">
                            {profileFieldRows.map(({ label, value, Icon }) => (
                                <li key={label} className="flex gap-3 px-4 py-3.5 first:rounded-t-xl last:rounded-b-xl">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gcs-primary shadow-sm ring-1 ring-gcs-border/40">
                                        <Icon className="h-4 w-4" aria-hidden />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gcs-muted-text">{label}</p>
                                        <p className="mt-0.5 text-sm font-medium leading-snug text-gcs-foreground">{value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="xl:col-span-7"
                >
                    <div className="rounded-2xl border border-gcs-border bg-white p-6 shadow-sm md:p-8">
                        <div className="flex items-center gap-2 border-b border-gcs-border/60 pb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                <Lock className="h-4 w-4" aria-hidden />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold tracking-tight text-gcs-foreground">Members-only resources</h2>
                                <p className="text-xs text-gcs-muted-text">Curated for verified members</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-gcs-muted-text">
                            Entitlements finalize after the secretariat confirms your category and dues. Use these entry points
                            in the meantime.
                        </p>
                        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                            {memberResources.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.title}>
                                        <Link
                                            href={item.href}
                                            className="group flex h-full flex-col rounded-xl border border-gcs-border/60 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:border-gcs-primary/25 hover:ring-gcs-primary/10 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary ring-1 ring-gcs-primary/15">
                                                    <Icon className="h-5 w-5" aria-hidden />
                                                </span>
                                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gcs-muted-text">
                                                    {item.hint}
                                                </span>
                                            </div>
                                            <span className="mt-4 text-sm font-semibold text-gcs-foreground group-hover:text-gcs-primary">
                                                {item.title}
                                            </span>
                                            <span className="mt-2 text-sm leading-relaxed text-gcs-muted-text">{item.description}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </motion.section>
            </div>

            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.14 }}
                className="overflow-hidden rounded-2xl border border-gcs-border bg-white shadow-sm"
            >
                <div className="flex flex-col gap-1 border-b border-gcs-border/60 bg-gradient-to-r from-gcs-primary/[0.06] via-white to-white px-6 py-5 sm:flex-row sm:items-end sm:justify-between md:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gcs-primary shadow-sm ring-1 ring-gcs-border/40">
                            <CreditCard className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                            <h2 className="text-base font-semibold tracking-tight text-gcs-foreground">Payment history</h2>
                            <p className="text-xs text-gcs-muted-text">Ghana Cedis (GHS) where applicable</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gcs-border/60 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wide text-gcs-muted-text">
                            <tr>
                                <th className="px-6 py-3.5 md:px-8">Date</th>
                                <th className="px-6 py-3.5 md:px-8">Description</th>
                                <th className="px-6 py-3.5 md:px-8">Amount</th>
                                <th className="px-6 py-3.5 md:px-8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gcs-border/50">
                            {profile.payments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gcs-muted-text md:px-8">
                                        No payment records yet. They will appear here after the secretariat confirms your
                                        invoice.
                                    </td>
                                </tr>
                            ) : (
                                profile.payments.map((p) => (
                                    <tr key={p.id} className="bg-white transition hover:bg-neutral-50/80">
                                        <td className="whitespace-nowrap px-6 py-4 text-gcs-muted-text md:px-8">{formatDate(p.date)}</td>
                                        <td className="px-6 py-4 text-gcs-foreground md:px-8">
                                            {p.description}
                                            {p.reference ? (
                                                <span className="mt-1 block font-mono text-xs text-gcs-muted-text">Ref {p.reference}</span>
                                            ) : null}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gcs-foreground md:px-8">
                                            {p.amountGhs == null ? "—" : `GHS ${p.amountGhs.toFixed(2)}`}
                                        </td>
                                        <td className="px-6 py-4 md:px-8">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusStyles(p.status)}`}
                                            >
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </div>
    );
}
