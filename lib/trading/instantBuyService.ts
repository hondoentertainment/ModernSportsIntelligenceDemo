import { CardInventory } from '../../types';
import { LiquidityService } from '../liquidityService';
import { store } from '../dal/syncStore';

/** MSI House discount tiers based on liquidity score */
const HOUSE_DISCOUNT_TIERS = [
  { minScore: 80, discount: 0.08, label: 'Premium Liquid' },   // 8% discount for highly liquid cards
  { minScore: 60, discount: 0.12, label: 'Standard' },          // 12% discount
  { minScore: 40, discount: 0.18, label: 'Moderate' },          // 18% discount
  { minScore: 20, discount: 0.25, label: 'Low Liquidity' },     // 25% discount
  { minScore: 0, discount: 0.35, label: 'Illiquid' },           // 35% discount for hard-to-move cards
];

export interface InstantBuyQuote {
  cardId: string;
  fairMarketValue: number;
  liquidityScore: number;
  discountTier: string;
  discountPercent: number;
  instantBuyPrice: number;
  platformFee: number;        // MSI processing fee (2%)
  netPayout: number;          // What the seller actually receives
  expiresAt: string;          // Quote valid for 15 minutes
  speedBonus: number;         // Extra % if sold within 5 minutes
  comparisons: {
    ebayNet: number;          // Net after eBay fees (for comparison)
    timeSaved: string;        // "7-14 days" vs instant
  };
}

export interface LiquidityPoolStats {
  totalPoolValue: number;
  activeQuotes: number;
  totalTransactions: number;
  avgDiscount: number;
  totalPaidOut: number;
}

const PLATFORM_FEE_RATE = 0.02;   // 2% MSI processing fee
const SPEED_BONUS_RATE = 0.02;    // 2% extra if accepted within 5 min
const QUOTE_VALIDITY_MINUTES = 15;
const STORAGE_KEY = 'msi_instant_buy_history';

/**
 * Get the house discount tier for a given liquidity score.
 */
function getDiscountTier(liquidityScore: number) {
  return HOUSE_DISCOUNT_TIERS.find(t => liquidityScore >= t.minScore) || HOUSE_DISCOUNT_TIERS[HOUSE_DISCOUNT_TIERS.length - 1];
}

/**
 * Generate an instant buy quote for a card.
 * The MSI House offers to buy the card at a discount based on its liquidity profile.
 */
export function generateInstantBuyQuote(card: CardInventory): InstantBuyQuote | null {
  const fmv = card.currentValue || card.purchasePrice || 0;
  if (fmv <= 0) return null;

  const liquidityScore = LiquidityService.calculateLiquidityScore(card);
  const tier = getDiscountTier(liquidityScore);

  const instantBuyPrice = Math.round(fmv * (1 - tier.discount) * 100) / 100;
  const platformFee = Math.round(instantBuyPrice * PLATFORM_FEE_RATE * 100) / 100;
  const speedBonus = Math.round(instantBuyPrice * SPEED_BONUS_RATE * 100) / 100;
  const netPayout = Math.round((instantBuyPrice - platformFee) * 100) / 100;

  // eBay comparison: 13.12% + $0.30
  const ebayFees = fmv * 0.1312 + 0.30;
  const ebayNet = Math.round((fmv - ebayFees) * 100) / 100;

  const expiresAt = new Date(Date.now() + QUOTE_VALIDITY_MINUTES * 60 * 1000).toISOString();

  return {
    cardId: card.id,
    fairMarketValue: fmv,
    liquidityScore,
    discountTier: tier.label,
    discountPercent: Math.round(tier.discount * 100),
    instantBuyPrice,
    platformFee,
    netPayout,
    expiresAt,
    speedBonus,
    comparisons: {
      ebayNet,
      timeSaved: liquidityScore >= 60 ? '7-10 days' : '14-30 days',
    },
  };
}

/**
 * Check if a quote is still valid (not expired).
 */
export function isQuoteValid(quote: InstantBuyQuote): boolean {
  return new Date(quote.expiresAt) > new Date();
}

/**
 * Record an instant buy transaction.
 */
export function recordInstantBuy(quote: InstantBuyQuote, acceptedWithinSpeedWindow: boolean): void {
  const history = getInstantBuyHistory();
  history.push({
    ...quote,
    acceptedAt: new Date().toISOString(),
    speedBonusApplied: acceptedWithinSpeedWindow,
    finalPayout: acceptedWithinSpeedWindow
      ? Math.round((quote.netPayout + quote.speedBonus) * 100) / 100
      : quote.netPayout,
  });
  store.set(STORAGE_KEY, history);
}

/**
 * Get instant buy transaction history.
 */
export function getInstantBuyHistory(): Array<InstantBuyQuote & { acceptedAt: string; speedBonusApplied: boolean; finalPayout: number }> {
  return store.get<Array<InstantBuyQuote & { acceptedAt: string; speedBonusApplied: boolean; finalPayout: number }>>(STORAGE_KEY, []);
}

/**
 * Get aggregate stats for the liquidity pool.
 */
export function getLiquidityPoolStats(): LiquidityPoolStats {
  const history = getInstantBuyHistory();
  const totalPaidOut = history.reduce((sum, h) => sum + h.finalPayout, 0);
  const avgDiscount = history.length > 0
    ? history.reduce((sum, h) => sum + h.discountPercent, 0) / history.length
    : 0;

  return {
    totalPoolValue: 250000, // Simulated pool capitalization
    activeQuotes: 0,
    totalTransactions: history.length,
    avgDiscount: Math.round(avgDiscount * 10) / 10,
    totalPaidOut: Math.round(totalPaidOut * 100) / 100,
  };
}

/**
 * Batch generate quotes for an entire portfolio.
 * Returns cards sorted by best value (lowest discount = best deal for seller).
 */
export function generatePortfolioQuotes(inventory: CardInventory[]): InstantBuyQuote[] {
  return inventory
    .filter(c => c.status !== 'sold' && (c.currentValue || c.purchasePrice || 0) > 0)
    .map(c => generateInstantBuyQuote(c))
    .filter((q): q is InstantBuyQuote => q !== null)
    .sort((a, b) => a.discountPercent - b.discountPercent);
}
