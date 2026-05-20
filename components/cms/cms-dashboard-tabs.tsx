"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Handshake,
  House,
  ImageIcon,
  Inbox,
  MessageCircle,
  Newspaper,
  PanelBottom,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { CmsCard } from "@/components/cms/cms-ui";
import { cn } from "@/lib/utils";

export type DashboardIconKey =
  | "ImageIcon"
  | "House"
  | "Users"
  | "Handshake"
  | "PanelBottom"
  | "FileText"
  | "Newspaper"
  | "BookOpen"
  | "Calendar"
  | "MessageCircle"
  | "Inbox"
  | "Wallet"
  | "ClipboardList"
  | "Settings"
  | "BarChart3";

export type DashboardModuleItem = {
  href: string;
  title: string;
  desc: string;
  icon: DashboardIconKey;
  badge?: number;
};

export type DashboardModuleSection = {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  items: DashboardModuleItem[];
};

const ICONS: Record<DashboardIconKey, LucideIcon> = {
  ImageIcon,
  House,
  Users,
  Handshake,
  PanelBottom,
  FileText,
  Newspaper,
  BookOpen,
  Calendar,
  MessageCircle,
  Inbox,
  Wallet,
  ClipboardList,
  Settings,
  BarChart3,
};

function sectionBadgeTotal(items: DashboardModuleItem[]) {
  return items.reduce((sum, item) => sum + (item.badge && item.badge > 0 ? item.badge : 0), 0);
}

function ModuleCard({ href, title, desc, icon, badge }: DashboardModuleItem) {
  const Icon = ICONS[icon];
  return (
    <Link href={href} className="group block h-full">
      <CmsCard className="relative h-full overflow-hidden p-5 transition-all group-hover:border-gcs-primary/35 group-hover:shadow-md">
        {badge && badge > 0 ? (
          <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-gcs-primary px-1.5 text-[0.65rem] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gcs-primary/10 text-gcs-primary transition-colors group-hover:bg-gcs-primary group-hover:text-white">
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <h3 className="mt-4 pr-8 text-base font-semibold text-gcs-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gcs-muted-text">{desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gcs-muted-text transition-colors group-hover:text-gcs-primary">
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </CmsCard>
    </Link>
  );
}

export function CmsDashboardTabs({ sections }: { sections: DashboardModuleSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "homepage");
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  if (!active) return null;

  return (
    <section aria-labelledby="manage-content-heading">
      <div className="mb-5">
        <h2 id="manage-content-heading" className="text-lg font-semibold tracking-tight text-gcs-foreground">
          Manage content
        </h2>
        <p className="mt-1 text-sm text-gcs-muted-text">Choose a category, then open the area you want to edit.</p>
      </div>

      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm ring-1 ring-slate-900/[0.03]"
        role="tablist"
        aria-label="Content categories"
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;
          const badge = sectionBadgeTotal(section.items);
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`tab-${section.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${section.id}`}
              onClick={() => setActiveId(section.id)}
              className={cn(
                "relative flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none sm:min-w-[9.5rem]",
                isActive
                  ? "bg-gcs-primary text-white shadow-md shadow-gcs-primary/25"
                  : "text-gcs-muted-text hover:bg-slate-50 hover:text-gcs-foreground"
              )}
            >
              {section.tabLabel}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tabular-nums",
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {section.items.length}
              </span>
              {badge > 0 ? (
                <span
                  className={cn(
                    "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.625rem] font-bold",
                    isActive ? "bg-amber-400 text-amber-950" : "bg-amber-500 text-white"
                  )}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        key={active.id}
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="mt-6"
      >
        <div className="mb-5 rounded-xl border border-gcs-border/60 bg-white px-5 py-4 shadow-sm">
          <h3 className="font-semibold text-gcs-foreground">{active.title}</h3>
          <p className="mt-1 text-sm text-gcs-muted-text">{active.description}</p>
        </div>

        <ul
          className={cn(
            "grid gap-4",
            active.items.length === 1 && "max-w-md",
            active.items.length === 2 && "sm:grid-cols-2",
            active.items.length >= 3 && "sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {active.items.map((item) => (
            <li key={item.href}>
              <ModuleCard {...item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
