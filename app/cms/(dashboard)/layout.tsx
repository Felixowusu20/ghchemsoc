import { CmsSidebar } from "@/components/cms/cms-sidebar";

export default function CmsDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100/90">
      <div className="mx-auto flex min-h-screen max-w-[1680px] shadow-sm shadow-slate-900/5">
        <CmsSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white md:rounded-l-none">
          <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 px-4 py-6 pl-[4.5rem] backdrop-blur-md md:pl-10 md:pt-8">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gcs-primary">Ghana Chemical Society</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Content administration</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Edit public pages and review messages. Published items appear on the live site.
                </p>
              </div>
              <p className="mt-3 hidden text-xs text-slate-400 md:mt-0 md:block">Signed in as editor</p>
            </div>
          </header>
          <div className="flex-1 bg-slate-50/40 px-4 py-8 md:px-10 md:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
