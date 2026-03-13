// Consignment Router Service — recommends optimal platform/auction house per card

// ── Types ──────────────────────────────────────────────────────────────

export type PlatformId = 'ebay' | 'pwcc' | 'heritage' | 'myslabs' | 'goldin' | 'comc';

export interface PlatformProfile {
  id: PlatformId;
  name: string;
  sellerFeeRate: number;       // percentage as decimal (0.13 = 13%)
  buyersPremium: number;       // percentage as decimal
  fixedFee: number;            // flat $ fee per transaction
  shippingCost: number;        // average seller-side shipping
  insuranceCost: number;
  avgDaysToSell: number;
  sellThroughRate: number;     // 0-1
  buyerPoolSize: number;       // estimated active buyers
  minLotValue: number;         // minimum value they accept
  specialties: string[];       // card categories they excel at
  tier: 'premium' | 'mid' | 'budget';
}

export interface ConsignmentOption {
  platform: PlatformProfile;
  estimatedSalePrice: number;
  fees: {
    sellerFee: number;
    buyersPremium: number;
    fixedFee: number;
    shipping: number;
    insurance: number;
    total: number;
  };
  netProceeds: number;
  sellThroughRate: number;
  avgDaysToSell: number;
  buyerPoolSize: number;
  recommendationScore: number; // 0-100
  reasoning: string;
}

export interface PlatformComparison {
  platformId: PlatformId;
  platformName: string;
  totalFeePercent: number;
  netProceedsAt500: number;
  netProceedsAt1000: number;
  netProceedsAt5000: number;
  netProceedsAt10000: number;
  sellThroughRate: number;
  avgDaysToSell: number;
  buyerPoolSize: number;
}

// ── Platform Data ──────────────────────────────────────────────────────

const PLATFORMS: PlatformProfile[] = [
  {
    id: 'ebay',
    name: 'eBay',
    sellerFeeRate: 0.1312,
    buyersPremium: 0,
    fixedFee: 0.30,
    shippingCost: 4.50,
    insuranceCost: 0,
    avgDaysToSell: 7,
    sellThroughRate: 0.82,
    buyerPoolSize: 2_400_000,
    minLotValue: 0,
    specialties: ['raw cards', 'low-mid value', 'modern', 'bulk lots'],
    tier: 'budget',
  },
  {
    id: 'pwcc',
    name: 'PWCC Marketplace',
    sellerFeeRate: 0.095,
    buyersPremium: 0,
    fixedFee: 0,
    shippingCost: 0,
    insuranceCost: 2.00,
    avgDaysToSell: 14,
    sellThroughRate: 0.91,
    buyerPoolSize: 185_000,
    minLotValue: 50,
    specialties: ['graded cards', 'mid-high value', 'vintage', 'modern stars'],
    tier: 'mid',
  },
  {
    id: 'heritage',
    name: 'Heritage Auctions',
    sellerFeeRate: 0.10,
    buyersPremium: 0.20,
    fixedFee: 0,
    shippingCost: 0,
    insuranceCost: 0,
    avgDaysToSell: 42,
    sellThroughRate: 0.95,
    buyerPoolSize: 320_000,
    minLotValue: 500,
    specialties: ['vintage', 'high-end', 'pre-war', 'museum quality'],
    tier: 'premium',
  },
  {
    id: 'myslabs',
    name: 'MySlabs',
    sellerFeeRate: 0.09,
    buyersPremium: 0,
    fixedFee: 0,
    shippingCost: 3.00,
    insuranceCost: 0,
    avgDaysToSell: 10,
    sellThroughRate: 0.78,
    buyerPoolSize: 95_000,
    minLotValue: 10,
    specialties: ['graded cards', 'modern', 'slabbed inventory'],
    tier: 'mid',
  },
  {
    id: 'goldin',
    name: 'Goldin Auctions',
    sellerFeeRate: 0.08,
    buyersPremium: 0.22,
    fixedFee: 0,
    shippingCost: 0,
    insuranceCost: 0,
    avgDaysToSell: 30,
    sellThroughRate: 0.93,
    buyerPoolSize: 250_000,
    minLotValue: 250,
    specialties: ['high-end', 'modern icons', 'basketball', 'football'],
    tier: 'premium',
  },
  {
    id: 'comc',
    name: 'COMC',
    sellerFeeRate: 0.05,
    buyersPremium: 0,
    fixedFee: 1.00,
    shippingCost: 0,
    insuranceCost: 0,
    avgDaysToSell: 21,
    sellThroughRate: 0.68,
    buyerPoolSize: 140_000,
    minLotValue: 0,
    specialties: ['raw cards', 'low value', 'bulk', 'commons'],
    tier: 'budget',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

function calcFees(platform: PlatformProfile, salePrice: number) {
  const sellerFee = salePrice * platform.sellerFeeRate;
  const buyersPremium = salePrice * platform.buyersPremium;
  const fixedFee = platform.fixedFee;
  const shipping = platform.shippingCost;
  const insurance = platform.insuranceCost;
  const total = sellerFee + fixedFee + shipping + insurance;
  return { sellerFee, buyersPremium, fixedFee, shipping, insurance, total };
}

function estimateSalePrice(baseValue: number, platform: PlatformProfile): number {
  // Premium auction houses often realize higher prices due to buyer competition
  const multipliers: Record<string, number> = {
    premium: 1.12,
    mid: 1.02,
    budget: 0.95,
  };
  const mult = multipliers[platform.tier] ?? 1;
  // Random-ish but deterministic variance per platform
  const seed = platform.id.charCodeAt(0) / 255;
  const variance = 0.96 + seed * 0.08;
  return Math.round(baseValue * mult * variance * 100) / 100;
}

function scoreOption(opt: Omit<ConsignmentOption, 'recommendationScore' | 'reasoning'>): number {
  // Weighted scoring: net proceeds (40%), sell-through (25%), speed (20%), buyer pool (15%)
  const maxNet = 50000;
  const netScore = Math.min(opt.netProceeds / maxNet, 1) * 40;
  const strScore = opt.sellThroughRate * 25;
  const speedScore = Math.max(0, (1 - opt.avgDaysToSell / 60)) * 20;
  const poolScore = Math.min(opt.buyerPoolSize / 2_500_000, 1) * 15;
  return Math.round(Math.min(netScore + strScore + speedScore + poolScore, 100));
}

function generateReasoning(opt: ConsignmentOption, rank: number): string {
  if (rank === 0) {
    const parts: string[] = ['Best overall value.'];
    if (opt.sellThroughRate >= 0.9) parts.push(`${(opt.sellThroughRate * 100).toFixed(0)}% sell-through rate.`);
    if (opt.avgDaysToSell <= 14) parts.push(`Fast turnaround (~${opt.avgDaysToSell} days).`);
    if (opt.fees.total / opt.estimatedSalePrice < 0.10) parts.push('Low total fees.');
    return parts.join(' ');
  }
  if (opt.avgDaysToSell <= 10) return 'Fastest time to sell among all options.';
  if (opt.sellThroughRate >= 0.93) return 'Highest sell-through rate — nearly guaranteed sale.';
  if (opt.buyerPoolSize >= 300_000) return 'Massive buyer pool increases competition.';
  if (opt.fees.total / opt.estimatedSalePrice < 0.07) return 'Lowest fee structure maximizes net proceeds.';
  return 'Solid alternative with competitive fees and reliable sales.';
}

// ── Public API ─────────────────────────────────────────────────────────

export function getConsignmentOptions(
  _cardDescription: string,
  estimatedValue: number,
): ConsignmentOption[] {
  const options = PLATFORMS
    .filter(p => estimatedValue >= p.minLotValue)
    .map(platform => {
      const est = estimateSalePrice(estimatedValue, platform);
      const fees = calcFees(platform, est);
      const netProceeds = Math.round((est - fees.total) * 100) / 100;
      const partial = {
        platform,
        estimatedSalePrice: est,
        fees,
        netProceeds,
        sellThroughRate: platform.sellThroughRate,
        avgDaysToSell: platform.avgDaysToSell,
        buyerPoolSize: platform.buyerPoolSize,
      };
      return { ...partial, recommendationScore: scoreOption(partial), reasoning: '' };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Fill reasoning based on rank
  return options.map((opt, i) => ({
    ...opt,
    reasoning: generateReasoning(opt, i),
  }));
}

export function getTopPlatforms(): PlatformProfile[] {
  return [...PLATFORMS].sort((a, b) => b.sellThroughRate - a.sellThroughRate);
}

export function getPlatformComparison(): PlatformComparison[] {
  return PLATFORMS.map(p => {
    const totalFeePercent = Math.round((p.sellerFeeRate + p.fixedFee / 1000) * 10000) / 100;
    const netAt = (val: number) => {
      const est = estimateSalePrice(val, p);
      const fees = calcFees(p, est);
      return Math.round((est - fees.total) * 100) / 100;
    };
    return {
      platformId: p.id,
      platformName: p.name,
      totalFeePercent,
      netProceedsAt500: netAt(500),
      netProceedsAt1000: netAt(1000),
      netProceedsAt5000: netAt(5000),
      netProceedsAt10000: netAt(10000),
      sellThroughRate: p.sellThroughRate,
      avgDaysToSell: p.avgDaysToSell,
      buyerPoolSize: p.buyerPoolSize,
    };
  });
}

export function getPlatformById(id: PlatformId): PlatformProfile | undefined {
  return PLATFORMS.find(p => p.id === id);
}

export function getAllPlatforms(): PlatformProfile[] {
  return [...PLATFORMS];
}

// ── Cross-reference: Liquidity Intelligence (Phase 68) ────────────────────────
// Bridge functions to integrate liquidity scoring with consignment recommendations

import type { CardInventory } from '../types';

export interface LiquidityEnrichedConsignment {
  options: ConsignmentOption[];
  liquidityScore: number;
  liquidityTier: string;
  avgDaysToSell: number;
  liquidityRecommendation: string;
}

/**
 * Enriches consignment recommendations with liquidity intelligence from Phase 68.
 * Uses the card's liquidity score to adjust platform recommendations
 * and identify optimal timing for consignment.
 */
export function getLiquidityEnrichedConsignment(
  card: CardInventory,
  estimatedValue: number,
): LiquidityEnrichedConsignment {
  const options = getConsignmentOptions(
    `${card.year} ${card.manufacturer} ${card.player}`,
    estimatedValue,
  );

  // Import liquidity functions dynamically
  let liquidityScore = 50;
  let liquidityTier = 'Moderate';
  let avgDaysToSell = 30;

  try {
    const { calculateDetailedLiquidityScore } = require('./liquidityService');
    const detail = calculateDetailedLiquidityScore(card);
    liquidityScore = detail.overall;
    liquidityTier = detail.tier;
    avgDaysToSell = detail.avgDaysToSell;
  } catch {
    // Liquidity service unavailable, use defaults
  }

  let liquidityRecommendation: string;
  if (liquidityScore >= 75) {
    liquidityRecommendation =
      'High liquidity card — eBay or MySlabs recommended for fastest sale. Premium auction houses may not be necessary.';
  } else if (liquidityScore >= 50) {
    liquidityRecommendation =
      'Moderate liquidity — PWCC or Goldin recommended for best price realization. Allow 2-4 weeks for optimal sale.';
  } else {
    liquidityRecommendation =
      'Low liquidity card — Heritage Auctions or Goldin recommended. Premium platforms attract the niche buyers needed for illiquid cards.';
  }

  return {
    options,
    liquidityScore,
    liquidityTier,
    avgDaysToSell,
    liquidityRecommendation,
  };
}

export default {
  getConsignmentOptions,
  getTopPlatforms,
  getPlatformComparison,
  getPlatformById,
  getAllPlatforms,
  getLiquidityEnrichedConsignment,
};
