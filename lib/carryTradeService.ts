// ─────────────────────────────────────────────────────────────────────────────
// Carry Trade Analyzer Service
// Analyzes carry (hold yield minus cost of carry) for card positions
// ─────────────────────────────────────────────────────────────────────────────

export interface CarryAnalysis {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  currentValue: number;
  annualAppreciation: number;
  storageCost: number;
  insuranceCost: number;
  capitalCost: number;
  gradingMaintenanceCost: number;
  totalCostOfCarry: number;
  grossCarry: number;
  netCarry: number;
  netCarryPct: number;
  breakEvenMonths: number;
  recommendation: 'strong-hold' | 'hold' | 'neutral' | 'consider-selling' | 'sell';
}

export interface CarryComponent {
  cardId: string;
  cardName: string;
  components: { name: string; value: number; pct: number; type: 'revenue' | 'cost' }[];
  totalRevenue: number;
  totalCost: number;
  netCarry: number;
}

export interface NetCarry {
  cardId: string;
  cardName: string;
  player: string;
  netCarryAnnual: number;
  netCarryMonthly: number;
  rank: number;
  percentile: number;
  category: 'premium-carry' | 'positive-carry' | 'break-even' | 'negative-carry' | 'deep-negative';
}

export interface CarryHistory {
  month: string;
  avgNetCarry: number;
  medianNetCarry: number;
  positiveCarryCards: number;
  negativeCarryCards: number;
  totalPortfolioCarry: number;
  avgAppreciation: number;
  avgCostOfCarry: number;
}

const carryAnalyses: CarryAnalysis[] = [
  { id: 'CA-01', cardName: '2018 Prizm Luka Doncic RC PSA 10', player: 'Luka Doncic', sport: 'Basketball', currentValue: 4250, annualAppreciation: 12.5, storageCost: 24, insuranceCost: 85, capitalCost: 212, gradingMaintenanceCost: 0, totalCostOfCarry: 321, grossCarry: 531, netCarry: 210, netCarryPct: 4.9, breakEvenMonths: 7, recommendation: 'hold' },
  { id: 'CA-02', cardName: '2011 Topps Update Trout RC PSA 10', player: 'Mike Trout', sport: 'Baseball', currentValue: 42000, annualAppreciation: 8.2, storageCost: 48, insuranceCost: 840, capitalCost: 2100, gradingMaintenanceCost: 0, totalCostOfCarry: 2988, grossCarry: 3444, netCarry: 456, netCarryPct: 1.1, breakEvenMonths: 10, recommendation: 'neutral' },
  { id: 'CA-03', cardName: '2017 Prizm Mahomes RC PSA 10', player: 'Patrick Mahomes', sport: 'Football', currentValue: 18500, annualAppreciation: 15.8, storageCost: 36, insuranceCost: 370, capitalCost: 925, gradingMaintenanceCost: 0, totalCostOfCarry: 1331, grossCarry: 2923, netCarry: 1592, netCarryPct: 8.6, breakEvenMonths: 5, recommendation: 'strong-hold' },
  { id: 'CA-04', cardName: '2003 Topps Chrome LeBron RC PSA 10', player: 'LeBron James', sport: 'Basketball', currentValue: 185000, annualAppreciation: 5.5, storageCost: 120, insuranceCost: 3700, capitalCost: 9250, gradingMaintenanceCost: 0, totalCostOfCarry: 13070, grossCarry: 10175, netCarry: -2895, netCarryPct: -1.6, breakEvenMonths: -1, recommendation: 'consider-selling' },
  { id: 'CA-05', cardName: '2023 Bowman Chrome Wemby Auto PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', currentValue: 8900, annualAppreciation: 22.5, storageCost: 24, insuranceCost: 178, capitalCost: 445, gradingMaintenanceCost: 0, totalCostOfCarry: 647, grossCarry: 2002, netCarry: 1355, netCarryPct: 15.2, breakEvenMonths: 4, recommendation: 'strong-hold' },
  { id: 'CA-06', cardName: '1986 Fleer Jordan RC PSA 9', player: 'Michael Jordan', sport: 'Basketball', currentValue: 28000, annualAppreciation: 4.2, storageCost: 48, insuranceCost: 560, capitalCost: 1400, gradingMaintenanceCost: 0, totalCostOfCarry: 2008, grossCarry: 1176, netCarry: -832, netCarryPct: -3.0, breakEvenMonths: -1, recommendation: 'consider-selling' },
  { id: 'CA-07', cardName: '2024 Bowman 1st Ethan Salas Auto', player: 'Ethan Salas', sport: 'Baseball', currentValue: 320, annualAppreciation: 35.0, storageCost: 12, insuranceCost: 6, capitalCost: 16, gradingMaintenanceCost: 30, totalCostOfCarry: 64, grossCarry: 112, netCarry: 48, netCarryPct: 15.0, breakEvenMonths: 7, recommendation: 'strong-hold' },
  { id: 'CA-08', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', sport: 'Football', currentValue: 310, annualAppreciation: 8.5, storageCost: 12, insuranceCost: 6, capitalCost: 15, gradingMaintenanceCost: 0, totalCostOfCarry: 33, grossCarry: 26, netCarry: -7, netCarryPct: -2.3, breakEvenMonths: -1, recommendation: 'neutral' },
  { id: 'CA-09', cardName: '1952 Topps Mantle SGC 3', player: 'Mickey Mantle', sport: 'Baseball', currentValue: 125000, annualAppreciation: 6.8, storageCost: 120, insuranceCost: 2500, capitalCost: 6250, gradingMaintenanceCost: 0, totalCostOfCarry: 8870, grossCarry: 8500, netCarry: -370, netCarryPct: -0.3, breakEvenMonths: -1, recommendation: 'neutral' },
  { id: 'CA-10', cardName: '2023 Prizm CJ Stroud RC PSA 10', player: 'CJ Stroud', sport: 'Football', currentValue: 165, annualAppreciation: 18.2, storageCost: 12, insuranceCost: 3, capitalCost: 8, gradingMaintenanceCost: 0, totalCostOfCarry: 23, grossCarry: 30, netCarry: 7, netCarryPct: 4.2, breakEvenMonths: 9, recommendation: 'hold' },
  { id: 'CA-11', cardName: '2019 Prizm Zion RC PSA 10', player: 'Zion Williamson', sport: 'Basketball', currentValue: 280, annualAppreciation: -5.2, storageCost: 12, insuranceCost: 6, capitalCost: 14, gradingMaintenanceCost: 0, totalCostOfCarry: 32, grossCarry: -15, netCarry: -47, netCarryPct: -16.8, breakEvenMonths: -1, recommendation: 'sell' },
  { id: 'CA-12', cardName: '2022 Topps Chrome Julio RC PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', currentValue: 145, annualAppreciation: 10.5, storageCost: 12, insuranceCost: 3, capitalCost: 7, gradingMaintenanceCost: 0, totalCostOfCarry: 22, grossCarry: 15, netCarry: -7, netCarryPct: -4.8, breakEvenMonths: -1, recommendation: 'neutral' },
  { id: 'CA-13', cardName: '2023 Topps Chrome Elly RC PSA 10', player: 'Elly De La Cruz', sport: 'Baseball', currentValue: 185, annualAppreciation: 25.0, storageCost: 12, insuranceCost: 4, capitalCost: 9, gradingMaintenanceCost: 0, totalCostOfCarry: 25, grossCarry: 46, netCarry: 21, netCarryPct: 11.4, breakEvenMonths: 7, recommendation: 'strong-hold' },
  { id: 'CA-14', cardName: '1993 SP Jeter RC PSA 10', player: 'Derek Jeter', sport: 'Baseball', currentValue: 42000, annualAppreciation: 3.5, storageCost: 48, insuranceCost: 840, capitalCost: 2100, gradingMaintenanceCost: 0, totalCostOfCarry: 2988, grossCarry: 1470, netCarry: -1518, netCarryPct: -3.6, breakEvenMonths: -1, recommendation: 'consider-selling' },
];

const carryComponents: CarryComponent[] = carryAnalyses.map(ca => ({
  cardId: ca.id,
  cardName: ca.cardName,
  components: [
    { name: 'Appreciation', value: ca.grossCarry, pct: ca.annualAppreciation, type: 'revenue' as const },
    { name: 'Storage', value: -ca.storageCost, pct: -(ca.storageCost / ca.currentValue * 100), type: 'cost' as const },
    { name: 'Insurance', value: -ca.insuranceCost, pct: -(ca.insuranceCost / ca.currentValue * 100), type: 'cost' as const },
    { name: 'Capital Cost', value: -ca.capitalCost, pct: -(ca.capitalCost / ca.currentValue * 100), type: 'cost' as const },
    { name: 'Grading Maint.', value: -ca.gradingMaintenanceCost, pct: -(ca.gradingMaintenanceCost / ca.currentValue * 100), type: 'cost' as const },
  ],
  totalRevenue: ca.grossCarry,
  totalCost: ca.totalCostOfCarry,
  netCarry: ca.netCarry,
}));

const netCarries: NetCarry[] = carryAnalyses
  .sort((a, b) => b.netCarryPct - a.netCarryPct)
  .map((ca, i) => ({
    cardId: ca.id,
    cardName: ca.cardName,
    player: ca.player,
    netCarryAnnual: ca.netCarry,
    netCarryMonthly: Math.round(ca.netCarry / 12),
    rank: i + 1,
    percentile: Math.round((1 - i / carryAnalyses.length) * 100),
    category: ca.netCarryPct > 10 ? 'premium-carry' as const :
      ca.netCarryPct > 0 ? 'positive-carry' as const :
      ca.netCarryPct > -2 ? 'break-even' as const :
      ca.netCarryPct > -10 ? 'negative-carry' as const : 'deep-negative' as const,
  }));

const carryHistory: CarryHistory[] = [
  { month: '2025-05', avgNetCarry: 2.8, medianNetCarry: 1.5, positiveCarryCards: 7, negativeCarryCards: 5, totalPortfolioCarry: 4200, avgAppreciation: 11.2, avgCostOfCarry: 8.4 },
  { month: '2025-06', avgNetCarry: 3.1, medianNetCarry: 1.8, positiveCarryCards: 8, negativeCarryCards: 4, totalPortfolioCarry: 4850, avgAppreciation: 12.0, avgCostOfCarry: 8.9 },
  { month: '2025-07', avgNetCarry: 2.5, medianNetCarry: 1.2, positiveCarryCards: 6, negativeCarryCards: 6, totalPortfolioCarry: 3600, avgAppreciation: 10.5, avgCostOfCarry: 8.0 },
  { month: '2025-08', avgNetCarry: 3.5, medianNetCarry: 2.2, positiveCarryCards: 8, negativeCarryCards: 4, totalPortfolioCarry: 5250, avgAppreciation: 13.2, avgCostOfCarry: 9.7 },
  { month: '2025-09', avgNetCarry: 2.9, medianNetCarry: 1.6, positiveCarryCards: 7, negativeCarryCards: 5, totalPortfolioCarry: 4350, avgAppreciation: 11.8, avgCostOfCarry: 8.9 },
  { month: '2025-10', avgNetCarry: 3.2, medianNetCarry: 2.0, positiveCarryCards: 8, negativeCarryCards: 4, totalPortfolioCarry: 4900, avgAppreciation: 12.5, avgCostOfCarry: 9.3 },
  { month: '2025-11', avgNetCarry: 2.2, medianNetCarry: 0.8, positiveCarryCards: 6, negativeCarryCards: 6, totalPortfolioCarry: 3100, avgAppreciation: 9.8, avgCostOfCarry: 7.6 },
  { month: '2025-12', avgNetCarry: 3.8, medianNetCarry: 2.5, positiveCarryCards: 9, negativeCarryCards: 3, totalPortfolioCarry: 5800, avgAppreciation: 14.2, avgCostOfCarry: 10.4 },
  { month: '2026-01', avgNetCarry: 3.0, medianNetCarry: 1.8, positiveCarryCards: 7, negativeCarryCards: 5, totalPortfolioCarry: 4500, avgAppreciation: 12.0, avgCostOfCarry: 9.0 },
  { month: '2026-02', avgNetCarry: 2.8, medianNetCarry: 1.5, positiveCarryCards: 7, negativeCarryCards: 5, totalPortfolioCarry: 4150, avgAppreciation: 11.5, avgCostOfCarry: 8.7 },
  { month: '2026-03', avgNetCarry: 3.3, medianNetCarry: 2.1, positiveCarryCards: 8, negativeCarryCards: 4, totalPortfolioCarry: 5100, avgAppreciation: 12.8, avgCostOfCarry: 9.5 },
  { month: '2026-04', avgNetCarry: 3.1, medianNetCarry: 1.9, positiveCarryCards: 7, negativeCarryCards: 5, totalPortfolioCarry: 4750, avgAppreciation: 12.2, avgCostOfCarry: 9.1 },
];

export function getCarryAnalyses(): CarryAnalysis[] { return carryAnalyses; }
export function getCarryComponents(): CarryComponent[] { return carryComponents; }
export function getNetCarries(): NetCarry[] { return netCarries; }
export function getCarryHistory(): CarryHistory[] { return carryHistory; }
export function getPositiveCarryCount(): number { return carryAnalyses.filter(c => c.netCarry > 0).length; }
export function getNegativeCarryCount(): number { return carryAnalyses.filter(c => c.netCarry < 0).length; }
export function getAvgNetCarryPct(): number { return Math.round(carryAnalyses.reduce((s, c) => s + c.netCarryPct, 0) / carryAnalyses.length * 10) / 10; }
export function getTotalPortfolioCarry(): number { return carryAnalyses.reduce((s, c) => s + c.netCarry, 0); }
