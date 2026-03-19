// Phase 238 — Sentiment Half-Life Tracker Service

export interface SentimentEvent {
  id: string;
  player: string;
  card: string;
  eventType: 'injury' | 'trade' | 'award' | 'scandal' | 'breakout';
  sentimentImpact: number;
  halfLifeDays: number;
  currentDecay: number;
  eventDate: string;
}

export interface HalfLifeModel {
  player: string;
  avgPositiveHalfLife: number;
  avgNegativeHalfLife: number;
  volatility: number;
}

const sentimentEvents: SentimentEvent[] = [
  {
    id: 'se-001',
    player: 'Victor Wembanyama',
    card: '2023 Prizm Silver #181',
    eventType: 'award',
    sentimentImpact: 85,
    halfLifeDays: 42,
    currentDecay: 0.23,
    eventDate: '2025-06-15',
  },
  {
    id: 'se-002',
    player: 'Ja Morant',
    card: '2019 Prizm Base #249',
    eventType: 'scandal',
    sentimentImpact: -72,
    halfLifeDays: 90,
    currentDecay: 0.61,
    eventDate: '2024-05-20',
  },
  {
    id: 'se-003',
    player: 'Luka Dončić',
    card: '2018 Prizm Silver #280',
    eventType: 'trade',
    sentimentImpact: -45,
    halfLifeDays: 21,
    currentDecay: 0.12,
    eventDate: '2025-02-06',
  },
  {
    id: 'se-004',
    player: 'Paul Skenes',
    card: '2024 Topps Chrome #200',
    eventType: 'breakout',
    sentimentImpact: 92,
    halfLifeDays: 35,
    currentDecay: 0.44,
    eventDate: '2025-07-01',
  },
  {
    id: 'se-005',
    player: 'Anthony Edwards',
    card: '2020 Prizm Base #258',
    eventType: 'award',
    sentimentImpact: 78,
    halfLifeDays: 38,
    currentDecay: 0.31,
    eventDate: '2025-05-10',
  },
  {
    id: 'se-006',
    player: 'Chet Holmgren',
    card: '2022 Prizm Rookie #249',
    eventType: 'injury',
    sentimentImpact: -65,
    halfLifeDays: 60,
    currentDecay: 0.55,
    eventDate: '2025-01-18',
  },
];

const halfLifeModels: HalfLifeModel[] = [
  {
    player: 'Victor Wembanyama',
    avgPositiveHalfLife: 42,
    avgNegativeHalfLife: 14,
    volatility: 0.32,
  },
  {
    player: 'Ja Morant',
    avgPositiveHalfLife: 28,
    avgNegativeHalfLife: 90,
    volatility: 0.87,
  },
  {
    player: 'Luka Dončić',
    avgPositiveHalfLife: 35,
    avgNegativeHalfLife: 21,
    volatility: 0.45,
  },
  {
    player: 'Paul Skenes',
    avgPositiveHalfLife: 35,
    avgNegativeHalfLife: 18,
    volatility: 0.58,
  },
  {
    player: 'Anthony Edwards',
    avgPositiveHalfLife: 38,
    avgNegativeHalfLife: 25,
    volatility: 0.41,
  },
];

export function getSentimentEvents(): SentimentEvent[] {
  return sentimentEvents;
}

export function getHalfLifeModels(): HalfLifeModel[] {
  return halfLifeModels;
}

export function getSentimentStats() {
  const totalEvents = sentimentEvents.length;
  const positiveEvents = sentimentEvents.filter((e) => e.sentimentImpact > 0).length;
  const negativeEvents = sentimentEvents.filter((e) => e.sentimentImpact < 0).length;
  const avgHalfLife =
    sentimentEvents.reduce((sum, e) => sum + e.halfLifeDays, 0) / totalEvents;
  const avgVolatility =
    halfLifeModels.reduce((sum, m) => sum + m.volatility, 0) / halfLifeModels.length;

  return {
    totalEvents,
    positiveEvents,
    negativeEvents,
    avgHalfLife: Math.round(avgHalfLife),
    avgVolatility: Math.round(avgVolatility * 100) / 100,
    mostVolatilePlayer: halfLifeModels.reduce((max, m) =>
      m.volatility > max.volatility ? m : max
    ).player,
  };
}

const sentimentHalfLifeService = {
  getSentimentEvents,
  getHalfLifeModels,
  getSentimentStats,
};

export default sentimentHalfLifeService;
