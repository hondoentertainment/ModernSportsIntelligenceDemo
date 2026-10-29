import React, { useSyncExternalStore } from 'react';
import type { CardInventory } from '../types';
import { DAY_KEY, readChecked } from '../lib/collector/deskNext';
import { rangeForSeat } from '../lib/collector/saleRange';
import { SHOW_DAY_RECAP_NOTE, buildShowDayRecap } from '../lib/collector/showDayRecap';
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
  const recap = buildShowDayRecap({
    notes: haggleSnapshot().filter((note) => note.showId === showId),
    decisions: readFloorDecisions(showId),
    lines: lines.map((line) => ({ ...line, checked: checked.includes(line.id) })),
    rangeForId: (id) => {
      const card = inventory.find((row) => row.id === id);
      return card ? rangeForSeat(card) : null;
    },
  });
  return (
    <section key={desk} className="mt-3 rounded-xl border border-slate-800 p-3" aria-label="Show-day recap">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Show-day recap</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{SHOW_DAY_RECAP_NOTE}</p>
      <p className="mt-2 text-xs text-slate-200" aria-label="Show-day totals">{recap.copy}</p>
    </section>
  );
};

export default ShowDayRecap;
