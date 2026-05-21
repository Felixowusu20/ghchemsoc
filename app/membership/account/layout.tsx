import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { MemberPortalGate } from "@/components/membership/member-portal-gate";
import {
  MemberPortalMobileStatus,
  MemberPortalSidebar,
  MemberPortalTabBar,
} from "@/components/membership/member-portal-nav";
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
      <main className="relative min-h-screen overflow-x-hidden bg-slate-50 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-24 sm:pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:pt-28 lg:pb-32 lg:pt-32">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(29,78,216,0.08),transparent),linear-gradient(to_bottom,#ffffff_0%,#f8fafc_45%,#f1f5f9_100%)]"
          aria-hidden
        />
        <MemberPortalProvider>
          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 md:px-12">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gcs-muted-text sm:mb-7 sm:text-[11px]">
              Ghana Chemical Society · Member portfolio
            </p>
            <MemberPortalGate>
              <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,252px)_minmax(0,1fr)] lg:items-start lg:gap-12">
                <aside className="hidden min-w-0 lg:block lg:sticky lg:top-28 lg:self-start">
                  <MemberPortalSidebar />
                </aside>
                <div className="min-w-0 w-full max-w-full overflow-x-hidden">
                  <MemberPortalMobileStatus />
                  {children}
                </div>
              </div>
              <MemberPortalTabBar />
            </MemberPortalGate>
          </div>
        </MemberPortalProvider>
      </main>
    </>
  );
}
