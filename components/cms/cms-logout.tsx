"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";

export function CmsLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/auth/logout", { method: "POST", ...cmsCredentials });
        } finally {
          router.push("/cms/login");
          router.refresh();
        }
      }}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {busy ? "Signing out…" : "Log out"}
    </button>
  );
}
