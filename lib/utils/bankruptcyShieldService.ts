// Bankruptcy Shield Service - Worst-case liquidation planner
// Feature #140: Collection Bankruptcy Shield

import { escapeHtml } from '../htmlEscape';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type LiquidityTierLevel = 1 | 2 | 3 | 4;

export interface LiquidityTier {
  level: LiquidityTierLevel;
  name: string;
  description: string;
  discountPercent: number;
  estimatedDays: number;
  channel: string;
}

export interface FireSaleValue {
  timeframe: '24hr' | '7d' | '30d';
  label: string;
  value: number;
  discountPercent: number;
  recoveryRatio: number;
}

export interface LiquidationAsset {
  id: string;
  playerName: string;
  cardYear: number;
  cardSet: string;
  cardNumber: string;
  grade: string;
  grader: string;
  marketValue: number;
  fireSaleValues: FireSaleValue[];
  liquidityScore: number; // 0-100
  liquidityTier: LiquidityTierLevel;
  optimalChannel: string;
  estimatedSaleDays: number;
  demandIndex: number; // 0-100
  volatility: number; // 0-1
  category: 'football' | 'basketball' | 'baseball' | 'hockey';
  imageUrl?: string;
}

export interface LiquidationPlan {
  id: string;
  createdAt: string;
  totalPortfolioValue: number;
  totalFireSale24hr: number;
  totalFireSale7d: number;
  totalFireSale30d: number;
  orderedAssets: LiquidationAsset[];
  estimatedRecovery: number;
  estimatedRecoveryPercent: number;
  timeline: string;
}

export interface RecoveryScenario {
  strategy: string;
  description: string;
  estimatedRecovery: number;
  recoveryPercent: number;
  timelineDays: number;
  riskLevel: 'low' | 'medium' | 'high';
  fees: number;
  netProceeds: number;
  steps: string[];
}

export interface CashOutPlan {
  id: string;
  generatedAt: string;
  urgency: 'immediate' | 'week' | 'month';
  targetAmount: number;
  totalRecovery: number;
  steps: CashOutStep[];
  summary: CashOutSummary;
}

export interface CashOutStep {
  order: number;
  action: string;
  asset: LiquidationAsset;
  channel: string;
  expectedProceeds: number;
  estimatedDays: number;
  cumulativeRecovery: number;
  notes: string;
}

export interface CashOutSummary {
  totalAssets: number;
  totalMarketValue: number;
  totalExpectedRecovery: number;
  recoveryPercent: number;
  estimatedCompletionDays: number;
  highestRecoveryAsset: string;
  lowestRecoveryAsset: string;
  averageDiscountPercent: number;
}

// ─── Liquidity Tiers ──────────────────────────────────────────────────────────

export const LIQUIDITY_TIERS: LiquidityTier[] = [
  {
    level: 1,
    name: 'Instant Liquidity',
    description: 'eBay Buy-It-Now at aggressive pricing for immediate sale',
    discountPercent: 5,
    estimatedDays: 1,
    channel: 'eBay BIN',
  },
  {
    level: 2,
    name: 'Quick Auction',
    description: '3-day auction format with low starting bid to attract buyers',
    discountPercent: 10,
    estimatedDays: 3,
    channel: '3-Day Auction',
  },
  {
    level: 3,
    name: 'Consignment',
    description: 'Consignment through major auction houses for maximum reach',
    discountPercent: 15,
    estimatedDays: 14,
    channel: 'Consignment',
  },
  {
    level: 4,
    name: 'Fire Sale / Bulk',
    description: 'Bulk dealer buyout or lot sales at steep discounts',
    discountPercent: 32,
    estimatedDays: 1,
    channel: 'Dealer Buyout',
  },
];

// ─── Mock Portfolio Data ──────────────────────────────────────────────────────

function computeFireSaleValues(marketValue: number, liquidityScore: number): FireSaleValue[] {
  const baseDiscount24hr = 0.30 + (1 - liquidityScore / 100) * 0.15;
  const baseDiscount7d = 0.15 + (1 - liquidityScore / 100) * 0.10;
  const baseDiscount30d = 0.05 + (1 - liquidityScore / 100) * 0.08;

  return [
    {
      timeframe: '24hr',
      label: '24 Hours',
      value: Math.round(marketValue * (1 - baseDiscount24hr)),
      discountPercent: Math.round(baseDiscount24hr * 100),
      recoveryRatio: parseFloat((1 - baseDiscount24hr).toFixed(3)),
    },
    {
      timeframe: '7d',
      label: '7 Days',
      value: Math.round(marketValue * (1 - baseDiscount7d)),
      discountPercent: Math.round(baseDiscount7d * 100),
      recoveryRatio: parseFloat((1 - baseDiscount7d).toFixed(3)),
    },
    {
      timeframe: '30d',
      label: '30 Days',
      value: Math.round(marketValue * (1 - baseDiscount30d)),
      discountPercent: Math.round(baseDiscount30d * 100),
      recoveryRatio: parseFloat((1 - baseDiscount30d).toFixed(3)),
    },
  ];
}

function assignLiquidityTier(liquidityScore: number): LiquidityTierLevel {
  if (liquidityScore >= 80) return 1;
  if (liquidityScore >= 60) return 2;
  if (liquidityScore >= 40) return 3;
  return 4;
}

function assignOptimalChannel(tier: LiquidityTierLevel): string {
  const tierData = LIQUIDITY_TIERS.find((t) => t.level === tier);
  return tierData?.channel ?? 'eBay BIN';
}

const MOCK_ASSETS_RAW: Omit<LiquidationAsset, 'fireSaleValues' | 'liquidityTier' | 'optimalChannel' | 'estimatedSaleDays'>[] = [
  { id: 'bs-001', playerName: 'Patrick Mahomes', cardYear: 2017, cardSet: 'Panini Prizm', cardNumber: '#269', grade: 'PSA 10', grader: 'PSA', marketValue: 48500, liquidityScore: 95, demandIndex: 98, volatility: 0.12, category: 'football' },
  { id: 'bs-002', playerName: 'Luka Doncic', cardYear: 2018, cardSet: 'Panini Prizm', cardNumber: '#280', grade: 'PSA 10', grader: 'PSA', marketValue: 32000, liquidityScore: 92, demandIndex: 95, volatility: 0.18, category: 'basketball' },
  { id: 'bs-003', playerName: 'Josh Allen', cardYear: 2018, cardSet: 'Panini Prizm', cardNumber: '#205', grade: 'PSA 10', grader: 'PSA', marketValue: 12800, liquidityScore: 88, demandIndex: 90, volatility: 0.15, category: 'football' },
  { id: 'bs-004', playerName: 'Shohei Ohtani', cardYear: 2018, cardSet: 'Topps Update', cardNumber: '#US1', grade: 'PSA 10', grader: 'PSA', marketValue: 9200, liquidityScore: 85, demandIndex: 88, volatility: 0.22, category: 'baseball' },
  { id: 'bs-005', playerName: 'Joe Burrow', cardYear: 2020, cardSet: 'Panini Prizm', cardNumber: '#307', grade: 'PSA 10', grader: 'PSA', marketValue: 7500, liquidityScore: 82, demandIndex: 85, volatility: 0.20, category: 'football' },
  { id: 'bs-006', playerName: 'Ja Morant', cardYear: 2019, cardSet: 'Panini Prizm', cardNumber: '#249', grade: 'PSA 10', grader: 'PSA', marketValue: 5800, liquidityScore: 78, demandIndex: 80, volatility: 0.25, category: 'basketball' },
  { id: 'bs-007', playerName: 'Justin Herbert', cardYear: 2020, cardSet: 'Panini Prizm', cardNumber: '#325', grade: 'PSA 10', grader: 'PSA', marketValue: 4200, liquidityScore: 75, demandIndex: 78, volatility: 0.19, category: 'football' },
  { id: 'bs-008', playerName: 'Connor McDavid', cardYear: 2015, cardSet: 'Upper Deck Young Guns', cardNumber: '#201', grade: 'PSA 10', grader: 'PSA', marketValue: 18500, liquidityScore: 70, demandIndex: 82, volatility: 0.14, category: 'hockey' },
  { id: 'bs-009', playerName: 'Victor Wembanyama', cardYear: 2023, cardSet: 'Panini Prizm', cardNumber: '#275', grade: 'PSA 10', grader: 'PSA', marketValue: 15000, liquidityScore: 90, demandIndex: 96, volatility: 0.35, category: 'basketball' },
  { id: 'bs-010', playerName: 'CJ Stroud', cardYear: 2023, cardSet: 'Panini Prizm', cardNumber: '#301', grade: 'PSA 10', grader: 'PSA', marketValue: 3800, liquidityScore: 72, demandIndex: 75, volatility: 0.28, category: 'football' },
  { id: 'bs-011', playerName: 'Anthony Edwards', cardYear: 2020, cardSet: 'Panini Prizm', cardNumber: '#258', grade: 'PSA 10', grader: 'PSA', marketValue: 6400, liquidityScore: 84, demandIndex: 87, volatility: 0.21, category: 'basketball' },
  { id: 'bs-012', playerName: 'Mike Trout', cardYear: 2011, cardSet: 'Topps Update', cardNumber: '#US175', grade: 'PSA 10', grader: 'PSA', marketValue: 42000, liquidityScore: 68, demandIndex: 72, volatility: 0.10, category: 'baseball' },
  { id: 'bs-013', playerName: 'Trevor Lawrence', cardYear: 2021, cardSet: 'Panini Prizm', cardNumber: '#331', grade: 'PSA 10', grader: 'PSA', marketValue: 2400, liquidityScore: 60, demandIndex: 58, volatility: 0.30, category: 'football' },
  { id: 'bs-014', playerName: 'Caleb Williams', cardYear: 2024, cardSet: 'Panini Prizm', cardNumber: '#341', grade: 'BGS 9.5', grader: 'BGS', marketValue: 2800, liquidityScore: 65, demandIndex: 70, volatility: 0.40, category: 'football' },
  { id: 'bs-015', playerName: 'Caitlin Clark', cardYear: 2024, cardSet: 'Panini Prizm WNBA', cardNumber: '#101', grade: 'PSA 10', grader: 'PSA', marketValue: 8500, liquidityScore: 88, demandIndex: 92, volatility: 0.32, category: 'basketball' },
  { id: 'bs-016', playerName: 'Auston Matthews', cardYear: 2016, cardSet: 'Upper Deck Young Guns', cardNumber: '#201', grade: 'PSA 10', grader: 'PSA', marketValue: 5200, liquidityScore: 55, demandIndex: 62, volatility: 0.16, category: 'hockey' },
  { id: 'bs-017', playerName: 'Juan Soto', cardYear: 2018, cardSet: 'Topps Update', cardNumber: '#US104', grade: 'PSA 10', grader: 'PSA', marketValue: 3200, liquidityScore: 62, demandIndex: 68, volatility: 0.18, category: 'baseball' },
  { id: 'bs-018', playerName: 'Jayson Tatum', cardYear: 2017, cardSet: 'Panini Prizm', cardNumber: '#16', grade: 'PSA 10', grader: 'PSA', marketValue: 7800, liquidityScore: 80, demandIndex: 83, volatility: 0.17, category: 'basketball' },
];

function buildFullAssets(): LiquidationAsset[] {
  return MOCK_ASSETS_RAW.map((raw) => {
    const tier = assignLiquidityTier(raw.liquidityScore);
    const tierData = LIQUIDITY_TIERS.find((t) => t.level === tier)!;
    return {
      ...raw,
      fireSaleValues: computeFireSaleValues(raw.marketValue, raw.liquidityScore),
      liquidityTier: tier,
      optimalChannel: assignOptimalChannel(tier),
      estimatedSaleDays: tierData.estimatedDays,
    };
  });
}

const MOCK_PORTFOLIO: LiquidationAsset[] = buildFullAssets();

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns the full set of portfolio assets with fire-sale valuations.
 */
export function getPortfolioAssets(): LiquidationAsset[] {
  return MOCK_PORTFOLIO;
}

/**
 * Generates fire-sale value summaries across all timeframes.
 */
export function getFireSaleValues(): {
  totalMarketValue: number;
  totals: { timeframe: string; label: string; totalValue: number; discountPercent: number }[];
  assets: LiquidationAsset[];
} {
  const assets = getPortfolioAssets();
  const totalMarketValue = assets.reduce((sum, a) => sum + a.marketValue, 0);

  const timeframes: Array<{ timeframe: '24hr' | '7d' | '30d'; label: string }> = [
    { timeframe: '24hr', label: '24 Hours' },
    { timeframe: '7d', label: '7 Days' },
    { timeframe: '30d', label: '30 Days' },
  ];

  const totals = timeframes.map(({ timeframe, label }) => {
    const totalValue = assets.reduce((sum, a) => {
      const fsv = a.fireSaleValues.find((f) => f.timeframe === timeframe);
      return sum + (fsv?.value ?? 0);
    }, 0);
    const discountPercent = Math.round(((totalMarketValue - totalValue) / totalMarketValue) * 100);
    return { timeframe, label, totalValue, discountPercent };
  });

  return { totalMarketValue, totals, assets };
}

/**
 * Orders assets for optimal liquidation: sell highest-liquidity first to maximize
 * early cash and minimize market impact on remaining holdings.
 */
export function optimizeLiquidationOrder(
  urgency: 'immediate' | 'week' | 'month' = 'week'
): LiquidationAsset[] {
  const assets = [...getPortfolioAssets()];

  // Primary sort: liquidity score descending (sell liquid assets first)
  // Secondary sort: recovery ratio descending (maximize proceeds)
  assets.sort((a, b) => {
    const aRecovery = getRecoveryForUrgency(a, urgency);
    const bRecovery = getRecoveryForUrgency(b, urgency);
    // Weight liquidity 60%, recovery 40%
    const aScore = a.liquidityScore * 0.6 + aRecovery * 100 * 0.4;
    const bScore = b.liquidityScore * 0.6 + bRecovery * 100 * 0.4;
    return bScore - aScore;
  });

  return assets;
}

function getRecoveryForUrgency(asset: LiquidationAsset, urgency: 'immediate' | 'week' | 'month'): number {
  const timeframeMap: Record<string, '24hr' | '7d' | '30d'> = {
    immediate: '24hr',
    week: '7d',
    month: '30d',
  };
  const tf = timeframeMap[urgency];
  const fsv = asset.fireSaleValues.find((f) => f.timeframe === tf);
  return fsv?.recoveryRatio ?? 0.7;
}

/**
 * Generates a comprehensive liquidation plan with ordering, totals, and timeline.
 */
export function generateLiquidationPlan(
  urgency: 'immediate' | 'week' | 'month' = 'week'
): LiquidationPlan {
  const orderedAssets = optimizeLiquidationOrder(urgency);
  const totalPortfolioValue = orderedAssets.reduce((sum, a) => sum + a.marketValue, 0);

  const timeframeMap: Record<string, '24hr' | '7d' | '30d'> = {
    immediate: '24hr',
    week: '7d',
    month: '30d',
  };
  const tf = timeframeMap[urgency];

  const estimatedRecovery = orderedAssets.reduce((sum, a) => {
    const fsv = a.fireSaleValues.find((f) => f.timeframe === tf);
    return sum + (fsv?.value ?? 0);
  }, 0);

  const totalFireSale24hr = orderedAssets.reduce((sum, a) => {
    const fsv = a.fireSaleValues.find((f) => f.timeframe === '24hr');
    return sum + (fsv?.value ?? 0);
  }, 0);

  const totalFireSale7d = orderedAssets.reduce((sum, a) => {
    const fsv = a.fireSaleValues.find((f) => f.timeframe === '7d');
    return sum + (fsv?.value ?? 0);
  }, 0);

  const totalFireSale30d = orderedAssets.reduce((sum, a) => {
    const fsv = a.fireSaleValues.find((f) => f.timeframe === '30d');
    return sum + (fsv?.value ?? 0);
  }, 0);

  return {
    id: `lp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    totalPortfolioValue,
    totalFireSale24hr,
    totalFireSale7d,
    totalFireSale30d,
    orderedAssets,
    estimatedRecovery,
    estimatedRecoveryPercent: Math.round((estimatedRecovery / totalPortfolioValue) * 100),
    timeline: urgency === 'immediate' ? '24 hours' : urgency === 'week' ? '7 days' : '30 days',
  };
}

/**
 * Calculates recovery scenarios across different selling strategies.
 */
export function calculateRecovery(): RecoveryScenario[] {
  const assets = getPortfolioAssets();
  const totalMarket = assets.reduce((sum, a) => sum + a.marketValue, 0);

  return [
    {
      strategy: 'eBay Individual Listings',
      description: 'List each card individually on eBay with Buy-It-Now pricing at competitive market rates.',
      estimatedRecovery: Math.round(totalMarket * 0.88),
      recoveryPercent: 88,
      timelineDays: 30,
      riskLevel: 'low',
      fees: Math.round(totalMarket * 0.88 * 0.13),
      netProceeds: Math.round(totalMarket * 0.88 * 0.87),
      steps: [
        'Photograph and list all 18 cards on eBay with competitive BIN prices',
        'Set 10% below market value for faster sales',
        'Use promoted listings for high-value cards over $5,000',
        'Adjust pricing every 5 days for unsold inventory',
        'Ship with insurance and tracking within 1 business day of sale',
      ],
    },
    {
      strategy: 'Auction House Consignment',
      description: 'Consign entire collection to a major sports card auction house like PWCC or Goldin.',
      estimatedRecovery: Math.round(totalMarket * 0.92),
      recoveryPercent: 92,
      timelineDays: 60,
      riskLevel: 'low',
      fees: Math.round(totalMarket * 0.92 * 0.10),
      netProceeds: Math.round(totalMarket * 0.92 * 0.90),
      steps: [
        'Contact PWCC / Goldin / Heritage for consignment terms',
        'Ship insured collection to auction house vault',
        'Approve lot descriptions and reserve prices',
        'Wait for auction cycle (typically 2-4 week intervals)',
        'Receive wire transfer 10-14 days post-auction close',
      ],
    },
    {
      strategy: 'Dealer Bulk Buyout',
      description: 'Sell entire collection to a dealer or shop in a single transaction at a bulk discount.',
      estimatedRecovery: Math.round(totalMarket * 0.68),
      recoveryPercent: 68,
      timelineDays: 3,
      riskLevel: 'medium',
      fees: 0,
      netProceeds: Math.round(totalMarket * 0.68),
      steps: [
        'Get quotes from 3-5 reputable dealers',
        'Share graded card inventory with photos and cert numbers',
        'Negotiate best offer (expect 60-75% of market value)',
        'Meet at a secure location or ship insured',
        'Receive payment via wire or cashier\'s check at point of sale',
      ],
    },
    {
      strategy: 'Hybrid Strategy (Recommended)',
      description: 'Sell high-liquidity cards on eBay, consign mid-tier, bulk-sell low-demand cards.',
      estimatedRecovery: Math.round(totalMarket * 0.85),
      recoveryPercent: 85,
      timelineDays: 21,
      riskLevel: 'low',
      fees: Math.round(totalMarket * 0.85 * 0.09),
      netProceeds: Math.round(totalMarket * 0.85 * 0.91),
      steps: [
        'List Tier 1 cards (liquidity 80+) on eBay BIN at market - 5%',
        'Consign Tier 2-3 cards to PWCC weekly auction',
        'Bundle Tier 4 cards and negotiate dealer buyout',
        'Reinvest eBay proceeds into promoted listings for slow movers',
        'Target full liquidation within 3 weeks',
      ],
    },
    {
      strategy: 'Emergency Fire Sale',
      description: 'Sell everything within 24 hours at maximum discount for immediate cash.',
      estimatedRecovery: Math.round(totalMarket * 0.58),
      recoveryPercent: 58,
      timelineDays: 1,
      riskLevel: 'high',
      fees: Math.round(totalMarket * 0.58 * 0.05),
      netProceeds: Math.round(totalMarket * 0.58 * 0.95),
      steps: [
        'Post entire collection on Twitter/X and Blowout Forums at 40-50% off',
        'Accept best offers from community buyers',
        'Contact local card shops for immediate cash offers',
        'Use eBay instant offers if available for graded cards',
        'Accept PayPal / Venmo / Zelle for fastest settlement',
      ],
    },
  ];
}

/**
 * Generates a step-by-step emergency cash-out plan with specific actions per card.
 */
export function generateEmergencyCashOut(
  urgency: 'immediate' | 'week' | 'month' = 'week'
): CashOutPlan {
  const orderedAssets = optimizeLiquidationOrder(urgency);
  const timeframeMap: Record<string, '24hr' | '7d' | '30d'> = {
    immediate: '24hr',
    week: '7d',
    month: '30d',
  };
  const tf = timeframeMap[urgency];

  let cumulativeRecovery = 0;
  const steps: CashOutStep[] = orderedAssets.map((asset, index) => {
    const fsv = asset.fireSaleValues.find((f) => f.timeframe === tf)!;
    cumulativeRecovery += fsv.value;

    const channelNotes: Record<LiquidityTierLevel, string> = {
      1: `List on eBay BIN at $${fsv.value.toLocaleString()}. High demand ensures quick sale.`,
      2: `Start 3-day auction at $${Math.round(fsv.value * 0.8).toLocaleString()} with no reserve.`,
      3: `Submit to PWCC/Goldin consignment. Expected hammer: $${fsv.value.toLocaleString()}.`,
      4: `Bundle with other Tier 4 cards for dealer buyout. Accept $${fsv.value.toLocaleString()} minimum.`,
    };

    return {
      order: index + 1,
      action: `Sell ${asset.playerName} ${asset.cardYear} ${asset.cardSet} ${asset.grade}`,
      asset,
      channel: asset.optimalChannel,
      expectedProceeds: fsv.value,
      estimatedDays: asset.estimatedSaleDays,
      cumulativeRecovery,
      notes: channelNotes[asset.liquidityTier],
    };
  });

  const totalMarketValue = orderedAssets.reduce((sum, a) => sum + a.marketValue, 0);
  const totalExpectedRecovery = steps.reduce((sum, s) => sum + s.expectedProceeds, 0);

  const discounts = orderedAssets.map((a) => {
    const fsv = a.fireSaleValues.find((f) => f.timeframe === tf)!;
    return fsv.discountPercent;
  });
  const averageDiscountPercent = Math.round(
    discounts.reduce((sum, d) => sum + d, 0) / discounts.length
  );

  const highRecovery = [...orderedAssets].sort((a, b) => {
    const aFsv = a.fireSaleValues.find((f) => f.timeframe === tf)!;
    const bFsv = b.fireSaleValues.find((f) => f.timeframe === tf)!;
    return bFsv.recoveryRatio - aFsv.recoveryRatio;
  });

  const lowRecovery = [...orderedAssets].sort((a, b) => {
    const aFsv = a.fireSaleValues.find((f) => f.timeframe === tf)!;
    const bFsv = b.fireSaleValues.find((f) => f.timeframe === tf)!;
    return aFsv.recoveryRatio - bFsv.recoveryRatio;
  });

  return {
    id: `co-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    urgency,
    targetAmount: totalExpectedRecovery,
    totalRecovery: totalExpectedRecovery,
    steps,
    summary: {
      totalAssets: orderedAssets.length,
      totalMarketValue,
      totalExpectedRecovery,
      recoveryPercent: Math.round((totalExpectedRecovery / totalMarketValue) * 100),
      estimatedCompletionDays: urgency === 'immediate' ? 1 : urgency === 'week' ? 7 : 30,
      highestRecoveryAsset: highRecovery[0]?.playerName ?? 'N/A',
      lowestRecoveryAsset: lowRecovery[0]?.playerName ?? 'N/A',
      averageDiscountPercent,
    },
  };
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

/** Safe HTML for print / document.write (all dynamic text escaped). */
export function renderCashOutPlanHTML(plan: CashOutPlan): string {
  const { summary, steps, generatedAt, urgency } = plan;
  const urgencyLabel =
    urgency === 'immediate' ? '24 Hours' : urgency === 'week' ? '7 Days' : '30 Days';
  const rows = steps
    .map(
      (step) => `
      <tr>
        <td>${escapeHtml(step.order)}</td>
        <td>${escapeHtml(step.action)}</td>
        <td>${escapeHtml(step.asset.liquidityTier)}</td>
        <td>${escapeHtml(step.channel)}</td>
        <td>${escapeHtml(step.estimatedDays)}</td>
        <td>${escapeHtml(formatUsd(step.expectedProceeds))}</td>
        <td>${escapeHtml(formatUsd(step.cumulativeRecovery))}</td>
      </tr>
      <tr class="notes"><td colspan="7">${escapeHtml(step.notes)}</td></tr>`,
    )
    .join('');

  return `
<div class="cashout-print">
  <p class="meta">Generated ${escapeHtml(new Date(generatedAt).toLocaleString())} · Urgency: ${escapeHtml(urgencyLabel)}</p>
  <p>Best recovery: ${escapeHtml(summary.highestRecoveryAsset)} · Worst: ${escapeHtml(summary.lowestRecoveryAsset)}</p>
  <table>
    <thead><tr><th>#</th><th>Action</th><th>Tier</th><th>Channel</th><th>Days</th><th>Proceeds</th><th>Running</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="total">Total expected recovery: ${escapeHtml(formatUsd(summary.totalExpectedRecovery))}
    (${escapeHtml(String(summary.recoveryPercent))}% of ${escapeHtml(formatUsd(summary.totalMarketValue))} market value)</p>
</div>`;
}

/**
 * Returns waterfall chart data showing value loss at each liquidation stage.
 */
export function getWaterfallData(): { name: string; value: number; fill: string }[] {
  const plan = generateLiquidationPlan('week');
  return [
    { name: 'Market Value', value: plan.totalPortfolioValue, fill: '#84cc16' },
    { name: '30-Day Sale', value: plan.totalFireSale30d, fill: '#a3e635' },
    { name: '7-Day Sale', value: plan.totalFireSale7d, fill: '#facc15' },
    { name: '24-Hour Sale', value: plan.totalFireSale24hr, fill: '#f97316' },
    { name: 'Emergency Bulk', value: Math.round(plan.totalPortfolioValue * 0.58), fill: '#ef4444' },
  ];
}

/**
 * Returns category breakdown for pie/bar charts.
 */
export function getCategoryBreakdown(): { category: string; marketValue: number; fireSale7d: number; count: number }[] {
  const assets = getPortfolioAssets();
  const categories = ['football', 'basketball', 'baseball', 'hockey'] as const;

  return categories.map((cat) => {
    const catAssets = assets.filter((a) => a.category === cat);
    const marketValue = catAssets.reduce((sum, a) => sum + a.marketValue, 0);
    const fireSale7d = catAssets.reduce((sum, a) => {
      const fsv = a.fireSaleValues.find((f) => f.timeframe === '7d');
      return sum + (fsv?.value ?? 0);
    }, 0);
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      marketValue,
      fireSale7d,
      count: catAssets.length,
    };
  });
}
