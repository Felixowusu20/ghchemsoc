import { ChevronDown } from "lucide-react";
import { EventAboutBody } from "@/components/events/event-about-body";

type Props = {
  body: string | null;
  excerpt: string;
};

export function EventAboutSection({ body, excerpt }: Props) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-gcs-border/50 bg-gcs-surface/90 shadow-sm ring-1 ring-gcs-border/15">
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-l-4 border-gcs-primary bg-gcs-primary/[0.06] px-6 py-7 marker:content-none transition-colors hover:bg-gcs-primary/[0.09] md:px-9 md:py-8 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex flex-wrap items-center gap-2.5">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gcs-foreground">About this event</h2>
            <span className="text-xs font-medium normal-case tracking-normal text-gcs-primary group-open:hidden">
              Show
            </span>
            <span className="hidden text-xs font-medium normal-case tracking-normal text-gcs-muted-text group-open:inline">
              Hide
            </span>
          </span>
          <ChevronDown
            className="h-5 w-5 shrink-0 text-gcs-primary transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="border-t border-gcs-border/40 px-6 pb-8 pt-1 md:px-9 md:pb-10">
          <EventAboutBody body={body} excerpt={excerpt} />
        </div>
      </details>
    </div>
  );
}
