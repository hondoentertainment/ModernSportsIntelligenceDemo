import { SubscriptionTier } from "../../components/TierGate";

export type RouteTierEntry = { tier: SubscriptionTier; featureName: string };

export const ROUTE_TIER_MAP: Record<string, RouteTierEntry> = {
  // ─── basic tier ($9.90/mo) ───────────────────────────────────────────

  // ─── pro tier ($29/mo) ───────────────────────────────────────────────
  "/slab-verification": { tier: "pro", featureName: "Slab Verification" },
  "/live-breaks": { tier: "pro", featureName: "Live Breaks" },

  // v5.0 batch 1 & 2 (card-genome-sequencer through chaos-theory-simulator)
  "/micro-market-scanner": { tier: "pro", featureName: "Micro Market Scanner" },
  "/momentum-tracker": { tier: "pro", featureName: "Momentum Tracker" },
  "/supply-shock-detector": { tier: "pro", featureName: "Supply Shock Detector" },
  "/price-memory-mapper": { tier: "pro", featureName: "Price Memory Mapper" },
  "/liquidity-heatmap": { tier: "pro", featureName: "Liquidity Heatmap" },
  "/collector-behavior-engine": { tier: "pro", featureName: "Collector Behavior Engine" },
  "/market-maker-simulator": { tier: "pro", featureName: "Market Maker Simulator" },
  "/fatigue-index": { tier: "pro", featureName: "Fatigue Index" },

  // v5.1 batch 3 (sentiment-volatility-index through market-regime-detector)
  "/whale-shadow-tracker": { tier: "pro", featureName: "Whale Shadow Tracker" },
  "/grading-arbitrage-engine": { tier: "pro", featureName: "Grading Arbitrage Engine" },
  "/temporal-price-warp": { tier: "pro", featureName: "Temporal Price Warp" },
  "/collection-decay-monitor": { tier: "pro", featureName: "Collection Decay Monitor" },

  // v5.0 round 3 (options-desk through portfolio-dna-rebalancer)
  "/card-futures": { tier: "pro", featureName: "Card Futures" },
  "/synthetic-index-creator": { tier: "pro", featureName: "Synthetic Index Creator" },
  "/risk-parity-optimizer": { tier: "pro", featureName: "Risk Parity Optimizer" },
  "/volatility-surface": { tier: "pro", featureName: "Volatility Surface" },
  "/multi-factor-model": { tier: "pro", featureName: "Multi-Factor Model" },

  // v6.0 (injury-shockwave through biometric-trading-guard)
  "/rookie-trajectory": { tier: "pro", featureName: "Rookie Trajectory" },
  "/career-arc-modeler": { tier: "pro", featureName: "Career Arc Modeler" },
  "/championship-odds-valuator": { tier: "pro", featureName: "Championship Odds Valuator" },
  "/media-sentiment-tracker": { tier: "pro", featureName: "Media Sentiment Tracker" },
  "/social-momentum-indicator": { tier: "pro", featureName: "Social Momentum Indicator" },
  "/viral-spike-detector": { tier: "pro", featureName: "Viral Spike Detector" },
  "/influencer-impact-scorer": { tier: "pro", featureName: "Influencer Impact Scorer" },
  "/narrative-price-engine": { tier: "pro", featureName: "Narrative Price Engine" },
  "/hype-cycle-tracker": { tier: "pro", featureName: "Hype Cycle Tracker" },
  "/fomo-index": { tier: "pro", featureName: "FOMO Index" },
  "/contrarian-signal-finder": { tier: "pro", featureName: "Contrarian Signal Finder" },

  // Advanced trading (live-game-impact-engine through draft-war-room)
  "/play-by-play-valuation": { tier: "pro", featureName: "Play-by-Play Valuation" },
  "/stat-milestone-tracker": { tier: "pro", featureName: "Stat Milestone Tracker" },
  "/injury-report-parser": { tier: "pro", featureName: "Injury Report Parser" },
  "/trade-rumor-analyzer": { tier: "pro", featureName: "Trade Rumor Analyzer" },

  // v6.1 (dopamine-cycle-tracker through centering-analyzer)
  "/fomo-guard": { tier: "pro", featureName: "FOMO Guard" },
  "/loss-aversion-coach": { tier: "pro", featureName: "Loss Aversion Coach" },
  "/sunk-cost-analyzer": { tier: "pro", featureName: "Sunk Cost Analyzer" },
  "/confirmation-bias-checker": { tier: "pro", featureName: "Confirmation Bias Checker" },
  "/endowment-effect-calculator": { tier: "pro", featureName: "Endowment Effect Calculator" },
  "/anchoring-detector": { tier: "pro", featureName: "Anchoring Detector" },
  "/herd-mentality-index": { tier: "pro", featureName: "Herd Mentality Index" },
  "/patience-profit-tracker": { tier: "pro", featureName: "Patience Profit Tracker" },

  // v7.0 (regulatory-compliance-radar through generational-demand-forecaster)
  "/tax-loss-harvesting": { tier: "pro", featureName: "Tax Loss Harvesting" },
  "/customs-duty-calculator": { tier: "pro", featureName: "Customs Duty Calculator" },
  "/anti-fraud-sentinel": { tier: "pro", featureName: "Anti-Fraud Sentinel" },
  "/counterfeit-detector": { tier: "pro", featureName: "Counterfeit Detector" },
  "/market-manipulation-scanner": { tier: "pro", featureName: "Market Manipulation Scanner" },
  "/wash-sale-tracker": { tier: "pro", featureName: "Wash Sale Tracker" },

  // v7.1 (slab-case-forensics through vintage-provenance)
  "/population-report-analyzer": { tier: "pro", featureName: "Population Report Analyzer" },
  "/grade-inflation-tracker": { tier: "pro", featureName: "Grade Inflation Tracker" },
  "/crossover-candidate-finder": { tier: "pro", featureName: "Crossover Candidate Finder" },
  "/mechanical-grade-predictor": { tier: "pro", featureName: "Mechanical Grade Predictor" },

  // v8.0 frontier (auction-equilibrium through opportunity-cost-phantom)
  "/price-elasticity-modeler": { tier: "pro", featureName: "Price Elasticity Modeler" },
  "/scarcity-premium-calculator": { tier: "pro", featureName: "Scarcity Premium Calculator" },
  "/network-effect-valuator": { tier: "pro", featureName: "Network Effect Valuator" },
  "/information-asymmetry-detector": { tier: "pro", featureName: "Information Asymmetry Detector" },

  // v5.1+ frontier (agent-outcome-memory through agent-personality)
  "/agent-strategy-evolution": { tier: "pro", featureName: "Agent Strategy Evolution" },
  "/agent-confidence-calibrator": { tier: "pro", featureName: "Agent Confidence Calibrator" },

  // v5.2 (bid-ask-spread-predictor through agent-confidence-history)
  "/market-depth-visualizer": { tier: "pro", featureName: "Market Depth Visualizer" },
  "/order-flow-analyzer": { tier: "pro", featureName: "Order Flow Analyzer" },
  "/smart-money-tracker": { tier: "pro", featureName: "Smart Money Tracker" },

  // Formerly coming-soon (what-if-simulator through wax-break-roi-tracker)
  "/prospect-tracker": { tier: "pro", featureName: "Prospect Tracker" },
  "/multi-sport-arbitrage": { tier: "pro", featureName: "Multi-Sport Arbitrage" },

  // Industry-first v11 (regret-minimization-engine through cross-hobby-arbitrage-bridge)
  "/nostalgia-premium-calculator": { tier: "pro", featureName: "Nostalgia Premium Calculator" },
  "/completion-obsession-optimizer": { tier: "pro", featureName: "Completion Obsession Optimizer" },
  "/tribal-affiliation-valuator": { tier: "pro", featureName: "Tribal Affiliation Valuator" },
  "/delayed-gratification-modeler": { tier: "pro", featureName: "Delayed Gratification Modeler" },

  // ─── alpha tier ($99/mo) ─────────────────────────────────────────────
  "/copy-trading": { tier: "alpha", featureName: "Copy Trading" },
  "/audit-trail": { tier: "alpha", featureName: "Audit Trail" },
  "/frontier-lab": { tier: "alpha", featureName: "Frontier Lab" },

  // Group/community features
};

export function getRouteTier(path: string): RouteTierEntry | null {
  return ROUTE_TIER_MAP[path] ?? null;
}
