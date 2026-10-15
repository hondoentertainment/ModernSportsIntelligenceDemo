import React, { Suspense, lazy, useMemo, useState } from 'react';
import type { CardInventory, Sport, TargetWatchlist } from '../types';
import type { ResolvedLocalCardShow } from '../lib/shows/localCardShowCatalog';
import type { ShowBuyOpportunity } from '../lib/shows/showBuyingDesk';
import {
  SHOW_TRIP_LOOP_DISCLOSURE,
  TRAVEL_ESTIMATE_NOTE,
  allowedCalls,
  assessBudget,
  buildCollectionDraft,
  buildSalePatch,
  buildShowRecap,
  buildTripBudget,
  clearFloorDecision,
  collectionDraftId,
  formatTripUsd,
  normalizeFloorDecision,
  parseCashInput,
  readCashBudget,
  readFloorDecisions,
  saveCashBudget,
  saveFloorDecision,
  suggestedTablePrice,
  toTripLine,
  type FloorCall,
  type FloorDecision,
  type TripLineItem,
  type VersusMark,
} from '../lib/shows/showTripLoop';

const ShoppingRecapIngest = lazy(() => import('./showDeskPanels').then((mod) => ({ default: mod.ShoppingRecapIngest })));
const ShowHagglePanel = lazy(() => import('./ShowHagglePanel'));

interface Props {
  showId: string;
  showName: string;
  admissionUsd: number;
  distanceMiles: number | null;
  purchaseDate: string;
  opportunities: ShowBuyOpportunity[];
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  show?: ResolvedLocalCardShow | null;
  liveTape?: boolean;
  fallbackSport?: Sport | null;
  onFileBuy: (card: CardInventory) => Promise<void> | void;
  onRecordSale: (cardId: string, patch: Partial<CardInventory>) => Promise<void> | void;
}

type TabId = 'budget' | 'floor' | 'recap' | 'notes';

function versusCopy(value: VersusMark): string {
  if (value === 'under') return 'under the local mark';
  if (value === 'over') return 'over the local mark';
  if (value === 'at') return 'at the local mark';
  return 'local mark unknown';
}

function callLabel(call: FloorCall): string {
  if (call === 'buy') return 'Buy';
  if (call === 'sell') return 'Sell';
  return 'Pass';
}

const ShowTripLoopPanel: React.FC<Props> = ({
  showId,
  showName,
  admissionUsd,
  distanceMiles,
  purchaseDate,
  opportunities,
  inventory,
  targets = [],
  show = null,
  liveTape = false,
  fallbackSport = null,
  onFileBuy,
  onRecordSale,
}) => {
  const [tab, setTab] = useState<TabId>('budget');
  const [, setTick] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [cashError, setCashError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);

  const items = useMemo(
    () => opportunities.map((row) => toTripLine(row, inventory, targets, fallbackSport)),
    [opportunities, inventory, targets, fallbackSport],
  );
  const budget = useMemo(
    () => buildTripBudget({ showId, admissionUsd, distanceMiles, items }),
    [showId, admissionUsd, distanceMiles, items],
  );
  const savedCash = readCashBudget(showId);
  const decisions = readFloorDecisions(showId);
  const cashText = drafts[showId] ?? (savedCash ?? budget.suggestedCashUsd).toFixed(2);
  const parsedCash = parseCashInput(cashText);
  const fit = assessBudget(budget.netNeedUsd, parsedCash ?? Number.NaN);
  const recap = buildShowRecap({ budget, cashUsd: parsedCash ?? Number.NaN, decisions });
  const decisionFor = (id: string) => decisions.find((row) => row.opportunityId === id);

  const priceText = (item: TripLineItem): string => {
    if (prices[item.id] != null) return prices[item.id];
    const existing = decisionFor(item.id);
    if (existing?.tablePriceUsd != null) return existing.tablePriceUsd.toFixed(2);
    const suggested = suggestedTablePrice(item, item.intent === 'sell' ? 'sell' : 'buy');
    return suggested == null ? '' : suggested.toFixed(2);
  };

  const commitCash = () => {
    if (parsedCash == null) {
      setCashError('Enter a dollar amount, 0 or more.');
      return;
    }
    setCashError(null);
    saveCashBudget(showId, parsedCash);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[showId];
      return next;
    });
    setTick((value) => value + 1);
  };

  const logCall = (item: TripLineItem, call: FloorCall) => {
    const tablePriceUsd = call === 'pass' ? null : parseCashInput(priceText(item));
    const decision = normalizeFloorDecision({ item, showId, call, tablePriceUsd });
    if (!decision) {
      setRowErrors((prev) => ({ ...prev, [item.id]: 'Enter a table price of 0 or more.' }));
      return;
    }
    saveFloorDecision(decision);
    setRowErrors((prev) => ({ ...prev, [item.id]: '' }));
    setTick((value) => value + 1);
  };

  const fileBuy = async (decision: FloorDecision) => {
    const draft = buildCollectionDraft({ decision, showName, purchaseDate });
    if (!draft) {
      setWriteError('That buy needs a sport on the book before it can be filed.');
      return;
    }
    setPendingId(decision.opportunityId);
    setWriteError(null);
    try {
      await onFileBuy(draft);
    } catch {
      setWriteError('Could not file that buy. The collection was not changed.');
    } finally {
      setPendingId(null);
    }
  };

  const recordSale = async (decision: FloorDecision) => {
    const card = inventory.find((row) => row.id === decision.cardId);
    const patch = buildSalePatch({
      decision,
      purchaseDate,
      existingNotes: card?.notes,
    });
    if (!patch || !decision.cardId) {
      setWriteError('Lot sales stay on the recap. Record each card from the collection.');
      return;
    }
    setPendingId(decision.opportunityId);
    setWriteError(null);
    try {
      await onRecordSale(decision.cardId, patch);
    } catch {
      setWriteError('Could not record that sale. The collection was not changed.');
    } finally {
      setPendingId(null);
    }
  };

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'budget', label: 'Trip budget' },
    { id: 'floor', label: `Floor calls${decisions.length ? ` (${decisions.length})` : ''}` },
    { id: 'recap', label: 'Recap' },
    { id: 'notes', label: 'Table notes' },
  ];

  return (
    <section className="mt-4 rounded-xl border border-amber-500/20 bg-slate-950/40 p-4" aria-label={`Show trip loop for ${showName}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Seeded show loop</p>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{SHOW_TRIP_LOOP_DISCLOSURE}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Show trip stages">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
            className={`min-h-[44px] rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
              tab === entry.id
                ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'budget' && (
        <div role="tabpanel" className="mt-4 space-y-3">
          <ul className="space-y-2">
            {budget.lines.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-slate-800 px-3 py-2">
                <div>
                  <p className="text-sm text-white">{row.label}</p>
                  <p className="text-[11px] text-slate-500">{row.note}</p>
                </div>
                <p className={`font-mono text-sm ${row.id === 'sell-credit' ? 'text-emerald-300' : 'text-slate-100'}`}>
                  {row.id === 'sell-credit' ? `-${formatTripUsd(row.amountUsd)}` : formatTripUsd(row.amountUsd)}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500">{TRAVEL_ESTIMATE_NOTE}</p>
          <p className="text-sm text-slate-200">
            Trip need <span className="font-mono text-white">{formatTripUsd(budget.netNeedUsd)}</span>
            {' · '}suggested cash <span className="font-mono text-white">{formatTripUsd(budget.suggestedCashUsd)}</span>
            {' '}(next $10).
          </p>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor={`trip-cash-${showId}`}>
            Cash you are bringing
            <input
              id={`trip-cash-${showId}`}
              inputMode="decimal"
              value={cashText}
              onChange={(event) => {
                setCashError(null);
                setDrafts((prev) => ({ ...prev, [showId]: event.target.value }));
              }}
              onBlur={commitCash}
              aria-invalid={cashError ? true : undefined}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-medium normal-case tracking-normal text-white md:text-sm"
            />
          </label>
          {cashError && <p className="text-[11px] text-rose-300" role="alert">{cashError}</p>}
          <p className="text-[11px] text-slate-300" role="status">
            {parsedCash == null
              ? 'Enter a cash amount to see if this trip fits.'
              : fit.fits
                ? `Fits. ${formatTripUsd(fit.surplusUsd)} left after the planned reserve.`
                : `Short ${formatTripUsd(fit.shortfallUsd)} against the planned reserve.`}
          </p>
          <button
            type="button"
            onClick={commitCash}
            className="min-h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100"
          >
            Save cash budget
          </button>
        </div>
      )}

      {tab === 'floor' && (
        <div role="tabpanel" className="mt-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">
              No buy or sell calls on this show yet. The trip budget is still admission plus the travel stub.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const logged = decisionFor(item.id);
                const calls = allowedCalls(item);
                return (
                  <li key={item.id} className="rounded-lg border border-slate-800 px-3 py-3">
                    <p className="text-sm text-white">
                      {item.player}
                      <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{item.intent}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">{item.detail}</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {item.markUsd == null ? 'Local mark unknown' : `Local mark ${formatTripUsd(item.markUsd)}`}
                      {item.askUsd != null ? ` · ask ${formatTripUsd(item.askUsd)}` : ''}
                    </p>
                    <label className="mt-2 block text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor={`table-${item.id}`}>
                      Table price
                      <input
                        id={`table-${item.id}`}
                        inputMode="decimal"
                        value={priceText(item)}
                        onChange={(event) => setPrices((prev) => ({ ...prev, [item.id]: event.target.value }))}
                        className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-medium normal-case tracking-normal text-white md:text-sm"
                      />
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {calls.map((call) => (
                        <button
                          key={call}
                          type="button"
                          aria-pressed={logged?.call === call}
                          onClick={() => logCall(item, call)}
                          className={`min-h-[44px] rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                            logged?.call === call
                              ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                              : 'border-slate-700 text-slate-200'
                          }`}
                        >
                          {callLabel(call)}
                        </button>
                      ))}
                      {logged && (
                        <button
                          type="button"
                          onClick={() => {
                            clearFloorDecision(showId, item.id);
                            setTick((value) => value + 1);
                          }}
                          className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {logged && (
                      <p className="mt-2 text-[11px] text-slate-300">
                        Logged {logged.call}
                        {logged.tablePriceUsd != null ? ` at ${formatTripUsd(logged.tablePriceUsd)}` : ''}
                        {logged.call !== 'pass' ? ` · ${versusCopy(logged.versusMark)}` : ''}.
                      </p>
                    )}
                    {rowErrors[item.id] && <p className="mt-1 text-[11px] text-rose-300" role="alert">{rowErrors[item.id]}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === 'recap' && (
        <div role="tabpanel" className="mt-4 space-y-3">
          <dl className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-lg border border-slate-800 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-slate-500">Buys</dt>
              <dd className="font-mono text-white">{recap.buyCount} · {formatTripUsd(recap.buySpendUsd)}</dd>
            </div>
            <div className="rounded-lg border border-slate-800 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-slate-500">Sells</dt>
              <dd className="font-mono text-white">{recap.sellCount} · {formatTripUsd(recap.sellProceedsUsd)}</dd>
            </div>
            <div className="rounded-lg border border-slate-800 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-slate-500">Paper ROI</dt>
              <dd className="font-mono text-white">
                {recap.paperRoiPct == null ? '—' : `${recap.paperRoiPct.toFixed(1)}%`}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-800 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-widest text-slate-500">Cash left</dt>
              <dd className="font-mono text-white">{formatTripUsd(recap.budgetRemainingUsd)}</dd>
            </div>
          </dl>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Paper ROI is local-mark minus table price on buys that had a mark
            {recap.buysMissingMark > 0 ? ` (${recap.buysMissingMark} buy${recap.buysMissingMark === 1 ? '' : 's'} had no mark)` : ''}.
            Realized on sells with a cost basis: {formatTripUsd(recap.realizedGainUsd)}
            {recap.sellsMissingBasis > 0 ? ` · ${recap.sellsMissingBasis} sell${recap.sellsMissingBasis === 1 ? '' : 's'} had no basis` : ''}.
            Overhead {formatTripUsd(recap.overheadUsd)} is admission plus the travel stub. Not a tax return and not a live fill.
          </p>
          {recap.buyCount + recap.sellCount + recap.passCount === 0 && (
            <p className="text-sm text-slate-400">No floor calls logged. Paper ROI stays blank until you record a buy or a sell.</p>
          )}
          <ul className="space-y-2">
            {decisions.filter((row) => row.call !== 'pass').map((decision) => {
              const draftId = collectionDraftId(decision.showId, decision.opportunityId);
              const held = inventory.find((row) => row.id === draftId);
              const soldCard = decision.cardId ? inventory.find((row) => row.id === decision.cardId) : undefined;
              const pending = pendingId === decision.opportunityId;
              return (
                <li key={decision.opportunityId} className="rounded-lg border border-slate-800 px-3 py-3">
                  <p className="text-sm text-white">
                    {decision.call === 'buy' ? 'Bought' : 'Sold'} {decision.player}
                    {decision.tablePriceUsd != null ? ` · ${formatTripUsd(decision.tablePriceUsd)}` : ''}
                  </p>
                  {decision.call === 'buy' && (
                    held ? (
                      <p className="mt-2 text-[11px] text-emerald-300">In the collection</p>
                    ) : (
                      <button
                        type="button"
                        disabled={pending || !decision.sport}
                        onClick={() => { void fileBuy(decision); }}
                        className="mt-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
                      >
                        {pending ? 'Filing…' : decision.sport ? 'File into collection' : 'Sport unknown'}
                      </button>
                    )
                  )}
                  {decision.call === 'sell' && !decision.cardId && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      Lot sales stay on the recap. Record each card from the collection.
                    </p>
                  )}
                  {decision.call === 'sell' && decision.cardId && (
                    soldCard?.status === 'sold' ? (
                      <p className="mt-2 text-[11px] text-emerald-300">Sale already in the book</p>
                    ) : soldCard ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => { void recordSale(decision); }}
                        className="mt-2 min-h-[44px] rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-100 disabled:opacity-50"
                      >
                        {pending ? 'Recording…' : 'Record sale in collection'}
                      </button>
                    ) : (
                      <p className="mt-2 text-[11px] text-slate-400">That card is no longer in the book.</p>
                    )
                  )}
                </li>
              );
            })}
          </ul>
          {writeError && <p className="text-[11px] text-rose-300">{writeError}</p>}
          {show && (
            <Suspense fallback={null}>
              <ShoppingRecapIngest
                show={show}
                inventory={inventory}
                targets={targets}
                liveTape={liveTape}
                onFileBuy={onFileBuy}
              />
            </Suspense>
          )}
        </div>
      )}
      {tab === 'notes' && (
        <Suspense fallback={null}>
          <ShowHagglePanel showId={showId} showName={showName} inventory={inventory} />
        </Suspense>
      )}
    </section>
  );
};

export default ShowTripLoopPanel;
