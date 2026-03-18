// Temporal Arbitrage Radar Service
// Detects time-based arbitrage opportunities across time zones, event windows,
// seasonal patterns, and intraday pricing anomalies in sports card markets.

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ArbitrageType =
  | "timezone"
  | "event-window"
  | "seasonal"
  | "intraday"
  | "day-of-week";

export type RiskLevel = "low" | "medium" | "high";

export type EventType =
  | "game"
  | "trade-deadline"
  | "draft"
  | "free-agency"
  | "injury-report"
  | "earnings"
  | "hall-of-fame";

export interface ArbitrageOpportunity {
  id: string;
  cardName: string;
  player: string;
  type: ArbitrageType;
  currentPrice: number;
  targetPrice: number;
  expectedProfit: number;
  confidence: number; // 0-100
  timeWindow: string;
  expiresAt: Date;
  riskLevel: RiskLevel;
  explanation: string;
}

export interface TypicalPatternPoint {
  hoursBeforeEvent: number;
  priceChangePercent: number;
}

export interface EventWindowAnalysis {
  eventType: EventType;
  eventName: string;
  typicalPattern: TypicalPatternPoint[];
  optimalBuyWindow: string;
  optimalSellWindow: string;
  historicalAccuracy: number;
  nextOccurrence: string;
  avgReturn: number;
  sampleSize: number;
}

export interface SeasonalPattern {
  cardId: string;
  cardName: string;
  player: string;
  monthlyAvgPrices: number[];
  bestBuyMonth: number;
  bestSellMonth: number;
  seasonalSwing: number;
  reliability: number;
}

export interface DayOfWeekEffect {
  day: string;
  avgPriceDelta: number;
}

export interface IntradayPattern {
  cardId: string;
  cardName: string;
  player: string;
  hourlyVolume: number[];
  hourlyAvgPrice: number[];
  peakHour: number;
  valleyHour: number;
  dayOfWeekEffect: DayOfWeekEffect[];
}

export interface TimezoneArbitrage {
  cardId: string;
  cardName: string;
  player: string;
  platform1: string;
  platform2: string;
  price1: number;
  price2: number;
  spread: number;
  timezone1: string;
  timezone2: string;
  convergenceTime: string;
}

export interface CalendarAnomaly {
  name: string;
  period: string;
  affectedCards: string[];
  avgImpact: number;
  explanation: string;
  investmentWindow: string;
}

export interface ArbitragePerformance {
  totalOpportunities: number;
  capturedProfit: number;
  winRate: number;
  avgReturn: number;
  bestTrade: { card: string; profit: number; date: string };
  worstTrade: { card: string; profit: number; date: string };
  monthlyReturns: { month: string; return: number; trades: number }[];
  cumulativeReturn: number[];
}

export interface UpcomingWindow {
  eventName: string;
  eventType: EventType;
  date: string;
  daysUntil: number;
  recommendedAction: string;
  affectedPlayers: string[];
  expectedImpact: number;
}

export interface SimulationResult {
  cardName: string;
  eventType: EventType;
  entryPrice: number;
  projectedExitPrice: number;
  projectedProfit: number;
  projectedReturn: number;
  optimalEntry: string;
  optimalExit: string;
  confidence: number;
  historicalComparisons: { date: string; actualReturn: number }[];
  riskFactors: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function futureDate(hours: number): Date {
  return new Date(Date.now() + hours * 3600_000);
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const ACTIVE_OPPORTUNITIES: ArbitrageOpportunity[] = [
  {
    id: "arb-001",
    cardName: "2023 Bowman Chrome Victor Wembanyama RC Auto /99",
    player: "Victor Wembanyama",
    type: "event-window",
    currentPrice: 4850,
    targetPrice: 5620,
    expectedProfit: 770,
    confidence: 87,
    timeWindow: "Pre-NBA Playoff seeding lock",
    expiresAt: futureDate(36),
    riskLevel: "low",
    explanation:
      "Spurs playoff positioning triggers 12-18% price surge in Wembanyama RCs historically. Buy window closes in 36 hours as seeding crystallizes.",
  },
  {
    id: "arb-002",
    cardName: "2024 Topps Chrome Elly De La Cruz RC PSA 10",
    player: "Elly De La Cruz",
    type: "seasonal",
    currentPrice: 285,
    targetPrice: 390,
    expectedProfit: 105,
    confidence: 79,
    timeWindow: "MLB Spring Training lull ending",
    expiresAt: futureDate(168),
    riskLevel: "low",
    explanation:
      "March is historically the cheapest month for young MLB star RCs. Prices climb 25-40% from March trough to Opening Day peak in early April.",
  },
  {
    id: "arb-003",
    cardName: "2020 Panini Prizm Justin Herbert RC Silver",
    player: "Justin Herbert",
    type: "intraday",
    currentPrice: 172,
    targetPrice: 198,
    expectedProfit: 26,
    confidence: 72,
    timeWindow: "Tuesday morning dip pattern",
    expiresAt: futureDate(8),
    riskLevel: "medium",
    explanation:
      "Herbert Prizm Silver consistently dips 12-15% on Tuesday mornings (low volume) before recovering by Thursday evening auction closings.",
  },
  {
    id: "arb-004",
    cardName: "2023 Topps Series 1 Corbin Carroll RC #1",
    player: "Corbin Carroll",
    type: "timezone",
    currentPrice: 42,
    targetPrice: 51,
    expectedProfit: 9,
    confidence: 68,
    timeWindow: "Japan market overnight premium",
    expiresAt: futureDate(6),
    riskLevel: "medium",
    explanation:
      "Japanese collectors on Yahoo Auctions JP consistently pay 15-22% more for Topps baseball RCs during JST evening hours. Spread narrows by US morning.",
  },
  {
    id: "arb-005",
    cardName: "2024 Panini Prizm Caleb Williams RC Orange /49",
    player: "Caleb Williams",
    type: "event-window",
    currentPrice: 620,
    targetPrice: 845,
    expectedProfit: 225,
    confidence: 91,
    timeWindow: "Pre-NFL Draft Year 2 buzz",
    expiresAt: futureDate(720),
    riskLevel: "low",
    explanation:
      "Sophomore QBs with strong first seasons see 30-45% RC price appreciation in the 6 weeks before the next NFL Draft as media coverage peaks.",
  },
  {
    id: "arb-006",
    cardName: "2022 Topps Chrome Julio Rodriguez RC Auto PSA 10",
    player: "Julio Rodriguez",
    type: "day-of-week",
    currentPrice: 1450,
    targetPrice: 1640,
    expectedProfit: 190,
    confidence: 74,
    timeWindow: "Sunday card show discount",
    expiresAt: futureDate(48),
    riskLevel: "medium",
    explanation:
      "High-end J-Rod autos reliably dip 10-13% on Sunday evenings as card show dealers liquidate weekend inventory at reduced BIN prices.",
  },
  {
    id: "arb-007",
    cardName: "2023 Panini Donruss Jahmyr Gibbs RC Rated Rookie",
    player: "Jahmyr Gibbs",
    type: "event-window",
    currentPrice: 18,
    targetPrice: 24,
    expectedProfit: 6,
    confidence: 82,
    timeWindow: "Pre-Fantasy Draft season ramp",
    expiresAt: futureDate(2160),
    riskLevel: "low",
    explanation:
      "RB RCs for young pass-catching backs appreciate 25-35% between March and August as fantasy draft prep content drives retail demand.",
  },
  {
    id: "arb-008",
    cardName: "2024 Topps Chrome Shohei Ohtani #1 PSA 10",
    player: "Shohei Ohtani",
    type: "timezone",
    currentPrice: 195,
    targetPrice: 238,
    expectedProfit: 43,
    confidence: 85,
    timeWindow: "JPY/USD FX + Japan evening demand",
    expiresAt: futureDate(10),
    riskLevel: "low",
    explanation:
      "Ohtani cards command a consistent 18-25% premium on Japanese platforms during JPY weakness periods. Current JPY dip amplifies the spread.",
  },
  {
    id: "arb-009",
    cardName: "2019 Panini Prizm Zion Williamson RC Silver",
    player: "Zion Williamson",
    type: "seasonal",
    currentPrice: 310,
    targetPrice: 425,
    expectedProfit: 115,
    confidence: 65,
    timeWindow: "NBA Playoff media cycle lift",
    expiresAt: futureDate(480),
    riskLevel: "high",
    explanation:
      "Zion RCs historically spike during NBA Playoffs even when he's injured, as highlight reels and 'what if' narratives drive speculative buying.",
  },
  {
    id: "arb-010",
    cardName: "2024 Bowman 1st Chrome Roki Sasaki Auto",
    player: "Roki Sasaki",
    type: "event-window",
    currentPrice: 2200,
    targetPrice: 2860,
    expectedProfit: 660,
    confidence: 88,
    timeWindow: "MLB season debut anticipation",
    expiresAt: futureDate(240),
    riskLevel: "medium",
    explanation:
      "International pitching phenoms see 25-35% price spikes in the 10 days before their scheduled MLB debut. Sasaki debut is imminent.",
  },
  {
    id: "arb-011",
    cardName: "2023 Topps Chrome Caitlin Clark Rookie",
    player: "Caitlin Clark",
    type: "intraday",
    currentPrice: 88,
    targetPrice: 104,
    expectedProfit: 16,
    confidence: 76,
    timeWindow: "Late night listing underpricing",
    expiresAt: futureDate(5),
    riskLevel: "medium",
    explanation:
      "Clark RCs listed between 11PM-2AM EST sell 14-19% below daytime median. Snipe listings during this low-competition window.",
  },
  {
    id: "arb-012",
    cardName: "2022 Panini Prizm Paolo Banchero RC Silver",
    player: "Paolo Banchero",
    type: "day-of-week",
    currentPrice: 145,
    targetPrice: 168,
    expectedProfit: 23,
    confidence: 71,
    timeWindow: "Monday post-weekend correction",
    expiresAt: futureDate(24),
    riskLevel: "medium",
    explanation:
      "NBA RC Prizm Silvers dip Monday mornings as weekend auction winners relist duplicates. Recovery by Wednesday is consistent at 12-16%.",
  },
  {
    id: "arb-013",
    cardName: "2024 Topps Series 1 Paul Skenes RC",
    player: "Paul Skenes",
    type: "seasonal",
    currentPrice: 32,
    targetPrice: 48,
    expectedProfit: 16,
    confidence: 80,
    timeWindow: "Pre-All-Star Game breakout window",
    expiresAt: futureDate(1440),
    riskLevel: "low",
    explanation:
      "Elite young pitcher RCs climb 35-55% between March and the All-Star break as Cy Young narrative builds. Skenes is a prime candidate.",
  },
  {
    id: "arb-014",
    cardName: "2023 Panini Prizm Tyrese Maxey RC Shimmer",
    player: "Tyrese Maxey",
    type: "event-window",
    currentPrice: 92,
    targetPrice: 118,
    expectedProfit: 26,
    confidence: 83,
    timeWindow: "NBA Playoff first round surge",
    expiresAt: futureDate(360),
    riskLevel: "low",
    explanation:
      "76ers contender status means Maxey RCs spike 22-30% when playoff bracket is set. Buy before clinching, sell after Round 1 Game 1.",
  },
  {
    id: "arb-015",
    cardName: "2023 Topps Chrome Gunnar Henderson RC PSA 10",
    player: "Gunnar Henderson",
    type: "timezone",
    currentPrice: 165,
    targetPrice: 192,
    expectedProfit: 27,
    confidence: 70,
    timeWindow: "UK/Europe morning market gap",
    expiresAt: futureDate(12),
    riskLevel: "medium",
    explanation:
      "European collectors on CardMarket pay 14-18% more for graded Topps Chrome during GMT morning hours. Spread closes by US market open.",
  },
  {
    id: "arb-016",
    cardName: "2024 Panini Prizm Jayden Daniels RC Silver",
    player: "Jayden Daniels",
    type: "seasonal",
    currentPrice: 78,
    targetPrice: 105,
    expectedProfit: 27,
    confidence: 77,
    timeWindow: "NFL offseason trough to OTA buzz",
    expiresAt: futureDate(960),
    riskLevel: "low",
    explanation:
      "March is the annual nadir for NFL QB RCs. Prices climb 30-40% from now through OTAs and minicamp highlights in May-June.",
  },
  {
    id: "arb-017",
    cardName: "2020 Topps Chrome Luis Robert RC PSA 10",
    player: "Luis Robert Jr.",
    type: "intraday",
    currentPrice: 88,
    targetPrice: 99,
    expectedProfit: 11,
    confidence: 69,
    timeWindow: "Pre-auction close rush",
    expiresAt: futureDate(4),
    riskLevel: "medium",
    explanation:
      "Robert Chrome RCs see a 10-14% price bump in the final 2 hours before Sunday 7PM EST auction closes as snipers compete.",
  },
  {
    id: "arb-018",
    cardName: "2023 Topps Chrome Adley Rutschman RC Auto /25",
    player: "Adley Rutschman",
    type: "event-window",
    currentPrice: 520,
    targetPrice: 640,
    expectedProfit: 120,
    confidence: 81,
    timeWindow: "Spring Training breakout stats",
    expiresAt: futureDate(120),
    riskLevel: "medium",
    explanation:
      "Elite catchers with strong ST numbers see 18-25% RC price bumps before Opening Day. Rutschman is slashing .380/.450/.620 this spring.",
  },
  {
    id: "arb-019",
    cardName: "2024 Bowman Chrome Travis Hunter RC 1st Auto",
    player: "Travis Hunter",
    type: "event-window",
    currentPrice: 3400,
    targetPrice: 4500,
    expectedProfit: 1100,
    confidence: 93,
    timeWindow: "Pre-NFL Draft combine buzz",
    expiresAt: futureDate(96),
    riskLevel: "low",
    explanation:
      "Two-way players generate unprecedented draft hype. Hunter's Bowman 1st Autos will spike 25-35% as draft coverage intensifies.",
  },
  {
    id: "arb-020",
    cardName: "2023 Panini Prizm Anthony Richardson RC Green",
    player: "Anthony Richardson",
    type: "day-of-week",
    currentPrice: 34,
    targetPrice: 41,
    expectedProfit: 7,
    confidence: 66,
    timeWindow: "Wednesday inventory refresh dip",
    expiresAt: futureDate(72),
    riskLevel: "high",
    explanation:
      "Breakers flood eBay with NFL Prizm singles on Wednesdays after Tuesday night case breaks. Prices recover by Friday as supply absorbs.",
  },
  {
    id: "arb-021",
    cardName: "2024 Topps Chrome Jackson Holliday RC PSA 10",
    player: "Jackson Holliday",
    type: "seasonal",
    currentPrice: 52,
    targetPrice: 72,
    expectedProfit: 20,
    confidence: 75,
    timeWindow: "Call-up speculation window",
    expiresAt: futureDate(600),
    riskLevel: "medium",
    explanation:
      "Top MLB prospects see 30-45% RC price surges in the weeks preceding anticipated call-up dates. Holliday's AAA stats are elite.",
  },
  {
    id: "arb-022",
    cardName: "2023 Panini Prizm Luka Doncic Silver",
    player: "Luka Doncic",
    type: "timezone",
    currentPrice: 420,
    targetPrice: 490,
    expectedProfit: 70,
    confidence: 78,
    timeWindow: "European Champions League overlap",
    expiresAt: futureDate(14),
    riskLevel: "low",
    explanation:
      "Slovenian/European collectors drive Doncic prices up 14-18% during UCL match days when European sports engagement peaks.",
  },
];

const EVENT_WINDOW_ANALYSES: EventWindowAnalysis[] = [
  {
    eventType: "draft",
    eventName: "NFL Draft",
    typicalPattern: [
      { hoursBeforeEvent: 720, priceChangePercent: 0 },
      { hoursBeforeEvent: 480, priceChangePercent: 5 },
      { hoursBeforeEvent: 336, priceChangePercent: 12 },
      { hoursBeforeEvent: 168, priceChangePercent: 22 },
      { hoursBeforeEvent: 72, priceChangePercent: 35 },
      { hoursBeforeEvent: 24, priceChangePercent: 42 },
      { hoursBeforeEvent: 0, priceChangePercent: 48 },
      { hoursBeforeEvent: -24, priceChangePercent: 38 },
      { hoursBeforeEvent: -72, priceChangePercent: 25 },
      { hoursBeforeEvent: -168, priceChangePercent: 18 },
    ],
    optimalBuyWindow: "30+ days before draft",
    optimalSellWindow: "Day of draft or 1 day before Round 1",
    historicalAccuracy: 84,
    nextOccurrence: "2026-04-23",
    avgReturn: 32,
    sampleSize: 156,
  },
  {
    eventType: "trade-deadline",
    eventName: "NBA Trade Deadline",
    typicalPattern: [
      { hoursBeforeEvent: 336, priceChangePercent: 0 },
      { hoursBeforeEvent: 168, priceChangePercent: 8 },
      { hoursBeforeEvent: 72, priceChangePercent: 18 },
      { hoursBeforeEvent: 24, priceChangePercent: 28 },
      { hoursBeforeEvent: 4, priceChangePercent: 35 },
      { hoursBeforeEvent: 0, priceChangePercent: 40 },
      { hoursBeforeEvent: -4, priceChangePercent: -5 },
      { hoursBeforeEvent: -24, priceChangePercent: -12 },
      { hoursBeforeEvent: -72, priceChangePercent: -8 },
      { hoursBeforeEvent: -168, priceChangePercent: 2 },
    ],
    optimalBuyWindow: "14+ days before deadline",
    optimalSellWindow: "4-0 hours before deadline closes",
    historicalAccuracy: 78,
    nextOccurrence: "2027-02-10",
    avgReturn: 26,
    sampleSize: 89,
  },
  {
    eventType: "game",
    eventName: "Monday Night Football Effect",
    typicalPattern: [
      { hoursBeforeEvent: 48, priceChangePercent: 0 },
      { hoursBeforeEvent: 24, priceChangePercent: 3 },
      { hoursBeforeEvent: 6, priceChangePercent: 8 },
      { hoursBeforeEvent: 2, priceChangePercent: 12 },
      { hoursBeforeEvent: 0, priceChangePercent: 15 },
      { hoursBeforeEvent: -1, priceChangePercent: 22 },
      { hoursBeforeEvent: -3, priceChangePercent: 18 },
      { hoursBeforeEvent: -12, priceChangePercent: 10 },
      { hoursBeforeEvent: -24, priceChangePercent: 5 },
      { hoursBeforeEvent: -48, priceChangePercent: 1 },
    ],
    optimalBuyWindow: "48 hours before MNF kickoff",
    optimalSellWindow: "During halftime or immediately after big plays",
    historicalAccuracy: 71,
    nextOccurrence: "2026-09-14",
    avgReturn: 14,
    sampleSize: 320,
  },
  {
    eventType: "game",
    eventName: "MLB Opening Day",
    typicalPattern: [
      { hoursBeforeEvent: 720, priceChangePercent: 0 },
      { hoursBeforeEvent: 480, priceChangePercent: 8 },
      { hoursBeforeEvent: 336, priceChangePercent: 15 },
      { hoursBeforeEvent: 168, priceChangePercent: 25 },
      { hoursBeforeEvent: 72, priceChangePercent: 32 },
      { hoursBeforeEvent: 24, priceChangePercent: 38 },
      { hoursBeforeEvent: 0, priceChangePercent: 42 },
      { hoursBeforeEvent: -24, priceChangePercent: 35 },
      { hoursBeforeEvent: -168, priceChangePercent: 22 },
      { hoursBeforeEvent: -336, priceChangePercent: 15 },
    ],
    optimalBuyWindow: "January-February (spring training start)",
    optimalSellWindow: "Opening Day through first week of season",
    historicalAccuracy: 82,
    nextOccurrence: "2026-03-26",
    avgReturn: 28,
    sampleSize: 210,
  },
  {
    eventType: "free-agency",
    eventName: "NBA Free Agency",
    typicalPattern: [
      { hoursBeforeEvent: 168, priceChangePercent: 0 },
      { hoursBeforeEvent: 72, priceChangePercent: -5 },
      { hoursBeforeEvent: 24, priceChangePercent: -8 },
      { hoursBeforeEvent: 0, priceChangePercent: 0 },
      { hoursBeforeEvent: -1, priceChangePercent: 45 },
      { hoursBeforeEvent: -4, priceChangePercent: 55 },
      { hoursBeforeEvent: -24, priceChangePercent: 40 },
      { hoursBeforeEvent: -72, priceChangePercent: 30 },
      { hoursBeforeEvent: -168, priceChangePercent: 20 },
      { hoursBeforeEvent: -336, priceChangePercent: 12 },
    ],
    optimalBuyWindow: "1-3 days before free agency opens (uncertainty dip)",
    optimalSellWindow: "1-4 hours after major signing announced",
    historicalAccuracy: 75,
    nextOccurrence: "2026-06-30",
    avgReturn: 38,
    sampleSize: 67,
  },
  {
    eventType: "injury-report",
    eventName: "Injury Report Impact",
    typicalPattern: [
      { hoursBeforeEvent: 0, priceChangePercent: 0 },
      { hoursBeforeEvent: -1, priceChangePercent: -18 },
      { hoursBeforeEvent: -4, priceChangePercent: -25 },
      { hoursBeforeEvent: -24, priceChangePercent: -22 },
      { hoursBeforeEvent: -72, priceChangePercent: -20 },
      { hoursBeforeEvent: -168, priceChangePercent: -15 },
      { hoursBeforeEvent: -336, priceChangePercent: -10 },
      { hoursBeforeEvent: -720, priceChangePercent: -5 },
      { hoursBeforeEvent: -1440, priceChangePercent: 5 },
      { hoursBeforeEvent: -2160, priceChangePercent: 12 },
    ],
    optimalBuyWindow: "24-72 hours after major injury (panic selling overshoots)",
    optimalSellWindow: "Upon return-to-play announcement or strong rehab updates",
    historicalAccuracy: 80,
    nextOccurrence: "Unpredictable",
    avgReturn: 22,
    sampleSize: 145,
  },
  {
    eventType: "hall-of-fame",
    eventName: "Hall of Fame Announcement",
    typicalPattern: [
      { hoursBeforeEvent: 720, priceChangePercent: 0 },
      { hoursBeforeEvent: 336, priceChangePercent: 5 },
      { hoursBeforeEvent: 168, priceChangePercent: 12 },
      { hoursBeforeEvent: 72, priceChangePercent: 20 },
      { hoursBeforeEvent: 24, priceChangePercent: 28 },
      { hoursBeforeEvent: 0, priceChangePercent: 55 },
      { hoursBeforeEvent: -24, priceChangePercent: 48 },
      { hoursBeforeEvent: -168, priceChangePercent: 40 },
      { hoursBeforeEvent: -720, priceChangePercent: 35 },
      { hoursBeforeEvent: -2160, priceChangePercent: 30 },
    ],
    optimalBuyWindow: "When HOF candidacy is first rumored / ballot released",
    optimalSellWindow: "Day of official announcement",
    historicalAccuracy: 88,
    nextOccurrence: "2026-07-26",
    avgReturn: 45,
    sampleSize: 42,
  },
  {
    eventType: "draft",
    eventName: "MLB Amateur Draft",
    typicalPattern: [
      { hoursBeforeEvent: 720, priceChangePercent: 0 },
      { hoursBeforeEvent: 480, priceChangePercent: 3 },
      { hoursBeforeEvent: 336, priceChangePercent: 8 },
      { hoursBeforeEvent: 168, priceChangePercent: 15 },
      { hoursBeforeEvent: 72, priceChangePercent: 22 },
      { hoursBeforeEvent: 24, priceChangePercent: 28 },
      { hoursBeforeEvent: 0, priceChangePercent: 30 },
      { hoursBeforeEvent: -24, priceChangePercent: 20 },
      { hoursBeforeEvent: -168, priceChangePercent: 12 },
      { hoursBeforeEvent: -720, priceChangePercent: 8 },
    ],
    optimalBuyWindow: "30+ days before draft (Bowman 1st products)",
    optimalSellWindow: "Draft night when pick is announced",
    historicalAccuracy: 76,
    nextOccurrence: "2026-07-12",
    avgReturn: 24,
    sampleSize: 98,
  },
  {
    eventType: "game",
    eventName: "NHL Playoff Series",
    typicalPattern: [
      { hoursBeforeEvent: 336, priceChangePercent: 0 },
      { hoursBeforeEvent: 168, priceChangePercent: 5 },
      { hoursBeforeEvent: 72, priceChangePercent: 10 },
      { hoursBeforeEvent: 24, priceChangePercent: 15 },
      { hoursBeforeEvent: 0, priceChangePercent: 18 },
      { hoursBeforeEvent: -24, priceChangePercent: 25 },
      { hoursBeforeEvent: -72, priceChangePercent: 30 },
      { hoursBeforeEvent: -168, priceChangePercent: 22 },
      { hoursBeforeEvent: -336, priceChangePercent: 15 },
      { hoursBeforeEvent: -720, priceChangePercent: 8 },
    ],
    optimalBuyWindow: "2+ weeks before playoffs begin",
    optimalSellWindow: "After a series-clinching win in Rounds 1-2",
    historicalAccuracy: 73,
    nextOccurrence: "2026-04-15",
    avgReturn: 20,
    sampleSize: 115,
  },
  {
    eventType: "game",
    eventName: "World Cup / International Tournament",
    typicalPattern: [
      { hoursBeforeEvent: 2160, priceChangePercent: 0 },
      { hoursBeforeEvent: 1440, priceChangePercent: 10 },
      { hoursBeforeEvent: 720, priceChangePercent: 25 },
      { hoursBeforeEvent: 336, priceChangePercent: 40 },
      { hoursBeforeEvent: 168, priceChangePercent: 55 },
      { hoursBeforeEvent: 0, priceChangePercent: 70 },
      { hoursBeforeEvent: -168, priceChangePercent: 60 },
      { hoursBeforeEvent: -336, priceChangePercent: 45 },
      { hoursBeforeEvent: -720, priceChangePercent: 30 },
      { hoursBeforeEvent: -2160, priceChangePercent: 15 },
    ],
    optimalBuyWindow: "3+ months before tournament starts",
    optimalSellWindow: "Opening match day through group stage",
    historicalAccuracy: 86,
    nextOccurrence: "2026-06-11",
    avgReturn: 52,
    sampleSize: 35,
  },
];

const SEASONAL_PATTERNS: SeasonalPattern[] = [
  {
    cardId: "sp-001",
    cardName: "2023 Bowman Chrome Victor Wembanyama RC",
    player: "Victor Wembanyama",
    monthlyAvgPrices: [4200, 3950, 3800, 4100, 4400, 4600, 4300, 4100, 4000, 4500, 4800, 5200],
    bestBuyMonth: 2,
    bestSellMonth: 11,
    seasonalSwing: 36.8,
    reliability: 72,
  },
  {
    cardId: "sp-002",
    cardName: "2024 Topps Chrome Elly De La Cruz RC",
    player: "Elly De La Cruz",
    monthlyAvgPrices: [260, 245, 230, 310, 340, 380, 410, 390, 360, 320, 280, 255],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 78.3,
    reliability: 85,
  },
  {
    cardId: "sp-003",
    cardName: "2020 Panini Prizm Justin Herbert RC",
    player: "Justin Herbert",
    monthlyAvgPrices: [185, 178, 170, 165, 160, 155, 150, 162, 195, 210, 225, 205],
    bestBuyMonth: 6,
    bestSellMonth: 10,
    seasonalSwing: 50.0,
    reliability: 88,
  },
  {
    cardId: "sp-004",
    cardName: "2023 Topps Chrome Corbin Carroll RC",
    player: "Corbin Carroll",
    monthlyAvgPrices: [38, 35, 33, 45, 52, 58, 62, 55, 48, 42, 37, 36],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 87.9,
    reliability: 82,
  },
  {
    cardId: "sp-005",
    cardName: "2024 Panini Prizm Caleb Williams RC",
    player: "Caleb Williams",
    monthlyAvgPrices: [580, 560, 540, 620, 700, 650, 620, 680, 750, 810, 780, 640],
    bestBuyMonth: 2,
    bestSellMonth: 10,
    seasonalSwing: 50.0,
    reliability: 70,
  },
  {
    cardId: "sp-006",
    cardName: "2022 Topps Chrome Julio Rodriguez RC Auto",
    player: "Julio Rodriguez",
    monthlyAvgPrices: [1380, 1320, 1280, 1520, 1640, 1750, 1820, 1700, 1580, 1450, 1360, 1340],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 42.2,
    reliability: 86,
  },
  {
    cardId: "sp-007",
    cardName: "2023 Panini Prizm Tyrese Maxey RC",
    player: "Tyrese Maxey",
    monthlyAvgPrices: [82, 78, 75, 88, 95, 105, 98, 85, 80, 92, 100, 110],
    bestBuyMonth: 2,
    bestSellMonth: 5,
    seasonalSwing: 46.7,
    reliability: 74,
  },
  {
    cardId: "sp-008",
    cardName: "2024 Topps Chrome Paul Skenes RC",
    player: "Paul Skenes",
    monthlyAvgPrices: [28, 26, 25, 35, 42, 52, 58, 55, 48, 38, 30, 27],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 132.0,
    reliability: 78,
  },
  {
    cardId: "sp-009",
    cardName: "2024 Panini Prizm Jayden Daniels RC",
    player: "Jayden Daniels",
    monthlyAvgPrices: [72, 68, 65, 75, 82, 78, 72, 85, 98, 115, 108, 82],
    bestBuyMonth: 2,
    bestSellMonth: 9,
    seasonalSwing: 76.9,
    reliability: 71,
  },
  {
    cardId: "sp-010",
    cardName: "2019 Panini Prizm Zion Williamson RC",
    player: "Zion Williamson",
    monthlyAvgPrices: [320, 305, 290, 340, 370, 360, 345, 330, 315, 355, 380, 400],
    bestBuyMonth: 2,
    bestSellMonth: 10,
    seasonalSwing: 37.9,
    reliability: 68,
  },
  {
    cardId: "sp-011",
    cardName: "2024 Bowman Chrome Roki Sasaki Auto",
    player: "Roki Sasaki",
    monthlyAvgPrices: [1950, 1880, 1820, 2300, 2500, 2650, 2800, 2600, 2400, 2100, 1980, 1920],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 53.8,
    reliability: 76,
  },
  {
    cardId: "sp-012",
    cardName: "2023 Topps Chrome Caitlin Clark RC",
    player: "Caitlin Clark",
    monthlyAvgPrices: [95, 88, 82, 78, 92, 105, 115, 108, 98, 85, 80, 90],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 47.4,
    reliability: 65,
  },
  {
    cardId: "sp-013",
    cardName: "2022 Panini Prizm Paolo Banchero RC",
    player: "Paolo Banchero",
    monthlyAvgPrices: [135, 128, 122, 145, 158, 165, 155, 140, 132, 150, 168, 175],
    bestBuyMonth: 2,
    bestSellMonth: 11,
    seasonalSwing: 43.4,
    reliability: 73,
  },
  {
    cardId: "sp-014",
    cardName: "2024 Bowman Chrome Travis Hunter RC",
    player: "Travis Hunter",
    monthlyAvgPrices: [3100, 2950, 2850, 3400, 3600, 3200, 3000, 3100, 3500, 3800, 3650, 3200],
    bestBuyMonth: 2,
    bestSellMonth: 9,
    seasonalSwing: 33.3,
    reliability: 67,
  },
  {
    cardId: "sp-015",
    cardName: "2024 Topps Chrome Jackson Holliday RC",
    player: "Jackson Holliday",
    monthlyAvgPrices: [48, 44, 42, 58, 68, 78, 82, 75, 65, 55, 48, 45],
    bestBuyMonth: 2,
    bestSellMonth: 6,
    seasonalSwing: 95.2,
    reliability: 80,
  },
];

const INTRADAY_PATTERNS: IntradayPattern[] = [
  {
    cardId: "id-001",
    cardName: "2023 Bowman Chrome Victor Wembanyama RC",
    player: "Victor Wembanyama",
    hourlyVolume: [
      12, 8, 5, 3, 2, 4, 8, 15, 28, 42, 55, 62, 58, 52, 48, 45, 50, 55, 62, 68, 72, 65, 45, 25,
    ],
    hourlyAvgPrice: [
      3780, 3720, 3690, 3680, 3670, 3685, 3720, 3760, 3810, 3850, 3880, 3920, 3940, 3930, 3910,
      3890, 3900, 3920, 3950, 3980, 4010, 3990, 3950, 3880,
    ],
    peakHour: 20,
    valleyHour: 4,
    dayOfWeekEffect: [
      { day: "Monday", avgPriceDelta: -3.2 },
      { day: "Tuesday", avgPriceDelta: -1.8 },
      { day: "Wednesday", avgPriceDelta: -0.5 },
      { day: "Thursday", avgPriceDelta: 1.2 },
      { day: "Friday", avgPriceDelta: 2.8 },
      { day: "Saturday", avgPriceDelta: 3.5 },
      { day: "Sunday", avgPriceDelta: -2.0 },
    ],
  },
  {
    cardId: "id-002",
    cardName: "2024 Topps Chrome Elly De La Cruz RC",
    player: "Elly De La Cruz",
    hourlyVolume: [
      8, 5, 3, 2, 1, 3, 6, 12, 22, 35, 48, 55, 52, 45, 40, 38, 42, 48, 55, 60, 58, 50, 35, 18,
    ],
    hourlyAvgPrice: [
      275, 268, 262, 258, 255, 260, 268, 278, 288, 295, 302, 310, 308, 305, 300, 295, 298, 305,
      312, 318, 315, 308, 295, 282,
    ],
    peakHour: 19,
    valleyHour: 4,
    dayOfWeekEffect: [
      { day: "Monday", avgPriceDelta: -2.5 },
      { day: "Tuesday", avgPriceDelta: -1.2 },
      { day: "Wednesday", avgPriceDelta: 0.8 },
      { day: "Thursday", avgPriceDelta: 1.5 },
      { day: "Friday", avgPriceDelta: 2.2 },
      { day: "Saturday", avgPriceDelta: 1.8 },
      { day: "Sunday", avgPriceDelta: -2.6 },
    ],
  },
  {
    cardId: "id-003",
    cardName: "2020 Panini Prizm Justin Herbert RC",
    player: "Justin Herbert",
    hourlyVolume: [
      10, 6, 4, 2, 2, 3, 7, 14, 25, 38, 50, 58, 55, 48, 42, 40, 45, 52, 60, 65, 62, 55, 40, 22,
    ],
    hourlyAvgPrice: [
      168, 162, 158, 155, 152, 156, 162, 170, 178, 185, 190, 195, 193, 190, 186, 182, 185, 190,
      196, 200, 198, 192, 182, 172,
    ],
    peakHour: 19,
    valleyHour: 4,
    dayOfWeekEffect: [
      { day: "Monday", avgPriceDelta: -4.1 },
      { day: "Tuesday", avgPriceDelta: -2.8 },
      { day: "Wednesday", avgPriceDelta: -0.2 },
      { day: "Thursday", avgPriceDelta: 1.5 },
      { day: "Friday", avgPriceDelta: 3.2 },
      { day: "Saturday", avgPriceDelta: 4.0 },
      { day: "Sunday", avgPriceDelta: -1.6 },
    ],
  },
];

const TIMEZONE_ARBITRAGES: TimezoneArbitrage[] = [
  {
    cardId: "tz-001",
    cardName: "2024 Topps Chrome Shohei Ohtani #1",
    player: "Shohei Ohtani",
    platform1: "eBay US",
    platform2: "Yahoo Auctions JP",
    price1: 195,
    price2: 238,
    spread: 22.1,
    timezone1: "America/New_York",
    timezone2: "Asia/Tokyo",
    convergenceTime: "10 hours (US morning open)",
  },
  {
    cardId: "tz-002",
    cardName: "2023 Topps Series 1 Corbin Carroll RC",
    player: "Corbin Carroll",
    platform1: "eBay US",
    platform2: "Yahoo Auctions JP",
    price1: 42,
    price2: 51,
    spread: 21.4,
    timezone1: "America/New_York",
    timezone2: "Asia/Tokyo",
    convergenceTime: "8 hours",
  },
  {
    cardId: "tz-003",
    cardName: "2023 Topps Chrome Gunnar Henderson RC",
    player: "Gunnar Henderson",
    platform1: "eBay US",
    platform2: "CardMarket EU",
    price1: 165,
    price2: 192,
    spread: 16.4,
    timezone1: "America/New_York",
    timezone2: "Europe/London",
    convergenceTime: "6 hours",
  },
  {
    cardId: "tz-004",
    cardName: "2023 Panini Prizm Luka Doncic Silver",
    player: "Luka Doncic",
    platform1: "eBay US",
    platform2: "CardMarket EU",
    price1: 420,
    price2: 490,
    spread: 16.7,
    timezone1: "America/New_York",
    timezone2: "Europe/Berlin",
    convergenceTime: "5 hours",
  },
  {
    cardId: "tz-005",
    cardName: "2024 Topps Chrome Paul Skenes RC",
    player: "Paul Skenes",
    platform1: "eBay US",
    platform2: "COMC",
    price1: 32,
    price2: 28,
    spread: 14.3,
    timezone1: "America/New_York",
    timezone2: "America/Los_Angeles",
    convergenceTime: "3 hours (West Coast wakes up)",
  },
  {
    cardId: "tz-006",
    cardName: "2024 Bowman Chrome Roki Sasaki Auto",
    player: "Roki Sasaki",
    platform1: "eBay US",
    platform2: "Mercari JP",
    price1: 2200,
    price2: 2680,
    spread: 21.8,
    timezone1: "America/New_York",
    timezone2: "Asia/Tokyo",
    convergenceTime: "12 hours",
  },
  {
    cardId: "tz-007",
    cardName: "2023 Panini Prizm Victor Wembanyama RC",
    player: "Victor Wembanyama",
    platform1: "eBay US",
    platform2: "Cardex FR",
    price1: 4850,
    price2: 5450,
    spread: 12.4,
    timezone1: "America/New_York",
    timezone2: "Europe/Paris",
    convergenceTime: "7 hours",
  },
];

const CALENDAR_ANOMALIES: CalendarAnomaly[] = [
  {
    name: "Tax Refund Season Surge",
    period: "February 15 - April 15",
    affectedCards: [
      "All high-end RCs",
      "Graded vintage",
      "Auto parallels",
    ],
    avgImpact: 18.5,
    explanation:
      "Tax refund deposits drive disposable income into hobby purchases. Prices inflate 15-22% as buyers flood the market with refund cash.",
    investmentWindow: "Buy January, sell March-April",
  },
  {
    name: "Black Friday / Cyber Monday Dip",
    period: "November 22 - December 2",
    affectedCards: [
      "Retail product singles",
      "Raw ungraded cards",
      "Mid-tier parallels",
    ],
    avgImpact: -14.2,
    explanation:
      "Holiday retail blitz floods market with newly opened product. Supply surge depresses singles prices 12-18% before Christmas recovery.",
    investmentWindow: "Buy Cyber Monday, sell mid-December",
  },
  {
    name: "New Year Liquidation",
    period: "December 26 - January 10",
    affectedCards: [
      "Consigned auction lots",
      "Dealer inventory",
      "Previous year releases",
    ],
    avgImpact: -11.8,
    explanation:
      "Dealers and collectors liquidate before year-end for tax purposes. Post-Christmas cash crunch creates buying opportunities.",
    investmentWindow: "Buy Jan 1-10, hold through tax refund season",
  },
  {
    name: "National Card Show Effect",
    period: "Late July (annual, 5-day event)",
    affectedCards: [
      "Show exclusives",
      "Vintage high-grade",
      "Modern auto parallels",
    ],
    avgImpact: 22.0,
    explanation:
      "The National generates massive media coverage and FOMO buying. Prices peak during the show and correct 10-15% in the following 2 weeks.",
    investmentWindow: "Buy 3 weeks before, sell during show weekend",
  },
  {
    name: "Back-to-School Budget Squeeze",
    period: "August 15 - September 10",
    affectedCards: [
      "Sub-$50 singles",
      "Common parallels",
      "Base rookies",
    ],
    avgImpact: -8.5,
    explanation:
      "Family spending shifts to school supplies and college costs. Casual collectors reduce buying, creating a mild depression in lower-end cards.",
    investmentWindow: "Buy late August, sell when NFL season hype peaks in September",
  },
  {
    name: "Stimulus Check Spike",
    period: "Variable (government dependent)",
    affectedCards: [
      "Wax product",
      "Case breaks",
      "Speculative rookies",
    ],
    avgImpact: 25.0,
    explanation:
      "Economic stimulus payments historically correlate with sharp hobby price increases. The 2021 stimulus drove a 25-40% broad market spike.",
    investmentWindow: "Buy when legislation is announced, sell on distribution day",
  },
  {
    name: "Sunday Card Show Liquidation",
    period: "Every Sunday evening (recurring weekly)",
    affectedCards: [
      "Mid-tier singles $50-500",
      "Graded cards",
      "Regional favorites",
    ],
    avgImpact: -9.2,
    explanation:
      "Local card show dealers list unsold weekend inventory at discount BIN prices Sunday evening. Recovery occurs by Tuesday-Wednesday.",
    investmentWindow: "Buy Sunday 6-10PM EST, sell Wednesday-Thursday",
  },
  {
    name: "Panini Bankruptcy / License Transition",
    period: "2024-2026 transition period",
    affectedCards: [
      "Last Panini NBA/NFL releases",
      "Fanatics 1st editions",
      "Prizm/Select farewell sets",
    ],
    avgImpact: 35.0,
    explanation:
      "Final Panini-licensed products carry 'last of an era' premiums. Simultaneously, Fanatics debut products see speculative buying.",
    investmentWindow: "Buy final Panini releases on opening, hold for nostalgic premium",
  },
];

const ARBITRAGE_PERFORMANCE: ArbitragePerformance = {
  totalOpportunities: 847,
  capturedProfit: 42680,
  winRate: 73.2,
  avgReturn: 14.8,
  bestTrade: {
    card: "2024 Bowman Chrome Travis Hunter RC Auto - Pre-Draft Surge",
    profit: 1850,
    date: "2025-04-24",
  },
  worstTrade: {
    card: "2023 Prizm Zion Williamson RC - Injury Re-aggravation",
    profit: -340,
    date: "2025-11-15",
  },
  monthlyReturns: [
    { month: "2025-04", return: 18.2, trades: 42 },
    { month: "2025-05", return: 12.5, trades: 38 },
    { month: "2025-06", return: 22.1, trades: 55 },
    { month: "2025-07", return: 15.8, trades: 48 },
    { month: "2025-08", return: 8.2, trades: 32 },
    { month: "2025-09", return: 19.5, trades: 61 },
    { month: "2025-10", return: 16.3, trades: 52 },
    { month: "2025-11", return: 11.0, trades: 40 },
    { month: "2025-12", return: 9.8, trades: 35 },
    { month: "2026-01", return: 14.2, trades: 44 },
    { month: "2026-02", return: 17.6, trades: 50 },
    { month: "2026-03", return: 20.1, trades: 58 },
  ],
  cumulativeReturn: [
    18.2, 30.7, 52.8, 68.6, 76.8, 96.3, 112.6, 123.6, 133.4, 147.6, 165.2, 185.3,
  ],
};

const UPCOMING_WINDOWS: UpcomingWindow[] = [
  {
    eventName: "MLB Opening Day 2026",
    eventType: "game",
    date: "2026-03-26",
    daysUntil: 11,
    recommendedAction: "BUY NOW - Last chance for spring training prices",
    affectedPlayers: [
      "Elly De La Cruz",
      "Paul Skenes",
      "Corbin Carroll",
      "Jackson Holliday",
      "Roki Sasaki",
    ],
    expectedImpact: 28,
  },
  {
    eventName: "NFL Draft 2026",
    eventType: "draft",
    date: "2026-04-23",
    daysUntil: 39,
    recommendedAction: "ACCUMULATE - Build positions in draft prospect Bowman 1st cards",
    affectedPlayers: [
      "Travis Hunter",
      "Shedeur Sanders",
      "Cam Ward",
      "Abdul Carter",
      "Tetairoa McMillan",
    ],
    expectedImpact: 35,
  },
  {
    eventName: "NHL Playoffs Begin",
    eventType: "game",
    date: "2026-04-15",
    daysUntil: 31,
    recommendedAction: "BUY - Accumulate RCs of stars on contending teams",
    affectedPlayers: [
      "Connor Bedard",
      "Connor McDavid",
      "Auston Matthews",
      "Macklin Celebrini",
    ],
    expectedImpact: 20,
  },
  {
    eventName: "2026 FIFA World Cup",
    eventType: "game",
    date: "2026-06-11",
    daysUntil: 88,
    recommendedAction: "ACCUMULATE - Soccer card demand will surge globally",
    affectedPlayers: [
      "Kylian Mbappe",
      "Jude Bellingham",
      "Vinicius Jr",
      "Lamine Yamal",
      "Florian Wirtz",
    ],
    expectedImpact: 52,
  },
  {
    eventName: "NBA Free Agency Opens",
    eventType: "free-agency",
    date: "2026-06-30",
    daysUntil: 107,
    recommendedAction: "WATCH - Monitor trade rumors for positioning",
    affectedPlayers: [
      "Potential movers TBD",
    ],
    expectedImpact: 38,
  },
  {
    eventName: "MLB Amateur Draft",
    eventType: "draft",
    date: "2026-07-12",
    daysUntil: 119,
    recommendedAction: "RESEARCH - Identify top Bowman 1st Chrome prospects",
    affectedPlayers: [
      "Top college/HS prospects TBD",
    ],
    expectedImpact: 24,
  },
  {
    eventName: "Baseball Hall of Fame Induction",
    eventType: "hall-of-fame",
    date: "2026-07-26",
    daysUntil: 133,
    recommendedAction: "BUY - Accumulate RCs of 2026 HOF inductees",
    affectedPlayers: [
      "Ichiro Suzuki",
      "CC Sabathia",
    ],
    expectedImpact: 45,
  },
];

// ─── Service Functions ──────────────────────────────────────────────────────────

export async function getActiveOpportunities(): Promise<ArbitrageOpportunity[]> {
  await delay(280);
  return ACTIVE_OPPORTUNITIES;
}

export async function getEventWindowAnalysis(
  eventType?: EventType,
): Promise<EventWindowAnalysis[]> {
  await delay(220);
  if (eventType) {
    return EVENT_WINDOW_ANALYSES.filter((e) => e.eventType === eventType);
  }
  return EVENT_WINDOW_ANALYSES;
}

export async function getSeasonalPattern(
  cardId?: string,
): Promise<SeasonalPattern[]> {
  await delay(200);
  if (cardId) {
    return SEASONAL_PATTERNS.filter((s) => s.cardId === cardId);
  }
  return SEASONAL_PATTERNS;
}

export async function getIntradayPattern(
  cardId?: string,
): Promise<IntradayPattern[]> {
  await delay(180);
  if (cardId) {
    return INTRADAY_PATTERNS.filter((p) => p.cardId === cardId);
  }
  return INTRADAY_PATTERNS;
}

export async function getTimezoneArbitrage(): Promise<TimezoneArbitrage[]> {
  await delay(250);
  return TIMEZONE_ARBITRAGES;
}

export async function getCalendarAnomalies(): Promise<CalendarAnomaly[]> {
  await delay(200);
  return CALENDAR_ANOMALIES;
}

export async function getArbitragePerformance(): Promise<ArbitragePerformance> {
  await delay(300);
  return ARBITRAGE_PERFORMANCE;
}

export async function getUpcomingWindows(): Promise<UpcomingWindow[]> {
  await delay(180);
  return UPCOMING_WINDOWS;
}

export async function simulateEventTrade(
  cardId: string,
  eventType: EventType,
): Promise<SimulationResult> {
  await delay(400);

  const seasonal = SEASONAL_PATTERNS.find((s) => s.cardId === cardId);
  const eventAnalysis = EVENT_WINDOW_ANALYSES.find(
    (e) => e.eventType === eventType,
  );

  const cardName = seasonal?.cardName ?? "Unknown Card";
  const currentPrice =
    seasonal?.monthlyAvgPrices[new Date().getMonth()] ?? 100;
  const avgReturn = eventAnalysis?.avgReturn ?? 15;
  const projectedExitPrice =
    Math.round(currentPrice * (1 + avgReturn / 100) * 100) / 100;

  return {
    cardName,
    eventType,
    entryPrice: currentPrice,
    projectedExitPrice,
    projectedProfit: Math.round((projectedExitPrice - currentPrice) * 100) / 100,
    projectedReturn: avgReturn,
    optimalEntry: eventAnalysis?.optimalBuyWindow ?? "2-4 weeks before event",
    optimalExit: eventAnalysis?.optimalSellWindow ?? "Day of event",
    confidence: eventAnalysis?.historicalAccuracy ?? 70,
    historicalComparisons: [
      { date: "2025-04", actualReturn: avgReturn + 5.2 },
      { date: "2024-04", actualReturn: avgReturn - 3.1 },
      { date: "2023-04", actualReturn: avgReturn + 1.8 },
      { date: "2022-04", actualReturn: avgReturn - 7.4 },
      { date: "2021-04", actualReturn: avgReturn + 12.0 },
    ],
    riskFactors: [
      "Player injury before event could negate expected appreciation",
      "Market-wide downturn may override seasonal patterns",
      "New product releases could dilute demand for older sets",
      "Grading company delays may affect PSA 10 supply timing",
    ],
  };
}

// ─── Internal Helpers ───────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
