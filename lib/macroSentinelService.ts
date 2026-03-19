import { CardInventory } from '../types';

// ---- Types ----

export type IndicatorCategory = 'Economic' | 'Market' | 'Hobby' | 'Seasonal';
export type IndicatorTrend = 'Rising' | 'Falling' | 'Stable';
export type IndicatorImpact = 'Bullish' | 'Bearish' | 'Neutral';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type MarketRegime = 'Risk-On' | 'Risk-Off' | 'Transition' | 'Neutral';
export type ExposureLevel = 'Well-Positioned' | 'Moderately Exposed' | 'At Risk' | 'Critical Exposure';

export interface MacroIndicator {
  id: string;
  name: string;
  category: IndicatorCategory;
  currentValue: number;
  previousValue: number;
  change: number;
  trend: IndicatorTrend;
  impact: IndicatorImpact;
  description: string;
}

export interface MacroAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  indicator: MacroIndicator;
  recommendation: string;
  timestamp: string;
}

export interface SportExposure {
  sport: string;
  cardCount: number;
  totalValue: number;
  sensitivity: 'High' | 'Medium' | 'Low';
  direction: IndicatorImpact;
}

export interface PortfolioExposure {
  level: ExposureLevel;
  score: number;
  sportExposures: SportExposure[];
  summary: string;
}

export interface MacroSummary {
  regime: MarketRegime;
  indicators: MacroIndicator[];
  alerts: MacroAlert[];
  exposure: PortfolioExposure;
  recommendedActions: string[];
  generatedAt: string;
}

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- Indicator generation ----

const INDICATOR_DEFS: Array<{
  id: string;
  name: string;
  category: IndicatorCategory;
  baseValue: number;
  volatility: number;
  offset: number;
  description: string;
}> = [
  {
    id: 'cci',
    name: 'Consumer Confidence Index',
    category: 'Economic',
    baseValue: 102,
    volatility: 8,
    offset: 1,
    description: 'Measures consumer optimism about the economy; higher values signal willingness to spend on luxury collectibles.',
  },
  {
    id: 'sp500',
    name: 'S&P 500 Trend',
    category: 'Economic',
    baseValue: 4500,
    volatility: 300,
    offset: 2,
    description: 'Broad equity market health; strong equities correlate with higher discretionary spending on hobby assets.',
  },
  {
    id: 'ebay-gmv',
    name: 'eBay GMV Trend',
    category: 'Market',
    baseValue: 100,
    volatility: 15,
    offset: 3,
    description: 'Gross merchandise volume index on eBay sports cards; proxy for market-wide transaction activity.',
  },
  {
    id: 'hobby-search',
    name: 'Hobby Search Volume',
    category: 'Market',
    baseValue: 100,
    volatility: 25,
    offset: 4,
    description: 'Google Trends-style index for sports card search interest. Higher volume often precedes price rallies.',
  },
  {
    id: 'auction-premium',
    name: 'Auction House Premium Index',
    category: 'Market',
    baseValue: 110,
    volatility: 12,
    offset: 5,
    description: 'Average hammer-to-estimate ratio at major auction houses. Above 100 indicates buyers paying premiums.',
  },
  {
    id: 'show-attendance',
    name: 'Card Show Attendance',
    category: 'Hobby',
    baseValue: 100,
    volatility: 20,
    offset: 6,
    description: 'Index of regional and national card show foot traffic; strong attendance signals collector enthusiasm.',
  },
  {
    id: 'new-collectors',
    name: 'New Collector Entry Rate',
    category: 'Hobby',
    baseValue: 100,
    volatility: 18,
    offset: 7,
    description: 'Monthly new registrations on major hobby platforms; rising entry rate expands the buyer pool.',
  },
  {
    id: 'seasonal-demand',
    name: 'Seasonal Demand Cycle',
    category: 'Seasonal',
    baseValue: 100,
    volatility: 30,
    offset: 8,
    description: 'Composite seasonality factor capturing MLB/NFL/NBA schedule effects on demand cycles.',
  },
];

function generateIndicator(def: typeof INDICATOR_DEFS[number], seed: number): MacroIndicator {
  const current = def.baseValue + (seededRange(seed, def.offset, -1, 1) * def.volatility);
  const previous = def.baseValue + (seededRange(seed - 1, def.offset, -1, 1) * def.volatility);
  const change = ((current - previous) / previous) * 100;

  let trend: IndicatorTrend;
  if (change > 1) trend = 'Rising';
  else if (change < -1) trend = 'Falling';
  else trend = 'Stable';

  let impact: IndicatorImpact;
  if (change > 2) impact = 'Bullish';
  else if (change < -2) impact = 'Bearish';
  else impact = 'Neutral';

  return {
    id: def.id,
    name: def.name,
    category: def.category,
    currentValue: Math.round(current * 100) / 100,
    previousValue: Math.round(previous * 100) / 100,
    change: Math.round(change * 100) / 100,
    trend,
    impact,
    description: def.description,
  };
}

// ---- Public API ----

export function getMacroIndicators(): MacroIndicator[] {
  const seed = dateSeed();
  return INDICATOR_DEFS.map((def) => generateIndicator(def, seed));
}

export function generateMacroAlerts(): MacroAlert[] {
  const indicators = getMacroIndicators();
  const alerts: MacroAlert[] = [];
  const now = new Date().toISOString();

  for (const ind of indicators) {
    if (Math.abs(ind.change) > 5) {
      alerts.push({
        id: `alert-${ind.id}-critical`,
        severity: 'Critical',
        title: `${ind.name} ${ind.change > 0 ? 'Surge' : 'Drop'} Detected`,
        description: `${ind.name} has moved ${ind.change > 0 ? '+' : ''}${ind.change.toFixed(1)}% from its previous reading. This is a significant deviation that may impact portfolio valuations.`,
        indicator: ind,
        recommendation: ind.change > 0
          ? 'Consider taking profits on highly liquid positions while demand is elevated.'
          : 'Avoid panic selling. Evaluate positions individually and consider dollar-cost averaging into quality holdings.',
        timestamp: now,
      });
    } else if (Math.abs(ind.change) > 2.5) {
      alerts.push({
        id: `alert-${ind.id}-warning`,
        severity: 'Warning',
        title: `${ind.name} Showing ${ind.trend} Momentum`,
        description: `${ind.name} is ${ind.trend.toLowerCase()} with a ${ind.change > 0 ? '+' : ''}${ind.change.toFixed(1)}% shift. Monitor closely for acceleration.`,
        indicator: ind,
        recommendation: ind.impact === 'Bullish'
          ? 'Favorable conditions developing. Consider positioning in undervalued segments.'
          : 'Headwind conditions forming. Tighten stop-losses on speculative holdings.',
        timestamp: now,
      });
    } else if (Math.abs(ind.change) > 1) {
      alerts.push({
        id: `alert-${ind.id}-info`,
        severity: 'Info',
        title: `${ind.name} Slight Movement`,
        description: `${ind.name} is at ${ind.currentValue.toFixed(1)} with a minor ${ind.change > 0 ? '+' : ''}${ind.change.toFixed(1)}% change. No immediate action required.`,
        indicator: ind,
        recommendation: 'Continue monitoring. No position adjustments needed at this time.',
        timestamp: now,
      });
    }
  }

  // Sort by severity
  const order: Record<AlertSeverity, number> = { Critical: 0, Warning: 1, Info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  return alerts;
}

export function calculateMarketRegime(): MarketRegime {
  const indicators = getMacroIndicators();
  let bullish = 0;
  let bearish = 0;

  for (const ind of indicators) {
    if (ind.impact === 'Bullish') bullish++;
    if (ind.impact === 'Bearish') bearish++;
  }

  if (bullish >= 5) return 'Risk-On';
  if (bearish >= 5) return 'Risk-Off';
  if (bullish >= 3 && bearish >= 3) return 'Transition';
  return 'Neutral';
}

export function getPortfolioExposure(inventory: CardInventory[]): PortfolioExposure {
  const indicators = getMacroIndicators();
  const regime = calculateMarketRegime();

  // Aggregate sport-level exposure
  const sportMap = new Map<string, { count: number; value: number }>();
  for (const card of inventory) {
    const existing = sportMap.get(card.sport) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += card.currentValue || card.purchasePrice || 0;
    sportMap.set(card.sport, existing);
  }

  const sportSensitivity: Record<string, 'High' | 'Medium' | 'Low'> = {
    Baseball: 'High',
    Basketball: 'Medium',
    Football: 'Medium',
    Hockey: 'Low',
    Soccer: 'Low',
  };

  const sportExposures: SportExposure[] = Array.from(sportMap.entries()).map(([sport, data]) => ({
    sport,
    cardCount: data.count,
    totalValue: Math.round(data.value),
    sensitivity: sportSensitivity[sport] || 'Medium',
    direction: regime === 'Risk-On' ? 'Bullish' as const : regime === 'Risk-Off' ? 'Bearish' as const : 'Neutral' as const,
  }));

  // Calculate composite score (0-100, higher = more exposed to risk)
  const bullishCount = indicators.filter((i) => i.impact === 'Bullish').length;
  const bearishCount = indicators.filter((i) => i.impact === 'Bearish').length;
  const highSensCount = sportExposures.filter((s) => s.sensitivity === 'High').length;

  let score = 50;
  score += bearishCount * 6;
  score -= bullishCount * 4;
  score += highSensCount * 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: ExposureLevel;
  if (score < 30) level = 'Well-Positioned';
  else if (score < 55) level = 'Moderately Exposed';
  else if (score < 75) level = 'At Risk';
  else level = 'Critical Exposure';

  const summaryMap: Record<ExposureLevel, string> = {
    'Well-Positioned': 'Portfolio is well-aligned with current macro conditions. Favorable indicators support near-term valuations.',
    'Moderately Exposed': 'Portfolio has moderate sensitivity to current macro headwinds. Consider diversification into defensive segments.',
    'At Risk': 'Multiple macro headwinds detected. Portfolio concentration may amplify downside moves. Review high-exposure positions.',
    'Critical Exposure': 'Significant macro stress detected across key indicators. Immediate portfolio review recommended to reduce risk.',
  };

  return {
    level,
    score,
    sportExposures,
    summary: summaryMap[level],
  };
}

export function getIndicatorHistory(indicatorId: string, periods: number = 6): number[] {
  const seed = dateSeed();
  const def = INDICATOR_DEFS.find((d) => d.id === indicatorId);
  if (!def) return [];

  const history: number[] = [];
  for (let i = periods - 1; i >= 0; i--) {
    const val = def.baseValue + seededRange(seed - i, def.offset, -1, 1) * def.volatility;
    history.push(Math.round(val * 100) / 100);
  }
  return history;
}

export function getRelatedIndicators(indicatorId: string): MacroIndicator[] {
  const indicators = getMacroIndicators();
  const target = indicators.find((i) => i.id === indicatorId);
  if (!target) return [];

  // Return indicators in the same category, plus any with similar impact
  return indicators.filter(
    (i) => i.id !== indicatorId && (i.category === target.category || i.impact === target.impact)
  );
}

export function generateMacroSummary(inventory: CardInventory[]): MacroSummary {
  const regime = calculateMarketRegime();
  const indicators = getMacroIndicators();
  const alerts = generateMacroAlerts();
  const exposure = getPortfolioExposure(inventory);

  const actions: string[] = [];

  if (regime === 'Risk-Off') {
    actions.push('Reduce exposure to speculative rookie cards with no proven track record.');
    actions.push('Prioritize graded, high-pop assets with strong liquidity profiles.');
  } else if (regime === 'Risk-On') {
    actions.push('Selectively add high-upside positions in rising stars and prospect cards.');
    actions.push('Consider monetizing stale inventory while demand conditions are favorable.');
  } else if (regime === 'Transition') {
    actions.push('Maintain current positions but tighten exit price targets.');
    actions.push('Monitor auction results closely for early signs of regime shift.');
  } else {
    actions.push('Continue current strategy. Macro conditions are broadly neutral.');
    actions.push('Use this window for portfolio housekeeping and rebalancing.');
  }

  if (exposure.level === 'At Risk' || exposure.level === 'Critical Exposure') {
    actions.push('Diversify across sports and value tiers to reduce concentration risk.');
  }

  return {
    regime,
    indicators,
    alerts,
    exposure,
    recommendedActions: actions,
    generatedAt: new Date().toISOString(),
  };
}
