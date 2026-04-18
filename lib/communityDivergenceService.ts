// Community Sentiment Divergence Service
// Detects when community sentiment diverges from actual price action

export interface DivergenceSignal {
  id: string;
  cardName: string;
  playerName: string;
  sentimentScore: number;
  priceDirection: "up" | "down" | "flat";
  priceTrend: number;
  divergenceGap: number;
  divergenceType: "bullish_divergence" | "bearish_divergence" | "neutral";
  confidence: number;
  detectedDate: string;
  status: "active" | "resolved" | "watching";
  category: string;
}

export interface SentimentVsPrice {
  id: string;
  cardName: string;
  month: string;
  sentimentScore: number;
  priceChange: number;
  volume: number;
  correlation: number;
}

export interface DivergenceHistory {
  id: string;
  cardName: string;
  divergenceType: string;
  startDate: string;
  endDate: string;
  gapAtPeak: number;
  resolution: "price_followed_sentiment" | "sentiment_followed_price" | "both_converged";
  profitOpportunity: number;
  durationDays: number;
}

export interface DivergenceAlert {
  id: string;
  cardName: string;
  alertType: "new_divergence" | "widening_gap" | "convergence_signal" | "extreme_divergence";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  actionSuggestion: string;
}

const mockDivergenceSignals: DivergenceSignal[] = [
  { id: "ds1", cardName: "2020 Prizm Justin Herbert Silver PSA 10", playerName: "Justin Herbert", sentimentScore: 28, priceDirection: "up", priceTrend: 12.5, divergenceGap: 62, divergenceType: "bullish_divergence", confidence: 78, detectedDate: "2026-04-10", status: "active", category: "Modern Football" },
  { id: "ds2", cardName: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", sentimentScore: 22, priceDirection: "down", priceTrend: -8.2, divergenceGap: 14, divergenceType: "neutral", confidence: 45, detectedDate: "2026-04-08", status: "watching", category: "Modern Basketball" },
  { id: "ds3", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", sentimentScore: 85, priceDirection: "flat", priceTrend: 1.2, divergenceGap: 55, divergenceType: "bearish_divergence", confidence: 72, detectedDate: "2026-04-12", status: "active", category: "Modern Basketball" },
  { id: "ds4", cardName: "2023 Bowman Chrome Wembanyama 1st Auto", playerName: "Victor Wembanyama", sentimentScore: 92, priceDirection: "down", priceTrend: -5.8, divergenceGap: 78, divergenceType: "bearish_divergence", confidence: 85, detectedDate: "2026-04-14", status: "active", category: "Modern Basketball" },
  { id: "ds5", cardName: "2011 Topps Update Mike Trout RC PSA 10", playerName: "Mike Trout", sentimentScore: 35, priceDirection: "up", priceTrend: 8.4, divergenceGap: 48, divergenceType: "bullish_divergence", confidence: 68, detectedDate: "2026-04-09", status: "active", category: "Modern Baseball" },
  { id: "ds6", cardName: "2018 Topps Chrome Shohei Ohtani RC PSA 10", playerName: "Shohei Ohtani", sentimentScore: 88, priceDirection: "up", priceTrend: 15.2, divergenceGap: 8, divergenceType: "neutral", confidence: 92, detectedDate: "2026-04-15", status: "resolved", category: "Modern Baseball" },
  { id: "ds7", cardName: "2003 Topps Chrome LeBron James RC PSA 10", playerName: "LeBron James", sentimentScore: 45, priceDirection: "down", priceTrend: -12.1, divergenceGap: 33, divergenceType: "neutral", confidence: 55, detectedDate: "2026-04-11", status: "watching", category: "Modern Basketball" },
  { id: "ds8", cardName: "2020 Prizm Joe Burrow Silver PSA 10", playerName: "Joe Burrow", sentimentScore: 78, priceDirection: "up", priceTrend: 18.5, divergenceGap: 12, divergenceType: "neutral", confidence: 88, detectedDate: "2026-04-13", status: "resolved", category: "Modern Football" },
  { id: "ds9", cardName: "1986 Fleer Michael Jordan #57 PSA 9", playerName: "Michael Jordan", sentimentScore: 72, priceDirection: "flat", priceTrend: 0.8, divergenceGap: 42, divergenceType: "bearish_divergence", confidence: 62, detectedDate: "2026-04-07", status: "active", category: "Vintage Basketball" },
  { id: "ds10", cardName: "2022 Topps Chrome Julio Rodriguez RC PSA 10", playerName: "Julio Rodriguez", sentimentScore: 58, priceDirection: "down", priceTrend: -15.3, divergenceGap: 38, divergenceType: "bullish_divergence", confidence: 58, detectedDate: "2026-04-06", status: "active", category: "Modern Baseball" },
  { id: "ds11", cardName: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", sentimentScore: 82, priceDirection: "down", priceTrend: -22.4, divergenceGap: 72, divergenceType: "bearish_divergence", confidence: 81, detectedDate: "2026-04-15", status: "active", category: "Modern Football" },
  { id: "ds12", cardName: "2021 Prizm Anthony Edwards Silver PSA 10", playerName: "Anthony Edwards", sentimentScore: 90, priceDirection: "up", priceTrend: 25.8, divergenceGap: 5, divergenceType: "neutral", confidence: 95, detectedDate: "2026-04-16", status: "resolved", category: "Modern Basketball" },
  { id: "ds13", cardName: "2020 Topps Chrome Luis Robert RC PSA 10", playerName: "Luis Robert", sentimentScore: 42, priceDirection: "up", priceTrend: 32.1, divergenceGap: 58, divergenceType: "bullish_divergence", confidence: 74, detectedDate: "2026-04-05", status: "active", category: "Modern Baseball" },
  { id: "ds14", cardName: "1952 Topps Mickey Mantle #311 PSA 5", playerName: "Mickey Mantle", sentimentScore: 95, priceDirection: "up", priceTrend: 5.2, divergenceGap: 18, divergenceType: "neutral", confidence: 82, detectedDate: "2026-04-12", status: "resolved", category: "Vintage Baseball" }
];

const mockSentimentVsPrice: SentimentVsPrice[] = [
  { id: "svp1", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2025-11", sentimentScore: 75, priceChange: 8.2, volume: 245, correlation: 0.72 },
  { id: "svp2", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2025-12", sentimentScore: 80, priceChange: 5.1, volume: 198, correlation: 0.65 },
  { id: "svp3", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2026-01", sentimentScore: 82, priceChange: 2.3, volume: 210, correlation: 0.48 },
  { id: "svp4", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2026-02", sentimentScore: 84, priceChange: -1.5, volume: 178, correlation: 0.22 },
  { id: "svp5", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2026-03", sentimentScore: 86, priceChange: -0.8, volume: 165, correlation: -0.15 },
  { id: "svp6", cardName: "2018 Prizm Luka Doncic Silver PSA 10", month: "2026-04", sentimentScore: 85, priceChange: 1.2, volume: 155, correlation: -0.35 },
  { id: "svp7", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2025-11", sentimentScore: 42, priceChange: -5.2, volume: 85, correlation: 0.81 },
  { id: "svp8", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2025-12", sentimentScore: 38, priceChange: -2.8, volume: 92, correlation: 0.68 },
  { id: "svp9", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2026-01", sentimentScore: 35, priceChange: 3.5, volume: 110, correlation: 0.32 },
  { id: "svp10", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2026-02", sentimentScore: 33, priceChange: 5.8, volume: 125, correlation: -0.12 },
  { id: "svp11", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2026-03", sentimentScore: 34, priceChange: 6.2, volume: 138, correlation: -0.45 },
  { id: "svp12", cardName: "2011 Topps Update Mike Trout RC PSA 10", month: "2026-04", sentimentScore: 35, priceChange: 8.4, volume: 142, correlation: -0.58 }
];

const mockDivergenceHistory: DivergenceHistory[] = [
  { id: "dh1", cardName: "2020 Prizm Trae Young Silver PSA 10", divergenceType: "bullish_divergence", startDate: "2025-06-15", endDate: "2025-09-10", gapAtPeak: 65, resolution: "price_followed_sentiment", profitOpportunity: 42, durationDays: 87 },
  { id: "dh2", cardName: "2021 Prizm Trevor Lawrence Silver PSA 10", divergenceType: "bearish_divergence", startDate: "2025-03-01", endDate: "2025-07-20", gapAtPeak: 82, resolution: "sentiment_followed_price", profitOpportunity: -55, durationDays: 141 },
  { id: "dh3", cardName: "2019 Topps Chrome Yordan Alvarez RC PSA 10", divergenceType: "bullish_divergence", startDate: "2025-08-10", endDate: "2025-11-30", gapAtPeak: 48, resolution: "price_followed_sentiment", profitOpportunity: 28, durationDays: 112 },
  { id: "dh4", cardName: "2022 Prizm Cade Cunningham Silver PSA 10", divergenceType: "bearish_divergence", startDate: "2025-04-05", endDate: "2025-06-28", gapAtPeak: 71, resolution: "sentiment_followed_price", profitOpportunity: -38, durationDays: 84 },
  { id: "dh5", cardName: "2018 Topps Chrome Ohtani RC PSA 10", divergenceType: "bullish_divergence", startDate: "2025-01-20", endDate: "2025-05-15", gapAtPeak: 55, resolution: "both_converged", profitOpportunity: 35, durationDays: 115 }
];

const mockAlerts: DivergenceAlert[] = [
  { id: "da1", cardName: "2023 Bowman Chrome Wembanyama 1st Auto", alertType: "extreme_divergence", severity: "critical", message: "Sentiment at 92 while price dropping 5.8% - extreme bearish divergence detected", timestamp: "2026-04-14T10:30:00Z", actionSuggestion: "Consider reducing position or setting stop-loss" },
  { id: "da2", cardName: "2024 Prizm Caleb Williams Silver PSA 10", alertType: "widening_gap", severity: "high", message: "Divergence gap widened from 55 to 72 in past 48 hours", timestamp: "2026-04-15T08:15:00Z", actionSuggestion: "Monitor closely - hype may not sustain current sentiment" },
  { id: "da3", cardName: "2020 Topps Chrome Luis Robert RC PSA 10", alertType: "new_divergence", severity: "medium", message: "New bullish divergence: price rising 32.1% while sentiment remains low at 42", timestamp: "2026-04-05T14:00:00Z", actionSuggestion: "Potential buying opportunity before sentiment catches up" },
  { id: "da4", cardName: "2018 Topps Chrome Ohtani RC PSA 10", alertType: "convergence_signal", severity: "low", message: "Sentiment and price converging - divergence gap narrowed to 8", timestamp: "2026-04-15T16:45:00Z", actionSuggestion: "Divergence resolved - normal market conditions resuming" },
  { id: "da5", cardName: "2020 Prizm Justin Herbert Silver PSA 10", alertType: "new_divergence", severity: "high", message: "Bullish divergence: price up 12.5% but sentiment only at 28 - smart money may be accumulating", timestamp: "2026-04-10T11:20:00Z", actionSuggestion: "Research fundamentals - could be early entry opportunity" }
];

export function getDivergenceSignals(): DivergenceSignal[] {
  return mockDivergenceSignals;
}

export function getSentimentVsPrice(): SentimentVsPrice[] {
  return mockSentimentVsPrice;
}

export function getDivergenceHistory(): DivergenceHistory[] {
  return mockDivergenceHistory;
}

export function getDivergenceAlerts(): DivergenceAlert[] {
  return mockAlerts;
}

export function getDivergenceStats() {
  const activeSignals = mockDivergenceSignals.filter(s => s.status === "active").length;
  const bullishDiv = mockDivergenceSignals.filter(s => s.divergenceType === "bullish_divergence").length;
  const bearishDiv = mockDivergenceSignals.filter(s => s.divergenceType === "bearish_divergence").length;
  const avgGap = Math.round(mockDivergenceSignals.reduce((s, d) => s + d.divergenceGap, 0) / mockDivergenceSignals.length);
  const criticalAlerts = mockAlerts.filter(a => a.severity === "critical" || a.severity === "high").length;
  const avgConfidence = Math.round(mockDivergenceSignals.reduce((s, d) => s + d.confidence, 0) / mockDivergenceSignals.length);
  return { activeSignals, bullishDiv, bearishDiv, avgGap, criticalAlerts, avgConfidence };
}
