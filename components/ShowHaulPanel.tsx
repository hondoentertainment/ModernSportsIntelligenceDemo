import React, { useMemo, useState, useSyncExternalStore } from 'react';
import type { CardInventory } from '../types';
import {
  HAUL_PLACE_NOTE,
  SHOW_HAUL_NOTE,
  haulPlaceIds,
  haulRowCopy,
  showHaul,
} from '../lib/collector/showHaul';
import { placesSnapshot, setPlace, subscribePlaces, type Place } from '../lib/collector/deskNext';
import { rangeForSeat } from '../lib/collector/saleRange';
import { haggleSnapshot, subscribeHaggle } from '../lib/shows/showHaggleLog';

interface Props {
  showId: string;
  inventory: CardInventory[];
}

const PLACE_LABEL: Record<Place, string> = {
  binder: 'binder',
  box: 'box',
  slab: 'slab case',
};

const ShowHaulPanel: React.FC<Props> = ({ showId, inventory }) => {
  const notes = useSyncExternalStore(subscribeHaggle, haggleSnapshot, haggleSnapshot);
  const places = useSyncExternalStore(subscribePlaces, placesSnapshot, placesSnapshot);
  const [place, setPlacePick] = useState<Place>('binder');
  const haul = useMemo(() => showHaul({
    notes: notes.filter((note) => note.showId === showId),
    inventory,
    places,
    rangeForId: (id) => {
      const card = inventory.find((row) => row.id === id);
      return card ? rangeForSeat(card) : null;
    },
  }), [notes, showId, inventory, places]);
  const shown = haul.rows.slice(0, 8);
  const unplaced = haulPlaceIds(haul);
  return (
    <section className="mt-3 rounded-xl border border-slate-800 p-3" aria-label="Show haul">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Show haul</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{SHOW_HAUL_NOTE}</p>
      <p className="mt-2 text-xs text-slate-200" aria-label="Show haul totals">{haul.copy}</p>
      {shown.length > 0 ? (
        <ul className="mt-2 space-y-1" aria-label="Show haul cards">
          {shown.map((row) => (
            <li key={row.id} className="text-xs text-slate-300">{haulRowCopy(row)}</li>
          ))}
        </ul>
      ) : null}
      {haul.rows.length > 8 ? (
        <p className="mt-1 text-xs text-slate-500">
          {haul.rows.length - 8 === 1
            ? '1 more card stays off this list.'
            : `${haul.rows.length - 8} more cards stay off this list.`}
        </p>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{HAUL_PLACE_NOTE}</p>
      <label className="mt-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Place the haul
        <select
          aria-label="Haul place"
          className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm"
          value={place}
          onChange={(event) => setPlacePick(event.target.value as Place)}
        >
          <option value="binder">Binder</option>
          <option value="box">Box</option>
          <option value="slab">Slab case</option>
        </select>
      </label>
      <button
        type="button"
        disabled={unplaced.length === 0}
        onClick={() => {
          for (const id of unplaced) setPlace(id, place);
        }}
        className="mt-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
      >
        Put unplaced haul cards in the {PLACE_LABEL[place]}
      </button>
    </section>
  );
};

export default ShowHaulPanel;
