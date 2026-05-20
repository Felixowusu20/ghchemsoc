"use client";

import { useState, useTransition, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BadgeCheck,
    Briefcase,
    Building2,
    Calendar,
    ClipboardList,
    GraduationCap,
    Loader2,
    Mail,
    PenLine,
    Phone,
    Send,
    ShieldCheck,
    User,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMembershipApplication } from "@/app/membership/actions";
import { MembershipPaymentModal } from "@/components/membership/membership-payment-modal";
import { formatGhs, MEMBERSHIP_FEE_GHS } from "@/lib/membership-application";
import { MembershipPhotoField } from "@/components/membership/membership-photo-field";
import { gooeyToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const labelClass = "mb-2 block text-sm font-medium text-slate-800";

const fieldShell =
    "group flex h-12 w-full items-stretch overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-[border-color,box-shadow] focus-within:border-gcs-primary focus-within:ring-2 focus-within:ring-gcs-primary/20";

const iconSlot =
    "flex w-11 shrink-0 items-center justify-center self-stretch border-r border-slate-200/90 bg-slate-50/90 text-gcs-primary transition-colors group-focus-within:border-gcs-primary/20 group-focus-within:bg-sky-50";

const fieldInput =
    "min-h-0 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] leading-normal text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

function trimFd(fd: FormData, key: string): string {
    const v = fd.get(key);
    return typeof v === "string" ? v.trim() : "";
}

function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}

function RequiredMark() {
    return <span className="ml-0.5 text-gcs-primary" aria-hidden>*</span>;
}

function IconInput({
    icon: Icon,
    className,
    inputClassName,
    ...props
}: { icon: LucideIcon; inputClassName?: string } & ComponentProps<"input">) {
    const isDate = props.type === "date";

    return (
        <div className={cn(fieldShell, className)}>
            <span className={iconSlot} aria-hidden>
                <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} />
            </span>
            <input
                className={cn(
                    fieldInput,
                    isDate &&
                        "pr-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60",
                    inputClassName
                )}
                {...props}
            />
        </div>
    );
}

function FormField({
    id,
    label,
    required,
    hint,
    icon,
    className,
    inputClassName,
    ...inputProps
}: {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    icon: LucideIcon;
    className?: string;
    inputClassName?: string;
} & Omit<ComponentProps<"input">, "id">) {
    return (
        <div className={className}>
            <label className={labelClass} htmlFor={id}>
                {label}
                {required ? <RequiredMark /> : null}
            </label>
            {hint ? <p className="mb-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
            <IconInput id={id} icon={icon} required={required} inputClassName={inputClassName} {...inputProps} />
        </div>
    );
}

function FormSection({
    icon: Icon,
    title,
    description,
    children,
    className,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("scroll-mt-28", className)}>
            <div className="mb-6 flex gap-4 border-b border-slate-100 pb-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gcs-primary to-blue-700 text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-500/10">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                    <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
                    {description ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p> : null}
                </div>
            </div>
            {children}
        </section>
    );
}

export function MembershipRegistrationForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [payOpen, setPayOpen] = useState(false);
    const [checkout, setCheckout] = useState<{ applicationId: string; amountGhs: number; email: string } | null>(
        null
    );

    return (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_12px_56px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/60">
            <div className="relative overflow-hidden border-b border-gcs-border/50 bg-gradient-to-br from-gcs-primary via-blue-700 to-sky-700 px-6 py-7 text-white md:px-8 md:py-8">
                <div
                    className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-16 left-1/4 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl"
                    aria-hidden
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25">
                            <ClipboardList className="h-6 w-6" strokeWidth={2} aria-hidden />
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">GCS membership</p>
                            <h2 className="mt-1 text-lg font-semibold tracking-tight md:text-xl">
                                Registration &amp; renewal form
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">
                                Complete every required field. Your certificate name and declaration must match your legal
                                identity.
                            </p>
                        </div>
                    </div>
                    <p className="shrink-0 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm">
                        <span className="text-white/70">Required</span>{" "}
                        <span className="font-semibold text-white">*</span>
                    </p>
                </div>
            </div>

            <form
                className="px-5 py-8 md:px-8 md:py-10"
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);

                    startTransition(async () => {
                        const res = await createMembershipApplication(fd);
                        if (!res.ok) {
                            gooeyToast.error("We couldn’t submit your application", {
                                description: res.message,
                                preset: "smooth",
                                spring: false,
                            });
                            return;
                        }

                        setCheckout({
                            applicationId: res.applicationId,
                            amountGhs: res.amountGhs,
                            email: trimFd(fd, "email"),
                        });
                        setPayOpen(true);
                    });
                }}
            >
                <FormSection
                    icon={User}
                    title="Personal & professional details"
                    description="How you will appear on your membership certificate and records."
                >
                    <div className="grid gap-5 md:grid-cols-2 md:gap-x-6">
                        <MembershipPhotoField disabled={isPending} />

                        <FormField
                            id="fullName"
                            name="fullName"
                            label="Full name"
                            required
                            hint="As you want it on your certificate — include title (Dr., Prof., etc.)."
                            icon={BadgeCheck}
                            autoComplete="name"
                            placeholder="e.g. Dr. Felix Owusu"
                            className="md:col-span-2"
                        />

                        <FormField
                            id="institution"
                            name="institution"
                            label="Place of work / institution"
                            required
                            icon={Building2}
                            autoComplete="organization"
                            placeholder="University or employer"
                        />

                        <FormField
                            id="jobTitle"
                            name="jobTitle"
                            label="Job title"
                            icon={Briefcase}
                            autoComplete="organization-title"
                            placeholder="e.g. Senior Lecturer"
                        />

                        <FormField
                            id="email"
                            name="email"
                            type="email"
                            label="Email"
                            required
                            icon={Mail}
                            autoComplete="email"
                            placeholder="you@institution.edu.gh"
                        />

                        <FormField
                            id="phone"
                            name="phone"
                            type="tel"
                            label="Phone number"
                            icon={Phone}
                            autoComplete="tel"
                            placeholder="+233 XX XXX XXXX"
                        />

                        <FormField
                            id="highestDegree"
                            name="highestDegree"
                            label="Highest degree"
                            icon={GraduationCap}
                            placeholder="e.g. PhD Chemistry, MSc, BSc"
                            className="md:col-span-2"
                        />
                    </div>
                </FormSection>

                <FormSection
                    icon={ShieldCheck}
                    title="Declaration"
                    description="Confirm the accuracy of your application for registration or renewal."
                    className="mt-10 border-t border-slate-100 pt-10"
                >
                    <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-sky-50/90 via-white to-white p-5 ring-1 ring-blue-100/60 md:p-6">
                        <div className="flex gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                                <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
                            </span>
                            <p className="text-sm leading-relaxed text-slate-700">
                                I declare that all the information provided by me is true regarding my registration/renewal
                                of my GCS membership.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2 md:gap-x-6">
                            <FormField
                                id="declarationLegalName"
                                name="declarationLegalName"
                                label="Legal name for consent"
                                required
                                hint="Full legal name with surname last — this is your electronic signature."
                                icon={PenLine}
                                autoComplete="name"
                                placeholder="e.g. Owusu Felix"
                                className="md:col-span-2"
                            />

                            <FormField
                                id="declarationDate"
                                name="declarationDate"
                                type="date"
                                label="Date"
                                required
                                icon={Calendar}
                                defaultValue={todayIsoDate()}
                            />
                        </div>
                    </div>
                </FormSection>

                <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                    <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">Annual dues:</span>{" "}
                        {formatGhs(MEMBERSHIP_FEE_GHS)} per year. Membership stays active for 12 months from your verified
                        payment.
                    </p>
                    <p className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gcs-primary" aria-hidden />
                        <span>
                            Questions?{" "}
                            <Link
                                href="/contact"
                                className="font-semibold text-gcs-primary underline-offset-2 hover:text-gcs-primary-hover hover:underline"
                            >
                                Contact the secretariat
                            </Link>
                        </span>
                    </p>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="group h-12 w-full gap-2 rounded-full bg-gcs-primary px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-gcs-primary-hover disabled:opacity-50 md:w-auto"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                Submitting…
                            </>
                        ) : (
                            <>
                                Continue to payment
                                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {checkout ? (
                <MembershipPaymentModal
                    open={payOpen}
                    applicationId={checkout.applicationId}
                    amountGhs={checkout.amountGhs}
                    email={checkout.email}
                    onClose={() => setPayOpen(false)}
                    onSuccess={(payload) => {
                        setPayOpen(false);
                        gooeyToast.success("Payment submitted", {
                            description: payload.message,
                            preset: "smooth",
                            spring: false,
                        });
                        const q = new URLSearchParams({
                            applicationId: checkout.applicationId,
                            ref: payload.paystackReference,
                            method: payload.paymentMethod,
                        });
                        router.push(`/membership/pending?${q.toString()}`);
                    }}
                />
            ) : null}
        </div>
    );
}
