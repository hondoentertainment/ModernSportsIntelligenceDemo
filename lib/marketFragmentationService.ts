// Market Fragmentation Mapper Service — Phase 13
// Cross-venue fragmentation impact analysis on card pricing

export interface VenueFragment {
  id: string;
  venue: string;
  marketShare: number;
  avgListingPrice: number;
  avgSoldPrice: number;
  listingCount: number;
  dailyVolume: number;
  feeStructure: number;
  avgDaysToSell: number;
  buyerBase: number;
  sellerBase: number;
  specialty: string;
}

export interface FragmentationScore {
  id: string;
  category: string;
  herfindahlIndex: number;
  venueCount: number;
  priceDispersion: number;
  liquidityScore: number;
  fragmentationLevel: 'low' | 'moderate' | 'high' | 'extreme';
  trend: 'consolidating' | 'fragmenting' | 'stable';
}

export interface PriceDispersal {
  id: string;
  cardName: string;
  player: string;
  venues: { venue: string; price: number; spread: number }[];
  maxSpread: number;
  avgPrice: number;
  arbitrageOpportunity: boolean;
}

export interface VenueFlow {
  id: string;
  fromVenue: string;
  toVenue: string;
  migrationVolume: number;
  avgValueMigrated: number;
  reason: string;
  period: string;
}

const MOCK_VENUES: VenueFragment[] = [
  { id: 'vf-1', venue: 'eBay', marketShare: 38.5, avgListingPrice: 245, avgSoldPrice: 198, listingCount: 2850000, dailyVolume: 42000, feeStructure: 13.25, avgDaysToSell: 8.2, buyerBase: 4200000, sellerBase: 890000, specialty: 'General Marketplace' },
  { id: 'vf-2', venue: 'Goldin', marketShare: 15.2, avgListingPrice: 2850, avgSoldPrice: 2420, listingCount: 12500, dailyVolume: 850, feeStructure: 20.0, avgDaysToSell: 14.5, buyerBase: 185000, sellerBase: 8500, specialty: 'Premium Auctions' },
  { id: 'vf-3', venue: 'Heritage Auctions', marketShare: 8.8, avgListingPrice: 5200, avgSoldPrice: 4800, listingCount: 4200, dailyVolume: 320, feeStructure: 22.0, avgDaysToSell: 21.0, buyerBase: 125000, sellerBase: 3200, specialty: 'Vintage & Ultra-Premium' },
  { id: 'vf-4', venue: 'PWCC', marketShare: 12.4, avgListingPrice: 1850, avgSoldPrice: 1620, listingCount: 28000, dailyVolume: 1200, feeStructure: 10.0, avgDaysToSell: 12.8, buyerBase: 220000, sellerBase: 15000, specialty: 'Vault & Weekly Auctions' },
  { id: 'vf-5', venue: 'COMC', marketShare: 6.2, avgListingPrice: 42, avgSoldPrice: 35, listingCount: 18500000, dailyVolume: 28000, feeStructure: 5.0, avgDaysToSell: 22.5, buyerBase: 380000, sellerBase: 45000, specialty: 'Low-Mid Value Singles' },
  { id: 'vf-6', venue: 'MySlabs', marketShare: 4.8, avgListingPrice: 385, avgSoldPrice: 340, listingCount: 156000, dailyVolume: 3200, feeStructure: 8.0, avgDaysToSell: 6.5, buyerBase: 95000, sellerBase: 22000, specialty: 'Graded Card Marketplace' },
  { id: 'vf-7', venue: 'StockX', marketShare: 3.1, avgListingPrice: 520, avgSoldPrice: 485, listingCount: 42000, dailyVolume: 1800, feeStructure: 9.5, avgDaysToSell: 3.2, buyerBase: 310000, sellerBase: 18000, specialty: 'Fixed-Price Trading' },
  { id: 'vf-8', venue: 'Alt', marketShare: 2.5, avgListingPrice: 680, avgSoldPrice: 625, listingCount: 8500, dailyVolume: 450, feeStructure: 3.0, avgDaysToSell: 4.8, buyerBase: 65000, sellerBase: 12000, specialty: 'Fractional Ownership' },
];

const MOCK_FRAGMENTATION: FragmentationScore[] = [
  { id: 'fs-1', category: 'Modern Basketball RCs', herfindahlIndex: 0.18, venueCount: 8, priceDispersion: 24.5, liquidityScore: 82, fragmentationLevel: 'high', trend: 'fragmenting' },
  { id: 'fs-2', category: 'Vintage Baseball', herfindahlIndex: 0.32, venueCount: 4, priceDispersion: 12.8, liquidityScore: 65, fragmentationLevel: 'moderate', trend: 'consolidating' },
  { id: 'fs-3', category: 'Football Prizm', herfindahlIndex: 0.22, venueCount: 7, priceDispersion: 19.3, liquidityScore: 78, fragmentationLevel: 'high', trend: 'stable' },
  { id: 'fs-4', category: 'Ultra-Premium ($10K+)', herfindahlIndex: 0.38, venueCount: 3, priceDispersion: 8.5, liquidityScore: 45, fragmentationLevel: 'low', trend: 'consolidating' },
  { id: 'fs-5', category: 'Low-Value Singles (<$5)', herfindahlIndex: 0.25, venueCount: 5, priceDispersion: 35.2, liquidityScore: 91, fragmentationLevel: 'high', trend: 'fragmenting' },
  { id: 'fs-6', category: 'Soccer Cards', herfindahlIndex: 0.28, venueCount: 6, priceDispersion: 22.1, liquidityScore: 58, fragmentationLevel: 'moderate', trend: 'fragmenting' },
  { id: 'fs-7', category: 'Graded Moderns', herfindahlIndex: 0.20, venueCount: 7, priceDispersion: 16.7, liquidityScore: 75, fragmentationLevel: 'high', trend: 'stable' },
  { id: 'fs-8', category: 'Prospect Autos', herfindahlIndex: 0.15, venueCount: 8, priceDispersion: 28.9, liquidityScore: 70, fragmentationLevel: 'extreme', trend: 'fragmenting' },
];

const MOCK_DISPERSAL: PriceDispersal[] = [
  { id: 'pd-1', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', venues: [{ venue: 'eBay', price: 285, spread: 0 }, { venue: 'PWCC', price: 310, spread: 8.8 }, { venue: 'Goldin', price: 340, spread: 19.3 }, { venue: 'MySlabs', price: 275, spread: -3.5 }], maxSpread: 23.6, avgPrice: 302, arbitrageOpportunity: true },
  { id: 'pd-2', cardName: '2018 Prizm Luka Doncic Silver PSA 10', player: 'Luka Doncic', venues: [{ venue: 'eBay', price: 4200, spread: 0 }, { venue: 'Goldin', price: 4850, spread: 15.5 }, { venue: 'PWCC', price: 4500, spread: 7.1 }, { venue: 'Alt', price: 4100, spread: -2.4 }], maxSpread: 18.3, avgPrice: 4412, arbitrageOpportunity: true },
  { id: 'pd-3', cardName: '1952 Topps Mantle #311 PSA 3', player: 'Mickey Mantle', venues: [{ venue: 'Heritage', price: 185000, spread: 0 }, { venue: 'Goldin', price: 178000, spread: -3.8 }, { venue: 'PWCC', price: 182000, spread: -1.6 }], maxSpread: 3.9, avgPrice: 181667, arbitrageOpportunity: false },
  { id: 'pd-4', cardName: '2022 Bowman Chrome Wembanyama 1st PSA 10', player: 'Victor Wembanyama', venues: [{ venue: 'eBay', price: 1200, spread: 0 }, { venue: 'PWCC', price: 1380, spread: 15.0 }, { venue: 'Goldin', price: 1450, spread: 20.8 }, { venue: 'MySlabs', price: 1150, spread: -4.2 }, { venue: 'StockX', price: 1280, spread: 6.7 }], maxSpread: 26.1, avgPrice: 1292, arbitrageOpportunity: true },
];

const MOCK_FLOWS: VenueFlow[] = [
  { id: 'vfl-1', fromVenue: 'eBay', toVenue: 'PWCC', migrationVolume: 2400, avgValueMigrated: 850, reason: 'Lower fees for mid-range cards', period: 'Q1 2026' },
  { id: 'vfl-2', fromVenue: 'PWCC', toVenue: 'Goldin', migrationVolume: 450, avgValueMigrated: 4200, reason: 'Premium audience for high-value auctions', period: 'Q1 2026' },
  { id: 'vfl-3', fromVenue: 'eBay', toVenue: 'MySlabs', migrationVolume: 5800, avgValueMigrated: 320, reason: 'Better graded card buyer experience', period: 'Q1 2026' },
  { id: 'vfl-4', fromVenue: 'eBay', toVenue: 'COMC', migrationVolume: 12000, avgValueMigrated: 28, reason: 'Bulk low-value card storage and sales', period: 'Q1 2026' },
  { id: 'vfl-5', fromVenue: 'StockX', toVenue: 'eBay', migrationVolume: 800, avgValueMigrated: 420, reason: 'Wider buyer base and auction format', period: 'Q1 2026' },
  { id: 'vfl-6', fromVenue: 'Alt', toVenue: 'PWCC', migrationVolume: 200, avgValueMigrated: 1800, reason: 'Sellers exiting fractional to full ownership sales', period: 'Q1 2026' },
];

export function getVenueFragments(): VenueFragment[] { return [...MOCK_VENUES]; }
export function getFragmentationScores(): FragmentationScore[] { return [...MOCK_FRAGMENTATION]; }
export function getPriceDispersals(): PriceDispersal[] { return [...MOCK_DISPERSAL]; }
export function getVenueFlows(): VenueFlow[] { return [...MOCK_FLOWS]; }
export function getTotalVenues(): number { return MOCK_VENUES.length; }
export function getAvgFragmentation(): number { return parseFloat((MOCK_FRAGMENTATION.reduce((sum, f) => sum + f.herfindahlIndex, 0) / MOCK_FRAGMENTATION.length).toFixed(2)); }
export function getArbitrageCount(): number { return MOCK_DISPERSAL.filter(d => d.arbitrageOpportunity).length; }
export function getTopVenue(): string { return MOCK_VENUES.reduce((top, v) => v.marketShare > top.marketShare ? v : top).venue; }
