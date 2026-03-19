// Phase 250 — Edition Print Run Intelligence Service
// Tracks and estimates print run sizes for card sets to assess scarcity and value

// ---- Types ----

export interface PrintRunEstimate {
  id: string;
  set: string;
  year: number;
  parallel: string;
  estimatedPopulation: number;
  confirmedPop: number;
  popGrowthRate: number;
  scarcityTier: 'ultra-rare' | 'rare' | 'limited' | 'common';
  pricePerPop: number;
}

export interface PrintRunTrend {
  set: string;
  monthlyNewSlabs: number;
  saturationEstimate: number;
}

// ---- Mock Data ----

const printRunEstimates: PrintRunEstimate[] = [
  {
    id: 'pr-001',
    set: 'Panini Prizm',
    year: 2023,
    parallel: 'Gold /10',
    estimatedPopulation: 10,
    confirmedPop: 7,
    popGrowthRate: 0.8,
    scarcityTier: 'ultra-rare',
    pricePerPop: 4200,
  },
  {
    id: 'pr-002',
    set: 'Topps Chrome',
    year: 2024,
    parallel: 'Refractor',
    estimatedPopulation: 3500,
    confirmedPop: 1820,
    popGrowthRate: 12.5,
    scarcityTier: 'common',
    pricePerPop: 18,
  },
  {
    id: 'pr-003',
    set: 'Panini National Treasures',
    year: 2023,
    parallel: 'Base RPA /99',
    estimatedPopulation: 99,
    confirmedPop: 64,
    popGrowthRate: 2.1,
    scarcityTier: 'rare',
    pricePerPop: 850,
  },
  {
    id: 'pr-004',
    set: 'Bowman Chrome',
    year: 2024,
    parallel: 'Green Shimmer /99',
    estimatedPopulation: 99,
    confirmedPop: 38,
    popGrowthRate: 4.3,
    scarcityTier: 'rare',
    pricePerPop: 320,
  },
  {
    id: 'pr-005',
    set: 'Topps Update',
    year: 2023,
    parallel: 'Base',
    estimatedPopulation: 250000,
    confirmedPop: 14200,
    popGrowthRate: 85.0,
    scarcityTier: 'common',
    pricePerPop: 0.45,
  },
  {
    id: 'pr-006',
    set: 'Panini Flawless',
    year: 2023,
    parallel: 'Ruby /15',
    estimatedPopulation: 15,
    confirmedPop: 11,
    popGrowthRate: 0.5,
    scarcityTier: 'ultra-rare',
    pricePerPop: 6800,
  },
  {
    id: 'pr-007',
    set: 'Upper Deck Young Guns',
    year: 2024,
    parallel: 'Exclusives /100',
    estimatedPopulation: 100,
    confirmedPop: 52,
    popGrowthRate: 3.8,
    scarcityTier: 'limited',
    pricePerPop: 275,
  },
  {
    id: 'pr-008',
    set: 'Topps Chrome',
    year: 2023,
    parallel: 'Sapphire /75',
    estimatedPopulation: 75,
    confirmedPop: 41,
    popGrowthRate: 1.9,
    scarcityTier: 'limited',
    pricePerPop: 510,
  },
];

const printRunTrends: PrintRunTrend[] = [
  {
    set: '2024 Topps Chrome',
    monthlyNewSlabs: 340,
    saturationEstimate: 0.52,
  },
  {
    set: '2023 Panini Prizm Basketball',
    monthlyNewSlabs: 520,
    saturationEstimate: 0.71,
  },
  {
    set: '2024 Bowman Chrome',
    monthlyNewSlabs: 185,
    saturationEstimate: 0.38,
  },
  {
    set: '2023 Panini National Treasures',
    monthlyNewSlabs: 28,
    saturationEstimate: 0.65,
  },
];

// ---- Service Functions ----

export function getPrintRunEstimates(): PrintRunEstimate[] {
  return [...printRunEstimates];
}

export function getPrintRunTrends(): PrintRunTrend[] {
  return [...printRunTrends];
}

export function getPrintRunStats() {
  const totalEstimates = printRunEstimates.length;
  const ultraRare = printRunEstimates.filter((e) => e.scarcityTier === 'ultra-rare').length;
  const rare = printRunEstimates.filter((e) => e.scarcityTier === 'rare').length;
  const limited = printRunEstimates.filter((e) => e.scarcityTier === 'limited').length;
  const common = printRunEstimates.filter((e) => e.scarcityTier === 'common').length;
  const avgPricePerPop =
    Math.round(printRunEstimates.reduce((sum, e) => sum + e.pricePerPop, 0) / totalEstimates);
  const avgPopGrowthRate =
    Math.round(
      (printRunEstimates.reduce((sum, e) => sum + e.popGrowthRate, 0) / totalEstimates) * 10
    ) / 10;
  const avgSaturation =
    Math.round(
      (printRunTrends.reduce((sum, t) => sum + t.saturationEstimate, 0) / printRunTrends.length) *
        100
    );

  return {
    totalEstimates,
    scarcityBreakdown: { 'ultra-rare': ultraRare, rare, limited, common },
    avgPricePerPop,
    avgPopGrowthRate,
    avgSaturation,
    totalMonthlyNewSlabs: printRunTrends.reduce((sum, t) => sum + t.monthlyNewSlabs, 0),
  };
}

const editionPrintRunService = {
  getPrintRunEstimates,
  getPrintRunTrends,
  getPrintRunStats,
};

export default editionPrintRunService;
