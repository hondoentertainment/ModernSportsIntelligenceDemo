import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory, TargetWatchlist } from '../types';
import type { ResolvedLocalCardShow } from '../lib/shows/localCardShowCatalog';
import {
  SHOW_SHOPPING_LIST_DISCLOSURE,
  buildShowShoppingList,
  shopLineLabel,
  type ShopLine,
} from '../lib/shows/showShoppingList';

interface Props {
  show: ResolvedLocalCardShow;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  liveTape: boolean;
  disclose?: boolean;
}

function usd(value: number | null): string {
  return value == null ? 'no price' : `$${Math.round(value).toLocaleString('en-US')}`;
}

function Lines({ lines }: { lines: ShopLine[] }) {
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
          <p className="text-xs text-slate-500">{line.priceSource}. {line.why}</p>
          {line.cardId && <Link className="text-xs text-brand-lime" to={`/compare?card1=${encodeURIComponent(line.cardId)}`}>Comps</Link>}
          <Link className="ml-2 text-xs text-brand-lime" to="/collection">Collection</Link>
        </li>
      ))}
    </ul>
  );
}

const ShowShoppingList: React.FC<Props> = ({ show, inventory, targets, liveTape, disclose = false }) => {
  const list = useMemo(
    () => buildShowShoppingList({ show, inventory, targets, liveTape }),
    [show, inventory, targets, liveTape],
  );
  return (
    <section className="mt-3 text-slate-300" aria-label={`Shopping list for ${show.name}`}>
      {disclose && <p className="text-xs text-slate-500">{SHOW_SHOPPING_LIST_DISCLOSURE}</p>}
      <h3 className="text-xs text-slate-200">Shopping list · {list.buys.length + list.sells.length}</h3>
      {list.emptyReason ? <p className="text-sm text-slate-400">{list.emptyReason}</p> : (
        <>
          <h4 className="text-xs text-emerald-200">Buy</h4>
          {list.buys.length === 0 ? <p className="text-xs text-slate-500">No buys.</p> : <Lines lines={list.buys} />}
          <h4 className="text-xs text-sky-200">Sell or trade</h4>
          {list.sells.length === 0 ? <p className="text-xs text-slate-500">No extras.</p> : <Lines lines={list.sells} />}
        </>
      )}
    </section>
  );
};

export default ShowShoppingList;
