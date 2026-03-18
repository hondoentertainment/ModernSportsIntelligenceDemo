// ---- Types ----

export type EmotionTag = 'fomo' | 'excitement' | 'panic' | 'revenge' | 'boredom' | 'calculated';

export interface TradeEntry {
  id: string;
  date: string;
  player: string;
  cardDescription: string;
  action: 'buy' | 'sell';
  price: number;
  currentValue: number;
  emotion: EmotionTag;
  intensity: number; // 1-10
  notes: string;
  outcome: number; // realized or unrealized P&L
}

export interface EmotionPnL {
  emotion: EmotionTag;
  tradeCount: number;
  totalPnL: number;
  avgPnL: number;
  winRate: number;
  avgIntensity: number;
  worstTrade: string;
  bestTrade: string;
}

export interface BehaviorInsight {
  id: string;
  type: 'warning' | 'pattern' | 'suggestion';
  title: string;
  description: string;
  emotion: EmotionTag;
  severity: 'low' | 'medium' | 'high';
  occurrences: number;
}

// ---- Mock Data ----

const MOCK_TRADES: TradeEntry[] = [
  { id: 'te-1', date: '2026-03-14', player: 'Victor Wembanyama', cardDescription: '2023 Prizm Silver #1 PSA 10', action: 'buy', price: 480, currentValue: 410, emotion: 'fomo', intensity: 8, notes: 'Saw three people post about buying. Felt like I was missing out.', outcome: -70 },
  { id: 'te-2', date: '2026-03-12', player: 'Anthony Edwards', cardDescription: '2020 Prizm Base #258 PSA 10', action: 'sell', price: 195, currentValue: 240, emotion: 'panic', intensity: 9, notes: 'Wolves lost three in a row. Panicked and sold at a loss.', outcome: -45 },
  { id: 'te-3', date: '2026-03-10', player: 'Luka Doncic', cardDescription: '2018 Prizm Silver #280 BGS 9.5', action: 'buy', price: 620, currentValue: 710, emotion: 'calculated', intensity: 3, notes: 'Researched comps for two weeks. Bought at 12% below 90-day avg.', outcome: 90 },
  { id: 'te-4', date: '2026-03-08', player: 'Jayson Tatum', cardDescription: '2017 Prizm #16 RC PSA 10', action: 'sell', price: 1050, currentValue: 980, emotion: 'calculated', intensity: 2, notes: 'Hit my target sell price. Locked in 35% gain.', outcome: 280 },
  { id: 'te-5', date: '2026-03-06', player: 'Caleb Williams', cardDescription: '2024 Prizm Silver RC Raw', action: 'buy', price: 210, currentValue: 145, emotion: 'excitement', intensity: 7, notes: 'Just drafted #1! Had to grab one immediately.', outcome: -65 },
  { id: 'te-6', date: '2026-03-04', player: 'Shohei Ohtani', cardDescription: '2018 Topps Update #US1 PSA 10', action: 'sell', price: 350, currentValue: 420, emotion: 'revenge', intensity: 8, notes: 'Lost money on the last Ohtani trade. Sold this one too early to feel like I won something.', outcome: -70 },
  { id: 'te-7', date: '2026-03-02', player: 'Patrick Mahomes', cardDescription: '2017 Prizm #269 PSA 9', action: 'buy', price: 1250, currentValue: 1380, emotion: 'calculated', intensity: 2, notes: 'Off-season dip. Historical data shows 15-20% rebound by September.', outcome: 130 },
  { id: 'te-8', date: '2026-02-28', player: 'Juan Soto', cardDescription: '2018 Topps Chrome Update #HMT55 PSA 10', action: 'buy', price: 190, currentValue: 215, emotion: 'boredom', intensity: 5, notes: 'Nothing else to do on a Friday night. Just browsing eBay and impulse bought.', outcome: 25 },
  { id: 'te-9', date: '2026-02-25', player: 'Caitlin Clark', cardDescription: '2024 Prizm Base #101 PSA 10', action: 'buy', price: 120, currentValue: 95, emotion: 'fomo', intensity: 7, notes: 'Everyone on Twitter saying to buy before WNBA season.', outcome: -25 },
  { id: 'te-10', date: '2026-02-20', player: 'Connor Bedard', cardDescription: '2023 Upper Deck YG #201 PSA 10', action: 'sell', price: 180, currentValue: 165, emotion: 'panic', intensity: 6, notes: 'Bedard got a minor injury. Sold immediately without checking severity.', outcome: -35 },
  { id: 'te-11', date: '2026-02-15', player: 'Mike Trout', cardDescription: '2011 Topps Update #US175 PSA 9', action: 'buy', price: 850, currentValue: 920, emotion: 'calculated', intensity: 1, notes: 'Long-term HOF investment. Dollar cost averaging into position.', outcome: 70 },
  { id: 'te-12', date: '2026-02-10', player: 'Tyrese Maxey', cardDescription: '2020 Prizm Silver #256 RC PSA 9', action: 'buy', price: 175, currentValue: 140, emotion: 'revenge', intensity: 9, notes: 'Lost on the last Maxey sale. Buying back in to prove my thesis right.', outcome: -35 },
];

const MOCK_INSIGHTS: BehaviorInsight[] = [
  { id: 'bi-1', type: 'warning', title: 'FOMO purchases underperform by 42%', description: 'Your trades triggered by fear of missing out have an average loss of $47.50. Consider implementing a 24-hour cooling-off period before FOMO buys.', emotion: 'fomo', severity: 'high', occurrences: 2 },
  { id: 'bi-2', type: 'warning', title: 'Panic sells lock in unnecessary losses', description: 'Both panic sells resulted in losses. The cards recovered within days. Build a rule: no selling within 2 hours of bad news.', emotion: 'panic', severity: 'high', occurrences: 2 },
  { id: 'bi-3', type: 'pattern', title: 'Calculated trades are consistently profitable', description: 'All four calculated trades are in the green with an average gain of $142.50. Your research-driven approach works — trust it more.', emotion: 'calculated', severity: 'low', occurrences: 4 },
  { id: 'bi-4', type: 'warning', title: 'Revenge trading is destroying value', description: 'Revenge trades average -$52.50 P&L. You are re-entering positions to validate ego, not based on market data. Flag and avoid.', emotion: 'revenge', severity: 'high', occurrences: 2 },
  { id: 'bi-5', type: 'suggestion', title: 'Channel boredom into research instead', description: 'Your one boredom trade had a small gain, but impulse buying during idle time is risky. Redirect that energy into comp research.', emotion: 'boredom', severity: 'medium', occurrences: 1 },
  { id: 'bi-6', type: 'pattern', title: 'High-intensity trades correlate with losses', description: 'Trades with intensity 7+ have an average loss of $51.67, while trades rated 1-3 average a gain of $142.50. Stay calm to stay profitable.', emotion: 'excitement', severity: 'medium', occurrences: 7 },
];

// ---- Service Functions ----

function computeEmotionPnL(emotion: EmotionTag, trades: TradeEntry[]): EmotionPnL {
  const filtered = trades.filter((t) => t.emotion === emotion);
  if (filtered.length === 0) {
    return { emotion, tradeCount: 0, totalPnL: 0, avgPnL: 0, winRate: 0, avgIntensity: 0, worstTrade: 'N/A', bestTrade: 'N/A' };
  }
  const totalPnL = filtered.reduce((sum, t) => sum + t.outcome, 0);
  const wins = filtered.filter((t) => t.outcome > 0).length;
  const avgIntensity = filtered.reduce((sum, t) => sum + t.intensity, 0) / filtered.length;
  const sorted = [...filtered].sort((a, b) => a.outcome - b.outcome);
  return {
    emotion,
    tradeCount: filtered.length,
    totalPnL,
    avgPnL: Math.round(totalPnL / filtered.length * 100) / 100,
    winRate: Math.round((wins / filtered.length) * 1000) / 10,
    avgIntensity: Math.round(avgIntensity * 10) / 10,
    worstTrade: `${sorted[0].player} (${sorted[0].outcome > 0 ? '+' : ''}$${sorted[0].outcome})`,
    bestTrade: `${sorted[sorted.length - 1].player} (${sorted[sorted.length - 1].outcome > 0 ? '+' : ''}$${sorted[sorted.length - 1].outcome})`,
  };
}

export function getTrades(): TradeEntry[] {
  return [...MOCK_TRADES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEmotionPnL(): EmotionPnL[] {
  const emotions: EmotionTag[] = ['fomo', 'excitement', 'panic', 'revenge', 'boredom', 'calculated'];
  return emotions.map((e) => computeEmotionPnL(e, MOCK_TRADES)).filter((e) => e.tradeCount > 0);
}

export function getInsights(): BehaviorInsight[] {
  return [...MOCK_INSIGHTS].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function getEmotionStats(): { emotion: EmotionTag; count: number; pct: number }[] {
  const total = MOCK_TRADES.length;
  const counts: Record<string, number> = {};
  MOCK_TRADES.forEach((t) => { counts[t.emotion] = (counts[t.emotion] || 0) + 1; });
  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion: emotion as EmotionTag, count, pct: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}

export function getWorstEmotions(): EmotionPnL[] {
  return getEmotionPnL().sort((a, b) => a.avgPnL - b.avgPnL);
}

export default {
  getTrades,
  getEmotionPnL,
  getInsights,
  getEmotionStats,
  getWorstEmotions,
};
