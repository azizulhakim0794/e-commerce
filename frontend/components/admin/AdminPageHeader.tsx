export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b2762f]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#102d2a] lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
