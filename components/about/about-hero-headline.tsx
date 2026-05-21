"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

function splitWords(text: string) {
  return text.match(/\S+\s*/g) ?? [text];
}

type Props = {
  line1: string;
  line2: string;
};

export function AboutHeroHeadline({ line1, line2 }: Props) {
  const reduceMotion = useReducedMotion();
  const words = useMemo(() => splitWords(line1), [line1]);
  const line1Done = reduceMotion ? 0 : words.length * 0.07 + 0.4;

  if (reduceMotion) {
    return (
      <h1 className="gcs-page-title">
        <span className="block">{line1}</span>
        <span className="mt-2 block bg-gradient-to-r from-gcs-primary via-blue-600 to-blue-800 bg-clip-text text-transparent">
          {line2}
        </span>
      </h1>
    );
  }

  return (
    <h1 className="gcs-page-title max-w-full">
      <span className="block break-words">
        {words.map((word, i) => (
          <motion.span
            key={`${i}-${word}`}
            className="inline-block"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.5,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
        <motion.span
          className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-px rounded-full bg-gcs-primary align-middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.9,
            delay: words.length * 0.07 + 0.15,
            times: [0, 0.2, 0.7, 1],
          }}
          aria-hidden
        />
      </span>
      <motion.span
        className="mt-2 block bg-gradient-to-r from-gcs-primary via-blue-600 to-blue-800 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          delay: line1Done,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {line2}
      </motion.span>
    </h1>
  );
}
