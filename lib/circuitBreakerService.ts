// Circuit Breaker Simulator Service — Phase 13
// Portfolio-level trading halts triggered by extreme market moves

export interface CircuitBreaker {
  id: string;
  name: string;
  type: 'price-drop' | 'volume-surge' | 'volatility-spike' | 'correlation-break';
  threshold: number;
  thresholdUnit: string;
  timeWindow: string;
  status: 'armed' | 'triggered' | 'cooldown' | 'disabled';
  lastTriggered: string | null;
  triggerCount: number;
  category: string;
}

export interface BreakerEvent {
  id: string;
  breakerId: string;
  breakerName: string;
  triggeredAt: string;
  triggerValue: number;
  threshold: number;
  duration: string;
  category: string;
  cardsAffected: number;
  valueSaved: number;
  autoAction: string;
  resolved: boolean;
}

export interface BreakerRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  triggerCount: number;
  lastModified: string;
}

export interface SimulationResult {
  id: string;
  scenario: string;
  breakersTriggered: number;
  totalHaltTime: string;
  portfolioImpact: number;
  withoutBreakers: number;
  savings: number;
  riskReduction: number;
}

const MOCK_BREAKERS: CircuitBreaker[] = [
  { id: 'cb-1', name: 'Flash Crash Protection', type: 'price-drop', threshold: 15, thresholdUnit: '% decline', timeWindow: '1 hour', status: 'armed', lastTriggered: '2026-03-28', triggerCount: 3, category: 'All Cards' },
  { id: 'cb-2', name: 'Volume Anomaly Halt', type: 'volume-surge', threshold: 300, thresholdUnit: '% above avg', timeWindow: '30 minutes', status: 'armed', lastTriggered: '2026-04-05', triggerCount: 7, category: 'Modern Basketball' },
  { id: 'cb-3', name: 'Volatility Circuit Breaker', type: 'volatility-spike', threshold: 45, thresholdUnit: '% implied vol', timeWindow: '2 hours', status: 'armed', lastTriggered: '2026-04-12', triggerCount: 5, category: 'Football RPAs' },
  { id: 'cb-4', name: 'Correlation Breakdown Alert', type: 'correlation-break', threshold: 0.3, thresholdUnit: 'correlation drop', timeWindow: '24 hours', status: 'cooldown', lastTriggered: '2026-04-17', triggerCount: 2, category: 'Cross-Sport' },
  { id: 'cb-5', name: 'Vintage Price Floor', type: 'price-drop', threshold: 10, thresholdUnit: '% decline', timeWindow: '4 hours', status: 'armed', lastTriggered: null, triggerCount: 0, category: 'Vintage Baseball' },
  { id: 'cb-6', name: 'Prospect Sell-Off Guard', type: 'volume-surge', threshold: 500, thresholdUnit: '% above avg', timeWindow: '15 minutes', status: 'triggered', lastTriggered: '2026-04-18', triggerCount: 12, category: 'Baseball Prospects' },
  { id: 'cb-7', name: 'High-Value Asset Shield', type: 'price-drop', threshold: 8, thresholdUnit: '% decline', timeWindow: '30 minutes', status: 'armed', lastTriggered: '2026-02-14', triggerCount: 1, category: 'Cards > $10K' },
  { id: 'cb-8', name: 'Market-Wide Panic Stop', type: 'volatility-spike', threshold: 60, thresholdUnit: '% implied vol', timeWindow: '1 hour', status: 'disabled', lastTriggered: '2025-11-22', triggerCount: 1, category: 'All Categories' },
];

const MOCK_EVENTS: BreakerEvent[] = [
  { id: 'be-1', breakerId: 'cb-6', breakerName: 'Prospect Sell-Off Guard', triggeredAt: '2026-04-18T07:22:00Z', triggerValue: 580, threshold: 500, duration: '45 min', category: 'Baseball Prospects', cardsAffected: 34, valueSaved: 12800, autoAction: 'Pause all sell listings', resolved: false },
  { id: 'be-2', breakerId: 'cb-4', breakerName: 'Correlation Breakdown Alert', triggeredAt: '2026-04-17T14:15:00Z', triggerValue: 0.38, threshold: 0.3, duration: '2 hours', category: 'Cross-Sport', cardsAffected: 156, valueSaved: 45200, autoAction: 'Alert + hedge suggestion', resolved: true },
  { id: 'be-3', breakerId: 'cb-3', breakerName: 'Volatility Circuit Breaker', triggeredAt: '2026-04-12T11:30:00Z', triggerValue: 52, threshold: 45, duration: '1.5 hours', category: 'Football RPAs', cardsAffected: 28, valueSaved: 18900, autoAction: 'Pause buying + widen spreads', resolved: true },
  { id: 'be-4', breakerId: 'cb-2', breakerName: 'Volume Anomaly Halt', triggeredAt: '2026-04-05T16:45:00Z', triggerValue: 420, threshold: 300, duration: '30 min', category: 'Modern Basketball', cardsAffected: 67, valueSaved: 31500, autoAction: 'Pause all activity', resolved: true },
  { id: 'be-5', breakerId: 'cb-1', breakerName: 'Flash Crash Protection', triggeredAt: '2026-03-28T09:10:00Z', triggerValue: 18.5, threshold: 15, duration: '1 hour', category: 'All Cards', cardsAffected: 245, valueSaved: 89000, autoAction: 'Full trading halt', resolved: true },
  { id: 'be-6', breakerId: 'cb-2', breakerName: 'Volume Anomaly Halt', triggeredAt: '2026-03-15T13:20:00Z', triggerValue: 350, threshold: 300, duration: '20 min', category: 'Modern Basketball', cardsAffected: 42, valueSaved: 15600, autoAction: 'Pause all activity', resolved: true },
  { id: 'be-7', breakerId: 'cb-3', breakerName: 'Volatility Circuit Breaker', triggeredAt: '2026-03-01T10:00:00Z', triggerValue: 48, threshold: 45, duration: '45 min', category: 'Football RPAs', cardsAffected: 19, valueSaved: 8400, autoAction: 'Pause buying + widen spreads', resolved: true },
  { id: 'be-8', breakerId: 'cb-1', breakerName: 'Flash Crash Protection', triggeredAt: '2026-02-20T08:30:00Z', triggerValue: 22, threshold: 15, duration: '2 hours', category: 'All Cards', cardsAffected: 312, valueSaved: 125000, autoAction: 'Full trading halt', resolved: true },
  { id: 'be-9', breakerId: 'cb-8', breakerName: 'Market-Wide Panic Stop', triggeredAt: '2025-11-22T15:00:00Z', triggerValue: 72, threshold: 60, duration: '4 hours', category: 'All Categories', cardsAffected: 890, valueSaved: 342000, autoAction: 'Emergency halt all venues', resolved: true },
  { id: 'be-10', breakerId: 'cb-6', breakerName: 'Prospect Sell-Off Guard', triggeredAt: '2026-04-10T09:45:00Z', triggerValue: 620, threshold: 500, duration: '1 hour', category: 'Baseball Prospects', cardsAffected: 51, valueSaved: 22300, autoAction: 'Pause all sell listings', resolved: true },
  { id: 'be-11', breakerId: 'cb-7', breakerName: 'High-Value Asset Shield', triggeredAt: '2026-02-14T11:00:00Z', triggerValue: 9.2, threshold: 8, duration: '30 min', category: 'Cards > $10K', cardsAffected: 8, valueSaved: 48000, autoAction: 'Lock high-value holdings', resolved: true },
  { id: 'be-12', breakerId: 'cb-6', breakerName: 'Prospect Sell-Off Guard', triggeredAt: '2026-03-22T14:30:00Z', triggerValue: 540, threshold: 500, duration: '25 min', category: 'Baseball Prospects', cardsAffected: 38, valueSaved: 14200, autoAction: 'Pause all sell listings', resolved: true },
];

const MOCK_RULES: BreakerRule[] = [
  { id: 'br-1', name: 'Price Drop > 15% in 1hr', condition: 'price_change < -15% within 60min', action: 'Halt all trading activity for 1 hour', priority: 'critical', enabled: true, triggerCount: 3, lastModified: '2026-04-01' },
  { id: 'br-2', name: 'Volume Spike > 300%', condition: 'volume > 300% of 7d_avg within 30min', action: 'Pause trading, alert user', priority: 'high', enabled: true, triggerCount: 7, lastModified: '2026-03-15' },
  { id: 'br-3', name: 'Implied Vol > 45%', condition: 'implied_volatility > 45% within 2hr', action: 'Widen bid/ask spreads, pause auto-buys', priority: 'high', enabled: true, triggerCount: 5, lastModified: '2026-03-20' },
  { id: 'br-4', name: 'Correlation Break > 0.3', condition: 'cross_correlation_drop > 0.3 within 24hr', action: 'Alert and suggest hedges', priority: 'medium', enabled: true, triggerCount: 2, lastModified: '2026-04-10' },
  { id: 'br-5', name: 'Vintage Floor Breach', condition: 'vintage_index_change < -10% within 4hr', action: 'Lock vintage holdings from sale', priority: 'medium', enabled: true, triggerCount: 0, lastModified: '2026-02-28' },
  { id: 'br-6', name: 'Prospect Fire Sale', condition: 'prospect_sell_volume > 500% within 15min', action: 'Pause all prospect sell listings', priority: 'critical', enabled: true, triggerCount: 12, lastModified: '2026-04-15' },
  { id: 'br-7', name: 'High-Value Protection', condition: 'asset_value_change < -8% for items > $10K within 30min', action: 'Lock high-value assets', priority: 'high', enabled: true, triggerCount: 1, lastModified: '2026-01-20' },
  { id: 'br-8', name: 'Market Panic Emergency', condition: 'market_wide_vol > 60% within 1hr', action: 'Emergency halt across all venues', priority: 'critical', enabled: false, triggerCount: 1, lastModified: '2025-11-25' },
];

const MOCK_SIMULATIONS: SimulationResult[] = [
  { id: 'sim-1', scenario: '2022-style Modern Correction', breakersTriggered: 5, totalHaltTime: '8 hours', portfolioImpact: -18, withoutBreakers: -42, savings: 24, riskReduction: 57 },
  { id: 'sim-2', scenario: 'COVID-style Flash Crash', breakersTriggered: 4, totalHaltTime: '6 hours', portfolioImpact: -12, withoutBreakers: -35, savings: 23, riskReduction: 66 },
  { id: 'sim-3', scenario: 'License Loss Panic', breakersTriggered: 3, totalHaltTime: '4 hours', portfolioImpact: -15, withoutBreakers: -38, savings: 23, riskReduction: 61 },
  { id: 'sim-4', scenario: 'Single Player Injury Crash', breakersTriggered: 2, totalHaltTime: '2 hours', portfolioImpact: -8, withoutBreakers: -22, savings: 14, riskReduction: 64 },
  { id: 'sim-5', scenario: 'Grading Company Scandal', breakersTriggered: 3, totalHaltTime: '5 hours', portfolioImpact: -20, withoutBreakers: -45, savings: 25, riskReduction: 56 },
];

export function getCircuitBreakers(): CircuitBreaker[] { return [...MOCK_BREAKERS]; }
export function getBreakerEvents(): BreakerEvent[] { return [...MOCK_EVENTS]; }
export function getBreakerRules(): BreakerRule[] { return [...MOCK_RULES]; }
export function getSimulationResults(): SimulationResult[] { return [...MOCK_SIMULATIONS]; }
export function getArmedCount(): number { return MOCK_BREAKERS.filter(b => b.status === 'armed').length; }
export function getTriggeredCount(): number { return MOCK_BREAKERS.filter(b => b.status === 'triggered').length; }
export function getTotalValueSaved(): number { return MOCK_EVENTS.reduce((sum, e) => sum + e.valueSaved, 0); }
export function getAvgRiskReduction(): number { return Math.round(MOCK_SIMULATIONS.reduce((sum, s) => sum + s.riskReduction, 0) / MOCK_SIMULATIONS.length); }
