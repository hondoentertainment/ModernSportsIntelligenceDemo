import React, { useMemo, useState } from 'react';
import type { CardInventory, Sport, TargetWatchlist } from '../types';
import { compsSnapshot } from '../lib/collector/deskNext';
import { tableScore } from '../lib/collector/ladderScore';
import { buyLadder, buyLadderCopy } from '../lib/collector/offerLadder';
import { rangeSeatCopy, saleRange } from '../lib/collector/saleRange';
import {
  askVersusBookCopy,
  buildFloorBuyDraft,
  floorBuyId,
  followUps,
  isRevisit,
  referenceForNote,
  roomAskCopy,
  roomAsks,
  type MarkRef,
} from '../lib/collector/showClose';
import type { HoleTarget } from '../lib/collector/floorPack';
import {
  HAGGLE_DISCLOSURE,
  addHaggle,
  readHaggle,
  removeHaggle,
  type HaggleNote,
  type HaggleResult,
} from '../lib/shows/showHaggleLog';

interface Props {
  showId: string;
  showName: string;
  inventory?: CardInventory[];
  targets?: TargetWatchlist[];
  purchaseDate?: string;
  onFileBuy?: (card: CardInventory) => Promise<void> | void;
  onWatch?: (draft: HoleTarget) => void;
}

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

function heldCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter(card => card.status !== 'sold' && card.status !== 'consignment');
}

function parsedAsk(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function medianMap(cards: CardInventory[]): Record<string, MarkRef> {
  const map: Record<string, MarkRef> = {};
  for (const card of cards) {
    const snap = compsSnapshot(card);
    if (snap.median == null || snap.median <= 0) continue;
    if (snap.source === 'comps' || snap.source === 'demo') map[card.id] = { usd: snap.median, kind: snap.source };
  }
  return map;
}

const ShowHagglePanel: React.FC<Props> = ({
  showId,
  showName,
  inventory = [],
  targets = [],
  purchaseDate = '',
  onFileBuy,
  onWatch,
}) => {
  const cards = heldCards(inventory);
  const marks = useMemo(() => medianMap(cards), [cards]);
  const [notes, setNotes] = useState(() => readHaggle(showId));
  const [dealer, setDealer] = useState('');
  const [table, setTable] = useState('');
  const [ask, setAsk] = useState('');
  const [offer, setOffer] = useState('');
  const [result, setResult] = useState<HaggleResult>('open');
  const [note, setNote] = useState('');
  const [cardId, setCardId] = useState('');
  const [player, setPlayer] = useState('');
  const [detail, setDetail] = useState('');
  const [sport, setSport] = useState<Sport>('Baseball');
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const askUsd = parsedAsk(ask);
  const picked = cards.find(card => card.id === cardId);
  const rooms = roomAsks(notes);
  const liveReference = picked
    ? { usd: marks[picked.id]?.usd ?? null, kind: marks[picked.id]?.kind ?? ('none' as const) }
    : referenceForNote(
      { id: 'draft', showId, dealer, table, askUsd: askUsd ?? 0, offerUsd: 0, result, player },
      { medianByCardId: marks, targets },
    );
  const liveAsk = askUsd != null && (picked || player.trim())
    ? askVersusBookCopy(askUsd, liveReference, Boolean(picked))
    : null;
  const liveRange = picked && askUsd != null && askUsd > 0
    ? rangeSeatCopy(askUsd, saleRange(picked), 'This ask')
    : null;
  const liveLadder = picked ? buyLadderCopy(buyLadder(saleRange(picked))) : null;
  const liveScore = picked
    ? tableScore({ result, offerUsd: Number(offer), askUsd: askUsd ?? 0 }, buyLadder(saleRange(picked)))?.copy ?? null
    : null;

  const save = () => {
    const saved = addHaggle({
      showId,
      dealer,
      table,
      askUsd: Number(ask),
      offerUsd: Number(offer),
      result,
      note,
      cardId: cardId || undefined,
      player,
      detail,
      sport,
    });
    setNotes(saved.notes);
    setError(saved.error);
    if (!saved.error) {
      setDealer('');
      setTable('');
      setAsk('');
      setOffer('');
      setNote('');
      setResult('open');
      setCardId('');
      setPlayer('');
      setDetail('');
      setSport('Baseball');
    }
  };

  const fileNote = async (row: HaggleNote) => {
    if (!onFileBuy) return;
    const draft = buildFloorBuyDraft({ note: row, showName, purchaseDate });
    if (!draft) {
      setFileError('Name the player and a paid price before filing.');
      return;
    }
    setPendingId(row.id);
    setFileError(null);
    try {
      await onFileBuy(draft);
    } catch {
      setFileError('Could not file that buy. The collection was not changed.');
    } finally {
      setPendingId(null);
    }
  };

  const versusFor = (row: HaggleNote): string | null => {
    if (!row.cardId && !row.player) return null;
    const reference = referenceForNote(row, { medianByCardId: marks, targets });
    return askVersusBookCopy(row.askUsd, reference, Boolean(row.cardId));
  };

  const cardFor = (id: string | undefined): CardInventory | undefined => {
    if (!id) return undefined;
    return inventory.find((item) => item.id === id);
  };

  const rangeFor = (row: HaggleNote): string | null => {
    if (!row.cardId || !(row.askUsd > 0)) return null;
    const card = cardFor(row.cardId);
    if (!card) return null;
    return rangeSeatCopy(row.askUsd, saleRange(card), 'This ask');
  };

  const ladderFor = (row: HaggleNote): string | null => {
    const card = cardFor(row.cardId);
    if (!card) return null;
    return buyLadderCopy(buyLadder(saleRange(card)));
  };

  const scoreFor = (row: HaggleNote): string | null => {
    const card = cardFor(row.cardId);
    if (!card) return null;
    return tableScore(row, buyLadder(saleRange(card)))?.copy ?? null;
  };

  return (
    <div className="mt-4 space-y-3" role="tabpanel" aria-label={`Table notes for ${showName}`}>
      <p className="text-[11px] leading-relaxed text-slate-400">{HAGGLE_DISCLOSURE}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Dealer
          <input value={dealer} onChange={event => setDealer(event.target.value)} aria-label={`Dealer at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Table
          <input value={table} onChange={event => setTable(event.target.value)} aria-label={`Table at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Ask
          <input inputMode="decimal" value={ask} onChange={event => setAsk(event.target.value)} aria-label={`Ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Offer
          <input inputMode="decimal" value={offer} onChange={event => setOffer(event.target.value)} aria-label={`Offer at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Player
          <input value={player} onChange={event => setPlayer(event.target.value)} aria-label={`Player at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Card line
          <input value={detail} onChange={event => setDetail(event.target.value)} aria-label={`Card line at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
      </div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Sport
        <select value={sport} onChange={event => setSport(event.target.value as Sport)} aria-label={`Sport at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
          {SPORTS.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      {cards.length > 0 && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Card for the ask
          <select value={cardId} onChange={event => setCardId(event.target.value)} aria-label={`Card for the ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
            <option value="">No card</option>
            {cards.map(card => <option key={card.id} value={card.id}>{card.player}</option>)}
          </select>
        </label>
      )}
      {liveAsk ? <p className="text-xs text-slate-200" aria-label="Ask versus median">{liveAsk}</p> : null}
      {liveRange ? <p className="text-xs text-slate-200" aria-label="Ask versus sale range">{liveRange}</p> : null}
      {liveLadder ? <p className="text-xs text-slate-200" aria-label="Offer ladder">{liveLadder}</p> : null}
      {liveScore ? <p className="text-xs text-slate-200" aria-label="Ladder score">{liveScore}</p> : null}
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Result
        <select value={result} onChange={event => setResult(event.target.value as HaggleResult)} aria-label={`Result at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
          <option value="open">Open</option>
          <option value="bought">Bought</option>
          <option value="passed">Passed</option>
        </select>
      </label>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Note
        <input value={note} onChange={event => setNote(event.target.value)} aria-label={`Note at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
      </label>
      {error && <p className="text-[11px] text-rose-300" role="alert">{error}</p>}
      <button type="button" onClick={save} className="min-h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100">
        Add table note
      </button>
      <div aria-label="Cheapest asks">
        {rooms.length === 0 ? (
          <p className="text-xs text-slate-500">Name the player on two notes to compare asks.</p>
        ) : (
          <ul className="space-y-1">
            {rooms.map(row => (
              <li key={row.player} className="text-xs text-slate-200">{roomAskCopy(row)}</li>
            ))}
          </ul>
        )}
      </div>
      {fileError && <p className="text-[11px] text-rose-300" role="alert">{fileError}</p>}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">No table notes for this show yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map(row => {
            const versus = versusFor(row);
            const rangeCopy = rangeFor(row);
            const ladderCopy = ladderFor(row);
            const scoreCopy = scoreFor(row);
            const filed = inventory.find(card => card.id === floorBuyId(row.id));
            const draft = buildFloorBuyDraft({ note: row, showName, purchaseDate });
            const revisit = isRevisit(row, referenceForNote(row, { medianByCardId: marks, targets }));
            const watched = followUps({
              notes: [row],
              shows: [{ id: showId, name: showName }],
              medianByCardId: marks,
              targets,
            }).some(item => item.watch);
            return (
              <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-3" aria-label={`${row.dealer} ${row.table}`}>
                <p className="text-sm text-white">{row.dealer} · table {row.table}</p>
                <p className="font-mono text-xs text-slate-300">
                  Ask ${row.askUsd.toFixed(2)} · offer ${row.offerUsd.toFixed(2)} · {row.result}
                  {row.player ? ` · ${row.player}` : ''}
                </p>
                {row.note ? <p className="text-xs text-slate-400">{row.note}</p> : null}
                {versus ? <p className="text-xs text-slate-300">{versus}</p> : null}
                {rangeCopy ? <p className="text-xs text-slate-300">{rangeCopy}</p> : null}
                {ladderCopy ? <p className="text-xs text-slate-300" aria-label={`Offer ladder for ${row.player || 'this card'}`}>{ladderCopy}</p> : null}
                {scoreCopy ? <p className="text-xs text-slate-300" aria-label={`Ladder score for ${row.dealer} table ${row.table}`}>{scoreCopy}</p> : null}
                {filed ? (
                  <p className="mt-2 text-[11px] text-emerald-300">
                    {row.player} in the collection · cost basis ${filed.purchasePrice.toFixed(2)}
                  </p>
                ) : null}
                {onFileBuy && draft && !filed ? (
                  <button
                    type="button"
                    disabled={pendingId === row.id}
                    onClick={() => { void fileNote(row); }}
                    className="mt-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
                  >
                    {pendingId === row.id ? 'Filing…' : `Add ${row.player} to collection`}
                  </button>
                ) : null}
                {onWatch && revisit && watched ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = followUps({
                        notes: [row],
                        shows: [{ id: showId, name: showName }],
                        medianByCardId: marks,
                        targets,
                      })[0]?.watch;
                      if (next) onWatch(next);
                    }}
                    className="mt-2 min-h-[44px] rounded-lg border border-amber-500/40 px-3 py-2 text-xs font-bold text-amber-100"
                  >
                    Watch {row.player}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setNotes(removeHaggle(showId, row.id))}
                  className="mt-2 min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100"
                >
                  Remove {row.dealer}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ShowHagglePanel;
