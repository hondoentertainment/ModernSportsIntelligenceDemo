// @ts-nocheck
import { store } from '../dal/syncStore';

// Phase 92 — Options & Derivatives Desk (Simulated)
// Bloomberg-style options analytics for sports card investing

// ---- Types ----

export interface CardOption {
  id: string;
  type: 'call' | 'put';
  player: string;
  cardDescription: string;
  currentPrice: number;
  strikePrice: number;
  premium: number;
  expirationDate: string;
  daysToExpiry: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  status: 'active' | 'expired' | 'exercised';
}

export interface InsurancePolicy {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  coveredValue: number;
  premium: number;
  premiumPercent: number;
  coverage: '80%' | '90%' | '100%';
  duration: '30d' | '90d' | '180d' | '365d';
  startDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'claimed';
}

export interface HedgeCalculation {
  portfolioValue: number;
  hedgeCost: number;
  hedgeCoverage: number;
  netExposure: number;
  maxLoss: number;
  costAsPercent: number;
  strategy: 'protective_put' | 'collar' | 'covered_call';
}

export interface VolatilitySurface {
  player: string;
  currentPrice: number;
  surface: { strike: number; expiry: number; iv: number }[];
  skew: number;
  termStructure: number[];
}

export interface ScenarioResult {
  scenario: string;
  portfolioImpact: number;
  hedgedImpact: number;
  savings: number;
  details: string[];
}

export interface DerivativesStats {
  activeOptions: number;
  activeInsurance: number;
  totalPremiumsPaid: number;
  portfolioCoverage: number;
  hedgeEfficiency: number;
  savedByHedging: number;
}

// ---- Player Data ----

interface PlayerData {
  name: string;
  card: string;
  price: number;
  vol: number; // annualized implied volatility
}

const PLAYERS: PlayerData[] = [
  { name: 'Shohei Ohtani', card: '2018 Topps Chrome #150 PSA 10', price: 1250, vol: 0.42 },
  { name: 'Victor Wembanyama', card: '2023 Prizm Silver #1 PSA 10', price: 2800, vol: 0.65 },
  { name: 'Luka Doncic', card: '2018 Prizm Silver #280 PSA 10', price: 3400, vol: 0.38 },
  { name: 'Patrick Mahomes', card: '2017 Prizm Silver #269 PSA 10', price: 4200, vol: 0.35 },
  { name: 'Julio Rodriguez', card: '2022 Topps Chrome #44 PSA 10', price: 450, vol: 0.55 },
  { name: 'Connor Bedard', card: '2023 Upper Deck #201 PSA 10', price: 680, vol: 0.72 },
];

// ---- Simplified Black-Scholes ----

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1.0 / (1.0 + p * Math.abs(x));
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1.0 + sign * y);
}

function blackScholes(
  type: 'call' | 'put',
  S: number,   // current price
  K: number,   // strike price
  T: number,   // time to expiry (years)
  r: number,   // risk-free rate
  sigma: number // volatility
): { price: number; delta: number; gamma: number; theta: number } {
  if (T <= 0) return { price: 0, delta: type === 'call' ? 1 : -1, gamma: 0, theta: 0 };

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const nd1 = normalCDF(d1);
  const nd2 = normalCDF(d2);
  const nPrimeD1 = Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);

  let price: number;
  let delta: number;

  if (type === 'call') {
    price = S * nd1 - K * Math.exp(-r * T) * nd2;
    delta = nd1;
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
    delta = nd1 - 1;
  }

  const gamma = nPrimeD1 / (S * sigma * Math.sqrt(T));
  const theta = (-(S * nPrimeD1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (type === 'call' ? nd2 : normalCDF(-d2))) / 365;

  return { price: Math.max(price, 0.01), delta: +delta.toFixed(4), gamma: +gamma.toFixed(6), theta: +theta.toFixed(4) };
}

// ---- localStorage helpers ----

const _LS_OPTIONS = 'msi_derivatives_options';
const LS_INSURANCE = 'msi_derivatives_insurance';
const LS_STATS = 'msi_derivatives_stats';

function loadJSON<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function saveJSON(key: string, val: unknown) {
  store.set(key, val);
}

// ---- Expiry dates ----

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---- Strike generation ----

function generateStrikes(price: number, count: number = 5): number[] {
  const step = Math.round(price * 0.05 / 5) * 5 || 5;
  const strikes: number[] = [];
  const center = Math.round(price / step) * step;
  for (let i = -Math.floor(count / 2); i <= Math.floor(count / 2); i++) {
    strikes.push(center + i * step);
  }
  return strikes.filter(s => s > 0);
}

const EXPIRY_DAYS = [30, 60, 90, 180];
const RISK_FREE = 0.045;

// ---- Public API ----

export function getAvailableOptions(player?: string): CardOption[] {
  const targetPlayers = player
    ? PLAYERS.filter(p => p.name === player)
    : PLAYERS;

  const options: CardOption[] = [];
  let idCounter = 0;

  for (const pl of targetPlayers) {
    const strikes = generateStrikes(pl.price);
    for (const strike of strikes) {
      for (const expDays of EXPIRY_DAYS) {
        const T = expDays / 365;
        for (const type of ['call', 'put'] as const) {
          const bs = blackScholes(type, pl.price, strike, T, RISK_FREE, pl.vol);
          idCounter++;
          options.push({
            id: `opt-${pl.name.replace(/\s/g, '-').toLowerCase()}-${idCounter}`,
            type,
            player: pl.name,
            cardDescription: pl.card,
            currentPrice: pl.price,
            strikePrice: strike,
            premium: +bs.price.toFixed(2),
            expirationDate: daysFromNow(expDays),
            daysToExpiry: expDays,
            impliedVolatility: +(pl.vol * (1 + (Math.random() - 0.5) * 0.1)).toFixed(4),
            delta: bs.delta,
            gamma: bs.gamma,
            theta: bs.theta,
            status: 'active',
          });
        }
      }
    }
  }

  return options;
}

export function priceOption(
  type: 'call' | 'put',
  player: string,
  strike: number,
  expiryDays: number
): CardOption | null {
  const pl = PLAYERS.find(p => p.name === player);
  if (!pl) return null;

  const T = expiryDays / 365;
  const bs = blackScholes(type, pl.price, strike, T, RISK_FREE, pl.vol);

  return {
    id: `opt-custom-${Date.now()}`,
    type,
    player: pl.name,
    cardDescription: pl.card,
    currentPrice: pl.price,
    strikePrice: strike,
    premium: +bs.price.toFixed(2),
    expirationDate: daysFromNow(expiryDays),
    daysToExpiry: expiryDays,
    impliedVolatility: pl.vol,
    delta: bs.delta,
    gamma: bs.gamma,
    theta: bs.theta,
    status: 'active',
  };
}

export function getInsurancePolicies(): InsurancePolicy[] {
  return loadJSON<InsurancePolicy[]>(LS_INSURANCE, []);
}

export function createInsurance(
  cardId: string,
  coverage: '80%' | '90%' | '100%',
  duration: '30d' | '90d' | '180d' | '365d'
): InsurancePolicy {
  // Pick a random player for the simulated card
  const pl = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
  const coveragePct = parseInt(coverage) / 100;
  const durationDays = parseInt(duration);
  const coveredValue = pl.price * coveragePct;

  // Premium based on volatility & duration
  const annualPremRate = pl.vol * 0.15 * coveragePct;
  const premium = +(pl.price * annualPremRate * (durationDays / 365)).toFixed(2);
  const premiumPercent = +((premium / pl.price) * 100).toFixed(2);

  const policy: InsurancePolicy = {
    id: `ins-${Date.now()}`,
    cardId,
    player: pl.name,
    cardDescription: pl.card,
    coveredValue: +coveredValue.toFixed(2),
    premium,
    premiumPercent,
    coverage,
    duration,
    startDate: new Date().toISOString().slice(0, 10),
    expirationDate: daysFromNow(durationDays),
    status: 'active',
  };

  const existing = getInsurancePolicies();
  existing.push(policy);
  saveJSON(LS_INSURANCE, existing);

  return policy;
}

export function calculateHedge(
  strategy: 'protective_put' | 'collar' | 'covered_call',
  coveragePercent: number
): HedgeCalculation {
  const portfolioValue = PLAYERS.reduce((s, p) => s + p.price, 0);
  const avgVol = PLAYERS.reduce((s, p) => s + p.vol, 0) / PLAYERS.length;

  let costMultiplier: number;
  let coverageFactor: number;
  let maxLossFactor: number;

  switch (strategy) {
    case 'protective_put':
      costMultiplier = avgVol * 0.12;
      coverageFactor = coveragePercent / 100;
      maxLossFactor = 1 - coverageFactor;
      break;
    case 'collar':
      costMultiplier = avgVol * 0.04; // cheaper — you cap upside
      coverageFactor = (coveragePercent / 100) * 0.9;
      maxLossFactor = 1 - coverageFactor;
      break;
    case 'covered_call':
      costMultiplier = -avgVol * 0.06; // you receive premium
      coverageFactor = (coveragePercent / 100) * 0.5;
      maxLossFactor = 1 - coverageFactor * 0.5;
      break;
    default:
      costMultiplier = 0.08;
      coverageFactor = 0.8;
      maxLossFactor = 0.2;
  }

  const hedgeCost = +(portfolioValue * costMultiplier * (coveragePercent / 100)).toFixed(2);
  const hedgeCoverage = +(coverageFactor * 100).toFixed(1);
  const netExposure = +(portfolioValue * (1 - coverageFactor)).toFixed(2);
  const maxLoss = +(portfolioValue * maxLossFactor).toFixed(2);
  const costAsPercent = +((Math.abs(hedgeCost) / portfolioValue) * 100).toFixed(2);

  return {
    portfolioValue,
    hedgeCost,
    hedgeCoverage,
    netExposure,
    maxLoss,
    costAsPercent,
    strategy,
  };
}

export function getVolatilitySurface(player: string): VolatilitySurface {
  const pl = PLAYERS.find(p => p.name === player) || PLAYERS[0];
  const strikes = generateStrikes(pl.price, 5);
  const expiries = [30, 60, 90, 180];

  const surface: { strike: number; expiry: number; iv: number }[] = [];

  for (const strike of strikes) {
    for (const expiry of expiries) {
      // Volatility smile: higher IV for OTM options
      const moneyness = Math.abs(strike - pl.price) / pl.price;
      const skewEffect = moneyness * 0.15;
      // Term structure: slightly higher IV for longer dated
      const termEffect = (expiry / 365) * 0.05;
      const iv = +(pl.vol + skewEffect + termEffect + (Math.random() - 0.5) * 0.03).toFixed(4);
      surface.push({ strike, expiry, iv });
    }
  }

  // Skew = difference in IV between OTM puts and ATM
  const atmIV = surface.find(s => s.strike === strikes[Math.floor(strikes.length / 2)] && s.expiry === 30)?.iv || pl.vol;
  const otmPutIV = surface.find(s => s.strike === strikes[0] && s.expiry === 30)?.iv || pl.vol;
  const skew = +(otmPutIV - atmIV).toFixed(4);

  // Term structure: average IV per expiry
  const termStructure = expiries.map(exp => {
    const pts = surface.filter(s => s.expiry === exp);
    return +(pts.reduce((s, p) => s + p.iv, 0) / pts.length).toFixed(4);
  });

  return { player: pl.name, currentPrice: pl.price, surface, skew, termStructure };
}

// ---- Scenario Library ----

interface ScenarioDef {
  label: string;
  impact: number; // portfolio % impact unhedged
  description: string;
}

const SCENARIOS: Record<string, ScenarioDef> = {
  injury: { label: 'Star Player Season-Ending Injury', impact: -0.25, description: 'Key player suffers season-ending injury, affecting related cards' },
  trade: { label: 'Star Traded to Contender', impact: 0.15, description: 'Top player traded to championship contender — card values surge' },
  market_crash: { label: 'Market-Wide Crash', impact: -0.20, description: 'Broad market sell-off impacts all card values simultaneously' },
  breakout: { label: 'Breakout Season', impact: 0.30, description: 'Young star has historic breakout season — cards skyrocket' },
  scandal: { label: 'Off-Field Scandal', impact: -0.35, description: 'Major scandal impacts player reputation and card values dramatically' },
};

export function runScenario(scenario: 'injury' | 'trade' | 'market_crash' | 'breakout' | 'scandal'): ScenarioResult {
  const def = SCENARIOS[scenario];
  const portfolioValue = PLAYERS.reduce((s, p) => s + p.price, 0);

  const portfolioImpact = +(portfolioValue * def.impact).toFixed(2);

  // Hedged impact assumes protective puts at 80% coverage
  const hedgeMitigation = def.impact < 0 ? 0.7 : 0.05; // hedges mostly help on downside
  const hedgedImpact = +(portfolioImpact * (1 - hedgeMitigation)).toFixed(2);
  const savings = +(Math.abs(portfolioImpact - hedgedImpact)).toFixed(2);

  const details: string[] = [];
  for (const pl of PLAYERS) {
    const playerImpact = pl.price * def.impact * (0.8 + Math.random() * 0.4);
    details.push(`${pl.name}: ${def.impact < 0 ? '' : '+'}$${playerImpact.toFixed(0)} (${pl.card})`);
  }

  return {
    scenario: def.label,
    portfolioImpact,
    hedgedImpact,
    savings,
    details,
  };
}

export function getDerivativesStats(): DerivativesStats {
  const policies = getInsurancePolicies();
  const activePolicies = policies.filter(p => p.status === 'active');
  const portfolioValue = PLAYERS.reduce((s, p) => s + p.price, 0);
  const totalCovered = activePolicies.reduce((s, p) => s + p.coveredValue, 0);

  const savedStats = loadJSON<{ savedByHedging: number }>(LS_STATS, { savedByHedging: 2340 });

  return {
    activeOptions: 12 + Math.floor(Math.random() * 5),
    activeInsurance: activePolicies.length,
    totalPremiumsPaid: +activePolicies.reduce((s, p) => s + p.premium, 0).toFixed(2),
    portfolioCoverage: portfolioValue > 0 ? +((totalCovered / portfolioValue) * 100).toFixed(1) : 0,
    hedgeEfficiency: 78 + Math.floor(Math.random() * 15),
    savedByHedging: savedStats.savedByHedging,
  };
}

export function getPlayerList(): string[] {
  return PLAYERS.map(p => p.name);
}

export function getPlayerPrice(name: string): number {
  return PLAYERS.find(p => p.name === name)?.price || 0;
}

// ---- Cross-reference: Quant Workbench (Phase 87) ----
// Bridge functions to integrate quantitative analysis into derivatives pricing

import {
  runBacktest,
  runScreener,
  type BacktestResult,
  type ScreenerResult,
  type ScreenerFilter,
} from '../utils/quantWorkbenchService';

export interface DerivativesQuantContext {
  backtestResult: BacktestResult | null;
  screenedHedgeCandidates: ScreenerResult | null;
  quantInsights: string[];
}

/**
 * Enriches derivatives analysis with quant workbench analytics from Phase 87.
 * Uses backtesting and screening to validate hedging strategies and
 * identify optimal options positions.
 */
export function getQuantEnrichedDerivatives(
  player: string,
): DerivativesQuantContext {
  const insights: string[] = [];

  // Run backtest for the player's volatility-based strategy
  let backtestResult: BacktestResult | null = null;
  try {
    backtestResult = runBacktest(
      `derivatives-hedge-${player}`,
      '2024-01-01',
      '2025-12-31',
    );

    if (backtestResult.maxDrawdown > 15) {
      insights.push(
        `Backtest shows ${backtestResult.maxDrawdown.toFixed(1)}% max drawdown. Protective puts recommended.`
      );
    }
    if (backtestResult.sharpeRatio < 0.5) {
      insights.push(
        `Low Sharpe ratio of ${backtestResult.sharpeRatio.toFixed(2)} suggests hedging would improve risk-adjusted returns.`
      );
    }
    if (backtestResult.winRate < 50) {
      insights.push(
        `Win rate of ${backtestResult.winRate.toFixed(1)}% is below 50%. Consider collar strategy to limit downside.`
      );
    }
  } catch {
    insights.push('Backtest engine unavailable — using default risk assumptions.');
  }

  // Screen for hedge candidates
  let screenedHedgeCandidates: ScreenerResult | null = null;
  try {
    const filters: ScreenerFilter[] = [
      { field: 'player', operator: 'contains', value: player, label: `Player: ${player}` },
      { field: 'change30d', operator: '<', value: -10, label: '30D decline > 10%' },
    ];
    screenedHedgeCandidates = runScreener(filters);

    if (screenedHedgeCandidates.totalMatches > 0) {
      insights.push(
        `Screener found ${screenedHedgeCandidates.totalMatches} cards with >10% decline. Hedging these positions is advisable.`
      );
    }
  } catch {
    // Screener unavailable
  }

  if (insights.length === 0) {
    insights.push('Quant analysis shows balanced risk profile. Current derivatives positioning is adequate.');
  }

  return {
    backtestResult,
    screenedHedgeCandidates,
    quantInsights: insights,
  };
}
