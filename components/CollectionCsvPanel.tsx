import React, { useState } from 'react';
import type { CardInventory } from '../types';
import { CSV_DISCLOSURE, applyCollectionCsv, exportCollectionCsv } from '../lib/collection/collectionCsv';

interface Props {
  inventory: CardInventory[];
  onApply?: (cards: CardInventory[]) => void;
}

const CollectionCsvPanel: React.FC<Props> = ({ inventory, onApply }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = () => {
    const blob = new Blob([exportCollectionCsv(inventory)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'msi-collection.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File | undefined) => {
    setMessage(null);
    setError(null);
    if (!file) return;
    if (file.size > 80_000) {
      setError('CSV is too large for this demo.');
      return;
    }
    const result = applyCollectionCsv(inventory, await file.text());
    if (result.error) {
      setError(result.error);
      return;
    }
    onApply?.(result.inventory);
    const skipped = result.skipped ? `, ${result.skipped} skipped` : '';
    setMessage(`Applied ${result.applied} rows (${result.added} new, ${result.updated} updated${skipped}).`);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Collection CSV">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Collection CSV</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{CSV_DISCLOSURE}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={download} className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100">
          Export collection CSV
        </button>
        {onApply ? (
          <label className="inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100">
            Import collection CSV
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="Import collection CSV"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                void onFile(file);
              }}
            />
          </label>
        ) : (
          <p className="text-xs text-slate-500">Import stays on the demo book in this browser.</p>
        )}
      </div>
      {message && <p className="mt-2 text-xs text-emerald-300" role="status">{message}</p>}
      {error && <p className="mt-2 text-xs text-rose-300" role="alert">{error}</p>}
    </section>
  );
};

export default CollectionCsvPanel;
