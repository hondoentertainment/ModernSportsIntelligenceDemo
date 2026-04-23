// @ts-nocheck
// =============================================================================
// Scan-to-Value Service
// Provides card scanning, identification, valuation, and batch management
// =============================================================================

import { store } from '../dal/syncStore';

const STORAGE_PREFIX = 'msi_scan_to_value';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MatchedCard {
  cardName: string;
  confidence: number;
  marketValue: number;
  grade?: string;
}

export interface ScanResult {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  cardNumber: string;
  variation: string;
  imageUrl: string;
  scanConfidence: number; // 0-100
  matchedCards: MatchedCard[];
  estimatedGrade: number;
  estimatedValue: number;
  scanTimestamp: string;
  addedToCollection: boolean;
}

export interface QuickValuation {
  rawValue: number;
  gradedValues: { grade: string; value: number }[];
  recentSales: { date: string; price: number; platform: string; grade?: string }[];
  priceRange: { low: number; mid: number; high: number };
}

export interface ScanHistory {
  totalScans: number;
  cardsIdentified: number;
  addedToCollection: number;
  totalValueScanned: number;
  avgScanConfidence: number;
  scansByDay: { date: string; count: number }[];
}

export interface BatchScan {
  id: string;
  name: string;
  items: ScanResult[];
  totalValue: number;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const MOCK_SCANS: ScanResult[] = [
  {
    id: 'scan-001',
    cardName: '2023 Topps Chrome Victor Wembanyama RC #220',
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    year: 2023,
    set: 'Topps Chrome',
    cardNumber: '220',
    variation: 'Base',
    imageUrl: '/images/scans/wembanyama-chrome.jpg',
    scanConfidence: 97,
    matchedCards: [
      { cardName: '2023 Topps Chrome #220 RC', confidence: 97, marketValue: 285, grade: 'PSA 10' },
      { cardName: '2023 Topps Chrome #220 RC', confidence: 95, marketValue: 120, grade: 'Raw' },
    ],
    estimatedGrade: 8.5,
    estimatedValue: 175,
    scanTimestamp: '2025-12-15T10:30:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-002',
    cardName: '2024 Panini Prizm Caitlin Clark RC #101',
    player: 'Caitlin Clark',
    sport: 'Basketball',
    year: 2024,
    set: 'Panini Prizm',
    cardNumber: '101',
    variation: 'Silver',
    imageUrl: '/images/scans/clark-prizm-silver.jpg',
    scanConfidence: 94,
    matchedCards: [
      { cardName: '2024 Panini Prizm #101 Silver RC', confidence: 94, marketValue: 520, grade: 'PSA 10' },
      { cardName: '2024 Panini Prizm #101 Silver RC', confidence: 92, marketValue: 340, grade: 'PSA 9' },
    ],
    estimatedGrade: 9,
    estimatedValue: 420,
    scanTimestamp: '2025-12-14T14:20:00Z',
    addedToCollection: false,
  },
  {
    id: 'scan-003',
    cardName: '2022 Topps Series 1 Julio Rodriguez RC #659',
    player: 'Julio Rodriguez',
    sport: 'Baseball',
    year: 2022,
    set: 'Topps Series 1',
    cardNumber: '659',
    variation: 'Base',
    imageUrl: '/images/scans/jrod-topps.jpg',
    scanConfidence: 91,
    matchedCards: [
      { cardName: '2022 Topps Series 1 #659 RC', confidence: 91, marketValue: 45, grade: 'PSA 10' },
      { cardName: '2022 Topps Series 1 #659 RC', confidence: 88, marketValue: 15, grade: 'Raw' },
    ],
    estimatedGrade: 8,
    estimatedValue: 25,
    scanTimestamp: '2025-12-13T09:15:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-004',
    cardName: '2023 Panini Donruss Optic CJ Stroud RC #201',
    player: 'CJ Stroud',
    sport: 'Football',
    year: 2023,
    set: 'Panini Donruss Optic',
    cardNumber: '201',
    variation: 'Holo',
    imageUrl: '/images/scans/stroud-optic-holo.jpg',
    scanConfidence: 88,
    matchedCards: [
      { cardName: '2023 Donruss Optic #201 Holo RC', confidence: 88, marketValue: 135, grade: 'PSA 10' },
      { cardName: '2023 Donruss Optic #201 Holo RC', confidence: 85, marketValue: 65 },
    ],
    estimatedGrade: 9,
    estimatedValue: 95,
    scanTimestamp: '2025-12-12T16:45:00Z',
    addedToCollection: false,
  },
  {
    id: 'scan-005',
    cardName: '2024 Upper Deck Connor Bedard YG #201',
    player: 'Connor Bedard',
    sport: 'Hockey',
    year: 2024,
    set: 'Upper Deck Series 1',
    cardNumber: '201',
    variation: 'Young Guns',
    imageUrl: '/images/scans/bedard-yg.jpg',
    scanConfidence: 96,
    matchedCards: [
      { cardName: '2024 Upper Deck #201 Young Guns', confidence: 96, marketValue: 210, grade: 'PSA 10' },
      { cardName: '2024 Upper Deck #201 Young Guns', confidence: 93, marketValue: 95, grade: 'Raw' },
    ],
    estimatedGrade: 9.5,
    estimatedValue: 180,
    scanTimestamp: '2025-12-11T11:00:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-006',
    cardName: '2020 Panini Prizm Justin Herbert RC #325',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Panini Prizm',
    cardNumber: '325',
    variation: 'Base',
    imageUrl: '/images/scans/herbert-prizm.jpg',
    scanConfidence: 93,
    matchedCards: [
      { cardName: '2020 Panini Prizm #325 RC', confidence: 93, marketValue: 80, grade: 'PSA 10' },
      { cardName: '2020 Panini Prizm #325 RC', confidence: 90, marketValue: 30, grade: 'Raw' },
    ],
    estimatedGrade: 8.5,
    estimatedValue: 50,
    scanTimestamp: '2025-12-10T13:30:00Z',
    addedToCollection: false,
  },
  {
    id: 'scan-007',
    cardName: '2023 Topps Chrome Corbin Carroll RC #36',
    player: 'Corbin Carroll',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Chrome',
    cardNumber: '36',
    variation: 'Refractor',
    imageUrl: '/images/scans/carroll-chrome-refractor.jpg',
    scanConfidence: 89,
    matchedCards: [
      { cardName: '2023 Topps Chrome #36 Refractor RC', confidence: 89, marketValue: 110, grade: 'PSA 10' },
      { cardName: '2023 Topps Chrome #36 Refractor RC', confidence: 86, marketValue: 55 },
    ],
    estimatedGrade: 9,
    estimatedValue: 75,
    scanTimestamp: '2025-12-09T08:00:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-008',
    cardName: '2024 Panini Prizm Lamine Yamal RC #199',
    player: 'Lamine Yamal',
    sport: 'Soccer',
    year: 2024,
    set: 'Panini Prizm',
    cardNumber: '199',
    variation: 'Green',
    imageUrl: '/images/scans/yamal-prizm-green.jpg',
    scanConfidence: 85,
    matchedCards: [
      { cardName: '2024 Panini Prizm #199 Green RC', confidence: 85, marketValue: 350, grade: 'PSA 10' },
      { cardName: '2024 Panini Prizm #199 Green RC', confidence: 82, marketValue: 190 },
    ],
    estimatedGrade: 8,
    estimatedValue: 230,
    scanTimestamp: '2025-12-08T17:20:00Z',
    addedToCollection: false,
  },
  {
    id: 'scan-009',
    cardName: '2023 Panini Select Anthony Richardson RC #144',
    player: 'Anthony Richardson',
    sport: 'Football',
    year: 2023,
    set: 'Panini Select',
    cardNumber: '144',
    variation: 'Concourse',
    imageUrl: '/images/scans/richardson-select.jpg',
    scanConfidence: 92,
    matchedCards: [
      { cardName: '2023 Panini Select #144 Concourse RC', confidence: 92, marketValue: 55, grade: 'PSA 10' },
      { cardName: '2023 Panini Select #144 Concourse RC', confidence: 89, marketValue: 20, grade: 'Raw' },
    ],
    estimatedGrade: 9,
    estimatedValue: 35,
    scanTimestamp: '2025-12-07T12:10:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-010',
    cardName: '2021 Topps Update Ronald Acuna Jr. ASG #US1',
    player: 'Ronald Acuna Jr.',
    sport: 'Baseball',
    year: 2021,
    set: 'Topps Update',
    cardNumber: 'US1',
    variation: 'All-Star Game',
    imageUrl: '/images/scans/acuna-asg.jpg',
    scanConfidence: 90,
    matchedCards: [
      { cardName: '2021 Topps Update #US1 ASG', confidence: 90, marketValue: 25, grade: 'PSA 10' },
      { cardName: '2021 Topps Update #US1 ASG', confidence: 87, marketValue: 8 },
    ],
    estimatedGrade: 8,
    estimatedValue: 12,
    scanTimestamp: '2025-12-06T15:45:00Z',
    addedToCollection: false,
  },
  {
    id: 'scan-011',
    cardName: '2024 Panini Prizm Angel Reese RC #210',
    player: 'Angel Reese',
    sport: 'Basketball',
    year: 2024,
    set: 'Panini Prizm',
    cardNumber: '210',
    variation: 'Base',
    imageUrl: '/images/scans/reese-prizm.jpg',
    scanConfidence: 95,
    matchedCards: [
      { cardName: '2024 Panini Prizm #210 RC', confidence: 95, marketValue: 160, grade: 'PSA 10' },
      { cardName: '2024 Panini Prizm #210 RC', confidence: 93, marketValue: 75, grade: 'Raw' },
    ],
    estimatedGrade: 9,
    estimatedValue: 110,
    scanTimestamp: '2025-12-05T10:00:00Z',
    addedToCollection: true,
  },
  {
    id: 'scan-012',
    cardName: '2023 Bowman Chrome Elly De La Cruz 1st #BCP-50',
    player: 'Elly De La Cruz',
    sport: 'Baseball',
    year: 2023,
    set: 'Bowman Chrome',
    cardNumber: 'BCP-50',
    variation: '1st Bowman',
    imageUrl: '/images/scans/delacruz-bowman.jpg',
    scanConfidence: 87,
    matchedCards: [
      { cardName: '2023 Bowman Chrome #BCP-50 1st', confidence: 87, marketValue: 90, grade: 'PSA 10' },
      { cardName: '2023 Bowman Chrome #BCP-50 1st', confidence: 84, marketValue: 40, grade: 'Raw' },
    ],
    estimatedGrade: 8.5,
    estimatedValue: 60,
    scanTimestamp: '2025-12-04T14:30:00Z',
    addedToCollection: false,
  },
];

const MOCK_BATCH_SCANS: BatchScan[] = [
  {
    id: 'batch-001',
    name: 'Weekend Card Show Pickups',
    items: [MOCK_SCANS[0], MOCK_SCANS[2], MOCK_SCANS[4]],
    totalValue: MOCK_SCANS[0].estimatedValue + MOCK_SCANS[2].estimatedValue + MOCK_SCANS[4].estimatedValue,
    createdAt: '2025-12-15T09:00:00Z',
  },
  {
    id: 'batch-002',
    name: 'Football Rookies Lot',
    items: [MOCK_SCANS[3], MOCK_SCANS[5]],
    totalValue: MOCK_SCANS[3].estimatedValue + MOCK_SCANS[5].estimatedValue,
    createdAt: '2025-12-12T08:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Storage helpers
// -----------------------------------------------------------------------------

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// -----------------------------------------------------------------------------
// Exported functions
// -----------------------------------------------------------------------------

/** Returns aggregated scan history stats */
export function getScanHistory(): ScanHistory {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  const totalScans = scans.length;
  const cardsIdentified = scans.filter((s) => s.scanConfidence >= 70).length;
  const addedToCollection = scans.filter((s) => s.addedToCollection).length;
  const totalValueScanned = scans.reduce((sum, s) => sum + s.estimatedValue, 0);
  const avgScanConfidence =
    totalScans > 0
      ? Math.round(scans.reduce((sum, s) => sum + s.scanConfidence, 0) / totalScans)
      : 0;

  // Group scans by day
  const dayMap: Record<string, number> = {};
  for (const s of scans) {
    const day = s.scanTimestamp.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  }
  const scansByDay = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { totalScans, cardsIdentified, addedToCollection, totalValueScanned, avgScanConfidence, scansByDay };
}

/** Returns list of recent scans, newest first */
export function getRecentScans(): ScanResult[] {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  return [...scans].sort(
    (a, b) => new Date(b.scanTimestamp).getTime() - new Date(a.scanTimestamp).getTime(),
  );
}

/** Simulate scanning a card from image data. Returns a mock ScanResult. */
export function scanCard(_imageData: string): ScanResult {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  const template = MOCK_SCANS[Math.floor(Math.random() * MOCK_SCANS.length)];
  const newScan: ScanResult = {
    ...template,
    id: `scan-${Date.now()}`,
    scanTimestamp: new Date().toISOString(),
    addedToCollection: false,
    scanConfidence: Math.min(100, template.scanConfidence + Math.floor(Math.random() * 5) - 2),
  };
  scans.push(newScan);
  saveToStorage('scans', scans);
  return newScan;
}

/** Retrieve a single scan by id */
export function getScanById(id: string): ScanResult | undefined {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  return scans.find((s) => s.id === id);
}

/** Get a quick valuation for a given card id */
export function getQuickValuation(cardId: string): QuickValuation {
  const scan = getScanById(cardId);
  const baseValue = scan?.estimatedValue ?? 100;

  return {
    rawValue: Math.round(baseValue * 0.6),
    gradedValues: [
      { grade: 'PSA 10', value: Math.round(baseValue * 1.8) },
      { grade: 'PSA 9', value: Math.round(baseValue * 1.2) },
      { grade: 'PSA 8', value: Math.round(baseValue * 0.85) },
      { grade: 'PSA 7', value: Math.round(baseValue * 0.6) },
      { grade: 'SGC 10', value: Math.round(baseValue * 1.5) },
      { grade: 'BGS 9.5', value: Math.round(baseValue * 1.6) },
    ],
    recentSales: [
      { date: '2025-12-14', price: Math.round(baseValue * 1.05), platform: 'eBay', grade: 'PSA 10' },
      { date: '2025-12-12', price: Math.round(baseValue * 0.95), platform: 'COMC', grade: 'PSA 9' },
      { date: '2025-12-10', price: Math.round(baseValue * 0.55), platform: 'eBay' },
      { date: '2025-12-08', price: Math.round(baseValue * 1.1), platform: 'MySlabs', grade: 'PSA 10' },
      { date: '2025-12-06', price: Math.round(baseValue * 0.9), platform: 'eBay', grade: 'PSA 9' },
    ],
    priceRange: {
      low: Math.round(baseValue * 0.5),
      mid: baseValue,
      high: Math.round(baseValue * 1.8),
    },
  };
}

/** Get all batch scans */
export function getBatchScans(): BatchScan[] {
  return loadFromStorage<BatchScan[]>('batches', MOCK_BATCH_SCANS);
}

/** Create a new empty batch scan */
export function createBatchScan(name: string): BatchScan {
  const batches = getBatchScans();
  const newBatch: BatchScan = {
    id: `batch-${Date.now()}`,
    name,
    items: [],
    totalValue: 0,
    createdAt: new Date().toISOString(),
  };
  batches.push(newBatch);
  saveToStorage('batches', batches);
  return newBatch;
}

/** Add a scan result to an existing batch */
export function addToBatch(batchId: string, scan: ScanResult): BatchScan | undefined {
  const batches = getBatchScans();
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) return undefined;
  batch.items.push(scan);
  batch.totalValue = batch.items.reduce((sum, item) => sum + item.estimatedValue, 0);
  saveToStorage('batches', batches);
  return batch;
}

/** Mark a scan result as added to the collection */
export function addToCollection(scanId: string): ScanResult | undefined {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  const scan = scans.find((s) => s.id === scanId);
  if (!scan) return undefined;
  scan.addedToCollection = true;
  saveToStorage('scans', scans);
  return scan;
}

/** Get aggregate scan stats */
export function getScanStats(): {
  totalScans: number;
  avgConfidence: number;
  totalValue: number;
  addedCount: number;
  sportBreakdown: { sport: string; count: number }[];
} {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  const sportMap: Record<string, number> = {};
  for (const s of scans) {
    sportMap[s.sport] = (sportMap[s.sport] || 0) + 1;
  }
  return {
    totalScans: scans.length,
    avgConfidence:
      scans.length > 0
        ? Math.round(scans.reduce((sum, s) => sum + s.scanConfidence, 0) / scans.length)
        : 0,
    totalValue: scans.reduce((sum, s) => sum + s.estimatedValue, 0),
    addedCount: scans.filter((s) => s.addedToCollection).length,
    sportBreakdown: Object.entries(sportMap)
      .map(([sport, count]) => ({ sport, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Get top scanned cards by estimated value */
export function getTopScannedCards(): ScanResult[] {
  const scans = loadFromStorage<ScanResult[]>('scans', MOCK_SCANS);
  return [...scans].sort((a, b) => b.estimatedValue - a.estimatedValue).slice(0, 10);
}

/** Format a number as US currency */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

/** Return a Tailwind color class based on confidence level */
export function getConfidenceColor(conf: number): string {
  if (conf >= 90) return 'text-green-400';
  if (conf >= 75) return 'text-yellow-400';
  if (conf >= 50) return 'text-orange-400';
  return 'text-red-400';
}

/** Return a human-readable label for a confidence score */
export function getConfidenceLabel(conf: number): string {
  if (conf >= 90) return 'Excellent';
  if (conf >= 75) return 'Good';
  if (conf >= 50) return 'Fair';
  return 'Low';
}

/** Return a Tailwind color class for a grade string */
export function getGradeColor(grade: string): string {
  const num = parseFloat(grade.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 'text-slate-400';
  if (num >= 9.5) return 'text-green-400';
  if (num >= 9) return 'text-emerald-400';
  if (num >= 8) return 'text-yellow-400';
  if (num >= 7) return 'text-orange-400';
  return 'text-red-400';
}
