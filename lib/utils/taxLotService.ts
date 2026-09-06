import { CardInventory } from '../../types';

export type CostBasisMethod = 'FIFO' | 'LIFO' | 'SpecificID' | 'AvgCost';
export type HoldingPeriod = 'Short-Term' | 'Long-Term';
export type TaxYear = number;

export interface TaxLot {
  cardId: string;
  player: string;
  description: string;
  dateAcquired: string;
  dateSold?: string;
  costBasis: number; // purchase price + fees
  proceeds?: number; // sale price
  gainLoss: number;
  holdingPeriod: HoldingPeriod;
  isRealized: boolean;
  washSaleDisallowed: number;
}

export interface ScheduleDEntry {
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustments: number;
  gainLoss: number;
  holdingPeriod: HoldingPeriod;
}

export interface TaxHarvestCandidate {
  card: CardInventory;
  unrealizedLoss: number;
  costBasis: number;
  currentValue: number;
  holdingPeriod: HoldingPeriod;
  taxSavingsEstimate: number;
}

export interface TaxSummary {
  taxYear: TaxYear;
  method: CostBasisMethod;
  totalProceeds: number;
  totalCostBasis: number;
  totalAdjustments: number;
  shortTermGains: number;
  shortTermLosses: number;
  longTermGains: number;
  longTermLosses: number;
  netShortTerm: number;
  netLongTerm: number;
  totalNetGainLoss: number;
  estimatedTaxLiability: number;
  effectiveTaxRate: number;
  scheduleDEntries: ScheduleDEntry[];
  unrealizedGains: number;
  unrealizedLosses: number;
  harvestCandidates: TaxHarvestCandidate[];
  totalTransactions: number;
  avgHoldingDays: number;
}

const SHORT_TERM_RATE = 0.32; // Approximate marginal rate for short-term (ordinary income)
const LONG_TERM_RATE = 0.15; // Long-term capital gains rate
const ONE_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function getHoldingPeriod(purchaseDate: string, saleDate?: string): HoldingPeriod {
  const acquired = new Date(purchaseDate).getTime();
  const disposed = saleDate ? new Date(saleDate).getTime() : Date.now();
  return (disposed - acquired) >= ONE_YEAR_MS ? 'Long-Term' : 'Short-Term';
}

function getHoldingDays(purchaseDate: string, saleDate?: string): number {
  const acquired = new Date(purchaseDate).getTime();
  const disposed = saleDate ? new Date(saleDate).getTime() : Date.now();
  return Math.round((disposed - acquired) / (24 * 60 * 60 * 1000));
}

function calculateCostBasis(card: CardInventory): number {
  const base = card.taxBasis || card.purchasePrice || 0;
  const fees = (card.gradingFees || 0) + (card.shippingFees || 0);
  return base + fees;
}

function buildCardDescription(card: CardInventory): string {
  const parts = [card.year, card.manufacturer, card.player];
  if (card.set) parts.push(card.set);
  if (card.cardNumber) parts.push(`#${card.cardNumber}`);
  if (card.isGraded && card.gradingCompany && card.grade) {
    parts.push(`${card.gradingCompany} ${card.grade}`);
  }
  return parts.join(' ');
}

/**
 * Sorts sold cards by method for cost-basis ordering.
 */
function sortByMethod(cards: CardInventory[], method: CostBasisMethod): CardInventory[] {
  const sorted = [...cards];
  switch (method) {
    case 'FIFO':
      return sorted.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
    case 'LIFO':
      return sorted.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    case 'SpecificID':
      // Specific ID: optimize for lowest tax — sell highest basis first
      return sorted.sort((a, b) => calculateCostBasis(b) - calculateCostBasis(a));
    case 'AvgCost':
      return sorted; // Order doesn't matter for average cost
    default:
      return sorted;
  }
}

export const SCHEDULE_D_METHODOLOGY_DISCLAIMER =
  'Schedule D–style packet for collector records. Short-term vs long-term buckets use a 365.25-day hold test on recorded purchase and sale dates. Cost basis is purchase price plus stored grading and shipping fees. Method labels (FIFO / LIFO / Specific ID / Average) reorder lots for illustration only — this is not IRS Form 8949 / Schedule D regulatory completeness, FIFO/LIFO audit support, or tax advice. Confirm figures with a qualified tax professional before filing.';

export const SCHEDULE_D_COMPLETENESS_NOTE =
  'Demo-honest export: realized lots with a stored sale date only. Wash-sale, collectibles 28% rate, state tax, and specific-identification substantiation are out of scope.';

export interface ScheduleDBucket {
  holdingPeriod: HoldingPeriod;
  entries: ScheduleDEntry[];
  count: number;
  proceeds: number;
  costBasis: number;
  gains: number;
  losses: number;
  net: number;
}

export interface ScheduleDPacket {
  taxYear: TaxYear;
  method: CostBasisMethod;
  generatedAt: string;
  shortTerm: ScheduleDBucket;
  longTerm: ScheduleDBucket;
  totals: {
    dispositions: number;
    proceeds: number;
    costBasis: number;
    net: number;
    estimatedTaxLiability: number;
  };
  methodologyDisclaimer: string;
  completenessNote: string;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function bucketFromEntries(holdingPeriod: HoldingPeriod, entries: ScheduleDEntry[]): ScheduleDBucket {
  const gains = entries.filter((e) => e.gainLoss >= 0).reduce((sum, e) => sum + e.gainLoss, 0);
  const losses = entries.filter((e) => e.gainLoss < 0).reduce((sum, e) => sum + Math.abs(e.gainLoss), 0);
  return {
    holdingPeriod,
    entries,
    count: entries.length,
    proceeds: roundCents(entries.reduce((sum, e) => sum + e.proceeds, 0)),
    costBasis: roundCents(entries.reduce((sum, e) => sum + e.costBasis, 0)),
    gains: roundCents(gains),
    losses: roundCents(losses),
    net: roundCents(gains - losses),
  };
}

export class TaxLotService {
  /**
   * Generates a complete tax summary for a given year and method.
   */
  static generateTaxSummary(
    inventory: CardInventory[],
    taxYear: TaxYear = new Date().getFullYear(),
    method: CostBasisMethod = 'FIFO'
  ): TaxSummary {
    const yearStart = new Date(taxYear, 0, 1);
    const yearEnd = new Date(taxYear, 11, 31, 23, 59, 59);

    // Realized: sold cards in the tax year
    const soldInYear = sortByMethod(
      inventory.filter(c =>
        c.status === 'sold' &&
        c.saleDate &&
        new Date(c.saleDate) >= yearStart &&
        new Date(c.saleDate) <= yearEnd
      ),
      method
    );

    // For average cost method, compute portfolio-wide average
    const avgCostBasis = method === 'AvgCost'
      ? inventory.reduce((sum, c) => sum + calculateCostBasis(c), 0) / Math.max(1, inventory.length)
      : 0;

    // Build Schedule D entries
    const scheduleDEntries: ScheduleDEntry[] = soldInYear.map(card => {
      const costBasis = method === 'AvgCost' ? avgCostBasis : calculateCostBasis(card);
      const proceeds = card.salePrice || 0;
      const holdingPeriod = getHoldingPeriod(card.purchaseDate, card.saleDate);
      return {
        description: buildCardDescription(card),
        dateAcquired: card.purchaseDate,
        dateSold: card.saleDate || '',
        proceeds,
        costBasis,
        adjustments: 0,
        gainLoss: proceeds - costBasis,
        holdingPeriod,
      };
    });

    // Aggregate
    let shortTermGains = 0, shortTermLosses = 0;
    let longTermGains = 0, longTermLosses = 0;
    let totalProceeds = 0, totalCostBasis = 0;
    let totalHoldingDays = 0;

    scheduleDEntries.forEach(entry => {
      totalProceeds += entry.proceeds;
      totalCostBasis += entry.costBasis;
      if (entry.holdingPeriod === 'Short-Term') {
        if (entry.gainLoss >= 0) shortTermGains += entry.gainLoss;
        else shortTermLosses += Math.abs(entry.gainLoss);
      } else {
        if (entry.gainLoss >= 0) longTermGains += entry.gainLoss;
        else longTermLosses += Math.abs(entry.gainLoss);
      }
    });

    soldInYear.forEach(card => {
      totalHoldingDays += getHoldingDays(card.purchaseDate, card.saleDate);
    });

    const netShortTerm = shortTermGains - shortTermLosses;
    const netLongTerm = longTermGains - longTermLosses;
    const totalNetGainLoss = netShortTerm + netLongTerm;

    // Tax estimate
    const shortTermTax = Math.max(0, netShortTerm) * SHORT_TERM_RATE;
    const longTermTax = Math.max(0, netLongTerm) * LONG_TERM_RATE;
    const estimatedTaxLiability = shortTermTax + longTermTax;
    const effectiveTaxRate = totalNetGainLoss > 0 ? estimatedTaxLiability / totalNetGainLoss : 0;

    // Unrealized
    const activeCards = inventory.filter(c => c.status !== 'sold');
    let unrealizedGains = 0, unrealizedLosses = 0;
    activeCards.forEach(card => {
      const basis = calculateCostBasis(card);
      const current = card.currentValue || basis;
      const diff = current - basis;
      if (diff >= 0) unrealizedGains += diff;
      else unrealizedLosses += Math.abs(diff);
    });

    // Tax-loss harvesting candidates
    const harvestCandidates: TaxHarvestCandidate[] = activeCards
      .filter(card => {
        const basis = calculateCostBasis(card);
        const current = card.currentValue || basis;
        return current < basis;
      })
      .map(card => {
        const costBasis = calculateCostBasis(card);
        const currentValue = card.currentValue || costBasis;
        const unrealizedLoss = costBasis - currentValue;
        const holdingPeriod = getHoldingPeriod(card.purchaseDate);
        const rate = holdingPeriod === 'Short-Term' ? SHORT_TERM_RATE : LONG_TERM_RATE;
        return {
          card,
          unrealizedLoss,
          costBasis,
          currentValue,
          holdingPeriod,
          taxSavingsEstimate: unrealizedLoss * rate,
        };
      })
      .sort((a, b) => b.taxSavingsEstimate - a.taxSavingsEstimate)
      .slice(0, 10);

    return {
      taxYear,
      method,
      totalProceeds,
      totalCostBasis,
      totalAdjustments: 0,
      shortTermGains,
      shortTermLosses,
      longTermGains,
      longTermLosses,
      netShortTerm,
      netLongTerm,
      totalNetGainLoss,
      estimatedTaxLiability,
      effectiveTaxRate,
      scheduleDEntries,
      unrealizedGains,
      unrealizedLosses,
      harvestCandidates,
      totalTransactions: soldInYear.length,
      avgHoldingDays: soldInYear.length > 0 ? Math.round(totalHoldingDays / soldInYear.length) : 0,
    };
  }

  /**
   * Generates a per-card tax lot analysis.
   */
  static getCardTaxLot(card: CardInventory): TaxLot {
    const costBasis = calculateCostBasis(card);
    const proceeds = card.salePrice || card.currentValue || costBasis;
    const isRealized = card.status === 'sold';
    const holdingPeriod = getHoldingPeriod(card.purchaseDate, card.saleDate);

    return {
      cardId: card.id,
      player: card.player,
      description: buildCardDescription(card),
      dateAcquired: card.purchaseDate,
      dateSold: card.saleDate,
      costBasis,
      proceeds: isRealized ? card.salePrice : undefined,
      gainLoss: proceeds - costBasis,
      holdingPeriod,
      isRealized,
      washSaleDisallowed: 0,
    };
  }

  /**
   * Compares tax liability across all cost-basis methods.
   */
  /**
   * Schedule D–style export packet: ST/LT buckets, totals, methodology disclaimer.
   * Not IRS regulatory completeness.
   */
  static buildScheduleDPacket(
    inventory: CardInventory[],
    taxYear: TaxYear = new Date().getFullYear(),
    method: CostBasisMethod = 'FIFO',
    generatedAt: string = new Date().toISOString(),
  ): ScheduleDPacket {
    const summary = this.generateTaxSummary(inventory, taxYear, method);
    const shortTerm = bucketFromEntries(
      'Short-Term',
      summary.scheduleDEntries.filter((e) => e.holdingPeriod === 'Short-Term'),
    );
    const longTerm = bucketFromEntries(
      'Long-Term',
      summary.scheduleDEntries.filter((e) => e.holdingPeriod === 'Long-Term'),
    );
    return {
      taxYear,
      method,
      generatedAt,
      shortTerm,
      longTerm,
      totals: {
        dispositions: summary.totalTransactions,
        proceeds: roundCents(summary.totalProceeds),
        costBasis: roundCents(summary.totalCostBasis),
        net: roundCents(summary.totalNetGainLoss),
        estimatedTaxLiability: roundCents(summary.estimatedTaxLiability),
      },
      methodologyDisclaimer: SCHEDULE_D_METHODOLOGY_DISCLAIMER,
      completenessNote: SCHEDULE_D_COMPLETENESS_NOTE,
    };
  }

  static formatScheduleDPacket(packet: ScheduleDPacket): string {
    const money = (n: number) =>
      n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const lines: string[] = [
      `MSI Schedule D–style packet — tax year ${packet.taxYear}`,
      `Generated: ${packet.generatedAt}`,
      `Cost-basis method (illustrative): ${packet.method}`,
      '',
      'Part I — Short-term (< 1 year)',
      `  Lots: ${packet.shortTerm.count}`,
      `  Proceeds: ${money(packet.shortTerm.proceeds)}`,
      `  Cost basis: ${money(packet.shortTerm.costBasis)}`,
      `  Gains: ${money(packet.shortTerm.gains)}`,
      `  Losses: ${money(packet.shortTerm.losses)}`,
      `  Net: ${money(packet.shortTerm.net)}`,
      '',
      'Part II — Long-term (≥ 1 year)',
      `  Lots: ${packet.longTerm.count}`,
      `  Proceeds: ${money(packet.longTerm.proceeds)}`,
      `  Cost basis: ${money(packet.longTerm.costBasis)}`,
      `  Gains: ${money(packet.longTerm.gains)}`,
      `  Losses: ${money(packet.longTerm.losses)}`,
      `  Net: ${money(packet.longTerm.net)}`,
      '',
      'Part III — Totals',
      `  Dispositions: ${packet.totals.dispositions}`,
      `  Proceeds: ${money(packet.totals.proceeds)}`,
      `  Cost basis: ${money(packet.totals.costBasis)}`,
      `  Net: ${money(packet.totals.net)}`,
      `  Estimated tax (illustrative): ${money(packet.totals.estimatedTaxLiability)}`,
      '',
      'Methodology',
      packet.methodologyDisclaimer,
      '',
      packet.completenessNote,
    ];
    if (packet.shortTerm.entries.length + packet.longTerm.entries.length > 0) {
      lines.push('', 'Lots');
      for (const entry of [...packet.shortTerm.entries, ...packet.longTerm.entries]) {
        lines.push(
          `  ${entry.holdingPeriod} | ${entry.description} | ${entry.dateAcquired} → ${entry.dateSold} | ${money(entry.proceeds)} − ${money(entry.costBasis)} = ${money(entry.gainLoss)}`,
        );
      }
    }
    return lines.join('\n');
  }

  static compareMethodTaxImpact(
    inventory: CardInventory[],
    taxYear: TaxYear = new Date().getFullYear()
  ): { method: CostBasisMethod; liability: number; netGain: number }[] {
    const methods: CostBasisMethod[] = ['FIFO', 'LIFO', 'SpecificID', 'AvgCost'];
    return methods.map(method => {
      const summary = this.generateTaxSummary(inventory, taxYear, method);
      return {
        method,
        liability: summary.estimatedTaxLiability,
        netGain: summary.totalNetGainLoss,
      };
    });
  }
}
