export function CmsSectionTitle({
  children,
  description,
}: {
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{children}</h2>
      {description ? <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p> : null}
    </div>
  );
}
