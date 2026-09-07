import React, { useId, useState } from 'react';
import { ChevronRight, Layers } from 'lucide-react';
import type { CompsUsedView } from '../lib/pricing/compConsensus';

interface CompsUsedPanelProps {
  view: CompsUsedView;
  compact?: boolean;
  defaultOpen?: boolean;
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatSoldAt(soldAt: string): string {
  if (!soldAt) return 'Date not stored';
  const ts = Date.parse(soldAt.includes('T') ? soldAt : `${soldAt}T12:00:00`);
  if (Number.isNaN(ts)) return soldAt;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CompsUsedPanel: React.FC<CompsUsedPanelProps> = ({
  view,
  compact = false,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen || view.rows.length === 0);
  const panelId = useId();
  const countLabel =
    view.rows.length === 0
      ? 'No comps'
      : `${view.rows.length} comp${view.rows.length === 1 ? '' : 's'}`;

  return (
    <div className={compact ? 'mt-2' : 'mt-3'}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-left transition-colors hover:border-slate-700"
      >
        <Layers size={12} className="shrink-0 text-cyan-300" aria-hidden />
        <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
          Comps Used
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{countLabel}</span>
        <ChevronRight
          size={12}
          aria-hidden
          className={`shrink-0 text-brand-muted transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Comps Used"
          className="mt-2 space-y-2 rounded-xl border border-slate-800 bg-brand-charcoal/50 p-3"
        >
          {view.median != null ? (
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              Median {formatMoney(view.median)}
            </p>
          ) : null}

          {view.emptyReason ? (
            <p role="status" className="text-[11px] leading-relaxed text-slate-400">
              {view.emptyReason}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {view.rows.map((row, index) => (
                <li
                  key={`${row.soldAt}-${row.price}-${index}`}
                  className="flex items-start justify-between gap-3 text-[11px]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-slate-200">{row.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatSoldAt(row.soldAt)}
                      {row.condition ? ` · ${row.condition}` : ''}
                      {row.fresh ? '' : ' · stale'}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono font-bold text-white">{formatMoney(row.price)}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[10px] italic leading-relaxed text-slate-500">{view.disclosure}</p>
        </div>
      )}
    </div>
  );
};

export default CompsUsedPanel;
