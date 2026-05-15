"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

const fade = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.05 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

const featured = {
    category: "Annual symposium",
    date: "12 May 2026",
    title: "GCS welcomes delegates for the national chemistry summit in Accra",
    excerpt:
        "Plenary sessions on sustainable synthesis, teaching innovation, and strengthening links between universities and chemical industry partners across Ghana.",
    href: "/news",
    image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
};

const updates = [
    {
        category: "Outreach",
        date: "30 Apr 2026",
        title: "Secondary-school chemistry bootcamp opens registration in four regions",
        image:
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
        href: "/news",
    },
    {
        category: "Publications",
        date: "18 Apr 2026",
        title: "Call for papers: special issue on green chemistry and local materials",
        image:
            "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
        href: "/news",
    },
    {
        category: "Society",
        date: "5 Apr 2026",
        title: "New student chapter toolkit: start a GCS circle on your campus",
        image:
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
        href: "/news",
    },
] as const;

export function NewsUpdatesSection() {
    return (
        <section className="w-full border-t border-gcs-border/60 bg-gcs-surface px-4 py-20 sm:px-6 md:px-12 md:py-24" data-aos="fade-up" data-aos-delay="40">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-12 flex flex-col items-start gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-gcs-muted-bg/50 px-4 py-1.5 text-sm font-medium text-gcs-muted-text">
                            <Newspaper className="h-3.5 w-3.5 text-gcs-primary" aria-hidden />
                            News &amp; updates
                        </div>
                        <h2 className="max-w-xl text-3xl font-medium tracking-tight text-gcs-foreground md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
                            From the society desk
                        </h2>
                        <p className="mt-4 max-w-lg text-base leading-relaxed text-gcs-muted-text md:text-lg">
                            Conferences, calls, outreach, and member resources—curated for the GCS community.
                        </p>
                    </div>
                    <Link
                        href="/news"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-gcs-primary transition-colors hover:text-gcs-primary-hover"
                    >
                        View all stories
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>

                <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
                    <motion.article
                        custom={0}
                        variants={fade}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-40px" }}
                        className="overflow-hidden rounded-[1.75rem] ring-1 ring-gcs-border/55 lg:col-span-7 lg:rounded-[2rem]"
                    >
                        <Link href={featured.href} className="group flex h-full flex-col lg:min-h-[320px] lg:flex-row">
                            <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:w-[44%] lg:min-h-[280px]">
                                <Image
                                    src={featured.image}
                                    alt="Conference auditorium"
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                                    sizes="(max-width: 1024px) 100vw, 38vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-gcs-surface/30" />
                            </div>
                            <div className="flex flex-1 flex-col justify-center bg-gradient-to-b from-gcs-muted-bg/30 to-gcs-surface px-6 py-7 md:px-8 md:py-8">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-gcs-muted-text">
                                    <span className="text-gcs-primary">{featured.category}</span>
                                    <span className="h-1 w-1 rounded-full bg-gcs-border" aria-hidden />
                                    <time dateTime="2026-05-12">{featured.date}</time>
                                </div>
                                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-gcs-foreground md:text-2xl">
                                    {featured.title}
                                </h3>
                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gcs-muted-text md:text-[0.9375rem]">
                                    {featured.excerpt}
                                </p>
                                <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gcs-foreground transition-colors group-hover:text-gcs-primary">
                                    Read article
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    </motion.article>

                    <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
                        {updates.map((post, i) => (
                            <motion.article
                                key={post.title}
                                custom={i + 1}
                                variants={fade}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-40px" }}
                                className="group overflow-hidden rounded-[1.5rem] border border-gcs-border/50 bg-gcs-surface ring-1 ring-gcs-border/20 transition-colors hover:border-gcs-border hover:bg-gcs-muted-bg/25 lg:rounded-2xl"
                            >
                                <Link
                                    href={post.href}
                                    className="flex gap-4 p-3.5 md:gap-5 md:p-4"
                                >
                                    <div className="relative h-[88px] w-[100px] shrink-0 overflow-hidden rounded-xl md:h-[96px] md:w-[112px] md:rounded-2xl">
                                        <Image
                                            src={post.image}
                                            alt=""
                                            fill
                                            className="object-cover transition duration-500 group-hover:scale-[1.04]"
                                            sizes="112px"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 py-0.5">
                                        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gcs-muted-text">
                                            <span className="text-gcs-primary">{post.category}</span>
                                            <span className="text-gcs-border">·</span>
                                            <time dateTime={post.date}>{post.date}</time>
                                        </div>
                                        <h3 className="mt-2 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-gcs-foreground md:text-base">
                                            {post.title}
                                        </h3>
                                    </div>
                                    <div className="hidden shrink-0 self-center sm:flex">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gcs-border bg-gcs-muted-bg/40 text-gcs-primary transition-all group-hover:border-gcs-primary group-hover:bg-gcs-primary group-hover:text-white">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
