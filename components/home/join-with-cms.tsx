import { getJoinPageForPublic } from "@/lib/cms-queries";
import { JoinSection, type JoinSectionCms } from "@/components/home/join-section";

export async function JoinWithCms() {
  const { header, steps } = await getJoinPageForPublic();
  const useCms = Boolean(header) || steps.length > 0;
  if (!useCms) {
    return (
      <div data-aos="fade-up" data-aos-delay="60">
        <JoinSection />
      </div>
    );
  }

  const cms: JoinSectionCms = {
    eyebrow: header?.eyebrow ?? "Membership",
    title: header?.title ?? "How will I join?",
    subtitle:
      header?.subtitle ??
      "One clear path—laid out in four moves beside a snapshot of the community you're joining.",
    heroSrc: header?.media?.url ?? "/Hero/hero.jpg",
    heroAlt: header?.media?.alt ?? "Chemists and laboratory research",
    steps: steps.map((s) => ({
      k: s.stepKey,
      title: s.title,
      description: s.description,
    })),
  };

  return (
    <div data-aos="fade-up" data-aos-delay="60">
      <JoinSection cms={cms} />
    </div>
  );
}
