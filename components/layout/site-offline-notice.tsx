export function SiteOfflineNotice() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
    >
      <p className="mx-auto max-w-2xl leading-relaxed">
        We&apos;re having trouble loading the latest content right now. You can still browse the site please check
        your internet connection and try later.
      </p>
    </div>
  );
}
