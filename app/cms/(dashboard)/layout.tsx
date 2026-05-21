import { CmsHeaderActions } from "@/components/cms/cms-header-actions";
import { CmsSidebar } from "@/components/cms/cms-sidebar";

export default function CmsDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px] shadow-sm shadow-gcs-border/30">
        <CmsSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white md:rounded-l-none">
          <header className="sticky top-0 z-10 border-b border-gcs-border/80 bg-white/95 px-4 py-4 pl-14 backdrop-blur-md sm:py-5 sm:pl-[4.5rem] md:pl-10 md:pt-8">
            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gcs-primary">Ghana Chemical Society</p>
                <h1 className="mt-1 break-words text-lg font-semibold tracking-tight text-gcs-foreground sm:text-xl md:text-2xl">Website administration</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gcs-muted-text">
                  Edit public pages and review messages. Published items appear on the live site.
                </p>
              </div>
              <CmsHeaderActions />
            </div>
          </header>
          <div className="min-w-0 flex-1 bg-slate-50/60 px-4 py-6 sm:py-8 md:px-10 md:py-10">
            <div className="mx-auto min-w-0 max-w-6xl">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
