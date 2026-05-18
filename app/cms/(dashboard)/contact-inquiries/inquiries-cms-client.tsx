"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { CmsButton, CmsCard } from "@/components/cms/cms-ui";
import { CmsSectionTitle } from "@/components/cms/cms-section-title";
import { Mail } from "lucide-react";
import { handleCmsResponse } from "@/lib/cms-toast";
import { refreshCmsNotifications } from "@/components/cms/cms-nav-badges";

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export function InquiriesCmsClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const q = unreadOnly ? "?unread=1" : "";
    const res = await fetch(`/api/cms/contact-inquiries${q}`, cmsCredentials);
    if (!res.ok) {
      setErr(res.status === 401 ? "Sign in at /cms/login" : await res.text());
      setRows([]);
      setLoading(false);
      return;
    }
    setRows((await res.json()) as Row[]);
    setLoading(false);
  }, [unreadOnly]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  async function setRead(id: string, read: boolean) {
    const res = await fetch(`/api/cms/contact-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...cmsCredentials,
      body: JSON.stringify({ read }),
    });
    if (await handleCmsResponse(res, "Message updated", {})) {
      await load();
      refreshCmsNotifications();
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gcs-primary">Public site</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Contact messages</h1>
        <p className="mt-2 text-sm text-slate-600">Submissions from the /contact form. Mark as read once handled.</p>
      </div>
      {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p> : null}

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
        Show unread only
      </label>

      <div>
        <CmsSectionTitle>Messages ({rows.length})</CmsSectionTitle>
        <ul className="mt-6 space-y-4">
          {rows.length === 0 ? (
            <CmsCard className="p-8 text-center text-sm text-slate-500">No messages yet.</CmsCard>
          ) : null}
          {rows.map((r) => (
            <li key={r.id}>
              <CmsCard className={`p-6 ${r.read ? "opacity-90" : "ring-2 ring-gcs-primary/25"}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {r.firstName} {r.lastName}
                      </span>
                      {!r.read ? (
                        <span className="rounded-full bg-gcs-primary/15 px-2 py-0.5 text-xs font-semibold text-gcs-primary">
                          New
                        </span>
                      ) : null}
                    </div>
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-gcs-primary hover:underline">
                      <Mail className="h-4 w-4 shrink-0" aria-hidden />
                      {r.email}
                    </a>
                    {r.phone ? <p className="text-sm text-slate-600">{r.phone}</p> : null}
                    <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                    <p className="whitespace-pre-wrap pt-2 text-sm leading-relaxed text-slate-700">{r.message}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 md:items-end">
                    {r.read ? (
                      <CmsButton type="button" variant="ghost" className="w-full md:w-auto" onClick={() => void setRead(r.id, false)}>
                        Mark unread
                      </CmsButton>
                    ) : (
                      <CmsButton type="button" className="w-full md:w-auto" onClick={() => void setRead(r.id, true)}>
                        Mark read
                      </CmsButton>
                    )}
                  </div>
                </div>
              </CmsCard>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
