// ---- Types ----

export interface CardFingerprint {
  id: string;
  cardId: string;
  cardName: string;
  centeringScore: number; // 0-100
  printQuality: number;   // 0-100
  surfaceScore: number;   // 0-100
  edgeScore: number;      // 0-100
  cornerScore: number;    // 0-100
  overallDNA: string;     // hex hash
  authenticityConfidence: number; // 0-100
  scanDate: string;
}

export type MatchType = 'exact' | 'similar' | 'counterfeit_risk';

export interface DNAMatch {
  id: string;
  fingerprintId: string;
  matchType: MatchType;
  confidence: number; // 0-100
  details: string;
}

export interface AuthenticationEvent {
  id: string;
  cardId: string;
  cardName: string;
  result: 'authenticated' | 'flagged' | 'inconclusive';
  confidence: number;
  date: string;
  method: string;
}

export interface DNAStats {
  totalScanned: number;
  authenticated: number;
  flagged: number;
  inconclusive: number;
  averageConfidence: number;
  lastScanDate: string;
}

export interface CounterfeitAlert {
  id: string;
  cardName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedDate: string;
  fingerprintId: string;
}

// ---- Mock Data ----

const FINGERPRINTS: CardFingerprint[] = [
  {
    id: 'fp-001',
    cardId: 'card-001',
    cardName: '2023 Prizm Victor Wembanyama RC #1',
    centeringScore: 94,
    printQuality: 97,
    surfaceScore: 92,
    edgeScore: 96,
    cornerScore: 91,
    overallDNA: 'a7f3c9e1d4b2',
    authenticityConfidence: 98,
    scanDate: '2026-03-10',
  },
  {
    id: 'fp-002',
    cardId: 'card-002',
    cardName: '2020 Prizm Justin Herbert RC #325',
    centeringScore: 88,
    printQuality: 91,
    surfaceScore: 85,
    edgeScore: 90,
    cornerScore: 87,
    overallDNA: 'b8e4d0f2a5c3',
    authenticityConfidence: 95,
    scanDate: '2026-03-09',
  },
  {
    id: 'fp-003',
    cardId: 'card-003',
    cardName: '2018 Prizm Luka Doncic RC #280',
    centeringScore: 72,
    printQuality: 89,
    surfaceScore: 78,
    edgeScore: 82,
    cornerScore: 75,
    overallDNA: 'c9f5e1a3b6d4',
    authenticityConfidence: 62,
    scanDate: '2026-03-08',
  },
  {
    id: 'fp-004',
    cardId: 'card-004',
    cardName: '2003 Topps Chrome LeBron James RC #111',
    centeringScore: 96,
    printQuality: 94,
    surfaceScore: 98,
    edgeScore: 95,
    cornerScore: 97,
    overallDNA: 'd0a6f2b4c7e5',
    authenticityConfidence: 99,
    scanDate: '2026-03-07',
  },
  {
    id: 'fp-005',
    cardId: 'card-005',
    cardName: '2019 Mosaic Ja Morant RC #219',
    centeringScore: 60,
    printQuality: 65,
    surfaceScore: 58,
    edgeScore: 55,
    cornerScore: 52,
    overallDNA: 'e1b7a3c5d8f6',
    authenticityConfidence: 28,
    scanDate: '2026-03-06',
  },
  {
    id: 'fp-006',
    cardId: 'card-006',
    cardName: '1986 Fleer Michael Jordan RC #57',
    centeringScore: 91,
    printQuality: 88,
    surfaceScore: 84,
    edgeScore: 86,
    cornerScore: 83,
    overallDNA: 'f2c8b4d6e9a7',
    authenticityConfidence: 93,
    scanDate: '2026-03-05',
  },
  {
    id: 'fp-007',
    cardId: 'card-007',
    cardName: '2022 Topps Chrome Julio Rodriguez RC #1',
    centeringScore: 89,
    printQuality: 93,
    surfaceScore: 90,
    edgeScore: 88,
    cornerScore: 92,
    overallDNA: 'a3d9c5e7f0b8',
    authenticityConfidence: 96,
    scanDate: '2026-03-04',
  },
  {
    id: 'fp-008',
    cardId: 'card-008',
    cardName: '2020 Select Joe Burrow RC #44',
    centeringScore: 85,
    printQuality: 82,
    surfaceScore: 88,
    edgeScore: 84,
    cornerScore: 80,
    overallDNA: 'b4e0d6f8a1c9',
    authenticityConfidence: 90,
    scanDate: '2026-03-03',
  },
  {
    id: 'fp-009',
    cardId: 'card-009',
    cardName: '2018 Optic Trae Young RC #198',
    centeringScore: 77,
    printQuality: 80,
    surfaceScore: 74,
    edgeScore: 79,
    cornerScore: 76,
    overallDNA: 'c5f1e7a9b2d0',
    authenticityConfidence: 82,
    scanDate: '2026-03-02',
  },
  {
    id: 'fp-010',
    cardId: 'card-010',
    cardName: '2021 Prizm Trevor Lawrence RC #331',
    centeringScore: 92,
    printQuality: 95,
    surfaceScore: 93,
    edgeScore: 91,
    cornerScore: 94,
    overallDNA: 'd6a2f8b0c3e1',
    authenticityConfidence: 97,
    scanDate: '2026-03-01',
  },
  {
    id: 'fp-011',
    cardId: 'card-011',
    cardName: '2019 Prizm Zion Williamson RC #248',
    centeringScore: 68,
    printQuality: 72,
    surfaceScore: 63,
    edgeScore: 66,
    cornerScore: 61,
    overallDNA: 'e7b3a9c1d4f2',
    authenticityConfidence: 45,
    scanDate: '2026-02-28',
  },
  {
    id: 'fp-012',
    cardId: 'card-012',
    cardName: '2017 Prizm Patrick Mahomes RC #269',
    centeringScore: 93,
    printQuality: 96,
    surfaceScore: 91,
    edgeScore: 94,
    cornerScore: 90,
    overallDNA: 'f8c4b0d2e5a3',
    authenticityConfidence: 97,
    scanDate: '2026-02-27',
  },
];

const DNA_MATCHES: DNAMatch[] = [
  { id: 'dm-001', fingerprintId: 'fp-001', matchType: 'exact', confidence: 99, details: 'Exact match found in Panini authenticated registry. Print micro-pattern and centering offset match production batch WB-2023-Q4-0147.' },
  { id: 'dm-002', fingerprintId: 'fp-003', matchType: 'counterfeit_risk', confidence: 62, details: 'Surface texture anomaly detected. Print dot pattern deviates from known Prizm 2018 production signatures. Recommend physical inspection.' },
  { id: 'dm-003', fingerprintId: 'fp-004', matchType: 'exact', confidence: 99, details: 'Verified against Topps Chrome 2003 master database. Corner micro-wear pattern consistent with 20+ year natural aging.' },
  { id: 'dm-004', fingerprintId: 'fp-005', matchType: 'counterfeit_risk', confidence: 28, details: 'Multiple red flags: print registration off by 0.3mm, surface coating reflectivity outside normal range, edge cut pattern inconsistent with Mosaic production.' },
  { id: 'dm-005', fingerprintId: 'fp-006', matchType: 'similar', confidence: 87, details: 'Strong match to known 1986 Fleer production run. Minor surface variations likely due to age. No counterfeit indicators detected.' },
  { id: 'dm-006', fingerprintId: 'fp-011', matchType: 'counterfeit_risk', confidence: 45, details: 'Centering inconsistency flagged. Print quality below expected threshold for Prizm 2019 production. Further DNA scan recommended.' },
  { id: 'dm-007', fingerprintId: 'fp-002', matchType: 'exact', confidence: 96, details: 'Print pattern matches Prizm 2020 production line PH-7. Surface texture within expected parameters.' },
  { id: 'dm-008', fingerprintId: 'fp-012', matchType: 'exact', confidence: 98, details: 'Verified authentic. Edge and corner profiles match Prizm 2017 first print run specifications.' },
];

const AUTHENTICATION_HISTORY: AuthenticationEvent[] = [
  { id: 'auth-001', cardId: 'card-001', cardName: '2023 Prizm Victor Wembanyama RC #1', result: 'authenticated', confidence: 98, date: '2026-03-10', method: 'Full DNA Scan' },
  { id: 'auth-002', cardId: 'card-002', cardName: '2020 Prizm Justin Herbert RC #325', result: 'authenticated', confidence: 95, date: '2026-03-09', method: 'Full DNA Scan' },
  { id: 'auth-003', cardId: 'card-003', cardName: '2018 Prizm Luka Doncic RC #280', result: 'flagged', confidence: 62, date: '2026-03-08', method: 'Full DNA Scan' },
  { id: 'auth-004', cardId: 'card-004', cardName: '2003 Topps Chrome LeBron James RC #111', result: 'authenticated', confidence: 99, date: '2026-03-07', method: 'Full DNA Scan' },
  { id: 'auth-005', cardId: 'card-005', cardName: '2019 Mosaic Ja Morant RC #219', result: 'flagged', confidence: 28, date: '2026-03-06', method: 'Full DNA Scan' },
  { id: 'auth-006', cardId: 'card-006', cardName: '1986 Fleer Michael Jordan RC #57', result: 'authenticated', confidence: 93, date: '2026-03-05', method: 'Quick Scan' },
  { id: 'auth-007', cardId: 'card-007', cardName: '2022 Topps Chrome Julio Rodriguez RC #1', result: 'authenticated', confidence: 96, date: '2026-03-04', method: 'Full DNA Scan' },
  { id: 'auth-008', cardId: 'card-008', cardName: '2020 Select Joe Burrow RC #44', result: 'authenticated', confidence: 90, date: '2026-03-03', method: 'Quick Scan' },
  { id: 'auth-009', cardId: 'card-009', cardName: '2018 Optic Trae Young RC #198', result: 'inconclusive', confidence: 82, date: '2026-03-02', method: 'Quick Scan' },
  { id: 'auth-010', cardId: 'card-010', cardName: '2021 Prizm Trevor Lawrence RC #331', result: 'authenticated', confidence: 97, date: '2026-03-01', method: 'Full DNA Scan' },
  { id: 'auth-011', cardId: 'card-011', cardName: '2019 Prizm Zion Williamson RC #248', result: 'flagged', confidence: 45, date: '2026-02-28', method: 'Full DNA Scan' },
  { id: 'auth-012', cardId: 'card-012', cardName: '2017 Prizm Patrick Mahomes RC #269', result: 'authenticated', confidence: 97, date: '2026-02-27', method: 'Full DNA Scan' },
];

const COUNTERFEIT_ALERTS: CounterfeitAlert[] = [
  { id: 'ca-001', cardName: '2019 Mosaic Ja Morant RC #219', riskLevel: 'critical', description: 'High probability counterfeit. Print registration, surface coating, and edge cut pattern all deviate significantly from authentic production parameters.', detectedDate: '2026-03-06', fingerprintId: 'fp-005' },
  { id: 'ca-002', cardName: '2018 Prizm Luka Doncic RC #280', riskLevel: 'high', description: 'Surface texture anomaly detected. Print dot pattern inconsistent with known Prizm 2018 production. Physical inspection recommended.', detectedDate: '2026-03-08', fingerprintId: 'fp-003' },
  { id: 'ca-003', cardName: '2019 Prizm Zion Williamson RC #248', riskLevel: 'medium', description: 'Centering and print quality below expected thresholds. Could indicate a reprint or altered card. Further analysis required.', detectedDate: '2026-02-28', fingerprintId: 'fp-011' },
  { id: 'ca-004', cardName: '2018 Optic Trae Young RC #198', riskLevel: 'low', description: 'Minor print variation detected in lower right quadrant. Likely within normal production tolerance but flagged for monitoring.', detectedDate: '2026-03-02', fingerprintId: 'fp-009' },
];

// ---- Service Functions ----

export function getCardFingerprint(cardId: string): CardFingerprint | undefined {
  return FINGERPRINTS.find((fp) => fp.cardId === cardId);
}

export function getAllFingerprints(): CardFingerprint[] {
  return [...FINGERPRINTS];
}

export function scanCard(cardId: string): CardFingerprint | undefined {
  return FINGERPRINTS.find((fp) => fp.cardId === cardId);
}

export function getAuthenticationHistory(): AuthenticationEvent[] {
  return [...AUTHENTICATION_HISTORY];
}

export function getDNAStats(): DNAStats {
  const authenticated = AUTHENTICATION_HISTORY.filter((e) => e.result === 'authenticated').length;
  const flagged = AUTHENTICATION_HISTORY.filter((e) => e.result === 'flagged').length;
  const inconclusive = AUTHENTICATION_HISTORY.filter((e) => e.result === 'inconclusive').length;
  const avgConf = Math.round(
    AUTHENTICATION_HISTORY.reduce((sum, e) => sum + e.confidence, 0) / AUTHENTICATION_HISTORY.length
  );

  return {
    totalScanned: AUTHENTICATION_HISTORY.length,
    authenticated,
    flagged,
    inconclusive,
    averageConfidence: avgConf,
    lastScanDate: AUTHENTICATION_HISTORY[0]?.date ?? '',
  };
}

export function getCounterfeitAlerts(): CounterfeitAlert[] {
  return [...COUNTERFEIT_ALERTS];
}

export function getDNAMatches(fingerprintId?: string): DNAMatch[] {
  if (fingerprintId) {
    return DNA_MATCHES.filter((m) => m.fingerprintId === fingerprintId);
  }
  return [...DNA_MATCHES];
}
