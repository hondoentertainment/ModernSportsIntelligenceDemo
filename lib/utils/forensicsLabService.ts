// @ts-nocheck
// ---- Types ----

export type ForensicStatus = 'analyzing' | 'complete' | 'flagged';
export type ForensicVerdict = 'authentic' | 'suspicious' | 'counterfeit' | 'inconclusive';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AnomalySeverity = 'info' | 'warning' | 'critical';

export type ForensicLayerName =
  | 'print-pattern'
  | 'card-stock'
  | 'ink-composition'
  | 'surface-texture'
  | 'hologram'
  | 'serial-number'
  | 'edge-cut'
  | 'color-calibration'
  | 'font-analysis'
  | 'centering-pattern';

export interface Anomaly {
  type: string;
  severity: AnomalySeverity;
  description: string;
  location: { row: number; col: number } | string;
  confidence: number;
}

export interface ForensicLayer {
  id: string;
  name: ForensicLayerName;
  score: number;
  findings: string[];
  anomalies: Anomaly[];
  referenceMatch: number;
}

export interface CounterfeitMatch {
  knownCounterfeitId: string;
  similarity: number;
  matchedFeatures: string[];
  source: string;
  reportedDate: string;
}

export interface CustodyEvent {
  date: string;
  event: string;
  party: string;
  location: string;
  verified: boolean;
}

export interface ForensicReport {
  id: string;
  cardName: string;
  player: string;
  year: number;
  manufacturer: string;
  submittedAt: string;
  status: ForensicStatus;
  overallAuthenticity: number;
  confidenceLevel: ConfidenceLevel;
  layers: ForensicLayer[];
  knownCounterfeitMatch: CounterfeitMatch | null;
  chainOfCustody: CustodyEvent[];
  verdict: ForensicVerdict;
}

export interface CounterfeitDatabaseEntry {
  id: string;
  cardName: string;
  player: string;
  year: number;
  manufacturer: string;
  detectedDate: string;
  originRegion: string;
  telltaleFeatures: string[];
  reportCount: number;
  severity: AnomalySeverity;
  imageHash: string;
}

export interface CounterfeitDatabase {
  totalEntries: number;
  recentAdditions: CounterfeitDatabaseEntry[];
  topCounterfeitedCards: { cardName: string; player: string; count: number }[];
  hotspotRegions: { region: string; count: number; trend: 'rising' | 'stable' | 'declining' }[];
}

export interface LayerComparison {
  layerName: ForensicLayerName;
  card1Score: number;
  card2Score: number;
  delta: number;
  suspicious: boolean;
}

export interface ForensicComparison {
  card1: { id: string; cardName: string; player: string };
  card2: { id: string; cardName: string; player: string };
  layerComparisons: LayerComparison[];
  overallSimilarity: number;
  suspiciousLayers: ForensicLayerName[];
}

export interface AuthenticationHistoryEntry {
  date: string;
  cardId: string;
  cardName: string;
  verdict: ForensicVerdict;
  authenticity: number;
}

// ---- Helpers ----

const LAYER_DISPLAY_NAMES: Record<ForensicLayerName, string> = {
  'print-pattern': 'Print Pattern Analysis',
  'card-stock': 'Card Stock Composition',
  'ink-composition': 'Ink Composition',
  'surface-texture': 'Surface Texture Mapping',
  'hologram': 'Hologram Verification',
  'serial-number': 'Serial Number Validation',
  'edge-cut': 'Edge Cut Precision',
  'color-calibration': 'Color Calibration Match',
  'font-analysis': 'Font & Typography Analysis',
  'centering-pattern': 'Centering Pattern',
};

export function getLayerDisplayName(name: ForensicLayerName): string {
  return LAYER_DISPLAY_NAMES[name];
}

export function getVerdictColor(verdict: ForensicVerdict): string {
  switch (verdict) {
    case 'authentic': return 'text-emerald-400';
    case 'suspicious': return 'text-yellow-400';
    case 'counterfeit': return 'text-red-400';
    case 'inconclusive': return 'text-slate-400';
  }
}

export function getVerdictBg(verdict: ForensicVerdict): string {
  switch (verdict) {
    case 'authentic': return 'bg-emerald-500/20 border-emerald-500/40';
    case 'suspicious': return 'bg-yellow-500/20 border-yellow-500/40';
    case 'counterfeit': return 'bg-red-500/20 border-red-500/40';
    case 'inconclusive': return 'bg-slate-500/20 border-slate-500/40';
  }
}

export function getSeverityColor(severity: AnomalySeverity): string {
  switch (severity) {
    case 'info': return 'text-blue-400';
    case 'warning': return 'text-yellow-400';
    case 'critical': return 'text-red-400';
  }
}

export function getSeverityBg(severity: AnomalySeverity): string {
  switch (severity) {
    case 'info': return 'bg-blue-500/20 border-blue-500/40';
    case 'warning': return 'bg-yellow-500/20 border-yellow-500/40';
    case 'critical': return 'bg-red-500/20 border-red-500/40';
  }
}

export function getAuthenticityColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ---- Mock Data: Forensic Layers Generator ----

function makeLayers(profile: 'authentic' | 'suspicious' | 'counterfeit' | 'inconclusive'): ForensicLayer[] {
  const base: Record<ForensicLayerName, { score: number; findings: string[]; anomalies: Anomaly[]; ref: number }> = {
    'print-pattern': {
      score: 95,
      findings: [
        'Halftone dot pattern consistent with Topps 2023 print run',
        'Rosette pattern alignment within 0.02mm tolerance',
        'Micro-text border verified at 4x magnification',
      ],
      anomalies: [],
      ref: 97,
    },
    'card-stock': {
      score: 92,
      findings: [
        'Card stock thickness: 0.32mm (spec: 0.31-0.33mm)',
        'UV fluorescence response consistent with authentic stock',
        'Fiber density matches manufacturer baseline',
      ],
      anomalies: [],
      ref: 94,
    },
    'ink-composition': {
      score: 96,
      findings: [
        'CMYK spectral analysis within tolerance',
        'Ink layering order verified: cyan, magenta, yellow, black, spot varnish',
        'No foreign chemical compounds detected',
      ],
      anomalies: [],
      ref: 98,
    },
    'surface-texture': {
      score: 91,
      findings: [
        'Gloss measurement: 78 GU (spec: 75-82 GU)',
        'Surface roughness Ra 0.4um consistent with factory finish',
        'No evidence of re-coating or surface treatments',
      ],
      anomalies: [],
      ref: 93,
    },
    'hologram': {
      score: 98,
      findings: [
        'Holographic foil diffraction angle verified at 23 degrees',
        'Micro-embossing pattern matches reference database',
        'Hologram adhesion layer shows no signs of re-application',
      ],
      anomalies: [],
      ref: 99,
    },
    'serial-number': {
      score: 94,
      findings: [
        'Serial format matches manufacturer schema',
        'Number not found in known counterfeit registry',
        'Print depth consistent with laser etching spec',
      ],
      anomalies: [],
      ref: 96,
    },
    'edge-cut': {
      score: 90,
      findings: [
        'Die-cut precision within 0.05mm spec',
        'Corner radius 2.5mm matches factory standard',
        'No evidence of manual trimming or re-cutting',
      ],
      anomalies: [],
      ref: 92,
    },
    'color-calibration': {
      score: 93,
      findings: [
        'Delta E color difference: 1.2 (acceptable < 3.0)',
        'Skin tone rendering matches reference print',
        'Team logo color fidelity confirmed',
      ],
      anomalies: [],
      ref: 95,
    },
    'font-analysis': {
      score: 97,
      findings: [
        'Player name typography matches Topps proprietary font',
        'Kerning and leading consistent with reference',
        'No evidence of font substitution or modification',
      ],
      anomalies: [],
      ref: 98,
    },
    'centering-pattern': {
      score: 88,
      findings: [
        'Left-right centering: 50/50 (perfect)',
        'Top-bottom centering: 48/52 (within tolerance)',
        'Border width variation: 0.3mm (acceptable < 0.5mm)',
      ],
      anomalies: [],
      ref: 90,
    },
  };

  if (profile === 'suspicious') {
    base['print-pattern'].score = 62;
    base['print-pattern'].findings = [
      'Halftone dot pattern shows slight irregularity in upper-left quadrant',
      'Rosette pattern alignment off by 0.08mm — borderline tolerance',
      'Micro-text partially legible; possible low-quality reproduction',
    ];
    base['print-pattern'].anomalies = [
      { type: 'pattern-deviation', severity: 'warning', description: 'Rosette misalignment suggests non-standard print plate', location: { row: 2, col: 3 }, confidence: 0.72 },
    ];
    base['ink-composition'].score = 58;
    base['ink-composition'].findings = [
      'CMYK spectral analysis shows elevated magenta signature',
      'Ink layering order verified but varnish layer thinner than spec',
      'Trace amount of unidentified organic compound detected',
    ];
    base['ink-composition'].anomalies = [
      { type: 'chemical-deviation', severity: 'warning', description: 'Unknown organic compound at 0.3% concentration', location: { row: 5, col: 7 }, confidence: 0.65 },
      { type: 'spectral-mismatch', severity: 'info', description: 'Magenta channel 8% above reference', location: 'Full card surface', confidence: 0.58 },
    ];
    base['surface-texture'].score = 65;
    base['surface-texture'].findings = [
      'Gloss measurement: 68 GU (spec: 75-82 GU) — below tolerance',
      'Surface roughness Ra 0.7um — rougher than factory finish',
      'Possible evidence of after-market surface treatment',
    ];
    base['surface-texture'].anomalies = [
      { type: 'gloss-deviation', severity: 'warning', description: 'Sub-specification gloss indicates possible reproduction or degradation', location: { row: 7, col: 5 }, confidence: 0.70 },
    ];
    base['color-calibration'].score = 55;
    base['color-calibration'].findings = [
      'Delta E color difference: 4.8 (acceptable < 3.0) — FAIL',
      'Skin tone rendering noticeably warmer than reference',
      'Team logo color shows measurable hue shift',
    ];
    base['color-calibration'].anomalies = [
      { type: 'color-shift', severity: 'warning', description: 'Delta E exceeds threshold; possible different print batch or reproduction', location: 'Full card face', confidence: 0.74 },
    ];
  }

  if (profile === 'counterfeit') {
    base['print-pattern'].score = 28;
    base['print-pattern'].findings = [
      'Halftone dot pattern inconsistent — inkjet printer artifacts detected',
      'No rosette pattern present; digital print signature identified',
      'Micro-text completely absent from border region',
    ];
    base['print-pattern'].anomalies = [
      { type: 'print-method', severity: 'critical', description: 'Card printed with consumer inkjet, not offset lithography', location: { row: 1, col: 1 }, confidence: 0.96 },
      { type: 'missing-feature', severity: 'critical', description: 'Micro-text security feature completely absent', location: { row: 0, col: 4 }, confidence: 0.99 },
    ];
    base['card-stock'].score = 22;
    base['card-stock'].findings = [
      'Card stock thickness: 0.28mm (spec: 0.31-0.33mm) — too thin',
      'UV fluorescence absent — non-authentic stock confirmed',
      'Fiber analysis shows recycled consumer paper, not card stock',
    ];
    base['card-stock'].anomalies = [
      { type: 'material-mismatch', severity: 'critical', description: 'Card stock is consumer-grade paper, not manufacturer card stock', location: 'Entire card', confidence: 0.98 },
    ];
    base['ink-composition'].score = 15;
    base['ink-composition'].findings = [
      'Ink is consumer-grade inkjet dye, not offset printing ink',
      'No spot varnish layer detected',
      'Multiple foreign chemical compounds detected consistent with HP ink cartridges',
    ];
    base['ink-composition'].anomalies = [
      { type: 'ink-type', severity: 'critical', description: 'Consumer inkjet dye positively identified; not manufacturer ink', location: 'Full card', confidence: 0.99 },
    ];
    base['surface-texture'].score = 18;
    base['surface-texture'].findings = [
      'Gloss measurement: 42 GU — significantly below spec',
      'Surface roughness Ra 1.8um — porous matte finish',
      'Clear evidence of lamination overlay on consumer paper',
    ];
    base['surface-texture'].anomalies = [
      { type: 'lamination', severity: 'critical', description: 'After-market lamination film detected over printed surface', location: { row: 5, col: 5 }, confidence: 0.95 },
    ];
    base['hologram'].score = 5;
    base['hologram'].findings = [
      'No holographic foil present',
      'Printed holographic effect — flat reflective ink, no diffraction',
      'Adhesive residue absent from expected hologram area',
    ];
    base['hologram'].anomalies = [
      { type: 'missing-hologram', severity: 'critical', description: 'Genuine holographic foil completely absent; flat print substitution', location: { row: 1, col: 9 }, confidence: 1.0 },
    ];
    base['serial-number'].score = 10;
    base['serial-number'].findings = [
      'Serial number format does not match any known manufacturer schema',
      'Number found in known counterfeit batch registry (Batch CF-2024-0891)',
      'Printed with wrong font and incorrect depth',
    ];
    base['serial-number'].anomalies = [
      { type: 'registry-match', severity: 'critical', description: 'Serial number matches known counterfeit batch CF-2024-0891', location: { row: 9, col: 7 }, confidence: 0.97 },
    ];
    base['edge-cut'].score = 30;
    base['edge-cut'].findings = [
      'Die-cut precision off by 0.3mm — manual cutting likely',
      'Corner radius 3.2mm — does not match 2.5mm factory standard',
      'Visible micro-fraying on two edges consistent with scissors or paper cutter',
    ];
    base['edge-cut'].anomalies = [
      { type: 'manual-cut', severity: 'warning', description: 'Edge precision inconsistent with factory die-cutting', location: { row: 0, col: 0 }, confidence: 0.88 },
    ];
    base['color-calibration'].score = 25;
    base['color-calibration'].findings = [
      'Delta E color difference: 12.4 — far outside tolerance',
      'Heavy cyan bias across all skin tones',
      'Team logo colors visibly wrong to naked eye',
    ];
    base['color-calibration'].anomalies = [
      { type: 'color-mismatch', severity: 'critical', description: 'Color reproduction grossly inaccurate; Delta E 12.4', location: 'Full card', confidence: 0.99 },
    ];
    base['font-analysis'].score = 20;
    base['font-analysis'].findings = [
      'Player name uses Arial instead of Topps proprietary font',
      'Kerning inconsistencies throughout all text elements',
      'Font weight does not match reference at any point size',
    ];
    base['font-analysis'].anomalies = [
      { type: 'font-substitution', severity: 'critical', description: 'Non-authentic font used for player name; likely desktop publishing software', location: { row: 8, col: 5 }, confidence: 0.94 },
    ];
    base['centering-pattern'].score = 35;
    base['centering-pattern'].findings = [
      'Left-right centering: 42/58 — noticeably off-center',
      'Top-bottom centering: 55/45 — outside tolerance',
      'Border width varies by 1.8mm side-to-side',
    ];
    base['centering-pattern'].anomalies = [
      { type: 'centering-error', severity: 'warning', description: 'Significant centering deviation consistent with manual alignment', location: { row: 5, col: 0 }, confidence: 0.82 },
    ];
  }

  if (profile === 'inconclusive') {
    base['print-pattern'].score = 74;
    base['print-pattern'].anomalies = [
      { type: 'partial-match', severity: 'info', description: 'Pattern partially matches two different print runs', location: { row: 3, col: 6 }, confidence: 0.52 },
    ];
    base['card-stock'].score = 80;
    base['hologram'].score = 71;
    base['hologram'].anomalies = [
      { type: 'degraded-hologram', severity: 'info', description: 'Hologram shows age-related degradation; analysis inconclusive', location: { row: 1, col: 9 }, confidence: 0.48 },
    ];
    base['serial-number'].score = 68;
    base['serial-number'].findings = [
      'Serial format partially matches manufacturer schema',
      'Number not found in counterfeit registry but also not in verified registry',
      'Print depth inconclusive due to surface wear',
    ];
    base['serial-number'].anomalies = [
      { type: 'unverified-serial', severity: 'warning', description: 'Serial number cannot be verified against any known database', location: { row: 9, col: 7 }, confidence: 0.55 },
    ];
  }

  const layerNames: ForensicLayerName[] = [
    'print-pattern', 'card-stock', 'ink-composition', 'surface-texture',
    'hologram', 'serial-number', 'edge-cut', 'color-calibration',
    'font-analysis', 'centering-pattern',
  ];

  return layerNames.map((name, i) => ({
    id: `layer-${i + 1}`,
    name,
    score: base[name].score,
    findings: base[name].findings,
    anomalies: base[name].anomalies,
    referenceMatch: base[name].ref,
  }));
}

// ---- Mock Data: Forensic Reports ----

const MOCK_FORENSIC_REPORTS: ForensicReport[] = [
  {
    id: 'FR-001',
    cardName: '2023 Topps Chrome Victor Wembanyama RC #1',
    player: 'Victor Wembanyama',
    year: 2023,
    manufacturer: 'Topps',
    submittedAt: '2025-12-10T14:30:00Z',
    status: 'complete',
    overallAuthenticity: 94,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2023-09-15', event: 'Pack opening — Topps Chrome Hobby Box', party: 'Original Owner (M. Chen)', location: 'San Antonio, TX', verified: true },
      { date: '2023-10-02', event: 'Submitted to PSA for grading', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2023-11-20', event: 'Graded PSA 10 — returned to owner', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2024-03-15', event: 'Listed on eBay — sold for $2,450', party: 'eBay Marketplace', location: 'Online', verified: true },
      { date: '2024-03-22', event: 'Received by buyer', party: 'J. Rodriguez', location: 'Miami, FL', verified: true },
      { date: '2025-12-10', event: 'Submitted for forensic analysis', party: 'J. Rodriguez', location: 'Miami, FL', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-002',
    cardName: '2020 Panini Prizm Joe Burrow RC Silver #307',
    player: 'Joe Burrow',
    year: 2020,
    manufacturer: 'Panini',
    submittedAt: '2025-12-08T09:15:00Z',
    status: 'complete',
    overallAuthenticity: 96,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2020-09-10', event: 'Pack opening — Prizm Football Retail', party: 'Original Owner (T. Williams)', location: 'Cincinnati, OH', verified: true },
      { date: '2021-01-15', event: 'Submitted to BGS for grading', party: 'Beckett Grading', location: 'Dallas, TX', verified: true },
      { date: '2021-03-02', event: 'Graded BGS 9.5 — returned', party: 'Beckett Grading', location: 'Dallas, TX', verified: true },
      { date: '2025-12-08', event: 'Submitted for forensic analysis', party: 'T. Williams', location: 'Cincinnati, OH', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-003',
    cardName: '2018 Panini Prizm Luka Doncic RC Silver #280',
    player: 'Luka Doncic',
    year: 2018,
    manufacturer: 'Panini',
    submittedAt: '2025-12-05T16:45:00Z',
    status: 'flagged',
    overallAuthenticity: 31,
    confidenceLevel: 'high',
    layers: makeLayers('counterfeit'),
    knownCounterfeitMatch: {
      knownCounterfeitId: 'CF-2024-0891',
      similarity: 94.2,
      matchedFeatures: ['Inkjet print pattern', 'Missing holographic foil', 'Consumer paper stock', 'Arial font substitution', 'Serial batch CF-2024-0891'],
      source: 'PSA Counterfeit Alert Database',
      reportedDate: '2024-06-15',
    },
    chainOfCustody: [
      { date: '2025-06-01', event: 'Purchased on Facebook Marketplace — $180', party: 'Unknown Seller', location: 'Online', verified: false },
      { date: '2025-06-05', event: 'Received by buyer', party: 'D. Park', location: 'Los Angeles, CA', verified: false },
      { date: '2025-12-05', event: 'Submitted for forensic analysis', party: 'D. Park', location: 'Los Angeles, CA', verified: true },
    ],
    verdict: 'counterfeit',
  },
  {
    id: 'FR-004',
    cardName: '2021 Topps Chrome Julio Rodriguez RC Auto #RA-JRO',
    player: 'Julio Rodriguez',
    year: 2021,
    manufacturer: 'Topps',
    submittedAt: '2025-12-03T11:20:00Z',
    status: 'complete',
    overallAuthenticity: 91,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2022-04-20', event: 'Pack opening — Topps Chrome Hobby', party: 'Original Owner (K. Tanaka)', location: 'Seattle, WA', verified: true },
      { date: '2022-05-10', event: 'Submitted to SGC for grading', party: 'SGC Grading', location: 'Parsippany, NJ', verified: true },
      { date: '2022-06-15', event: 'Graded SGC 9.5 — returned', party: 'SGC Grading', location: 'Parsippany, NJ', verified: true },
      { date: '2025-12-03', event: 'Submitted for forensic analysis', party: 'K. Tanaka', location: 'Seattle, WA', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-005',
    cardName: '2022 Panini Flawless Ja Morant Patch Auto /25',
    player: 'Ja Morant',
    year: 2022,
    manufacturer: 'Panini',
    submittedAt: '2025-11-28T08:00:00Z',
    status: 'flagged',
    overallAuthenticity: 52,
    confidenceLevel: 'medium',
    layers: makeLayers('suspicious'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2023-02-10', event: 'Purchased from private seller at card show', party: 'Card Show Vendor #412', location: 'Memphis, TN', verified: false },
      { date: '2023-02-10', event: 'Acquired by collector', party: 'R. Johnson', location: 'Memphis, TN', verified: true },
      { date: '2025-11-28', event: 'Submitted for forensic analysis', party: 'R. Johnson', location: 'Memphis, TN', verified: true },
    ],
    verdict: 'suspicious',
  },
  {
    id: 'FR-006',
    cardName: '2019 Panini Mosaic Zion Williamson RC #209',
    player: 'Zion Williamson',
    year: 2019,
    manufacturer: 'Panini',
    submittedAt: '2025-11-25T13:30:00Z',
    status: 'complete',
    overallAuthenticity: 89,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2019-12-01', event: 'Retail purchase — Mosaic Basketball Blaster', party: 'Target Store #1423', location: 'New Orleans, LA', verified: true },
      { date: '2020-01-15', event: 'Submitted to PSA for grading', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2020-03-10', event: 'Graded PSA 9 — returned', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2025-11-25', event: 'Submitted for forensic analysis', party: 'L. Fontaine', location: 'New Orleans, LA', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-007',
    cardName: '2020 Topps Chrome Luis Robert RC Auto #RA-LR',
    player: 'Luis Robert',
    year: 2020,
    manufacturer: 'Topps',
    submittedAt: '2025-11-22T10:45:00Z',
    status: 'flagged',
    overallAuthenticity: 23,
    confidenceLevel: 'high',
    layers: makeLayers('counterfeit'),
    knownCounterfeitMatch: {
      knownCounterfeitId: 'CF-2024-1102',
      similarity: 97.8,
      matchedFeatures: ['Inkjet artifacts', 'Wrong card stock', 'Missing UV response', 'Counterfeit autograph ink', 'Known batch serial'],
      source: 'BGS Fraud Investigation Unit',
      reportedDate: '2024-08-22',
    },
    chainOfCustody: [
      { date: '2025-08-01', event: 'Purchased from Instagram seller @cards4cheap — $95', party: 'Unknown IG Seller', location: 'Online', verified: false },
      { date: '2025-08-07', event: 'Received via USPS', party: 'A. Petrov', location: 'Chicago, IL', verified: false },
      { date: '2025-11-22', event: 'Submitted for forensic analysis', party: 'A. Petrov', location: 'Chicago, IL', verified: true },
    ],
    verdict: 'counterfeit',
  },
  {
    id: 'FR-008',
    cardName: '2023 Bowman Chrome Elly De La Cruz RC #BCP-1',
    player: 'Elly De La Cruz',
    year: 2023,
    manufacturer: 'Topps',
    submittedAt: '2025-11-18T15:00:00Z',
    status: 'complete',
    overallAuthenticity: 93,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2023-07-10', event: 'Pack opening — Bowman Chrome Hobby', party: 'Original Owner (S. Gomez)', location: 'Cincinnati, OH', verified: true },
      { date: '2023-08-15', event: 'Submitted to PSA for grading', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2023-10-20', event: 'Graded PSA 10 — returned', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2025-11-18', event: 'Submitted for forensic analysis', party: 'S. Gomez', location: 'Cincinnati, OH', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-009',
    cardName: '2022 Panini National Treasures Trevor Lawrence RPA /99',
    player: 'Trevor Lawrence',
    year: 2022,
    manufacturer: 'Panini',
    submittedAt: '2025-11-15T09:30:00Z',
    status: 'flagged',
    overallAuthenticity: 48,
    confidenceLevel: 'medium',
    layers: makeLayers('suspicious'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2024-01-20', event: 'Purchased at auction house — $3,200', party: 'Regional Auction Co.', location: 'Jacksonville, FL', verified: true },
      { date: '2024-01-25', event: 'Shipped to buyer', party: 'Regional Auction Co.', location: 'Jacksonville, FL', verified: true },
      { date: '2024-01-30', event: 'Received by buyer', party: 'M. Hassan', location: 'Atlanta, GA', verified: true },
      { date: '2025-11-15', event: 'Submitted for forensic analysis', party: 'M. Hassan', location: 'Atlanta, GA', verified: true },
    ],
    verdict: 'suspicious',
  },
  {
    id: 'FR-010',
    cardName: '2023 Topps Finest Shohei Ohtani Auto #FA-SO',
    player: 'Shohei Ohtani',
    year: 2023,
    manufacturer: 'Topps',
    submittedAt: '2025-11-12T12:15:00Z',
    status: 'complete',
    overallAuthenticity: 97,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2023-10-01', event: 'Pack opening — Topps Finest Hobby', party: 'Original Owner (Y. Suzuki)', location: 'Los Angeles, CA', verified: true },
      { date: '2023-10-15', event: 'Submitted to PSA for grading', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2023-12-20', event: 'Graded PSA 10 — returned', party: 'PSA Grading Services', location: 'Santa Ana, CA', verified: true },
      { date: '2025-11-12', event: 'Submitted for forensic analysis', party: 'Y. Suzuki', location: 'Los Angeles, CA', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-011',
    cardName: '2021 Panini Prizm Justin Herbert RC Silver #325',
    player: 'Justin Herbert',
    year: 2021,
    manufacturer: 'Panini',
    submittedAt: '2025-11-08T17:00:00Z',
    status: 'analyzing',
    overallAuthenticity: 72,
    confidenceLevel: 'low',
    layers: makeLayers('inconclusive'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2022-09-01', event: 'Purchased from online dealer', party: 'SportCards Direct', location: 'Online', verified: true },
      { date: '2022-09-08', event: 'Received by buyer', party: 'C. Murphy', location: 'San Diego, CA', verified: true },
      { date: '2025-11-08', event: 'Submitted for forensic analysis', party: 'C. Murphy', location: 'San Diego, CA', verified: true },
    ],
    verdict: 'inconclusive',
  },
  {
    id: 'FR-012',
    cardName: '2023 Panini Prizm Chet Holmgren RC #262',
    player: 'Chet Holmgren',
    year: 2023,
    manufacturer: 'Panini',
    submittedAt: '2025-11-05T14:20:00Z',
    status: 'complete',
    overallAuthenticity: 90,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2023-08-20', event: 'Pack opening — Prizm Basketball Hobby', party: 'Original Owner (B. Thompson)', location: 'Oklahoma City, OK', verified: true },
      { date: '2023-09-15', event: 'Submitted to SGC for grading', party: 'SGC Grading', location: 'Parsippany, NJ', verified: true },
      { date: '2023-10-30', event: 'Graded SGC 10 — returned', party: 'SGC Grading', location: 'Parsippany, NJ', verified: true },
      { date: '2025-11-05', event: 'Submitted for forensic analysis', party: 'B. Thompson', location: 'Oklahoma City, OK', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-013',
    cardName: '2019 Topps Chrome Fernando Tatis Jr. RC #203',
    player: 'Fernando Tatis Jr.',
    year: 2019,
    manufacturer: 'Topps',
    submittedAt: '2025-11-01T11:00:00Z',
    status: 'flagged',
    overallAuthenticity: 19,
    confidenceLevel: 'high',
    layers: makeLayers('counterfeit'),
    knownCounterfeitMatch: {
      knownCounterfeitId: 'CF-2025-0203',
      similarity: 91.5,
      matchedFeatures: ['Digital print signature', 'Wrong stock weight', 'No UV fluorescence', 'Font mismatch', 'Known origin: Shenzhen print shop'],
      source: 'FBI Sports Memorabilia Fraud Task Force',
      reportedDate: '2025-01-10',
    },
    chainOfCustody: [
      { date: '2025-07-20', event: 'Purchased from overseas eBay seller — $45', party: 'eBay Seller (sz_cards_wholesale)', location: 'Shenzhen, China', verified: false },
      { date: '2025-08-15', event: 'Received via international post', party: 'E. Nakamura', location: 'San Diego, CA', verified: false },
      { date: '2025-11-01', event: 'Submitted for forensic analysis', party: 'E. Nakamura', location: 'San Diego, CA', verified: true },
    ],
    verdict: 'counterfeit',
  },
  {
    id: 'FR-014',
    cardName: '2023 Panini Immaculate Caleb Williams RPA /49',
    player: 'Caleb Williams',
    year: 2023,
    manufacturer: 'Panini',
    submittedAt: '2025-10-28T16:45:00Z',
    status: 'flagged',
    overallAuthenticity: 55,
    confidenceLevel: 'medium',
    layers: makeLayers('suspicious'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2024-11-15', event: 'Break hit — case break with Cardboard Connection', party: 'Cardboard Connection Breaks', location: 'Online', verified: true },
      { date: '2024-11-20', event: 'Shipped to break winner', party: 'Cardboard Connection Breaks', location: 'Dallas, TX', verified: true },
      { date: '2024-11-28', event: 'Received by winner', party: 'P. O\'Brien', location: 'Chicago, IL', verified: true },
      { date: '2025-05-10', event: 'Sold via COMC — $1,800', party: 'COMC Marketplace', location: 'Online', verified: true },
      { date: '2025-05-18', event: 'Received by buyer', party: 'W. Zhang', location: 'Houston, TX', verified: true },
      { date: '2025-10-28', event: 'Submitted for forensic analysis', party: 'W. Zhang', location: 'Houston, TX', verified: true },
    ],
    verdict: 'suspicious',
  },
  {
    id: 'FR-015',
    cardName: '2022 Topps Chrome Adley Rutschman RC Auto #RA-AR',
    player: 'Adley Rutschman',
    year: 2022,
    manufacturer: 'Topps',
    submittedAt: '2025-10-25T10:30:00Z',
    status: 'complete',
    overallAuthenticity: 92,
    confidenceLevel: 'high',
    layers: makeLayers('authentic'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: '2022-10-05', event: 'Pack opening — Topps Chrome Hobby', party: 'Original Owner (J. Kim)', location: 'Baltimore, MD', verified: true },
      { date: '2022-11-01', event: 'Submitted to BGS for grading', party: 'Beckett Grading', location: 'Dallas, TX', verified: true },
      { date: '2023-01-15', event: 'Graded BGS 9.5 — returned', party: 'Beckett Grading', location: 'Dallas, TX', verified: true },
      { date: '2025-10-25', event: 'Submitted for forensic analysis', party: 'J. Kim', location: 'Baltimore, MD', verified: true },
    ],
    verdict: 'authentic',
  },
  {
    id: 'FR-016',
    cardName: '2020 Panini Prizm Anthony Edwards RC #258',
    player: 'Anthony Edwards',
    year: 2020,
    manufacturer: 'Panini',
    submittedAt: '2025-10-20T08:15:00Z',
    status: 'flagged',
    overallAuthenticity: 26,
    confidenceLevel: 'high',
    layers: makeLayers('counterfeit'),
    knownCounterfeitMatch: {
      knownCounterfeitId: 'CF-2025-0417',
      similarity: 96.1,
      matchedFeatures: ['Inkjet print method', 'Consumer card stock', 'No holographic element', 'Wrong serial format', 'Color calibration failure'],
      source: 'Panini Anti-Counterfeit Division',
      reportedDate: '2025-04-17',
    },
    chainOfCustody: [
      { date: '2025-09-01', event: 'Purchased from Craigslist seller — $120', party: 'Unknown Seller', location: 'Minneapolis, MN', verified: false },
      { date: '2025-09-01', event: 'In-person exchange', party: 'N. Okafor', location: 'Minneapolis, MN', verified: false },
      { date: '2025-10-20', event: 'Submitted for forensic analysis', party: 'N. Okafor', location: 'Minneapolis, MN', verified: true },
    ],
    verdict: 'counterfeit',
  },
];

// ---- Mock Data: Counterfeit Database ----

const MOCK_COUNTERFEIT_DATABASE: CounterfeitDatabase = {
  totalEntries: 1847,
  recentAdditions: [
    { id: 'CF-2025-0501', cardName: '2023 Topps Chrome Wembanyama RC', player: 'Victor Wembanyama', year: 2023, manufacturer: 'Topps', detectedDate: '2025-05-01', originRegion: 'Shenzhen, China', telltaleFeatures: ['Inkjet dot pattern', 'Missing micro-text', 'Wrong stock weight'], reportCount: 342, severity: 'critical', imageHash: 'a3f8c2d1' },
    { id: 'CF-2025-0417', cardName: '2020 Panini Prizm Anthony Edwards RC', player: 'Anthony Edwards', year: 2020, manufacturer: 'Panini', detectedDate: '2025-04-17', originRegion: 'Guangzhou, China', telltaleFeatures: ['Flat holographic print', 'Consumer paper', 'Wrong font weight'], reportCount: 187, severity: 'critical', imageHash: 'b7e1d4a9' },
    { id: 'CF-2025-0330', cardName: '2018 Panini Prizm Luka Doncic RC Silver', player: 'Luka Doncic', year: 2018, manufacturer: 'Panini', detectedDate: '2025-03-30', originRegion: 'Bangkok, Thailand', telltaleFeatures: ['Color shift in skin tones', 'Lamination overlay', 'Incorrect serial schema'], reportCount: 256, severity: 'critical', imageHash: 'c4f9e3b2' },
    { id: 'CF-2025-0312', cardName: '2023 Bowman Chrome Elly De La Cruz Auto', player: 'Elly De La Cruz', year: 2023, manufacturer: 'Topps', detectedDate: '2025-03-12', originRegion: 'Miami, FL (domestic)', telltaleFeatures: ['Forged autograph ink analysis', 'Authentic card body, fake auto'], reportCount: 89, severity: 'warning', imageHash: 'd2a7b1c6' },
    { id: 'CF-2025-0228', cardName: '2022 Panini National Treasures Mac Jones RPA', player: 'Mac Jones', year: 2022, manufacturer: 'Panini', detectedDate: '2025-02-28', originRegion: 'Shenzhen, China', telltaleFeatures: ['Fake patch material', 'Digital print on authentic-weight stock', 'Wrong numbering font'], reportCount: 124, severity: 'critical', imageHash: 'e5c8d2f1' },
    { id: 'CF-2025-0215', cardName: '2021 Topps Chrome Wander Franco RC Auto', player: 'Wander Franco', year: 2021, manufacturer: 'Topps', detectedDate: '2025-02-15', originRegion: 'Dongguan, China', telltaleFeatures: ['Missing UV response', 'Consumer inkjet dye', 'Edge fraying'], reportCount: 203, severity: 'critical', imageHash: 'f1d3e4a8' },
    { id: 'CF-2025-0201', cardName: '2020 Panini Select Justin Herbert RC', player: 'Justin Herbert', year: 2020, manufacturer: 'Panini', detectedDate: '2025-02-01', originRegion: 'Jakarta, Indonesia', telltaleFeatures: ['Wrong card stock fiber', 'Hologram diffraction angle off', 'Ink composition mismatch'], reportCount: 145, severity: 'critical', imageHash: 'a2b4c6d8' },
    { id: 'CF-2025-0115', cardName: '2023 Topps Finest Ohtani Auto', player: 'Shohei Ohtani', year: 2023, manufacturer: 'Topps', detectedDate: '2025-01-15', originRegion: 'Shenzhen, China', telltaleFeatures: ['Forged on-card auto', 'Correct print method but wrong ink batch', 'Autograph ink fluoresces under UV'], reportCount: 412, severity: 'critical', imageHash: 'b3c5d7e9' },
    { id: 'CF-2025-0110', cardName: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', year: 2019, manufacturer: 'Topps', detectedDate: '2025-01-10', originRegion: 'Shenzhen, China', telltaleFeatures: ['Digital print', 'Wrong stock weight', 'No UV fluorescence', 'Font mismatch'], reportCount: 298, severity: 'critical', imageHash: 'c4d6e8f0' },
    { id: 'CF-2024-1220', cardName: '2022 Panini Contenders Brock Purdy RC Auto', player: 'Brock Purdy', year: 2022, manufacturer: 'Panini', detectedDate: '2024-12-20', originRegion: 'Guangzhou, China', telltaleFeatures: ['Printed autograph not on-card', 'Stock weight 0.04mm under spec', 'Missing holographic verification'], reportCount: 167, severity: 'critical', imageHash: 'd5e7f9a1' },
    { id: 'CF-2024-1102', cardName: '2020 Topps Chrome Luis Robert RC Auto', player: 'Luis Robert', year: 2020, manufacturer: 'Topps', detectedDate: '2024-11-02', originRegion: 'Bangkok, Thailand', telltaleFeatures: ['Inkjet artifacts', 'Wrong card stock', 'Missing UV response', 'Counterfeit autograph ink'], reportCount: 91, severity: 'critical', imageHash: 'e6f8a0b2' },
    { id: 'CF-2024-1015', cardName: '2023 Panini Prizm Tyrese Maxey', player: 'Tyrese Maxey', year: 2023, manufacturer: 'Panini', detectedDate: '2024-10-15', originRegion: 'Dongguan, China', telltaleFeatures: ['Flat prismatic print', 'Wrong corner radius', 'Ink layering order reversed'], reportCount: 78, severity: 'warning', imageHash: 'f7a9b1c3' },
    { id: 'CF-2024-0930', cardName: '2021 Panini Prizm Trevor Lawrence RC Silver', player: 'Trevor Lawrence', year: 2021, manufacturer: 'Panini', detectedDate: '2024-09-30', originRegion: 'Shenzhen, China', telltaleFeatures: ['Consumer printer identified (Canon PIXMA)', 'No factory die-cut', 'Arial Bold font substitution'], reportCount: 211, severity: 'critical', imageHash: 'a8b0c2d4' },
    { id: 'CF-2024-0891', cardName: '2018 Panini Prizm Luka Doncic RC — Batch B', player: 'Luka Doncic', year: 2018, manufacturer: 'Panini', detectedDate: '2024-06-15', originRegion: 'Shenzhen, China', telltaleFeatures: ['Inkjet print pattern', 'Missing holographic foil', 'Consumer paper stock', 'Arial font substitution'], reportCount: 534, severity: 'critical', imageHash: 'b9c1d3e5' },
    { id: 'CF-2024-0815', cardName: '2022 Topps Chrome Bobby Witt Jr. RC Auto', player: 'Bobby Witt Jr.', year: 2022, manufacturer: 'Topps', detectedDate: '2024-08-15', originRegion: 'Jakarta, Indonesia', telltaleFeatures: ['Forged autograph on authentic base', 'Ink type mismatch on signature area', 'Micro-scratches around auto area from application'], reportCount: 56, severity: 'warning', imageHash: 'c0d2e4f6' },
    { id: 'CF-2024-0710', cardName: '2023 Panini Prizm Scoot Henderson RC', player: 'Scoot Henderson', year: 2023, manufacturer: 'Panini', detectedDate: '2024-07-10', originRegion: 'Guangzhou, China', telltaleFeatures: ['Full counterfeit card', 'Wrong prismatic layer', 'Stock too thick (0.38mm vs 0.32mm spec)'], reportCount: 43, severity: 'warning', imageHash: 'd1e3f5a7' },
    { id: 'CF-2024-0605', cardName: '2020 Panini Prizm Tua Tagovailoa RC', player: 'Tua Tagovailoa', year: 2020, manufacturer: 'Panini', detectedDate: '2024-06-05', originRegion: 'Bangkok, Thailand', telltaleFeatures: ['Flat hologram', 'Wrong fiber density', 'Color calibration off by Delta E 9.2'], reportCount: 134, severity: 'critical', imageHash: 'e2f4a6b8' },
    { id: 'CF-2024-0520', cardName: '2021 Topps Update Julio Rodriguez RC', player: 'Julio Rodriguez', year: 2021, manufacturer: 'Topps', detectedDate: '2024-05-20', originRegion: 'Dongguan, China', telltaleFeatures: ['Digital print on gloss paper', 'No micro-text', 'Wrong card dimensions (0.5mm too narrow)'], reportCount: 97, severity: 'critical', imageHash: 'f3a5b7c9' },
    { id: 'CF-2024-0410', cardName: '2023 Topps Chrome Corbin Carroll RC Auto', player: 'Corbin Carroll', year: 2023, manufacturer: 'Topps', detectedDate: '2024-04-10', originRegion: 'Shenzhen, China', telltaleFeatures: ['Inkjet print', 'Laminated surface', 'Forged autograph', 'Wrong serial range'], reportCount: 176, severity: 'critical', imageHash: 'a4b6c8d0' },
    { id: 'CF-2024-0305', cardName: '2019 Panini Prizm Ja Morant RC Silver', player: 'Ja Morant', year: 2019, manufacturer: 'Panini', detectedDate: '2024-03-05', originRegion: 'Jakarta, Indonesia', telltaleFeatures: ['Consumer stock confirmed', 'No prismatic layer', 'Printed holographic sticker overlay'], reportCount: 267, severity: 'critical', imageHash: 'b5c7d9e1' },
    { id: 'CF-2024-0210', cardName: '2022 Panini Mosaic Lamar Jackson Mosaic', player: 'Lamar Jackson', year: 2022, manufacturer: 'Panini', detectedDate: '2024-02-10', originRegion: 'Guangzhou, China', telltaleFeatures: ['Wrong mosaic pattern alignment', 'Consumer printer artifacts', 'Edge inconsistency'], reportCount: 88, severity: 'warning', imageHash: 'c6d8e0f2' },
  ],
  topCounterfeitedCards: [
    { cardName: '2018 Panini Prizm Luka Doncic RC Silver', player: 'Luka Doncic', count: 790 },
    { cardName: '2023 Topps Chrome Wembanyama RC', player: 'Victor Wembanyama', count: 342 },
    { cardName: '2023 Topps Finest Ohtani Auto', player: 'Shohei Ohtani', count: 412 },
    { cardName: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', count: 298 },
    { cardName: '2019 Panini Prizm Ja Morant RC Silver', player: 'Ja Morant', count: 267 },
    { cardName: '2021 Panini Prizm Trevor Lawrence RC Silver', player: 'Trevor Lawrence', count: 211 },
    { cardName: '2021 Topps Chrome Wander Franco RC Auto', player: 'Wander Franco', count: 203 },
    { cardName: '2020 Panini Prizm Anthony Edwards RC', player: 'Anthony Edwards', count: 187 },
    { cardName: '2023 Topps Chrome Corbin Carroll RC Auto', player: 'Corbin Carroll', count: 176 },
    { cardName: '2022 Panini Contenders Brock Purdy RC Auto', player: 'Brock Purdy', count: 167 },
  ],
  hotspotRegions: [
    { region: 'Shenzhen, China', count: 892, trend: 'rising' },
    { region: 'Guangzhou, China', count: 398, trend: 'stable' },
    { region: 'Dongguan, China', count: 251, trend: 'rising' },
    { region: 'Bangkok, Thailand', count: 189, trend: 'declining' },
    { region: 'Jakarta, Indonesia', count: 147, trend: 'stable' },
    { region: 'Miami, FL (domestic)', count: 89, trend: 'rising' },
    { region: 'Los Angeles, CA (domestic)', count: 64, trend: 'stable' },
    { region: 'Ho Chi Minh City, Vietnam', count: 38, trend: 'rising' },
  ],
};

// ---- Mock Data: Authentication History ----

const MOCK_AUTHENTICATION_HISTORY: AuthenticationHistoryEntry[] = [
  { date: '2025-12-10', cardId: 'FR-001', cardName: '2023 Topps Chrome Wembanyama RC', verdict: 'authentic', authenticity: 94 },
  { date: '2025-12-08', cardId: 'FR-002', cardName: '2020 Panini Prizm Joe Burrow RC Silver', verdict: 'authentic', authenticity: 96 },
  { date: '2025-12-05', cardId: 'FR-003', cardName: '2018 Panini Prizm Luka Doncic RC Silver', verdict: 'counterfeit', authenticity: 31 },
  { date: '2025-12-03', cardId: 'FR-004', cardName: '2021 Topps Chrome Julio Rodriguez RC Auto', verdict: 'authentic', authenticity: 91 },
  { date: '2025-11-28', cardId: 'FR-005', cardName: '2022 Panini Flawless Ja Morant Patch Auto', verdict: 'suspicious', authenticity: 52 },
  { date: '2025-11-25', cardId: 'FR-006', cardName: '2019 Panini Mosaic Zion Williamson RC', verdict: 'authentic', authenticity: 89 },
  { date: '2025-11-22', cardId: 'FR-007', cardName: '2020 Topps Chrome Luis Robert RC Auto', verdict: 'counterfeit', authenticity: 23 },
  { date: '2025-11-18', cardId: 'FR-008', cardName: '2023 Bowman Chrome Elly De La Cruz RC', verdict: 'authentic', authenticity: 93 },
  { date: '2025-11-15', cardId: 'FR-009', cardName: '2022 Panini NT Trevor Lawrence RPA', verdict: 'suspicious', authenticity: 48 },
  { date: '2025-11-12', cardId: 'FR-010', cardName: '2023 Topps Finest Shohei Ohtani Auto', verdict: 'authentic', authenticity: 97 },
  { date: '2025-11-08', cardId: 'FR-011', cardName: '2021 Panini Prizm Justin Herbert RC Silver', verdict: 'inconclusive', authenticity: 72 },
  { date: '2025-11-05', cardId: 'FR-012', cardName: '2023 Panini Prizm Chet Holmgren RC', verdict: 'authentic', authenticity: 90 },
  { date: '2025-11-01', cardId: 'FR-013', cardName: '2019 Topps Chrome Fernando Tatis Jr. RC', verdict: 'counterfeit', authenticity: 19 },
  { date: '2025-10-28', cardId: 'FR-014', cardName: '2023 Panini Immaculate Caleb Williams RPA', verdict: 'suspicious', authenticity: 55 },
  { date: '2025-10-25', cardId: 'FR-015', cardName: '2022 Topps Chrome Adley Rutschman RC Auto', verdict: 'authentic', authenticity: 92 },
  { date: '2025-10-20', cardId: 'FR-016', cardName: '2020 Panini Prizm Anthony Edwards RC', verdict: 'counterfeit', authenticity: 26 },
];

// ---- Service Functions ----

export function getForensicReport(cardId: string): ForensicReport | undefined {
  return MOCK_FORENSIC_REPORTS.find((r) => r.id === cardId);
}

export function getForensicReports(): ForensicReport[] {
  return MOCK_FORENSIC_REPORTS;
}

export function runForensicAnalysis(cardId: string): ForensicReport {
  const existing = MOCK_FORENSIC_REPORTS.find((r) => r.id === cardId);
  if (existing) return { ...existing, status: 'complete' };
  return {
    id: `FR-NEW-${Date.now()}`,
    cardName: 'Unknown Card — Pending Identification',
    player: 'Unknown',
    year: 2024,
    manufacturer: 'Unknown',
    submittedAt: new Date().toISOString(),
    status: 'analyzing',
    overallAuthenticity: 0,
    confidenceLevel: 'low',
    layers: makeLayers('inconclusive'),
    knownCounterfeitMatch: null,
    chainOfCustody: [
      { date: new Date().toISOString().slice(0, 10), event: 'Submitted for forensic analysis', party: 'Current User', location: 'Online Submission', verified: true },
    ],
    verdict: 'inconclusive',
  };
}

export function getCounterfeitDatabase(): CounterfeitDatabase {
  return MOCK_COUNTERFEIT_DATABASE;
}

export function compareCards(id1: string, id2: string): ForensicComparison | null {
  const card1 = MOCK_FORENSIC_REPORTS.find((r) => r.id === id1);
  const card2 = MOCK_FORENSIC_REPORTS.find((r) => r.id === id2);
  if (!card1 || !card2) return null;

  const layerComparisons: LayerComparison[] = card1.layers.map((l1, i) => {
    const l2 = card2.layers[i];
    const delta = Math.abs(l1.score - l2.score);
    return {
      layerName: l1.name,
      card1Score: l1.score,
      card2Score: l2.score,
      delta,
      suspicious: delta > 30,
    };
  });

  const overallSimilarity = 100 - layerComparisons.reduce((sum, lc) => sum + lc.delta, 0) / layerComparisons.length;
  const suspiciousLayers = layerComparisons.filter((lc) => lc.suspicious).map((lc) => lc.layerName);

  return {
    card1: { id: card1.id, cardName: card1.cardName, player: card1.player },
    card2: { id: card2.id, cardName: card2.cardName, player: card2.player },
    layerComparisons,
    overallSimilarity: Math.round(overallSimilarity * 10) / 10,
    suspiciousLayers,
  };
}

export function getAnomalyDetails(reportId: string, layerId: string): { layer: ForensicLayer; report: ForensicReport } | null {
  const report = MOCK_FORENSIC_REPORTS.find((r) => r.id === reportId);
  if (!report) return null;
  const layer = report.layers.find((l) => l.id === layerId);
  if (!layer) return null;
  return { layer, report };
}

export function getChainOfCustody(cardId: string): CustodyEvent[] {
  const report = MOCK_FORENSIC_REPORTS.find((r) => r.id === cardId);
  return report?.chainOfCustody ?? [];
}

export function getCounterfeitHotspots(): CounterfeitDatabase['hotspotRegions'] {
  return MOCK_COUNTERFEIT_DATABASE.hotspotRegions;
}

export function getAuthenticationHistory(): AuthenticationHistoryEntry[] {
  return MOCK_AUTHENTICATION_HISTORY;
}

// ---- Anomaly Heat Map Data ----

export interface HeatMapCell {
  row: number;
  col: number;
  severity: AnomalySeverity | null;
  label: string;
}

export function getAnomalyHeatMap(reportId: string): HeatMapCell[] {
  const report = MOCK_FORENSIC_REPORTS.find((r) => r.id === reportId);
  if (!report) return [];

  const grid: HeatMapCell[] = [];
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 10; col++) {
      grid.push({ row, col, severity: null, label: '' });
    }
  }

  for (const layer of report.layers) {
    for (const anomaly of layer.anomalies) {
      if (typeof anomaly.location === 'object' && 'row' in anomaly.location) {
        const idx = anomaly.location.row * 10 + anomaly.location.col;
        if (idx >= 0 && idx < grid.length) {
          const existing = grid[idx];
          const severityRank: Record<AnomalySeverity, number> = { info: 1, warning: 2, critical: 3 };
          if (!existing.severity || severityRank[anomaly.severity] > severityRank[existing.severity]) {
            grid[idx] = {
              ...existing,
              severity: anomaly.severity,
              label: `${getLayerDisplayName(layer.name)}: ${anomaly.description}`,
            };
          }
        }
      }
    }
  }

  return grid;
}
