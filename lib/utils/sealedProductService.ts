// Phase 156: Wax & Sealed Product Investment Tracker
// Track sealed product investments, ROI calculations, rip vs hold analysis, vintage sealed, and market trends
import { store } from '../dal/syncStore';

// ---- Types ----

export type ProductType = 'hobby_box' | 'retail_box' | 'blaster' | 'mega_box' | 'hanger' | 'cello' | 'fat_pack' | 'case' | 'pack' | 'starter_kit';

export interface SealedProduct {
  id: string;
  name: string;
  year: number;
  sport: 'basketball' | 'baseball' | 'football' | 'hockey' | 'soccer' | 'multi_sport';
  brand: string;
  productType: ProductType;
  releaseDate: string;
  releasePrice: number;
  currentPrice: number;
  allTimeHigh: number;
  allTimeLow: number;
  priceChange30d: number;
  priceChange90d: number;
  priceChange1y: number;
  estimatedPrintRun: number | null;
  keyRookies: string[];
  rating: number;
  available: boolean;
  vintage: boolean;
}

export interface PriceHistory {
  id: string;
  productId: string;
  date: string;
  price: number;
  volume: number;
  source: string;
}

export interface ROICalculation {
  id: string;
  productId: string;
  productName: string;
  purchasePrice: number;
  currentValue: number;
  totalROI: number;
  annualizedROI: number;
  holdingPeriodDays: number;
  breakEvenPrice: number;
  projectedValue12m: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  recommendation: 'strong_hold' | 'hold' | 'neutral' | 'sell' | 'strong_sell';
}

export interface RipVsHold {
  id: string;
  productId: string;
  productName: string;
  sealedValue: number;
  expectedRipValue: number;
  ripValueHigh: number;
  ripValueLow: number;
  ripValueMedian: number;
  holdAdvantage: number;
  ripOddsPositive: number;
  keyHits: { card: string; odds: string; value: number }[];
  verdict: 'hold' | 'rip' | 'toss_up';
  reasoning: string;
}

export interface ProductRelease {
  id: string;
  name: string;
  sport: string;
  brand: string;
  productType: ProductType;
  releaseDate: string;
  estimatedHobbyPrice: number;
  estimatedRetailPrice: number;
  keyRookies: string[];
  hypeLevel: 'low' | 'medium' | 'high' | 'extreme';
  preorderAvailable: boolean;
  description: string;
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'rising' | 'stable' | 'declining';
  changePercent: number;
  timeframe: string;
  description: string;
  affectedProducts: string[];
}

export interface SupplyEstimate {
  id: string;
  productId: string;
  productName: string;
  estimatedTotal: number;
  estimatedRemaining: number;
  percentOpened: number;
  scarcityRating: 'abundant' | 'common' | 'moderate' | 'scarce' | 'very_scarce' | 'extremely_rare';
  yearsSinceRelease: number;
  annualDepletion: number;
}

export interface BreakEvenAnalysis {
  id: string;
  productId: string;
  productName: string;
  boxCost: number;
  averageHitValue: number;
  topHitValue: number;
  bottomHitValue: number;
  hitsPerBox: number;
  breakEvenOdds: number;
  expectedReturn: number;
  bestCaseReturn: number;
  worstCaseReturn: number;
  verdict: 'favorable' | 'neutral' | 'unfavorable';
}

export interface VintageSealed {
  id: string;
  name: string;
  year: number;
  sport: string;
  productType: ProductType;
  currentPrice: number;
  priceIn2020: number;
  priceIn2015: number;
  priceIn2010: number | null;
  appreciationRate: number;
  keyCards: string[];
  condition: 'factory_sealed' | 'bbce_wrapped' | 'authenticated' | 'loose_pack';
  authenticator: string | null;
  rarity: 'scarce' | 'very_scarce' | 'extremely_rare' | 'legendary';
  description: string;
}

export interface InvestmentRating {
  id: string;
  productId: string;
  productName: string;
  overallRating: number;
  rookieStrength: number;
  brandReputation: number;
  printRunScore: number;
  historicalPerformance: number;
  marketDemand: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  summary: string;
}

export interface ProductComparison {
  id: string;
  productAId: string;
  productBId: string;
  productAName: string;
  productBName: string;
  priceAdvantage: string;
  roiAdvantage: string;
  rookieAdvantage: string;
  scarcityAdvantage: string;
  overallWinner: string;
  reasoning: string;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_sealed_product';

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getProductTypeLabel(type: ProductType): { label: string; text: string; bg: string; border: string } {
  switch (type) {
    case 'hobby_box': return { label: 'Hobby Box', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'retail_box': return { label: 'Retail Box', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'blaster': return { label: 'Blaster', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'mega_box': return { label: 'Mega Box', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'hanger': return { label: 'Hanger', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    case 'cello': return { label: 'Cello Pack', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 'fat_pack': return { label: 'Fat Pack', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' };
    case 'case': return { label: 'Case', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'pack': return { label: 'Pack', text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    case 'starter_kit': return { label: 'Starter Kit', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  }
}

export function getRiskLabel(risk: string): { text: string; color: string } {
  switch (risk) {
    case 'low': return { text: 'Low Risk', color: 'text-green-400' };
    case 'medium': return { text: 'Medium Risk', color: 'text-yellow-400' };
    case 'high': return { text: 'High Risk', color: 'text-orange-400' };
    case 'very_high': return { text: 'Very High Risk', color: 'text-red-400' };
    default: return { text: 'Unknown', color: 'text-gray-400' };
  }
}

// ---- Mock Data: Sealed Products (40) ----

const MOCK_SEALED_PRODUCTS: SealedProduct[] = [
  { id: 'sp-1', name: '2023-24 Panini Prizm Basketball Hobby Box', year: 2023, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2024-09-15', releasePrice: 450, currentPrice: 520, allTimeHigh: 620, allTimeLow: 420, priceChange30d: 5.2, priceChange90d: 12.8, priceChange1y: 15.6, estimatedPrintRun: 85000, keyRookies: ['Victor Wembanyama', 'Chet Holmgren', 'Brandon Miller'], rating: 4.5, available: true, vintage: false },
  { id: 'sp-2', name: '2024 Topps Chrome Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2024-11-01', releasePrice: 280, currentPrice: 320, allTimeHigh: 350, allTimeLow: 260, priceChange30d: 3.8, priceChange90d: 8.5, priceChange1y: 14.3, estimatedPrintRun: 120000, keyRookies: ['Paul Skenes', 'Jackson Merrill', 'Colton Cowser'], rating: 4.2, available: true, vintage: false },
  { id: 'sp-3', name: '2024 Panini Prizm Football Hobby Box', year: 2024, sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2025-01-20', releasePrice: 650, currentPrice: 580, allTimeHigh: 720, allTimeLow: 550, priceChange30d: -2.5, priceChange90d: -8.2, priceChange1y: -10.8, estimatedPrintRun: 95000, keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Marvin Harrison Jr'], rating: 3.8, available: true, vintage: false },
  { id: 'sp-4', name: '2023-24 Panini National Treasures Basketball Hobby Box', year: 2023, sport: 'basketball', brand: 'National Treasures', productType: 'hobby_box', releaseDate: '2024-12-10', releasePrice: 4200, currentPrice: 4800, allTimeHigh: 5200, allTimeLow: 4000, priceChange30d: 8.5, priceChange90d: 14.3, priceChange1y: 20.0, estimatedPrintRun: 8000, keyRookies: ['Victor Wembanyama', 'Chet Holmgren', 'Scoot Henderson'], rating: 4.8, available: true, vintage: false },
  { id: 'sp-5', name: '2024 Bowman Chrome Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2024-10-15', releasePrice: 320, currentPrice: 380, allTimeHigh: 410, allTimeLow: 300, priceChange30d: 6.2, priceChange90d: 15.2, priceChange1y: 18.8, estimatedPrintRun: 100000, keyRookies: ['Ethan Salas (prospect)', 'Travis Bazzana (prospect)', 'Charlie Condon (prospect)'], rating: 4.4, available: true, vintage: false },
  { id: 'sp-6', name: '2023-24 Upper Deck Series 1 Hockey Hobby Box', year: 2023, sport: 'hockey', brand: 'Upper Deck', productType: 'hobby_box', releaseDate: '2023-11-08', releasePrice: 125, currentPrice: 180, allTimeHigh: 200, allTimeLow: 110, priceChange30d: 4.5, priceChange90d: 18.5, priceChange1y: 44.0, estimatedPrintRun: 60000, keyRookies: ['Connor Bedard', 'Leo Carlsson', 'Logan Cooley'], rating: 4.6, available: true, vintage: false },
  { id: 'sp-7', name: '2024 Topps Series 1 Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Topps', productType: 'hobby_box', releaseDate: '2024-02-14', releasePrice: 115, currentPrice: 145, allTimeHigh: 165, allTimeLow: 105, priceChange30d: 2.1, priceChange90d: 6.8, priceChange1y: 26.1, estimatedPrintRun: 200000, keyRookies: ['Paul Skenes', 'Evan Carter', 'Corbin Carroll'], rating: 3.9, available: true, vintage: false },
  { id: 'sp-8', name: '2024 Panini Prizm Football Blaster Box', year: 2024, sport: 'football', brand: 'Panini Prizm', productType: 'blaster', releaseDate: '2025-02-01', releasePrice: 40, currentPrice: 35, allTimeHigh: 55, allTimeLow: 32, priceChange30d: -5.4, priceChange90d: -12.5, priceChange1y: -12.5, estimatedPrintRun: 500000, keyRookies: ['Caleb Williams', 'Jayden Daniels'], rating: 3.2, available: true, vintage: false },
  { id: 'sp-9', name: '2023-24 Panini Prizm Basketball Blaster Box', year: 2023, sport: 'basketball', brand: 'Panini Prizm', productType: 'blaster', releaseDate: '2024-10-01', releasePrice: 40, currentPrice: 48, allTimeHigh: 58, allTimeLow: 35, priceChange30d: 2.1, priceChange90d: 8.0, priceChange1y: 20.0, estimatedPrintRun: 600000, keyRookies: ['Victor Wembanyama'], rating: 3.5, available: true, vintage: false },
  { id: 'sp-10', name: '2024 Topps Chrome Baseball Mega Box', year: 2024, sport: 'baseball', brand: 'Topps Chrome', productType: 'mega_box', releaseDate: '2024-11-15', releasePrice: 55, currentPrice: 62, allTimeHigh: 70, allTimeLow: 50, priceChange30d: 3.3, priceChange90d: 7.5, priceChange1y: 12.7, estimatedPrintRun: 350000, keyRookies: ['Paul Skenes', 'Jackson Merrill'], rating: 3.8, available: true, vintage: false },
  { id: 'sp-11', name: '2025 Topps Series 1 Baseball Hobby Box', year: 2025, sport: 'baseball', brand: 'Topps', productType: 'hobby_box', releaseDate: '2025-02-12', releasePrice: 120, currentPrice: 145, allTimeHigh: 155, allTimeLow: 115, priceChange30d: 8.2, priceChange90d: 20.8, priceChange1y: 0, estimatedPrintRun: 180000, keyRookies: ['Ethan Salas', 'Travis Bazzana', 'Charlie Condon'], rating: 4.3, available: true, vintage: false },
  { id: 'sp-12', name: '2024-25 Panini Prizm Basketball Hobby Box', year: 2024, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2025-09-15', releasePrice: 475, currentPrice: 475, allTimeHigh: 475, allTimeLow: 475, priceChange30d: 0, priceChange90d: 0, priceChange1y: 0, estimatedPrintRun: null, keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard'], rating: 4.0, available: false, vintage: false },
  { id: 'sp-13', name: '2023 Bowman Baseball Hobby Box', year: 2023, sport: 'baseball', brand: 'Bowman', productType: 'hobby_box', releaseDate: '2023-06-14', releasePrice: 250, currentPrice: 350, allTimeHigh: 380, allTimeLow: 220, priceChange30d: 5.5, priceChange90d: 12.0, priceChange1y: 40.0, estimatedPrintRun: 110000, keyRookies: ['Ethan Salas (prospect)', 'Dylan Crews (prospect)'], rating: 4.3, available: true, vintage: false },
  { id: 'sp-14', name: '2023-24 Upper Deck Series 2 Hockey Hobby Box', year: 2023, sport: 'hockey', brand: 'Upper Deck', productType: 'hobby_box', releaseDate: '2024-03-20', releasePrice: 125, currentPrice: 150, allTimeHigh: 165, allTimeLow: 115, priceChange30d: 3.2, priceChange90d: 10.5, priceChange1y: 20.0, estimatedPrintRun: 55000, keyRookies: ['Connor Bedard', 'Brock Faber'], rating: 4.1, available: true, vintage: false },
  { id: 'sp-15', name: '2024 Panini National Treasures Football Hobby Box', year: 2024, sport: 'football', brand: 'National Treasures', productType: 'hobby_box', releaseDate: '2025-06-15', releasePrice: 4800, currentPrice: 4800, allTimeHigh: 4800, allTimeLow: 4800, priceChange30d: 0, priceChange90d: 0, priceChange1y: 0, estimatedPrintRun: null, keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Drake Maye'], rating: 4.2, available: false, vintage: false },
  { id: 'sp-16', name: '2024 Topps Heritage Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Topps Heritage', productType: 'hobby_box', releaseDate: '2024-03-06', releasePrice: 95, currentPrice: 88, allTimeHigh: 110, allTimeLow: 80, priceChange30d: -2.2, priceChange90d: -5.4, priceChange1y: -7.4, estimatedPrintRun: 150000, keyRookies: ['Evan Carter', 'Corbin Carroll'], rating: 3.4, available: true, vintage: false },
  { id: 'sp-17', name: '2023 Topps Chrome Update Baseball Hobby Box', year: 2023, sport: 'baseball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2024-04-10', releasePrice: 320, currentPrice: 290, allTimeHigh: 365, allTimeLow: 275, priceChange30d: -3.0, priceChange90d: -5.5, priceChange1y: -9.4, estimatedPrintRun: 90000, keyRookies: ['Corbin Carroll', 'Elly De La Cruz', 'Evan Carter'], rating: 3.6, available: true, vintage: false },
  { id: 'sp-18', name: '2020 Panini Prizm Football Hobby Box', year: 2020, sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2021-01-15', releasePrice: 550, currentPrice: 680, allTimeHigh: 1200, allTimeLow: 450, priceChange30d: -1.5, priceChange90d: -8.1, priceChange1y: -12.3, estimatedPrintRun: 75000, keyRookies: ['Justin Herbert', 'Joe Burrow', 'Tua Tagovailoa'], rating: 3.9, available: true, vintage: false },
  { id: 'sp-19', name: '2018-19 Panini Prizm Basketball Hobby Box', year: 2018, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2019-09-20', releasePrice: 300, currentPrice: 1800, allTimeHigh: 2800, allTimeLow: 280, priceChange30d: 2.8, priceChange90d: 5.5, priceChange1y: 12.5, estimatedPrintRun: 50000, keyRookies: ['Luka Doncic', 'Trae Young', 'Shai Gilgeous-Alexander'], rating: 4.8, available: true, vintage: false },
  { id: 'sp-20', name: '2003-04 Topps Chrome Basketball Hobby Box', year: 2003, sport: 'basketball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2004-02-01', releasePrice: 80, currentPrice: 18500, allTimeHigh: 28000, allTimeLow: 60, priceChange30d: 1.2, priceChange90d: 4.5, priceChange1y: 8.2, estimatedPrintRun: 25000, keyRookies: ['LeBron James', 'Carmelo Anthony', 'Dwyane Wade'], rating: 5.0, available: false, vintage: true },
  { id: 'sp-21', name: '2017 Panini Prizm Football Hobby Box', year: 2017, sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2018-01-10', releasePrice: 250, currentPrice: 2200, allTimeHigh: 3500, allTimeLow: 220, priceChange30d: 1.8, priceChange90d: 3.2, priceChange1y: -5.5, estimatedPrintRun: 40000, keyRookies: ['Patrick Mahomes', 'Deshaun Watson', 'Mitchell Trubisky'], rating: 4.7, available: true, vintage: false },
  { id: 'sp-22', name: '2022 Bowman Chrome Baseball Hobby Box', year: 2022, sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2022-10-19', releasePrice: 280, currentPrice: 310, allTimeHigh: 340, allTimeLow: 250, priceChange30d: 2.0, priceChange90d: 6.5, priceChange1y: 10.7, estimatedPrintRun: 100000, keyRookies: ['Elly De La Cruz (prospect)', 'Jackson Holliday (prospect)'], rating: 4.1, available: true, vintage: false },
  { id: 'sp-23', name: '2024-25 Upper Deck Series 1 Hockey Hobby Box', year: 2024, sport: 'hockey', brand: 'Upper Deck', productType: 'hobby_box', releaseDate: '2024-11-13', releasePrice: 130, currentPrice: 155, allTimeHigh: 170, allTimeLow: 125, priceChange30d: 5.4, priceChange90d: 12.2, priceChange1y: 19.2, estimatedPrintRun: 58000, keyRookies: ['Macklin Celebrini', 'Matvei Michkov', 'Cutter Gauthier'], rating: 4.3, available: true, vintage: false },
  { id: 'sp-24', name: '2020-21 Panini Prizm Basketball Hobby Box', year: 2020, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2021-09-10', releasePrice: 400, currentPrice: 480, allTimeHigh: 750, allTimeLow: 380, priceChange30d: 1.5, priceChange90d: 5.2, priceChange1y: 8.8, estimatedPrintRun: 80000, keyRookies: ['Anthony Edwards', 'LaMelo Ball', 'Tyrese Haliburton'], rating: 4.3, available: true, vintage: false },
  { id: 'sp-25', name: '2024 Topps Chrome UCL Soccer Hobby Box', year: 2024, sport: 'soccer', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2024-12-04', releasePrice: 200, currentPrice: 240, allTimeHigh: 260, allTimeLow: 190, priceChange30d: 4.3, priceChange90d: 15.0, priceChange1y: 20.0, estimatedPrintRun: 45000, keyRookies: ['Lamine Yamal', 'Endrick', 'Arda Guler'], rating: 4.2, available: true, vintage: false },
  { id: 'sp-26', name: '2023-24 Panini Prizm Basketball Mega Box', year: 2023, sport: 'basketball', brand: 'Panini Prizm', productType: 'mega_box', releaseDate: '2024-10-15', releasePrice: 65, currentPrice: 72, allTimeHigh: 85, allTimeLow: 55, priceChange30d: 3.0, priceChange90d: 8.2, priceChange1y: 10.8, estimatedPrintRun: 400000, keyRookies: ['Victor Wembanyama'], rating: 3.6, available: true, vintage: false },
  { id: 'sp-27', name: '2024 Bowman Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Bowman', productType: 'hobby_box', releaseDate: '2024-06-12', releasePrice: 260, currentPrice: 290, allTimeHigh: 310, allTimeLow: 240, priceChange30d: 3.5, priceChange90d: 8.8, priceChange1y: 11.5, estimatedPrintRun: 115000, keyRookies: ['Travis Bazzana (prospect)', 'Charlie Condon (prospect)'], rating: 4.0, available: true, vintage: false },
  { id: 'sp-28', name: '2019-20 Panini Prizm Basketball Hobby Box', year: 2019, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2020-09-15', releasePrice: 350, currentPrice: 550, allTimeHigh: 900, allTimeLow: 320, priceChange30d: -1.5, priceChange90d: -3.5, priceChange1y: -8.3, estimatedPrintRun: 70000, keyRookies: ['Zion Williamson', 'Ja Morant', 'RJ Barrett'], rating: 3.8, available: true, vintage: false },
  { id: 'sp-29', name: '2022-23 Panini Prizm Basketball Hobby Box', year: 2022, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2023-09-13', releasePrice: 425, currentPrice: 380, allTimeHigh: 480, allTimeLow: 350, priceChange30d: -2.6, priceChange90d: -5.0, priceChange1y: -10.6, estimatedPrintRun: 90000, keyRookies: ['Paolo Banchero', 'Jalen Williams', 'Bennedict Mathurin'], rating: 3.5, available: true, vintage: false },
  { id: 'sp-30', name: '2025 Panini Prizm Football Hobby Box', year: 2025, sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2026-01-15', releasePrice: 675, currentPrice: 710, allTimeHigh: 750, allTimeLow: 660, priceChange30d: 2.2, priceChange90d: 5.2, priceChange1y: 0, estimatedPrintRun: null, keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], rating: 4.1, available: true, vintage: false },
  { id: 'sp-31', name: '2024 Panini Prizm WNBA Hobby Box', year: 2024, sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2024-12-20', releasePrice: 150, currentPrice: 220, allTimeHigh: 250, allTimeLow: 140, priceChange30d: 8.0, priceChange90d: 22.0, priceChange1y: 46.7, estimatedPrintRun: 30000, keyRookies: ['Caitlin Clark', 'Angel Reese', 'Cameron Brink'], rating: 4.5, available: true, vintage: false },
  { id: 'sp-32', name: '2023 Topps Chrome Baseball Sapphire Edition', year: 2023, sport: 'baseball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2024-01-15', releasePrice: 400, currentPrice: 350, allTimeHigh: 450, allTimeLow: 320, priceChange30d: -3.0, priceChange90d: -8.5, priceChange1y: -12.5, estimatedPrintRun: 20000, keyRookies: ['Corbin Carroll', 'Elly De La Cruz'], rating: 3.8, available: true, vintage: false },
  { id: 'sp-33', name: '2021 Topps Chrome Baseball Hobby Box', year: 2021, sport: 'baseball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2021-10-29', releasePrice: 250, currentPrice: 280, allTimeHigh: 400, allTimeLow: 220, priceChange30d: 1.0, priceChange90d: 2.5, priceChange1y: -5.0, estimatedPrintRun: 130000, keyRookies: ['Bobby Witt Jr', 'Julio Rodriguez', 'Riley Greene'], rating: 3.7, available: true, vintage: false },
  { id: 'sp-34', name: '2024 Panini Flawless Basketball Hobby Box', year: 2024, sport: 'basketball', brand: 'Panini Flawless', productType: 'hobby_box', releaseDate: '2025-05-01', releasePrice: 8500, currentPrice: 8500, allTimeHigh: 8500, allTimeLow: 8500, priceChange30d: 0, priceChange90d: 0, priceChange1y: 0, estimatedPrintRun: 2500, keyRookies: ['Victor Wembanyama', 'Chet Holmgren'], rating: 4.5, available: false, vintage: false },
  { id: 'sp-35', name: '2023 Bowman Chrome Baseball HTA Choice Box', year: 2023, sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2023-11-15', releasePrice: 450, currentPrice: 520, allTimeHigh: 580, allTimeLow: 420, priceChange30d: 4.0, priceChange90d: 10.5, priceChange1y: 15.6, estimatedPrintRun: 15000, keyRookies: ['Ethan Salas (prospect)', 'Dylan Crews (prospect)'], rating: 4.4, available: true, vintage: false },
  { id: 'sp-36', name: '2024 Panini Select Football Hobby Box', year: 2024, sport: 'football', brand: 'Panini Select', productType: 'hobby_box', releaseDate: '2025-03-01', releasePrice: 500, currentPrice: 475, allTimeHigh: 540, allTimeLow: 460, priceChange30d: -2.0, priceChange90d: -5.0, priceChange1y: 0, estimatedPrintRun: 70000, keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Bo Nix'], rating: 3.7, available: true, vintage: false },
  { id: 'sp-37', name: '2023 Panini Prizm Draft Picks Football Hobby Box', year: 2023, sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2023-10-20', releasePrice: 200, currentPrice: 165, allTimeHigh: 230, allTimeLow: 150, priceChange30d: -4.0, priceChange90d: -10.0, priceChange1y: -17.5, estimatedPrintRun: 80000, keyRookies: ['Caleb Williams (college)', 'Drake Maye (college)'], rating: 3.2, available: true, vintage: false },
  { id: 'sp-38', name: '2025 Bowman Chrome Baseball Hobby Box', year: 2025, sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2025-10-15', releasePrice: 340, currentPrice: 340, allTimeHigh: 340, allTimeLow: 340, priceChange30d: 0, priceChange90d: 0, priceChange1y: 0, estimatedPrintRun: null, keyRookies: ['TBD 2025 Draft Class'], rating: 3.8, available: false, vintage: false },
  { id: 'sp-39', name: '2024 Topps Series 2 Baseball Hobby Box', year: 2024, sport: 'baseball', brand: 'Topps', productType: 'hobby_box', releaseDate: '2024-06-12', releasePrice: 115, currentPrice: 105, allTimeHigh: 130, allTimeLow: 95, priceChange30d: -2.8, priceChange90d: -6.5, priceChange1y: -8.7, estimatedPrintRun: 180000, keyRookies: ['Paul Skenes', 'Jackson Chourio'], rating: 3.5, available: true, vintage: false },
  { id: 'sp-40', name: '2024-25 Upper Deck Series 2 Hockey Hobby Box', year: 2024, sport: 'hockey', brand: 'Upper Deck', productType: 'hobby_box', releaseDate: '2025-03-19', releasePrice: 130, currentPrice: 135, allTimeHigh: 140, allTimeLow: 125, priceChange30d: 3.8, priceChange90d: 3.8, priceChange1y: 0, estimatedPrintRun: 50000, keyRookies: ['Macklin Celebrini', 'Matvei Michkov'], rating: 4.0, available: true, vintage: false },
];

// ---- Mock Data: Upcoming Releases (15) ----

const MOCK_RELEASES: ProductRelease[] = [
  { id: 'pr-1', name: '2025 Topps Series 2 Baseball', sport: 'baseball', brand: 'Topps', productType: 'hobby_box', releaseDate: '2026-06-10', estimatedHobbyPrice: 120, estimatedRetailPrice: 30, keyRookies: ['Ethan Salas', 'Travis Bazzana', 'Jac Caglianone'], hypeLevel: 'high', preorderAvailable: false, description: 'Second series featuring key rookie debuts from the 2026 MLB season.' },
  { id: 'pr-2', name: '2025-26 Panini Prizm Basketball', sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2026-09-15', estimatedHobbyPrice: 500, estimatedRetailPrice: 42, keyRookies: ['Cooper Flagg', 'Dylan Harper', 'Ace Bailey'], hypeLevel: 'extreme', preorderAvailable: false, description: 'The flagship basketball product featuring the highly anticipated 2025 NBA Draft class led by Cooper Flagg.' },
  { id: 'pr-3', name: '2026 Topps Series 1 Baseball', sport: 'baseball', brand: 'Topps', productType: 'hobby_box', releaseDate: '2026-02-12', estimatedHobbyPrice: 125, estimatedRetailPrice: 30, keyRookies: ['Ethan Salas', 'Travis Bazzana', 'Charlie Condon'], hypeLevel: 'high', preorderAvailable: true, description: 'First product of the 2026 season featuring the strongest rookie class in years.' },
  { id: 'pr-4', name: '2025 Panini National Treasures Football', sport: 'football', brand: 'National Treasures', productType: 'hobby_box', releaseDate: '2026-06-01', estimatedHobbyPrice: 5000, estimatedRetailPrice: 0, keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hypeLevel: 'high', preorderAvailable: false, description: 'The premium football product featuring on-card RPAs from the 2025 NFL Draft class.' },
  { id: 'pr-5', name: '2025 Bowman Chrome Baseball', sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2026-10-15', estimatedHobbyPrice: 350, estimatedRetailPrice: 0, keyRookies: ['2026 Draft Class Prospects'], hypeLevel: 'medium', preorderAvailable: false, description: 'Annual prospect-focused product with 1st Bowman Chrome cards.' },
  { id: 'pr-6', name: '2025-26 Upper Deck Series 1 Hockey', sport: 'hockey', brand: 'Upper Deck', productType: 'hobby_box', releaseDate: '2025-11-12', estimatedHobbyPrice: 135, estimatedRetailPrice: 35, keyRookies: ['2025 NHL Draft Picks'], hypeLevel: 'medium', preorderAvailable: true, description: 'The premier hockey product with Young Guns rookie cards.' },
  { id: 'pr-7', name: '2025 Panini Prizm Football', sport: 'football', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2026-01-15', estimatedHobbyPrice: 675, estimatedRetailPrice: 42, keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hypeLevel: 'high', preorderAvailable: true, description: 'The flagship football product with Silver Prizm parallels and auto hits.' },
  { id: 'pr-8', name: '2025 Topps Chrome Baseball', sport: 'baseball', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2025-11-01', estimatedHobbyPrice: 290, estimatedRetailPrice: 55, keyRookies: ['Paul Skenes', 'Jackson Merrill', 'Shota Imanaga'], hypeLevel: 'medium', preorderAvailable: true, description: 'Chrome refractor versions of 2025 Topps base rookies.' },
  { id: 'pr-9', name: '2024-25 Panini National Treasures Basketball', sport: 'basketball', brand: 'National Treasures', productType: 'hobby_box', releaseDate: '2025-12-10', estimatedHobbyPrice: 4500, estimatedRetailPrice: 0, keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard'], hypeLevel: 'high', preorderAvailable: false, description: 'The premium basketball product with on-card RPAs and patch cards.' },
  { id: 'pr-10', name: '2025 Bowman Baseball', sport: 'baseball', brand: 'Bowman', productType: 'hobby_box', releaseDate: '2025-06-11', estimatedHobbyPrice: 270, estimatedRetailPrice: 35, keyRookies: ['2025 Draft Class', 'International Prospects'], hypeLevel: 'medium', preorderAvailable: true, description: 'The annual prospect product with 1st Bowman cards for new draft picks.' },
  { id: 'pr-11', name: '2025 Panini Prizm WNBA', sport: 'basketball', brand: 'Panini Prizm', productType: 'hobby_box', releaseDate: '2025-12-15', estimatedHobbyPrice: 175, estimatedRetailPrice: 40, keyRookies: ['Paige Bueckers', 'JuJu Watkins'], hypeLevel: 'extreme', preorderAvailable: false, description: 'WNBA product featuring the most anticipated draft class in league history.' },
  { id: 'pr-12', name: '2026 Bowman Chrome Baseball', sport: 'baseball', brand: 'Bowman Chrome', productType: 'hobby_box', releaseDate: '2026-10-20', estimatedHobbyPrice: 360, estimatedRetailPrice: 0, keyRookies: ['2026 Draft Prospects'], hypeLevel: 'medium', preorderAvailable: false, description: 'Chrome prospect cards from the latest Bowman Baseball release.' },
  { id: 'pr-13', name: '2025 Topps Chrome UCL Soccer', sport: 'soccer', brand: 'Topps Chrome', productType: 'hobby_box', releaseDate: '2025-12-03', estimatedHobbyPrice: 210, estimatedRetailPrice: 55, keyRookies: ['Lamine Yamal', 'Endrick', 'New Signings'], hypeLevel: 'medium', preorderAvailable: false, description: 'Champions League chrome cards featuring top European soccer talent.' },
  { id: 'pr-14', name: '2025-26 Panini Flawless Basketball', sport: 'basketball', brand: 'Panini Flawless', productType: 'hobby_box', releaseDate: '2026-05-01', estimatedHobbyPrice: 9000, estimatedRetailPrice: 0, keyRookies: ['Zaccharie Risacher', 'Alex Sarr'], hypeLevel: 'high', preorderAvailable: false, description: 'Ultra-premium product with encased gems and flawless diamond embedded cards.' },
  { id: 'pr-15', name: '2025 Panini Select Football', sport: 'football', brand: 'Panini Select', productType: 'hobby_box', releaseDate: '2026-03-01', estimatedHobbyPrice: 525, estimatedRetailPrice: 0, keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hypeLevel: 'medium', preorderAvailable: false, description: 'Multi-tier football product with Concourse, Premier, and Club levels.' },
];

// ---- Mock Data: Vintage Sealed Products (30) ----

const MOCK_VINTAGE_SEALED: VintageSealed[] = [
  { id: 'vs-1', name: '1986-87 Fleer Basketball Wax Box', year: 1986, sport: 'basketball', productType: 'hobby_box', currentPrice: 850000, priceIn2020: 520000, priceIn2015: 125000, priceIn2010: 45000, appreciationRate: 18.5, keyCards: ['Michael Jordan RC #57', 'Charles Barkley RC', 'Patrick Ewing RC'], condition: 'factory_sealed', authenticator: 'BBCE', rarity: 'legendary', description: 'The holy grail of sealed basketball product. Contains Jordan rookies.' },
  { id: 'vs-2', name: '1986-87 Fleer Basketball Wax Pack', year: 1986, sport: 'basketball', productType: 'pack', currentPrice: 22000, priceIn2020: 15000, priceIn2015: 5000, priceIn2010: 1800, appreciationRate: 16.8, keyCards: ['Michael Jordan RC #57'], condition: 'authenticated', authenticator: 'PSA', rarity: 'very_scarce', description: 'Single sealed pack from the iconic 1986-87 Fleer set.' },
  { id: 'vs-3', name: '1952 Topps Baseball Wax Pack', year: 1952, sport: 'baseball', productType: 'pack', currentPrice: 75000, priceIn2020: 55000, priceIn2015: 25000, priceIn2010: 12000, appreciationRate: 14.2, keyCards: ['Mickey Mantle #311', 'Willie Mays #261'], condition: 'authenticated', authenticator: 'PSA', rarity: 'legendary', description: 'Incredibly rare pack from the most valuable vintage baseball set.' },
  { id: 'vs-4', name: '1996-97 Topps Chrome Basketball Hobby Box', year: 1996, sport: 'basketball', productType: 'hobby_box', currentPrice: 185000, priceIn2020: 95000, priceIn2015: 18000, priceIn2010: 5500, appreciationRate: 22.5, keyCards: ['Kobe Bryant RC #138', 'Allen Iverson RC', 'Steve Nash RC'], condition: 'factory_sealed', authenticator: 'BBCE', rarity: 'extremely_rare', description: 'Contains Kobe Bryant Chrome rookies. One of the most sought-after sealed boxes.' },
  { id: 'vs-5', name: '2003-04 Topps Chrome Basketball Hobby Box', year: 2003, sport: 'basketball', productType: 'hobby_box', currentPrice: 18500, priceIn2020: 8500, priceIn2015: 1200, priceIn2010: 400, appreciationRate: 28.5, keyCards: ['LeBron James RC #111', 'Dwyane Wade RC', 'Carmelo Anthony RC'], condition: 'factory_sealed', authenticator: null, rarity: 'very_scarce', description: 'LeBron James Chrome rookie box. Most valuable modern sealed product.' },
  { id: 'vs-6', name: '1979-80 O-Pee-Chee Hockey Wax Box', year: 1979, sport: 'hockey', productType: 'hobby_box', currentPrice: 220000, priceIn2020: 145000, priceIn2015: 55000, priceIn2010: 22000, appreciationRate: 15.8, keyCards: ['Wayne Gretzky RC #18'], condition: 'bbce_wrapped', authenticator: 'BBCE', rarity: 'legendary', description: 'Contains the Gretzky rookie. Holy grail of hockey sealed product.' },
  { id: 'vs-7', name: '1955 Topps Baseball 5-Cent Wax Pack', year: 1955, sport: 'baseball', productType: 'pack', currentPrice: 28000, priceIn2020: 18000, priceIn2015: 8000, priceIn2010: 3500, appreciationRate: 13.5, keyCards: ['Roberto Clemente RC #164', 'Sandy Koufax RC'], condition: 'authenticated', authenticator: 'PSA', rarity: 'extremely_rare', description: 'Vintage pack containing potential Clemente and Koufax rookies.' },
  { id: 'vs-8', name: '1993 SP Baseball Foil Box', year: 1993, sport: 'baseball', productType: 'hobby_box', currentPrice: 8500, priceIn2020: 3200, priceIn2015: 1500, priceIn2010: 800, appreciationRate: 16.2, keyCards: ['Derek Jeter RC #279'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Contains the iconic Derek Jeter SP rookie card.' },
  { id: 'vs-9', name: '1989 Upper Deck Baseball High Number Box', year: 1989, sport: 'baseball', productType: 'hobby_box', currentPrice: 1800, priceIn2020: 1200, priceIn2015: 600, priceIn2010: 250, appreciationRate: 12.5, keyCards: ['Ken Griffey Jr RC #1'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Classic 90s product with the iconic Griffey Jr rookie.' },
  { id: 'vs-10', name: '1969 Topps Basketball Wax Pack', year: 1969, sport: 'basketball', productType: 'pack', currentPrice: 42000, priceIn2020: 28000, priceIn2015: 12000, priceIn2010: 5000, appreciationRate: 14.8, keyCards: ['Lew Alcindor RC #25'], condition: 'authenticated', authenticator: 'PSA', rarity: 'legendary', description: 'Extremely rare pack from the Kareem Abdul-Jabbar rookie year.' },
  { id: 'vs-11', name: '2009-10 Panini National Treasures Basketball Hobby Box', year: 2009, sport: 'basketball', productType: 'hobby_box', currentPrice: 95000, priceIn2020: 25000, priceIn2015: 4000, priceIn2010: null, appreciationRate: 35.2, keyCards: ['Stephen Curry RC /99', 'James Harden RC'], condition: 'factory_sealed', authenticator: null, rarity: 'extremely_rare', description: 'Ultra-low production Curry rookie NT box. Astronomical appreciation.' },
  { id: 'vs-12', name: '1966 Topps Baseball Wax Box', year: 1966, sport: 'baseball', productType: 'hobby_box', currentPrice: 180000, priceIn2020: 120000, priceIn2015: 55000, priceIn2010: 25000, appreciationRate: 13.2, keyCards: ['Roberto Clemente', 'Willie Mays', 'Hank Aaron'], condition: 'bbce_wrapped', authenticator: 'BBCE', rarity: 'legendary', description: 'Vintage baseball wax from the golden era. Extremely scarce.' },
  { id: 'vs-13', name: '2000-01 SP Authentic Basketball Hobby Box', year: 2000, sport: 'basketball', productType: 'hobby_box', currentPrice: 5800, priceIn2020: 2500, priceIn2015: 800, priceIn2010: 350, appreciationRate: 18.5, keyCards: ['Kobe Bryant auto', 'Kevin Garnett auto'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Early auto-focused product with strong HOF content.' },
  { id: 'vs-14', name: '1980 Topps Baseball Wax Box', year: 1980, sport: 'baseball', productType: 'hobby_box', currentPrice: 12000, priceIn2020: 6500, priceIn2015: 3000, priceIn2010: 1500, appreciationRate: 14.0, keyCards: ['Rickey Henderson RC #482'], condition: 'bbce_wrapped', authenticator: 'BBCE', rarity: 'very_scarce', description: 'Contains the stolen base king Rickey Henderson rookie.' },
  { id: 'vs-15', name: '2013-14 Panini Prizm Basketball Hobby Box', year: 2013, sport: 'basketball', productType: 'hobby_box', currentPrice: 28000, priceIn2020: 8000, priceIn2015: 450, priceIn2010: null, appreciationRate: 42.5, keyCards: ['Giannis Antetokounmpo RC #290', 'CJ McCollum RC'], condition: 'factory_sealed', authenticator: null, rarity: 'very_scarce', description: 'First year of Prizm basketball. Contains the Giannis rookie. Massive appreciation.' },
  { id: 'vs-16', name: '1971 Topps Baseball Wax Box', year: 1971, sport: 'baseball', productType: 'hobby_box', currentPrice: 85000, priceIn2020: 52000, priceIn2015: 22000, priceIn2010: 10000, appreciationRate: 14.5, keyCards: ['Hank Aaron', 'Roberto Clemente', 'Nolan Ryan'], condition: 'bbce_wrapped', authenticator: 'BBCE', rarity: 'extremely_rare', description: 'Black-bordered set makes high-grade cards extremely scarce.' },
  { id: 'vs-17', name: '2017 Panini Prizm Football Hobby Box', year: 2017, sport: 'football', productType: 'hobby_box', currentPrice: 2200, priceIn2020: 800, priceIn2015: 0, priceIn2010: null, appreciationRate: 28.0, keyCards: ['Patrick Mahomes RC #269', 'Deshaun Watson RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'The Mahomes rookie Prizm box. One of the best modern football sealed investments.' },
  { id: 'vs-18', name: '1957 Topps Baseball Wax Pack', year: 1957, sport: 'baseball', productType: 'pack', currentPrice: 18000, priceIn2020: 12000, priceIn2015: 5500, priceIn2010: 2500, appreciationRate: 13.8, keyCards: ['Mickey Mantle', 'Ted Williams', 'Hank Aaron'], condition: 'authenticated', authenticator: 'PSA', rarity: 'extremely_rare', description: 'Vintage pack with multiple HOF possibilities.' },
  { id: 'vs-19', name: '1984-85 Star Company Basketball Bag Set', year: 1984, sport: 'basketball', productType: 'starter_kit', currentPrice: 45000, priceIn2020: 25000, priceIn2015: 8000, priceIn2010: 3500, appreciationRate: 17.5, keyCards: ['Michael Jordan XRC', 'Charles Barkley XRC'], condition: 'factory_sealed', authenticator: null, rarity: 'very_scarce', description: 'Pre-Fleer Jordan card set. Technically his first cards.' },
  { id: 'vs-20', name: '2018-19 Panini Prizm Basketball Hobby Box', year: 2018, sport: 'basketball', productType: 'hobby_box', currentPrice: 1800, priceIn2020: 650, priceIn2015: 0, priceIn2010: null, appreciationRate: 25.0, keyCards: ['Luka Doncic RC #280', 'Trae Young RC', 'Shai Gilgeous-Alexander RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'The Luka Prizm box. One of the strongest modern sealed investments.' },
  { id: 'vs-21', name: '1975 Topps Baseball Cello Box', year: 1975, sport: 'baseball', productType: 'cello', currentPrice: 32000, priceIn2020: 18000, priceIn2015: 8000, priceIn2010: 4000, appreciationRate: 13.8, keyCards: ['George Brett RC', 'Robin Yount RC'], condition: 'bbce_wrapped', authenticator: 'BBCE', rarity: 'very_scarce', description: 'Multi-color mini-card set with key HOF rookies.' },
  { id: 'vs-22', name: '2011 Topps Update Baseball Hobby Box', year: 2011, sport: 'baseball', productType: 'hobby_box', currentPrice: 2800, priceIn2020: 1200, priceIn2015: 180, priceIn2010: null, appreciationRate: 22.0, keyCards: ['Mike Trout RC #US175', 'Jose Altuve RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'The Mike Trout rookie box. Still one of the best modern baseball investments.' },
  { id: 'vs-23', name: '1961 Topps Baseball Wax Pack', year: 1961, sport: 'baseball', productType: 'pack', currentPrice: 8500, priceIn2020: 5500, priceIn2015: 2500, priceIn2010: 1200, appreciationRate: 13.0, keyCards: ['Mickey Mantle', 'Roger Maris', 'Roberto Clemente'], condition: 'authenticated', authenticator: 'PSA', rarity: 'extremely_rare', description: 'Pack from the legendary Maris/Mantle home run chase season.' },
  { id: 'vs-24', name: '1981 Topps Football Grocery Rack Pack', year: 1981, sport: 'football', productType: 'fat_pack', currentPrice: 4500, priceIn2020: 2800, priceIn2015: 1200, priceIn2010: 500, appreciationRate: 14.5, keyCards: ['Joe Montana RC #216'], condition: 'authenticated', authenticator: 'BBCE', rarity: 'very_scarce', description: 'Rack pack with Montana rookie potential. Rare format.' },
  { id: 'vs-25', name: '1956 Topps Baseball Wax Box', year: 1956, sport: 'baseball', productType: 'hobby_box', currentPrice: 450000, priceIn2020: 280000, priceIn2015: 120000, priceIn2010: 55000, appreciationRate: 14.2, keyCards: ['Mickey Mantle #135', 'Willie Mays #130', 'Roberto Clemente'], condition: 'factory_sealed', authenticator: 'BBCE', rarity: 'legendary', description: 'One of the rarest vintage baseball sealed products in existence.' },
  { id: 'vs-26', name: '1998-99 Topps Chrome Basketball Hobby Box', year: 1998, sport: 'basketball', productType: 'hobby_box', currentPrice: 6500, priceIn2020: 3200, priceIn2015: 800, priceIn2010: 300, appreciationRate: 20.5, keyCards: ['Dirk Nowitzki RC', 'Vince Carter RC', 'Paul Pierce RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Late 90s Chrome box with strong HOF rookie content.' },
  { id: 'vs-27', name: '2020-21 Panini Prizm Basketball Hobby Box', year: 2020, sport: 'basketball', productType: 'hobby_box', currentPrice: 480, priceIn2020: 400, priceIn2015: 0, priceIn2010: null, appreciationRate: 3.8, keyCards: ['Anthony Edwards RC', 'LaMelo Ball RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Edwards and Ball rookie box. Moderate appreciation so far.' },
  { id: 'vs-28', name: '1987 Topps Baseball Wax Case (20 boxes)', year: 1987, sport: 'baseball', productType: 'case', currentPrice: 3200, priceIn2020: 2000, priceIn2015: 1200, priceIn2010: 600, appreciationRate: 11.2, keyCards: ['Barry Bonds RC', 'Bo Jackson RC', 'Rafael Palmeiro RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Full case of classic junk wax era product. Appreciating as nostalgia grows.' },
  { id: 'vs-29', name: '1990 Topps Football Wax Box', year: 1990, sport: 'football', productType: 'hobby_box', currentPrice: 450, priceIn2020: 250, priceIn2015: 120, priceIn2010: 60, appreciationRate: 13.5, keyCards: ['Emmitt Smith RC', 'Junior Seau RC', 'Cortez Kennedy RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Junk wax era football but contains Emmitt Smith rookie. Steady appreciation.' },
  { id: 'vs-30', name: '2014-15 Panini Prizm Basketball Hobby Box', year: 2014, sport: 'basketball', productType: 'hobby_box', currentPrice: 5200, priceIn2020: 1800, priceIn2015: 250, priceIn2010: null, appreciationRate: 28.5, keyCards: ['Nikola Jokic RC', 'Joel Embiid RC', 'Andrew Wiggins RC'], condition: 'factory_sealed', authenticator: null, rarity: 'scarce', description: 'Jokic rookie Prizm box. Late-bloomer appreciation as Jokic became MVP.' },
];

// ---- Mock Data: ROI Calculations ----

const MOCK_ROI: ROICalculation[] = [
  { id: 'roi-1', productId: 'sp-19', productName: '2018-19 Panini Prizm Basketball Hobby Box', purchasePrice: 300, currentValue: 1800, totalROI: 500.0, annualizedROI: 29.2, holdingPeriodDays: 2370, breakEvenPrice: 300, projectedValue12m: 2100, riskLevel: 'low', recommendation: 'strong_hold' },
  { id: 'roi-2', productId: 'sp-20', productName: '2003-04 Topps Chrome Basketball Hobby Box', purchasePrice: 80, currentValue: 18500, totalROI: 23025.0, annualizedROI: 28.5, holdingPeriodDays: 8035, breakEvenPrice: 80, projectedValue12m: 20000, riskLevel: 'low', recommendation: 'strong_hold' },
  { id: 'roi-3', productId: 'sp-1', productName: '2023-24 Panini Prizm Basketball Hobby Box', purchasePrice: 450, currentValue: 520, totalROI: 15.6, annualizedROI: 10.4, holdingPeriodDays: 547, breakEvenPrice: 450, projectedValue12m: 600, riskLevel: 'medium', recommendation: 'hold' },
  { id: 'roi-4', productId: 'sp-3', productName: '2024 Panini Prizm Football Hobby Box', purchasePrice: 650, currentValue: 580, totalROI: -10.8, annualizedROI: -9.2, holdingPeriodDays: 420, breakEvenPrice: 650, projectedValue12m: 620, riskLevel: 'high', recommendation: 'neutral' },
  { id: 'roi-5', productId: 'sp-21', productName: '2017 Panini Prizm Football Hobby Box', purchasePrice: 250, currentValue: 2200, totalROI: 780.0, annualizedROI: 31.5, holdingPeriodDays: 2985, breakEvenPrice: 250, projectedValue12m: 2400, riskLevel: 'low', recommendation: 'hold' },
  { id: 'roi-6', productId: 'sp-31', productName: '2024 Panini Prizm WNBA Hobby Box', purchasePrice: 150, currentValue: 220, totalROI: 46.7, annualizedROI: 52.0, holdingPeriodDays: 320, breakEvenPrice: 150, projectedValue12m: 300, riskLevel: 'medium', recommendation: 'strong_hold' },
  { id: 'roi-7', productId: 'sp-28', productName: '2019-20 Panini Prizm Basketball Hobby Box', purchasePrice: 350, currentValue: 550, totalROI: 57.1, annualizedROI: 9.5, holdingPeriodDays: 2005, breakEvenPrice: 350, projectedValue12m: 500, riskLevel: 'high', recommendation: 'sell' },
  { id: 'roi-8', productId: 'sp-6', productName: '2023-24 Upper Deck Series 1 Hockey Hobby Box', purchasePrice: 125, currentValue: 180, totalROI: 44.0, annualizedROI: 18.5, holdingPeriodDays: 858, breakEvenPrice: 125, projectedValue12m: 210, riskLevel: 'low', recommendation: 'hold' },
];

// ---- Service Functions ----

export function getSealedProducts(): SealedProduct[] {
  const cached = loadData<SealedProduct[]>('sealed_products');
  if (cached) return cached;
  saveData('sealed_products', MOCK_SEALED_PRODUCTS);
  return MOCK_SEALED_PRODUCTS;
}

export function getSealedProductById(id: string): SealedProduct | undefined {
  const products = getSealedProducts();
  return products.find(p => p.id === id);
}

export function getSealedProductsBySport(sport: SealedProduct['sport']): SealedProduct[] {
  const products = getSealedProducts();
  return products.filter(p => p.sport === sport);
}

export function getSealedProductsByType(type: ProductType): SealedProduct[] {
  const products = getSealedProducts();
  return products.filter(p => p.productType === type);
}

export function getUpcomingReleases(): ProductRelease[] {
  const cached = loadData<ProductRelease[]>('upcoming_releases');
  if (cached) return cached;
  saveData('upcoming_releases', MOCK_RELEASES);
  return MOCK_RELEASES;
}

export function getUpcomingReleasesBySport(sport: string): ProductRelease[] {
  const releases = getUpcomingReleases();
  return releases.filter(r => r.sport === sport);
}

export function getVintageSealed(): VintageSealed[] {
  const cached = loadData<VintageSealed[]>('vintage_sealed');
  if (cached) return cached;
  saveData('vintage_sealed', MOCK_VINTAGE_SEALED);
  return MOCK_VINTAGE_SEALED;
}

export function getVintageSealedBySport(sport: string): VintageSealed[] {
  const vintage = getVintageSealed();
  return vintage.filter(v => v.sport === sport);
}

export function getROICalculations(): ROICalculation[] {
  const cached = loadData<ROICalculation[]>('roi_calculations');
  if (cached) return cached;
  saveData('roi_calculations', MOCK_ROI);
  return MOCK_ROI;
}

export function getTopROIProducts(limit: number = 10): ROICalculation[] {
  const roi = getROICalculations();
  return [...roi].sort((a, b) => b.totalROI - a.totalROI).slice(0, limit);
}

export function getTopAppreciatingSealed(limit: number = 10): SealedProduct[] {
  const products = getSealedProducts();
  return [...products].sort((a, b) => b.priceChange1y - a.priceChange1y).slice(0, limit);
}

export function getTopDepreciatingSealed(limit: number = 10): SealedProduct[] {
  const products = getSealedProducts();
  return [...products].filter(p => p.priceChange1y < 0).sort((a, b) => a.priceChange1y - b.priceChange1y).slice(0, limit);
}

export function getHighHypeReleases(): ProductRelease[] {
  const releases = getUpcomingReleases();
  return releases.filter(r => r.hypeLevel === 'high' || r.hypeLevel === 'extreme');
}

export function getAvailableProducts(): SealedProduct[] {
  const products = getSealedProducts();
  return products.filter(p => p.available);
}

export function getVintageByRarity(rarity: VintageSealed['rarity']): VintageSealed[] {
  const vintage = getVintageSealed();
  return vintage.filter(v => v.rarity === rarity);
}

// ---- Mock Data: Price Histories (25) ----

const MOCK_PRICE_HISTORIES: PriceHistory[] = [
  { id: 'ph-1', productId: 'sp-1', date: '2025-09-15', price: 450, volume: 120, source: 'eBay' },
  { id: 'ph-2', productId: 'sp-1', date: '2025-10-15', price: 465, volume: 98, source: 'eBay' },
  { id: 'ph-3', productId: 'sp-1', date: '2025-11-15', price: 480, volume: 85, source: 'eBay' },
  { id: 'ph-4', productId: 'sp-1', date: '2025-12-15', price: 490, volume: 110, source: 'eBay' },
  { id: 'ph-5', productId: 'sp-1', date: '2026-01-15', price: 495, volume: 92, source: 'eBay' },
  { id: 'ph-6', productId: 'sp-1', date: '2026-02-15', price: 510, volume: 105, source: 'eBay' },
  { id: 'ph-7', productId: 'sp-1', date: '2026-03-15', price: 520, volume: 88, source: 'eBay' },
  { id: 'ph-8', productId: 'sp-19', date: '2024-03-15', price: 1200, volume: 25, source: 'eBay' },
  { id: 'ph-9', productId: 'sp-19', date: '2024-06-15', price: 1350, volume: 20, source: 'eBay' },
  { id: 'ph-10', productId: 'sp-19', date: '2024-09-15', price: 1500, volume: 18, source: 'eBay' },
  { id: 'ph-11', productId: 'sp-19', date: '2024-12-15', price: 1650, volume: 15, source: 'eBay' },
  { id: 'ph-12', productId: 'sp-19', date: '2025-03-15', price: 1600, volume: 22, source: 'eBay' },
  { id: 'ph-13', productId: 'sp-19', date: '2025-06-15', price: 1700, volume: 18, source: 'eBay' },
  { id: 'ph-14', productId: 'sp-19', date: '2025-09-15', price: 1750, volume: 14, source: 'eBay' },
  { id: 'ph-15', productId: 'sp-19', date: '2025-12-15', price: 1780, volume: 12, source: 'eBay' },
  { id: 'ph-16', productId: 'sp-19', date: '2026-03-15', price: 1800, volume: 10, source: 'eBay' },
  { id: 'ph-17', productId: 'sp-3', date: '2025-03-15', price: 680, volume: 65, source: 'eBay' },
  { id: 'ph-18', productId: 'sp-3', date: '2025-06-15', price: 650, volume: 55, source: 'eBay' },
  { id: 'ph-19', productId: 'sp-3', date: '2025-09-15', price: 620, volume: 48, source: 'eBay' },
  { id: 'ph-20', productId: 'sp-3', date: '2025-12-15', price: 600, volume: 52, source: 'eBay' },
  { id: 'ph-21', productId: 'sp-3', date: '2026-03-15', price: 580, volume: 45, source: 'eBay' },
  { id: 'ph-22', productId: 'sp-31', date: '2025-01-15', price: 155, volume: 80, source: 'eBay' },
  { id: 'ph-23', productId: 'sp-31', date: '2025-04-15', price: 170, volume: 95, source: 'eBay' },
  { id: 'ph-24', productId: 'sp-31', date: '2025-07-15', price: 190, volume: 110, source: 'eBay' },
  { id: 'ph-25', productId: 'sp-31', date: '2026-03-15', price: 220, volume: 88, source: 'eBay' },
];

// ---- Mock Data: Rip vs Hold Analysis (10) ----

const MOCK_RIP_VS_HOLD: RipVsHold[] = [
  { id: 'rvh-1', productId: 'sp-1', productName: '2023-24 Panini Prizm Basketball Hobby Box', sealedValue: 520, expectedRipValue: 380, ripValueHigh: 2500, ripValueLow: 85, ripValueMedian: 280, holdAdvantage: 36.8, ripOddsPositive: 22, keyHits: [{ card: 'Wembanyama Silver Prizm Auto', odds: '1:480', value: 8500 }, { card: 'Wembanyama Base RC PSA 10', odds: '1:12', value: 1800 }, { card: 'Random Silver Prizm', odds: '1:4', value: 120 }], verdict: 'hold', reasoning: 'Expected rip value is well below sealed price. Only 22% chance of breaking even. Hold sealed for appreciation.' },
  { id: 'rvh-2', productId: 'sp-4', productName: '2023-24 Panini National Treasures Basketball Hobby Box', sealedValue: 4800, expectedRipValue: 3200, ripValueHigh: 85000, ripValueLow: 400, ripValueMedian: 2200, holdAdvantage: 50.0, ripOddsPositive: 18, keyHits: [{ card: 'Wembanyama RPA /99', odds: '1:99', value: 45000 }, { card: 'Wembanyama Logoman 1/1', odds: '1:250', value: 250000 }, { card: 'Random RPA', odds: '1:4', value: 800 }], verdict: 'hold', reasoning: 'Ultra-premium product with massive sealed appreciation potential. Lottery ticket odds on ripping.' },
  { id: 'rvh-3', productId: 'sp-2', productName: '2024 Topps Chrome Baseball Hobby Box', sealedValue: 320, expectedRipValue: 290, ripValueHigh: 3500, ripValueLow: 65, ripValueMedian: 210, holdAdvantage: 10.3, ripOddsPositive: 35, keyHits: [{ card: 'Skenes Chrome Auto Refractor', odds: '1:288', value: 3500 }, { card: 'Paul Skenes Base RC', odds: '1:6', value: 62 }, { card: 'Random Auto', odds: '1:12', value: 150 }], verdict: 'toss_up', reasoning: 'Close to break-even on rip. Decent chase cards but sealed appreciation is modest. Personal preference call.' },
  { id: 'rvh-4', productId: 'sp-9', productName: '2023-24 Panini Prizm Basketball Blaster Box', sealedValue: 48, expectedRipValue: 35, ripValueHigh: 800, ripValueLow: 5, ripValueMedian: 18, holdAdvantage: 37.1, ripOddsPositive: 15, keyHits: [{ card: 'Wembanyama Base RC', odds: '1:24', value: 180 }, { card: 'Random Prizm Parallel', odds: '1:8', value: 25 }], verdict: 'hold', reasoning: 'Retail products rarely break even on rips. Sealed blasters appreciate as supply dries up.' },
  { id: 'rvh-5', productId: 'sp-6', productName: '2023-24 Upper Deck Series 1 Hockey Hobby Box', sealedValue: 180, expectedRipValue: 160, ripValueHigh: 2500, ripValueLow: 30, ripValueMedian: 110, holdAdvantage: 12.5, ripOddsPositive: 30, keyHits: [{ card: 'Connor Bedard Young Guns', odds: '1:6', value: 180 }, { card: 'Bedard Canvas YG', odds: '1:48', value: 450 }, { card: 'Random Young Guns', odds: '1:4', value: 25 }], verdict: 'toss_up', reasoning: 'Bedard YG odds are decent enough to consider ripping. But sealed appreciation has been strong.' },
  { id: 'rvh-6', productId: 'sp-3', productName: '2024 Panini Prizm Football Hobby Box', sealedValue: 580, expectedRipValue: 420, ripValueHigh: 5000, ripValueLow: 80, ripValueMedian: 310, holdAdvantage: 38.1, ripOddsPositive: 20, keyHits: [{ card: 'Caleb Williams Silver Prizm Auto', odds: '1:360', value: 4500 }, { card: 'Jayden Daniels RC', odds: '1:6', value: 95 }, { card: 'Random Auto', odds: '1:12', value: 100 }], verdict: 'hold', reasoning: 'Weak rookie class depressing rip values. Hold sealed and wait for class to develop.' },
  { id: 'rvh-7', productId: 'sp-31', productName: '2024 Panini Prizm WNBA Hobby Box', sealedValue: 220, expectedRipValue: 180, ripValueHigh: 3000, ripValueLow: 25, ripValueMedian: 120, holdAdvantage: 22.2, ripOddsPositive: 28, keyHits: [{ card: 'Caitlin Clark Silver Prizm Auto', odds: '1:240', value: 3000 }, { card: 'Clark Base RC PSA 10', odds: '1:8', value: 145 }, { card: 'Angel Reese Auto', odds: '1:48', value: 250 }], verdict: 'hold', reasoning: 'WNBA sealed product is appreciating rapidly. Low print run makes holding very attractive.' },
  { id: 'rvh-8', productId: 'sp-11', productName: '2025 Topps Series 1 Baseball Hobby Box', sealedValue: 145, expectedRipValue: 130, ripValueHigh: 2000, ripValueLow: 20, ripValueMedian: 85, holdAdvantage: 11.5, ripOddsPositive: 32, keyHits: [{ card: 'Ethan Salas RC Auto', odds: '1:576', value: 2000 }, { card: 'Bazzana Base RC', odds: '1:6', value: 42 }, { card: 'Random Auto', odds: '1:24', value: 80 }], verdict: 'toss_up', reasoning: 'Strong rookie class makes ripping fun. But sealed product has been appreciating well post-release.' },
  { id: 'rvh-9', productId: 'sp-30', productName: '2025 Panini Prizm Football Hobby Box', sealedValue: 710, expectedRipValue: 550, ripValueHigh: 8000, ripValueLow: 90, ripValueMedian: 380, holdAdvantage: 29.0, ripOddsPositive: 22, keyHits: [{ card: 'Travis Hunter Silver Prizm Auto', odds: '1:360', value: 6000 }, { card: 'Shedeur Sanders RC', odds: '1:6', value: 72 }, { card: 'Cam Ward Auto', odds: '1:48', value: 800 }], verdict: 'hold', reasoning: 'Hyped draft class but early sealed appreciation suggests hold. Let the class prove themselves first.' },
  { id: 'rvh-10', productId: 'sp-5', productName: '2024 Bowman Chrome Baseball Hobby Box', sealedValue: 380, expectedRipValue: 320, ripValueHigh: 5000, ripValueLow: 50, ripValueMedian: 220, holdAdvantage: 18.8, ripOddsPositive: 28, keyHits: [{ card: 'Salas 1st Bowman Chrome Auto', odds: '1:480', value: 5000 }, { card: 'Bazzana 1st Bowman Chrome', odds: '1:12', value: 30 }, { card: 'Random 1st Bowman Chrome Auto', odds: '1:24', value: 200 }], verdict: 'hold', reasoning: 'Prospect product appreciates well over time. Rip values are below sealed. Hold for long-term gains.' },
];

// ---- Mock Data: Break-Even Analyses (8) ----

const MOCK_BREAK_EVEN: BreakEvenAnalysis[] = [
  { id: 'be-1', productId: 'sp-1', productName: '2023-24 Panini Prizm Basketball Hobby Box', boxCost: 520, averageHitValue: 280, topHitValue: 8500, bottomHitValue: 15, hitsPerBox: 2, breakEvenOdds: 22, expectedReturn: -140, bestCaseReturn: 7980, worstCaseReturn: -490, verdict: 'unfavorable' },
  { id: 'be-2', productId: 'sp-2', productName: '2024 Topps Chrome Baseball Hobby Box', boxCost: 320, averageHitValue: 150, topHitValue: 3500, bottomHitValue: 10, hitsPerBox: 2, breakEvenOdds: 35, expectedReturn: -20, bestCaseReturn: 3180, worstCaseReturn: -300, verdict: 'neutral' },
  { id: 'be-3', productId: 'sp-4', productName: '2023-24 Panini National Treasures Basketball', boxCost: 4800, averageHitValue: 3200, topHitValue: 250000, bottomHitValue: 200, hitsPerBox: 8, breakEvenOdds: 18, expectedReturn: -1600, bestCaseReturn: 245200, worstCaseReturn: -4400, verdict: 'unfavorable' },
  { id: 'be-4', productId: 'sp-6', productName: '2023-24 Upper Deck Series 1 Hockey', boxCost: 180, averageHitValue: 80, topHitValue: 2500, bottomHitValue: 5, hitsPerBox: 1, breakEvenOdds: 30, expectedReturn: -100, bestCaseReturn: 2320, worstCaseReturn: -175, verdict: 'unfavorable' },
  { id: 'be-5', productId: 'sp-11', productName: '2025 Topps Series 1 Baseball', boxCost: 145, averageHitValue: 65, topHitValue: 2000, bottomHitValue: 5, hitsPerBox: 1, breakEvenOdds: 32, expectedReturn: -80, bestCaseReturn: 1855, worstCaseReturn: -140, verdict: 'unfavorable' },
  { id: 'be-6', productId: 'sp-31', productName: '2024 Panini Prizm WNBA', boxCost: 220, averageHitValue: 90, topHitValue: 3000, bottomHitValue: 10, hitsPerBox: 2, breakEvenOdds: 28, expectedReturn: -40, bestCaseReturn: 2780, worstCaseReturn: -200, verdict: 'neutral' },
  { id: 'be-7', productId: 'sp-30', productName: '2025 Panini Prizm Football', boxCost: 710, averageHitValue: 275, topHitValue: 8000, bottomHitValue: 20, hitsPerBox: 2, breakEvenOdds: 22, expectedReturn: -160, bestCaseReturn: 7290, worstCaseReturn: -670, verdict: 'unfavorable' },
  { id: 'be-8', productId: 'sp-5', productName: '2024 Bowman Chrome Baseball', boxCost: 380, averageHitValue: 160, topHitValue: 5000, bottomHitValue: 15, hitsPerBox: 2, breakEvenOdds: 28, expectedReturn: -60, bestCaseReturn: 4620, worstCaseReturn: -350, verdict: 'neutral' },
];

// ---- Mock Data: Supply Estimates (10) ----

const MOCK_SUPPLY_ESTIMATES: SupplyEstimate[] = [
  { id: 'se-1', productId: 'sp-1', productName: '2023-24 Panini Prizm Basketball Hobby Box', estimatedTotal: 85000, estimatedRemaining: 42000, percentOpened: 50.6, scarcityRating: 'common', yearsSinceRelease: 1.5, annualDepletion: 28667 },
  { id: 'se-2', productId: 'sp-19', productName: '2018-19 Panini Prizm Basketball Hobby Box', estimatedTotal: 50000, estimatedRemaining: 5000, percentOpened: 90.0, scarcityRating: 'scarce', yearsSinceRelease: 6.5, annualDepletion: 6923 },
  { id: 'se-3', productId: 'sp-20', productName: '2003-04 Topps Chrome Basketball Hobby Box', estimatedTotal: 25000, estimatedRemaining: 500, percentOpened: 98.0, scarcityRating: 'extremely_rare', yearsSinceRelease: 22, annualDepletion: 1114 },
  { id: 'se-4', productId: 'sp-4', productName: '2023-24 Panini National Treasures Basketball', estimatedTotal: 8000, estimatedRemaining: 3500, percentOpened: 56.3, scarcityRating: 'moderate', yearsSinceRelease: 1.3, annualDepletion: 3462 },
  { id: 'se-5', productId: 'sp-21', productName: '2017 Panini Prizm Football Hobby Box', estimatedTotal: 40000, estimatedRemaining: 4500, percentOpened: 88.8, scarcityRating: 'scarce', yearsSinceRelease: 8, annualDepletion: 4438 },
  { id: 'se-6', productId: 'sp-6', productName: '2023-24 Upper Deck Series 1 Hockey Hobby Box', estimatedTotal: 60000, estimatedRemaining: 25000, percentOpened: 58.3, scarcityRating: 'common', yearsSinceRelease: 2.4, annualDepletion: 14583 },
  { id: 'se-7', productId: 'sp-31', productName: '2024 Panini Prizm WNBA Hobby Box', estimatedTotal: 30000, estimatedRemaining: 12000, percentOpened: 60.0, scarcityRating: 'moderate', yearsSinceRelease: 1.2, annualDepletion: 15000 },
  { id: 'se-8', productId: 'sp-28', productName: '2019-20 Panini Prizm Basketball Hobby Box', estimatedTotal: 70000, estimatedRemaining: 8000, percentOpened: 88.6, scarcityRating: 'scarce', yearsSinceRelease: 5.5, annualDepletion: 11273 },
  { id: 'se-9', productId: 'sp-3', productName: '2024 Panini Prizm Football Hobby Box', estimatedTotal: 95000, estimatedRemaining: 55000, percentOpened: 42.1, scarcityRating: 'abundant', yearsSinceRelease: 1.1, annualDepletion: 36364 },
  { id: 'se-10', productId: 'sp-5', productName: '2024 Bowman Chrome Baseball Hobby Box', estimatedTotal: 100000, estimatedRemaining: 48000, percentOpened: 52.0, scarcityRating: 'common', yearsSinceRelease: 1.4, annualDepletion: 37143 },
];

// ---- Additional Service Functions ----

export function getPriceHistories(): PriceHistory[] {
  const cached = loadData<PriceHistory[]>('price_histories');
  if (cached) return cached;
  saveData('price_histories', MOCK_PRICE_HISTORIES);
  return MOCK_PRICE_HISTORIES;
}

export function getPriceHistoryByProduct(productId: string): PriceHistory[] {
  const histories = getPriceHistories();
  return histories.filter(h => h.productId === productId);
}

export function getRipVsHoldAnalyses(): RipVsHold[] {
  const cached = loadData<RipVsHold[]>('rip_vs_hold');
  if (cached) return cached;
  saveData('rip_vs_hold', MOCK_RIP_VS_HOLD);
  return MOCK_RIP_VS_HOLD;
}

export function getRipVsHoldByProduct(productId: string): RipVsHold | undefined {
  const analyses = getRipVsHoldAnalyses();
  return analyses.find(a => a.productId === productId);
}

export function getBreakEvenAnalyses(): BreakEvenAnalysis[] {
  const cached = loadData<BreakEvenAnalysis[]>('break_even');
  if (cached) return cached;
  saveData('break_even', MOCK_BREAK_EVEN);
  return MOCK_BREAK_EVEN;
}

export function getBreakEvenByProduct(productId: string): BreakEvenAnalysis | undefined {
  const analyses = getBreakEvenAnalyses();
  return analyses.find(a => a.productId === productId);
}

export function getSupplyEstimates(): SupplyEstimate[] {
  const cached = loadData<SupplyEstimate[]>('supply_estimates');
  if (cached) return cached;
  saveData('supply_estimates', MOCK_SUPPLY_ESTIMATES);
  return MOCK_SUPPLY_ESTIMATES;
}

export function getScarcestProducts(): SupplyEstimate[] {
  const estimates = getSupplyEstimates();
  return [...estimates].sort((a, b) => a.estimatedRemaining - b.estimatedRemaining);
}

export function getProductComparison(idA: string, idB: string): ProductComparison | null {
  const a = getSealedProductById(idA);
  const b = getSealedProductById(idB);
  if (!a || !b) return null;
  return {
    id: `cmp-${idA}-${idB}`,
    productAId: idA,
    productBId: idB,
    productAName: a.name,
    productBName: b.name,
    priceAdvantage: a.currentPrice < b.currentPrice ? a.name : b.name,
    roiAdvantage: a.priceChange1y > b.priceChange1y ? a.name : b.name,
    rookieAdvantage: a.keyRookies.length >= b.keyRookies.length ? a.name : b.name,
    scarcityAdvantage: (a.estimatedPrintRun || Infinity) < (b.estimatedPrintRun || Infinity) ? a.name : b.name,
    overallWinner: a.rating > b.rating ? a.name : b.name,
    reasoning: `Based on rating, ROI trajectory, and key rookie content comparison.`,
  };
}

// ---- Adapter types and functions for SealedProduct page (Phase 156) ----

export interface PriceTrend {
  date: string;
  hobbyBox: number;
  retailBox: number;
  blaster: number;
}

export interface RoiByType {
  productType: string;
  avgRoi: number;
  totalVolume: number;
}

export interface VintageItem {
  name: string;
  year: number;
  sport: string;
  currentValue: number;
  estimatedRemaining: number;
}

export interface BreakEvenEntry {
  productName: string;
  cost: number;
  breakEvenValue: number;
  hitNeeded: string;
}

export interface ProductTypeDistribution {
  type: string;
  count: number;
}

export interface UpcomingRelease {
  name: string;
  sport: string;
  manufacturer: string;
  releaseDate: string;
  hobbyBoxPrice: number;
  hypeLevel: number;
}

export function getPriceTrends(): PriceTrend[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    date: `${m} '25`,
    hobbyBox: 180 + Math.round(Math.sin(i * 0.5) * 30 + i * 5),
    retailBox: 95 + Math.round(Math.sin(i * 0.7) * 15 + i * 2),
    blaster: 38 + Math.round(Math.sin(i * 0.3) * 8 + i * 1),
  }));
}

export function getRipVsHoldAnalysis(): (RipVsHold & { year: number; ripEV: number; holdValue: number; recommendation: string })[] {
  return getRipVsHoldAnalyses().map(r => ({
    ...r,
    year: 2024,
    ripEV: r.expectedRipValue,
    holdValue: r.sealedValue,
    recommendation: r.verdict === 'hold' ? 'Hold' : r.verdict === 'rip' ? 'Rip' : 'Toss-up',
  }));
}

export function getRoiByProductType(): RoiByType[] {
  const products = getSealedProducts();
  const typeMap = new Map<string, { total: number; count: number }>();
  for (const p of products) {
    const existing = typeMap.get(p.productType) || { total: 0, count: 0 };
    existing.total += p.priceChange1y;
    existing.count += 1;
    typeMap.set(p.productType, existing);
  }
  return Array.from(typeMap.entries()).map(([type, data]) => ({
    productType: type,
    avgRoi: Math.round(data.total / data.count * 10) / 10,
    totalVolume: data.count * 150,
  }));
}

export function getVintageShowcase(): VintageItem[] {
  return getVintageSealed().map((v, i) => ({
    name: v.name,
    year: v.year,
    sport: v.sport,
    currentValue: v.currentPrice,
    estimatedRemaining: Math.max(10, 500 - i * 80),
  }));
}

export function getBreakEvenAnalysis(): BreakEvenEntry[] {
  return getBreakEvenAnalyses().map(b => ({
    productName: b.productName,
    cost: b.boxCost,
    breakEvenValue: Math.round(b.boxCost / (b.breakEvenOdds / 100)),
    hitNeeded: `1 in ${Math.round(1 / (b.breakEvenOdds / 100))}`,
  }));
}

export function getProductTypeDistribution(): ProductTypeDistribution[] {
  const products = getSealedProducts();
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.productType] = (counts[p.productType] || 0) + 1;
  }
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

// ---- Widget API Functions ----

export function getRoiMetrics(): { totalValue: number; avgRoi: number; bestRoi: number } {
  const products = getSealedProducts();
  const totalValue = products.reduce((sum, p) => sum + p.currentPrice, 0);
  const avgRoi = products.length > 0
    ? Math.round(products.reduce((sum, p) => sum + p.priceChange1y, 0) / products.length * 10) / 10
    : 0;
  const bestRoi = products.length > 0 ? Math.max(...products.map(p => p.priceChange1y)) : 0;
  return { totalValue, avgRoi, bestRoi };
}

export function getBestHolds(): { id: string; productName: string; roiPercent: number; currentPrice: number }[] {
  return getSealedProducts()
    .map(p => ({
      id: p.id,
      productName: p.name,
      roiPercent: p.priceChange1y,
      currentPrice: p.currentPrice,
    }))
    .sort((a, b) => b.roiPercent - a.roiPercent);
}

export function getNewReleases(): { id: string; name: string; releaseDate: string; price: number; status: 'upcoming' | 'released' }[] {
  const now = new Date();
  return getSealedProducts()
    .filter(p => {
      const releaseDate = new Date(p.releaseDate);
      const diffMs = now.getTime() - releaseDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays < 180;
    })
    .map(p => ({
      id: p.id,
      name: p.name,
      releaseDate: p.releaseDate,
      price: p.currentPrice,
      status: (new Date(p.releaseDate) > now ? 'upcoming' : 'released') as 'upcoming' | 'released',
    }))
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}
