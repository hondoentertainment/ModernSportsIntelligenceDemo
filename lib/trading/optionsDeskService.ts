// Phase 134: Card Liquidity Options Desk
// Simulated options-style trading on sports cards — paper calls/puts, premium pricing, Greeks

// ---- Types ----

export type OptionType = 'call' | 'put';
export type OptionStyle = 'american' | 'european';
export type PositionSide = 'long' | 'short';
export type PositionStatus = 'open' | 'closed' | 'expired';
export type StrategyType = 'covered_call' | 'protective_put' | 'straddle' | 'strangle' | 'bull_call_spread' | 'bear_put_spread' | 'iron_condor';

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface Option {
  id: string;
  cardId: string;
  cardName: string;
  type: OptionType;
  style: OptionStyle;
  strike: number;
  premium: number;
  bid: number;
  ask: number;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  greeks: Greeks;
  expiration: string;
  daysToExpiration: number;
  inTheMoney: boolean;
}

export interface OptionsChain {
  cardId: string;
  cardName: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  expirations: string[];
  calls: Option[];
  puts: Option[];
}

export interface OptionPosition {
  id: string;
  cardId: string;
  cardName: string;
  type: OptionType;
  side: PositionSide;
  strike: number;
  expiration: string;
  daysToExpiration: number;
  quantity: number;
  entryPremium: number;
  currentPremium: number;
  entryDate: string;
  status: PositionStatus;
  pnl: number;
  pnlPercent: number;
  greeks: Greeks;
  currentCardPrice: number;
}

export interface PremiumModel {
  baseVolatility: number;
  historicalVolatility30d: number;
  historicalVolatility90d: number;
  impliedVolSkew: number;
  timeDecayFactor: number;
  liquidityPremium: number;
  eventRiskPremium: number;
  modelConfidence: number;
}

export interface StrategyLeg {
  type: OptionType;
  side: PositionSide;
  strikeOffset: number;
  quantity: number;
}

export interface StrategyTemplate {
  id: StrategyType;
  name: string;
  description: string;
  legs: StrategyLeg[];
  maxProfit: string;
  maxLoss: string;
  breakeven: string;
  idealCondition: string;
}

export interface PnlDataPoint {
  price: number;
  pnl: number;
}

export interface PortfolioGreeks {
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
  totalRho: number;
  positionCount: number;
  netExposure: number;
}

// ---- Card Underlyings ----

interface CardUnderlying {
  id: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  historicalVol: number;
}

const cardUnderlyings: CardUnderlying[] = [
  { id: 'card-001', name: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', currentPrice: 4250, priceChange24h: 85, historicalVol: 0.42 },
  { id: 'card-002', name: '2018 Panini Prizm Luka Doncic Silver PSA 10', currentPrice: 3800, priceChange24h: -45, historicalVol: 0.35 },
  { id: 'card-003', name: '1986 Fleer Michael Jordan RC PSA 9', currentPrice: 28500, priceChange24h: 320, historicalVol: 0.22 },
  { id: 'card-004', name: '2020 Panini Prizm Justin Herbert RC Silver PSA 10', currentPrice: 1450, priceChange24h: -18, historicalVol: 0.48 },
  { id: 'card-005', name: '2001 SP Authentic Tiger Woods RC /900 BGS 9.5', currentPrice: 6200, priceChange24h: 110, historicalVol: 0.31 },
  { id: 'card-006', name: '2011 Topps Update Mike Trout RC PSA 10', currentPrice: 18750, priceChange24h: -210, historicalVol: 0.25 },
  { id: 'card-007', name: '2003 Topps Chrome LeBron James RC Refractor PSA 10', currentPrice: 42000, priceChange24h: 550, historicalVol: 0.20 },
  { id: 'card-008', name: '2022 Panini Flawless Shohei Ohtani Patch Auto /25', currentPrice: 8900, priceChange24h: 175, historicalVol: 0.38 },
  { id: 'card-009', name: '2018 Panini National Treasures Josh Allen RC Auto /99', currentPrice: 5600, priceChange24h: -65, historicalVol: 0.40 },
  { id: 'card-010', name: '1952 Topps Mickey Mantle #311 PSA 5', currentPrice: 125000, priceChange24h: 1800, historicalVol: 0.15 },
];

// ---- Expiration Dates ----

const expirationDates: string[] = [
  '2026-04-17',
  '2026-05-15',
  '2026-06-19',
  '2026-09-18',
  '2026-12-18',
  '2027-03-19',
];

function getDaysToExpiration(expiration: string): number {
  const now = new Date('2026-03-16');
  const exp = new Date(expiration);
  return Math.max(0, Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// ---- Black-Scholes-like Pricing ----

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);
  return 0.5 * (1.0 + sign * y);
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function priceOption(
  spot: number,
  strike: number,
  timeToExpiry: number,
  volatility: number,
  riskFreeRate: number,
  optionType: OptionType
): { price: number; greeks: Greeks } {
  const t = timeToExpiry / 365;
  if (t <= 0) {
    const intrinsic = optionType === 'call'
      ? Math.max(0, spot - strike)
      : Math.max(0, strike - spot);
    return {
      price: intrinsic,
      greeks: { delta: optionType === 'call' ? (spot > strike ? 1 : 0) : (spot < strike ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 },
    };
  }

  const d1 = (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * t) / (volatility * Math.sqrt(t));
  const d2 = d1 - volatility * Math.sqrt(t);

  let price: number;
  let delta: number;

  if (optionType === 'call') {
    price = spot * normalCDF(d1) - strike * Math.exp(-riskFreeRate * t) * normalCDF(d2);
    delta = normalCDF(d1);
  } else {
    price = strike * Math.exp(-riskFreeRate * t) * normalCDF(-d2) - spot * normalCDF(-d1);
    delta = normalCDF(d1) - 1;
  }

  const gamma = normalPDF(d1) / (spot * volatility * Math.sqrt(t));
  const theta = (-(spot * normalPDF(d1) * volatility) / (2 * Math.sqrt(t))
    - riskFreeRate * strike * Math.exp(-riskFreeRate * t) * normalCDF(optionType === 'call' ? d2 : -d2) * (optionType === 'call' ? 1 : -1)) / 365;
  const vega = spot * normalPDF(d1) * Math.sqrt(t) / 100;
  const rho = (optionType === 'call' ? 1 : -1) * strike * t * Math.exp(-riskFreeRate * t) * normalCDF(optionType === 'call' ? d2 : -d2) / 100;

  return {
    price: Math.max(0, Math.round(price * 100) / 100),
    greeks: {
      delta: Math.round(delta * 10000) / 10000,
      gamma: Math.round(gamma * 10000) / 10000,
      theta: Math.round(theta * 100) / 100,
      vega: Math.round(vega * 100) / 100,
      rho: Math.round(rho * 100) / 100,
    },
  };
}

// ---- Generate Options Chain ----

function generateStrikes(spot: number): number[] {
  const step = spot < 2000 ? 100 : spot < 10000 ? 250 : spot < 50000 ? 1000 : 5000;
  const strikes: number[] = [];
  const baseStrike = Math.round(spot / step) * step;
  for (let i = -5; i <= 5; i++) {
    const s = baseStrike + i * step;
    if (s > 0) strikes.push(s);
  }
  return strikes;
}

function generateOptionsForCard(card: CardUnderlying, expiration: string): { calls: Option[]; puts: Option[] } {
  const strikes = generateStrikes(card.currentPrice);
  const dte = getDaysToExpiration(expiration);
  const riskFreeRate = 0.045;
  const calls: Option[] = [];
  const puts: Option[] = [];

  strikes.forEach((strike, idx) => {
    // Volatility smile: higher IV for OTM options
    const moneyness = Math.abs(card.currentPrice - strike) / card.currentPrice;
    const ivAdj = card.historicalVol + moneyness * 0.12 + (Math.random() * 0.04 - 0.02);

    const callResult = priceOption(card.currentPrice, strike, dte, ivAdj, riskFreeRate, 'call');
    const putResult = priceOption(card.currentPrice, strike, dte, ivAdj, riskFreeRate, 'put');

    const spreadFactor = 0.05 + moneyness * 0.1;
    const baseVol = Math.floor(80 + Math.random() * 400);
    const baseOI = Math.floor(200 + Math.random() * 1200);

    const callPremium = callResult.price;
    const callBid = Math.round((callPremium * (1 - spreadFactor)) * 100) / 100;
    const callAsk = Math.round((callPremium * (1 + spreadFactor)) * 100) / 100;
    const callChange = Math.round((Math.random() * 40 - 20) * 100) / 100;

    calls.push({
      id: `${card.id}-C-${strike}-${expiration}`,
      cardId: card.id,
      cardName: card.name,
      type: 'call',
      style: 'american',
      strike,
      premium: callPremium,
      bid: Math.max(0.01, callBid),
      ask: Math.max(0.02, callAsk),
      last: Math.round((callPremium + (Math.random() * 10 - 5)) * 100) / 100,
      change: callChange,
      changePercent: callPremium > 0 ? Math.round((callChange / callPremium) * 10000) / 100 : 0,
      volume: Math.floor(baseVol * (1 - moneyness * 0.6)),
      openInterest: Math.floor(baseOI * (1 - moneyness * 0.5)),
      impliedVolatility: Math.round(ivAdj * 10000) / 100,
      greeks: callResult.greeks,
      expiration,
      daysToExpiration: dte,
      inTheMoney: card.currentPrice > strike,
    });

    const putPremium = putResult.price;
    const putBid = Math.round((putPremium * (1 - spreadFactor)) * 100) / 100;
    const putAsk = Math.round((putPremium * (1 + spreadFactor)) * 100) / 100;
    const putChange = Math.round((Math.random() * 30 - 15) * 100) / 100;

    puts.push({
      id: `${card.id}-P-${strike}-${expiration}`,
      cardId: card.id,
      cardName: card.name,
      type: 'put',
      style: 'american',
      strike,
      premium: putPremium,
      bid: Math.max(0.01, putBid),
      ask: Math.max(0.02, putAsk),
      last: Math.round((putPremium + (Math.random() * 10 - 5)) * 100) / 100,
      change: putChange,
      changePercent: putPremium > 0 ? Math.round((putChange / putPremium) * 10000) / 100 : 0,
      volume: Math.floor(baseVol * (1 - moneyness * 0.5)),
      openInterest: Math.floor(baseOI * (1 - moneyness * 0.4)),
      impliedVolatility: Math.round(ivAdj * 10000) / 100,
      greeks: putResult.greeks,
      expiration,
      daysToExpiration: dte,
      inTheMoney: card.currentPrice < strike,
    });
  });

  return { calls, puts };
}

// ---- Mock Positions ----

const mockPositions: OptionPosition[] = [
  {
    id: 'pos-001',
    cardId: 'card-001',
    cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99',
    type: 'call',
    side: 'long',
    strike: 4500,
    expiration: '2026-04-17',
    daysToExpiration: 32,
    quantity: 3,
    entryPremium: 180,
    currentPremium: 245,
    entryDate: '2026-02-20',
    status: 'open',
    pnl: 195,
    pnlPercent: 36.11,
    greeks: { delta: 0.4215, gamma: 0.0008, theta: -3.45, vega: 8.12, rho: 0.52 },
    currentCardPrice: 4250,
  },
  {
    id: 'pos-002',
    cardId: 'card-003',
    cardName: '1986 Fleer Michael Jordan RC PSA 9',
    type: 'put',
    side: 'long',
    strike: 28000,
    expiration: '2026-06-19',
    daysToExpiration: 95,
    quantity: 1,
    entryPremium: 1250,
    currentPremium: 980,
    entryDate: '2026-03-01',
    status: 'open',
    pnl: -270,
    pnlPercent: -21.60,
    greeks: { delta: -0.3812, gamma: 0.0001, theta: -8.20, vega: 42.55, rho: -3.18 },
    currentCardPrice: 28500,
  },
  {
    id: 'pos-003',
    cardId: 'card-006',
    cardName: '2011 Topps Update Mike Trout RC PSA 10',
    type: 'call',
    side: 'short',
    strike: 20000,
    expiration: '2026-05-15',
    daysToExpiration: 60,
    quantity: 2,
    entryPremium: 520,
    currentPremium: 410,
    entryDate: '2026-02-28',
    status: 'open',
    pnl: 220,
    pnlPercent: 21.15,
    greeks: { delta: -0.3450, gamma: -0.0002, theta: 4.80, vega: -18.90, rho: -1.24 },
    currentCardPrice: 18750,
  },
  {
    id: 'pos-004',
    cardId: 'card-008',
    cardName: '2022 Panini Flawless Shohei Ohtani Patch Auto /25',
    type: 'call',
    side: 'long',
    strike: 9000,
    expiration: '2026-04-17',
    daysToExpiration: 32,
    quantity: 5,
    entryPremium: 390,
    currentPremium: 485,
    entryDate: '2026-03-05',
    status: 'open',
    pnl: 475,
    pnlPercent: 24.36,
    greeks: { delta: 0.4820, gamma: 0.0005, theta: -6.10, vega: 14.30, rho: 1.05 },
    currentCardPrice: 8900,
  },
  {
    id: 'pos-005',
    cardId: 'card-002',
    cardName: '2018 Panini Prizm Luka Doncic Silver PSA 10',
    type: 'put',
    side: 'long',
    strike: 3750,
    expiration: '2026-05-15',
    daysToExpiration: 60,
    quantity: 2,
    entryPremium: 165,
    currentPremium: 195,
    entryDate: '2026-03-10',
    status: 'open',
    pnl: 60,
    pnlPercent: 18.18,
    greeks: { delta: -0.4550, gamma: 0.0009, theta: -2.85, vega: 6.40, rho: -0.88 },
    currentCardPrice: 3800,
  },
  {
    id: 'pos-006',
    cardId: 'card-007',
    cardName: '2003 Topps Chrome LeBron James RC Refractor PSA 10',
    type: 'call',
    side: 'long',
    strike: 43000,
    expiration: '2026-09-18',
    daysToExpiration: 186,
    quantity: 1,
    entryPremium: 3200,
    currentPremium: 3650,
    entryDate: '2026-02-15',
    status: 'open',
    pnl: 450,
    pnlPercent: 14.06,
    greeks: { delta: 0.4680, gamma: 0.0001, theta: -12.50, vega: 88.20, rho: 8.40 },
    currentCardPrice: 42000,
  },
  {
    id: 'pos-007',
    cardId: 'card-009',
    cardName: '2018 Panini National Treasures Josh Allen RC Auto /99',
    type: 'put',
    side: 'short',
    strike: 5250,
    expiration: '2026-04-17',
    daysToExpiration: 32,
    quantity: 2,
    entryPremium: 210,
    currentPremium: 175,
    entryDate: '2026-03-02',
    status: 'open',
    pnl: 70,
    pnlPercent: 16.67,
    greeks: { delta: 0.2980, gamma: -0.0006, theta: 2.40, vega: -7.20, rho: 0.65 },
    currentCardPrice: 5600,
  },
  {
    id: 'pos-008',
    cardId: 'card-004',
    cardName: '2020 Panini Prizm Justin Herbert RC Silver PSA 10',
    type: 'call',
    side: 'long',
    strike: 1500,
    expiration: '2026-05-15',
    daysToExpiration: 60,
    quantity: 10,
    entryPremium: 72,
    currentPremium: 58,
    entryDate: '2026-03-08',
    status: 'open',
    pnl: -140,
    pnlPercent: -19.44,
    greeks: { delta: 0.4120, gamma: 0.0018, theta: -1.20, vega: 3.15, rho: 0.28 },
    currentCardPrice: 1450,
  },
];

// ---- Premium Model Data ----

const premiumModels: Record<string, PremiumModel> = {
  'card-001': { baseVolatility: 0.42, historicalVolatility30d: 0.45, historicalVolatility90d: 0.39, impliedVolSkew: 0.08, timeDecayFactor: 0.92, liquidityPremium: 0.03, eventRiskPremium: 0.05, modelConfidence: 0.82 },
  'card-002': { baseVolatility: 0.35, historicalVolatility30d: 0.33, historicalVolatility90d: 0.36, impliedVolSkew: 0.05, timeDecayFactor: 0.94, liquidityPremium: 0.02, eventRiskPremium: 0.03, modelConfidence: 0.88 },
  'card-003': { baseVolatility: 0.22, historicalVolatility30d: 0.20, historicalVolatility90d: 0.23, impliedVolSkew: 0.03, timeDecayFactor: 0.97, liquidityPremium: 0.01, eventRiskPremium: 0.02, modelConfidence: 0.94 },
  'card-004': { baseVolatility: 0.48, historicalVolatility30d: 0.52, historicalVolatility90d: 0.44, impliedVolSkew: 0.10, timeDecayFactor: 0.88, liquidityPremium: 0.04, eventRiskPremium: 0.06, modelConfidence: 0.75 },
  'card-005': { baseVolatility: 0.31, historicalVolatility30d: 0.29, historicalVolatility90d: 0.32, impliedVolSkew: 0.04, timeDecayFactor: 0.95, liquidityPremium: 0.02, eventRiskPremium: 0.03, modelConfidence: 0.86 },
  'card-006': { baseVolatility: 0.25, historicalVolatility30d: 0.27, historicalVolatility90d: 0.24, impliedVolSkew: 0.04, timeDecayFactor: 0.96, liquidityPremium: 0.01, eventRiskPremium: 0.02, modelConfidence: 0.91 },
  'card-007': { baseVolatility: 0.20, historicalVolatility30d: 0.19, historicalVolatility90d: 0.21, impliedVolSkew: 0.03, timeDecayFactor: 0.98, liquidityPremium: 0.01, eventRiskPremium: 0.01, modelConfidence: 0.95 },
  'card-008': { baseVolatility: 0.38, historicalVolatility30d: 0.41, historicalVolatility90d: 0.36, impliedVolSkew: 0.07, timeDecayFactor: 0.91, liquidityPremium: 0.03, eventRiskPremium: 0.04, modelConfidence: 0.80 },
  'card-009': { baseVolatility: 0.40, historicalVolatility30d: 0.43, historicalVolatility90d: 0.38, impliedVolSkew: 0.08, timeDecayFactor: 0.90, liquidityPremium: 0.03, eventRiskPremium: 0.05, modelConfidence: 0.79 },
  'card-010': { baseVolatility: 0.15, historicalVolatility30d: 0.14, historicalVolatility90d: 0.16, impliedVolSkew: 0.02, timeDecayFactor: 0.99, liquidityPremium: 0.01, eventRiskPremium: 0.01, modelConfidence: 0.97 },
};

// ---- Strategy Templates ----

export const strategyTemplates: StrategyTemplate[] = [
  {
    id: 'covered_call',
    name: 'Covered Call',
    description: 'Own the card, sell a call to generate income. Limits upside but collects premium.',
    legs: [{ type: 'call', side: 'short', strikeOffset: 1, quantity: 1 }],
    maxProfit: 'Premium received + (strike - current price)',
    maxLoss: 'Current price - premium received',
    breakeven: 'Current price - premium received',
    idealCondition: 'Neutral to slightly bullish. Expect card price to stay near current level.',
  },
  {
    id: 'protective_put',
    name: 'Protective Put',
    description: 'Own the card, buy a put as insurance. Limits downside while keeping upside.',
    legs: [{ type: 'put', side: 'long', strikeOffset: -1, quantity: 1 }],
    maxProfit: 'Unlimited upside minus premium paid',
    maxLoss: 'Current price - strike + premium paid',
    breakeven: 'Current price + premium paid',
    idealCondition: 'Bullish but want downside protection against market drops.',
  },
  {
    id: 'straddle',
    name: 'Long Straddle',
    description: 'Buy both a call and put at the same strike. Profit from large moves in either direction.',
    legs: [
      { type: 'call', side: 'long', strikeOffset: 0, quantity: 1 },
      { type: 'put', side: 'long', strikeOffset: 0, quantity: 1 },
    ],
    maxProfit: 'Unlimited in either direction',
    maxLoss: 'Total premium paid for both legs',
    breakeven: 'Strike +/- total premium paid',
    idealCondition: 'Expect high volatility. Major grading event, player milestone, or auction coming.',
  },
  {
    id: 'strangle',
    name: 'Long Strangle',
    description: 'Buy OTM call and OTM put. Cheaper than straddle but needs larger move to profit.',
    legs: [
      { type: 'call', side: 'long', strikeOffset: 2, quantity: 1 },
      { type: 'put', side: 'long', strikeOffset: -2, quantity: 1 },
    ],
    maxProfit: 'Unlimited in either direction',
    maxLoss: 'Total premium paid for both legs',
    breakeven: 'Upper strike + premium / Lower strike - premium',
    idealCondition: 'Expect very high volatility but at lower cost than a straddle.',
  },
  {
    id: 'bull_call_spread',
    name: 'Bull Call Spread',
    description: 'Buy a lower-strike call and sell a higher-strike call. Capped profit but reduced cost.',
    legs: [
      { type: 'call', side: 'long', strikeOffset: 0, quantity: 1 },
      { type: 'call', side: 'short', strikeOffset: 2, quantity: 1 },
    ],
    maxProfit: 'Difference in strikes - net premium paid',
    maxLoss: 'Net premium paid',
    breakeven: 'Lower strike + net premium paid',
    idealCondition: 'Moderately bullish. Expect card price to rise to a target level.',
  },
  {
    id: 'bear_put_spread',
    name: 'Bear Put Spread',
    description: 'Buy a higher-strike put and sell a lower-strike put. Profit from moderate declines.',
    legs: [
      { type: 'put', side: 'long', strikeOffset: 0, quantity: 1 },
      { type: 'put', side: 'short', strikeOffset: -2, quantity: 1 },
    ],
    maxProfit: 'Difference in strikes - net premium paid',
    maxLoss: 'Net premium paid',
    breakeven: 'Higher strike - net premium paid',
    idealCondition: 'Moderately bearish. Expect card price to decline to a support level.',
  },
  {
    id: 'iron_condor',
    name: 'Iron Condor',
    description: 'Sell OTM call spread and put spread. Profit from low volatility and time decay.',
    legs: [
      { type: 'put', side: 'long', strikeOffset: -3, quantity: 1 },
      { type: 'put', side: 'short', strikeOffset: -1, quantity: 1 },
      { type: 'call', side: 'short', strikeOffset: 1, quantity: 1 },
      { type: 'call', side: 'long', strikeOffset: 3, quantity: 1 },
    ],
    maxProfit: 'Net premium received',
    maxLoss: 'Width of wider spread - net premium received',
    breakeven: 'Lower short strike - premium / Upper short strike + premium',
    idealCondition: 'Neutral. Expect low volatility and card price to stay range-bound.',
  },
];

// ---- Public API ----

export function getCardUnderlyings(): CardUnderlying[] {
  return cardUnderlyings;
}

export function getOptionsChain(cardId: string, expiration?: string): OptionsChain {
  const card = cardUnderlyings.find(c => c.id === cardId) ?? cardUnderlyings[0];
  const exp = expiration ?? expirationDates[0];
  const { calls, puts } = generateOptionsForCard(card, exp);

  return {
    cardId: card.id,
    cardName: card.name,
    currentPrice: card.currentPrice,
    priceChange24h: card.priceChange24h,
    priceChangePercent24h: Math.round((card.priceChange24h / card.currentPrice) * 10000) / 100,
    expirations: expirationDates,
    calls,
    puts,
  };
}

export function calculateGreeks(
  spot: number,
  strike: number,
  dte: number,
  iv: number,
  optionType: OptionType
): Greeks {
  const result = priceOption(spot, strike, dte, iv, 0.045, optionType);
  return result.greeks;
}

export function getPositions(): OptionPosition[] {
  return mockPositions;
}

export function getExpirationDates(): string[] {
  return expirationDates;
}

export function getPremiumModel(cardId: string): PremiumModel {
  return premiumModels[cardId] ?? premiumModels['card-001'];
}

export function getPortfolioGreeks(): PortfolioGreeks {
  const openPositions = mockPositions.filter(p => p.status === 'open');
  const totals = openPositions.reduce(
    (acc, pos) => {
      const multiplier = pos.side === 'short' ? -1 : 1;
      const qty = pos.quantity * multiplier;
      return {
        delta: acc.delta + pos.greeks.delta * qty,
        gamma: acc.gamma + pos.greeks.gamma * qty,
        theta: acc.theta + pos.greeks.theta * qty,
        vega: acc.vega + pos.greeks.vega * qty,
        rho: acc.rho + pos.greeks.rho * qty,
        exposure: acc.exposure + pos.currentPremium * pos.quantity * multiplier,
      };
    },
    { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0, exposure: 0 }
  );

  return {
    totalDelta: Math.round(totals.delta * 10000) / 10000,
    totalGamma: Math.round(totals.gamma * 10000) / 10000,
    totalTheta: Math.round(totals.theta * 100) / 100,
    totalVega: Math.round(totals.vega * 100) / 100,
    totalRho: Math.round(totals.rho * 100) / 100,
    positionCount: openPositions.length,
    netExposure: Math.round(totals.exposure * 100) / 100,
  };
}

export function calculateStrategyPnl(
  spot: number,
  strategy: StrategyTemplate,
  expiration: string
): PnlDataPoint[] {
  const dte = getDaysToExpiration(expiration);
  const strikes = generateStrikes(spot);
  const step = strikes.length > 1 ? strikes[1] - strikes[0] : 100;
  const points: PnlDataPoint[] = [];
  const riskFreeRate = 0.045;

  // Calculate entry cost
  let totalEntryCost = 0;
  const legDetails = strategy.legs.map(leg => {
    const strikeIdx = Math.floor(strikes.length / 2) + leg.strikeOffset;
    const strike = strikes[Math.max(0, Math.min(strikes.length - 1, strikeIdx))];
    const result = priceOption(spot, strike, dte, 0.35, riskFreeRate, leg.type);
    const cost = leg.side === 'long' ? -result.price : result.price;
    totalEntryCost += cost * leg.quantity;
    return { ...leg, strike, entryPrice: result.price };
  });

  // Calculate P&L across price range
  const minPrice = Math.round(spot * 0.7);
  const maxPrice = Math.round(spot * 1.3);
  const priceStep = Math.max(1, Math.round((maxPrice - minPrice) / 60));

  for (let price = minPrice; price <= maxPrice; price += priceStep) {
    let pnl = 0;
    legDetails.forEach(leg => {
      const intrinsic = leg.type === 'call'
        ? Math.max(0, price - leg.strike)
        : Math.max(0, leg.strike - price);
      const legPnl = leg.side === 'long'
        ? (intrinsic - leg.entryPrice) * leg.quantity
        : (leg.entryPrice - intrinsic) * leg.quantity;
      pnl += legPnl;
    });
    points.push({ price, pnl: Math.round(pnl * 100) / 100 });
  }

  return points;
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}

export function getStrategyTemplates(): StrategyTemplate[] {
  return strategyTemplates;
}
