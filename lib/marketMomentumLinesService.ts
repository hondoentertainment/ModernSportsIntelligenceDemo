// Phase 242 — Market Momentum Lines Service

export interface MomentumLine {
  id: string;
  player: string;
  card: string;
  lineType: 'support' | 'resistance' | 'trend';
  price: number;
  strength: number;
  touches: number;
  lastTested: string;
}

export interface MarketMomentum {
  player: string;
  bullish: number;
  bearish: number;
  neutral: number;
  overallBias: 'bullish' | 'bearish' | 'neutral';
}

const momentumLines: MomentumLine[] = [
  {
    id: 'ml-001',
    player: 'Victor Wembanyama',
    card: '2023 Prizm Silver #181',
    lineType: 'support',
    price: 420,
    strength: 87,
    touches: 5,
    lastTested: '2025-05-10',
  },
  {
    id: 'ml-002',
    player: 'Victor Wembanyama',
    card: '2023 Prizm Silver #181',
    lineType: 'resistance',
    price: 680,
    strength: 72,
    touches: 3,
    lastTested: '2025-04-28',
  },
  {
    id: 'ml-003',
    player: 'Luka Dončić',
    card: '2018 Prizm Silver #280',
    lineType: 'support',
    price: 850,
    strength: 65,
    touches: 4,
    lastTested: '2025-05-05',
  },
  {
    id: 'ml-004',
    player: 'Luka Dončić',
    card: '2018 Prizm Silver #280',
    lineType: 'trend',
    price: 950,
    strength: 58,
    touches: 6,
    lastTested: '2025-05-12',
  },
  {
    id: 'ml-005',
    player: 'Jayson Tatum',
    card: '2017 Prizm Base #16',
    lineType: 'resistance',
    price: 340,
    strength: 91,
    touches: 7,
    lastTested: '2025-05-08',
  },
  {
    id: 'ml-006',
    player: 'Anthony Edwards',
    card: '2020 Prizm Base #258',
    lineType: 'support',
    price: 210,
    strength: 78,
    touches: 4,
    lastTested: '2025-04-30',
  },
  {
    id: 'ml-007',
    player: 'Anthony Edwards',
    card: '2020 Prizm Base #258',
    lineType: 'resistance',
    price: 365,
    strength: 69,
    touches: 2,
    lastTested: '2025-05-14',
  },
  {
    id: 'ml-008',
    player: 'Shohei Ohtani',
    card: '2018 Topps Chrome #150',
    lineType: 'trend',
    price: 520,
    strength: 83,
    touches: 8,
    lastTested: '2025-05-11',
  },
];

const marketMomentums: MarketMomentum[] = [
  {
    player: 'Victor Wembanyama',
    bullish: 68,
    bearish: 18,
    neutral: 14,
    overallBias: 'bullish',
  },
  {
    player: 'Luka Dončić',
    bullish: 25,
    bearish: 52,
    neutral: 23,
    overallBias: 'bearish',
  },
  {
    player: 'Jayson Tatum',
    bullish: 35,
    bearish: 30,
    neutral: 35,
    overallBias: 'neutral',
  },
  {
    player: 'Anthony Edwards',
    bullish: 61,
    bearish: 22,
    neutral: 17,
    overallBias: 'bullish',
  },
];

export function getMomentumLines(): MomentumLine[] {
  return momentumLines;
}

export function getMarketMomentums(): MarketMomentum[] {
  return marketMomentums;
}

export function getMomentumStats() {
  const totalLines = momentumLines.length;
  const supportLines = momentumLines.filter((l) => l.lineType === 'support').length;
  const resistanceLines = momentumLines.filter((l) => l.lineType === 'resistance').length;
  const trendLines = momentumLines.filter((l) => l.lineType === 'trend').length;
  const avgStrength =
    Math.round(
      (momentumLines.reduce((sum, l) => sum + l.strength, 0) / totalLines) * 10
    ) / 10;
  const bullishPlayers = marketMomentums.filter((m) => m.overallBias === 'bullish').length;

  return {
    totalLines,
    supportLines,
    resistanceLines,
    trendLines,
    avgStrength,
    bullishPlayers,
    bearishPlayers: marketMomentums.filter((m) => m.overallBias === 'bearish').length,
    neutralPlayers: marketMomentums.filter((m) => m.overallBias === 'neutral').length,
  };
}

const marketMomentumLinesService = {
  getMomentumLines,
  getMarketMomentums,
  getMomentumStats,
};

export default marketMomentumLinesService;
