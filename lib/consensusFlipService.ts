// Consensus Flip Predictor Service
// Predicts when community consensus on a card/player will reverse

export interface ConsensusState {
  id: string;
  cardName: string;
  playerName: string;
  currentConsensus: "bullish" | "bearish" | "neutral";
  consensusStrength: number;
  currentPrice: number;
  consensusPrice: number;
  participantCount: number;
  lastUpdated: string;
  category: string;
}

export interface FlipSignal {
  id: string;
  cardId: string;
  signalType: "volume_divergence" | "sentiment_shift" | "smart_money_exit" | "contrarian_accumulation" | "media_fatigue";
  strength: number;
  detectedDate: string;
  description: string;
  reliability: number;
}

export interface FlipProbability {
  id: string;
  cardId: string;
  cardName: string;
  currentConsensus: string;
  flipProbability: number;
  expectedFlipDate: string;
  confidenceInterval: number;
  signals: string[];
  potentialImpact: number;
}

export interface ConsensusHistory {
  id: string;
  cardName: string;
  flipDate: string;
  fromConsensus: string;
  toConsensus: string;
  priceAtFlip: number;
  priceAfter30Days: number;
  accuracyOfPrediction: number;
  triggerEvent: string;
}

const mockConsensusStates: ConsensusState[] = [
  { id: "cs1", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", currentConsensus: "bullish", consensusStrength: 78, currentPrice: 4200, consensusPrice: 5500, participantCount: 3420, lastUpdated: "2026-04-15", category: "Modern Basketball" },
  { id: "cs2", cardName: "2020 Prizm Justin Herbert Base PSA 10", playerName: "Justin Herbert", currentConsensus: "bearish", consensusStrength: 65, currentPrice: 85, consensusPrice: 55, participantCount: 1890, lastUpdated: "2026-04-14", category: "Modern Football" },
  { id: "cs3", cardName: "1986 Fleer Michael Jordan #57 PSA 9", playerName: "Michael Jordan", currentConsensus: "bullish", consensusStrength: 92, currentPrice: 32000, consensusPrice: 38000, participantCount: 5670, lastUpdated: "2026-04-16", category: "Vintage Basketball" },
  { id: "cs4", cardName: "2023 Bowman Chrome Victor Wembanyama 1st", playerName: "Victor Wembanyama", currentConsensus: "bullish", consensusStrength: 71, currentPrice: 680, consensusPrice: 950, participantCount: 4210, lastUpdated: "2026-04-15", category: "Modern Basketball" },
  { id: "cs5", cardName: "2019 Topps Chrome Yordan Alvarez RC", playerName: "Yordan Alvarez", currentConsensus: "neutral", consensusStrength: 45, currentPrice: 120, consensusPrice: 125, participantCount: 980, lastUpdated: "2026-04-13", category: "Modern Baseball" },
  { id: "cs6", cardName: "2020 Prizm Joe Burrow Silver PSA 10", playerName: "Joe Burrow", currentConsensus: "bullish", consensusStrength: 82, currentPrice: 450, consensusPrice: 600, participantCount: 2340, lastUpdated: "2026-04-16", category: "Modern Football" },
  { id: "cs7", cardName: "2003 Topps Chrome LeBron James RC PSA 10", playerName: "LeBron James", currentConsensus: "bearish", consensusStrength: 58, currentPrice: 45000, consensusPrice: 38000, participantCount: 4890, lastUpdated: "2026-04-14", category: "Modern Basketball" },
  { id: "cs8", cardName: "2011 Topps Update Mike Trout RC PSA 10", playerName: "Mike Trout", currentConsensus: "bearish", consensusStrength: 73, currentPrice: 3200, consensusPrice: 2400, participantCount: 3120, lastUpdated: "2026-04-15", category: "Modern Baseball" },
  { id: "cs9", cardName: "2018 Topps Chrome Shohei Ohtani RC PSA 10", playerName: "Shohei Ohtani", currentConsensus: "bullish", consensusStrength: 86, currentPrice: 580, consensusPrice: 750, participantCount: 2780, lastUpdated: "2026-04-16", category: "Modern Baseball" },
  { id: "cs10", cardName: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", currentConsensus: "bearish", consensusStrength: 88, currentPrice: 280, consensusPrice: 180, participantCount: 3560, lastUpdated: "2026-04-14", category: "Modern Basketball" },
  { id: "cs11", cardName: "2022 Panini Flawless Paolo Banchero RPA", playerName: "Paolo Banchero", currentConsensus: "neutral", consensusStrength: 42, currentPrice: 1200, consensusPrice: 1150, participantCount: 890, lastUpdated: "2026-04-13", category: "Modern Basketball" },
  { id: "cs12", cardName: "1952 Topps Mickey Mantle #311 PSA 5", playerName: "Mickey Mantle", currentConsensus: "bullish", consensusStrength: 95, currentPrice: 185000, consensusPrice: 210000, participantCount: 1230, lastUpdated: "2026-04-16", category: "Vintage Baseball" }
];

const mockFlipSignals: FlipSignal[] = [
  { id: "fs1", cardId: "cs2", signalType: "contrarian_accumulation", strength: 72, detectedDate: "2026-04-10", description: "Smart money quietly accumulating Herbert cards despite bearish consensus", reliability: 68 },
  { id: "fs2", cardId: "cs7", signalType: "smart_money_exit", strength: 81, detectedDate: "2026-04-08", description: "Large holders reducing LeBron RC positions ahead of retirement timeline", reliability: 74 },
  { id: "fs3", cardId: "cs4", signalType: "media_fatigue", strength: 55, detectedDate: "2026-04-12", description: "Declining social media engagement on Wembanyama content", reliability: 61 },
  { id: "fs4", cardId: "cs10", signalType: "volume_divergence", strength: 67, detectedDate: "2026-04-09", description: "Trading volume increasing while price continues to drop - potential reversal", reliability: 58 },
  { id: "fs5", cardId: "cs8", signalType: "sentiment_shift", strength: 78, detectedDate: "2026-04-11", description: "Forum sentiment on Trout slowly improving despite bearish consensus", reliability: 72 },
  { id: "fs6", cardId: "cs1", signalType: "media_fatigue", strength: 45, detectedDate: "2026-04-14", description: "Luka hype cycle showing signs of exhaustion in collector forums", reliability: 55 }
];

const mockFlipProbabilities: FlipProbability[] = [
  { id: "fp1", cardId: "cs2", cardName: "2020 Prizm Justin Herbert Base PSA 10", currentConsensus: "bearish", flipProbability: 68, expectedFlipDate: "2026-07-15", confidenceInterval: 22, signals: ["contrarian_accumulation", "volume_divergence"], potentialImpact: 45 },
  { id: "fp2", cardId: "cs10", cardName: "2019 Prizm Zion Williamson Silver PSA 10", currentConsensus: "bearish", flipProbability: 42, expectedFlipDate: "2026-09-01", confidenceInterval: 35, signals: ["volume_divergence"], potentialImpact: 65 },
  { id: "fp3", cardId: "cs7", cardName: "2003 Topps Chrome LeBron James RC PSA 10", currentConsensus: "bearish", flipProbability: 35, expectedFlipDate: "2026-12-01", confidenceInterval: 40, signals: ["smart_money_exit"], potentialImpact: 28 },
  { id: "fp4", cardId: "cs1", cardName: "2018 Prizm Luka Doncic Silver PSA 10", currentConsensus: "bullish", flipProbability: 25, expectedFlipDate: "2027-01-15", confidenceInterval: 30, signals: ["media_fatigue"], potentialImpact: 32 },
  { id: "fp5", cardId: "cs8", cardName: "2011 Topps Update Mike Trout RC PSA 10", currentConsensus: "bearish", flipProbability: 58, expectedFlipDate: "2026-08-01", confidenceInterval: 25, signals: ["sentiment_shift", "contrarian_accumulation"], potentialImpact: 38 }
];

const mockConsensusHistory: ConsensusHistory[] = [
  { id: "ch1", cardName: "2018 Prizm Trae Young Silver PSA 10", flipDate: "2025-09-15", fromConsensus: "bearish", toConsensus: "bullish", priceAtFlip: 180, priceAfter30Days: 295, accuracyOfPrediction: 82, triggerEvent: "All-Star season performance" },
  { id: "ch2", cardName: "2017 Prizm Patrick Mahomes Silver PSA 10", flipDate: "2025-06-20", fromConsensus: "bullish", toConsensus: "bearish", priceAtFlip: 1800, priceAfter30Days: 1420, accuracyOfPrediction: 71, triggerEvent: "Early season injury concerns" },
  { id: "ch3", cardName: "2019 Bowman Chrome Adley Rutschman 1st", flipDate: "2025-11-01", fromConsensus: "bearish", toConsensus: "bullish", priceAtFlip: 45, priceAfter30Days: 78, accuracyOfPrediction: 88, triggerEvent: "MVP-caliber season" },
  { id: "ch4", cardName: "2021 Prizm Cade Cunningham Silver PSA 10", flipDate: "2025-08-10", fromConsensus: "bullish", toConsensus: "bearish", priceAtFlip: 320, priceAfter30Days: 195, accuracyOfPrediction: 76, triggerEvent: "Team rebuild and reduced playing time" },
  { id: "ch5", cardName: "2020 Topps Chrome Luis Robert RC PSA 10", flipDate: "2025-12-05", fromConsensus: "bearish", toConsensus: "bullish", priceAtFlip: 65, priceAfter30Days: 110, accuracyOfPrediction: 79, triggerEvent: "Trade to contending team" }
];

export function getConsensusStates(): ConsensusState[] {
  return mockConsensusStates;
}

export function getFlipSignals(): FlipSignal[] {
  return mockFlipSignals;
}

export function getFlipProbabilities(): FlipProbability[] {
  return mockFlipProbabilities;
}

export function getConsensusHistory(): ConsensusHistory[] {
  return mockConsensusHistory;
}

export function getConsensusStats() {
  const bullish = mockConsensusStates.filter(c => c.currentConsensus === "bullish").length;
  const bearish = mockConsensusStates.filter(c => c.currentConsensus === "bearish").length;
  const neutral = mockConsensusStates.filter(c => c.currentConsensus === "neutral").length;
  const avgStrength = Math.round(mockConsensusStates.reduce((s, c) => s + c.consensusStrength, 0) / mockConsensusStates.length);
  const activeSignals = mockFlipSignals.length;
  const avgFlipProb = Math.round(mockFlipProbabilities.reduce((s, f) => s + f.flipProbability, 0) / mockFlipProbabilities.length);
  return { bullish, bearish, neutral, avgStrength, activeSignals, avgFlipProb };
}
