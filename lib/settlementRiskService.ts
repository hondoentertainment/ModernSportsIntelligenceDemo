// Settlement Risk Dashboard Service — Phase 13
// Track counterparty settlement reliability and failure rates

export interface SettlementRisk {
  id: string;
  counterparty: string;
  type: 'buyer' | 'seller' | 'dealer' | 'platform';
  reliabilityScore: number;
  totalTransactions: number;
  completedOnTime: number;
  lateSettlements: number;
  failedSettlements: number;
  avgSettlementDays: number;
  disputeRate: number;
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  lastTransaction: string;
}

export interface CounterpartyReliability {
  id: string;
  counterparty: string;
  month: string;
  onTimeRate: number;
  disputeRate: number;
  avgResponseTime: number;
  volumeProcessed: number;
}

export interface FailureEvent {
  id: string;
  counterparty: string;
  type: string;
  date: string;
  transactionValue: number;
  failureReason: string;
  resolution: string;
  daysToResolve: number;
  recovered: boolean;
  recoveredAmount: number;
}

export interface RiskScore {
  category: string;
  avgScore: number;
  totalCounterparties: number;
  highRiskCount: number;
  failureRate: number;
  trend: 'improving' | 'worsening' | 'stable';
}

const MOCK_RISKS: SettlementRisk[] = [
  { id: 'sr-1', counterparty: 'CardKingCollectors', type: 'dealer', reliabilityScore: 98, totalTransactions: 1245, completedOnTime: 1220, lateSettlements: 20, failedSettlements: 5, avgSettlementDays: 2.1, disputeRate: 0.4, riskLevel: 'minimal', lastTransaction: '2026-04-18' },
  { id: 'sr-2', counterparty: 'PremiumSlabsCo', type: 'dealer', reliabilityScore: 95, totalTransactions: 892, completedOnTime: 848, lateSettlements: 35, failedSettlements: 9, avgSettlementDays: 2.8, disputeRate: 1.0, riskLevel: 'low', lastTransaction: '2026-04-17' },
  { id: 'sr-3', counterparty: 'VintageVaultDeals', type: 'dealer', reliabilityScore: 88, totalTransactions: 456, completedOnTime: 401, lateSettlements: 42, failedSettlements: 13, avgSettlementDays: 4.2, disputeRate: 2.9, riskLevel: 'moderate', lastTransaction: '2026-04-16' },
  { id: 'sr-4', counterparty: 'user_flipmaster22', type: 'seller', reliabilityScore: 72, totalTransactions: 328, completedOnTime: 236, lateSettlements: 68, failedSettlements: 24, avgSettlementDays: 6.8, disputeRate: 7.3, riskLevel: 'high', lastTransaction: '2026-04-15' },
  { id: 'sr-5', counterparty: 'EliteCardGroup', type: 'dealer', reliabilityScore: 96, totalTransactions: 2100, completedOnTime: 2016, lateSettlements: 63, failedSettlements: 21, avgSettlementDays: 2.4, disputeRate: 1.0, riskLevel: 'low', lastTransaction: '2026-04-18' },
  { id: 'sr-6', counterparty: 'user_hobbynovice99', type: 'buyer', reliabilityScore: 65, totalTransactions: 45, completedOnTime: 29, lateSettlements: 12, failedSettlements: 4, avgSettlementDays: 8.5, disputeRate: 8.9, riskLevel: 'high', lastTransaction: '2026-04-12' },
  { id: 'sr-7', counterparty: 'GoldinAuctions', type: 'platform', reliabilityScore: 99, totalTransactions: 28500, completedOnTime: 28215, lateSettlements: 228, failedSettlements: 57, avgSettlementDays: 1.8, disputeRate: 0.2, riskLevel: 'minimal', lastTransaction: '2026-04-18' },
  { id: 'sr-8', counterparty: 'PWCCMarketplace', type: 'platform', reliabilityScore: 97, totalTransactions: 45200, completedOnTime: 43844, lateSettlements: 1130, failedSettlements: 226, avgSettlementDays: 2.2, disputeRate: 0.5, riskLevel: 'minimal', lastTransaction: '2026-04-18' },
  { id: 'sr-9', counterparty: 'user_cardshark_tx', type: 'seller', reliabilityScore: 82, totalTransactions: 189, completedOnTime: 155, lateSettlements: 28, failedSettlements: 6, avgSettlementDays: 5.1, disputeRate: 3.2, riskLevel: 'moderate', lastTransaction: '2026-04-14' },
  { id: 'sr-10', counterparty: 'MidwestCardShop', type: 'dealer', reliabilityScore: 93, totalTransactions: 678, completedOnTime: 630, lateSettlements: 41, failedSettlements: 7, avgSettlementDays: 3.0, disputeRate: 1.0, riskLevel: 'low', lastTransaction: '2026-04-17' },
  { id: 'sr-11', counterparty: 'user_newcollector2025', type: 'buyer', reliabilityScore: 58, totalTransactions: 22, completedOnTime: 13, lateSettlements: 7, failedSettlements: 2, avgSettlementDays: 9.2, disputeRate: 9.1, riskLevel: 'critical', lastTransaction: '2026-04-08' },
  { id: 'sr-12', counterparty: 'HeritageAuctions', type: 'platform', reliabilityScore: 99, totalTransactions: 18900, completedOnTime: 18711, lateSettlements: 151, failedSettlements: 38, avgSettlementDays: 1.5, disputeRate: 0.2, riskLevel: 'minimal', lastTransaction: '2026-04-18' },
  { id: 'sr-13', counterparty: 'TopDeckTrading', type: 'dealer', reliabilityScore: 91, totalTransactions: 534, completedOnTime: 486, lateSettlements: 37, failedSettlements: 11, avgSettlementDays: 3.4, disputeRate: 2.1, riskLevel: 'low', lastTransaction: '2026-04-16' },
  { id: 'sr-14', counterparty: 'user_quickflip_joe', type: 'seller', reliabilityScore: 76, totalTransactions: 412, completedOnTime: 313, lateSettlements: 78, failedSettlements: 21, avgSettlementDays: 5.8, disputeRate: 5.1, riskLevel: 'high', lastTransaction: '2026-04-13' },
  { id: 'sr-15', counterparty: 'SouthernCardsLLC', type: 'dealer', reliabilityScore: 94, totalTransactions: 1890, completedOnTime: 1777, lateSettlements: 95, failedSettlements: 18, avgSettlementDays: 2.6, disputeRate: 1.0, riskLevel: 'low', lastTransaction: '2026-04-17' },
];

const MOCK_RELIABILITY: CounterpartyReliability[] = [
  { id: 'cr-1', counterparty: 'CardKingCollectors', month: 'Jan', onTimeRate: 97, disputeRate: 0.5, avgResponseTime: 4.2, volumeProcessed: 185000 },
  { id: 'cr-2', counterparty: 'CardKingCollectors', month: 'Feb', onTimeRate: 98, disputeRate: 0.3, avgResponseTime: 3.8, volumeProcessed: 198000 },
  { id: 'cr-3', counterparty: 'CardKingCollectors', month: 'Mar', onTimeRate: 99, disputeRate: 0.2, avgResponseTime: 3.5, volumeProcessed: 215000 },
  { id: 'cr-4', counterparty: 'CardKingCollectors', month: 'Apr', onTimeRate: 98, disputeRate: 0.4, avgResponseTime: 3.6, volumeProcessed: 142000 },
  { id: 'cr-5', counterparty: 'user_flipmaster22', month: 'Jan', onTimeRate: 78, disputeRate: 5.2, avgResponseTime: 18.5, volumeProcessed: 12000 },
  { id: 'cr-6', counterparty: 'user_flipmaster22', month: 'Feb', onTimeRate: 72, disputeRate: 7.8, avgResponseTime: 22.1, volumeProcessed: 9500 },
  { id: 'cr-7', counterparty: 'user_flipmaster22', month: 'Mar', onTimeRate: 68, disputeRate: 8.5, avgResponseTime: 24.8, volumeProcessed: 8200 },
  { id: 'cr-8', counterparty: 'user_flipmaster22', month: 'Apr', onTimeRate: 65, disputeRate: 9.1, avgResponseTime: 28.0, volumeProcessed: 5800 },
];

const MOCK_FAILURES: FailureEvent[] = [
  { id: 'fe-1', counterparty: 'user_flipmaster22', type: 'Non-delivery', date: '2026-04-15', transactionValue: 2800, failureReason: 'Seller failed to ship within 5-day window', resolution: 'Full refund issued via platform guarantee', daysToResolve: 12, recovered: true, recoveredAmount: 2800 },
  { id: 'fe-2', counterparty: 'user_hobbynovice99', type: 'Payment failure', date: '2026-04-12', transactionValue: 450, failureReason: 'Payment reversed after card shipped', resolution: 'Pending dispute resolution', daysToResolve: 0, recovered: false, recoveredAmount: 0 },
  { id: 'fe-3', counterparty: 'VintageVaultDeals', type: 'Condition mismatch', date: '2026-04-10', transactionValue: 8500, failureReason: 'Card condition significantly worse than described in listing', resolution: 'Partial refund of $2,125 agreed upon', daysToResolve: 8, recovered: true, recoveredAmount: 2125 },
  { id: 'fe-4', counterparty: 'user_quickflip_joe', type: 'Non-delivery', date: '2026-04-08', transactionValue: 1200, failureReason: 'Package lost in transit, no tracking provided', resolution: 'Full refund through eBay Money Back Guarantee', daysToResolve: 15, recovered: true, recoveredAmount: 1200 },
  { id: 'fe-5', counterparty: 'user_newcollector2025', type: 'Payment failure', date: '2026-04-05', transactionValue: 680, failureReason: 'Insufficient funds, payment bounced', resolution: 'Transaction cancelled, card relisted', daysToResolve: 5, recovered: false, recoveredAmount: 0 },
  { id: 'fe-6', counterparty: 'user_cardshark_tx', type: 'Authentication dispute', date: '2026-03-28', transactionValue: 15000, failureReason: 'Buyer disputed authenticity of grading slab', resolution: 'Independent re-authentication confirmed genuine', daysToResolve: 22, recovered: true, recoveredAmount: 15000 },
  { id: 'fe-7', counterparty: 'user_flipmaster22', type: 'Wrong item shipped', date: '2026-03-20', transactionValue: 3400, failureReason: 'Received different card than purchased', resolution: 'Return and full refund processed', daysToResolve: 18, recovered: true, recoveredAmount: 3400 },
  { id: 'fe-8', counterparty: 'VintageVaultDeals', type: 'Late settlement', date: '2026-03-15', transactionValue: 22000, failureReason: 'Payment held for 30 days beyond agreed terms', resolution: 'Payment eventually received with 5% late fee', daysToResolve: 35, recovered: true, recoveredAmount: 23100 },
];

const MOCK_RISK_SCORES: RiskScore[] = [
  { category: 'Platforms', avgScore: 98.3, totalCounterparties: 3, highRiskCount: 0, failureRate: 0.3, trend: 'stable' },
  { category: 'Dealers', avgScore: 93.6, totalCounterparties: 6, highRiskCount: 0, failureRate: 1.4, trend: 'improving' },
  { category: 'Individual Sellers', avgScore: 76.7, totalCounterparties: 3, highRiskCount: 2, failureRate: 5.2, trend: 'worsening' },
  { category: 'Individual Buyers', avgScore: 61.5, totalCounterparties: 2, highRiskCount: 1, failureRate: 9.0, trend: 'worsening' },
];

export function getSettlementRisks(): SettlementRisk[] { return [...MOCK_RISKS]; }
export function getCounterpartyReliability(): CounterpartyReliability[] { return [...MOCK_RELIABILITY]; }
export function getFailureEvents(): FailureEvent[] { return [...MOCK_FAILURES]; }
export function getRiskScores(): RiskScore[] { return [...MOCK_RISK_SCORES]; }
export function getHighRiskCount(): number { return MOCK_RISKS.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length; }
export function getAvgReliability(): number { return Math.round(MOCK_RISKS.reduce((sum, r) => sum + r.reliabilityScore, 0) / MOCK_RISKS.length); }
export function getTotalFailures(): number { return MOCK_FAILURES.length; }
export function getRecoveryRate(): number { return Math.round((MOCK_FAILURES.filter(f => f.recovered).length / MOCK_FAILURES.length) * 100); }
