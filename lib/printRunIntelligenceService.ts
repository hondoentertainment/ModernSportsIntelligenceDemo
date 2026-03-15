// Phase 143: Overproduction & Print Run Intelligence
// Tracks print run data, production volumes, scarcity metrics across all major card manufacturers

// ---- Types ----

export type Manufacturer =
  | 'panini'
  | 'topps'
  | 'upper_deck'
  | 'fanatics'
  | 'leaf'
  | 'sage'
  | 'onyx'
  | 'wild_card';

export interface ProductSet {
  id: string;
  name: string;
  manufacturer: Manufacturer;
  year: number;
  sport: string;
  releaseDate: string;
  baseRunEstimate: number;
  totalParallels: number;
  totalInserts: number;
  msrp: number;
  boxesProduced: number;
  packsPerBox: number;
  cardsPerPack: number;
  overproductionScore: number;
  marketDemand: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  status: 'announced' | 'released' | 'sold_out' | 'overstock';
}

export interface PrintRunData {
  id: string;
  setId: string;
  setName: string;
  parallelName: string;
  numberedTo: number | null;
  estimatedPrintRun: number;
  confirmedPrintRun: boolean;
  valueMultiplier: number;
  avgSalePrice: number;
  color: string;
}

export interface ScarcityIndex {
  id: string;
  setId: string;
  setName: string;
  manufacturer: Manufacturer;
  scarcityScore: number;
  populationCount: number;
  demandScore: number;
  priceStability: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
}

export interface SaturationAlert {
  id: string;
  setId: string;
  setName: string;
  manufacturer: Manufacturer;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertType: string;
  description: string;
  affectedParallels: string[];
  recommendedAction: string;
  estimatedImpact: number;
  dateIssued: string;
}

export interface ParallelBreakdown {
  id: string;
  setId: string;
  parallelName: string;
  color: string;
  numberedTo: number | null;
  productionCount: number;
  valueMultiplier: number;
  avgPrice: number;
  tier: 'base' | 'common' | 'uncommon' | 'rare' | 'super_rare' | 'ultra_rare' | 'one_of_one';
}

export interface ProductionTrend {
  year: number;
  manufacturer: Manufacturer;
  totalCardsProduced: number;
  totalSetsReleased: number;
  avgPrintRun: number;
  marketRevenue: number;
}

export interface SetComparison {
  setId: string;
  setName: string;
  manufacturer: Manufacturer;
  printRun: number;
  parallelCount: number;
  avgBasePrice: number;
  scarcityScore: number;
  overproductionScore: number;
  roi12m: number;
}

export interface MarketAbsorption {
  id: string;
  setId: string;
  setName: string;
  totalProduced: number;
  totalSold: number;
  absorptionRate: number;
  daysToAbsorb: number;
  currentInventory: number;
  priceDecline: number;
}

export interface SupplyDemandMetric {
  id: string;
  setName: string;
  supplyIndex: number;
  demandIndex: number;
  equilibriumPrice: number;
  currentPrice: number;
  pricePressure: 'upward' | 'neutral' | 'downward';
  imbalanceScore: number;
}

export interface InsertOdds {
  id: string;
  setId: string;
  insertName: string;
  odds: string;
  estimatedHits: number;
  avgValue: number;
  evPerBox: number;
}

export interface OverproductionScore {
  setId: string;
  setName: string;
  score: number;
  factors: { name: string; weight: number; value: number }[];
  recommendation: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

// ---- Constants ----

const STORAGE_KEY = 'msi_print_run_intelligence';

const MANUFACTURER_LABELS: Record<Manufacturer, string> = {
  panini: 'Panini',
  topps: 'Topps',
  upper_deck: 'Upper Deck',
  fanatics: 'Fanatics',
  leaf: 'Leaf',
  sage: 'SAGE',
  onyx: 'Onyx',
  wild_card: 'Wild Card',
};

const MANUFACTURER_COLORS: Record<Manufacturer, string> = {
  panini: '#3b82f6',
  topps: '#ef4444',
  upper_deck: '#22c55e',
  fanatics: '#8b5cf6',
  leaf: '#f59e0b',
  sage: '#06b6d4',
  onyx: '#64748b',
  wild_card: '#ec4899',
};

// ---- Mock Data: 32 Product Sets ----

const MOCK_PRODUCT_SETS: ProductSet[] = [
  {
    id: 'set-001', name: '2024 Topps Chrome Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-08-14', baseRunEstimate: 8500000, totalParallels: 22,
    totalInserts: 8, msrp: 150, boxesProduced: 420000, packsPerBox: 24, cardsPerPack: 4,
    overproductionScore: 72, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-002', name: '2024 Panini Prizm Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-10-02', baseRunEstimate: 7200000, totalParallels: 28,
    totalInserts: 10, msrp: 200, boxesProduced: 380000, packsPerBox: 12, cardsPerPack: 12,
    overproductionScore: 78, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-003', name: '2024 Donruss Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-05-15', baseRunEstimate: 12000000, totalParallels: 18,
    totalInserts: 6, msrp: 100, boxesProduced: 550000, packsPerBox: 30, cardsPerPack: 8,
    overproductionScore: 85, marketDemand: 'moderate', status: 'overstock',
  },
  {
    id: 'set-004', name: '2024 Select Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-11-20', baseRunEstimate: 5400000, totalParallels: 32,
    totalInserts: 12, msrp: 250, boxesProduced: 280000, packsPerBox: 12, cardsPerPack: 5,
    overproductionScore: 55, marketDemand: 'very_high', status: 'released',
  },
  {
    id: 'set-005', name: '2024 Topps Series 1 Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-02-07', baseRunEstimate: 15000000, totalParallels: 20,
    totalInserts: 9, msrp: 45, boxesProduced: 750000, packsPerBox: 24, cardsPerPack: 14,
    overproductionScore: 88, marketDemand: 'moderate', status: 'overstock',
  },
  {
    id: 'set-006', name: '2024 Topps Series 2 Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-06-12', baseRunEstimate: 14500000, totalParallels: 20,
    totalInserts: 9, msrp: 45, boxesProduced: 720000, packsPerBox: 24, cardsPerPack: 14,
    overproductionScore: 86, marketDemand: 'low', status: 'overstock',
  },
  {
    id: 'set-007', name: '2024 Bowman Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-04-17', baseRunEstimate: 18000000, totalParallels: 25,
    totalInserts: 7, msrp: 120, boxesProduced: 620000, packsPerBox: 24, cardsPerPack: 10,
    overproductionScore: 92, marketDemand: 'moderate', status: 'overstock',
  },
  {
    id: 'set-008', name: '2024 Panini Mosaic Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-07-10', baseRunEstimate: 6800000, totalParallels: 24,
    totalInserts: 8, msrp: 180, boxesProduced: 320000, packsPerBox: 12, cardsPerPack: 6,
    overproductionScore: 68, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-009', name: '2024 Upper Deck Series 1 Hockey', manufacturer: 'upper_deck', year: 2024,
    sport: 'Hockey', releaseDate: '2024-11-06', baseRunEstimate: 3200000, totalParallels: 15,
    totalInserts: 6, msrp: 90, boxesProduced: 180000, packsPerBox: 24, cardsPerPack: 8,
    overproductionScore: 42, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-010', name: '2024 Upper Deck SP Authentic Hockey', manufacturer: 'upper_deck', year: 2024,
    sport: 'Hockey', releaseDate: '2024-12-11', baseRunEstimate: 1800000, totalParallels: 12,
    totalInserts: 5, msrp: 200, boxesProduced: 95000, packsPerBox: 18, cardsPerPack: 5,
    overproductionScore: 28, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-011', name: '2024 Panini Contenders Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-01-24', baseRunEstimate: 9500000, totalParallels: 16,
    totalInserts: 5, msrp: 225, boxesProduced: 400000, packsPerBox: 18, cardsPerPack: 8,
    overproductionScore: 75, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-012', name: '2024 Topps Chrome Update Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-12-04', baseRunEstimate: 6000000, totalParallels: 20,
    totalInserts: 6, msrp: 160, boxesProduced: 300000, packsPerBox: 24, cardsPerPack: 4,
    overproductionScore: 62, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-013', name: '2024 Panini National Treasures Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-03-20', baseRunEstimate: 420000, totalParallels: 35,
    totalInserts: 15, msrp: 800, boxesProduced: 18000, packsPerBox: 8, cardsPerPack: 5,
    overproductionScore: 15, marketDemand: 'very_high', status: 'sold_out',
  },
  {
    id: 'set-014', name: '2024 Leaf Metal Draft Football', manufacturer: 'leaf', year: 2024,
    sport: 'Football', releaseDate: '2024-05-01', baseRunEstimate: 2400000, totalParallels: 14,
    totalInserts: 4, msrp: 180, boxesProduced: 120000, packsPerBox: 12, cardsPerPack: 5,
    overproductionScore: 48, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-015', name: '2024 SAGE Hit Premier Draft Football', manufacturer: 'sage', year: 2024,
    sport: 'Football', releaseDate: '2024-04-10', baseRunEstimate: 1800000, totalParallels: 10,
    totalInserts: 3, msrp: 80, boxesProduced: 85000, packsPerBox: 16, cardsPerPack: 8,
    overproductionScore: 52, marketDemand: 'low', status: 'released',
  },
  {
    id: 'set-016', name: '2024 Onyx Vintage Football', manufacturer: 'onyx', year: 2024,
    sport: 'Football', releaseDate: '2024-06-25', baseRunEstimate: 900000, totalParallels: 8,
    totalInserts: 3, msrp: 120, boxesProduced: 45000, packsPerBox: 6, cardsPerPack: 5,
    overproductionScore: 35, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-017', name: '2024 Wild Card Matte Draft Picks Football', manufacturer: 'wild_card', year: 2024,
    sport: 'Football', releaseDate: '2024-05-20', baseRunEstimate: 1200000, totalParallels: 12,
    totalInserts: 4, msrp: 100, boxesProduced: 60000, packsPerBox: 20, cardsPerPack: 8,
    overproductionScore: 44, marketDemand: 'low', status: 'released',
  },
  {
    id: 'set-018', name: '2024 Panini Prizm Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-09-18', baseRunEstimate: 11000000, totalParallels: 30,
    totalInserts: 10, msrp: 200, boxesProduced: 480000, packsPerBox: 12, cardsPerPack: 12,
    overproductionScore: 82, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-019', name: '2024 Topps Bowman Chrome Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-09-25', baseRunEstimate: 10000000, totalParallels: 22,
    totalInserts: 7, msrp: 175, boxesProduced: 450000, packsPerBox: 24, cardsPerPack: 4,
    overproductionScore: 80, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-020', name: '2024 Panini Flawless Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-06-05', baseRunEstimate: 180000, totalParallels: 20,
    totalInserts: 10, msrp: 2500, boxesProduced: 5000, packsPerBox: 2, cardsPerPack: 10,
    overproductionScore: 8, marketDemand: 'very_high', status: 'sold_out',
  },
  {
    id: 'set-021', name: '2024 Fanatics Topps Chrome Concept', manufacturer: 'fanatics', year: 2024,
    sport: 'Baseball', releaseDate: '2024-12-20', baseRunEstimate: 5000000, totalParallels: 18,
    totalInserts: 6, msrp: 160, boxesProduced: 250000, packsPerBox: 24, cardsPerPack: 4,
    overproductionScore: 58, marketDemand: 'moderate', status: 'announced',
  },
  {
    id: 'set-022', name: '2024 Upper Deck Artifacts Hockey', manufacturer: 'upper_deck', year: 2024,
    sport: 'Hockey', releaseDate: '2024-10-16', baseRunEstimate: 2100000, totalParallels: 14,
    totalInserts: 5, msrp: 140, boxesProduced: 110000, packsPerBox: 18, cardsPerPack: 4,
    overproductionScore: 38, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-023', name: '2024 Panini Prizm Draft Picks Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-08-28', baseRunEstimate: 8000000, totalParallels: 26,
    totalInserts: 8, msrp: 140, boxesProduced: 350000, packsPerBox: 12, cardsPerPack: 12,
    overproductionScore: 76, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-024', name: '2024 Topps Heritage Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-02-28', baseRunEstimate: 9000000, totalParallels: 12,
    totalInserts: 8, msrp: 60, boxesProduced: 500000, packsPerBox: 24, cardsPerPack: 9,
    overproductionScore: 70, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-025', name: '2024 Topps Stadium Club Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-07-31', baseRunEstimate: 4200000, totalParallels: 10,
    totalInserts: 5, msrp: 120, boxesProduced: 200000, packsPerBox: 16, cardsPerPack: 8,
    overproductionScore: 50, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-026', name: '2024 Panini Immaculate Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-02-14', baseRunEstimate: 350000, totalParallels: 30,
    totalInserts: 12, msrp: 650, boxesProduced: 12000, packsPerBox: 6, cardsPerPack: 5,
    overproductionScore: 12, marketDemand: 'very_high', status: 'sold_out',
  },
  {
    id: 'set-027', name: '2024 Upper Deck The Cup Hockey', manufacturer: 'upper_deck', year: 2024,
    sport: 'Hockey', releaseDate: '2024-08-07', baseRunEstimate: 250000, totalParallels: 18,
    totalInserts: 8, msrp: 600, boxesProduced: 8500, packsPerBox: 6, cardsPerPack: 5,
    overproductionScore: 10, marketDemand: 'very_high', status: 'sold_out',
  },
  {
    id: 'set-028', name: '2024 Leaf Trinity Football', manufacturer: 'leaf', year: 2024,
    sport: 'Football', releaseDate: '2024-07-15', baseRunEstimate: 1600000, totalParallels: 10,
    totalInserts: 3, msrp: 200, boxesProduced: 80000, packsPerBox: 6, cardsPerPack: 5,
    overproductionScore: 40, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-029', name: '2024 Panini Obsidian Basketball', manufacturer: 'panini', year: 2024,
    sport: 'Basketball', releaseDate: '2024-04-24', baseRunEstimate: 3500000, totalParallels: 20,
    totalInserts: 6, msrp: 180, boxesProduced: 160000, packsPerBox: 7, cardsPerPack: 4,
    overproductionScore: 55, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-030', name: '2024 Topps Inception Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-03-13', baseRunEstimate: 1500000, totalParallels: 16,
    totalInserts: 5, msrp: 250, boxesProduced: 75000, packsPerBox: 7, cardsPerPack: 1,
    overproductionScore: 30, marketDemand: 'high', status: 'released',
  },
  {
    id: 'set-031', name: '2024 Panini Absolute Football', manufacturer: 'panini', year: 2024,
    sport: 'Football', releaseDate: '2024-08-21', baseRunEstimate: 6500000, totalParallels: 16,
    totalInserts: 6, msrp: 160, boxesProduced: 300000, packsPerBox: 10, cardsPerPack: 5,
    overproductionScore: 65, marketDemand: 'moderate', status: 'released',
  },
  {
    id: 'set-032', name: '2024 Topps Allen & Ginter Baseball', manufacturer: 'topps', year: 2024,
    sport: 'Baseball', releaseDate: '2024-07-17', baseRunEstimate: 5500000, totalParallels: 14,
    totalInserts: 10, msrp: 80, boxesProduced: 350000, packsPerBox: 24, cardsPerPack: 8,
    overproductionScore: 58, marketDemand: 'moderate', status: 'released',
  },
];

// ---- Mock Scarcity Indices ----

const MOCK_SCARCITY_INDICES: ScarcityIndex[] = [
  { id: 'si-001', setId: 'set-020', setName: '2024 Panini Flawless Basketball', manufacturer: 'panini', scarcityScore: 96, populationCount: 180000, demandScore: 95, priceStability: 92, trend: 'increasing', lastUpdated: '2026-03-10' },
  { id: 'si-002', setId: 'set-027', setName: '2024 Upper Deck The Cup Hockey', manufacturer: 'upper_deck', scarcityScore: 94, populationCount: 250000, demandScore: 90, priceStability: 88, trend: 'increasing', lastUpdated: '2026-03-10' },
  { id: 'si-003', setId: 'set-026', setName: '2024 Panini Immaculate Football', manufacturer: 'panini', scarcityScore: 92, populationCount: 350000, demandScore: 88, priceStability: 85, trend: 'increasing', lastUpdated: '2026-03-10' },
  { id: 'si-004', setId: 'set-013', setName: '2024 Panini National Treasures Basketball', manufacturer: 'panini', scarcityScore: 90, populationCount: 420000, demandScore: 92, priceStability: 87, trend: 'increasing', lastUpdated: '2026-03-10' },
  { id: 'si-005', setId: 'set-010', setName: '2024 Upper Deck SP Authentic Hockey', manufacturer: 'upper_deck', scarcityScore: 78, populationCount: 1800000, demandScore: 72, priceStability: 80, trend: 'stable', lastUpdated: '2026-03-10' },
  { id: 'si-006', setId: 'set-030', setName: '2024 Topps Inception Baseball', manufacturer: 'topps', scarcityScore: 75, populationCount: 1500000, demandScore: 70, priceStability: 78, trend: 'stable', lastUpdated: '2026-03-10' },
  { id: 'si-007', setId: 'set-004', setName: '2024 Select Football', manufacturer: 'panini', scarcityScore: 62, populationCount: 5400000, demandScore: 80, priceStability: 68, trend: 'stable', lastUpdated: '2026-03-10' },
  { id: 'si-008', setId: 'set-001', setName: '2024 Topps Chrome Baseball', manufacturer: 'topps', scarcityScore: 45, populationCount: 8500000, demandScore: 75, priceStability: 60, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-009', setId: 'set-002', setName: '2024 Panini Prizm Basketball', manufacturer: 'panini', scarcityScore: 40, populationCount: 7200000, demandScore: 72, priceStability: 55, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-010', setId: 'set-018', setName: '2024 Panini Prizm Football', manufacturer: 'panini', scarcityScore: 35, populationCount: 11000000, demandScore: 68, priceStability: 48, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-011', setId: 'set-003', setName: '2024 Donruss Football', manufacturer: 'panini', scarcityScore: 28, populationCount: 12000000, demandScore: 50, priceStability: 42, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-012', setId: 'set-007', setName: '2024 Bowman Baseball', manufacturer: 'topps', scarcityScore: 22, populationCount: 18000000, demandScore: 55, priceStability: 38, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-013', setId: 'set-005', setName: '2024 Topps Series 1 Baseball', manufacturer: 'topps', scarcityScore: 18, populationCount: 15000000, demandScore: 45, priceStability: 35, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-014', setId: 'set-006', setName: '2024 Topps Series 2 Baseball', manufacturer: 'topps', scarcityScore: 16, populationCount: 14500000, demandScore: 38, priceStability: 30, trend: 'decreasing', lastUpdated: '2026-03-10' },
  { id: 'si-015', setId: 'set-016', setName: '2024 Onyx Vintage Football', manufacturer: 'onyx', scarcityScore: 72, populationCount: 900000, demandScore: 58, priceStability: 75, trend: 'stable', lastUpdated: '2026-03-10' },
];

// ---- Mock Saturation Alerts ----

const MOCK_SATURATION_ALERTS: SaturationAlert[] = [
  {
    id: 'sa-001', setId: 'set-007', setName: '2024 Bowman Baseball', manufacturer: 'topps',
    severity: 'critical', alertType: 'Massive Overproduction',
    description: '2024 Bowman print run estimated at 18M+ base cards. Market flooded with unsold retail product. Base card values approaching $0.01 per card.',
    affectedParallels: ['Base', 'Blue Refractor', 'Green Refractor', 'Paper'],
    recommendedAction: 'Avoid base card purchases. Focus only on 1st Bowman Chrome autos of top prospects.',
    estimatedImpact: -45, dateIssued: '2026-02-15',
  },
  {
    id: 'sa-002', setId: 'set-018', setName: '2024 Panini Prizm Football', manufacturer: 'panini',
    severity: 'high', alertType: 'Parallel Fatigue',
    description: 'With 30 parallel variants, the Prizm brand is experiencing collector fatigue. Silver Prizm values have declined 35% since release as the market cannot absorb the volume.',
    affectedParallels: ['Silver', 'Red White Blue', 'Blue', 'Green'],
    recommendedAction: 'Only collect numbered parallels /99 or less. Avoid base and common parallels.',
    estimatedImpact: -35, dateIssued: '2026-02-20',
  },
  {
    id: 'sa-003', setId: 'set-005', setName: '2024 Topps Series 1 Baseball', manufacturer: 'topps',
    severity: 'high', alertType: 'Retail Oversaturation',
    description: 'Available at every retailer including Walmart, Target, Dollar Tree. Extreme oversupply of retail configurations depressing all parallel values.',
    affectedParallels: ['Base', 'Rainbow Foil', 'Gold /2024', 'Royal Blue'],
    recommendedAction: 'Do not invest in retail parallels. Only SP/SSP and hobby-exclusive inserts retain value.',
    estimatedImpact: -40, dateIssued: '2026-01-28',
  },
  {
    id: 'sa-004', setId: 'set-003', setName: '2024 Donruss Football', manufacturer: 'panini',
    severity: 'critical', alertType: 'Brand Dilution',
    description: 'Donruss brand equity at all-time low. 12M+ base cards produced in a declining football card market. Rated Rookies no longer command premium.',
    affectedParallels: ['Base', 'Press Proof Blue', 'Press Proof Red', 'Holo Green'],
    recommendedAction: 'Avoid entirely. Redirect budget to Select or National Treasures for football exposure.',
    estimatedImpact: -55, dateIssued: '2026-03-01',
  },
  {
    id: 'sa-005', setId: 'set-006', setName: '2024 Topps Series 2 Baseball', manufacturer: 'topps',
    severity: 'medium', alertType: 'Late Release Drag',
    description: 'Series 2 suffers from timing — key rookies already debuted in Series 1 and Chrome. Remaining checklist lacks marquee names.',
    affectedParallels: ['Base', 'Gold /2024', 'Rainbow Foil'],
    recommendedAction: 'Cherry-pick only confirmed RC debuts not available in earlier releases.',
    estimatedImpact: -25, dateIssued: '2026-02-10',
  },
  {
    id: 'sa-006', setId: 'set-023', setName: '2024 Panini Prizm Draft Picks Basketball', manufacturer: 'panini',
    severity: 'medium', alertType: 'College-to-Pro Value Gap',
    description: 'Draft picks product always drops once pro versions release. 8M base run is excessive for a college-only product.',
    affectedParallels: ['Silver', 'Red White Blue', 'Blue Ice'],
    recommendedAction: 'Sell immediately after draft. Values drop 40-60% when pro versions release.',
    estimatedImpact: -30, dateIssued: '2026-02-28',
  },
  {
    id: 'sa-007', setId: 'set-019', setName: '2024 Topps Bowman Chrome Baseball', manufacturer: 'topps',
    severity: 'high', alertType: 'Prospect Bubble',
    description: 'Combined with regular Bowman, total prospect card production exceeds 28M. Too many prospect parallels chasing too few future stars.',
    affectedParallels: ['Base Refractor', 'Blue Refractor', 'Green Refractor', 'Shimmer'],
    recommendedAction: 'Focus on auto parallels of top-10 prospect lists only. Avoid non-auto refractors.',
    estimatedImpact: -38, dateIssued: '2026-03-05',
  },
  {
    id: 'sa-008', setId: 'set-024', setName: '2024 Topps Heritage Baseball', manufacturer: 'topps',
    severity: 'low', alertType: 'Niche Appeal Limitation',
    description: 'Heritage has a dedicated but limited collector base. Print run of 9M is high for this niche product. SP values remain solid but base is worthless.',
    affectedParallels: ['Base', 'Chrome', 'Mini'],
    recommendedAction: 'Target only SPs, error cards, and high-number SPs. Base cards are not investable.',
    estimatedImpact: -15, dateIssued: '2026-01-15',
  },
];

// ---- Mock Parallel Breakdowns ----

const MOCK_PARALLEL_BREAKDOWNS: ParallelBreakdown[] = [
  // Chrome Baseball parallels
  { id: 'pb-001', setId: 'set-001', parallelName: 'Base', color: '#94a3b8', numberedTo: null, productionCount: 8500000, valueMultiplier: 1.0, avgPrice: 0.15, tier: 'base' },
  { id: 'pb-002', setId: 'set-001', parallelName: 'Refractor', color: '#e2e8f0', numberedTo: null, productionCount: 2400000, valueMultiplier: 3.0, avgPrice: 0.45, tier: 'common' },
  { id: 'pb-003', setId: 'set-001', parallelName: 'Pink Refractor', color: '#f472b6', numberedTo: null, productionCount: 1200000, valueMultiplier: 5.0, avgPrice: 0.75, tier: 'common' },
  { id: 'pb-004', setId: 'set-001', parallelName: 'Blue Refractor', color: '#60a5fa', numberedTo: 199, productionCount: 49750, valueMultiplier: 15.0, avgPrice: 2.25, tier: 'uncommon' },
  { id: 'pb-005', setId: 'set-001', parallelName: 'Green Refractor', color: '#4ade80', numberedTo: 99, productionCount: 24750, valueMultiplier: 30.0, avgPrice: 4.50, tier: 'rare' },
  { id: 'pb-006', setId: 'set-001', parallelName: 'Gold Refractor', color: '#fbbf24', numberedTo: 50, productionCount: 12500, valueMultiplier: 60.0, avgPrice: 9.00, tier: 'rare' },
  { id: 'pb-007', setId: 'set-001', parallelName: 'Orange Refractor', color: '#fb923c', numberedTo: 25, productionCount: 6250, valueMultiplier: 120.0, avgPrice: 18.00, tier: 'super_rare' },
  { id: 'pb-008', setId: 'set-001', parallelName: 'Red Refractor', color: '#ef4444', numberedTo: 5, productionCount: 1250, valueMultiplier: 500.0, avgPrice: 75.00, tier: 'ultra_rare' },
  { id: 'pb-009', setId: 'set-001', parallelName: 'Superfractor', color: '#fef08a', numberedTo: 1, productionCount: 250, valueMultiplier: 5000.0, avgPrice: 750.00, tier: 'one_of_one' },
  // Prizm Basketball parallels
  { id: 'pb-010', setId: 'set-002', parallelName: 'Base', color: '#94a3b8', numberedTo: null, productionCount: 7200000, valueMultiplier: 1.0, avgPrice: 0.20, tier: 'base' },
  { id: 'pb-011', setId: 'set-002', parallelName: 'Silver', color: '#cbd5e1', numberedTo: null, productionCount: 1800000, valueMultiplier: 8.0, avgPrice: 1.60, tier: 'common' },
  { id: 'pb-012', setId: 'set-002', parallelName: 'Red White Blue', color: '#3b82f6', numberedTo: null, productionCount: 900000, valueMultiplier: 12.0, avgPrice: 2.40, tier: 'common' },
  { id: 'pb-013', setId: 'set-002', parallelName: 'Blue Ice', color: '#38bdf8', numberedTo: 99, productionCount: 19800, valueMultiplier: 40.0, avgPrice: 8.00, tier: 'rare' },
  { id: 'pb-014', setId: 'set-002', parallelName: 'Green', color: '#22c55e', numberedTo: 75, productionCount: 15000, valueMultiplier: 55.0, avgPrice: 11.00, tier: 'rare' },
  { id: 'pb-015', setId: 'set-002', parallelName: 'Orange', color: '#fb923c', numberedTo: 49, productionCount: 9800, valueMultiplier: 80.0, avgPrice: 16.00, tier: 'super_rare' },
  { id: 'pb-016', setId: 'set-002', parallelName: 'Gold', color: '#fbbf24', numberedTo: 10, productionCount: 2000, valueMultiplier: 300.0, avgPrice: 60.00, tier: 'ultra_rare' },
  { id: 'pb-017', setId: 'set-002', parallelName: 'Black', color: '#1e293b', numberedTo: 1, productionCount: 200, valueMultiplier: 8000.0, avgPrice: 1600.00, tier: 'one_of_one' },
  // National Treasures parallels
  { id: 'pb-018', setId: 'set-013', parallelName: 'Base', color: '#94a3b8', numberedTo: 99, productionCount: 19800, valueMultiplier: 1.0, avgPrice: 25.00, tier: 'base' },
  { id: 'pb-019', setId: 'set-013', parallelName: 'Silver', color: '#cbd5e1', numberedTo: 49, productionCount: 9800, valueMultiplier: 2.5, avgPrice: 62.50, tier: 'uncommon' },
  { id: 'pb-020', setId: 'set-013', parallelName: 'Gold', color: '#fbbf24', numberedTo: 25, productionCount: 5000, valueMultiplier: 5.0, avgPrice: 125.00, tier: 'rare' },
  { id: 'pb-021', setId: 'set-013', parallelName: 'Emerald', color: '#10b981', numberedTo: 10, productionCount: 2000, valueMultiplier: 12.0, avgPrice: 300.00, tier: 'super_rare' },
  { id: 'pb-022', setId: 'set-013', parallelName: 'Sapphire', color: '#3b82f6', numberedTo: 5, productionCount: 1000, valueMultiplier: 25.0, avgPrice: 625.00, tier: 'ultra_rare' },
  { id: 'pb-023', setId: 'set-013', parallelName: 'Platinum', color: '#e2e8f0', numberedTo: 1, productionCount: 200, valueMultiplier: 100.0, avgPrice: 2500.00, tier: 'one_of_one' },
];

// ---- Mock Production Trends ----

const MOCK_PRODUCTION_TRENDS: ProductionTrend[] = [
  { year: 2020, manufacturer: 'topps', totalCardsProduced: 280000000, totalSetsReleased: 18, avgPrintRun: 5200000, marketRevenue: 1800000000 },
  { year: 2021, manufacturer: 'topps', totalCardsProduced: 420000000, totalSetsReleased: 22, avgPrintRun: 7800000, marketRevenue: 3200000000 },
  { year: 2022, manufacturer: 'topps', totalCardsProduced: 510000000, totalSetsReleased: 25, avgPrintRun: 9500000, marketRevenue: 3800000000 },
  { year: 2023, manufacturer: 'topps', totalCardsProduced: 580000000, totalSetsReleased: 28, avgPrintRun: 10800000, marketRevenue: 3500000000 },
  { year: 2024, manufacturer: 'topps', totalCardsProduced: 620000000, totalSetsReleased: 30, avgPrintRun: 11500000, marketRevenue: 3200000000 },
  { year: 2020, manufacturer: 'panini', totalCardsProduced: 320000000, totalSetsReleased: 24, avgPrintRun: 4800000, marketRevenue: 2100000000 },
  { year: 2021, manufacturer: 'panini', totalCardsProduced: 480000000, totalSetsReleased: 30, avgPrintRun: 7200000, marketRevenue: 3600000000 },
  { year: 2022, manufacturer: 'panini', totalCardsProduced: 560000000, totalSetsReleased: 34, avgPrintRun: 8400000, marketRevenue: 4100000000 },
  { year: 2023, manufacturer: 'panini', totalCardsProduced: 640000000, totalSetsReleased: 38, avgPrintRun: 9600000, marketRevenue: 3900000000 },
  { year: 2024, manufacturer: 'panini', totalCardsProduced: 700000000, totalSetsReleased: 40, avgPrintRun: 10200000, marketRevenue: 3600000000 },
  { year: 2020, manufacturer: 'upper_deck', totalCardsProduced: 80000000, totalSetsReleased: 12, avgPrintRun: 2400000, marketRevenue: 650000000 },
  { year: 2021, manufacturer: 'upper_deck', totalCardsProduced: 95000000, totalSetsReleased: 14, avgPrintRun: 2800000, marketRevenue: 820000000 },
  { year: 2022, manufacturer: 'upper_deck', totalCardsProduced: 105000000, totalSetsReleased: 14, avgPrintRun: 3000000, marketRevenue: 900000000 },
  { year: 2023, manufacturer: 'upper_deck', totalCardsProduced: 110000000, totalSetsReleased: 15, avgPrintRun: 3100000, marketRevenue: 880000000 },
  { year: 2024, manufacturer: 'upper_deck', totalCardsProduced: 115000000, totalSetsReleased: 15, avgPrintRun: 3200000, marketRevenue: 850000000 },
  { year: 2020, manufacturer: 'fanatics', totalCardsProduced: 0, totalSetsReleased: 0, avgPrintRun: 0, marketRevenue: 0 },
  { year: 2021, manufacturer: 'fanatics', totalCardsProduced: 0, totalSetsReleased: 0, avgPrintRun: 0, marketRevenue: 0 },
  { year: 2022, manufacturer: 'fanatics', totalCardsProduced: 0, totalSetsReleased: 0, avgPrintRun: 0, marketRevenue: 0 },
  { year: 2023, manufacturer: 'fanatics', totalCardsProduced: 10000000, totalSetsReleased: 2, avgPrintRun: 5000000, marketRevenue: 120000000 },
  { year: 2024, manufacturer: 'fanatics', totalCardsProduced: 45000000, totalSetsReleased: 6, avgPrintRun: 5500000, marketRevenue: 480000000 },
  { year: 2020, manufacturer: 'leaf', totalCardsProduced: 35000000, totalSetsReleased: 8, avgPrintRun: 1800000, marketRevenue: 180000000 },
  { year: 2021, manufacturer: 'leaf', totalCardsProduced: 42000000, totalSetsReleased: 10, avgPrintRun: 2000000, marketRevenue: 240000000 },
  { year: 2022, manufacturer: 'leaf', totalCardsProduced: 48000000, totalSetsReleased: 11, avgPrintRun: 2200000, marketRevenue: 260000000 },
  { year: 2023, manufacturer: 'leaf', totalCardsProduced: 50000000, totalSetsReleased: 12, avgPrintRun: 2300000, marketRevenue: 250000000 },
  { year: 2024, manufacturer: 'leaf', totalCardsProduced: 52000000, totalSetsReleased: 12, avgPrintRun: 2400000, marketRevenue: 240000000 },
];

// ---- Mock Market Absorption ----

const MOCK_MARKET_ABSORPTION: MarketAbsorption[] = [
  { id: 'ma-001', setId: 'set-007', setName: '2024 Bowman Baseball', totalProduced: 620000, totalSold: 285000, absorptionRate: 46.0, daysToAbsorb: 540, currentInventory: 335000, priceDecline: -42 },
  { id: 'ma-002', setId: 'set-005', setName: '2024 Topps Series 1 Baseball', totalProduced: 750000, totalSold: 380000, absorptionRate: 50.7, daysToAbsorb: 480, currentInventory: 370000, priceDecline: -38 },
  { id: 'ma-003', setId: 'set-003', setName: '2024 Donruss Football', totalProduced: 550000, totalSold: 240000, absorptionRate: 43.6, daysToAbsorb: 600, currentInventory: 310000, priceDecline: -52 },
  { id: 'ma-004', setId: 'set-001', setName: '2024 Topps Chrome Baseball', totalProduced: 420000, totalSold: 310000, absorptionRate: 73.8, daysToAbsorb: 210, currentInventory: 110000, priceDecline: -15 },
  { id: 'ma-005', setId: 'set-002', setName: '2024 Panini Prizm Basketball', totalProduced: 380000, totalSold: 290000, absorptionRate: 76.3, daysToAbsorb: 185, currentInventory: 90000, priceDecline: -12 },
  { id: 'ma-006', setId: 'set-013', setName: '2024 Panini National Treasures Basketball', totalProduced: 18000, totalSold: 18000, absorptionRate: 100.0, daysToAbsorb: 14, currentInventory: 0, priceDecline: 22 },
  { id: 'ma-007', setId: 'set-020', setName: '2024 Panini Flawless Basketball', totalProduced: 5000, totalSold: 5000, absorptionRate: 100.0, daysToAbsorb: 7, currentInventory: 0, priceDecline: 35 },
  { id: 'ma-008', setId: 'set-018', setName: '2024 Panini Prizm Football', totalProduced: 480000, totalSold: 320000, absorptionRate: 66.7, daysToAbsorb: 280, currentInventory: 160000, priceDecline: -22 },
];

// ---- Mock Supply/Demand Metrics ----

const MOCK_SUPPLY_DEMAND: SupplyDemandMetric[] = [
  { id: 'sd-001', setName: '2024 Topps Chrome Baseball', supplyIndex: 72, demandIndex: 68, equilibriumPrice: 135, currentPrice: 128, pricePressure: 'downward', imbalanceScore: 12 },
  { id: 'sd-002', setName: '2024 Panini Prizm Basketball', supplyIndex: 70, demandIndex: 74, equilibriumPrice: 210, currentPrice: 195, pricePressure: 'upward', imbalanceScore: 8 },
  { id: 'sd-003', setName: '2024 Donruss Football', supplyIndex: 88, demandIndex: 35, equilibriumPrice: 55, currentPrice: 48, pricePressure: 'downward', imbalanceScore: 58 },
  { id: 'sd-004', setName: '2024 Select Football', supplyIndex: 48, demandIndex: 82, equilibriumPrice: 280, currentPrice: 310, pricePressure: 'upward', imbalanceScore: 22 },
  { id: 'sd-005', setName: '2024 Bowman Baseball', supplyIndex: 92, demandIndex: 42, equilibriumPrice: 68, currentPrice: 55, pricePressure: 'downward', imbalanceScore: 62 },
  { id: 'sd-006', setName: '2024 National Treasures Basketball', supplyIndex: 15, demandIndex: 95, equilibriumPrice: 950, currentPrice: 1200, pricePressure: 'upward', imbalanceScore: 45 },
  { id: 'sd-007', setName: '2024 Upper Deck The Cup Hockey', supplyIndex: 12, demandIndex: 88, equilibriumPrice: 720, currentPrice: 850, pricePressure: 'upward', imbalanceScore: 40 },
  { id: 'sd-008', setName: '2024 Topps Series 1 Baseball', supplyIndex: 85, demandIndex: 40, equilibriumPrice: 32, currentPrice: 28, pricePressure: 'downward', imbalanceScore: 55 },
  { id: 'sd-009', setName: '2024 Panini Prizm Football', supplyIndex: 78, demandIndex: 62, equilibriumPrice: 175, currentPrice: 160, pricePressure: 'downward', imbalanceScore: 18 },
  { id: 'sd-010', setName: '2024 Panini Flawless Basketball', supplyIndex: 8, demandIndex: 96, equilibriumPrice: 2800, currentPrice: 3500, pricePressure: 'upward', imbalanceScore: 52 },
];

// ---- Mock Insert Odds ----

const MOCK_INSERT_ODDS: InsertOdds[] = [
  { id: 'io-001', setId: 'set-001', insertName: 'Chrome Stars', odds: '1:8', estimatedHits: 3, avgValue: 2.50, evPerBox: 7.50 },
  { id: 'io-002', setId: 'set-001', insertName: 'Future Stars', odds: '1:12', estimatedHits: 2, avgValue: 4.00, evPerBox: 8.00 },
  { id: 'io-003', setId: 'set-001', insertName: 'Chrome Autograph', odds: '1:box', estimatedHits: 2, avgValue: 25.00, evPerBox: 50.00 },
  { id: 'io-004', setId: 'set-002', insertName: 'Emergent', odds: '1:6', estimatedHits: 2, avgValue: 3.00, evPerBox: 6.00 },
  { id: 'io-005', setId: 'set-002', insertName: 'Fireworks', odds: '1:10', estimatedHits: 1, avgValue: 5.50, evPerBox: 5.50 },
  { id: 'io-006', setId: 'set-002', insertName: 'Prizm Auto', odds: '1:box', estimatedHits: 1, avgValue: 40.00, evPerBox: 40.00 },
  { id: 'io-007', setId: 'set-013', insertName: 'Rookie Patch Auto', odds: '1:2', estimatedHits: 4, avgValue: 150.00, evPerBox: 600.00 },
  { id: 'io-008', setId: 'set-013', insertName: 'Logoman', odds: '1:case', estimatedHits: 0.08, avgValue: 5000.00, evPerBox: 400.00 },
  { id: 'io-009', setId: 'set-004', insertName: 'Select Signatures', odds: '1:4', estimatedHits: 3, avgValue: 18.00, evPerBox: 54.00 },
  { id: 'io-010', setId: 'set-004', insertName: 'XFactor', odds: '1:8', estimatedHits: 1, avgValue: 8.00, evPerBox: 8.00 },
  { id: 'io-011', setId: 'set-018', insertName: 'Prizm Rookie Auto', odds: '1:box', estimatedHits: 1, avgValue: 35.00, evPerBox: 35.00 },
  { id: 'io-012', setId: 'set-018', insertName: 'Stained Glass', odds: '1:20', estimatedHits: 0.6, avgValue: 12.00, evPerBox: 7.20 },
];

// ---- localStorage Helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

// ---- Helper Functions ----

export function getManufacturerConfig(manufacturer: Manufacturer): { label: string; text: string; bg: string; border: string } {
  const configs: Record<Manufacturer, { label: string; text: string; bg: string; border: string }> = {
    panini: { label: 'Panini', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    topps: { label: 'Topps', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    upper_deck: { label: 'Upper Deck', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    fanatics: { label: 'Fanatics', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    leaf: { label: 'Leaf', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    sage: { label: 'SAGE', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    onyx: { label: 'Onyx', text: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    wild_card: { label: 'Wild Card', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  };
  return configs[manufacturer];
}

export function getSeverityConfig(severity: string): { label: string; text: string; bg: string; border: string } {
  const configs: Record<string, { label: string; text: string; bg: string; border: string }> = {
    low: { label: 'Low', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    moderate: { label: 'Moderate', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    medium: { label: 'Medium', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { label: 'High', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    critical: { label: 'Critical', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  return configs[severity] ?? configs['low'];
}

export function formatCurrency(val: number): string {
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

export function formatNumber(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

// ---- Exported Service Functions ----

export function getProductSets(manufacturer?: Manufacturer): ProductSet[] {
  const cached = loadData<ProductSet[]>('product_sets');
  const data = cached ?? MOCK_PRODUCT_SETS;
  if (!cached) saveData('product_sets', data);
  if (manufacturer) return data.filter(s => s.manufacturer === manufacturer);
  return [...data];
}

export function getPrintRunData(setId?: string): PrintRunData[] {
  const cached = loadData<PrintRunData[]>('print_run_data');
  const breakdowns = cached ?? MOCK_PARALLEL_BREAKDOWNS.map(pb => ({
    id: pb.id,
    setId: pb.setId,
    setName: MOCK_PRODUCT_SETS.find(s => s.id === pb.setId)?.name ?? 'Unknown',
    parallelName: pb.parallelName,
    numberedTo: pb.numberedTo,
    estimatedPrintRun: pb.productionCount,
    confirmedPrintRun: pb.numberedTo !== null,
    valueMultiplier: pb.valueMultiplier,
    avgSalePrice: pb.avgPrice,
    color: pb.color,
  }));
  if (!cached) saveData('print_run_data', breakdowns);
  if (setId) return breakdowns.filter(d => d.setId === setId);
  return [...breakdowns];
}

export function getScarcityIndices(): ScarcityIndex[] {
  const cached = loadData<ScarcityIndex[]>('scarcity_indices');
  const data = cached ?? MOCK_SCARCITY_INDICES;
  if (!cached) saveData('scarcity_indices', data);
  return [...data];
}

export function getSaturationAlerts(): SaturationAlert[] {
  const cached = loadData<SaturationAlert[]>('saturation_alerts');
  const data = cached ?? MOCK_SATURATION_ALERTS;
  if (!cached) saveData('saturation_alerts', data);
  return [...data];
}

export function getParallelBreakdown(setId?: string): ParallelBreakdown[] {
  const cached = loadData<ParallelBreakdown[]>('parallel_breakdowns');
  const data = cached ?? MOCK_PARALLEL_BREAKDOWNS;
  if (!cached) saveData('parallel_breakdowns', data);
  if (setId) return data.filter(pb => pb.setId === setId);
  return [...data];
}

export function getProductionTrends(): ProductionTrend[] {
  const cached = loadData<ProductionTrend[]>('production_trends');
  const data = cached ?? MOCK_PRODUCTION_TRENDS;
  if (!cached) saveData('production_trends', data);
  return [...data];
}

export function getSetComparison(setIds?: string[]): SetComparison[] {
  const sets = getProductSets();
  const indices = getScarcityIndices();
  const comparisons: SetComparison[] = sets
    .filter(s => !setIds || setIds.includes(s.id))
    .map(s => {
      const idx = indices.find(i => i.setId === s.id);
      return {
        setId: s.id,
        setName: s.name,
        manufacturer: s.manufacturer,
        printRun: s.baseRunEstimate,
        parallelCount: s.totalParallels,
        avgBasePrice: s.msrp,
        scarcityScore: idx?.scarcityScore ?? 50,
        overproductionScore: s.overproductionScore,
        roi12m: s.overproductionScore > 70 ? -(s.overproductionScore * 0.6) : (100 - s.overproductionScore) * 0.3,
      };
    });
  return comparisons;
}

export function getMarketAbsorption(): MarketAbsorption[] {
  const cached = loadData<MarketAbsorption[]>('market_absorption');
  const data = cached ?? MOCK_MARKET_ABSORPTION;
  if (!cached) saveData('market_absorption', data);
  return [...data];
}

export function getSupplyDemandMetrics(): SupplyDemandMetric[] {
  const cached = loadData<SupplyDemandMetric[]>('supply_demand');
  const data = cached ?? MOCK_SUPPLY_DEMAND;
  if (!cached) saveData('supply_demand', data);
  return [...data];
}

export function getInsertOdds(setId?: string): InsertOdds[] {
  const cached = loadData<InsertOdds[]>('insert_odds');
  const data = cached ?? MOCK_INSERT_ODDS;
  if (!cached) saveData('insert_odds', data);
  if (setId) return data.filter(io => io.setId === setId);
  return [...data];
}

export function calculateOverproductionScore(setId: string): OverproductionScore | null {
  const set = MOCK_PRODUCT_SETS.find(s => s.id === setId);
  if (!set) return null;

  const factors = [
    { name: 'Base Print Run', weight: 0.3, value: Math.min(100, (set.baseRunEstimate / 20000000) * 100) },
    { name: 'Parallel Count', weight: 0.2, value: Math.min(100, (set.totalParallels / 35) * 100) },
    { name: 'Box Production', weight: 0.25, value: Math.min(100, (set.boxesProduced / 800000) * 100) },
    { name: 'Market Demand Inverse', weight: 0.15, value: set.marketDemand === 'very_low' ? 100 : set.marketDemand === 'low' ? 75 : set.marketDemand === 'moderate' ? 50 : set.marketDemand === 'high' ? 25 : 10 },
    { name: 'Retail Saturation', weight: 0.1, value: set.msrp < 100 ? 80 : set.msrp < 200 ? 50 : 20 },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.weight * f.value, 0));
  const riskLevel = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'moderate' : 'low';
  const recommendation = score >= 80
    ? 'Avoid purchasing base cards. Only chase low-numbered parallels and autos.'
    : score >= 60
    ? 'Exercise caution. Focus on key rookies and numbered inserts only.'
    : score >= 40
    ? 'Reasonable production levels. Standard collecting strategy applies.'
    : 'Scarce product with strong value retention potential. Good investment opportunity.';

  return { setId, setName: set.name, score, factors, recommendation, riskLevel };
}

export function getManufacturerProfile(manufacturer: Manufacturer): {
  manufacturer: Manufacturer;
  label: string;
  color: string;
  totalSets: number;
  totalCardsProduced: number;
  avgOverproduction: number;
  topSet: string;
  marketShare: number;
} {
  const sets = MOCK_PRODUCT_SETS.filter(s => s.manufacturer === manufacturer);
  const trends = MOCK_PRODUCTION_TRENDS.filter(t => t.manufacturer === manufacturer);
  const latestYear = trends.find(t => t.year === 2024);
  const totalAllManufacturers = MOCK_PRODUCTION_TRENDS.filter(t => t.year === 2024).reduce((sum, t) => sum + t.totalCardsProduced, 0);

  const topSet = [...sets].sort((a, b) => a.overproductionScore - b.overproductionScore)[0];

  return {
    manufacturer,
    label: MANUFACTURER_LABELS[manufacturer],
    color: MANUFACTURER_COLORS[manufacturer],
    totalSets: sets.length,
    totalCardsProduced: latestYear?.totalCardsProduced ?? 0,
    avgOverproduction: sets.length > 0 ? Math.round(sets.reduce((sum, s) => sum + s.overproductionScore, 0) / sets.length) : 0,
    topSet: topSet?.name ?? 'N/A',
    marketShare: totalAllManufacturers > 0 ? Math.round(((latestYear?.totalCardsProduced ?? 0) / totalAllManufacturers) * 1000) / 10 : 0,
  };
}

export function getTrueScarcity(cardId: string): {
  cardId: string;
  trueScarcityScore: number;
  adjustedPopulation: number;
  hoarded: number;
  inCirculation: number;
  gradedPopulation: number;
  rawEstimate: number;
  verdict: string;
} {
  const hash = cardId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const totalPop = 5000 + (hash % 50000);
  const gradedPct = 0.2 + (hash % 40) / 100;
  const hoardedPct = 0.1 + (hash % 30) / 100;
  const gradedPopulation = Math.round(totalPop * gradedPct);
  const hoarded = Math.round(totalPop * hoardedPct);
  const inCirculation = totalPop - hoarded;
  const trueScarcityScore = Math.max(5, Math.min(100, Math.round(100 - (inCirculation / 500))));

  const verdict = trueScarcityScore >= 80
    ? 'Genuinely scarce. Strong hold recommendation.'
    : trueScarcityScore >= 50
    ? 'Moderate scarcity. Price dependent on demand shifts.'
    : 'Commonly available. Value primarily driven by player performance.';

  return { cardId, trueScarcityScore, adjustedPopulation: totalPop, hoarded, inCirculation, gradedPopulation, rawEstimate: totalPop - gradedPopulation, verdict };
}
