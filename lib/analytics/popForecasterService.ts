// ---- Types ----

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ForecastDirection = 'up' | 'down' | 'flat';
export type ScarcityTier = 'ultra-rare' | 'rare' | 'uncommon' | 'common';

export interface PopForecast {
  id: string;
  cardName: string;
  playerName: string;
  grade: string;
  currentPop: number;
  predictedPop30d: number;
  predictedPop90d: number;
  currentValue: number;
  predictedValue30d: number;
  predictedValue90d: number;
  confidence: ConfidenceLevel;
  direction: ForecastDirection;
  scarcityTier: ScarcityTier;
  dilutionRisk: number;
}

export interface SubmissionVelocity {
  id: string;
  cardName: string;
  playerName: string;
  grade: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  acceleration: number;
  trend: 'accelerating' | 'decelerating' | 'steady';
  estimatedQueueDepth: number;
  projectedCompletionDate: string;
}

export interface ScarcityImpact {
  id: string;
  cardName: string;
  playerName: string;
  grade: string;
  currentPop: number;
  scarcityTier: ScarcityTier;
  premiumPercent: number;
  erosionRate: number;
  breakEvenPop: number;
  monthsToBreakEven: number | null;
  riskLevel: 'safe' | 'watch' | 'danger';
}

export interface MarketTrend {
  id: string;
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: number;
  affectedCards: string[];
  timeframe: string;
  confidence: ConfidenceLevel;
}

export interface PopStats {
  totalCardsTracked: number;
  avgDilutionRisk: number;
  highConfidenceForecasts: number;
  cardsAtRisk: number;
  avgPremiumErosion: number;
  trendingUp: number;
  trendingDown: number;
}

// ---- Mock Data ----

const mockForecasts: PopForecast[] = [
  { id: 'pf-001', cardName: '2003 Topps Chrome #111', playerName: 'LeBron James', grade: 'PSA 10', currentPop: 1842, predictedPop30d: 1905, predictedPop90d: 2048, currentValue: 42500, predictedValue30d: 40200, predictedValue90d: 36800, confidence: 'high', direction: 'down', scarcityTier: 'uncommon', dilutionRisk: 72 },
  { id: 'pf-002', cardName: '1986 Fleer #57', playerName: 'Michael Jordan', grade: 'PSA 10', currentPop: 318, predictedPop30d: 322, predictedPop90d: 330, currentValue: 738000, predictedValue30d: 745000, predictedValue90d: 755000, confidence: 'high', direction: 'up', scarcityTier: 'rare', dilutionRisk: 8 },
  { id: 'pf-003', cardName: '2018 Prizm #280', playerName: 'Luka Doncic', grade: 'PSA 10', currentPop: 4521, predictedPop30d: 4820, predictedPop90d: 5400, currentValue: 2800, predictedValue30d: 2450, predictedValue90d: 2100, confidence: 'medium', direction: 'down', scarcityTier: 'common', dilutionRisk: 85 },
  { id: 'pf-004', cardName: '2020 Prizm #339', playerName: 'Justin Herbert', grade: 'PSA 10', currentPop: 892, predictedPop30d: 945, predictedPop90d: 1080, currentValue: 485, predictedValue30d: 440, predictedValue90d: 380, confidence: 'medium', direction: 'down', scarcityTier: 'uncommon', dilutionRisk: 64 },
  { id: 'pf-005', cardName: '2023 Topps Chrome #1', playerName: 'Victor Wembanyama', grade: 'PSA 10', currentPop: 234, predictedPop30d: 580, predictedPop90d: 1200, currentValue: 1850, predictedValue30d: 920, predictedValue90d: 480, confidence: 'high', direction: 'down', scarcityTier: 'rare', dilutionRisk: 95 },
  { id: 'pf-006', cardName: '2000 Playoff Contenders #144', playerName: 'Tom Brady', grade: 'PSA 10', currentPop: 29, predictedPop30d: 30, predictedPop90d: 31, currentValue: 3107000, predictedValue30d: 3200000, predictedValue90d: 3350000, confidence: 'high', direction: 'up', scarcityTier: 'ultra-rare', dilutionRisk: 3 },
  { id: 'pf-007', cardName: '2018 Optic Rated Rookie #176', playerName: 'Shohei Ohtani', grade: 'PSA 10', currentPop: 1567, predictedPop30d: 1620, predictedPop90d: 1740, currentValue: 1200, predictedValue30d: 1150, predictedValue90d: 1050, confidence: 'medium', direction: 'down', scarcityTier: 'uncommon', dilutionRisk: 52 },
  { id: 'pf-008', cardName: '1979 O-Pee-Chee #18', playerName: 'Wayne Gretzky', grade: 'PSA 10', currentPop: 2, predictedPop30d: 2, predictedPop90d: 2, currentValue: 3750000, predictedValue30d: 3800000, predictedValue90d: 3900000, confidence: 'high', direction: 'up', scarcityTier: 'ultra-rare', dilutionRisk: 0 },
];

const mockVelocities: SubmissionVelocity[] = [
  { id: 'sv-001', cardName: '2023 Topps Chrome #1', playerName: 'Victor Wembanyama', grade: 'PSA 10', dailyRate: 11.5, weeklyRate: 80.5, monthlyRate: 346, acceleration: 42, trend: 'accelerating', estimatedQueueDepth: 1840, projectedCompletionDate: '2026-06-15' },
  { id: 'sv-002', cardName: '2003 Topps Chrome #111', playerName: 'LeBron James', grade: 'PSA 10', dailyRate: 2.1, weeklyRate: 14.7, monthlyRate: 63, acceleration: -8, trend: 'decelerating', estimatedQueueDepth: 245, projectedCompletionDate: '2026-07-20' },
  { id: 'sv-003', cardName: '2018 Prizm #280', playerName: 'Luka Doncic', grade: 'PSA 10', dailyRate: 9.8, weeklyRate: 68.6, monthlyRate: 299, acceleration: 15, trend: 'accelerating', estimatedQueueDepth: 1420, projectedCompletionDate: '2026-08-01' },
  { id: 'sv-004', cardName: '2024 Bowman Chrome #1', playerName: 'Travis Bazzana', grade: 'PSA 10', dailyRate: 18.2, weeklyRate: 127.4, monthlyRate: 546, acceleration: 88, trend: 'accelerating', estimatedQueueDepth: 3200, projectedCompletionDate: '2026-09-10' },
  { id: 'sv-005', cardName: '2020 Prizm #339', playerName: 'Justin Herbert', grade: 'PSA 10', dailyRate: 1.7, weeklyRate: 11.9, monthlyRate: 53, acceleration: -22, trend: 'decelerating', estimatedQueueDepth: 180, projectedCompletionDate: '2026-06-28' },
  { id: 'sv-006', cardName: '2018 Optic #176', playerName: 'Shohei Ohtani', grade: 'PSA 10', dailyRate: 1.8, weeklyRate: 12.6, monthlyRate: 53, acceleration: 3, trend: 'steady', estimatedQueueDepth: 210, projectedCompletionDate: '2026-07-05' },
];

const mockScarcityImpacts: ScarcityImpact[] = [
  { id: 'si-001', cardName: '2003 Topps Chrome #111', playerName: 'LeBron James', grade: 'PSA 10', currentPop: 1842, scarcityTier: 'uncommon', premiumPercent: 185, erosionRate: 2.1, breakEvenPop: 2800, monthsToBreakEven: 14, riskLevel: 'watch' },
  { id: 'si-002', cardName: '1986 Fleer #57', playerName: 'Michael Jordan', grade: 'PSA 10', currentPop: 318, scarcityTier: 'rare', premiumPercent: 340, erosionRate: 0.8, breakEvenPop: 600, monthsToBreakEven: null, riskLevel: 'safe' },
  { id: 'si-003', cardName: '2023 Topps Chrome #1', playerName: 'Victor Wembanyama', grade: 'PSA 10', currentPop: 234, scarcityTier: 'rare', premiumPercent: 420, erosionRate: 12.5, breakEvenPop: 800, monthsToBreakEven: 5, riskLevel: 'danger' },
  { id: 'si-004', cardName: '2018 Prizm #280', playerName: 'Luka Doncic', grade: 'PSA 10', currentPop: 4521, scarcityTier: 'common', premiumPercent: 45, erosionRate: 3.8, breakEvenPop: 5200, monthsToBreakEven: 6, riskLevel: 'danger' },
  { id: 'si-005', cardName: '2000 Playoff Contenders #144', playerName: 'Tom Brady', grade: 'PSA 10', currentPop: 29, scarcityTier: 'ultra-rare', premiumPercent: 890, erosionRate: 0.1, breakEvenPop: 100, monthsToBreakEven: null, riskLevel: 'safe' },
  { id: 'si-006', cardName: '1979 O-Pee-Chee #18', playerName: 'Wayne Gretzky', grade: 'PSA 10', currentPop: 2, scarcityTier: 'ultra-rare', premiumPercent: 2400, erosionRate: 0.0, breakEvenPop: 10, monthsToBreakEven: null, riskLevel: 'safe' },
];

const mockTrends: MarketTrend[] = [
  { id: 'mt-001', name: 'PSA Turnaround Acceleration', description: 'PSA has reduced average turnaround time from 45 to 28 days, flooding the market with newly graded inventory. Modern cards face the highest dilution pressure.', impact: 'negative', magnitude: 8, affectedCards: ['2023 Topps Chrome #1', '2018 Prizm #280', '2024 Bowman Chrome #1'], timeframe: '3-6 months', confidence: 'high' },
  { id: 'mt-002', name: 'Vintage Supply Ceiling', description: 'Vintage card submissions have plateaued as remaining ungraded inventory shrinks. PSA 10 pops for pre-1980 cards are nearly fixed.', impact: 'positive', magnitude: 9, affectedCards: ['1986 Fleer #57', '1979 O-Pee-Chee #18'], timeframe: 'Permanent', confidence: 'high' },
  { id: 'mt-003', name: 'AI Grading Competition', description: 'New AI-powered grading services offering 48-hour turnaround are pulling volume from PSA/BGS. Long-term pop report reliability may fragment.', impact: 'neutral', magnitude: 5, affectedCards: ['All Modern Cards'], timeframe: '6-12 months', confidence: 'low' },
  { id: 'mt-004', name: 'Wembanyama Rookie Flood', description: 'Record-breaking submission volume for Wembanyama rookies. PSA 10 pop expected to exceed 1,200 within 90 days, severely eroding scarcity premium.', impact: 'negative', magnitude: 9, affectedCards: ['2023 Topps Chrome #1'], timeframe: '1-3 months', confidence: 'high' },
  { id: 'mt-005', name: 'Brady Retirement Premium Lock', description: 'Post-retirement card submissions have nearly ceased. Pop counts are functionally locked, creating permanent scarcity for gem-mint examples.', impact: 'positive', magnitude: 7, affectedCards: ['2000 Playoff Contenders #144'], timeframe: 'Permanent', confidence: 'high' },
];

// ---- Public API ----

export function getForecasts(): PopForecast[] {
  return mockForecasts;
}

export function getSubmissionVelocities(): SubmissionVelocity[] {
  return mockVelocities;
}

export function getScarcityImpacts(): ScarcityImpact[] {
  return mockScarcityImpacts;
}

export function getTrends(): MarketTrend[] {
  return mockTrends;
}

export function getPopStats(): PopStats {
  return {
    totalCardsTracked: mockForecasts.length,
    avgDilutionRisk: Math.round(mockForecasts.reduce((a, b) => a + b.dilutionRisk, 0) / mockForecasts.length),
    highConfidenceForecasts: mockForecasts.filter(f => f.confidence === 'high').length,
    cardsAtRisk: mockScarcityImpacts.filter(s => s.riskLevel === 'danger').length,
    avgPremiumErosion: Math.round(mockScarcityImpacts.reduce((a, b) => a + b.erosionRate, 0) / mockScarcityImpacts.length * 10) / 10,
    trendingUp: mockForecasts.filter(f => f.direction === 'up').length,
    trendingDown: mockForecasts.filter(f => f.direction === 'down').length,
  };
}
