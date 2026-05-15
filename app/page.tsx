import { Header } from "@/components/layout/header";
import { HeroWithCms } from "@/components/home/hero-with-cms";
import { ExploreSection } from "@/components/home/explore-section";
import { HomeEventsRow } from "@/components/home/home-events-row";
import { JoinWithCms } from "@/components/home/join-with-cms";
import { NewsUpdatesSection } from "@/components/home/news-updates-section";
import { DnaScroll } from "@/components/home/dna-scroll";
import { FacilitiesSection } from "@/components/home/facilities-section";
import { Testimonials } from "@/components/home/testimonials";
import { ContactFooter } from "@/components/home/contact-footer";
import { getPublishedSocietyEvents } from "@/lib/cms-queries";

export default async function Home() {
  const events = await getPublishedSocietyEvents();

  return (
    <main className="min-h-screen bg-gcs-muted-bg/40">
      <Header />
      <HeroWithCms />
      <ExploreSection />
      <HomeEventsRow events={events} />
      <JoinWithCms />
      <NewsUpdatesSection />
      <DnaScroll />
      <FacilitiesSection />
      <Testimonials />
      <ContactFooter />
    </main>
  );
}
