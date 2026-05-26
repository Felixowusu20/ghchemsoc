"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const WORD_DELAY = 0.09;
const WORD_DURATION = 0.5;
const LINE_GAP = 0.35;

/** Split into words and whitespace chunks so spaces are preserved in the layout. */
function tokenize(text: string) {
  return text.match(/\S+|\s+/g) ?? [];
}

type Props = {
  line1: string;
  line2: string;
  className?: string;
};

function AnimatedLine({
  text,
  delayOffset,
  className,
  reduceMotion,
}: {
  text: string;
  delayOffset: number;
  className?: string;
  reduceMotion: boolean | null;
}) {
  const tokens = useMemo(() => tokenize(text), [text]);

  if (reduceMotion) {
    return <span className={cn("block", className)}>{text}</span>;
  }

  return (
    <span className={cn("block", className)}>
      {tokens.map((token, i) => {
        const isSpace = /^\s+$/.test(token);
        if (isSpace) {
          return (
            <span key={`sp-${i}`} className="whitespace-pre" aria-hidden>
              {token}
            </span>
          );
        }
        return (
          <motion.span
            key={`w-${i}-${token}`}
            className="inline-block"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: WORD_DURATION,
              delay: delayOffset + i * WORD_DELAY,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {token}
          </motion.span>
        );
      })}
    </span>
  );
}

export function ExploreHeadline({ line1, line2, className }: Props) {
  const reduceMotion = useReducedMotion();
  const line2Offset = useMemo(() => {
    if (reduceMotion) return 0;
    const wordCount = tokenize(line1).filter((t) => !/^\s+$/.test(t)).length;
    return wordCount * WORD_DELAY + LINE_GAP;
  }, [line1, reduceMotion]);

  const headingClass = cn(
    "mx-auto max-w-4xl text-balance px-1 text-3xl font-semibold leading-[1.15] tracking-tight text-gcs-foreground sm:text-4xl md:text-[2.65rem] md:leading-[1.12] lg:text-5xl lg:leading-[1.1]",
    className
  );

  return (
    <h2 className={headingClass}>
      <AnimatedLine text={line1} delayOffset={0} reduceMotion={reduceMotion} />
      <AnimatedLine
        text={line2}
        delayOffset={line2Offset}
        className="mt-2 text-gcs-primary sm:mt-2.5"
        reduceMotion={reduceMotion}
      />
    </h2>
  );
}
