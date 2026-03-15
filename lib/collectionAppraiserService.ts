// Phase 150: AI Collection Appraiser & Insurance Valuation
// AI-powered collection valuation with insurance-grade appraisals, replacement cost analysis, and depreciation tracking

// ---- Types ----

export type AppraisalType = 'quick' | 'standard' | 'insurance' | 'estate' | 'tax';

export interface CardAppraisal {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  cardNumber: string;
  grade: string;
  gradingCompany: string;
  fairMarketValue: number;
  insuranceReplacementValue: number;
  liquidationValue: number;
  depreciationRate: number;
  annualAppreciation: number;
  condition: string;
  lastUpdated: string;
  comparablesSold: number;
  confidenceScore: number;
  category: 'modern' | 'vintage' | 'ultra_modern' | 'graded' | 'raw';
}

export interface AppraisalReport {
  id: string;
  reportName: string;
  appraisalType: AppraisalType;
  createdAt: string;
  totalCards: number;
  totalFairMarketValue: number;
  totalInsuranceValue: number;
  totalLiquidationValue: number;
  averageDepreciation: number;
  topCard: string;
  topCardValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  certificateId: string;
  validUntil: string;
  notes: string;
}

export interface InsuranceCoverage {
  id: string;
  providerName: string;
  coverageType: 'basic' | 'standard' | 'premium' | 'collectors_elite';
  annualPremium: number;
  deductible: number;
  maxCoverage: number;
  coveredPerils: string[];
  exclusions: string[];
  rating: number;
  recommended: boolean;
}

export interface DepreciationSchedule {
  id: string;
  category: 'modern' | 'vintage' | 'ultra_modern' | 'graded_gem' | 'graded_mid' | 'raw';
  label: string;
  year1Rate: number;
  year3Rate: number;
  year5Rate: number;
  year10Rate: number;
  appreciationPotential: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
}

export interface ReplacementCost {
  id: string;
  cardAppraisalId: string;
  cardName: string;
  currentMarketPrice: number;
  replacementCost: number;
  replacementDifficulty: 'easy' | 'moderate' | 'hard' | 'very_hard' | 'impossible';
  estimatedSearchTime: string;
  alternativesAvailable: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  lastSalePrice: number;
  lastSaleDate: string;
}

export interface ComparableValue {
  id: string;
  referenceCardId: string;
  comparableCardName: string;
  soldPrice: number;
  soldDate: string;
  platform: string;
  grade: string;
  relevanceScore: number;
  priceDifference: number;
}

export interface AppraisalHistory {
  id: string;
  cardAppraisalId: string;
  cardName: string;
  appraisalDate: string;
  appraisedValue: number;
  previousValue: number;
  changePercent: number;
  appraiser: string;
  method: string;
}

export interface CollectionSummary {
  totalCards: number;
  totalFairMarketValue: number;
  totalInsuranceValue: number;
  totalLiquidationValue: number;
  averageCardValue: number;
  medianCardValue: number;
  highestValueCard: string;
  highestValue: number;
  lowestValueCard: string;
  lowestValue: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
  gradeDistribution: { grade: string; count: number }[];
  annualAppreciation: number;
  lastAppraised: string;
}

export interface RiskFactor {
  id: string;
  factorName: string;
  category: 'market' | 'condition' | 'storage' | 'authentication' | 'liquidity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  impactEstimate: number;
}

export interface CoverageRecommendation {
  id: string;
  collectionValueRange: string;
  recommendedCoverage: string;
  estimatedPremium: number;
  providerId: string;
  providerName: string;
  reasoning: string;
}

export interface AppraisalCertificate {
  id: string;
  reportId: string;
  issuedDate: string;
  validUntil: string;
  appraiserName: string;
  appraiserCredentials: string;
  totalValue: number;
  methodology: string;
  digitalSignature: string;
  verificationUrl: string;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_collection_appraiser';

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getAppraisalTypeConfig(type: AppraisalType): { label: string; text: string; bg: string; border: string } {
  switch (type) {
    case 'quick': return { label: 'Quick', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    case 'standard': return { label: 'Standard', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'insurance': return { label: 'Insurance', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'estate': return { label: 'Estate', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'tax': return { label: 'Tax', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  }
}

// ---- Mock Data: Card Appraisals (30) ----

const MOCK_CARD_APPRAISALS: CardAppraisal[] = [
  { id: 'ca-1', cardName: '2024 Topps Chrome Shohei Ohtani Auto /25', player: 'Shohei Ohtani', year: 2024, set: 'Topps Chrome', cardNumber: '1', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 4500.00, insuranceReplacementValue: 5850.00, liquidationValue: 3375.00, depreciationRate: 2.5, annualAppreciation: 8.2, condition: 'Gem Mint', lastUpdated: '2026-03-10', comparablesSold: 12, confidenceScore: 92, category: 'modern' },
  { id: 'ca-2', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, set: 'Topps', cardNumber: '311', grade: 'PSA 5', gradingCompany: 'PSA', fairMarketValue: 185000.00, insuranceReplacementValue: 240500.00, liquidationValue: 148000.00, depreciationRate: -3.5, annualAppreciation: 12.8, condition: 'Excellent', lastUpdated: '2026-02-28', comparablesSold: 4, confidenceScore: 88, category: 'vintage' },
  { id: 'ca-3', cardName: '2024 Panini Prizm Victor Wembanyama Silver Auto /25', player: 'Victor Wembanyama', year: 2024, set: 'Panini Prizm', cardNumber: '1', grade: 'BGS 9.5', gradingCompany: 'BGS', fairMarketValue: 5200.00, insuranceReplacementValue: 6760.00, liquidationValue: 3900.00, depreciationRate: 5.0, annualAppreciation: 15.5, condition: 'Gem Mint', lastUpdated: '2026-03-12', comparablesSold: 8, confidenceScore: 85, category: 'ultra_modern' },
  { id: 'ca-4', cardName: '1986 Fleer Michael Jordan #57', player: 'Michael Jordan', year: 1986, set: 'Fleer', cardNumber: '57', grade: 'PSA 8', gradingCompany: 'PSA', fairMarketValue: 32000.00, insuranceReplacementValue: 41600.00, liquidationValue: 25600.00, depreciationRate: -1.2, annualAppreciation: 6.5, condition: 'Near Mint-Mint', lastUpdated: '2026-03-01', comparablesSold: 18, confidenceScore: 95, category: 'vintage' },
  { id: 'ca-5', cardName: '2018 Topps Update Shohei Ohtani RC #US1', player: 'Shohei Ohtani', year: 2018, set: 'Topps Update', cardNumber: 'US1', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 850.00, insuranceReplacementValue: 1105.00, liquidationValue: 637.50, depreciationRate: 3.0, annualAppreciation: 5.8, condition: 'Gem Mint', lastUpdated: '2026-03-08', comparablesSold: 45, confidenceScore: 96, category: 'graded' },
  { id: 'ca-6', cardName: '1989 Upper Deck Ken Griffey Jr #1', player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', cardNumber: '1', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 4200.00, insuranceReplacementValue: 5460.00, liquidationValue: 3150.00, depreciationRate: -0.5, annualAppreciation: 4.2, condition: 'Gem Mint', lastUpdated: '2026-02-15', comparablesSold: 22, confidenceScore: 94, category: 'vintage' },
  { id: 'ca-7', cardName: '2024 Bowman Chrome Ethan Salas 1st Auto', player: 'Ethan Salas', year: 2024, set: 'Bowman Chrome', cardNumber: '50', grade: 'SGC 10', gradingCompany: 'SGC', fairMarketValue: 1950.00, insuranceReplacementValue: 2535.00, liquidationValue: 1462.50, depreciationRate: 8.0, annualAppreciation: 22.0, condition: 'Pristine', lastUpdated: '2026-03-14', comparablesSold: 6, confidenceScore: 72, category: 'ultra_modern' },
  { id: 'ca-8', cardName: '1993 SP Derek Jeter Foil #279', player: 'Derek Jeter', year: 1993, set: 'SP', cardNumber: '279', grade: 'PSA 9', gradingCompany: 'PSA', fairMarketValue: 22000.00, insuranceReplacementValue: 28600.00, liquidationValue: 17600.00, depreciationRate: -2.0, annualAppreciation: 5.5, condition: 'Mint', lastUpdated: '2026-02-20', comparablesSold: 10, confidenceScore: 91, category: 'vintage' },
  { id: 'ca-9', cardName: '2024 Panini Prizm Caleb Williams Silver RC', player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', cardNumber: '301', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 320.00, insuranceReplacementValue: 416.00, liquidationValue: 240.00, depreciationRate: 12.0, annualAppreciation: -5.0, condition: 'Gem Mint', lastUpdated: '2026-03-10', comparablesSold: 55, confidenceScore: 90, category: 'ultra_modern' },
  { id: 'ca-10', cardName: '2001 Topps Chrome Ichiro Suzuki Refractor RC', player: 'Ichiro Suzuki', year: 2001, set: 'Topps Chrome', cardNumber: '151', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 8500.00, insuranceReplacementValue: 11050.00, liquidationValue: 6375.00, depreciationRate: -1.8, annualAppreciation: 7.2, condition: 'Gem Mint', lastUpdated: '2026-03-05', comparablesSold: 8, confidenceScore: 89, category: 'vintage' },
  { id: 'ca-11', cardName: '2024 Topps Chrome Elly De La Cruz Auto /99', player: 'Elly De La Cruz', year: 2024, set: 'Topps Chrome', cardNumber: '201', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 1850.00, insuranceReplacementValue: 2405.00, liquidationValue: 1387.50, depreciationRate: 6.0, annualAppreciation: 12.0, condition: 'Gem Mint', lastUpdated: '2026-03-12', comparablesSold: 10, confidenceScore: 82, category: 'modern' },
  { id: 'ca-12', cardName: '1955 Topps Roberto Clemente RC #164', player: 'Roberto Clemente', year: 1955, set: 'Topps', cardNumber: '164', grade: 'PSA 4', gradingCompany: 'PSA', fairMarketValue: 28000.00, insuranceReplacementValue: 36400.00, liquidationValue: 21000.00, depreciationRate: -4.0, annualAppreciation: 9.5, condition: 'Very Good-Excellent', lastUpdated: '2026-01-28', comparablesSold: 5, confidenceScore: 86, category: 'vintage' },
  { id: 'ca-13', cardName: '2024 Panini Select Jayden Daniels Auto /99', player: 'Jayden Daniels', year: 2024, set: 'Panini Select', cardNumber: '200', grade: 'BGS 9.5', gradingCompany: 'BGS', fairMarketValue: 1200.00, insuranceReplacementValue: 1560.00, liquidationValue: 900.00, depreciationRate: 7.0, annualAppreciation: 10.0, condition: 'Gem Mint', lastUpdated: '2026-03-08', comparablesSold: 14, confidenceScore: 84, category: 'ultra_modern' },
  { id: 'ca-14', cardName: '2024 Bowman Draft Paul Skenes Auto /150', player: 'Paul Skenes', year: 2024, set: 'Bowman Draft', cardNumber: '100', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 2100.00, insuranceReplacementValue: 2730.00, liquidationValue: 1575.00, depreciationRate: 5.5, annualAppreciation: 14.0, condition: 'Gem Mint', lastUpdated: '2026-03-11', comparablesSold: 9, confidenceScore: 80, category: 'modern' },
  { id: 'ca-15', cardName: '1968 Topps Nolan Ryan RC #177', player: 'Nolan Ryan', year: 1968, set: 'Topps', cardNumber: '177', grade: 'PSA 6', gradingCompany: 'PSA', fairMarketValue: 15000.00, insuranceReplacementValue: 19500.00, liquidationValue: 11250.00, depreciationRate: -2.5, annualAppreciation: 6.0, condition: 'Excellent-Mint', lastUpdated: '2026-02-10', comparablesSold: 12, confidenceScore: 93, category: 'vintage' },
  { id: 'ca-16', cardName: '2024 Panini Prizm LeBron James Silver', player: 'LeBron James', year: 2024, set: 'Panini Prizm', cardNumber: '23', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 420.00, insuranceReplacementValue: 546.00, liquidationValue: 315.00, depreciationRate: 4.0, annualAppreciation: 3.5, condition: 'Gem Mint', lastUpdated: '2026-03-14', comparablesSold: 38, confidenceScore: 94, category: 'modern' },
  { id: 'ca-17', cardName: '1954 Topps Hank Aaron RC #128', player: 'Hank Aaron', year: 1954, set: 'Topps', cardNumber: '128', grade: 'PSA 3', gradingCompany: 'PSA', fairMarketValue: 42000.00, insuranceReplacementValue: 54600.00, liquidationValue: 31500.00, depreciationRate: -3.8, annualAppreciation: 8.8, condition: 'Very Good', lastUpdated: '2026-01-15', comparablesSold: 3, confidenceScore: 82, category: 'vintage' },
  { id: 'ca-18', cardName: '2024 Topps Chrome Gunnar Henderson RC Auto', player: 'Gunnar Henderson', year: 2024, set: 'Topps Chrome', cardNumber: '350', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 1650.00, insuranceReplacementValue: 2145.00, liquidationValue: 1237.50, depreciationRate: 4.5, annualAppreciation: 11.0, condition: 'Gem Mint', lastUpdated: '2026-03-09', comparablesSold: 15, confidenceScore: 87, category: 'modern' },
  { id: 'ca-19', cardName: '2024 Panini Prizm Patrick Mahomes Silver', player: 'Patrick Mahomes', year: 2024, set: 'Panini Prizm', cardNumber: '15', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 285.00, insuranceReplacementValue: 370.50, liquidationValue: 213.75, depreciationRate: 5.0, annualAppreciation: 2.8, condition: 'Gem Mint', lastUpdated: '2026-03-13', comparablesSold: 42, confidenceScore: 95, category: 'modern' },
  { id: 'ca-20', cardName: '2024 Panini Prizm Nikola Jokic Silver', player: 'Nikola Jokic', year: 2024, set: 'Panini Prizm', cardNumber: '15', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 380.00, insuranceReplacementValue: 494.00, liquidationValue: 285.00, depreciationRate: 3.5, annualAppreciation: 5.0, condition: 'Gem Mint', lastUpdated: '2026-03-10', comparablesSold: 28, confidenceScore: 93, category: 'modern' },
  { id: 'ca-21', cardName: '2024 Bowman Chrome Jackson Holliday Auto /50', player: 'Jackson Holliday', year: 2024, set: 'Bowman Chrome', cardNumber: '215', grade: 'SGC 9.5', gradingCompany: 'SGC', fairMarketValue: 980.00, insuranceReplacementValue: 1274.00, liquidationValue: 735.00, depreciationRate: 9.0, annualAppreciation: 18.0, condition: 'Gem Mint', lastUpdated: '2026-03-06', comparablesSold: 7, confidenceScore: 75, category: 'ultra_modern' },
  { id: 'ca-22', cardName: '2003 Topps Chrome LeBron James RC #111', player: 'LeBron James', year: 2003, set: 'Topps Chrome', cardNumber: '111', grade: 'PSA 9', gradingCompany: 'PSA', fairMarketValue: 18500.00, insuranceReplacementValue: 24050.00, liquidationValue: 13875.00, depreciationRate: -1.0, annualAppreciation: 5.2, condition: 'Mint', lastUpdated: '2026-02-22', comparablesSold: 15, confidenceScore: 94, category: 'vintage' },
  { id: 'ca-23', cardName: '2024 Topps Chrome Juan Soto Auto', player: 'Juan Soto', year: 2024, set: 'Topps Chrome', cardNumber: '22', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 750.00, insuranceReplacementValue: 975.00, liquidationValue: 562.50, depreciationRate: 3.0, annualAppreciation: 8.5, condition: 'Gem Mint', lastUpdated: '2026-03-12', comparablesSold: 20, confidenceScore: 90, category: 'modern' },
  { id: 'ca-24', cardName: '2024 Panini Select Marvin Harrison Jr Auto /99', player: 'Marvin Harrison Jr', year: 2024, set: 'Panini Select', cardNumber: '310', grade: 'BGS 9.5', gradingCompany: 'BGS', fairMarketValue: 680.00, insuranceReplacementValue: 884.00, liquidationValue: 510.00, depreciationRate: 7.5, annualAppreciation: 8.0, condition: 'Gem Mint', lastUpdated: '2026-03-10', comparablesSold: 11, confidenceScore: 81, category: 'ultra_modern' },
  { id: 'ca-25', cardName: '1956 Topps Mickey Mantle #135', player: 'Mickey Mantle', year: 1956, set: 'Topps', cardNumber: '135', grade: 'PSA 4', gradingCompany: 'PSA', fairMarketValue: 52000.00, insuranceReplacementValue: 67600.00, liquidationValue: 39000.00, depreciationRate: -4.2, annualAppreciation: 10.5, condition: 'Very Good-Excellent', lastUpdated: '2026-01-20', comparablesSold: 6, confidenceScore: 87, category: 'vintage' },
  { id: 'ca-26', cardName: '2024 Topps Chrome Bobby Witt Jr Green Refractor /299', player: 'Bobby Witt Jr', year: 2024, set: 'Topps Chrome', cardNumber: '44', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 520.00, insuranceReplacementValue: 676.00, liquidationValue: 390.00, depreciationRate: 4.0, annualAppreciation: 7.5, condition: 'Gem Mint', lastUpdated: '2026-03-08', comparablesSold: 16, confidenceScore: 88, category: 'modern' },
  { id: 'ca-27', cardName: '2024 Panini Prizm Chet Holmgren Silver /149', player: 'Chet Holmgren', year: 2024, set: 'Panini Prizm', cardNumber: '55', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 385.00, insuranceReplacementValue: 500.50, liquidationValue: 288.75, depreciationRate: 6.0, annualAppreciation: 9.0, condition: 'Gem Mint', lastUpdated: '2026-03-11', comparablesSold: 13, confidenceScore: 83, category: 'ultra_modern' },
  { id: 'ca-28', cardName: '2024 Topps Chrome Corbin Carroll Pink Refractor', player: 'Corbin Carroll', year: 2024, set: 'Topps Chrome', cardNumber: '125', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 280.00, insuranceReplacementValue: 364.00, liquidationValue: 210.00, depreciationRate: 8.0, annualAppreciation: -2.0, condition: 'Gem Mint', lastUpdated: '2026-03-07', comparablesSold: 25, confidenceScore: 91, category: 'modern' },
  { id: 'ca-29', cardName: '2024 Panini Prizm Shai Gilgeous-Alexander RWB', player: 'Shai Gilgeous-Alexander', year: 2024, set: 'Panini Prizm', cardNumber: '2', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 195.00, insuranceReplacementValue: 253.50, liquidationValue: 146.25, depreciationRate: 3.5, annualAppreciation: 12.0, condition: 'Gem Mint', lastUpdated: '2026-03-14', comparablesSold: 30, confidenceScore: 92, category: 'modern' },
  { id: 'ca-30', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', player: 'Travis Bazzana', year: 2024, set: 'Bowman Chrome', cardNumber: '1', grade: 'PSA 10', gradingCompany: 'PSA', fairMarketValue: 1450.00, insuranceReplacementValue: 1885.00, liquidationValue: 1087.50, depreciationRate: 10.0, annualAppreciation: 25.0, condition: 'Gem Mint', lastUpdated: '2026-03-13', comparablesSold: 5, confidenceScore: 68, category: 'ultra_modern' },
];

// ---- Mock Data: Appraisal Reports (5) ----

const MOCK_APPRAISAL_REPORTS: AppraisalReport[] = [
  { id: 'ar-1', reportName: 'Full Collection Insurance Appraisal', appraisalType: 'insurance', createdAt: '2026-03-10', totalCards: 30, totalFairMarketValue: 394475.00, totalInsuranceValue: 512817.50, totalLiquidationValue: 295856.25, averageDepreciation: 3.2, topCard: '1952 Topps Mickey Mantle #311', topCardValue: 185000.00, riskLevel: 'medium', certificateId: 'CERT-2026-0310-001', validUntil: '2027-03-10', notes: 'Comprehensive insurance-grade appraisal of full collection with verified comparables and market analysis.' },
  { id: 'ar-2', reportName: 'Quick Market Valuation', appraisalType: 'quick', createdAt: '2026-03-14', totalCards: 30, totalFairMarketValue: 394475.00, totalInsuranceValue: 512817.50, totalLiquidationValue: 295856.25, averageDepreciation: 3.2, topCard: '1952 Topps Mickey Mantle #311', topCardValue: 185000.00, riskLevel: 'low', certificateId: 'CERT-2026-0314-002', validUntil: '2026-06-14', notes: 'Quick market snapshot for portfolio monitoring purposes.' },
  { id: 'ar-3', reportName: 'Estate Planning Valuation', appraisalType: 'estate', createdAt: '2026-02-15', totalCards: 30, totalFairMarketValue: 394475.00, totalInsuranceValue: 512817.50, totalLiquidationValue: 295856.25, averageDepreciation: 3.2, topCard: '1952 Topps Mickey Mantle #311', topCardValue: 185000.00, riskLevel: 'medium', certificateId: 'CERT-2026-0215-003', validUntil: '2027-02-15', notes: 'Estate planning appraisal prepared for trust documentation and beneficiary allocation.' },
  { id: 'ar-4', reportName: 'Tax Donation Valuation', appraisalType: 'tax', createdAt: '2026-01-20', totalCards: 12, totalFairMarketValue: 145000.00, totalInsuranceValue: 188500.00, totalLiquidationValue: 108750.00, averageDepreciation: 1.5, topCard: '1954 Topps Hank Aaron RC #128', topCardValue: 42000.00, riskLevel: 'low', certificateId: 'CERT-2026-0120-004', validUntil: '2026-07-20', notes: 'IRS-compliant appraisal for charitable donation of vintage cards to museum.' },
  { id: 'ar-5', reportName: 'Standard Annual Review', appraisalType: 'standard', createdAt: '2026-03-01', totalCards: 30, totalFairMarketValue: 394475.00, totalInsuranceValue: 512817.50, totalLiquidationValue: 295856.25, averageDepreciation: 3.2, topCard: '1952 Topps Mickey Mantle #311', topCardValue: 185000.00, riskLevel: 'medium', certificateId: 'CERT-2026-0301-005', validUntil: '2027-03-01', notes: 'Annual standard review with market trend analysis and portfolio rebalancing recommendations.' },
];

// ---- Mock Data: Insurance Coverage Options (8) ----

const MOCK_INSURANCE_COVERAGE: InsuranceCoverage[] = [
  { id: 'ic-1', providerName: 'CollectInsure', coverageType: 'basic', annualPremium: 120.00, deductible: 500.00, maxCoverage: 25000.00, coveredPerils: ['Fire', 'Theft', 'Water damage'], exclusions: ['Gradual deterioration', 'Market value decline', 'Shipping damage'], rating: 3.8, recommended: false },
  { id: 'ic-2', providerName: 'CollectInsure', coverageType: 'standard', annualPremium: 285.00, deductible: 250.00, maxCoverage: 100000.00, coveredPerils: ['Fire', 'Theft', 'Water damage', 'Natural disaster', 'Accidental damage'], exclusions: ['Market value decline', 'Intentional damage'], rating: 4.2, recommended: false },
  { id: 'ic-3', providerName: 'CollectInsure', coverageType: 'premium', annualPremium: 580.00, deductible: 100.00, maxCoverage: 500000.00, coveredPerils: ['Fire', 'Theft', 'Water damage', 'Natural disaster', 'Accidental damage', 'Shipping damage', 'Power surge'], exclusions: ['Market value decline'], rating: 4.6, recommended: true },
  { id: 'ic-4', providerName: 'CollectInsure', coverageType: 'collectors_elite', annualPremium: 1250.00, deductible: 0.00, maxCoverage: 2000000.00, coveredPerils: ['All perils', 'Mysterious disappearance', 'Pairs and sets', 'Transit worldwide'], exclusions: ['War', 'Nuclear'], rating: 4.9, recommended: false },
  { id: 'ic-5', providerName: 'Heritage Shield', coverageType: 'standard', annualPremium: 310.00, deductible: 200.00, maxCoverage: 150000.00, coveredPerils: ['Fire', 'Theft', 'Water damage', 'Natural disaster', 'Transit'], exclusions: ['Gradual deterioration', 'Market fluctuation', 'Mold'], rating: 4.0, recommended: false },
  { id: 'ic-6', providerName: 'Heritage Shield', coverageType: 'premium', annualPremium: 625.00, deductible: 100.00, maxCoverage: 750000.00, coveredPerils: ['Fire', 'Theft', 'Water damage', 'Natural disaster', 'Transit', 'Accidental damage', 'Restoration costs'], exclusions: ['Market fluctuation'], rating: 4.5, recommended: false },
  { id: 'ic-7', providerName: 'Slab Guard Pro', coverageType: 'premium', annualPremium: 545.00, deductible: 150.00, maxCoverage: 400000.00, coveredPerils: ['Fire', 'Theft', 'Water', 'Transit', 'Slab cracking', 'Accidental damage'], exclusions: ['Market decline', 'Grade revision'], rating: 4.4, recommended: false },
  { id: 'ic-8', providerName: 'Slab Guard Pro', coverageType: 'collectors_elite', annualPremium: 1100.00, deductible: 50.00, maxCoverage: 1500000.00, coveredPerils: ['All risk', 'Slab cracking', 'Mysterious disappearance', 'Worldwide transit', 'Show/exhibition'], exclusions: ['Nuclear', 'Governmental confiscation'], rating: 4.8, recommended: false },
];

// ---- Mock Data: Depreciation Schedules ----

const MOCK_DEPRECIATION_SCHEDULES: DepreciationSchedule[] = [
  { id: 'ds-1', category: 'modern', label: 'Modern Cards (2010-present)', year1Rate: 5.0, year3Rate: 12.0, year5Rate: 18.0, year10Rate: 25.0, appreciationPotential: 35.0, volatility: 'medium', description: 'Modern cards typically depreciate initially but can appreciate significantly with player career milestones.' },
  { id: 'ds-2', category: 'vintage', label: 'Vintage Cards (pre-1980)', year1Rate: -3.0, year3Rate: -8.0, year5Rate: -15.0, year10Rate: -35.0, appreciationPotential: 60.0, volatility: 'low', description: 'Vintage cards generally appreciate over time due to finite supply and growing collector interest.' },
  { id: 'ds-3', category: 'ultra_modern', label: 'Ultra-Modern Cards (current year)', year1Rate: 15.0, year3Rate: 30.0, year5Rate: 35.0, year10Rate: 40.0, appreciationPotential: 50.0, volatility: 'extreme', description: 'Ultra-modern cards are highly volatile with significant initial depreciation risk but explosive upside potential.' },
  { id: 'ds-4', category: 'graded_gem', label: 'Graded Gem Mint (PSA 10/BGS 9.5+)', year1Rate: 2.0, year3Rate: 5.0, year5Rate: 8.0, year10Rate: 10.0, appreciationPotential: 45.0, volatility: 'medium', description: 'Top-grade slabs hold value well and command strong premiums in any market condition.' },
  { id: 'ds-5', category: 'graded_mid', label: 'Graded Mid-Grade (PSA 5-8)', year1Rate: 4.0, year3Rate: 10.0, year5Rate: 15.0, year10Rate: 20.0, appreciationPotential: 25.0, volatility: 'low', description: 'Mid-grade slabs offer steady value with less volatility but lower appreciation ceiling.' },
  { id: 'ds-6', category: 'raw', label: 'Raw Ungraded Cards', year1Rate: 8.0, year3Rate: 18.0, year5Rate: 28.0, year10Rate: 40.0, appreciationPotential: 15.0, volatility: 'high', description: 'Raw cards depreciate faster and face authentication risk, but offer grading upside if submitted.' },
];

// ---- Mock Data: Replacement Costs (20) ----

const MOCK_REPLACEMENT_COSTS: ReplacementCost[] = [
  { id: 'rc-1', cardAppraisalId: 'ca-1', cardName: '2024 Topps Chrome Shohei Ohtani Auto /25', currentMarketPrice: 4500.00, replacementCost: 5200.00, replacementDifficulty: 'hard', estimatedSearchTime: '2-4 weeks', alternativesAvailable: 8, marketTrend: 'rising', lastSalePrice: 4650.00, lastSaleDate: '2026-02-28' },
  { id: 'rc-2', cardAppraisalId: 'ca-2', cardName: '1952 Topps Mickey Mantle #311', currentMarketPrice: 185000.00, replacementCost: 220000.00, replacementDifficulty: 'very_hard', estimatedSearchTime: '3-6 months', alternativesAvailable: 2, marketTrend: 'rising', lastSalePrice: 192000.00, lastSaleDate: '2025-11-20' },
  { id: 'rc-3', cardAppraisalId: 'ca-3', cardName: '2024 Panini Prizm Wembanyama Silver Auto /25', currentMarketPrice: 5200.00, replacementCost: 5800.00, replacementDifficulty: 'hard', estimatedSearchTime: '2-6 weeks', alternativesAvailable: 5, marketTrend: 'rising', lastSalePrice: 5500.00, lastSaleDate: '2026-03-05' },
  { id: 'rc-4', cardAppraisalId: 'ca-4', cardName: '1986 Fleer Michael Jordan #57', currentMarketPrice: 32000.00, replacementCost: 36000.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-3 weeks', alternativesAvailable: 15, marketTrend: 'stable', lastSalePrice: 33500.00, lastSaleDate: '2026-02-10' },
  { id: 'rc-5', cardAppraisalId: 'ca-5', cardName: '2018 Topps Update Shohei Ohtani RC #US1', currentMarketPrice: 850.00, replacementCost: 950.00, replacementDifficulty: 'easy', estimatedSearchTime: '1-3 days', alternativesAvailable: 42, marketTrend: 'stable', lastSalePrice: 880.00, lastSaleDate: '2026-03-01' },
  { id: 'rc-6', cardAppraisalId: 'ca-6', cardName: '1989 Upper Deck Ken Griffey Jr #1', currentMarketPrice: 4200.00, replacementCost: 4800.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-2 weeks', alternativesAvailable: 18, marketTrend: 'stable', lastSalePrice: 4050.00, lastSaleDate: '2026-01-28' },
  { id: 'rc-7', cardAppraisalId: 'ca-7', cardName: '2024 Bowman Chrome Ethan Salas 1st Auto', currentMarketPrice: 1950.00, replacementCost: 2300.00, replacementDifficulty: 'hard', estimatedSearchTime: '2-4 weeks', alternativesAvailable: 4, marketTrend: 'rising', lastSalePrice: 2050.00, lastSaleDate: '2026-03-10' },
  { id: 'rc-8', cardAppraisalId: 'ca-8', cardName: '1993 SP Derek Jeter Foil #279', currentMarketPrice: 22000.00, replacementCost: 26000.00, replacementDifficulty: 'hard', estimatedSearchTime: '1-3 months', alternativesAvailable: 6, marketTrend: 'rising', lastSalePrice: 21500.00, lastSaleDate: '2026-02-05' },
  { id: 'rc-9', cardAppraisalId: 'ca-12', cardName: '1955 Topps Roberto Clemente RC #164', currentMarketPrice: 28000.00, replacementCost: 34000.00, replacementDifficulty: 'very_hard', estimatedSearchTime: '2-6 months', alternativesAvailable: 3, marketTrend: 'rising', lastSalePrice: 29500.00, lastSaleDate: '2026-01-18' },
  { id: 'rc-10', cardAppraisalId: 'ca-15', cardName: '1968 Topps Nolan Ryan RC #177', currentMarketPrice: 15000.00, replacementCost: 18000.00, replacementDifficulty: 'moderate', estimatedSearchTime: '2-4 weeks', alternativesAvailable: 10, marketTrend: 'stable', lastSalePrice: 14500.00, lastSaleDate: '2026-01-22' },
  { id: 'rc-11', cardAppraisalId: 'ca-17', cardName: '1954 Topps Hank Aaron RC #128', currentMarketPrice: 42000.00, replacementCost: 52000.00, replacementDifficulty: 'very_hard', estimatedSearchTime: '3-6 months', alternativesAvailable: 2, marketTrend: 'rising', lastSalePrice: 40000.00, lastSaleDate: '2025-12-10' },
  { id: 'rc-12', cardAppraisalId: 'ca-22', cardName: '2003 Topps Chrome LeBron James RC #111', currentMarketPrice: 18500.00, replacementCost: 21500.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-3 weeks', alternativesAvailable: 12, marketTrend: 'stable', lastSalePrice: 19200.00, lastSaleDate: '2026-02-08' },
  { id: 'rc-13', cardAppraisalId: 'ca-25', cardName: '1956 Topps Mickey Mantle #135', currentMarketPrice: 52000.00, replacementCost: 62000.00, replacementDifficulty: 'very_hard', estimatedSearchTime: '2-4 months', alternativesAvailable: 4, marketTrend: 'rising', lastSalePrice: 50000.00, lastSaleDate: '2026-01-05' },
  { id: 'rc-14', cardAppraisalId: 'ca-10', cardName: '2001 Topps Chrome Ichiro Suzuki Refractor RC', currentMarketPrice: 8500.00, replacementCost: 10000.00, replacementDifficulty: 'hard', estimatedSearchTime: '2-6 weeks', alternativesAvailable: 6, marketTrend: 'rising', lastSalePrice: 8800.00, lastSaleDate: '2026-02-18' },
  { id: 'rc-15', cardAppraisalId: 'ca-30', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', currentMarketPrice: 1450.00, replacementCost: 1700.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-2 weeks', alternativesAvailable: 8, marketTrend: 'rising', lastSalePrice: 1520.00, lastSaleDate: '2026-03-11' },
  { id: 'rc-16', cardAppraisalId: 'ca-9', cardName: '2024 Panini Prizm Caleb Williams Silver RC', currentMarketPrice: 320.00, replacementCost: 350.00, replacementDifficulty: 'easy', estimatedSearchTime: '1-2 days', alternativesAvailable: 50, marketTrend: 'declining', lastSalePrice: 310.00, lastSaleDate: '2026-03-08' },
  { id: 'rc-17', cardAppraisalId: 'ca-11', cardName: '2024 Topps Chrome Elly De La Cruz Auto /99', currentMarketPrice: 1850.00, replacementCost: 2100.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-2 weeks', alternativesAvailable: 12, marketTrend: 'rising', lastSalePrice: 1780.00, lastSaleDate: '2026-03-08' },
  { id: 'rc-18', cardAppraisalId: 'ca-14', cardName: '2024 Bowman Draft Paul Skenes Auto /150', currentMarketPrice: 2100.00, replacementCost: 2450.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-3 weeks', alternativesAvailable: 9, marketTrend: 'rising', lastSalePrice: 2200.00, lastSaleDate: '2026-03-03' },
  { id: 'rc-19', cardAppraisalId: 'ca-23', cardName: '2024 Topps Chrome Juan Soto Auto', currentMarketPrice: 750.00, replacementCost: 850.00, replacementDifficulty: 'easy', estimatedSearchTime: '3-5 days', alternativesAvailable: 18, marketTrend: 'rising', lastSalePrice: 720.00, lastSaleDate: '2026-03-05' },
  { id: 'rc-20', cardAppraisalId: 'ca-18', cardName: '2024 Topps Chrome Gunnar Henderson RC Auto', currentMarketPrice: 1650.00, replacementCost: 1900.00, replacementDifficulty: 'moderate', estimatedSearchTime: '1-2 weeks', alternativesAvailable: 11, marketTrend: 'rising', lastSalePrice: 1700.00, lastSaleDate: '2026-03-05' },
];

// ---- Mock Data: Comparable Values (20) ----

const MOCK_COMPARABLE_VALUES: ComparableValue[] = [
  { id: 'cv-1', referenceCardId: 'ca-1', comparableCardName: '2024 Topps Chrome Ohtani Auto /25 PSA 10', soldPrice: 4650.00, soldDate: '2026-02-28', platform: 'eBay', grade: 'PSA 10', relevanceScore: 95, priceDifference: 150.00 },
  { id: 'cv-2', referenceCardId: 'ca-1', comparableCardName: '2024 Topps Chrome Ohtani Auto /25 BGS 9.5', soldPrice: 4200.00, soldDate: '2026-03-02', platform: 'PWCC', grade: 'BGS 9.5', relevanceScore: 88, priceDifference: -300.00 },
  { id: 'cv-3', referenceCardId: 'ca-2', comparableCardName: '1952 Topps Mantle PSA 4', soldPrice: 168000.00, soldDate: '2026-01-15', platform: 'Heritage Auctions', grade: 'PSA 4', relevanceScore: 82, priceDifference: -17000.00 },
  { id: 'cv-4', referenceCardId: 'ca-2', comparableCardName: '1952 Topps Mantle PSA 5', soldPrice: 192000.00, soldDate: '2025-11-20', platform: 'Goldin', grade: 'PSA 5', relevanceScore: 98, priceDifference: 7000.00 },
  { id: 'cv-5', referenceCardId: 'ca-3', comparableCardName: '2024 Prizm Wembanyama Silver Auto /25 PSA 10', soldPrice: 5500.00, soldDate: '2026-03-05', platform: 'eBay', grade: 'PSA 10', relevanceScore: 90, priceDifference: 300.00 },
  { id: 'cv-6', referenceCardId: 'ca-4', comparableCardName: '1986 Fleer Jordan PSA 8', soldPrice: 33500.00, soldDate: '2026-02-10', platform: 'PWCC', grade: 'PSA 8', relevanceScore: 96, priceDifference: 1500.00 },
  { id: 'cv-7', referenceCardId: 'ca-4', comparableCardName: '1986 Fleer Jordan PSA 7', soldPrice: 22000.00, soldDate: '2026-02-15', platform: 'Goldin', grade: 'PSA 7', relevanceScore: 78, priceDifference: -10000.00 },
  { id: 'cv-8', referenceCardId: 'ca-5', comparableCardName: '2018 Topps Update Ohtani PSA 10', soldPrice: 880.00, soldDate: '2026-03-01', platform: 'eBay', grade: 'PSA 10', relevanceScore: 97, priceDifference: 30.00 },
  { id: 'cv-9', referenceCardId: 'ca-6', comparableCardName: '1989 Upper Deck Griffey PSA 10', soldPrice: 4050.00, soldDate: '2026-01-28', platform: 'Heritage Auctions', grade: 'PSA 10', relevanceScore: 95, priceDifference: -150.00 },
  { id: 'cv-10', referenceCardId: 'ca-8', comparableCardName: '1993 SP Jeter PSA 9', soldPrice: 21500.00, soldDate: '2026-02-05', platform: 'Goldin', grade: 'PSA 9', relevanceScore: 94, priceDifference: -500.00 },
  { id: 'cv-11', referenceCardId: 'ca-10', comparableCardName: '2001 Chrome Ichiro Refractor PSA 10', soldPrice: 8800.00, soldDate: '2026-02-18', platform: 'PWCC', grade: 'PSA 10', relevanceScore: 96, priceDifference: 300.00 },
  { id: 'cv-12', referenceCardId: 'ca-11', comparableCardName: '2024 Chrome Elly DLC Auto /99 PSA 10', soldPrice: 1780.00, soldDate: '2026-03-08', platform: 'eBay', grade: 'PSA 10', relevanceScore: 93, priceDifference: -70.00 },
  { id: 'cv-13', referenceCardId: 'ca-14', comparableCardName: '2024 Bowman Skenes Auto /150 PSA 10', soldPrice: 2200.00, soldDate: '2026-03-03', platform: 'eBay', grade: 'PSA 10', relevanceScore: 95, priceDifference: 100.00 },
  { id: 'cv-14', referenceCardId: 'ca-15', comparableCardName: '1968 Topps Nolan Ryan PSA 6', soldPrice: 14500.00, soldDate: '2026-01-22', platform: 'Heritage Auctions', grade: 'PSA 6', relevanceScore: 94, priceDifference: -500.00 },
  { id: 'cv-15', referenceCardId: 'ca-17', comparableCardName: '1954 Topps Aaron PSA 3', soldPrice: 40000.00, soldDate: '2025-12-10', platform: 'Goldin', grade: 'PSA 3', relevanceScore: 92, priceDifference: -2000.00 },
  { id: 'cv-16', referenceCardId: 'ca-22', comparableCardName: '2003 Chrome LeBron PSA 9', soldPrice: 19200.00, soldDate: '2026-02-08', platform: 'PWCC', grade: 'PSA 9', relevanceScore: 97, priceDifference: 700.00 },
  { id: 'cv-17', referenceCardId: 'ca-25', comparableCardName: '1956 Topps Mantle PSA 4', soldPrice: 50000.00, soldDate: '2026-01-05', platform: 'Heritage Auctions', grade: 'PSA 4', relevanceScore: 95, priceDifference: -2000.00 },
  { id: 'cv-18', referenceCardId: 'ca-12', comparableCardName: '1955 Topps Clemente PSA 4', soldPrice: 29500.00, soldDate: '2026-01-18', platform: 'Goldin', grade: 'PSA 4', relevanceScore: 93, priceDifference: 1500.00 },
  { id: 'cv-19', referenceCardId: 'ca-7', comparableCardName: '2024 Bowman Salas 1st Auto SGC 10', soldPrice: 2050.00, soldDate: '2026-03-10', platform: 'eBay', grade: 'SGC 10', relevanceScore: 96, priceDifference: 100.00 },
  { id: 'cv-20', referenceCardId: 'ca-23', comparableCardName: '2024 Chrome Soto Auto PSA 10', soldPrice: 720.00, soldDate: '2026-03-05', platform: 'eBay', grade: 'PSA 10', relevanceScore: 94, priceDifference: -30.00 },
];

// ---- Mock Data: Appraisal History ----

const MOCK_APPRAISAL_HISTORY: AppraisalHistory[] = [
  { id: 'ah-1', cardAppraisalId: 'ca-2', cardName: '1952 Topps Mickey Mantle #311', appraisalDate: '2026-02-28', appraisedValue: 185000.00, previousValue: 172000.00, changePercent: 7.6, appraiser: 'Dr. Sarah Chen', method: 'Comparable Sales' },
  { id: 'ah-2', cardAppraisalId: 'ca-2', cardName: '1952 Topps Mickey Mantle #311', appraisalDate: '2025-08-15', appraisedValue: 172000.00, previousValue: 165000.00, changePercent: 4.2, appraiser: 'Michael Torres', method: 'Comparable Sales' },
  { id: 'ah-3', cardAppraisalId: 'ca-4', cardName: '1986 Fleer Michael Jordan #57', appraisalDate: '2026-03-01', appraisedValue: 32000.00, previousValue: 30500.00, changePercent: 4.9, appraiser: 'Dr. Sarah Chen', method: 'Market Analysis' },
  { id: 'ah-4', cardAppraisalId: 'ca-1', cardName: '2024 Topps Chrome Ohtani Auto /25', appraisalDate: '2026-03-10', appraisedValue: 4500.00, previousValue: 4200.00, changePercent: 7.1, appraiser: 'AI Valuation Engine', method: 'Algorithmic Comparable Sales' },
  { id: 'ah-5', cardAppraisalId: 'ca-3', cardName: '2024 Prizm Wembanyama Silver Auto /25', appraisalDate: '2026-03-12', appraisedValue: 5200.00, previousValue: 4800.00, changePercent: 8.3, appraiser: 'AI Valuation Engine', method: 'Algorithmic Comparable Sales' },
  { id: 'ah-6', cardAppraisalId: 'ca-22', cardName: '2003 Chrome LeBron James RC #111', appraisalDate: '2026-02-22', appraisedValue: 18500.00, previousValue: 17800.00, changePercent: 3.9, appraiser: 'Michael Torres', method: 'Auction Result Analysis' },
  { id: 'ah-7', cardAppraisalId: 'ca-25', cardName: '1956 Topps Mickey Mantle #135', appraisalDate: '2026-01-20', appraisedValue: 52000.00, previousValue: 48000.00, changePercent: 8.3, appraiser: 'Dr. Sarah Chen', method: 'Comparable Sales' },
  { id: 'ah-8', cardAppraisalId: 'ca-9', cardName: '2024 Prizm Caleb Williams Silver RC', appraisalDate: '2026-03-10', appraisedValue: 320.00, previousValue: 450.00, changePercent: -28.9, appraiser: 'AI Valuation Engine', method: 'Algorithmic Market Analysis' },
  { id: 'ah-9', cardAppraisalId: 'ca-6', cardName: '1989 Upper Deck Ken Griffey Jr #1', appraisalDate: '2026-02-15', appraisedValue: 4200.00, previousValue: 4100.00, changePercent: 2.4, appraiser: 'Dr. Sarah Chen', method: 'Comparable Sales' },
  { id: 'ah-10', cardAppraisalId: 'ca-8', cardName: '1993 SP Derek Jeter Foil #279', appraisalDate: '2026-02-20', appraisedValue: 22000.00, previousValue: 21000.00, changePercent: 4.8, appraiser: 'Michael Torres', method: 'Auction Result Analysis' },
  { id: 'ah-11', cardAppraisalId: 'ca-12', cardName: '1955 Topps Roberto Clemente RC #164', appraisalDate: '2026-01-28', appraisedValue: 28000.00, previousValue: 26500.00, changePercent: 5.7, appraiser: 'Dr. Sarah Chen', method: 'Comparable Sales' },
  { id: 'ah-12', cardAppraisalId: 'ca-17', cardName: '1954 Topps Hank Aaron RC #128', appraisalDate: '2026-01-15', appraisedValue: 42000.00, previousValue: 39000.00, changePercent: 7.7, appraiser: 'Michael Torres', method: 'Comparable Sales' },
  { id: 'ah-13', cardAppraisalId: 'ca-15', cardName: '1968 Topps Nolan Ryan RC #177', appraisalDate: '2026-02-10', appraisedValue: 15000.00, previousValue: 14200.00, changePercent: 5.6, appraiser: 'Dr. Sarah Chen', method: 'Market Analysis' },
  { id: 'ah-14', cardAppraisalId: 'ca-10', cardName: '2001 Chrome Ichiro Suzuki Refractor RC', appraisalDate: '2026-03-05', appraisedValue: 8500.00, previousValue: 8000.00, changePercent: 6.3, appraiser: 'AI Valuation Engine', method: 'Algorithmic Comparable Sales' },
  { id: 'ah-15', cardAppraisalId: 'ca-7', cardName: '2024 Bowman Chrome Ethan Salas 1st Auto', appraisalDate: '2026-03-14', appraisedValue: 1950.00, previousValue: 1600.00, changePercent: 21.9, appraiser: 'AI Valuation Engine', method: 'Algorithmic Market Analysis' },
  { id: 'ah-16', cardAppraisalId: 'ca-30', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', appraisalDate: '2026-03-13', appraisedValue: 1450.00, previousValue: 1200.00, changePercent: 20.8, appraiser: 'AI Valuation Engine', method: 'Prospect Hype Model' },
];

// ---- Mock Data: Risk Factors (10) ----

const MOCK_RISK_FACTORS: RiskFactor[] = [
  { id: 'rf-1', factorName: 'Market Bubble Risk', category: 'market', severity: 'high', description: 'Ultra-modern card prices may be inflated beyond sustainable levels driven by speculation.', mitigation: 'Diversify across eras and maintain no more than 30% in ultra-modern cards.', impactEstimate: 25.0 },
  { id: 'rf-2', factorName: 'Player Injury Risk', category: 'market', severity: 'medium', description: 'Career-threatening injuries can dramatically reduce card values for active players.', mitigation: 'Spread exposure across multiple players and maintain vintage allocation.', impactEstimate: 15.0 },
  { id: 'rf-3', factorName: 'Grading Company Risk', category: 'authentication', severity: 'low', description: 'Changes in grading standards or company reputation can affect slab premiums.', mitigation: 'Focus on PSA and BGS graded cards with established market acceptance.', impactEstimate: 8.0 },
  { id: 'rf-4', factorName: 'Storage Environment Risk', category: 'storage', severity: 'medium', description: 'Improper storage (humidity, temperature, light) can degrade card condition over time.', mitigation: 'Store in climate-controlled environment with UV-protective cases.', impactEstimate: 12.0 },
  { id: 'rf-5', factorName: 'Counterfeit Risk', category: 'authentication', severity: 'high', description: 'High-value raw cards face increasing counterfeit threats in the marketplace.', mitigation: 'Purchase only graded cards from reputable auction houses and dealers.', impactEstimate: 30.0 },
  { id: 'rf-6', factorName: 'Liquidity Risk', category: 'liquidity', severity: 'medium', description: 'High-value vintage cards may take weeks or months to sell at fair market value.', mitigation: 'Maintain liquid reserves and use consignment services with established auction houses.', impactEstimate: 10.0 },
  { id: 'rf-7', factorName: 'Condition Deterioration', category: 'condition', severity: 'low', description: 'Even slabbed cards can experience minor condition changes over extended periods.', mitigation: 'Inspect slabs annually and store upright in proper cases to minimize stress.', impactEstimate: 5.0 },
  { id: 'rf-8', factorName: 'Licensing Changes', category: 'market', severity: 'medium', description: 'Changes in sports card licensing (e.g., Panini losing NBA license) can affect brand values.', mitigation: 'Focus on the final-year products which often become more collectible.', impactEstimate: 12.0 },
  { id: 'rf-9', factorName: 'Concentration Risk', category: 'market', severity: 'high', description: 'Over-concentration in a single player or era exposes portfolio to outsized losses.', mitigation: 'Limit single-player exposure to 15% of total portfolio value.', impactEstimate: 20.0 },
  { id: 'rf-10', factorName: 'Natural Disaster Risk', category: 'storage', severity: 'critical', description: 'Fire, flood, or earthquake could destroy entire collection without proper safeguards.', mitigation: 'Maintain comprehensive insurance, use fireproof safe, and store scans of all cards.', impactEstimate: 100.0 },
];

// ---- Mock Data: Coverage Recommendations (6) ----

const MOCK_COVERAGE_RECOMMENDATIONS: CoverageRecommendation[] = [
  { id: 'cr-1', collectionValueRange: '$0 - $10,000', recommendedCoverage: 'Basic', estimatedPremium: 120.00, providerId: 'ic-1', providerName: 'CollectInsure', reasoning: 'Entry-level collections need basic fire and theft protection at minimal cost.' },
  { id: 'cr-2', collectionValueRange: '$10,000 - $50,000', recommendedCoverage: 'Standard', estimatedPremium: 285.00, providerId: 'ic-2', providerName: 'CollectInsure', reasoning: 'Mid-range collections benefit from broader peril coverage and lower deductibles.' },
  { id: 'cr-3', collectionValueRange: '$50,000 - $250,000', recommendedCoverage: 'Premium', estimatedPremium: 580.00, providerId: 'ic-3', providerName: 'CollectInsure', reasoning: 'Significant collections require comprehensive coverage including transit and accidental damage.' },
  { id: 'cr-4', collectionValueRange: '$250,000 - $1,000,000', recommendedCoverage: 'Collectors Elite', estimatedPremium: 1250.00, providerId: 'ic-4', providerName: 'CollectInsure', reasoning: 'High-value collections need all-risk coverage with zero deductible and worldwide transit protection.' },
  { id: 'cr-5', collectionValueRange: '$1,000,000 - $5,000,000', recommendedCoverage: 'Collectors Elite + Vault', estimatedPremium: 3500.00, providerId: 'ic-8', providerName: 'Slab Guard Pro', reasoning: 'Seven-figure collections require elite coverage plus professional vault storage recommendation.' },
  { id: 'cr-6', collectionValueRange: '$5,000,000+', recommendedCoverage: 'Custom Brokered Policy', estimatedPremium: 8500.00, providerId: 'ic-4', providerName: 'CollectInsure', reasoning: 'Museum-grade collections need custom policies with scheduled items and professional appraisal requirements.' },
];

// ---- Mock Data: Appraisal Certificates ----

const MOCK_APPRAISAL_CERTIFICATES: AppraisalCertificate[] = [
  { id: 'cert-1', reportId: 'ar-1', issuedDate: '2026-03-10', validUntil: '2027-03-10', appraiserName: 'Dr. Sarah Chen', appraiserCredentials: 'ASA Certified, USPAP Compliant', totalValue: 394475.00, methodology: 'Comparable Sales Analysis with Market Adjustment', digitalSignature: 'SHA256-8f3a2b...', verificationUrl: 'https://verify.msi-appraisals.com/CERT-2026-0310-001' },
  { id: 'cert-2', reportId: 'ar-3', issuedDate: '2026-02-15', validUntil: '2027-02-15', appraiserName: 'Michael Torres, MAI', appraiserCredentials: 'MAI Designated, IRS Qualified', totalValue: 394475.00, methodology: 'Fair Market Value per IRS Revenue Ruling 59-60', digitalSignature: 'SHA256-2c7f91...', verificationUrl: 'https://verify.msi-appraisals.com/CERT-2026-0215-003' },
  { id: 'cert-3', reportId: 'ar-4', issuedDate: '2026-01-20', validUntil: '2026-07-20', appraiserName: 'Dr. Sarah Chen', appraiserCredentials: 'ASA Certified, USPAP Compliant, IRS Panel', totalValue: 145000.00, methodology: 'IRS Qualified Appraisal for Charitable Contributions', digitalSignature: 'SHA256-5d1e88...', verificationUrl: 'https://verify.msi-appraisals.com/CERT-2026-0120-004' },
];

// ---- Mock Data: Collection Summary ----

const MOCK_COLLECTION_SUMMARY: CollectionSummary = {
  totalCards: 30,
  totalFairMarketValue: 394475.00,
  totalInsuranceValue: 512817.50,
  totalLiquidationValue: 295856.25,
  averageCardValue: 13149.17,
  medianCardValue: 1650.00,
  highestValueCard: '1952 Topps Mickey Mantle #311',
  highestValue: 185000.00,
  lowestValueCard: '2024 Panini Prizm Shai Gilgeous-Alexander RWB',
  lowestValue: 195.00,
  categoryBreakdown: [
    { category: 'Vintage (pre-1980)', count: 9, value: 334700.00 },
    { category: 'Modern (2010-present)', count: 10, value: 28910.00 },
    { category: 'Ultra-Modern (current year)', count: 8, value: 10715.00 },
    { category: 'Graded Gem Mint', count: 18, value: 248280.00 },
    { category: 'Raw/Ungraded', count: 0, value: 0.00 },
  ],
  gradeDistribution: [
    { grade: 'PSA 10', count: 16 },
    { grade: 'BGS 9.5', count: 3 },
    { grade: 'SGC 10', count: 1 },
    { grade: 'SGC 9.5', count: 1 },
    { grade: 'PSA 9', count: 3 },
    { grade: 'PSA 8', count: 2 },
    { grade: 'PSA 6', count: 1 },
    { grade: 'PSA 5', count: 1 },
    { grade: 'PSA 4', count: 2 },
    { grade: 'PSA 3', count: 1 },
  ],
  annualAppreciation: 7.8,
  lastAppraised: '2026-03-14',
};

// ---- Service Functions ----

export function getCardAppraisals(): CardAppraisal[] {
  const cached = loadData<CardAppraisal[]>('card_appraisals');
  if (cached) return cached;
  saveData('card_appraisals', MOCK_CARD_APPRAISALS);
  return MOCK_CARD_APPRAISALS;
}

export function getCardAppraisalById(id: string): CardAppraisal | null {
  const appraisals = getCardAppraisals();
  return appraisals.find(a => a.id === id) || null;
}

export function getAppraisalReports(): AppraisalReport[] {
  const cached = loadData<AppraisalReport[]>('appraisal_reports');
  if (cached) return cached;
  saveData('appraisal_reports', MOCK_APPRAISAL_REPORTS);
  return MOCK_APPRAISAL_REPORTS;
}

export function getAppraisalReportsByType(type: AppraisalType): AppraisalReport[] {
  const reports = getAppraisalReports();
  return reports.filter(r => r.appraisalType === type);
}

export function getInsuranceCoverage(): InsuranceCoverage[] {
  const cached = loadData<InsuranceCoverage[]>('insurance_coverage');
  if (cached) return cached;
  saveData('insurance_coverage', MOCK_INSURANCE_COVERAGE);
  return MOCK_INSURANCE_COVERAGE;
}

export function getDepreciationSchedules(): DepreciationSchedule[] {
  const cached = loadData<DepreciationSchedule[]>('depreciation_schedules');
  if (cached) return cached;
  saveData('depreciation_schedules', MOCK_DEPRECIATION_SCHEDULES);
  return MOCK_DEPRECIATION_SCHEDULES;
}

export function getReplacementCosts(): ReplacementCost[] {
  const cached = loadData<ReplacementCost[]>('replacement_costs');
  if (cached) return cached;
  saveData('replacement_costs', MOCK_REPLACEMENT_COSTS);
  return MOCK_REPLACEMENT_COSTS;
}

export function getComparableValues(): ComparableValue[] {
  const cached = loadData<ComparableValue[]>('comparable_values');
  if (cached) return cached;
  saveData('comparable_values', MOCK_COMPARABLE_VALUES);
  return MOCK_COMPARABLE_VALUES;
}

export function getComparablesByCardId(cardAppraisalId: string): ComparableValue[] {
  const comparables = getComparableValues();
  return comparables.filter(c => c.referenceCardId === cardAppraisalId);
}

export function getAppraisalHistory(): AppraisalHistory[] {
  const cached = loadData<AppraisalHistory[]>('appraisal_history');
  if (cached) return cached;
  saveData('appraisal_history', MOCK_APPRAISAL_HISTORY);
  return MOCK_APPRAISAL_HISTORY;
}

export function getCollectionSummary(): CollectionSummary {
  const cached = loadData<CollectionSummary>('collection_summary');
  if (cached) return cached;
  saveData('collection_summary', MOCK_COLLECTION_SUMMARY);
  return MOCK_COLLECTION_SUMMARY;
}

export function getRiskFactors(): RiskFactor[] {
  const cached = loadData<RiskFactor[]>('risk_factors');
  if (cached) return cached;
  saveData('risk_factors', MOCK_RISK_FACTORS);
  return MOCK_RISK_FACTORS;
}

export function getCoverageRecommendations(): CoverageRecommendation[] {
  const cached = loadData<CoverageRecommendation[]>('coverage_recommendations');
  if (cached) return cached;
  saveData('coverage_recommendations', MOCK_COVERAGE_RECOMMENDATIONS);
  return MOCK_COVERAGE_RECOMMENDATIONS;
}

export function getAppraisalCertificates(): AppraisalCertificate[] {
  const cached = loadData<AppraisalCertificate[]>('appraisal_certificates');
  if (cached) return cached;
  saveData('appraisal_certificates', MOCK_APPRAISAL_CERTIFICATES);
  return MOCK_APPRAISAL_CERTIFICATES;
}

export function getAppraisalsByCategory(category: CardAppraisal['category']): CardAppraisal[] {
  const appraisals = getCardAppraisals();
  return appraisals.filter(a => a.category === category);
}

export function getTopValueCards(limit: number): CardAppraisal[] {
  const appraisals = getCardAppraisals();
  return [...appraisals].sort((a, b) => b.fairMarketValue - a.fairMarketValue).slice(0, limit);
}

export function getRecommendedCoverage(collectionValue: number): CoverageRecommendation | null {
  const recommendations = getCoverageRecommendations();
  if (collectionValue < 10000) return recommendations[0];
  if (collectionValue < 50000) return recommendations[1];
  if (collectionValue < 250000) return recommendations[2];
  if (collectionValue < 1000000) return recommendations[3];
  if (collectionValue < 5000000) return recommendations[4];
  return recommendations[5];
}
