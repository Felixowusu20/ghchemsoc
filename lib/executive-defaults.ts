/** Default executives — used when the database is empty or unreachable. */
export const EXECUTIVE_SEED = [
  {
    sortOrder: 0,
    published: true,
    name: "Prof. Kwame Asante",
    role: "President",
    bio: "Prof. Asante leads society strategy, international representation, and partnerships with universities and industry across Ghana.\n\nHe chairs the annual congress programme committee and represents GCS on regional chemical society forums.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    imageAlt: "President portrait",
  },
  {
    sortOrder: 1,
    published: true,
    name: "Dr. Ama Mensah",
    role: "Vice President",
    bio: "Dr. Mensah oversees programmes, conferences, and professional development for members in academia and the private sector.\n\nShe coordinates mentorship pathways for early-career chemists and liaison with student chapters nationwide.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    imageAlt: "Vice President portrait",
  },
  {
    sortOrder: 2,
    published: true,
    name: "Mr. Kofi Boateng",
    role: "General Secretary",
    bio: "Coordinates governance, membership records, and liaison with institutional partners and government stakeholders.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
    imageAlt: "General Secretary portrait",
  },
  {
    sortOrder: 3,
    published: true,
    name: "Dr. Efua Osei",
    role: "Treasurer",
    bio: "Manages society finances, grants, and sponsorships that support outreach and annual scientific meetings.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
    imageAlt: "Treasurer portrait",
  },
] as const;

export type ExecutivePublic = {
  id: string;
  sortOrder: number;
  published: boolean;
  name: string;
  role: string;
  bio: string | null;
  media: { url: string; alt: string | null } | null;
};

export function executivesPublicFallback(): ExecutivePublic[] {
  return EXECUTIVE_SEED.filter((e) => e.published).map((e, i) => ({
    id: `executive-fallback-${i}`,
    sortOrder: e.sortOrder,
    published: e.published,
    name: e.name,
    role: e.role,
    bio: e.bio,
    media: e.imageUrl ? { url: e.imageUrl, alt: e.imageAlt } : null,
  }));
}
