// Dark Pool Signal Detector Service — Phase 13
// Off-market/private deal flow detection for sports cards

export interface DarkPoolSignal {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  signalType: 'block-trade' | 'private-sale' | 'off-market-transfer' | 'dealer-network' | 'whale-accumulation';
  confidenceScore: number;
  estimatedValue: number;
  detectedAt: string;
  venue: string;
  volumeAnomaly: number;
  priceImpact: number;
  status: 'active' | 'confirmed' | 'expired' | 'investigating';
}

export interface PrivateDealFlow {
  id: string;
  dealType: string;
  parties: number;
  totalValue: number;
  cardsInvolved: number;
  avgPremium: number;
  flowDirection: 'accumulation' | 'distribution' | 'neutral';
  detectedDate: string;
  category: string;
}

export interface SignalConfidence {
  signalId: string;
  algorithmScore: number;
  volumeEvidence: number;
  priceEvidence: number;
  networkEvidence: number;
  historicalAccuracy: number;
  overallConfidence: number;
}

export interface DarkPoolHistory {
  month: string;
  signalsDetected: number;
  confirmed: number;
  falsePositives: number;
  estimatedVolume: number;
  avgConfidence: number;
}

const MOCK_SIGNALS: DarkPoolSignal[] = [
  { id: 'dps-1', cardName: '2003 Topps Chrome LeBron James RC #111', player: 'LeBron James', sport: 'Basketball', signalType: 'block-trade', confidenceScore: 94, estimatedValue: 285000, detectedAt: '2026-04-18T08:15:00Z', venue: 'Private Network', volumeAnomaly: 3.8, priceImpact: 12.4, status: 'active' },
  { id: 'dps-2', cardName: '2018 Panini National Treasures Luka Doncic RPA', player: 'Luka Doncic', sport: 'Basketball', signalType: 'whale-accumulation', confidenceScore: 87, estimatedValue: 142000, detectedAt: '2026-04-18T07:42:00Z', venue: 'Dealer Channel', volumeAnomaly: 2.9, priceImpact: 8.7, status: 'active' },
  { id: 'dps-3', cardName: '1952 Topps Mickey Mantle #311 PSA 6', player: 'Mickey Mantle', sport: 'Baseball', signalType: 'private-sale', confidenceScore: 91, estimatedValue: 890000, detectedAt: '2026-04-17T22:10:00Z', venue: 'Heritage Private Treaty', volumeAnomaly: 1.2, priceImpact: 5.3, status: 'confirmed' },
  { id: 'dps-4', cardName: '2020 Panini Prizm Justin Herbert RC Auto', player: 'Justin Herbert', sport: 'Football', signalType: 'dealer-network', confidenceScore: 78, estimatedValue: 18500, detectedAt: '2026-04-17T19:30:00Z', venue: 'Multi-Dealer', volumeAnomaly: 4.1, priceImpact: 15.2, status: 'investigating' },
  { id: 'dps-5', cardName: '1986 Fleer Michael Jordan RC #57 PSA 9', player: 'Michael Jordan', sport: 'Basketball', signalType: 'off-market-transfer', confidenceScore: 96, estimatedValue: 42000, detectedAt: '2026-04-17T16:55:00Z', venue: 'Direct Transfer', volumeAnomaly: 1.5, priceImpact: 3.1, status: 'confirmed' },
  { id: 'dps-6', cardName: '2022 Bowman Chrome Victor Wembanyama 1st Auto', player: 'Victor Wembanyama', sport: 'Basketball', signalType: 'whale-accumulation', confidenceScore: 82, estimatedValue: 67000, detectedAt: '2026-04-17T14:20:00Z', venue: 'Private Network', volumeAnomaly: 5.2, priceImpact: 22.1, status: 'active' },
  { id: 'dps-7', cardName: '2001 SP Authentic Tiger Woods RC Auto', player: 'Tiger Woods', sport: 'Golf', signalType: 'block-trade', confidenceScore: 88, estimatedValue: 195000, detectedAt: '2026-04-17T11:05:00Z', venue: 'PWCC Vault', volumeAnomaly: 2.3, priceImpact: 9.6, status: 'confirmed' },
  { id: 'dps-8', cardName: '2019 Bowman Chrome Julio Rodriguez 1st Auto', player: 'Julio Rodriguez', sport: 'Baseball', signalType: 'private-sale', confidenceScore: 73, estimatedValue: 8200, detectedAt: '2026-04-16T20:45:00Z', venue: 'Direct Sale', volumeAnomaly: 1.8, priceImpact: 6.4, status: 'expired' },
  { id: 'dps-9', cardName: '2018 Panini Prizm Trae Young Silver RC', player: 'Trae Young', sport: 'Basketball', signalType: 'dealer-network', confidenceScore: 69, estimatedValue: 4800, detectedAt: '2026-04-16T18:30:00Z', venue: 'Dealer Channel', volumeAnomaly: 3.4, priceImpact: 11.8, status: 'investigating' },
  { id: 'dps-10', cardName: '2020 Panini Flawless Joe Burrow RPA', player: 'Joe Burrow', sport: 'Football', signalType: 'whale-accumulation', confidenceScore: 85, estimatedValue: 35000, detectedAt: '2026-04-16T15:15:00Z', venue: 'Private Network', volumeAnomaly: 2.7, priceImpact: 13.5, status: 'active' },
  { id: 'dps-11', cardName: '1993 SP Foil Derek Jeter RC #279', player: 'Derek Jeter', sport: 'Baseball', signalType: 'off-market-transfer', confidenceScore: 92, estimatedValue: 78000, detectedAt: '2026-04-16T12:00:00Z', venue: 'Heritage Private Treaty', volumeAnomaly: 1.1, priceImpact: 2.8, status: 'confirmed' },
  { id: 'dps-12', cardName: '2023 Topps Chrome Elly De La Cruz Auto', player: 'Elly De La Cruz', sport: 'Baseball', signalType: 'block-trade', confidenceScore: 76, estimatedValue: 12500, detectedAt: '2026-04-15T21:40:00Z', venue: 'Multi-Dealer', volumeAnomaly: 3.9, priceImpact: 17.3, status: 'investigating' },
  { id: 'dps-13', cardName: '2017 Panini National Treasures Patrick Mahomes RPA', player: 'Patrick Mahomes', sport: 'Football', signalType: 'private-sale', confidenceScore: 95, estimatedValue: 425000, detectedAt: '2026-04-15T17:20:00Z', venue: 'Direct Transfer', volumeAnomaly: 1.4, priceImpact: 4.7, status: 'confirmed' },
  { id: 'dps-14', cardName: '2019 Panini Prizm Zion Williamson Silver RC', player: 'Zion Williamson', sport: 'Basketball', signalType: 'dealer-network', confidenceScore: 71, estimatedValue: 6200, detectedAt: '2026-04-15T13:50:00Z', venue: 'Dealer Channel', volumeAnomaly: 2.1, priceImpact: 7.9, status: 'expired' },
  { id: 'dps-15', cardName: '2024 Bowman Chrome Roki Sasaki 1st Auto', player: 'Roki Sasaki', sport: 'Baseball', signalType: 'whale-accumulation', confidenceScore: 80, estimatedValue: 22000, detectedAt: '2026-04-15T10:30:00Z', venue: 'Private Network', volumeAnomaly: 4.6, priceImpact: 19.8, status: 'active' },
];

const MOCK_DEAL_FLOW: PrivateDealFlow[] = [
  { id: 'df-1', dealType: 'Block Trade', parties: 3, totalValue: 542000, cardsInvolved: 8, avgPremium: 14.2, flowDirection: 'accumulation', detectedDate: '2026-04-18', category: 'Basketball RCs' },
  { id: 'df-2', dealType: 'Private Treaty', parties: 2, totalValue: 890000, cardsInvolved: 1, avgPremium: 5.3, flowDirection: 'neutral', detectedDate: '2026-04-17', category: 'Vintage Baseball' },
  { id: 'df-3', dealType: 'Dealer Network Sweep', parties: 5, totalValue: 185000, cardsInvolved: 22, avgPremium: 18.7, flowDirection: 'accumulation', detectedDate: '2026-04-16', category: 'Football Autos' },
  { id: 'df-4', dealType: 'Whale Distribution', parties: 4, totalValue: 312000, cardsInvolved: 15, avgPremium: -8.4, flowDirection: 'distribution', detectedDate: '2026-04-15', category: 'Basketball Prizm' },
  { id: 'df-5', dealType: 'Off-Market Transfer', parties: 2, totalValue: 425000, cardsInvolved: 1, avgPremium: 4.7, flowDirection: 'neutral', detectedDate: '2026-04-14', category: 'Football RPAs' },
  { id: 'df-6', dealType: 'Vault Consolidation', parties: 3, totalValue: 95000, cardsInvolved: 45, avgPremium: 22.1, flowDirection: 'accumulation', detectedDate: '2026-04-13', category: 'Baseball Prospects' },
];

const MOCK_CONFIDENCE: SignalConfidence[] = [
  { signalId: 'dps-1', algorithmScore: 92, volumeEvidence: 95, priceEvidence: 88, networkEvidence: 97, historicalAccuracy: 91, overallConfidence: 94 },
  { signalId: 'dps-2', algorithmScore: 85, volumeEvidence: 82, priceEvidence: 90, networkEvidence: 88, historicalAccuracy: 84, overallConfidence: 87 },
  { signalId: 'dps-3', algorithmScore: 93, volumeEvidence: 78, priceEvidence: 95, networkEvidence: 92, historicalAccuracy: 96, overallConfidence: 91 },
  { signalId: 'dps-5', algorithmScore: 97, volumeEvidence: 90, priceEvidence: 98, networkEvidence: 95, historicalAccuracy: 99, overallConfidence: 96 },
  { signalId: 'dps-13', algorithmScore: 96, volumeEvidence: 88, priceEvidence: 97, networkEvidence: 94, historicalAccuracy: 98, overallConfidence: 95 },
];

const MOCK_HISTORY: DarkPoolHistory[] = [
  { month: 'Nov 2025', signalsDetected: 42, confirmed: 28, falsePositives: 6, estimatedVolume: 2850000, avgConfidence: 79 },
  { month: 'Dec 2025', signalsDetected: 38, confirmed: 25, falsePositives: 5, estimatedVolume: 3120000, avgConfidence: 81 },
  { month: 'Jan 2026', signalsDetected: 55, confirmed: 38, falsePositives: 7, estimatedVolume: 4200000, avgConfidence: 83 },
  { month: 'Feb 2026', signalsDetected: 61, confirmed: 44, falsePositives: 4, estimatedVolume: 5100000, avgConfidence: 86 },
  { month: 'Mar 2026', signalsDetected: 58, confirmed: 42, falsePositives: 3, estimatedVolume: 4850000, avgConfidence: 88 },
  { month: 'Apr 2026', signalsDetected: 47, confirmed: 35, falsePositives: 2, estimatedVolume: 3900000, avgConfidence: 85 },
];

export function getDarkPoolSignals(): DarkPoolSignal[] { return [...MOCK_SIGNALS]; }
export function getPrivateDealFlow(): PrivateDealFlow[] { return [...MOCK_DEAL_FLOW]; }
export function getSignalConfidence(): SignalConfidence[] { return [...MOCK_CONFIDENCE]; }
export function getDarkPoolHistory(): DarkPoolHistory[] { return [...MOCK_HISTORY]; }
export function getActiveSignalCount(): number { return MOCK_SIGNALS.filter(s => s.status === 'active').length; }
export function getConfirmedSignalCount(): number { return MOCK_SIGNALS.filter(s => s.status === 'confirmed').length; }
export function getTotalEstimatedValue(): number { return MOCK_SIGNALS.reduce((sum, s) => sum + s.estimatedValue, 0); }
export function getAvgConfidence(): number { return Math.round(MOCK_SIGNALS.reduce((sum, s) => sum + s.confidenceScore, 0) / MOCK_SIGNALS.length); }
