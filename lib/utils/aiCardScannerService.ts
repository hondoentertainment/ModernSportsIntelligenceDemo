import { store } from '../dal/syncStore';

// ---- Types ----

export type ScanStatus = 'pending' | 'scanning' | 'identified' | 'valued' | 'error';
export type CardCondition = 'gem_mint' | 'mint' | 'near_mint' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ScanResult {
  id: string;
  status: ScanStatus;
  timestamp: string;
  imageUrl: string;
  identifiedCard: {
    player: string;
    year: number;
    manufacturer: string;
    set: string;
    cardNumber: string;
    parallel: string | null;
    isAutographed: boolean;
    isNumbered: boolean;
    printRun: number | null;
  } | null;
  conditionAssessment: {
    overall: CardCondition;
    centering: { score: number; leftRight: string; topBottom: string };
    corners: { score: number; description: string };
    edges: { score: number; description: string };
    surface: { score: number; description: string };
    predictedGrade: { psa: string; bgs: string; sgc: string };
    gradeConfidence: number;
  } | null;
  valuation: {
    rawValue: number;
    gradedValues: { grade: string; value: number; roi: number }[];
    fairMarketValue: number;
    low: number;
    high: number;
    recentComps: number;
    confidenceScore: number;
    gradingRecommendation: {
      recommended: boolean;
      estimatedGrade: string;
      gradedValue: number;
      gradingCost: number;
      expectedROI: number;
      reasoning: string;
    };
  } | null;
  confidence: ConfidenceLevel;
  matchScore: number;
  alternatives: { player: string; set: string; similarity: number }[];
}

export interface ScanHistory {
  id: string;
  imageUrl: string;
  player: string;
  set: string;
  grade: string;
  value: number;
  timestamp: string;
  matchScore: number;
}

export interface ScannerStats {
  totalScans: number;
  totalValueScanned: number;
  avgMatchScore: number;
  accuracyRate: number;
  avgScanTime: number;
  scansByCategory: { sport: string; count: number }[];
  topScannedPlayers: { player: string; count: number; totalValue: number }[];
  gradingRecommendations: number;
  estimatedSavings: number;
}

export interface SetDatabase {
  manufacturer: string;
  year: number;
  setName: string;
  sport: string;
  totalCards: number;
  notableCards: string[];
}

export interface DetectionModel {
  name: string;
  version: string;
  accuracy: number;
  supported: string[];
  lastUpdated: string;
}

// ---- Constants ----

const STORAGE_KEY_SCANS = 'msi_card_scanner_scans';
const STORAGE_KEY_HISTORY = 'msi_card_scanner_history';
const STORAGE_KEY_STATS = 'msi_card_scanner_stats';

// ---- Storage helpers ----

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(key, data);
}

// ---- Deterministic helpers ----

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(4, '0')}`;
}

// ---- Condition / Confidence helpers ----

const CONDITION_LABELS: Record<CardCondition, string> = {
  gem_mint: 'Gem Mint',
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  very_good: 'Very Good',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
};

export function getConditionLabel(condition: CardCondition): string {
  return CONDITION_LABELS[condition] ?? condition;
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  return CONFIDENCE_COLORS[level] ?? '#94a3b8';
}

export function formatCurrency(n: number): string {
  if (n >= 1000) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return '$' + n.toFixed(2);
}

// ---- Mock Scan Results ----

const MOCK_SCAN_RESULTS: ScanResult[] = [
  {
    id: generateId('scan', 1),
    status: 'valued',
    timestamp: '2025-12-01T10:30:00Z',
    imageUrl: '/scans/bowman_chrome_holston.jpg',
    identifiedCard: {
      player: 'Jackson Holliday',
      year: 2023,
      manufacturer: 'Bowman',
      set: 'Bowman Chrome',
      cardNumber: 'BCP-1',
      parallel: 'Refractor',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 95, leftRight: '50/50', topBottom: '49/51' },
      corners: { score: 97, description: 'Sharp corners, no visible wear' },
      edges: { score: 96, description: 'Clean edges throughout' },
      surface: { score: 98, description: 'Pristine surface, no scratches' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 92,
    },
    valuation: {
      rawValue: 185,
      gradedValues: [
        { grade: 'PSA 10', value: 475, roi: 156.8 },
        { grade: 'PSA 9', value: 220, roi: 18.9 },
        { grade: 'BGS 9.5', value: 380, roi: 105.4 },
        { grade: 'BGS 10', value: 850, roi: 359.5 },
      ],
      fairMarketValue: 195,
      low: 150,
      high: 240,
      recentComps: 34,
      confidenceScore: 88,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 475,
        gradingCost: 30,
        expectedROI: 156.8,
        reasoning: 'Strong centering and corners suggest PSA 10 potential. Grading cost justified by significant value increase.',
      },
    },
    confidence: 'high',
    matchScore: 97,
    alternatives: [
      { player: 'Jackson Holliday', set: '2023 Bowman Chrome Draft', similarity: 82 },
      { player: 'Jackson Holliday', set: '2023 Bowman', similarity: 71 },
    ],
  },
  {
    id: generateId('scan', 2),
    status: 'valued',
    timestamp: '2025-12-02T14:15:00Z',
    imageUrl: '/scans/topps_wemby.jpg',
    identifiedCard: {
      player: 'Victor Wembanyama',
      year: 2024,
      manufacturer: 'Panini',
      set: 'Prizm',
      cardNumber: '282',
      parallel: 'Silver',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'near_mint',
      centering: { score: 82, leftRight: '55/45', topBottom: '52/48' },
      corners: { score: 90, description: 'Minor softness on top-left corner' },
      edges: { score: 91, description: 'Light edge wear visible under magnification' },
      surface: { score: 94, description: 'Clean surface, minor print line' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9' },
      gradeConfidence: 85,
    },
    valuation: {
      rawValue: 320,
      gradedValues: [
        { grade: 'PSA 10', value: 1200, roi: 275.0 },
        { grade: 'PSA 9', value: 520, roi: 62.5 },
        { grade: 'BGS 9.5', value: 880, roi: 175.0 },
        { grade: 'BGS 10', value: 2800, roi: 775.0 },
      ],
      fairMarketValue: 340,
      low: 280,
      high: 420,
      recentComps: 67,
      confidenceScore: 91,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 520,
        gradingCost: 30,
        expectedROI: 62.5,
        reasoning: 'Centering slightly off prevents PSA 10 but PSA 9 is highly likely. Good ROI on grading.',
      },
    },
    confidence: 'high',
    matchScore: 95,
    alternatives: [
      { player: 'Victor Wembanyama', set: '2024 Panini Select', similarity: 78 },
      { player: 'Victor Wembanyama', set: '2024 Panini Donruss', similarity: 65 },
    ],
  },
  {
    id: generateId('scan', 3),
    status: 'valued',
    timestamp: '2025-12-03T09:00:00Z',
    imageUrl: '/scans/topps_series1_ohtani.jpg',
    identifiedCard: {
      player: 'Shohei Ohtani',
      year: 2024,
      manufacturer: 'Topps',
      set: 'Series 1',
      cardNumber: '1',
      parallel: null,
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 90, leftRight: '51/49', topBottom: '50/50' },
      corners: { score: 93, description: 'Very sharp corners' },
      edges: { score: 94, description: 'Clean, crisp edges' },
      surface: { score: 95, description: 'Excellent surface quality' },
      predictedGrade: { psa: '9', bgs: '9.5', sgc: '10' },
      gradeConfidence: 88,
    },
    valuation: {
      rawValue: 12,
      gradedValues: [
        { grade: 'PSA 10', value: 85, roi: 608.3 },
        { grade: 'PSA 9', value: 25, roi: 108.3 },
        { grade: 'BGS 9.5', value: 55, roi: 358.3 },
        { grade: 'BGS 10', value: 250, roi: 1983.3 },
      ],
      fairMarketValue: 14,
      low: 8,
      high: 20,
      recentComps: 156,
      confidenceScore: 95,
      gradingRecommendation: {
        recommended: false,
        estimatedGrade: 'PSA 9',
        gradedValue: 25,
        gradingCost: 30,
        expectedROI: -16.7,
        reasoning: 'Grading cost exceeds value increase for base card at PSA 9. Only submit if you believe PSA 10 is achievable.',
      },
    },
    confidence: 'high',
    matchScore: 99,
    alternatives: [
      { player: 'Shohei Ohtani', set: '2024 Topps Series 2', similarity: 75 },
    ],
  },
  {
    id: generateId('scan', 4),
    status: 'valued',
    timestamp: '2025-12-04T16:45:00Z',
    imageUrl: '/scans/prizm_caleb.jpg',
    identifiedCard: {
      player: 'Caleb Williams',
      year: 2024,
      manufacturer: 'Panini',
      set: 'Prizm Draft Picks',
      cardNumber: '101',
      parallel: 'Blue Shimmer',
      isAutographed: false,
      isNumbered: true,
      printRun: 75,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 96, leftRight: '50/50', topBottom: '50/50' },
      corners: { score: 98, description: 'Razor-sharp corners' },
      edges: { score: 97, description: 'Flawless edges' },
      surface: { score: 96, description: 'Clean surface, excellent chrome finish' },
      predictedGrade: { psa: '10', bgs: '10', sgc: '10' },
      gradeConfidence: 94,
    },
    valuation: {
      rawValue: 450,
      gradedValues: [
        { grade: 'PSA 10', value: 1100, roi: 144.4 },
        { grade: 'PSA 9', value: 580, roi: 28.9 },
        { grade: 'BGS 9.5', value: 820, roi: 82.2 },
        { grade: 'BGS 10', value: 2200, roi: 388.9 },
      ],
      fairMarketValue: 480,
      low: 380,
      high: 575,
      recentComps: 12,
      confidenceScore: 78,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 1100,
        gradingCost: 30,
        expectedROI: 144.4,
        reasoning: 'Near-perfect condition with flawless centering. High confidence PSA 10 candidate with excellent ROI.',
      },
    },
    confidence: 'high',
    matchScore: 93,
    alternatives: [
      { player: 'Caleb Williams', set: '2024 Panini Prizm', similarity: 88 },
      { player: 'Caleb Williams', set: '2024 Bowman University', similarity: 62 },
    ],
  },
  {
    id: generateId('scan', 5),
    status: 'valued',
    timestamp: '2025-12-05T11:20:00Z',
    imageUrl: '/scans/optic_stroud.jpg',
    identifiedCard: {
      player: 'C.J. Stroud',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Donruss Optic',
      cardNumber: '201',
      parallel: 'Holo',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'near_mint',
      centering: { score: 85, leftRight: '53/47', topBottom: '51/49' },
      corners: { score: 88, description: 'Slight softness on bottom-right' },
      edges: { score: 90, description: 'Minimal edge wear' },
      surface: { score: 92, description: 'Clean surface' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9' },
      gradeConfidence: 82,
    },
    valuation: {
      rawValue: 75,
      gradedValues: [
        { grade: 'PSA 10', value: 280, roi: 273.3 },
        { grade: 'PSA 9', value: 110, roi: 46.7 },
        { grade: 'BGS 9.5', value: 200, roi: 166.7 },
        { grade: 'BGS 10', value: 620, roi: 726.7 },
      ],
      fairMarketValue: 80,
      low: 55,
      high: 100,
      recentComps: 45,
      confidenceScore: 86,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 110,
        gradingCost: 30,
        expectedROI: 46.7,
        reasoning: 'Moderate ROI expected at PSA 9. Worth submitting for the authentication value alone.',
      },
    },
    confidence: 'high',
    matchScore: 91,
    alternatives: [
      { player: 'C.J. Stroud', set: '2023 Panini Prizm', similarity: 80 },
    ],
  },
  {
    id: generateId('scan', 6),
    status: 'valued',
    timestamp: '2025-12-06T08:10:00Z',
    imageUrl: '/scans/select_luka.jpg',
    identifiedCard: {
      player: 'Luka Doncic',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Select',
      cardNumber: '45',
      parallel: 'Courtside Silver',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 91, leftRight: '51/49', topBottom: '51/49' },
      corners: { score: 94, description: 'Sharp corners throughout' },
      edges: { score: 93, description: 'Clean edges' },
      surface: { score: 95, description: 'Excellent surface, no flaws' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 80,
    },
    valuation: {
      rawValue: 140,
      gradedValues: [
        { grade: 'PSA 10', value: 380, roi: 171.4 },
        { grade: 'PSA 9', value: 175, roi: 25.0 },
        { grade: 'BGS 9.5', value: 290, roi: 107.1 },
        { grade: 'BGS 10', value: 750, roi: 435.7 },
      ],
      fairMarketValue: 150,
      low: 115,
      high: 185,
      recentComps: 52,
      confidenceScore: 84,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 380,
        gradingCost: 30,
        expectedROI: 171.4,
        reasoning: 'Good candidate for PSA 10 with strong centering. Luka cards hold value well when graded.',
      },
    },
    confidence: 'high',
    matchScore: 94,
    alternatives: [
      { player: 'Luka Doncic', set: '2023 Panini Prizm', similarity: 76 },
      { player: 'Luka Doncic', set: '2023 Panini Mosaic', similarity: 70 },
    ],
  },
  {
    id: generateId('scan', 7),
    status: 'valued',
    timestamp: '2025-12-07T13:30:00Z',
    imageUrl: '/scans/chrome_elly.jpg',
    identifiedCard: {
      player: 'Elly De La Cruz',
      year: 2023,
      manufacturer: 'Topps',
      set: 'Chrome',
      cardNumber: '150',
      parallel: 'Gold Refractor',
      isAutographed: false,
      isNumbered: true,
      printRun: 50,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 94, leftRight: '50/50', topBottom: '51/49' },
      corners: { score: 96, description: 'Extremely sharp' },
      edges: { score: 95, description: 'Perfect edges' },
      surface: { score: 97, description: 'Mirror-like chrome finish' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 90,
    },
    valuation: {
      rawValue: 680,
      gradedValues: [
        { grade: 'PSA 10', value: 1650, roi: 142.6 },
        { grade: 'PSA 9', value: 850, roi: 25.0 },
        { grade: 'BGS 9.5', value: 1300, roi: 91.2 },
        { grade: 'BGS 10', value: 3200, roi: 370.6 },
      ],
      fairMarketValue: 720,
      low: 580,
      high: 850,
      recentComps: 8,
      confidenceScore: 72,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 1650,
        gradingCost: 50,
        expectedROI: 142.6,
        reasoning: 'Low print run gold refractor in gem mint condition. Strong candidate for premium grading service tier.',
      },
    },
    confidence: 'high',
    matchScore: 96,
    alternatives: [
      { player: 'Elly De La Cruz', set: '2023 Bowman Chrome', similarity: 73 },
    ],
  },
  {
    id: generateId('scan', 8),
    status: 'valued',
    timestamp: '2025-12-08T10:00:00Z',
    imageUrl: '/scans/ud_bedard.jpg',
    identifiedCard: {
      player: 'Connor Bedard',
      year: 2024,
      manufacturer: 'Upper Deck',
      set: 'Young Guns',
      cardNumber: '201',
      parallel: null,
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'near_mint',
      centering: { score: 78, leftRight: '57/43', topBottom: '52/48' },
      corners: { score: 85, description: 'Minor corner wear on two corners' },
      edges: { score: 88, description: 'Light edge wear' },
      surface: { score: 91, description: 'Clean surface' },
      predictedGrade: { psa: '8', bgs: '8.5', sgc: '8.5' },
      gradeConfidence: 75,
    },
    valuation: {
      rawValue: 95,
      gradedValues: [
        { grade: 'PSA 10', value: 450, roi: 373.7 },
        { grade: 'PSA 9', value: 180, roi: 89.5 },
        { grade: 'PSA 8', value: 120, roi: 26.3 },
        { grade: 'BGS 9.5', value: 320, roi: 236.8 },
      ],
      fairMarketValue: 100,
      low: 75,
      high: 130,
      recentComps: 89,
      confidenceScore: 90,
      gradingRecommendation: {
        recommended: false,
        estimatedGrade: 'PSA 8',
        gradedValue: 120,
        gradingCost: 30,
        expectedROI: 26.3,
        reasoning: 'Centering issues limit grade potential. Marginal ROI at PSA 8 does not justify grading cost.',
      },
    },
    confidence: 'medium',
    matchScore: 88,
    alternatives: [
      { player: 'Connor Bedard', set: '2024 Upper Deck Series 1', similarity: 85 },
      { player: 'Connor Bedard', set: '2024 Upper Deck MVP', similarity: 60 },
    ],
  },
  {
    id: generateId('scan', 9),
    status: 'valued',
    timestamp: '2025-12-09T15:45:00Z',
    imageUrl: '/scans/mosaic_ant.jpg',
    identifiedCard: {
      player: 'Anthony Edwards',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Mosaic',
      cardNumber: '88',
      parallel: 'Genesis',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 89, leftRight: '52/48', topBottom: '50/50' },
      corners: { score: 92, description: 'Sharp corners, very minor softness' },
      edges: { score: 93, description: 'Clean edges' },
      surface: { score: 96, description: 'Beautiful mosaic pattern, no flaws' },
      predictedGrade: { psa: '9', bgs: '9.5', sgc: '9.5' },
      gradeConfidence: 83,
    },
    valuation: {
      rawValue: 210,
      gradedValues: [
        { grade: 'PSA 10', value: 650, roi: 209.5 },
        { grade: 'PSA 9', value: 290, roi: 38.1 },
        { grade: 'BGS 9.5', value: 480, roi: 128.6 },
        { grade: 'BGS 10', value: 1400, roi: 566.7 },
      ],
      fairMarketValue: 225,
      low: 175,
      high: 270,
      recentComps: 38,
      confidenceScore: 82,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 290,
        gradingCost: 30,
        expectedROI: 38.1,
        reasoning: 'Worth grading for authentication and modest value increase. Ant-Man cards have strong market demand.',
      },
    },
    confidence: 'high',
    matchScore: 92,
    alternatives: [
      { player: 'Anthony Edwards', set: '2023 Panini Prizm', similarity: 74 },
    ],
  },
  {
    id: generateId('scan', 10),
    status: 'valued',
    timestamp: '2025-12-10T12:00:00Z',
    imageUrl: '/scans/bowman1st_leiter.jpg',
    identifiedCard: {
      player: 'Jack Leiter',
      year: 2023,
      manufacturer: 'Bowman',
      set: 'Bowman 1st',
      cardNumber: 'B1-JL',
      parallel: 'Sapphire',
      isAutographed: true,
      isNumbered: true,
      printRun: 25,
    },
    conditionAssessment: {
      overall: 'near_mint',
      centering: { score: 86, leftRight: '54/46', topBottom: '51/49' },
      corners: { score: 91, description: 'Sharp corners' },
      edges: { score: 89, description: 'Minor edge imperfection' },
      surface: { score: 90, description: 'Auto is clean, surface has minor handling' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9' },
      gradeConfidence: 79,
    },
    valuation: {
      rawValue: 340,
      gradedValues: [
        { grade: 'PSA 10', value: 1200, roi: 252.9 },
        { grade: 'PSA 9', value: 520, roi: 52.9 },
        { grade: 'BGS 9.5', value: 880, roi: 158.8 },
        { grade: 'BGS 10', value: 2500, roi: 635.3 },
      ],
      fairMarketValue: 360,
      low: 280,
      high: 440,
      recentComps: 6,
      confidenceScore: 68,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 520,
        gradingCost: 50,
        expectedROI: 52.9,
        reasoning: 'Autographed Sapphire with low print run. Authentication alone adds significant value.',
      },
    },
    confidence: 'medium',
    matchScore: 86,
    alternatives: [
      { player: 'Jack Leiter', set: '2023 Bowman Chrome', similarity: 70 },
    ],
  },
  {
    id: generateId('scan', 11),
    status: 'valued',
    timestamp: '2025-12-11T09:30:00Z',
    imageUrl: '/scans/topps_heritage_judge.jpg',
    identifiedCard: {
      player: 'Aaron Judge',
      year: 2024,
      manufacturer: 'Topps',
      set: 'Heritage',
      cardNumber: '99',
      parallel: 'Chrome Refractor',
      isAutographed: false,
      isNumbered: true,
      printRun: 573,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 92, leftRight: '51/49', topBottom: '50/50' },
      corners: { score: 95, description: 'Very sharp' },
      edges: { score: 93, description: 'Clean' },
      surface: { score: 94, description: 'Excellent chrome surface' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 84,
    },
    valuation: {
      rawValue: 65,
      gradedValues: [
        { grade: 'PSA 10', value: 195, roi: 200.0 },
        { grade: 'PSA 9', value: 90, roi: 38.5 },
        { grade: 'BGS 9.5', value: 150, roi: 130.8 },
        { grade: 'BGS 10', value: 420, roi: 546.2 },
      ],
      fairMarketValue: 70,
      low: 50,
      high: 90,
      recentComps: 28,
      confidenceScore: 85,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 195,
        gradingCost: 30,
        expectedROI: 200.0,
        reasoning: 'Heritage Chrome Refractor with great centering. Strong PSA 10 candidate.',
      },
    },
    confidence: 'high',
    matchScore: 95,
    alternatives: [
      { player: 'Aaron Judge', set: '2024 Topps Series 1', similarity: 72 },
    ],
  },
  {
    id: generateId('scan', 12),
    status: 'valued',
    timestamp: '2025-12-12T14:00:00Z',
    imageUrl: '/scans/prizm_messi.jpg',
    identifiedCard: {
      player: 'Lionel Messi',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Prizm Premier League',
      cardNumber: '1',
      parallel: 'Gold',
      isAutographed: false,
      isNumbered: true,
      printRun: 10,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 97, leftRight: '50/50', topBottom: '50/50' },
      corners: { score: 98, description: 'Perfect corners' },
      edges: { score: 97, description: 'Flawless' },
      surface: { score: 99, description: 'Pristine gold surface' },
      predictedGrade: { psa: '10', bgs: '10', sgc: '10' },
      gradeConfidence: 96,
    },
    valuation: {
      rawValue: 4200,
      gradedValues: [
        { grade: 'PSA 10', value: 9500, roi: 126.2 },
        { grade: 'PSA 9', value: 5800, roi: 38.1 },
        { grade: 'BGS 9.5', value: 7500, roi: 78.6 },
        { grade: 'BGS 10', value: 18000, roi: 328.6 },
      ],
      fairMarketValue: 4500,
      low: 3500,
      high: 5800,
      recentComps: 3,
      confidenceScore: 62,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 9500,
        gradingCost: 150,
        expectedROI: 126.2,
        reasoning: 'Ultra-rare gold /10 in perfect condition. Must grade for authentication and significant value premium.',
      },
    },
    confidence: 'high',
    matchScore: 98,
    alternatives: [
      { player: 'Lionel Messi', set: '2023 Topps Chrome UCL', similarity: 55 },
    ],
  },
  {
    id: generateId('scan', 13),
    status: 'valued',
    timestamp: '2025-12-13T11:15:00Z',
    imageUrl: '/scans/donruss_richardson.jpg',
    identifiedCard: {
      player: 'Bijan Robinson',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Donruss',
      cardNumber: '301',
      parallel: 'Press Proof Blue',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'excellent',
      centering: { score: 75, leftRight: '58/42', topBottom: '55/45' },
      corners: { score: 82, description: 'Light rounding on corners' },
      edges: { score: 84, description: 'Minor wear visible' },
      surface: { score: 88, description: 'Light scratching on surface' },
      predictedGrade: { psa: '7', bgs: '7.5', sgc: '8' },
      gradeConfidence: 72,
    },
    valuation: {
      rawValue: 22,
      gradedValues: [
        { grade: 'PSA 10', value: 120, roi: 445.5 },
        { grade: 'PSA 9', value: 45, roi: 104.5 },
        { grade: 'PSA 7', value: 28, roi: 27.3 },
        { grade: 'BGS 9.5', value: 80, roi: 263.6 },
      ],
      fairMarketValue: 24,
      low: 15,
      high: 35,
      recentComps: 72,
      confidenceScore: 88,
      gradingRecommendation: {
        recommended: false,
        estimatedGrade: 'PSA 7',
        gradedValue: 28,
        gradingCost: 30,
        expectedROI: -72.7,
        reasoning: 'Condition issues limit grade. Grading cost exceeds any potential value increase at PSA 7.',
      },
    },
    confidence: 'medium',
    matchScore: 84,
    alternatives: [
      { player: 'Bijan Robinson', set: '2023 Panini Prizm', similarity: 72 },
      { player: 'Bijan Robinson', set: '2023 Panini Mosaic', similarity: 68 },
    ],
  },
  {
    id: generateId('scan', 14),
    status: 'valued',
    timestamp: '2025-12-14T16:00:00Z',
    imageUrl: '/scans/fleer_jordan.jpg',
    identifiedCard: {
      player: 'Michael Jordan',
      year: 1986,
      manufacturer: 'Fleer',
      set: 'Fleer',
      cardNumber: '57',
      parallel: null,
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'very_good',
      centering: { score: 70, leftRight: '60/40', topBottom: '55/45' },
      corners: { score: 72, description: 'Noticeable corner wear' },
      edges: { score: 75, description: 'Edge wear consistent with age' },
      surface: { score: 80, description: 'Some surface wear, no creases' },
      predictedGrade: { psa: '5', bgs: '5', sgc: '5.5' },
      gradeConfidence: 70,
    },
    valuation: {
      rawValue: 3500,
      gradedValues: [
        { grade: 'PSA 10', value: 780000, roi: 22185.7 },
        { grade: 'PSA 9', value: 52000, roi: 1385.7 },
        { grade: 'PSA 5', value: 5200, roi: 48.6 },
        { grade: 'BGS 9.5', value: 125000, roi: 3471.4 },
      ],
      fairMarketValue: 3800,
      low: 2800,
      high: 4500,
      recentComps: 22,
      confidenceScore: 80,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 5',
        gradedValue: 5200,
        gradingCost: 75,
        expectedROI: 48.6,
        reasoning: 'Iconic vintage card. Even at PSA 5, authentication adds significant value and buyer confidence.',
      },
    },
    confidence: 'high',
    matchScore: 99,
    alternatives: [],
  },
  {
    id: generateId('scan', 15),
    status: 'valued',
    timestamp: '2025-12-15T10:30:00Z',
    imageUrl: '/scans/topps_chrome_skenes.jpg',
    identifiedCard: {
      player: 'Paul Skenes',
      year: 2024,
      manufacturer: 'Topps',
      set: 'Chrome Update',
      cardNumber: 'USC-25',
      parallel: 'Refractor',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 93, leftRight: '50/50', topBottom: '51/49' },
      corners: { score: 97, description: 'Razor-sharp corners' },
      edges: { score: 96, description: 'Perfect edges' },
      surface: { score: 98, description: 'Flawless chrome surface' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 91,
    },
    valuation: {
      rawValue: 125,
      gradedValues: [
        { grade: 'PSA 10', value: 350, roi: 180.0 },
        { grade: 'PSA 9', value: 160, roi: 28.0 },
        { grade: 'BGS 9.5', value: 270, roi: 116.0 },
        { grade: 'BGS 10', value: 800, roi: 540.0 },
      ],
      fairMarketValue: 135,
      low: 100,
      high: 170,
      recentComps: 41,
      confidenceScore: 87,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 350,
        gradingCost: 30,
        expectedROI: 180.0,
        reasoning: 'Hot rookie in gem mint condition. Chrome Refractor with excellent PSA 10 potential.',
      },
    },
    confidence: 'high',
    matchScore: 94,
    alternatives: [
      { player: 'Paul Skenes', set: '2024 Bowman Chrome', similarity: 80 },
      { player: 'Paul Skenes', set: '2024 Topps Series 2', similarity: 68 },
    ],
  },
  {
    id: generateId('scan', 16),
    status: 'valued',
    timestamp: '2025-12-16T13:00:00Z',
    imageUrl: '/scans/immaculate_mahomes.jpg',
    identifiedCard: {
      player: 'Patrick Mahomes',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Immaculate',
      cardNumber: 'PA-PM',
      parallel: null,
      isAutographed: true,
      isNumbered: true,
      printRun: 15,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 90, leftRight: '52/48', topBottom: '50/50' },
      corners: { score: 93, description: 'Sharp corners' },
      edges: { score: 92, description: 'Clean edges' },
      surface: { score: 91, description: 'Patch window clean, auto crisp' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9.5' },
      gradeConfidence: 81,
    },
    valuation: {
      rawValue: 2800,
      gradedValues: [
        { grade: 'PSA 10', value: 7500, roi: 167.9 },
        { grade: 'PSA 9', value: 3800, roi: 35.7 },
        { grade: 'BGS 9.5', value: 5500, roi: 96.4 },
        { grade: 'BGS 10', value: 14000, roi: 400.0 },
      ],
      fairMarketValue: 3000,
      low: 2400,
      high: 3600,
      recentComps: 5,
      confidenceScore: 65,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 3800,
        gradingCost: 100,
        expectedROI: 35.7,
        reasoning: 'High-end autograph patch card. Authentication is essential for resale at this price point.',
      },
    },
    confidence: 'high',
    matchScore: 91,
    alternatives: [
      { player: 'Patrick Mahomes', set: '2023 Panini National Treasures', similarity: 75 },
    ],
  },
  {
    id: generateId('scan', 17),
    status: 'valued',
    timestamp: '2025-12-17T11:45:00Z',
    imageUrl: '/scans/topps_trout.jpg',
    identifiedCard: {
      player: 'Mike Trout',
      year: 2011,
      manufacturer: 'Topps',
      set: 'Topps Update',
      cardNumber: 'US175',
      parallel: null,
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'near_mint',
      centering: { score: 80, leftRight: '55/45', topBottom: '53/47' },
      corners: { score: 87, description: 'Slight softness' },
      edges: { score: 89, description: 'Minor edge wear' },
      surface: { score: 92, description: 'Clean surface for vintage' },
      predictedGrade: { psa: '8', bgs: '8.5', sgc: '8.5' },
      gradeConfidence: 76,
    },
    valuation: {
      rawValue: 550,
      gradedValues: [
        { grade: 'PSA 10', value: 12000, roi: 2081.8 },
        { grade: 'PSA 9', value: 2200, roi: 300.0 },
        { grade: 'PSA 8', value: 850, roi: 54.5 },
        { grade: 'BGS 9.5', value: 5500, roi: 900.0 },
      ],
      fairMarketValue: 580,
      low: 450,
      high: 700,
      recentComps: 35,
      confidenceScore: 83,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 8',
        gradedValue: 850,
        gradingCost: 50,
        expectedROI: 54.5,
        reasoning: 'Key rookie card with strong authentication value. Even PSA 8 provides meaningful ROI.',
      },
    },
    confidence: 'high',
    matchScore: 97,
    alternatives: [],
  },
  {
    id: generateId('scan', 18),
    status: 'valued',
    timestamp: '2025-12-18T09:15:00Z',
    imageUrl: '/scans/optic_chet.jpg',
    identifiedCard: {
      player: 'Chet Holmgren',
      year: 2023,
      manufacturer: 'Panini',
      set: 'Donruss Optic',
      cardNumber: '155',
      parallel: 'Pink Velocity',
      isAutographed: false,
      isNumbered: false,
      printRun: null,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 88, leftRight: '53/47', topBottom: '51/49' },
      corners: { score: 91, description: 'Sharp' },
      edges: { score: 92, description: 'Clean edges' },
      surface: { score: 94, description: 'Excellent optic surface' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9.5' },
      gradeConfidence: 80,
    },
    valuation: {
      rawValue: 45,
      gradedValues: [
        { grade: 'PSA 10', value: 160, roi: 255.6 },
        { grade: 'PSA 9', value: 65, roi: 44.4 },
        { grade: 'BGS 9.5', value: 110, roi: 144.4 },
        { grade: 'BGS 10', value: 350, roi: 677.8 },
      ],
      fairMarketValue: 48,
      low: 35,
      high: 60,
      recentComps: 55,
      confidenceScore: 89,
      gradingRecommendation: {
        recommended: false,
        estimatedGrade: 'PSA 9',
        gradedValue: 65,
        gradingCost: 30,
        expectedROI: -22.2,
        reasoning: 'Low raw value makes grading cost prohibitive at estimated PSA 9.',
      },
    },
    confidence: 'high',
    matchScore: 90,
    alternatives: [
      { player: 'Chet Holmgren', set: '2023 Panini Prizm', similarity: 77 },
    ],
  },
  {
    id: generateId('scan', 19),
    status: 'valued',
    timestamp: '2025-12-19T14:30:00Z',
    imageUrl: '/scans/national_treasures_lamar.jpg',
    identifiedCard: {
      player: 'Lamar Jackson',
      year: 2023,
      manufacturer: 'Panini',
      set: 'National Treasures',
      cardNumber: 'RPA-LJ',
      parallel: 'Emerald',
      isAutographed: true,
      isNumbered: true,
      printRun: 5,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 95, leftRight: '50/50', topBottom: '50/50' },
      corners: { score: 97, description: 'Perfect corners' },
      edges: { score: 96, description: 'Flawless' },
      surface: { score: 95, description: 'Clean patch, bold auto' },
      predictedGrade: { psa: '10', bgs: '9.5', sgc: '10' },
      gradeConfidence: 89,
    },
    valuation: {
      rawValue: 6500,
      gradedValues: [
        { grade: 'PSA 10', value: 15000, roi: 130.8 },
        { grade: 'PSA 9', value: 8200, roi: 26.2 },
        { grade: 'BGS 9.5', value: 12000, roi: 84.6 },
        { grade: 'BGS 10', value: 28000, roi: 330.8 },
      ],
      fairMarketValue: 7000,
      low: 5500,
      high: 8500,
      recentComps: 2,
      confidenceScore: 55,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 15000,
        gradingCost: 300,
        expectedROI: 130.8,
        reasoning: 'Ultra-rare /5 RPA in pristine condition. Authentication is mandatory at this value level.',
      },
    },
    confidence: 'high',
    matchScore: 90,
    alternatives: [],
  },
  {
    id: generateId('scan', 20),
    status: 'valued',
    timestamp: '2025-12-20T10:00:00Z',
    imageUrl: '/scans/bowman_wyatt.jpg',
    identifiedCard: {
      player: 'Wyatt Langford',
      year: 2024,
      manufacturer: 'Bowman',
      set: 'Bowman Chrome',
      cardNumber: 'BCP-WL',
      parallel: 'Aqua Shimmer',
      isAutographed: true,
      isNumbered: true,
      printRun: 125,
    },
    conditionAssessment: {
      overall: 'mint',
      centering: { score: 87, leftRight: '53/47', topBottom: '52/48' },
      corners: { score: 90, description: 'Sharp corners' },
      edges: { score: 91, description: 'Clean' },
      surface: { score: 93, description: 'Nice shimmer finish, clean auto' },
      predictedGrade: { psa: '9', bgs: '9', sgc: '9' },
      gradeConfidence: 78,
    },
    valuation: {
      rawValue: 180,
      gradedValues: [
        { grade: 'PSA 10', value: 520, roi: 188.9 },
        { grade: 'PSA 9', value: 250, roi: 38.9 },
        { grade: 'BGS 9.5', value: 400, roi: 122.2 },
        { grade: 'BGS 10', value: 1100, roi: 511.1 },
      ],
      fairMarketValue: 195,
      low: 140,
      high: 240,
      recentComps: 15,
      confidenceScore: 76,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 9',
        gradedValue: 250,
        gradingCost: 30,
        expectedROI: 38.9,
        reasoning: 'Autographed parallel with decent ROI at PSA 9. Authentication adds buyer confidence.',
      },
    },
    confidence: 'medium',
    matchScore: 85,
    alternatives: [
      { player: 'Wyatt Langford', set: '2024 Bowman Draft', similarity: 74 },
    ],
  },
  {
    id: generateId('scan', 21),
    status: 'valued',
    timestamp: '2025-12-21T15:00:00Z',
    imageUrl: '/scans/select_jokic.jpg',
    identifiedCard: {
      player: 'Nikola Jokic',
      year: 2024,
      manufacturer: 'Panini',
      set: 'Select',
      cardNumber: '15',
      parallel: 'Tie-Dye',
      isAutographed: false,
      isNumbered: true,
      printRun: 25,
    },
    conditionAssessment: {
      overall: 'gem_mint',
      centering: { score: 96, leftRight: '50/50', topBottom: '50/50' },
      corners: { score: 97, description: 'Perfect' },
      edges: { score: 98, description: 'Flawless' },
      surface: { score: 96, description: 'Beautiful tie-dye pattern, clean' },
      predictedGrade: { psa: '10', bgs: '10', sgc: '10' },
      gradeConfidence: 93,
    },
    valuation: {
      rawValue: 520,
      gradedValues: [
        { grade: 'PSA 10', value: 1350, roi: 159.6 },
        { grade: 'PSA 9', value: 680, roi: 30.8 },
        { grade: 'BGS 9.5', value: 1050, roi: 101.9 },
        { grade: 'BGS 10', value: 2800, roi: 438.5 },
      ],
      fairMarketValue: 550,
      low: 420,
      high: 650,
      recentComps: 7,
      confidenceScore: 71,
      gradingRecommendation: {
        recommended: true,
        estimatedGrade: 'PSA 10',
        gradedValue: 1350,
        gradingCost: 50,
        expectedROI: 159.6,
        reasoning: 'Rare tie-dye parallel in perfect condition. Jokic demand remains strong post-championships.',
      },
    },
    confidence: 'high',
    matchScore: 93,
    alternatives: [
      { player: 'Nikola Jokic', set: '2024 Panini Prizm', similarity: 72 },
    ],
  },
  {
    id: generateId('scan', 22),
    status: 'error',
    timestamp: '2025-12-22T08:00:00Z',
    imageUrl: '/scans/blurry_card.jpg',
    identifiedCard: null,
    conditionAssessment: null,
    valuation: null,
    confidence: 'low',
    matchScore: 12,
    alternatives: [
      { player: 'Unknown', set: 'Could not identify', similarity: 12 },
    ],
  },
];

// ---- Mock Set Database ----

const MOCK_SET_DATABASE: SetDatabase[] = [
  { manufacturer: 'Topps', year: 2024, setName: 'Series 1', sport: 'Baseball', totalCards: 350, notableCards: ['Shohei Ohtani', 'Ronald Acuna Jr.', 'Mookie Betts'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Series 2', sport: 'Baseball', totalCards: 350, notableCards: ['Corbin Carroll', 'Julio Rodriguez', 'Juan Soto'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Chrome', sport: 'Baseball', totalCards: 220, notableCards: ['Paul Skenes', 'Jackson Chourio', 'Wyatt Langford'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Chrome Update', sport: 'Baseball', totalCards: 200, notableCards: ['Paul Skenes RC', 'Jackson Merrill RC'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Heritage', sport: 'Baseball', totalCards: 500, notableCards: ['Aaron Judge', 'Mike Trout', 'Freddie Freeman'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Stadium Club', sport: 'Baseball', totalCards: 300, notableCards: ['Shohei Ohtani', 'Bryce Harper'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Allen & Ginter', sport: 'Baseball', totalCards: 350, notableCards: ['Shohei Ohtani', 'Aaron Judge', 'Elly De La Cruz'] },
  { manufacturer: 'Topps', year: 2023, setName: 'Chrome', sport: 'Baseball', totalCards: 220, notableCards: ['Elly De La Cruz', 'Corbin Carroll', 'Gunnar Henderson'] },
  { manufacturer: 'Topps', year: 2023, setName: 'Series 1', sport: 'Baseball', totalCards: 330, notableCards: ['Aaron Judge', 'Julio Rodriguez', 'Mike Trout'] },
  { manufacturer: 'Topps', year: 2011, setName: 'Update', sport: 'Baseball', totalCards: 330, notableCards: ['Mike Trout RC US175', 'Jose Altuve RC', 'Anthony Rizzo RC'] },
  { manufacturer: 'Bowman', year: 2024, setName: 'Bowman Chrome', sport: 'Baseball', totalCards: 250, notableCards: ['Wyatt Langford', 'Travis Bazzana', 'JJ Wetherholt'] },
  { manufacturer: 'Bowman', year: 2024, setName: 'Bowman Draft', sport: 'Baseball', totalCards: 200, notableCards: ['Travis Bazzana', 'Charlie Condon', 'Jac Caglianone'] },
  { manufacturer: 'Bowman', year: 2023, setName: 'Bowman Chrome', sport: 'Baseball', totalCards: 250, notableCards: ['Jackson Holliday', 'Elly De La Cruz', 'James Wood'] },
  { manufacturer: 'Bowman', year: 2023, setName: 'Bowman 1st', sport: 'Baseball', totalCards: 150, notableCards: ['Jack Leiter', 'Marcelo Mayer', 'Jackson Holliday'] },
  { manufacturer: 'Bowman', year: 2023, setName: 'Bowman', sport: 'Baseball', totalCards: 200, notableCards: ['Jackson Holliday', 'Elly De La Cruz'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Prizm', sport: 'Basketball', totalCards: 300, notableCards: ['Victor Wembanyama', 'Chet Holmgren', 'Brandon Miller'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Select', sport: 'Basketball', totalCards: 250, notableCards: ['Nikola Jokic', 'Luka Doncic', 'Jayson Tatum'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Mosaic', sport: 'Basketball', totalCards: 300, notableCards: ['Anthony Edwards', 'Shai Gilgeous-Alexander'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Donruss', sport: 'Basketball', totalCards: 250, notableCards: ['Victor Wembanyama', 'Scoot Henderson'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Donruss Optic', sport: 'Basketball', totalCards: 200, notableCards: ['Chet Holmgren', 'Brandon Miller', 'Amen Thompson'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Prizm', sport: 'Basketball', totalCards: 300, notableCards: ['Victor Wembanyama RC', 'Scoot Henderson RC'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Select', sport: 'Basketball', totalCards: 250, notableCards: ['Luka Doncic', 'Jayson Tatum', 'Anthony Edwards'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Mosaic', sport: 'Basketball', totalCards: 300, notableCards: ['Anthony Edwards', 'Nikola Jokic'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Prizm Draft Picks', sport: 'Football', totalCards: 250, notableCards: ['Caleb Williams', 'Drake Maye', 'Jayden Daniels'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Donruss', sport: 'Football', totalCards: 350, notableCards: ['Caleb Williams RC', 'Marvin Harrison Jr. RC'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Prizm', sport: 'Football', totalCards: 400, notableCards: ['Caleb Williams', 'Jayden Daniels', 'Bo Nix'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Donruss Optic', sport: 'Football', totalCards: 200, notableCards: ['C.J. Stroud', 'Bryce Young', 'Bijan Robinson'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Prizm', sport: 'Football', totalCards: 400, notableCards: ['C.J. Stroud RC', 'Bryce Young RC'] },
  { manufacturer: 'Panini', year: 2023, setName: 'National Treasures', sport: 'Football', totalCards: 200, notableCards: ['Lamar Jackson', 'Patrick Mahomes', 'Josh Allen'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Immaculate', sport: 'Football', totalCards: 150, notableCards: ['Patrick Mahomes', 'Travis Kelce', 'Tyreek Hill'] },
  { manufacturer: 'Upper Deck', year: 2024, setName: 'Young Guns', sport: 'Hockey', totalCards: 250, notableCards: ['Connor Bedard', 'Leo Carlsson', 'Adam Fantilli'] },
  { manufacturer: 'Upper Deck', year: 2024, setName: 'Series 1', sport: 'Hockey', totalCards: 250, notableCards: ['Connor McDavid', 'Sidney Crosby', 'Connor Bedard'] },
  { manufacturer: 'Upper Deck', year: 2024, setName: 'Series 2', sport: 'Hockey', totalCards: 250, notableCards: ['Auston Matthews', 'Nathan MacKinnon'] },
  { manufacturer: 'Upper Deck', year: 2024, setName: 'MVP', sport: 'Hockey', totalCards: 250, notableCards: ['Connor Bedard', 'Connor McDavid'] },
  { manufacturer: 'Upper Deck', year: 2023, setName: 'Young Guns', sport: 'Hockey', totalCards: 250, notableCards: ['Matty Beniers', 'Logan Cooley'] },
  { manufacturer: 'Upper Deck', year: 2023, setName: 'Ice', sport: 'Hockey', totalCards: 150, notableCards: ['Connor McDavid', 'Sidney Crosby'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Prizm Premier League', sport: 'Soccer', totalCards: 300, notableCards: ['Lionel Messi', 'Erling Haaland', 'Jude Bellingham'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Chrome UCL', sport: 'Soccer', totalCards: 200, notableCards: ['Kylian Mbappe', 'Jude Bellingham', 'Lamine Yamal'] },
  { manufacturer: 'Topps', year: 2023, setName: 'Chrome UCL', sport: 'Soccer', totalCards: 200, notableCards: ['Lionel Messi', 'Kylian Mbappe', 'Erling Haaland'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Donruss Soccer', sport: 'Soccer', totalCards: 200, notableCards: ['Lamine Yamal', 'Jude Bellingham'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Prizm World Cup', sport: 'Soccer', totalCards: 300, notableCards: ['Lionel Messi', 'Kylian Mbappe', 'Lamine Yamal'] },
  { manufacturer: 'Fleer', year: 1986, setName: 'Fleer', sport: 'Basketball', totalCards: 132, notableCards: ['Michael Jordan #57', 'Patrick Ewing', 'Charles Barkley'] },
  { manufacturer: 'Fleer', year: 1987, setName: 'Fleer', sport: 'Basketball', totalCards: 132, notableCards: ['Michael Jordan #59', 'Isiah Thomas'] },
  { manufacturer: 'Topps', year: 1952, setName: 'Topps', sport: 'Baseball', totalCards: 407, notableCards: ['Mickey Mantle #311', 'Willie Mays #261'] },
  { manufacturer: 'Topps', year: 1989, setName: 'Traded', sport: 'Baseball', totalCards: 132, notableCards: ['Ken Griffey Jr. #41T'] },
  { manufacturer: 'Donruss', year: 1989, setName: 'Donruss', sport: 'Baseball', totalCards: 660, notableCards: ['Ken Griffey Jr. #33', 'Randy Johnson RC'] },
  { manufacturer: 'Upper Deck', year: 1989, setName: 'Upper Deck', sport: 'Baseball', totalCards: 800, notableCards: ['Ken Griffey Jr. #1'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Contenders', sport: 'Football', totalCards: 300, notableCards: ['Caleb Williams', 'Drake Maye', 'Jayden Daniels'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Mosaic', sport: 'Football', totalCards: 400, notableCards: ['Patrick Mahomes', 'Josh Allen', 'Lamar Jackson'] },
  { manufacturer: 'Panini', year: 2023, setName: 'Donruss', sport: 'Football', totalCards: 350, notableCards: ['Bijan Robinson', 'C.J. Stroud', 'Bryce Young'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Finest', sport: 'Baseball', totalCards: 200, notableCards: ['Shohei Ohtani', 'Paul Skenes', 'Elly De La Cruz'] },
  { manufacturer: 'Topps', year: 2024, setName: 'Bowman Sterling', sport: 'Baseball', totalCards: 100, notableCards: ['Jackson Holliday', 'Paul Skenes'] },
  { manufacturer: 'Panini', year: 2024, setName: 'Hoops', sport: 'Basketball', totalCards: 300, notableCards: ['Victor Wembanyama', 'Anthony Edwards'] },
];

// ---- Mock Detection Models ----

const MOCK_DETECTION_MODELS: DetectionModel[] = [
  {
    name: 'CardNet Vision',
    version: '4.2.1',
    accuracy: 97.3,
    supported: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    lastUpdated: '2025-11-15',
  },
  {
    name: 'GradePredict ML',
    version: '3.1.0',
    accuracy: 94.8,
    supported: ['PSA', 'BGS', 'SGC'],
    lastUpdated: '2025-10-28',
  },
  {
    name: 'SetMatch Identifier',
    version: '2.8.3',
    accuracy: 96.1,
    supported: ['Topps', 'Panini', 'Bowman', 'Upper Deck', 'Fleer', 'Donruss'],
    lastUpdated: '2025-11-02',
  },
  {
    name: 'ConditionAnalyzer',
    version: '5.0.2',
    accuracy: 93.5,
    supported: ['Centering', 'Corners', 'Edges', 'Surface'],
    lastUpdated: '2025-11-20',
  },
  {
    name: 'ValuationEngine',
    version: '3.5.0',
    accuracy: 91.2,
    supported: ['eBay Comps', 'PWCC', 'Goldin', '130point'],
    lastUpdated: '2025-12-01',
  },
];

// ---- Derived Data Builders ----

function buildScanHistory(): ScanHistory[] {
  return MOCK_SCAN_RESULTS
    .filter((s) => s.status === 'valued' && s.identifiedCard && s.valuation)
    .map((s) => ({
      id: s.id,
      imageUrl: s.imageUrl,
      player: s.identifiedCard!.player,
      set: `${s.identifiedCard!.year} ${s.identifiedCard!.manufacturer} ${s.identifiedCard!.set}`,
      grade: s.conditionAssessment?.predictedGrade.psa ?? 'N/A',
      value: s.valuation!.fairMarketValue,
      timestamp: s.timestamp,
      matchScore: s.matchScore,
    }));
}

function buildScannerStats(): ScannerStats {
  const valued = MOCK_SCAN_RESULTS.filter((s) => s.status === 'valued' && s.valuation);
  const totalValue = valued.reduce((sum, s) => sum + (s.valuation?.fairMarketValue ?? 0), 0);
  const avgMatch = valued.reduce((sum, s) => sum + s.matchScore, 0) / (valued.length || 1);
  const recommended = valued.filter((s) => s.valuation?.gradingRecommendation.recommended).length;

  const sportCounts: Record<string, number> = {};
  const playerMap: Record<string, { count: number; totalValue: number }> = {};

  for (const s of valued) {
    const player = s.identifiedCard?.player ?? 'Unknown';
    const mfg = s.identifiedCard?.manufacturer ?? 'Unknown';

    // Determine sport from set database
    const setEntry = MOCK_SET_DATABASE.find(
      (db) => db.manufacturer === mfg && db.setName === s.identifiedCard?.set
    );
    const sport = setEntry?.sport ?? 'Other';
    sportCounts[sport] = (sportCounts[sport] ?? 0) + 1;

    if (!playerMap[player]) playerMap[player] = { count: 0, totalValue: 0 };
    playerMap[player].count += 1;
    playerMap[player].totalValue += s.valuation?.fairMarketValue ?? 0;
  }

  const estimatedSavings = valued.reduce((sum, s) => {
    const rec = s.valuation?.gradingRecommendation;
    if (rec && !rec.recommended) {
      return sum + rec.gradingCost;
    }
    return sum;
  }, 0);

  return {
    totalScans: MOCK_SCAN_RESULTS.length,
    totalValueScanned: totalValue,
    avgMatchScore: Math.round(avgMatch * 10) / 10,
    accuracyRate: 96.2,
    avgScanTime: 2.4,
    scansByCategory: Object.entries(sportCounts).map(([sport, count]) => ({ sport, count })),
    topScannedPlayers: Object.entries(playerMap)
      .map(([player, data]) => ({ player, ...data }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10),
    gradingRecommendations: recommended,
    estimatedSavings,
  };
}

// ---- Exported functions ----

export function getScanResults(): ScanResult[] {
  return loadFromStorage<ScanResult[]>(STORAGE_KEY_SCANS, MOCK_SCAN_RESULTS);
}

export function getScanHistory(): ScanHistory[] {
  return loadFromStorage<ScanHistory[]>(STORAGE_KEY_HISTORY, buildScanHistory());
}

export function getScannerStats(): ScannerStats {
  return loadFromStorage<ScannerStats>(STORAGE_KEY_STATS, buildScannerStats());
}

export function getSetDatabase(): SetDatabase[] {
  return [...MOCK_SET_DATABASE];
}

export function getDetectionModels(): DetectionModel[] {
  return [...MOCK_DETECTION_MODELS];
}

export function simulateScan(imageUrl?: string): ScanResult {
  const pool = MOCK_SCAN_RESULTS.filter((s) => s.status === 'valued');
  const template = pool[Math.floor(Math.random() * pool.length)];

  const jitter = 0.9 + Math.random() * 0.2; // 0.9-1.1

  const newScan: ScanResult = {
    ...template,
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    imageUrl: imageUrl ?? template.imageUrl,
    matchScore: Math.min(100, Math.max(0, Math.round(template.matchScore * jitter))),
    valuation: template.valuation
      ? {
          ...template.valuation,
          fairMarketValue: Math.round(template.valuation.fairMarketValue * jitter),
          rawValue: Math.round(template.valuation.rawValue * jitter),
          low: Math.round(template.valuation.low * jitter),
          high: Math.round(template.valuation.high * jitter),
        }
      : null,
  };

  // Persist
  const current = getScanResults();
  current.unshift(newScan);
  saveToStorage(STORAGE_KEY_SCANS, current);

  // Update history
  if (newScan.identifiedCard && newScan.valuation) {
    const history = getScanHistory();
    history.unshift({
      id: newScan.id,
      imageUrl: newScan.imageUrl,
      player: newScan.identifiedCard.player,
      set: `${newScan.identifiedCard.year} ${newScan.identifiedCard.manufacturer} ${newScan.identifiedCard.set}`,
      grade: newScan.conditionAssessment?.predictedGrade.psa ?? 'N/A',
      value: newScan.valuation.fairMarketValue,
      timestamp: newScan.timestamp,
      matchScore: newScan.matchScore,
    });
    saveToStorage(STORAGE_KEY_HISTORY, history);
  }

  return newScan;
}

export function getGradingROIAnalysis(): { grade: string; avgROI: number; breakEvenRate: number }[] {
  return [
    { grade: 'PSA 10', avgROI: 215.4, breakEvenRate: 92 },
    { grade: 'PSA 9', avgROI: 48.2, breakEvenRate: 71 },
    { grade: 'PSA 8', avgROI: 18.5, breakEvenRate: 55 },
    { grade: 'PSA 7', avgROI: -12.3, breakEvenRate: 38 },
    { grade: 'BGS 10 Black', avgROI: 485.0, breakEvenRate: 98 },
    { grade: 'BGS 10', avgROI: 380.2, breakEvenRate: 95 },
    { grade: 'BGS 9.5', avgROI: 125.8, breakEvenRate: 85 },
    { grade: 'BGS 9', avgROI: 35.6, breakEvenRate: 62 },
    { grade: 'SGC 10', avgROI: 165.3, breakEvenRate: 88 },
    { grade: 'SGC 9.5', avgROI: 72.1, breakEvenRate: 74 },
    { grade: 'SGC 9', avgROI: 28.4, breakEvenRate: 58 },
  ];
}

export function searchSets(query: string): SetDatabase[] {
  if (!query.trim()) return MOCK_SET_DATABASE;
  const lower = query.toLowerCase();
  return MOCK_SET_DATABASE.filter(
    (s) =>
      s.setName.toLowerCase().includes(lower) ||
      s.manufacturer.toLowerCase().includes(lower) ||
      s.sport.toLowerCase().includes(lower) ||
      String(s.year).includes(lower) ||
      s.notableCards.some((c) => c.toLowerCase().includes(lower))
  );
}

export function getTopIdentifiedCards(): ScanHistory[] {
  return buildScanHistory()
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
