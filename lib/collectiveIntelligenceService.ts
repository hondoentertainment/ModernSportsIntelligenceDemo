// Collective Intelligence Aggregator Service
// Wisdom of crowds aggregation for card price predictions

export interface CrowdPrediction {
  id: string;
  cardName: string;
  playerName: string;
  currentPrice: number;
  crowdPredictedPrice: number;
  crowdDirection: "up" | "down" | "flat";
  participantCount: number;
  predictionDate: string;
  targetDate: string;
  confidenceLevel: number;
  spread: number;
  category: string;
  status: "open" | "closed" | "expired";
}

export interface AggregationResult {
  id: string;
  cardName: string;
  method: "simple_average" | "weighted_average" | "median" | "trimmed_mean" | "expert_weighted";
  predictedPrice: number;
  actualPrice: number | null;
  accuracy: number | null;
  participantCount: number;
  predictionDate: string;
  outcomeDate: string | null;
  confidenceBand: { low: number; high: number };
}

export interface ParticipantWeight {
  id: string;
  username: string;
  accuracyScore: number;
  totalPredictions: number;
  winRate: number;
  avgError: number;
  weight: number;
  tier: "platinum" | "gold" | "silver" | "bronze" | "novice";
  streak: number;
  specialty: string;
}

export interface PredictionAccuracy {
  id: string;
  timeframe: string;
  totalPredictions: number;
  accurateWithin5Pct: number;
  accurateWithin10Pct: number;
  accurateWithin20Pct: number;
  avgError: number;
  bestCategory: string;
  worstCategory: string;
  crowdVsExpertWinRate: number;
}

const mockPredictions: CrowdPrediction[] = [
  { id: "cp1", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", currentPrice: 4200, crowdPredictedPrice: 5100, crowdDirection: "up", participantCount: 2840, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 72, spread: 1800, category: "Modern Basketball", status: "open" },
  { id: "cp2", cardName: "2023 Prizm Wembanyama Silver PSA 10", playerName: "Victor Wembanyama", currentPrice: 680, crowdPredictedPrice: 920, crowdDirection: "up", participantCount: 4120, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 65, spread: 450, category: "Modern Basketball", status: "open" },
  { id: "cp3", cardName: "1986 Fleer Jordan #57 PSA 9", playerName: "Michael Jordan", currentPrice: 32000, crowdPredictedPrice: 35500, crowdDirection: "up", participantCount: 1560, predictionDate: "2026-04-01", targetDate: "2026-10-01", confidenceLevel: 82, spread: 8000, category: "Vintage Basketball", status: "open" },
  { id: "cp4", cardName: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", currentPrice: 280, crowdPredictedPrice: 195, crowdDirection: "down", participantCount: 2210, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 78, spread: 120, category: "Modern Basketball", status: "open" },
  { id: "cp5", cardName: "2020 Prizm Joe Burrow Silver PSA 10", playerName: "Joe Burrow", currentPrice: 450, crowdPredictedPrice: 580, crowdDirection: "up", participantCount: 1890, predictionDate: "2026-04-01", targetDate: "2026-09-01", confidenceLevel: 74, spread: 200, category: "Modern Football", status: "open" },
  { id: "cp6", cardName: "2011 Topps Update Mike Trout RC PSA 10", playerName: "Mike Trout", currentPrice: 3200, crowdPredictedPrice: 2800, crowdDirection: "down", participantCount: 1420, predictionDate: "2026-04-01", targetDate: "2026-10-01", confidenceLevel: 58, spread: 1200, category: "Modern Baseball", status: "open" },
  { id: "cp7", cardName: "2018 Topps Chrome Ohtani RC PSA 10", playerName: "Shohei Ohtani", currentPrice: 580, crowdPredictedPrice: 750, crowdDirection: "up", participantCount: 2650, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 81, spread: 180, category: "Modern Baseball", status: "open" },
  { id: "cp8", cardName: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", currentPrice: 85, crowdPredictedPrice: 120, crowdDirection: "up", participantCount: 3450, predictionDate: "2026-04-01", targetDate: "2026-09-01", confidenceLevel: 55, spread: 85, category: "Modern Football", status: "open" },
  { id: "cp9", cardName: "2003 Topps Chrome LeBron RC PSA 10", playerName: "LeBron James", currentPrice: 45000, crowdPredictedPrice: 42000, crowdDirection: "down", participantCount: 1280, predictionDate: "2026-04-01", targetDate: "2026-10-01", confidenceLevel: 62, spread: 12000, category: "Modern Basketball", status: "open" },
  { id: "cp10", cardName: "2021 Prizm Anthony Edwards Silver PSA 10", playerName: "Anthony Edwards", currentPrice: 520, crowdPredictedPrice: 780, crowdDirection: "up", participantCount: 2980, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 76, spread: 250, category: "Modern Basketball", status: "open" },
  { id: "cp11", cardName: "2020 Prizm Trae Young Silver PSA 10", playerName: "Trae Young", currentPrice: 295, crowdPredictedPrice: 380, crowdDirection: "up", participantCount: 1650, predictionDate: "2026-01-01", targetDate: "2026-04-01", confidenceLevel: 68, spread: 140, category: "Modern Basketball", status: "closed" },
  { id: "cp12", cardName: "2022 Topps Chrome Julio Rodriguez RC PSA 10", playerName: "Julio Rodriguez", currentPrice: 185, crowdPredictedPrice: 240, crowdDirection: "up", participantCount: 1120, predictionDate: "2026-01-01", targetDate: "2026-04-01", confidenceLevel: 62, spread: 95, category: "Modern Baseball", status: "closed" },
  { id: "cp13", cardName: "1952 Topps Mantle #311 PSA 5", playerName: "Mickey Mantle", currentPrice: 185000, crowdPredictedPrice: 200000, crowdDirection: "up", participantCount: 680, predictionDate: "2026-04-01", targetDate: "2027-04-01", confidenceLevel: 85, spread: 35000, category: "Vintage Baseball", status: "open" },
  { id: "cp14", cardName: "2022 Topps Chrome UCL Bellingham RC", playerName: "Jude Bellingham", currentPrice: 680, crowdPredictedPrice: 850, crowdDirection: "up", participantCount: 2200, predictionDate: "2026-04-01", targetDate: "2026-07-01", confidenceLevel: 71, spread: 280, category: "Soccer", status: "open" },
  { id: "cp15", cardName: "2024 National Treasures Jayden Daniels RPA", playerName: "Jayden Daniels", currentPrice: 2200, crowdPredictedPrice: 2800, crowdDirection: "up", participantCount: 1850, predictionDate: "2026-04-01", targetDate: "2026-09-01", confidenceLevel: 69, spread: 800, category: "Modern Football", status: "open" }
];

const mockAggregations: AggregationResult[] = [
  { id: "ar1", cardName: "2020 Prizm Trae Young Silver PSA 10", method: "weighted_average", predictedPrice: 365, actualPrice: 295, accuracy: 76.2, participantCount: 1650, predictionDate: "2026-01-01", outcomeDate: "2026-04-01", confidenceBand: { low: 280, high: 420 } },
  { id: "ar2", cardName: "2020 Prizm Trae Young Silver PSA 10", method: "median", predictedPrice: 340, actualPrice: 295, accuracy: 84.7, participantCount: 1650, predictionDate: "2026-01-01", outcomeDate: "2026-04-01", confidenceBand: { low: 260, high: 400 } },
  { id: "ar3", cardName: "2020 Prizm Trae Young Silver PSA 10", method: "expert_weighted", predictedPrice: 320, actualPrice: 295, accuracy: 91.5, participantCount: 1650, predictionDate: "2026-01-01", outcomeDate: "2026-04-01", confidenceBand: { low: 270, high: 380 } },
  { id: "ar4", cardName: "2022 Topps Chrome Julio Rodriguez RC PSA 10", method: "weighted_average", predictedPrice: 228, actualPrice: 185, accuracy: 76.8, participantCount: 1120, predictionDate: "2026-01-01", outcomeDate: "2026-04-01", confidenceBand: { low: 165, high: 295 } },
  { id: "ar5", cardName: "2022 Topps Chrome Julio Rodriguez RC PSA 10", method: "expert_weighted", predictedPrice: 205, actualPrice: 185, accuracy: 89.2, participantCount: 1120, predictionDate: "2026-01-01", outcomeDate: "2026-04-01", confidenceBand: { low: 155, high: 260 } },
  { id: "ar6", cardName: "2018 Prizm Luka Doncic Silver PSA 10", method: "weighted_average", predictedPrice: 5100, actualPrice: null, accuracy: null, participantCount: 2840, predictionDate: "2026-04-01", outcomeDate: null, confidenceBand: { low: 3800, high: 6200 } },
  { id: "ar7", cardName: "2018 Prizm Luka Doncic Silver PSA 10", method: "expert_weighted", predictedPrice: 4750, actualPrice: null, accuracy: null, participantCount: 2840, predictionDate: "2026-04-01", outcomeDate: null, confidenceBand: { low: 3600, high: 5800 } },
  { id: "ar8", cardName: "2023 Prizm Wembanyama Silver PSA 10", method: "trimmed_mean", predictedPrice: 880, actualPrice: null, accuracy: null, participantCount: 4120, predictionDate: "2026-04-01", outcomeDate: null, confidenceBand: { low: 550, high: 1200 } }
];

const mockParticipants: ParticipantWeight[] = [
  { id: "pw1", username: "VintageValueKing", accuracyScore: 88, totalPredictions: 245, winRate: 72, avgError: 8.5, weight: 2.8, tier: "platinum", streak: 12, specialty: "Vintage Baseball" },
  { id: "pw2", username: "HoopsProphet", accuracyScore: 82, totalPredictions: 312, winRate: 68, avgError: 11.2, weight: 2.4, tier: "platinum", streak: 8, specialty: "Modern Basketball" },
  { id: "pw3", username: "GridironGuru", accuracyScore: 78, totalPredictions: 189, winRate: 65, avgError: 13.5, weight: 2.1, tier: "gold", streak: 5, specialty: "Modern Football" },
  { id: "pw4", username: "DiamondAnalyst", accuracyScore: 85, totalPredictions: 156, winRate: 71, avgError: 9.8, weight: 2.6, tier: "platinum", streak: 15, specialty: "Modern Baseball" },
  { id: "pw5", username: "SlabSavant", accuracyScore: 74, totalPredictions: 420, winRate: 62, avgError: 15.2, weight: 1.8, tier: "gold", streak: 3, specialty: "All Sports Graded" },
  { id: "pw6", username: "ProspectOracle", accuracyScore: 65, totalPredictions: 380, winRate: 52, avgError: 22.5, weight: 1.2, tier: "silver", streak: 0, specialty: "Prospects/Rookies" },
  { id: "pw7", username: "PatchMaster", accuracyScore: 71, totalPredictions: 98, winRate: 60, avgError: 16.8, weight: 1.5, tier: "gold", streak: 2, specialty: "Game-Used/Patches" },
  { id: "pw8", username: "SoccerCardSage", accuracyScore: 80, totalPredictions: 145, winRate: 70, avgError: 10.5, weight: 2.3, tier: "gold", streak: 9, specialty: "Soccer/Football" },
  { id: "pw9", username: "RetailReddit", accuracyScore: 55, totalPredictions: 520, winRate: 48, avgError: 28.5, weight: 0.8, tier: "bronze", streak: 0, specialty: "Modern All Sports" },
  { id: "pw10", username: "WaxWizard", accuracyScore: 62, totalPredictions: 285, winRate: 55, avgError: 19.2, weight: 1.1, tier: "silver", streak: 1, specialty: "Sealed Product" },
  { id: "pw11", username: "TheCardNerd", accuracyScore: 76, totalPredictions: 210, winRate: 66, avgError: 12.8, weight: 2.0, tier: "gold", streak: 6, specialty: "Modern Basketball" },
  { id: "pw12", username: "AuctionHawk", accuracyScore: 83, totalPredictions: 175, winRate: 69, avgError: 10.2, weight: 2.5, tier: "platinum", streak: 11, specialty: "High-End Auctions" }
];

const mockAccuracy: PredictionAccuracy[] = [
  { id: "pa1", timeframe: "Q4 2025", totalPredictions: 1250, accurateWithin5Pct: 22, accurateWithin10Pct: 41, accurateWithin20Pct: 68, avgError: 15.2, bestCategory: "Vintage Baseball", worstCategory: "Prospects/Rookies", crowdVsExpertWinRate: 58 },
  { id: "pa2", timeframe: "Q3 2025", totalPredictions: 1180, accurateWithin5Pct: 18, accurateWithin10Pct: 38, accurateWithin20Pct: 62, avgError: 18.5, bestCategory: "Modern Basketball", worstCategory: "Modern Football", crowdVsExpertWinRate: 55 },
  { id: "pa3", timeframe: "Q2 2025", totalPredictions: 980, accurateWithin5Pct: 25, accurateWithin10Pct: 45, accurateWithin20Pct: 72, avgError: 12.8, bestCategory: "Vintage Basketball", worstCategory: "Soccer", crowdVsExpertWinRate: 62 },
  { id: "pa4", timeframe: "Q1 2025", totalPredictions: 850, accurateWithin5Pct: 20, accurateWithin10Pct: 42, accurateWithin20Pct: 65, avgError: 16.1, bestCategory: "Modern Baseball", worstCategory: "Prospects/Rookies", crowdVsExpertWinRate: 52 },
  { id: "pa5", timeframe: "Q1 2026", totalPredictions: 1420, accurateWithin5Pct: 24, accurateWithin10Pct: 44, accurateWithin20Pct: 70, avgError: 14.5, bestCategory: "Modern Basketball", worstCategory: "Modern Football", crowdVsExpertWinRate: 61 }
];

export function getCrowdPredictions(): CrowdPrediction[] {
  return mockPredictions;
}

export function getAggregationResults(): AggregationResult[] {
  return mockAggregations;
}

export function getParticipantWeights(): ParticipantWeight[] {
  return mockParticipants;
}

export function getPredictionAccuracy(): PredictionAccuracy[] {
  return mockAccuracy;
}

export function getCollectiveIntelligenceStats() {
  const openPredictions = mockPredictions.filter(p => p.status === "open").length;
  const totalParticipants = mockPredictions.reduce((s, p) => s + p.participantCount, 0);
  const avgConfidence = Math.round(mockPredictions.reduce((s, p) => s + p.confidenceLevel, 0) / mockPredictions.length);
  const bullishPct = Math.round((mockPredictions.filter(p => p.crowdDirection === "up").length / mockPredictions.length) * 100);
  const avgAccuracy = parseFloat((mockAccuracy.reduce((s, a) => s + a.accurateWithin10Pct, 0) / mockAccuracy.length).toFixed(1));
  const topPredictor = mockParticipants.reduce((best, p) => p.accuracyScore > best.accuracyScore ? p : best);
  return { openPredictions, totalParticipants, avgConfidence, bullishPct, avgAccuracy, topPredictor: topPredictor.username };
}
