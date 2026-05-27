"use client";

import dynamic from "next/dynamic";

/** TipTap must not SSR; `ssr: false` must live in a Client Component (Next.js 16). */
const EventsCmsClient = dynamic(
  () => import("./events-cms-client").then((m) => m.EventsCmsClient),
  {
    ssr: false,
    loading: () => <p className="text-sm text-slate-500">Loading…</p>,
  }
);

export function EventsCmsShell() {
  return <EventsCmsClient />;
}
