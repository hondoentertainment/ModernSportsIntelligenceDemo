import React, { useMemo, useState, useSyncExternalStore } from 'react';
import type { CardInventory } from '../types';
import {
  DESK_NOTE,
  compsSnapshot,
  dayLeft,
  filterByPlace,
  markOf,
  readChecked,
  readPlaces,
  setPlace,
  tradeFairness,
  weeklyRecap,
  writeChecked,
  type Place,
  type PlaceFilter,
} from '../lib/collector/deskNext';
import { floorWeek } from '../lib/collector/floorPack';
import { haggleSnapshot, subscribeHaggle } from '../lib/shows/showHaggleLog';

const field = 'mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm';
const btn = 'min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100';

function usd(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function spark(points: number[]): string {
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const span = Math.max(max - min, 1);
  return points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 100;
    const y = 36 - ((point - min) / span) * 32;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function held(cards: CardInventory[]): CardInventory[] {
  return cards.filter((card) => card.status !== 'sold' && card.status !== 'consignment');
}

export function ShowDayPanel({ showId, lines, cashUsd }: {
  showId: string;
  lines: { id: string; side: 'buy' | 'sell'; player: string; usd: number | null }[];
  cashUsd: number | null;
}) {
  const [checked, setChecked] = useState(() => readChecked(showId));
  const openBuy = lines.reduce((sum, line) => (
    line.side === 'buy' && !checked.includes(line.id) && line.usd != null ? sum + line.usd : sum
  ), 0);
  const left = dayLeft(cashUsd, openBuy);
  return (
    <section className="mt-3 rounded-xl border border-slate-800 p-3" aria-label="Show day checklist">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Show day</h3>
      <p className="mt-1 text-[11px] text-slate-400">Offline checklist on this browser. {DESK_NOTE}</p>
      <p className="mt-2 font-mono text-xs text-slate-200">Budget left {left == null ? 'unset' : usd(left)}</p>
      {lines.length === 0 ? <p className="mt-2 text-sm text-slate-400">No shopping lines.</p> : (
        <ul className="mt-2 space-y-1">
          {lines.map((line) => (
            <li key={line.id}>
              <label className="flex min-h-[44px] items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={checked.includes(line.id)}
                  aria-label={`${line.side} ${line.player}`}
                  onChange={() => {
                    const next = checked.includes(line.id)
                      ? checked.filter((id) => id !== line.id)
                      : [...checked, line.id];
                    setChecked(writeChecked(showId, next));
                  }}
                />
                {line.side} {line.player} {line.usd == null ? '' : usd(line.usd)}
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CompsSnapshotPanel({ inventory }: { inventory: CardInventory[] }) {
  const cards = useMemo(() => held(inventory), [inventory]);
  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const card = cards.find((row) => row.id === cardId) ?? cards[0];
  const snap = card ? compsSnapshot(card) : null;
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Comps snapshot">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Comps snapshot</h2>
      <p className="mt-2 text-xs text-slate-400">Last sales and the median. {DESK_NOTE}</p>
      {!card || !snap ? <p className="mt-3 text-sm text-slate-400">No held cards.</p> : (
        <>
          <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Card
            <select aria-label="Comps snapshot card" className={field} value={card.id} onChange={(event) => setCardId(event.target.value)}>
              {cards.map((row) => <option key={row.id} value={row.id}>{row.player}</option>)}
            </select>
          </label>
          {snap.points.length === 0 ? <p className="mt-3 text-sm text-slate-400">No mark to sketch.</p> : (
            <>
              <svg viewBox="0 0 100 40" className="mt-3 h-16 w-full text-emerald-300" role="img" aria-label="Demo sales sparkline">
                <polyline fill="none" stroke="currentColor" strokeWidth="1.2" points={spark(snap.points)} />
              </svg>
              <p className="mt-2 font-mono text-xs text-slate-200">
                {snap.source === 'comps' ? 'Sold comps' : 'Demo sales'} · median {usd(snap.median ?? 0)} · {snap.points.length} sales
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}

function TradeBalancePanel({ inventory }: { inventory: CardInventory[] }) {
  const cards = useMemo(() => held(inventory), [inventory]);
  const [give, setGive] = useState<string[]>([]);
  const [receive, setReceive] = useState<string[]>([]);
  const [pick, setPick] = useState(cards[0]?.id ?? '');
  const [cash, setCash] = useState('0');
  const rows = (ids: string[]) => ids.flatMap((id) => {
    const card = cards.find((row) => row.id === id);
    return card ? [{ id, player: card.player, usd: markOf(card) }] : [];
  });
  const result = tradeFairness(rows(give), rows(receive), Number(cash));
  const add = (side: 'give' | 'receive') => {
    if (!pick) return;
    if (side === 'give') {
      setGive((ids) => ids.includes(pick) ? ids : [...ids, pick]);
      setReceive((ids) => ids.filter((id) => id !== pick));
    } else {
      setReceive((ids) => ids.includes(pick) ? ids : [...ids, pick]);
      setGive((ids) => ids.filter((id) => id !== pick));
    }
  };
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Trade value balancer">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Trade value balancer</h2>
      <p className="mt-2 text-xs text-slate-400">Two sides against local marks. {DESK_NOTE}</p>
      {cards.length === 0 ? <p className="mt-3 text-sm text-slate-400">No held cards.</p> : (
        <>
          <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Card
            <select aria-label="Trade card" className={field} value={pick} onChange={(event) => setPick(event.target.value)}>
              {cards.map((row) => <option key={row.id} value={row.id}>{row.player} {usd(markOf(row))}</option>)}
            </select>
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => add('give')}>Add to give</button>
            <button type="button" className={btn} onClick={() => add('receive')}>Add to receive</button>
          </div>
          <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Cash you add
            <input aria-label="Trade cash" inputMode="decimal" value={cash} onChange={(event) => setCash(event.target.value)} className={field} />
          </label>
          <p className="mt-2 text-sm text-white">Give {give.map((id) => rows([id])[0]?.player).filter(Boolean).join(', ') || 'none'}</p>
          <p className="text-sm text-white">Receive {receive.map((id) => rows([id])[0]?.player).filter(Boolean).join(', ') || 'none'}</p>
          <p className="mt-1 font-mono text-xs text-slate-200" aria-label="Trade call">
            {result.call} · give {usd(result.giveUsd)} · receive {usd(result.receiveUsd)} · net {usd(result.net)}
          </p>
        </>
      )}
    </section>
  );
}

function CardPlacePanel({ inventory }: { inventory: CardInventory[] }) {
  const cards = useMemo(() => held(inventory), [inventory]);
  const [places, setPlaces] = useState(readPlaces);
  const [filter, setFilter] = useState<PlaceFilter>('all');
  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const [place, setPlacePick] = useState<Place>('binder');
  const shown = filterByPlace(cards, places, filter).slice(0, 8);
  const filters: PlaceFilter[] = ['all', 'binder', 'box', 'slab'];
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Card location">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Card location</h2>
      <p className="mt-2 text-xs text-slate-400">Binder, box, or slab case on this browser. {DESK_NOTE}</p>
      {cards.length === 0 ? <p className="mt-3 text-sm text-slate-400">No held cards.</p> : (
        <>
          <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Card
            <select aria-label="Location card" className={field} value={cardId} onChange={(event) => setCardId(event.target.value)}>
              {cards.map((row) => <option key={row.id} value={row.id}>{row.player}</option>)}
            </select>
          </label>
          <label className="mt-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
            Place
            <select aria-label="Location place" className={field} value={place} onChange={(event) => setPlacePick(event.target.value as Place)}>
              <option value="binder">Binder</option>
              <option value="box">Box</option>
              <option value="slab">Slab case</option>
            </select>
          </label>
          <button type="button" className={`${btn} mt-2`} onClick={() => cardId && setPlaces(setPlace(cardId, place))}>Save location</button>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((value) => (
              <button key={value} type="button" aria-pressed={filter === value} className={btn} onClick={() => setFilter(value)}>
                {value}
              </button>
            ))}
          </div>
          <ul className="mt-2 space-y-1">
            {shown.map((row) => (
              <li key={row.id} className="text-sm text-white">{row.player} · {places[row.id] ?? 'unplaced'}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function WeeklyRecapPanel({ inventory }: { inventory: CardInventory[] }) {
  const recap = useMemo(() => weeklyRecap(inventory), [inventory]);
  const notes = useSyncExternalStore(subscribeHaggle, haggleSnapshot, haggleSnapshot);
  const floor = useMemo(() => floorWeek(notes), [notes]);
  const floorCount = floor.bought + floor.passed + floor.open;
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Weekly collection recap">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Weekly recap</h2>
      <p className="mt-2 text-xs text-slate-400">Value change, buys, sells, and movers. {DESK_NOTE}</p>
      <p className="mt-2 font-mono text-xs text-slate-200">
        Value {usd(recap.nowUsd)} · change {usd(recap.deltaUsd)} · buys {recap.buyCount} ({usd(recap.buyUsd)}) · sells {recap.sellCount} ({usd(recap.sellUsd)})
      </p>
      <p className="mt-2 text-xs text-slate-300">
        {floorCount === 0
          ? 'No dated floor notes this week. Notes with no date stay off this count.'
          : `Floor notes this week: ${floor.bought} bought, ${floor.passed} passed, ${floor.open} open${floor.bought > 0 ? ` · typed spend ${usd(floor.typedSpendUsd)}` : ''}. Not a settlement.`}
      </p>
      {recap.movers.length === 0 ? <p className="mt-2 text-sm text-slate-400">No held cards.</p> : (
        <ul className="mt-2 space-y-1">
          {recap.movers.map((row) => (
            <li key={row.id} className="text-sm text-white">{row.player} · {usd(row.delta)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

const DeskNext: React.FC<{ inventory: CardInventory[] }> = ({ inventory }) => (
  <>
    <WeeklyRecapPanel inventory={inventory} />
    <CompsSnapshotPanel inventory={inventory} />
    <TradeBalancePanel inventory={inventory} />
    <CardPlacePanel inventory={inventory} />
  </>
);

export default DeskNext;
