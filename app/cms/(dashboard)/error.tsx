"use client";

import Link from "next/link";

export default function CmsDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-800">
        This page could not load. If you recently reset the database, run{" "}
        <code className="rounded bg-red-100 px-1">npx prisma migrate deploy</code> on production, then try again.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <p className="mt-3 break-all text-left text-xs text-red-700">{error.message}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gcs-primary px-5 py-2 text-sm font-semibold text-white hover:bg-gcs-primary-hover"
        >
          Try again
        </button>
        <Link href="/cms" className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-900">
          Back to overview
        </Link>
      </div>
    </div>
  );
}
