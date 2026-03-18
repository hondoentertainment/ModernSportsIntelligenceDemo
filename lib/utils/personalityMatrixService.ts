export interface CollectorProfile {
  id: string;
  type: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  idealStrategy: string;
  compatibleTypes: string[];
  riskProfile: string;
}

const mockProfiles: CollectorProfile[] = [
  { id: "cp-001", type: "The Archivist", description: "Methodical set builder who values completeness over individual value", strengths: ["Patience", "Organization", "Deep market knowledge"], weaknesses: ["Over-attachment to sets", "Misses quick-flip opportunities"], idealStrategy: "Long-term vintage set completion with systematic purchasing", compatibleTypes: ["The Historian", "The Grader"], riskProfile: "Conservative" },
  { id: "cp-002", type: "The Flipper", description: "High-frequency trader focused on short-term arbitrage and momentum", strengths: ["Speed", "Market timing", "Platform arbitrage"], weaknesses: ["Transaction costs erode margins", "Burnout risk", "Tax complexity"], idealStrategy: "Quick-turn arbitrage with strict stop-loss discipline", compatibleTypes: ["The Analyst", "The Speculator"], riskProfile: "Aggressive" },
  { id: "cp-003", type: "The Historian", description: "Passionate about the stories behind cards and their cultural significance", strengths: ["Provenance expertise", "Emotional connection", "Community building"], weaknesses: ["Overpays for narrative value", "Slow to sell declining assets"], idealStrategy: "Curated vintage collection focused on historically significant pieces", compatibleTypes: ["The Archivist", "The Whale"], riskProfile: "Moderate" },
  { id: "cp-004", type: "The Speculator", description: "Bets big on rookies, prospects, and emerging trends before consensus", strengths: ["Early trend identification", "High upside potential", "Bold conviction"], weaknesses: ["High bust rate", "Overleveraged positions", "FOMO-driven buying"], idealStrategy: "Concentrated bets on pre-breakout players with strict position sizing", compatibleTypes: ["The Flipper", "The Analyst"], riskProfile: "Very Aggressive" },
  { id: "cp-005", type: "The Whale", description: "High-net-worth collector focused on trophy assets and market-moving purchases", strengths: ["Capital advantage", "Access to private sales", "Market influence"], weaknesses: ["Liquidity risk on exits", "Target for manipulation"], idealStrategy: "Trophy asset accumulation with private sale network", compatibleTypes: ["The Historian", "The Grader"], riskProfile: "Moderate-Aggressive" },
  { id: "cp-006", type: "The Analyst", description: "Data-driven collector who uses metrics, pop reports, and comps for every decision", strengths: ["Objective decision-making", "Risk quantification", "Comp mastery"], weaknesses: ["Analysis paralysis", "Misses sentiment-driven moves", "Undervalues intangibles"], idealStrategy: "Quantitative model-driven buying at statistical discount thresholds", compatibleTypes: ["The Flipper", "The Speculator"], riskProfile: "Moderate" },
];

export function getProfiles(): CollectorProfile[] {
  return mockProfiles;
}

export function getQuizQuestions(): { question: string; options: string[] }[] {
  return [
    { question: "A rookie just got drafted #1 overall. You:", options: ["Buy immediately", "Wait for first game stats", "Check pop reports first", "Only care if pre-1990"] },
    { question: "Your most valuable card drops 30%. You:", options: ["Buy more to average down", "Sell to cut losses", "Hold and reassess in 6 months", "Doesn't matter, it completes my set"] },
    { question: "You prefer to buy cards:", options: ["Raw and grade yourself", "Already graded PSA/BGS 10", "In bulk lots for arbitrage", "With documented provenance"] },
  ];
}

const personalityMatrixService = { getProfiles, getQuizQuestions };
export default personalityMatrixService;
