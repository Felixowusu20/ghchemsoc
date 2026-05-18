"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const defaultSteps = [
  {
    k: "01",
    title: "Review categories",
    description:
      "Compare student, professional, and corporate tiers—choose what matches your role and institution.",
  },
  {
    k: "02",
    title: "Apply online",
    description:
      "Submit the membership form with your affiliation, qualifications, and preferred contact channel.",
  },
  {
    k: "03",
    title: "Verification & dues",
    description:
      "The secretariat reviews your application. When approved, pay annual dues via the secure link provided.",
  },
  {
    k: "04",
    title: "You're in",
    description:
      "Get your confirmation, unlock the member space, and join events, publications, and committees.",
  },
] as const;

export type JoinSectionCms = {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroSrc: string;
  heroAlt: string;
  steps: { k: string; title: string; description: string }[];
};

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Props = { cms?: JoinSectionCms | null };

export function JoinSection({ cms }: Props) {
  const steps = cms && cms.steps.length > 0 ? cms.steps : defaultSteps;
  const eyebrow = cms?.eyebrow ?? "Membership";
  const title = cms?.title ?? "How will I join?";
  const subtitle =
    cms?.subtitle ??
    "One clear path—laid out in four moves beside a snapshot of the community you're joining.";
  const heroSrc = cms?.heroSrc ?? "/Hero/hero.jpg";
  const heroAlt = cms?.heroAlt ?? "Chemists and laboratory research";

  return (
    <section className="w-full border-t border-gcs-border/60 bg-white px-4 py-20 sm:px-6 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col items-center text-center md:mb-14">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-gcs-surface px-4 py-1.5 text-sm font-medium text-gcs-muted-text shadow-sm">
            {eyebrow} <ArrowRight className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
          </div>
          <h2 className="mx-auto max-w-3xl text-4xl font-medium tracking-tight text-gcs-foreground md:text-5xl lg:text-[2.75rem] lg:leading-[1.08]">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gcs-muted-text md:text-lg">{subtitle}</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-12 xl:gap-4">
          <motion.div
            custom={0}
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-32px" }}
            className="relative min-h-[240px] overflow-hidden rounded-[1.75rem] ring-1 ring-gcs-border/50 md:col-span-2 md:min-h-[300px] xl:col-span-7 xl:row-span-2 xl:min-h-[480px] xl:rounded-[2rem]"
          >
            <Image
              src={heroSrc}
              alt={heroAlt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 58vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-gcs-primary/15 via-transparent to-gcs-secondary/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">Ghana Chemical Society</p>
              <p className="mt-2 max-w-md text-lg font-medium leading-snug text-white md:text-xl">
                Join peers in education, research, and industry—nationwide.
              </p>
            </div>
          </motion.div>

          {steps.map((step, i) => (
            <motion.div
              key={`${step.k}-${step.title}`}
              custom={i + 1}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-32px" }}
              className={[
                "relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-gcs-border/45 bg-gcs-surface/90 px-5 py-6 backdrop-blur-[2px] md:px-6 md:py-7 xl:rounded-[2rem] xl:px-8 xl:py-8",
                i === 0 ? "xl:col-span-5 xl:col-start-8 xl:row-start-1" : "",
                i === 1 ? "xl:col-span-5 xl:col-start-8 xl:row-start-2" : "",
                i === 2 ? "md:col-span-1 xl:col-span-6 xl:row-start-3 xl:col-start-1" : "",
                i === 3 ? "md:col-span-1 xl:col-span-6 xl:row-start-3 xl:col-start-7" : "",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute -right-6 -top-4 select-none text-7xl font-extralight leading-none tracking-tighter text-neutral-100 sm:text-8xl">
                {step.k}
              </div>
              <div>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gcs-primary">{step.k}</span>
                <h3 className="relative mt-3 text-lg font-semibold tracking-tight text-gcs-foreground md:text-xl">{step.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-gcs-muted-text md:text-[0.925rem]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          custom={5}
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-stretch justify-between gap-6 rounded-[1.75rem] border border-gcs-border/50 bg-white px-6 py-8 shadow-sm ring-1 ring-gcs-border/20 sm:flex-row sm:items-center sm:px-8 md:rounded-[2rem] md:py-10"
        >
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gcs-foreground md:text-base">Ready when you are.</p>
            <p className="mt-1 text-sm text-gcs-muted-text">
              Institutional or group enquiries—{" "}
              <Link
                href="/contact"
                className="font-semibold text-gcs-primary underline-offset-[3px] hover:text-gcs-primary-hover hover:underline"
              >
                speak with the secretariat
              </Link>
              .
            </p>
          </div>
          <Button
            asChild
            className="group h-12 shrink-0 gap-3 self-center rounded-full border-0 bg-gcs-primary px-7 text-base text-white shadow-sm hover:bg-gcs-primary-hover sm:self-auto"
          >
            <Link href="/membership">
              Go to membership
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors group-hover:bg-white/90">
                <ArrowUpRight className="h-4 w-4 text-gcs-primary" />
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
