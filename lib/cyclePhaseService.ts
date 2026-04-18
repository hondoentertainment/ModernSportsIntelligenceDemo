// ─────────────────────────────────────────────────────────────────────────────
// Cycle Phase Detector Service
// Identifies market cycle phases across sports card segments and predicts transitions
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketCycle {
  id: string;
  segment: string;
  currentPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  phaseProgress: number;
  phaseDuration: number;
  avgCycleLengthDays: number;
  confidence: number;
  nextPhase: string;
  estimatedTransition: string;
}

export interface PhaseIndicator {
  id: string;
  name: string;
  value: number;
  threshold: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  category: string;
  description: string;
}

export interface PhaseTransition {
  id: string;
  segment: string;
  fromPhase: string;
  toPhase: string;
  date: string;
  triggerIndicators: string[];
  priceChangeAtTransition: number;
  volumeChangeAtTransition: number;
  accuracy: number;
}

export interface CycleComposite {
  phase: string;
  avgDuration: number;
  avgReturn: number;
  avgVolume: number;
  frequency: number;
  bestStrategy: string;
}

const marketCycles: MarketCycle[] = [
  { id: 'MC-01', segment: 'Vintage HOF', currentPhase: 'accumulation', phaseProgress: 68, phaseDuration: 42, avgCycleLengthDays: 320, confidence: 87, nextPhase: 'markup', estimatedTransition: '2026-05-18' },
  { id: 'MC-02', segment: 'Modern Rookies', currentPhase: 'markup', phaseProgress: 45, phaseDuration: 28, avgCycleLengthDays: 195, confidence: 82, nextPhase: 'distribution', estimatedTransition: '2026-06-12' },
  { id: 'MC-03', segment: 'Prospect Chrome', currentPhase: 'distribution', phaseProgress: 72, phaseDuration: 35, avgCycleLengthDays: 160, confidence: 74, nextPhase: 'markdown', estimatedTransition: '2026-05-05' },
  { id: 'MC-04', segment: 'Graded Gems', currentPhase: 'markup', phaseProgress: 81, phaseDuration: 55, avgCycleLengthDays: 280, confidence: 91, nextPhase: 'distribution', estimatedTransition: '2026-05-22' },
  { id: 'MC-05', segment: 'Raw Lots', currentPhase: 'markdown', phaseProgress: 58, phaseDuration: 31, avgCycleLengthDays: 140, confidence: 69, nextPhase: 'accumulation', estimatedTransition: '2026-05-30' },
  { id: 'MC-06', segment: 'Parallel Universe', currentPhase: 'accumulation', phaseProgress: 35, phaseDuration: 18, avgCycleLengthDays: 175, confidence: 65, nextPhase: 'markup', estimatedTransition: '2026-06-25' },
  { id: 'MC-07', segment: 'Auto/Relic', currentPhase: 'distribution', phaseProgress: 90, phaseDuration: 48, avgCycleLengthDays: 240, confidence: 88, nextPhase: 'markdown', estimatedTransition: '2026-04-28' },
  { id: 'MC-08', segment: 'Set Builders', currentPhase: 'markdown', phaseProgress: 22, phaseDuration: 12, avgCycleLengthDays: 210, confidence: 72, nextPhase: 'accumulation', estimatedTransition: '2026-07-10' },
];

const phaseIndicators: PhaseIndicator[] = [
  { id: 'PI-01', name: 'Volume Momentum', value: 72, threshold: 60, signal: 'bullish', weight: 0.15, category: 'Volume', description: 'Rolling 30-day volume trend vs 90-day moving average' },
  { id: 'PI-02', name: 'Price Trend Slope', value: 58, threshold: 55, signal: 'bullish', weight: 0.14, category: 'Price', description: 'Linear regression slope of median sale prices over 60 days' },
  { id: 'PI-03', name: 'Listing Velocity', value: 81, threshold: 70, signal: 'bullish', weight: 0.10, category: 'Supply', description: 'Rate of new listings hitting the market per week' },
  { id: 'PI-04', name: 'Bid-Ask Spread', value: 38, threshold: 45, signal: 'bearish', weight: 0.12, category: 'Liquidity', description: 'Average gap between highest bid and lowest ask prices' },
  { id: 'PI-05', name: 'New Entrant Rate', value: 65, threshold: 50, signal: 'bullish', weight: 0.08, category: 'Participation', description: 'New unique buyers entering the segment monthly' },
  { id: 'PI-06', name: 'Whale Activity Index', value: 44, threshold: 55, signal: 'bearish', weight: 0.11, category: 'Flow', description: 'Large transactions ($5k+) as a percentage of total volume' },
  { id: 'PI-07', name: 'Inventory Turnover', value: 62, threshold: 50, signal: 'bullish', weight: 0.09, category: 'Supply', description: 'Average days a card stays listed before selling' },
  { id: 'PI-08', name: 'Grading Submission Rate', value: 55, threshold: 60, signal: 'neutral', weight: 0.06, category: 'Flow', description: 'New PSA/BGS submissions relative to baseline' },
  { id: 'PI-09', name: 'Cross-Platform Spread', value: 48, threshold: 40, signal: 'neutral', weight: 0.05, category: 'Liquidity', description: 'Price variance for identical cards across eBay, PWCC, MySlabs' },
  { id: 'PI-10', name: 'Social Sentiment Score', value: 71, threshold: 55, signal: 'bullish', weight: 0.04, category: 'Sentiment', description: 'Aggregated social media sentiment from hobby forums and X' },
  { id: 'PI-11', name: 'Auction Sell-Through Rate', value: 34, threshold: 50, signal: 'bearish', weight: 0.03, category: 'Demand', description: 'Percentage of auction listings that receive bids and sell' },
  { id: 'PI-12', name: 'Population Growth Pressure', value: 52, threshold: 55, signal: 'neutral', weight: 0.03, category: 'Supply', description: 'Rate of PSA population growth diluting scarcity premiums' },
];

const phaseTransitions: PhaseTransition[] = [
  { id: 'PT-01', segment: 'Modern Rookies', fromPhase: 'accumulation', toPhase: 'markup', date: '2026-02-14', triggerIndicators: ['Volume Momentum', 'New Entrant Rate', 'Social Sentiment Score'], priceChangeAtTransition: 8.5, volumeChangeAtTransition: 42.3, accuracy: 91 },
  { id: 'PT-02', segment: 'Vintage HOF', fromPhase: 'distribution', toPhase: 'markdown', date: '2025-11-20', triggerIndicators: ['Whale Activity Index', 'Bid-Ask Spread', 'Auction Sell-Through Rate'], priceChangeAtTransition: -5.2, volumeChangeAtTransition: -18.7, accuracy: 85 },
  { id: 'PT-03', segment: 'Prospect Chrome', fromPhase: 'markup', toPhase: 'distribution', date: '2026-01-08', triggerIndicators: ['Listing Velocity', 'Inventory Turnover', 'Population Growth Pressure'], priceChangeAtTransition: -2.1, volumeChangeAtTransition: 15.4, accuracy: 78 },
  { id: 'PT-04', segment: 'Graded Gems', fromPhase: 'accumulation', toPhase: 'markup', date: '2025-12-15', triggerIndicators: ['Price Trend Slope', 'Volume Momentum', 'Whale Activity Index'], priceChangeAtTransition: 12.3, volumeChangeAtTransition: 55.8, accuracy: 93 },
  { id: 'PT-05', segment: 'Raw Lots', fromPhase: 'distribution', toPhase: 'markdown', date: '2026-03-02', triggerIndicators: ['Bid-Ask Spread', 'Auction Sell-Through Rate', 'Listing Velocity'], priceChangeAtTransition: -9.8, volumeChangeAtTransition: -32.1, accuracy: 82 },
  { id: 'PT-06', segment: 'Auto/Relic', fromPhase: 'markup', toPhase: 'distribution', date: '2025-10-25', triggerIndicators: ['Volume Momentum', 'Inventory Turnover', 'Cross-Platform Spread'], priceChangeAtTransition: -1.4, volumeChangeAtTransition: 8.2, accuracy: 76 },
  { id: 'PT-07', segment: 'Parallel Universe', fromPhase: 'markdown', toPhase: 'accumulation', date: '2026-03-18', triggerIndicators: ['New Entrant Rate', 'Social Sentiment Score', 'Grading Submission Rate'], priceChangeAtTransition: 2.1, volumeChangeAtTransition: -12.5, accuracy: 70 },
  { id: 'PT-08', segment: 'Set Builders', fromPhase: 'markup', toPhase: 'distribution', date: '2026-02-28', triggerIndicators: ['Listing Velocity', 'Population Growth Pressure', 'Whale Activity Index'], priceChangeAtTransition: -3.6, volumeChangeAtTransition: 22.4, accuracy: 80 },
  { id: 'PT-09', segment: 'Modern Rookies', fromPhase: 'markdown', toPhase: 'accumulation', date: '2025-09-10', triggerIndicators: ['Price Trend Slope', 'Auction Sell-Through Rate', 'New Entrant Rate'], priceChangeAtTransition: 1.8, volumeChangeAtTransition: -25.3, accuracy: 88 },
  { id: 'PT-10', segment: 'Vintage HOF', fromPhase: 'markup', toPhase: 'distribution', date: '2025-08-05', triggerIndicators: ['Whale Activity Index', 'Cross-Platform Spread', 'Volume Momentum'], priceChangeAtTransition: -4.2, volumeChangeAtTransition: 11.9, accuracy: 86 },
];

const cycleComposites: CycleComposite[] = [
  { phase: 'Accumulation', avgDuration: 52, avgReturn: 3.2, avgVolume: 45, frequency: 28, bestStrategy: 'Dollar-cost average into undervalued segments with strong fundamentals' },
  { phase: 'Markup', avgDuration: 68, avgReturn: 18.5, avgVolume: 82, frequency: 24, bestStrategy: 'Ride momentum with trailing stops; add on pullbacks to 20-day MA' },
  { phase: 'Distribution', avgDuration: 38, avgReturn: -2.8, avgVolume: 95, frequency: 26, bestStrategy: 'Take profits on high-beta cards; rotate into defensive vintage positions' },
  { phase: 'Markdown', avgDuration: 44, avgReturn: -14.2, avgVolume: 35, frequency: 22, bestStrategy: 'Avoid catching falling knives; build watchlists for accumulation targets' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Phase Distribution Snapshot
// Pre-computed view of how many segments sit in each phase
// ─────────────────────────────────────────────────────────────────────────────

export interface PhaseDistribution {
  phase: string;
  count: number;
  percentage: number;
  segments: string[];
}

function buildPhaseDistribution(): PhaseDistribution[] {
  const phases: Array<MarketCycle['currentPhase']> = ['accumulation', 'markup', 'distribution', 'markdown'];
  return phases.map(phase => {
    const matching = marketCycles.filter(c => c.currentPhase === phase);
    return {
      phase: phase.charAt(0).toUpperCase() + phase.slice(1),
      count: matching.length,
      percentage: Math.round((matching.length / marketCycles.length) * 100),
      segments: matching.map(c => c.segment),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Indicator Aggregates
// Weighted composite scores for each indicator category
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryAggregate {
  category: string;
  avgValue: number;
  avgThreshold: number;
  totalWeight: number;
  bullishCount: number;
  bearishCount: number;
  netSignal: 'bullish' | 'bearish' | 'neutral';
}

function buildCategoryAggregates(): CategoryAggregate[] {
  const cats = [...new Set(phaseIndicators.map(i => i.category))];
  return cats.map(category => {
    const group = phaseIndicators.filter(i => i.category === category);
    const avgValue = Math.round(group.reduce((s, i) => s + i.value, 0) / group.length);
    const avgThreshold = Math.round(group.reduce((s, i) => s + i.threshold, 0) / group.length);
    const totalWeight = Math.round(group.reduce((s, i) => s + i.weight, 0) * 100) / 100;
    const bullishCount = group.filter(i => i.signal === 'bullish').length;
    const bearishCount = group.filter(i => i.signal === 'bearish').length;
    const netSignal: CategoryAggregate['netSignal'] =
      bullishCount > bearishCount ? 'bullish' : bearishCount > bullishCount ? 'bearish' : 'neutral';
    return { category, avgValue, avgThreshold, totalWeight, bullishCount, bearishCount, netSignal };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Getters
// ─────────────────────────────────────────────────────────────────────────────

export function getMarketCycles(): MarketCycle[] {
  return marketCycles;
}

export function getPhaseIndicators(): PhaseIndicator[] {
  return phaseIndicators;
}

export function getPhaseTransitions(): PhaseTransition[] {
  return phaseTransitions;
}

export function getCycleComposites(): CycleComposite[] {
  return cycleComposites;
}

export function getPhaseDistribution(): PhaseDistribution[] {
  return buildPhaseDistribution();
}

export function getCategoryAggregates(): CategoryAggregate[] {
  return buildCategoryAggregates();
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

export function getCycleSummary(): {
  segmentsInMarkup: number;
  segmentsInMarkdown: number;
  avgConfidence: number;
  nearestTransition: string;
} {
  const segmentsInMarkup = marketCycles.filter(c => c.currentPhase === 'markup').length;
  const segmentsInMarkdown = marketCycles.filter(c => c.currentPhase === 'markdown').length;
  const avgConfidence = Math.round(
    marketCycles.reduce((sum, c) => sum + c.confidence, 0) / marketCycles.length
  );

  const today = new Date('2026-04-18');
  let nearest = marketCycles[0];
  let minDays = Infinity;
  for (const cycle of marketCycles) {
    const transDate = new Date(cycle.estimatedTransition);
    const daysUntil = Math.round(
      (transDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil > 0 && daysUntil < minDays) {
      minDays = daysUntil;
      nearest = cycle;
    }
  }

  return {
    segmentsInMarkup,
    segmentsInMarkdown,
    avgConfidence,
    nearestTransition: `${nearest.segment} (${minDays}d)`,
  };
}
