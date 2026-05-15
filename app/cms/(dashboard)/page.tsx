import Link from "next/link";
import { ImageIcon, FileText, Users, Newspaper, BookOpen, Calendar, MessageCircle, Inbox, House, ArrowUpRight } from "lucide-react";
import { CmsCard } from "@/components/cms/cms-ui";

const cards = [
  {
    href: "/cms/homepage-explore",
    title: "Homepage · mission",
    desc: "Headline and imagery in the strip below the hero.",
    icon: House,
  },
  {
    href: "/cms/hero",
    title: "Hero carousel",
    desc: "Homepage slides, imagery, and CTAs.",
    icon: ImageIcon,
  },
  {
    href: "/cms/about",
    title: "About page",
    desc: "Mission, narrative sections, and images.",
    icon: FileText,
  },
  {
    href: "/cms/join",
    title: "Join block",
    desc: "Headline and membership steps on the homepage.",
    icon: Users,
  },
  {
    href: "/cms/news",
    title: "News",
    desc: "Articles with slugs and publish dates.",
    icon: Newspaper,
  },
  {
    href: "/cms/publications",
    title: "Publications",
    desc: "Journals, bulletins, and external links.",
    icon: BookOpen,
  },
  {
    href: "/cms/events",
    title: "Events",
    desc: "Conferences, workshops, and featured dates.",
    icon: Calendar,
  },
  {
    href: "/cms/contact",
    title: "Contact page",
    desc: "Hero copy and detail cards on /contact.",
    icon: MessageCircle,
  },
  {
    href: "/cms/contact-inquiries",
    title: "Inbox",
    desc: "Messages sent from the public contact form.",
    icon: Inbox,
  },
] as const;

export default function CmsHome() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Overview</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[0.9375rem]">
        Choose an area to edit. All changes use your signed-in session; routes under{" "}
        <code className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-700">
          /api/cms
        </code>{" "}
        require the same cookie.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, desc, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="group block h-full">
              <CmsCard className="h-full transition-shadow group-hover:border-gcs-primary/40 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gcs-primary" />
                </div>
                <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </CmsCard>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        New here?{" "}
        <Link className="font-semibold text-gcs-primary hover:text-gcs-primary-hover" href="/cms/register">
          Register the first admin
        </Link>{" "}
        or{" "}
        <Link className="font-semibold text-gcs-primary hover:text-gcs-primary-hover" href="/cms/login">
          sign in
        </Link>
        .
      </p>
    </div>
  );
}
