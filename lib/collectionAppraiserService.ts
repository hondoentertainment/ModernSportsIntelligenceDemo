// Phase 150: AI Collection Appraiser & Insurance Valuation

export type AppraisalType = 'quick' | 'standard' | 'insurance' | 'estate' | 'tax';

export interface AppraisalReport {
  id: string; type: AppraisalType; date: string; totalCards: number;
  totalFairMarketValue: number; totalInsuranceValue: number; totalReplacementCost: number;
  avgCondition: number; riskScore: number; status: 'complete' | 'pending' | 'expired';
}

export interface CardAppraisal {
  id: string; cardName: string; player: string; year: number; set: string; grade: string;
  fairMarketValue: number; insuranceValue: number; replacementCost: number;
  depreciationRate: number; condition: number; lastAppraised: string; category: string;
}

export interface InsuranceCoverage {
  id: string; provider: string; type: string; premium: number; deductible: number;
  maxCoverage: number; coveredPerils: string[]; rating: number; recommended: boolean;
}

export interface DepreciationSchedule { category: string; year1: number; year3: number; year5: number; year10: number; }
export interface ReplacementCost { cardId: string; currentCost: number; estimatedWait: string; availability: string; }
export interface ComparableValue { id: string; cardName: string; platform: string; salePrice: number; saleDate: string; grade: string; }
export interface AppraisalHistory { id: string; date: string; totalValue: number; cardCount: number; type: AppraisalType; }
export interface CollectionSummary { totalCards: number; totalValue: number; avgAge: number; topCategory: string; riskLevel: string; }
export interface RiskFactor { id: string; name: string; severity: string; description: string; mitigation: string; impact: number; }
export interface CoverageRecommendation { id: string; provider: string; reason: string; savings: number; coverage: number; }
export interface AppraisalCertificate { id: string; reportId: string; issuedDate: string; expiryDate: string; certNumber: string; }

const STORAGE_KEY = 'msi_collection_appraiser';
function loadData<T>(key: string): T | null { try { const r = localStorage.getItem(`${STORAGE_KEY}_${key}`); return r ? JSON.parse(r) as T : null; } catch { return null; } }
function saveData<T>(key: string, data: T): void { try { localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data)); } catch {} }

const REPORTS: AppraisalReport[] = [
  { id: 'ar_001', type: 'insurance', date: '2026-03-10', totalCards: 245, totalFairMarketValue: 187500, totalInsuranceValue: 225000, totalReplacementCost: 262500, avgCondition: 8.2, riskScore: 23, status: 'complete' },
  { id: 'ar_002', type: 'quick', date: '2026-03-01', totalCards: 50, totalFairMarketValue: 12800, totalInsuranceValue: 15360, totalReplacementCost: 17920, avgCondition: 7.8, riskScore: 35, status: 'complete' },
  { id: 'ar_003', type: 'estate', date: '2026-02-15', totalCards: 1200, totalFairMarketValue: 425000, totalInsuranceValue: 510000, totalReplacementCost: 595000, avgCondition: 6.5, riskScore: 42, status: 'complete' },
  { id: 'ar_004', type: 'tax', date: '2026-01-20', totalCards: 180, totalFairMarketValue: 95000, totalInsuranceValue: 114000, totalReplacementCost: 133000, avgCondition: 8.7, riskScore: 18, status: 'complete' },
  { id: 'ar_005', type: 'standard', date: '2026-03-14', totalCards: 75, totalFairMarketValue: 28500, totalInsuranceValue: 34200, totalReplacementCost: 39900, avgCondition: 9.1, riskScore: 12, status: 'pending' },
];

const APPRAISALS: CardAppraisal[] = [
  { id: 'ca_001', cardName: '2003 Topps Chrome LeBron James RC PSA 10', player: 'LeBron James', year: 2003, set: 'Topps Chrome', grade: 'PSA 10', fairMarketValue: 45000, insuranceValue: 54000, replacementCost: 63000, depreciationRate: -2.1, condition: 10, lastAppraised: '2026-03-10', category: 'Modern' },
  { id: 'ca_002', cardName: '1986 Fleer Michael Jordan RC PSA 9', player: 'Michael Jordan', year: 1986, set: 'Fleer', grade: 'PSA 9', fairMarketValue: 35000, insuranceValue: 42000, replacementCost: 49000, depreciationRate: 1.5, condition: 9, lastAppraised: '2026-03-10', category: 'Vintage' },
  { id: 'ca_003', cardName: '2018 Topps Chrome Ohtani RC PSA 10', player: 'Shohei Ohtani', year: 2018, set: 'Topps Chrome', grade: 'PSA 10', fairMarketValue: 1200, insuranceValue: 1440, replacementCost: 1680, depreciationRate: 5.2, condition: 10, lastAppraised: '2026-03-08', category: 'Modern' },
  { id: 'ca_004', cardName: '2023 Topps Chrome Wembanyama RC PSA 10', player: 'Victor Wembanyama', year: 2023, set: 'Topps Chrome', grade: 'PSA 10', fairMarketValue: 2850, insuranceValue: 3420, replacementCost: 3990, depreciationRate: 12.5, condition: 10, lastAppraised: '2026-03-12', category: 'Modern' },
  { id: 'ca_005', cardName: '1952 Topps Mickey Mantle #311 PSA 5', player: 'Mickey Mantle', year: 1952, set: 'Topps', grade: 'PSA 5', fairMarketValue: 125000, insuranceValue: 150000, replacementCost: 175000, depreciationRate: -8.2, condition: 5, lastAppraised: '2026-02-28', category: 'Pre-War' },
  { id: 'ca_006', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', year: 2020, set: 'Prizm', grade: 'PSA 10', fairMarketValue: 450, insuranceValue: 540, replacementCost: 630, depreciationRate: -5.8, condition: 10, lastAppraised: '2026-03-05', category: 'Modern' },
  { id: 'ca_007', cardName: '2018 National Treasures Luka Doncic RPA /99', player: 'Luka Doncic', year: 2018, set: 'National Treasures', grade: 'BGS 9.5', fairMarketValue: 125000, insuranceValue: 150000, replacementCost: 175000, depreciationRate: 3.2, condition: 9.5, lastAppraised: '2026-03-10', category: 'Modern' },
  { id: 'ca_008', cardName: '2011 Topps Update Mike Trout RC PSA 10', player: 'Mike Trout', year: 2011, set: 'Topps Update', grade: 'PSA 10', fairMarketValue: 65000, insuranceValue: 78000, replacementCost: 91000, depreciationRate: -1.8, condition: 10, lastAppraised: '2026-03-09', category: 'Modern' },
  { id: 'ca_009', cardName: '1993 SP Derek Jeter Foil PSA 10', player: 'Derek Jeter', year: 1993, set: 'SP', grade: 'PSA 10', fairMarketValue: 42000, insuranceValue: 50400, replacementCost: 58800, depreciationRate: -0.5, condition: 10, lastAppraised: '2026-02-25', category: 'Vintage' },
  { id: 'ca_010', cardName: '2017 National Treasures Mahomes RPA /99', player: 'Patrick Mahomes', year: 2017, set: 'National Treasures', grade: 'BGS 9', fairMarketValue: 95000, insuranceValue: 114000, replacementCost: 133000, depreciationRate: 2.8, condition: 9, lastAppraised: '2026-03-11', category: 'Modern' },
  { id: 'ca_011', cardName: '1989 Upper Deck Ken Griffey Jr RC PSA 10', player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', grade: 'PSA 10', fairMarketValue: 5500, insuranceValue: 6600, replacementCost: 7700, depreciationRate: -0.2, condition: 10, lastAppraised: '2026-03-02', category: 'Vintage' },
  { id: 'ca_012', cardName: '2023 Bowman Chrome Ethan Salas 1st PSA 10', player: 'Ethan Salas', year: 2023, set: 'Bowman Chrome', grade: 'PSA 10', fairMarketValue: 180, insuranceValue: 216, replacementCost: 252, depreciationRate: 18.5, condition: 10, lastAppraised: '2026-03-07', category: 'Modern' },
  { id: 'ca_013', cardName: '2020 Prizm Lamelo Ball RC PSA 10', player: 'Lamelo Ball', year: 2020, set: 'Prizm', grade: 'PSA 10', fairMarketValue: 850, insuranceValue: 1020, replacementCost: 1190, depreciationRate: -8.5, condition: 10, lastAppraised: '2026-03-04', category: 'Modern' },
  { id: 'ca_014', cardName: '2001 Topps Chrome Albert Pujols RC PSA 10', player: 'Albert Pujols', year: 2001, set: 'Topps Chrome', grade: 'PSA 10', fairMarketValue: 8500, insuranceValue: 10200, replacementCost: 11900, depreciationRate: -1.2, condition: 10, lastAppraised: '2026-02-15', category: 'Modern' },
  { id: 'ca_015', cardName: '2019 Prizm Zion Williamson RC PSA 10', player: 'Zion Williamson', year: 2019, set: 'Prizm', grade: 'PSA 10', fairMarketValue: 280, insuranceValue: 336, replacementCost: 392, depreciationRate: -22.5, condition: 10, lastAppraised: '2026-02-20', category: 'Modern' },
];

const INSURANCE: InsuranceCoverage[] = [
  { id: 'ic_001', provider: 'Collectibles Insurance Services', type: 'Comprehensive', premium: 125, deductible: 250, maxCoverage: 250000, coveredPerils: ['theft', 'fire', 'flood', 'accidental damage', 'shipping'], rating: 4.8, recommended: true },
  { id: 'ic_002', provider: 'American Collectors Insurance', type: 'Standard', premium: 95, deductible: 500, maxCoverage: 150000, coveredPerils: ['theft', 'fire', 'flood', 'accidental damage'], rating: 4.5, recommended: false },
  { id: 'ic_003', provider: 'Lloyds of London', type: 'Premium', premium: 350, deductible: 1000, maxCoverage: 1000000, coveredPerils: ['theft', 'fire', 'flood', 'accidental damage', 'shipping', 'market decline', 'grading error'], rating: 4.9, recommended: true },
  { id: 'ic_004', provider: 'State Farm Rider', type: 'Basic', premium: 45, deductible: 1000, maxCoverage: 50000, coveredPerils: ['theft', 'fire'], rating: 3.8, recommended: false },
];

const RISK_FACTORS: RiskFactor[] = [
  { id: 'rf_001', name: 'Storage Conditions', severity: 'medium', description: 'Cards not stored in climate-controlled environment', mitigation: 'Move high-value cards to controlled storage', impact: 15 },
  { id: 'rf_002', name: 'Concentration Risk', severity: 'high', description: '45% of collection value in single player (LeBron James)', mitigation: 'Diversify holdings across players and sports', impact: 25 },
  { id: 'rf_003', name: 'Insurance Gap', severity: 'critical', description: 'Current coverage $150K below estimated replacement cost', mitigation: 'Upgrade insurance policy or add rider', impact: 35 },
  { id: 'rf_004', name: 'Appraisal Currency', severity: 'low', description: '12 cards have appraisals older than 12 months', mitigation: 'Schedule reappraisal for outdated items', impact: 8 },
  { id: 'rf_005', name: 'Market Volatility', severity: 'medium', description: 'Modern cards showing 15% avg price decline over 6 months', mitigation: 'Consider selling volatile positions or hedging', impact: 18 },
];

const DEPRECIATION: DepreciationSchedule[] = [
  { category: 'Modern Chrome RC', year1: -8, year3: -15, year5: -25, year10: -40 },
  { category: 'Modern Prizm RC', year1: -12, year3: -22, year5: -35, year10: -50 },
  { category: 'Vintage Pre-1980', year1: 3, year3: 12, year5: 25, year10: 60 },
  { category: 'Graded Gem Mint', year1: -5, year3: -10, year5: -15, year10: -20 },
  { category: 'Auto/Relic', year1: -15, year3: -30, year5: -45, year10: -60 },
  { category: 'HOF Veterans', year1: 2, year3: 8, year5: 18, year10: 35 },
];

export function getAppraisalReports(): AppraisalReport[] { const c = loadData<AppraisalReport[]>('reports'); if (c && c.length > 0) return c; saveData('reports', REPORTS); return REPORTS; }
export function getCardAppraisals(): CardAppraisal[] { const c = loadData<CardAppraisal[]>('appraisals'); if (c && c.length > 0) return c; saveData('appraisals', APPRAISALS); return APPRAISALS; }
export function getInsuranceCoverage(): InsuranceCoverage[] { const c = loadData<InsuranceCoverage[]>('insurance'); if (c && c.length > 0) return c; saveData('insurance', INSURANCE); return INSURANCE; }
export function getDepreciationSchedules(): DepreciationSchedule[] { return DEPRECIATION; }
export function getRiskFactors(): RiskFactor[] { const c = loadData<RiskFactor[]>('risks'); if (c && c.length > 0) return c; saveData('risks', RISK_FACTORS); return RISK_FACTORS; }
export function getCollectionSummary(): CollectionSummary { const a = getCardAppraisals(); return { totalCards: a.length, totalValue: a.reduce((s, c) => s + c.fairMarketValue, 0), avgAge: Math.round(a.reduce((s, c) => s + (2026 - c.year), 0) / a.length), topCategory: 'Modern', riskLevel: 'Medium' }; }
export function getComparableValues(cardId?: string): ComparableValue[] { return [{ id: 'cv_001', cardName: 'LeBron James RC PSA 10', platform: 'eBay', salePrice: 44500, saleDate: '2026-03-08', grade: 'PSA 10' }, { id: 'cv_002', cardName: 'LeBron James RC PSA 10', platform: 'PWCC', salePrice: 46200, saleDate: '2026-02-28', grade: 'PSA 10' }, { id: 'cv_003', cardName: 'LeBron James RC PSA 10', platform: 'Goldin', salePrice: 43800, saleDate: '2026-02-15', grade: 'PSA 10' }]; }
export function getCoverageRecommendations(): CoverageRecommendation[] { return [{ id: 'cr_001', provider: 'CIS', reason: 'Best coverage-to-premium ratio for collections under $500K', savings: 2400, coverage: 250000 }, { id: 'cr_002', provider: 'Lloyds', reason: 'Essential for high-value vintage cards with market decline coverage', savings: 0, coverage: 1000000 }]; }
export function getAppraisalHistory(): AppraisalHistory[] { return [{ id: 'ah_001', date: '2026-03-10', totalValue: 187500, cardCount: 245, type: 'insurance' }, { id: 'ah_002', date: '2025-12-15', totalValue: 195000, cardCount: 230, type: 'standard' }, { id: 'ah_003', date: '2025-09-01', totalValue: 178000, cardCount: 215, type: 'insurance' }, { id: 'ah_004', date: '2025-06-10', totalValue: 205000, cardCount: 210, type: 'quick' }]; }
export function getAppraisalCertificates(): AppraisalCertificate[] { return REPORTS.filter(r => r.status === 'complete').map(r => ({ id: `cert_${r.id}`, reportId: r.id, issuedDate: r.date, expiryDate: '2027-03-10', certNumber: `MSI-${r.id.replace('ar_', '')}-2026` })); }
export function getReplacementCosts(): ReplacementCost[] { return APPRAISALS.slice(0, 8).map(a => ({ cardId: a.id, currentCost: a.replacementCost, estimatedWait: a.category === 'Pre-War' ? '6-12 months' : '1-4 weeks', availability: a.fairMarketValue > 50000 ? 'Rare' : a.fairMarketValue > 10000 ? 'Limited' : 'Available' })); }
export function getAppraisalTypeConfig(type: AppraisalType): { label: string; text: string; bg: string; border: string } {
  const m: Record<AppraisalType, { label: string; text: string; bg: string; border: string }> = {
    quick: { label: 'Quick', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    standard: { label: 'Standard', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    insurance: { label: 'Insurance', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    estate: { label: 'Estate', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    tax: { label: 'Tax', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  }; return m[type];
}
export function formatCurrency(amount: number): string { if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`; if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`; return `$${amount.toLocaleString()}`; }
export function generateReport(type: AppraisalType): AppraisalReport { return REPORTS.find(r => r.type === type) ?? REPORTS[0]; }
export function calculateTotalInsuranceValue(): number { return getCardAppraisals().reduce((s, c) => s + c.insuranceValue, 0); }
