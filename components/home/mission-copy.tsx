import { cn } from "@/lib/utils";

/** Split CMS copy on blank lines into separate paragraphs. */
export function splitMissionParagraphs(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function MissionCopy({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  if (paragraphs.length === 0) return null;

  return (
    <div className={cn("space-y-3.5 sm:space-y-4", className)}>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="text-sm leading-relaxed text-gcs-muted-text sm:text-[0.9375rem] sm:leading-[1.65]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
