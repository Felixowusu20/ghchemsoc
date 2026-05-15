"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ImageIcon,
  FileText,
  Users,
  Newspaper,
  BookOpen,
  Calendar,
  MessageCircle,
  Inbox,
  House,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { CmsLogoutButton } from "@/components/cms/cms-logout";

const nav = [
  { href: "/cms", label: "Overview", icon: LayoutDashboard },
  { href: "/cms/homepage-explore", label: "Homepage · mission", icon: House },
  { href: "/cms/hero", label: "Hero", icon: ImageIcon },
  { href: "/cms/about", label: "About", icon: FileText },
  { href: "/cms/join", label: "Join / membership", icon: Users },
  { href: "/cms/news", label: "News", icon: Newspaper },
  { href: "/cms/publications", label: "Publications", icon: BookOpen },
  { href: "/cms/events", label: "Events", icon: Calendar },
  { href: "/cms/contact", label: "Contact page", icon: MessageCircle },
  { href: "/cms/contact-inquiries", label: "Inbox", icon: Inbox },
];

function isNavActive(href: string, pathname: string) {
  if (href === "/cms") return pathname === "/cms";
  if (href === "/cms/contact") return pathname === "/cms/contact";
  if (href === "/cms/homepage-explore") return pathname === "/cms/homepage-explore";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CmsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkCls = (href: string) => {
    const active = isNavActive(href, pathname);
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-gcs-primary/10 text-gcs-primary shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-md md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-slate-200 bg-white px-3 pb-6 pt-16 shadow-xl transition-transform md:static md:translate-x-0 md:pt-8 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gcs-primary">GCS</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Admin</p>
          <p className="mt-1 text-xs leading-snug text-slate-500">Marketing &amp; content</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={linkCls(href)} onClick={() => setOpen(false)}>
              <Icon className={`h-4 w-4 shrink-0 ${isNavActive(href, pathname) ? "text-gcs-primary" : "text-slate-400"}`} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4">
          <CmsLogoutButton />
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
