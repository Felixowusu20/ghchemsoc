import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ContactFooter } from "@/components/home/contact-footer";
import { AboutExecutivesTeaser } from "@/components/about/about-executives-teaser";
import { AboutSections } from "@/components/about/about-sections";
import { getHomepageExploreForPublic, getPublishedAboutSections, getPublishedExecutives } from "@/lib/cms-queries";
import type { HomepageExplorePublic } from "@/lib/homepage-explore";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Ghana Chemical Society",
  description: "Mission, programmes, and values of the Ghana Chemical Society.",
};

function MissionIntro({ mission }: { mission: HomepageExplorePublic }) {
  return (
    <div
      className="border-b border-gcs-border/50 bg-gradient-to-b from-blue-50/40 to-white"
      data-aos="fade-up"
    >
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">
          {mission.missionEyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-gcs-foreground sm:text-3xl">
          {mission.headlineLine1}{" "}
          <span className="text-gcs-primary">{mission.headlineLine2}</span>
        </h2>
        {mission.aboutBody ? (
          <p className="gcs-lead mt-5 max-w-3xl text-gcs-muted-text">{mission.aboutBody}</p>
        ) : null}
        {mission.bottomBlurb ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gcs-muted-text sm:text-base">
            {mission.bottomBlurb}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const [sections, mission, executives] = await Promise.all([
    getPublishedAboutSections(),
    getHomepageExploreForPublic(),
    getPublishedExecutives(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gcs-foreground">
        {/* Hero image */}
        <section className="relative">
          <div className="relative aspect-[16/9] max-h-[min(52vh,520px)] min-h-[240px] w-full overflow-hidden bg-slate-900 sm:aspect-[21/9]">
            <Image
              src={mission.mainImageUrl}
              alt={mission.mainImageAlt}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-8 pt-16 sm:px-6 md:px-10 md:pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                {mission.aboutEyebrow}
              </p>
              <p className="mt-2 max-w-xl text-lg font-medium text-white/95 sm:text-xl">
                {mission.imageBadge}
              </p>
            </div>
          </div>
        </section>

        <MissionIntro mission={mission} />

        {/* CMS sections: mission, core values, etc. */}
        <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 md:px-10 md:py-16">
          <AboutSections sections={sections} />
          <AboutExecutivesTeaser executives={executives} />
        </section>

        <section className="border-t border-gcs-border/50 px-4 py-12 sm:px-6 md:px-10">
          <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-6 rounded-2xl bg-gcs-primary px-6 py-8 sm:flex-row sm:rounded-3xl sm:px-10">
            <p className="text-center text-lg font-semibold text-white sm:text-left sm:text-xl">
              Ready to join Ghana&apos;s chemistry community?
            </p>
            <Link
              href="/membership"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gcs-primary"
            >
              Membership
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <ContactFooter />
      </main>
    </>
  );
}
