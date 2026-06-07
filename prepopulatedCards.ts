// Demo inventory data. The underlying ~5.6k-line dataset lives in
// data/prepopulatedCards.json (a data asset, not code) so it is no longer
// type-checked or diffed as a source module. This file is the typed loader.
//
// Imported synchronously today via constants.tsx. To lazy-load it, switch
// consumers to `await import('./data/prepopulatedCards.json')` and make the
// MOCK_* exports in constants.tsx async — see PRODUCTION_READINESS.md §2.3.
import type { CardInventory } from './types.ts';
import data from './data/prepopulatedCards.json';

interface PrepopulatedSummary {
  totalCost: number;
  marketValue: number;
  roi: number;
  totalGain: number;
  realizedProfit: number;
  realizedSold: number;
  realizedCogs: number;
}

export const PREPOPULATED_CARDS = data.cards as unknown as CardInventory[];
export const PREPOPULATED_SUMMARY = data.summary as PrepopulatedSummary;
export const INVENTORY_PLAYERS = data.players;
