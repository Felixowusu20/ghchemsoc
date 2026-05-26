import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { ContactFooter } from "@/components/home/contact-footer";
import { ExecutivesGrid } from "@/components/executives/executives-grid";
import { ExecutivesPageHero } from "@/components/executives/executives-page-hero";
import { getPublishedExecutives } from "@/lib/cms-queries";

export const metadata: Metadata = {
  title: "Executives | Ghana Chemical Society",
  description: "Officers and executive leadership of the Ghana Chemical Society.",
};

export default async function ExecutivesPage() {
  const executives = await getPublishedExecutives();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gcs-foreground">
        <ExecutivesPageHero count={executives.length} />

        <section className="bg-gradient-to-b from-white via-white to-slate-50/50">
          <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-20">
            <ExecutivesGrid executives={executives} />
          </div>
        </section>

        <ContactFooter />
      </main>
    </>
  );
}
