// Phase 156 – Wax & Sealed Product Investment Tracker Service

// ---- Types ----

export type ProductType = 'hobby_box' | 'retail_box' | 'blaster' | 'mega_box' | 'case' | 'pack' | 'cello' | 'fat_pack';

export interface SealedProduct {
  id: string;
  name: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer' | 'multi';
  year: number;
  brand: string;
  productType: ProductType;
  releasePrice: number;
  currentPrice: number;
  allTimeHigh: number;
  allTimeLow: number;
  estimatedSupply: number;
  sealed: boolean;
  description: string;
}

export interface PriceHistory {
  productId: string;
  date: string;
  price: number;
}

export interface ROICalculation {
  productId: string;
  productName: string;
  purchasePrice: number;
  currentPrice: number;
  roi: number;
  annualizedROI: number;
  holdingYears: number;
  totalReturn: number;
}

export interface RipVsHold {
  productId: string;
  productName: string;
  sealedValue: number;
  expectedRipValue: number;
  hitRate: number;
  avgHitValue: number;
  avgBaseValue: number;
  cardsPerBox: number;
  hitsPerBox: number;
  recommendation: 'rip' | 'hold' | 'neutral';
  confidence: number;
  reasoning: string;
}

export interface ProductRelease {
  id: string;
  name: string;
  sport: string;
  brand: string;
  releaseDate: string;
  estimatedHobbyPrice: number;
  productType: ProductType;
  keyRookies: string[];
  hype: 'low' | 'medium' | 'high' | 'extreme';
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  changePercent: number;
  period: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
}

export interface SupplyEstimate {
  productId: string;
  productName: string;
  totalProduced: number;
  estimatedSealed: number;
  sealedPercentage: number;
  yearlyDeclineRate: number;
  scarcityRating: 'common' | 'uncommon' | 'scarce' | 'rare' | 'ultra_rare';
}

export interface BreakEvenAnalysis {
  productId: string;
  productName: string;
  boxCost: number;
  avgCardValue: number;
  cardsNeeded: number;
  probabilityBreakEven: number;
  topHitNeeded: number;
  recommendation: string;
}

export interface VintageSealed {
  id: string;
  name: string;
  sport: string;
  year: number;
  productType: ProductType;
  currentPrice: number;
  priceOneYearAgo: number;
  priceFiveYearsAgo: number;
  estimatedRemaining: number;
  keyCards: string[];
  investmentGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
}

export interface InvestmentRating {
  productId: string;
  productName: string;
  overallRating: number;
  supplyScore: number;
  demandScore: number;
  rookieScore: number;
  brandScore: number;
  valueScore: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export interface ProductComparison {
  productAId: string;
  productBId: string;
  productAName: string;
  productBName: string;
  priceRatio: number;
  roiComparison: number;
  supplyComparison: string;
  winner: 'A' | 'B' | 'tie';
  reasoning: string;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_sealed_product';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ---- Format Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

// ---- Mock Data ----

const SEALED_PRODUCTS: SealedProduct[] = [
  { id: 'sp_001', name: '2024 Topps Chrome Baseball Hobby Box', sport: 'baseball', year: 2024, brand: 'Topps', productType: 'hobby_box', releasePrice: 250, currentPrice: 310, allTimeHigh: 380, allTimeLow: 230, estimatedSupply: 85000, sealed: true, description: 'Flagship chrome hobby with 2 autos per box. Strong rookie class.' },
  { id: 'sp_002', name: '2024 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2024, brand: 'Panini', productType: 'hobby_box', releasePrice: 1200, currentPrice: 1450, allTimeHigh: 1800, allTimeLow: 1100, estimatedSupply: 42000, sealed: true, description: 'Premium NBA hobby with 2 autos and 10 silvers. Loaded rookie class.' },
  { id: 'sp_003', name: '2024 Panini Prizm NFL Hobby Box', sport: 'football', year: 2024, brand: 'Panini', productType: 'hobby_box', releasePrice: 800, currentPrice: 750, allTimeHigh: 950, allTimeLow: 680, estimatedSupply: 55000, sealed: true, description: 'NFL flagship with Caleb Williams, Jayden Daniels RC class.' },
  { id: 'sp_004', name: '2024 Topps Series 1 Baseball Hobby Box', sport: 'baseball', year: 2024, brand: 'Topps', productType: 'hobby_box', releasePrice: 90, currentPrice: 105, allTimeHigh: 130, allTimeLow: 85, estimatedSupply: 150000, sealed: true, description: 'Flagship Topps with SP variations and autos.' },
  { id: 'sp_005', name: '2024 Bowman Chrome Baseball Hobby Box', sport: 'baseball', year: 2024, brand: 'Bowman', productType: 'hobby_box', releasePrice: 275, currentPrice: 350, allTimeHigh: 420, allTimeLow: 260, estimatedSupply: 60000, sealed: true, description: 'Top prospect 1st Bowman Chrome autos. Key product for prospect investors.' },
  { id: 'sp_006', name: '2024 Select NFL Hobby Box', sport: 'football', year: 2024, brand: 'Panini', productType: 'hobby_box', releasePrice: 550, currentPrice: 480, allTimeHigh: 620, allTimeLow: 420, estimatedSupply: 48000, sealed: true, description: 'Tiered design with die-cuts and prizm parallels.' },
  { id: 'sp_007', name: '2024 Topps Chrome Baseball Blaster Box', sport: 'baseball', year: 2024, brand: 'Topps', productType: 'blaster', releasePrice: 40, currentPrice: 55, allTimeHigh: 65, allTimeLow: 35, estimatedSupply: 350000, sealed: true, description: 'Retail blaster with exclusive refractors.' },
  { id: 'sp_008', name: '2024 Panini Prizm NBA Retail Box', sport: 'basketball', year: 2024, brand: 'Panini', productType: 'retail_box', releasePrice: 130, currentPrice: 165, allTimeHigh: 200, allTimeLow: 120, estimatedSupply: 120000, sealed: true, description: 'Retail 24-pack box with silver prizm inserts.' },
  { id: 'sp_009', name: '2024 Donruss Optic NFL Hobby Box', sport: 'football', year: 2024, brand: 'Panini', productType: 'hobby_box', releasePrice: 450, currentPrice: 420, allTimeHigh: 500, allTimeLow: 380, estimatedSupply: 52000, sealed: true, description: 'Optic parallels with Rated Rookies.' },
  { id: 'sp_010', name: '2024 Topps Heritage Baseball Hobby Box', sport: 'baseball', year: 2024, brand: 'Topps', productType: 'hobby_box', releasePrice: 110, currentPrice: 95, allTimeHigh: 125, allTimeLow: 85, estimatedSupply: 80000, sealed: true, description: 'Retro design with real one autos and relics.' },
  { id: 'sp_011', name: '2023 Topps Chrome Baseball Hobby Case (12 boxes)', sport: 'baseball', year: 2023, brand: 'Topps', productType: 'case', releasePrice: 2700, currentPrice: 3800, allTimeHigh: 4200, allTimeLow: 2600, estimatedSupply: 8000, sealed: true, description: 'Full case of 2023 Chrome. Elly De La Cruz RC year.' },
  { id: 'sp_012', name: '2023 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2023, brand: 'Panini', productType: 'hobby_box', releasePrice: 1100, currentPrice: 1800, allTimeHigh: 2200, allTimeLow: 1050, estimatedSupply: 35000, sealed: true, description: 'Wembanyama RC class. Most anticipated NBA product in years.' },
  { id: 'sp_013', name: '2022 Bowman Chrome Baseball Hobby Box', sport: 'baseball', year: 2022, brand: 'Bowman', productType: 'hobby_box', releasePrice: 220, currentPrice: 280, allTimeHigh: 340, allTimeLow: 200, estimatedSupply: 50000, sealed: true, description: 'Strong prospect class with 1st Bowman Chrome autos.' },
  { id: 'sp_014', name: '2022 Topps Chrome Baseball Hobby Case (12 boxes)', sport: 'baseball', year: 2022, brand: 'Topps', productType: 'case', releasePrice: 2400, currentPrice: 3200, allTimeHigh: 3500, allTimeLow: 2300, estimatedSupply: 7500, sealed: true, description: 'Full case with Julio Rodriguez Chrome RC autos.' },
  { id: 'sp_015', name: '2021 Panini Prizm NFL Hobby Box', sport: 'football', year: 2021, brand: 'Panini', productType: 'hobby_box', releasePrice: 600, currentPrice: 850, allTimeHigh: 1100, allTimeLow: 550, estimatedSupply: 38000, sealed: true, description: 'Trevor Lawrence, Mac Jones RC class.' },
  { id: 'sp_016', name: '2020 Panini Prizm NFL Hobby Box', sport: 'football', year: 2020, brand: 'Panini', productType: 'hobby_box', releasePrice: 550, currentPrice: 4500, allTimeHigh: 6200, allTimeLow: 500, estimatedSupply: 12000, sealed: true, description: 'Joe Burrow, Justin Herbert RC class. Legendary product.' },
  { id: 'sp_017', name: '2020 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2020, brand: 'Panini', productType: 'hobby_box', releasePrice: 750, currentPrice: 3200, allTimeHigh: 5500, allTimeLow: 700, estimatedSupply: 15000, sealed: true, description: 'Ja Morant, Zion Williamson RC class.' },
  { id: 'sp_018', name: '2019 Topps Chrome Baseball Hobby Box', sport: 'baseball', year: 2019, brand: 'Topps', productType: 'hobby_box', releasePrice: 200, currentPrice: 450, allTimeHigh: 580, allTimeLow: 180, estimatedSupply: 28000, sealed: true, description: 'Fernando Tatis Jr., Vlad Jr. RC class.' },
  { id: 'sp_019', name: '2018 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2018, brand: 'Panini', productType: 'hobby_box', releasePrice: 500, currentPrice: 8500, allTimeHigh: 12000, allTimeLow: 450, estimatedSupply: 8000, sealed: true, description: 'Luka Doncic, Trae Young RC class. Iconic product.' },
  { id: 'sp_020', name: '2017 Panini Prizm NFL Hobby Box', sport: 'football', year: 2017, brand: 'Panini', productType: 'hobby_box', releasePrice: 300, currentPrice: 5800, allTimeHigh: 7500, allTimeLow: 280, estimatedSupply: 10000, sealed: true, description: 'Patrick Mahomes RC class. Gold standard product.' },
  { id: 'sp_021', name: '2024 Panini Prizm NFL Mega Box', sport: 'football', year: 2024, brand: 'Panini', productType: 'mega_box', releasePrice: 70, currentPrice: 85, allTimeHigh: 100, allTimeLow: 60, estimatedSupply: 200000, sealed: true, description: 'Retail mega with exclusive neon green prizms.' },
  { id: 'sp_022', name: '2024 Topps Chrome Baseball Fat Pack Box', sport: 'baseball', year: 2024, brand: 'Topps', productType: 'fat_pack', releasePrice: 60, currentPrice: 72, allTimeHigh: 80, allTimeLow: 55, estimatedSupply: 180000, sealed: true, description: 'Fat pack box with exclusive pink refractors.' },
  { id: 'sp_023', name: '2024 Upper Deck Series 1 NHL Hobby Box', sport: 'hockey', year: 2024, brand: 'Upper Deck', productType: 'hobby_box', releasePrice: 110, currentPrice: 130, allTimeHigh: 150, allTimeLow: 100, estimatedSupply: 45000, sealed: true, description: 'Young Guns rookies and Canvas inserts.' },
  { id: 'sp_024', name: '2024 Topps Chrome UEFA Champions League Hobby Box', sport: 'soccer', year: 2024, brand: 'Topps', productType: 'hobby_box', releasePrice: 200, currentPrice: 240, allTimeHigh: 280, allTimeLow: 190, estimatedSupply: 35000, sealed: true, description: 'UCL chrome autos with global appeal.' },
  { id: 'sp_025', name: '2023 Bowman Chrome Baseball Hobby Case (12 boxes)', sport: 'baseball', year: 2023, brand: 'Bowman', productType: 'case', releasePrice: 3000, currentPrice: 4200, allTimeHigh: 4800, allTimeLow: 2900, estimatedSupply: 6000, sealed: true, description: 'Full case of prospect-heavy Bowman Chrome.' },
  { id: 'sp_026', name: '2025 Topps Series 1 Baseball Hobby Box', sport: 'baseball', year: 2025, brand: 'Topps', productType: 'hobby_box', releasePrice: 95, currentPrice: 120, allTimeHigh: 145, allTimeLow: 90, estimatedSupply: 160000, sealed: true, description: 'Roki Sasaki SP RC. First Fanatics-era Topps flagship.' },
  { id: 'sp_027', name: '2025 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2025, brand: 'Panini', productType: 'hobby_box', releasePrice: 1300, currentPrice: 1550, allTimeHigh: 1700, allTimeLow: 1250, estimatedSupply: 40000, sealed: true, description: 'Cooper Flagg, Ace Bailey RC class.' },
  { id: 'sp_028', name: '2025 Panini Prizm NFL Hobby Box', sport: 'football', year: 2025, brand: 'Panini', productType: 'hobby_box', releasePrice: 850, currentPrice: 920, allTimeHigh: 1050, allTimeLow: 820, estimatedSupply: 50000, sealed: true, description: 'Shedeur Sanders, Travis Hunter RC class.' },
  { id: 'sp_029', name: '2024 Panini Prizm NBA Cello Pack (12 cards)', sport: 'basketball', year: 2024, brand: 'Panini', productType: 'cello', releasePrice: 12, currentPrice: 18, allTimeHigh: 22, allTimeLow: 10, estimatedSupply: 500000, sealed: true, description: 'Retail cello packs with silver prizm chance.' },
  { id: 'sp_030', name: '2024 Bowman Baseball Mega Box', sport: 'baseball', year: 2024, brand: 'Bowman', productType: 'mega_box', releasePrice: 50, currentPrice: 68, allTimeHigh: 75, allTimeLow: 45, estimatedSupply: 175000, sealed: true, description: 'Mega box with exclusive mojo refractors.' },
  { id: 'sp_031', name: '2023 Topps Chrome Baseball Hobby Box', sport: 'baseball', year: 2023, brand: 'Topps', productType: 'hobby_box', releasePrice: 240, currentPrice: 340, allTimeHigh: 400, allTimeLow: 225, estimatedSupply: 70000, sealed: true, description: 'Elly De La Cruz, Corbin Carroll Chrome RC autos.' },
  { id: 'sp_032', name: '2022 Panini Prizm NBA Hobby Box', sport: 'basketball', year: 2022, brand: 'Panini', productType: 'hobby_box', releasePrice: 950, currentPrice: 1100, allTimeHigh: 1400, allTimeLow: 850, estimatedSupply: 32000, sealed: true, description: 'Paolo Banchero, Chet Holmgren RC class.' },
  { id: 'sp_033', name: '2021 Topps Chrome Baseball Hobby Box', sport: 'baseball', year: 2021, brand: 'Topps', productType: 'hobby_box', releasePrice: 210, currentPrice: 380, allTimeHigh: 550, allTimeLow: 190, estimatedSupply: 55000, sealed: true, description: 'Julio Rodriguez prospect era Chrome.' },
  { id: 'sp_034', name: '2019 Panini Prizm NFL Hobby Box', sport: 'football', year: 2019, brand: 'Panini', productType: 'hobby_box', releasePrice: 400, currentPrice: 1200, allTimeHigh: 1600, allTimeLow: 380, estimatedSupply: 22000, sealed: true, description: 'Kyler Murray, Josh Allen 2nd year class.' },
  { id: 'sp_035', name: '2024 Panini National Treasures NBA Hobby Box', sport: 'basketball', year: 2024, brand: 'Panini', productType: 'hobby_box', releasePrice: 4200, currentPrice: 4800, allTimeHigh: 5500, allTimeLow: 4000, estimatedSupply: 5000, sealed: true, description: 'Ultra-premium with RPA cards and patch autos.' },
  { id: 'sp_036', name: '2024 Topps Bowman Chrome University Football Hobby Box', sport: 'football', year: 2024, brand: 'Bowman', productType: 'hobby_box', releasePrice: 180, currentPrice: 210, allTimeHigh: 250, allTimeLow: 170, estimatedSupply: 65000, sealed: true, description: 'College football prospect autos.' },
  { id: 'sp_037', name: '2023 Panini Prizm NFL Hobby Box', sport: 'football', year: 2023, brand: 'Panini', productType: 'hobby_box', releasePrice: 750, currentPrice: 680, allTimeHigh: 850, allTimeLow: 620, estimatedSupply: 45000, sealed: true, description: 'CJ Stroud, Bryce Young RC class.' },
  { id: 'sp_038', name: '2025 Topps Chrome Baseball Hobby Box', sport: 'baseball', year: 2025, brand: 'Topps', productType: 'hobby_box', releasePrice: 265, currentPrice: 290, allTimeHigh: 310, allTimeLow: 255, estimatedSupply: 80000, sealed: true, description: 'Roki Sasaki Chrome RC autos. Highly anticipated.' },
  { id: 'sp_039', name: '2025 Bowman Chrome Baseball Hobby Box', sport: 'baseball', year: 2025, brand: 'Bowman', productType: 'hobby_box', releasePrice: 290, currentPrice: 315, allTimeHigh: 340, allTimeLow: 280, estimatedSupply: 58000, sealed: true, description: 'Next-gen prospect 1st Bowman Chrome autos.' },
  { id: 'sp_040', name: '2024 Panini Prizm NBA Hobby Case (12 boxes)', sport: 'basketball', year: 2024, brand: 'Panini', productType: 'case', releasePrice: 13200, currentPrice: 16500, allTimeHigh: 19000, allTimeLow: 12800, estimatedSupply: 3500, sealed: true, description: 'Full case guarantees multiple premium hits.' },
];

function generatePriceHistory(): PriceHistory[] {
  const history: PriceHistory[] = [];

  SEALED_PRODUCTS.forEach(product => {
    const yearsBack = Math.min(2026 - product.year, 5);
    const startDate = new Date(`${2026 - yearsBack}-01-01`);
    const endDate = new Date('2026-03-15');
    const startPrice = product.releasePrice;
    const endPrice = product.currentPrice;
    const totalMonths = Math.round((endDate.getTime() - startDate.getTime()) / (30 * 24 * 3600000));

    for (let m = 0; m <= totalMonths; m++) {
      const date = new Date(startDate.getTime() + m * 30 * 24 * 3600000);
      if (date > endDate) break;

      const progress = m / Math.max(1, totalMonths);
      const basePrice = startPrice + (endPrice - startPrice) * progress;
      const seed = (product.id.charCodeAt(3) * 17 + m * 13) % 100;
      const variance = (seed - 50) / 50 * basePrice * 0.08;
      const price = Math.max(basePrice * 0.7, Math.round((basePrice + variance) * 100) / 100);

      history.push({
        productId: product.id,
        date: date.toISOString().split('T')[0],
        price,
      });
    }
  });

  return history;
}

const PRICE_HISTORY = generatePriceHistory();

const RIP_VS_HOLD: RipVsHold[] = [
  { productId: 'sp_001', productName: '2024 Topps Chrome Baseball Hobby Box', sealedValue: 310, expectedRipValue: 195, hitRate: 8.3, avgHitValue: 45, avgBaseValue: 0.50, cardsPerBox: 24, hitsPerBox: 2, recommendation: 'hold', confidence: 78, reasoning: 'Sealed premium is significant. Expected rip value averages well below sealed price. Hold for long-term appreciation.' },
  { productId: 'sp_002', productName: '2024 Panini Prizm NBA Hobby Box', sealedValue: 1450, expectedRipValue: 980, hitRate: 5.5, avgHitValue: 120, avgBaseValue: 2.50, cardsPerBox: 144, hitsPerBox: 2, recommendation: 'hold', confidence: 85, reasoning: 'Premium NBA product with strong sealed demand. Ripping destroys significant value. Hold sealed.' },
  { productId: 'sp_003', productName: '2024 Panini Prizm NFL Hobby Box', sealedValue: 750, expectedRipValue: 820, hitRate: 6.2, avgHitValue: 95, avgBaseValue: 1.80, cardsPerBox: 144, hitsPerBox: 2, recommendation: 'rip', confidence: 62, reasoning: 'Currently below release price with decent EV. Worth ripping if seeking specific rookies.' },
  { productId: 'sp_005', productName: '2024 Bowman Chrome Baseball Hobby Box', sealedValue: 350, expectedRipValue: 280, hitRate: 7.5, avgHitValue: 65, avgBaseValue: 0.75, cardsPerBox: 18, hitsPerBox: 2, recommendation: 'hold', confidence: 72, reasoning: 'Bowman Chrome holds sealed value well historically. Prospect autos drive long-term growth.' },
  { productId: 'sp_012', productName: '2023 Panini Prizm NBA Hobby Box', sealedValue: 1800, expectedRipValue: 1200, hitRate: 4.8, avgHitValue: 180, avgBaseValue: 3.50, cardsPerBox: 144, hitsPerBox: 2, recommendation: 'hold', confidence: 92, reasoning: 'Wembanyama RC class. Sealed is king. Never rip this product — hold for 5-10 years.' },
  { productId: 'sp_016', productName: '2020 Panini Prizm NFL Hobby Box', sealedValue: 4500, expectedRipValue: 2800, hitRate: 3.5, avgHitValue: 350, avgBaseValue: 5.00, cardsPerBox: 144, hitsPerBox: 2, recommendation: 'hold', confidence: 95, reasoning: 'Herbert/Burrow class is legendary. $4500 sealed is a fraction of potential. Never rip.' },
  { productId: 'sp_019', productName: '2018 Panini Prizm NBA Hobby Box', sealedValue: 8500, expectedRipValue: 5200, hitRate: 2.8, avgHitValue: 650, avgBaseValue: 8.00, cardsPerBox: 144, hitsPerBox: 2, recommendation: 'hold', confidence: 98, reasoning: 'Luka Doncic class. Ultra-premium sealed product. Sealed value will continue to climb.' },
  { productId: 'sp_026', productName: '2025 Topps Series 1 Baseball Hobby Box', sealedValue: 120, expectedRipValue: 130, hitRate: 12.0, avgHitValue: 25, avgBaseValue: 0.30, cardsPerBox: 24, hitsPerBox: 1, recommendation: 'rip', confidence: 58, reasoning: 'Close to release price with Sasaki SP chase. Ripping is viable for the experience.' },
  { productId: 'sp_007', productName: '2024 Topps Chrome Baseball Blaster Box', sealedValue: 55, expectedRipValue: 35, hitRate: 15.0, avgHitValue: 8, avgBaseValue: 0.25, cardsPerBox: 8, hitsPerBox: 0, recommendation: 'hold', confidence: 65, reasoning: 'Small retail box but sealed blasters appreciate. Better as sealed investment.' },
  { productId: 'sp_035', productName: '2024 Panini National Treasures NBA Hobby Box', sealedValue: 4800, expectedRipValue: 5200, hitRate: 100, avgHitValue: 650, avgBaseValue: 0, cardsPerBox: 8, hitsPerBox: 8, recommendation: 'rip', confidence: 70, reasoning: 'All hits product. EV slightly favors ripping due to RPA chase. High variance but positive EV.' },
];

const PRODUCT_RELEASES: ProductRelease[] = [
  { id: 'pr_001', name: '2025 Topps Chrome Baseball Hobby', sport: 'Baseball', brand: 'Topps', releaseDate: '2025-09-15', estimatedHobbyPrice: 265, productType: 'hobby_box', keyRookies: ['Roki Sasaki', 'Charlie Condon', 'Travis Bazzana'], hype: 'extreme' },
  { id: 'pr_002', name: '2025 Bowman Chrome Baseball Hobby', sport: 'Baseball', brand: 'Bowman', releaseDate: '2025-10-20', estimatedHobbyPrice: 290, productType: 'hobby_box', keyRookies: ['Konnor Griffin', 'Jac Caglianone', 'Braden Montgomery'], hype: 'high' },
  { id: 'pr_003', name: '2025 Panini Prizm NFL Hobby', sport: 'Football', brand: 'Panini', releaseDate: '2026-01-15', estimatedHobbyPrice: 850, productType: 'hobby_box', keyRookies: ['Shedeur Sanders', 'Travis Hunter', 'Cam Ward'], hype: 'extreme' },
  { id: 'pr_004', name: '2025 Panini Prizm NBA Hobby', sport: 'Basketball', brand: 'Panini', releaseDate: '2025-08-01', estimatedHobbyPrice: 1300, productType: 'hobby_box', keyRookies: ['Cooper Flagg', 'Ace Bailey', 'Dylan Harper'], hype: 'extreme' },
  { id: 'pr_005', name: '2026 Topps Series 1 Baseball Hobby', sport: 'Baseball', brand: 'Topps', releaseDate: '2026-02-05', estimatedHobbyPrice: 100, productType: 'hobby_box', keyRookies: ['TBD Rookies'], hype: 'medium' },
  { id: 'pr_006', name: '2025 Panini National Treasures NFL', sport: 'Football', brand: 'Panini', releaseDate: '2026-04-01', estimatedHobbyPrice: 4500, productType: 'hobby_box', keyRookies: ['Shedeur Sanders', 'Travis Hunter'], hype: 'high' },
  { id: 'pr_007', name: '2025 Topps Stadium Club Baseball', sport: 'Baseball', brand: 'Topps', releaseDate: '2025-11-10', estimatedHobbyPrice: 120, productType: 'hobby_box', keyRookies: ['Roki Sasaki', 'Paul Skenes'], hype: 'medium' },
  { id: 'pr_008', name: '2026 Panini Prizm NBA Hobby', sport: 'Basketball', brand: 'Panini', releaseDate: '2026-08-01', estimatedHobbyPrice: 1400, productType: 'hobby_box', keyRookies: ['TBD 2026 Draft Class'], hype: 'medium' },
  { id: 'pr_009', name: '2025 Donruss Optic NFL Hobby', sport: 'Football', brand: 'Panini', releaseDate: '2026-03-20', estimatedHobbyPrice: 475, productType: 'hobby_box', keyRookies: ['Shedeur Sanders', 'Cam Ward'], hype: 'medium' },
  { id: 'pr_010', name: '2025 Topps Heritage Baseball', sport: 'Baseball', brand: 'Topps', releaseDate: '2025-04-15', estimatedHobbyPrice: 115, productType: 'hobby_box', keyRookies: ['Roki Sasaki'], hype: 'medium' },
  { id: 'pr_011', name: '2026 Bowman Baseball Hobby', sport: 'Baseball', brand: 'Bowman', releaseDate: '2026-05-10', estimatedHobbyPrice: 200, productType: 'hobby_box', keyRookies: ['2026 Draft Prospects'], hype: 'high' },
  { id: 'pr_012', name: '2025 Select NBA Hobby', sport: 'Basketball', brand: 'Panini', releaseDate: '2025-12-01', estimatedHobbyPrice: 700, productType: 'hobby_box', keyRookies: ['Cooper Flagg', 'Ace Bailey'], hype: 'high' },
  { id: 'pr_013', name: '2025 Panini Mosaic NFL Hobby', sport: 'Football', brand: 'Panini', releaseDate: '2025-11-15', estimatedHobbyPrice: 350, productType: 'hobby_box', keyRookies: ['Shedeur Sanders', 'Travis Hunter'], hype: 'medium' },
  { id: 'pr_014', name: '2026 Topps Chrome UEFA Champions League', sport: 'Soccer', brand: 'Topps', releaseDate: '2026-06-01', estimatedHobbyPrice: 220, productType: 'hobby_box', keyRookies: ['Lamine Yamal', 'Endrick'], hype: 'high' },
  { id: 'pr_015', name: '2025 Upper Deck Series 2 NHL Hobby', sport: 'Hockey', brand: 'Upper Deck', releaseDate: '2025-12-10', estimatedHobbyPrice: 115, productType: 'hobby_box', keyRookies: ['Macklin Celebrini'], hype: 'medium' },
];

const MARKET_TRENDS: MarketTrend[] = [
  { id: 'mt_001', category: 'NBA Sealed Hobby Boxes', trend: 'rising', changePercent: 14.2, period: 'Last 6 months', description: 'NBA hobby boxes trending up with Cooper Flagg hype cycle driving demand across all years.', impactLevel: 'high' },
  { id: 'mt_002', category: 'NFL Sealed Hobby Boxes', trend: 'stable', changePercent: 2.1, period: 'Last 6 months', description: 'NFL sealed market stable as collectors await 2025 Prizm release with Shedeur Sanders class.', impactLevel: 'medium' },
  { id: 'mt_003', category: 'Baseball Chrome Products', trend: 'rising', changePercent: 8.7, period: 'Last 6 months', description: 'Topps Chrome and Bowman Chrome sealed rising on Roki Sasaki rookie season excitement.', impactLevel: 'high' },
  { id: 'mt_004', category: 'Vintage Sealed Wax', trend: 'rising', changePercent: 18.5, period: 'Last 12 months', description: 'Vintage wax packs and boxes continue to surge as supply dwindles and new collectors enter market.', impactLevel: 'high' },
  { id: 'mt_005', category: 'Retail Sealed Products', trend: 'falling', changePercent: -5.3, period: 'Last 3 months', description: 'Retail blasters and mega boxes declining as overproduction concerns mount.', impactLevel: 'medium' },
  { id: 'mt_006', category: 'Ultra-Premium Sealed', trend: 'rising', changePercent: 11.4, period: 'Last 6 months', description: 'National Treasures, Flawless, and other ultra-premium sealed rising as wealthy collectors invest.', impactLevel: 'medium' },
  { id: 'mt_007', category: 'Soccer Sealed Products', trend: 'rising', changePercent: 22.8, period: 'Last 12 months', description: 'Global soccer card market booming. UCL Chrome and Topps Merlin leading sealed demand.', impactLevel: 'high' },
  { id: 'mt_008', category: 'Hockey Sealed Products', trend: 'stable', changePercent: -0.8, period: 'Last 6 months', description: 'NHL sealed relatively flat. Macklin Celebrini provides some excitement.', impactLevel: 'low' },
  { id: 'mt_009', category: 'Sealed Cases (Full Cases)', trend: 'rising', changePercent: 15.6, period: 'Last 12 months', description: 'Full sealed cases increasingly popular as investment vehicles. Premium over individual boxes growing.', impactLevel: 'high' },
  { id: 'mt_010', category: 'Panini Last Year Products', trend: 'rising', changePercent: 25.3, period: 'Last 6 months', description: 'Final Panini NFL/NBA licensed products gaining scarcity premium as Fanatics transition approaches.', impactLevel: 'high' },
  { id: 'mt_011', category: 'Bowman 1st Chrome Prospect Boxes', trend: 'rising', changePercent: 9.2, period: 'Last 6 months', description: 'Bowman Chrome sealed popular with prospect investors targeting next generation of stars.', impactLevel: 'medium' },
  { id: 'mt_012', category: 'Retail Cello/Fat Packs', trend: 'falling', changePercent: -8.1, period: 'Last 3 months', description: 'Individual cello and fat packs losing value as market shifts focus to hobby-grade products.', impactLevel: 'low' },
  { id: 'mt_013', category: '2020-2021 Sealed Football', trend: 'rising', changePercent: 12.4, period: 'Last 6 months', description: 'Burrow, Herbert, and Lawrence era sealed products climbing as players establish Hall of Fame trajectories.', impactLevel: 'high' },
  { id: 'mt_014', category: '2018-2019 Sealed Basketball', trend: 'rising', changePercent: 16.9, period: 'Last 12 months', description: 'Luka Doncic era sealed continues historic appreciation. 2018 Prizm becoming blue-chip sealed investment.', impactLevel: 'high' },
  { id: 'mt_015', category: 'Sealed Product Storage Services', trend: 'rising', changePercent: 30.2, period: 'Last 12 months', description: 'Third-party sealed storage and authentication services booming as market matures.', impactLevel: 'medium' },
  { id: 'mt_016', category: 'International Sealed Demand', trend: 'rising', changePercent: 19.7, period: 'Last 12 months', description: 'Asian and European collectors driving global demand for US sports sealed products.', impactLevel: 'high' },
  { id: 'mt_017', category: 'Blaster Box Exclusives', trend: 'stable', changePercent: 1.5, period: 'Last 6 months', description: 'Target and Walmart exclusive blasters holding value but not appreciating meaningfully.', impactLevel: 'low' },
  { id: 'mt_018', category: 'Heritage and Retro Sealed', trend: 'falling', changePercent: -3.8, period: 'Last 6 months', description: 'Heritage and retro-themed sealed products declining as collectors prefer chrome products.', impactLevel: 'low' },
  { id: 'mt_019', category: 'Sealed Product Authentication', trend: 'rising', changePercent: 45.0, period: 'Last 12 months', description: 'BBCE and other sealed authentication services seeing record demand as counterfeits increase.', impactLevel: 'medium' },
  { id: 'mt_020', category: 'Group Break Market Impact', trend: 'stable', changePercent: 3.2, period: 'Last 6 months', description: 'Group breaks consuming significant sealed supply, reducing long-term sealed availability.', impactLevel: 'medium' },
];

const VINTAGE_SEALED: VintageSealed[] = [
  { id: 'vs_001', name: '1986 Fleer Basketball Wax Pack', sport: 'basketball', year: 1986, productType: 'pack', currentPrice: 25000, priceOneYearAgo: 20000, priceFiveYearsAgo: 8000, estimatedRemaining: 500, keyCards: ['Michael Jordan RC', 'Charles Barkley RC', 'Karl Malone RC'], investmentGrade: 'A+' },
  { id: 'vs_002', name: '1986 Fleer Basketball Wax Box (36 packs)', sport: 'basketball', year: 1986, productType: 'hobby_box', currentPrice: 1200000, priceOneYearAgo: 950000, priceFiveYearsAgo: 350000, estimatedRemaining: 15, keyCards: ['Michael Jordan RC', 'Full Set'], investmentGrade: 'A+' },
  { id: 'vs_003', name: '1952 Topps Baseball Wax Pack', sport: 'baseball', year: 1952, productType: 'pack', currentPrice: 85000, priceOneYearAgo: 72000, priceFiveYearsAgo: 35000, estimatedRemaining: 50, keyCards: ['Mickey Mantle RC', 'Willie Mays'], investmentGrade: 'A+' },
  { id: 'vs_004', name: '1984 Topps Football Wax Box', sport: 'football', year: 1984, productType: 'hobby_box', currentPrice: 35000, priceOneYearAgo: 28000, priceFiveYearsAgo: 12000, estimatedRemaining: 200, keyCards: ['Dan Marino RC', 'John Elway RC'], investmentGrade: 'A' },
  { id: 'vs_005', name: '1979 O-Pee-Chee Hockey Wax Box', sport: 'hockey', year: 1979, productType: 'hobby_box', currentPrice: 180000, priceOneYearAgo: 150000, priceFiveYearsAgo: 55000, estimatedRemaining: 30, keyCards: ['Wayne Gretzky RC'], investmentGrade: 'A+' },
  { id: 'vs_006', name: '1993 SP Baseball Foil Pack', sport: 'baseball', year: 1993, productType: 'pack', currentPrice: 450, priceOneYearAgo: 380, priceFiveYearsAgo: 120, estimatedRemaining: 8000, keyCards: ['Derek Jeter RC'], investmentGrade: 'B+' },
  { id: 'vs_007', name: '1993 SP Baseball Foil Box', sport: 'baseball', year: 1993, productType: 'hobby_box', currentPrice: 12000, priceOneYearAgo: 9500, priceFiveYearsAgo: 3200, estimatedRemaining: 500, keyCards: ['Derek Jeter RC'], investmentGrade: 'A' },
  { id: 'vs_008', name: '1996 Topps Chrome Basketball Box', sport: 'basketball', year: 1996, productType: 'hobby_box', currentPrice: 95000, priceOneYearAgo: 80000, priceFiveYearsAgo: 25000, estimatedRemaining: 150, keyCards: ['Kobe Bryant RC', 'Allen Iverson RC', 'Steve Nash RC'], investmentGrade: 'A+' },
  { id: 'vs_009', name: '1998 SP Authentic Football Box', sport: 'football', year: 1998, productType: 'hobby_box', currentPrice: 55000, priceOneYearAgo: 45000, priceFiveYearsAgo: 15000, estimatedRemaining: 120, keyCards: ['Peyton Manning RC Auto'], investmentGrade: 'A' },
  { id: 'vs_010', name: '2003 Topps Chrome Basketball Box', sport: 'basketball', year: 2003, productType: 'hobby_box', currentPrice: 75000, priceOneYearAgo: 62000, priceFiveYearsAgo: 18000, estimatedRemaining: 250, keyCards: ['LeBron James RC Refractor'], investmentGrade: 'A+' },
  { id: 'vs_011', name: '2000 Bowman Chrome Baseball Box', sport: 'baseball', year: 2000, productType: 'hobby_box', currentPrice: 8500, priceOneYearAgo: 7200, priceFiveYearsAgo: 2800, estimatedRemaining: 800, keyCards: ['Adrian Gonzalez 1st', 'Chase Utley 1st'], investmentGrade: 'B+' },
  { id: 'vs_012', name: '1980 Topps Basketball Wax Box', sport: 'basketball', year: 1980, productType: 'hobby_box', currentPrice: 150000, priceOneYearAgo: 120000, priceFiveYearsAgo: 40000, estimatedRemaining: 40, keyCards: ['Larry Bird RC', 'Magic Johnson RC'], investmentGrade: 'A+' },
  { id: 'vs_013', name: '2009 Bowman Chrome Baseball Box', sport: 'baseball', year: 2009, productType: 'hobby_box', currentPrice: 5500, priceOneYearAgo: 4800, priceFiveYearsAgo: 1500, estimatedRemaining: 1200, keyCards: ['Mike Trout 1st Bowman Chrome'], investmentGrade: 'A' },
  { id: 'vs_014', name: '1971 Topps Baseball Wax Pack', sport: 'baseball', year: 1971, productType: 'pack', currentPrice: 3500, priceOneYearAgo: 2800, priceFiveYearsAgo: 1200, estimatedRemaining: 2000, keyCards: ['Nolan Ryan', 'Hank Aaron', 'Roberto Clemente'], investmentGrade: 'B+' },
  { id: 'vs_015', name: '1987 Topps Baseball Wax Case (20 boxes)', sport: 'baseball', year: 1987, productType: 'case', currentPrice: 2200, priceOneYearAgo: 1800, priceFiveYearsAgo: 800, estimatedRemaining: 3000, keyCards: ['Barry Bonds RC', 'Bo Jackson RC', 'Mark McGwire RC'], investmentGrade: 'B' },
  { id: 'vs_016', name: '2011 Bowman Chrome Baseball Box', sport: 'baseball', year: 2011, productType: 'hobby_box', currentPrice: 4200, priceOneYearAgo: 3600, priceFiveYearsAgo: 1100, estimatedRemaining: 1500, keyCards: ['Bryce Harper 1st Bowman Chrome', 'Mike Trout'], investmentGrade: 'A' },
  { id: 'vs_017', name: '2012 Panini Prizm Basketball Box', sport: 'basketball', year: 2012, productType: 'hobby_box', currentPrice: 28000, priceOneYearAgo: 22000, priceFiveYearsAgo: 5000, estimatedRemaining: 400, keyCards: ['First Prizm Set Ever', 'Anthony Davis RC'], investmentGrade: 'A' },
  { id: 'vs_018', name: '1990 Topps Football Wax Box', sport: 'football', year: 1990, productType: 'hobby_box', currentPrice: 250, priceOneYearAgo: 200, priceFiveYearsAgo: 60, estimatedRemaining: 15000, keyCards: ['Emmitt Smith RC', 'Junior Seau RC'], investmentGrade: 'C+' },
  { id: 'vs_019', name: '2014 Bowman Chrome Baseball Box', sport: 'baseball', year: 2014, productType: 'hobby_box', currentPrice: 3800, priceOneYearAgo: 3200, priceFiveYearsAgo: 900, estimatedRemaining: 2000, keyCards: ['Mookie Betts 1st', 'Jacob deGrom 1st'], investmentGrade: 'B+' },
  { id: 'vs_020', name: '1996 Topps Chrome Football Box', sport: 'football', year: 1996, productType: 'hobby_box', currentPrice: 8000, priceOneYearAgo: 6500, priceFiveYearsAgo: 2200, estimatedRemaining: 600, keyCards: ['Ray Lewis RC Refractor', 'Marvin Harrison RC'], investmentGrade: 'B+' },
  { id: 'vs_021', name: '2001 Bowman Chrome Football Box', sport: 'football', year: 2001, productType: 'hobby_box', currentPrice: 22000, priceOneYearAgo: 18000, priceFiveYearsAgo: 6000, estimatedRemaining: 350, keyCards: ['Drew Brees RC', 'LaDainian Tomlinson RC', 'Michael Vick RC'], investmentGrade: 'A' },
  { id: 'vs_022', name: '2017 Bowman Chrome Baseball Box', sport: 'baseball', year: 2017, productType: 'hobby_box', currentPrice: 2800, priceOneYearAgo: 2400, priceFiveYearsAgo: 550, estimatedRemaining: 3000, keyCards: ['Ronald Acuna Jr 1st', 'Juan Soto 1st'], investmentGrade: 'A' },
  { id: 'vs_023', name: '1969 Topps Baseball Wax Pack', sport: 'baseball', year: 1969, productType: 'pack', currentPrice: 5500, priceOneYearAgo: 4500, priceFiveYearsAgo: 2000, estimatedRemaining: 1500, keyCards: ['Reggie Jackson RC', 'Nolan Ryan 2nd Year'], investmentGrade: 'A' },
  { id: 'vs_024', name: '2013 Panini Prizm Football Box', sport: 'football', year: 2013, productType: 'hobby_box', currentPrice: 6500, priceOneYearAgo: 5200, priceFiveYearsAgo: 1800, estimatedRemaining: 700, keyCards: ['Early Prizm Football', 'Le\'Veon Bell RC'], investmentGrade: 'B+' },
  { id: 'vs_025', name: '1981 Topps Baseball Traded Set Box', sport: 'baseball', year: 1981, productType: 'hobby_box', currentPrice: 1200, priceOneYearAgo: 1000, priceFiveYearsAgo: 400, estimatedRemaining: 5000, keyCards: ['Tim Raines RC', 'Fernando Valenzuela RC'], investmentGrade: 'C+' },
  { id: 'vs_026', name: '2004 Bowman Chrome Baseball Box', sport: 'baseball', year: 2004, productType: 'hobby_box', currentPrice: 3500, priceOneYearAgo: 2900, priceFiveYearsAgo: 800, estimatedRemaining: 1800, keyCards: ['Zack Greinke 1st', 'Justin Verlander 1st'], investmentGrade: 'B' },
  { id: 'vs_027', name: '1955 Topps Baseball Wax Pack', sport: 'baseball', year: 1955, productType: 'pack', currentPrice: 45000, priceOneYearAgo: 38000, priceFiveYearsAgo: 15000, estimatedRemaining: 100, keyCards: ['Roberto Clemente RC', 'Sandy Koufax RC'], investmentGrade: 'A+' },
  { id: 'vs_028', name: '2015 Panini Prizm NFL Box', sport: 'football', year: 2015, productType: 'hobby_box', currentPrice: 2200, priceOneYearAgo: 1800, priceFiveYearsAgo: 450, estimatedRemaining: 2500, keyCards: ['Marcus Mariota RC', 'Jameis Winston RC', 'Todd Gurley RC'], investmentGrade: 'B' },
  { id: 'vs_029', name: '1961 Topps Football Wax Pack', sport: 'football', year: 1961, productType: 'pack', currentPrice: 8500, priceOneYearAgo: 7000, priceFiveYearsAgo: 3000, estimatedRemaining: 300, keyCards: ['Mike Ditka RC', 'Fran Tarkenton RC'], investmentGrade: 'A' },
  { id: 'vs_030', name: '2005 Topps Chrome Football Box', sport: 'football', year: 2005, productType: 'hobby_box', currentPrice: 9500, priceOneYearAgo: 7800, priceFiveYearsAgo: 2500, estimatedRemaining: 450, keyCards: ['Aaron Rodgers RC Refractor', 'DeMarcus Ware RC'], investmentGrade: 'A' },
];

const SUPPLY_ESTIMATES: SupplyEstimate[] = SEALED_PRODUCTS.slice(0, 20).map(p => {
  const yearsSince = 2026 - p.year;
  const declineRate = p.productType === 'hobby_box' ? 12 : p.productType === 'case' ? 8 : 18;
  const remainingPct = Math.max(5, Math.round(100 * Math.pow((100 - declineRate) / 100, yearsSince)));
  const estSealed = Math.round(p.estimatedSupply * remainingPct / 100);

  let scarcity: SupplyEstimate['scarcityRating'] = 'common';
  if (estSealed < 500) scarcity = 'ultra_rare';
  else if (estSealed < 2000) scarcity = 'rare';
  else if (estSealed < 10000) scarcity = 'scarce';
  else if (estSealed < 50000) scarcity = 'uncommon';

  return {
    productId: p.id,
    productName: p.name,
    totalProduced: p.estimatedSupply,
    estimatedSealed: estSealed,
    sealedPercentage: remainingPct,
    yearlyDeclineRate: declineRate,
    scarcityRating: scarcity,
  };
});

// ---- Config Helpers ----

const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; text: string; bg: string; border: string }> = {
  hobby_box: { label: 'Hobby Box', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  retail_box: { label: 'Retail Box', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  blaster: { label: 'Blaster', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  mega_box: { label: 'Mega Box', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  case: { label: 'Case', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  pack: { label: 'Pack', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  cello: { label: 'Cello', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  fat_pack: { label: 'Fat Pack', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
};

// ---- Public API ----

export function getProductTypeConfig(type: ProductType): { label: string; text: string; bg: string; border: string } {
  return PRODUCT_TYPE_CONFIG[type];
}

export function getSealedProducts(sport?: string, productType?: ProductType): SealedProduct[] {
  const cacheKey = `products_${sport ?? 'all'}_${productType ?? 'all'}`;
  const cached = loadData<SealedProduct[]>(cacheKey);
  if (cached) return cached;

  let results = SEALED_PRODUCTS;
  if (sport) results = results.filter(p => p.sport === sport);
  if (productType) results = results.filter(p => p.productType === productType);

  saveData(cacheKey, results);
  return results;
}

export function getPriceHistory(productId?: string): PriceHistory[] {
  const cacheKey = `price_history_${productId ?? 'all'}`;
  const cached = loadData<PriceHistory[]>(cacheKey);
  if (cached) return cached;

  let results = PRICE_HISTORY;
  if (productId) results = results.filter(ph => ph.productId === productId);

  saveData(cacheKey, results);
  return results;
}

export function getROICalculations(): ROICalculation[] {
  const cacheKey = 'roi_calculations';
  const cached = loadData<ROICalculation[]>(cacheKey);
  if (cached) return cached;

  const calculations: ROICalculation[] = SEALED_PRODUCTS.map(product => {
    const roi = ((product.currentPrice - product.releasePrice) / product.releasePrice) * 100;
    const yearsSinceRelease = Math.max(0.25, (2026 - product.year) + 0.21);
    const annualizedROI = Math.round((Math.pow(1 + roi / 100, 1 / yearsSinceRelease) - 1) * 10000) / 100;
    const totalReturn = product.currentPrice - product.releasePrice;

    return {
      productId: product.id,
      productName: product.name,
      purchasePrice: product.releasePrice,
      currentPrice: product.currentPrice,
      roi: Math.round(roi * 100) / 100,
      annualizedROI,
      holdingYears: Math.round(yearsSinceRelease * 10) / 10,
      totalReturn,
    };
  });

  saveData(cacheKey, calculations);
  return calculations;
}

export function getRipVsHoldAnalysis(): RipVsHold[] {
  const cached = loadData<RipVsHold[]>('rip_vs_hold');
  if (cached) return cached;
  saveData('rip_vs_hold', RIP_VS_HOLD);
  return RIP_VS_HOLD;
}

export function getProductReleases(): ProductRelease[] {
  const cached = loadData<ProductRelease[]>('releases');
  if (cached) return cached;
  saveData('releases', PRODUCT_RELEASES);
  return PRODUCT_RELEASES;
}

export function getMarketTrends(): MarketTrend[] {
  const cached = loadData<MarketTrend[]>('trends');
  if (cached) return cached;
  saveData('trends', MARKET_TRENDS);
  return MARKET_TRENDS;
}

export function getSupplyEstimates(): SupplyEstimate[] {
  const cached = loadData<SupplyEstimate[]>('supply');
  if (cached) return cached;
  saveData('supply', SUPPLY_ESTIMATES);
  return SUPPLY_ESTIMATES;
}

export function getVintageSealed(): VintageSealed[] {
  const cached = loadData<VintageSealed[]>('vintage');
  if (cached) return cached;
  saveData('vintage', VINTAGE_SEALED);
  return VINTAGE_SEALED;
}

export function getBreakEvenAnalysis(): BreakEvenAnalysis[] {
  const cacheKey = 'break_even';
  const cached = loadData<BreakEvenAnalysis[]>(cacheKey);
  if (cached) return cached;

  const analyses: BreakEvenAnalysis[] = RIP_VS_HOLD.map(rvh => {
    const product = SEALED_PRODUCTS.find(p => p.id === rvh.productId);
    if (!product) return null;

    const avgCardValue = rvh.avgBaseValue;
    const cardsNeeded = avgCardValue > 0 ? Math.ceil(product.currentPrice / avgCardValue) : 999;
    const probabilityBreakEven = Math.round(Math.min(95, Math.max(5, (rvh.expectedRipValue / rvh.sealedValue) * 50)));
    const topHitNeeded = Math.round(product.currentPrice - (rvh.cardsPerBox - rvh.hitsPerBox) * rvh.avgBaseValue - (rvh.hitsPerBox - 1) * rvh.avgHitValue);

    return {
      productId: product.id,
      productName: product.name,
      boxCost: product.currentPrice,
      avgCardValue,
      cardsNeeded,
      probabilityBreakEven,
      topHitNeeded: Math.max(0, topHitNeeded),
      recommendation: probabilityBreakEven >= 50 ? 'Ripping offers reasonable break-even odds' : 'Sealed value exceeds average rip return — hold sealed',
    };
  }).filter(Boolean) as BreakEvenAnalysis[];

  saveData(cacheKey, analyses);
  return analyses;
}

export function getInvestmentRatings(): InvestmentRating[] {
  const cacheKey = 'ratings';
  const cached = loadData<InvestmentRating[]>(cacheKey);
  if (cached) return cached;

  const ratings: InvestmentRating[] = SEALED_PRODUCTS.map(product => {
    const supply = SUPPLY_ESTIMATES.find(s => s.productId === product.id);
    const roi = ((product.currentPrice - product.releasePrice) / product.releasePrice) * 100;

    const supplyScore = supply ? Math.min(100, Math.round((1 - supply.sealedPercentage / 100) * 100)) : 50;
    const demandScore = Math.min(100, Math.round(50 + roi * 0.5));
    const rookieScore = product.year >= 2023 ? 80 : product.year >= 2020 ? 65 : product.year >= 2015 ? 50 : 40;
    const brandScore = product.brand === 'Topps' || product.brand === 'Panini' ? 85 : product.brand === 'Bowman' ? 80 : 60;
    const valueScore = roi > 100 ? 95 : roi > 50 ? 80 : roi > 20 ? 65 : roi > 0 ? 50 : 35;

    const overall = Math.round(supplyScore * 0.25 + demandScore * 0.25 + rookieScore * 0.15 + brandScore * 0.15 + valueScore * 0.2);

    let recommendation: InvestmentRating['recommendation'] = 'hold';
    if (overall >= 80) recommendation = 'strong_buy';
    else if (overall >= 65) recommendation = 'buy';
    else if (overall >= 50) recommendation = 'hold';
    else if (overall >= 35) recommendation = 'sell';
    else recommendation = 'strong_sell';

    return {
      productId: product.id,
      productName: product.name,
      overallRating: overall,
      supplyScore,
      demandScore,
      rookieScore,
      brandScore,
      valueScore,
      recommendation,
    };
  });

  saveData(cacheKey, ratings);
  return ratings;
}

export function getProductComparisons(): ProductComparison[] {
  const cacheKey = 'comparisons';
  const cached = loadData<ProductComparison[]>(cacheKey);
  if (cached) return cached;

  const comparisons: ProductComparison[] = [
    { productAId: 'sp_001', productBId: 'sp_005', productAName: '2024 Topps Chrome Hobby', productBName: '2024 Bowman Chrome Hobby', priceRatio: 0.89, roiComparison: -3.2, supplyComparison: 'Chrome has 42% more supply', winner: 'B', reasoning: 'Bowman Chrome has better prospect-driven long-term upside and lower relative supply.' },
    { productAId: 'sp_002', productBId: 'sp_012', productAName: '2024 Prizm NBA Hobby', productBName: '2023 Prizm NBA Hobby', priceRatio: 0.81, roiComparison: -12.5, supplyComparison: '2023 has 17% less supply', winner: 'B', reasoning: '2023 Prizm has Wembanyama. Stronger long-term hold despite higher price.' },
    { productAId: 'sp_016', productBId: 'sp_020', productAName: '2020 Prizm NFL Hobby', productBName: '2017 Prizm NFL Hobby', priceRatio: 0.78, roiComparison: -5.8, supplyComparison: 'Similar scarcity levels', winner: 'A', reasoning: '2020 Prizm has dual-star power (Burrow + Herbert) vs. single star (Mahomes). Better risk-adjusted value.' },
    { productAId: 'sp_019', productBId: 'sp_017', productAName: '2018 Prizm NBA Hobby', productBName: '2020 Prizm NBA Hobby', priceRatio: 2.66, roiComparison: 8.3, supplyComparison: '2018 has 47% less supply', winner: 'A', reasoning: 'Luka Doncic class commands premium. Lower supply and stronger generational talent.' },
    { productAId: 'sp_026', productBId: 'sp_004', productAName: '2025 Topps Series 1 Hobby', productBName: '2024 Topps Series 1 Hobby', priceRatio: 1.14, roiComparison: 9.5, supplyComparison: 'Similar production levels', winner: 'A', reasoning: 'Roki Sasaki SP driving current premium. First Fanatics-era Topps adds collectibility.' },
  ];

  saveData(cacheKey, comparisons);
  return comparisons;
}

export function getSealedProductById(id: string): SealedProduct | null {
  return SEALED_PRODUCTS.find(p => p.id === id) ?? null;
}

export function getVintageSealedById(id: string): VintageSealed | null {
  return VINTAGE_SEALED.find(v => v.id === id) ?? null;
}

export function getSealedMarketSummary(): { totalProducts: number; totalValue: number; avgROI: number; topPerformer: string; topPerformerROI: number; vintageProducts: number; vintageValue: number; upcomingReleases: number } {
  const cacheKey = 'market_summary';
  const cached = loadData<{ totalProducts: number; totalValue: number; avgROI: number; topPerformer: string; topPerformerROI: number; vintageProducts: number; vintageValue: number; upcomingReleases: number }>(cacheKey);
  if (cached) return cached;

  const rois = SEALED_PRODUCTS.map(p => ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100);
  const avgROI = Math.round(rois.reduce((s, r) => s + r, 0) / rois.length * 100) / 100;
  const maxROIIdx = rois.indexOf(Math.max(...rois));

  const summary = {
    totalProducts: SEALED_PRODUCTS.length,
    totalValue: SEALED_PRODUCTS.reduce((s, p) => s + p.currentPrice, 0),
    avgROI,
    topPerformer: SEALED_PRODUCTS[maxROIIdx].name,
    topPerformerROI: Math.round(rois[maxROIIdx] * 100) / 100,
    vintageProducts: VINTAGE_SEALED.length,
    vintageValue: VINTAGE_SEALED.reduce((s, v) => s + v.currentPrice, 0),
    upcomingReleases: PRODUCT_RELEASES.filter(r => new Date(r.releaseDate) > new Date('2026-03-15')).length,
  };

  saveData(cacheKey, summary);
  return summary;
}

export function getSportBreakdown(): { sport: string; productCount: number; totalCurrentValue: number; avgROI: number; bestProduct: string; bestROI: number }[] {
  const cacheKey = 'sport_breakdown';
  const cached = loadData<{ sport: string; productCount: number; totalCurrentValue: number; avgROI: number; bestProduct: string; bestROI: number }[]>(cacheKey);
  if (cached) return cached;

  const sports = [...new Set(SEALED_PRODUCTS.map(p => p.sport))];
  const breakdown = sports.map(sport => {
    const sportProducts = SEALED_PRODUCTS.filter(p => p.sport === sport);
    const rois = sportProducts.map(p => ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100);
    const maxROIIdx = rois.indexOf(Math.max(...rois));

    return {
      sport,
      productCount: sportProducts.length,
      totalCurrentValue: sportProducts.reduce((s, p) => s + p.currentPrice, 0),
      avgROI: Math.round(rois.reduce((s, r) => s + r, 0) / rois.length * 100) / 100,
      bestProduct: sportProducts[maxROIIdx].name,
      bestROI: Math.round(rois[maxROIIdx] * 100) / 100,
    };
  }).sort((a, b) => b.avgROI - a.avgROI);

  saveData(cacheKey, breakdown);
  return breakdown;
}

export function getYearlyPerformance(): { year: number; productCount: number; avgCurrentPrice: number; avgReleasePrice: number; avgROI: number; totalAppreciation: number }[] {
  const cacheKey = 'yearly_performance';
  const cached = loadData<{ year: number; productCount: number; avgCurrentPrice: number; avgReleasePrice: number; avgROI: number; totalAppreciation: number }[]>(cacheKey);
  if (cached) return cached;

  const years = [...new Set(SEALED_PRODUCTS.map(p => p.year))].sort();
  const performance = years.map(year => {
    const yearProducts = SEALED_PRODUCTS.filter(p => p.year === year);
    const avgRelease = Math.round(yearProducts.reduce((s, p) => s + p.releasePrice, 0) / yearProducts.length);
    const avgCurrent = Math.round(yearProducts.reduce((s, p) => s + p.currentPrice, 0) / yearProducts.length);
    const rois = yearProducts.map(p => ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100);
    const avgROI = Math.round(rois.reduce((s, r) => s + r, 0) / rois.length * 100) / 100;
    const totalAppreciation = yearProducts.reduce((s, p) => s + (p.currentPrice - p.releasePrice), 0);

    return {
      year,
      productCount: yearProducts.length,
      avgCurrentPrice: avgCurrent,
      avgReleasePrice: avgRelease,
      avgROI,
      totalAppreciation,
    };
  });

  saveData(cacheKey, performance);
  return performance;
}

export function getProductTypeBreakdown(): { productType: ProductType; count: number; avgPrice: number; avgROI: number; totalValue: number; recommendation: string }[] {
  const cacheKey = 'type_breakdown';
  const cached = loadData<{ productType: ProductType; count: number; avgPrice: number; avgROI: number; totalValue: number; recommendation: string }[]>(cacheKey);
  if (cached) return cached;

  const types: ProductType[] = ['hobby_box', 'retail_box', 'blaster', 'mega_box', 'case', 'pack', 'cello', 'fat_pack'];
  const breakdown = types.map(type => {
    const typeProducts = SEALED_PRODUCTS.filter(p => p.productType === type);
    if (typeProducts.length === 0) {
      return { productType: type, count: 0, avgPrice: 0, avgROI: 0, totalValue: 0, recommendation: 'Insufficient data' };
    }
    const rois = typeProducts.map(p => ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100);
    const avgROI = Math.round(rois.reduce((s, r) => s + r, 0) / rois.length * 100) / 100;
    const avgPrice = Math.round(typeProducts.reduce((s, p) => s + p.currentPrice, 0) / typeProducts.length);
    const totalValue = typeProducts.reduce((s, p) => s + p.currentPrice, 0);

    let recommendation = 'Hold';
    if (avgROI > 50) recommendation = 'Strong investment category — prioritize sealed acquisition';
    else if (avgROI > 20) recommendation = 'Solid appreciation — selective buying recommended';
    else if (avgROI > 5) recommendation = 'Modest returns — buy at release price only';
    else recommendation = 'Below average returns — avoid overpaying';

    return { productType: type, count: typeProducts.length, avgPrice, avgROI, totalValue, recommendation };
  }).filter(b => b.count > 0);

  saveData(cacheKey, breakdown);
  return breakdown;
}

export function getScarcityReport(): { tier: string; products: { name: string; estimatedSealed: number; currentPrice: number; pricePerUnit: number }[]; avgPrice: number; totalProducts: number }[] {
  const cacheKey = 'scarcity_report';
  const cached = loadData<{ tier: string; products: { name: string; estimatedSealed: number; currentPrice: number; pricePerUnit: number }[]; avgPrice: number; totalProducts: number }[]>(cacheKey);
  if (cached) return cached;

  const tiers: { tier: string; min: number; max: number }[] = [
    { tier: 'Ultra Rare (< 500 sealed)', min: 0, max: 499 },
    { tier: 'Rare (500 – 2,000 sealed)', min: 500, max: 2000 },
    { tier: 'Scarce (2,001 – 10,000 sealed)', min: 2001, max: 10000 },
    { tier: 'Uncommon (10,001 – 50,000 sealed)', min: 10001, max: 50000 },
    { tier: 'Common (50,000+ sealed)', min: 50001, max: Infinity },
  ];

  const report = tiers.map(tier => {
    const tierSupply = SUPPLY_ESTIMATES.filter(s => s.estimatedSealed >= tier.min && s.estimatedSealed <= tier.max);
    const products = tierSupply.map(s => {
      const product = SEALED_PRODUCTS.find(p => p.id === s.productId);
      return {
        name: s.productName,
        estimatedSealed: s.estimatedSealed,
        currentPrice: product?.currentPrice ?? 0,
        pricePerUnit: product ? Math.round(product.currentPrice / Math.max(1, s.estimatedSealed) * 100) / 100 : 0,
      };
    });

    return {
      tier: tier.tier,
      products,
      avgPrice: products.length > 0 ? Math.round(products.reduce((s, p) => s + p.currentPrice, 0) / products.length) : 0,
      totalProducts: products.length,
    };
  });

  saveData(cacheKey, report);
  return report;
}

export function getTopAppreciatingProducts(limit: number = 10): { rank: number; name: string; sport: string; year: number; releasePrice: number; currentPrice: number; roi: number; annualizedROI: number }[] {
  const cacheKey = `top_appreciating_${limit}`;
  const cached = loadData<{ rank: number; name: string; sport: string; year: number; releasePrice: number; currentPrice: number; roi: number; annualizedROI: number }[]>(cacheKey);
  if (cached) return cached;

  const withROI = SEALED_PRODUCTS.map(p => {
    const roi = ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100;
    const years = Math.max(0.25, (2026 - p.year) + 0.21);
    const annualizedROI = Math.round((Math.pow(1 + roi / 100, 1 / years) - 1) * 10000) / 100;
    return { ...p, roi: Math.round(roi * 100) / 100, annualizedROI };
  }).sort((a, b) => b.roi - a.roi).slice(0, limit);

  const result = withROI.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    sport: p.sport,
    year: p.year,
    releasePrice: p.releasePrice,
    currentPrice: p.currentPrice,
    roi: p.roi,
    annualizedROI: p.annualizedROI,
  }));

  saveData(cacheKey, result);
  return result;
}

export function getVintageAppreciationRates(): { name: string; oneYearReturn: number; fiveYearReturn: number; annualized: number; estimatedRemaining: number; investmentGrade: string }[] {
  const cacheKey = 'vintage_appreciation';
  const cached = loadData<{ name: string; oneYearReturn: number; fiveYearReturn: number; annualized: number; estimatedRemaining: number; investmentGrade: string }[]>(cacheKey);
  if (cached) return cached;

  const rates = VINTAGE_SEALED.map(v => {
    const oneYearReturn = Math.round(((v.currentPrice - v.priceOneYearAgo) / v.priceOneYearAgo) * 10000) / 100;
    const fiveYearReturn = Math.round(((v.currentPrice - v.priceFiveYearsAgo) / v.priceFiveYearsAgo) * 10000) / 100;
    const annualized = Math.round((Math.pow(1 + fiveYearReturn / 100, 0.2) - 1) * 10000) / 100;

    return {
      name: v.name,
      oneYearReturn,
      fiveYearReturn,
      annualized,
      estimatedRemaining: v.estimatedRemaining,
      investmentGrade: v.investmentGrade,
    };
  }).sort((a, b) => b.fiveYearReturn - a.fiveYearReturn);

  saveData(cacheKey, rates);
  return rates;
}

export function getReleaseCalendar(): { month: string; releases: { name: string; sport: string; estimatedPrice: number; hype: string }[] }[] {
  const cacheKey = 'release_calendar';
  const cached = loadData<{ month: string; releases: { name: string; sport: string; estimatedPrice: number; hype: string }[] }[]>(cacheKey);
  if (cached) return cached;

  const monthMap = new Map<string, { name: string; sport: string; estimatedPrice: number; hype: string }[]>();

  PRODUCT_RELEASES.forEach(release => {
    const monthKey = release.releaseDate.substring(0, 7);
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
    monthMap.get(monthKey)!.push({
      name: release.name,
      sport: release.sport,
      estimatedPrice: release.estimatedHobbyPrice,
      hype: release.hype,
    });
  });

  const calendar = Array.from(monthMap.entries())
    .map(([month, releases]) => ({ month, releases }))
    .sort((a, b) => a.month.localeCompare(b.month));

  saveData(cacheKey, calendar);
  return calendar;
}

export function getBrandPerformance(): { brand: string; productCount: number; avgROI: number; avgPrice: number; totalMarketValue: number; vintageProducts: number }[] {
  const cacheKey = 'brand_performance';
  const cached = loadData<{ brand: string; productCount: number; avgROI: number; avgPrice: number; totalMarketValue: number; vintageProducts: number }[]>(cacheKey);
  if (cached) return cached;

  const brands = [...new Set(SEALED_PRODUCTS.map(p => p.brand))];
  const performance = brands.map(brand => {
    const brandProducts = SEALED_PRODUCTS.filter(p => p.brand === brand);
    const rois = brandProducts.map(p => ((p.currentPrice - p.releasePrice) / p.releasePrice) * 100);
    const avgROI = Math.round(rois.reduce((s, r) => s + r, 0) / rois.length * 100) / 100;
    const avgPrice = Math.round(brandProducts.reduce((s, p) => s + p.currentPrice, 0) / brandProducts.length);
    const totalMarketValue = brandProducts.reduce((s, p) => s + p.currentPrice, 0);
    const vintageCount = VINTAGE_SEALED.filter(v => v.name.toLowerCase().includes(brand.toLowerCase())).length;

    return {
      brand,
      productCount: brandProducts.length,
      avgROI,
      avgPrice,
      totalMarketValue,
      vintageProducts: vintageCount,
    };
  }).sort((a, b) => b.avgROI - a.avgROI);

  saveData(cacheKey, performance);
  return performance;
}

export function getInvestmentTimeline(): { date: string; event: string; productName: string; priceAtEvent: number; currentPrice: number; returnSinceEvent: number }[] {
  const cacheKey = 'investment_timeline';
  const cached = loadData<{ date: string; event: string; productName: string; priceAtEvent: number; currentPrice: number; returnSinceEvent: number }[]>(cacheKey);
  if (cached) return cached;

  const timeline = [
    { date: '2024-01-15', event: 'Purchased sealed', productName: '2024 Topps Chrome Baseball Hobby Box', priceAtEvent: 250, currentPrice: 310, returnSinceEvent: 24 },
    { date: '2024-03-01', event: 'Purchased sealed', productName: '2024 Panini Prizm NBA Hobby Box', priceAtEvent: 1200, currentPrice: 1450, returnSinceEvent: 20.8 },
    { date: '2024-05-15', event: 'Purchased sealed', productName: '2024 Bowman Chrome Baseball Hobby Box', priceAtEvent: 275, currentPrice: 350, returnSinceEvent: 27.3 },
    { date: '2024-07-01', event: 'Market correction', productName: '2024 Panini Prizm NFL Hobby Box', priceAtEvent: 950, currentPrice: 750, returnSinceEvent: -21.1 },
    { date: '2024-08-20', event: 'Purchased sealed', productName: '2023 Panini Prizm NBA Hobby Box', priceAtEvent: 1400, currentPrice: 1800, returnSinceEvent: 28.6 },
    { date: '2024-10-01', event: 'Price spike', productName: '2020 Panini Prizm NFL Hobby Box', priceAtEvent: 3800, currentPrice: 4500, returnSinceEvent: 18.4 },
    { date: '2024-11-15', event: 'Purchased sealed', productName: '2018 Panini Prizm NBA Hobby Box', priceAtEvent: 7200, currentPrice: 8500, returnSinceEvent: 18.1 },
    { date: '2025-01-10', event: 'New release', productName: '2025 Topps Series 1 Baseball Hobby Box', priceAtEvent: 95, currentPrice: 120, returnSinceEvent: 26.3 },
    { date: '2025-03-15', event: 'Market surge', productName: '2017 Panini Prizm NFL Hobby Box', priceAtEvent: 4800, currentPrice: 5800, returnSinceEvent: 20.8 },
    { date: '2025-06-01', event: 'Supply crunch', productName: '2023 Bowman Chrome Baseball Hobby Case', priceAtEvent: 3600, currentPrice: 4200, returnSinceEvent: 16.7 },
    { date: '2025-09-01', event: 'New release hype', productName: '2025 Panini Prizm NBA Hobby Box', priceAtEvent: 1300, currentPrice: 1550, returnSinceEvent: 19.2 },
    { date: '2026-01-15', event: 'NFL hype cycle', productName: '2025 Panini Prizm NFL Hobby Box', priceAtEvent: 850, currentPrice: 920, returnSinceEvent: 8.2 },
  ];

  saveData(cacheKey, timeline);
  return timeline;
}
