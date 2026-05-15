import { prisma } from "../lib/prisma";
import { HOMEPAGE_EXPLORE_DEFAULTS as HX } from "../lib/homepage-explore-defaults";

async function main() {
  await prisma.heroSlide.deleteMany();
  await prisma.societyEvent.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.aboutSection.deleteMany();
  await prisma.joinStep.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.joinPageHeader.deleteMany();
  await prisma.homepageExploreSettings.deleteMany();
  await prisma.contactSettings.deleteMany();
  await prisma.media.deleteMany();

  const heroImg = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&q=80",
      publicId: null,
      alt: "Laboratory research",
    },
  });

  await prisma.heroSlide.create({
    data: {
      sortOrder: 0,
      published: true,
      mediaId: heroImg.id,
      imageAlt: "Laboratory research",
      eyebrow: "Ghana Chemical Society",
      headlineLine1: "Chemistry that serves",
      headlineLine2: "Ghana and the world",
      description: "Advancing education, research, and collaboration.",
      tags: ["Education", "Research"],
      highlights: ["National voice for chemical sciences"],
      ctaLabel: "Become a member",
      ctaHref: "/membership",
      statValue: "40+",
      statLabel: "Years of impact",
    },
  });

  const joinHero = await prisma.media.create({
    data: {
      url: "/Hero/hero.jpg",
      publicId: null,
      alt: "Chemists and laboratory research",
    },
  });

  await prisma.joinPageHeader.create({
    data: {
      key: "join_page_header",
      eyebrow: "Membership",
      title: "How will I join?",
      subtitle: "One clear path—laid out in four moves beside a snapshot of the community you're joining.",
      mediaId: joinHero.id,
    },
  });

  const stepData = [
    {
      sortOrder: 0,
      stepKey: "01",
      title: "Review categories",
      description:
        "Compare student, professional, and corporate tiers—choose what matches your role and institution.",
    },
    {
      sortOrder: 1,
      stepKey: "02",
      title: "Apply online",
      description:
        "Submit the membership form with your affiliation, qualifications, and preferred contact channel.",
    },
    {
      sortOrder: 2,
      stepKey: "03",
      title: "Verification & dues",
      description:
        "The secretariat reviews your application. When approved, pay annual dues via the secure link provided.",
    },
    {
      sortOrder: 3,
      stepKey: "04",
      title: "You're in",
      description:
        "Get your confirmation, unlock the member space, and join events, publications, and committees.",
    },
  ] as const;

  for (const s of stepData) {
    await prisma.joinStep.create({ data: { ...s, published: true } });
  }

  const mMission = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
      publicId: null,
      alt: "Collaboration in science",
    },
  });

  await prisma.aboutSection.createMany({
    data: [
      {
        sortOrder: 0,
        published: true,
        title: "Our mission",
        subtitle: "Chemistry in service of Ghana",
        body: "We advance chemical education, research integrity, and evidence-based policy dialogue—linking universities, industry, and public institutions.",
        layout: "default",
        mediaId: mMission.id,
      },
      {
        sortOrder: 1,
        published: true,
        title: "What we do",
        subtitle: null,
        body: "Conferences, publications, outreach to schools, and professional networks that strengthen the chemical sciences nationwide.",
        layout: "wide",
        mediaId: null,
      },
    ],
  });

  const nImg = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      publicId: null,
      alt: "Conference auditorium",
    },
  });

  await prisma.newsItem.create({
    data: {
      slug: "national-chemistry-summit-2026",
      title: "GCS welcomes delegates for the national chemistry summit in Accra",
      excerpt:
        "Plenary sessions on sustainable synthesis, teaching innovation, and strengthening links between universities and chemical industry partners across Ghana.",
      body: "Full announcement details will appear here as the programme is finalised.",
      date: new Date("2026-05-12T10:00:00Z"),
      published: true,
      sortOrder: 0,
      mediaId: nImg.id,
    },
  });

  const pImg = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1532619675605-1ede6c778ed9?auto=format&fit=crop&w=1600&q=80",
      publicId: null,
      alt: "Chemistry journals on a desk",
    },
  });

  await prisma.publication.create({
    data: {
      title: "Special issue: green chemistry & local materials",
      meta: "Journal · 2026",
      description:
        "Original research and reviews on sustainable synthesis, analytical methods adapted for Ghanaian contexts, and education-focused laboratory innovations.",
      issue: "Vol. 12 · Issue 1",
      href: "#",
      published: true,
      sortOrder: 0,
      mediaId: pImg.id,
    },
  });

  await prisma.contactSettings.create({
    data: {
      id: "contact",
      eyebrow: "Contact",
      headline: "Reach the Ghana Chemical Society",
      subtext:
        "Membership, partnerships, student chapters, and media enquiries — the secretariat coordinates responses across our networks.",
      cards: [
        { icon: "phone", title: "Phone", value: "+233 30 000 0000", description: "Secretariat · weekdays 09:00–17:00 GMT" },
        { icon: "mail", title: "Email", value: "secretariat@ghanachemicalsociety.org", description: "We aim to reply within a few business days" },
        { icon: "map", title: "Location", value: "Accra, Ghana", description: "National coordinating office" },
        { icon: "clock", title: "Hours", value: "09:00 – 17:00 GMT", description: "Monday to Friday" },
      ],
    },
  });

  const evFeaturedImg = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      publicId: null,
      alt: "Conference auditorium",
    },
  });

  await prisma.societyEvent.create({
    data: {
      featured: true,
      published: true,
      sortOrder: 0,
      title: "National chemistry summit",
      excerpt:
        "Plenary talks, poster sessions, and industry panels on sustainable synthesis, teaching labs, and strengthening university–industry links.",
      startDate: new Date("2026-06-18T09:00:00Z"),
      endDate: new Date("2026-06-20T17:00:00Z"),
      timeLabel: "09:00 – 17:00 GMT",
      location: "Accra International Conference Centre",
      href: "/news/national-chemistry-summit-2026",
      badge: "Flagship",
      mediaId: evFeaturedImg.id,
    },
  });

  const evWorkshopImg = await prisma.media.create({
    data: {
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80",
      publicId: null,
      alt: "Laboratory glassware",
    },
  });

  await prisma.societyEvent.create({
    data: {
      featured: false,
      published: true,
      sortOrder: 1,
      title: "Green chemistry workshop",
      excerpt: "Hands-on sessions on safer solvents, waste minimisation, and teaching demonstrations for secondary schools.",
      startDate: new Date("2026-07-08T10:00:00Z"),
      endDate: new Date("2026-07-08T15:00:00Z"),
      timeLabel: "10:00 – 15:00 GMT",
      location: "KNUST, Kumasi",
      href: "#",
      badge: null,
      mediaId: evWorkshopImg.id,
    },
  });

  await prisma.homepageExploreSettings.create({
    data: {
      id: "homepage_explore",
      missionEyebrow: HX.missionEyebrow,
      headlineLine1: HX.headlineLine1,
      headlineLine2: HX.headlineLine2,
      aboutEyebrow: HX.aboutEyebrow,
      aboutBody: HX.aboutBody,
      imageBadge: HX.imageBadge,
      imageHoverQuote: HX.imageHoverQuote,
      locationLabel: HX.locationLabel,
      secondaryBadge: HX.secondaryBadge,
      bottomBlurb: HX.bottomBlurb,
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
