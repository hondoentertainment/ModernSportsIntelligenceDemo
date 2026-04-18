// Venue Migration Advisor Service — Phase 13
// When and where to migrate listings for better performance

export interface MigrationOpportunity {
  id: string;
  cardName: string;
  player: string;
  currentVenue: string;
  recommendedVenue: string;
  currentPrice: number;
  projectedPrice: number;
  projectedUplift: number;
  currentDaysToSell: number;
  projectedDaysToSell: number;
  feeSavings: number;
  confidence: number;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface VenueComparison {
  id: string;
  venue: string;
  avgSellThrough: number;
  avgDaysToSell: number;
  avgFinalPrice: number;
  feePercent: number;
  buyerPoolSize: number;
  bestFor: string;
  weaknesses: string;
  overallScore: number;
}

export interface MigrationROI {
  id: string;
  fromVenue: string;
  toVenue: string;
  category: string;
  avgPriceIncrease: number;
  avgTimeReduction: number;
  feeDifference: number;
  netROI: number;
  sampleSize: number;
  successRate: number;
}

export interface TimingSignal {
  id: string;
  venue: string;
  signal: string;
  direction: 'migrate-in' | 'migrate-out' | 'hold';
  strength: number;
  reason: string;
  validUntil: string;
  category: string;
}

const MOCK_OPPORTUNITIES: MigrationOpportunity[] = [
  { id: 'mo-1', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', currentVenue: 'eBay', recommendedVenue: 'PWCC', currentPrice: 285, projectedPrice: 325, projectedUplift: 14.0, currentDaysToSell: 12, projectedDaysToSell: 8, feeSavings: 9.50, confidence: 88, category: 'Football RCs', urgency: 'high' },
  { id: 'mo-2', cardName: '2018 Prizm Luka Doncic Silver PSA 10', player: 'Luka Doncic', currentVenue: 'eBay', recommendedVenue: 'Goldin', currentPrice: 4200, projectedPrice: 4850, projectedUplift: 15.5, currentDaysToSell: 18, projectedDaysToSell: 14, feeSavings: -28.35, confidence: 82, category: 'Basketball Prizm', urgency: 'medium' },
  { id: 'mo-3', cardName: '1989 Upper Deck Ken Griffey Jr RC PSA 9', player: 'Ken Griffey Jr', currentVenue: 'COMC', recommendedVenue: 'eBay', currentPrice: 145, projectedPrice: 178, projectedUplift: 22.8, currentDaysToSell: 35, projectedDaysToSell: 8, feeSavings: -12.20, confidence: 91, category: 'Vintage Baseball', urgency: 'high' },
  { id: 'mo-4', cardName: '2022 Bowman Chrome Wembanyama 1st PSA 10', player: 'Victor Wembanyama', currentVenue: 'MySlabs', recommendedVenue: 'Goldin', currentPrice: 1150, projectedPrice: 1380, projectedUplift: 20.0, currentDaysToSell: 6, projectedDaysToSell: 12, feeSavings: -13.80, confidence: 78, category: 'Basketball Prospects', urgency: 'medium' },
  { id: 'mo-5', cardName: '2023 Topps Chrome Elly De La Cruz Auto', player: 'Elly De La Cruz', currentVenue: 'eBay', recommendedVenue: 'PWCC', currentPrice: 680, projectedPrice: 745, projectedUplift: 9.6, currentDaysToSell: 14, projectedDaysToSell: 10, feeSavings: 22.10, confidence: 85, category: 'Baseball Prospects', urgency: 'medium' },
  { id: 'mo-6', cardName: '2017 National Treasures Mahomes RPA', player: 'Patrick Mahomes', currentVenue: 'PWCC', recommendedVenue: 'Goldin', currentPrice: 42000, projectedPrice: 48500, projectedUplift: 15.5, currentDaysToSell: 14, projectedDaysToSell: 21, feeSavings: -420.00, confidence: 75, category: 'Football RPAs', urgency: 'low' },
  { id: 'mo-7', cardName: 'Lot of 50 Low-Value Basketball Singles', player: 'Various', currentVenue: 'eBay', recommendedVenue: 'COMC', currentPrice: 125, projectedPrice: 142, projectedUplift: 13.6, currentDaysToSell: 45, projectedDaysToSell: 28, feeSavings: 6.25, confidence: 92, category: 'Low-Value Singles', urgency: 'immediate' },
  { id: 'mo-8', cardName: '2019 Panini Prizm Zion Williamson Base PSA 10', player: 'Zion Williamson', currentVenue: 'Goldin', recommendedVenue: 'eBay', currentPrice: 185, projectedPrice: 175, projectedUplift: -5.4, currentDaysToSell: 21, projectedDaysToSell: 5, feeSavings: 15.20, confidence: 86, category: 'Basketball Modern', urgency: 'high' },
  { id: 'mo-9', cardName: '2024 Bowman Chrome Roki Sasaki 1st Auto', player: 'Roki Sasaki', currentVenue: 'eBay', recommendedVenue: 'MySlabs', currentPrice: 520, projectedPrice: 545, projectedUplift: 4.8, currentDaysToSell: 10, projectedDaysToSell: 5, feeSavings: 27.30, confidence: 80, category: 'Baseball Prospects', urgency: 'medium' },
  { id: 'mo-10', cardName: '1986 Fleer Michael Jordan RC PSA 7', player: 'Michael Jordan', currentVenue: 'eBay', recommendedVenue: 'Heritage', currentPrice: 12500, projectedPrice: 14800, projectedUplift: 18.4, currentDaysToSell: 25, projectedDaysToSell: 28, feeSavings: -110.00, confidence: 84, category: 'Vintage Basketball', urgency: 'medium' },
  { id: 'mo-11', cardName: '2020 Panini Flawless Burrow RPA /25', player: 'Joe Burrow', currentVenue: 'StockX', recommendedVenue: 'PWCC', currentPrice: 18500, projectedPrice: 21200, projectedUplift: 14.6, currentDaysToSell: 8, projectedDaysToSell: 12, feeSavings: 92.50, confidence: 79, category: 'Football RPAs', urgency: 'medium' },
  { id: 'mo-12', cardName: '2021 Topps Chrome Julio Rodriguez RC Auto', player: 'Julio Rodriguez', currentVenue: 'COMC', recommendedVenue: 'eBay', currentPrice: 380, projectedPrice: 445, projectedUplift: 17.1, currentDaysToSell: 30, projectedDaysToSell: 9, feeSavings: -10.45, confidence: 87, category: 'Baseball Autos', urgency: 'high' },
];

const MOCK_COMPARISONS: VenueComparison[] = [
  { id: 'vc-1', venue: 'eBay', avgSellThrough: 72, avgDaysToSell: 8.2, avgFinalPrice: 198, feePercent: 13.25, buyerPoolSize: 4200000, bestFor: 'Widest audience, best for mid-range cards', weaknesses: 'High fees, competition from bot sellers', overallScore: 78 },
  { id: 'vc-2', venue: 'Goldin', avgSellThrough: 85, avgDaysToSell: 14.5, avgFinalPrice: 2420, feePercent: 20.0, buyerPoolSize: 185000, bestFor: 'Premium cards with competitive bidding', weaknesses: 'High fees, longer sell cycle', overallScore: 82 },
  { id: 'vc-3', venue: 'Heritage', avgSellThrough: 88, avgDaysToSell: 21.0, avgFinalPrice: 4800, feePercent: 22.0, buyerPoolSize: 125000, bestFor: 'Ultra-premium vintage and iconic cards', weaknesses: 'Very high fees, slow process', overallScore: 75 },
  { id: 'vc-4', venue: 'PWCC', avgSellThrough: 78, avgDaysToSell: 12.8, avgFinalPrice: 1620, feePercent: 10.0, buyerPoolSize: 220000, bestFor: 'Best fee structure for $500-$10K cards', weaknesses: 'Smaller buyer pool than eBay', overallScore: 85 },
  { id: 'vc-5', venue: 'COMC', avgSellThrough: 62, avgDaysToSell: 22.5, avgFinalPrice: 35, feePercent: 5.0, buyerPoolSize: 380000, bestFor: 'Bulk low-value card storage and sales', weaknesses: 'Low sell-through, slow for anything over $50', overallScore: 68 },
  { id: 'vc-6', venue: 'MySlabs', avgSellThrough: 74, avgDaysToSell: 6.5, avgFinalPrice: 340, feePercent: 8.0, buyerPoolSize: 95000, bestFor: 'Fast-moving graded cards under $1K', weaknesses: 'Smaller marketplace, newer platform', overallScore: 76 },
  { id: 'vc-7', venue: 'StockX', avgSellThrough: 81, avgDaysToSell: 3.2, avgFinalPrice: 485, feePercent: 9.5, buyerPoolSize: 310000, bestFor: 'Fastest transactions with fixed pricing', weaknesses: 'No auction upside, limited card selection', overallScore: 74 },
  { id: 'vc-8', venue: 'Alt', avgSellThrough: 68, avgDaysToSell: 4.8, avgFinalPrice: 625, feePercent: 3.0, buyerPoolSize: 65000, bestFor: 'Fractional high-value cards, lowest fees', weaknesses: 'Small buyer pool, limited liquidity', overallScore: 70 },
];

const MOCK_ROI: MigrationROI[] = [
  { id: 'roi-1', fromVenue: 'eBay', toVenue: 'PWCC', category: 'Football RCs ($200-$1K)', avgPriceIncrease: 12.4, avgTimeReduction: 18, feeDifference: -3.25, netROI: 15.6, sampleSize: 245, successRate: 82 },
  { id: 'roi-2', fromVenue: 'eBay', toVenue: 'Goldin', category: 'Basketball Premium ($2K+)', avgPriceIncrease: 18.2, avgTimeReduction: -42, feeDifference: 6.75, netROI: 11.5, sampleSize: 89, successRate: 78 },
  { id: 'roi-3', fromVenue: 'COMC', toVenue: 'eBay', category: 'Baseball Vintage ($50-$500)', avgPriceIncrease: 24.5, avgTimeReduction: 64, feeDifference: 8.25, netROI: 16.3, sampleSize: 412, successRate: 85 },
  { id: 'roi-4', fromVenue: 'eBay', toVenue: 'MySlabs', category: 'Graded Modern ($100-$500)', avgPriceIncrease: 5.8, avgTimeReduction: 28, feeDifference: -5.25, netROI: 11.1, sampleSize: 178, successRate: 76 },
  { id: 'roi-5', fromVenue: 'Goldin', toVenue: 'eBay', category: 'Mid-Range ($200-$800)', avgPriceIncrease: -8.5, avgTimeReduction: 55, feeDifference: -6.75, netROI: -1.8, sampleSize: 56, successRate: 42 },
  { id: 'roi-6', fromVenue: 'eBay', toVenue: 'Heritage', category: 'Vintage Premium ($5K+)', avgPriceIncrease: 22.1, avgTimeReduction: -156, feeDifference: 8.75, netROI: 13.4, sampleSize: 34, successRate: 88 },
];

const MOCK_TIMING: TimingSignal[] = [
  { id: 'ts-1', venue: 'Goldin', signal: 'Premium buyer activity surge', direction: 'migrate-in', strength: 85, reason: 'Sunday auction ending prices up 12% this month', validUntil: '2026-04-30', category: 'Basketball Premium' },
  { id: 'ts-2', venue: 'eBay', signal: 'Fee promotion active', direction: 'migrate-in', strength: 78, reason: 'eBay running 80% off final value fees for sports cards', validUntil: '2026-04-25', category: 'All Categories' },
  { id: 'ts-3', venue: 'PWCC', signal: 'Weekly auction momentum', direction: 'migrate-in', strength: 82, reason: 'PWCC Sunday auctions seeing 15% above-market results', validUntil: '2026-04-20', category: 'Football RCs' },
  { id: 'ts-4', venue: 'COMC', signal: 'Processing backlog', direction: 'migrate-out', strength: 72, reason: 'COMC processing times extended to 8+ weeks', validUntil: '2026-05-15', category: 'All Categories' },
  { id: 'ts-5', venue: 'StockX', signal: 'Liquidity drying up', direction: 'migrate-out', strength: 68, reason: 'Bid-ask spreads widening to 15%+ on mid-range cards', validUntil: '2026-05-01', category: 'Cards $200-$800' },
  { id: 'ts-6', venue: 'Heritage', signal: 'Signature auction approaching', direction: 'migrate-in', strength: 90, reason: 'Summer Platinum Night attracts deep-pocket vintage buyers', validUntil: '2026-06-15', category: 'Vintage Premium' },
  { id: 'ts-7', venue: 'MySlabs', signal: 'Platform growth spike', direction: 'migrate-in', strength: 75, reason: 'New buyer registrations up 40% month-over-month', validUntil: '2026-05-10', category: 'Graded Modern' },
  { id: 'ts-8', venue: 'Alt', signal: 'Fractional demand cooling', direction: 'migrate-out', strength: 65, reason: 'IPO activity slowing, secondary market spreads widening', validUntil: '2026-05-20', category: 'High-Value Fractional' },
];

export function getMigrationOpportunities(): MigrationOpportunity[] { return [...MOCK_OPPORTUNITIES]; }
export function getVenueComparisons(): VenueComparison[] { return [...MOCK_COMPARISONS]; }
export function getMigrationROI(): MigrationROI[] { return [...MOCK_ROI]; }
export function getTimingSignals(): TimingSignal[] { return [...MOCK_TIMING]; }
export function getHighUrgencyCount(): number { return MOCK_OPPORTUNITIES.filter(o => o.urgency === 'high' || o.urgency === 'immediate').length; }
export function getAvgProjectedUplift(): number { return parseFloat((MOCK_OPPORTUNITIES.reduce((sum, o) => sum + o.projectedUplift, 0) / MOCK_OPPORTUNITIES.length).toFixed(1)); }
export function getTotalFeeSavings(): number { return parseFloat(MOCK_OPPORTUNITIES.reduce((sum, o) => sum + o.feeSavings, 0).toFixed(2)); }
export function getMigrateInSignals(): number { return MOCK_TIMING.filter(t => t.direction === 'migrate-in').length; }
