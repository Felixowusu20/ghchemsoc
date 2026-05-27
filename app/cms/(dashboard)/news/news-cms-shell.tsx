"use client";

import dynamic from "next/dynamic";

/** TipTap must not SSR; `ssr: false` must live in a Client Component (Next.js 16). */
const NewsCmsClient = dynamic(
  () => import("./news-cms-client").then((m) => m.NewsCmsClient),
  {
    ssr: false,
    loading: () => <p className="text-sm text-slate-500">Loading…</p>,
  }
);

export function NewsCmsShell() {
  return <NewsCmsClient />;
}
