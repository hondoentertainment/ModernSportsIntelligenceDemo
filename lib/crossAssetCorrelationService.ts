import { CardInventory, Sport } from '../types';

// ---- Types ----

export type MarketAsset =
  | 'sp500'
  | 'bitcoin'
  | 'gold'
  | 'treasuries'
  | 'realestate';

export type AlternativeAsset =
  | 'art'
  | 'wine'
  | 'vintage_cars'
  | 'sneakers';

export type MarketRegime =
  | 'risk_on'
  | 'risk_off'
  | 'hobby_boom'
  | 'hobby_bust';

export type TimeWindow = 30 | 90 | 365;

export interface AssetCorrelation {
  asset: MarketAsset | AlternativeAsset;
  label: string;
  correlation30d: number;
  correlation90d: number;
  correlation365d: number;
  beta: number;
}

export interface AssetTimeSeries {
  date: string;
  portfolio: number;
  sp500: number;
  bitcoin: number;
  gold: number;
  treasuries: number;
  realestate: number;
  art: number;
  wine: number;
  vintage_cars: number;
  sneakers: number;
}

export interface SportMarketLinkage {
  sport: Sport;
  contractCorrelation: number;
  winPctCorrelation: number;
  fantasyCorrelation: number;
  summary: string;
}

export interface PortfolioBeta {
  asset: MarketAsset;
  label: string;
  beta: number;
  interpretation: string;
}

export interface HedgeAllocation {
  asset: MarketAsset | AlternativeAsset | 'cards';
  label: string;
  currentWeight: number;
  optimalWeight: number;
  delta: number;
}

export interface RegimeAnalysis {
  regime: MarketRegime;
  label: string;
  description: string;
  probability: number;
  cardReturn: number;
  sp500Return: number;
  goldReturn: number;
  bitcoinReturn: number;
  isActive: boolean;
}

export interface MacroEvent {
  id: string;
  name: string;
  date: string;
  type: 'rate_hike' | 'recession' | 'stimulus' | 'inflation' | 'crash';
  cardImpact: number;
  sp500Impact: number;
  goldImpact: number;
  bitcoinImpact: number;
  description: string;
}

export interface AlternativeBenchmark {
  asset: AlternativeAsset;
  label: string;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  volatility: number;
  sharpeRatio: number;
  correlation: number;
}

export interface DiversificationReport {
  score: number;
  portfolioBeta: number;
  currentRegime: MarketRegime;
  regimeLabel: string;
  topCorrelated: AssetCorrelation;
  leastCorrelated: AssetCorrelation;
  hedgeRecommendation: string;
}

export interface CorrelationDashboard {
  correlations: AssetCorrelation[];
  timeSeries: AssetTimeSeries[];
  sportLinkages: SportMarketLinkage[];
  betas: PortfolioBeta[];
  hedgeAllocations: HedgeAllocation[];
  regimes: RegimeAnalysis[];
  macroEvents: MacroEvent[];
  benchmarks: AlternativeBenchmark[];
  report: DiversificationReport;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_cross_asset_correlation';
const SETTINGS_KEY = 'msi_correlation_settings';

const MARKET_LABELS: Record<MarketAsset, string> = {
  sp500: 'S&P 500',
  bitcoin: 'Bitcoin',
  gold: 'Gold',
  treasuries: 'US Treasuries',
  realestate: 'Real Estate',
};

const ALT_LABELS: Record<AlternativeAsset, string> = {
  art: 'Fine Art',
  wine: 'Fine Wine',
  vintage_cars: 'Vintage Cars',
  sneakers: 'Sneakers',
};

const REGIME_LABELS: Record<MarketRegime, string> = {
  risk_on: 'Risk-On',
  risk_off: 'Risk-Off',
  hobby_boom: 'Hobby Boom',
  hobby_bust: 'Hobby Bust',
};

export { MARKET_LABELS, ALT_LABELS, REGIME_LABELS };

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function seededGaussian(seed: number, offset: number): number {
  const u1 = Math.max(0.0001, seededRandom(seed, offset));
  const u2 = seededRandom(seed, offset + 1);
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function portfolioSeed(cards: CardInventory[]): number {
  if (cards.length === 0) return 42;
  let h = 0;
  for (const c of cards) {
    for (let i = 0; i < c.id.length; i++) {
      h = ((h << 5) - h + c.id.charCodeAt(i)) | 0;
    }
  }
  return Math.abs(h);
}

// ---- Core calculations ----

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const dA = a[i] - meanA;
    const dB = b[i] - meanB;
    num += dA * dB;
    denA += dA * dA;
    denB += dB * dB;
  }
  const den = Math.sqrt(denA * denB);
  if (den === 0) return 0;
  return Math.max(-1, Math.min(1, num / den));
}

function calculateBeta(assetReturns: number[], marketReturns: number[]): number {
  const n = Math.min(assetReturns.length, marketReturns.length);
  if (n < 2) return 0;
  const meanM = marketReturns.slice(0, n).reduce((s, v) => s + v, 0) / n;
  const meanA = assetReturns.slice(0, n).reduce((s, v) => s + v, 0) / n;
  let cov = 0, varM = 0;
  for (let i = 0; i < n; i++) {
    const dA = assetReturns[i] - meanA;
    const dM = marketReturns[i] - meanM;
    cov += dA * dM;
    varM += dM * dM;
  }
  if (varM === 0) return 0;
  return Math.max(-2, Math.min(2, cov / varM));
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

// ---- Simulated market data generators ----

function generateMarketReturns(
  asset: MarketAsset | AlternativeAsset,
  days: number,
  seed: number
): number[] {
  const params: Record<string, { drift: number; vol: number; seedOffset: number }> = {
    sp500:        { drift: 0.0003, vol: 0.012, seedOffset: 100 },
    bitcoin:      { drift: 0.0005, vol: 0.035, seedOffset: 200 },
    gold:         { drift: 0.0001, vol: 0.008, seedOffset: 300 },
    treasuries:   { drift: 0.0001, vol: 0.004, seedOffset: 400 },
    realestate:   { drift: 0.0002, vol: 0.006, seedOffset: 500 },
    art:          { drift: 0.0002, vol: 0.010, seedOffset: 600 },
    wine:         { drift: 0.0001, vol: 0.007, seedOffset: 700 },
    vintage_cars: { drift: 0.0002, vol: 0.009, seedOffset: 800 },
    sneakers:     { drift: 0.0003, vol: 0.020, seedOffset: 900 },
  };
  const p = params[asset] || { drift: 0.0002, vol: 0.01, seedOffset: 999 };
  const returns: number[] = [];
  for (let i = 0; i < days; i++) {
    const noise = seededGaussian(seed + p.seedOffset, i * 3);
    returns.push(p.drift + p.vol * noise);
  }
  return returns;
}

function generatePortfolioReturns(cards: CardInventory[], days: number): number[] {
  const seed = portfolioSeed(cards);
  const totalValue = cards.reduce((s, c) => s + (c.currentValue || c.purchasePrice || 100), 0);
  const returns: number[] = [];

  for (let i = 0; i < days; i++) {
    let dayReturn = 0;
    for (let j = 0; j < cards.length; j++) {
      const cardVal = cards[j].currentValue || cards[j].purchasePrice || 100;
      const weight = cardVal / totalValue;
      const sportOffset = cards[j].sport === 'Baseball' ? 0 : cards[j].sport === 'Basketball' ? 1
        : cards[j].sport === 'Football' ? 2 : cards[j].sport === 'Hockey' ? 3 : 4;
      const noise = seededGaussian(seed + j * 7 + sportOffset * 13, i * 5);
      const cardReturn = 0.0002 + 0.015 * noise;
      dayReturn += weight * cardReturn;
    }
    returns.push(dayReturn);
  }
  return returns;
}

// ---- Public API ----

export function getAssetCorrelations(cards: CardInventory[]): AssetCorrelation[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  if (activeCards.length === 0) return getDefaultCorrelations();

  const seed = portfolioSeed(activeCards);
  const portfolioReturns365 = generatePortfolioReturns(activeCards, 365);
  const allAssets: (MarketAsset | AlternativeAsset)[] = [
    'sp500', 'bitcoin', 'gold', 'treasuries', 'realestate',
    'art', 'wine', 'vintage_cars', 'sneakers',
  ];

  return allAssets.map(asset => {
    const marketReturns365 = generateMarketReturns(asset, 365, seed);
    const corr30 = pearsonCorrelation(
      portfolioReturns365.slice(-30),
      marketReturns365.slice(-30)
    );
    const corr90 = pearsonCorrelation(
      portfolioReturns365.slice(-90),
      marketReturns365.slice(-90)
    );
    const corr365 = pearsonCorrelation(portfolioReturns365, marketReturns365);
    const beta = calculateBeta(
      portfolioReturns365.slice(-90),
      marketReturns365.slice(-90)
    );

    const label = MARKET_LABELS[asset as MarketAsset] || ALT_LABELS[asset as AlternativeAsset] || asset;
    return {
      asset,
      label,
      correlation30d: Math.round(corr30 * 100) / 100,
      correlation90d: Math.round(corr90 * 100) / 100,
      correlation365d: Math.round(corr365 * 100) / 100,
      beta: Math.round(beta * 100) / 100,
    };
  });
}

function getDefaultCorrelations(): AssetCorrelation[] {
  const defaults: [MarketAsset | AlternativeAsset, number, number, number, number][] = [
    ['sp500', 0.18, 0.22, 0.15, 0.30],
    ['bitcoin', 0.25, 0.30, 0.20, 0.45],
    ['gold', -0.05, -0.08, -0.03, -0.10],
    ['treasuries', -0.12, -0.10, -0.08, -0.15],
    ['realestate', 0.10, 0.12, 0.08, 0.18],
    ['art', 0.35, 0.40, 0.32, 0.55],
    ['wine', 0.15, 0.18, 0.12, 0.22],
    ['vintage_cars', 0.28, 0.32, 0.25, 0.42],
    ['sneakers', 0.42, 0.48, 0.38, 0.65],
  ];
  return defaults.map(([asset, c30, c90, c365, beta]) => ({
    asset,
    label: MARKET_LABELS[asset as MarketAsset] || ALT_LABELS[asset as AlternativeAsset] || asset,
    correlation30d: c30,
    correlation90d: c90,
    correlation365d: c365,
    beta,
  }));
}

export function getAssetTimeSeries(cards: CardInventory[], days: number = 90): AssetTimeSeries[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const seed = portfolioSeed(activeCards);
  const portfolioReturns = activeCards.length > 0
    ? generatePortfolioReturns(activeCards, days)
    : Array.from({ length: days }, (_, i) => 0.0002 + 0.01 * seededGaussian(42, i * 3));

  const allAssets: (MarketAsset | AlternativeAsset)[] = [
    'sp500', 'bitcoin', 'gold', 'treasuries', 'realestate',
    'art', 'wine', 'vintage_cars', 'sneakers',
  ];
  const assetReturns: Record<string, number[]> = {};
  for (const asset of allAssets) {
    assetReturns[asset] = generateMarketReturns(asset, days, seed);
  }

  const series: AssetTimeSeries[] = [];
  const baseValues: Record<string, number> = { portfolio: 100 };
  for (const a of allAssets) baseValues[a] = 100;

  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (days - i) * 86400000);
    baseValues.portfolio *= (1 + portfolioReturns[i]);
    for (const a of allAssets) {
      baseValues[a] *= (1 + assetReturns[a][i]);
    }
    series.push({
      date: date.toISOString().split('T')[0],
      portfolio: Math.round(baseValues.portfolio * 100) / 100,
      sp500: Math.round(baseValues.sp500 * 100) / 100,
      bitcoin: Math.round(baseValues.bitcoin * 100) / 100,
      gold: Math.round(baseValues.gold * 100) / 100,
      treasuries: Math.round(baseValues.treasuries * 100) / 100,
      realestate: Math.round(baseValues.realestate * 100) / 100,
      art: Math.round(baseValues.art * 100) / 100,
      wine: Math.round(baseValues.wine * 100) / 100,
      vintage_cars: Math.round(baseValues.vintage_cars * 100) / 100,
      sneakers: Math.round(baseValues.sneakers * 100) / 100,
    });
  }
  return series;
}

export function getSportMarketLinkages(cards: CardInventory[]): SportMarketLinkage[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const sports: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
  const seed = portfolioSeed(activeCards);

  return sports.map((sport, idx) => {
    const contractCorr = Math.round(seededRange(seed, idx * 10 + 1, 0.15, 0.65) * 100) / 100;
    const winPctCorr = Math.round(seededRange(seed, idx * 10 + 2, 0.05, 0.45) * 100) / 100;
    const fantasyCorr = Math.round(seededRange(seed, idx * 10 + 3, 0.20, 0.70) * 100) / 100;

    const sportCards = activeCards.filter(c => c.sport === sport);
    const hasSportCards = sportCards.length > 0;

    const summaries: Record<Sport, string> = {
      Baseball: hasSportCards
        ? `${sport} cards show ${contractCorr > 0.4 ? 'strong' : 'moderate'} linkage to contract values. Fantasy stats drive ${Math.round(fantasyCorr * 100)}% of short-term moves.`
        : `No ${sport} exposure. Historical contract correlation averages 0.42.`,
      Basketball: hasSportCards
        ? `NBA card values track player contracts at ${contractCorr.toFixed(2)}. Playoff performance amplifies by 2-3x.`
        : `No ${sport} exposure. NBA cards historically track contract extensions closely.`,
      Football: hasSportCards
        ? `NFL cards show ${winPctCorr > 0.3 ? 'significant' : 'weak'} team-win correlation (${winPctCorr.toFixed(2)}). Draft position dominates rookie cards.`
        : `No ${sport} exposure. NFL rookie cards are most sensitive to draft capital.`,
      Hockey: hasSportCards
        ? `Hockey cards have lower market depth. Contract correlation at ${contractCorr.toFixed(2)} with high playoff sensitivity.`
        : `No ${sport} exposure. Thin market creates opportunity and risk.`,
      Soccer: hasSportCards
        ? `Soccer card market is globally driven. Transfer window activity correlates at ${contractCorr.toFixed(2)}.`
        : `No ${sport} exposure. Emerging market with high growth potential.`,
    };

    return {
      sport,
      contractCorrelation: contractCorr,
      winPctCorrelation: winPctCorr,
      fantasyCorrelation: fantasyCorr,
      summary: summaries[sport],
    };
  });
}

export function getPortfolioBetas(cards: CardInventory[]): PortfolioBeta[] {
  const correlations = getAssetCorrelations(cards);
  const markets: MarketAsset[] = ['sp500', 'bitcoin', 'gold', 'treasuries', 'realestate'];

  return markets.map(market => {
    const corr = correlations.find(c => c.asset === market);
    const beta = corr?.beta || 0;
    const absBeta = Math.abs(beta);

    let interpretation: string;
    if (absBeta < 0.15) {
      interpretation = `Near-zero sensitivity to ${MARKET_LABELS[market]}. Your cards move independently.`;
    } else if (absBeta < 0.4) {
      interpretation = `Low sensitivity to ${MARKET_LABELS[market]}. Cards offer meaningful diversification.`;
    } else if (absBeta < 0.7) {
      interpretation = `Moderate sensitivity to ${MARKET_LABELS[market]}. Some correlated movement expected.`;
    } else {
      interpretation = `High sensitivity to ${MARKET_LABELS[market]}. Consider hedging this exposure.`;
    }

    if (beta < 0) {
      interpretation += ' Negative beta provides natural hedge.';
    }

    return {
      asset: market,
      label: MARKET_LABELS[market],
      beta: Math.round(beta * 100) / 100,
      interpretation,
    };
  });
}

export function getHedgeAllocations(cards: CardInventory[]): HedgeAllocation[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const seed = portfolioSeed(activeCards);
  const totalValue = activeCards.reduce((s, c) => s + (c.currentValue || c.purchasePrice || 100), 0);

  const currentCardWeight = 1.0;
  const optimalCardWeight = Math.round(seededRange(seed, 501, 0.25, 0.45) * 100) / 100;

  const assets: (MarketAsset | AlternativeAsset)[] = [
    'sp500', 'gold', 'treasuries', 'bitcoin', 'realestate',
  ];
  const allocations: HedgeAllocation[] = [
    {
      asset: 'cards' as any,
      label: 'Sports Cards',
      currentWeight: currentCardWeight,
      optimalWeight: optimalCardWeight,
      delta: Math.round((optimalCardWeight - currentCardWeight) * 100) / 100,
    },
  ];

  const remaining = 1 - optimalCardWeight;
  let weightSum = 0;
  assets.forEach((asset, idx) => {
    const isLast = idx === assets.length - 1;
    const optWeight = isLast
      ? Math.round((remaining - weightSum) * 100) / 100
      : Math.round(seededRange(seed, 510 + idx, 0.05, remaining / 2) * 100) / 100;
    weightSum += optWeight;

    allocations.push({
      asset,
      label: MARKET_LABELS[asset as MarketAsset] || ALT_LABELS[asset as AlternativeAsset],
      currentWeight: 0,
      optimalWeight: Math.max(0.02, optWeight),
      delta: Math.max(0.02, optWeight),
    });
  });

  return allocations;
}

export function getRegimeAnalysis(cards: CardInventory[]): RegimeAnalysis[] {
  const seed = dateSeed();
  const activeCards = cards.filter(c => c.status !== 'sold');
  const pSeed = portfolioSeed(activeCards);

  const regimes: MarketRegime[] = ['risk_on', 'risk_off', 'hobby_boom', 'hobby_bust'];
  const regimeProbs = [
    seededRange(seed, 601, 0.15, 0.40),
    seededRange(seed, 602, 0.10, 0.35),
    seededRange(seed, 603, 0.10, 0.30),
    0, // placeholder
  ];
  regimeProbs[3] = Math.max(0.05, 1 - regimeProbs[0] - regimeProbs[1] - regimeProbs[2]);
  const totalProb = regimeProbs.reduce((s, v) => s + v, 0);
  for (let i = 0; i < 4; i++) regimeProbs[i] = Math.round((regimeProbs[i] / totalProb) * 100) / 100;

  const activeIdx = regimeProbs.indexOf(Math.max(...regimeProbs));

  const descriptions: Record<MarketRegime, string> = {
    risk_on: 'Broad equity rally, crypto surging, alternative assets bid. Card market benefits from wealth effect and hobby spending.',
    risk_off: 'Flight to safety. Treasuries and gold outperform. Card liquidity declines but blue-chip vintage holds value.',
    hobby_boom: 'Card-specific momentum. New entrants, media coverage, and platform growth drive above-market returns.',
    hobby_bust: 'Hobby fatigue, seller flooding, declining retail interest. Only institutional-grade cards maintain floors.',
  };

  return regimes.map((regime, idx) => ({
    regime,
    label: REGIME_LABELS[regime],
    description: descriptions[regime],
    probability: regimeProbs[idx],
    cardReturn: Math.round(seededRange(pSeed, 610 + idx * 4, regime === 'hobby_boom' ? 8 : regime === 'hobby_bust' ? -15 : -5, regime === 'hobby_boom' ? 25 : regime === 'risk_on' ? 12 : 3) * 10) / 10,
    sp500Return: Math.round(seededRange(pSeed, 611 + idx * 4, regime === 'risk_on' ? 5 : regime === 'risk_off' ? -20 : -5, regime === 'risk_on' ? 20 : 5) * 10) / 10,
    goldReturn: Math.round(seededRange(pSeed, 612 + idx * 4, regime === 'risk_off' ? 3 : -8, regime === 'risk_off' ? 18 : 8) * 10) / 10,
    bitcoinReturn: Math.round(seededRange(pSeed, 613 + idx * 4, regime === 'risk_on' ? 10 : -30, regime === 'risk_on' ? 50 : 15) * 10) / 10,
    isActive: idx === activeIdx,
  }));
}

export function getMacroEvents(): MacroEvent[] {
  return [
    {
      id: 'macro-1',
      name: 'Fed Rate Hike Cycle',
      date: '2022-03',
      type: 'rate_hike',
      cardImpact: -8.5,
      sp500Impact: -19.4,
      goldImpact: -3.2,
      bitcoinImpact: -64.0,
      description: 'Aggressive tightening cycle crushed speculative assets. Card market declined modestly as hobby spending contracted.',
    },
    {
      id: 'macro-2',
      name: 'COVID Stimulus Wave',
      date: '2020-04',
      type: 'stimulus',
      cardImpact: 45.2,
      sp500Impact: 26.9,
      goldImpact: 25.1,
      bitcoinImpact: 305.0,
      description: 'Direct stimulus payments fueled card market boom. eBay card sales surged 142% as hobby spending exploded.',
    },
    {
      id: 'macro-3',
      name: 'Great Recession',
      date: '2008-09',
      type: 'recession',
      cardImpact: -22.0,
      sp500Impact: -38.5,
      goldImpact: 5.5,
      bitcoinImpact: 0,
      description: 'Severe recession crushed discretionary spending. High-end vintage cards held better than modern releases.',
    },
    {
      id: 'macro-4',
      name: 'Inflation Spike 2021',
      date: '2021-06',
      type: 'inflation',
      cardImpact: 32.0,
      sp500Impact: 28.7,
      goldImpact: -3.6,
      bitcoinImpact: 59.8,
      description: 'Real assets gained as inflation hedge narrative strengthened. Cards benefited as tangible collectible assets.',
    },
    {
      id: 'macro-5',
      name: 'Crypto Winter 2022',
      date: '2022-11',
      type: 'crash',
      cardImpact: -12.0,
      sp500Impact: -4.5,
      goldImpact: 1.8,
      bitcoinImpact: -65.0,
      description: 'FTX collapse and crypto crash. Mild spillover to cards as speculative capital exited alternative assets.',
    },
    {
      id: 'macro-6',
      name: 'Regional Bank Crisis',
      date: '2023-03',
      type: 'crash',
      cardImpact: -3.2,
      sp500Impact: -5.8,
      goldImpact: 8.2,
      bitcoinImpact: 42.0,
      description: 'SVB collapse triggered flight to safety. Card market resilient as non-correlated asset class.',
    },
    {
      id: 'macro-7',
      name: 'AI Bull Market',
      date: '2023-06',
      type: 'stimulus',
      cardImpact: 5.8,
      sp500Impact: 24.2,
      goldImpact: 13.1,
      bitcoinImpact: 156.0,
      description: 'Tech-driven rally lifted all boats. Card market saw modest gains from wealth effect spillover.',
    },
  ];
}

export function getAlternativeBenchmarks(cards: CardInventory[]): AlternativeBenchmark[] {
  const activeCards = cards.filter(c => c.status !== 'sold');
  const seed = portfolioSeed(activeCards);
  const correlations = getAssetCorrelations(cards);

  const alts: AlternativeAsset[] = ['art', 'wine', 'vintage_cars', 'sneakers'];
  return alts.map((asset, idx) => {
    const corr = correlations.find(c => c.asset === asset);
    return {
      asset,
      label: ALT_LABELS[asset],
      ytdReturn: Math.round(seededRange(seed, 700 + idx * 5, -5, 18) * 10) / 10,
      oneYearReturn: Math.round(seededRange(seed, 701 + idx * 5, -8, 22) * 10) / 10,
      threeYearReturn: Math.round(seededRange(seed, 702 + idx * 5, 5, 45) * 10) / 10,
      volatility: Math.round(seededRange(seed, 703 + idx * 5, 8, 28) * 10) / 10,
      sharpeRatio: Math.round(seededRange(seed, 704 + idx * 5, 0.2, 1.8) * 100) / 100,
      correlation: corr?.correlation90d || 0,
    };
  });
}

export function getDiversificationReport(cards: CardInventory[]): DiversificationReport {
  const correlations = getAssetCorrelations(cards);
  const betas = getPortfolioBetas(cards);
  const regimes = getRegimeAnalysis(cards);

  const sp500Beta = betas.find(b => b.asset === 'sp500')?.beta || 0;

  const sorted = [...correlations].sort((a, b) => Math.abs(b.correlation90d) - Math.abs(a.correlation90d));
  const topCorrelated = sorted[0];
  const leastCorrelated = [...correlations].sort((a, b) => Math.abs(a.correlation90d) - Math.abs(b.correlation90d))[0];

  const activeRegime = regimes.find(r => r.isActive) || regimes[0];

  // Diversification score: lower avg absolute correlation = higher score
  const avgAbsCorr = correlations.reduce((s, c) => s + Math.abs(c.correlation90d), 0) / correlations.length;
  const score = Math.round(Math.max(0, Math.min(100, (1 - avgAbsCorr) * 100)));

  const absBeta = Math.abs(sp500Beta);
  let hedgeRec: string;
  if (absBeta < 0.15) {
    hedgeRec = 'Portfolio is well-insulated from broad market moves. No hedging action needed.';
  } else if (absBeta < 0.4) {
    hedgeRec = `Mild market sensitivity (beta ${sp500Beta.toFixed(2)}). Consider 10-15% allocation to treasuries or gold for tail-risk protection.`;
  } else if (absBeta < 0.7) {
    hedgeRec = `Moderate market sensitivity (beta ${sp500Beta.toFixed(2)}). Recommend 20-30% allocation to uncorrelated assets like gold and treasuries.`;
  } else {
    hedgeRec = `High market sensitivity (beta ${sp500Beta.toFixed(2)}). Strongly recommend diversifying into gold, treasuries, and reducing speculative card positions.`;
  }

  return {
    score,
    portfolioBeta: sp500Beta,
    currentRegime: activeRegime.regime,
    regimeLabel: REGIME_LABELS[activeRegime.regime],
    topCorrelated,
    leastCorrelated,
    hedgeRecommendation: hedgeRec,
  };
}

export function getFullDashboard(cards: CardInventory[]): CorrelationDashboard {
  return {
    correlations: getAssetCorrelations(cards),
    timeSeries: getAssetTimeSeries(cards, 90),
    sportLinkages: getSportMarketLinkages(cards),
    betas: getPortfolioBetas(cards),
    hedgeAllocations: getHedgeAllocations(cards),
    regimes: getRegimeAnalysis(cards),
    macroEvents: getMacroEvents(),
    benchmarks: getAlternativeBenchmarks(cards),
    report: getDiversificationReport(cards),
  };
}

// ---- Persistence ----

export function saveCorrelationSettings(settings: { preferredWindow: TimeWindow; selectedAssets: string[] }): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* noop */ }
}

export function loadCorrelationSettings(): { preferredWindow: TimeWindow; selectedAssets: string[] } {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch { /* noop */ }
  return { preferredWindow: 90, selectedAssets: ['sp500', 'bitcoin', 'gold'] };
}

export function saveDashboardSnapshot(dashboard: CorrelationDashboard): void {
  try {
    const snapshots = loadDashboardSnapshots();
    snapshots.unshift({
      timestamp: new Date().toISOString(),
      score: dashboard.report.score,
      beta: dashboard.report.portfolioBeta,
      regime: dashboard.report.currentRegime,
    });
    // keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots.slice(0, 30)));
  } catch { /* noop */ }
}

export function loadDashboardSnapshots(): { timestamp: string; score: number; beta: number; regime: MarketRegime }[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* noop */ }
  return [];
}

// ========================================================================
// Phase 105: Cross-Asset Correlation & Macro Hedge Intelligence
// ========================================================================

// ---- Phase 105 Types ----

export type AssetClass =
  | 'sp500'
  | 'nasdaq'
  | 'bitcoin'
  | 'ethereum'
  | 'gold'
  | 'bonds_10y'
  | 'cpi_inflation'
  | 'reit_index';

export type CardSegment =
  | 'modern_basketball_rookies'
  | 'vintage_baseball'
  | 'modern_football'
  | 'pokemon_tcg'
  | 'soccer_international';

export interface CorrelationCell {
  segment: CardSegment;
  asset: AssetClass;
  coefficient30d: number;
  coefficient90d: number;
  coefficient365d: number;
}

export interface CorrelationMatrix {
  cells: CorrelationCell[];
  segments: CardSegment[];
  assets: AssetClass[];
  generatedAt: string;
}

export interface HedgeSignal {
  id: string;
  action: 'add' | 'reduce' | 'swap' | 'hold';
  segment: CardSegment;
  description: string;
  currentCorrelation: number;
  projectedCorrelation: number;
  confidence: number;
  impactSummary: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MacroAlert {
  id: string;
  title: string;
  eventType: 'fed_rate' | 'cpi_release' | 'market_crash' | 'earnings' | 'geopolitical';
  severity: 'critical' | 'warning' | 'info';
  date: string;
  description: string;
  historicalCardImpact: number;
  affectedSegments: CardSegment[];
  recommendation: string;
}

export interface PortfolioCorrelation {
  segment: CardSegment;
  segmentLabel: string;
  weight: number;
  correlations: Record<AssetClass, number>;
  avgCorrelation: number;
}

export interface DiversificationScore {
  overall: number;
  segmentScores: { segment: CardSegment; label: string; score: number; suggestion: string }[];
  concentrationRisk: number;
  macroExposure: number;
  improvementTips: string[];
}

export interface OptimalAllocation {
  segment: CardSegment;
  label: string;
  currentPct: number;
  optimalPct: number;
  delta: number;
  rationale: string;
}

export interface HistoricalMacroImpact {
  event: string;
  date: string;
  segmentImpacts: { segment: CardSegment; label: string; returnPct: number }[];
  assetImpacts: { asset: AssetClass; label: string; returnPct: number }[];
  narrative: string;
}

// ---- Phase 105 Constants ----

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ',
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  gold: 'Gold',
  bonds_10y: '10Y Treasury',
  cpi_inflation: 'CPI / Inflation',
  reit_index: 'REIT Index',
};

export const CARD_SEGMENT_LABELS: Record<CardSegment, string> = {
  modern_basketball_rookies: 'Modern Basketball Rookies',
  vintage_baseball: 'Vintage Baseball',
  modern_football: 'Modern Football',
  pokemon_tcg: 'Pokemon / TCG',
  soccer_international: 'Soccer / International',
};

const ALL_ASSETS: AssetClass[] = [
  'sp500', 'nasdaq', 'bitcoin', 'ethereum', 'gold', 'bonds_10y', 'cpi_inflation', 'reit_index',
];

const ALL_SEGMENTS: CardSegment[] = [
  'modern_basketball_rookies', 'vintage_baseball', 'modern_football', 'pokemon_tcg', 'soccer_international',
];

// Plausible base correlation coefficients (segment x asset)
// Rows: segments, Cols: sp500, nasdaq, bitcoin, ethereum, gold, bonds_10y, cpi_inflation, reit_index
const BASE_CORRELATIONS: Record<CardSegment, Record<AssetClass, number>> = {
  modern_basketball_rookies: {
    sp500: 0.62, nasdaq: 0.71, bitcoin: 0.55, ethereum: 0.58,
    gold: -0.12, bonds_10y: -0.28, cpi_inflation: 0.15, reit_index: 0.22,
  },
  vintage_baseball: {
    sp500: 0.08, nasdaq: 0.05, bitcoin: -0.03, ethereum: -0.05,
    gold: 0.35, bonds_10y: 0.18, cpi_inflation: 0.42, reit_index: 0.12,
  },
  modern_football: {
    sp500: 0.52, nasdaq: 0.58, bitcoin: 0.42, ethereum: 0.45,
    gold: -0.08, bonds_10y: -0.22, cpi_inflation: 0.10, reit_index: 0.18,
  },
  pokemon_tcg: {
    sp500: 0.38, nasdaq: 0.55, bitcoin: 0.68, ethereum: 0.72,
    gold: -0.18, bonds_10y: -0.35, cpi_inflation: 0.05, reit_index: 0.08,
  },
  soccer_international: {
    sp500: 0.22, nasdaq: 0.18, bitcoin: 0.15, ethereum: 0.12,
    gold: 0.10, bonds_10y: 0.05, cpi_inflation: 0.08, reit_index: 0.28,
  },
};

// ---- Phase 105 Helpers ----

function correlationJitter(base: number, seed: number, offset: number, amplitude: number = 0.08): number {
  const jitter = (seededRandom(seed, offset) - 0.5) * amplitude * 2;
  return Math.max(-1, Math.min(1, Math.round((base + jitter) * 100) / 100));
}

function segmentFromCard(card: CardInventory): CardSegment {
  if (card.sport === 'Basketball' && card.year >= 2015) return 'modern_basketball_rookies';
  if (card.sport === 'Baseball' && card.year < 1990) return 'vintage_baseball';
  if (card.sport === 'Football' && card.year >= 2010) return 'modern_football';
  if (card.sport === 'Soccer') return 'soccer_international';
  // Fallback heuristic: check set name for TCG-like keywords
  const setLower = (card.set || '').toLowerCase();
  if (setLower.includes('pokemon') || setLower.includes('tcg') || setLower.includes('magic')) {
    return 'pokemon_tcg';
  }
  // Default by sport
  if (card.sport === 'Baseball') return 'vintage_baseball';
  if (card.sport === 'Basketball') return 'modern_basketball_rookies';
  if (card.sport === 'Football') return 'modern_football';
  return 'modern_football';
}

// ---- Phase 105 Public API ----

export function getCorrelationMatrix(window: TimeWindow = 90): CorrelationMatrix {
  const seed = dateSeed();
  const cells: CorrelationCell[] = [];

  for (const segment of ALL_SEGMENTS) {
    for (const asset of ALL_ASSETS) {
      const base = BASE_CORRELATIONS[segment][asset];
      cells.push({
        segment,
        asset,
        coefficient30d: correlationJitter(base, seed, hashPair(segment, asset) + 30, 0.12),
        coefficient90d: correlationJitter(base, seed, hashPair(segment, asset) + 90, 0.08),
        coefficient365d: correlationJitter(base, seed, hashPair(segment, asset) + 365, 0.04),
      });
    }
  }

  return {
    cells,
    segments: ALL_SEGMENTS,
    assets: ALL_ASSETS,
    generatedAt: new Date().toISOString(),
  };
}

function hashPair(a: string, b: string): number {
  let h = 0;
  const s = a + b;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 10000;
}

export function getPortfolioCorrelationAnalysis(inventory: CardInventory[]): PortfolioCorrelation[] {
  const activeCards = inventory.filter(c => c.status !== 'sold');
  if (activeCards.length === 0) return [];

  const totalValue = activeCards.reduce((s, c) => s + (c.currentValue || c.purchasePrice || 100), 0);

  // Group cards by segment
  const segmentValues: Record<CardSegment, number> = {
    modern_basketball_rookies: 0,
    vintage_baseball: 0,
    modern_football: 0,
    pokemon_tcg: 0,
    soccer_international: 0,
  };

  for (const card of activeCards) {
    const seg = segmentFromCard(card);
    segmentValues[seg] += card.currentValue || card.purchasePrice || 100;
  }

  const matrix = getCorrelationMatrix(90);
  const results: PortfolioCorrelation[] = [];

  for (const segment of ALL_SEGMENTS) {
    const weight = totalValue > 0 ? segmentValues[segment] / totalValue : 0;
    if (weight === 0) continue;

    const correlations: Record<AssetClass, number> = {} as Record<AssetClass, number>;
    let sum = 0;
    for (const asset of ALL_ASSETS) {
      const cell = matrix.cells.find(c => c.segment === segment && c.asset === asset);
      const coeff = cell?.coefficient90d ?? 0;
      correlations[asset] = coeff;
      sum += Math.abs(coeff);
    }

    results.push({
      segment,
      segmentLabel: CARD_SEGMENT_LABELS[segment],
      weight: Math.round(weight * 1000) / 1000,
      correlations,
      avgCorrelation: Math.round((sum / ALL_ASSETS.length) * 100) / 100,
    });
  }

  return results.sort((a, b) => b.weight - a.weight);
}

export function getHedgeSignals(inventory: CardInventory[]): HedgeSignal[] {
  const activeCards = inventory.filter(c => c.status !== 'sold');
  const seed = portfolioSeed(activeCards);
  const portfolio = getPortfolioCorrelationAnalysis(inventory);
  const signals: HedgeSignal[] = [];

  // Find dominant tech correlation
  const techHeavy = portfolio.find(
    p => (p.correlations.nasdaq > 0.5 || p.correlations.sp500 > 0.5) && p.weight > 0.3
  );

  if (techHeavy) {
    signals.push({
      id: 'hedge-1',
      action: 'add',
      segment: 'vintage_baseball',
      description: `Add 3 vintage baseball cards to reduce tech stock correlation from ${techHeavy.correlations.nasdaq.toFixed(2)} to ~0.40`,
      currentCorrelation: techHeavy.correlations.nasdaq,
      projectedCorrelation: 0.40,
      confidence: 82,
      impactSummary: 'Vintage baseball has near-zero NASDAQ correlation (0.05), diluting overall tech exposure significantly.',
      priority: 'high',
    });
  }

  // Crypto exposure check
  const cryptoHeavy = portfolio.find(
    p => (p.correlations.bitcoin > 0.5 || p.correlations.ethereum > 0.5) && p.weight > 0.2
  );

  if (cryptoHeavy) {
    signals.push({
      id: 'hedge-2',
      action: 'add',
      segment: 'soccer_international',
      description: `Add soccer/international cards to reduce crypto correlation from ${cryptoHeavy.correlations.bitcoin.toFixed(2)} to ~0.25`,
      currentCorrelation: cryptoHeavy.correlations.bitcoin,
      projectedCorrelation: 0.25,
      confidence: 75,
      impactSummary: 'Soccer cards have low crypto beta (0.15) and provide geographic diversification.',
      priority: 'medium',
    });
  }

  // Concentration risk
  const concentrated = portfolio.filter(p => p.weight > 0.6);
  if (concentrated.length > 0) {
    const seg = concentrated[0];
    const targetSeg = seg.segment === 'modern_basketball_rookies' ? 'vintage_baseball' : 'modern_basketball_rookies';
    signals.push({
      id: 'hedge-3',
      action: 'swap',
      segment: targetSeg,
      description: `Reduce ${CARD_SEGMENT_LABELS[seg.segment]} concentration (${(seg.weight * 100).toFixed(0)}%) by swapping 20% into ${CARD_SEGMENT_LABELS[targetSeg]}`,
      currentCorrelation: seg.avgCorrelation,
      projectedCorrelation: Math.round((seg.avgCorrelation * 0.65) * 100) / 100,
      confidence: 78,
      impactSummary: 'Segment concentration above 60% creates outsized exposure to single-market risks.',
      priority: 'high',
    });
  }

  // Inflation hedge signal
  const inflationExposed = portfolio.find(
    p => p.correlations.cpi_inflation < 0.1 && p.weight > 0.25
  );

  if (inflationExposed) {
    signals.push({
      id: 'hedge-4',
      action: 'add',
      segment: 'vintage_baseball',
      description: 'Add vintage cards for inflation protection — vintage correlates 0.42 with CPI vs. your current 0.05',
      currentCorrelation: inflationExposed.correlations.cpi_inflation,
      projectedCorrelation: 0.28,
      confidence: 70,
      impactSummary: 'Vintage cards historically act as real assets with meaningful inflation hedging properties.',
      priority: 'medium',
    });
  }

  // Default signals if portfolio empty or no issues
  if (signals.length === 0) {
    signals.push({
      id: 'hedge-default-1',
      action: 'hold',
      segment: 'vintage_baseball',
      description: 'Portfolio is well diversified across card segments. No immediate hedging action needed.',
      currentCorrelation: 0.25,
      projectedCorrelation: 0.25,
      confidence: 85,
      impactSummary: 'Continue monitoring macro conditions for changes in cross-asset correlations.',
      priority: 'low',
    });
    signals.push({
      id: 'hedge-default-2',
      action: 'add',
      segment: 'soccer_international',
      description: 'Consider adding soccer/international exposure for geographic diversification.',
      currentCorrelation: 0.18,
      projectedCorrelation: 0.15,
      confidence: 65,
      impactSummary: 'International cards provide exposure to global sports markets uncorrelated with US equities.',
      priority: 'low',
    });
  }

  return signals;
}

export function getMacroAlerts(): MacroAlert[] {
  const seed = dateSeed();

  const alerts: MacroAlert[] = [
    {
      id: 'macro-alert-1',
      title: 'FOMC Rate Decision — Hold Expected',
      eventType: 'fed_rate',
      severity: 'warning',
      date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      description: 'Federal Reserve expected to hold rates steady. Markets pricing in 78% probability of no change. Previous holds have been neutral-to-positive for card markets.',
      historicalCardImpact: 1.2,
      affectedSegments: ['modern_basketball_rookies', 'modern_football', 'pokemon_tcg'],
      recommendation: 'No action needed. Hold steady; rate pauses historically support speculative card segments.',
    },
    {
      id: 'macro-alert-2',
      title: 'CPI Report — Inflation Above Expectations',
      eventType: 'cpi_release',
      severity: 'critical',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      description: 'Consensus expects CPI at 3.2% YoY, but recent data suggests upside risk. Higher inflation benefits vintage tangible assets but pressures modern speculative segments.',
      historicalCardImpact: -4.5,
      affectedSegments: ['modern_basketball_rookies', 'pokemon_tcg'],
      recommendation: 'Rotate 10-15% from modern rookies into vintage baseball as inflation hedge.',
    },
    {
      id: 'macro-alert-3',
      title: 'Tech Earnings Season',
      eventType: 'earnings',
      severity: 'info',
      date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
      description: 'Major tech earnings approaching. FAANG results historically correlate with modern card segment momentum through wealth effect channels.',
      historicalCardImpact: 3.8,
      affectedSegments: ['modern_basketball_rookies', 'modern_football'],
      recommendation: 'Position for volatility. Strong earnings could lift modern segments 3-5%.',
    },
    {
      id: 'macro-alert-4',
      title: 'Geopolitical Tension Escalation',
      eventType: 'geopolitical',
      severity: 'warning',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      description: 'Rising geopolitical tensions driving flight-to-safety flows. Gold up 2.3%. Historical pattern: vintage cards benefit, modern segments see temporary dips.',
      historicalCardImpact: -2.1,
      affectedSegments: ['modern_basketball_rookies', 'modern_football', 'pokemon_tcg'],
      recommendation: 'Consider adding gold-correlated vintage baseball exposure. Avoid panic selling modern cards.',
    },
  ];

  // Adjust severity based on seed for variety
  if (seededRandom(seed, 999) > 0.7) {
    alerts[0].severity = 'critical';
    alerts[0].title = 'FOMC Rate Decision — Surprise Cut Possible';
    alerts[0].historicalCardImpact = 8.5;
  }

  return alerts;
}

export function getDiversificationScoreAnalysis(inventory: CardInventory[]): DiversificationScore {
  const activeCards = inventory.filter(c => c.status !== 'sold');
  const portfolio = getPortfolioCorrelationAnalysis(inventory);

  if (activeCards.length === 0) {
    return {
      overall: 0,
      segmentScores: [],
      concentrationRisk: 100,
      macroExposure: 0,
      improvementTips: ['Add cards to begin tracking diversification.'],
    };
  }

  const totalValue = activeCards.reduce((s, c) => s + (c.currentValue || c.purchasePrice || 100), 0);

  // Concentration risk: Herfindahl index (sum of squared weights)
  const segmentWeights = portfolio.map(p => p.weight);
  const hhi = segmentWeights.reduce((s, w) => s + w * w, 0);
  const concentrationRisk = Math.round(Math.min(100, hhi * 100));

  // Macro exposure: average absolute correlation with macro-sensitive assets (sp500, bonds, cpi)
  let macroSum = 0;
  let macroCount = 0;
  for (const p of portfolio) {
    macroSum += Math.abs(p.correlations.sp500 || 0);
    macroSum += Math.abs(p.correlations.bonds_10y || 0);
    macroSum += Math.abs(p.correlations.cpi_inflation || 0);
    macroCount += 3;
  }
  const macroExposure = macroCount > 0 ? Math.round((macroSum / macroCount) * 100) : 0;

  // Per-segment scores
  const segmentScores = portfolio.map(p => {
    const avgAbsCorr = p.avgCorrelation;
    const segScore = Math.round(Math.max(0, Math.min(100, (1 - avgAbsCorr) * 80 + (p.weight < 0.5 ? 20 : 0))));

    let suggestion: string;
    if (segScore >= 75) {
      suggestion = 'Well positioned — low cross-asset correlation provides genuine diversification.';
    } else if (segScore >= 50) {
      suggestion = 'Moderate diversification. Consider reducing if over-allocated.';
    } else {
      suggestion = 'High market correlation — acts more like equities than an alternative. Consider rebalancing.';
    }

    return {
      segment: p.segment,
      label: p.segmentLabel,
      score: segScore,
      suggestion,
    };
  });

  // Overall score: blend of segment diversity, concentration, and macro insulation
  const avgSegScore = segmentScores.length > 0
    ? segmentScores.reduce((s, ss) => s + ss.score, 0) / segmentScores.length
    : 50;
  const diversityBonus = Math.min(20, portfolio.length * 5);
  const concentrationPenalty = concentrationRisk > 50 ? (concentrationRisk - 50) * 0.4 : 0;
  const overall = Math.round(Math.max(0, Math.min(100, avgSegScore + diversityBonus - concentrationPenalty)));

  // Tips
  const tips: string[] = [];
  if (portfolio.length < 3) tips.push('Add cards from more segments to improve diversification.');
  if (concentrationRisk > 60) tips.push('Reduce concentration — over 60% in a single segment increases risk.');
  if (macroExposure > 40) tips.push('High macro exposure. Add vintage or international cards to reduce market sensitivity.');
  const hasVintage = portfolio.some(p => p.segment === 'vintage_baseball' && p.weight > 0.05);
  if (!hasVintage) tips.push('Vintage baseball cards offer strong inflation hedging. Consider adding exposure.');
  if (tips.length === 0) tips.push('Portfolio is well diversified. Continue monitoring correlations for regime changes.');

  return {
    overall,
    segmentScores,
    concentrationRisk,
    macroExposure,
    improvementTips: tips,
  };
}

export function getHistoricalMacroImpact(eventName: string): HistoricalMacroImpact {
  const events: Record<string, HistoricalMacroImpact> = {
    'fed_rate_2022': {
      event: 'Fed Rate Hike Cycle 2022',
      date: '2022-03',
      segmentImpacts: [
        { segment: 'modern_basketball_rookies', label: 'Modern Basketball Rookies', returnPct: -18.2 },
        { segment: 'vintage_baseball', label: 'Vintage Baseball', returnPct: -2.1 },
        { segment: 'modern_football', label: 'Modern Football', returnPct: -15.8 },
        { segment: 'pokemon_tcg', label: 'Pokemon / TCG', returnPct: -25.3 },
        { segment: 'soccer_international', label: 'Soccer / International', returnPct: -8.4 },
      ],
      assetImpacts: [
        { asset: 'sp500', label: 'S&P 500', returnPct: -19.4 },
        { asset: 'nasdaq', label: 'NASDAQ', returnPct: -33.1 },
        { asset: 'bitcoin', label: 'Bitcoin', returnPct: -64.0 },
        { asset: 'ethereum', label: 'Ethereum', returnPct: -67.5 },
        { asset: 'gold', label: 'Gold', returnPct: -3.2 },
        { asset: 'bonds_10y', label: '10Y Treasury', returnPct: -16.8 },
        { asset: 'cpi_inflation', label: 'CPI / Inflation', returnPct: 8.0 },
        { asset: 'reit_index', label: 'REIT Index', returnPct: -26.2 },
      ],
      narrative: 'When the Fed raised rates aggressively in 2022, modern rookies dropped 18% while vintage baseball held steady at -2%. Pokemon/TCG was hit hardest (-25%) due to speculative overlap with crypto. Vintage cards acted as a safe haven within the card market.',
    },
    'covid_stimulus_2020': {
      event: 'COVID Stimulus Wave 2020',
      date: '2020-04',
      segmentImpacts: [
        { segment: 'modern_basketball_rookies', label: 'Modern Basketball Rookies', returnPct: 62.5 },
        { segment: 'vintage_baseball', label: 'Vintage Baseball', returnPct: 28.3 },
        { segment: 'modern_football', label: 'Modern Football', returnPct: 55.1 },
        { segment: 'pokemon_tcg', label: 'Pokemon / TCG', returnPct: 85.2 },
        { segment: 'soccer_international', label: 'Soccer / International', returnPct: 18.7 },
      ],
      assetImpacts: [
        { asset: 'sp500', label: 'S&P 500', returnPct: 26.9 },
        { asset: 'nasdaq', label: 'NASDAQ', returnPct: 43.6 },
        { asset: 'bitcoin', label: 'Bitcoin', returnPct: 305.0 },
        { asset: 'ethereum', label: 'Ethereum', returnPct: 470.0 },
        { asset: 'gold', label: 'Gold', returnPct: 25.1 },
        { asset: 'bonds_10y', label: '10Y Treasury', returnPct: 7.8 },
        { asset: 'cpi_inflation', label: 'CPI / Inflation', returnPct: 1.4 },
        { asset: 'reit_index', label: 'REIT Index', returnPct: -5.2 },
      ],
      narrative: 'COVID stimulus created an unprecedented hobby boom. Pokemon/TCG led at +85% as lockdown-driven demand met limited supply. Modern basketball rookies surged 62% on retail FOMO. Vintage baseball was more muted at +28% but provided stability.',
    },
    'great_recession_2008': {
      event: 'Great Recession 2008',
      date: '2008-09',
      segmentImpacts: [
        { segment: 'modern_basketball_rookies', label: 'Modern Basketball Rookies', returnPct: -32.0 },
        { segment: 'vintage_baseball', label: 'Vintage Baseball', returnPct: -8.5 },
        { segment: 'modern_football', label: 'Modern Football', returnPct: -28.0 },
        { segment: 'pokemon_tcg', label: 'Pokemon / TCG', returnPct: -35.0 },
        { segment: 'soccer_international', label: 'Soccer / International', returnPct: -12.0 },
      ],
      assetImpacts: [
        { asset: 'sp500', label: 'S&P 500', returnPct: -38.5 },
        { asset: 'nasdaq', label: 'NASDAQ', returnPct: -40.5 },
        { asset: 'bitcoin', label: 'Bitcoin', returnPct: 0 },
        { asset: 'ethereum', label: 'Ethereum', returnPct: 0 },
        { asset: 'gold', label: 'Gold', returnPct: 5.5 },
        { asset: 'bonds_10y', label: '10Y Treasury', returnPct: 20.1 },
        { asset: 'cpi_inflation', label: 'CPI / Inflation', returnPct: -0.4 },
        { asset: 'reit_index', label: 'REIT Index', returnPct: -37.7 },
      ],
      narrative: 'The Great Recession devastated discretionary spending. Modern cards lost 28-35% as hobby budgets evaporated. Vintage baseball proved resilient at just -8.5%, with trophy cards actually appreciating. Gold and treasuries provided genuine safe-haven returns.',
    },
  };

  return events[eventName] || events['fed_rate_2022'];
}

export function getOptimalAllocation(
  budget: number,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): OptimalAllocation[] {
  const profiles: Record<string, Record<CardSegment, number>> = {
    conservative: {
      modern_basketball_rookies: 15,
      vintage_baseball: 40,
      modern_football: 10,
      pokemon_tcg: 5,
      soccer_international: 30,
    },
    moderate: {
      modern_basketball_rookies: 25,
      vintage_baseball: 25,
      modern_football: 20,
      pokemon_tcg: 15,
      soccer_international: 15,
    },
    aggressive: {
      modern_basketball_rookies: 35,
      vintage_baseball: 10,
      modern_football: 25,
      pokemon_tcg: 25,
      soccer_international: 5,
    },
  };

  const rationales: Record<CardSegment, Record<string, string>> = {
    modern_basketball_rookies: {
      conservative: 'Limited exposure — high equity correlation makes this risky in downturns.',
      moderate: 'Balanced allocation — captures upside while managing equity correlation.',
      aggressive: 'Core holding — max growth potential with accepted market sensitivity.',
    },
    vintage_baseball: {
      conservative: 'Anchor position — lowest market correlation, strong inflation hedge.',
      moderate: 'Stability core — provides portfolio ballast during market stress.',
      aggressive: 'Minimal allocation — lower growth ceiling but maintained for diversification.',
    },
    modern_football: {
      conservative: 'Small position — moderate equity correlation warrants caution.',
      moderate: 'Balanced exposure — NFL popularity provides demand floor.',
      aggressive: 'Growth allocation — seasonal NFL cycle creates trading opportunities.',
    },
    pokemon_tcg: {
      conservative: 'Minimal — highest crypto correlation creates volatility risk.',
      moderate: 'Tactical position — high return potential justifies moderate allocation.',
      aggressive: 'High conviction — crypto-correlated upside with generational demand drivers.',
    },
    soccer_international: {
      conservative: 'Strong allocation — geographic diversification reduces US market dependency.',
      moderate: 'Geographic hedge — uncorrelated with US equities and growing global market.',
      aggressive: 'Small position — lower near-term returns but emerging market optionality.',
    },
  };

  const target = profiles[riskTolerance];

  return ALL_SEGMENTS.map(segment => ({
    segment,
    label: CARD_SEGMENT_LABELS[segment],
    currentPct: 0, // caller can fill in from portfolio
    optimalPct: target[segment],
    delta: target[segment],
    rationale: rationales[segment][riskTolerance],
  }));
}
