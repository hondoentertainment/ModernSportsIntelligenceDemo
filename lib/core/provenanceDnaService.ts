// ---- Types ----

export type MicroFeatureType =
  | 'print_dot_cluster'
  | 'surface_anomaly'
  | 'edge_pattern'
  | 'centering_offset'
  | 'color_shift';

export type VenueType = 'ebay' | 'card_show' | 'private_sale' | 'auction_house' | 'lcs';

export type VerificationMethod = 'fingerprint_match' | 'manual_entry' | 'receipt_upload' | 'platform_api';

export interface MicroFeature {
  type: MicroFeatureType;
  location: { x: number; y: number };
  magnitude: number;
  descriptor: string; // 16-char hex hash
}

export interface SurfacePattern {
  id: string;
  region: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center';
  density: number;
  orientation: number; // degrees
  patternHash: string;
}

export interface CardFingerprint {
  id: string;
  cardId: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  fingerprintHash: string; // 64-char hex
  features: MicroFeature[];
  surfacePatterns: SurfacePattern[];
  centeringSignature: [number, number, number, number]; // top, right, bottom, left offsets
  edgeProfile: [number, number, number, number]; // wear scores per edge
  printDotDensity: number;
  uniquenessScore: number; // 0-100
  capturedAt: string;
  imageHash: string;
}

export interface FingerprintMatch {
  id: string;
  fingerprint: CardFingerprint;
  matchConfidence: number; // 0-100
  matchedFeatures: number;
  totalFeatures: number;
  matchType: 'exact' | 'high' | 'partial' | 'low';
  lastSeenVenue: VenueType;
  lastSeenDate: string;
}

export interface FingerprintFeature {
  name: string;
  weight: number;
  score: number;
}

export interface OwnershipChainEntry {
  id: string;
  fingerprintId: string;
  ownerAlias: string;
  venue: VenueType;
  transactionDate: string;
  price: number;
  verificationMethod: VerificationMethod;
  confidence: number;
}

export interface ProvenanceScore {
  overall: number; // 0-100
  chainCompleteness: number;
  verificationStrength: number;
  ownershipConsistency: number;
  timeCoverage: number;
  flags: string[];
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
}

export interface FingerprintScanResult {
  fingerprint: CardFingerprint;
  scanDuration: number; // ms
  featuresDetected: number;
  qualityScore: number; // 0-100
  warnings: string[];
}

export interface FingerprintComparison {
  fingerprintA: string;
  fingerprintB: string;
  overallSimilarity: number; // 0-100
  featureMatches: { featureType: MicroFeatureType; similarity: number }[];
  centeringSimilarity: number;
  edgeSimilarity: number;
  surfaceSimilarity: number;
  verdict: 'same_card' | 'likely_same' | 'uncertain' | 'different';
}

export interface FingerprintDatabase {
  fingerprints: CardFingerprint[];
  totalScans: number;
  matchesFound: number;
  avgProvenanceScore: number;
  lastUpdated: string;
}

export interface MatchConfidence {
  level: 'definitive' | 'high' | 'moderate' | 'low' | 'none';
  percentage: number;
  explanation: string;
}

export interface CounterfeitResult {
  isAuthentic: boolean;
  confidence: number;
  flags: string[];
}

// ---- Helpers ----

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function randomFloat(min: number, max: number, decimals = 3): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function generateMicroFeatures(count: number): MicroFeature[] {
  const types: MicroFeatureType[] = [
    'print_dot_cluster',
    'surface_anomaly',
    'edge_pattern',
    'centering_offset',
    'color_shift',
  ];
  return Array.from({ length: count }, () => ({
    type: types[randomInt(0, types.length - 1)],
    location: { x: randomFloat(0, 1), y: randomFloat(0, 1) },
    magnitude: randomFloat(0.1, 1.0),
    descriptor: randomHex(16),
  }));
}

function generateSurfacePatterns(): SurfacePattern[] {
  const regions: SurfacePattern['region'][] = [
    'top_left',
    'top_right',
    'bottom_left',
    'bottom_right',
    'center',
  ];
  return regions.map((region) => ({
    id: `sp-${randomHex(6)}`,
    region,
    density: randomFloat(0.3, 0.95),
    orientation: randomFloat(0, 360, 1),
    patternHash: randomHex(32),
  }));
}

// ---- Mock Data ----

const MOCK_FINGERPRINTS: CardFingerprint[] = [
  {
    id: 'fp-001',
    cardId: 'card-001',
    cardName: '1986 Fleer Michael Jordan #57',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    fingerprintHash: 'a3f8d2e1b4c6789012345678abcdef0123456789abcdef0123456789abcdef01',
    features: generateMicroFeatures(24),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.48, 0.52, 0.49, 0.51],
    edgeProfile: [0.92, 0.88, 0.91, 0.85],
    printDotDensity: 0.847,
    uniquenessScore: 97,
    capturedAt: '2025-11-15T14:30:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-002',
    cardId: 'card-002',
    cardName: '2003 Topps Chrome LeBron James #111',
    player: 'LeBron James',
    year: 2003,
    set: 'Topps Chrome',
    fingerprintHash: 'b7e9c1d3a5f8024613579bdf02468ace13579bdf02468ace13579bdf02468ace',
    features: generateMicroFeatures(21),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.50, 0.50, 0.51, 0.49],
    edgeProfile: [0.95, 0.93, 0.96, 0.94],
    printDotDensity: 0.912,
    uniquenessScore: 94,
    capturedAt: '2025-12-01T09:15:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-003',
    cardId: 'card-003',
    cardName: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    year: 1952,
    set: 'Topps',
    fingerprintHash: 'c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4',
    features: generateMicroFeatures(30),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.45, 0.55, 0.47, 0.53],
    edgeProfile: [0.65, 0.70, 0.62, 0.68],
    printDotDensity: 0.723,
    uniquenessScore: 99,
    capturedAt: '2025-10-20T11:00:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-004',
    cardId: 'card-004',
    cardName: '2018 Panini Prizm Luka Doncic #280',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    fingerprintHash: 'd5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
    features: generateMicroFeatures(19),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.51, 0.49, 0.50, 0.50],
    edgeProfile: [0.97, 0.96, 0.98, 0.95],
    printDotDensity: 0.934,
    uniquenessScore: 91,
    capturedAt: '2026-01-05T16:45:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-005',
    cardId: 'card-005',
    cardName: '1989 Upper Deck Ken Griffey Jr. #1',
    player: 'Ken Griffey Jr.',
    year: 1989,
    set: 'Upper Deck',
    fingerprintHash: 'e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6',
    features: generateMicroFeatures(22),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.49, 0.51, 0.48, 0.52],
    edgeProfile: [0.82, 0.85, 0.80, 0.83],
    printDotDensity: 0.801,
    uniquenessScore: 88,
    capturedAt: '2026-01-10T08:30:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-006',
    cardId: 'card-006',
    cardName: '2020 Panini Prizm Justin Herbert #325',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Prizm',
    fingerprintHash: 'f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7',
    features: generateMicroFeatures(18),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.50, 0.50, 0.50, 0.50],
    edgeProfile: [0.98, 0.97, 0.99, 0.97],
    printDotDensity: 0.956,
    uniquenessScore: 86,
    capturedAt: '2026-01-18T13:20:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-007',
    cardId: 'card-007',
    cardName: '1979 O-Pee-Chee Wayne Gretzky #18',
    player: 'Wayne Gretzky',
    year: 1979,
    set: 'O-Pee-Chee',
    fingerprintHash: '08a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    features: generateMicroFeatures(27),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.46, 0.54, 0.44, 0.56],
    edgeProfile: [0.72, 0.68, 0.75, 0.70],
    printDotDensity: 0.758,
    uniquenessScore: 96,
    capturedAt: '2025-09-12T10:00:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-008',
    cardId: 'card-008',
    cardName: '2001 SP Authentic Tiger Woods #51',
    player: 'Tiger Woods',
    year: 2001,
    set: 'SP Authentic',
    fingerprintHash: '19b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    features: generateMicroFeatures(20),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.52, 0.48, 0.53, 0.47],
    edgeProfile: [0.88, 0.90, 0.86, 0.89],
    printDotDensity: 0.831,
    uniquenessScore: 93,
    capturedAt: '2025-08-25T15:45:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-009',
    cardId: 'card-009',
    cardName: '2022 Panini Prizm Victor Wembanyama #1',
    player: 'Victor Wembanyama',
    year: 2022,
    set: 'Panini Prizm',
    fingerprintHash: '2ac3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    features: generateMicroFeatures(17),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.50, 0.50, 0.51, 0.49],
    edgeProfile: [0.99, 0.98, 0.99, 0.98],
    printDotDensity: 0.968,
    uniquenessScore: 84,
    capturedAt: '2026-02-14T12:00:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-010',
    cardId: 'card-010',
    cardName: '1993 SP Derek Jeter #279',
    player: 'Derek Jeter',
    year: 1993,
    set: 'SP',
    fingerprintHash: '3bd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    features: generateMicroFeatures(23),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.47, 0.53, 0.46, 0.54],
    edgeProfile: [0.78, 0.81, 0.76, 0.80],
    printDotDensity: 0.789,
    uniquenessScore: 92,
    capturedAt: '2025-07-30T09:30:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-011',
    cardId: 'card-011',
    cardName: '2019 Panini Mosaic Ja Morant #219',
    player: 'Ja Morant',
    year: 2019,
    set: 'Panini Mosaic',
    fingerprintHash: '4ce5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    features: generateMicroFeatures(16),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.49, 0.51, 0.50, 0.50],
    edgeProfile: [0.94, 0.93, 0.95, 0.92],
    printDotDensity: 0.921,
    uniquenessScore: 82,
    capturedAt: '2026-02-28T17:15:00Z',
    imageHash: randomHex(64),
  },
  {
    id: 'fp-012',
    cardId: 'card-012',
    cardName: '1986 Fleer Michael Jordan #57 (Duplicate Scan)',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    fingerprintHash: 'a3f8d2e1b4c6789012345678abcdef0123456789abcdef0123456789abcdef01',
    features: generateMicroFeatures(24),
    surfacePatterns: generateSurfacePatterns(),
    centeringSignature: [0.48, 0.52, 0.49, 0.51],
    edgeProfile: [0.91, 0.87, 0.90, 0.84],
    printDotDensity: 0.843,
    uniquenessScore: 97,
    capturedAt: '2026-03-01T10:00:00Z',
    imageHash: randomHex(64),
  },
];

const MOCK_OWNERSHIP_CHAINS: Record<string, OwnershipChainEntry[]> = {
  'fp-001': [
    {
      id: 'oc-001a',
      fingerprintId: 'fp-001',
      ownerAlias: 'OriginalPuller_86',
      venue: 'card_show',
      transactionDate: '1987-03-15',
      price: 25,
      verificationMethod: 'manual_entry',
      confidence: 0.6,
    },
    {
      id: 'oc-001b',
      fingerprintId: 'fp-001',
      ownerAlias: 'VintageKingCollector',
      venue: 'card_show',
      transactionDate: '1998-08-22',
      price: 1200,
      verificationMethod: 'receipt_upload',
      confidence: 0.85,
    },
    {
      id: 'oc-001c',
      fingerprintId: 'fp-001',
      ownerAlias: 'HoopsDreams99',
      venue: 'ebay',
      transactionDate: '2005-11-10',
      price: 8500,
      verificationMethod: 'platform_api',
      confidence: 0.95,
    },
    {
      id: 'oc-001d',
      fingerprintId: 'fp-001',
      ownerAlias: 'InvestorMJ23',
      venue: 'auction_house',
      transactionDate: '2020-06-18',
      price: 95000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.99,
    },
    {
      id: 'oc-001e',
      fingerprintId: 'fp-001',
      ownerAlias: 'CurrentOwner',
      venue: 'private_sale',
      transactionDate: '2024-01-05',
      price: 142000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.99,
    },
  ],
  'fp-002': [
    {
      id: 'oc-002a',
      fingerprintId: 'fp-002',
      ownerAlias: 'CLE_Collector',
      venue: 'lcs',
      transactionDate: '2004-02-20',
      price: 80,
      verificationMethod: 'manual_entry',
      confidence: 0.65,
    },
    {
      id: 'oc-002b',
      fingerprintId: 'fp-002',
      ownerAlias: 'KingJamesCards',
      venue: 'ebay',
      transactionDate: '2012-09-14',
      price: 2400,
      verificationMethod: 'platform_api',
      confidence: 0.92,
    },
    {
      id: 'oc-002c',
      fingerprintId: 'fp-002',
      ownerAlias: 'PremiumHoops',
      venue: 'auction_house',
      transactionDate: '2021-03-30',
      price: 38000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.98,
    },
  ],
  'fp-003': [
    {
      id: 'oc-003a',
      fingerprintId: 'fp-003',
      ownerAlias: 'EstateOf_J.Williams',
      venue: 'auction_house',
      transactionDate: '1985-04-12',
      price: 3500,
      verificationMethod: 'manual_entry',
      confidence: 0.55,
    },
    {
      id: 'oc-003b',
      fingerprintId: 'fp-003',
      ownerAlias: 'ClassicCardsNYC',
      venue: 'auction_house',
      transactionDate: '1998-11-28',
      price: 45000,
      verificationMethod: 'receipt_upload',
      confidence: 0.82,
    },
    {
      id: 'oc-003c',
      fingerprintId: 'fp-003',
      ownerAlias: 'MickeyMCollector',
      venue: 'private_sale',
      transactionDate: '2008-07-04',
      price: 185000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.97,
    },
    {
      id: 'oc-003d',
      fingerprintId: 'fp-003',
      ownerAlias: 'VaultHoldings_LLC',
      venue: 'auction_house',
      transactionDate: '2022-08-15',
      price: 1250000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.99,
    },
  ],
  'fp-004': [
    {
      id: 'oc-004a',
      fingerprintId: 'fp-004',
      ownerAlias: 'ModernBreaker21',
      venue: 'ebay',
      transactionDate: '2019-05-11',
      price: 150,
      verificationMethod: 'platform_api',
      confidence: 0.90,
    },
    {
      id: 'oc-004b',
      fingerprintId: 'fp-004',
      ownerAlias: 'LukaFanatic',
      venue: 'card_show',
      transactionDate: '2022-01-20',
      price: 4200,
      verificationMethod: 'fingerprint_match',
      confidence: 0.96,
    },
  ],
  'fp-007': [
    {
      id: 'oc-007a',
      fingerprintId: 'fp-007',
      ownerAlias: 'CanadianIce79',
      venue: 'lcs',
      transactionDate: '1980-01-15',
      price: 8,
      verificationMethod: 'manual_entry',
      confidence: 0.50,
    },
    {
      id: 'oc-007b',
      fingerprintId: 'fp-007',
      ownerAlias: 'HockeyHall_Fan',
      venue: 'card_show',
      transactionDate: '1995-06-22',
      price: 2800,
      verificationMethod: 'receipt_upload',
      confidence: 0.78,
    },
    {
      id: 'oc-007c',
      fingerprintId: 'fp-007',
      ownerAlias: 'GretzkyVault',
      venue: 'auction_house',
      transactionDate: '2016-11-05',
      price: 125000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.97,
    },
    {
      id: 'oc-007d',
      fingerprintId: 'fp-007',
      ownerAlias: 'NorthernCollector',
      venue: 'private_sale',
      transactionDate: '2024-09-01',
      price: 320000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.99,
    },
  ],
  'fp-010': [
    {
      id: 'oc-010a',
      fingerprintId: 'fp-010',
      ownerAlias: 'YankeesFan93',
      venue: 'lcs',
      transactionDate: '1994-04-10',
      price: 45,
      verificationMethod: 'manual_entry',
      confidence: 0.60,
    },
    {
      id: 'oc-010b',
      fingerprintId: 'fp-010',
      ownerAlias: 'DerekJ_Collection',
      venue: 'ebay',
      transactionDate: '2010-08-30',
      price: 3800,
      verificationMethod: 'platform_api',
      confidence: 0.91,
    },
    {
      id: 'oc-010c',
      fingerprintId: 'fp-010',
      ownerAlias: 'PinnacleInvestments',
      venue: 'auction_house',
      transactionDate: '2023-05-20',
      price: 28000,
      verificationMethod: 'fingerprint_match',
      confidence: 0.98,
    },
  ],
};

// ---- Service Functions ----

export async function scanCardFingerprint(imageData: string): Promise<FingerprintScanResult> {
  // Simulate AI processing with realistic 2s delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const id = `fp-scan-${Date.now()}`;
  const features = generateMicroFeatures(randomInt(14, 32));
  const surfacePatterns = generateSurfacePatterns();

  const fingerprint: CardFingerprint = {
    id,
    cardId: `card-scan-${Date.now()}`,
    cardName: 'Scanned Card',
    player: 'Unknown',
    year: 2024,
    set: 'Unknown',
    fingerprintHash: randomHex(64),
    features,
    surfacePatterns,
    centeringSignature: [
      randomFloat(0.44, 0.56),
      randomFloat(0.44, 0.56),
      randomFloat(0.44, 0.56),
      randomFloat(0.44, 0.56),
    ],
    edgeProfile: [
      randomFloat(0.60, 0.99),
      randomFloat(0.60, 0.99),
      randomFloat(0.60, 0.99),
      randomFloat(0.60, 0.99),
    ],
    printDotDensity: randomFloat(0.70, 0.98),
    uniquenessScore: randomInt(75, 99),
    capturedAt: new Date().toISOString(),
    imageHash: randomHex(64),
  };

  const warnings: string[] = [];
  if (fingerprint.printDotDensity < 0.75) warnings.push('Low print quality detected — results may vary');
  if (features.length < 16) warnings.push('Fewer micro-features than optimal — consider re-scanning');

  return {
    fingerprint,
    scanDuration: randomInt(1800, 2400),
    featuresDetected: features.length,
    qualityScore: randomInt(72, 98),
    warnings,
  };
}

export async function searchForMatches(fingerprint: CardFingerprint): Promise<FingerprintMatch[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Simulate matching — fp-012 intentionally matches fp-001
  const matches: FingerprintMatch[] = [];

  // Always return some matches for demo purposes
  const candidates = MOCK_FINGERPRINTS.filter((fp) => fp.id !== fingerprint.id);
  const numMatches = randomInt(1, 3);

  for (let i = 0; i < Math.min(numMatches, candidates.length); i++) {
    const candidate = candidates[i];
    const confidence = i === 0 ? randomFloat(85, 99, 1) : randomFloat(20, 65, 1);
    const matchType: FingerprintMatch['matchType'] =
      confidence >= 90 ? 'exact' : confidence >= 70 ? 'high' : confidence >= 40 ? 'partial' : 'low';

    const venues: VenueType[] = ['ebay', 'card_show', 'auction_house', 'lcs', 'private_sale'];

    matches.push({
      id: `match-${randomHex(6)}`,
      fingerprint: candidate,
      matchConfidence: confidence,
      matchedFeatures: Math.round((confidence / 100) * candidate.features.length),
      totalFeatures: candidate.features.length,
      matchType,
      lastSeenVenue: venues[randomInt(0, venues.length - 1)],
      lastSeenDate: `2025-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    });
  }

  return matches.sort((a, b) => b.matchConfidence - a.matchConfidence);
}

export function getOwnershipChain(fingerprintId: string): OwnershipChainEntry[] {
  return MOCK_OWNERSHIP_CHAINS[fingerprintId] ?? [];
}

export function getProvenanceScore(fingerprintId: string): ProvenanceScore {
  const chain = MOCK_OWNERSHIP_CHAINS[fingerprintId];
  if (!chain || chain.length === 0) {
    return {
      overall: 15,
      chainCompleteness: 0,
      verificationStrength: 0,
      ownershipConsistency: 20,
      timeCoverage: 10,
      flags: ['No ownership history recorded', 'Provenance unverifiable'],
      grade: 'F',
    };
  }

  const avgConfidence = chain.reduce((s, e) => s + e.confidence, 0) / chain.length;
  const fpMatches = chain.filter((e) => e.verificationMethod === 'fingerprint_match').length;
  const verificationStrength = Math.round((fpMatches / chain.length) * 100);

  const firstDate = new Date(chain[0].transactionDate).getTime();
  const lastDate = new Date(chain[chain.length - 1].transactionDate).getTime();
  const timeCoverage = Math.min(100, Math.round(((lastDate - firstDate) / (365.25 * 24 * 60 * 60 * 1000)) * 3));

  const chainCompleteness = Math.min(100, chain.length * 20);
  const ownershipConsistency = Math.round(avgConfidence * 100);

  const overall = Math.round(
    chainCompleteness * 0.25 +
      verificationStrength * 0.30 +
      ownershipConsistency * 0.25 +
      timeCoverage * 0.20
  );

  const flags: string[] = [];
  if (chainCompleteness < 60) flags.push('Incomplete ownership history');
  if (verificationStrength < 40) flags.push('Low fingerprint verification coverage');
  if (timeCoverage < 50) flags.push('Gaps in ownership timeline');

  const grade: ProvenanceScore['grade'] =
    overall >= 95 ? 'A+' : overall >= 85 ? 'A' : overall >= 75 ? 'B+' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 30 ? 'D' : 'F';

  return { overall, chainCompleteness, verificationStrength, ownershipConsistency, timeCoverage, flags, grade };
}

export function getFingerprintDatabase(): CardFingerprint[] {
  return [...MOCK_FINGERPRINTS];
}

export function compareFingerprints(idA: string, idB: string): FingerprintComparison {
  const fpA = MOCK_FINGERPRINTS.find((f) => f.id === idA);
  const fpB = MOCK_FINGERPRINTS.find((f) => f.id === idB);

  const isSameHash = fpA?.fingerprintHash === fpB?.fingerprintHash;
  const overallSimilarity = isSameHash ? randomFloat(96, 99.5, 1) : randomFloat(10, 55, 1);

  const types: MicroFeatureType[] = [
    'print_dot_cluster',
    'surface_anomaly',
    'edge_pattern',
    'centering_offset',
    'color_shift',
  ];

  const featureMatches = types.map((type) => ({
    featureType: type,
    similarity: isSameHash ? randomFloat(90, 99, 1) : randomFloat(5, 60, 1),
  }));

  const centeringSimilarity = isSameHash ? randomFloat(95, 99, 1) : randomFloat(20, 70, 1);
  const edgeSimilarity = isSameHash ? randomFloat(88, 98, 1) : randomFloat(15, 60, 1);
  const surfaceSimilarity = isSameHash ? randomFloat(92, 99, 1) : randomFloat(10, 55, 1);

  const verdict: FingerprintComparison['verdict'] =
    overallSimilarity >= 90
      ? 'same_card'
      : overallSimilarity >= 70
        ? 'likely_same'
        : overallSimilarity >= 45
          ? 'uncertain'
          : 'different';

  return {
    fingerprintA: idA,
    fingerprintB: idB,
    overallSimilarity,
    featureMatches,
    centeringSimilarity,
    edgeSimilarity,
    surfaceSimilarity,
    verdict,
  };
}

export function registerFingerprint(fingerprint: CardFingerprint): void {
  const exists = MOCK_FINGERPRINTS.some((f) => f.id === fingerprint.id);
  if (!exists) {
    MOCK_FINGERPRINTS.push(fingerprint);
  }
}

export function detectCounterfeit(fingerprint: CardFingerprint): CounterfeitResult {
  const flags: string[] = [];

  // Simulate counterfeit detection based on fingerprint characteristics
  if (fingerprint.printDotDensity < 0.75) flags.push('Print dot density below expected range');
  if (fingerprint.uniquenessScore < 70) flags.push('Low uniqueness — possible mass reproduction');
  if (Math.abs(fingerprint.centeringSignature[0] - fingerprint.centeringSignature[2]) > 0.08)
    flags.push('Centering asymmetry inconsistent with known prints');
  if (fingerprint.edgeProfile.some((e) => e < 0.5)) flags.push('Edge wear pattern inconsistent with stated age');
  if (fingerprint.features.length < 12) flags.push('Insufficient micro-features for reliable authentication');

  const isAuthentic = flags.length <= 1;
  const confidence = isAuthentic
    ? randomFloat(0.88, 0.99)
    : randomFloat(0.40, 0.75);

  return { isAuthentic, confidence, flags: flags.length === 0 ? ['No anomalies detected'] : flags };
}

export function getDatabaseStats(): {
  totalScanned: number;
  matchesFound: number;
  avgProvenance: number;
  recentScans: { date: string; count: number }[];
} {
  const fpIds = MOCK_FINGERPRINTS.map((f) => f.id);
  const scores = fpIds.map((id) => getProvenanceScore(id).overall);
  const avgProvenance = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  return {
    totalScanned: MOCK_FINGERPRINTS.length,
    matchesFound: 8,
    avgProvenance,
    recentScans: [
      { date: 'Jan', count: 3 },
      { date: 'Feb', count: 5 },
      { date: 'Mar', count: 4 },
      { date: 'Apr', count: 7 },
      { date: 'May', count: 6 },
      { date: 'Jun', count: 9 },
      { date: 'Jul', count: 8 },
      { date: 'Aug', count: 11 },
      { date: 'Sep', count: 10 },
      { date: 'Oct', count: 14 },
      { date: 'Nov', count: 12 },
      { date: 'Dec', count: 16 },
    ],
  };
}
