// ---- Types ----

export type EventCategory =
  | 'social-media'
  | 'injury'
  | 'grading'
  | 'scandal'
  | 'trade'
  | 'media-appearance'
  | 'viral-moment'
  | 'regulation';

export type InitialMagnitude = 'tiny' | 'small' | 'medium';

export type NonLinearityType = 'linear' | 'exponential' | 'logarithmic' | 'chaotic';

export type EntropyTrend = 'increasing' | 'stable' | 'decreasing';

export interface AttractorPoint {
  x: number;
  y: number;
  z: number;
}

export interface ChaosPoint {
  timestamp: string;
  marketDelta: number;
  entropy: number;
  lyapunovExponent: number;
  description: string;
}

export interface CascadeCard {
  cardId: string;
  cardName: string;
  player: string;
  impactPercent: number;
  delay_hours: number;
  pathway: string[];
  sensitivity: number;
}

export interface ButterflyEvent {
  id: string;
  name: string;
  category: EventCategory;
  initialMagnitude: InitialMagnitude;
  description: string;
  timestamp: string;
  affectedCards: CascadeCard[];
  totalMarketImpact: number;
  amplificationFactor: number;
  chaosPath: ChaosPoint[];
}

export interface StrangeAttractor {
  id: string;
  name: string;
  description: string;
  cards: string[];
  pattern: AttractorPoint[];
  basinOfAttraction: number;
  periodicity: number;
}

export interface SensitivityFactor {
  factor: string;
  sensitivity: number;
  nonLinearity: NonLinearityType;
}

export interface SensitivityMap {
  cardId: string;
  cardName: string;
  factors: SensitivityFactor[];
}

export interface SimTimelinePoint {
  day: number;
  portfolioValue: number;
}

export interface SimTimeline {
  id: string;
  variation: string;
  path: SimTimelinePoint[];
  outcome: string;
}

export interface ChaosSimulation {
  eventId: string;
  iterations: number;
  timelines: SimTimeline[];
  divergencePoint: number;
  maxDivergence: number;
}

export interface MarketEntropyHistoryPoint {
  date: string;
  entropy: number;
}

export interface MarketEntropy {
  current: number;
  historical: MarketEntropyHistoryPoint[];
  trend: EntropyTrend;
  interpretation: string;
}

// ---- Helper utilities ----

function generateLorenzAttractor(steps: number, dt: number, sigma: number, rho: number, beta: number): AttractorPoint[] {
  const points: AttractorPoint[] = [];
  let x = 0.1, y = 0, z = 0;
  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)), z: parseFloat(z.toFixed(4)) });
  }
  return points;
}

function generateRosslerAttractor(steps: number, dt: number, a: number, b: number, c: number): AttractorPoint[] {
  const points: AttractorPoint[] = [];
  let x = 1, y = 1, z = 1;
  for (let i = 0; i < steps; i++) {
    const dx = (-y - z) * dt;
    const dy = (x + a * y) * dt;
    const dz = (b + z * (x - c)) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)), z: parseFloat(z.toFixed(4)) });
  }
  return points;
}

// ---- Mock Data: Butterfly Events ----

const butterflyEvents: ButterflyEvent[] = [
  {
    id: 'evt-001',
    name: 'The Instagram Post',
    category: 'social-media',
    initialMagnitude: 'tiny',
    description: 'Influencer @CardQueenCollects posted an unboxing featuring a 2024 Bowman Chrome Victor Wembanyama auto. Within 12 hours the post had 2.3M views. Demand for Wembanyama Bowman Chrome autos surged 340%, triggering panic buying across all Wembanyama inventory and eventually lifting the entire 2024 Bowman Chrome product line.',
    timestamp: '2026-01-14T19:32:00Z',
    affectedCards: [
      { cardId: 'c-wemby-bc', cardName: '2024 Bowman Chrome Auto #BCA-VW', player: 'Victor Wembanyama', impactPercent: 342, delay_hours: 0.5, pathway: ['Instagram post', 'Viral repost wave', 'eBay search spike', 'Price surge'], sensitivity: 97 },
      { cardId: 'c-wemby-pz', cardName: '2024 Prizm Silver #201', player: 'Victor Wembanyama', impactPercent: 185, delay_hours: 4, pathway: ['Spillover hype', 'Cross-product demand', 'Relisted at higher ask'], sensitivity: 88 },
      { cardId: 'c-wemby-sel', cardName: '2024 Select Concourse #1', player: 'Victor Wembanyama', impactPercent: 112, delay_hours: 8, pathway: ['Budget buyers priced out of Chrome', 'Select as substitute', 'Price lift'], sensitivity: 72 },
      { cardId: 'c-chet-bc', cardName: '2024 Bowman Chrome Auto #BCA-CH', player: 'Chet Holmgren', impactPercent: 67, delay_hours: 18, pathway: ['Big-man hype category', 'Collector pivots to adjacent player', 'Modest pump'], sensitivity: 54 },
      { cardId: 'c-bc-blasters', cardName: '2024 Bowman Chrome Blaster Box', player: 'Product (sealed)', impactPercent: 210, delay_hours: 2, pathway: ['Rippers want same hit', 'Retail cleaned out', 'Flipper markup'], sensitivity: 91 },
    ],
    totalMarketImpact: 4_870_000,
    amplificationFactor: 10420,
    chaosPath: [
      { timestamp: '2026-01-14T19:32:00Z', marketDelta: 0, entropy: 0.12, lyapunovExponent: 0.01, description: 'Instagram post published — 467 followers see it initially' },
      { timestamp: '2026-01-14T20:15:00Z', marketDelta: 2200, entropy: 0.18, lyapunovExponent: 0.08, description: 'Reposted by @SportsCardRadio (180K followers)' },
      { timestamp: '2026-01-14T22:00:00Z', marketDelta: 48000, entropy: 0.41, lyapunovExponent: 0.34, description: 'Trending on CardCollector Twitter — first eBay sold comps spike' },
      { timestamp: '2026-01-15T02:00:00Z', marketDelta: 310000, entropy: 0.67, lyapunovExponent: 0.72, description: 'International markets react overnight — Japanese collectors enter' },
      { timestamp: '2026-01-15T09:00:00Z', marketDelta: 1_450_000, entropy: 0.83, lyapunovExponent: 1.12, description: 'Morning FOMO wave — mass buying across all Wembanyama product' },
      { timestamp: '2026-01-15T14:00:00Z', marketDelta: 3_200_000, entropy: 0.91, lyapunovExponent: 1.45, description: 'Media coverage amplifies — ESPN mentions card market surge' },
      { timestamp: '2026-01-16T09:00:00Z', marketDelta: 4_870_000, entropy: 0.78, lyapunovExponent: 0.89, description: 'Market begins stabilizing at new elevated plateau' },
    ],
  },
  {
    id: 'evt-002',
    name: 'The Grading Misprint',
    category: 'grading',
    initialMagnitude: 'tiny',
    description: 'PSA accidentally labels a 1986 Fleer Michael Jordan #57 as a PSA 10 when internal records show PSA 8. The holder is sold at auction for $412,000. Reddit user discovers the discrepancy via label font analysis. PSA issues correction, but confidence in recent PSA 10 sales craters, triggering a 23% drop in PSA 10 vintage basketball prices across the board.',
    timestamp: '2026-02-03T11:00:00Z',
    affectedCards: [
      { cardId: 'c-mj-fleer86', cardName: '1986 Fleer #57 PSA 10', player: 'Michael Jordan', impactPercent: -48, delay_hours: 0, pathway: ['Label error discovered', 'Reddit post', 'Auction panic', 'Price collapse'], sensitivity: 99 },
      { cardId: 'c-mj-fleer86-9', cardName: '1986 Fleer #57 PSA 9', player: 'Michael Jordan', impactPercent: 28, delay_hours: 12, pathway: ['PSA 10 trust erosion', 'PSA 9 seen as safer', 'Flight to known-good grades'], sensitivity: 76 },
      { cardId: 'c-bird-86', cardName: '1986 Fleer #9 PSA 10', player: 'Larry Bird', impactPercent: -23, delay_hours: 24, pathway: ['Blanket PSA 10 skepticism', 'Vintage basketball selloff', 'Contagion pricing'], sensitivity: 68 },
      { cardId: 'c-magic-86', cardName: '1986 Fleer #53 PSA 10', player: 'Magic Johnson', impactPercent: -19, delay_hours: 24, pathway: ['Same set contagion', 'Risk-off vintage sentiment'], sensitivity: 61 },
      { cardId: 'c-bgs-mj', cardName: '1986 Fleer #57 BGS 9.5', player: 'Michael Jordan', impactPercent: 41, delay_hours: 48, pathway: ['Alternative grader flight', 'BGS trust premium', 'Demand shift'], sensitivity: 82 },
      { cardId: 'c-sgc-vintage', cardName: 'SGC Vintage Basketball Index', player: 'Index (multi)', impactPercent: 15, delay_hours: 72, pathway: ['SGC seen as consistent', 'New grading submissions spike', 'Index lifts'], sensitivity: 55 },
    ],
    totalMarketImpact: -12_300_000,
    amplificationFactor: 29800,
    chaosPath: [
      { timestamp: '2026-02-03T11:00:00Z', marketDelta: 0, entropy: 0.08, lyapunovExponent: 0.02, description: 'Mislabeled holder sold at Heritage Auctions — nobody notices yet' },
      { timestamp: '2026-02-04T09:22:00Z', marketDelta: -85000, entropy: 0.31, lyapunovExponent: 0.19, description: 'Reddit user u/GradingDetective posts label analysis with evidence' },
      { timestamp: '2026-02-04T14:00:00Z', marketDelta: -1_200_000, entropy: 0.58, lyapunovExponent: 0.67, description: 'Post hits front page of r/sportscards — PSA issues statement' },
      { timestamp: '2026-02-05T09:00:00Z', marketDelta: -5_400_000, entropy: 0.82, lyapunovExponent: 1.34, description: 'Mass PSA 10 vintage listings — panic selling begins' },
      { timestamp: '2026-02-06T09:00:00Z', marketDelta: -9_800_000, entropy: 0.93, lyapunovExponent: 1.61, description: 'BGS and SGC submissions spike 400% — grading confidence crisis' },
      { timestamp: '2026-02-08T09:00:00Z', marketDelta: -12_300_000, entropy: 0.71, lyapunovExponent: 0.94, description: 'Market finds floor — opportunistic buying begins on known-authentic holders' },
    ],
  },
  {
    id: 'evt-003',
    name: 'The Sideline Camera',
    category: 'injury',
    initialMagnitude: 'tiny',
    description: 'A sideline camera catches Patrick Mahomes favoring his right ankle during pre-game warmups. A fan posts the 8-second clip to X. Within 2 hours, Mahomes card prices drop 15%. He proceeds to throw 4 TDs. Prices overshoot the original level by 22% as relief combines with performance excitement.',
    timestamp: '2026-01-19T17:45:00Z',
    affectedCards: [
      { cardId: 'c-mahomes-nt', cardName: '2017 National Treasures RPA #101', player: 'Patrick Mahomes', impactPercent: -15, delay_hours: 0.5, pathway: ['Clip posted', 'Injury fear', 'Panic selling', 'Price drop'], sensitivity: 95 },
      { cardId: 'c-mahomes-pz', cardName: '2017 Prizm Silver #269', player: 'Patrick Mahomes', impactPercent: -12, delay_hours: 1, pathway: ['Correlated selling', 'All Mahomes cards affected'], sensitivity: 89 },
      { cardId: 'c-mahomes-nt-post', cardName: '2017 National Treasures RPA #101 (post-game)', player: 'Patrick Mahomes', impactPercent: 22, delay_hours: 6, pathway: ['4 TD game', 'Relief rally', 'Performance hype', 'Overshoot'], sensitivity: 95 },
      { cardId: 'c-kelce-pz', cardName: '2013 Prizm #292', player: 'Travis Kelce', impactPercent: -8, delay_hours: 1, pathway: ['Chiefs injury concern', 'Team-wide selloff'], sensitivity: 62 },
    ],
    totalMarketImpact: 1_340_000,
    amplificationFactor: 6700,
    chaosPath: [
      { timestamp: '2026-01-19T17:45:00Z', marketDelta: 0, entropy: 0.05, lyapunovExponent: 0.01, description: 'Fan records 8-second warmup clip on phone' },
      { timestamp: '2026-01-19T18:02:00Z', marketDelta: -120000, entropy: 0.34, lyapunovExponent: 0.28, description: 'Clip posted to X with caption "Mahomes limping??" — 50K views in 15 min' },
      { timestamp: '2026-01-19T18:30:00Z', marketDelta: -680000, entropy: 0.61, lyapunovExponent: 0.78, description: 'Sports betting lines shift — card sellers react' },
      { timestamp: '2026-01-19T19:15:00Z', marketDelta: -1_100_000, entropy: 0.74, lyapunovExponent: 1.05, description: 'Kickoff approaches — maximum uncertainty' },
      { timestamp: '2026-01-19T22:30:00Z', marketDelta: 450000, entropy: 0.42, lyapunovExponent: 0.38, description: 'Mahomes throws TD #3 — prices recover past baseline' },
      { timestamp: '2026-01-20T09:00:00Z', marketDelta: 1_340_000, entropy: 0.28, lyapunovExponent: 0.15, description: 'Morning after — relief rally overshoots, net positive' },
    ],
  },
  {
    id: 'evt-004',
    name: 'The Tweet',
    category: 'trade',
    initialMagnitude: 'small',
    description: 'Shohei Ohtani posts a cryptic tweet: a butterfly emoji followed by a city skyline that fans identify as New York. Trade rumors explode. Yankees Ohtani "what-if" cards spike. 72 hours later, it was for a cologne ad. But by then, the market has permanently shifted collector interest toward cross-sport narrative cards.',
    timestamp: '2026-02-20T22:14:00Z',
    affectedCards: [
      { cardId: 'c-ohtani-topps', cardName: '2018 Topps Update #US1 PSA 10', player: 'Shohei Ohtani', impactPercent: 89, delay_hours: 1, pathway: ['Cryptic tweet', 'Trade speculation', 'FOMO buying', 'Price surge'], sensitivity: 94 },
      { cardId: 'c-ohtani-bowman', cardName: '2018 Bowman Chrome Auto', player: 'Shohei Ohtani', impactPercent: 134, delay_hours: 2, pathway: ['Yankees narrative premium', 'Biggest market theory', 'Speculative spike'], sensitivity: 97 },
      { cardId: 'c-judge-topps', cardName: '2017 Topps Update #US99', player: 'Aaron Judge', impactPercent: 31, delay_hours: 6, pathway: ['Yankees teammate premium', 'Duo card dreams', 'Symbiotic lift'], sensitivity: 58 },
      { cardId: 'c-ohtani-correction', cardName: '2018 Topps Update #US1 (post-reveal)', player: 'Shohei Ohtani', impactPercent: -34, delay_hours: 72, pathway: ['Cologne ad revealed', 'Disappointment selling', 'Partial correction'], sensitivity: 94 },
    ],
    totalMarketImpact: 2_150_000,
    amplificationFactor: 4300,
    chaosPath: [
      { timestamp: '2026-02-20T22:14:00Z', marketDelta: 0, entropy: 0.10, lyapunovExponent: 0.03, description: 'Ohtani posts butterfly + skyline emoji tweet' },
      { timestamp: '2026-02-20T23:00:00Z', marketDelta: 380000, entropy: 0.44, lyapunovExponent: 0.41, description: 'Fans identify skyline as NYC — #OhtaniToYankees trends' },
      { timestamp: '2026-02-21T10:00:00Z', marketDelta: 1_800_000, entropy: 0.78, lyapunovExponent: 1.18, description: 'Morning FOMO wave — Ohtani cards see record eBay volume' },
      { timestamp: '2026-02-22T14:00:00Z', marketDelta: 3_200_000, entropy: 0.85, lyapunovExponent: 1.32, description: 'ESPN debate segment — mainstream fuel added to fire' },
      { timestamp: '2026-02-23T11:00:00Z', marketDelta: -1_050_000, entropy: 0.62, lyapunovExponent: 0.74, description: 'Cologne ad revealed — sharp correction but not full reversion' },
      { timestamp: '2026-02-24T09:00:00Z', marketDelta: 2_150_000, entropy: 0.38, lyapunovExponent: 0.29, description: 'Settles at net positive — narrative-premium cards now a category' },
    ],
  },
  {
    id: 'evt-005',
    name: 'The Break Hit',
    category: 'viral-moment',
    initialMagnitude: 'tiny',
    description: 'During a random Tuesday night YouTube live break with 340 viewers, a 2024 Topps Chrome Black 1/1 Superfractor Elly De La Cruz auto is pulled. The clip hits 8M views in 24 hours. It triggers a run on all 2024 Topps Chrome Black product and lifts the entire Elly De La Cruz market by 67%.',
    timestamp: '2026-01-28T21:18:00Z',
    affectedCards: [
      { cardId: 'c-elly-super', cardName: '2024 Topps Chrome Black 1/1 Superfractor Auto', player: 'Elly De La Cruz', impactPercent: 1200, delay_hours: 0, pathway: ['Pulled on stream', 'Clip goes viral', 'Historic-moment premium'], sensitivity: 99 },
      { cardId: 'c-elly-pz', cardName: '2024 Prizm Silver #150', player: 'Elly De La Cruz', impactPercent: 67, delay_hours: 6, pathway: ['Name recognition spike', 'New collectors enter', 'Rising tide'], sensitivity: 78 },
      { cardId: 'c-tcb-hobby', cardName: '2024 Topps Chrome Black Hobby Box', player: 'Product (sealed)', impactPercent: 340, delay_hours: 2, pathway: ['Everyone wants same experience', 'Product cleaned off shelves'], sensitivity: 92 },
      { cardId: 'c-elly-bowman', cardName: '2023 Bowman Chrome Auto', player: 'Elly De La Cruz', impactPercent: 48, delay_hours: 12, pathway: ['Collector deep-dive into player catalog', 'Earlier-year premium'], sensitivity: 71 },
      { cardId: 'c-break-channel', cardName: 'Break channel spot prices (avg)', player: 'Product (spots)', impactPercent: 85, delay_hours: 24, pathway: ['Breaker demand surges', 'Spot prices inflate across all products'], sensitivity: 65 },
    ],
    totalMarketImpact: 3_420_000,
    amplificationFactor: 17100,
    chaosPath: [
      { timestamp: '2026-01-28T21:18:00Z', marketDelta: 0, entropy: 0.04, lyapunovExponent: 0.01, description: '340 viewers watch as the Superfractor is pulled — streamer screams' },
      { timestamp: '2026-01-28T21:45:00Z', marketDelta: 15000, entropy: 0.22, lyapunovExponent: 0.14, description: 'Clip posted to X, Reddit, and YouTube Shorts simultaneously' },
      { timestamp: '2026-01-29T01:00:00Z', marketDelta: 280000, entropy: 0.49, lyapunovExponent: 0.56, description: '1M views — Topps Chrome Black product starts selling out' },
      { timestamp: '2026-01-29T09:00:00Z', marketDelta: 1_200_000, entropy: 0.72, lyapunovExponent: 0.95, description: 'Morning rush — Elly De La Cruz cards see 10x normal volume' },
      { timestamp: '2026-01-29T18:00:00Z', marketDelta: 2_800_000, entropy: 0.84, lyapunovExponent: 1.28, description: '5M views — breaker spot prices surge, sealed product vanishes' },
      { timestamp: '2026-01-30T12:00:00Z', marketDelta: 3_420_000, entropy: 0.68, lyapunovExponent: 0.76, description: 'Market begins to plateau — new floor established' },
    ],
  },
  {
    id: 'evt-006',
    name: 'The Rule Change',
    category: 'regulation',
    initialMagnitude: 'medium',
    description: 'MLB announces a new designated hitter rule allowing teams to use two DHs in interleague play. Power hitters suddenly become more valuable as demand for roster spots increases. Cards of aging sluggers who might have retired see a speculative renaissance. Pitchers who relied on easy DH matchups lose value.',
    timestamp: '2026-03-01T14:00:00Z',
    affectedCards: [
      { cardId: 'c-stanton-topps', cardName: '2018 Topps Chrome #100', player: 'Giancarlo Stanton', impactPercent: 45, delay_hours: 2, pathway: ['Rule announced', 'Extended career thesis', 'DH premium'], sensitivity: 73 },
      { cardId: 'c-cruz-topps', cardName: '2015 Topps #500', player: 'Nelson Cruz', impactPercent: 38, delay_hours: 4, pathway: ['Aging slugger category lift', 'Nostalgia + utility'], sensitivity: 56 },
      { cardId: 'c-degrom-topps', cardName: '2014 Topps Update #US50', player: 'Jacob deGrom', impactPercent: -12, delay_hours: 8, pathway: ['Pitcher value reevaluation', 'Less favorable matchups'], sensitivity: 64 },
      { cardId: 'c-ohtani-rule', cardName: '2018 Topps Update #US1', player: 'Shohei Ohtani', impactPercent: 18, delay_hours: 1, pathway: ['Two-way player even more valuable', 'Unique asset premium'], sensitivity: 81 },
    ],
    totalMarketImpact: 890_000,
    amplificationFactor: 890,
    chaosPath: [
      { timestamp: '2026-03-01T14:00:00Z', marketDelta: 0, entropy: 0.15, lyapunovExponent: 0.05, description: 'MLB Commissioner announces double-DH rule at press conference' },
      { timestamp: '2026-03-01T15:30:00Z', marketDelta: 120000, entropy: 0.33, lyapunovExponent: 0.22, description: 'Card Twitter debates implications — power hitter buying begins' },
      { timestamp: '2026-03-01T20:00:00Z', marketDelta: 410000, entropy: 0.52, lyapunovExponent: 0.48, description: 'Analytics community publishes WAR impact projections' },
      { timestamp: '2026-03-02T12:00:00Z', marketDelta: 720000, entropy: 0.61, lyapunovExponent: 0.59, description: 'Fantasy baseball platforms adjust rankings — card prices follow' },
      { timestamp: '2026-03-03T09:00:00Z', marketDelta: 890000, entropy: 0.44, lyapunovExponent: 0.31, description: 'New equilibrium reached — DH premium becomes priced in' },
    ],
  },
  {
    id: 'evt-007',
    name: 'The AI Valuation Glitch',
    category: 'regulation',
    initialMagnitude: 'tiny',
    description: 'A popular card pricing algorithm (MarketMint AI) has a data pipeline error that briefly displays all LeBron James rookies as 80% undervalued. Bots trigger mass buy orders before the error is corrected 47 minutes later. The flash-buy event creates a real price floor that persists even after the correction because holders refuse to sell at pre-glitch prices.',
    timestamp: '2026-02-12T03:14:00Z',
    affectedCards: [
      { cardId: 'c-lebron-topps', cardName: '2003 Topps Chrome #111 PSA 10', player: 'LeBron James', impactPercent: 34, delay_hours: 0, pathway: ['Algorithm error', 'Bot buying wave', 'Price floor established'], sensitivity: 96 },
      { cardId: 'c-lebron-exq', cardName: '2003 Exquisite Collection RPA', player: 'LeBron James', impactPercent: 28, delay_hours: 0.2, pathway: ['Blanket LeBron buy signal', 'Whale-level bot purchasing'], sensitivity: 98 },
      { cardId: 'c-lebron-bowman', cardName: '2003 Bowman Chrome #123 PSA 10', player: 'LeBron James', impactPercent: 31, delay_hours: 0.3, pathway: ['All LeBron rookies flagged', 'Automated sweep'], sensitivity: 93 },
      { cardId: 'c-mj-comps', cardName: 'GOAT-debate comp cards (index)', player: 'Index (multi)', impactPercent: 11, delay_hours: 12, pathway: ['LeBron lifts GOAT category', 'MJ comps adjust sympathetically'], sensitivity: 47 },
      { cardId: 'c-ai-trust', cardName: 'AI-priced card index (broad)', player: 'Index (multi)', impactPercent: -8, delay_hours: 48, pathway: ['Trust in AI pricing drops', 'Wider bid-ask spreads', 'Liquidity reduction'], sensitivity: 72 },
    ],
    totalMarketImpact: 8_900_000,
    amplificationFactor: 44500,
    chaosPath: [
      { timestamp: '2026-02-12T03:14:00Z', marketDelta: 0, entropy: 0.03, lyapunovExponent: 0.01, description: 'MarketMint AI pipeline ingests corrupted comp data at 3:14 AM' },
      { timestamp: '2026-02-12T03:15:00Z', marketDelta: 1_200_000, entropy: 0.55, lyapunovExponent: 0.89, description: 'Automated trading bots execute buy orders within 60 seconds' },
      { timestamp: '2026-02-12T03:28:00Z', marketDelta: 5_400_000, entropy: 0.88, lyapunovExponent: 1.67, description: 'Secondary bots detect volume spike and pile in' },
      { timestamp: '2026-02-12T04:01:00Z', marketDelta: 7_200_000, entropy: 0.76, lyapunovExponent: 1.21, description: 'MarketMint publishes correction — but inventory is already bought' },
      { timestamp: '2026-02-12T09:00:00Z', marketDelta: 8_400_000, entropy: 0.62, lyapunovExponent: 0.85, description: 'Human traders wake up to new reality — holders refuse to sell below bot price' },
      { timestamp: '2026-02-13T09:00:00Z', marketDelta: 8_900_000, entropy: 0.48, lyapunovExponent: 0.52, description: 'New floor accepted — AI-established price persists' },
    ],
  },
  {
    id: 'evt-008',
    name: 'The Warehouse Find',
    category: 'grading',
    initialMagnitude: 'small',
    description: 'A forgotten Topps warehouse in rural Pennsylvania is discovered during a commercial real estate transaction. Inside: 2,400 sealed cases of 1987 Topps Baseball — including an estimated 12,000 Barry Bonds and Bo Jackson rookies. The sudden supply shock craters 1987 Topps values but lifts interest in card collecting broadly, helping modern product.',
    timestamp: '2026-02-25T10:00:00Z',
    affectedCards: [
      { cardId: 'c-bonds-87', cardName: '1987 Topps #320', player: 'Barry Bonds', impactPercent: -72, delay_hours: 4, pathway: ['Warehouse news breaks', 'Supply shock fears', 'Mass selling of existing inventory'], sensitivity: 88 },
      { cardId: 'c-bo-87', cardName: '1987 Topps #170', player: 'Bo Jackson', impactPercent: -65, delay_hours: 4, pathway: ['Same product supply flood', 'Junk wax narrative reinforced'], sensitivity: 85 },
      { cardId: 'c-87topps-set', cardName: '1987 Topps Complete Set (sealed)', player: 'Product (sealed)', impactPercent: -81, delay_hours: 2, pathway: ['Direct supply competition', 'Price collapse immediate'], sensitivity: 95 },
      { cardId: 'c-jeter-sp', cardName: '1993 SP Foil #279', player: 'Derek Jeter', impactPercent: -9, delay_hours: 48, pathway: ['Vintage confidence contagion', 'What else is in a warehouse?'], sensitivity: 34 },
      { cardId: 'c-modern-index', cardName: 'Modern Chrome/Prizm Index', player: 'Index (multi)', impactPercent: 12, delay_hours: 72, pathway: ['Media coverage drives new collectors', 'New entrants buy modern', 'Rising tide'], sensitivity: 41 },
    ],
    totalMarketImpact: -6_200_000,
    amplificationFactor: 3100,
    chaosPath: [
      { timestamp: '2026-02-25T10:00:00Z', marketDelta: 0, entropy: 0.11, lyapunovExponent: 0.04, description: 'Real estate agent posts warehouse photos on local Facebook group' },
      { timestamp: '2026-02-25T14:00:00Z', marketDelta: -800000, entropy: 0.42, lyapunovExponent: 0.38, description: 'Card hobby journalist verifies the find and publishes story' },
      { timestamp: '2026-02-25T20:00:00Z', marketDelta: -2_900_000, entropy: 0.71, lyapunovExponent: 0.92, description: '1987 Topps sellers race to exit — prices freefall' },
      { timestamp: '2026-02-26T09:00:00Z', marketDelta: -5_100_000, entropy: 0.86, lyapunovExponent: 1.38, description: 'Junk wax era PTSD — contagion hits adjacent years' },
      { timestamp: '2026-02-27T09:00:00Z', marketDelta: -6_200_000, entropy: 0.73, lyapunovExponent: 0.88, description: 'Floor found — bulk buyers see opportunity in sealed cases' },
      { timestamp: '2026-02-28T09:00:00Z', marketDelta: -5_800_000, entropy: 0.55, lyapunovExponent: 0.51, description: 'Media buzz brings 15K new app signups — modern product benefits' },
    ],
  },
  {
    id: 'evt-009',
    name: 'The Podcast Slip',
    category: 'media-appearance',
    initialMagnitude: 'tiny',
    description: 'During a casual podcast appearance, Luka Doncic mentions he personally collects his own rookie cards "because they will be worth millions someday." The comment, meant as a joke, triggers a player-endorsement premium thesis. Suddenly every card of a player known to collect their own cards gets a 15-30% bump.',
    timestamp: '2026-01-22T16:30:00Z',
    affectedCards: [
      { cardId: 'c-luka-pz', cardName: '2018 Prizm Silver #280', player: 'Luka Doncic', impactPercent: 42, delay_hours: 2, pathway: ['Podcast clip viral', 'Player-endorsement premium', 'Buying wave'], sensitivity: 87 },
      { cardId: 'c-luka-nt', cardName: '2018 National Treasures RPA', player: 'Luka Doncic', impactPercent: 38, delay_hours: 3, pathway: ['High-end gets player-belief premium', 'Trophy card demand'], sensitivity: 91 },
      { cardId: 'c-giannis-pz', cardName: '2013 Prizm #290', player: 'Giannis Antetokounmpo', impactPercent: 18, delay_hours: 24, pathway: ['Known self-collector', 'Category premium applied'], sensitivity: 52 },
      { cardId: 'c-tatum-nt', cardName: '2017 National Treasures RPA', player: 'Jayson Tatum', impactPercent: 15, delay_hours: 24, pathway: ['Rumored self-collector', 'Speculative premium'], sensitivity: 48 },
    ],
    totalMarketImpact: 1_780_000,
    amplificationFactor: 8900,
    chaosPath: [
      { timestamp: '2026-01-22T16:30:00Z', marketDelta: 0, entropy: 0.06, lyapunovExponent: 0.02, description: 'Luka makes offhand comment on "Courtside Chats" podcast' },
      { timestamp: '2026-01-22T18:00:00Z', marketDelta: 45000, entropy: 0.19, lyapunovExponent: 0.11, description: 'Clip shared on X with "Luka knows" caption' },
      { timestamp: '2026-01-22T22:00:00Z', marketDelta: 320000, entropy: 0.43, lyapunovExponent: 0.39, description: 'Card Twitter creates "player-collector premium" narrative' },
      { timestamp: '2026-01-23T12:00:00Z', marketDelta: 980000, entropy: 0.64, lyapunovExponent: 0.72, description: 'Buying spreads to all known player-collectors cards' },
      { timestamp: '2026-01-24T09:00:00Z', marketDelta: 1_540_000, entropy: 0.71, lyapunovExponent: 0.81, description: 'Analytics accounts publish "self-collector index" — legitimizes narrative' },
      { timestamp: '2026-01-25T09:00:00Z', marketDelta: 1_780_000, entropy: 0.52, lyapunovExponent: 0.44, description: 'Premium stabilizes — new pricing factor accepted by market' },
    ],
  },
  {
    id: 'evt-010',
    name: 'The Scandal Leak',
    category: 'scandal',
    initialMagnitude: 'small',
    description: 'An anonymous source leaks alleged PED test results for a top NFL prospect days before the draft. The leak is later proven fabricated, but not before the player falls 8 spots in the draft, destroying his rookie card premium. When vindicated, his cards surge past pre-scandal levels on a sympathy/underdog narrative.',
    timestamp: '2026-02-15T08:00:00Z',
    affectedCards: [
      { cardId: 'c-prospect-bowman', cardName: '2025 Bowman Chrome 1st Auto', player: 'Marcus Chen (fictional)', impactPercent: -58, delay_hours: 1, pathway: ['Leak published', 'Draft stock cratering', 'Card fire sale'], sensitivity: 96 },
      { cardId: 'c-prospect-post', cardName: '2025 Bowman Chrome 1st Auto (post-vindication)', player: 'Marcus Chen (fictional)', impactPercent: 87, delay_hours: 168, pathway: ['Vindication news', 'Underdog narrative', 'Sympathy buying', 'Draft steal thesis'], sensitivity: 96 },
      { cardId: 'c-draft-class', cardName: '2025 Draft Class Index', player: 'Index (multi)', impactPercent: -14, delay_hours: 6, pathway: ['Draft integrity concerns', 'Blanket risk-off'], sensitivity: 52 },
      { cardId: 'c-clean-prospects', cardName: '2025 Bowman Chrome (other top prospects)', player: 'Index (multi)', impactPercent: 9, delay_hours: 12, pathway: ['Flight to "safe" prospects', 'Reallocation of capital'], sensitivity: 38 },
    ],
    totalMarketImpact: -920_000,
    amplificationFactor: 4600,
    chaosPath: [
      { timestamp: '2026-02-15T08:00:00Z', marketDelta: 0, entropy: 0.14, lyapunovExponent: 0.06, description: 'Anonymous leak posted to sports gambling forum' },
      { timestamp: '2026-02-15T09:30:00Z', marketDelta: -380000, entropy: 0.52, lyapunovExponent: 0.58, description: 'Major sports outlets pick up story with "alleged" qualifier' },
      { timestamp: '2026-02-15T14:00:00Z', marketDelta: -1_200_000, entropy: 0.79, lyapunovExponent: 1.14, description: 'Card market prices in worst case — fire sale on prospect cards' },
      { timestamp: '2026-02-16T09:00:00Z', marketDelta: -1_800_000, entropy: 0.88, lyapunovExponent: 1.41, description: 'NFL team sources cast doubt — maximum chaos as narratives collide' },
      { timestamp: '2026-02-22T10:00:00Z', marketDelta: -920000, entropy: 0.61, lyapunovExponent: 0.68, description: 'Full vindication published — partial recovery begins but draft damage done' },
      { timestamp: '2026-03-01T09:00:00Z', marketDelta: 340000, entropy: 0.35, lyapunovExponent: 0.22, description: 'Underdog narrative fully takes hold — net positive emerging' },
    ],
  },
];

// ---- Mock Data: Strange Attractors ----

const strangeAttractors: StrangeAttractor[] = [
  {
    id: 'attr-001',
    name: 'The Hype Cycle Attractor',
    description: 'Cards of hyped rookies follow a predictable strange attractor pattern: explosive initial growth, overshoot, crash, and then orbit around a "true value" basin. The trajectory is deterministic chaos — each cycle looks similar but never exactly repeats.',
    cards: ['Victor Wembanyama', 'Chet Holmgren', 'Paolo Banchero', 'Anthony Edwards', 'LaMelo Ball'],
    pattern: generateLorenzAttractor(300, 0.008, 10, 28, 2.667),
    basinOfAttraction: 0.73,
    periodicity: 4.2,
  },
  {
    id: 'attr-002',
    name: 'The Grading Confidence Orbit',
    description: 'Market confidence in grading companies oscillates chaotically between PSA, BGS, and SGC. When one grader has a scandal, capital flows to alternatives in a Rossler-like spiral that never returns to the same equilibrium.',
    cards: ['PSA 10 Index', 'BGS 9.5 Index', 'SGC 10 Index', 'Raw Card Index', 'Crossover Submissions'],
    pattern: generateRosslerAttractor(300, 0.04, 0.2, 0.2, 5.7),
    basinOfAttraction: 0.58,
    periodicity: 6.1,
  },
  {
    id: 'attr-003',
    name: 'The Vintage-Modern Oscillator',
    description: 'Capital allocation between vintage and modern cards follows a dual-scroll attractor. Market sentiment rotates between "vintage is safe" and "modern has upside" in a chaotic but bounded pattern with occasional phase transitions.',
    cards: ['1952 Topps Mantle', '1986 Fleer Jordan', '2003 Topps Chrome LeBron', '2018 Prizm Luka', '2024 Bowman Chrome Wemby'],
    pattern: generateLorenzAttractor(300, 0.006, 10, 28, 2.667).map(p => ({
      x: p.x * 0.7,
      y: p.y * 1.2,
      z: p.z * 0.5 + 10,
    })),
    basinOfAttraction: 0.82,
    periodicity: 8.4,
  },
  {
    id: 'attr-004',
    name: 'The Social Virality Attractor',
    description: 'Social media driven price movements follow a chaotic attractor where engagement velocity, sentiment polarity, and price momentum create a three-dimensional phase space. Viral moments create temporary escapes from the attractor before prices spiral back.',
    cards: ['Viral Hit Cards', 'Influencer-Featured Cards', 'TikTok Trending Cards', 'YouTube Break Hits', 'Meme Cards'],
    pattern: generateRosslerAttractor(300, 0.035, 0.15, 0.2, 6.5).map(p => ({
      x: p.x * 1.3,
      y: p.y * 0.8 + 5,
      z: Math.abs(p.z) * 0.4,
    })),
    basinOfAttraction: 0.41,
    periodicity: 2.8,
  },
  {
    id: 'attr-005',
    name: 'The Supply Shock Spiral',
    description: 'When unexpected supply enters the market (warehouse finds, overproduction reveals, mass submissions), prices follow a damped chaotic spiral. Each supply shock creates a unique trajectory but all share the same underlying attractor geometry.',
    cards: ['Junk Wax Era Cards', 'Modern Overproduction Index', 'Limited Print Run Index', '1/1 Cards Index', 'Sealed Product Index'],
    pattern: generateLorenzAttractor(300, 0.007, 12, 25, 3.0).map(p => ({
      x: p.x * 0.5 - 8,
      y: p.y * 0.5,
      z: p.z * 0.6 + 5,
    })),
    basinOfAttraction: 0.67,
    periodicity: 5.5,
  },
];

// ---- Mock Data: Sensitivity Maps ----

const sensitivityMaps: SensitivityMap[] = [
  {
    cardId: 'c-wemby-bc',
    cardName: '2024 Bowman Chrome Auto — Victor Wembanyama',
    factors: [
      { factor: 'Social Media Mentions', sensitivity: 97, nonLinearity: 'exponential' },
      { factor: 'Game Performance (pts/gm)', sensitivity: 88, nonLinearity: 'logarithmic' },
      { factor: 'Injury News', sensitivity: 94, nonLinearity: 'chaotic' },
      { factor: 'Team Playoff Odds', sensitivity: 72, nonLinearity: 'linear' },
      { factor: 'Grading Population Report', sensitivity: 65, nonLinearity: 'exponential' },
      { factor: 'Sealed Product Price', sensitivity: 81, nonLinearity: 'linear' },
      { factor: 'Influencer Endorsement', sensitivity: 91, nonLinearity: 'chaotic' },
      { factor: 'Comparable Player Prices', sensitivity: 58, nonLinearity: 'logarithmic' },
    ],
  },
  {
    cardId: 'c-lebron-topps',
    cardName: '2003 Topps Chrome #111 PSA 10 — LeBron James',
    factors: [
      { factor: 'Retirement Speculation', sensitivity: 96, nonLinearity: 'chaotic' },
      { factor: 'GOAT Debate Sentiment', sensitivity: 78, nonLinearity: 'logarithmic' },
      { factor: 'AI Pricing Algorithms', sensitivity: 89, nonLinearity: 'chaotic' },
      { factor: 'PSA Population Changes', sensitivity: 71, nonLinearity: 'exponential' },
      { factor: 'Macro Economy (S&P500)', sensitivity: 62, nonLinearity: 'linear' },
      { factor: 'Auction House Events', sensitivity: 74, nonLinearity: 'logarithmic' },
      { factor: 'Season Milestones', sensitivity: 85, nonLinearity: 'exponential' },
      { factor: 'Media Appearances', sensitivity: 54, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-mj-fleer86',
    cardName: '1986 Fleer #57 PSA 10 — Michael Jordan',
    factors: [
      { factor: 'Grading Company Trust', sensitivity: 99, nonLinearity: 'chaotic' },
      { factor: 'Documentary/Film Releases', sensitivity: 72, nonLinearity: 'exponential' },
      { factor: 'Vintage Market Sentiment', sensitivity: 84, nonLinearity: 'logarithmic' },
      { factor: 'PSA 10 Pop Count', sensitivity: 91, nonLinearity: 'exponential' },
      { factor: 'Auction Record Sales', sensitivity: 77, nonLinearity: 'chaotic' },
      { factor: 'Alternative Asset Flows', sensitivity: 68, nonLinearity: 'linear' },
      { factor: 'Counterfeiting News', sensitivity: 88, nonLinearity: 'chaotic' },
      { factor: 'Interest Rates', sensitivity: 45, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-mahomes-nt',
    cardName: '2017 National Treasures RPA — Patrick Mahomes',
    factors: [
      { factor: 'Game Day Performance', sensitivity: 93, nonLinearity: 'chaotic' },
      { factor: 'Injury Speculation', sensitivity: 95, nonLinearity: 'chaotic' },
      { factor: 'Championship Odds', sensitivity: 86, nonLinearity: 'exponential' },
      { factor: 'Social Media Clips', sensitivity: 79, nonLinearity: 'exponential' },
      { factor: 'Contract News', sensitivity: 61, nonLinearity: 'logarithmic' },
      { factor: 'Comparable QB Prices', sensitivity: 55, nonLinearity: 'linear' },
      { factor: 'NFL Rule Changes', sensitivity: 42, nonLinearity: 'linear' },
      { factor: 'Sealed Product Releases', sensitivity: 38, nonLinearity: 'logarithmic' },
    ],
  },
  {
    cardId: 'c-ohtani-topps',
    cardName: '2018 Topps Update #US1 PSA 10 — Shohei Ohtani',
    factors: [
      { factor: 'Trade Rumors', sensitivity: 94, nonLinearity: 'chaotic' },
      { factor: 'Two-Way Performance', sensitivity: 91, nonLinearity: 'logarithmic' },
      { factor: 'Social Media Posts (player)', sensitivity: 97, nonLinearity: 'chaotic' },
      { factor: 'Japanese Market Demand', sensitivity: 82, nonLinearity: 'exponential' },
      { factor: 'MLB Milestones', sensitivity: 76, nonLinearity: 'exponential' },
      { factor: 'Endorsement Deals', sensitivity: 58, nonLinearity: 'linear' },
      { factor: 'Competitor Player Performance', sensitivity: 44, nonLinearity: 'linear' },
      { factor: 'Currency Exchange (JPY/USD)', sensitivity: 39, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-luka-pz',
    cardName: '2018 Prizm Silver #280 — Luka Doncic',
    factors: [
      { factor: 'Player Statements/Interviews', sensitivity: 87, nonLinearity: 'chaotic' },
      { factor: 'Playoff Performance', sensitivity: 92, nonLinearity: 'exponential' },
      { factor: 'MVP Race Standing', sensitivity: 85, nonLinearity: 'logarithmic' },
      { factor: 'European Market Demand', sensitivity: 71, nonLinearity: 'linear' },
      { factor: 'Team Trade Rumors', sensitivity: 78, nonLinearity: 'chaotic' },
      { factor: 'Prizm Product Supply', sensitivity: 64, nonLinearity: 'exponential' },
      { factor: 'Highlight Reel Moments', sensitivity: 83, nonLinearity: 'exponential' },
      { factor: 'Comparable Guard Prices', sensitivity: 49, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-elly-pz',
    cardName: '2024 Prizm Silver #150 — Elly De La Cruz',
    factors: [
      { factor: 'Viral Moments', sensitivity: 92, nonLinearity: 'chaotic' },
      { factor: 'Speed/Athletic Highlights', sensitivity: 88, nonLinearity: 'exponential' },
      { factor: 'YouTube Break Frequency', sensitivity: 79, nonLinearity: 'exponential' },
      { factor: 'Stolen Base Records', sensitivity: 74, nonLinearity: 'logarithmic' },
      { factor: 'Team Competitiveness', sensitivity: 56, nonLinearity: 'linear' },
      { factor: 'Young Star Comparisons', sensitivity: 68, nonLinearity: 'logarithmic' },
      { factor: 'TikTok Engagement', sensitivity: 85, nonLinearity: 'chaotic' },
      { factor: 'All-Star Selection', sensitivity: 71, nonLinearity: 'exponential' },
    ],
  },
  {
    cardId: 'c-judge-topps',
    cardName: '2017 Topps Update #US99 — Aaron Judge',
    factors: [
      { factor: 'Home Run Pace', sensitivity: 95, nonLinearity: 'exponential' },
      { factor: 'Yankees Narrative', sensitivity: 73, nonLinearity: 'logarithmic' },
      { factor: 'Injury History Concern', sensitivity: 88, nonLinearity: 'chaotic' },
      { factor: 'MVP/Award Odds', sensitivity: 81, nonLinearity: 'exponential' },
      { factor: 'Stadium Attendance', sensitivity: 42, nonLinearity: 'linear' },
      { factor: 'Teammate Card Correlation', sensitivity: 57, nonLinearity: 'linear' },
      { factor: 'Record Chase Coverage', sensitivity: 90, nonLinearity: 'chaotic' },
      { factor: 'Free Agency Market', sensitivity: 36, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-kelce-pz',
    cardName: '2013 Prizm #292 — Travis Kelce',
    factors: [
      { factor: 'Celebrity/Pop Culture News', sensitivity: 91, nonLinearity: 'chaotic' },
      { factor: 'Game Day Stats', sensitivity: 74, nonLinearity: 'logarithmic' },
      { factor: 'Mahomes Correlation', sensitivity: 82, nonLinearity: 'exponential' },
      { factor: 'Retirement Timeline', sensitivity: 86, nonLinearity: 'chaotic' },
      { factor: 'Media Appearances', sensitivity: 88, nonLinearity: 'exponential' },
      { factor: 'Tight End Market Comps', sensitivity: 45, nonLinearity: 'linear' },
      { factor: 'Super Bowl Odds', sensitivity: 69, nonLinearity: 'exponential' },
      { factor: 'Social Media Following Growth', sensitivity: 77, nonLinearity: 'logarithmic' },
    ],
  },
  {
    cardId: 'c-bonds-87',
    cardName: '1987 Topps #320 — Barry Bonds',
    factors: [
      { factor: 'Supply Discovery Events', sensitivity: 95, nonLinearity: 'chaotic' },
      { factor: 'HOF Ballot Results', sensitivity: 89, nonLinearity: 'exponential' },
      { factor: 'Junk Wax Sentiment', sensitivity: 84, nonLinearity: 'logarithmic' },
      { factor: 'Warehouse Find Rumors', sensitivity: 92, nonLinearity: 'chaotic' },
      { factor: 'Historical Revisionism', sensitivity: 71, nonLinearity: 'logarithmic' },
      { factor: 'Sealed Product Openings', sensitivity: 58, nonLinearity: 'linear' },
      { factor: 'Record Book Changes', sensitivity: 66, nonLinearity: 'exponential' },
      { factor: 'Nostalgia Cycle', sensitivity: 53, nonLinearity: 'logarithmic' },
    ],
  },
  {
    cardId: 'c-giannis-pz',
    cardName: '2013 Prizm #290 — Giannis Antetokounmpo',
    factors: [
      { factor: 'Championship Performance', sensitivity: 93, nonLinearity: 'exponential' },
      { factor: 'International Market Growth', sensitivity: 78, nonLinearity: 'logarithmic' },
      { factor: 'Player Self-Collecting News', sensitivity: 72, nonLinearity: 'chaotic' },
      { factor: 'MVP Voting', sensitivity: 84, nonLinearity: 'exponential' },
      { factor: 'Greek Market Demand', sensitivity: 61, nonLinearity: 'linear' },
      { factor: 'Dynasty Narrative', sensitivity: 77, nonLinearity: 'logarithmic' },
      { factor: 'Injury Recovery Stories', sensitivity: 88, nonLinearity: 'chaotic' },
      { factor: 'All-NBA Selections', sensitivity: 66, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-tatum-nt',
    cardName: '2017 National Treasures RPA — Jayson Tatum',
    factors: [
      { factor: 'Celtics Dynasty Talk', sensitivity: 86, nonLinearity: 'exponential' },
      { factor: 'Playoff Series Performance', sensitivity: 94, nonLinearity: 'chaotic' },
      { factor: 'Kobe Comparison Narrative', sensitivity: 69, nonLinearity: 'logarithmic' },
      { factor: 'Olympic Performance', sensitivity: 73, nonLinearity: 'exponential' },
      { factor: 'Contract Extensions', sensitivity: 55, nonLinearity: 'linear' },
      { factor: 'All-Star Game Impact', sensitivity: 48, nonLinearity: 'linear' },
      { factor: 'Player Self-Collecting Rumors', sensitivity: 62, nonLinearity: 'chaotic' },
      { factor: 'Eastern Conference Parity', sensitivity: 41, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-jeter-sp',
    cardName: '1993 SP Foil #279 — Derek Jeter',
    factors: [
      { factor: 'Vintage Supply Shocks', sensitivity: 78, nonLinearity: 'chaotic' },
      { factor: 'HOF Ceremony Events', sensitivity: 64, nonLinearity: 'exponential' },
      { factor: 'Yankees Nostalgia Cycle', sensitivity: 72, nonLinearity: 'logarithmic' },
      { factor: 'Documentary Releases', sensitivity: 68, nonLinearity: 'exponential' },
      { factor: 'Auction House Marquee Sales', sensitivity: 81, nonLinearity: 'chaotic' },
      { factor: 'PSA Pop Report Changes', sensitivity: 76, nonLinearity: 'exponential' },
      { factor: 'Millennial Collector Demographics', sensitivity: 59, nonLinearity: 'logarithmic' },
      { factor: 'Interest Rate Environment', sensitivity: 44, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-degrom-topps',
    cardName: '2014 Topps Update #US50 — Jacob deGrom',
    factors: [
      { factor: 'Health Status Updates', sensitivity: 97, nonLinearity: 'chaotic' },
      { factor: 'Pitching Performance (ERA)', sensitivity: 82, nonLinearity: 'logarithmic' },
      { factor: 'Rule Changes (Pitcher)', sensitivity: 74, nonLinearity: 'exponential' },
      { factor: 'Contract Situation', sensitivity: 68, nonLinearity: 'linear' },
      { factor: 'Cy Young Odds', sensitivity: 79, nonLinearity: 'exponential' },
      { factor: 'Comeback Narrative', sensitivity: 85, nonLinearity: 'chaotic' },
      { factor: 'Pitching Market Comps', sensitivity: 51, nonLinearity: 'linear' },
      { factor: 'Team Contention Status', sensitivity: 56, nonLinearity: 'linear' },
    ],
  },
  {
    cardId: 'c-stanton-topps',
    cardName: '2018 Topps Chrome #100 — Giancarlo Stanton',
    factors: [
      { factor: 'DH Rule Changes', sensitivity: 88, nonLinearity: 'exponential' },
      { factor: 'Home Run Pace', sensitivity: 91, nonLinearity: 'exponential' },
      { factor: 'Injury Availability', sensitivity: 93, nonLinearity: 'chaotic' },
      { factor: 'Yankees Lineup Changes', sensitivity: 65, nonLinearity: 'linear' },
      { factor: 'Power Hitter Market Trend', sensitivity: 72, nonLinearity: 'logarithmic' },
      { factor: 'Retirement Timeline', sensitivity: 79, nonLinearity: 'chaotic' },
      { factor: 'Slugger Nostalgia Factor', sensitivity: 58, nonLinearity: 'logarithmic' },
      { factor: 'Contract Value Perception', sensitivity: 44, nonLinearity: 'linear' },
    ],
  },
];

// ---- Mock Data: Chaos Simulations ----

function buildSimTimelines(baseValue: number, days: number, variations: { id: string; variation: string; outcome: string; drift: number; volatility: number; shock?: { day: number; magnitude: number } }[]): SimTimeline[] {
  return variations.map(v => {
    const path: SimTimelinePoint[] = [];
    let value = baseValue;
    for (let d = 0; d <= days; d++) {
      if (v.shock && d === v.shock.day) {
        value *= (1 + v.shock.magnitude);
      }
      value += value * v.drift + value * v.volatility * (Math.sin(d * 0.7 + v.drift * 100) * 0.5 + Math.cos(d * 1.3 + v.volatility * 50) * 0.3);
      path.push({ day: d, portfolioValue: Math.round(value) });
    }
    return { id: v.id, variation: v.variation, path, outcome: v.outcome };
  });
}

const chaosSimulations: ChaosSimulation[] = [
  {
    eventId: 'evt-001',
    iterations: 10000,
    timelines: buildSimTimelines(50000, 90, [
      { id: 'tl-1a', variation: 'Instagram post goes viral (actual)', drift: 0.004, volatility: 0.012, outcome: 'Portfolio reaches $68,400 — 37% gain driven by Wembanyama surge', shock: { day: 5, magnitude: 0.18 } },
      { id: 'tl-1b', variation: 'Post gets minimal engagement', drift: 0.001, volatility: 0.008, outcome: 'Portfolio reaches $53,200 — modest 6% organic growth', shock: undefined },
      { id: 'tl-1c', variation: 'Post goes viral + ESPN covers it', drift: 0.006, volatility: 0.018, outcome: 'Portfolio reaches $82,100 — 64% gain, mainstream attention amplifies', shock: { day: 5, magnitude: 0.28 } },
      { id: 'tl-1d', variation: 'Post goes viral but card is fake', drift: -0.003, volatility: 0.022, outcome: 'Portfolio drops to $41,300 — 17% loss, influencer trust crisis', shock: { day: 5, magnitude: -0.15 } },
      { id: 'tl-1e', variation: 'Post deleted within 1 hour', drift: 0.0015, volatility: 0.009, outcome: 'Portfolio reaches $54,800 — slight ripple, quickly forgotten', shock: { day: 5, magnitude: 0.03 } },
    ]),
    divergencePoint: 5,
    maxDivergence: 40800,
  },
  {
    eventId: 'evt-007',
    iterations: 10000,
    timelines: buildSimTimelines(120000, 60, [
      { id: 'tl-2a', variation: 'AI glitch triggers bots (actual)', drift: 0.003, volatility: 0.015, outcome: 'Portfolio reaches $158,200 — 32% gain, new floor established by bots', shock: { day: 2, magnitude: 0.22 } },
      { id: 'tl-2b', variation: 'Glitch caught before bots activate', drift: 0.001, volatility: 0.007, outcome: 'Portfolio reaches $124,800 — 4% natural appreciation', shock: undefined },
      { id: 'tl-2c', variation: 'Glitch + human FOMO pile-on', drift: 0.005, volatility: 0.025, outcome: 'Portfolio reaches $191,400 — 60% gain, bot floor + human mania', shock: { day: 2, magnitude: 0.35 } },
      { id: 'tl-2d', variation: 'Glitch triggers sell bots instead', drift: -0.004, volatility: 0.02, outcome: 'Portfolio drops to $89,600 — 25% loss, flash crash scenario', shock: { day: 2, magnitude: -0.2 } },
      { id: 'tl-2e', variation: 'Glitch detected, exchange halts trading', drift: 0.0008, volatility: 0.005, outcome: 'Portfolio reaches $122,900 — 2% gain, orderly resolution', shock: undefined },
    ]),
    divergencePoint: 2,
    maxDivergence: 101800,
  },
  {
    eventId: 'evt-010',
    iterations: 10000,
    timelines: buildSimTimelines(35000, 120, [
      { id: 'tl-3a', variation: 'Scandal leak + vindication (actual)', drift: 0.001, volatility: 0.014, outcome: 'Portfolio reaches $38,200 — 9% gain after volatile round-trip', shock: { day: 10, magnitude: -0.25 } },
      { id: 'tl-3b', variation: 'No leak occurs', drift: 0.002, volatility: 0.008, outcome: 'Portfolio reaches $42,100 — 20% steady growth, drafted as expected', shock: undefined },
      { id: 'tl-3c', variation: 'Leak is true — PED confirmed', drift: -0.006, volatility: 0.025, outcome: 'Portfolio drops to $12,400 — 65% loss, career derailed', shock: { day: 10, magnitude: -0.4 } },
      { id: 'tl-3d', variation: 'Leak + player sues + wins big', drift: 0.004, volatility: 0.018, outcome: 'Portfolio reaches $52,800 — 51% gain, massive sympathy premium', shock: { day: 10, magnitude: -0.2 } },
      { id: 'tl-3e', variation: 'Leak + ambiguous resolution', drift: -0.001, volatility: 0.016, outcome: 'Portfolio drops to $28,900 — 17% loss, permanent doubt discount', shock: { day: 10, magnitude: -0.18 } },
    ]),
    divergencePoint: 10,
    maxDivergence: 40400,
  },
];

// ---- Mock Data: Market Entropy ----

const marketEntropy: MarketEntropy = {
  current: 0.72,
  historical: [
    { date: '2025-07-01', entropy: 0.34 },
    { date: '2025-07-15', entropy: 0.31 },
    { date: '2025-08-01', entropy: 0.38 },
    { date: '2025-08-15', entropy: 0.42 },
    { date: '2025-09-01', entropy: 0.51 },
    { date: '2025-09-15', entropy: 0.48 },
    { date: '2025-10-01', entropy: 0.55 },
    { date: '2025-10-15', entropy: 0.62 },
    { date: '2025-11-01', entropy: 0.58 },
    { date: '2025-11-15', entropy: 0.64 },
    { date: '2025-12-01', entropy: 0.53 },
    { date: '2025-12-15', entropy: 0.47 },
    { date: '2026-01-01', entropy: 0.56 },
    { date: '2026-01-14', entropy: 0.83 },
    { date: '2026-01-19', entropy: 0.74 },
    { date: '2026-01-22', entropy: 0.71 },
    { date: '2026-01-28', entropy: 0.84 },
    { date: '2026-02-03', entropy: 0.93 },
    { date: '2026-02-12', entropy: 0.88 },
    { date: '2026-02-15', entropy: 0.91 },
    { date: '2026-02-20', entropy: 0.85 },
    { date: '2026-02-25', entropy: 0.86 },
    { date: '2026-03-01', entropy: 0.78 },
    { date: '2026-03-08', entropy: 0.74 },
    { date: '2026-03-15', entropy: 0.72 },
  ],
  trend: 'decreasing',
  interpretation: 'Market entropy peaked at 0.93 during the PSA grading crisis in early February and has been gradually declining. Current level of 0.72 indicates the market is still in a chaotic regime but trending toward a transitional phase. Multiple butterfly events in January-February created sustained elevated chaos. The Lyapunov exponent remains positive across most tracked assets, meaning small perturbations still amplify unpredictably. Expect entropy to remain above 0.60 until the market fully digests the grading confidence and AI pricing disruptions.',
};

// ---- Lyapunov Exponent Data ----

const lyapunovData: Record<string, number> = {
  'c-wemby-bc': 1.42,
  'c-lebron-topps': 0.89,
  'c-mj-fleer86': 1.61,
  'c-mahomes-nt': 1.05,
  'c-ohtani-topps': 1.32,
  'c-luka-pz': 0.81,
  'c-elly-pz': 1.28,
  'c-judge-topps': 0.72,
  'c-kelce-pz': 0.95,
  'c-bonds-87': 1.38,
  'c-giannis-pz': 0.68,
  'c-tatum-nt': 0.54,
  'c-jeter-sp': 0.41,
  'c-degrom-topps': 1.14,
  'c-stanton-topps': 0.78,
};

// ---- Service Functions ----

export function getButterflyEvents(): ButterflyEvent[] {
  return butterflyEvents;
}

export function getEventCascade(eventId: string): ButterflyEvent | null {
  return butterflyEvents.find(e => e.id === eventId) ?? null;
}

export function getStrangeAttractors(): StrangeAttractor[] {
  return strangeAttractors;
}

export function getAttractorDetail(id: string): StrangeAttractor | null {
  return strangeAttractors.find(a => a.id === id) ?? null;
}

export function getSensitivityMap(cardId: string): SensitivityMap | null {
  return sensitivityMaps.find(s => s.cardId === cardId) ?? null;
}

export function getAllSensitivityMaps(): SensitivityMap[] {
  return sensitivityMaps;
}

export function runChaosSimulation(eventId: string, _iterations?: number): ChaosSimulation | null {
  return chaosSimulations.find(s => s.eventId === eventId) ?? null;
}

export function getMarketEntropy(): MarketEntropy {
  return marketEntropy;
}

export function getDivergentTimelines(eventId: string): SimTimeline[] {
  const sim = chaosSimulations.find(s => s.eventId === eventId);
  return sim?.timelines ?? [];
}

export function calculateLyapunovExponent(cardId: string): number {
  return lyapunovData[cardId] ?? 0;
}
