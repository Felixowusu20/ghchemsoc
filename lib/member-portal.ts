import type { MemberBenefit, MemberPortalSettings } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Mail,
  Microscope,
  Shield,
  Users,
} from "lucide-react";

export const MEMBER_PORTAL_ID = "member_portal" as const;

export type MemberBenefitSection = "dashboard" | "benefits" | "resources";

export type MemberBenefitPublic = {
  id: string;
  section: MemberBenefitSection;
  title: string;
  description: string;
  body: string | null;
  href: string | null;
  iconKey: string;
  hint: string | null;
};

export type MemberPortalPublic = {
  settings: {
    dashboardEyebrow: string;
    dashboardTitle: string;
    dashboardLead: string;
    benefitsTitle: string;
    benefitsLead: string;
    resourcesTitle: string;
    resourcesLead: string;
  };
  benefits: MemberBenefitPublic[];
};

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  calendar: CalendarDays,
  microscope: Microscope,
  shield: Shield,
  users: Users,
  award: Award,
  mail: Mail,
  flask: FlaskConical,
  graduation: GraduationCap,
};

export const MEMBER_BENEFIT_ICON_OPTIONS = Object.keys(ICONS);

export function memberBenefitIcon(iconKey: string): LucideIcon {
  return ICONS[iconKey] ?? BookOpen;
}

function parseSection(raw: string): MemberBenefitSection {
  if (raw === "dashboard" || raw === "benefits" || raw === "resources") return raw;
  return "resources";
}

export const MEMBER_PORTAL_DEFAULTS = {
  dashboardEyebrow: "Member area",
  dashboardTitle: "Your GCS portfolio",
  dashboardLead:
    "Welcome to your Ghana Chemical Society member space. Review your credential, explore benefits, and access resources curated for verified members.",
  benefitsTitle: "Membership benefits",
  benefitsLead:
    "As an approved member you can access society programmes, networking, and professional development opportunities listed below.",
  resourcesTitle: "Members-only resources",
  resourcesLead:
    "Quick links to publications, events, safety materials, and guidance maintained for the GCS community.",
} as const;

export const MEMBER_BENEFIT_DEFAULTS: Omit<MemberBenefitPublic, "id">[] = [
  {
    section: "dashboard",
    title: "Priority event registration",
    description: "Reserve seats at symposia and workshops before public registration opens.",
    body: null,
    href: "/events",
    iconKey: "calendar",
    hint: "Member rates",
  },
  {
    section: "dashboard",
    title: "Publications shelf",
    description: "Society journals, bulletins, and technical notices for members.",
    body: null,
    href: "/publications",
    iconKey: "book",
    hint: "Member access",
  },
  {
    section: "benefits",
    title: "Professional recognition",
    description: "Use your GCS member ID for society correspondence and verified membership status.",
    body: "Your credential is issued after the secretariat verifies payment. Keep your member ID private and use it with the email on your application when signing in.",
    href: "/membership/account/profile",
    iconKey: "award",
    hint: "Credential",
  },
  {
    section: "benefits",
    title: "Networking & chapters",
    description: "Connect with educators, researchers, and industry chemists across Ghana.",
    body: null,
    href: "/about",
    iconKey: "users",
    hint: "Community",
  },
  {
    section: "resources",
    title: "Member publications shelf",
    description: "Curated notices, society journals, and technical digests reserved for members.",
    body: null,
    href: "/publications",
    iconKey: "book",
    hint: "Updated quarterly",
  },
  {
    section: "resources",
    title: "Events & symposia",
    description: "Priority booking and member-only sessions at GCS conferences across Ghana.",
    body: null,
    href: "/events",
    iconKey: "calendar",
    hint: "Member rates apply",
  },
  {
    section: "resources",
    title: "Laboratory safety briefings",
    description: "Downloadable checklists and hazard communication templates for educators.",
    body: null,
    href: "/contact",
    iconKey: "microscope",
    hint: "Request from secretariat",
  },
  {
    section: "resources",
    title: "Research ethics primer",
    description: "Guidance aligned with national standards for chemical research integrity.",
    body: null,
    href: "/about",
    iconKey: "shield",
    hint: "Reading list",
  },
];

export function mapMemberBenefitRow(row: MemberBenefit): MemberBenefitPublic {
  return {
    id: row.id,
    section: parseSection(row.section),
    title: row.title,
    description: row.description,
    body: row.body?.trim() || null,
    href: row.href?.trim() || null,
    iconKey: row.iconKey,
    hint: row.hint?.trim() || null,
  };
}

export function mapMemberPortalSettings(row: MemberPortalSettings) {
  const d = MEMBER_PORTAL_DEFAULTS;
  return {
    dashboardEyebrow: row.dashboardEyebrow || d.dashboardEyebrow,
    dashboardTitle: row.dashboardTitle || d.dashboardTitle,
    dashboardLead: row.dashboardLead || d.dashboardLead,
    benefitsTitle: row.benefitsTitle || d.benefitsTitle,
    benefitsLead: row.benefitsLead || d.benefitsLead,
    resourcesTitle: row.resourcesTitle || d.resourcesTitle,
    resourcesLead: row.resourcesLead || d.resourcesLead,
  };
}

export function memberPortalCreateData() {
  const d = MEMBER_PORTAL_DEFAULTS;
  return {
    id: MEMBER_PORTAL_ID,
    dashboardEyebrow: d.dashboardEyebrow,
    dashboardTitle: d.dashboardTitle,
    dashboardLead: d.dashboardLead,
    benefitsTitle: d.benefitsTitle,
    benefitsLead: d.benefitsLead,
    resourcesTitle: d.resourcesTitle,
    resourcesLead: d.resourcesLead,
  };
}

export function memberPortalDefaults(benefits: MemberBenefitPublic[] = []): MemberPortalPublic {
  return {
    settings: { ...MEMBER_PORTAL_DEFAULTS },
    benefits: benefits.length > 0 ? benefits : MEMBER_BENEFIT_DEFAULTS.map((b, i) => ({ ...b, id: `default-${i}` })),
  };
}

export type MemberPortalCmsBenefit = MemberBenefitPublic & {
  published: boolean;
  sortOrder: number;
};

/** Fallback payload when DB tables are missing or offline (CMS can still preview defaults). */
export function memberPortalCmsFallback(storageMessage?: string) {
  const { settings, benefits } = memberPortalDefaults();
  return {
    settings,
    benefits: benefits.map((b, i) => ({
      ...b,
      published: true,
      sortOrder: i,
    })) satisfies MemberPortalCmsBenefit[],
    meta: {
      dbReady: false as const,
      message:
        storageMessage ??
        "Member portal tables are not set up yet. Run: npx prisma db push — then restart the dev server.",
    },
  };
}
