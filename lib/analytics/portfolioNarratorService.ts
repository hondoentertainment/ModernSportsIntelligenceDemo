import { store } from '../dal/syncStore';

// ---- Types ----

export type NarrativePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type NarrativeTone = 'bullish' | 'bearish' | 'neutral' | 'cautious';
export type HighlightType = 'gain' | 'loss' | 'milestone' | 'alert';
export type DetailLevel = 'brief' | 'detailed' | 'comprehensive';
export type ActionPriority = 'high' | 'medium' | 'low';

export interface NarrativeHighlight {
  type: HighlightType;
  title: string;
  description: string;
  value: number;
  cardName?: string;
}

export interface PortfolioSnapshot {
  totalValue: number;
  change: number;
  changePercent: number;
}

export interface ActionItem {
  priority: ActionPriority;
  action: string;
  reasoning: string;
}

export interface NarrativeReport {
  id: string;
  title: string;
  period: NarrativePeriod;
  generatedAt: string;
  summary: string;
  highlights: NarrativeHighlight[];
  portfolioSnapshot: PortfolioSnapshot;
  marketInsights: string[];
  actionItems: ActionItem[];
  tone: NarrativeTone;
}

export interface NarrativePreferences {
  frequency: NarrativePeriod;
  detailLevel: DetailLevel;
  focusAreas: string[];
  includeMarketContext: boolean;
}

export interface PerformanceTimeline {
  date: string;
  portfolioValue: number;
  benchmark: number;
  delta: number;
}

export interface NarratorStats {
  totalReports: number;
  avgGainReported: number;
  topHighlight: string;
  lastGenerated: string;
  streakDays: number;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_portfolio_narrator';
const NARRATIVES_KEY = `${STORAGE_PREFIX}_narratives`;
const PREFERENCES_KEY = `${STORAGE_PREFIX}_preferences`;

// ---- Mock Data ----

const mockNarratives: NarrativeReport[] = [
  {
    id: 'nr-001',
    title: 'Weekly Portfolio Wrap: Strong Gains Across the Board',
    period: 'weekly',
    generatedAt: '2026-03-14T18:00:00Z',
    summary: 'Your portfolio posted a solid week with a 3.2% gain driven primarily by basketball rookies and vintage baseball. The Wembanyama RC PSA 10 surged 12% following his triple-double performance, while the 1986 Fleer Jordan continued its steady climb.',
    highlights: [
      { type: 'gain', title: 'Wembanyama RC Surge', description: 'Victor Wembanyama Prizm RC PSA 10 gained 12% this week after dominant performance.', value: 12.0, cardName: 'Wembanyama Prizm RC PSA 10' },
      { type: 'milestone', title: 'Portfolio Crosses $50K', description: 'Your total portfolio value has crossed the $50,000 milestone for the first time.', value: 50000 },
      { type: 'alert', title: 'Vintage Market Cooling', description: 'Pre-war card segment showing signs of softening demand across major auction houses.', value: -3.5 },
    ],
    portfolioSnapshot: { totalValue: 51250, change: 1590, changePercent: 3.2 },
    marketInsights: [
      'Basketball rookie cards continue to outperform other segments.',
      'PSA submission times have decreased to 45 business days.',
      'Heritage Auctions reports record Q1 sports card sales.',
    ],
    actionItems: [
      { priority: 'high', action: 'Consider taking partial profits on Wembanyama position', reasoning: 'Position has grown to 18% of portfolio, exceeding recommended 15% single-card allocation.' },
      { priority: 'medium', action: 'Review vintage baseball holdings', reasoning: 'Pre-war market softening may present buying opportunities for targeted acquisitions.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-002',
    title: 'Daily Flash: Market Volatility Spikes',
    period: 'daily',
    generatedAt: '2026-03-13T18:00:00Z',
    summary: 'A volatile day in the sports card market saw your portfolio dip 1.1% as basketball and football segments pulled back. The selloff appears driven by broader market sentiment rather than card-specific factors.',
    highlights: [
      { type: 'loss', title: 'Football Pullback', description: 'Stroud and Young rookie cards both declined 4-5% in active trading.', value: -4.2 },
      { type: 'gain', title: 'Baseball Resilience', description: 'Baseball holdings bucked the trend with Ohtani cards gaining 2.1%.', value: 2.1, cardName: 'Ohtani Topps Chrome RC' },
      { type: 'alert', title: 'High Volume Selling', description: 'Unusual selling volume detected across multiple platforms for modern football rookies.', value: -8.0 },
    ],
    portfolioSnapshot: { totalValue: 49660, change: -552, changePercent: -1.1 },
    marketInsights: [
      'Broader equity market decline correlating with card market pullback.',
      'Football rookie segment seeing highest sell volume in 3 months.',
      'Baseball cards showing relative strength as a defensive segment.',
    ],
    actionItems: [
      { priority: 'high', action: 'Hold current positions through volatility', reasoning: 'Selling into weakness historically leads to poor outcomes in sports card markets.' },
      { priority: 'low', action: 'Set price alerts for football rookies at support levels', reasoning: 'May present accumulation opportunity if selloff continues.' },
    ],
    tone: 'cautious',
  },
  {
    id: 'nr-003',
    title: 'Monthly Performance Review: February 2026',
    period: 'monthly',
    generatedAt: '2026-03-01T08:00:00Z',
    summary: 'February delivered a 5.8% portfolio gain, your best month since November. Basketball cards led the charge with a 9.2% segment return, while your strategic rebalancing into vintage baseball is starting to pay dividends.',
    highlights: [
      { type: 'gain', title: 'Basketball Dominance', description: 'Basketball segment returned 9.2% for the month, led by Wembanyama and Holmgren rookies.', value: 9.2 },
      { type: 'milestone', title: '12-Month Winning Streak', description: 'Your portfolio has now posted positive returns for 12 consecutive months.', value: 12 },
      { type: 'gain', title: 'Vintage Strategy Working', description: 'Vintage baseball acquisitions from January are up 4.1% on average.', value: 4.1 },
      { type: 'alert', title: 'Concentration Risk', description: 'Top 3 holdings now represent 42% of portfolio value.', value: 42 },
    ],
    portfolioSnapshot: { totalValue: 50212, change: 2752, changePercent: 5.8 },
    marketInsights: [
      'NBA All-Star break historically bullish for basketball card prices.',
      'SGC grading gaining market share, narrowing PSA premium gap.',
      'International collectors driving demand for soccer and basketball crossover.',
      'Auction house fees trending downward due to increased competition.',
    ],
    actionItems: [
      { priority: 'high', action: 'Diversify away from top 3 holdings', reasoning: 'Concentration risk at 42% exceeds prudent portfolio management guidelines.' },
      { priority: 'medium', action: 'Explore soccer card allocation', reasoning: 'International demand growth creating opportunities in undervalued soccer market.' },
      { priority: 'low', action: 'Document acquisition costs for tax planning', reasoning: 'Q1 is ideal time to organize records before year-end tax preparation.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-004',
    title: 'Quarterly Deep Dive: Q4 2025 Retrospective',
    period: 'quarterly',
    generatedAt: '2026-01-02T08:00:00Z',
    summary: 'Q4 2025 saw your portfolio gain 11.4%, significantly outperforming the broader collectibles market index which returned 4.2%. Strategic positioning in rookie cards and timely exits from overvalued vintage pieces drove outperformance.',
    highlights: [
      { type: 'gain', title: 'Q4 Outperformance', description: 'Portfolio returned 11.4% vs 4.2% collectibles market index.', value: 11.4 },
      { type: 'milestone', title: 'First Year Complete', description: 'Completed your first full year of systematic portfolio tracking.', value: 1 },
      { type: 'gain', title: 'Smart Exit: 1989 Upper Deck Griffey', description: 'Sold near local peak, realizing 34% gain before market correction.', value: 34, cardName: '1989 Upper Deck Griffey Jr. RC' },
      { type: 'loss', title: 'NFT Card Writedown', description: 'Digital card holdings declined 22% as NFT market continued to cool.', value: -22 },
    ],
    portfolioSnapshot: { totalValue: 47460, change: 4860, changePercent: 11.4 },
    marketInsights: [
      'Sports card market outperformed S&P 500 in Q4 2025.',
      'Graded card premium expanding as raw card market softens.',
      'Holiday season drove record auction volumes in December.',
      'NFT/digital card segment continues secular decline.',
    ],
    actionItems: [
      { priority: 'high', action: 'Exit remaining NFT card positions', reasoning: 'Digital collectibles showing no signs of recovery; redeploy capital to physical cards.' },
      { priority: 'medium', action: 'Increase graded card allocation', reasoning: 'Growing premium for graded cards suggests market preference shift.' },
      { priority: 'medium', action: 'Set Q1 2026 portfolio targets', reasoning: 'Annual review complete; establish forward-looking benchmarks.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-005',
    title: 'Daily Flash: Ohtani Breaks Out',
    period: 'daily',
    generatedAt: '2026-03-12T18:00:00Z',
    summary: 'Shohei Ohtani hit two home runs in spring training, sending his card prices up 6.3% across all grades. Your Ohtani holdings contributed $820 in unrealized gains today alone.',
    highlights: [
      { type: 'gain', title: 'Ohtani Surge', description: 'All Ohtani cards rallied 6.3% on strong spring training performance.', value: 6.3, cardName: 'Ohtani 2018 Topps Update RC' },
      { type: 'gain', title: 'Baseball Momentum', description: 'Spring training buzz lifting baseball card segment 2.8% overall.', value: 2.8 },
    ],
    portfolioSnapshot: { totalValue: 50350, change: 820, changePercent: 1.65 },
    marketInsights: [
      'Spring training performance historically predictive of regular season card prices.',
      'Ohtani remains most-traded card on major platforms.',
    ],
    actionItems: [
      { priority: 'medium', action: 'Monitor Ohtani position sizing', reasoning: 'Recent surge may push allocation above target threshold.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-006',
    title: 'Weekly Portfolio Wrap: Consolidation Week',
    period: 'weekly',
    generatedAt: '2026-03-07T18:00:00Z',
    summary: 'A quiet week for the portfolio with a modest 0.4% gain. Markets are consolidating after February\'s strong run, which is healthy price action. No major movers in your holdings.',
    highlights: [
      { type: 'gain', title: 'Steady Progress', description: 'Portfolio maintained gains with minimal volatility this week.', value: 0.4 },
      { type: 'milestone', title: 'Watchlist Target Hit', description: 'Jaylen Brown Prizm Silver dropped to your target buy price of $145.', value: 145, cardName: 'Jaylen Brown Prizm Silver' },
    ],
    portfolioSnapshot: { totalValue: 49530, change: 198, changePercent: 0.4 },
    marketInsights: [
      'Market consolidation pattern typical after strong monthly gains.',
      'Trading volumes below 20-day average across all segments.',
    ],
    actionItems: [
      { priority: 'high', action: 'Execute buy order for Jaylen Brown Prizm Silver', reasoning: 'Card has reached your pre-set target price; fundamentals remain strong.' },
      { priority: 'low', action: 'Review and update watchlist targets', reasoning: 'Several targets may need adjustment based on recent market moves.' },
    ],
    tone: 'neutral',
  },
  {
    id: 'nr-007',
    title: 'Daily Flash: Grading Results In',
    period: 'daily',
    generatedAt: '2026-03-11T18:00:00Z',
    summary: 'Your PSA submission returned with excellent results: 3 of 4 cards received PSA 10 grades, adding an estimated $2,400 in value to your portfolio. The lone PSA 9 was your Ja Morant Prizm which still commands a strong premium.',
    highlights: [
      { type: 'milestone', title: 'PSA 10 Hat Trick', description: 'Three cards returned PSA 10 from latest submission batch.', value: 2400 },
      { type: 'gain', title: 'Instant Value Add', description: 'Grading results added $2,400 in estimated portfolio value.', value: 2400 },
      { type: 'alert', title: 'Morant PSA 9', description: 'Ja Morant Prizm received PSA 9 instead of expected 10; still valuable at $380.', value: 380, cardName: 'Ja Morant Prizm RC PSA 9' },
    ],
    portfolioSnapshot: { totalValue: 49920, change: 2400, changePercent: 5.05 },
    marketInsights: [
      'PSA 10 population for 2023 Prizm basketball remains relatively low.',
      'PSA 9 to PSA 10 premium gap widening for modern rookies.',
    ],
    actionItems: [
      { priority: 'medium', action: 'List Ja Morant PSA 9 if not core holding', reasoning: 'PSA 9 premium may compress further as more submissions return.' },
      { priority: 'low', action: 'Submit next batch to capitalize on grading momentum', reasoning: 'Current PSA turnaround times favorable for batch submissions.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-008',
    title: 'Weekly Wrap: Bear Pressure Mounts',
    period: 'weekly',
    generatedAt: '2026-02-28T18:00:00Z',
    summary: 'A challenging week with the portfolio declining 2.3%. Football cards led the downturn following disappointing combine results for several hyped prospects. Your defensive positioning in vintage mitigated some losses.',
    highlights: [
      { type: 'loss', title: 'Football Combine Fallout', description: 'Modern football rookies declined 5.8% as combine results disappointed.', value: -5.8 },
      { type: 'loss', title: 'Stroud Correction', description: 'CJ Stroud Prizm RC dropped 7.2% on profit-taking after January highs.', value: -7.2, cardName: 'CJ Stroud Prizm RC' },
      { type: 'gain', title: 'Vintage Cushion', description: 'Vintage baseball holdings gained 1.2%, providing portfolio stability.', value: 1.2 },
    ],
    portfolioSnapshot: { totalValue: 49332, change: -1160, changePercent: -2.3 },
    marketInsights: [
      'NFL Combine results creating short-term volatility in football cards.',
      'Flight to quality: vintage and high-grade modern outperforming.',
      'Short sellers becoming more active on sports card prediction markets.',
    ],
    actionItems: [
      { priority: 'high', action: 'Reduce football exposure to 20% of portfolio', reasoning: 'NFL offseason typically bearish for football cards until draft.' },
      { priority: 'medium', action: 'Increase vintage allocation as hedge', reasoning: 'Vintage cards demonstrating lower beta during market stress.' },
    ],
    tone: 'bearish',
  },
  {
    id: 'nr-009',
    title: 'Monthly Review: January 2026',
    period: 'monthly',
    generatedAt: '2026-02-01T08:00:00Z',
    summary: 'January kicked off 2026 with a 3.1% portfolio gain. The new year saw renewed collector interest and strong auction results. Your basketball-heavy allocation captured most of the upside.',
    highlights: [
      { type: 'gain', title: 'New Year Rally', description: 'January posted 3.1% gains as collector demand surged post-holidays.', value: 3.1 },
      { type: 'milestone', title: 'Best January Ever', description: 'This was your strongest January return since tracking began.', value: 3.1 },
      { type: 'gain', title: 'Holmgren Breakout', description: 'Chet Holmgren Prizm RC gained 15% as he returned from injury.', value: 15, cardName: 'Chet Holmgren Prizm RC' },
    ],
    portfolioSnapshot: { totalValue: 48200, change: 1447, changePercent: 3.1 },
    marketInsights: [
      'Post-holiday spending driving auction volumes higher.',
      'New collector influx from social media coverage increasing demand.',
      'January historically second-strongest month for basketball cards.',
    ],
    actionItems: [
      { priority: 'medium', action: 'Rebalance basketball to target allocation', reasoning: 'Strong January may have pushed basketball allocation above target.' },
      { priority: 'low', action: 'Review year-end tax documents', reasoning: 'Ensure all 2025 sales are properly documented for tax filing.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-010',
    title: 'Daily Flash: Market Quiet Ahead of Weekend',
    period: 'daily',
    generatedAt: '2026-03-10T18:00:00Z',
    summary: 'A quiet trading day with minimal portfolio movement. Markets are waiting for upcoming auction results this weekend which could set price direction for the week ahead.',
    highlights: [
      { type: 'alert', title: 'Weekend Auction Preview', description: 'Major Heritage Auctions event this weekend featuring key vintage lots.', value: 0 },
      { type: 'gain', title: 'Slight Green', description: 'Portfolio eked out a 0.2% gain on light volume.', value: 0.2 },
    ],
    portfolioSnapshot: { totalValue: 49530, change: 99, changePercent: 0.2 },
    marketInsights: [
      'Low volume days often precede significant moves.',
      'Heritage Auctions weekend event could set tone for vintage market.',
    ],
    actionItems: [
      { priority: 'low', action: 'Watch Heritage Auction results closely', reasoning: 'Outcomes may impact valuation of vintage holdings.' },
    ],
    tone: 'neutral',
  },
  {
    id: 'nr-011',
    title: 'Daily Flash: Rookie Rotation',
    period: 'daily',
    generatedAt: '2026-03-09T18:00:00Z',
    summary: 'Rotation into 2025-26 rookie cards picked up steam as first-year players shine in late-season action. Your early positions in this class are paying off with a 3.4% bump.',
    highlights: [
      { type: 'gain', title: 'Fresh Rookies Rally', description: '2025-26 rookie class cards gaining momentum as season progresses.', value: 3.4 },
      { type: 'gain', title: 'Flagg Hype Building', description: 'Cooper Flagg prospect cards seeing pre-draft premium expansion.', value: 8.1, cardName: 'Cooper Flagg Bowman Chrome' },
    ],
    portfolioSnapshot: { totalValue: 49431, change: 1625, changePercent: 3.4 },
    marketInsights: [
      'Late-season performance historically drives rookie card prices.',
      'Pre-draft hype for 2026 NBA Draft prospects intensifying.',
    ],
    actionItems: [
      { priority: 'medium', action: 'Take partial profits on Flagg position', reasoning: 'Pre-draft hype can reverse quickly; lock in some gains.' },
    ],
    tone: 'bullish',
  },
  {
    id: 'nr-012',
    title: 'Quarterly Outlook: Q1 2026 Preview',
    period: 'quarterly',
    generatedAt: '2026-01-05T08:00:00Z',
    summary: 'Looking ahead to Q1 2026, several catalysts could drive portfolio performance. The NBA trade deadline, spring training, and NFL free agency all present opportunities. Your current positioning is well-suited for the expected market dynamics.',
    highlights: [
      { type: 'milestone', title: 'Portfolio Anniversary', description: 'One year of portfolio tracking with 24.7% total return.', value: 24.7 },
      { type: 'alert', title: 'Q1 Catalysts Ahead', description: 'Multiple market-moving events expected in coming weeks.', value: 0 },
    ],
    portfolioSnapshot: { totalValue: 46800, change: 0, changePercent: 0 },
    marketInsights: [
      'NBA trade deadline historically creates card price volatility.',
      'Spring training previews drive early baseball card demand.',
      'NFL free agency reshuffles value hierarchy for football cards.',
      'Tax-loss selling from Q4 may create buying opportunities.',
    ],
    actionItems: [
      { priority: 'high', action: 'Build cash reserves for opportunistic buying', reasoning: 'Q1 events often create short-term dislocations ideal for accumulation.' },
      { priority: 'medium', action: 'Set alerts for NBA trade deadline targets', reasoning: 'Player trades can cause 20%+ price swings in affected cards.' },
      { priority: 'low', action: 'Research 2026 draft class for early positioning', reasoning: 'Early movers in prospect cards often capture largest gains.' },
    ],
    tone: 'cautious',
  },
];

const mockPerformanceTimeline: PerformanceTimeline[] = [
  { date: '2025-10-01', portfolioValue: 42600, benchmark: 42600, delta: 0 },
  { date: '2025-10-15', portfolioValue: 43200, benchmark: 42900, delta: 300 },
  { date: '2025-11-01', portfolioValue: 44100, benchmark: 43100, delta: 1000 },
  { date: '2025-11-15', portfolioValue: 44800, benchmark: 43400, delta: 1400 },
  { date: '2025-12-01', portfolioValue: 45900, benchmark: 43800, delta: 2100 },
  { date: '2025-12-15', portfolioValue: 46500, benchmark: 44000, delta: 2500 },
  { date: '2026-01-01', portfolioValue: 47460, benchmark: 44200, delta: 3260 },
  { date: '2026-01-15', portfolioValue: 47900, benchmark: 44500, delta: 3400 },
  { date: '2026-02-01', portfolioValue: 48200, benchmark: 44700, delta: 3500 },
  { date: '2026-02-15', portfolioValue: 49100, benchmark: 44900, delta: 4200 },
  { date: '2026-03-01', portfolioValue: 50212, benchmark: 45100, delta: 5112 },
  { date: '2026-03-14', portfolioValue: 51250, benchmark: 45300, delta: 5950 },
];

const defaultPreferences: NarrativePreferences = {
  frequency: 'weekly',
  detailLevel: 'detailed',
  focusAreas: ['basketball', 'vintage', 'rookies'],
  includeMarketContext: true,
};

// ---- Helper Functions ----

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export function getToneColor(tone: NarrativeTone): string {
  switch (tone) {
    case 'bullish': return 'text-green-400';
    case 'bearish': return 'text-red-400';
    case 'neutral': return 'text-slate-400';
    case 'cautious': return 'text-yellow-400';
  }
}

export function getToneLabel(tone: NarrativeTone): string {
  switch (tone) {
    case 'bullish': return 'Bullish';
    case 'bearish': return 'Bearish';
    case 'neutral': return 'Neutral';
    case 'cautious': return 'Cautious';
  }
}

export function getHighlightIcon(type: HighlightType): string {
  switch (type) {
    case 'gain': return 'TrendingUp';
    case 'loss': return 'TrendingDown';
    case 'milestone': return 'Award';
    case 'alert': return 'AlertTriangle';
  }
}

export function getPriorityColor(priority: ActionPriority): string {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
  }
}

// ---- Data Access Functions ----

function loadNarratives(): NarrativeReport[] {
  if (store.has(NARRATIVES_KEY)) {
    return store.get<NarrativeReport[]>(NARRATIVES_KEY, [...mockNarratives]);
  }
  return [...mockNarratives];
}

function saveNarratives(narratives: NarrativeReport[]): void {
  store.set(NARRATIVES_KEY, narratives);
}

export function getNarratives(): NarrativeReport[] {
  return loadNarratives().sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

export function generateNarrative(period: NarrativePeriod): NarrativeReport {
  const id = `nr-${Date.now()}`;
  const tones: NarrativeTone[] = ['bullish', 'bearish', 'neutral', 'cautious'];
  const tone = tones[Math.floor(Math.random() * tones.length)];
  const change = Math.round((Math.random() - 0.4) * 3000);
  const totalValue = 51250 + change;
  const changePercent = parseFloat(((change / totalValue) * 100).toFixed(2));

  const periodLabels: Record<NarrativePeriod, string> = {
    daily: 'Daily Flash',
    weekly: 'Weekly Portfolio Wrap',
    monthly: 'Monthly Performance Review',
    quarterly: 'Quarterly Deep Dive',
  };

  const narrative: NarrativeReport = {
    id,
    title: `${periodLabels[period]}: Generated Report`,
    period,
    generatedAt: new Date().toISOString(),
    summary: `This ${period} report was generated on demand. Your portfolio is currently valued at ${formatCurrency(totalValue)} with a ${formatPercent(changePercent)} change. Market conditions are ${tone} and key positions are performing within expected ranges.`,
    highlights: [
      { type: change >= 0 ? 'gain' : 'loss', title: change >= 0 ? 'Portfolio Gains' : 'Portfolio Decline', description: `Portfolio moved ${formatPercent(changePercent)} this ${period}.`, value: changePercent },
      { type: 'milestone', title: 'Report Generated', description: `New ${period} narrative report created successfully.`, value: 1 },
    ],
    portfolioSnapshot: { totalValue, change, changePercent },
    marketInsights: [
      'Market conditions are being monitored across all segments.',
      'Trading volumes remain within normal ranges.',
      `${tone === 'bullish' ? 'Positive' : tone === 'bearish' ? 'Negative' : 'Mixed'} sentiment detected in social media channels.`,
    ],
    actionItems: [
      { priority: 'medium', action: 'Review portfolio allocation', reasoning: 'Regular rebalancing ensures optimal risk-adjusted returns.' },
      { priority: 'low', action: 'Update watchlist', reasoning: 'Keep watchlist current with latest market developments.' },
    ],
    tone,
  };

  const narratives = loadNarratives();
  narratives.push(narrative);
  saveNarratives(narratives);

  return narrative;
}

export function getLatestNarrative(): NarrativeReport | undefined {
  const narratives = getNarratives();
  return narratives.length > 0 ? narratives[0] : undefined;
}

export function getNarrativeById(id: string): NarrativeReport | undefined {
  return loadNarratives().find((n) => n.id === id);
}

export function getPreferences(): NarrativePreferences {
  if (store.has(PREFERENCES_KEY)) {
    return store.get<NarrativePreferences>(PREFERENCES_KEY, { ...defaultPreferences });
  }
  return { ...defaultPreferences };
}

export function updatePreferences(prefs: Partial<NarrativePreferences>): NarrativePreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  store.set(PREFERENCES_KEY, updated);
  return updated;
}

export function getPerformanceTimeline(): PerformanceTimeline[] {
  return [...mockPerformanceTimeline];
}

export function getNarratorStats(): NarratorStats {
  const narratives = getNarratives();
  const gains = narratives
    .map((n) => n.portfolioSnapshot.changePercent)
    .filter((c) => c > 0);
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;

  const allHighlights = narratives.flatMap((n) => n.highlights);
  const gainHighlights = allHighlights.filter((h) => h.type === 'gain');
  const topHighlight = gainHighlights.length > 0
    ? gainHighlights.sort((a, b) => b.value - a.value)[0].title
    : 'None';

  const lastGenerated = narratives.length > 0 ? narratives[0].generatedAt : 'Never';

  // Calculate streak by checking consecutive days with reports
  const dates = narratives
    .map((n) => new Date(n.generatedAt).toISOString().split('T')[0])
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .sort()
    .reverse();

  let streakDays = 0;
  if (dates.length > 0) {
    streakDays = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime();
      if (diff <= 86400000 * 2) {
        streakDays++;
      } else {
        break;
      }
    }
  }

  return {
    totalReports: narratives.length,
    avgGainReported: parseFloat(avgGain.toFixed(2)),
    topHighlight,
    lastGenerated,
    streakDays,
  };
}

export function getActionItems(): ActionItem[] {
  const narratives = getNarratives();
  if (narratives.length === 0) return [];
  // Return action items from the most recent 3 reports, deduplicated by action text
  const recent = narratives.slice(0, 3);
  const seen = new Set<string>();
  const items: ActionItem[] = [];
  for (const report of recent) {
    for (const item of report.actionItems) {
      if (!seen.has(item.action)) {
        seen.add(item.action);
        items.push(item);
      }
    }
  }
  return items;
}

export function getHighlightsByType(type: HighlightType): NarrativeHighlight[] {
  const narratives = getNarratives();
  return narratives.flatMap((n) => n.highlights).filter((h) => h.type === type);
}
