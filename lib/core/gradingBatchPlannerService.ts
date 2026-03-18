// ---- Types ----

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC' | 'HGA';
export type ServiceTier = 'economy' | 'regular' | 'express' | 'super-express' | 'walkthrough';
export type GradeRange = '10' | '9.5' | '9' | '8.5' | '8' | '7' | 'below-7';

export interface BatchCard {
  id: string;
  cardName: string;
  player: string;
  year: string;
  set: string;
  rawValue: number;
  estimatedGrade: GradeRange;
  gradeProbability: number;
  gradedValue: number;
  projectedRoi: number;
  priority: 'must-grade' | 'strong-candidate' | 'borderline' | 'skip';
  notes: string;
}

export interface ServiceOption {
  company: GradingCompany;
  tier: ServiceTier;
  costPerCard: number;
  turnaroundDays: number;
  insuranceIncluded: number;
  bulkDiscount: number;
  minCards: number;
  maxCards: number;
}

export interface BatchSummary {
  totalCards: number;
  totalCost: number;
  projectedTotalRoi: number;
  projectedTotalValue: number;
  avgRoiPerCard: number;
  bestCompany: GradingCompany;
  bestTier: ServiceTier;
  breakEvenRate: number;
  estimatedTurnaround: string;
}

export interface GradeDistribution {
  grade: GradeRange;
  count: number;
  avgRoi: number;
  totalProjectedValue: number;
}

export interface SubmissionHistory {
  id: string;
  date: string;
  company: GradingCompany;
  tier: ServiceTier;
  cardCount: number;
  totalCost: number;
  returnRate: number;
  avgGrade: string;
  status: 'submitted' | 'in-transit' | 'grading' | 'shipped-back' | 'received';
}

// ---- Mock Data ----

const mockBatchCards: BatchCard[] = [
  { id: 'bg-1', cardName: '2024 Topps Chrome Elly De La Cruz Base', player: 'Elly De La Cruz', year: '2024', set: 'Topps Chrome', rawValue: 85, estimatedGrade: '10', gradeProbability: 0.35, gradedValue: 450, projectedRoi: 285, priority: 'must-grade', notes: 'Clean corners, good centering' },
  { id: 'bg-2', cardName: '2023 Prizm Jasson Dominguez Silver', player: 'Jasson Dominguez', year: '2023', set: 'Prizm', rawValue: 120, estimatedGrade: '9.5', gradeProbability: 0.55, gradedValue: 380, projectedRoi: 150, priority: 'strong-candidate', notes: 'Slight edge wear on top' },
  { id: 'bg-3', cardName: '2024 Bowman 1st Paul Skenes', player: 'Paul Skenes', year: '2024', set: 'Bowman', rawValue: 200, estimatedGrade: '10', gradeProbability: 0.40, gradedValue: 850, projectedRoi: 520, priority: 'must-grade', notes: 'Pack-fresh, excellent centering' },
  { id: 'bg-4', cardName: '2023 Select Concourse Victor Wembanyama', player: 'Victor Wembanyama', year: '2023', set: 'Select', rawValue: 75, estimatedGrade: '9', gradeProbability: 0.65, gradedValue: 220, projectedRoi: 75, priority: 'strong-candidate', notes: 'Minor surface print line' },
  { id: 'bg-5', cardName: '2024 Prizm Caitlin Clark Base', player: 'Caitlin Clark', year: '2024', set: 'Prizm', rawValue: 45, estimatedGrade: '10', gradeProbability: 0.30, gradedValue: 280, projectedRoi: 135, priority: 'borderline', notes: 'Off-center 55/45' },
  { id: 'bg-6', cardName: '2023 Topps Chrome Jackson Holliday', player: 'Jackson Holliday', year: '2023', set: 'Topps Chrome', rawValue: 95, estimatedGrade: '9.5', gradeProbability: 0.50, gradedValue: 310, projectedRoi: 115, priority: 'strong-candidate', notes: 'Good overall condition' },
  { id: 'bg-7', cardName: '2024 Donruss Caleb Williams Rated Rookie', player: 'Caleb Williams', year: '2024', set: 'Donruss', rawValue: 35, estimatedGrade: '9', gradeProbability: 0.60, gradedValue: 120, projectedRoi: 35, priority: 'borderline', notes: 'Soft corner bottom right' },
  { id: 'bg-8', cardName: '2024 Bowman Chrome Jackson Chourio Auto', player: 'Jackson Chourio', year: '2024', set: 'Bowman Chrome', rawValue: 350, estimatedGrade: '10', gradeProbability: 0.25, gradedValue: 1400, projectedRoi: 850, priority: 'must-grade', notes: 'Auto quality is clean' },
  { id: 'bg-9', cardName: '1989 Upper Deck Ken Griffey Jr #1', player: 'Ken Griffey Jr', year: '1989', set: 'Upper Deck', rawValue: 25, estimatedGrade: '8', gradeProbability: 0.70, gradedValue: 80, projectedRoi: 5, priority: 'skip', notes: 'Corner wear visible' },
  { id: 'bg-10', cardName: '2024 Topps Sapphire Shohei Ohtani', player: 'Shohei Ohtani', year: '2024', set: 'Topps Sapphire', rawValue: 180, estimatedGrade: '10', gradeProbability: 0.45, gradedValue: 720, projectedRoi: 390, priority: 'must-grade', notes: 'Pristine condition' },
];

const mockServiceOptions: ServiceOption[] = [
  { company: 'PSA', tier: 'economy', costPerCard: 22, turnaroundDays: 120, insuranceIncluded: 500, bulkDiscount: 0.10, minCards: 20, maxCards: 999 },
  { company: 'PSA', tier: 'regular', costPerCard: 50, turnaroundDays: 65, insuranceIncluded: 2500, bulkDiscount: 0.05, minCards: 1, maxCards: 999 },
  { company: 'PSA', tier: 'express', costPerCard: 100, turnaroundDays: 15, insuranceIncluded: 5000, bulkDiscount: 0, minCards: 1, maxCards: 50 },
  { company: 'PSA', tier: 'super-express', costPerCard: 200, turnaroundDays: 5, insuranceIncluded: 10000, bulkDiscount: 0, minCards: 1, maxCards: 25 },
  { company: 'BGS', tier: 'economy', costPerCard: 25, turnaroundDays: 90, insuranceIncluded: 500, bulkDiscount: 0.08, minCards: 10, maxCards: 500 },
  { company: 'BGS', tier: 'regular', costPerCard: 55, turnaroundDays: 45, insuranceIncluded: 2500, bulkDiscount: 0.05, minCards: 1, maxCards: 500 },
  { company: 'BGS', tier: 'express', costPerCard: 150, turnaroundDays: 10, insuranceIncluded: 7500, bulkDiscount: 0, minCards: 1, maxCards: 25 },
  { company: 'SGC', tier: 'economy', costPerCard: 18, turnaroundDays: 60, insuranceIncluded: 1000, bulkDiscount: 0.12, minCards: 10, maxCards: 999 },
  { company: 'SGC', tier: 'regular', costPerCard: 30, turnaroundDays: 30, insuranceIncluded: 2500, bulkDiscount: 0.05, minCards: 1, maxCards: 500 },
  { company: 'CGC', tier: 'economy', costPerCard: 20, turnaroundDays: 75, insuranceIncluded: 500, bulkDiscount: 0.10, minCards: 15, maxCards: 999 },
  { company: 'CGC', tier: 'regular', costPerCard: 40, turnaroundDays: 35, insuranceIncluded: 2000, bulkDiscount: 0.05, minCards: 1, maxCards: 500 },
];

const mockHistory: SubmissionHistory[] = [
  { id: 'sh-1', date: '2026-02-15', company: 'PSA', tier: 'regular', cardCount: 15, totalCost: 712, returnRate: 0.87, avgGrade: '9.2', status: 'grading' },
  { id: 'sh-2', date: '2026-01-20', company: 'BGS', tier: 'economy', cardCount: 25, totalCost: 575, returnRate: 0.92, avgGrade: '9.0', status: 'shipped-back' },
  { id: 'sh-3', date: '2025-12-10', company: 'SGC', tier: 'regular', cardCount: 10, totalCost: 300, returnRate: 0.80, avgGrade: '8.8', status: 'received' },
  { id: 'sh-4', date: '2025-11-05', company: 'PSA', tier: 'express', cardCount: 5, totalCost: 500, returnRate: 1.00, avgGrade: '9.6', status: 'received' },
];

// ---- Service Functions ----

export function getBatchCards(): BatchCard[] {
  return mockBatchCards;
}

export function getServiceOptions(company?: GradingCompany): ServiceOption[] {
  if (company) return mockServiceOptions.filter(o => o.company === company);
  return mockServiceOptions;
}

export function getBatchSummary(cardIds?: string[]): BatchSummary {
  const cards = cardIds
    ? mockBatchCards.filter(c => cardIds.includes(c.id))
    : mockBatchCards.filter(c => c.priority !== 'skip');
  const totalCost = cards.length * 50; // assume regular PSA
  const totalValue = cards.reduce((s, c) => s + c.gradedValue * c.gradeProbability, 0);
  return {
    totalCards: cards.length,
    totalCost,
    projectedTotalRoi: totalValue - cards.reduce((s, c) => s + c.rawValue, 0) - totalCost,
    projectedTotalValue: totalValue,
    avgRoiPerCard: cards.reduce((s, c) => s + c.projectedRoi, 0) / cards.length,
    bestCompany: 'PSA',
    bestTier: 'regular',
    breakEvenRate: 0.62,
    estimatedTurnaround: '8-10 weeks',
  };
}

export function getGradeDistribution(): GradeDistribution[] {
  return [
    { grade: '10', count: 4, avgRoi: 345, totalProjectedValue: 2700 },
    { grade: '9.5', count: 2, avgRoi: 132, totalProjectedValue: 690 },
    { grade: '9', count: 2, avgRoi: 55, totalProjectedValue: 340 },
    { grade: '8', count: 1, avgRoi: 5, totalProjectedValue: 80 },
    { grade: '8.5', count: 0, avgRoi: 0, totalProjectedValue: 0 },
  ];
}

export function getSubmissionHistory(): SubmissionHistory[] {
  return mockHistory;
}
