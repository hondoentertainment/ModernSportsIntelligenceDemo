import { CardInventory } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'MXN' | 'BRL' | 'CNY';

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
  decimalPlaces: number;
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  change24h: number;   // percentage
  change7d: number;    // percentage
  change30d: number;   // percentage
}

export interface CurrencyTrendPoint {
  date: string;
  rate: number;
}

export interface MarketplaceListing {
  marketplace: string;
  country: string;
  currency: CurrencyCode;
  localPrice: number;
  shippingLocal: number;
  totalLocal: number;
  totalUSD: number;
  netSavingsUSD: number;
  isBestDeal: boolean;
}

export interface CrossBorderComparison {
  cardId: string;
  cardName: string;
  baseValueUSD: number;
  listings: MarketplaceListing[];
  bestDealMarketplace: string;
  maxSavingsUSD: number;
  savingsPercent: number;
}

export interface DutyEstimate {
  destinationCountry: string;
  itemValueUSD: number;
  dutyRate: number;
  dutyAmount: number;
  vatRate: number;
  vatAmount: number;
  handlingFee: number;
  totalLandedCost: number;
  totalDutyAndTax: number;
}

export interface CurrencyImpact {
  currency: CurrencyCode;
  portfolioValueLocal: number;
  portfolioValueUSD: number;
  change24hPercent: number;
  change7dPercent: number;
  change30dPercent: number;
  impactAmount: number;    // how much value changed due to FX
  trend: 'favorable' | 'unfavorable' | 'neutral';
}

export interface InternationalAlert {
  id: string;
  type: 'currency_advantage' | 'duty_free' | 'price_gap' | 'rate_swing';
  title: string;
  description: string;
  savingsUSD: number;
  marketplace: string;
  currency: CurrencyCode;
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface CurrencyPreferences {
  selectedCurrency: CurrencyCode;
  lastUpdated: string;
}

export interface PortfolioCurrencySummary {
  currency: CurrencyCode;
  totalValue: number;
  totalCost: number;
  roi: number;
  cardCount: number;
  fxImpact: number;
}

// ── Constants ────────────────────────────────────────────────────────────────────

const STORAGE_PREFS_KEY = 'msi_currency_prefs';
const STORAGE_RATES_KEY = 'msi_currency_rates_cache';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar',        symbol: '$',   flag: 'US', locale: 'en-US', decimalPlaces: 2 },
  EUR: { code: 'EUR', name: 'Euro',             symbol: '\u20AC',  flag: 'EU', locale: 'de-DE', decimalPlaces: 2 },
  GBP: { code: 'GBP', name: 'British Pound',    symbol: '\u00A3',  flag: 'GB', locale: 'en-GB', decimalPlaces: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar',   symbol: 'C$',  flag: 'CA', locale: 'en-CA', decimalPlaces: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$',  flag: 'AU', locale: 'en-AU', decimalPlaces: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen',      symbol: '\u00A5',  flag: 'JP', locale: 'ja-JP', decimalPlaces: 0 },
  CHF: { code: 'CHF', name: 'Swiss Franc',       symbol: 'Fr',  flag: 'CH', locale: 'de-CH', decimalPlaces: 2 },
  MXN: { code: 'MXN', name: 'Mexican Peso',      symbol: 'Mex$', flag: 'MX', locale: 'es-MX', decimalPlaces: 2 },
  BRL: { code: 'BRL', name: 'Brazilian Real',    symbol: 'R$',  flag: 'BR', locale: 'pt-BR', decimalPlaces: 2 },
  CNY: { code: 'CNY', name: 'Chinese Yuan',      symbol: '\u00A5',  flag: 'CN', locale: 'zh-CN', decimalPlaces: 2 },
};

export const CURRENCY_CODES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN', 'BRL', 'CNY'];

// Base exchange rates (vs USD) — deterministic/simulated
const BASE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.924,
  GBP: 0.792,
  CAD: 1.362,
  AUD: 1.538,
  JPY: 149.85,
  CHF: 0.883,
  MXN: 17.15,
  BRL: 4.97,
  CNY: 7.24,
};

// Duty rates by destination country (simplified)
const DUTY_RATES: Record<string, { duty: number; vat: number; handling: number; threshold: number }> = {
  US:  { duty: 0.0,   vat: 0.0,   handling: 0,    threshold: 800 },
  UK:  { duty: 0.025, vat: 0.20,  handling: 8,    threshold: 135 },
  EU:  { duty: 0.025, vat: 0.19,  handling: 10,   threshold: 150 },
  CA:  { duty: 0.0,   vat: 0.05,  handling: 9.95, threshold: 20 },
  AU:  { duty: 0.05,  vat: 0.10,  handling: 0,    threshold: 1000 },
  JP:  { duty: 0.0,   vat: 0.10,  handling: 200,  threshold: 10000 },
  CH:  { duty: 0.0,   vat: 0.077, handling: 15,   threshold: 300 },
  MX:  { duty: 0.16,  vat: 0.16,  handling: 0,    threshold: 50 },
  BR:  { duty: 0.60,  vat: 0.0,   handling: 15,   threshold: 50 },
  CN:  { duty: 0.10,  vat: 0.13,  handling: 50,   threshold: 50 },
};

// International marketplaces
const MARKETPLACES: { name: string; country: string; currency: CurrencyCode; shippingBase: number; shippingPerUSD: number }[] = [
  { name: 'eBay US',             country: 'US', currency: 'USD', shippingBase: 4.99,  shippingPerUSD: 0.0 },
  { name: 'eBay UK',             country: 'UK', currency: 'GBP', shippingBase: 3.50,  shippingPerUSD: 0.005 },
  { name: 'Yahoo Auctions Japan', country: 'JP', currency: 'JPY', shippingBase: 800,   shippingPerUSD: 0.02 },
  { name: 'eBay Germany',        country: 'EU', currency: 'EUR', shippingBase: 5.90,  shippingPerUSD: 0.004 },
  { name: 'eBay Australia',      country: 'AU', currency: 'AUD', shippingBase: 8.50,  shippingPerUSD: 0.008 },
  { name: 'Mercado Libre Mexico', country: 'MX', currency: 'MXN', shippingBase: 89,   shippingPerUSD: 0.01 },
  { name: 'eBay Canada',         country: 'CA', currency: 'CAD', shippingBase: 6.99,  shippingPerUSD: 0.003 },
];

// ── Deterministic helpers ────────────────────────────────────────────────────────

function dateHash(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Exchange rate functions ──────────────────────────────────────────────────────

/**
 * Get the current simulated exchange rate from USD to a target currency.
 * Adds deterministic daily variance so rates shift slightly each day.
 */
export function getExchangeRate(to: CurrencyCode): number {
  if (to === 'USD') return 1.0;
  const base = BASE_RATES[to];
  const seed = dateHash(new Date()) + stringHash(to);
  const rand = seededRandom(seed);
  const variance = (rand() - 0.5) * 0.04; // +/- 2%
  return Math.round(base * (1 + variance) * 10000) / 10000;
}

/**
 * Get all exchange rates with trend data.
 */
export function getAllExchangeRates(): ExchangeRate[] {
  const now = new Date();
  return CURRENCY_CODES.filter(c => c !== 'USD').map(code => {
    const rate = getExchangeRate(code);
    const seed = dateHash(now) + stringHash(code);
    const rand = seededRandom(seed + 1000);
    const change24h = (rand() - 0.5) * 3.0;  // +/- 1.5%
    const change7d  = (rand() - 0.5) * 6.0;  // +/- 3%
    const change30d = (rand() - 0.5) * 12.0;  // +/- 6%
    return {
      from: 'USD' as CurrencyCode,
      to: code,
      rate,
      change24h: Math.round(change24h * 100) / 100,
      change7d: Math.round(change7d * 100) / 100,
      change30d: Math.round(change30d * 100) / 100,
    };
  });
}

/**
 * Convert an amount from one currency to another.
 */
export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const fromRate = getExchangeRate(from);
  const toRate = getExchangeRate(to);
  // Convert from -> USD -> to
  const usdAmount = amount / fromRate;
  return Math.round(usdAmount * toRate * 100) / 100;
}

/**
 * Format a currency value using its locale and symbol.
 */
export function formatCurrency(amount: number, code: CurrencyCode): string {
  const info = CURRENCIES[code];
  if (code === 'JPY') {
    return `${info.symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${info.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: info.decimalPlaces,
    maximumFractionDigits: info.decimalPlaces,
  })}`;
}

/**
 * Generate 30-day trend data for a currency pair.
 */
export function getCurrencyTrend(code: CurrencyCode, days: number = 30): CurrencyTrendPoint[] {
  const base = BASE_RATES[code];
  const points: CurrencyTrendPoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seed = dateHash(d) + stringHash(code);
    const rand = seededRandom(seed);
    const variance = (rand() - 0.5) * 0.06;
    const rate = Math.round(base * (1 + variance) * 10000) / 10000;
    points.push({
      date: d.toISOString().slice(0, 10),
      rate,
    });
  }

  return points;
}

// ── Portfolio conversion ─────────────────────────────────────────────────────────

/**
 * Get full portfolio value summary in a given currency.
 */
export function getPortfolioInCurrency(
  inventory: CardInventory[],
  currency: CurrencyCode
): PortfolioCurrencySummary {
  const rate = getExchangeRate(currency);
  const activeCards = inventory.filter(c => c.status !== 'sold');

  const totalValueUSD = activeCards.reduce((sum, c) => sum + (c.currentValue ?? c.purchasePrice), 0);
  const totalCostUSD = activeCards.reduce((sum, c) => sum + c.purchasePrice, 0);

  const totalValue = Math.round(totalValueUSD * rate * 100) / 100;
  const totalCost = Math.round(totalCostUSD * rate * 100) / 100;
  const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  // Simulate FX impact: difference from what it would have been at base rate
  const baseValue = totalValueUSD * BASE_RATES[currency];
  const fxImpact = Math.round((totalValue - baseValue) * 100) / 100;

  return {
    currency,
    totalValue,
    totalCost,
    roi: Math.round(roi * 100) / 100,
    cardCount: activeCards.length,
    fxImpact,
  };
}

/**
 * Calculate currency impact on portfolio for non-USD collectors.
 */
export function getCurrencyImpact(
  inventory: CardInventory[],
  currency: CurrencyCode
): CurrencyImpact {
  const summary = getPortfolioInCurrency(inventory, currency);
  const rates = getAllExchangeRates();
  const rateInfo = rates.find(r => r.to === currency);

  const change24h = rateInfo?.change24h ?? 0;
  const change7d = rateInfo?.change7d ?? 0;
  const change30d = rateInfo?.change30d ?? 0;

  let trend: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
  if (change7d < -1) trend = 'favorable';   // USD weakening = good for non-USD
  else if (change7d > 1) trend = 'unfavorable'; // USD strengthening = bad

  return {
    currency,
    portfolioValueLocal: summary.totalValue,
    portfolioValueUSD: summary.totalValue / getExchangeRate(currency),
    change24hPercent: change24h,
    change7dPercent: change7d,
    change30dPercent: change30d,
    impactAmount: summary.fxImpact,
    trend,
  };
}

// ── Cross-border comparison ──────────────────────────────────────────────────────

/**
 * Compare prices for a card across international marketplaces.
 */
export function getCrossBorderComparison(card: CardInventory): CrossBorderComparison {
  const baseValueUSD = card.currentValue ?? card.purchasePrice;
  const seed = stringHash(card.id + card.player);
  const rand = seededRandom(seed);

  const listings: MarketplaceListing[] = MARKETPLACES.map(mp => {
    const rate = getExchangeRate(mp.currency);
    // Simulate price variance per marketplace (+/- 15%)
    const variance = 0.85 + rand() * 0.30;
    const localPrice = Math.round(baseValueUSD * variance * rate * 100) / 100;
    const shippingLocal = mp.shippingBase + (mp.currency === 'JPY'
      ? Math.round(baseValueUSD * mp.shippingPerUSD * rate)
      : Math.round(baseValueUSD * mp.shippingPerUSD * rate * 100) / 100);
    const totalLocal = localPrice + shippingLocal;
    const totalUSD = Math.round(totalLocal / rate * 100) / 100;
    const netSavingsUSD = Math.round((baseValueUSD - totalUSD) * 100) / 100;

    return {
      marketplace: mp.name,
      country: mp.country,
      currency: mp.currency,
      localPrice,
      shippingLocal,
      totalLocal,
      totalUSD,
      netSavingsUSD,
      isBestDeal: false,
    };
  });

  // Mark best deal
  const sorted = [...listings].sort((a, b) => a.totalUSD - b.totalUSD);
  if (sorted.length > 0) {
    const bestIdx = listings.findIndex(l => l.marketplace === sorted[0].marketplace);
    if (bestIdx >= 0) listings[bestIdx].isBestDeal = true;
  }

  const bestDeal = sorted[0];
  const maxSavingsUSD = bestDeal ? Math.max(0, baseValueUSD - bestDeal.totalUSD) : 0;
  const savingsPercent = baseValueUSD > 0 ? Math.round((maxSavingsUSD / baseValueUSD) * 1000) / 10 : 0;

  return {
    cardId: card.id,
    cardName: `${card.year} ${card.manufacturer} ${card.player}`,
    baseValueUSD,
    listings,
    bestDealMarketplace: bestDeal?.marketplace ?? 'eBay US',
    maxSavingsUSD: Math.round(maxSavingsUSD * 100) / 100,
    savingsPercent,
  };
}

// ── Import duty calculator ───────────────────────────────────────────────────────

/**
 * Estimate customs duty and taxes for importing a card to a destination country.
 */
export function calculateImportDuty(
  itemValueUSD: number,
  destinationCountry: string
): DutyEstimate {
  const rates = DUTY_RATES[destinationCountry] ?? DUTY_RATES['US'];

  const dutyAmount = itemValueUSD > rates.threshold
    ? Math.round(itemValueUSD * rates.duty * 100) / 100
    : 0;

  const vatBase = itemValueUSD + dutyAmount;
  const vatAmount = itemValueUSD > rates.threshold
    ? Math.round(vatBase * rates.vat * 100) / 100
    : 0;

  const handlingFee = itemValueUSD > rates.threshold ? rates.handling : 0;
  const totalDutyAndTax = Math.round((dutyAmount + vatAmount + handlingFee) * 100) / 100;
  const totalLandedCost = Math.round((itemValueUSD + totalDutyAndTax) * 100) / 100;

  return {
    destinationCountry,
    itemValueUSD,
    dutyRate: rates.duty,
    dutyAmount,
    vatRate: rates.vat,
    vatAmount,
    handlingFee,
    totalLandedCost,
    totalDutyAndTax,
  };
}

/**
 * Get all supported destination countries for duty calculation.
 */
export function getDutyCountries(): { code: string; name: string }[] {
  return [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'EU', name: 'European Union' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CN', name: 'China' },
  ];
}

// ── International marketplace alerts ─────────────────────────────────────────────

/**
 * Generate alerts where currency movements create cross-border buying opportunities.
 */
export function getInternationalAlerts(inventory: CardInventory[]): InternationalAlert[] {
  const alerts: InternationalAlert[] = [];
  const now = new Date();
  const seed = dateHash(now);
  const rand = seededRandom(seed + 5000);
  const rates = getAllExchangeRates();

  // Rate swing alerts
  for (const rate of rates) {
    if (Math.abs(rate.change7d) > 2.0) {
      const direction = rate.change7d > 0 ? 'strengthened' : 'weakened';
      const info = CURRENCIES[rate.to];
      alerts.push({
        id: `alert-swing-${rate.to}`,
        type: 'rate_swing',
        title: `${info.name} ${direction} ${Math.abs(rate.change7d).toFixed(1)}%`,
        description: `The ${info.name} has ${direction} against USD by ${Math.abs(rate.change7d).toFixed(1)}% this week. ${
          rate.change7d > 0
            ? `Cards priced in ${rate.to} are now relatively cheaper for USD buyers.`
            : `Consider holding off on ${rate.to}-denominated purchases.`
        }`,
        savingsUSD: 0,
        marketplace: '',
        currency: rate.to,
        urgency: Math.abs(rate.change7d) > 4 ? 'high' : 'medium',
        createdAt: now.toISOString(),
      });
    }
  }

  // Cross-border deal alerts (sample up to 3 cards)
  const activeCards = inventory.filter(c => c.status !== 'sold' && (c.currentValue ?? 0) > 50);
  const sampleCards = activeCards.slice(0, Math.min(3, activeCards.length));

  for (const card of sampleCards) {
    const comparison = getCrossBorderComparison(card);
    if (comparison.savingsPercent > 8) {
      const bestListing = comparison.listings.find(l => l.isBestDeal);
      if (bestListing) {
        alerts.push({
          id: `alert-deal-${card.id}`,
          type: 'currency_advantage',
          title: `${card.player}: ${comparison.savingsPercent}% cheaper on ${bestListing.marketplace}`,
          description: `${comparison.cardName} is available for ${formatCurrency(bestListing.totalLocal, bestListing.currency)} (${formatCurrency(bestListing.totalUSD, 'USD')}) on ${bestListing.marketplace}, saving ${formatCurrency(comparison.maxSavingsUSD, 'USD')} vs US market.`,
          savingsUSD: comparison.maxSavingsUSD,
          marketplace: bestListing.marketplace,
          currency: bestListing.currency,
          urgency: comparison.savingsPercent > 15 ? 'high' : 'medium',
          createdAt: now.toISOString(),
        });
      }
    }
  }

  // Add a simulated price gap alert if we have cards
  if (inventory.length > 0 && rand() > 0.4) {
    alerts.push({
      id: `alert-gap-${seed}`,
      type: 'price_gap',
      title: 'Japan market premium detected',
      description: 'Japanese card market currently trading at 12-18% premium for vintage US sports cards. Consider selling graded vintage via Yahoo Auctions Japan for higher returns.',
      savingsUSD: 0,
      marketplace: 'Yahoo Auctions Japan',
      currency: 'JPY',
      urgency: 'low',
      createdAt: now.toISOString(),
    });
  }

  return alerts.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

// ── localStorage persistence ─────────────────────────────────────────────────────

export function getCurrencyPreferences(): CurrencyPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { selectedCurrency: 'USD', lastUpdated: new Date().toISOString() };
}

export function saveCurrencyPreferences(prefs: CurrencyPreferences): void {
  localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
}

export function setSelectedCurrency(code: CurrencyCode): void {
  saveCurrencyPreferences({
    selectedCurrency: code,
    lastUpdated: new Date().toISOString(),
  });
}

export function getSelectedCurrency(): CurrencyCode {
  return getCurrencyPreferences().selectedCurrency;
}

export function cacheExchangeRates(rates: ExchangeRate[]): void {
  try {
    localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify({
      rates,
      cachedAt: new Date().toISOString(),
    }));
  } catch { /* ignore */ }
}

export function getCachedExchangeRates(): { rates: ExchangeRate[]; cachedAt: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_RATES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

/**
 * Clear all currency-related cached data.
 */
export function clearCurrencyCache(): void {
  localStorage.removeItem(STORAGE_RATES_KEY);
}
