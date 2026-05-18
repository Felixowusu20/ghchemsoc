import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { eventRegisterPath, showRegisterHereOnListing } from "@/lib/event-listing-cta";
import type { Prisma } from "@prisma/client";

type Props = {
  eventId: string;
  registrationFormFields: Prisma.JsonValue | null | undefined;
};

/** Compact CTA for the event detail logistics card. */
export function EventRegisterCta({ eventId, registrationFormFields }: Props) {
  if (!showRegisterHereOnListing(registrationFormFields)) return null;

  return (
    <li className="border-t border-gcs-border/60 pt-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gcs-foreground">Registration</p>
          <p className="mt-1 text-sm text-gcs-muted-text">Secure your place using the online form.</p>
          <Link
            href={eventRegisterPath(eventId)}
            className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gcs-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gcs-primary-hover sm:w-auto"
          >
            Register here
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </li>
  );
}
