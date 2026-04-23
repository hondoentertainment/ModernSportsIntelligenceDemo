// @ts-nocheck
// Phase 97 — Grading Arbitrage & Cross-Grade Intelligence Service

import { store } from '../dal/syncStore';

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CSG';
export type RiskLevel = 'low' | 'medium' | 'high';
export type SubmissionStatus = 'submitted' | 'in_progress' | 'success' | 'fail' | 'returned';

export interface CrossGradeOpportunity {
  id: string;
  player: string;
  cardDescription: string;
  currentCompany: GradingCompany;
  currentGrade: number;
  targetCompany: GradingCompany;
  expectedGrade: number;
  currentValue: number;
  expectedValue: number;
  gradeUpProbability: number;
  crossoverFee: number;
  shippingCost: number;
  netROI: number;
  riskLevel: RiskLevel;
  reasoning: string;
}

export interface GradeTranslation {
  fromCompany: GradingCompany;
  fromGrade: number;
  toCompany: GradingCompany;
  expectedGrade: number;
  successRate: number;
  avgCrossoverTime: number;
  sampleSize: number;
}

export interface GradePremiumTable {
  grade: string;
  psa: number;
  bgs: number;
  sgc: number;
  csg: number;
}

export interface CrossGradeTracker {
  id: string;
  card: string;
  fromCompany: GradingCompany;
  fromGrade: number;
  toCompany: GradingCompany;
  submittedDate: string;
  status: SubmissionStatus;
  resultGrade?: number;
  fee: number;
  expectedReturn: number;
}

export interface GradingArbitrageStats {
  totalOpportunities: number;
  avgROI: number;
  bestOpportunity: string;
  totalPotentialProfit: number;
  activeSubmissions: number;
}

const STORAGE_KEY = 'gradingArbitrage_submissions';

function loadSubmissions(): CrossGradeTracker[] {
  if (!store.has(STORAGE_KEY)) return getDefaultSubmissions();
  return store.get<CrossGradeTracker[]>(STORAGE_KEY, getDefaultSubmissions());
}

function saveSubmissions(submissions: CrossGradeTracker[]): void {
  store.set(STORAGE_KEY, submissions);
}

function getDefaultSubmissions(): CrossGradeTracker[] {
  const items: CrossGradeTracker[] = [
    {
      id: 'sub-1',
      card: 'Wemby 2023 Prizm Silver BGS 9.5',
      fromCompany: 'BGS',
      fromGrade: 9.5,
      toCompany: 'PSA',
      submittedDate: '2026-02-18',
      status: 'in_progress',
      fee: 50,
      expectedReturn: 320,
    },
    {
      id: 'sub-2',
      card: 'Jaylen Brown 2016 Prizm Silver SGC 10',
      fromCompany: 'SGC',
      fromGrade: 10,
      toCompany: 'PSA',
      submittedDate: '2026-02-25',
      status: 'submitted',
      fee: 50,
      expectedReturn: 185,
    },
    {
      id: 'sub-3',
      card: 'Anthony Edwards 2020 Prizm Base BGS 9.5',
      fromCompany: 'BGS',
      fromGrade: 9.5,
      toCompany: 'PSA',
      submittedDate: '2026-01-10',
      status: 'success',
      resultGrade: 10,
      fee: 50,
      expectedReturn: 410,
    },
    {
      id: 'sub-4',
      card: 'Justin Herbert 2020 Mosaic BGS 9.5',
      fromCompany: 'BGS',
      fromGrade: 9.5,
      toCompany: 'PSA',
      submittedDate: '2026-01-22',
      status: 'fail',
      resultGrade: 9,
      fee: 50,
      expectedReturn: 0,
    },
  ];
  return items;
}

export function getCrossGradeOpportunities(): CrossGradeOpportunity[] {
  const items: CrossGradeOpportunity[] = [
    {
      id: 'cg-1',
      player: 'Victor Wembanyama',
      cardDescription: '2023 Panini Prizm Silver RC BGS 9.5',
      currentCompany: 'BGS',
      currentGrade: 9.5,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 1850,
      expectedValue: 3400,
      gradeUpProbability: 65,
      crossoverFee: 50,
      shippingCost: 25,
      netROI: 79.7,
      riskLevel: 'medium',
      reasoning: 'BGS 9.5 with strong subgrades (9.5/9.5/10/9.5) has high PSA 10 crossover potential. PSA 10 commands 1.8x premium over BGS 9.5 for Wemby Prizm Silver.',
    },
    {
      id: 'cg-2',
      player: 'Luka Doncic',
      cardDescription: '2018 Panini Prizm Base RC BGS 9.5',
      currentCompany: 'BGS',
      currentGrade: 9.5,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 4200,
      expectedValue: 7500,
      gradeUpProbability: 62,
      crossoverFee: 100,
      shippingCost: 30,
      netROI: 75.4,
      riskLevel: 'medium',
      reasoning: 'High-value crossover opportunity. BGS 9.5 with no 9 subgrades historically crosses at 62%. The PSA 10 premium on vintage Luka RCs is substantial.',
    },
    {
      id: 'cg-3',
      player: 'Anthony Edwards',
      cardDescription: '2020 Panini Prizm Silver RC SGC 10',
      currentCompany: 'SGC',
      currentGrade: 10,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 680,
      expectedValue: 1250,
      gradeUpProbability: 55,
      crossoverFee: 50,
      shippingCost: 20,
      netROI: 73.5,
      riskLevel: 'high',
      reasoning: 'SGC 10 to PSA 10 crossover is riskier but the premium gap for Ant Prizm Silver is enormous. If successful, ROI is exceptional.',
    },
    {
      id: 'cg-4',
      player: 'Ja Morant',
      cardDescription: '2019 Panini Mosaic Base RC BGS 10 Pristine',
      currentCompany: 'BGS',
      currentGrade: 10,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 950,
      expectedValue: 1400,
      gradeUpProbability: 90,
      crossoverFee: 50,
      shippingCost: 20,
      netROI: 40.0,
      riskLevel: 'low',
      reasoning: 'BGS 10 Pristine crosses to PSA 10 at ~90% success rate. Lower ROI percentage but very safe with consistent results.',
    },
    {
      id: 'cg-5',
      player: 'Jayson Tatum',
      cardDescription: '2017 Panini Prizm Silver RC BGS 9.5',
      currentCompany: 'BGS',
      currentGrade: 9.5,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 3800,
      expectedValue: 6200,
      gradeUpProbability: 60,
      crossoverFee: 100,
      shippingCost: 30,
      netROI: 59.7,
      riskLevel: 'medium',
      reasoning: 'Tatum Prizm Silver BGS 9.5 with 9.5+ subgrades has decent crossover odds. Championship pedigree makes the PSA 10 premium particularly strong.',
    },
    {
      id: 'cg-6',
      player: 'Chet Holmgren',
      cardDescription: '2022 Panini Prizm Base RC CSG 10',
      currentCompany: 'CSG',
      currentGrade: 10,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 120,
      expectedValue: 240,
      gradeUpProbability: 48,
      crossoverFee: 30,
      shippingCost: 15,
      netROI: 62.5,
      riskLevel: 'high',
      reasoning: 'CSG 10 to PSA crossover has lower success rate but cost basis is low. PSA commands 2x premium on newer releases like Chet base Prizm.',
    },
    {
      id: 'cg-7',
      player: 'Patrick Mahomes',
      cardDescription: '2017 Panini Prizm Silver RC BGS 9.5',
      currentCompany: 'BGS',
      currentGrade: 9.5,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 12000,
      expectedValue: 19500,
      gradeUpProbability: 58,
      crossoverFee: 150,
      shippingCost: 40,
      netROI: 60.8,
      riskLevel: 'medium',
      reasoning: 'Highest absolute profit opportunity. Mahomes Prizm Silver BGS 9.5 → PSA 10 yields massive dollar return despite moderate success rate.',
    },
    {
      id: 'cg-8',
      player: 'Shohei Ohtani',
      cardDescription: '2018 Topps Chrome RC SGC 10',
      currentCompany: 'SGC',
      currentGrade: 10,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 1100,
      expectedValue: 2050,
      gradeUpProbability: 55,
      crossoverFee: 50,
      shippingCost: 20,
      netROI: 80.0,
      riskLevel: 'high',
      reasoning: 'SGC 10 Ohtani Chrome RC has enormous PSA premium potential. Multi-sport icon status drives PSA demand. Higher risk but top ROI.',
    },
    {
      id: 'cg-9',
      player: 'Caleb Williams',
      cardDescription: '2024 Panini Prizm Silver RC BGS 9.5',
      currentCompany: 'BGS',
      currentGrade: 9.5,
      targetCompany: 'PSA',
      expectedGrade: 10,
      currentValue: 380,
      expectedValue: 690,
      gradeUpProbability: 65,
      crossoverFee: 35,
      shippingCost: 15,
      netROI: 68.4,
      riskLevel: 'medium',
      reasoning: 'Modern card with clean BGS 9.5 subgrades. Newer Prizm Silver has high crossover odds and the PSA 10 premium is strong for rookie QBs.',
    },
  ];
  return items.sort((a, b) => b.netROI - a.netROI);
}

export function getGradeTranslationTable(): GradeTranslation[] {
  const items: GradeTranslation[] = [
    // BGS → PSA
    { fromCompany: 'BGS', fromGrade: 10, toCompany: 'PSA', expectedGrade: 10, successRate: 90, avgCrossoverTime: 35, sampleSize: 1240 },
    { fromCompany: 'BGS', fromGrade: 9.5, toCompany: 'PSA', expectedGrade: 10, successRate: 65, avgCrossoverTime: 35, sampleSize: 8450 },
    { fromCompany: 'BGS', fromGrade: 9.5, toCompany: 'PSA', expectedGrade: 9, successRate: 30, avgCrossoverTime: 35, sampleSize: 8450 },
    { fromCompany: 'BGS', fromGrade: 9, toCompany: 'PSA', expectedGrade: 9, successRate: 72, avgCrossoverTime: 35, sampleSize: 5620 },
    { fromCompany: 'BGS', fromGrade: 8.5, toCompany: 'PSA', expectedGrade: 9, successRate: 35, avgCrossoverTime: 35, sampleSize: 2180 },
    { fromCompany: 'BGS', fromGrade: 8, toCompany: 'PSA', expectedGrade: 8, successRate: 78, avgCrossoverTime: 35, sampleSize: 3400 },

    // SGC → PSA
    { fromCompany: 'SGC', fromGrade: 10, toCompany: 'PSA', expectedGrade: 10, successRate: 55, avgCrossoverTime: 40, sampleSize: 3200 },
    { fromCompany: 'SGC', fromGrade: 10, toCompany: 'PSA', expectedGrade: 9, successRate: 35, avgCrossoverTime: 40, sampleSize: 3200 },
    { fromCompany: 'SGC', fromGrade: 9.5, toCompany: 'PSA', expectedGrade: 9, successRate: 68, avgCrossoverTime: 40, sampleSize: 1850 },
    { fromCompany: 'SGC', fromGrade: 9, toCompany: 'PSA', expectedGrade: 9, successRate: 60, avgCrossoverTime: 40, sampleSize: 2100 },

    // CSG → PSA
    { fromCompany: 'CSG', fromGrade: 10, toCompany: 'PSA', expectedGrade: 10, successRate: 48, avgCrossoverTime: 42, sampleSize: 980 },
    { fromCompany: 'CSG', fromGrade: 10, toCompany: 'PSA', expectedGrade: 9, successRate: 38, avgCrossoverTime: 42, sampleSize: 980 },
    { fromCompany: 'CSG', fromGrade: 9.5, toCompany: 'PSA', expectedGrade: 9, successRate: 62, avgCrossoverTime: 42, sampleSize: 640 },
    { fromCompany: 'CSG', fromGrade: 9, toCompany: 'PSA', expectedGrade: 9, successRate: 55, avgCrossoverTime: 42, sampleSize: 720 },

    // PSA → BGS (reverse crossovers, less common)
    { fromCompany: 'PSA', fromGrade: 10, toCompany: 'BGS', expectedGrade: 9.5, successRate: 82, avgCrossoverTime: 30, sampleSize: 560 },
    { fromCompany: 'PSA', fromGrade: 10, toCompany: 'BGS', expectedGrade: 10, successRate: 12, avgCrossoverTime: 30, sampleSize: 560 },
    { fromCompany: 'PSA', fromGrade: 9, toCompany: 'BGS', expectedGrade: 9, successRate: 70, avgCrossoverTime: 30, sampleSize: 890 },
  ];
  return items;
}

export function getGradePremiums(player: string, _cardDesc: string): GradePremiumTable[] {
  // Simulated premium data — multipliers relative to raw card value
  const premiumSets: Record<string, GradePremiumTable[]> = {
    default: [
      { grade: 'Gem Mint 10', psa: 1.00, bgs: 0.85, sgc: 0.55, csg: 0.40 },
      { grade: '9.5', psa: 0.65, bgs: 0.55, sgc: 0.38, csg: 0.28 },
      { grade: 'Mint 9', psa: 0.35, bgs: 0.30, sgc: 0.22, csg: 0.18 },
      { grade: 'NM-MT 8', psa: 0.18, bgs: 0.15, sgc: 0.12, csg: 0.10 },
      { grade: 'NM 7', psa: 0.10, bgs: 0.08, sgc: 0.07, csg: 0.06 },
    ],
  };

  // Generate card-specific premiums based on player name hash
  const hash = player.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const modifier = 0.9 + (hash % 30) / 100;

  return premiumSets.default.map(row => ({
    ...row,
    psa: Math.round(row.psa * modifier * 100) / 100,
    bgs: Math.round(row.bgs * modifier * 100) / 100,
    sgc: Math.round(row.sgc * modifier * 100) / 100,
    csg: Math.round(row.csg * modifier * 100) / 100,
  }));
}

export function getActiveSubmissions(): CrossGradeTracker[] {
  return loadSubmissions();
}

export function addSubmission(submission: CrossGradeTracker): void {
  const existing = loadSubmissions();
  existing.push(submission);
  saveSubmissions(existing);
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus, resultGrade?: number): void {
  const existing = loadSubmissions();
  const idx = existing.findIndex(s => s.id === id);
  if (idx >= 0) {
    existing[idx].status = status;
    if (resultGrade !== undefined) existing[idx].resultGrade = resultGrade;
    saveSubmissions(existing);
  }
}

export function getGradingArbitrageStats(): GradingArbitrageStats {
  const opportunities = getCrossGradeOpportunities();
  const submissions = loadSubmissions();
  const active = submissions.filter(s => s.status === 'submitted' || s.status === 'in_progress');

  const avgROI = opportunities.reduce((sum, o) => sum + o.netROI, 0) / opportunities.length;
  const best = opportunities[0];
  const totalProfit = opportunities.reduce((sum, o) => {
    const profit = (o.expectedValue - o.currentValue - o.crossoverFee - o.shippingCost) * (o.gradeUpProbability / 100);
    return sum + profit;
  }, 0);

  return {
    totalOpportunities: opportunities.length,
    avgROI: Math.round(avgROI * 10) / 10,
    bestOpportunity: `${best.player} — ${best.netROI}% ROI`,
    totalPotentialProfit: Math.round(totalProfit),
    activeSubmissions: active.length,
  };
}

// ---- Cross-reference: AI Predictive Grading (Phase 65) ----
// Bridge functions to integrate grade prediction confidence into arbitrage decisions

import type { CardInventory, Sport, League } from '../../types';

export interface ArbitrageWithPrediction {
  opportunity: CrossGradeOpportunity;
  aiPredictedGrade: string | null;
  aiConfidence: number | null;
  adjustedROI: number;
  aiRecommendation: string;
}

/**
 * Enriches cross-grade opportunities with AI grade predictions from Phase 65.
 * Uses the grade prediction engine to validate or adjust crossover probability
 * estimates for more accurate ROI calculations.
 */
export function getAIEnrichedOpportunities(): ArbitrageWithPrediction[] {
  const opportunities = getCrossGradeOpportunities();

  // Dynamically import to avoid circular dependency issues
  let getPredictedGrade: ((_card: CardInventory) => { grade: string; confidence: number }) | null = null;
  try {
    const gradePredictService = require('./gradePredictService');
    getPredictedGrade = gradePredictService.getPredictedGrade;
  } catch {
    // Grade predict service unavailable
  }

  return opportunities.map(opp => {
    let aiPredictedGrade: string | null = null;
    let aiConfidence: number | null = null;
    let adjustedROI = opp.netROI;
    let aiRecommendation = 'AI grading data unavailable for this card.';

    if (getPredictedGrade) {
      // Create a synthetic card for prediction
      const syntheticCard: CardInventory = {
        id: opp.id,
        player: opp.player,
        year: parseInt(opp.cardDescription.match(/\d{4}/)?.[0] || '2020'),
        manufacturer: opp.cardDescription.includes('Panini') ? 'Panini' : 'Topps',
        set: opp.cardDescription.split(' ').slice(1, 3).join(' '),
        cardNumber: '',
        sport: 'Basketball' as Sport,
        league: 'NBA' as League,
        condition: `${opp.currentCompany} ${opp.currentGrade}`,
        purchasePrice: opp.currentValue,
        purchaseDate: new Date().toISOString(),
        currentValue: opp.currentValue,
        status: 'active',
        isGraded: true,
        grade: String(opp.currentGrade),
        gradingCompany: opp.currentCompany,
        isAutographed: false,
      };

      try {
        const prediction = getPredictedGrade(syntheticCard);
        aiPredictedGrade = prediction.grade;
        aiConfidence = prediction.confidence;

        // Adjust ROI based on AI confidence
        const confidenceFactor = prediction.confidence;
        adjustedROI = Math.round(opp.netROI * confidenceFactor * 100) / 100;

        const predictedNum = parseFloat(prediction.grade);
        if (predictedNum >= opp.expectedGrade) {
          aiRecommendation = `AI predicts grade ${prediction.grade} (${(prediction.confidence * 100).toFixed(0)}% confidence). Supports crossover — proceed.`;
        } else {
          aiRecommendation = `AI predicts grade ${prediction.grade} (${(prediction.confidence * 100).toFixed(0)}% confidence). Below target — exercise caution.`;
        }
      } catch {
        aiRecommendation = 'AI prediction engine encountered an error for this card.';
      }
    }

    return {
      opportunity: opp,
      aiPredictedGrade,
      aiConfidence,
      adjustedROI,
      aiRecommendation,
    };
  });
}

// ── Convenience aliases ────────────────────────────────────────────────

export function getOpportunities(): CrossGradeOpportunity[] {
  return getCrossGradeOpportunities();
}

export function getBestROI(): CrossGradeOpportunity {
  return getCrossGradeOpportunities()[0]; // already sorted by netROI desc
}

// ── Default Export ─────────────────────────────────────────────────────

const gradingArbitrageService = {
  getOpportunities,
  getBestROI,
  getCrossGradeOpportunities,
  getGradeTranslationTable,
  getGradePremiums,
  getActiveSubmissions,
  addSubmission,
  updateSubmissionStatus,
  getGradingArbitrageStats,
  getAIEnrichedOpportunities,
};
export default gradingArbitrageService;
