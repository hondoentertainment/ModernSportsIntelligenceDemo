// @ts-nocheck
// ── Phase 110: Influence Graph & Social Alpha Attribution ─────────────────────

// ── Types ────────────────────────────────────────────────────────────────────────

export type Platform = 'youtube' | 'twitter' | 'tiktok' | 'podcast' | 'instagram';
export type InfluencerTier = 'mega' | 'macro' | 'mid' | 'micro' | 'nano';
export type CardCategory = 'basketball' | 'baseball' | 'football' | 'hockey' | 'soccer' | 'general';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type SignalStrength = 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  avatarUrl?: string;
  tier: InfluencerTier;
  followers: number;
  categories: CardCategory[];
  avgPriceImpactPct: number;        // average spike when they mention a card
  avgReversionPct: number;          // how much of that spike reverts
  avgTimeToPeakHours: number;       // hours from mention to peak
  avgTimeToRevertHours: number;     // hours from peak to mean-reversion
  reliability: number;              // 0-100 how consistent their impact is
  totalMentions: number;
  totalCardsImpacted: number;
  last30dMentions: number;
  sentimentBias: number;            // -100 (always bearish) to +100 (always bullish)
  isActive: boolean;
}

export interface InfluenceMention {
  id: string;
  influencerId: string;
  influencerName: string;
  platform: Platform;
  cardId: string;
  cardName: string;
  mentionDate: string;
  sentiment: number;                // -100 to 100
  reach: number;                    // estimated views/impressions
  engagement: number;               // likes + comments + shares
  priceAtMention: number;
  pricePeak: number;
  priceNow: number;
  contentSnippet: string;
  url?: string;
}

export interface PriceAttribution {
  cardId: string;
  cardName: string;
  totalPriceChangePct: number;
  influencerDrivenPct: number;      // what % of price change was influencer-driven
  fundamentalDrivenPct: number;     // performance, scarcity, market
  unknownPct: number;
  topContributors: {
    influencerId: string;
    influencerName: string;
    platform: Platform;
    contributionPct: number;
    mentionDate: string;
  }[];
  period: string;                   // e.g. "last 30 days"
}

export interface InfluenceScore {
  influencerId: string;
  overallScore: number;             // 0-100
  impactScore: number;
  consistencyScore: number;
  reachScore: number;
  reversionScore: number;           // lower reversion = higher quality signal
  rank: number;
}

export interface HypeDecayModel {
  mentionId: string;
  cardId: string;
  cardName: string;
  influencerName: string;
  platform: Platform;
  currentPhase: 'pre_spike' | 'spiking' | 'plateau' | 'decaying' | 'reverted' | 'new_floor';
  predictedPeakPct: number;
  predictedPeakHours: number;
  predictedReversionPct: number;
  predictedReversionHours: number;
  confidence: number;               // 0-100
  currentPriceVsMention: number;    // % change from mention price
  recommendedAction: 'buy_now' | 'wait_for_peak' | 'sell_now' | 'hold' | 'avoid';
  decayCurve: { hoursFromMention: number; predictedChangePct: number }[];
}

export interface SocialAlphaSignal {
  id: string;
  cardId: string;
  cardName: string;
  platform: Platform;
  influencerId: string;
  influencerName: string;
  signalStrength: SignalStrength;
  predictedImpactPct: number;
  confidence: number;
  detectedAt: string;
  mentionSnippet: string;
  currentPrice: number;
  category: CardCategory;
  isActionable: boolean;
}

export interface InfluencerAlert {
  id: string;
  priority: AlertPriority;
  influencerId: string;
  influencerName: string;
  platform: Platform;
  cardId: string;
  cardName: string;
  message: string;
  predictedImpact: number;
  timestamp: string;
  isRead: boolean;
}

export interface PortfolioExposure {
  cardId: string;
  cardName: string;
  currentValue: number;
  activeMentions: number;
  influencers: { name: string; platform: Platform; sentiment: number }[];
  exposureLevel: 'high' | 'medium' | 'low' | 'none';
  predictedImpactRange: { low: number; high: number };
}

export interface InfluencerImpact {
  influencer: Influencer;
  recentMentions: InfluenceMention[];
  impactDistribution: { range: string; count: number }[];
  bestCall: { cardName: string; impactPct: number; date: string };
  worstCall: { cardName: string; impactPct: number; date: string };
  avgHoldPeriodHours: number;
  winRate: number;
}

// ── Mock Influencers ─────────────────────────────────────────────────────────────

const INFLUENCERS: Influencer[] = [
  {
    id: 'inf-001', name: 'Gary V', handle: '@garyvee', platform: 'twitter',
    tier: 'mega', followers: 12_400_000, categories: ['general', 'basketball'],
    avgPriceImpactPct: 18.5, avgReversionPct: 62, avgTimeToPeakHours: 4, avgTimeToRevertHours: 72,
    reliability: 45, totalMentions: 342, totalCardsImpacted: 289, last30dMentions: 8,
    sentimentBias: 85, isActive: true,
  },
  {
    id: 'inf-002', name: 'Jabs Family', handle: '@JabsFamily', platform: 'youtube',
    tier: 'macro', followers: 1_850_000, categories: ['baseball', 'basketball', 'football'],
    avgPriceImpactPct: 12.3, avgReversionPct: 38, avgTimeToPeakHours: 8, avgTimeToRevertHours: 120,
    reliability: 72, totalMentions: 1_240, totalCardsImpacted: 980, last30dMentions: 22,
    sentimentBias: 55, isActive: true,
  },
  {
    id: 'inf-003', name: 'Sports Card Investor', handle: '@SCInvestor', platform: 'youtube',
    tier: 'macro', followers: 980_000, categories: ['general', 'baseball', 'basketball'],
    avgPriceImpactPct: 14.8, avgReversionPct: 42, avgTimeToPeakHours: 6, avgTimeToRevertHours: 96,
    reliability: 68, totalMentions: 2_100, totalCardsImpacted: 1_650, last30dMentions: 18,
    sentimentBias: 60, isActive: true,
  },
  {
    id: 'inf-004', name: 'CardCollector2', handle: '@CardCollector2', platform: 'twitter',
    tier: 'mid', followers: 245_000, categories: ['basketball', 'baseball'],
    avgPriceImpactPct: 8.2, avgReversionPct: 30, avgTimeToPeakHours: 12, avgTimeToRevertHours: 168,
    reliability: 78, totalMentions: 890, totalCardsImpacted: 620, last30dMentions: 14,
    sentimentBias: 35, isActive: true,
  },
  {
    id: 'inf-005', name: 'Backyard Breaks', handle: '@BackyardBreaks', platform: 'youtube',
    tier: 'macro', followers: 720_000, categories: ['football', 'basketball', 'baseball'],
    avgPriceImpactPct: 9.6, avgReversionPct: 48, avgTimeToPeakHours: 3, avgTimeToRevertHours: 48,
    reliability: 55, totalMentions: 680, totalCardsImpacted: 520, last30dMentions: 12,
    sentimentBias: 70, isActive: true,
  },
  {
    id: 'inf-006', name: 'PackRipMike', handle: '@PackRipMike', platform: 'tiktok',
    tier: 'macro', followers: 2_100_000, categories: ['general'],
    avgPriceImpactPct: 22.4, avgReversionPct: 78, avgTimeToPeakHours: 2, avgTimeToRevertHours: 36,
    reliability: 32, totalMentions: 450, totalCardsImpacted: 380, last30dMentions: 28,
    sentimentBias: 90, isActive: true,
  },
  {
    id: 'inf-007', name: 'Card Market Edge', handle: '@CardMarketEdge', platform: 'podcast',
    tier: 'mid', followers: 185_000, categories: ['baseball', 'football'],
    avgPriceImpactPct: 6.8, avgReversionPct: 22, avgTimeToPeakHours: 24, avgTimeToRevertHours: 240,
    reliability: 85, totalMentions: 520, totalCardsImpacted: 410, last30dMentions: 6,
    sentimentBias: 20, isActive: true,
  },
  {
    id: 'inf-008', name: 'The Hobby Guru', handle: '@HobbyGuruYT', platform: 'youtube',
    tier: 'mid', followers: 340_000, categories: ['basketball', 'general'],
    avgPriceImpactPct: 10.1, avgReversionPct: 35, avgTimeToPeakHours: 10, avgTimeToRevertHours: 144,
    reliability: 74, totalMentions: 760, totalCardsImpacted: 580, last30dMentions: 10,
    sentimentBias: 40, isActive: true,
  },
  {
    id: 'inf-009', name: 'RipCity Cards', handle: '@RipCityCards', platform: 'tiktok',
    tier: 'mid', followers: 890_000, categories: ['basketball', 'football'],
    avgPriceImpactPct: 15.7, avgReversionPct: 65, avgTimeToPeakHours: 1.5, avgTimeToRevertHours: 24,
    reliability: 38, totalMentions: 320, totalCardsImpacted: 280, last30dMentions: 32,
    sentimentBias: 82, isActive: true,
  },
  {
    id: 'inf-010', name: 'Eric Whiteback', handle: '@EWhiteback', platform: 'twitter',
    tier: 'micro', followers: 92_000, categories: ['baseball'],
    avgPriceImpactPct: 5.4, avgReversionPct: 18, avgTimeToPeakHours: 18, avgTimeToRevertHours: 336,
    reliability: 91, totalMentions: 420, totalCardsImpacted: 350, last30dMentions: 5,
    sentimentBias: 10, isActive: true,
  },
  {
    id: 'inf-011', name: 'Collector Chronicles', handle: '@CollectorChron', platform: 'podcast',
    tier: 'mid', followers: 210_000, categories: ['hockey', 'basketball'],
    avgPriceImpactPct: 7.2, avgReversionPct: 25, avgTimeToPeakHours: 20, avgTimeToRevertHours: 192,
    reliability: 82, totalMentions: 380, totalCardsImpacted: 290, last30dMentions: 4,
    sentimentBias: 15, isActive: true,
  },
  {
    id: 'inf-012', name: 'CaseDawg', handle: '@CaseDawg', platform: 'youtube',
    tier: 'mid', followers: 420_000, categories: ['football', 'baseball'],
    avgPriceImpactPct: 11.3, avgReversionPct: 45, avgTimeToPeakHours: 5, avgTimeToRevertHours: 60,
    reliability: 60, totalMentions: 610, totalCardsImpacted: 480, last30dMentions: 15,
    sentimentBias: 65, isActive: true,
  },
  {
    id: 'inf-013', name: 'Hobby Hotline', handle: '@HobbyHotline', platform: 'twitter',
    tier: 'micro', followers: 78_000, categories: ['general'],
    avgPriceImpactPct: 4.1, avgReversionPct: 15, avgTimeToPeakHours: 36, avgTimeToRevertHours: 480,
    reliability: 88, totalMentions: 290, totalCardsImpacted: 220, last30dMentions: 7,
    sentimentBias: 5, isActive: true,
  },
  {
    id: 'inf-014', name: 'Wax Museum Breaks', handle: '@WaxMuseumBreaks', platform: 'youtube',
    tier: 'macro', followers: 560_000, categories: ['baseball', 'football', 'basketball'],
    avgPriceImpactPct: 8.9, avgReversionPct: 40, avgTimeToPeakHours: 6, avgTimeToRevertHours: 96,
    reliability: 65, totalMentions: 950, totalCardsImpacted: 730, last30dMentions: 20,
    sentimentBias: 55, isActive: true,
  },
  {
    id: 'inf-015', name: 'SportsCardsNonStop', handle: '@SCNonStop', platform: 'tiktok',
    tier: 'macro', followers: 1_400_000, categories: ['basketball', 'general'],
    avgPriceImpactPct: 19.2, avgReversionPct: 72, avgTimeToPeakHours: 1, avgTimeToRevertHours: 18,
    reliability: 28, totalMentions: 220, totalCardsImpacted: 190, last30dMentions: 35,
    sentimentBias: 92, isActive: true,
  },
  {
    id: 'inf-016', name: 'Dr. James Beckett', handle: '@DrBeckett', platform: 'twitter',
    tier: 'mega', followers: 3_200_000, categories: ['general', 'baseball'],
    avgPriceImpactPct: 8.8, avgReversionPct: 12, avgTimeToPeakHours: 48, avgTimeToRevertHours: 720,
    reliability: 94, totalMentions: 180, totalCardsImpacted: 150, last30dMentions: 2,
    sentimentBias: 0, isActive: true,
  },
  {
    id: 'inf-017', name: 'Value Picks Pod', handle: '@ValuePicksPod', platform: 'podcast',
    tier: 'micro', followers: 65_000, categories: ['baseball', 'basketball'],
    avgPriceImpactPct: 4.5, avgReversionPct: 10, avgTimeToPeakHours: 48, avgTimeToRevertHours: 600,
    reliability: 92, totalMentions: 310, totalCardsImpacted: 260, last30dMentions: 3,
    sentimentBias: -5, isActive: true,
  },
  {
    id: 'inf-018', name: 'GemMint10', handle: '@GemMint10', platform: 'instagram',
    tier: 'mid', followers: 480_000, categories: ['basketball', 'soccer'],
    avgPriceImpactPct: 13.6, avgReversionPct: 55, avgTimeToPeakHours: 4, avgTimeToRevertHours: 48,
    reliability: 50, totalMentions: 540, totalCardsImpacted: 420, last30dMentions: 18,
    sentimentBias: 72, isActive: true,
  },
  {
    id: 'inf-019', name: 'Prospect Watch TV', handle: '@ProspectWatchTV', platform: 'youtube',
    tier: 'mid', followers: 290_000, categories: ['baseball'],
    avgPriceImpactPct: 9.4, avgReversionPct: 28, avgTimeToPeakHours: 12, avgTimeToRevertHours: 168,
    reliability: 80, totalMentions: 680, totalCardsImpacted: 540, last30dMentions: 9,
    sentimentBias: 30, isActive: true,
  },
  {
    id: 'inf-020', name: 'Card Alpha Daily', handle: '@CardAlphaDaily', platform: 'twitter',
    tier: 'micro', followers: 110_000, categories: ['general', 'football'],
    avgPriceImpactPct: 6.2, avgReversionPct: 20, avgTimeToPeakHours: 14, avgTimeToRevertHours: 200,
    reliability: 86, totalMentions: 440, totalCardsImpacted: 350, last30dMentions: 11,
    sentimentBias: 25, isActive: true,
  },
  {
    id: 'inf-021', name: 'HoopsHype Cards', handle: '@HoopsHypeCards', platform: 'twitter',
    tier: 'mid', followers: 320_000, categories: ['basketball'],
    avgPriceImpactPct: 11.8, avgReversionPct: 50, avgTimeToPeakHours: 3, avgTimeToRevertHours: 42,
    reliability: 58, totalMentions: 510, totalCardsImpacted: 400, last30dMentions: 16,
    sentimentBias: 68, isActive: true,
  },
  {
    id: 'inf-022', name: 'Gridiron Gems', handle: '@GridironGems', platform: 'youtube',
    tier: 'mid', followers: 195_000, categories: ['football'],
    avgPriceImpactPct: 7.5, avgReversionPct: 32, avgTimeToPeakHours: 8, avgTimeToRevertHours: 120,
    reliability: 76, totalMentions: 430, totalCardsImpacted: 340, last30dMentions: 8,
    sentimentBias: 40, isActive: true,
  },
  {
    id: 'inf-023', name: 'PuckCollectors', handle: '@PuckCollectors', platform: 'instagram',
    tier: 'micro', followers: 58_000, categories: ['hockey'],
    avgPriceImpactPct: 5.9, avgReversionPct: 20, avgTimeToPeakHours: 16, avgTimeToRevertHours: 240,
    reliability: 84, totalMentions: 260, totalCardsImpacted: 200, last30dMentions: 6,
    sentimentBias: 15, isActive: true,
  },
];

// ── Mock Mentions ────────────────────────────────────────────────────────────────

const MOCK_MENTIONS: InfluenceMention[] = [
  {
    id: 'men-001', influencerId: 'inf-001', influencerName: 'Gary V', platform: 'twitter',
    cardId: 'wemby-prizm-silver', cardName: '2023 Prizm Silver Victor Wembanyama RC',
    mentionDate: '2026-03-12T14:30:00Z', sentiment: 92, reach: 2_400_000, engagement: 84_000,
    priceAtMention: 850, pricePeak: 1120, priceNow: 940,
    contentSnippet: 'This Wemby Prizm Silver is the MOST undervalued card in the hobby right now. Load up.',
  },
  {
    id: 'men-002', influencerId: 'inf-006', influencerName: 'PackRipMike', platform: 'tiktok',
    cardId: 'luka-select-courtside', cardName: '2018 Select Courtside Luka Doncic RC',
    mentionDate: '2026-03-11T09:15:00Z', sentiment: 88, reach: 4_100_000, engagement: 310_000,
    priceAtMention: 3200, pricePeak: 4100, priceNow: 3480,
    contentSnippet: 'INSANE pull! This Luka Courtside is pure fire 🔥 only going UP from here',
  },
  {
    id: 'men-003', influencerId: 'inf-003', influencerName: 'Sports Card Investor', platform: 'youtube',
    cardId: 'ohtani-bowman-chrome', cardName: '2018 Bowman Chrome Shohei Ohtani RC',
    mentionDate: '2026-03-10T18:00:00Z', sentiment: 75, reach: 680_000, engagement: 42_000,
    priceAtMention: 4800, pricePeak: 5520, priceNow: 5200,
    contentSnippet: 'Deep dive on Ohtani Bowman Chrome — the fundamentals support a higher floor. Here is my analysis...',
  },
  {
    id: 'men-004', influencerId: 'inf-002', influencerName: 'Jabs Family', platform: 'youtube',
    cardId: 'mahomes-prizm-silver', cardName: '2017 Prizm Silver Patrick Mahomes RC',
    mentionDate: '2026-03-09T20:45:00Z', sentiment: 45, reach: 920_000, engagement: 58_000,
    priceAtMention: 12800, pricePeak: 13200, priceNow: 12500,
    contentSnippet: 'Mahomes Prizm Silver — is this a hold or a sell? Let me break down the numbers...',
  },
  {
    id: 'men-005', influencerId: 'inf-009', influencerName: 'RipCity Cards', platform: 'tiktok',
    cardId: 'caleb-williams-optic', cardName: '2024 Optic Caleb Williams RC',
    mentionDate: '2026-03-12T16:00:00Z', sentiment: 95, reach: 1_800_000, engagement: 220_000,
    priceAtMention: 180, pricePeak: 320, priceNow: 260,
    contentSnippet: 'Caleb Williams Optic RC is a STEAL at this price! NFL season will send this to the moon 🚀',
  },
  {
    id: 'men-006', influencerId: 'inf-010', influencerName: 'Eric Whiteback', platform: 'twitter',
    cardId: 'caitlin-clark-prizm', cardName: '2024 Prizm Caitlin Clark RC',
    mentionDate: '2026-03-11T11:30:00Z', sentiment: 68, reach: 45_000, engagement: 3_200,
    priceAtMention: 1850, pricePeak: 1950, priceNow: 1900,
    contentSnippet: 'Caitlin Clark Prizm RC — steady demand, low reversion risk. Solid long-term hold.',
  },
  {
    id: 'men-007', influencerId: 'inf-007', influencerName: 'Card Market Edge', platform: 'podcast',
    cardId: 'connor-bedard-yg', cardName: '2023 Upper Deck Young Guns Connor Bedard RC',
    mentionDate: '2026-03-08T14:00:00Z', sentiment: 72, reach: 95_000, engagement: 8_500,
    priceAtMention: 2600, pricePeak: 2850, priceNow: 2780,
    contentSnippet: 'Bedard Young Guns — podcast deep dive on why hockey rookies are undervalued in mixed-sport collections.',
  },
  {
    id: 'men-008', influencerId: 'inf-015', influencerName: 'SportsCardsNonStop', platform: 'tiktok',
    cardId: 'jaylen-brown-prizm', cardName: '2017 Prizm Jaylen Brown RC',
    mentionDate: '2026-03-12T08:00:00Z', sentiment: -35, reach: 3_200_000, engagement: 180_000,
    priceAtMention: 420, pricePeak: 420, priceNow: 380,
    contentSnippet: 'Jaylen Brown Prizm — SELL NOW before it drops more. This card has peaked.',
  },
  {
    id: 'men-009', influencerId: 'inf-016', influencerName: 'Dr. James Beckett', platform: 'twitter',
    cardId: 'wemby-prizm-silver', cardName: '2023 Prizm Silver Victor Wembanyama RC',
    mentionDate: '2026-03-07T10:00:00Z', sentiment: 60, reach: 1_800_000, engagement: 22_000,
    priceAtMention: 780, pricePeak: 860, priceNow: 940,
    contentSnippet: 'The market for modern basketball rookies continues to evolve. Wembanyama represents a generational talent.',
  },
  {
    id: 'men-010', influencerId: 'inf-004', influencerName: 'CardCollector2', platform: 'twitter',
    cardId: 'harper-topps-chrome', cardName: '2012 Topps Chrome Bryce Harper RC',
    mentionDate: '2026-03-10T15:30:00Z', sentiment: -55, reach: 120_000, engagement: 8_800,
    priceAtMention: 720, pricePeak: 720, priceNow: 680,
    contentSnippet: 'Harper Topps Chrome — the writing is on the wall. Sell before it dips further.',
  },
  {
    id: 'men-011', influencerId: 'inf-019', influencerName: 'Prospect Watch TV', platform: 'youtube',
    cardId: 'jackson-holliday-bc1st', cardName: '2022 Bowman Chrome 1st Jackson Holliday',
    mentionDate: '2026-03-11T20:00:00Z', sentiment: 82, reach: 180_000, engagement: 14_200,
    priceAtMention: 420, pricePeak: 510, priceNow: 480,
    contentSnippet: 'Jackson Holliday Bowman Chrome 1st — my top prospect pick for 2026. The data is compelling.',
  },
  {
    id: 'men-012', influencerId: 'inf-018', influencerName: 'GemMint10', platform: 'instagram',
    cardId: 'lamine-yamal-topps', cardName: '2023 Topps Chrome Lamine Yamal RC',
    mentionDate: '2026-03-12T12:00:00Z', sentiment: 90, reach: 380_000, engagement: 45_000,
    priceAtMention: 1200, pricePeak: 1580, priceNow: 1420,
    contentSnippet: 'Lamine Yamal Topps Chrome — the next global superstar. Soccer cards are about to explode.',
  },
  {
    id: 'men-013', influencerId: 'inf-012', influencerName: 'CaseDawg', platform: 'youtube',
    cardId: 'cj-stroud-prizm', cardName: '2023 Prizm CJ Stroud RC',
    mentionDate: '2026-03-09T22:00:00Z', sentiment: 70, reach: 260_000, engagement: 18_500,
    priceAtMention: 280, pricePeak: 340, priceNow: 310,
    contentSnippet: 'CJ Stroud Prizm RC — sleeper pick for the off-season. Great value at current prices.',
  },
  {
    id: 'men-014', influencerId: 'inf-021', influencerName: 'HoopsHype Cards', platform: 'twitter',
    cardId: 'ant-edwards-prizm', cardName: '2020 Prizm Anthony Edwards RC',
    mentionDate: '2026-03-12T19:00:00Z', sentiment: 85, reach: 210_000, engagement: 16_000,
    priceAtMention: 1100, pricePeak: 1320, priceNow: 1250,
    contentSnippet: 'Ant Edwards is the next face of the NBA. His Prizm RC is a must-own. Not selling mine.',
  },
  {
    id: 'men-015', influencerId: 'inf-008', influencerName: 'The Hobby Guru', platform: 'youtube',
    cardId: 'wemby-prizm-silver', cardName: '2023 Prizm Silver Victor Wembanyama RC',
    mentionDate: '2026-03-12T10:00:00Z', sentiment: 80, reach: 220_000, engagement: 15_800,
    priceAtMention: 880, pricePeak: 980, priceNow: 940,
    contentSnippet: 'My top 5 modern basketball RCs to own — Wemby Prizm Silver leads the list.',
  },
];

// ── Mock Hype Decay Predictions ──────────────────────────────────────────────────

const MOCK_HYPE_DECAYS: HypeDecayModel[] = [
  {
    mentionId: 'men-001', cardId: 'wemby-prizm-silver', cardName: '2023 Prizm Silver Victor Wembanyama RC',
    influencerName: 'Gary V', platform: 'twitter',
    currentPhase: 'decaying', predictedPeakPct: 31.8, predictedPeakHours: 4,
    predictedReversionPct: 62, predictedReversionHours: 72, confidence: 78,
    currentPriceVsMention: 10.6, recommendedAction: 'hold',
    decayCurve: [
      { hoursFromMention: 0, predictedChangePct: 0 }, { hoursFromMention: 2, predictedChangePct: 18 },
      { hoursFromMention: 4, predictedChangePct: 31.8 }, { hoursFromMention: 8, predictedChangePct: 28 },
      { hoursFromMention: 16, predictedChangePct: 22 }, { hoursFromMention: 24, predictedChangePct: 18 },
      { hoursFromMention: 48, predictedChangePct: 14 }, { hoursFromMention: 72, predictedChangePct: 10.6 },
    ],
  },
  {
    mentionId: 'men-002', cardId: 'luka-select-courtside', cardName: '2018 Select Courtside Luka Doncic RC',
    influencerName: 'PackRipMike', platform: 'tiktok',
    currentPhase: 'decaying', predictedPeakPct: 28.1, predictedPeakHours: 2,
    predictedReversionPct: 78, predictedReversionHours: 36, confidence: 72,
    currentPriceVsMention: 8.75, recommendedAction: 'sell_now',
    decayCurve: [
      { hoursFromMention: 0, predictedChangePct: 0 }, { hoursFromMention: 1, predictedChangePct: 16 },
      { hoursFromMention: 2, predictedChangePct: 28.1 }, { hoursFromMention: 4, predictedChangePct: 24 },
      { hoursFromMention: 8, predictedChangePct: 18 }, { hoursFromMention: 16, predictedChangePct: 12 },
      { hoursFromMention: 24, predictedChangePct: 8 }, { hoursFromMention: 36, predictedChangePct: 6.2 },
    ],
  },
  {
    mentionId: 'men-005', cardId: 'caleb-williams-optic', cardName: '2024 Optic Caleb Williams RC',
    influencerName: 'RipCity Cards', platform: 'tiktok',
    currentPhase: 'spiking', predictedPeakPct: 82, predictedPeakHours: 1.5,
    predictedReversionPct: 65, predictedReversionHours: 24, confidence: 65,
    currentPriceVsMention: 44.4, recommendedAction: 'wait_for_peak',
    decayCurve: [
      { hoursFromMention: 0, predictedChangePct: 0 }, { hoursFromMention: 0.5, predictedChangePct: 28 },
      { hoursFromMention: 1, predictedChangePct: 55 }, { hoursFromMention: 1.5, predictedChangePct: 82 },
      { hoursFromMention: 3, predictedChangePct: 68 }, { hoursFromMention: 6, predictedChangePct: 48 },
      { hoursFromMention: 12, predictedChangePct: 32 }, { hoursFromMention: 24, predictedChangePct: 28.7 },
    ],
  },
  {
    mentionId: 'men-012', cardId: 'lamine-yamal-topps', cardName: '2023 Topps Chrome Lamine Yamal RC',
    influencerName: 'GemMint10', platform: 'instagram',
    currentPhase: 'plateau', predictedPeakPct: 31.7, predictedPeakHours: 4,
    predictedReversionPct: 55, predictedReversionHours: 48, confidence: 70,
    currentPriceVsMention: 18.3, recommendedAction: 'sell_now',
    decayCurve: [
      { hoursFromMention: 0, predictedChangePct: 0 }, { hoursFromMention: 2, predictedChangePct: 20 },
      { hoursFromMention: 4, predictedChangePct: 31.7 }, { hoursFromMention: 8, predictedChangePct: 30 },
      { hoursFromMention: 16, predictedChangePct: 24 }, { hoursFromMention: 24, predictedChangePct: 18 },
      { hoursFromMention: 36, predictedChangePct: 14 }, { hoursFromMention: 48, predictedChangePct: 14.3 },
    ],
  },
  {
    mentionId: 'men-003', cardId: 'ohtani-bowman-chrome', cardName: '2018 Bowman Chrome Shohei Ohtani RC',
    influencerName: 'Sports Card Investor', platform: 'youtube',
    currentPhase: 'new_floor', predictedPeakPct: 15, predictedPeakHours: 6,
    predictedReversionPct: 42, predictedReversionHours: 96, confidence: 82,
    currentPriceVsMention: 8.3, recommendedAction: 'hold',
    decayCurve: [
      { hoursFromMention: 0, predictedChangePct: 0 }, { hoursFromMention: 3, predictedChangePct: 8 },
      { hoursFromMention: 6, predictedChangePct: 15 }, { hoursFromMention: 12, predictedChangePct: 14 },
      { hoursFromMention: 24, predictedChangePct: 12 }, { hoursFromMention: 48, predictedChangePct: 10 },
      { hoursFromMention: 72, predictedChangePct: 9 }, { hoursFromMention: 96, predictedChangePct: 8.7 },
    ],
  },
];

// ── Mock Social Alpha Signals ────────────────────────────────────────────────────

const MOCK_SIGNALS: SocialAlphaSignal[] = [
  {
    id: 'sig-001', cardId: 'wemby-prizm-silver', cardName: '2023 Prizm Silver Victor Wembanyama RC',
    platform: 'twitter', influencerId: 'inf-001', influencerName: 'Gary V',
    signalStrength: 'strong_buy', predictedImpactPct: 18.5, confidence: 72,
    detectedAt: '2026-03-12T14:32:00Z',
    mentionSnippet: 'Wemby Prizm Silver is the MOST undervalued card in the hobby...',
    currentPrice: 940, category: 'basketball', isActionable: true,
  },
  {
    id: 'sig-002', cardId: 'caleb-williams-optic', cardName: '2024 Optic Caleb Williams RC',
    platform: 'tiktok', influencerId: 'inf-009', influencerName: 'RipCity Cards',
    signalStrength: 'buy', predictedImpactPct: 15.7, confidence: 55,
    detectedAt: '2026-03-12T16:02:00Z',
    mentionSnippet: 'Caleb Williams Optic RC is a STEAL at this price...',
    currentPrice: 260, category: 'football', isActionable: true,
  },
  {
    id: 'sig-003', cardId: 'jaylen-brown-prizm', cardName: '2017 Prizm Jaylen Brown RC',
    platform: 'tiktok', influencerId: 'inf-015', influencerName: 'SportsCardsNonStop',
    signalStrength: 'strong_sell', predictedImpactPct: -19.2, confidence: 60,
    detectedAt: '2026-03-12T08:05:00Z',
    mentionSnippet: 'Jaylen Brown Prizm — SELL NOW before it drops more...',
    currentPrice: 380, category: 'basketball', isActionable: true,
  },
  {
    id: 'sig-004', cardId: 'lamine-yamal-topps', cardName: '2023 Topps Chrome Lamine Yamal RC',
    platform: 'instagram', influencerId: 'inf-018', influencerName: 'GemMint10',
    signalStrength: 'buy', predictedImpactPct: 13.6, confidence: 68,
    detectedAt: '2026-03-12T12:05:00Z',
    mentionSnippet: 'Lamine Yamal Topps Chrome — the next global superstar...',
    currentPrice: 1420, category: 'soccer', isActionable: true,
  },
  {
    id: 'sig-005', cardId: 'ant-edwards-prizm', cardName: '2020 Prizm Anthony Edwards RC',
    platform: 'twitter', influencerId: 'inf-021', influencerName: 'HoopsHype Cards',
    signalStrength: 'buy', predictedImpactPct: 11.8, confidence: 64,
    detectedAt: '2026-03-12T19:05:00Z',
    mentionSnippet: 'Ant Edwards is the next face of the NBA...',
    currentPrice: 1250, category: 'basketball', isActionable: true,
  },
  {
    id: 'sig-006', cardId: 'harper-topps-chrome', cardName: '2012 Topps Chrome Bryce Harper RC',
    platform: 'twitter', influencerId: 'inf-004', influencerName: 'CardCollector2',
    signalStrength: 'sell', predictedImpactPct: -8.2, confidence: 75,
    detectedAt: '2026-03-10T15:35:00Z',
    mentionSnippet: 'Harper Topps Chrome — the writing is on the wall...',
    currentPrice: 680, category: 'baseball', isActionable: true,
  },
  {
    id: 'sig-007', cardId: 'jackson-holliday-bc1st', cardName: '2022 Bowman Chrome 1st Jackson Holliday',
    platform: 'youtube', influencerId: 'inf-019', influencerName: 'Prospect Watch TV',
    signalStrength: 'buy', predictedImpactPct: 9.4, confidence: 78,
    detectedAt: '2026-03-11T20:05:00Z',
    mentionSnippet: 'Jackson Holliday Bowman Chrome 1st — my top prospect pick...',
    currentPrice: 480, category: 'baseball', isActionable: true,
  },
  {
    id: 'sig-008', cardId: 'connor-bedard-yg', cardName: '2023 Upper Deck Young Guns Connor Bedard RC',
    platform: 'podcast', influencerId: 'inf-007', influencerName: 'Card Market Edge',
    signalStrength: 'neutral', predictedImpactPct: 6.8, confidence: 82,
    detectedAt: '2026-03-08T14:05:00Z',
    mentionSnippet: 'Bedard Young Guns — hockey rookies are undervalued...',
    currentPrice: 2780, category: 'hockey', isActionable: false,
  },
];

// ── Helper Functions ─────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function tierColor(tier: InfluencerTier): string {
  const map: Record<InfluencerTier, string> = {
    mega: 'text-amber-400',
    macro: 'text-purple-400',
    mid: 'text-sky-400',
    micro: 'text-emerald-400',
    nano: 'text-slate-400',
  };
  return map[tier];
}

function platformIcon(platform: Platform): string {
  const map: Record<Platform, string> = {
    youtube: 'YT',
    twitter: 'X',
    tiktok: 'TT',
    podcast: 'POD',
    instagram: 'IG',
  };
  return map[platform];
}

function platformColor(platform: Platform): string {
  const map: Record<Platform, string> = {
    youtube: 'text-red-400',
    twitter: 'text-sky-400',
    tiktok: 'text-pink-400',
    podcast: 'text-purple-400',
    instagram: 'text-orange-400',
  };
  return map[platform];
}

function phaseLabel(phase: HypeDecayModel['currentPhase']): string {
  const map: Record<HypeDecayModel['currentPhase'], string> = {
    pre_spike: 'Pre-Spike',
    spiking: 'Spiking',
    plateau: 'Plateau',
    decaying: 'Decaying',
    reverted: 'Reverted',
    new_floor: 'New Floor',
  };
  return map[phase];
}

function phaseColor(phase: HypeDecayModel['currentPhase']): string {
  const map: Record<HypeDecayModel['currentPhase'], string> = {
    pre_spike: 'text-sky-400',
    spiking: 'text-emerald-400',
    plateau: 'text-amber-400',
    decaying: 'text-orange-400',
    reverted: 'text-red-400',
    new_floor: 'text-purple-400',
  };
  return map[phase];
}

function actionLabel(action: HypeDecayModel['recommendedAction']): string {
  const map: Record<HypeDecayModel['recommendedAction'], string> = {
    buy_now: 'Buy Now',
    wait_for_peak: 'Wait for Peak',
    sell_now: 'Sell Now',
    hold: 'Hold',
    avoid: 'Avoid',
  };
  return map[action];
}

function actionColor(action: HypeDecayModel['recommendedAction']): string {
  const map: Record<HypeDecayModel['recommendedAction'], string> = {
    buy_now: 'text-emerald-400',
    wait_for_peak: 'text-amber-400',
    sell_now: 'text-red-400',
    hold: 'text-sky-400',
    avoid: 'text-slate-400',
  };
  return map[action];
}

function signalColor(strength: SignalStrength): string {
  const map: Record<SignalStrength, string> = {
    strong_buy: 'text-emerald-400',
    buy: 'text-emerald-300',
    neutral: 'text-slate-300',
    sell: 'text-red-300',
    strong_sell: 'text-red-400',
  };
  return map[strength];
}

function signalLabel(strength: SignalStrength): string {
  const map: Record<SignalStrength, string> = {
    strong_buy: 'Strong Buy',
    buy: 'Buy',
    neutral: 'Neutral',
    sell: 'Sell',
    strong_sell: 'Strong Sell',
  };
  return map[strength];
}

// ── Public API ───────────────────────────────────────────────────────────────────

/** Ranked influencers by price impact, optionally filtered by card category */
export function getTopInfluencers(category?: CardCategory): Influencer[] {
  let list = INFLUENCERS.filter(i => i.isActive);
  if (category) {
    list = list.filter(i => i.categories.includes(category));
  }
  return list.sort((a, b) => b.avgPriceImpactPct - a.avgPriceImpactPct);
}

/** Detailed historical impact data for a single influencer */
export function getInfluencerImpact(influencerId: string): InfluencerImpact | null {
  const influencer = INFLUENCERS.find(i => i.id === influencerId);
  if (!influencer) return null;

  const recentMentions = MOCK_MENTIONS
    .filter(m => m.influencerId === influencerId)
    .sort((a, b) => new Date(b.mentionDate).getTime() - new Date(a.mentionDate).getTime());

  const impactDistribution = [
    { range: '0-5%', count: Math.floor(influencer.totalMentions * 0.25) },
    { range: '5-10%', count: Math.floor(influencer.totalMentions * 0.30) },
    { range: '10-20%', count: Math.floor(influencer.totalMentions * 0.25) },
    { range: '20-50%', count: Math.floor(influencer.totalMentions * 0.15) },
    { range: '50%+', count: Math.floor(influencer.totalMentions * 0.05) },
  ];

  return {
    influencer,
    recentMentions,
    impactDistribution,
    bestCall: { cardName: '2023 Prizm Silver Wembanyama RC', impactPct: influencer.avgPriceImpactPct * 2.8, date: '2025-11-14' },
    worstCall: { cardName: '2022 Topps Chrome Julio Rodriguez', impactPct: -(influencer.avgPriceImpactPct * 0.6), date: '2025-08-22' },
    avgHoldPeriodHours: influencer.avgTimeToRevertHours * 0.65,
    winRate: influencer.reliability * 0.85 + 10,
  };
}

/** Timeline of social mentions correlated with price movements for a card */
export function getMentionTimeline(cardId: string): InfluenceMention[] {
  return MOCK_MENTIONS
    .filter(m => m.cardId === cardId)
    .sort((a, b) => new Date(a.mentionDate).getTime() - new Date(b.mentionDate).getTime());
}

/** Predicts how long a price spike will last and when reversion begins */
export function getHypeDecayPrediction(mentionId: string): HypeDecayModel | null {
  return MOCK_HYPE_DECAYS.find(h => h.mentionId === mentionId) ?? null;
}

/** All active hype decay predictions */
export function getAllHypeDecayPredictions(): HypeDecayModel[] {
  return MOCK_HYPE_DECAYS;
}

/** Which cards in portfolio are currently being discussed by influencers */
export function getPortfolioInfluenceExposure(
  inventory: { id: string; player: string; currentValue?: number }[]
): PortfolioExposure[] {
  const _cardPlayerMap = new Map(inventory.map(c => [c.id, c]));
  const exposures: PortfolioExposure[] = [];

  // Match mentions to portfolio by checking card names against player names
  for (const card of inventory) {
    const matchingMentions = MOCK_MENTIONS.filter(m => {
      const cardLower = m.cardName.toLowerCase();
      const playerLower = card.player.toLowerCase();
      const playerParts = playerLower.split(' ');
      return playerParts.some(part => part.length > 2 && cardLower.includes(part));
    });

    const influencers = matchingMentions.map(m => ({
      name: m.influencerName,
      platform: m.platform,
      sentiment: m.sentiment,
    }));

    const exposureLevel: PortfolioExposure['exposureLevel'] =
      matchingMentions.length >= 3 ? 'high' :
      matchingMentions.length >= 1 ? 'medium' :
      'none';

    const avgImpact = matchingMentions.length > 0
      ? matchingMentions.reduce((sum, m) => sum + ((m.pricePeak - m.priceAtMention) / m.priceAtMention * 100), 0) / matchingMentions.length
      : 0;

    exposures.push({
      cardId: card.id,
      cardName: card.player,
      currentValue: card.currentValue ?? 0,
      activeMentions: matchingMentions.length,
      influencers,
      exposureLevel,
      predictedImpactRange: {
        low: Math.round(avgImpact * 0.5 * 10) / 10,
        high: Math.round(avgImpact * 1.5 * 10) / 10,
      },
    });
  }

  return exposures.sort((a, b) => b.activeMentions - a.activeMentions);
}

/** Alerts when high-impact influencer mentions a portfolio card */
export function getInfluencerAlerts(
  inventory: { id: string; player: string }[]
): InfluencerAlert[] {
  const alerts: InfluencerAlert[] = [];

  for (const mention of MOCK_MENTIONS) {
    const matchingCard = inventory.find(c => {
      const cardLower = mention.cardName.toLowerCase();
      const playerLower = c.player.toLowerCase();
      const parts = playerLower.split(' ');
      return parts.some(part => part.length > 2 && cardLower.includes(part));
    });

    if (matchingCard) {
      const influencer = INFLUENCERS.find(i => i.id === mention.influencerId);
      if (!influencer) continue;

      const priority: AlertPriority =
        influencer.avgPriceImpactPct >= 15 ? 'critical' :
        influencer.avgPriceImpactPct >= 10 ? 'high' :
        influencer.avgPriceImpactPct >= 6 ? 'medium' :
        'low';

      alerts.push({
        id: `alert-${mention.id}`,
        priority,
        influencerId: mention.influencerId,
        influencerName: mention.influencerName,
        platform: mention.platform,
        cardId: matchingCard.id,
        cardName: mention.cardName,
        message: `${mention.influencerName} (${formatFollowers(influencer.followers)} followers) mentioned ${mention.cardName}. Historical avg impact: +${influencer.avgPriceImpactPct}%`,
        predictedImpact: influencer.avgPriceImpactPct,
        timestamp: mention.mentionDate,
        isRead: false,
      });
    }
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Trending mentions across all platforms with predicted impact */
export function getSocialAlphaSignals(): SocialAlphaSignal[] {
  return MOCK_SIGNALS
    .filter(s => s.isActionable)
    .sort((a, b) => Math.abs(b.predictedImpactPct) - Math.abs(a.predictedImpactPct));
}

/** Breaks down what % of recent price movement was influencer-driven vs fundamentals */
export function getAttributionReport(cardId: string): PriceAttribution | null {
  const mentions = MOCK_MENTIONS.filter(m => m.cardId === cardId);
  if (mentions.length === 0) return null;

  const cardName = mentions[0].cardName;
  const totalPriceChange = mentions.reduce(
    (sum, m) => sum + ((m.priceNow - m.priceAtMention) / m.priceAtMention) * 100, 0
  );

  // Simulate attribution based on influencer reach and engagement
  const totalReach = mentions.reduce((sum, m) => sum + m.reach, 0);
  const influencerDrivenPct = Math.min(85, Math.round(
    mentions.length * 15 + (totalReach > 1_000_000 ? 20 : totalReach > 100_000 ? 10 : 5)
  ));
  const fundamentalDrivenPct = Math.max(10, 100 - influencerDrivenPct - 5);
  const unknownPct = 100 - influencerDrivenPct - fundamentalDrivenPct;

  const topContributors = mentions
    .map(m => ({
      influencerId: m.influencerId,
      influencerName: m.influencerName,
      platform: m.platform,
      contributionPct: Math.round((m.reach / totalReach) * influencerDrivenPct),
      mentionDate: m.mentionDate,
    }))
    .sort((a, b) => b.contributionPct - a.contributionPct);

  return {
    cardId,
    cardName,
    totalPriceChangePct: Math.round(totalPriceChange * 10) / 10,
    influencerDrivenPct,
    fundamentalDrivenPct,
    unknownPct,
    topContributors,
    period: 'last 30 days',
  };
}

/** Get all mention data */
export function getAllMentions(): InfluenceMention[] {
  return [...MOCK_MENTIONS].sort(
    (a, b) => new Date(b.mentionDate).getTime() - new Date(a.mentionDate).getTime()
  );
}

/** Unique card IDs referenced in mentions */
export function getMentionedCardIds(): string[] {
  return [...new Set(MOCK_MENTIONS.map(m => m.cardId))];
}

// Re-export helpers for use in components
export {
  formatFollowers,
  tierColor,
  platformIcon,
  platformColor,
  phaseLabel,
  phaseColor,
  actionLabel,
  actionColor,
  signalColor,
  signalLabel,
};

// Helper functions are exported via the re-export block above
