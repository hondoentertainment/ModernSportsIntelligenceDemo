// Dealer Flow Intelligence — Phase 226
// Wholesale dealer inventory movement tracking and institutional accumulation patterns

export interface DealerProfile {
  id: string;
  name: string;
  type: 'mega-dealer' | 'regional' | 'online-only' | 'auction-house' | 'breaker';
  specialties: string[];
  inventorySize: number;
  avgTurnover: number;
  trustScore: number;
  netFlow30d: number;
  accumulating: string[];
  distributing: string[];
}

export interface FlowEvent {
  id: string;
  dealerId: string;
  dealerName: string;
  type: 'accumulation' | 'distribution' | 'transfer' | 'consignment-in' | 'consignment-out';
  player: string;
  cardDescription: string;
  quantity: number;
  estimatedValue: number;
  date: string;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
}

export interface AccumulationSignal {
  player: string;
  dealerCount: number;
  totalQuantity: number;
  avgPrice: number;
  priceChange7d: number;
  signalStrength: number;
  topDealers: string[];
  interpretation: string;
}

export interface MarketMakerActivity {
  id: string;
  dealer: string;
  bidAskSpread: number;
  inventoryDepth: number;
  fillRate: number;
  avgHoldDays: number;
  profitMargin: number;
  volumeRank: number;
}

const MOCK_DEALERS: DealerProfile[] = [
  { id: 'd-1', name: 'PWCC Marketplace', type: 'auction-house', specialties: ['vintage', 'high-end modern', 'graded'], inventorySize: 45000, avgTurnover: 28, trustScore: 94, netFlow30d: -2400, accumulating: ['Shohei Ohtani', 'Victor Wembanyama'], distributing: ['Jasson Dominguez', 'CJ Stroud'] },
  { id: 'd-2', name: 'Burbank Sportscards', type: 'mega-dealer', specialties: ['modern rookies', 'NFL', 'NBA'], inventorySize: 28000, avgTurnover: 35, trustScore: 91, netFlow30d: 1800, accumulating: ['Caleb Williams', 'Anthony Edwards', 'Caitlin Clark'], distributing: ['Zion Williamson'] },
  { id: 'd-3', name: 'Heritage Auctions', type: 'auction-house', specialties: ['vintage', 'pre-war', 'memorabilia'], inventorySize: 12000, avgTurnover: 42, trustScore: 97, netFlow30d: -800, accumulating: ['Mickey Mantle', 'Willie Mays'], distributing: ['Modern Chrome'] },
  { id: 'd-4', name: 'MySlabs Exchange', type: 'online-only', specialties: ['graded modern', 'parallels', 'autos'], inventorySize: 62000, avgTurnover: 18, trustScore: 88, netFlow30d: 5200, accumulating: ['Jaylen Brown', 'Elly De La Cruz'], distributing: ['Jordan Wicks', 'Corbin Carroll'] },
  { id: 'd-5', name: 'Midwest Box Breaks', type: 'breaker', specialties: ['wax', 'hobby boxes', 'group breaks'], inventorySize: 8500, avgTurnover: 52, trustScore: 86, netFlow30d: 900, accumulating: ['2024 Bowman Draft', '2024 Prizm Basketball'], distributing: ['2023 Topps Chrome'] },
  { id: 'd-6', name: 'Goldin Auctions', type: 'auction-house', specialties: ['ultra high-end', 'game-used', 'vintage'], inventorySize: 5200, avgTurnover: 48, trustScore: 96, netFlow30d: -1200, accumulating: ['LeBron James', 'Patrick Mahomes'], distributing: ['Trevor Lawrence'] },
];

const MOCK_FLOWS: FlowEvent[] = [
  { id: 'fe-1', dealerId: 'd-1', dealerName: 'PWCC Marketplace', type: 'accumulation', player: 'Shohei Ohtani', cardDescription: '2018 Topps Update RC PSA 10', quantity: 12, estimatedValue: 4800, date: '2026-03-15', confidence: 92, signal: 'bullish' },
  { id: 'fe-2', dealerId: 'd-2', dealerName: 'Burbank Sportscards', type: 'accumulation', player: 'Caleb Williams', cardDescription: '2024 Prizm RC Silver', quantity: 45, estimatedValue: 6750, date: '2026-03-14', confidence: 87, signal: 'bullish' },
  { id: 'fe-3', dealerId: 'd-6', dealerName: 'Goldin Auctions', type: 'distribution', player: 'Trevor Lawrence', cardDescription: '2021 Panini Prizm RC PSA 10', quantity: 8, estimatedValue: 2400, date: '2026-03-14', confidence: 94, signal: 'bearish' },
  { id: 'fe-4', dealerId: 'd-4', dealerName: 'MySlabs Exchange', type: 'accumulation', player: 'Elly De La Cruz', cardDescription: '2023 Topps Chrome RC PSA 10', quantity: 28, estimatedValue: 8400, date: '2026-03-13', confidence: 81, signal: 'bullish' },
  { id: 'fe-5', dealerId: 'd-1', dealerName: 'PWCC Marketplace', type: 'distribution', player: 'Jasson Dominguez', cardDescription: '2024 Bowman Chrome 1st Auto', quantity: 6, estimatedValue: 3600, date: '2026-03-13', confidence: 89, signal: 'bearish' },
  { id: 'fe-6', dealerId: 'd-3', dealerName: 'Heritage Auctions', type: 'consignment-in', player: 'Mickey Mantle', cardDescription: '1952 Topps PSA 4', quantity: 1, estimatedValue: 185000, date: '2026-03-12', confidence: 98, signal: 'neutral' },
  { id: 'fe-7', dealerId: 'd-2', dealerName: 'Burbank Sportscards', type: 'accumulation', player: 'Caitlin Clark', cardDescription: '2024 Prizm WNBA RC', quantity: 60, estimatedValue: 9000, date: '2026-03-12', confidence: 85, signal: 'bullish' },
  { id: 'fe-8', dealerId: 'd-5', dealerName: 'Midwest Box Breaks', type: 'transfer', player: 'Various', cardDescription: '2024 Bowman Draft Hobby Cases', quantity: 24, estimatedValue: 14400, date: '2026-03-11', confidence: 76, signal: 'bullish' },
];

const MOCK_ACCUMULATION_SIGNALS: AccumulationSignal[] = [
  { player: 'Caleb Williams', dealerCount: 4, totalQuantity: 128, avgPrice: 185, priceChange7d: 12.4, signalStrength: 91, topDealers: ['Burbank Sportscards', 'MySlabs Exchange', 'PWCC Marketplace'], interpretation: 'Heavy institutional accumulation ahead of NFL season — 4 major dealers building positions simultaneously.' },
  { player: 'Caitlin Clark', dealerCount: 3, totalQuantity: 95, avgPrice: 145, priceChange7d: 18.2, signalStrength: 87, topDealers: ['Burbank Sportscards', 'MySlabs Exchange'], interpretation: 'Cross-gender appeal driving dealer conviction. Breakers and dealers accumulating WNBA product.' },
  { player: 'Shohei Ohtani', dealerCount: 3, totalQuantity: 42, avgPrice: 410, priceChange7d: 5.8, signalStrength: 84, topDealers: ['PWCC Marketplace', 'Goldin Auctions'], interpretation: 'Steady institutional accumulation. Premium dealers building long-term positions in key RCs.' },
  { player: 'Elly De La Cruz', dealerCount: 2, totalQuantity: 56, avgPrice: 295, priceChange7d: -2.1, signalStrength: 72, topDealers: ['MySlabs Exchange', 'Midwest Box Breaks'], interpretation: 'Contrarian accumulation during price dip. Smart money buying weakness in elite tools profile.' },
];

export function getDealers(): DealerProfile[] { return [...MOCK_DEALERS]; }
export function getFlowEvents(): FlowEvent[] { return [...MOCK_FLOWS]; }
export function getAccumulationSignals(): AccumulationSignal[] { return [...MOCK_ACCUMULATION_SIGNALS]; }
export function getBullishFlowCount(): number { return MOCK_FLOWS.filter(f => f.signal === 'bullish').length; }

export default { getDealers, getFlowEvents, getAccumulationSignals, getBullishFlowCount };
