/**
 * Multi-item lot / bundle math for the Negotiation Arena.
 * Package pricing is a demo heuristic — not a live marketplace quote.
 */
import type { LotLineItem, NegotiableItem } from '../../types';
import { getSelectedPlaybook } from './negotiationPlaybooks';

export type LotLine = LotLineItem;

export type LotPricingMode = 'sum' | 'package';

export interface LotQuote {
  itemCount: number;
  sumAsk: number;
  packagePrice: number;
  packageDiscountPct: number;
  ask: number;
  suggestedMax: number;
  suggestedOpening: number;
  mode: LotPricingMode;
}

const MARKET_ELLY: LotLine = {
  id: 'market-1',
  name: 'Elly De La Cruz 2024 Topps Chrome #15',
  player: 'Elly De La Cruz',
  year: 2024,
  manufacturer: 'Topps Chrome',
  price: 450,
  image: 'https://m.media-amazon.com/images/I/71R2o5C2HNL._AC_UF1000,1000_QL80_.jpg',
};

const MARKET_ANT: LotLine = {
  id: 'market-2',
  name: 'Anthony Edwards 2020 Panini Prizm #258',
  player: 'Anthony Edwards',
  year: 2020,
  manufacturer: 'Panini Prizm',
  price: 850,
  image: 'https://i.ebayimg.com/images/g/Y~QAAOSw~dVl~u~g/s-l1200.jpg',
};

const MARKET_WEMBY: LotLine = {
  id: 'market-3',
  name: 'Victor Wembanyama 2023 Prizm #1',
  player: 'Victor Wembanyama',
  year: 2023,
  manufacturer: 'Panini Prizm',
  price: 620,
  image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600',
};

const MARKET_SOTO: LotLine = {
  id: 'market-4',
  name: 'Juan Soto 2018 Topps Update RC',
  player: 'Juan Soto',
  year: 2018,
  manufacturer: 'Topps',
  price: 380,
  image: 'https://images.unsplash.com/photo-1566577739112-5184dbc4f5c6?auto=format&fit=crop&q=80&w=600',
};

const MARKET_CALEB: LotLine = {
  id: 'market-5',
  name: 'Caleb Williams 2024 Prizm RC',
  player: 'Caleb Williams',
  year: 2024,
  manufacturer: 'Panini Prizm',
  price: 275,
  image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
};

export const MARKETPLACE_LOT_LINES: LotLine[] = [
  MARKET_ELLY,
  MARKET_ANT,
  MARKET_WEMBY,
  MARKET_SOTO,
  MARKET_CALEB,
];

export function linePrice(line: LotLine): number {
  return Number.isFinite(line.price) && line.price > 0 ? line.price : 0;
}

export function sumLotAsk(items: LotLine[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + linePrice(item), 0);
}

/** Demo package discount: 6% at 2 cards, +2pts per extra card, capped at 14%. */
export function packageDiscountPct(itemCount: number): number {
  if (!Number.isFinite(itemCount) || itemCount < 2) return 0;
  return Math.min(14, 6 + (itemCount - 2) * 2);
}

export function defaultPackagePrice(sumAsk: number, itemCount: number): number {
  if (!Number.isFinite(sumAsk) || sumAsk <= 0) return 0;
  const pct = packageDiscountPct(itemCount);
  return Math.round(sumAsk * (1 - pct / 100));
}

export function lotDisplayName(items: LotLine[]): string {
  if (!Array.isArray(items) || items.length === 0) return 'Empty lot';
  if (items.length === 1) {
    return items[0].player || items[0].name || 'Single card';
  }
  const names = items.map((item) => item.player || item.name || 'Card');
  const shown = names.slice(0, 2).join(', ');
  const extra = names.length > 2 ? `, +${names.length - 2}` : '';
  return `Lot of ${items.length}: ${shown}${extra}`;
}

export function quoteLot(
  items: LotLine[],
  mode: LotPricingMode,
  openingPctOfAsk = getSelectedPlaybook().openingPctOfAsk,
): LotQuote {
  const lines = Array.isArray(items) ? items.filter((item) => item && item.id) : [];
  const itemCount = lines.length;
  const sumAsk = sumLotAsk(lines);
  const packagePrice = defaultPackagePrice(sumAsk, itemCount);
  const ask = mode === 'package' && itemCount >= 2 ? packagePrice : sumAsk;
  const opening = Math.max(1, Math.round(ask * openingPctOfAsk));
  const suggestedMax = Math.max(opening, Math.round(ask * 0.92));
  return {
    itemCount,
    sumAsk,
    packagePrice,
    packageDiscountPct: packageDiscountPct(itemCount),
    ask,
    suggestedMax,
    suggestedOpening: opening,
    mode: itemCount < 2 ? 'sum' : mode,
  };
}

export function toLotLine(item: NegotiableItem): LotLine {
  const price = item.price || item.currentValue || item.currentMarketPrice || 0;
  return {
    id: item.id || `line-${item.player || item.name || 'card'}`,
    name: item.cardDescription || item.player || item.name || 'Card',
    player: item.player || item.name,
    year: item.year,
    manufacturer: item.manufacturer,
    price,
    image: item.image,
  };
}

export function collectLotLines(items: NegotiableItem[]): LotLine[] {
  const seen = new Set<string>();
  const lines: LotLine[] = [];
  for (const item of items) {
    if (!item) continue;
    const nested = Array.isArray(item.lotItems) ? item.lotItems : [];
    if (nested.length > 0) {
      for (const line of nested) {
        if (!line?.id || seen.has(line.id)) continue;
        seen.add(line.id);
        lines.push(line);
      }
      continue;
    }
    const line = toLotLine(item);
    if (seen.has(line.id)) continue;
    seen.add(line.id);
    lines.push(line);
  }
  return lines;
}

export function buildLotNegotiableItem(
  items: LotLine[],
  mode: LotPricingMode,
): NegotiableItem {
  const quote = quoteLot(items, mode);
  const first = items[0];
  return {
    id: items.length === 1 ? first?.id : `lot-${items.map((item) => item.id).sort().join('-')}`,
    player: lotDisplayName(items),
    name: lotDisplayName(items),
    year: first?.year,
    manufacturer: items.length > 1 ? `${items.length}-card lot` : first?.manufacturer,
    price: quote.ask,
    currentValue: quote.ask,
    image: first?.image,
    cardDescription: items.map((item) => item.name).join(' · '),
    lotItems: items,
    pricingMode: quote.mode,
    packagePrice: quote.packagePrice,
  };
}

export function negotiableFromLine(line: LotLine): NegotiableItem {
  return {
    id: line.id,
    player: line.player,
    name: line.name,
    year: line.year,
    manufacturer: line.manufacturer,
    price: line.price,
    currentValue: line.price,
    image: line.image,
    cardDescription: line.name,
  };
}

const PREBUILT_LOT_LINES = [MARKET_ELLY, MARKET_WEMBY, MARKET_SOTO, MARKET_CALEB, MARKET_ANT];

export const MARKETPLACE_LOT_CATALOG: NegotiableItem[] = [
  ...MARKETPLACE_LOT_LINES.map(negotiableFromLine),
  {
    ...buildLotNegotiableItem(PREBUILT_LOT_LINES, 'package'),
    id: 'market-lot-bowman-five',
    player: 'Show table five-card lot',
    name: 'Show table five-card lot',
    cardDescription: 'Demo marketplace lot — five singles, package ask.',
  },
];
