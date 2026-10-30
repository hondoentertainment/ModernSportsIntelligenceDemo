import React, { Suspense, lazy, useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory, TargetWatchlist } from '../types';
import type { ResolvedLocalCardShow } from '../lib/shows/localCardShowCatalog';
import {
  SHOW_SHOPPING_LIST_DISCLOSURE,
  buildShowShoppingList,
  shopLineLabel,
  type ShopLine,
} from '../lib/shows/showShoppingList';
import { readPlaces, type Place } from '../lib/collector/deskNext';
import { pullCopy } from '../lib/collector/floorPack';
import { cashFit, cashFitCopy, cashLineCopy, type CashFitCall, type CashSource } from '../lib/collector/showClose';
import { buildPullSheet, pullSheetCopy } from '../lib/collector/pullSheet';
import { LADDER_SCORE_NOTE, buyScoreCopy, sellScoreCopy } from '../lib/collector/ladderScore';
import {
  OFFER_LADDER_CASH_NOTE,
  OFFER_LADDER_NOTE,
  SELL_LADDER_NOTE,
  buyLadder,
  ladderCashRoom,
  sellLadder,
  shopLadderCopy,
} from '../lib/collector/offerLadder';
import { GRADE_RANGE_NOTE, SALE_RANGE_NOTE, gradeSplitCopy, rangeForSeat, rangeSeatCopy, type SaleRange } from '../lib/collector/saleRange';
import { store } from '../lib/dal/syncStore';
import { SHOPPING_INGEST_DISCLOSURE } from '../lib/shows/showShoppingIngest';
import { readCashBudget } from '../lib/shows/showTripLoop';
import { ShoppingBuyFiles } from './ShoppingBuyFile';
import ShowDayRecap from './ShowDayRecap';
import ShowExitPanel from './ShowExitPanel';
import ShowHaulPanel from './ShowHaulPanel';

const ShowDayPanel = lazy(() => import('./DeskNext').then((mod) => ({ default: mod.ShowDayPanel })));

interface Props {
  show: ResolvedLocalCardShow;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  liveTape: boolean;
  disclose?: boolean;
  cashUsd?: number | null;
  onFileBuy?: (card: CardInventory) => Promise<void> | void;
  onRecordSale?: (cardId: string, patch: Partial<CardInventory>) => Promise<void> | void;
}

function usd(value: number | null): string {
  return value == null ? 'no price' : `$${Math.round(value).toLocaleString('en-US')}`;
}

function shopInput(line: ShopLine, inventory: CardInventory[], targets: TargetWatchlist[]) {
  if (line.kind === 'set-hole') return null;
  if (line.cardId) {
    const card = inventory.find((row) => row.id === line.cardId);
    return card ?? null;
  }
  if (!line.targetId) return null;
  const target = targets.find((row) => row.id === line.targetId);
  if (!target) return null;
  return {
    id: target.id,
    currentValue: target.currentMarketPrice,
    salesData: target.salesData,
    gradeText: target.cardDescription,
  };
}

function shopRange(line: ShopLine, inventory: CardInventory[], targets: TargetWatchlist[]): SaleRange | null {
  const input = shopInput(line, inventory, targets);
  return input ? rangeForSeat(input) : null;
}

function shopGrade(line: ShopLine, inventory: CardInventory[], targets: TargetWatchlist[]): string | null {
  const input = shopInput(line, inventory, targets);
  return input ? gradeSplitCopy(input) : null;
}

function buyRangeCopy(line: ShopLine, inventory: CardInventory[], targets: TargetWatchlist[]): string | null {
  if (line.side !== 'buy' || line.targetBuyUsd == null) return null;
  const range = shopRange(line, inventory, targets);
  if (!range) return null;
  return rangeSeatCopy(line.targetBuyUsd, range, 'This buy');
}

function shopScore(
  line: ShopLine,
  inventory: CardInventory[],
  targets: TargetWatchlist[],
  cashUsd: number | null,
): string | null {
  if (line.kind === 'set-hole' || line.targetBuyUsd == null) return null;
  const range = shopRange(line, inventory, targets);
  if (!range) return null;
  if (line.side === 'sell') return sellScoreCopy(line.targetBuyUsd, sellLadder(range), 'This offer');
  return buyScoreCopy(line.targetBuyUsd, buyLadder(range, { targetUsd: line.collectorCeilingUsd, cashUsd }), 'This buy');
}

function Lines({
  lines,
  places,
  calls,
  inventory,
  targets,
  cashRooms,
}: {
  lines: ShopLine[];
  places: Record<string, Place>;
  calls?: Record<string, CashFitCall>;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  cashRooms?: Record<string, number | null>;
}) {
  return (
    <ul className="space-y-2">
      {lines.map((line) => {
        const rangeCopy = buyRangeCopy(line, inventory, targets);
        const gradeCopy = shopGrade(line, inventory, targets);
        const ladderCopy = shopLadderCopy({
          side: line.side,
          kind: line.kind,
          range: shopRange(line, inventory, targets),
          targetUsd: line.collectorCeilingUsd,
          cashUsd: line.side === 'buy' ? cashRooms?.[line.id] ?? null : null,
        });
        const scoreCopy = shopScore(
          line,
          inventory,
          targets,
          line.side === 'buy' ? cashRooms?.[line.id] ?? null : null,
        );
        const ladderLabel = `${line.side === 'sell' ? 'Sell ladder' : 'Offer ladder'} for ${line.player}`;
        return (
          <li key={line.id}>
            <p className="text-sm text-white">{line.player} <span className="text-xs text-slate-400">{shopLineLabel(line.kind)}</span></p>
            <p className="text-xs text-slate-400">{line.detail}</p>
            <p className="text-xs text-slate-300">
              {line.side === 'buy' ? 'Target buy' : 'Offer near'} {usd(line.targetBuyUsd)}
              {line.marketMarkUsd != null ? ` · mark ${usd(line.marketMarkUsd)}` : ''}
              {line.collectorCeilingUsd != null ? ` · ceiling ${usd(line.collectorCeilingUsd)}` : ''}
            </p>
            {rangeCopy ? <p className="text-xs text-slate-300" aria-label={`Sale range for ${line.player}`}>{rangeCopy}</p> : null}
            {gradeCopy ? <p className="text-xs text-slate-300" aria-label={`Grade split for ${line.player}`}>{gradeCopy}</p> : null}
            {ladderCopy ? <p className="text-xs text-slate-300" aria-label={ladderLabel}>{ladderCopy}</p> : null}
            {scoreCopy ? <p className="text-xs text-slate-300" aria-label={`Ladder score for ${line.player}`}>{scoreCopy}</p> : null}
            {calls ? <p className="text-xs text-slate-300">{cashLineCopy(calls[line.id] ?? 'no price')}</p> : null}
            {line.side === 'sell' && line.cardId ? <p className="text-xs text-slate-300">{pullCopy(places[line.cardId])}</p> : null}
            <p className="text-xs text-slate-500">{line.priceSource}. {line.why}</p>
            {line.cardId && <Link className="inline-flex min-h-[44px] items-center text-xs text-brand-lime" to={`/compare?card1=${encodeURIComponent(line.cardId)}`}>Comps</Link>}
            <Link className="ml-2 inline-flex min-h-[44px] items-center text-xs text-brand-lime" to="/collection">Collection</Link>
          </li>
        );
      })}
    </ul>
  );
}

const ShowShoppingList: React.FC<Props> = ({
  show,
  inventory,
  targets,
  liveTape,
  disclose = false,
  cashUsd = null,
  onFileBuy,
  onRecordSale,
}) => {
  const list = useMemo(
    () => buildShowShoppingList({ show, inventory, targets, liveTape }),
    [show, inventory, targets, liveTape],
  );
  const places = readPlaces();
  const savedCash = useSyncExternalStore(
    listener => store.onWrite(listener),
    () => readCashBudget(show.id),
    () => readCashBudget(show.id),
  );
  const cash = savedCash ?? cashUsd;
  const source: CashSource = savedCash != null ? 'saved' : cash != null ? 'trip need' : 'unset';
  const fit = useMemo(
    () => cashFit(list.buys.map(line => ({ id: line.id, usd: line.targetBuyUsd })), cash),
    [list.buys, cash],
  );
  const cashRooms = useMemo(
    () => ladderCashRoom(list.buys.map(line => ({ id: line.id, usd: line.targetBuyUsd })), cash),
    [list.buys, cash],
  );
  const pullSheet = buildPullSheet(
    list.sells.map(line => ({
      id: line.id,
      cardId: line.cardId,
      player: line.player,
      detail: line.detail,
      markUsd: line.marketMarkUsd,
    })),
    places,
  );
  return (
    <>
      <section className="mt-3 text-slate-300" aria-label={`Shopping list for ${show.name}`}>
        {disclose && <p className="text-xs text-slate-500">{SHOW_SHOPPING_LIST_DISCLOSURE}</p>}
        <h3 className="text-xs text-slate-200">Shopping list · {list.buys.length + list.sells.length}</h3>
        {list.buys.length > 0 && (
          <p className="text-xs text-slate-300" aria-label="Cash fit">{cashFitCopy(fit, cash, source)}</p>
        )}
        {list.emptyReason ? <p className="text-sm text-slate-400">{list.emptyReason}</p> : (
          <>
            <h4 className="text-xs text-emerald-200">Buy</h4>
            {list.buys.length === 0 ? <p className="text-xs text-slate-500">No buys.</p> : (
              <>
                <p className="text-xs text-slate-500">{SALE_RANGE_NOTE} {GRADE_RANGE_NOTE} {OFFER_LADDER_NOTE} {OFFER_LADDER_CASH_NOTE} {LADDER_SCORE_NOTE}</p>
                <Lines lines={list.buys} places={places} calls={fit.byId} inventory={inventory} targets={targets} cashRooms={cashRooms} />
              </>
            )}
            {onFileBuy && list.buys.length > 0 && (
              <>
                <p className="mt-2 text-[11px] text-slate-500">{SHOPPING_INGEST_DISCLOSURE}</p>
                <ShoppingBuyFiles
                  lines={list.buys}
                  inventory={inventory}
                  showName={show.name}
                  purchaseDate={show.endDate}
                  idPrefix={`list-${show.id}`}
                  onFileBuy={onFileBuy}
                />
              </>
            )}
            <h4 className="text-xs text-sky-200">Sell or trade</h4>
            {list.sells.length === 0 ? <p className="text-xs text-slate-500">No extras.</p> : (
              <>
                <p className="text-xs text-slate-500">{SELL_LADDER_NOTE} {LADDER_SCORE_NOTE}</p>
                <Lines lines={list.sells} places={places} inventory={inventory} targets={targets} />
              </>
            )}
            {pullSheet.count > 0 && (
              <section className="mt-3" aria-label={`Pull sheet for ${show.name}`}>
                <h4 className="text-xs text-slate-200">Pull sheet</h4>
                <p className="text-xs text-slate-400">{pullSheetCopy(pullSheet)}</p>
                <ul className="mt-2 space-y-2">
                  {pullSheet.groups.map(group => (
                    <li key={group.place}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</p>
                      <ul>
                        {group.items.map(item => (
                          <li key={item.id} className="text-xs text-slate-200">
                            {item.player}
                            {item.detail ? <span className="text-slate-400"> · {item.detail}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </section>
      <Suspense fallback={null}>
        <ShowDayPanel
          showId={show.id}
          cashUsd={cashUsd}
          lines={[...list.buys, ...list.sells].map((line) => ({
            id: line.id,
            side: line.side,
            player: line.player,
            usd: line.targetBuyUsd,
          }))}
        />
      </Suspense>
      <ShowDayRecap
        showId={show.id}
        inventory={inventory}
        lines={[...list.buys, ...list.sells].map((line) => ({
          id: line.id,
          side: line.side,
          player: line.player,
          usd: line.targetBuyUsd,
        }))}
      />
      <ShowHaulPanel showId={show.id} inventory={inventory} />
      <ShowExitPanel
        showId={show.id}
        inventory={inventory}
        purchaseDate={show.endDate}
        onRecordSale={onRecordSale}
      />
    </>
  );
};

export default ShowShoppingList;
