import React, { useMemo, useState } from 'react';
import { Briefcase, Printer } from 'lucide-react';
import type { CardInventory, TargetWatchlist } from '../types';
import {
  SHOW_BAG_DISCLOSURE,
  buildShowBag,
  downloadShowBagHtml,
  toggleShowBagPacked,
  type ShowBagSectionId,
} from '../lib/utils/showBag';
import { getTriageReviewIds } from '../lib/utils/collectionTriage';

interface Props {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
}

const SECTION_TITLE: Record<ShowBagSectionId, string> = {
  review: 'Review / decide',
  consign: 'Consignment',
  targets: 'Buy targets',
  supplies: 'Supplies & prep',
};

const ShowBagPanel: React.FC<Props> = ({ inventory, targets = [] }) => {
  const [tick, setTick] = useState(0);
  const doc = useMemo(
    () => buildShowBag({ inventory, targets, reviewIds: getTriageReviewIds() }),
    [inventory, targets, tick],
  );

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-brand-charcoal/60 p-5 md:p-6" aria-label="Show bag packing list">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-emerald-300" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Show bag</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              Local packing list · printable checklist
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => downloadShowBagHtml(doc)}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-500/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-200"
        >
          <Printer size={14} aria-hidden />
          Download HTML
        </button>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{SHOW_BAG_DISCLOSURE}</p>
      {doc.items.length === 0 ? (
        <p className="text-xs text-slate-500">Nothing queued yet — swipe cards to review, add targets, or consign holdings.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(['review', 'consign', 'targets', 'supplies'] as const).map((section) => {
            const rows = doc.items.filter((item) => item.section === section);
            return (
              <div key={section} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {SECTION_TITLE[section]} · {rows.length}
                </p>
                {rows.length === 0 ? (
                  <p className="text-xs text-slate-600">None</p>
                ) : (
                  <ul className="space-y-2">
                    {rows.map((row) => (
                      <li key={row.id}>
                        <label className="flex items-start gap-2 text-xs text-slate-200">
                          <input
                            type="checkbox"
                            checked={row.packed}
                            onChange={() => {
                              toggleShowBagPacked(row.id);
                              setTick((n) => n + 1);
                            }}
                          />
                          <span>
                            <span className="font-semibold">{row.label}</span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">{row.detail}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ShowBagPanel;
