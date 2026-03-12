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
