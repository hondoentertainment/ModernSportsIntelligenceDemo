import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import {
  formatDeskMoney,
  type IndexDefinition,
  NEXT_FEATURE_DISCLOSURE,
  priceIndex,
} from '../lib/analytics/nextFeatureDesk';
import { store } from '../lib/dal/syncStore';
import { useInventory } from '../lib/utils/useInventory';
import type { Sport } from '../types';

const INDEX_KEY = 'msi_synthetic_indices_v1';
const SPORTS: Array<Sport | 'All'> = ['All', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

function blankDefinition(): IndexDefinition {
  return {
    id: `idx-${Date.now()}`,
    name: 'Custom index',
    sport: 'All',
    yearMin: 1950,
    yearMax: new Date().getFullYear(),
    gradedOnly: false,
    playerQuery: '',
  };
}

const SyntheticIndexBuilder: React.FC = () => {
  const { inventory } = useInventory();
  const [saved, setSaved] = useState<IndexDefinition[]>(() => store.get<IndexDefinition[]>(INDEX_KEY, []));
  const [draft, setDraft] = useState<IndexDefinition>(blankDefinition);
  const priced = useMemo(() => saved.map(definition => ({ definition, quote: priceIndex(inventory, definition) })), [saved, inventory]);
  const draftQuote = useMemo(() => priceIndex(inventory, draft), [inventory, draft]);

  const persist = (next: IndexDefinition[]) => {
    setSaved(next);
    store.set(INDEX_KEY, next);
  };

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Synthetic Index Builder"
      lede="Index level 100 means the matched holdings are unchanged versus cost. Level 110 means the marks are 10% above cost. One-day change is omitted until a prior close is stored."
      icon={<BarChart3 size={12} />}
      stats={[
        { label: 'Saved indices', value: String(saved.length) },
        { label: 'Draft constituents', value: String(draftQuote.constituents) },
        { label: 'Draft level', value: draftQuote.level === null ? '—' : String(draftQuote.level) },
      ]}
      sectionTitle="Saved indices"
      rows={priced.map(({ definition, quote }) => ({
        id: definition.id,
        title: definition.name,
        detail: `${quote.constituents} cards · cost ${formatDeskMoney(quote.cost)} · mark ${formatDeskMoney(quote.mark)}`,
        aside: quote.level === null ? '—' : String(quote.level),
      }))}
      empty="Save a definition to keep it on this device."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    >
      <form
        className="grid gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 md:grid-cols-2"
        onSubmit={event => {
          event.preventDefault();
          persist([{ ...draft, id: `idx-${Date.now()}`, name: draft.name.trim() || 'Custom index' }, ...saved]);
          setDraft(blankDefinition());
        }}
      >
        <label className="text-sm text-slate-300">
          Name
          <input
            value={draft.name}
            onChange={event => setDraft({ ...draft, name: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-slate-300">
          Sport
          <select
            value={draft.sport}
            onChange={event => setDraft({ ...draft, sport: event.target.value as Sport | 'All' })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            {SPORTS.map(sport => <option key={sport} value={sport}>{sport}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-300">
          Year from
          <input
            type="number"
            value={draft.yearMin}
            onChange={event => setDraft({ ...draft, yearMin: Number(event.target.value) || 0 })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-slate-300">
          Year to
          <input
            type="number"
            value={draft.yearMax}
            onChange={event => setDraft({ ...draft, yearMax: Number(event.target.value) || 0 })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-slate-300 md:col-span-2">
          Player contains
          <input
            value={draft.playerQuery}
            onChange={event => setDraft({ ...draft, playerQuery: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={draft.gradedOnly}
            onChange={event => setDraft({ ...draft, gradedOnly: event.target.checked })}
          />
          Graded only
        </label>
        <div className="flex items-end">
          <button type="submit" className="rounded-xl bg-brand-lime/20 px-4 py-2 text-sm font-semibold text-brand-lime">
            Save index
          </button>
        </div>
      </form>
    </FrontierDesk>
  );
};

export default SyntheticIndexBuilder;
