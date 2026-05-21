import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  Mail,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CmsLoginForm } from "@/components/cms/cms-login-form";

export const metadata: Metadata = {
  title: "Admin sign in | Ghana Chemical Society",
  description: "Sign in to manage the Ghana Chemical Society website — news, events, membership, and site content.",
};

const heroImage =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80";

const capabilities: { icon: LucideIcon; text: string }[] = [
  { icon: Newspaper, text: "News, publications, and homepage content" },
  { icon: CalendarDays, text: "Events, registrations, and member announcements" },
  { icon: Users, text: "Membership applications, approvals, and analytics" },
  { icon: Mail, text: "Contact inquiries and site footer settings" },
];

function CapabilitiesList() {
  return (
    <ul className="space-y-2">
      {capabilities.map(({ icon: Icon, text }) => (
        <li
          key={text}
          className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sky-100">
            <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
          <span className="pt-1 text-sm leading-snug text-white/90">{text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CmsLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Desktop — brand on image */}
      <div className="relative hidden min-h-screen w-full shrink-0 lg:block lg:w-[min(48%,560px)] lg:flex-1 lg:max-w-none">
        <Image
          src={heroImage}
          alt="Professional working with scientific equipment"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-blue-950/88 to-slate-900/90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]"
          aria-hidden
        />

        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8 lg:p-10 xl:p-12">
          <Link
            href="/"
            className="pointer-events-auto inline-flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md transition hover:bg-white/20"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gcs-primary">
              <FlaskConical className="h-5 w-5" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-white">GCS</span>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/80">
                Ghana Chemical Society
              </span>
            </span>
          </Link>

          <div className="max-w-md space-y-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-200/90">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
              Website admin
            </p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.125rem] lg:leading-[1.15] xl:text-4xl">
              Manage the society website from one secure dashboard.
            </h1>
            <p className="text-sm leading-relaxed text-white/75 lg:text-base">
              Editors and administrators update public pages, review membership applications, and respond to inquiries.
            </p>
            <CapabilitiesList />
          </div>

          <p className="text-xs text-white/45">Laboratory imagery — illustrative only.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/80 px-5 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:border-slate-200/80 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-gcs-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to site
          </Link>

          {/* Mobile — compact brand strip (no image) */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 px-4 py-5 text-white lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/90">Website admin</p>
            <p className="mt-2 text-base font-semibold leading-snug tracking-tight text-white">
              Sign in to manage news, events, membership, and site content.
            </p>
          </div>

          <CmsLoginForm />
        </div>
      </div>
    </main>
  );
}
