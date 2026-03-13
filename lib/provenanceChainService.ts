/**
 * Phase 107: Card DNA & Provenance Chain — "Carfax for Sports Cards"
 * Cross-platform tracking, fraud detection, and digital fingerprinting.
 * NO competitor offers this level of provenance intelligence.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardFingerprint {
  id: string;
  surfaceMicroPatterns: number[];      // 64-point micro-pattern hash
  printingArtifacts: string[];         // detected printing anomalies
  centeringMeasurements: {
    leftRight: number;                 // percentage shift L/R (50/50 = perfect)
    topBottom: number;                 // percentage shift T/B
    overallGrade: 'A' | 'B' | 'C' | 'D';
  };
  edgeProfile: number[];              // 32-point edge wear signature
  colorCalibration: { r: number; g: number; b: number; delta: number };
  hashDigest: string;                  // SHA-256 of combined biometrics
  confidence: number;                  // 0-100 match confidence
  createdAt: string;
}

export interface ProvenanceRecord {
  id: string;
  cardId: string;
  eventType: 'registered' | 'sold' | 'listed' | 'graded' | 'authenticated' | 'transferred' | 'vaulted' | 'exhibited' | 'flagged';
  platform: string;
  price?: number;
  fromOwner: string;
  toOwner: string;
  timestamp: string;
  transactionRef?: string;
  verified: boolean;
  notes?: string;
}

export interface OwnershipEntry {
  owner: string;
  acquiredDate: string;
  soldDate?: string;
  acquiredPrice?: number;
  soldPrice?: number;
  platform: string;
  holdingPeriodDays: number;
  verified: boolean;
}

export type FraudType =
  | 'duplicate_listing'
  | 'cert_mismatch'
  | 'grade_appearance_mismatch'
  | 'counterfeit_slab'
  | 'trimmed_card'
  | 'resubmission_fraud'
  | 'stolen_card';

export interface FraudAlert {
  id: string;
  cardId: string;
  cardName: string;
  fraudType: FraudType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: string;
  platforms: string[];
  evidence: string[];
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  estimatedValueAtRisk: number;
}

export interface DigitalTwin {
  id: string;
  cardId: string;
  playerName: string;
  cardDescription: string;
  year: number;
  manufacturer: string;
  setName: string;
  cardNumber: string;
  grade?: string;
  gradingCompany?: string;
  certNumber?: string;
  fingerprint: CardFingerprint;
  provenanceTimeline: ProvenanceRecord[];
  ownershipHistory: OwnershipEntry[];
  authenticityScore: number;
  currentValue: number;
  registeredAt: string;
  lastVerified: string;
  status: 'verified' | 'pending' | 'flagged' | 'investigating';
  imageUrl: string;
  owner: string;
}

export interface CrossPlatformSighting {
  id: string;
  certNumber: string;
  cardName: string;
  platform: string;
  listingUrl: string;
  price: number;
  listingDate: string;
  sellerName: string;
  sellerRating: number;
  status: 'active' | 'sold' | 'ended' | 'removed';
  matchConfidence: number;
  flagged: boolean;
  flagReason?: string;
}

export interface AuthenticityScore {
  overall: number;
  fingerprintMatch: number;
  provenanceIntegrity: number;
  fraudIndicators: number;
  gradeConsistency: number;
  slabVerification: number;
  breakdown: { category: string; score: number; weight: number; notes: string }[];
}

export interface ProvenanceReport {
  cardId: string;
  cardName: string;
  digitalTwin: DigitalTwin;
  authenticityScore: AuthenticityScore;
  timeline: ProvenanceRecord[];
  ownershipChain: OwnershipEntry[];
  crossPlatformSightings: CrossPlatformSighting[];
  fraudAlerts: FraudAlert[];
  valueHistory: { date: string; value: number; platform: string }[];
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
}

export interface RegistryStats {
  totalCardsRegistered: number;
  fraudPrevented: number;
  valueProtected: number;
  activeFraudAlerts: number;
  verificationsThisMonth: number;
  crossPlatformSightings: number;
  averageAuthenticityScore: number;
  topProtectedPlayers: { player: string; cardCount: number; totalValue: number }[];
}

export interface VerificationResult {
  verified: boolean;
  authenticityScore: number;
  fraudFlags: FraudAlert[];
  provenanceTimeline: ProvenanceRecord[];
  crossPlatformSightings: CrossPlatformSighting[];
  recommendation: 'safe_to_buy' | 'proceed_with_caution' | 'do_not_buy' | 'needs_investigation';
  summary: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateFingerprint(): CardFingerprint {
  const micro = Array.from({ length: 64 }, () => Math.round(Math.random() * 255));
  const edge = Array.from({ length: 32 }, () => Math.round(Math.random() * 100));
  const hex = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  return {
    id: generateId('fp'),
    surfaceMicroPatterns: micro,
    printingArtifacts: ['Dot gain variance 2.3%', 'Rosette pattern consistent', 'Registration marks aligned'],
    centeringMeasurements: {
      leftRight: 48 + Math.random() * 4,
      topBottom: 49 + Math.random() * 2,
      overallGrade: 'A',
    },
    edgeProfile: edge,
    colorCalibration: { r: 128, g: 64, b: 192, delta: 1.2 + Math.random() },
    hashDigest: hex,
    confidence: 92 + Math.random() * 8,
    createdAt: new Date().toISOString(),
  };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ---------------------------------------------------------------------------
// Mock Data — Digital Twins (registered cards)
// ---------------------------------------------------------------------------

const MOCK_TWINS: DigitalTwin[] = [
  {
    id: 'dt-001',
    cardId: 'card-judge-chrome',
    playerName: 'Aaron Judge',
    cardDescription: '2017 Topps Chrome Update #HMT40 RC PSA 10',
    year: 2017,
    manufacturer: 'Topps',
    setName: 'Chrome Update',
    cardNumber: 'HMT40',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    certNumber: '45892341',
    fingerprint: generateFingerprint(),
    provenanceTimeline: [
      { id: 'pr-001', cardId: 'card-judge-chrome', eventType: 'registered', platform: 'MSI Registry', price: undefined, fromOwner: 'System', toOwner: 'OriginalOwner42', timestamp: '2017-06-15T00:00:00Z', verified: true, notes: 'Pulled from hobby box' },
      { id: 'pr-002', cardId: 'card-judge-chrome', eventType: 'graded', platform: 'PSA', price: undefined, fromOwner: 'OriginalOwner42', toOwner: 'PSA', timestamp: '2018-02-20T00:00:00Z', transactionRef: 'PSA-45892341', verified: true, notes: 'Gem Mint 10' },
      { id: 'pr-003', cardId: 'card-judge-chrome', eventType: 'sold', platform: 'Goldin', price: 4200, fromOwner: 'OriginalOwner42', toOwner: 'CardKing88', timestamp: '2023-01-18T00:00:00Z', transactionRef: 'GOLDIN-2023-44821', verified: true },
      { id: 'pr-004', cardId: 'card-judge-chrome', eventType: 'listed', platform: 'eBay', price: 4800, fromOwner: 'CardKing88', toOwner: '', timestamp: '2023-03-05T00:00:00Z', transactionRef: 'EBAY-325891247', verified: true },
      { id: 'pr-005', cardId: 'card-judge-chrome', eventType: 'sold', platform: 'eBay', price: 4600, fromOwner: 'CardKing88', toOwner: 'ProCollector', timestamp: '2023-03-22T00:00:00Z', transactionRef: 'EBAY-325891247', verified: true },
      { id: 'pr-006', cardId: 'card-judge-chrome', eventType: 'sold', platform: 'Alt', price: 3900, fromOwner: 'ProCollector', toOwner: 'You', timestamp: '2024-07-15T00:00:00Z', transactionRef: 'ALT-2024-99102', verified: true },
      { id: 'pr-007', cardId: 'card-judge-chrome', eventType: 'vaulted', platform: 'PWCC Vault', price: undefined, fromOwner: 'You', toOwner: 'PWCC Vault', timestamp: '2024-08-01T00:00:00Z', verified: true, notes: 'Portland OR facility' },
    ],
    ownershipHistory: [
      { owner: 'OriginalOwner42', acquiredDate: '2017-06-15', soldDate: '2023-01-18', acquiredPrice: 25, soldPrice: 4200, platform: 'Goldin', holdingPeriodDays: 2043, verified: true },
      { owner: 'CardKing88', acquiredDate: '2023-01-18', soldDate: '2023-03-22', acquiredPrice: 4200, soldPrice: 4600, platform: 'eBay', holdingPeriodDays: 63, verified: true },
      { owner: 'ProCollector', acquiredDate: '2023-03-22', soldDate: '2024-07-15', acquiredPrice: 4600, soldPrice: 3900, platform: 'Alt', holdingPeriodDays: 481, verified: true },
      { owner: 'You', acquiredDate: '2024-07-15', platform: 'Alt', acquiredPrice: 3900, holdingPeriodDays: 243, verified: true },
    ],
    authenticityScore: 97,
    currentValue: 4100,
    registeredAt: '2024-08-01T00:00:00Z',
    lastVerified: '2026-02-15T00:00:00Z',
    status: 'verified',
    imageUrl: '',
    owner: 'You',
  },
  {
    id: 'dt-002',
    cardId: 'card-ohtani-bowman',
    playerName: 'Shohei Ohtani',
    cardDescription: '2018 Bowman Chrome #1 RC BGS 9.5',
    year: 2018,
    manufacturer: 'Bowman',
    setName: 'Chrome',
    cardNumber: '1',
    grade: 'BGS 9.5',
    gradingCompany: 'BGS',
    certNumber: '0013456789',
    fingerprint: generateFingerprint(),
    provenanceTimeline: [
      { id: 'pr-010', cardId: 'card-ohtani-bowman', eventType: 'registered', platform: 'MSI Registry', fromOwner: 'System', toOwner: 'HobbyBreaker', timestamp: '2018-05-01T00:00:00Z', verified: true },
      { id: 'pr-011', cardId: 'card-ohtani-bowman', eventType: 'graded', platform: 'BGS', fromOwner: 'HobbyBreaker', toOwner: 'BGS', timestamp: '2019-01-15T00:00:00Z', transactionRef: 'BGS-0013456789', verified: true, notes: 'Gem Mint 9.5' },
      { id: 'pr-012', cardId: 'card-ohtani-bowman', eventType: 'sold', platform: 'Heritage', price: 2400, fromOwner: 'HobbyBreaker', toOwner: 'VintageKing', timestamp: '2021-08-20T00:00:00Z', transactionRef: 'HER-2021-88432', verified: true },
      { id: 'pr-013', cardId: 'card-ohtani-bowman', eventType: 'sold', platform: 'COMC', price: 3200, fromOwner: 'VintageKing', toOwner: 'You', timestamp: '2023-11-10T00:00:00Z', transactionRef: 'COMC-2023-55102', verified: true },
      { id: 'pr-014', cardId: 'card-ohtani-bowman', eventType: 'authenticated', platform: 'MSI Registry', fromOwner: 'You', toOwner: 'MSI Auth', timestamp: '2024-01-05T00:00:00Z', verified: true, notes: 'Fingerprint verified 98.4% match' },
    ],
    ownershipHistory: [
      { owner: 'HobbyBreaker', acquiredDate: '2018-05-01', soldDate: '2021-08-20', acquiredPrice: 15, soldPrice: 2400, platform: 'Heritage', holdingPeriodDays: 1207, verified: true },
      { owner: 'VintageKing', acquiredDate: '2021-08-20', soldDate: '2023-11-10', acquiredPrice: 2400, soldPrice: 3200, platform: 'COMC', holdingPeriodDays: 813, verified: true },
      { owner: 'You', acquiredDate: '2023-11-10', platform: 'COMC', acquiredPrice: 3200, holdingPeriodDays: 488, verified: true },
    ],
    authenticityScore: 96,
    currentValue: 3600,
    registeredAt: '2024-01-05T00:00:00Z',
    lastVerified: '2026-01-20T00:00:00Z',
    status: 'verified',
    imageUrl: '',
    owner: 'You',
  },
  {
    id: 'dt-003',
    cardId: 'card-wemby-prizm',
    playerName: 'Victor Wembanyama',
    cardDescription: '2023 Panini Prizm Silver #1 PSA 10',
    year: 2023,
    manufacturer: 'Panini',
    setName: 'Prizm Silver',
    cardNumber: '1',
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    certNumber: '78452310',
    fingerprint: generateFingerprint(),
    provenanceTimeline: [
      { id: 'pr-020', cardId: 'card-wemby-prizm', eventType: 'registered', platform: 'MSI Registry', fromOwner: 'System', toOwner: 'BreaksRUs', timestamp: '2023-10-15T00:00:00Z', verified: true },
      { id: 'pr-021', cardId: 'card-wemby-prizm', eventType: 'graded', platform: 'PSA', fromOwner: 'BreaksRUs', toOwner: 'PSA', timestamp: '2024-01-20T00:00:00Z', transactionRef: 'PSA-78452310', verified: true },
      { id: 'pr-022', cardId: 'card-wemby-prizm', eventType: 'sold', platform: 'Goldin', price: 8500, fromOwner: 'BreaksRUs', toOwner: 'You', timestamp: '2024-04-12T00:00:00Z', transactionRef: 'GOLDIN-2024-12887', verified: true },
      { id: 'pr-023', cardId: 'card-wemby-prizm', eventType: 'authenticated', platform: 'MSI Registry', fromOwner: 'You', toOwner: 'MSI Auth', timestamp: '2024-04-20T00:00:00Z', verified: true, notes: 'Fingerprint match 99.1%' },
    ],
    ownershipHistory: [
      { owner: 'BreaksRUs', acquiredDate: '2023-10-15', soldDate: '2024-04-12', acquiredPrice: 50, soldPrice: 8500, platform: 'Goldin', holdingPeriodDays: 180, verified: true },
      { owner: 'You', acquiredDate: '2024-04-12', platform: 'Goldin', acquiredPrice: 8500, holdingPeriodDays: 335, verified: true },
    ],
    authenticityScore: 99,
    currentValue: 9200,
    registeredAt: '2024-04-20T00:00:00Z',
    lastVerified: '2026-03-01T00:00:00Z',
    status: 'verified',
    imageUrl: '',
    owner: 'You',
  },
  {
    id: 'dt-004',
    cardId: 'card-trout-update',
    playerName: 'Mike Trout',
    cardDescription: '2011 Topps Update #US175 RC PSA 9',
    year: 2011,
    manufacturer: 'Topps',
    setName: 'Update',
    cardNumber: 'US175',
    grade: 'PSA 9',
    gradingCompany: 'PSA',
    certNumber: '29384756',
    fingerprint: generateFingerprint(),
    provenanceTimeline: [
      { id: 'pr-030', cardId: 'card-trout-update', eventType: 'registered', platform: 'MSI Registry', fromOwner: 'System', toOwner: 'CardShop_LA', timestamp: '2011-11-01T00:00:00Z', verified: true },
      { id: 'pr-031', cardId: 'card-trout-update', eventType: 'graded', platform: 'PSA', fromOwner: 'CardShop_LA', toOwner: 'PSA', timestamp: '2013-03-10T00:00:00Z', transactionRef: 'PSA-29384756', verified: true },
      { id: 'pr-032', cardId: 'card-trout-update', eventType: 'sold', platform: 'eBay', price: 350, fromOwner: 'CardShop_LA', toOwner: 'TroutFan99', timestamp: '2014-06-22T00:00:00Z', verified: true },
      { id: 'pr-033', cardId: 'card-trout-update', eventType: 'sold', platform: 'Heritage', price: 1800, fromOwner: 'TroutFan99', toOwner: 'InvestorJoe', timestamp: '2019-07-14T00:00:00Z', transactionRef: 'HER-2019-12004', verified: true },
      { id: 'pr-034', cardId: 'card-trout-update', eventType: 'sold', platform: 'Goldin', price: 3200, fromOwner: 'InvestorJoe', toOwner: 'CardVault_NYC', timestamp: '2021-03-05T00:00:00Z', transactionRef: 'GOLDIN-2021-55890', verified: true },
      { id: 'pr-035', cardId: 'card-trout-update', eventType: 'sold', platform: 'Alt', price: 2100, fromOwner: 'CardVault_NYC', toOwner: 'You', timestamp: '2025-01-20T00:00:00Z', transactionRef: 'ALT-2025-33201', verified: true },
    ],
    ownershipHistory: [
      { owner: 'CardShop_LA', acquiredDate: '2011-11-01', soldDate: '2014-06-22', acquiredPrice: 5, soldPrice: 350, platform: 'eBay', holdingPeriodDays: 964, verified: true },
      { owner: 'TroutFan99', acquiredDate: '2014-06-22', soldDate: '2019-07-14', acquiredPrice: 350, soldPrice: 1800, platform: 'Heritage', holdingPeriodDays: 1848, verified: true },
      { owner: 'InvestorJoe', acquiredDate: '2019-07-14', soldDate: '2021-03-05', acquiredPrice: 1800, soldPrice: 3200, platform: 'Goldin', holdingPeriodDays: 600, verified: true },
      { owner: 'CardVault_NYC', acquiredDate: '2021-03-05', soldDate: '2025-01-20', acquiredPrice: 3200, soldPrice: 2100, platform: 'Alt', holdingPeriodDays: 1417, verified: true },
      { owner: 'You', acquiredDate: '2025-01-20', platform: 'Alt', acquiredPrice: 2100, holdingPeriodDays: 52, verified: true },
    ],
    authenticityScore: 94,
    currentValue: 2300,
    registeredAt: '2025-01-25T00:00:00Z',
    lastVerified: '2026-02-28T00:00:00Z',
    status: 'verified',
    imageUrl: '',
    owner: 'You',
  },
  {
    id: 'dt-005',
    cardId: 'card-soto-chrome',
    playerName: 'Juan Soto',
    cardDescription: '2018 Topps Chrome #71 RC BGS 9.5',
    year: 2018,
    manufacturer: 'Topps',
    setName: 'Chrome',
    cardNumber: '71',
    grade: 'BGS 9.5',
    gradingCompany: 'BGS',
    certNumber: '0019887654',
    fingerprint: generateFingerprint(),
    provenanceTimeline: [
      { id: 'pr-040', cardId: 'card-soto-chrome', eventType: 'registered', platform: 'MSI Registry', fromOwner: 'System', toOwner: 'PackRipper', timestamp: '2018-09-01T00:00:00Z', verified: true },
      { id: 'pr-041', cardId: 'card-soto-chrome', eventType: 'graded', platform: 'BGS', fromOwner: 'PackRipper', toOwner: 'BGS', timestamp: '2019-04-15T00:00:00Z', transactionRef: 'BGS-0019887654', verified: true },
      { id: 'pr-042', cardId: 'card-soto-chrome', eventType: 'sold', platform: 'eBay', price: 680, fromOwner: 'PackRipper', toOwner: 'You', timestamp: '2022-08-30T00:00:00Z', transactionRef: 'EBAY-445521098', verified: true },
    ],
    ownershipHistory: [
      { owner: 'PackRipper', acquiredDate: '2018-09-01', soldDate: '2022-08-30', acquiredPrice: 8, soldPrice: 680, platform: 'eBay', holdingPeriodDays: 1460, verified: true },
      { owner: 'You', acquiredDate: '2022-08-30', platform: 'eBay', acquiredPrice: 680, holdingPeriodDays: 925, verified: true },
    ],
    authenticityScore: 93,
    currentValue: 950,
    registeredAt: '2022-09-05T00:00:00Z',
    lastVerified: '2026-03-05T00:00:00Z',
    status: 'verified',
    imageUrl: '',
    owner: 'You',
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Fraud Alerts
// ---------------------------------------------------------------------------

const MOCK_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'fraud-001',
    cardId: 'card-unknown-1',
    cardName: '2023 Panini Prizm Silver Victor Wembanyama #1 PSA 10',
    fraudType: 'duplicate_listing',
    severity: 'critical',
    description: 'Same cert #78452310 found listed simultaneously on eBay and Goldin. Your registered card is vaulted — this listing is fraudulent.',
    detectedAt: '2026-03-10T14:22:00Z',
    platforms: ['eBay', 'Goldin'],
    evidence: [
      'Cert #78452310 matches your registered Wembanyama Prizm Silver',
      'Card is currently in PWCC Vault — cannot be listed elsewhere',
      'Listing images show different slab label font than authentic PSA labels',
      'Seller account created 3 days ago with zero feedback',
    ],
    status: 'active',
    estimatedValueAtRisk: 9200,
  },
  {
    id: 'fraud-002',
    cardId: 'card-unknown-2',
    cardName: '2011 Topps Update Mike Trout #US175 PSA 10',
    fraudType: 'grade_appearance_mismatch',
    severity: 'high',
    description: 'eBay listing claims PSA 10, but image analysis shows visible corner wear inconsistent with Gem Mint grade. Likely re-holdered or counterfeit slab.',
    detectedAt: '2026-03-08T09:15:00Z',
    platforms: ['eBay'],
    evidence: [
      'Corner wear detected in upper-left: 85% confidence not Gem Mint',
      'Slab barcode scans to different cert number than label shows',
      'Price ($1,200) is 60% below recent PSA 10 comps ($3,100)',
      'Seller has 3 negative feedback for "not as described" in last 30 days',
    ],
    status: 'active',
    estimatedValueAtRisk: 3100,
  },
  {
    id: 'fraud-003',
    cardId: 'card-unknown-3',
    cardName: '2018 Bowman Chrome Shohei Ohtani #1 BGS 9.5',
    fraudType: 'counterfeit_slab',
    severity: 'high',
    description: 'Counterfeit BGS slab detected. Label font spacing and hologram pattern do not match authentic BGS holders from 2019 era.',
    detectedAt: '2026-03-05T16:40:00Z',
    platforms: ['Alt'],
    evidence: [
      'BGS label uses incorrect font weight for grade numbers',
      'Hologram rotation angle off by 12 degrees from authentic',
      'Inner sleeve dimensions 0.3mm narrower than standard',
      'Card fingerprint does not match any registered Ohtani Chrome #1 BGS 9.5',
    ],
    status: 'investigating',
    estimatedValueAtRisk: 3600,
  },
  {
    id: 'fraud-004',
    cardId: 'card-unknown-4',
    cardName: '2020 Panini Prizm Justin Herbert #325 RC PSA 10',
    fraudType: 'trimmed_card',
    severity: 'medium',
    description: 'Edge analysis suggests possible trimming on left border. Card dimensions 0.2mm narrower than standard Prizm base cards.',
    detectedAt: '2026-02-28T11:00:00Z',
    platforms: ['COMC'],
    evidence: [
      'Left edge measures 0.2mm short of Panini Prizm standard width',
      'Micro-fiber pattern on left edge consistent with cutting tool',
      'Centering improved suspiciously — left/right 50.1/49.9 vs population average of 52/48',
    ],
    status: 'investigating',
    estimatedValueAtRisk: 450,
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Cross-Platform Sightings
// ---------------------------------------------------------------------------

const MOCK_SIGHTINGS: CrossPlatformSighting[] = [
  // Sightings for cert 45892341 (Judge Chrome)
  { id: 'sight-001', certNumber: '45892341', cardName: '2017 Topps Chrome Update Aaron Judge #HMT40 PSA 10', platform: 'Goldin', listingUrl: 'https://goldin.co/item/45892341', price: 4200, listingDate: '2023-01-10', sellerName: 'OriginalOwner42', sellerRating: 99.8, status: 'sold', matchConfidence: 99, flagged: false },
  { id: 'sight-002', certNumber: '45892341', cardName: '2017 Topps Chrome Update Aaron Judge #HMT40 PSA 10', platform: 'eBay', listingUrl: 'https://ebay.com/itm/325891247', price: 4800, listingDate: '2023-03-05', sellerName: 'CardKing88', sellerRating: 99.2, status: 'sold', matchConfidence: 98, flagged: false },
  { id: 'sight-003', certNumber: '45892341', cardName: '2017 Topps Chrome Update Aaron Judge #HMT40 PSA 10', platform: 'Alt', listingUrl: 'https://alt.xyz/listing/99102', price: 3900, listingDate: '2024-07-01', sellerName: 'ProCollector', sellerRating: 100, status: 'sold', matchConfidence: 99, flagged: false },
  // Fraudulent sighting for cert 78452310 (Wemby)
  { id: 'sight-010', certNumber: '78452310', cardName: '2023 Panini Prizm Silver Victor Wembanyama #1 PSA 10', platform: 'eBay', listingUrl: 'https://ebay.com/itm/998877665', price: 7500, listingDate: '2026-03-09', sellerName: 'cards4cheap_new', sellerRating: 0, status: 'active', matchConfidence: 94, flagged: true, flagReason: 'Card is registered in vault — listing is likely fraudulent' },
  { id: 'sight-011', certNumber: '78452310', cardName: '2023 Panini Prizm Silver Victor Wembanyama #1 PSA 10', platform: 'Goldin', listingUrl: 'https://goldin.co/item/78452310-copy', price: 8200, listingDate: '2026-03-10', sellerName: 'SportsCards_Direct', sellerRating: 45, status: 'active', matchConfidence: 91, flagged: true, flagReason: 'Duplicate listing — same cert already on eBay' },
  // Sightings for cert 0013456789 (Ohtani Bowman)
  { id: 'sight-020', certNumber: '0013456789', cardName: '2018 Bowman Chrome Shohei Ohtani #1 BGS 9.5', platform: 'Heritage', listingUrl: 'https://ha.com/itm/88432', price: 2400, listingDate: '2021-08-15', sellerName: 'HobbyBreaker', sellerRating: 100, status: 'sold', matchConfidence: 99, flagged: false },
  { id: 'sight-021', certNumber: '0013456789', cardName: '2018 Bowman Chrome Shohei Ohtani #1 BGS 9.5', platform: 'COMC', listingUrl: 'https://comc.com/card/55102', price: 3200, listingDate: '2023-11-01', sellerName: 'VintageKing', sellerRating: 99.5, status: 'sold', matchConfidence: 98, flagged: false },
  // Sightings for cert 29384756 (Trout)
  { id: 'sight-030', certNumber: '29384756', cardName: '2011 Topps Update Mike Trout #US175 PSA 9', platform: 'eBay', listingUrl: 'https://ebay.com/itm/223344556', price: 350, listingDate: '2014-06-15', sellerName: 'CardShop_LA', sellerRating: 99.9, status: 'sold', matchConfidence: 97, flagged: false },
  { id: 'sight-031', certNumber: '29384756', cardName: '2011 Topps Update Mike Trout #US175 PSA 9', platform: 'Heritage', listingUrl: 'https://ha.com/itm/12004', price: 1800, listingDate: '2019-07-10', sellerName: 'TroutFan99', sellerRating: 100, status: 'sold', matchConfidence: 99, flagged: false },
  { id: 'sight-032', certNumber: '29384756', cardName: '2011 Topps Update Mike Trout #US175 PSA 9', platform: 'Goldin', listingUrl: 'https://goldin.co/item/55890', price: 3200, listingDate: '2021-02-28', sellerName: 'InvestorJoe', sellerRating: 98, status: 'sold', matchConfidence: 98, flagged: false },
  { id: 'sight-033', certNumber: '29384756', cardName: '2011 Topps Update Mike Trout #US175 PSA 9', platform: 'Alt', listingUrl: 'https://alt.xyz/listing/33201', price: 2100, listingDate: '2025-01-15', sellerName: 'CardVault_NYC', sellerRating: 99, status: 'sold', matchConfidence: 99, flagged: false },
];

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

export function registerCard(
  cardData: {
    playerName: string;
    cardDescription: string;
    year: number;
    manufacturer: string;
    setName: string;
    cardNumber: string;
    grade?: string;
    gradingCompany?: string;
    certNumber?: string;
    currentValue?: number;
  },
  _images: File[] | string[]
): DigitalTwin {
  const fingerprint = generateFingerprint();
  const twin: DigitalTwin = {
    id: generateId('dt'),
    cardId: generateId('card'),
    playerName: cardData.playerName,
    cardDescription: cardData.cardDescription,
    year: cardData.year,
    manufacturer: cardData.manufacturer,
    setName: cardData.setName,
    cardNumber: cardData.cardNumber,
    grade: cardData.grade,
    gradingCompany: cardData.gradingCompany,
    certNumber: cardData.certNumber,
    fingerprint,
    provenanceTimeline: [
      {
        id: generateId('pr'),
        cardId: '',
        eventType: 'registered',
        platform: 'MSI Registry',
        fromOwner: 'System',
        toOwner: 'You',
        timestamp: new Date().toISOString(),
        verified: true,
        notes: 'Initial registration — digital fingerprint created',
      },
    ],
    ownershipHistory: [
      {
        owner: 'You',
        acquiredDate: new Date().toISOString().split('T')[0],
        platform: 'MSI Registry',
        acquiredPrice: cardData.currentValue,
        holdingPeriodDays: 0,
        verified: true,
      },
    ],
    authenticityScore: fingerprint.confidence,
    currentValue: cardData.currentValue ?? 0,
    registeredAt: new Date().toISOString(),
    lastVerified: new Date().toISOString(),
    status: 'pending',
    imageUrl: '',
    owner: 'You',
  };
  twin.provenanceTimeline[0].cardId = twin.cardId;
  // In production this would persist to database
  return twin;
}

export function getProvenanceTimeline(cardId: string): ProvenanceRecord[] {
  const twin = MOCK_TWINS.find(t => t.cardId === cardId);
  return twin?.provenanceTimeline ?? [];
}

export function detectFraud(cardId: string): FraudAlert[] {
  // Returns any fraud alerts related to this card
  const twin = MOCK_TWINS.find(t => t.cardId === cardId);
  if (!twin) return [];
  // Check for alerts referencing this card's cert number
  const related = MOCK_FRAUD_ALERTS.filter(
    a => a.cardName.toLowerCase().includes(twin.playerName.toLowerCase())
      || (twin.certNumber && a.evidence.some(e => e.includes(twin.certNumber!)))
  );
  return related;
}

export function getCrossPlatformSightings(certNumber: string): CrossPlatformSighting[] {
  return MOCK_SIGHTINGS.filter(s => s.certNumber === certNumber);
}

export function getAuthenticityScore(cardId: string): AuthenticityScore {
  const twin = MOCK_TWINS.find(t => t.cardId === cardId);
  const base = twin?.authenticityScore ?? 85;
  const fingerprintMatch = Math.min(100, base + 1);
  const provenanceIntegrity = Math.min(100, base - 1);
  const fraudInd = twin ? (detectFraud(cardId).length === 0 ? 100 : 60) : 70;
  const gradeConsistency = Math.min(100, base + 2);
  const slabVerification = Math.min(100, base);

  return {
    overall: base,
    fingerprintMatch,
    provenanceIntegrity,
    fraudIndicators: fraudInd,
    gradeConsistency,
    slabVerification,
    breakdown: [
      { category: 'Fingerprint Match', score: fingerprintMatch, weight: 0.30, notes: 'Surface micro-pattern analysis against registered fingerprint' },
      { category: 'Provenance Integrity', score: provenanceIntegrity, weight: 0.25, notes: 'Unbroken chain of ownership with verified transactions' },
      { category: 'Fraud Indicators', score: fraudInd, weight: 0.20, notes: fraudInd === 100 ? 'No fraud flags detected' : 'Active fraud alert — duplicate listing detected' },
      { category: 'Grade Consistency', score: gradeConsistency, weight: 0.15, notes: 'Visual appearance matches declared grade' },
      { category: 'Slab Verification', score: slabVerification, weight: 0.10, notes: 'Holder and label match grading company standards' },
    ],
  };
}

export function getRegistryStats(): RegistryStats {
  const totalValue = MOCK_TWINS.reduce((s, t) => s + t.currentValue, 0);
  const fraudValue = MOCK_FRAUD_ALERTS.reduce((s, a) => s + a.estimatedValueAtRisk, 0);
  return {
    totalCardsRegistered: MOCK_TWINS.length + 1847, // simulated broader registry
    fraudPrevented: 23,
    valueProtected: totalValue + 2_340_000,
    activeFraudAlerts: MOCK_FRAUD_ALERTS.filter(a => a.status === 'active').length,
    verificationsThisMonth: 342,
    crossPlatformSightings: MOCK_SIGHTINGS.length + 12_450,
    averageAuthenticityScore: Math.round(MOCK_TWINS.reduce((s, t) => s + t.authenticityScore, 0) / MOCK_TWINS.length),
    topProtectedPlayers: [
      { player: 'Victor Wembanyama', cardCount: 312, totalValue: 890_000 },
      { player: 'Aaron Judge', cardCount: 287, totalValue: 720_000 },
      { player: 'Shohei Ohtani', cardCount: 256, totalValue: 680_000 },
      { player: 'Mike Trout', cardCount: 198, totalValue: 540_000 },
      { player: 'Juan Soto', cardCount: 174, totalValue: 320_000 },
    ],
  };
}

export function verifyBeforePurchase(listingUrl: string): VerificationResult {
  // Simulate URL parsing and registry lookup
  const isSuspicious = listingUrl.includes('cards4cheap') || listingUrl.includes('998877');
  const matchingAlerts = isSuspicious ? MOCK_FRAUD_ALERTS.filter(a => a.status === 'active').slice(0, 1) : [];

  if (isSuspicious) {
    return {
      verified: false,
      authenticityScore: 23,
      fraudFlags: matchingAlerts,
      provenanceTimeline: [],
      crossPlatformSightings: MOCK_SIGHTINGS.filter(s => s.flagged).slice(0, 2),
      recommendation: 'do_not_buy',
      summary: 'DANGER: This listing matches a known fraud alert. The cert number belongs to a card currently registered and vaulted by another collector. Do NOT purchase.',
    };
  }

  // Generic safe result for demo
  const twin = MOCK_TWINS[0];
  return {
    verified: true,
    authenticityScore: 94,
    fraudFlags: [],
    provenanceTimeline: twin.provenanceTimeline.slice(0, 3),
    crossPlatformSightings: MOCK_SIGHTINGS.filter(s => !s.flagged).slice(0, 2),
    recommendation: 'safe_to_buy',
    summary: 'This listing appears legitimate. Card has verified provenance history with 3 prior sales across reputable platforms. No fraud indicators detected.',
  };
}

export function getMyRegisteredCards(): DigitalTwin[] {
  return MOCK_TWINS.filter(t => t.owner === 'You');
}

export function getFraudAlerts(): FraudAlert[] {
  return MOCK_FRAUD_ALERTS;
}

export function getDigitalTwin(twinId: string): DigitalTwin | undefined {
  return MOCK_TWINS.find(t => t.id === twinId);
}

export function getDigitalTwinByCardId(cardId: string): DigitalTwin | undefined {
  return MOCK_TWINS.find(t => t.cardId === cardId);
}

export function getAllDigitalTwins(): DigitalTwin[] {
  return MOCK_TWINS;
}

export function getValueHistory(cardId: string): { date: string; value: number; platform: string }[] {
  const twin = MOCK_TWINS.find(t => t.cardId === cardId);
  if (!twin) return [];
  return twin.provenanceTimeline
    .filter(p => p.price != null)
    .map(p => ({ date: p.timestamp.split('T')[0], value: p.price!, platform: p.platform }));
}

export function getProvenanceReport(cardId: string): ProvenanceReport {
  const twin = MOCK_TWINS.find(t => t.cardId === cardId) ?? MOCK_TWINS[0];
  const authScore = getAuthenticityScore(cardId);
  const sightings = getCrossPlatformSightings(twin.certNumber ?? '');
  const alerts = detectFraud(cardId);
  const values = getValueHistory(cardId);
  const hasFraud = alerts.length > 0;

  return {
    cardId: twin.cardId,
    cardName: twin.cardDescription,
    digitalTwin: twin,
    authenticityScore: authScore,
    timeline: twin.provenanceTimeline,
    ownershipChain: twin.ownershipHistory,
    crossPlatformSightings: sightings,
    fraudAlerts: alerts,
    valueHistory: values,
    summary: hasFraud
      ? `This card has ${alerts.length} active fraud alert(s). Review immediately.`
      : `Verified authentic with ${twin.ownershipHistory.length} ownership transfers across ${new Set(twin.provenanceTimeline.map(p => p.platform)).size} platforms. No fraud indicators.`,
    riskLevel: hasFraud ? 'high' : 'low',
    generatedAt: new Date().toISOString(),
  };
}
