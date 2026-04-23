// @ts-nocheck
import { store } from '../dal/syncStore';
import { CardInventory, Sport } from '../../types';
import { buildCollectorAuditDossierReport } from '../core/collectorAuditDossierService';
import { escapeHtml } from '../htmlEscape';

// ---- Types ----

export type ReportType =
  | 'portfolio_summary'
  | 'tax'
  | 'insurance'
  | 'performance'
  | 'collector_audit_dossier';

export interface ReportConfig {
  dateRange?: { start: string; end: string };
  includeSold: boolean;
  sportFilter?: Sport[];
  groupFilter?: string;
  sections: ReportType[];
}

export interface ReportSection {
  title: string;
  type: 'summary' | 'table' | 'metrics' | 'chart_data';
  data: Record<string, unknown>[];
  columns?: string[];
  summary?: Record<string, string | number>;
  sourceType?: 'market-data' | 'inventory-history' | 'user-input' | 'heuristic-estimate' | 'simulated-placeholder';
  sourceNote?: string;
}

export interface TaxLineItem {
  cardId: string;
  player: string;
  sport: Sport;
  purchaseDate: string;
  saleDate: string;
  costBasis: number;
  proceeds: number;
  gainLoss: number;
  holdingPeriod: 'short_term' | 'long_term';
  gradingFees: number;
  shippingFees: number;
  adjustedBasis: number;
}

export interface InsuranceLineItem {
  cardId: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  condition: string;
  isGraded: boolean;
  gradingCompany?: string;
  grade?: string;
  currentValue: number;
  replacementCost: number;
}

export interface PerformanceMetrics {
  timeWeightedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  allocationEfficiency: number;
  benchmarkComparison: { name: string; return: number }[];
  monthlyReturns: { month: string; return: number }[];
}

export interface GeneratedReport {
  id: string;
  type: ReportType;
  title: string;
  generatedAt: string;
  config: ReportConfig;
  sections: ReportSection[];
  cardCount: number;
  metadata: Record<string, string | number>;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_report_history';

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

// ---- Helpers ----

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `rpt-${ts}-${rand}`;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return (b - a) / (1000 * 60 * 60 * 24);
}

function filterInventory(inventory: CardInventory[], config: ReportConfig): CardInventory[] {
  let filtered = [...inventory];

  if (!config.includeSold) {
    filtered = filtered.filter(c => c.status !== 'sold');
  }

  if (config.sportFilter && config.sportFilter.length > 0) {
    filtered = filtered.filter(c => config.sportFilter!.includes(c.sport));
  }

  if (config.dateRange) {
    const start = new Date(config.dateRange.start).getTime();
    const end = new Date(config.dateRange.end).getTime();
    filtered = filtered.filter(c => {
      const pd = new Date(c.purchaseDate).getTime();
      return pd >= start && pd <= end;
    });
  }

  return filtered;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Deterministic seeded random for simulated data
function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---- Portfolio Summary ----

export function generatePortfolioSummary(inventory: CardInventory[], config: ReportConfig): GeneratedReport {
  const cards = filterInventory(inventory, config);
  const now = new Date().toISOString();

  const activeCards = cards.filter(c => c.status !== 'sold');
  const soldCards = cards.filter(c => c.status === 'sold');

  const totalCostBasis = activeCards.reduce((s, c) => s + c.purchasePrice, 0);
  const totalCurrentValue = activeCards.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);
  const unrealizedPL = totalCurrentValue - totalCostBasis;
  const unrealizedPLPercent = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0;

  const realizedPL = soldCards.reduce((s, c) => {
    const proceeds = c.salePrice ?? 0;
    const basis = c.purchasePrice + (c.gradingFees ?? 0) + (c.shippingFees ?? 0);
    return s + (proceeds - basis);
  }, 0);

  // Allocation by sport
  const sportAllocation: Record<string, { count: number; value: number; costBasis: number }> = {};
  for (const sport of SPORTS) {
    sportAllocation[sport] = { count: 0, value: 0, costBasis: 0 };
  }
  for (const card of activeCards) {
    const sa = sportAllocation[card.sport];
    if (sa) {
      sa.count += 1;
      sa.value += card.currentValue ?? card.purchasePrice;
      sa.costBasis += card.purchasePrice;
    }
  }

  const allocationData = SPORTS.map(sport => {
    const sa = sportAllocation[sport];
    const pct = totalCurrentValue > 0 ? (sa.value / totalCurrentValue) * 100 : 0;
    return {
      sport,
      count: sa.count,
      value: sa.value,
      costBasis: sa.costBasis,
      allocation: Math.round(pct * 100) / 100,
      gainLoss: sa.value - sa.costBasis,
    } as Record<string, unknown>;
  }).filter(row => (row.count as number) > 0);

  // Top 10 performers
  const sortedByGain = [...activeCards]
    .map(c => ({
      player: c.player,
      sport: c.sport,
      year: c.year,
      set: c.set,
      purchasePrice: c.purchasePrice,
      currentValue: c.currentValue ?? c.purchasePrice,
      gainLoss: (c.currentValue ?? c.purchasePrice) - c.purchasePrice,
      gainLossPercent: c.purchasePrice > 0
        ? (((c.currentValue ?? c.purchasePrice) - c.purchasePrice) / c.purchasePrice) * 100
        : 0,
    }))
    .sort((a, b) => b.gainLossPercent - a.gainLossPercent);

  const top10 = sortedByGain.slice(0, 10).map(c => ({
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    purchasePrice: c.purchasePrice,
    currentValue: c.currentValue,
    gainLoss: Math.round(c.gainLoss * 100) / 100,
    gainLossPercent: Math.round(c.gainLossPercent * 100) / 100,
  }) as Record<string, unknown>);

  const bottom10 = sortedByGain.slice(-10).reverse().map(c => ({
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    purchasePrice: c.purchasePrice,
    currentValue: c.currentValue,
    gainLoss: Math.round(c.gainLoss * 100) / 100,
    gainLossPercent: Math.round(c.gainLossPercent * 100) / 100,
  }) as Record<string, unknown>);

  // Condition breakdown
  const conditionMap: Record<string, number> = {};
  for (const card of activeCards) {
    const key = card.condition || 'Unknown';
    conditionMap[key] = (conditionMap[key] ?? 0) + 1;
  }
  const conditionData = Object.entries(conditionMap).map(([condition, count]) => ({
    condition,
    count,
    percentage: Math.round((count / Math.max(1, activeCards.length)) * 10000) / 100,
  }) as Record<string, unknown>);

  const sections: ReportSection[] = [
    {
      title: 'Portfolio Overview',
      type: 'summary',
      data: [],
      summary: {
        'Total Cards': activeCards.length,
        'Total Cost Basis': Math.round(totalCostBasis * 100) / 100,
        'Total Current Value': Math.round(totalCurrentValue * 100) / 100,
        'Unrealized P&L': Math.round(unrealizedPL * 100) / 100,
        'Unrealized P&L %': Math.round(unrealizedPLPercent * 100) / 100,
        'Realized P&L (Sold)': Math.round(realizedPL * 100) / 100,
        'Cards Sold': soldCards.length,
        'Total P&L': Math.round((unrealizedPL + realizedPL) * 100) / 100,
      },
    },
    {
      title: 'Allocation by Sport',
      type: 'table',
      data: allocationData,
      columns: ['sport', 'count', 'value', 'costBasis', 'allocation', 'gainLoss'],
    },
    {
      title: 'Top 10 Performers',
      type: 'table',
      data: top10,
      columns: ['player', 'sport', 'year', 'purchasePrice', 'currentValue', 'gainLoss', 'gainLossPercent'],
    },
    {
      title: 'Bottom 10 Performers',
      type: 'table',
      data: bottom10,
      columns: ['player', 'sport', 'year', 'purchasePrice', 'currentValue', 'gainLoss', 'gainLossPercent'],
    },
    {
      title: 'Condition Breakdown',
      type: 'table',
      data: conditionData,
      columns: ['condition', 'count', 'percentage'],
    },
  ];

  return {
    id: generateId(),
    type: 'portfolio_summary',
    title: 'Portfolio Summary Report',
    generatedAt: now,
    config,
    sections,
    cardCount: cards.length,
    metadata: {
      totalValue: Math.round(totalCurrentValue * 100) / 100,
      totalCostBasis: Math.round(totalCostBasis * 100) / 100,
      unrealizedPL: Math.round(unrealizedPL * 100) / 100,
      realizedPL: Math.round(realizedPL * 100) / 100,
      activeSports: allocationData.length,
    },
  };
}

// ---- Tax Report ----

export function generateTaxReport(inventory: CardInventory[], config: ReportConfig): GeneratedReport {
  const cards = filterInventory(inventory, config);
  const now = new Date().toISOString();
  const soldCards = cards.filter(c => c.status === 'sold' && c.saleDate);

  const taxItems: TaxLineItem[] = soldCards.map(card => {
    const costBasis = card.purchasePrice;
    const gradingFees = card.gradingFees ?? 0;
    const shippingFees = card.shippingFees ?? 0;
    const adjustedBasis = costBasis + gradingFees + shippingFees;
    const proceeds = card.salePrice ?? 0;
    const gainLoss = proceeds - adjustedBasis;
    const holdDays = daysBetween(card.purchaseDate, card.saleDate!);
    const holdingPeriod: 'short_term' | 'long_term' = holdDays >= 365 ? 'long_term' : 'short_term';

    return {
      cardId: card.id,
      player: card.player,
      sport: card.sport,
      purchaseDate: card.purchaseDate,
      saleDate: card.saleDate!,
      costBasis,
      proceeds,
      gainLoss: Math.round(gainLoss * 100) / 100,
      holdingPeriod,
      gradingFees,
      shippingFees,
      adjustedBasis: Math.round(adjustedBasis * 100) / 100,
    };
  });

  const shortTerm = taxItems.filter(i => i.holdingPeriod === 'short_term');
  const longTerm = taxItems.filter(i => i.holdingPeriod === 'long_term');

  const shortTermGains = shortTerm.filter(i => i.gainLoss > 0).reduce((s, i) => s + i.gainLoss, 0);
  const shortTermLosses = shortTerm.filter(i => i.gainLoss < 0).reduce((s, i) => s + i.gainLoss, 0);
  const longTermGains = longTerm.filter(i => i.gainLoss > 0).reduce((s, i) => s + i.gainLoss, 0);
  const longTermLosses = longTerm.filter(i => i.gainLoss < 0).reduce((s, i) => s + i.gainLoss, 0);

  const totalGains = shortTermGains + longTermGains;
  const totalLosses = shortTermLosses + longTermLosses;
  const netGainLoss = totalGains + totalLosses;

  const sections: ReportSection[] = [
    {
      title: 'Tax Summary',
      type: 'summary',
      data: [],
      summary: {
        'Total Dispositions': soldCards.length,
        'Short-Term Gains': Math.round(shortTermGains * 100) / 100,
        'Short-Term Losses': Math.round(shortTermLosses * 100) / 100,
        'Short-Term Net': Math.round((shortTermGains + shortTermLosses) * 100) / 100,
        'Long-Term Gains': Math.round(longTermGains * 100) / 100,
        'Long-Term Losses': Math.round(longTermLosses * 100) / 100,
        'Long-Term Net': Math.round((longTermGains + longTermLosses) * 100) / 100,
        'Total Net Gain/Loss': Math.round(netGainLoss * 100) / 100,
      },
    },
    {
      title: 'Short-Term Capital Gains/Losses (< 1 Year)',
      type: 'table',
      data: shortTerm.map(i => ({ ...i }) as unknown as Record<string, unknown>),
      columns: ['player', 'sport', 'purchaseDate', 'saleDate', 'adjustedBasis', 'proceeds', 'gainLoss'],
    },
    {
      title: 'Long-Term Capital Gains/Losses (>= 1 Year)',
      type: 'table',
      data: longTerm.map(i => ({ ...i }) as unknown as Record<string, unknown>),
      columns: ['player', 'sport', 'purchaseDate', 'saleDate', 'adjustedBasis', 'proceeds', 'gainLoss'],
    },
    {
      title: 'Cost Basis Detail',
      type: 'table',
      data: taxItems.map(i => ({
        player: i.player,
        sport: i.sport,
        costBasis: i.costBasis,
        gradingFees: i.gradingFees,
        shippingFees: i.shippingFees,
        adjustedBasis: i.adjustedBasis,
        proceeds: i.proceeds,
        gainLoss: i.gainLoss,
        holdingPeriod: i.holdingPeriod === 'short_term' ? 'Short-Term' : 'Long-Term',
      }) as Record<string, unknown>),
      columns: ['player', 'sport', 'costBasis', 'gradingFees', 'shippingFees', 'adjustedBasis', 'proceeds', 'gainLoss', 'holdingPeriod'],
    },
  ];

  return {
    id: generateId(),
    type: 'tax',
    title: 'Tax Report — Capital Gains & Losses',
    generatedAt: now,
    config,
    sections,
    cardCount: cards.length,
    metadata: {
      soldCount: soldCards.length,
      shortTermNet: Math.round((shortTermGains + shortTermLosses) * 100) / 100,
      longTermNet: Math.round((longTermGains + longTermLosses) * 100) / 100,
      totalNetGainLoss: Math.round(netGainLoss * 100) / 100,
    },
  };
}

// ---- Insurance Report ----

export function generateInsuranceReport(inventory: CardInventory[], config: ReportConfig): GeneratedReport {
  const cards = filterInventory(inventory, config).filter(c => c.status !== 'sold');
  const now = new Date().toISOString();

  const REPLACEMENT_MULTIPLIER = 1.15;

  const insuranceItems: InsuranceLineItem[] = cards.map(card => {
    const currentValue = card.currentValue ?? card.purchasePrice;
    return {
      cardId: card.id,
      player: card.player,
      year: card.year,
      set: card.set,
      sport: card.sport,
      condition: card.condition,
      isGraded: card.isGraded,
      gradingCompany: card.gradingCompany,
      grade: card.grade,
      currentValue: Math.round(currentValue * 100) / 100,
      replacementCost: Math.round(currentValue * REPLACEMENT_MULTIPLIER * 100) / 100,
    };
  });

  const totalMarketValue = insuranceItems.reduce((s, i) => s + i.currentValue, 0);
  const totalReplacementCost = insuranceItems.reduce((s, i) => s + i.replacementCost, 0);
  const gradedCount = insuranceItems.filter(i => i.isGraded).length;
  const ungradedCount = insuranceItems.length - gradedCount;

  // Group by sport
  const bySport: Record<string, { count: number; value: number; replacement: number }> = {};
  for (const item of insuranceItems) {
    if (!bySport[item.sport]) bySport[item.sport] = { count: 0, value: 0, replacement: 0 };
    bySport[item.sport].count += 1;
    bySport[item.sport].value += item.currentValue;
    bySport[item.sport].replacement += item.replacementCost;
  }

  const sportSummaryData = Object.entries(bySport)
    .sort((a, b) => b[1].value - a[1].value)
    .map(([sport, data]) => ({
      sport,
      count: data.count,
      marketValue: Math.round(data.value * 100) / 100,
      replacementCost: Math.round(data.replacement * 100) / 100,
    }) as Record<string, unknown>);

  // High-value items (top 20 by value)
  const highValueItems = [...insuranceItems]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 20)
    .map(i => ({
      player: i.player,
      year: i.year,
      set: i.set,
      sport: i.sport,
      condition: i.condition,
      graded: i.isGraded ? `${i.gradingCompany ?? ''} ${i.grade ?? ''}`.trim() : 'Raw',
      currentValue: i.currentValue,
      replacementCost: i.replacementCost,
    }) as Record<string, unknown>);

  const sections: ReportSection[] = [
    {
      title: 'Insurance Summary',
      type: 'summary',
      data: [],
      summary: {
        'Total Items': insuranceItems.length,
        'Total Market Value': Math.round(totalMarketValue * 100) / 100,
        'Total Replacement Cost': Math.round(totalReplacementCost * 100) / 100,
        'Replacement Premium': '15%',
        'Graded Cards': gradedCount,
        'Raw Cards': ungradedCount,
      },
    },
    {
      title: 'Value by Sport',
      type: 'table',
      data: sportSummaryData,
      columns: ['sport', 'count', 'marketValue', 'replacementCost'],
    },
    {
      title: 'High-Value Items (Top 20)',
      type: 'table',
      data: highValueItems,
      columns: ['player', 'year', 'set', 'sport', 'condition', 'graded', 'currentValue', 'replacementCost'],
    },
    {
      title: 'Complete Itemized Inventory',
      type: 'table',
      data: insuranceItems.map(i => ({
        player: i.player,
        year: i.year,
        set: i.set,
        sport: i.sport,
        condition: i.condition,
        graded: i.isGraded ? `${i.gradingCompany ?? ''} ${i.grade ?? ''}`.trim() : 'Raw',
        currentValue: i.currentValue,
        replacementCost: i.replacementCost,
      }) as Record<string, unknown>),
      columns: ['player', 'year', 'set', 'sport', 'condition', 'graded', 'currentValue', 'replacementCost'],
    },
  ];

  return {
    id: generateId(),
    type: 'insurance',
    title: 'Insurance Valuation Report',
    generatedAt: now,
    config,
    sections,
    cardCount: cards.length,
    metadata: {
      totalMarketValue: Math.round(totalMarketValue * 100) / 100,
      totalReplacementCost: Math.round(totalReplacementCost * 100) / 100,
      gradedCount,
      ungradedCount,
    },
  };
}

// ---- Performance Report ----

export function generatePerformanceReport(inventory: CardInventory[], config: ReportConfig): GeneratedReport {
  const cards = filterInventory(inventory, config);
  const now = new Date().toISOString();

  const activeCards = cards.filter(c => c.status !== 'sold');
  const soldCards = cards.filter(c => c.status === 'sold');

  const totalCostBasis = activeCards.reduce((s, c) => s + c.purchasePrice, 0);
  const totalCurrentValue = activeCards.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);
  const totalReturnPct = totalCostBasis > 0 ? ((totalCurrentValue - totalCostBasis) / totalCostBasis) * 100 : 0;

  // Time-weighted return: geometric mean of per-card returns
  const cardReturns = activeCards
    .filter(c => c.purchasePrice > 0)
    .map(c => {
      const cv = c.currentValue ?? c.purchasePrice;
      return cv / c.purchasePrice;
    });

  let timeWeightedReturn = 0;
  if (cardReturns.length > 0) {
    const product = cardReturns.reduce((p, r) => p * r, 1);
    timeWeightedReturn = (Math.pow(product, 1 / cardReturns.length) - 1) * 100;
  }

  // Simulated monthly returns using deterministic seed
  const seed = hashString(cards.map(c => c.id).join(','));
  const monthlyReturns: { month: string; return: number }[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < 12; i++) {
    const monthReturn = (seededRandom(seed, i * 7) - 0.45) * 15; // range roughly -6.75 to +8.25
    monthlyReturns.push({
      month: `${months[i]} ${currentYear - 1}`,
      return: Math.round(monthReturn * 100) / 100,
    });
  }

  // Sharpe ratio: (mean return - risk free) / std dev of returns
  const monthReturnsArr = monthlyReturns.map(m => m.return);
  const meanReturn = monthReturnsArr.reduce((s, r) => s + r, 0) / Math.max(1, monthReturnsArr.length);
  const variance = monthReturnsArr.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / Math.max(1, monthReturnsArr.length);
  const stdDev = Math.sqrt(variance);
  const riskFreeRate = 0.35; // monthly risk-free ~4.2% annual
  const sharpeRatio = stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;

  // Max drawdown: worst peak-to-trough from monthly cumulative
  let cumulative = 100;
  let peak = cumulative;
  let maxDrawdown = 0;
  for (const mr of monthlyReturns) {
    cumulative *= (1 + mr.return / 100);
    if (cumulative > peak) peak = cumulative;
    const drawdown = ((peak - cumulative) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Allocation efficiency: Herfindahl-like score (lower concentration = higher efficiency)
  const sportValues: Record<string, number> = {};
  for (const card of activeCards) {
    const cv = card.currentValue ?? card.purchasePrice;
    sportValues[card.sport] = (sportValues[card.sport] ?? 0) + cv;
  }
  const totalVal = Object.values(sportValues).reduce((s, v) => s + v, 0);
  let hhi = 0;
  if (totalVal > 0) {
    for (const v of Object.values(sportValues)) {
      hhi += (v / totalVal) ** 2;
    }
  }
  const activeSports = Object.keys(sportValues).length;
  const maxDiversification = activeSports > 0 ? 1 / activeSports : 1;
  const allocationEfficiency = hhi > 0 ? Math.min(100, Math.round((maxDiversification / hhi) * 100)) : 0;

  // Simulated benchmarks
  const benchmarks = [
    { name: 'S&P 500', return: Math.round((seededRandom(seed, 200) * 20 - 5) * 100) / 100 },
    { name: 'PSA 500 Index', return: Math.round((seededRandom(seed, 201) * 25 - 8) * 100) / 100 },
    { name: 'Alt Assets Index', return: Math.round((seededRandom(seed, 202) * 18 - 3) * 100) / 100 },
    { name: 'Collectibles Composite', return: Math.round((seededRandom(seed, 203) * 22 - 6) * 100) / 100 },
  ];

  const performanceMetrics: PerformanceMetrics = {
    timeWeightedReturn: Math.round(timeWeightedReturn * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    allocationEfficiency,
    benchmarkComparison: benchmarks,
    monthlyReturns,
  };

  // Per-sport performance
  const sportPerf = SPORTS.map(sport => {
    const sportCards = activeCards.filter(c => c.sport === sport);
    if (sportCards.length === 0) return null;
    const basis = sportCards.reduce((s, c) => s + c.purchasePrice, 0);
    const value = sportCards.reduce((s, c) => s + (c.currentValue ?? c.purchasePrice), 0);
    const ret = basis > 0 ? ((value - basis) / basis) * 100 : 0;
    return {
      sport,
      cards: sportCards.length,
      costBasis: Math.round(basis * 100) / 100,
      currentValue: Math.round(value * 100) / 100,
      returnPct: Math.round(ret * 100) / 100,
    } as Record<string, unknown>;
  }).filter(Boolean) as Record<string, unknown>[];

  const sections: ReportSection[] = [
    {
      title: 'Performance Summary',
      type: 'metrics',
      data: [performanceMetrics as unknown as Record<string, unknown>],
      summary: {
        'Total Return': Math.round(totalReturnPct * 100) / 100,
        'Time-Weighted Return': performanceMetrics.timeWeightedReturn,
        'Sharpe Ratio': performanceMetrics.sharpeRatio,
        'Max Drawdown': performanceMetrics.maxDrawdown,
        'Allocation Efficiency': `${performanceMetrics.allocationEfficiency}%`,
        'Active Cards': activeCards.length,
        'Sold Cards': soldCards.length,
      },
    },
    {
      title: 'Benchmark Comparison',
      type: 'table',
      data: benchmarks.map(b => ({
        benchmark: b.name,
        benchmarkReturn: b.return,
        portfolioReturn: Math.round(totalReturnPct * 100) / 100,
        alpha: Math.round((totalReturnPct - b.return) * 100) / 100,
      }) as Record<string, unknown>),
      columns: ['benchmark', 'benchmarkReturn', 'portfolioReturn', 'alpha'],
    },
    {
      title: 'Monthly Returns',
      type: 'chart_data',
      data: monthlyReturns.map(m => ({
        month: m.month,
        return: m.return,
      }) as Record<string, unknown>),
      columns: ['month', 'return'],
    },
    {
      title: 'Performance by Sport',
      type: 'table',
      data: sportPerf,
      columns: ['sport', 'cards', 'costBasis', 'currentValue', 'returnPct'],
    },
  ];

  return {
    id: generateId(),
    type: 'performance',
    title: 'Portfolio Performance Report',
    generatedAt: now,
    config,
    sections,
    cardCount: cards.length,
    metadata: {
      totalReturn: Math.round(totalReturnPct * 100) / 100,
      timeWeightedReturn: performanceMetrics.timeWeightedReturn,
      sharpeRatio: performanceMetrics.sharpeRatio,
      maxDrawdown: performanceMetrics.maxDrawdown,
      allocationEfficiency: performanceMetrics.allocationEfficiency,
    },
  };
}

export function generateCollectorAuditDossier(
  inventory: CardInventory[],
  config: ReportConfig,
  options?: { cardId?: string }
): GeneratedReport {
  const filtered = filterInventory(inventory, config);
  return buildCollectorAuditDossierReport(filtered, config, options);
}

// ---- Export functions ----

export function exportToCSV(report: GeneratedReport): string {
  const lines: string[] = [];

  lines.push(`"${report.title}"`);
  lines.push(`"Generated: ${new Date(report.generatedAt).toLocaleString()}"`);
  lines.push(`"Cards Analyzed: ${report.cardCount}"`);
  lines.push('');

  for (const section of report.sections) {
    lines.push(`"${section.title}"`);
    if (section.sourceType || section.sourceNote) {
      lines.push(`"Source Type","${section.sourceType ?? ''}"`);
      lines.push(`"Source Note","${section.sourceNote ?? ''}"`);
    }

    if (section.summary) {
      for (const [key, value] of Object.entries(section.summary)) {
        lines.push(`"${key}","${value}"`);
      }
    }

    if (section.data.length > 0 && section.columns && section.columns.length > 0) {
      lines.push(section.columns.map(c => `"${c}"`).join(','));

      for (const row of section.data) {
        const values = section.columns.map(col => {
          const val = row[col];
          if (val === undefined || val === null) return '""';
          if (typeof val === 'number') return String(val);
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        lines.push(values.join(','));
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function exportToJSON(report: GeneratedReport): string {
  return JSON.stringify(report, null, 2);
}

export function renderReportHTML(report: GeneratedReport): string {
  const genDate = new Date(report.generatedAt).toLocaleString();

  const formatValue = (val: unknown, col: string): string => {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'number') {
      const currencyFields = ['value', 'costBasis', 'currentValue', 'purchasePrice', 'marketValue',
        'replacementCost', 'adjustedBasis', 'proceeds', 'gainLoss', 'shortTermGains', 'shortTermLosses',
        'longTermGains', 'longTermLosses', 'gradingFees', 'shippingFees', 'benchmarkReturn', 'portfolioReturn', 'alpha',
        'liability', 'premium', 'gapAmount', 'coveredAmount', 'expectedNet', 'breakEvenSalePrice', 'fees'];
      const pctFields = ['allocation', 'gainLossPercent', 'returnPct', 'return', 'percentage', 'gapPercent'];
      const lc = col.toLowerCase();
      if (currencyFields.some(f => lc.includes(f.toLowerCase()))) {
        return formatCurrency(val);
      }
      if (pctFields.some(f => lc.includes(f.toLowerCase()))) {
        return formatPercent(val);
      }
      return val.toLocaleString();
    }
    return String(val);
  };

  let sectionsHTML = '';
  for (const section of report.sections) {
    sectionsHTML += `<div class="section">`;
    sectionsHTML += `<h2>${escapeHtml(section.title)}</h2>`;
    if (section.sourceType || section.sourceNote) {
      sectionsHTML += `<div class="source-note">`;
      if (section.sourceType) {
        sectionsHTML += `<span class="source-badge">${escapeHtml(section.sourceType.replace(/-/g, ' '))}</span>`;
      }
      if (section.sourceNote) {
        sectionsHTML += `<span>${escapeHtml(section.sourceNote)}</span>`;
      }
      sectionsHTML += `</div>`;
    }

    if (section.summary) {
      sectionsHTML += `<div class="summary-grid">`;
      for (const [key, value] of Object.entries(section.summary)) {
        const numVal = typeof value === 'number' ? value : parseFloat(String(value));
        const isNeg = !isNaN(numVal) && numVal < 0;
        const isPos = !isNaN(numVal) && numVal > 0;
        const colorClass = isNeg ? 'negative' : isPos ? 'positive' : '';
        const summaryKey = key.toLowerCase();
        const isCurrencySummary = ['value', 'cost', 'liability', 'premium', 'gap', 'net', 'replacement'].some(token => summaryKey.includes(token));
        const isPercentSummary = key.includes('%') || summaryKey.includes('percent');
        const displayValue =
          typeof value === 'number' && isCurrencySummary
            ? formatCurrency(value)
            : typeof value === 'number' && isPercentSummary
              ? formatPercent(value)
              : escapeHtml(value);
        sectionsHTML += `<div class="summary-item"><span class="summary-label">${escapeHtml(key)}</span><span class="summary-value ${colorClass}">${displayValue}</span></div>`;
      }
      sectionsHTML += `</div>`;
    }

    if (section.data.length > 0 && section.columns && section.columns.length > 0) {
      sectionsHTML += `<div class="table-wrapper"><table><thead><tr>`;
      for (const col of section.columns) {
        const label = col.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
        sectionsHTML += `<th>${escapeHtml(label)}</th>`;
      }
      sectionsHTML += `</tr></thead><tbody>`;
      for (const row of section.data) {
        sectionsHTML += `<tr>`;
        for (const col of section.columns) {
          const val = row[col];
          const rendered = formatValue(val, col);
          const numVal = typeof val === 'number' ? val : NaN;
          const colorClass = !isNaN(numVal) && (col.includes('gainLoss') || col.includes('alpha') || col === 'return')
            ? (numVal < 0 ? 'negative' : numVal > 0 ? 'positive' : '')
            : '';
          sectionsHTML += `<td class="${colorClass}">${escapeHtml(rendered)}</td>`;
        }
        sectionsHTML += `</tr>`;
      }
      sectionsHTML += `</tbody></table></div>`;
    }

    sectionsHTML += `</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(report.title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #fff; padding: 40px; max-width: 1000px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; color: #0f172a; }
  .subtitle { font-size: 13px; color: #64748b; margin-bottom: 32px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  h2 { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .summary-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
  .source-note { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; font-size: 12px; color: #64748b; }
  .source-badge { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }
  .summary-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .summary-value { font-size: 18px; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
  .summary-value.positive { color: #16a34a; }
  .summary-value.negative { color: #dc2626; }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; font-variant-numeric: tabular-nums; }
  tr:hover { background: #f8fafc; }
  .positive { color: #16a34a; font-weight: 600; }
  .negative { color: #dc2626; font-weight: 600; }
  @media print {
    body { padding: 20px; font-size: 11px; }
    h1 { font-size: 22px; }
    h2 { font-size: 15px; }
    .summary-value { font-size: 15px; }
    table { font-size: 10px; }
    th, td { padding: 6px 8px; }
    .section { page-break-inside: avoid; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<h1>${escapeHtml(report.title)}</h1>
<div class="subtitle">Generated: ${escapeHtml(genDate)} &bull; Cards: ${escapeHtml(report.cardCount)}</div>
${sectionsHTML}
</body>
</html>`;
}

// ---- History management ----

export function getReportHistory(): { id: string; type: ReportType; generatedAt: string; cardCount: number }[] {
  return store.get<{ id: string; type: ReportType; generatedAt: string; cardCount: number }[]>(STORAGE_KEY, []);
}

export function saveReportToHistory(report: GeneratedReport): void {
  const history = getReportHistory();
  history.unshift({
    id: report.id,
    type: report.type,
    generatedAt: report.generatedAt,
    cardCount: report.cardCount,
  });
  // Keep last 50 entries
  const trimmed = history.slice(0, 50);
  store.set(STORAGE_KEY, trimmed);
}

// Full report cache for viewing from history
const REPORT_CACHE_KEY = 'msi_report_cache';

export function getCachedReport(reportId: string): GeneratedReport | null {
  const cache = store.get<Record<string, GeneratedReport>>(REPORT_CACHE_KEY, {});
  return cache[reportId] ?? null;
}

export function cacheReport(report: GeneratedReport): void {
  const cache = store.get<Record<string, GeneratedReport>>(REPORT_CACHE_KEY, {});
  cache[report.id] = report;
  // Keep only the 20 most recent
  const entries = Object.entries(cache).sort(
    (a, b) => new Date(b[1].generatedAt).getTime() - new Date(a[1].generatedAt).getTime()
  );
  const trimmed = Object.fromEntries(entries.slice(0, 20));
  store.set(REPORT_CACHE_KEY, trimmed);
}
