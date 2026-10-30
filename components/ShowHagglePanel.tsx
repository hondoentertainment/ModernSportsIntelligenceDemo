import React, { useMemo, useState } from 'react';
import type { CardInventory, Sport, TargetWatchlist } from '../types';
import { compsSnapshot, markOf } from '../lib/collector/deskNext';
import { cardRanges, sellScoreCopy, tableScore } from '../lib/collector/ladderScore';
import { COUNTER_OFFER_NOTE, counterOffer } from '../lib/collector/counterOffer';
import { DEALER_HISTORY_NOTE, dealerHistory, dealerRowCopy } from '../lib/collector/dealerHistory';
import { buyLadder, buyLadderCopy, sellLadder, sellLadderCopy } from '../lib/collector/offerLadder';
import { takenOnNote } from '../lib/collector/showExit';
import { gradeSplitCopy, rangeForSeat, rangeSeatCopy } from '../lib/collector/saleRange';
import {
  boughtLotShares,
  buildLotDrafts,
  expandLotNotes,
  isLot,
  lotCopy,
  lotDraftIds,
  lotLineLabel,
  LOT_LIMIT,
  type LotLine,
} from '../lib/collector/tableLot';
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
  haggleSnapshot,
  readHaggle,
  removeHaggle,
  type HaggleNote,
  type HaggleResult,
} from '../lib/shows/showHaggleLog';
import LotPastePanel from './LotPastePanel';

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

function optionalAsk(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

interface ExtraCard {
  player: string;
  detail: string;
  sport: Sport;
  cardId: string;
  ask: string;
}

const EMPTY_EXTRA: ExtraCard = { player: '', detail: '', sport: 'Baseball', cardId: '', ask: '' };

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
  const [extras, setExtras] = useState<ExtraCard[]>([]);
  const [cardAsk, setCardAsk] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const askUsd = parsedAsk(ask);
  const picked = cards.find(card => card.id === cardId);
  const rooms = roomAsks(expandLotNotes(notes));
  const lotMode = extras.length > 0;
  const draftLines: LotLine[] | undefined = lotMode
    ? [
      { player, detail, sport, cardId: cardId || undefined, askUsd: optionalAsk(cardAsk) },
      ...extras.map((row) => ({
        player: row.player,
        detail: row.detail,
        sport: row.sport,
        cardId: row.cardId || undefined,
        askUsd: optionalAsk(row.ask),
      })),
    ]
    : undefined;
  const liveReference = picked
    ? { usd: marks[picked.id]?.usd ?? null, kind: marks[picked.id]?.kind ?? ('none' as const) }
    : referenceForNote(
      { id: 'draft', showId, dealer, table, askUsd: askUsd ?? 0, offerUsd: 0, result, player },
      { medianByCardId: marks, targets },
    );
  const offerUsd = Number(offer);
  const takenUsd = Number.isFinite(offerUsd) && offerUsd > 0 ? offerUsd : askUsd != null && askUsd > 0 ? askUsd : null;
  const selling = result === 'sold' && !lotMode;
  const liveAsk = !selling && !lotMode && askUsd != null && (picked || player.trim())
    ? askVersusBookCopy(askUsd, liveReference, Boolean(picked))
    : null;
  const seated = picked ? rangeForSeat(picked) : null;
  const liveRange = !lotMode && picked && seated && (selling ? takenUsd != null : askUsd != null && askUsd > 0)
    ? rangeSeatCopy(selling ? takenUsd ?? 0 : askUsd ?? 0, seated, selling ? 'Taken' : 'This ask')
    : null;
  const liveLadder = !lotMode && seated
    ? selling ? sellLadderCopy(sellLadder(seated)) : buyLadderCopy(buyLadder(seated))
    : null;
  const liveScore = !lotMode && seated
    ? selling
      ? sellScoreCopy(takenUsd, sellLadder(seated), 'Taken')
      : tableScore({ result, offerUsd, askUsd: askUsd ?? 0 }, buyLadder(seated))?.copy ?? null
    : null;
  const liveGrade = !lotMode && picked ? gradeSplitCopy(picked) : null;
  const liveLot = lotMode
    ? lotCopy({ askUsd: askUsd ?? 0, lines: draftLines })
    : null;
  const history = dealerHistory(haggleSnapshot(), cardRanges(inventory));
  const counterHeld = cards.map((card) => ({
    id: card.id,
    player: card.player,
    usd: markOf(card),
    range: rangeForSeat(card),
  }));
  const liveCounter = !selling && !lotMode && picked && seated && askUsd != null && askUsd > 0
    ? counterOffer({
      askUsd,
      player: picked.player,
      receiveId: picked.id,
      range: seated,
      held: counterHeld,
    })
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
      lines: draftLines,
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
      setExtras([]);
      setCardAsk('');
    }
  };

  const lineForCard = (
    card: CardInventory | undefined,
    askValue: number | undefined,
    noteResult: HaggleResult = result,
    paidUsd?: number | null,
  ): { range: string | null; ladder: string | null; score: string | null; grade: string | null } => {
    if (!card || askValue == null || !(askValue > 0)) {
      return { range: null, ladder: null, score: null, grade: card ? gradeSplitCopy(card) : null };
    }
    const range = rangeForSeat(card);
    const ladder = buyLadder(range);
    const paid = noteResult === 'bought' ? paidUsd : null;
    const scoreUsd = paid != null && paid > 0 ? paid : askValue;
    return {
      range: rangeSeatCopy(askValue, range, 'This ask'),
      ladder: buyLadderCopy(ladder),
      score: tableScore({
        result: noteResult,
        offerUsd: noteResult === 'bought' ? scoreUsd : 0,
        askUsd: noteResult === 'bought' ? scoreUsd : askValue,
      }, ladder)?.copy ?? null,
      grade: gradeSplitCopy(card),
    };
  };

  const fileNote = async (row: HaggleNote) => {
    if (!onFileBuy) return;
    const drafts = isLot(row)
      ? buildLotDrafts({ note: row, showName, purchaseDate })
      : [buildFloorBuyDraft({ note: row, showName, purchaseDate })].filter((draft): draft is NonNullable<typeof draft> => draft != null);
    if (!drafts || drafts.length === 0) {
      setFileError(isLot(row)
        ? 'Name a player and an ask on each card before filing this lot.'
        : 'Name the player and a paid price before filing.');
      return;
    }
    const pending = drafts.filter((draft) => !inventory.some((card) => card.id === draft.id));
    if (pending.length === 0) {
      setFileError(isLot(row) ? 'This lot is already in the collection.' : 'That buy is already in the collection.');
      return;
    }
    setPendingId(row.id);
    setFileError(null);
    try {
      for (const draft of pending) await onFileBuy(draft);
    } catch {
      setFileError('Could not file that buy. The collection was not changed.');
    } finally {
      setPendingId(null);
    }
  };

  const versusFor = (row: HaggleNote): string | null => {
    if (row.result === 'sold') return null;
    if (!row.cardId && !row.player) return null;
    const reference = referenceForNote(row, { medianByCardId: marks, targets });
    return askVersusBookCopy(row.askUsd, reference, Boolean(row.cardId));
  };

  const cardFor = (id: string | undefined): CardInventory | undefined => {
    if (!id) return undefined;
    return inventory.find((item) => item.id === id);
  };

  const rangeFor = (row: HaggleNote): string | null => {
    if (!row.cardId || isLot(row)) return null;
    const card = cardFor(row.cardId);
    if (!card) return null;
    if (row.result === 'sold') {
      const taken = takenOnNote(row);
      return taken == null ? null : rangeSeatCopy(taken, rangeForSeat(card), 'Taken');
    }
    if (!(row.askUsd > 0)) return null;
    return rangeSeatCopy(row.askUsd, rangeForSeat(card), 'This ask');
  };

  const ladderFor = (row: HaggleNote): string | null => {
    if (isLot(row)) return null;
    const card = cardFor(row.cardId);
    if (!card) return null;
    const range = rangeForSeat(card);
    if (row.result === 'sold') return sellLadderCopy(sellLadder(range));
    return buyLadderCopy(buyLadder(range));
  };

  const scoreFor = (row: HaggleNote): string | null => {
    if (isLot(row)) return null;
    const card = cardFor(row.cardId);
    if (!card) return null;
    const range = rangeForSeat(card);
    if (row.result === 'sold') return sellScoreCopy(takenOnNote(row), sellLadder(range), 'Taken');
    return tableScore(row, buyLadder(range))?.copy ?? null;
  };

  const gradeFor = (row: HaggleNote): string | null => {
    if (isLot(row)) return null;
    const card = cardFor(row.cardId);
    return card ? gradeSplitCopy(card) : null;
  };

  const counterFor = (row: HaggleNote): string | null => {
    if (row.result === 'sold' || isLot(row) || !(row.askUsd > 0)) return null;
    const card = cardFor(row.cardId);
    if (!card) return null;
    return counterOffer({
      askUsd: row.askUsd,
      player: card.player,
      receiveId: card.id,
      range: rangeForSeat(card),
      held: counterHeld,
    })?.copy ?? null;
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
          {lotMode ? 'Lot ask' : 'Ask'}
          <input inputMode="decimal" value={ask} onChange={event => setAsk(event.target.value)} aria-label={`Ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {selling ? 'Price taken' : lotMode ? 'Lot offer' : 'Offer'}
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
          {selling ? 'Card you hold' : 'Card for the ask'}
          <select value={cardId} onChange={event => {
            const nextId = event.target.value;
            setCardId(nextId);
            const named = cards.find(card => card.id === nextId);
            if (named && !player.trim()) setPlayer(named.player);
          }} aria-label={`Card for the ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
            <option value="">No card</option>
            {cards.map(card => <option key={card.id} value={card.id}>{card.player}</option>)}
          </select>
        </label>
      )}
      {lotMode ? (
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Card ask
          <input inputMode="decimal" value={cardAsk} onChange={event => setCardAsk(event.target.value)} aria-label={`Card ask for lot card 1 at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
      ) : null}
      {extras.map((row, index) => (
        <div key={`lot-${index}`} className="grid gap-2 rounded-lg border border-slate-800 p-3 sm:grid-cols-2" aria-label={`Lot card ${index + 2}`}>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Player
            <input value={row.player} onChange={event => setExtras(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, player: event.target.value } : item))} aria-label={`Player for lot card ${index + 2} at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
          </label>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Card ask
            <input inputMode="decimal" value={row.ask} onChange={event => setExtras(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, ask: event.target.value } : item))} aria-label={`Card ask for lot card ${index + 2} at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
          </label>
          {cards.length > 0 ? (
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 sm:col-span-2">
              Card in the book
              <select value={row.cardId} onChange={event => {
                const nextId = event.target.value;
                const named = cards.find(card => card.id === nextId);
                setExtras(current => current.map((item, itemIndex) => itemIndex === index ? {
                  ...item,
                  cardId: nextId,
                  player: item.player.trim() || named?.player || '',
                } : item));
              }} aria-label={`Card for lot card ${index + 2} at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
                <option value="">No card</option>
                {cards.map(card => <option key={card.id} value={card.id}>{card.player}</option>)}
              </select>
            </label>
          ) : null}
          <button type="button" onClick={() => setExtras(current => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100">
            Remove lot card {index + 2}
          </button>
        </div>
      ))}
      {extras.length + 1 < LOT_LIMIT ? (
        <button type="button" onClick={() => setExtras(current => [...current, EMPTY_EXTRA])} className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100">
          Add a card to this lot
        </button>
      ) : null}
      {liveAsk ? <p className="text-xs text-slate-200" aria-label="Ask versus median">{liveAsk}</p> : null}
      {liveRange ? <p className="text-xs text-slate-200" aria-label="Ask versus sale range">{liveRange}</p> : null}
      {liveGrade ? <p className="text-xs text-slate-200" aria-label="Grade split">{liveGrade}</p> : null}
      {liveLadder ? <p className="text-xs text-slate-200" aria-label={selling ? 'Sell ladder' : 'Offer ladder'}>{liveLadder}</p> : null}
      {liveScore ? <p className="text-xs text-slate-200" aria-label="Ladder score">{liveScore}</p> : null}
      {liveLot ? <p className="text-xs text-slate-200" aria-label="Table lot">{liveLot}</p> : null}
      {liveCounter ? (
        <>
          <p className="text-[11px] leading-relaxed text-slate-500">{COUNTER_OFFER_NOTE}</p>
          <p className="text-xs text-slate-200" aria-label="Counter offer">{liveCounter.copy}</p>
        </>
      ) : null}
      {lotMode && draftLines ? (
        <ul className="space-y-1" aria-label="Lot cards">
          {draftLines.map((line, index) => {
            const card = cardFor(line.cardId);
            const preview = lineForCard(card, line.askUsd);
            return (
              <li key={`draft-${index}`} className="text-xs text-slate-300">
                {lotLineLabel(line)}
                {preview.range ? ` ${preview.range}` : ''}
                {preview.grade ? ` ${preview.grade}` : ''}
              </li>
            );
          })}
        </ul>
      ) : null}
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Result
        <select value={result} onChange={event => setResult(event.target.value as HaggleResult)} aria-label={`Result at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
          <option value="open">Open</option>
          <option value="bought">Bought</option>
          <option value="passed">Passed</option>
          <option value="sold">Sold</option>
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
      <LotPastePanel inventory={inventory} targets={targets} />
      <section aria-label="Dealer history">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">Dealer history</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{DEALER_HISTORY_NOTE}</p>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No dealer notes on this browser yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {history.slice(0, 8).map((row) => (
              <li key={row.key} className="text-xs text-slate-200">{dealerRowCopy(row)}</li>
            ))}
          </ul>
        )}
        {history.length > 8 ? (
          <p className="mt-1 text-xs text-slate-500">{history.length - 8} more dealers stay off this list.</p>
        ) : null}
      </section>
      {fileError && <p className="text-[11px] text-rose-300" role="alert">{fileError}</p>}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">No table notes for this show yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map(row => {
            const versus = isLot(row) ? null : versusFor(row);
            const rangeCopy = rangeFor(row);
            const ladderCopy = ladderFor(row);
            const scoreCopy = scoreFor(row);
            const gradeCopy = gradeFor(row);
            const counterCopy = counterFor(row);
            const lotText = lotCopy(row);
            const lotIds = isLot(row) ? lotDraftIds(row) : [];
            const filed = isLot(row)
              ? null
              : inventory.find(card => card.id === floorBuyId(row.id));
            const lotFiled = isLot(row) && lotIds.length > 0 && lotIds.every(id => inventory.some(card => card.id === id));
            const draft = isLot(row) ? null : buildFloorBuyDraft({ note: row, showName, purchaseDate });
            const revisit = !isLot(row) && isRevisit(row, referenceForNote(row, { medianByCardId: marks, targets }));
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
                {lotText ? <p className="text-xs text-slate-200" aria-label={`Table lot for ${row.dealer} table ${row.table}`}>{lotText}</p> : null}
                {isLot(row) ? (
                  <ul className="mt-1 space-y-1" aria-label={`Lot cards for ${row.dealer} table ${row.table}`}>
                    {(row.lines ?? []).map((line, index) => {
                      const card = cardFor(line.cardId);
                      const shares = boughtLotShares(row);
                      const preview = lineForCard(card, line.askUsd, row.result, shares?.[index]);
                      return (
                        <li key={`${row.id}:${index}`} className="text-xs text-slate-300">
                          {lotLineLabel(line)}
                          {preview.range ? ` ${preview.range}` : ''}
                          {preview.score ? ` ${preview.score}` : ''}
                          {preview.grade ? ` ${preview.grade}` : ''}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {versus ? <p className="text-xs text-slate-300">{versus}</p> : null}
                {rangeCopy ? <p className="text-xs text-slate-300">{rangeCopy}</p> : null}
                {gradeCopy ? <p className="text-xs text-slate-300" aria-label={`Grade split for ${row.dealer} table ${row.table}`}>{gradeCopy}</p> : null}
                {ladderCopy ? (
                  <p
                    className="text-xs text-slate-300"
                    aria-label={`${row.result === 'sold' ? 'Sell ladder' : 'Offer ladder'} for ${row.player || 'this card'}`}
                  >
                    {ladderCopy}
                  </p>
                ) : null}
                {scoreCopy ? <p className="text-xs text-slate-300" aria-label={`Ladder score for ${row.dealer} table ${row.table}`}>{scoreCopy}</p> : null}
                {counterCopy ? <p className="text-xs text-slate-300" aria-label={`Counter offer for ${row.dealer} table ${row.table}`}>{counterCopy}</p> : null}
                {lotFiled ? (
                  <p className="mt-2 text-[11px] text-emerald-300">This lot is in the collection.</p>
                ) : null}
                {filed ? (
                  <p className="mt-2 text-[11px] text-emerald-300">
                    {row.player} in the collection · cost basis ${filed.purchasePrice.toFixed(2)}
                  </p>
                ) : null}
                {onFileBuy && isLot(row) && row.result === 'bought' && !lotFiled ? (
                  <button
                    type="button"
                    disabled={pendingId === row.id}
                    onClick={() => { void fileNote(row); }}
                    className="mt-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
                  >
                    {pendingId === row.id ? 'Filing…' : 'Add this lot to the collection'}
                  </button>
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
