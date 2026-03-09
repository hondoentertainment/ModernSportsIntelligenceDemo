import { CardInventory } from '../types';

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
