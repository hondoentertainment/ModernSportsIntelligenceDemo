// Micro-Season Capitalizer Service
// Calendar-driven event windows, price elasticity curves, and seasonal signals
// for timing sports card buy/sell decisions around predictable micro-seasons.

// ---- Types ----

export type EventCategory =
  | 'award'
  | 'milestone'
  | 'draft'
  | 'trade-deadline'
  | 'playoff'
  | 'media'
  | 'cultural';

export type SignalDirection = 'buy' | 'sell';

export interface MicroSeason {
  id: string;
  name: string;
  category: EventCategory;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  sport: string;
  description: string;
  avgPriceImpactPct: number;
  historicalWinRate: number; // 0-1
  recommendedAction: SignalDirection;
  affectedPlayerTypes: string[];
  peakDay: number; // day offset from start
  volumeMultiplier: number;
}

export interface EventWindow {
  id: string;
  name: string;
  category: EventCategory;
  sport: string;
  windowDescription: string; // e.g. "3 days before HOF ballot"
  startISO: string;
  endISO: string;
  priceElasticityPeak: number;
  avgReturnPct: number;
  confidenceLevel: number; // 0-1
  direction: SignalDirection;
  riskLevel: 'low' | 'medium' | 'high';
  relatedPlayerTags: string[];
  historicalOccurrences: number;
  active: boolean;
}

export interface PriceElasticityCurve {
  eventId: string;
  eventName: string;
  points: { dayOffset: number; elasticity: number; volume: number; avgPriceChangePct: number }[];
}

export interface SeasonalSignal {
  id: string;
  eventWindowId: string;
  eventName: string;
  direction: SignalDirection;
  confidence: number; // 0-1
  strength: number; // 0-100
  sport: string;
  category: EventCategory;
  timeToEvent: string; // human-readable
  expectedReturnPct: number;
  suggestedAction: string;
}

export interface HistoricalPattern {
  id: string;
  eventType: EventCategory;
  eventName: string;
  sport: string;
  years: number[];
  avgReturn: number;
  medianReturn: number;
  winRate: number;
  maxDrawdown: number;
  bestYear: { year: number; returnPct: number };
  worstYear: { year: number; returnPct: number };
  consistency: number; // 0-1
  dataPoints: { year: number; returnPct: number; volume: number }[];
}

export interface CalendarHeatMapEntry {
  month: number;
  week: number;
  label: string;
  intensity: number; // 0-1
  eventCount: number;
  avgReturn: number;
  topEvent: string;
  sport: string;
}

export interface WindowOpportunity {
  id: string;
  windowId: string;
  windowName: string;
  daysUntilOpen: number;
  daysUntilClose: number;
  estimatedReturn: number;
  confidence: number;
  direction: SignalDirection;
  sport: string;
  category: EventCategory;
  urgency: 'immediate' | 'upcoming' | 'future';
  playerExamples: string[];
}

export interface SeasonalReturn {
  month: string;
  baseball: number;
  basketball: number;
  football: number;
  hockey: number;
  soccer: number;
  overall: number;
}

export interface EventImpactRecord {
  eventId: string;
  eventName: string;
  date: string;
  sport: string;
  category: EventCategory;
  priceChangePct: number;
  volumeChange: number;
  durationDays: number;
  topMovers: { player: string; changePct: number }[];
}

// ---- Mock Data ----

const microSeasons: MicroSeason[] = [
  { id: 'ms-1', name: 'Spring Training Hype', category: 'cultural', startMonth: 2, startDay: 15, endMonth: 3, endDay: 25, sport: 'Baseball', description: 'Annual buzz around spring training camps boosts rookie and prospect cards.', avgPriceImpactPct: 8.4, historicalWinRate: 0.72, recommendedAction: 'buy', affectedPlayerTypes: ['rookies', 'prospects', 'breakout candidates'], peakDay: 20, volumeMultiplier: 1.6 },
  { id: 'ms-2', name: 'NFL Draft Fever', category: 'draft', startMonth: 4, startDay: 10, endMonth: 5, endDay: 5, sport: 'Football', description: 'Pre-draft speculation and post-draft euphoria drive massive volume.', avgPriceImpactPct: 15.2, historicalWinRate: 0.65, recommendedAction: 'sell', affectedPlayerTypes: ['draft prospects', 'college stars', 'QBs'], peakDay: 15, volumeMultiplier: 2.8 },
  { id: 'ms-3', name: 'NBA Playoff Push', category: 'playoff', startMonth: 4, startDay: 1, endMonth: 6, endDay: 20, sport: 'Basketball', description: 'Playoff performers see sustained price increases through the postseason.', avgPriceImpactPct: 12.7, historicalWinRate: 0.78, recommendedAction: 'buy', affectedPlayerTypes: ['stars', 'playoff performers', 'clutch players'], peakDay: 45, volumeMultiplier: 2.1 },
  { id: 'ms-4', name: 'Baseball HOF Ballot Season', category: 'award', startMonth: 11, startDay: 15, endMonth: 1, endDay: 25, sport: 'Baseball', description: 'Hall of Fame voting period creates sustained demand for HOF-caliber players.', avgPriceImpactPct: 22.5, historicalWinRate: 0.82, recommendedAction: 'buy', affectedPlayerTypes: ['HOF candidates', 'legends', 'first-ballot locks'], peakDay: 55, volumeMultiplier: 1.9 },
  { id: 'ms-5', name: 'NFL Trade Deadline Run', category: 'trade-deadline', startMonth: 10, startDay: 20, endMonth: 11, endDay: 3, sport: 'Football', description: 'Trade rumors and confirmed moves create volatility around the deadline.', avgPriceImpactPct: 6.8, historicalWinRate: 0.58, recommendedAction: 'buy', affectedPlayerTypes: ['trade candidates', 'contender additions', 'skill players'], peakDay: 10, volumeMultiplier: 1.7 },
  { id: 'ms-6', name: 'NBA Draft Lottery', category: 'draft', startMonth: 5, startDay: 5, endMonth: 6, endDay: 26, sport: 'Basketball', description: 'Lottery results and draft night create massive prospect card swings.', avgPriceImpactPct: 18.3, historicalWinRate: 0.61, recommendedAction: 'sell', affectedPlayerTypes: ['lottery picks', 'college stars', 'international prospects'], peakDay: 35, volumeMultiplier: 2.5 },
  { id: 'ms-7', name: 'World Series Window', category: 'playoff', startMonth: 10, startDay: 20, endMonth: 11, endDay: 5, sport: 'Baseball', description: 'Fall Classic drives premium prices for participating team stars.', avgPriceImpactPct: 14.1, historicalWinRate: 0.74, recommendedAction: 'buy', affectedPlayerTypes: ['WS participants', 'MVPs', 'pitching aces'], peakDay: 8, volumeMultiplier: 2.3 },
  { id: 'ms-8', name: 'Super Bowl Surge', category: 'playoff', startMonth: 1, startDay: 20, endMonth: 2, endDay: 15, sport: 'Football', description: 'Super Bowl hype peaks in the 10 days before the game, then crashes.', avgPriceImpactPct: 19.6, historicalWinRate: 0.69, recommendedAction: 'sell', affectedPlayerTypes: ['Super Bowl QBs', 'defensive stars', 'skill players'], peakDay: 12, volumeMultiplier: 3.1 },
  { id: 'ms-9', name: 'MLB Opening Day', category: 'cultural', startMonth: 3, startDay: 25, endMonth: 4, endDay: 8, sport: 'Baseball', description: 'Opening Day optimism inflates prices briefly before regression.', avgPriceImpactPct: 5.2, historicalWinRate: 0.55, recommendedAction: 'sell', affectedPlayerTypes: ['starters', 'breakout picks', 'new team signings'], peakDay: 4, volumeMultiplier: 1.5 },
  { id: 'ms-10', name: 'NBA All-Star Break', category: 'award', startMonth: 2, startDay: 10, endMonth: 2, endDay: 22, sport: 'Basketball', description: 'All-Star selections drive short-term price bumps for selected players.', avgPriceImpactPct: 7.6, historicalWinRate: 0.71, recommendedAction: 'sell', affectedPlayerTypes: ['All-Stars', 'snubs', 'rising stars'], peakDay: 5, volumeMultiplier: 1.8 },
  { id: 'ms-11', name: 'NHL Stanley Cup Playoffs', category: 'playoff', startMonth: 4, startDay: 15, endMonth: 6, endDay: 25, sport: 'Hockey', description: 'Playoff performers and Conn Smythe candidates surge during the Cup run.', avgPriceImpactPct: 11.3, historicalWinRate: 0.76, recommendedAction: 'buy', affectedPlayerTypes: ['playoff stars', 'goalies', 'Conn Smythe candidates'], peakDay: 50, volumeMultiplier: 1.9 },
  { id: 'ms-12', name: 'NFL Combine & Pro Days', category: 'draft', startMonth: 2, startDay: 25, endMonth: 4, endDay: 5, sport: 'Football', description: 'Combine standouts see explosive short-term gains in prospect cards.', avgPriceImpactPct: 11.9, historicalWinRate: 0.57, recommendedAction: 'buy', affectedPlayerTypes: ['combine standouts', 'QBs', 'athletic freaks'], peakDay: 10, volumeMultiplier: 2.0 },
  { id: 'ms-13', name: 'MLB Trade Deadline', category: 'trade-deadline', startMonth: 7, startDay: 20, endMonth: 8, endDay: 5, sport: 'Baseball', description: 'Trade deadline creates buyers and sellers across the hobby.', avgPriceImpactPct: 9.3, historicalWinRate: 0.67, recommendedAction: 'buy', affectedPlayerTypes: ['trade targets', 'contender acquisitions', 'rentals'], peakDay: 11, volumeMultiplier: 1.8 },
  { id: 'ms-14', name: 'NBA MVP Race', category: 'award', startMonth: 3, startDay: 1, endMonth: 4, endDay: 15, sport: 'Basketball', description: 'MVP narrative building inflates top candidate card prices.', avgPriceImpactPct: 16.8, historicalWinRate: 0.79, recommendedAction: 'buy', affectedPlayerTypes: ['MVP candidates', 'first-time candidates', 'dark horses'], peakDay: 30, volumeMultiplier: 1.7 },
  { id: 'ms-15', name: 'NFL Season Kickoff', category: 'cultural', startMonth: 9, startDay: 1, endMonth: 9, endDay: 15, sport: 'Football', description: 'Season opener excitement inflates football card prices across the board.', avgPriceImpactPct: 10.5, historicalWinRate: 0.66, recommendedAction: 'sell', affectedPlayerTypes: ['fantasy favorites', 'new starters', 'rookies'], peakDay: 7, volumeMultiplier: 2.2 },
  { id: 'ms-16', name: 'Milestone Chase Fever', category: 'milestone', startMonth: 8, startDay: 1, endMonth: 10, endDay: 1, sport: 'Baseball', description: 'Late-season milestone chases (HR records, hit milestones) create sustained demand.', avgPriceImpactPct: 25.4, historicalWinRate: 0.84, recommendedAction: 'buy', affectedPlayerTypes: ['milestone chasers', 'record breakers', 'legends'], peakDay: 35, volumeMultiplier: 2.6 },
  { id: 'ms-17', name: 'NHL Trade Deadline', category: 'trade-deadline', startMonth: 2, startDay: 25, endMonth: 3, endDay: 8, sport: 'Hockey', description: 'Rental players and contender additions create volatile price action.', avgPriceImpactPct: 7.1, historicalWinRate: 0.62, recommendedAction: 'buy', affectedPlayerTypes: ['rental players', 'contender targets', 'goaltenders'], peakDay: 7, volumeMultiplier: 1.5 },
  { id: 'ms-18', name: 'Soccer Transfer Window', category: 'trade-deadline', startMonth: 1, startDay: 1, endMonth: 2, endDay: 3, sport: 'Soccer', description: 'January transfer window drives speculative buying on move targets.', avgPriceImpactPct: 8.7, historicalWinRate: 0.59, recommendedAction: 'buy', affectedPlayerTypes: ['transfer targets', 'young stars', 'Premier League arrivals'], peakDay: 20, volumeMultiplier: 1.6 },
  { id: 'ms-19', name: 'NFL Awards Night', category: 'award', startMonth: 2, startDay: 5, endMonth: 2, endDay: 12, sport: 'Football', description: 'NFL Honors ceremony creates sell-the-news opportunities for award winners.', avgPriceImpactPct: 6.3, historicalWinRate: 0.63, recommendedAction: 'sell', affectedPlayerTypes: ['MVP', 'DPOY', 'OROY', 'DROY'], peakDay: 2, volumeMultiplier: 1.9 },
  { id: 'ms-20', name: 'NBA Free Agency', category: 'trade-deadline', startMonth: 6, startDay: 28, endMonth: 7, endDay: 15, sport: 'Basketball', description: 'Free agency frenzy creates massive volume and speculation.', avgPriceImpactPct: 13.4, historicalWinRate: 0.56, recommendedAction: 'buy', affectedPlayerTypes: ['free agents', 'max contract players', 'role players'], peakDay: 3, volumeMultiplier: 2.4 },
  { id: 'ms-21', name: 'Holiday Gift Season', category: 'cultural', startMonth: 11, startDay: 20, endMonth: 12, endDay: 31, sport: 'All', description: 'Holiday buying pressure inflates prices on popular cards.', avgPriceImpactPct: 9.8, historicalWinRate: 0.73, recommendedAction: 'sell', affectedPlayerTypes: ['popular names', 'iconic cards', 'graded gems'], peakDay: 25, volumeMultiplier: 2.0 },
  { id: 'ms-22', name: 'Panini / Topps Product Release Cycles', category: 'media', startMonth: 1, startDay: 10, endMonth: 3, endDay: 10, sport: 'All', description: 'New product drops flood the market and suppress existing card prices.', avgPriceImpactPct: -4.7, historicalWinRate: 0.68, recommendedAction: 'buy', affectedPlayerTypes: ['previous year parallels', 'base cards', 'prior-year rookies'], peakDay: 15, volumeMultiplier: 1.3 },
  { id: 'ms-23', name: 'March Madness Prospect Hype', category: 'cultural', startMonth: 3, startDay: 15, endMonth: 4, endDay: 8, sport: 'Basketball', description: 'NCAA tournament breakout performances drive college prospect card prices.', avgPriceImpactPct: 14.6, historicalWinRate: 0.52, recommendedAction: 'sell', affectedPlayerTypes: ['NCAA stars', 'Cinderella players', 'projected lottery picks'], peakDay: 12, volumeMultiplier: 2.1 },
  { id: 'ms-24', name: 'MLB Cy Young / MVP Window', category: 'award', startMonth: 11, startDay: 1, endMonth: 11, endDay: 20, sport: 'Baseball', description: 'Award announcements create sell-the-news patterns for frontrunners.', avgPriceImpactPct: 8.9, historicalWinRate: 0.75, recommendedAction: 'sell', affectedPlayerTypes: ['Cy Young candidates', 'MVP candidates', 'ROY candidates'], peakDay: 10, volumeMultiplier: 1.6 },
  { id: 'ms-25', name: 'NHL Entry Draft', category: 'draft', startMonth: 6, startDay: 20, endMonth: 7, endDay: 5, sport: 'Hockey', description: 'Draft night creates massive speculation on top picks.', avgPriceImpactPct: 12.1, historicalWinRate: 0.58, recommendedAction: 'sell', affectedPlayerTypes: ['draft picks', 'OHL/WHL stars', 'international prospects'], peakDay: 5, volumeMultiplier: 1.7 },
  { id: 'ms-26', name: 'NBA Christmas Day Showcase', category: 'media', startMonth: 12, startDay: 22, endMonth: 12, endDay: 28, sport: 'Basketball', description: 'Nationally televised Christmas games boost featured player cards.', avgPriceImpactPct: 5.1, historicalWinRate: 0.64, recommendedAction: 'buy', affectedPlayerTypes: ['marquee players', 'Christmas Day rosters', 'national TV stars'], peakDay: 3, volumeMultiplier: 1.4 },
  { id: 'ms-27', name: 'NFL Thanksgiving Spotlight', category: 'media', startMonth: 11, startDay: 22, endMonth: 11, endDay: 30, sport: 'Football', description: 'Thanksgiving games spotlight players to casual collectors.', avgPriceImpactPct: 4.3, historicalWinRate: 0.61, recommendedAction: 'sell', affectedPlayerTypes: ['Cowboys', 'Lions', 'primetime stars'], peakDay: 2, volumeMultiplier: 1.5 },
  { id: 'ms-28', name: 'Champions League Knockout Stage', category: 'playoff', startMonth: 2, startDay: 14, endMonth: 6, endDay: 1, sport: 'Soccer', description: 'European knockout rounds drive prices for top performers.', avgPriceImpactPct: 10.6, historicalWinRate: 0.71, recommendedAction: 'buy', affectedPlayerTypes: ['UCL stars', 'goal scorers', 'young talent'], peakDay: 60, volumeMultiplier: 1.8 },
  { id: 'ms-29', name: 'MLB All-Star Break', category: 'award', startMonth: 7, startDay: 8, endMonth: 7, endDay: 18, sport: 'Baseball', description: 'All-Star selections and Home Run Derby create short-term pumps.', avgPriceImpactPct: 6.7, historicalWinRate: 0.68, recommendedAction: 'sell', affectedPlayerTypes: ['All-Stars', 'Home Run Derby participants', 'first-time selections'], peakDay: 4, volumeMultiplier: 1.7 },
  { id: 'ms-30', name: 'Back-to-School Dip', category: 'cultural', startMonth: 8, startDay: 10, endMonth: 9, endDay: 1, sport: 'All', description: 'Late summer buying lull creates excellent entry points.', avgPriceImpactPct: -6.3, historicalWinRate: 0.77, recommendedAction: 'buy', affectedPlayerTypes: ['all types', 'vintage', 'modern rookies'], peakDay: 12, volumeMultiplier: 0.7 },
  { id: 'ms-31', name: 'Tax Refund Surge', category: 'cultural', startMonth: 2, startDay: 1, endMonth: 4, endDay: 15, sport: 'All', description: 'Tax refund season brings fresh capital into the hobby driving prices up.', avgPriceImpactPct: 7.2, historicalWinRate: 0.69, recommendedAction: 'sell', affectedPlayerTypes: ['mid-range cards', 'popular rookies', 'PSA 10s'], peakDay: 30, volumeMultiplier: 1.4 },
  { id: 'ms-32', name: 'FIFA World Cup Window', category: 'cultural', startMonth: 11, startDay: 15, endMonth: 12, endDay: 20, sport: 'Soccer', description: 'World Cup years see massive global demand for national team stars.', avgPriceImpactPct: 28.3, historicalWinRate: 0.81, recommendedAction: 'buy', affectedPlayerTypes: ['national team stars', 'young breakouts', 'Golden Boot candidates'], peakDay: 20, volumeMultiplier: 3.2 },
];

const eventWindows: EventWindow[] = [
  { id: 'ew-1', name: '3 Days Before HOF Ballot Release', category: 'award', sport: 'Baseball', windowDescription: '3 days before HOF ballot', startISO: '2026-11-12T00:00:00Z', endISO: '2026-11-15T00:00:00Z', priceElasticityPeak: 2.4, avgReturnPct: 18.7, confidenceLevel: 0.85, direction: 'buy', riskLevel: 'low', relatedPlayerTags: ['HOF candidate', 'borderline HOF', 'first ballot'], historicalOccurrences: 12, active: false },
  { id: 'ew-2', name: '48h After No-Hitter', category: 'milestone', sport: 'Baseball', windowDescription: '48h after no-hitter', startISO: '2026-03-15T00:00:00Z', endISO: '2026-03-17T00:00:00Z', priceElasticityPeak: 3.8, avgReturnPct: 32.5, confidenceLevel: 0.91, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['pitcher', 'no-hitter', 'milestone'], historicalOccurrences: 8, active: true },
  { id: 'ew-3', name: '1 Week Before NFL Draft', category: 'draft', sport: 'Football', windowDescription: '1 week before NFL Draft', startISO: '2026-04-16T00:00:00Z', endISO: '2026-04-23T00:00:00Z', priceElasticityPeak: 2.1, avgReturnPct: 14.2, confidenceLevel: 0.78, direction: 'sell', riskLevel: 'medium', relatedPlayerTags: ['draft prospect', 'QB1', 'top 10 pick'], historicalOccurrences: 15, active: false },
  { id: 'ew-4', name: 'NBA Finals Game 1 Eve', category: 'playoff', sport: 'Basketball', windowDescription: '24h before NBA Finals Game 1', startISO: '2026-06-03T00:00:00Z', endISO: '2026-06-04T00:00:00Z', priceElasticityPeak: 2.8, avgReturnPct: 11.3, confidenceLevel: 0.82, direction: 'sell', riskLevel: 'medium', relatedPlayerTags: ['Finals MVP candidate', 'star player'], historicalOccurrences: 10, active: false },
  { id: 'ew-5', name: 'MLB Trade Deadline -72h', category: 'trade-deadline', sport: 'Baseball', windowDescription: '72h before MLB trade deadline', startISO: '2026-07-28T00:00:00Z', endISO: '2026-07-31T00:00:00Z', priceElasticityPeak: 1.9, avgReturnPct: 8.6, confidenceLevel: 0.74, direction: 'buy', riskLevel: 'medium', relatedPlayerTags: ['trade target', 'rental', 'contender need'], historicalOccurrences: 14, active: false },
  { id: 'ew-6', name: 'Super Bowl MVP Announcement +24h', category: 'award', sport: 'Football', windowDescription: '24h after Super Bowl MVP', startISO: '2026-02-09T00:00:00Z', endISO: '2026-02-10T00:00:00Z', priceElasticityPeak: 4.1, avgReturnPct: 28.9, confidenceLevel: 0.88, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['Super Bowl MVP', 'QB', 'champion'], historicalOccurrences: 11, active: false },
  { id: 'ew-7', name: 'NBA MVP Announcement Night', category: 'award', sport: 'Basketball', windowDescription: 'NBA MVP announcement night', startISO: '2026-05-10T00:00:00Z', endISO: '2026-05-11T00:00:00Z', priceElasticityPeak: 3.2, avgReturnPct: 15.4, confidenceLevel: 0.86, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['MVP', 'runner-up', 'All-NBA'], historicalOccurrences: 13, active: false },
  { id: 'ew-8', name: '500th HR Milestone -1 Week', category: 'milestone', sport: 'Baseball', windowDescription: '1 week before projected 500th HR', startISO: '2026-08-15T00:00:00Z', endISO: '2026-08-22T00:00:00Z', priceElasticityPeak: 5.2, avgReturnPct: 45.3, confidenceLevel: 0.93, direction: 'buy', riskLevel: 'low', relatedPlayerTags: ['500 HR club', 'power hitter', 'legend'], historicalOccurrences: 4, active: false },
  { id: 'ew-9', name: 'NHL Conn Smythe Clinch', category: 'award', sport: 'Hockey', windowDescription: '48h after Stanley Cup clinch', startISO: '2026-06-18T00:00:00Z', endISO: '2026-06-20T00:00:00Z', priceElasticityPeak: 3.5, avgReturnPct: 22.1, confidenceLevel: 0.84, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['Conn Smythe', 'Cup winner', 'playoff MVP'], historicalOccurrences: 9, active: false },
  { id: 'ew-10', name: 'NFL Free Agency Opening Bell', category: 'trade-deadline', sport: 'Football', windowDescription: 'First 48h of NFL free agency', startISO: '2026-03-11T00:00:00Z', endISO: '2026-03-18T00:00:00Z', priceElasticityPeak: 2.3, avgReturnPct: 9.8, confidenceLevel: 0.71, direction: 'buy', riskLevel: 'high', relatedPlayerTags: ['free agent', 'franchise tag', 'new team'], historicalOccurrences: 12, active: true },
  { id: 'ew-11', name: 'March Madness Final Four', category: 'playoff', sport: 'Basketball', windowDescription: 'Final Four weekend', startISO: '2026-04-04T00:00:00Z', endISO: '2026-04-06T00:00:00Z', priceElasticityPeak: 2.6, avgReturnPct: 19.7, confidenceLevel: 0.68, direction: 'sell', riskLevel: 'high', relatedPlayerTags: ['NCAA star', 'projected lottery', 'breakout'], historicalOccurrences: 10, active: false },
  { id: 'ew-12', name: 'MLB Opening Day -48h', category: 'cultural', sport: 'Baseball', windowDescription: '48h before Opening Day', startISO: '2026-03-25T00:00:00Z', endISO: '2026-03-27T00:00:00Z', priceElasticityPeak: 1.7, avgReturnPct: 5.8, confidenceLevel: 0.72, direction: 'sell', riskLevel: 'medium', relatedPlayerTags: ['opening day starter', 'new signing', 'rookie'], historicalOccurrences: 15, active: false },
  { id: 'ew-13', name: 'Champions League Final Week', category: 'playoff', sport: 'Soccer', windowDescription: 'Week of UCL Final', startISO: '2026-05-25T00:00:00Z', endISO: '2026-05-31T00:00:00Z', priceElasticityPeak: 2.9, avgReturnPct: 13.5, confidenceLevel: 0.76, direction: 'sell', riskLevel: 'medium', relatedPlayerTags: ['UCL finalist', 'European star', 'goal scorer'], historicalOccurrences: 8, active: false },
  { id: 'ew-14', name: 'NBA Draft Night', category: 'draft', sport: 'Basketball', windowDescription: 'NBA Draft night first round', startISO: '2026-06-25T00:00:00Z', endISO: '2026-06-26T00:00:00Z', priceElasticityPeak: 3.6, avgReturnPct: 21.4, confidenceLevel: 0.73, direction: 'sell', riskLevel: 'high', relatedPlayerTags: ['#1 pick', 'lottery pick', 'draft sleeper'], historicalOccurrences: 14, active: false },
  { id: 'ew-15', name: 'NHL Trade Deadline Day', category: 'trade-deadline', sport: 'Hockey', windowDescription: 'NHL trade deadline day', startISO: '2026-03-03T00:00:00Z', endISO: '2026-03-04T00:00:00Z', priceElasticityPeak: 2.0, avgReturnPct: 7.3, confidenceLevel: 0.69, direction: 'buy', riskLevel: 'medium', relatedPlayerTags: ['rental', 'trade bait', 'contender add'], historicalOccurrences: 11, active: true },
  { id: 'ew-16', name: '3000th Hit Club Approach', category: 'milestone', sport: 'Baseball', windowDescription: '2 weeks before projected 3000th hit', startISO: '2026-09-01T00:00:00Z', endISO: '2026-09-15T00:00:00Z', priceElasticityPeak: 4.7, avgReturnPct: 38.6, confidenceLevel: 0.90, direction: 'buy', riskLevel: 'low', relatedPlayerTags: ['3000 hit club', 'legend', 'active veteran'], historicalOccurrences: 3, active: false },
  { id: 'ew-17', name: 'NFL Combine 40-Yard Dash Day', category: 'draft', sport: 'Football', windowDescription: '40-yard dash results day at NFL Combine', startISO: '2026-03-01T00:00:00Z', endISO: '2026-03-02T00:00:00Z', priceElasticityPeak: 2.5, avgReturnPct: 12.1, confidenceLevel: 0.66, direction: 'buy', riskLevel: 'high', relatedPlayerTags: ['speed merchant', 'combine warrior', 'WR prospect'], historicalOccurrences: 13, active: true },
  { id: 'ew-18', name: 'All-Star Game Week', category: 'award', sport: 'Baseball', windowDescription: 'MLB All-Star week', startISO: '2026-07-13T00:00:00Z', endISO: '2026-07-17T00:00:00Z', priceElasticityPeak: 1.8, avgReturnPct: 6.9, confidenceLevel: 0.73, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['All-Star', 'Home Run Derby', 'starter'], historicalOccurrences: 15, active: false },
  { id: 'ew-19', name: 'Perfect Game Aftermath', category: 'milestone', sport: 'Baseball', windowDescription: '72h after perfect game', startISO: '2026-06-10T00:00:00Z', endISO: '2026-06-13T00:00:00Z', priceElasticityPeak: 6.1, avgReturnPct: 55.2, confidenceLevel: 0.95, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['perfect game', 'pitcher', 'rare milestone'], historicalOccurrences: 2, active: false },
  { id: 'ew-20', name: 'Black Friday Card Market', category: 'cultural', sport: 'All', windowDescription: 'Black Friday through Cyber Monday', startISO: '2026-11-27T00:00:00Z', endISO: '2026-11-30T00:00:00Z', priceElasticityPeak: 1.6, avgReturnPct: 4.2, confidenceLevel: 0.81, direction: 'buy', riskLevel: 'low', relatedPlayerTags: ['all types', 'sealed product', 'graded cards'], historicalOccurrences: 10, active: false },
  { id: 'ew-21', name: 'NBA Scoring Record Chase', category: 'milestone', sport: 'Basketball', windowDescription: '1 week before projected all-time scoring record', startISO: '2026-02-01T00:00:00Z', endISO: '2026-02-08T00:00:00Z', priceElasticityPeak: 5.8, avgReturnPct: 42.1, confidenceLevel: 0.92, direction: 'buy', riskLevel: 'low', relatedPlayerTags: ['scoring record', 'all-time great', 'legend'], historicalOccurrences: 2, active: false },
  { id: 'ew-22', name: 'Rookie Debut Weekend', category: 'cultural', sport: 'All', windowDescription: 'First 72h after highly anticipated rookie debut', startISO: '2026-03-14T00:00:00Z', endISO: '2026-03-17T00:00:00Z', priceElasticityPeak: 3.3, avgReturnPct: 24.6, confidenceLevel: 0.77, direction: 'sell', riskLevel: 'medium', relatedPlayerTags: ['#1 pick', 'hyped rookie', 'debut'], historicalOccurrences: 18, active: true },
  { id: 'ew-23', name: 'World Series Game 7 Fever', category: 'playoff', sport: 'Baseball', windowDescription: '24h before/after World Series Game 7', startISO: '2026-10-30T00:00:00Z', endISO: '2026-11-01T00:00:00Z', priceElasticityPeak: 4.4, avgReturnPct: 31.8, confidenceLevel: 0.87, direction: 'sell', riskLevel: 'low', relatedPlayerTags: ['WS hero', 'clutch performer', 'pitching ace'], historicalOccurrences: 6, active: false },
  { id: 'ew-24', name: 'Summer League Sleepers', category: 'cultural', sport: 'Basketball', windowDescription: 'NBA Summer League first 5 days', startISO: '2026-07-05T00:00:00Z', endISO: '2026-07-10T00:00:00Z', priceElasticityPeak: 1.5, avgReturnPct: 7.8, confidenceLevel: 0.55, direction: 'sell', riskLevel: 'high', relatedPlayerTags: ['summer league standout', 'second-round pick', 'UDFA'], historicalOccurrences: 9, active: false },
];

// ---- Helper to build elasticity curves ----

function buildElasticityCurve(eventId: string, name: string, peakElasticity: number, durationDays: number): PriceElasticityCurve {
  const points: PriceElasticityCurve['points'] = [];
  const peakOffset = Math.floor(durationDays * 0.6);
  for (let d = -5; d <= durationDays + 3; d++) {
    const distFromPeak = Math.abs(d - peakOffset);
    const falloff = Math.max(0, 1 - (distFromPeak / (durationDays * 0.7)));
    const elasticity = +(peakElasticity * falloff * (1 + (Math.sin(d * 0.7) * 0.1))).toFixed(2);
    const volume = Math.round(100 + 400 * falloff * (1 + Math.random() * 0.2));
    const avgPriceChangePct = +(elasticity * 4.2 * (1 + Math.sin(d * 0.5) * 0.15)).toFixed(1);
    points.push({ dayOffset: d, elasticity: Math.max(0, elasticity), volume, avgPriceChangePct });
  }
  return { eventId, eventName: name, points };
}

// ---- Historical patterns generator ----

function buildHistoricalPattern(id: string, eventType: EventCategory, name: string, sport: string, avgRet: number, winRate: number): HistoricalPattern {
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const dataPoints = years.map(year => {
    const variance = (Math.sin(year * 3.7 + avgRet) * 0.4 + 0.8);
    const returnPct = +(avgRet * variance).toFixed(1);
    const volume = Math.round(1200 + 800 * Math.abs(Math.sin(year * 1.3)));
    return { year, returnPct, volume };
  });
  const sorted = [...dataPoints].sort((a, b) => b.returnPct - a.returnPct);
  return {
    id,
    eventType,
    eventName: name,
    sport,
    years,
    avgReturn: avgRet,
    medianReturn: +(avgRet * 0.92).toFixed(1),
    winRate,
    maxDrawdown: +(avgRet * -0.35).toFixed(1),
    bestYear: { year: sorted[0].year, returnPct: sorted[0].returnPct },
    worstYear: { year: sorted[sorted.length - 1].year, returnPct: sorted[sorted.length - 1].returnPct },
    consistency: +(winRate * 0.95 + 0.03).toFixed(2),
    dataPoints,
  };
}

const historicalPatterns: HistoricalPattern[] = [
  buildHistoricalPattern('hp-1', 'award', 'HOF Ballot Announcement', 'Baseball', 18.7, 0.82),
  buildHistoricalPattern('hp-2', 'milestone', 'No-Hitter Events', 'Baseball', 32.5, 0.91),
  buildHistoricalPattern('hp-3', 'draft', 'NFL Draft Week', 'Football', 14.2, 0.65),
  buildHistoricalPattern('hp-4', 'playoff', 'NBA Finals', 'Basketball', 11.3, 0.78),
  buildHistoricalPattern('hp-5', 'trade-deadline', 'MLB Trade Deadline', 'Baseball', 8.6, 0.67),
  buildHistoricalPattern('hp-6', 'award', 'Super Bowl MVP', 'Football', 28.9, 0.88),
  buildHistoricalPattern('hp-7', 'milestone', '500th HR Milestone', 'Baseball', 45.3, 0.93),
  buildHistoricalPattern('hp-8', 'playoff', 'Stanley Cup Playoffs', 'Hockey', 22.1, 0.76),
  buildHistoricalPattern('hp-9', 'draft', 'NBA Draft Night', 'Basketball', 21.4, 0.73),
  buildHistoricalPattern('hp-10', 'cultural', 'Holiday Gift Season', 'All', 9.8, 0.73),
  buildHistoricalPattern('hp-11', 'media', 'Christmas Day Showcase', 'Basketball', 5.1, 0.64),
  buildHistoricalPattern('hp-12', 'trade-deadline', 'NHL Trade Deadline', 'Hockey', 7.3, 0.62),
  buildHistoricalPattern('hp-13', 'cultural', 'Back-to-School Dip', 'All', -6.3, 0.77),
  buildHistoricalPattern('hp-14', 'award', 'NBA MVP Announcement', 'Basketball', 15.4, 0.86),
  buildHistoricalPattern('hp-15', 'milestone', 'Perfect Game', 'Baseball', 55.2, 0.95),
  buildHistoricalPattern('hp-16', 'playoff', 'World Series Game 7', 'Baseball', 31.8, 0.87),
  buildHistoricalPattern('hp-17', 'cultural', 'March Madness', 'Basketball', 14.6, 0.52),
  buildHistoricalPattern('hp-18', 'trade-deadline', 'NBA Free Agency', 'Basketball', 13.4, 0.56),
  buildHistoricalPattern('hp-19', 'playoff', 'Champions League Final', 'Soccer', 13.5, 0.71),
  buildHistoricalPattern('hp-20', 'cultural', 'FIFA World Cup', 'Soccer', 28.3, 0.81),
];

// ---- Calendar Heat Map ----

function buildCalendarHeatMap(): CalendarHeatMapEntry[] {
  const entries: CalendarHeatMapEntry[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sports = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

  const intensityMap: Record<number, number[]> = {
    1: [0.6, 0.7, 0.5, 0.4],
    2: [0.5, 0.8, 0.9, 0.7],
    3: [0.7, 0.8, 0.6, 0.5],
    4: [0.9, 0.9, 0.95, 0.7],
    5: [0.6, 0.7, 0.5, 0.4],
    6: [0.8, 0.9, 0.7, 0.6],
    7: [0.9, 0.6, 0.5, 0.4],
    8: [0.4, 0.3, 0.3, 0.5],
    9: [0.5, 0.6, 0.8, 0.7],
    10: [0.8, 0.7, 0.9, 0.8],
    11: [0.9, 0.8, 0.7, 0.9],
    12: [0.7, 0.8, 0.6, 0.7],
  };

  const topEvents: Record<number, string> = {
    1: 'HOF Ballot / Super Bowl Build',
    2: 'Super Bowl / NBA ASG / Combine',
    3: 'Spring Training / March Madness',
    4: 'NFL Draft / NBA Playoffs Start',
    5: 'NBA Draft Lottery / NBA Conf Finals',
    6: 'NBA Finals / NHL Cup / NBA Draft',
    7: 'MLB ASG / MLB Trade Deadline',
    8: 'Milestone Chases / Back-to-School',
    9: 'NFL Kickoff / September Call-Ups',
    10: 'World Series / NFL Trade Deadline',
    11: 'MLB Awards / HOF Ballot / Holidays',
    12: 'Holiday Buying / NBA Christmas',
  };

  for (let m = 1; m <= 12; m++) {
    const weekIntensities = intensityMap[m];
    for (let w = 0; w < 4; w++) {
      const sport = sports[(m + w) % sports.length];
      const intensity = weekIntensities[w];
      entries.push({
        month: m,
        week: w + 1,
        label: `${monthNames[m - 1]} W${w + 1}`,
        intensity,
        eventCount: Math.round(intensity * 5),
        avgReturn: +(intensity * 12 - 2).toFixed(1),
        topEvent: topEvents[m],
        sport,
      });
    }
  }
  return entries;
}

// ---- Seasonal Returns ----

const seasonalReturns: SeasonalReturn[] = [
  { month: 'Jan', baseball: 4.2, basketball: 6.1, football: 12.8, hockey: 3.1, soccer: 5.4, overall: 6.3 },
  { month: 'Feb', baseball: 5.8, basketball: 7.4, football: 18.2, hockey: 4.8, soccer: 6.2, overall: 8.5 },
  { month: 'Mar', baseball: 8.1, basketball: 5.6, football: 9.4, hockey: 5.1, soccer: 4.8, overall: 6.6 },
  { month: 'Apr', baseball: 6.3, basketball: 10.2, football: 14.7, hockey: 6.3, soccer: 3.9, overall: 8.3 },
  { month: 'May', baseball: 3.1, basketball: 8.9, football: 2.1, hockey: 7.8, soccer: 5.1, overall: 5.4 },
  { month: 'Jun', baseball: 4.7, basketball: 12.4, football: 1.3, hockey: 9.2, soccer: 8.6, overall: 7.2 },
  { month: 'Jul', baseball: 9.6, basketball: 5.3, football: 3.7, hockey: 1.2, soccer: 2.8, overall: 4.5 },
  { month: 'Aug', baseball: 7.2, basketball: -1.2, football: 4.8, hockey: -0.8, soccer: 1.4, overall: 2.3 },
  { month: 'Sep', baseball: 5.4, basketball: 1.8, football: 10.1, hockey: 2.4, soccer: 3.2, overall: 4.6 },
  { month: 'Oct', baseball: 13.8, basketball: 3.4, football: 7.6, hockey: 4.1, soccer: 4.7, overall: 6.7 },
  { month: 'Nov', baseball: 8.9, basketball: 4.8, football: 5.9, hockey: 3.6, soccer: 7.3, overall: 6.1 },
  { month: 'Dec', baseball: 2.4, basketball: 6.7, football: 3.2, hockey: 2.9, soccer: 3.1, overall: 3.7 },
];

// ---- Event Impact History ----

const eventImpactHistory: EventImpactRecord[] = [
  { eventId: 'eih-1', eventName: 'Shohei Ohtani 50/50 Season', date: '2024-09-19', sport: 'Baseball', category: 'milestone', priceChangePct: 68.4, volumeChange: 340, durationDays: 14, topMovers: [{ player: 'Shohei Ohtani', changePct: 68.4 }, { player: 'Mike Trout', changePct: 12.1 }] },
  { eventId: 'eih-2', eventName: 'LeBron All-Time Scoring Record', date: '2023-02-07', sport: 'Basketball', category: 'milestone', priceChangePct: 42.1, volumeChange: 280, durationDays: 10, topMovers: [{ player: 'LeBron James', changePct: 42.1 }, { player: 'Kareem Abdul-Jabbar', changePct: 15.3 }] },
  { eventId: 'eih-3', eventName: 'Patrick Mahomes Super Bowl MVP', date: '2024-02-11', sport: 'Football', category: 'award', priceChangePct: 31.2, volumeChange: 220, durationDays: 7, topMovers: [{ player: 'Patrick Mahomes', changePct: 31.2 }, { player: 'Travis Kelce', changePct: 18.7 }] },
  { eventId: 'eih-4', eventName: 'Victor Wembanyama NBA Debut', date: '2023-10-25', sport: 'Basketball', category: 'cultural', priceChangePct: 55.8, volumeChange: 410, durationDays: 5, topMovers: [{ player: 'Victor Wembanyama', changePct: 55.8 }, { player: 'Chet Holmgren', changePct: -8.2 }] },
  { eventId: 'eih-5', eventName: 'Caleb Williams #1 Pick', date: '2024-04-25', sport: 'Football', category: 'draft', priceChangePct: 38.5, volumeChange: 310, durationDays: 4, topMovers: [{ player: 'Caleb Williams', changePct: 38.5 }, { player: 'Drake Maye', changePct: 22.3 }] },
  { eventId: 'eih-6', eventName: 'Connor McDavid Playoff Run', date: '2024-06-10', sport: 'Hockey', category: 'playoff', priceChangePct: 35.7, volumeChange: 190, durationDays: 12, topMovers: [{ player: 'Connor McDavid', changePct: 35.7 }, { player: 'Leon Draisaitl', changePct: 21.4 }] },
  { eventId: 'eih-7', eventName: 'Lionel Messi Inter Miami Debut', date: '2023-07-21', sport: 'Soccer', category: 'cultural', priceChangePct: 82.3, volumeChange: 520, durationDays: 21, topMovers: [{ player: 'Lionel Messi', changePct: 82.3 }, { player: 'Sergio Busquets', changePct: 14.6 }] },
  { eventId: 'eih-8', eventName: '2024 MLB Trade Deadline', date: '2024-07-30', sport: 'Baseball', category: 'trade-deadline', priceChangePct: 11.4, volumeChange: 160, durationDays: 6, topMovers: [{ player: 'Garrett Crochet', changePct: 28.3 }, { player: 'Luis Robert', changePct: 19.7 }] },
  { eventId: 'eih-9', eventName: 'Nikola Jokic Third MVP', date: '2024-05-09', sport: 'Basketball', category: 'award', priceChangePct: 18.6, volumeChange: 150, durationDays: 5, topMovers: [{ player: 'Nikola Jokic', changePct: 18.6 }, { player: 'Luka Doncic', changePct: 5.2 }] },
  { eventId: 'eih-10', eventName: 'Aaron Judge 62nd HR', date: '2022-10-04', sport: 'Baseball', category: 'milestone', priceChangePct: 51.6, volumeChange: 380, durationDays: 8, topMovers: [{ player: 'Aaron Judge', changePct: 51.6 }, { player: 'Roger Maris', changePct: 22.8 }] },
];

// ---- Public API ----

export function getMicroSeasons(): MicroSeason[] {
  return microSeasons;
}

export function getActiveWindows(): EventWindow[] {
  return eventWindows.filter(w => w.active);
}

export function getAllEventWindows(): EventWindow[] {
  return eventWindows;
}

export function getUpcomingOpportunities(): WindowOpportunity[] {
  const now = new Date('2026-03-16T12:00:00Z');
  return eventWindows
    .map(w => {
      const start = new Date(w.startISO);
      const end = new Date(w.endISO);
      const daysUntilOpen = Math.max(0, Math.round((start.getTime() - now.getTime()) / 86400000));
      const daysUntilClose = Math.max(0, Math.round((end.getTime() - now.getTime()) / 86400000));
      let urgency: WindowOpportunity['urgency'] = 'future';
      if (w.active) urgency = 'immediate';
      else if (daysUntilOpen <= 14) urgency = 'upcoming';
      return {
        id: `opp-${w.id}`,
        windowId: w.id,
        windowName: w.name,
        daysUntilOpen,
        daysUntilClose,
        estimatedReturn: w.avgReturnPct,
        confidence: w.confidenceLevel,
        direction: w.direction,
        sport: w.sport,
        category: w.category,
        urgency,
        playerExamples: w.relatedPlayerTags.slice(0, 3),
      };
    })
    .sort((a, b) => a.daysUntilOpen - b.daysUntilOpen);
}

export function getElasticityCurve(eventId: string): PriceElasticityCurve | null {
  const window = eventWindows.find(w => w.id === eventId);
  if (!window) return null;
  const start = new Date(window.startISO);
  const end = new Date(window.endISO);
  const durationDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  return buildElasticityCurve(eventId, window.name, window.priceElasticityPeak, Math.max(durationDays, 5));
}

export function getAllElasticityCurves(): PriceElasticityCurve[] {
  return eventWindows.slice(0, 12).map(w => {
    const start = new Date(w.startISO);
    const end = new Date(w.endISO);
    const dur = Math.max(Math.round((end.getTime() - start.getTime()) / 86400000), 5);
    return buildElasticityCurve(w.id, w.name, w.priceElasticityPeak, dur);
  });
}

export function getCalendarHeatMap(): CalendarHeatMapEntry[] {
  return buildCalendarHeatMap();
}

export function getHistoricalPatterns(eventType?: EventCategory): HistoricalPattern[] {
  if (!eventType) return historicalPatterns;
  return historicalPatterns.filter(p => p.eventType === eventType);
}

export function getSignals(): SeasonalSignal[] {
  const active = getActiveWindows();
  const upcoming = eventWindows.filter(w => !w.active).slice(0, 8);
  const all = [...active, ...upcoming];

  return all.map((w, i) => {
    const now = new Date('2026-03-16T12:00:00Z');
    const start = new Date(w.startISO);
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    let timeToEvent: string;
    if (w.active) timeToEvent = 'Active now';
    else if (diffDays < 0) timeToEvent = `${Math.abs(diffDays)}d ago`;
    else if (diffDays <= 1) timeToEvent = 'Tomorrow';
    else if (diffDays <= 7) timeToEvent = `${diffDays}d away`;
    else if (diffDays <= 30) timeToEvent = `${Math.round(diffDays / 7)}w away`;
    else timeToEvent = `${Math.round(diffDays / 30)}mo away`;

    return {
      id: `sig-${i}`,
      eventWindowId: w.id,
      eventName: w.name,
      direction: w.direction,
      confidence: w.confidenceLevel,
      strength: Math.round(w.confidenceLevel * 100 * (w.priceElasticityPeak / 4)),
      sport: w.sport,
      category: w.category,
      timeToEvent,
      expectedReturnPct: w.avgReturnPct,
      suggestedAction: w.direction === 'buy'
        ? `Accumulate ${w.relatedPlayerTags[0]} cards before window closes`
        : `Consider selling ${w.relatedPlayerTags[0]} cards at peak`,
    };
  });
}

export function getSeasonalReturns(): SeasonalReturn[] {
  return seasonalReturns;
}

export function getBestEntryPoints(): { month: string; sport: string; avgDiscount: number; reason: string }[] {
  return [
    { month: 'Aug', sport: 'Basketball', avgDiscount: 12.4, reason: 'Off-season lull before training camp' },
    { month: 'Aug', sport: 'Hockey', avgDiscount: 10.8, reason: 'Deep off-season, lowest attention' },
    { month: 'Jul', sport: 'Football', avgDiscount: 8.3, reason: 'Post-draft settling, pre-camp quiet' },
    { month: 'Jan', sport: 'Baseball', avgDiscount: 7.1, reason: 'Cold stove period, tax season selling' },
    { month: 'Dec', sport: 'Baseball', avgDiscount: 6.5, reason: 'Holiday spending redirected elsewhere' },
    { month: 'Aug', sport: 'Soccer', avgDiscount: 5.9, reason: 'Transfer window uncertainty' },
    { month: 'May', sport: 'Football', avgDiscount: 5.2, reason: 'Post-draft correction phase' },
    { month: 'Mar', sport: 'Hockey', avgDiscount: 4.8, reason: 'Mid-season attention fatigue' },
    { month: 'Sep', sport: 'Basketball', avgDiscount: 4.3, reason: 'Pre-season, before opening night hype' },
    { month: 'Jun', sport: 'Football', avgDiscount: 3.7, reason: 'Deep off-season quietest period' },
  ];
}

export function getEventImpactHistory(): EventImpactRecord[] {
  return eventImpactHistory;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getCategoryColor(category: EventCategory): string {
  const colors: Record<EventCategory, string> = {
    award: '#a78bfa',
    milestone: '#34d399',
    draft: '#60a5fa',
    'trade-deadline': '#fbbf24',
    playoff: '#f87171',
    media: '#f472b6',
    cultural: '#38bdf8',
  };
  return colors[category];
}

export function getCategoryLabel(category: EventCategory): string {
  const labels: Record<EventCategory, string> = {
    award: 'Award',
    milestone: 'Milestone',
    draft: 'Draft',
    'trade-deadline': 'Trade Deadline',
    playoff: 'Playoff',
    media: 'Media',
    cultural: 'Cultural',
  };
  return labels[category];
}
