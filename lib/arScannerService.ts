// ---- Types ----

export type OverlayLayer = 'price' | 'grade' | 'pop_report' | 'comps' | 'trend';

export interface ScanResult {
  id: string;
  cardId: string;
  player: string;
  year: number;
  set: string;
  variation: string;
  sport: string;
  confidence: number;
  scannedAt: string;
  estimatedGrade: string;
  estimatedValue: number;
  thumbnail: string;
}

export interface CardIdentification {
  cardId: string;
  player: string;
  year: number;
  set: string;
  variation: string;
  sport: string;
  confidence: number;
  alternateMatches: { cardId: string; player: string; confidence: number }[];
}

export interface AROverlay {
  cardId: string;
  layers: OverlayLayerData[];
  priceHistory: { date: string; price: number }[];
  comps: { title: string; price: number; date: string; grade: string }[];
  popReport: { grade: string; population: number; higherPop: number }[];
  gradeEstimate: { grade: string; probability: number }[];
  trendDirection: 'up' | 'down' | 'stable';
  trendPercent: number;
}

export interface OverlayLayerData {
  layer: OverlayLayer;
  label: string;
  enabled: boolean;
  color: string;
}

export interface DisplayCase3D {
  id: string;
  name: string;
  theme: ARDisplayTheme;
  cards: string[];
  layout: 'grid' | 'carousel' | 'shelf' | 'pedestal';
  background: string;
  lighting: string;
  createdAt: string;
  cardCount: number;
}

export interface ScanHistory {
  totalScans: number;
  uniqueCards: number;
  avgConfidence: number;
  recentScans: ScanResult[];
  topPlayers: { player: string; scanCount: number }[];
}

export interface CameraConfig {
  resolution: string;
  autofocus: boolean;
  flashMode: 'auto' | 'on' | 'off';
  scanMode: 'single' | 'continuous';
  guideBorder: boolean;
  hapticFeedback: boolean;
  overlayOpacity: number;
}

export interface ARDisplayTheme {
  id: string;
  name: string;
  background: string;
  accent: string;
  lighting: string;
  shelfMaterial: string;
}

// ---- Mock Data ----

const MOCK_SCAN_RESULTS: ScanResult[] = [
  {
    id: 'scan-001',
    cardId: 'card-trout-2011',
    player: 'Mike Trout',
    year: 2011,
    set: 'Topps Update',
    variation: 'Base RC #US175',
    sport: 'Baseball',
    confidence: 0.97,
    scannedAt: '2026-03-13T09:14:00Z',
    estimatedGrade: 'PSA 9',
    estimatedValue: 28500,
    thumbnail: '/cards/trout-2011.jpg',
  },
  {
    id: 'scan-002',
    cardId: 'card-mahomes-2017',
    player: 'Patrick Mahomes',
    year: 2017,
    set: 'Panini Prizm',
    variation: 'Silver Prizm RC #269',
    sport: 'Football',
    confidence: 0.94,
    scannedAt: '2026-03-13T08:42:00Z',
    estimatedGrade: 'BGS 9.5',
    estimatedValue: 18750,
    thumbnail: '/cards/mahomes-2017.jpg',
  },
  {
    id: 'scan-003',
    cardId: 'card-luka-2018',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    variation: 'Silver Prizm RC #280',
    sport: 'Basketball',
    confidence: 0.99,
    scannedAt: '2026-03-12T22:10:00Z',
    estimatedGrade: 'PSA 10',
    estimatedValue: 31200,
    thumbnail: '/cards/doncic-2018.jpg',
  },
  {
    id: 'scan-004',
    cardId: 'card-ohtani-2018',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps Chrome',
    variation: 'Refractor RC #150',
    sport: 'Baseball',
    confidence: 0.92,
    scannedAt: '2026-03-12T19:55:00Z',
    estimatedGrade: 'SGC 10',
    estimatedValue: 22800,
    thumbnail: '/cards/ohtani-2018.jpg',
  },
  {
    id: 'scan-005',
    cardId: 'card-wemby-2023',
    player: 'Victor Wembanyama',
    year: 2023,
    set: 'Panini Prizm',
    variation: 'Base RC #225',
    sport: 'Basketball',
    confidence: 0.96,
    scannedAt: '2026-03-12T17:30:00Z',
    estimatedGrade: 'PSA 10',
    estimatedValue: 4500,
    thumbnail: '/cards/wemby-2023.jpg',
  },
  {
    id: 'scan-006',
    cardId: 'card-jeter-1993',
    player: 'Derek Jeter',
    year: 1993,
    set: 'SP',
    variation: 'Foil RC #279',
    sport: 'Baseball',
    confidence: 0.88,
    scannedAt: '2026-03-12T15:20:00Z',
    estimatedGrade: 'PSA 8',
    estimatedValue: 68000,
    thumbnail: '/cards/jeter-1993.jpg',
  },
  {
    id: 'scan-007',
    cardId: 'card-brady-2000',
    player: 'Tom Brady',
    year: 2000,
    set: 'Playoff Contenders',
    variation: 'Championship Ticket Auto RC #144',
    sport: 'Football',
    confidence: 0.91,
    scannedAt: '2026-03-11T20:45:00Z',
    estimatedGrade: 'BGS 9',
    estimatedValue: 285000,
    thumbnail: '/cards/brady-2000.jpg',
  },
  {
    id: 'scan-008',
    cardId: 'card-jordan-1986',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    variation: 'Base RC #57',
    sport: 'Basketball',
    confidence: 0.95,
    scannedAt: '2026-03-11T18:12:00Z',
    estimatedGrade: 'PSA 9',
    estimatedValue: 45000,
    thumbnail: '/cards/jordan-1986.jpg',
  },
  {
    id: 'scan-009',
    cardId: 'card-gretzky-1979',
    player: 'Wayne Gretzky',
    year: 1979,
    set: 'O-Pee-Chee',
    variation: 'Base RC #18',
    sport: 'Hockey',
    confidence: 0.87,
    scannedAt: '2026-03-11T14:00:00Z',
    estimatedGrade: 'PSA 7',
    estimatedValue: 125000,
    thumbnail: '/cards/gretzky-1979.jpg',
  },
  {
    id: 'scan-010',
    cardId: 'card-acuna-2018',
    player: 'Ronald Acuna Jr.',
    year: 2018,
    set: 'Topps Chrome',
    variation: 'Update Auto RC #RA',
    sport: 'Baseball',
    confidence: 0.93,
    scannedAt: '2026-03-10T11:30:00Z',
    estimatedGrade: 'PSA 10',
    estimatedValue: 8200,
    thumbnail: '/cards/acuna-2018.jpg',
  },
  {
    id: 'scan-011',
    cardId: 'card-caleb-2024',
    player: 'Caleb Williams',
    year: 2024,
    set: 'Panini Prizm',
    variation: 'Green Prizm RC #301',
    sport: 'Football',
    confidence: 0.90,
    scannedAt: '2026-03-10T09:15:00Z',
    estimatedGrade: 'PSA 10',
    estimatedValue: 1850,
    thumbnail: '/cards/williams-2024.jpg',
  },
];

const MOCK_DISPLAY_CASES: DisplayCase3D[] = [
  {
    id: 'case-001',
    name: 'Grail Wall',
    theme: { id: 'theme-obsidian', name: 'Obsidian Vault', background: '#0a0a0f', accent: '#a3e635', lighting: 'spotlight', shelfMaterial: 'glass' },
    cards: ['card-jordan-1986', 'card-brady-2000', 'card-gretzky-1979', 'card-jeter-1993'],
    layout: 'grid',
    background: 'dark-vault',
    lighting: 'dramatic',
    createdAt: '2026-03-01T10:00:00Z',
    cardCount: 4,
  },
  {
    id: 'case-002',
    name: 'Modern Rookies',
    theme: { id: 'theme-neon', name: 'Neon Gallery', background: '#0f172a', accent: '#38bdf8', lighting: 'neon-glow', shelfMaterial: 'acrylic' },
    cards: ['card-wemby-2023', 'card-caleb-2024', 'card-luka-2018'],
    layout: 'carousel',
    background: 'neon-gallery',
    lighting: 'ambient',
    createdAt: '2026-03-05T14:30:00Z',
    cardCount: 3,
  },
  {
    id: 'case-003',
    name: 'Baseball Legends',
    theme: { id: 'theme-wood', name: 'Classic Wood', background: '#1c1917', accent: '#d97706', lighting: 'warm', shelfMaterial: 'walnut' },
    cards: ['card-trout-2011', 'card-ohtani-2018', 'card-jeter-1993', 'card-acuna-2018'],
    layout: 'shelf',
    background: 'wood-cabinet',
    lighting: 'warm',
    createdAt: '2026-03-08T08:00:00Z',
    cardCount: 4,
  },
];

const MOCK_OVERLAY_LAYERS: OverlayLayerData[] = [
  { layer: 'price', label: 'Live Pricing', enabled: true, color: '#a3e635' },
  { layer: 'grade', label: 'Grade Estimate', enabled: true, color: '#38bdf8' },
  { layer: 'pop_report', label: 'Pop Report', enabled: false, color: '#f472b6' },
  { layer: 'comps', label: 'Recent Comps', enabled: true, color: '#fb923c' },
  { layer: 'trend', label: 'Price Trend', enabled: false, color: '#a78bfa' },
];

const MOCK_THEMES: ARDisplayTheme[] = [
  { id: 'theme-obsidian', name: 'Obsidian Vault', background: '#0a0a0f', accent: '#a3e635', lighting: 'spotlight', shelfMaterial: 'glass' },
  { id: 'theme-neon', name: 'Neon Gallery', background: '#0f172a', accent: '#38bdf8', lighting: 'neon-glow', shelfMaterial: 'acrylic' },
  { id: 'theme-wood', name: 'Classic Wood', background: '#1c1917', accent: '#d97706', lighting: 'warm', shelfMaterial: 'walnut' },
  { id: 'theme-ice', name: 'Ice Museum', background: '#0c1524', accent: '#67e8f9', lighting: 'cool', shelfMaterial: 'frosted-glass' },
];

// ---- Service Functions ----

export function scanCard(): ScanResult {
  const idx = Math.floor(Math.random() * MOCK_SCAN_RESULTS.length);
  return {
    ...MOCK_SCAN_RESULTS[idx],
    id: `scan-${Date.now()}`,
    scannedAt: new Date().toISOString(),
    confidence: 0.85 + Math.random() * 0.14,
  };
}

export function identifyCard(imageId: string): CardIdentification {
  const base = MOCK_SCAN_RESULTS.find((s) => s.cardId === imageId) || MOCK_SCAN_RESULTS[0];
  return {
    cardId: base.cardId,
    player: base.player,
    year: base.year,
    set: base.set,
    variation: base.variation,
    sport: base.sport,
    confidence: base.confidence,
    alternateMatches: [
      { cardId: 'alt-001', player: base.player, confidence: base.confidence * 0.7 },
      { cardId: 'alt-002', player: base.player, confidence: base.confidence * 0.45 },
    ],
  };
}

export function getAROverlay(cardId: string): AROverlay {
  const card = MOCK_SCAN_RESULTS.find((s) => s.cardId === cardId) || MOCK_SCAN_RESULTS[0];
  const basePrice = card.estimatedValue;
  return {
    cardId: card.cardId,
    layers: MOCK_OVERLAY_LAYERS,
    priceHistory: [
      { date: '2025-10', price: basePrice * 0.82 },
      { date: '2025-11', price: basePrice * 0.87 },
      { date: '2025-12', price: basePrice * 0.91 },
      { date: '2026-01', price: basePrice * 0.95 },
      { date: '2026-02', price: basePrice * 0.98 },
      { date: '2026-03', price: basePrice },
    ],
    comps: [
      { title: `${card.player} ${card.set} ${card.variation}`, price: basePrice * 1.02, date: '2026-03-10', grade: card.estimatedGrade },
      { title: `${card.player} ${card.set} ${card.variation}`, price: basePrice * 0.96, date: '2026-03-05', grade: card.estimatedGrade },
      { title: `${card.player} ${card.set} ${card.variation}`, price: basePrice * 1.08, date: '2026-02-28', grade: card.estimatedGrade },
      { title: `${card.player} ${card.set} Base`, price: basePrice * 0.6, date: '2026-03-08', grade: card.estimatedGrade },
    ],
    popReport: [
      { grade: 'PSA 10', population: 1245, higherPop: 0 },
      { grade: 'PSA 9', population: 3870, higherPop: 1245 },
      { grade: 'PSA 8', population: 2104, higherPop: 5115 },
      { grade: 'PSA 7', population: 890, higherPop: 7219 },
    ],
    gradeEstimate: [
      { grade: 'PSA 10', probability: 0.35 },
      { grade: 'PSA 9', probability: 0.45 },
      { grade: 'PSA 8', probability: 0.15 },
      { grade: 'PSA 7', probability: 0.05 },
    ],
    trendDirection: 'up',
    trendPercent: 4.8,
  };
}

export function getScanHistory(): ScanHistory {
  const players: Record<string, number> = {};
  MOCK_SCAN_RESULTS.forEach((s) => {
    players[s.player] = (players[s.player] || 0) + 1;
  });
  const topPlayers = Object.entries(players)
    .map(([player, scanCount]) => ({ player, scanCount }))
    .sort((a, b) => b.scanCount - a.scanCount)
    .slice(0, 5);

  return {
    totalScans: MOCK_SCAN_RESULTS.length,
    uniqueCards: new Set(MOCK_SCAN_RESULTS.map((s) => s.cardId)).size,
    avgConfidence: MOCK_SCAN_RESULTS.reduce((sum, s) => sum + s.confidence, 0) / MOCK_SCAN_RESULTS.length,
    recentScans: [...MOCK_SCAN_RESULTS].sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()),
    topPlayers,
  };
}

export function createDisplayCase(name: string, themeId: string, layout: DisplayCase3D['layout']): DisplayCase3D {
  const theme = MOCK_THEMES.find((t) => t.id === themeId) || MOCK_THEMES[0];
  return {
    id: `case-${Date.now()}`,
    name,
    theme,
    cards: [],
    layout,
    background: theme.background,
    lighting: theme.lighting,
    createdAt: new Date().toISOString(),
    cardCount: 0,
  };
}

export function getDisplayCases(): DisplayCase3D[] {
  return MOCK_DISPLAY_CASES;
}

export function getOverlayLayers(): OverlayLayerData[] {
  return MOCK_OVERLAY_LAYERS;
}

export function getCameraConfig(): CameraConfig {
  return {
    resolution: '1920x1080',
    autofocus: true,
    flashMode: 'auto',
    scanMode: 'single',
    guideBorder: true,
    hapticFeedback: true,
    overlayOpacity: 0.85,
  };
}

export function getQuickValuation(cardId: string): { low: number; mid: number; high: number; currency: string } {
  const card = MOCK_SCAN_RESULTS.find((s) => s.cardId === cardId) || MOCK_SCAN_RESULTS[0];
  const base = card.estimatedValue;
  return {
    low: Math.round(base * 0.85),
    mid: base,
    high: Math.round(base * 1.18),
    currency: 'USD',
  };
}
