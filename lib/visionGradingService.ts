/**
 * Phase 70: AI Vision Grading Lab
 * Camera-based pre-submission card grading with AI-powered defect detection.
 * NO competitor integrates vision-based grading analysis into a portfolio management tool.
 */

export interface CardSurface {
  name: 'front' | 'back';
  overallScore: number; // 0-10
  centering: CenteringAnalysis;
  corners: CornerAnalysis;
  edges: EdgeAnalysis;
  surface: SurfaceAnalysis;
}

export interface CenteringAnalysis {
  score: number; // 0-10
  leftRight: { left: number; right: number }; // percentage
  topBottom: { top: number; bottom: number };
  grade: 'Gem' | 'Near Mint' | 'Acceptable' | 'Off-Center' | 'Miscut';
  psaStandard: string; // e.g., "60/40 or better"
  bgsStandard: string;
}

export interface CornerAnalysis {
  score: number;
  topLeft: CornerDetail;
  topRight: CornerDetail;
  bottomLeft: CornerDetail;
  bottomRight: CornerDetail;
  overallGrade: string;
}

export interface CornerDetail {
  sharpness: number; // 0-10
  wear: 'none' | 'light' | 'moderate' | 'heavy';
  description: string;
}

export interface EdgeAnalysis {
  score: number;
  top: { condition: string; score: number };
  bottom: { condition: string; score: number };
  left: { condition: string; score: number };
  right: { condition: string; score: number };
  chipping: boolean;
  whitening: boolean;
}

export interface SurfaceAnalysis {
  score: number;
  scratches: DefectDetail[];
  printDefects: DefectDetail[];
  staining: boolean;
  creases: DefectDetail[];
  gloss: 'high' | 'medium' | 'low';
  fingerprints: boolean;
}

export interface DefectDetail {
  severity: 'minor' | 'moderate' | 'severe';
  location: string;
  description: string;
  impactOnGrade: number; // points deducted
}

export interface VisionGradingResult {
  id: string;
  cardId?: string;
  playerName: string;
  cardDescription: string;
  analyzedAt: string;
  front: CardSurface;
  back: CardSurface;
  predictedGrade: PredictedGrade;
  submissionAdvice: SubmissionAdvice;
  defectMap: DefectMapPoint[];
  confidenceScore: number; // 0-100
}

export interface PredictedGrade {
  psa: { grade: number; probability: number; subgrades?: Record<string, number> };
  bgs: { grade: number; probability: number; subgrades: { centering: number; corners: number; edges: number; surface: number } };
  sgc: { grade: number; probability: number };
  bestCase: { company: string; grade: number; probability: number };
  worstCase: { company: string; grade: number; probability: number };
}

export interface SubmissionAdvice {
  shouldSubmit: boolean;
  recommendedCompany: 'PSA' | 'BGS' | 'SGC';
  reason: string;
  expectedROI: number; // percentage
  estimatedRawValue: number;
  estimatedGradedValue: number;
  gradingCost: number;
  breakEvenGrade: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DefectMapPoint {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  type: 'corner_wear' | 'edge_chip' | 'scratch' | 'print_defect' | 'crease' | 'stain' | 'centering_issue';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  surface: 'front' | 'back';
}

export interface GradingSession {
  id: string;
  results: VisionGradingResult[];
  totalCards: number;
  averagePredictedGrade: number;
  totalSubmissionROI: number;
  recommendedSubmissions: number;
  createdAt: string;
}

// Simulated AI grading analysis
export function analyzeCard(playerName: string, cardDescription: string, cardId?: string): VisionGradingResult {
  const centeringLR = Math.random() * 15 + 45; // 45-60% left
  const centeringTB = Math.random() * 12 + 47; // 47-59% top

  const centeringScore = calculateCenteringScore(centeringLR, centeringTB);
  const cornerScores = [
    7 + Math.random() * 3,
    7 + Math.random() * 3,
    6.5 + Math.random() * 3.5,
    7 + Math.random() * 3,
  ];
  const edgeScore = 7 + Math.random() * 3;
  const surfaceScore = 7.5 + Math.random() * 2.5;

  const avgScore = (centeringScore + cornerScores.reduce((a, b) => a + b, 0) / 4 + edgeScore + surfaceScore) / 4;

  const defectMap: DefectMapPoint[] = [];
  if (cornerScores[0] < 8) defectMap.push({ x: 5, y: 5, type: 'corner_wear', severity: cornerScores[0] < 7 ? 'moderate' : 'minor', description: 'Light corner rounding detected', surface: 'front' });
  if (cornerScores[2] < 7.5) defectMap.push({ x: 5, y: 95, type: 'corner_wear', severity: 'minor', description: 'Slight corner softness', surface: 'front' });
  if (edgeScore < 8) defectMap.push({ x: 50, y: 0, type: 'edge_chip', severity: 'minor', description: 'Minor edge whitening on top border', surface: 'front' });
  if (surfaceScore < 8.5) defectMap.push({ x: 60, y: 40, type: 'scratch', severity: 'minor', description: 'Hairline surface scratch visible under angled light', surface: 'front' });

  const psaGrade = Math.round(avgScore);
  const bgsGrade = Math.round(avgScore * 2) / 2; // BGS does half-grades
  const sgcGrade = Math.round(avgScore);

  const estimatedRawValue = 50 + Math.random() * 200;
  const gradeMultiplier = psaGrade >= 10 ? 8 : psaGrade >= 9 ? 3.5 : psaGrade >= 8 ? 1.8 : 1.2;
  const estimatedGradedValue = estimatedRawValue * gradeMultiplier;
  const gradingCost = 30;
  const expectedROI = ((estimatedGradedValue - estimatedRawValue - gradingCost) / (estimatedRawValue + gradingCost)) * 100;

  return {
    id: `vg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    cardId,
    playerName,
    cardDescription,
    analyzedAt: new Date().toISOString(),
    front: {
      name: 'front',
      overallScore: avgScore,
      centering: {
        score: centeringScore,
        leftRight: { left: centeringLR, right: 100 - centeringLR },
        topBottom: { top: centeringTB, bottom: 100 - centeringTB },
        grade: centeringScore >= 9.5 ? 'Gem' : centeringScore >= 8.5 ? 'Near Mint' : centeringScore >= 7 ? 'Acceptable' : 'Off-Center',
        psaStandard: centeringScore >= 9 ? '55/45 or better ✓' : '60/40 or better — borderline',
        bgsStandard: centeringScore >= 9.5 ? '50/50 to 55/45 ✓' : '55/45 to 60/40 — acceptable',
      },
      corners: {
        score: cornerScores.reduce((a, b) => a + b, 0) / 4,
        topLeft: { sharpness: cornerScores[0], wear: cornerScores[0] >= 9 ? 'none' : cornerScores[0] >= 8 ? 'light' : 'moderate', description: cornerScores[0] >= 9 ? 'Sharp point, no wear' : 'Slight rounding under magnification' },
        topRight: { sharpness: cornerScores[1], wear: cornerScores[1] >= 9 ? 'none' : 'light', description: cornerScores[1] >= 9 ? 'Pristine corner' : 'Minimal wear' },
        bottomLeft: { sharpness: cornerScores[2], wear: cornerScores[2] >= 9 ? 'none' : cornerScores[2] >= 8 ? 'light' : 'moderate', description: cornerScores[2] >= 8 ? 'Good corner integrity' : 'Noticeable softness' },
        bottomRight: { sharpness: cornerScores[3], wear: cornerScores[3] >= 9 ? 'none' : 'light', description: 'Clean corner presentation' },
        overallGrade: cornerScores.reduce((a, b) => a + b, 0) / 4 >= 9 ? 'Gem Mint' : 'Near Mint',
      },
      edges: {
        score: edgeScore,
        top: { condition: edgeScore >= 9 ? 'Clean' : 'Minor whitening', score: edgeScore + Math.random() * 0.5 },
        bottom: { condition: 'Clean', score: edgeScore + Math.random() * 0.5 },
        left: { condition: 'Clean', score: edgeScore + Math.random() * 0.3 },
        right: { condition: edgeScore >= 8.5 ? 'Clean' : 'Slight roughness', score: edgeScore - Math.random() * 0.3 },
        chipping: edgeScore < 7,
        whitening: edgeScore < 8.5,
      },
      surface: {
        score: surfaceScore,
        scratches: surfaceScore < 9 ? [{ severity: 'minor' as const, location: 'center', description: 'Hairline scratch under angled light', impactOnGrade: 0.25 }] : [],
        printDefects: [],
        staining: false,
        creases: [],
        gloss: surfaceScore >= 9 ? 'high' : 'medium',
        fingerprints: false,
      },
    },
    back: {
      name: 'back',
      overallScore: avgScore + 0.2,
      centering: {
        score: centeringScore + 0.3,
        leftRight: { left: centeringLR + 1, right: 100 - centeringLR - 1 },
        topBottom: { top: centeringTB + 0.5, bottom: 100 - centeringTB - 0.5 },
        grade: 'Near Mint',
        psaStandard: '55/45 or better ✓',
        bgsStandard: '55/45 to 60/40 — acceptable',
      },
      corners: {
        score: (cornerScores.reduce((a, b) => a + b, 0) / 4) + 0.2,
        topLeft: { sharpness: 9, wear: 'none', description: 'Sharp' },
        topRight: { sharpness: 9.2, wear: 'none', description: 'Sharp' },
        bottomLeft: { sharpness: 8.5, wear: 'light', description: 'Minimal wear' },
        bottomRight: { sharpness: 9.1, wear: 'none', description: 'Sharp' },
        overallGrade: 'Near Mint',
      },
      edges: {
        score: edgeScore + 0.3,
        top: { condition: 'Clean', score: 9 },
        bottom: { condition: 'Clean', score: 9.1 },
        left: { condition: 'Clean', score: 8.8 },
        right: { condition: 'Clean', score: 9 },
        chipping: false,
        whitening: false,
      },
      surface: {
        score: surfaceScore + 0.3,
        scratches: [],
        printDefects: [],
        staining: false,
        creases: [],
        gloss: 'high',
        fingerprints: false,
      },
    },
    predictedGrade: {
      psa: { grade: psaGrade, probability: 55 + Math.random() * 30 },
      bgs: { grade: bgsGrade, probability: 45 + Math.random() * 35, subgrades: { centering: Math.round(centeringScore * 2) / 2, corners: Math.round(cornerScores.reduce((a, b) => a + b, 0) / 4 * 2) / 2, edges: Math.round(edgeScore * 2) / 2, surface: Math.round(surfaceScore * 2) / 2 } },
      sgc: { grade: sgcGrade, probability: 50 + Math.random() * 30 },
      bestCase: { company: 'PSA', grade: Math.min(10, psaGrade + 1), probability: 15 + Math.random() * 20 },
      worstCase: { company: 'BGS', grade: Math.max(1, bgsGrade - 1), probability: 10 + Math.random() * 15 },
    },
    submissionAdvice: {
      shouldSubmit: expectedROI > 20,
      recommendedCompany: psaGrade >= 9 ? 'PSA' : bgsGrade >= 9 ? 'BGS' : 'SGC',
      reason: expectedROI > 50
        ? 'Strong candidate — high probability of profitable grade with excellent ROI'
        : expectedROI > 20
          ? 'Worth submitting — moderate ROI expected with acceptable risk'
          : 'Consider holding raw — grading cost may exceed value added',
      expectedROI,
      estimatedRawValue,
      estimatedGradedValue,
      gradingCost,
      breakEvenGrade: psaGrade >= 9 ? 8 : 9,
      riskLevel: expectedROI > 50 ? 'low' : expectedROI > 10 ? 'medium' : 'high',
    },
    defectMap,
    confidenceScore: 72 + Math.random() * 20,
  };
}

function calculateCenteringScore(lr: number, tb: number): number {
  const lrDeviation = Math.abs(lr - 50);
  const tbDeviation = Math.abs(tb - 50);
  const maxDeviation = Math.max(lrDeviation, tbDeviation);
  if (maxDeviation <= 2) return 9.5 + Math.random() * 0.5;
  if (maxDeviation <= 5) return 8.5 + Math.random();
  if (maxDeviation <= 8) return 7 + Math.random() * 1.5;
  if (maxDeviation <= 12) return 5.5 + Math.random() * 1.5;
  return 3 + Math.random() * 2.5;
}

export function batchAnalyze(cards: { playerName: string; cardDescription: string; cardId?: string }[]): GradingSession {
  const results = cards.map(c => analyzeCard(c.playerName, c.cardDescription, c.cardId));
  const recommended = results.filter(r => r.submissionAdvice.shouldSubmit);
  return {
    id: `session-${Date.now()}`,
    results,
    totalCards: results.length,
    averagePredictedGrade: results.reduce((sum, r) => sum + r.predictedGrade.psa.grade, 0) / results.length,
    totalSubmissionROI: recommended.reduce((sum, r) => sum + r.submissionAdvice.expectedROI, 0),
    recommendedSubmissions: recommended.length,
    createdAt: new Date().toISOString(),
  };
}

// Persistence
const STORAGE_KEY = 'msi_vision_grading_history';

export function saveGradingResult(result: VisionGradingResult): void {
  const history = getGradingHistory();
  history.unshift(result);
  if (history.length > 50) history.pop();
  store.set(STORAGE_KEY, history);
}

import { store } from './dal/syncStore';
export function getGradingHistory(): VisionGradingResult[] {
  try {
    return store.get(STORAGE_KEY, []);
  } catch {
    return [];
  }
}
