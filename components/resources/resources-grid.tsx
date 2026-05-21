"use client";

import { useMemo, useState } from "react";
import { FileText, LayoutGrid, Link2, Play, Search, Sparkles } from "lucide-react";
import { ResourceCard } from "@/components/resources/resource-card";
import type { SocietyResourcePublic } from "@/lib/resources-page";
import { cn } from "@/lib/utils";

type Filter = "all" | SocietyResourcePublic["kind"];

const FILTERS: { id: Filter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "video", label: "Videos", icon: Play },
  { id: "document", label: "Documents", icon: FileText },
  { id: "link", label: "Links", icon: Link2 },
  { id: "other", label: "Other", icon: Sparkles },
];

export function ResourcesGrid({
  items,
  excludeId,
}: {
  items: SocietyResourcePublic[];
  excludeId?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const pool = useMemo(
    () => (excludeId ? items.filter((i) => i.id !== excludeId) : items),
    [items, excludeId]
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: pool.length, video: 0, document: 0, link: 0, other: 0 };
    for (const item of pool) c[item.kind] += 1;
    return c;
  }, [pool]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    });
  }, [pool, filter, query]);

  return (
    <div>
      <div className="rounded-[1.5rem] border border-gcs-border/60 bg-white/70 p-4 shadow-sm backdrop-blur-md sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gcs-foreground md:text-xl">Browse the library</h2>
            <p className="mt-0.5 text-sm text-gcs-muted-text">Search or filter by type</p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gcs-muted-text"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or description…"
              className="w-full rounded-2xl border border-gcs-border/80 bg-white py-3 pl-11 pr-4 text-sm text-gcs-foreground shadow-inner shadow-slate-900/[0.03] outline-none transition placeholder:text-gcs-muted-text/80 focus:border-gcs-primary/50 focus:ring-2 focus:ring-gcs-primary/15"
              aria-label="Search resources"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-wrap gap-1 rounded-2xl border border-gcs-border/50 bg-gcs-muted-bg/80 p-1"
            role="tablist"
            aria-label="Filter resources"
          >
            {FILTERS.map((f) => {
              const n = counts[f.id];
              if (f.id !== "all" && n === 0) return null;
              const active = filter === f.id;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-gcs-primary shadow-sm ring-1 ring-gcs-border/60"
                      : "text-gcs-muted-text hover:text-gcs-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                  {f.label}
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-[11px] tabular-nums",
                      active ? "bg-gcs-primary/10 text-gcs-primary" : "bg-transparent opacity-70"
                    )}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm font-medium text-gcs-muted-text tabular-nums">
            Showing <span className="text-gcs-foreground">{filtered.length}</span> of {pool.length}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-[2rem] border border-dashed border-gcs-border/70 bg-gradient-to-b from-white to-gcs-muted-bg/30 px-8 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gcs-primary/10">
            <Search className="h-6 w-6 text-gcs-primary" aria-hidden />
          </div>
          <p className="mt-5 text-lg font-semibold text-gcs-foreground">No matches</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gcs-muted-text">
            Try a different search term or category filter.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <ResourceCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
