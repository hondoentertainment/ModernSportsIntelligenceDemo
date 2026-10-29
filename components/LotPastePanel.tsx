import React, { useMemo, useState } from 'react';
import type { CardInventory, TargetWatchlist } from '../types';
import { LOT_PASTE_NOTE, parseLotList, priceLot, type LotBookCard } from '../lib/collector/lotPaste';
import { preferredGradeKey, rangeForSeat } from '../lib/collector/saleRange';

interface Props {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function bookForLot(inventory: CardInventory[], targets: readonly TargetWatchlist[]): LotBookCard[] {
  const held = inventory.filter((card) => card.status !== 'sold' && card.status !== 'consignment');
  const fromBook: LotBookCard[] = held.map((card) => ({
    id: card.id,
    player: card.player,
    detail: [card.year, card.manufacturer, card.set, card.grade, card.gradingCompany].filter((part) => part != null && String(part) !== '').join(' '),
    gradeKey: preferredGradeKey(card),
    range: rangeForSeat(card),
  }));
  const players = new Set(fromBook.map((card) => norm(card.player)));
  const fromTargets: LotBookCard[] = targets
    .filter((target) => target.status === 'active' && !players.has(norm(target.player)))
    .map((target) => {
      const input = {
        id: target.id,
        currentValue: target.currentMarketPrice,
        salesData: target.salesData,
        gradeText: target.cardDescription,
      };
      return {
        id: target.id,
        player: target.player,
        detail: target.cardDescription,
        gradeKey: preferredGradeKey(input),
        range: rangeForSeat(input),
      };
    });
  return [...fromBook, ...fromTargets];
}

const LotPastePanel: React.FC<Props> = ({ inventory, targets = [] }) => {
  const [text, setText] = useState('');
  const book = useMemo(() => bookForLot(inventory, targets), [inventory, targets]);
  const priced = useMemo(() => priceLot(parseLotList(text), book), [text, book]);
  return (
    <section className="rounded-lg border border-slate-800 p-3" aria-label="Lot pricing">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Lot pricing</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{LOT_PASTE_NOTE}</p>
      <label className="mt-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Lot list
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Lot list"
          rows={4}
          placeholder={'Aaron Judge, 2024 Topps, $40\nJayson Tatum PSA 10 $220'}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base text-white md:text-sm"
        />
      </label>
      <p className="mt-2 text-xs text-slate-200" aria-label="Lot total">{priced.copy}</p>
      {priced.lines.length > 0 ? (
        <ul className="mt-2 space-y-1" aria-label="Lot ladders">
          {priced.lines.map((line, index) => (
            <li key={`${line.player}:${index}`} className="text-xs text-slate-300">{line.copy}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default LotPastePanel;
