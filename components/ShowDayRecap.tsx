import React, { useSyncExternalStore } from 'react';
import type { CardInventory } from '../types';
import { DAY_KEY, readChecked } from '../lib/collector/deskNext';
import { rangeForSeat } from '../lib/collector/saleRange';
import { SHOW_DAY_RECAP_NOTE, buildShowDayRecap } from '../lib/collector/showDayRecap';
import { SHOW_PNL_NOTE, pnlRowCopy, showPnl } from '../lib/collector/showPnl';
import {
  REALIZED_EXPORT_NOTE,
  canDownloadRealized,
  downloadRealizedCsv,
} from '../lib/collector/inventoryAge';
import { store } from '../lib/dal/syncStore';
import { haggleSnapshot } from '../lib/shows/showHaggleLog';
import { SHOW_TRIP_DECISIONS_KEY, readFloorDecisions } from '../lib/shows/showTripLoop';

interface Line {
  id: string;
  side: 'buy' | 'sell';
  player: string;
  usd: number | null;
}

interface Props {
  showId: string;
  lines: Line[];
  inventory: CardInventory[];
}

let deskCache = '';

function deskKey(): string {
  const key = JSON.stringify([
    haggleSnapshot(),
    store.get(SHOW_TRIP_DECISIONS_KEY, []),
    store.get(DAY_KEY, {}),
  ]);
  if (key === deskCache) return deskCache;
  deskCache = key;
  return deskCache;
}

const ShowDayRecap: React.FC<Props> = ({ showId, lines, inventory }) => {
  const desk = useSyncExternalStore((listener) => store.onWrite(listener), deskKey, deskKey);
  const checked = readChecked(showId);
  const notes = haggleSnapshot().filter((note) => note.showId === showId);
  const decisions = readFloorDecisions(showId);
  const recap = buildShowDayRecap({
    notes,
    decisions,
    lines: lines.map((line) => ({ ...line, checked: checked.includes(line.id) })),
    rangeForId: (id) => {
      const card = inventory.find((row) => row.id === id);
      return card ? rangeForSeat(card) : null;
    },
  });
  const pnl = showPnl({ notes, decisions, inventory, showId });
  const unsold = pnl.unsold.slice(0, 8);
  const sold = pnl.sold.slice(0, 8);
  const hidden = pnl.unsold.length - unsold.length + (pnl.sold.length - sold.length);
  return (
    <section key={desk} className="mt-3 rounded-xl border border-slate-800 p-3" aria-label="Show-day recap">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Show-day recap</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{SHOW_DAY_RECAP_NOTE}</p>
      <p className="mt-2 text-xs text-slate-200" aria-label="Show-day totals">{recap.copy}</p>
      <section className="mt-3 border-t border-slate-800 pt-3" aria-label="Show profit and loss">
        <h4 className="text-xs font-black uppercase tracking-widest text-white">Show profit and loss</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{SHOW_PNL_NOTE}</p>
        <p className="mt-2 text-xs text-slate-200" aria-label="Show profit and loss totals">{pnl.copy}</p>
        {unsold.length > 0 ? (
          <ul className="mt-2 space-y-1" aria-label="Unsold inventory">
            {unsold.map((row) => (
              <li key={row.id} className="text-xs text-slate-300">{pnlRowCopy(row)}</li>
            ))}
          </ul>
        ) : null}
        {sold.length > 0 ? (
          <ul className="mt-2 space-y-1" aria-label="Sold inventory">
            {sold.map((row) => (
              <li key={row.id} className="text-xs text-slate-300">{pnlRowCopy(row)}</li>
            ))}
          </ul>
        ) : null}
        {hidden > 0 ? (
          <p className="mt-1 text-xs text-slate-500">
            {hidden === 1 ? '1 more card stays off this list.' : `${hidden} more cards stay off this list.`}
          </p>
        ) : null}
        {canDownloadRealized(pnl.sold) ? (
          <div className="mt-3">
            <button
              type="button"
              className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100"
              onClick={() => downloadRealizedCsv(pnl.sold, 'msi-show-realized.csv')}
            >
              Download realized results
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{REALIZED_EXPORT_NOTE}</p>
          </div>
        ) : null}
      </section>
    </section>
  );
};

export default ShowDayRecap;
