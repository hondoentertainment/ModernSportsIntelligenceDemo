// ── Interfaces ──────────────────────────────────────────────────────────────────

export type TrendDirection = 'rising' | 'falling' | 'stable';
export type SentimentLevel = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
export type AlertSeverity = 'high' | 'medium' | 'low';

export interface SourceSentiment {
  score: number;       // -100 to 100
  volume: number;      // number of mentions
  trend: TrendDirection;
}

export interface SentimentData {
  playerId: string;
  player: string;
  sport: string;
  overallSentiment: number;  // -100 to 100
  volume: number;
  trendDirection: TrendDirection;
  priceCorrelation: number;  // -1 to 1
  currentPrice: number;
  priceChange24h: number;
  sources: {
    twitter: SourceSentiment;
    reddit: SourceSentiment;
    forums: SourceSentiment;
  };
  keywords: string[];
  sentimentLevel: SentimentLevel;
}

export interface SentimentAlert {
  id: string;
  playerId: string;
  player: string;
  source: 'twitter' | 'reddit' | 'forums' | 'multi';
  message: string;
  sentiment: number;
  severity: AlertSeverity;
  timestamp: string;
}

export interface SentimentTimelinePoint {
  date: string;
  sentiment: number;
  volume: number;
  price: number;
}

export interface MarketSentimentOverview {
  overall: number;
  bullish: number;
  bearish: number;
  neutral: number;
  totalVolume: number;
  topKeywords: { keyword: string; count: number; sentiment: number }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getSentimentLevel(score: number): SentimentLevel {
  if (score >= 60) return 'very_positive';
  if (score >= 20) return 'positive';
  if (score >= -20) return 'neutral';
  if (score >= -60) return 'negative';
  return 'very_negative';
}

// ── Mock Data ───────────────────────────────────────────────────────────────────

const PLAYER_SENTIMENTS: SentimentData[] = [
  {
    playerId: 'luka-doncic',
    player: 'Luka Doncic',
    sport: 'NBA',
    overallSentiment: 72,
    volume: 14820,
    trendDirection: 'rising',
    priceCorrelation: 0.85,
    currentPrice: 3450,
    priceChange24h: 8.2,
    sources: {
      twitter: { score: 78, volume: 8200, trend: 'rising' },
      reddit: { score: 65, volume: 4100, trend: 'rising' },
      forums: { score: 68, volume: 2520, trend: 'stable' },
    },
    keywords: ['MVP race', 'triple-double', 'Prizm Silver', 'generational', 'buy now'],
    sentimentLevel: 'very_positive',
  },
  {
    playerId: 'victor-wembanyama',
    player: 'Victor Wembanyama',
    sport: 'NBA',
    overallSentiment: 85,
    volume: 22340,
    trendDirection: 'rising',
    priceCorrelation: 0.92,
    currentPrice: 8900,
    priceChange24h: 12.5,
    sources: {
      twitter: { score: 90, volume: 12400, trend: 'rising' },
      reddit: { score: 82, volume: 6200, trend: 'rising' },
      forums: { score: 78, volume: 3740, trend: 'rising' },
    },
    keywords: ['ROTY', 'generational talent', 'unicorn', 'Bowman Chrome', 'all-time'],
    sentimentLevel: 'very_positive',
  },
  {
    playerId: 'shohei-ohtani',
    player: 'Shohei Ohtani',
    sport: 'MLB',
    overallSentiment: 68,
    volume: 18650,
    trendDirection: 'stable',
    priceCorrelation: 0.72,
    currentPrice: 5200,
    priceChange24h: 3.1,
    sources: {
      twitter: { score: 74, volume: 10200, trend: 'stable' },
      reddit: { score: 62, volume: 5400, trend: 'rising' },
      forums: { score: 65, volume: 3050, trend: 'stable' },
    },
    keywords: ['two-way', 'Dodgers', 'MVP', 'Topps Chrome', 'home run'],
    sentimentLevel: 'very_positive',
  },
  {
    playerId: 'patrick-mahomes',
    player: 'Patrick Mahomes',
    sport: 'NFL',
    overallSentiment: 45,
    volume: 16200,
    trendDirection: 'falling',
    priceCorrelation: 0.68,
    currentPrice: 12500,
    priceChange24h: -4.3,
    sources: {
      twitter: { score: 42, volume: 9800, trend: 'falling' },
      reddit: { score: 50, volume: 4100, trend: 'stable' },
      forums: { score: 48, volume: 2300, trend: 'falling' },
    },
    keywords: ['offseason', 'dynasty fatigue', 'overvalued', 'Prizm', 'hold'],
    sentimentLevel: 'positive',
  },
  {
    playerId: 'connor-bedard',
    player: 'Connor Bedard',
    sport: 'NHL',
    overallSentiment: 58,
    volume: 8900,
    trendDirection: 'rising',
    priceCorrelation: 0.78,
    currentPrice: 2800,
    priceChange24h: 6.7,
    sources: {
      twitter: { score: 62, volume: 4500, trend: 'rising' },
      reddit: { score: 55, volume: 2800, trend: 'rising' },
      forums: { score: 54, volume: 1600, trend: 'stable' },
    },
    keywords: ['Calder Trophy', 'franchise player', 'Young Guns', 'rookie surge', 'buy'],
    sentimentLevel: 'positive',
  },
  {
    playerId: 'jaylen-brown',
    player: 'Jaylen Brown',
    sport: 'NBA',
    overallSentiment: -15,
    volume: 6400,
    trendDirection: 'falling',
    priceCorrelation: 0.55,
    currentPrice: 420,
    priceChange24h: -8.1,
    sources: {
      twitter: { score: -22, volume: 3200, trend: 'falling' },
      reddit: { score: -10, volume: 2100, trend: 'falling' },
      forums: { score: -8, volume: 1100, trend: 'stable' },
    },
    keywords: ['overrated', 'contract', 'sell high', 'declining', 'trade rumors'],
    sentimentLevel: 'neutral',
  },
  {
    playerId: 'caitlin-clark',
    player: 'Caitlin Clark',
    sport: 'WNBA',
    overallSentiment: 91,
    volume: 31200,
    trendDirection: 'rising',
    priceCorrelation: 0.95,
    currentPrice: 1850,
    priceChange24h: 18.4,
    sources: {
      twitter: { score: 94, volume: 18000, trend: 'rising' },
      reddit: { score: 88, volume: 8200, trend: 'rising' },
      forums: { score: 86, volume: 5000, trend: 'rising' },
    },
    keywords: ['record-breaking', 'cultural icon', 'must-buy', 'Prizm', 'mainstream'],
    sentimentLevel: 'very_positive',
  },
  {
    playerId: 'bryce-harper',
    player: 'Bryce Harper',
    sport: 'MLB',
    overallSentiment: -38,
    volume: 5200,
    trendDirection: 'falling',
    priceCorrelation: 0.61,
    currentPrice: 680,
    priceChange24h: -12.3,
    sources: {
      twitter: { score: -42, volume: 2800, trend: 'falling' },
      reddit: { score: -35, volume: 1600, trend: 'falling' },
      forums: { score: -30, volume: 800, trend: 'stable' },
    },
    keywords: ['injury concern', 'age', 'sell', 'declining production', 'avoid'],
    sentimentLevel: 'negative',
  },
  {
    playerId: 'caleb-williams',
    player: 'Caleb Williams',
    sport: 'NFL',
    overallSentiment: 34,
    volume: 11200,
    trendDirection: 'stable',
    priceCorrelation: 0.74,
    currentPrice: 1200,
    priceChange24h: 2.1,
    sources: {
      twitter: { score: 38, volume: 6200, trend: 'stable' },
      reddit: { score: 30, volume: 3200, trend: 'rising' },
      forums: { score: 28, volume: 1800, trend: 'stable' },
    },
    keywords: ['rookie hype', 'Bears rebuild', 'wait and see', 'Prizm', 'potential'],
    sentimentLevel: 'positive',
  },
  {
    playerId: 'aaron-judge',
    player: 'Aaron Judge',
    sport: 'MLB',
    overallSentiment: 52,
    volume: 9800,
    trendDirection: 'rising',
    priceCorrelation: 0.80,
    currentPrice: 3100,
    priceChange24h: 5.4,
    sources: {
      twitter: { score: 55, volume: 5200, trend: 'rising' },
      reddit: { score: 48, volume: 2800, trend: 'stable' },
      forums: { score: 50, volume: 1800, trend: 'rising' },
    },
    keywords: ['home run king', 'MVP repeat', 'Topps Chrome', 'power surge', 'buy'],
    sentimentLevel: 'positive',
  },
];

const SENTIMENT_ALERTS: SentimentAlert[] = [
  {
    id: 'sa-1',
    playerId: 'caitlin-clark',
    player: 'Caitlin Clark',
    source: 'twitter',
    message: 'Sentiment surge detected: 94% positive mentions in last 2 hours following record-breaking assist game',
    sentiment: 94,
    severity: 'high',
    timestamp: '2026-03-12T14:30:00Z',
  },
  {
    id: 'sa-2',
    playerId: 'bryce-harper',
    player: 'Bryce Harper',
    source: 'multi',
    message: 'Negative sentiment spike across all platforms — injury report leaked on social media',
    sentiment: -55,
    severity: 'high',
    timestamp: '2026-03-12T13:15:00Z',
  },
  {
    id: 'sa-3',
    playerId: 'victor-wembanyama',
    player: 'Victor Wembanyama',
    source: 'reddit',
    message: 'r/NBAcards trending thread: "Wemby is the next LeBron" — 2.4k upvotes in 3 hours',
    sentiment: 88,
    severity: 'medium',
    timestamp: '2026-03-12T12:45:00Z',
  },
  {
    id: 'sa-4',
    playerId: 'jaylen-brown',
    player: 'Jaylen Brown',
    source: 'forums',
    message: 'Blowout Forums consensus shifting bearish — multiple "sell now" threads gaining traction',
    sentiment: -28,
    severity: 'medium',
    timestamp: '2026-03-12T11:20:00Z',
  },
  {
    id: 'sa-5',
    playerId: 'luka-doncic',
    player: 'Luka Doncic',
    source: 'twitter',
    message: 'Viral highlight clip driving massive engagement — 1.2M views, sentiment overwhelmingly positive',
    sentiment: 82,
    severity: 'medium',
    timestamp: '2026-03-12T10:05:00Z',
  },
  {
    id: 'sa-6',
    playerId: 'patrick-mahomes',
    player: 'Patrick Mahomes',
    source: 'reddit',
    message: 'r/footballcards debate: "Has Mahomes peaked?" post gaining momentum — mixed sentiment',
    sentiment: -12,
    severity: 'low',
    timestamp: '2026-03-12T09:30:00Z',
  },
  {
    id: 'sa-7',
    playerId: 'connor-bedard',
    player: 'Connor Bedard',
    source: 'twitter',
    message: 'NHL analysts praising recent performance — "generational" mentions up 340% this week',
    sentiment: 65,
    severity: 'low',
    timestamp: '2026-03-12T08:00:00Z',
  },
];

function generateTimeline(playerId: string): SentimentTimelinePoint[] {
  const player = PLAYER_SENTIMENTS.find(p => p.playerId === playerId);
  if (!player) return [];

  const points: SentimentTimelinePoint[] = [];
  const base = player.overallSentiment;
  let price = player.currentPrice * 0.85;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const drift = player.trendDirection === 'rising' ? (29 - i) * 0.8
      : player.trendDirection === 'falling' ? -(29 - i) * 0.6
      : 0;
    const noise = (Math.sin(i * 1.7) * 12) + (Math.cos(i * 0.8) * 8);
    const sentiment = Math.max(-100, Math.min(100, base - 20 + drift + noise));
    price = price * (1 + (sentiment / 100) * 0.008 + (Math.random() - 0.45) * 0.015);

    points.push({
      date: date.toISOString().split('T')[0],
      sentiment: Math.round(sentiment),
      volume: Math.round(player.volume * (0.6 + Math.random() * 0.8)),
      price: Math.round(price * 100) / 100,
    });
  }
  return points;
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function getPlayerSentiment(playerId: string): SentimentData | undefined {
  return PLAYER_SENTIMENTS.find(p => p.playerId === playerId);
}

export function getAllPlayerSentiments(): SentimentData[] {
  return [...PLAYER_SENTIMENTS];
}

export function getTrendingSentiments(): SentimentData[] {
  return [...PLAYER_SENTIMENTS]
    .sort((a, b) => Math.abs(b.priceChange24h) - Math.abs(a.priceChange24h))
    .slice(0, 5);
}

export function getSentimentAlerts(): SentimentAlert[] {
  return [...SENTIMENT_ALERTS];
}

export function getSentimentTimeline(playerId: string): SentimentTimelinePoint[] {
  return generateTimeline(playerId);
}

export function getMarketSentimentOverview(): MarketSentimentOverview {
  const all = PLAYER_SENTIMENTS;
  const totalVol = all.reduce((s, p) => s + p.volume, 0);
  const weightedSentiment = all.reduce((s, p) => s + p.overallSentiment * p.volume, 0) / totalVol;

  const bullish = all.filter(p => p.overallSentiment > 20).length;
  const bearish = all.filter(p => p.overallSentiment < -20).length;
  const neutral = all.length - bullish - bearish;

  const keywordMap: Record<string, { count: number; sentiment: number }> = {};
  all.forEach(p => {
    p.keywords.forEach(kw => {
      if (!keywordMap[kw]) keywordMap[kw] = { count: 0, sentiment: 0 };
      keywordMap[kw].count += 1;
      keywordMap[kw].sentiment += p.overallSentiment;
    });
  });

  const topKeywords = Object.entries(keywordMap)
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      sentiment: Math.round(data.sentiment / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    overall: Math.round(weightedSentiment),
    bullish,
    bearish,
    neutral,
    totalVolume: totalVol,
    topKeywords,
  };
}

export function getScatterData(): { player: string; sentiment: number; priceChange: number }[] {
  return PLAYER_SENTIMENTS.map(p => ({
    player: p.player,
    sentiment: p.overallSentiment,
    priceChange: p.priceChange24h,
  }));
}
