import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ContactFooter } from "@/components/home/contact-footer";
import { AboutHeroHeadline } from "@/components/about/about-hero-headline";
import { AboutSections } from "@/components/about/about-sections";
import { getHomepageExploreForPublic, getPublishedAboutSections } from "@/lib/cms-queries";
import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Ghana Chemical Society",
  description: "Mission, programmes, and values of the Ghana Chemical Society.",
};

export default async function AboutPage() {
  const [sections, mission] = await Promise.all([getPublishedAboutSections(), getHomepageExploreForPublic()]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gcs-foreground" data-aos="fade-up">
        {/* Hero — soft blue wash into white */}
        <section className="relative overflow-hidden border-b border-blue-100/70">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(29,78,216,0.14),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-sky-300/15 blur-3xl"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/80 to-transparent" aria-hidden />

          <div className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-28 sm:px-6 md:px-12 md:pb-20 md:pt-32">
            <header className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm shadow-blue-900/5 backdrop-blur-sm">
                <Landmark className="h-4 w-4 text-gcs-primary" aria-hidden />
                {mission.aboutEyebrow}
              </div>
              <AboutHeroHeadline line1={mission.headlineLine1} line2={mission.headlineLine2} />
              <p className="gcs-lead mx-auto mt-6 max-w-2xl">
                {mission.aboutBody}
              </p>
              <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full bg-gcs-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-gcs-primary-hover"
                >
                  Join the society
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-gcs-primary hover:bg-blue-50/50 hover:text-gcs-primary"
                >
                  Upcoming events
                </Link>
              </div>
            </header>
          </div>
        </section>

        {/* Sections — light blue canvas */}
        <section className="relative bg-gradient-to-b from-blue-50/50 via-white to-white">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50/80 to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:px-12 md:py-20">
            {sections.length > 0 ? (
              <div className="mb-12 flex flex-col items-center text-center md:mb-14">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gcs-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Our story
                </div>
                <h2 className="gcs-section-title mt-4">
                  Who we are &amp; what we do
                </h2>
                <p className="gcs-lead mt-4 max-w-xl">
                  Programmes, governance, and community initiatives that advance chemistry across Ghana.
                </p>
              </div>
            ) : null}
            <AboutSections sections={sections} />
          </div>
        </section>

        {/* CTA — deep blue panel */}
        <section className="relative overflow-hidden px-4 py-14 sm:px-6 md:px-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gcs-primary via-blue-700 to-blue-900 px-6 py-10 shadow-xl shadow-blue-900/25 md:flex md:items-center md:justify-between md:gap-10 md:px-12 md:py-12">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-sky-400/20 blur-2xl"
                aria-hidden
              />
              <div className="relative max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90">Get involved</p>
                <p className="mt-3 text-xl font-bold tracking-tight text-white md:text-2xl">
                  Collaborate with GCS or explore membership
                </p>
                <p className="gcs-lead mt-3 text-blue-100/95">
                  Whether you are joining as an individual, institution, or partner, we will point you to the right
                  pathway.
                </p>
              </div>
              <div className="relative mt-8 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gcs-primary shadow-sm transition-colors hover:bg-blue-50"
                >
                  Membership
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Contact us
                  <ArrowUpRight className="h-4 w-4 opacity-90" aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <ContactFooter />
      </main>
    </>
  );
}
