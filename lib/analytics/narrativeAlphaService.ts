// Narrative Alpha Detector Service
// NLP engine that identifies emerging card narratives before they drive prices

// ─── Types ───────────────────────────────────────────────────────────────────

export type NarrativeType =
  | 'comeback'
  | 'milestone'
  | 'trade-rumor'
  | 'media-spotlight'
  | 'record-chase'
  | 'rookie-hype'
  | 'legacy-play'
  | 'controversy'
  | 'retirement-watch'
  | 'dynasty-builder';

export type MaturityPhase = 'seed' | 'emerging' | 'mainstream' | 'peak' | 'fading';

export type MediaSource =
  | 'ESPN'
  | 'Twitter/X'
  | 'Reddit'
  | 'YouTube'
  | 'Podcast'
  | 'Bloomberg'
  | 'Local News';

export interface NarrativeSignal {
  id: string;
  playerName: string;
  narrativeType: NarrativeType;
  title: string;
  description: string;
  detectedAt: string;
  maturityPhase: MaturityPhase;
  strengthScore: number; // 0-100
  priceImpactEstimate: number; // percentage
  timeToImpact: string;
  sources: string[];
  confidenceScore: number; // 0-1
}

export interface NarrativeTimeline {
  narrativeId: string;
  events: {
    date: string;
    event: string;
    priceChange: number;
  }[];
}

export interface MediaMention {
  id: string;
  source: MediaSource;
  headline: string;
  playerName: string;
  sentimentScore: number; // -1 to 1
  reach: number;
  timestamp: string;
}

export interface NarrativeStats {
  activeNarratives: number;
  emergingCount: number;
  avgLeadTime: string;
  successRate: number;
  biggestNarrativeGain: { player: string; gain: number };
  totalAlphaGenerated: number;
}

// ─── Narrative Type Metadata ─────────────────────────────────────────────────

export const NARRATIVE_TYPE_META: Record<NarrativeType, { label: string; color: string }> = {
  'comeback': { label: 'Comeback Player', color: 'text-green-400' },
  'milestone': { label: 'Historic Milestone', color: 'text-amber-400' },
  'trade-rumor': { label: 'Trade Rumor', color: 'text-orange-400' },
  'media-spotlight': { label: 'Media Spotlight', color: 'text-pink-400' },
  'record-chase': { label: 'Record Chase', color: 'text-cyan-400' },
  'rookie-hype': { label: 'Rookie Hype', color: 'text-violet-400' },
  'legacy-play': { label: 'Legacy Play', color: 'text-yellow-400' },
  'controversy': { label: 'Controversy', color: 'text-red-400' },
  'retirement-watch': { label: 'Retirement Watch', color: 'text-slate-400' },
  'dynasty-builder': { label: 'Dynasty Builder', color: 'text-emerald-400' },
};

export const PHASE_ORDER: MaturityPhase[] = ['seed', 'emerging', 'mainstream', 'peak', 'fading'];

export const PHASE_COLORS: Record<MaturityPhase, string> = {
  seed: 'text-slate-400 bg-slate-500/20',
  emerging: 'text-cyan-400 bg-cyan-500/20',
  mainstream: 'text-amber-400 bg-amber-500/20',
  peak: 'text-pink-400 bg-pink-500/20',
  fading: 'text-slate-500 bg-slate-600/20',
};

// ─── Mock Data: Narrative Signals ────────────────────────────────────────────

const mockNarrativeSignals: NarrativeSignal[] = [
  {
    id: 'ns-001',
    playerName: 'Shohei Ohtani',
    narrativeType: 'legacy-play',
    title: 'Ohtani 50/50 Season Legacy',
    description: 'Historic 50-HR / 50-SB season continues to drive unprecedented demand for all Ohtani cards. Documentary in production at Netflix amplifying the narrative further.',
    detectedAt: '2025-07-15',
    maturityPhase: 'peak',
    strengthScore: 97,
    priceImpactEstimate: 45.2,
    timeToImpact: 'Immediate',
    sources: ['ESPN', 'Bloomberg', 'Netflix Announcement'],
    confidenceScore: 0.96,
  },
  {
    id: 'ns-002',
    playerName: 'Caitlin Clark',
    narrativeType: 'media-spotlight',
    title: 'Caitlin Clark WNBA Crossover',
    description: 'WNBA viewership records shattered. First women\'s basketball card to crack $100K barrier. Gender equity narrative driving mainstream collector interest.',
    detectedAt: '2025-09-20',
    maturityPhase: 'emerging',
    strengthScore: 84,
    priceImpactEstimate: 38.5,
    timeToImpact: '3-4 weeks',
    sources: ['Twitter/X', 'ESPN', 'Bloomberg'],
    confidenceScore: 0.88,
  },
  {
    id: 'ns-003',
    playerName: 'C.J. Stroud',
    narrativeType: 'controversy',
    title: 'Stroud Sophomore Slump?',
    description: 'Early season struggles generating negative sentiment. Contrarian buy signal detected — historical data shows sophomore slump narratives reverse 72% of the time.',
    detectedAt: '2026-02-28',
    maturityPhase: 'seed',
    strengthScore: 42,
    priceImpactEstimate: -15.0,
    timeToImpact: '5-6 weeks',
    sources: ['Reddit', 'Podcast', 'Local News'],
    confidenceScore: 0.65,
  },
  {
    id: 'ns-004',
    playerName: 'LeBron James',
    narrativeType: 'retirement-watch',
    title: 'LeBron Retirement Watch',
    description: 'Increasing media speculation about final season. Retirement narratives historically drive 30-80% price surges in final 6 months. Bronny connection adds unique dimension.',
    detectedAt: '2026-01-10',
    maturityPhase: 'mainstream',
    strengthScore: 89,
    priceImpactEstimate: 55.0,
    timeToImpact: '2-3 weeks',
    sources: ['ESPN', 'Twitter/X', 'YouTube', 'Podcast'],
    confidenceScore: 0.82,
  },
  {
    id: 'ns-005',
    playerName: 'Victor Wembanyama',
    narrativeType: 'dynasty-builder',
    title: 'Wemby Dynasty Formation',
    description: 'Second-year leap confirmed. Spurs playoff push combined with generational talent narrative. All-Star starter selection imminent.',
    detectedAt: '2026-01-05',
    maturityPhase: 'emerging',
    strengthScore: 91,
    priceImpactEstimate: 32.0,
    timeToImpact: '2-4 weeks',
    sources: ['ESPN', 'Twitter/X', 'Reddit'],
    confidenceScore: 0.91,
  },
  {
    id: 'ns-006',
    playerName: 'Caleb Williams',
    narrativeType: 'rookie-hype',
    title: 'Caleb Williams Chicago Revival',
    description: 'Bears playoff appearance sparks massive Chicago market demand. First-year QB in major market narrative driving unprecedented hobby interest.',
    detectedAt: '2026-02-01',
    maturityPhase: 'mainstream',
    strengthScore: 78,
    priceImpactEstimate: 28.5,
    timeToImpact: '1-2 weeks',
    sources: ['ESPN', 'Local News', 'Twitter/X'],
    confidenceScore: 0.79,
  },
  {
    id: 'ns-007',
    playerName: 'Connor Bedard',
    narrativeType: 'rookie-hype',
    title: 'Bedard Calder Trophy Chase',
    description: 'Blackhawks rebuild narrative centers on Bedard. Canadian media amplification driving international collector demand.',
    detectedAt: '2025-12-15',
    maturityPhase: 'fading',
    strengthScore: 35,
    priceImpactEstimate: 5.0,
    timeToImpact: 'Passed',
    sources: ['YouTube', 'Reddit', 'Podcast'],
    confidenceScore: 0.55,
  },
  {
    id: 'ns-008',
    playerName: 'Angel Reese',
    narrativeType: 'media-spotlight',
    title: 'Angel Reese Brand Empire',
    description: 'NIL deals, media appearances, and WNBA double-double records creating multi-platform narrative. First WNBA player with signature sneaker deal adds fuel.',
    detectedAt: '2026-02-10',
    maturityPhase: 'emerging',
    strengthScore: 72,
    priceImpactEstimate: 22.0,
    timeToImpact: '3-5 weeks',
    sources: ['Twitter/X', 'YouTube', 'Bloomberg'],
    confidenceScore: 0.74,
  },
  {
    id: 'ns-009',
    playerName: 'Patrick Mahomes',
    narrativeType: 'dynasty-builder',
    title: 'Mahomes Three-Peat Quest',
    description: 'Unprecedented third consecutive Super Bowl championship narrative. GOAT conversation escalating. Historical dynasty comparison content flooding media.',
    detectedAt: '2026-01-20',
    maturityPhase: 'peak',
    strengthScore: 95,
    priceImpactEstimate: 40.0,
    timeToImpact: 'Immediate',
    sources: ['ESPN', 'Bloomberg', 'Twitter/X', 'Podcast'],
    confidenceScore: 0.94,
  },
  {
    id: 'ns-010',
    playerName: 'Luka Doncic',
    narrativeType: 'trade-rumor',
    title: 'Luka to Lakers Speculation',
    description: 'Persistent trade rumors linking Doncic to Los Angeles. Major market move narrative historically produces 25-50% price spikes regardless of outcome.',
    detectedAt: '2026-03-01',
    maturityPhase: 'seed',
    strengthScore: 58,
    priceImpactEstimate: 30.0,
    timeToImpact: '4-6 weeks',
    sources: ['Twitter/X', 'Reddit', 'Podcast'],
    confidenceScore: 0.52,
  },
  {
    id: 'ns-011',
    playerName: 'Aaron Judge',
    narrativeType: 'record-chase',
    title: 'Judge AL HR Record Repeat',
    description: 'Hot start fuels speculation of another 60+ HR season. Media cycle repeating 2022 pattern. Card prices already ticking up on eBay.',
    detectedAt: '2026-03-10',
    maturityPhase: 'seed',
    strengthScore: 47,
    priceImpactEstimate: 20.0,
    timeToImpact: '5-6 weeks',
    sources: ['ESPN', 'Twitter/X', 'Local News'],
    confidenceScore: 0.60,
  },
  {
    id: 'ns-012',
    playerName: 'Travis Kelce',
    narrativeType: 'media-spotlight',
    title: 'Kelce Pop Culture Crossover',
    description: 'Taylor Swift relationship continues to drive non-traditional collector interest. Saturday Night Live hosting, media omnipresence creating mainstream awareness.',
    detectedAt: '2025-11-05',
    maturityPhase: 'fading',
    strengthScore: 30,
    priceImpactEstimate: 8.0,
    timeToImpact: 'Passed',
    sources: ['Twitter/X', 'YouTube', 'Bloomberg'],
    confidenceScore: 0.48,
  },
  {
    id: 'ns-013',
    playerName: 'Jayson Tatum',
    narrativeType: 'comeback',
    title: 'Tatum Championship Redemption Arc',
    description: 'After Finals MVP, Tatum enters "greatest of his generation" conversation. Celtic dynasty narrative building with back-to-back championship push.',
    detectedAt: '2026-02-15',
    maturityPhase: 'mainstream',
    strengthScore: 76,
    priceImpactEstimate: 18.0,
    timeToImpact: '2-3 weeks',
    sources: ['ESPN', 'Podcast', 'Reddit'],
    confidenceScore: 0.77,
  },
  {
    id: 'ns-014',
    playerName: 'Elly De La Cruz',
    narrativeType: 'milestone',
    title: 'EDLC 40/70 Watch',
    description: 'Speed-power combination unlike anything seen before. If 40 HR / 70 SB materializes, it shatters baseball record books. Early-season pace tracking detected.',
    detectedAt: '2026-03-05',
    maturityPhase: 'seed',
    strengthScore: 53,
    priceImpactEstimate: 35.0,
    timeToImpact: '4-5 weeks',
    sources: ['Twitter/X', 'Reddit', 'YouTube'],
    confidenceScore: 0.58,
  },
  {
    id: 'ns-015',
    playerName: 'Nikola Jokic',
    narrativeType: 'legacy-play',
    title: 'Jokic Greatest Center Ever Debate',
    description: 'Fourth consecutive MVP candidacy reigniting all-time great center debate. Serbian Pony documentary premiering at Sundance generating mainstream crossover.',
    detectedAt: '2026-02-20',
    maturityPhase: 'emerging',
    strengthScore: 81,
    priceImpactEstimate: 25.0,
    timeToImpact: '3-4 weeks',
    sources: ['ESPN', 'YouTube', 'Bloomberg'],
    confidenceScore: 0.83,
  },
];

// ─── Mock Data: Media Mentions ───────────────────────────────────────────────

const mockMediaMentions: MediaMention[] = [
  { id: 'mm-01', source: 'ESPN', headline: 'LeBron hints at "one more run" — what it means for the card market', playerName: 'LeBron James', sentimentScore: 0.7, reach: 4200000, timestamp: '2026-03-16T08:30:00Z' },
  { id: 'mm-02', source: 'Twitter/X', headline: 'Wemby just posted a 40-point triple-double at 20 years old 🤯', playerName: 'Victor Wembanyama', sentimentScore: 0.95, reach: 8500000, timestamp: '2026-03-15T22:15:00Z' },
  { id: 'mm-03', source: 'Bloomberg', headline: 'Sports card market sees 340% surge in women\'s basketball segment', playerName: 'Caitlin Clark', sentimentScore: 0.85, reach: 1800000, timestamp: '2026-03-15T14:00:00Z' },
  { id: 'mm-04', source: 'Reddit', headline: 'PSA 10 Mahomes Prizm just sold for $185K — are we at the top?', playerName: 'Patrick Mahomes', sentimentScore: 0.3, reach: 620000, timestamp: '2026-03-15T19:45:00Z' },
  { id: 'mm-05', source: 'Podcast', headline: 'Hobby Insider: Why CJ Stroud cards are a screaming buy right now', playerName: 'C.J. Stroud', sentimentScore: 0.6, reach: 340000, timestamp: '2026-03-15T11:00:00Z' },
  { id: 'mm-06', source: 'YouTube', headline: 'I bought $50K of Caitlin Clark cards — here\'s why (12M views)', playerName: 'Caitlin Clark', sentimentScore: 0.9, reach: 12000000, timestamp: '2026-03-14T16:00:00Z' },
  { id: 'mm-07', source: 'Local News', headline: 'Chicago card shops report 400% increase in Bears card sales', playerName: 'Caleb Williams', sentimentScore: 0.75, reach: 280000, timestamp: '2026-03-14T09:30:00Z' },
  { id: 'mm-08', source: 'ESPN', headline: 'Ohtani documentary gets premiere date — collector frenzy expected', playerName: 'Shohei Ohtani', sentimentScore: 0.88, reach: 5600000, timestamp: '2026-03-14T12:00:00Z' },
  { id: 'mm-09', source: 'Twitter/X', headline: 'Luka to LA rumors heating up — insiders say "70% chance" by deadline', playerName: 'Luka Doncic', sentimentScore: 0.5, reach: 3200000, timestamp: '2026-03-13T20:00:00Z' },
  { id: 'mm-10', source: 'Bloomberg', headline: 'Jokic rookie cards outperforming S&P 500 over 3-year period', playerName: 'Nikola Jokic', sentimentScore: 0.82, reach: 2100000, timestamp: '2026-03-13T10:00:00Z' },
  { id: 'mm-11', source: 'Reddit', headline: 'Angel Reese signature shoe announcement — implications for her cards', playerName: 'Angel Reese', sentimentScore: 0.78, reach: 410000, timestamp: '2026-03-13T15:30:00Z' },
  { id: 'mm-12', source: 'Podcast', headline: 'The Tatum Files: Why his cards are still undervalued post-championship', playerName: 'Jayson Tatum', sentimentScore: 0.65, reach: 290000, timestamp: '2026-03-12T11:00:00Z' },
  { id: 'mm-13', source: 'YouTube', headline: 'Elly De La Cruz is breaking baseball — card analysis (8M views)', playerName: 'Elly De La Cruz', sentimentScore: 0.92, reach: 8000000, timestamp: '2026-03-12T17:00:00Z' },
  { id: 'mm-14', source: 'ESPN', headline: 'Judge launches 3 HRs on Opening Day — record chase begins', playerName: 'Aaron Judge', sentimentScore: 0.8, reach: 3900000, timestamp: '2026-03-12T21:00:00Z' },
  { id: 'mm-15', source: 'Twitter/X', headline: 'Travis Kelce card prices down 40% from peak — buy the dip?', playerName: 'Travis Kelce', sentimentScore: -0.2, reach: 1500000, timestamp: '2026-03-11T14:00:00Z' },
  { id: 'mm-16', source: 'Bloomberg', headline: 'Mahomes cards now classified as "alternative asset class" by Goldman Sachs', playerName: 'Patrick Mahomes', sentimentScore: 0.91, reach: 2800000, timestamp: '2026-03-11T08:00:00Z' },
  { id: 'mm-17', source: 'Local News', headline: 'Denver card show reports record Jokic card sales ahead of playoffs', playerName: 'Nikola Jokic', sentimentScore: 0.7, reach: 180000, timestamp: '2026-03-10T09:00:00Z' },
  { id: 'mm-18', source: 'Reddit', headline: 'Bedard hype has cooled — time to accumulate before next season?', playerName: 'Connor Bedard', sentimentScore: 0.35, reach: 220000, timestamp: '2026-03-10T16:00:00Z' },
  { id: 'mm-19', source: 'Podcast', headline: 'Narrative Alpha Pod: How we predicted the Ohtani surge 6 weeks early', playerName: 'Shohei Ohtani', sentimentScore: 0.85, reach: 450000, timestamp: '2026-03-09T11:00:00Z' },
  { id: 'mm-20', source: 'YouTube', headline: 'Wembanyama vs. every #1 pick ever — card value comparison (5M views)', playerName: 'Victor Wembanyama', sentimentScore: 0.88, reach: 5000000, timestamp: '2026-03-09T18:00:00Z' },
];

// ─── Mock Data: Narrative Timelines ──────────────────────────────────────────

const mockNarrativeTimelines: NarrativeTimeline[] = [
  {
    narrativeId: 'ns-001',
    events: [
      { date: '2025-07-15', event: 'First 50/50 pace analysis published on Twitter', priceChange: 2.5 },
      { date: '2025-08-01', event: 'ESPN feature article on historic season', priceChange: 8.3 },
      { date: '2025-08-20', event: 'Ohtani hits 40 HR / 40 SB milestone', priceChange: 15.0 },
      { date: '2025-09-05', event: 'Netflix documentary officially announced', priceChange: 12.4 },
      { date: '2025-09-19', event: '50/50 achieved — first player in MLB history', priceChange: 22.8 },
      { date: '2025-10-01', event: 'PSA 10 rookie sells for $500K at auction', priceChange: 5.2 },
      { date: '2025-11-15', event: 'Season ends — narrative enters legacy phase', priceChange: -3.1 },
    ],
  },
  {
    narrativeId: 'ns-004',
    events: [
      { date: '2026-01-10', event: 'LeBron cryptic Instagram post sparks retirement talk', priceChange: 4.2 },
      { date: '2026-01-25', event: 'ESPN "Last Dance 2.0" segment airs', priceChange: 8.7 },
      { date: '2026-02-05', event: 'Bronny traded to Lakers — father-son narrative peaks', priceChange: 18.5 },
      { date: '2026-02-14', event: 'All-Star Game farewell ovation goes viral', priceChange: 12.3 },
      { date: '2026-03-01', event: 'LeBron says "I\'m not done yet" — narrative shifts', priceChange: -5.8 },
      { date: '2026-03-10', event: 'Media consensus: 2026-27 will be final season', priceChange: 6.1 },
    ],
  },
  {
    narrativeId: 'ns-009',
    events: [
      { date: '2026-01-20', event: 'Chiefs clinch AFC #1 seed — dynasty talk begins', priceChange: 5.5 },
      { date: '2026-01-28', event: 'Divisional round dominant win', priceChange: 7.2 },
      { date: '2026-02-05', event: 'AFC Championship victory — three-peat one game away', priceChange: 11.8 },
      { date: '2026-02-10', event: 'Super Bowl media week — GOAT narrative dominates', priceChange: 8.4 },
      { date: '2026-02-16', event: 'Super Bowl victory — three-peat achieved', priceChange: 20.3 },
      { date: '2026-03-01', event: 'Post-Super Bowl market frenzy — record auction prices', priceChange: 6.8 },
    ],
  },
];

// ─── Service Functions ───────────────────────────────────────────────────────

export function getNarrativeSignals(): NarrativeSignal[] {
  return [...mockNarrativeSignals].sort((a, b) => b.strengthScore - a.strengthScore);
}

export function getEmergingNarratives(): NarrativeSignal[] {
  return mockNarrativeSignals
    .filter((s) => s.maturityPhase === 'seed' || s.maturityPhase === 'emerging')
    .sort((a, b) => b.strengthScore - a.strengthScore);
}

export function getNarrativeTimeline(narrativeId: string): NarrativeTimeline | undefined {
  return mockNarrativeTimelines.find((t) => t.narrativeId === narrativeId);
}

export function getMediaMentions(playerName?: string): MediaMention[] {
  const mentions = playerName
    ? mockMediaMentions.filter((m) => m.playerName === playerName)
    : mockMediaMentions;
  return [...mentions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getNarrativeStats(): NarrativeStats {
  const active = mockNarrativeSignals.filter((s) => s.maturityPhase !== 'fading');
  const emerging = mockNarrativeSignals.filter(
    (s) => s.maturityPhase === 'seed' || s.maturityPhase === 'emerging'
  );
  const totalAlpha = mockNarrativeSignals
    .filter((s) => s.priceImpactEstimate > 0)
    .reduce((sum, s) => sum + s.priceImpactEstimate, 0);

  return {
    activeNarratives: active.length,
    emergingCount: emerging.length,
    avgLeadTime: '3.2 weeks',
    successRate: 0.78,
    biggestNarrativeGain: { player: 'Shohei Ohtani', gain: 45.2 },
    totalAlphaGenerated: Math.round(totalAlpha * 100) / 100,
  };
}

export function getNarrativesByPhase(phase: MaturityPhase): NarrativeSignal[] {
  return mockNarrativeSignals
    .filter((s) => s.maturityPhase === phase)
    .sort((a, b) => b.strengthScore - a.strengthScore);
}

export function getTopAlphaOpportunities(): NarrativeSignal[] {
  return mockNarrativeSignals
    .filter(
      (s) =>
        (s.maturityPhase === 'seed' || s.maturityPhase === 'emerging') &&
        s.confidenceScore >= 0.5
    )
    .sort((a, b) => b.priceImpactEstimate * b.confidenceScore - a.priceImpactEstimate * a.confidenceScore)
    .slice(0, 5);
}
