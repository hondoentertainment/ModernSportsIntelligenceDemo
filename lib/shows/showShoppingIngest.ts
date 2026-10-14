/**
 * Turn a shopping-list buy into a collection card.
 * Cost basis is the price the collector types. Demo calendar only.
 */
import type { CardInventory, League, Sport } from '../../types';
import type { ShopLine } from './showShoppingList';

export const SHOPPING_INGEST_DISCLOSURE =
  'The price you type is the cost basis. Not a marketplace fill. Not live Market Movers or Sports Card Investor parity.';

const BRANDS = ['Upper Deck', 'Topps', 'Panini', 'Bowman', 'Donruss', 'Fleer', 'Leaf'] as const;

function roundUsd(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function parsePaidUsd(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,]/g, '');
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return roundUsd(value);
}

export function formatIngestUsd(value: number): string {
  const rounded = roundUsd(value);
  return `$${Math.abs(rounded).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function shoppingDraftId(showId: string, line: { id: string; targetId: string | null }): string {
  const key = (line.targetId?.trim() || line.id.trim()).replace(/\s+/g, '');
  return `shop:${showId}:${key}`.slice(0, 96);
}

export function parseShopDetail(detail: string): {
  year: number | null;
  manufacturer: string;
  setName: string;
  cardNumber: string;
  autographed: boolean;
} {
  const yearMatch = detail.match(/\b(?:19|20)\d{2}\b/);
  const numberMatch = detail.match(/#\s*([A-Za-z0-9-]+)/);
  const brand = BRANDS.find((name) => detail.toLowerCase().includes(name.toLowerCase())) ?? '';
  let setName = detail;
  if (yearMatch) setName = setName.replace(yearMatch[0], ' ');
  if (brand) setName = setName.replace(new RegExp(brand.replace(' ', '\\s+'), 'i'), ' ');
  if (numberMatch) setName = setName.replace(numberMatch[0], ' ');
  setName = setName.replace(/\bauto\b/ig, ' ');
  setName = setName.replace(/\s+/g, ' ').trim();
  return {
    year: yearMatch ? Number(yearMatch[0]) : null,
    manufacturer: brand || 'Show purchase',
    setName: setName || 'Show floor',
    cardNumber: numberMatch?.[1] ?? '',
    autographed: /\bauto\b/i.test(detail),
  };
}

function leagueFor(sport: Sport): League {
  if (sport === 'Baseball') return 'MLB';
  if (sport === 'Basketball') return 'NBA';
  if (sport === 'Football') return 'NFL';
  return 'Other';
}

function yearFromDate(iso: string): number {
  const year = Number(iso.slice(0, 4));
  return year >= 1900 && year <= 2099 ? year : 2026;
}

export function buildShoppingBuyDraft(input: {
  line: ShopLine;
  paidUsd: number;
  showName: string;
  purchaseDate: string;
}): CardInventory | null {
  if (input.line.side !== 'buy' || !input.line.sport) return null;
  if (!Number.isFinite(input.paidUsd) || input.paidUsd < 0) return null;
  const paid = roundUsd(input.paidUsd);
  const purchaseDate = /^\d{4}-\d{2}-\d{2}/.test(input.purchaseDate) ? input.purchaseDate.slice(0, 10) : '2026-01-01';
  const parsed = parseShopDetail(input.line.detail);
  const year = parsed.year ?? yearFromDate(purchaseDate);
  const showName = input.showName.trim() || 'Local card show';
  const mark = input.line.marketMarkUsd != null && input.line.marketMarkUsd > 0 ? roundUsd(input.line.marketMarkUsd) : undefined;
  return {
    id: shoppingDraftId(input.line.showId, input.line),
    player: input.line.player.trim() || 'Unknown player',
    year,
    manufacturer: parsed.manufacturer,
    cardNumber: parsed.cardNumber,
    set: parsed.setName,
    sport: input.line.sport,
    league: leagueFor(input.line.sport),
    isAutographed: parsed.autographed,
    condition: 'Raw',
    isGraded: false,
    purchasePrice: paid,
    purchaseDate,
    currentValue: mark,
    lastValuationDate: mark == null ? undefined : purchaseDate,
    pricingRationale: 'Cost basis is the price paid at this seeded show. Mark is local or demo tape.',
    notes: `Shopping list buy at ${showName}. Confirm the card in hand.`,
    status: 'active',
    taxBasis: paid,
  };
}
