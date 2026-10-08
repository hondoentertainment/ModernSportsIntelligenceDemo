import type { ReactNode } from 'react';

export interface DeskStat {
  label: string;
  value: string;
  hint?: string;
}

export interface DeskRow {
  id: string;
  title: string;
  detail?: string;
  aside?: string;
  asideClassName?: string;
}

export function FrontierDesk({
  badge,
  title,
  lede,
  icon,
  stats,
  sectionTitle,
  rows,
  empty,
  disclosure,
  children,
}: {
  badge: string;
  title: string;
  lede: string;
  icon: ReactNode;
  stats: DeskStat[];
  sectionTitle: string;
  rows: DeskRow[];
  empty: string;
  disclosure: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          {icon}
          {badge}
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">{title}</h1>
        <p className="max-w-3xl text-sm text-slate-400">{lede}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
            {stat.hint && <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>}
          </div>
        ))}
      </div>
      {children}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">{sectionTitle}</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : (
          <ul className="space-y-3">
            {rows.map(row => (
              <li key={row.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-800/50 p-3 text-sm">
                <div>
                  <span className="font-medium text-white">{row.title}</span>
                  {row.detail && <p className="mt-1 text-xs text-slate-500">{row.detail}</p>}
                </div>
                {row.aside && <span className={row.asideClassName ?? 'text-slate-300'}>{row.aside}</span>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">{disclosure}</p>
      </div>
    </div>
  );
}
