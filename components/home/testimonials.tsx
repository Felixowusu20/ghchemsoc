"use client";

import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
    {
        name: "Prof. Kwame Mensah",
        role: "Professor of Chemistry · University of Ghana",
        image:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
        quote:
            "GCS has been indispensable for building bridges between departments and industry. The society elevates standards for teaching and research chemistry nationwide.",
    },
    {
        name: "Dr. Ama Serwaa Osei",
        role: "Principal Scientist · Ghana Standards Authority",
        image:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
        quote:
            "Through workshops and technical programmes, GCS gives practitioners access to cutting-edge practice and a network of peers we can rely on for real-world problems.",
    },
    {
        name: "Kofi Owusu-Ankomah",
        role: "PhD Researcher · Catalysis & Green Chemistry",
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        quote:
            "Presenting at the annual symposium and connecting with mentors through the society opened doors I would not have found on my own. It is the hub for early-career chemists.",
    },
    {
        name: "Efua Brookman",
        role: "R&D Lead · Pharmaceutical Manufacturing",
        image:
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
        quote:
            "The Ghana Chemical Society represents the rigour and collaboration our sector needs. Membership signals commitment to ethics, safety, and scientific excellence.",
    },
];

export function Testimonials() {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = useCallback(() => {
        setDirection(1);
        setIndex((prev) => (prev + 1) % testimonials.length);
    }, []);

    const prev = useCallback(() => {
        setDirection(-1);
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
        }),
    };

    return (
        <section className="relative flex w-full flex-col items-center overflow-hidden bg-gcs-surface px-6 py-24" data-aos="fade-up">

            <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[150vw] w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gcs-border/50 bg-transparent md:h-[120vw] md:w-[120vw]"></div>

            <div className="relative z-10 mx-auto mt-12 max-w-4xl text-center md:mt-16">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 inline-flex items-center gap-2 rounded-full border border-gcs-border bg-white px-6 py-2 shadow-sm"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-muted-text md:text-sm">
                        Member voices
                    </span>
                    <Quote className="h-5 w-5 text-gcs-primary" />
                </motion.div>

                <div className="relative flex min-h-[300px] flex-col items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.4 },
                            }}
                            className="w-full"
                        >
                            <div className="relative mb-12">
                                <span className="absolute -left-4 -top-12 select-none font-serif text-6xl text-neutral-100 md:-left-12 md:text-8xl">
                                    ❝
                                </span>
                                <p className="break-words text-xl font-medium italic leading-relaxed tracking-tight text-gcs-foreground sm:text-2xl md:text-3xl lg:text-4xl">
                                    {testimonials[index].quote}
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-slate-900/10 transition-transform duration-500 transform rotate-3 hover:rotate-0 md:h-24 md:w-24">
                                    <Image
                                        src={testimonials[index].image}
                                        alt={testimonials[index].name}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gcs-foreground transition-all md:text-2xl">
                                        {testimonials[index].name}
                                    </h4>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gcs-muted-text md:text-sm normal-case">
                                        {testimonials[index].role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-16 flex flex-col items-center gap-8">
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous testimonial"
                            className="flex h-12 w-12 items-center justify-center rounded-full border border-gcs-border bg-white text-gcs-foreground shadow-sm transition-all hover:bg-gcs-primary hover:text-white active:scale-90"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex justify-center gap-2.5">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setDirection(i > index ? 1 : -1);
                                        setIndex(i);
                                    }}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === i
                                            ? "w-8 bg-gcs-primary"
                                            : "w-2 bg-gcs-border hover:bg-gcs-muted-text/40"
                                    }`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next testimonial"
                            className="flex h-12 w-12 items-center justify-center rounded-full border border-gcs-border bg-white text-gcs-foreground shadow-sm transition-all hover:bg-gcs-primary hover:text-white active:scale-90"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
