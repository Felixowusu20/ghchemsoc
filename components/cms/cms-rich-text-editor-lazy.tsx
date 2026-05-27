"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * TipTap must not run during SSR. CMS news/events pages load via a client shell with
 * `dynamic({ ssr: false })` (see news-cms-shell.tsx / events-cms-shell.tsx).
 */
export const CmsRichTextEditor = dynamic(
  () => import("./cms-rich-text-editor").then((m) => m.CmsRichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-gcs-muted-text">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading editor…
      </div>
    ),
  }
);
