import React, { Suspense, lazy, useMemo } from 'react';
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
import { SHOPPING_INGEST_DISCLOSURE } from '../lib/shows/showShoppingIngest';
import { ShoppingBuyFiles } from './ShoppingBuyFile';

const ShowDayPanel = lazy(() => import('./DeskNext').then((mod) => ({ default: mod.ShowDayPanel })));

interface Props {
  show: ResolvedLocalCardShow;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  liveTape: boolean;
  disclose?: boolean;
  cashUsd?: number | null;
  onFileBuy?: (card: CardInventory) => Promise<void> | void;
}

function usd(value: number | null): string {
  return value == null ? 'no price' : `$${Math.round(value).toLocaleString('en-US')}`;
}

function Lines({ lines, places }: { lines: ShopLine[]; places: Record<string, Place> }) {
  return (
    <ul className="space-y-2">
      {lines.map((line) => (
        <li key={line.id}>
          <p className="text-sm text-white">{line.player} <span className="text-xs text-slate-400">{shopLineLabel(line.kind)}</span></p>
          <p className="text-xs text-slate-400">{line.detail}</p>
          <p className="text-xs text-slate-300">
            {line.side === 'buy' ? 'Target buy' : 'Offer near'} {usd(line.targetBuyUsd)}
            {line.marketMarkUsd != null ? ` · mark ${usd(line.marketMarkUsd)}` : ''}
            {line.collectorCeilingUsd != null ? ` · ceiling ${usd(line.collectorCeilingUsd)}` : ''}
          </p>
          {line.side === 'sell' && line.cardId ? <p className="text-xs text-slate-300">{pullCopy(places[line.cardId])}</p> : null}
          <p className="text-xs text-slate-500">{line.priceSource}. {line.why}</p>
          {line.cardId && <Link className="text-xs text-brand-lime" to={`/compare?card1=${encodeURIComponent(line.cardId)}`}>Comps</Link>}
          <Link className="ml-2 text-xs text-brand-lime" to="/collection">Collection</Link>
        </li>
      ))}
    </ul>
  );
}

const ShowShoppingList: React.FC<Props> = ({ show, inventory, targets, liveTape, disclose = false, cashUsd = null, onFileBuy }) => {
  const list = useMemo(
    () => buildShowShoppingList({ show, inventory, targets, liveTape }),
    [show, inventory, targets, liveTape],
  );
  const places = readPlaces();
  return (
    <>
      <section className="mt-3 text-slate-300" aria-label={`Shopping list for ${show.name}`}>
        {disclose && <p className="text-xs text-slate-500">{SHOW_SHOPPING_LIST_DISCLOSURE}</p>}
        <h3 className="text-xs text-slate-200">Shopping list · {list.buys.length + list.sells.length}</h3>
        {list.emptyReason ? <p className="text-sm text-slate-400">{list.emptyReason}</p> : (
          <>
            <h4 className="text-xs text-emerald-200">Buy</h4>
            {list.buys.length === 0 ? <p className="text-xs text-slate-500">No buys.</p> : <Lines lines={list.buys} places={places} />}
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
            {list.sells.length === 0 ? <p className="text-xs text-slate-500">No extras.</p> : <Lines lines={list.sells} places={places} />}
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
    </>
  );
};

export default ShowShoppingList;
