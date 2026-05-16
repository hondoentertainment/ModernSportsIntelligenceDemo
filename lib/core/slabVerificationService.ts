// Slab Verification Scanner Service
import { store } from '../dal/syncStore';

// ---- Types ----

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CGC';

export type VerificationStatus = 'authentic' | 'suspect' | 'counterfeit' | 'not_found';

export type AlertType = 'duplicate_cert' | 'grade_mismatch' | 'label_anomaly' | 'case_tampering';

export type AlertSeverity = 'high' | 'medium' | 'low';

export interface Subgrades {
  centering: number;
  corners: number;
  edges: number;
  surface: number;
}

export interface VerificationResult {
  id: string;
  certNumber: string;
  company: GradingCompany;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  subgrades?: Subgrades;
  verified: boolean;
  verificationStatus: VerificationStatus;
  flags: string[];
  populationCount: number;
  lastSalePrice?: number;
  labelType: string;
  scanDate: string;
  imageUrl?: string;
}

export interface CounterfeitAlert {
  id: string;
  certNumber: string;
  alertType: AlertType;
  severity: AlertSeverity;
  description: string;
  reportedDate: string;
  reportCount: number;
}

export interface VerificationStats {
  totalScans: number;
  authenticCount: number;
  suspectCount: number;
  counterfeitCount: number;
  accuracyRate: number;
  commonFlags: string[];
}

export interface RegistryEntry {
  certNumber: string;
  company: GradingCompany;
  cardName: string;
  grade: string;
  owner?: string;
  registered: boolean;
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_slab_verification';

// ---- Mock Data ----

const MOCK_VERIFICATION_RESULTS: VerificationResult[] = [
  {
    id: 'sv-001',
    certNumber: '12345678',
    company: 'PSA',
    cardName: '1986 Fleer Michael Jordan #57',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    grade: 'PSA 10',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 316,
    lastSalePrice: 738000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-01',
  },
  {
    id: 'sv-002',
    certNumber: '23456789',
    company: 'BGS',
    cardName: '2003 Topps Chrome LeBron James #111',
    player: 'LeBron James',
    year: 2003,
    set: 'Topps Chrome',
    grade: 'BGS 9.5',
    subgrades: { centering: 9.5, corners: 9.5, edges: 9.5, surface: 10 },
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 1240,
    lastSalePrice: 52000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-02',
  },
  {
    id: 'sv-003',
    certNumber: '34567890',
    company: 'PSA',
    cardName: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    year: 1952,
    set: 'Topps',
    grade: 'PSA 8',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 12,
    lastSalePrice: 4800000,
    labelType: 'NM-MT',
    scanDate: '2025-11-03',
  },
  {
    id: 'sv-004',
    certNumber: '45678901',
    company: 'SGC',
    cardName: '1909 T206 Honus Wagner',
    player: 'Honus Wagner',
    year: 1909,
    set: 'T206',
    grade: 'SGC 3',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 3,
    lastSalePrice: 6606000,
    labelType: 'VG',
    scanDate: '2025-11-04',
  },
  {
    id: 'sv-005',
    certNumber: '56789012',
    company: 'PSA',
    cardName: '2018 Panini Prizm Luka Doncic #280',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    verified: false,
    verificationStatus: 'suspect',
    flags: ['label_font_mismatch', 'case_seam_irregular'],
    populationCount: 4500,
    lastSalePrice: 3200,
    labelType: 'Gem Mint',
    scanDate: '2025-11-05',
  },
  {
    id: 'sv-006',
    certNumber: '67890123',
    company: 'BGS',
    cardName: '1993 SP Derek Jeter #279',
    player: 'Derek Jeter',
    year: 1993,
    set: 'SP',
    grade: 'BGS 9',
    subgrades: { centering: 8.5, corners: 9, edges: 9, surface: 9.5 },
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 820,
    lastSalePrice: 28000,
    labelType: 'Mint',
    scanDate: '2025-11-06',
  },
  {
    id: 'sv-007',
    certNumber: '78901234',
    company: 'CGC',
    cardName: '2020 Panini Prizm Joe Burrow #307',
    player: 'Joe Burrow',
    year: 2020,
    set: 'Panini Prizm',
    grade: 'CGC 9.5',
    subgrades: { centering: 9.5, corners: 9, edges: 9.5, surface: 10 },
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 3100,
    lastSalePrice: 450,
    labelType: 'Gem Mint',
    scanDate: '2025-11-07',
  },
  {
    id: 'sv-008',
    certNumber: '89012345',
    company: 'PSA',
    cardName: '2001 SP Authentic Tiger Woods #51',
    player: 'Tiger Woods',
    year: 2001,
    set: 'SP Authentic',
    grade: 'PSA 9',
    verified: false,
    verificationStatus: 'counterfeit',
    flags: ['cert_number_duplicate', 'hologram_missing', 'wrong_case_weight'],
    populationCount: 180,
    lastSalePrice: 250000,
    labelType: 'Mint',
    scanDate: '2025-11-08',
  },
  {
    id: 'sv-009',
    certNumber: '90123456',
    company: 'BGS',
    cardName: '2009 Bowman Chrome Mike Trout #BDPP89',
    player: 'Mike Trout',
    year: 2009,
    set: 'Bowman Chrome',
    grade: 'BGS 9.5',
    subgrades: { centering: 9, corners: 9.5, edges: 9.5, surface: 9.5 },
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 650,
    lastSalePrice: 95000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-09',
  },
  {
    id: 'sv-010',
    certNumber: '01234567',
    company: 'PSA',
    cardName: '1979 O-Pee-Chee Wayne Gretzky #18',
    player: 'Wayne Gretzky',
    year: 1979,
    set: 'O-Pee-Chee',
    grade: 'PSA 10',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 2,
    lastSalePrice: 3750000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-10',
  },
  {
    id: 'sv-011',
    certNumber: '11234567',
    company: 'SGC',
    cardName: '1933 Goudey Babe Ruth #53',
    player: 'Babe Ruth',
    year: 1933,
    set: 'Goudey',
    grade: 'SGC 5',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 18,
    lastSalePrice: 420000,
    labelType: 'EX',
    scanDate: '2025-11-11',
  },
  {
    id: 'sv-012',
    certNumber: '22345678',
    company: 'PSA',
    cardName: '2018 Panini National Treasures Shohei Ohtani #163',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Panini National Treasures',
    grade: 'PSA 10',
    verified: false,
    verificationStatus: 'suspect',
    flags: ['population_anomaly', 'label_print_quality'],
    populationCount: 72,
    lastSalePrice: 185000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-12',
  },
  {
    id: 'sv-013',
    certNumber: '33456789',
    company: 'BGS',
    cardName: '1996 Topps Chrome Kobe Bryant #138',
    player: 'Kobe Bryant',
    year: 1996,
    set: 'Topps Chrome',
    grade: 'BGS 9.5',
    subgrades: { centering: 9, corners: 9.5, edges: 10, surface: 9.5 },
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 540,
    lastSalePrice: 45000,
    labelType: 'Gem Mint',
    scanDate: '2025-11-13',
  },
  {
    id: 'sv-014',
    certNumber: '44567890',
    company: 'CGC',
    cardName: '2020 Panini Select Justin Herbert #44',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Select',
    grade: 'CGC 10',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 890,
    lastSalePrice: 1200,
    labelType: 'Pristine',
    scanDate: '2025-11-14',
  },
  {
    id: 'sv-015',
    certNumber: '55678901',
    company: 'PSA',
    cardName: '2019 Panini Prizm Zion Williamson #248',
    player: 'Zion Williamson',
    year: 2019,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    verified: false,
    verificationStatus: 'counterfeit',
    flags: ['cert_number_duplicate', 'wrong_card_stock', 'uv_test_fail'],
    populationCount: 8200,
    lastSalePrice: 1800,
    labelType: 'Gem Mint',
    scanDate: '2025-11-15',
  },
  {
    id: 'sv-016',
    certNumber: '66789012',
    company: 'PSA',
    cardName: '2021 Topps Chrome Wander Franco #1',
    player: 'Wander Franco',
    year: 2021,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    verified: true,
    verificationStatus: 'authentic',
    flags: [],
    populationCount: 5400,
    lastSalePrice: 180,
    labelType: 'Gem Mint',
    scanDate: '2025-11-16',
  },
];

const MOCK_COUNTERFEIT_ALERTS: CounterfeitAlert[] = [
  {
    id: 'ca-001',
    certNumber: '89012345',
    alertType: 'duplicate_cert',
    severity: 'high',
    description: 'Cert number 89012345 has been found on multiple Tiger Woods SP Authentic slabs with different serial locations.',
    reportedDate: '2025-10-20',
    reportCount: 12,
  },
  {
    id: 'ca-002',
    certNumber: '55678901',
    alertType: 'label_anomaly',
    severity: 'high',
    description: 'Known counterfeit PSA labels detected on Zion Williamson Prizm rookies with incorrect font spacing.',
    reportedDate: '2025-10-22',
    reportCount: 28,
  },
  {
    id: 'ca-003',
    certNumber: '56789012',
    alertType: 'case_tampering',
    severity: 'medium',
    description: 'Possible case tampering detected on Luka Doncic Prizm slab. Irregular seam pattern along the left edge.',
    reportedDate: '2025-10-25',
    reportCount: 5,
  },
  {
    id: 'ca-004',
    certNumber: '22345678',
    alertType: 'grade_mismatch',
    severity: 'medium',
    description: 'Reported grade mismatch on Ohtani National Treasures. Card quality inconsistent with PSA 10 designation.',
    reportedDate: '2025-10-28',
    reportCount: 3,
  },
  {
    id: 'ca-005',
    certNumber: '99887766',
    alertType: 'duplicate_cert',
    severity: 'high',
    description: 'Widespread duplicate cert numbers found on 2020 Panini Prizm football cases from multiple sellers.',
    reportedDate: '2025-11-01',
    reportCount: 45,
  },
  {
    id: 'ca-006',
    certNumber: '11122233',
    alertType: 'label_anomaly',
    severity: 'low',
    description: 'Minor label printing inconsistency reported on SGC vintage slabs. Under investigation.',
    reportedDate: '2025-11-05',
    reportCount: 2,
  },
];

const MOCK_REGISTRY: RegistryEntry[] = [
  { certNumber: '12345678', company: 'PSA', cardName: '1986 Fleer Michael Jordan #57', grade: 'PSA 10', owner: 'VaultKing', registered: true },
  { certNumber: '23456789', company: 'BGS', cardName: '2003 Topps Chrome LeBron James #111', grade: 'BGS 9.5', owner: 'HoopCollector', registered: true },
  { certNumber: '34567890', company: 'PSA', cardName: '1952 Topps Mickey Mantle #311', grade: 'PSA 8', owner: 'VintageKing', registered: true },
  { certNumber: '45678901', company: 'SGC', cardName: '1909 T206 Honus Wagner', grade: 'SGC 3', registered: true },
  { certNumber: '67890123', company: 'BGS', cardName: '1993 SP Derek Jeter #279', grade: 'BGS 9', owner: 'YanksFan99', registered: true },
  { certNumber: '01234567', company: 'PSA', cardName: '1979 O-Pee-Chee Wayne Gretzky #18', grade: 'PSA 10', registered: true },
  { certNumber: '78901234', company: 'CGC', cardName: '2020 Panini Prizm Joe Burrow #307', grade: 'CGC 9.5', registered: false },
  { certNumber: '90123456', company: 'BGS', cardName: '2009 Bowman Chrome Mike Trout #BDPP89', grade: 'BGS 9.5', owner: 'TroutTracker', registered: true },
];

// ---- Helper functions ----

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// ---- Exported functions ----

export function getVerificationHistory(): VerificationResult[] {
  const stored = loadFromStorage<VerificationResult[]>('history', []);
  if (stored.length > 0) return stored;
  saveToStorage('history', MOCK_VERIFICATION_RESULTS);
  return [...MOCK_VERIFICATION_RESULTS];
}

export function verifyCert(certNumber: string, company: GradingCompany): VerificationResult | null {
  const history = getVerificationHistory();
  const formatted = formatCertNumber(certNumber);
  const found = MOCK_VERIFICATION_RESULTS.find(
    (r) => r.certNumber === formatted && r.company === company
  );
  if (!found) return null;
  const result: VerificationResult = { ...found, scanDate: new Date().toISOString().split('T')[0] };
  const exists = history.find((h) => h.certNumber === formatted && h.company === company);
  if (!exists) {
    history.unshift(result);
    saveToStorage('history', history);
  }
  return result;
}

/**
 * Async variant of verifyCert.  For PSA certs, calls the real PSA API via the
 * `verify-psa-cert` Edge Function first; falls back to the local mock on any
 * failure so the UI always gets a result.
 */
export async function verifyCertAsync(
  certNumber: string,
  company: GradingCompany,
): Promise<VerificationResult | null> {
  if (company === 'PSA') {
    const { lookupPsaCert, psaLookupToVerificationResult } = await import('./psaCertService');
    const { result, notFound, error } = await lookupPsaCert(certNumber);
    if (result) {
      const vr = psaLookupToVerificationResult(result);
      const history = getVerificationHistory();
      const exists = history.find((h) => h.certNumber === vr.certNumber && h.company === 'PSA');
      if (!exists) {
        history.unshift(vr);
        saveToStorage('history', history);
      }
      return vr;
    }
    // If the cert was looked up successfully but not found in PSA's DB, surface that.
    if (notFound) return null;
    // On config/network error, fall through to mock lookup below.
    if (error) console.warn('[slabVerificationService] PSA API error; using mock:', error);
  }
  // Non-PSA companies and PSA fallback — synchronous mock lookup.
  return verifyCert(certNumber, company);
}

export function getCounterfeitAlerts(): CounterfeitAlert[] {
  const stored = loadFromStorage<CounterfeitAlert[]>('alerts', []);
  if (stored.length > 0) return stored;
  saveToStorage('alerts', MOCK_COUNTERFEIT_ALERTS);
  return [...MOCK_COUNTERFEIT_ALERTS];
}

export function reportCounterfeit(alert: Omit<CounterfeitAlert, 'id'>): CounterfeitAlert {
  const alerts = getCounterfeitAlerts();
  const newAlert: CounterfeitAlert = {
    ...alert,
    id: `ca-${Date.now()}`,
  };
  alerts.unshift(newAlert);
  saveToStorage('alerts', alerts);
  return newAlert;
}

export function getVerificationStats(): VerificationStats {
  const history = getVerificationHistory();
  const authenticCount = history.filter((r) => r.verificationStatus === 'authentic').length;
  const suspectCount = history.filter((r) => r.verificationStatus === 'suspect').length;
  const counterfeitCount = history.filter((r) => r.verificationStatus === 'counterfeit').length;
  const totalScans = history.length;
  const accuracyRate = totalScans > 0 ? Math.round((authenticCount / totalScans) * 10000) / 100 : 0;

  const flagCounts: Record<string, number> = {};
  history.forEach((r) => {
    r.flags.forEach((f) => {
      flagCounts[f] = (flagCounts[f] || 0) + 1;
    });
  });
  const commonFlags = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([flag]) => flag);

  return {
    totalScans,
    authenticCount,
    suspectCount,
    counterfeitCount,
    accuracyRate,
    commonFlags,
  };
}

export function getRegistryEntry(certNumber: string): RegistryEntry | null {
  const formatted = formatCertNumber(certNumber);
  return MOCK_REGISTRY.find((r) => r.certNumber === formatted) ?? null;
}

export function checkPopulation(certNumber: string): { certNumber: string; populationCount: number; rank: string } | null {
  const formatted = formatCertNumber(certNumber);
  const result = MOCK_VERIFICATION_RESULTS.find((r) => r.certNumber === formatted);
  if (!result) return null;
  const rank = result.populationCount <= 10 ? 'ultra_rare' :
    result.populationCount <= 100 ? 'rare' :
    result.populationCount <= 1000 ? 'scarce' : 'common';
  return { certNumber: formatted, populationCount: result.populationCount, rank };
}

export function getFlaggedItems(): VerificationResult[] {
  const history = getVerificationHistory();
  return history.filter((r) => r.flags.length > 0);
}

export function getRecentVerifications(limit: number): VerificationResult[] {
  const history = getVerificationHistory();
  return history.slice(0, limit);
}

export function getBatchVerification(certNumbers: string[]): (VerificationResult | null)[] {
  return certNumbers.map((cert) => {
    const formatted = formatCertNumber(cert);
    return MOCK_VERIFICATION_RESULTS.find((r) => r.certNumber === formatted) ?? null;
  });
}

export function formatCertNumber(cert: string): string {
  return cert.replace(/[\s-]/g, '');
}

export function getStatusColor(status: VerificationStatus): string {
  switch (status) {
    case 'authentic': return 'text-green-400';
    case 'suspect': return 'text-yellow-400';
    case 'counterfeit': return 'text-red-400';
    case 'not_found': return 'text-gray-400';
  }
}

export function getStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case 'authentic': return 'Authentic';
    case 'suspect': return 'Suspect';
    case 'counterfeit': return 'Counterfeit';
    case 'not_found': return 'Not Found';
  }
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-yellow-400';
    case 'low': return 'text-blue-400';
  }
}

export function getCompanyColor(company: GradingCompany): string {
  switch (company) {
    case 'PSA': return 'text-red-400';
    case 'BGS': return 'text-blue-400';
    case 'SGC': return 'text-amber-400';
    case 'CGC': return 'text-purple-400';
  }
}

export function getFlagIcon(flag: string): string {
  if (flag.includes('cert') || flag.includes('duplicate')) return 'copy';
  if (flag.includes('label') || flag.includes('font') || flag.includes('print')) return 'tag';
  if (flag.includes('case') || flag.includes('seam') || flag.includes('weight')) return 'box';
  if (flag.includes('hologram') || flag.includes('uv')) return 'shield';
  if (flag.includes('population') || flag.includes('stock')) return 'bar-chart';
  return 'alert-triangle';
}
