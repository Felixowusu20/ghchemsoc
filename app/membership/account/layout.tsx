import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { MemberPortalGate } from "@/components/membership/member-portal-gate";
import { MemberPortalNav } from "@/components/membership/member-portal-nav";
import { MemberPortalProvider } from "@/components/membership/member-portal-context";

export const metadata: Metadata = {
  title: "Member portfolio | Ghana Chemical Society",
  description:
    "Your Ghana Chemical Society member portfolio—benefits, resources, profile, and payment history.",
};

export default function MemberAccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative min-h-screen overflow-hidden bg-white pb-24 pt-28 md:pb-32 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 to-white"
          aria-hidden
        />
        <MemberPortalProvider>
          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-gcs-muted-text">
              Ghana Chemical Society
            </p>
            <MemberPortalGate>
              <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <MemberPortalNav />
                </aside>
                <div className="min-w-0 pb-4">{children}</div>
              </div>
            </MemberPortalGate>
          </div>
        </MemberPortalProvider>
      </main>
    </>
  );
}
