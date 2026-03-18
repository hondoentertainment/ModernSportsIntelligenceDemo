// ─────────────────────────────────────────────────────────────
// Live Break Integration & ROI Tracker – Service Layer
// ─────────────────────────────────────────────────────────────

import { store } from './dal/syncStore';

// ── Types ────────────────────────────────────────────────────

export type BreakType =
  | 'hobby_box'
  | 'jumbo_box'
  | 'blaster'
  | 'mega'
  | 'group_break'
  | 'pick_your_team'
  | 'random_team'
  | 'hit_draft';

export type BreakPlatform =
  | 'whatnot'
  | 'loupe'
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'twitch'
  | 'in_person';

export type BreakStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface LiveBreak {
  id: string;
  title: string;
  breaker: string;
  breakerRating: number;
  breakerVerified: boolean;
  platform: BreakPlatform;
  product: string;
  year: number;
  manufacturer: string;
  sport: string;
  breakType: BreakType;
  status: BreakStatus;
  spotsTotal: number;
  spotsFilled: number;
  spotPrice: number;
  estimatedValue: number;
  expectedROI: number;
  scheduledTime: string;
  streamUrl: string;
  imageUrl: string;
  tags: string[];
}

export interface BreakResult {
  id: string;
  breakId: string;
  breakTitle: string;
  product: string;
  sport: string;
  team: string;
  spotCost: number;
  totalPulled: number;
  hits: BreakHit[];
  totalValue: number;
  roi: number;
  roiPercent: number;
  completedAt: string;
  platform: BreakPlatform;
}

export interface BreakHit {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  parallel: string | null;
  isAutographed: boolean;
  isNumbered: boolean;
  printRun: number | null;
  grade: string | null;
  estimatedValue: number;
  imageUrl: string;
  isTopHit: boolean;
}

export interface BreakerProfile {
  id: string;
  name: string;
  platform: BreakPlatform;
  rating: number;
  totalBreaks: number;
  avgROI: number;
  avgHitRate: number;
  followers: number;
  verified: boolean;
  specialty: string[];
  streamUrl: string;
  recentROIs: number[];
}

export interface BreakROIStats {
  totalBreaksJoined: number;
  totalSpent: number;
  totalValuePulled: number;
  netROI: number;
  roiPercent: number;
  bestBreak: { title: string; roi: number; topHit: string };
  worstBreak: { title: string; roi: number };
  avgROIByType: { type: BreakType; avgROI: number; count: number }[];
  avgROIByProduct: { product: string; avgROI: number; count: number }[];
  avgROIByPlatform: { platform: BreakPlatform; avgROI: number; count: number }[];
  hitRate: number;
  topHits: BreakHit[];
  monthlySpend: { month: string; spent: number; value: number; roi: number }[];
}

export interface ProductEV {
  product: string;
  year: number;
  manufacturer: string;
  sport: string;
  boxPrice: number;
  expectedValue: number;
  evRatio: number;
  topCards: { cardName: string; value: number; odds: string }[];
  sampleSize: number;
  lastUpdated: string;
}

// ── Storage Helpers ──────────────────────────────────────────

const STORAGE_PREFIX = 'msi_live_break';

function loadFromStorage<T>(key: string, fallback: T): T {
  return store.get<T>(`${STORAGE_PREFIX}_${key}`, fallback);
}

function saveToStorage<T>(key: string, data: T): void {
  store.set(`${STORAGE_PREFIX}_${key}`, data);
}

// ── Mock Data: Live Breaks ───────────────────────────────────

const MOCK_LIVE_BREAKS: LiveBreak[] = [
  {
    id: 'lb-001',
    title: '2024 Topps Chrome Hobby Box Break',
    breaker: 'CardBreaker Elite',
    breakerRating: 4.9,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Topps Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'hobby_box',
    status: 'live',
    spotsTotal: 30,
    spotsFilled: 28,
    spotPrice: 25,
    estimatedValue: 32,
    expectedROI: 28,
    scheduledTime: '2025-03-15T19:00:00Z',
    streamUrl: 'https://whatnot.com/live/cardbreaker-elite',
    imageUrl: '/images/topps-chrome-2024.jpg',
    tags: ['hot', 'chrome', 'baseball'],
  },
  {
    id: 'lb-002',
    title: '2024 Bowman Chrome Mega Box Random Team',
    breaker: 'PackRipper Steve',
    breakerRating: 4.7,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Bowman Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'random_team',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 18,
    spotPrice: 15,
    estimatedValue: 20,
    expectedROI: 33,
    scheduledTime: '2025-03-15T20:30:00Z',
    streamUrl: 'https://whatnot.com/live/packripper-steve',
    imageUrl: '/images/bowman-chrome-2024.jpg',
    tags: ['prospects', 'bowman', 'random'],
  },
  {
    id: 'lb-003',
    title: '2024 Panini Prizm Basketball Hobby PYT',
    breaker: 'HoopsBreaks',
    breakerRating: 4.8,
    breakerVerified: true,
    platform: 'loupe',
    product: '2024 Prizm Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    breakType: 'pick_your_team',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 22,
    spotPrice: 35,
    estimatedValue: 45,
    expectedROI: 28.6,
    scheduledTime: '2025-03-15T21:00:00Z',
    streamUrl: 'https://loupe.com/hoopsbreaks',
    imageUrl: '/images/prizm-2024.jpg',
    tags: ['basketball', 'prizm', 'pyt'],
  },
  {
    id: 'lb-004',
    title: '2024 Topps Chrome Jumbo Box Hit Draft',
    breaker: 'BigHitBreaks',
    breakerRating: 4.6,
    breakerVerified: true,
    platform: 'youtube',
    product: '2024 Topps Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'hit_draft',
    status: 'live',
    spotsTotal: 12,
    spotsFilled: 12,
    spotPrice: 55,
    estimatedValue: 72,
    expectedROI: 30.9,
    scheduledTime: '2025-03-15T18:30:00Z',
    streamUrl: 'https://youtube.com/live/bighitbreaks',
    imageUrl: '/images/topps-chrome-jumbo-2024.jpg',
    tags: ['jumbo', 'hit-draft', 'chrome'],
  },
  {
    id: 'lb-005',
    title: '2024 Panini Select Football Blaster Break',
    breaker: 'GridironRips',
    breakerRating: 4.5,
    breakerVerified: false,
    platform: 'facebook',
    product: '2024 Select Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'blaster',
    status: 'upcoming',
    spotsTotal: 32,
    spotsFilled: 10,
    spotPrice: 12,
    estimatedValue: 14,
    expectedROI: 16.7,
    scheduledTime: '2025-03-16T14:00:00Z',
    streamUrl: 'https://facebook.com/gridironrips/live',
    imageUrl: '/images/select-football-2024.jpg',
    tags: ['football', 'select', 'blaster'],
  },
  {
    id: 'lb-006',
    title: '2024 Donruss Optic Basketball Mega Box',
    breaker: 'HoopsBreaks',
    breakerRating: 4.8,
    breakerVerified: true,
    platform: 'loupe',
    product: '2024 Donruss Optic Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    breakType: 'mega',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 14,
    spotPrice: 18,
    estimatedValue: 22,
    expectedROI: 22.2,
    scheduledTime: '2025-03-16T17:00:00Z',
    streamUrl: 'https://loupe.com/hoopsbreaks',
    imageUrl: '/images/donruss-optic-2024.jpg',
    tags: ['basketball', 'optic', 'mega'],
  },
  {
    id: 'lb-007',
    title: '2024 Topps Series 1 Group Break',
    breaker: 'VintageWax',
    breakerRating: 4.4,
    breakerVerified: false,
    platform: 'instagram',
    product: '2024 Topps Series 1',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'group_break',
    status: 'live',
    spotsTotal: 30,
    spotsFilled: 30,
    spotPrice: 10,
    estimatedValue: 11,
    expectedROI: 10,
    scheduledTime: '2025-03-15T17:00:00Z',
    streamUrl: 'https://instagram.com/vintagewax/live',
    imageUrl: '/images/topps-s1-2024.jpg',
    tags: ['baseball', 'series1', 'group'],
  },
  {
    id: 'lb-008',
    title: '2024 Prizm Football Hobby Box PYT',
    breaker: 'GridironRips',
    breakerRating: 4.5,
    breakerVerified: false,
    platform: 'twitch',
    product: '2024 Prizm Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'pick_your_team',
    status: 'upcoming',
    spotsTotal: 32,
    spotsFilled: 20,
    spotPrice: 28,
    estimatedValue: 35,
    expectedROI: 25,
    scheduledTime: '2025-03-16T20:00:00Z',
    streamUrl: 'https://twitch.tv/gridironrips',
    imageUrl: '/images/prizm-football-2024.jpg',
    tags: ['football', 'prizm', 'hobby'],
  },
  {
    id: 'lb-009',
    title: '2024 Bowman Draft Jumbo Box Break',
    breaker: 'ProspectKing',
    breakerRating: 4.9,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Bowman Draft',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'jumbo_box',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 25,
    spotPrice: 22,
    estimatedValue: 30,
    expectedROI: 36.4,
    scheduledTime: '2025-03-16T19:00:00Z',
    streamUrl: 'https://whatnot.com/live/prospectking',
    imageUrl: '/images/bowman-draft-2024.jpg',
    tags: ['prospects', 'draft', 'jumbo'],
  },
  {
    id: 'lb-010',
    title: '2024 Panini Flawless Basketball 1-Spot Break',
    breaker: 'LuxuryBreaks',
    breakerRating: 5.0,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Flawless Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    breakType: 'random_team',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 8,
    spotPrice: 150,
    estimatedValue: 210,
    expectedROI: 40,
    scheduledTime: '2025-03-17T20:00:00Z',
    streamUrl: 'https://whatnot.com/live/luxurybreaks',
    imageUrl: '/images/flawless-2024.jpg',
    tags: ['basketball', 'flawless', 'high-end'],
  },
  {
    id: 'lb-011',
    title: '2024 Topps Chrome Black Hobby Box',
    breaker: 'CardBreaker Elite',
    breakerRating: 4.9,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Topps Chrome Black',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'hobby_box',
    status: 'live',
    spotsTotal: 8,
    spotsFilled: 8,
    spotPrice: 95,
    estimatedValue: 120,
    expectedROI: 26.3,
    scheduledTime: '2025-03-15T18:00:00Z',
    streamUrl: 'https://whatnot.com/live/cardbreaker-elite',
    imageUrl: '/images/chrome-black-2024.jpg',
    tags: ['chrome-black', 'high-end', 'baseball'],
  },
  {
    id: 'lb-012',
    title: '2024 Select Basketball Mega Box Break',
    breaker: 'DimeBreaks',
    breakerRating: 4.3,
    breakerVerified: false,
    platform: 'youtube',
    product: '2024 Select Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    breakType: 'mega',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 6,
    spotPrice: 14,
    estimatedValue: 16,
    expectedROI: 14.3,
    scheduledTime: '2025-03-17T15:00:00Z',
    streamUrl: 'https://youtube.com/dimebreaks',
    imageUrl: '/images/select-bball-2024.jpg',
    tags: ['basketball', 'select', 'mega'],
  },
  {
    id: 'lb-013',
    title: '2024 Bowman Hobby Box Random Team',
    breaker: 'ProspectKing',
    breakerRating: 4.9,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Bowman',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'random_team',
    status: 'completed',
    spotsTotal: 30,
    spotsFilled: 30,
    spotPrice: 18,
    estimatedValue: 24,
    expectedROI: 33.3,
    scheduledTime: '2025-03-14T19:00:00Z',
    streamUrl: 'https://whatnot.com/live/prospectking',
    imageUrl: '/images/bowman-2024.jpg',
    tags: ['prospects', 'bowman', 'random'],
  },
  {
    id: 'lb-014',
    title: '2024 Mosaic Football Blaster Break',
    breaker: 'GridironRips',
    breakerRating: 4.5,
    breakerVerified: false,
    platform: 'facebook',
    product: '2024 Mosaic Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'blaster',
    status: 'completed',
    spotsTotal: 32,
    spotsFilled: 32,
    spotPrice: 10,
    estimatedValue: 11,
    expectedROI: 10,
    scheduledTime: '2025-03-13T18:00:00Z',
    streamUrl: 'https://facebook.com/gridironrips/live',
    imageUrl: '/images/mosaic-football-2024.jpg',
    tags: ['football', 'mosaic', 'blaster'],
  },
  {
    id: 'lb-015',
    title: '2024 Immaculate Baseball 1-Box Break',
    breaker: 'LuxuryBreaks',
    breakerRating: 5.0,
    breakerVerified: true,
    platform: 'loupe',
    product: '2024 Immaculate Baseball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Baseball',
    breakType: 'hobby_box',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 12,
    spotPrice: 85,
    estimatedValue: 110,
    expectedROI: 29.4,
    scheduledTime: '2025-03-18T21:00:00Z',
    streamUrl: 'https://loupe.com/luxurybreaks',
    imageUrl: '/images/immaculate-2024.jpg',
    tags: ['baseball', 'immaculate', 'high-end'],
  },
  {
    id: 'lb-016',
    title: '2024 National Treasures Football PYT',
    breaker: 'BigHitBreaks',
    breakerRating: 4.6,
    breakerVerified: true,
    platform: 'youtube',
    product: '2024 National Treasures Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'pick_your_team',
    status: 'upcoming',
    spotsTotal: 32,
    spotsFilled: 16,
    spotPrice: 120,
    estimatedValue: 160,
    expectedROI: 33.3,
    scheduledTime: '2025-03-18T19:00:00Z',
    streamUrl: 'https://youtube.com/live/bighitbreaks',
    imageUrl: '/images/national-treasures-2024.jpg',
    tags: ['football', 'national-treasures', 'high-end'],
  },
  {
    id: 'lb-017',
    title: '2024 Topps Heritage Hobby Group Break',
    breaker: 'VintageWax',
    breakerRating: 4.4,
    breakerVerified: false,
    platform: 'instagram',
    product: '2024 Topps Heritage',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'group_break',
    status: 'completed',
    spotsTotal: 30,
    spotsFilled: 30,
    spotPrice: 8,
    estimatedValue: 9,
    expectedROI: 12.5,
    scheduledTime: '2025-03-12T18:00:00Z',
    streamUrl: 'https://instagram.com/vintagewax/live',
    imageUrl: '/images/heritage-2024.jpg',
    tags: ['heritage', 'vintage-style', 'group'],
  },
  {
    id: 'lb-018',
    title: '2024 Optic Football Hobby Hit Draft',
    breaker: 'DimeBreaks',
    breakerRating: 4.3,
    breakerVerified: false,
    platform: 'twitch',
    product: '2024 Donruss Optic Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'hit_draft',
    status: 'upcoming',
    spotsTotal: 10,
    spotsFilled: 7,
    spotPrice: 40,
    estimatedValue: 48,
    expectedROI: 20,
    scheduledTime: '2025-03-17T20:00:00Z',
    streamUrl: 'https://twitch.tv/dimebreaks',
    imageUrl: '/images/optic-football-2024.jpg',
    tags: ['football', 'optic', 'hit-draft'],
  },
  {
    id: 'lb-019',
    title: '2024 Topps Finest Hobby Box Break',
    breaker: 'CardBreaker Elite',
    breakerRating: 4.9,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Topps Finest',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'hobby_box',
    status: 'completed',
    spotsTotal: 30,
    spotsFilled: 30,
    spotPrice: 20,
    estimatedValue: 26,
    expectedROI: 30,
    scheduledTime: '2025-03-11T19:00:00Z',
    streamUrl: 'https://whatnot.com/live/cardbreaker-elite',
    imageUrl: '/images/finest-2024.jpg',
    tags: ['finest', 'baseball', 'hobby'],
  },
  {
    id: 'lb-020',
    title: 'In-Person 2024 Prizm Basketball Hobby Break',
    breaker: 'Local Card Shop',
    breakerRating: 4.2,
    breakerVerified: false,
    platform: 'in_person',
    product: '2024 Prizm Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    breakType: 'hobby_box',
    status: 'upcoming',
    spotsTotal: 30,
    spotsFilled: 20,
    spotPrice: 30,
    estimatedValue: 40,
    expectedROI: 33.3,
    scheduledTime: '2025-03-16T12:00:00Z',
    streamUrl: '',
    imageUrl: '/images/prizm-bball-2024.jpg',
    tags: ['basketball', 'prizm', 'in-person'],
  },
  {
    id: 'lb-021',
    title: '2024 Topps Chrome Blaster Case Break',
    breaker: 'PackRipper Steve',
    breakerRating: 4.7,
    breakerVerified: true,
    platform: 'whatnot',
    product: '2024 Topps Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    breakType: 'blaster',
    status: 'completed',
    spotsTotal: 30,
    spotsFilled: 30,
    spotPrice: 8,
    estimatedValue: 9.5,
    expectedROI: 18.8,
    scheduledTime: '2025-03-10T19:00:00Z',
    streamUrl: 'https://whatnot.com/live/packripper-steve',
    imageUrl: '/images/topps-chrome-blaster-2024.jpg',
    tags: ['chrome', 'blaster', 'case-break'],
  },
  {
    id: 'lb-022',
    title: '2024 Panini Spectra Football Hobby Break',
    breaker: 'BigHitBreaks',
    breakerRating: 4.6,
    breakerVerified: true,
    platform: 'youtube',
    product: '2024 Spectra Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    breakType: 'hobby_box',
    status: 'cancelled',
    spotsTotal: 32,
    spotsFilled: 4,
    spotPrice: 45,
    estimatedValue: 55,
    expectedROI: 22.2,
    scheduledTime: '2025-03-15T22:00:00Z',
    streamUrl: 'https://youtube.com/live/bighitbreaks',
    imageUrl: '/images/spectra-2024.jpg',
    tags: ['football', 'spectra', 'cancelled'],
  },
];

// ── Mock Data: Break Hits ────────────────────────────────────

const MOCK_HITS: BreakHit[] = [
  { id: 'h-001', cardName: 'Elly De La Cruz Chrome Auto /25', player: 'Elly De La Cruz', year: 2024, set: 'Topps Chrome', parallel: 'Gold Refractor', isAutographed: true, isNumbered: true, printRun: 25, grade: null, estimatedValue: 850, imageUrl: '/images/hits/elly-auto.jpg', isTopHit: true },
  { id: 'h-002', cardName: 'Jackson Holliday 1st Bowman Chrome Auto', player: 'Jackson Holliday', year: 2024, set: 'Bowman Chrome', parallel: 'Refractor', isAutographed: true, isNumbered: false, printRun: null, grade: null, estimatedValue: 420, imageUrl: '/images/hits/holliday-auto.jpg', isTopHit: true },
  { id: 'h-003', cardName: 'Victor Wembanyama Prizm Silver', player: 'Victor Wembanyama', year: 2024, set: 'Prizm Basketball', parallel: 'Silver', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 380, imageUrl: '/images/hits/wemby-silver.jpg', isTopHit: true },
  { id: 'h-004', cardName: 'Caleb Williams Select Tie-Dye /25', player: 'Caleb Williams', year: 2024, set: 'Select Football', parallel: 'Tie-Dye', isAutographed: false, isNumbered: true, printRun: 25, grade: null, estimatedValue: 310, imageUrl: '/images/hits/williams-tiedye.jpg', isTopHit: true },
  { id: 'h-005', cardName: 'Paul Skenes Chrome Refractor Auto', player: 'Paul Skenes', year: 2024, set: 'Topps Chrome', parallel: 'Refractor', isAutographed: true, isNumbered: false, printRun: null, grade: null, estimatedValue: 275, imageUrl: '/images/hits/skenes-auto.jpg', isTopHit: true },
  { id: 'h-006', cardName: 'Chet Holmgren Prizm Gold /10', player: 'Chet Holmgren', year: 2024, set: 'Prizm Basketball', parallel: 'Gold', isAutographed: false, isNumbered: true, printRun: 10, grade: null, estimatedValue: 520, imageUrl: '/images/hits/holmgren-gold.jpg', isTopHit: true },
  { id: 'h-007', cardName: 'Marvin Harrison Jr Mosaic Genesis', player: 'Marvin Harrison Jr', year: 2024, set: 'Mosaic Football', parallel: 'Genesis', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 190, imageUrl: '/images/hits/mhj-genesis.jpg', isTopHit: true },
  { id: 'h-008', cardName: 'Junior Caminero Bowman 1st Auto /50', player: 'Junior Caminero', year: 2024, set: 'Bowman', parallel: 'Green Shimmer', isAutographed: true, isNumbered: true, printRun: 50, grade: null, estimatedValue: 350, imageUrl: '/images/hits/caminero-auto.jpg', isTopHit: true },
  { id: 'h-009', cardName: 'Anthony Edwards Optic Holo', player: 'Anthony Edwards', year: 2024, set: 'Donruss Optic Basketball', parallel: 'Holo', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 85, imageUrl: '/images/hits/ant-holo.jpg', isTopHit: false },
  { id: 'h-010', cardName: 'CJ Stroud Select Concourse Silver', player: 'CJ Stroud', year: 2024, set: 'Select Football', parallel: 'Silver', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 65, imageUrl: '/images/hits/stroud-silver.jpg', isTopHit: false },
  { id: 'h-011', cardName: 'Shohei Ohtani Chrome Pink Refractor', player: 'Shohei Ohtani', year: 2024, set: 'Topps Chrome', parallel: 'Pink Refractor', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 120, imageUrl: '/images/hits/ohtani-pink.jpg', isTopHit: false },
  { id: 'h-012', cardName: 'Wyatt Langford Bowman Chrome Shimmer /75', player: 'Wyatt Langford', year: 2024, set: 'Bowman Chrome', parallel: 'Shimmer Refractor', isAutographed: false, isNumbered: true, printRun: 75, grade: null, estimatedValue: 145, imageUrl: '/images/hits/langford-shimmer.jpg', isTopHit: false },
  { id: 'h-013', cardName: 'Luka Doncic Prizm Red /299', player: 'Luka Doncic', year: 2024, set: 'Prizm Basketball', parallel: 'Red', isAutographed: false, isNumbered: true, printRun: 299, grade: null, estimatedValue: 95, imageUrl: '/images/hits/luka-red.jpg', isTopHit: false },
  { id: 'h-014', cardName: 'Drake Maye National Treasures Patch Auto /99', player: 'Drake Maye', year: 2024, set: 'National Treasures Football', parallel: 'Base', isAutographed: true, isNumbered: true, printRun: 99, grade: null, estimatedValue: 480, imageUrl: '/images/hits/maye-nt.jpg', isTopHit: true },
  { id: 'h-015', cardName: 'Colson Montgomery Bowman Auto Purple /250', player: 'Colson Montgomery', year: 2024, set: 'Bowman', parallel: 'Purple', isAutographed: true, isNumbered: true, printRun: 250, grade: null, estimatedValue: 110, imageUrl: '/images/hits/montgomery-auto.jpg', isTopHit: false },
  { id: 'h-016', cardName: 'Jackson Chourio Chrome Gold /50', player: 'Jackson Chourio', year: 2024, set: 'Topps Chrome', parallel: 'Gold Refractor', isAutographed: false, isNumbered: true, printRun: 50, grade: null, estimatedValue: 265, imageUrl: '/images/hits/chourio-gold.jpg', isTopHit: true },
  { id: 'h-017', cardName: 'Jaylen Brown Optic Auto /49', player: 'Jaylen Brown', year: 2024, set: 'Donruss Optic Basketball', parallel: 'Blue', isAutographed: true, isNumbered: true, printRun: 49, grade: null, estimatedValue: 220, imageUrl: '/images/hits/brown-optic.jpg', isTopHit: true },
  { id: 'h-018', cardName: 'Rome Odunze Prizm Rookie Auto', player: 'Rome Odunze', year: 2024, set: 'Prizm Football', parallel: null, isAutographed: true, isNumbered: false, printRun: null, grade: null, estimatedValue: 135, imageUrl: '/images/hits/odunze-auto.jpg', isTopHit: false },
  { id: 'h-019', cardName: 'Jasson Dominguez Finest Refractor Auto /150', player: 'Jasson Dominguez', year: 2024, set: 'Topps Finest', parallel: 'Refractor', isAutographed: true, isNumbered: true, printRun: 150, grade: null, estimatedValue: 200, imageUrl: '/images/hits/dominguez-finest.jpg', isTopHit: true },
  { id: 'h-020', cardName: 'Bryce Young Mosaic Silver', player: 'Bryce Young', year: 2024, set: 'Mosaic Football', parallel: 'Silver', isAutographed: false, isNumbered: false, printRun: null, grade: null, estimatedValue: 15, imageUrl: '/images/hits/byoung-mosaic.jpg', isTopHit: false },
];

// ── Mock Data: Break Results ─────────────────────────────────

const MOCK_BREAK_RESULTS: BreakResult[] = [
  {
    id: 'br-001',
    breakId: 'lb-013',
    breakTitle: '2024 Bowman Hobby Box Random Team',
    product: '2024 Bowman',
    sport: 'Baseball',
    team: 'Baltimore Orioles',
    spotCost: 18,
    totalPulled: 14,
    hits: [MOCK_HITS[1], MOCK_HITS[14]],
    totalValue: 530,
    roi: 512,
    roiPercent: 2844.4,
    completedAt: '2025-03-14T20:15:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-002',
    breakId: 'lb-014',
    breakTitle: '2024 Mosaic Football Blaster Break',
    product: '2024 Mosaic Football',
    sport: 'Football',
    team: 'Chicago Bears',
    spotCost: 10,
    totalPulled: 8,
    hits: [MOCK_HITS[6]],
    totalValue: 190,
    roi: 180,
    roiPercent: 1800,
    completedAt: '2025-03-13T19:30:00Z',
    platform: 'facebook',
  },
  {
    id: 'br-003',
    breakId: 'lb-017',
    breakTitle: '2024 Topps Heritage Hobby Group Break',
    product: '2024 Topps Heritage',
    sport: 'Baseball',
    team: 'New York Yankees',
    spotCost: 8,
    totalPulled: 6,
    hits: [],
    totalValue: 4.5,
    roi: -3.5,
    roiPercent: -43.75,
    completedAt: '2025-03-12T19:30:00Z',
    platform: 'instagram',
  },
  {
    id: 'br-004',
    breakId: 'lb-019',
    breakTitle: '2024 Topps Finest Hobby Box Break',
    product: '2024 Topps Finest',
    sport: 'Baseball',
    team: 'New York Yankees',
    spotCost: 20,
    totalPulled: 10,
    hits: [MOCK_HITS[18]],
    totalValue: 200,
    roi: 180,
    roiPercent: 900,
    completedAt: '2025-03-11T20:45:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-005',
    breakId: 'lb-021',
    breakTitle: '2024 Topps Chrome Blaster Case Break',
    product: '2024 Topps Chrome',
    sport: 'Baseball',
    team: 'Los Angeles Dodgers',
    spotCost: 8,
    totalPulled: 12,
    hits: [MOCK_HITS[10]],
    totalValue: 120,
    roi: 112,
    roiPercent: 1400,
    completedAt: '2025-03-10T20:00:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-006',
    breakId: 'lb-prev-001',
    breakTitle: '2024 Prizm Basketball Hobby PYT',
    product: '2024 Prizm Basketball',
    sport: 'Basketball',
    team: 'San Antonio Spurs',
    spotCost: 35,
    totalPulled: 9,
    hits: [MOCK_HITS[2]],
    totalValue: 380,
    roi: 345,
    roiPercent: 985.7,
    completedAt: '2025-03-09T21:00:00Z',
    platform: 'loupe',
  },
  {
    id: 'br-007',
    breakId: 'lb-prev-002',
    breakTitle: '2024 Select Football Random Team',
    product: '2024 Select Football',
    sport: 'Football',
    team: 'Houston Texans',
    spotCost: 12,
    totalPulled: 7,
    hits: [MOCK_HITS[9]],
    totalValue: 65,
    roi: 53,
    roiPercent: 441.7,
    completedAt: '2025-03-08T18:30:00Z',
    platform: 'facebook',
  },
  {
    id: 'br-008',
    breakId: 'lb-prev-003',
    breakTitle: '2024 Topps Chrome Hobby Box Break',
    product: '2024 Topps Chrome',
    sport: 'Baseball',
    team: 'Cincinnati Reds',
    spotCost: 25,
    totalPulled: 11,
    hits: [MOCK_HITS[0], MOCK_HITS[15]],
    totalValue: 1115,
    roi: 1090,
    roiPercent: 4360,
    completedAt: '2025-03-07T19:15:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-009',
    breakId: 'lb-prev-004',
    breakTitle: '2024 Donruss Optic Basketball Mega Break',
    product: '2024 Donruss Optic Basketball',
    sport: 'Basketball',
    team: 'Oklahoma City Thunder',
    spotCost: 18,
    totalPulled: 8,
    hits: [MOCK_HITS[8], MOCK_HITS[16]],
    totalValue: 305,
    roi: 287,
    roiPercent: 1594.4,
    completedAt: '2025-03-06T20:30:00Z',
    platform: 'loupe',
  },
  {
    id: 'br-010',
    breakId: 'lb-prev-005',
    breakTitle: '2024 Bowman Chrome Mega Box Break',
    product: '2024 Bowman Chrome',
    sport: 'Baseball',
    team: 'Milwaukee Brewers',
    spotCost: 15,
    totalPulled: 10,
    hits: [MOCK_HITS[11]],
    totalValue: 145,
    roi: 130,
    roiPercent: 866.7,
    completedAt: '2025-03-05T19:00:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-011',
    breakId: 'lb-prev-006',
    breakTitle: '2024 National Treasures Football PYT',
    product: '2024 National Treasures Football',
    sport: 'Football',
    team: 'New England Patriots',
    spotCost: 120,
    totalPulled: 5,
    hits: [MOCK_HITS[13]],
    totalValue: 480,
    roi: 360,
    roiPercent: 300,
    completedAt: '2025-03-04T21:00:00Z',
    platform: 'youtube',
  },
  {
    id: 'br-012',
    breakId: 'lb-prev-007',
    breakTitle: '2024 Prizm Football Hobby PYT',
    product: '2024 Prizm Football',
    sport: 'Football',
    team: 'Chicago Bears',
    spotCost: 28,
    totalPulled: 9,
    hits: [MOCK_HITS[17]],
    totalValue: 135,
    roi: 107,
    roiPercent: 382.1,
    completedAt: '2025-03-03T20:00:00Z',
    platform: 'twitch',
  },
  {
    id: 'br-013',
    breakId: 'lb-prev-008',
    breakTitle: '2024 Topps Series 1 Group Break',
    product: '2024 Topps Series 1',
    sport: 'Baseball',
    team: 'Philadelphia Phillies',
    spotCost: 10,
    totalPulled: 15,
    hits: [],
    totalValue: 6,
    roi: -4,
    roiPercent: -40,
    completedAt: '2025-03-02T17:00:00Z',
    platform: 'instagram',
  },
  {
    id: 'br-014',
    breakId: 'lb-prev-009',
    breakTitle: '2024 Flawless Basketball Random Team',
    product: '2024 Flawless Basketball',
    sport: 'Basketball',
    team: 'Oklahoma City Thunder',
    spotCost: 150,
    totalPulled: 3,
    hits: [MOCK_HITS[5]],
    totalValue: 520,
    roi: 370,
    roiPercent: 246.7,
    completedAt: '2025-03-01T20:00:00Z',
    platform: 'whatnot',
  },
  {
    id: 'br-015',
    breakId: 'lb-prev-010',
    breakTitle: '2024 Prizm Basketball Hobby Box PYT',
    product: '2024 Prizm Basketball',
    sport: 'Basketball',
    team: 'Dallas Mavericks',
    spotCost: 35,
    totalPulled: 8,
    hits: [MOCK_HITS[12]],
    totalValue: 95,
    roi: 60,
    roiPercent: 171.4,
    completedAt: '2025-02-28T19:30:00Z',
    platform: 'loupe',
  },
  {
    id: 'br-016',
    breakId: 'lb-prev-011',
    breakTitle: '2024 Topps Chrome Black Hobby',
    product: '2024 Topps Chrome Black',
    sport: 'Baseball',
    team: 'Atlanta Braves',
    spotCost: 95,
    totalPulled: 4,
    hits: [MOCK_HITS[4]],
    totalValue: 275,
    roi: 180,
    roiPercent: 189.5,
    completedAt: '2025-02-27T18:00:00Z',
    platform: 'whatnot',
  },
];

// ── Mock Data: Breaker Profiles ──────────────────────────────

const MOCK_BREAKER_PROFILES: BreakerProfile[] = [
  {
    id: 'bp-001',
    name: 'CardBreaker Elite',
    platform: 'whatnot',
    rating: 4.9,
    totalBreaks: 1842,
    avgROI: 34.2,
    avgHitRate: 18.5,
    followers: 125000,
    verified: true,
    specialty: ['Topps Chrome', 'High-End Baseball'],
    streamUrl: 'https://whatnot.com/user/cardbreaker-elite',
    recentROIs: [42, 28, 15, 55, -10, 38, 22, 60, 18, 33],
  },
  {
    id: 'bp-002',
    name: 'PackRipper Steve',
    platform: 'whatnot',
    rating: 4.7,
    totalBreaks: 1456,
    avgROI: 28.5,
    avgHitRate: 16.2,
    followers: 89000,
    verified: true,
    specialty: ['Bowman', 'Prospects'],
    streamUrl: 'https://whatnot.com/user/packripper-steve',
    recentROIs: [35, 12, -5, 42, 28, 18, 50, -8, 22, 15],
  },
  {
    id: 'bp-003',
    name: 'HoopsBreaks',
    platform: 'loupe',
    rating: 4.8,
    totalBreaks: 2100,
    avgROI: 31.8,
    avgHitRate: 20.1,
    followers: 142000,
    verified: true,
    specialty: ['Prizm Basketball', 'Optic Basketball'],
    streamUrl: 'https://loupe.com/hoopsbreaks',
    recentROIs: [38, 45, 12, -15, 52, 28, 35, 42, 8, 20],
  },
  {
    id: 'bp-004',
    name: 'BigHitBreaks',
    platform: 'youtube',
    rating: 4.6,
    totalBreaks: 980,
    avgROI: 26.4,
    avgHitRate: 14.8,
    followers: 67000,
    verified: true,
    specialty: ['Football', 'Hit Drafts'],
    streamUrl: 'https://youtube.com/@bighitbreaks',
    recentROIs: [30, -12, 55, 18, 22, -5, 40, 15, 28, 35],
  },
  {
    id: 'bp-005',
    name: 'GridironRips',
    platform: 'facebook',
    rating: 4.5,
    totalBreaks: 620,
    avgROI: 22.1,
    avgHitRate: 12.5,
    followers: 34000,
    verified: false,
    specialty: ['Football', 'Blasters'],
    streamUrl: 'https://facebook.com/gridironrips',
    recentROIs: [15, 8, -20, 35, 12, 22, -8, 18, 10, 25],
  },
  {
    id: 'bp-006',
    name: 'LuxuryBreaks',
    platform: 'whatnot',
    rating: 5.0,
    totalBreaks: 450,
    avgROI: 42.5,
    avgHitRate: 25.0,
    followers: 98000,
    verified: true,
    specialty: ['Flawless', 'National Treasures', 'High-End'],
    streamUrl: 'https://whatnot.com/user/luxurybreaks',
    recentROIs: [55, 38, 62, 15, 48, 70, 22, -5, 45, 52],
  },
  {
    id: 'bp-007',
    name: 'VintageWax',
    platform: 'instagram',
    rating: 4.4,
    totalBreaks: 380,
    avgROI: 18.3,
    avgHitRate: 10.8,
    followers: 22000,
    verified: false,
    specialty: ['Heritage', 'Vintage Style', 'Group Breaks'],
    streamUrl: 'https://instagram.com/vintagewax',
    recentROIs: [10, -5, 15, 22, 8, -12, 30, 18, 5, 12],
  },
  {
    id: 'bp-008',
    name: 'DimeBreaks',
    platform: 'twitch',
    rating: 4.3,
    totalBreaks: 290,
    avgROI: 15.8,
    avgHitRate: 11.2,
    followers: 18000,
    verified: false,
    specialty: ['Budget Breaks', 'Hit Drafts'],
    streamUrl: 'https://twitch.tv/dimebreaks',
    recentROIs: [8, -15, 22, 12, 5, -8, 18, 25, -3, 10],
  },
  {
    id: 'bp-009',
    name: 'ProspectKing',
    platform: 'whatnot',
    rating: 4.9,
    totalBreaks: 1200,
    avgROI: 38.6,
    avgHitRate: 22.4,
    followers: 110000,
    verified: true,
    specialty: ['Bowman', 'Bowman Chrome', 'Prospects'],
    streamUrl: 'https://whatnot.com/user/prospectking',
    recentROIs: [45, 32, 55, 18, 62, 28, -5, 40, 35, 50],
  },
  {
    id: 'bp-010',
    name: 'Local Card Shop',
    platform: 'in_person',
    rating: 4.2,
    totalBreaks: 150,
    avgROI: 20.0,
    avgHitRate: 13.5,
    followers: 5000,
    verified: false,
    specialty: ['In-Person', 'Mixed Sports'],
    streamUrl: '',
    recentROIs: [12, 25, -8, 18, 30, 5, -15, 22, 15, 10],
  },
  {
    id: 'bp-011',
    name: 'RookieHunter',
    platform: 'whatnot',
    rating: 4.6,
    totalBreaks: 780,
    avgROI: 29.3,
    avgHitRate: 17.0,
    followers: 55000,
    verified: true,
    specialty: ['Rookies', 'Optic', 'Select'],
    streamUrl: 'https://whatnot.com/user/rookiehunter',
    recentROIs: [22, 35, -8, 42, 18, 28, 15, -12, 38, 25],
  },
];

// ── Mock Data: Product EVs ───────────────────────────────────

const MOCK_PRODUCT_EVS: ProductEV[] = [
  {
    product: '2024 Topps Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 250,
    expectedValue: 310,
    evRatio: 1.24,
    topCards: [
      { cardName: 'Elly De La Cruz Auto', value: 2500, odds: '1:1200' },
      { cardName: 'Paul Skenes Refractor Auto', value: 800, odds: '1:800' },
      { cardName: 'Jackson Chourio Gold /50', value: 500, odds: '1:600' },
      { cardName: 'Shohei Ohtani Superfractor 1/1', value: 15000, odds: '1:50000' },
    ],
    sampleSize: 4200,
    lastUpdated: '2025-03-15',
  },
  {
    product: '2024 Bowman Chrome',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 200,
    expectedValue: 265,
    evRatio: 1.33,
    topCards: [
      { cardName: 'Jackson Holliday 1st Auto', value: 3000, odds: '1:1500' },
      { cardName: 'Junior Caminero Auto Shimmer /50', value: 1200, odds: '1:1000' },
      { cardName: 'Colson Montgomery Auto Purple /250', value: 350, odds: '1:400' },
    ],
    sampleSize: 3800,
    lastUpdated: '2025-03-14',
  },
  {
    product: '2024 Bowman',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 180,
    expectedValue: 215,
    evRatio: 1.19,
    topCards: [
      { cardName: 'Jackson Holliday 1st Chrome Auto', value: 2800, odds: '1:1800' },
      { cardName: 'Wyatt Langford Shimmer /75', value: 400, odds: '1:500' },
      { cardName: 'Junior Caminero 1st Auto', value: 900, odds: '1:1200' },
    ],
    sampleSize: 3200,
    lastUpdated: '2025-03-13',
  },
  {
    product: '2024 Prizm Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    boxPrice: 400,
    expectedValue: 520,
    evRatio: 1.30,
    topCards: [
      { cardName: 'Victor Wembanyama Gold /10', value: 8000, odds: '1:5000' },
      { cardName: 'Victor Wembanyama Silver', value: 600, odds: '1:200' },
      { cardName: 'Chet Holmgren Gold /10', value: 1200, odds: '1:5000' },
      { cardName: 'Luka Doncic Red /299', value: 150, odds: '1:120' },
    ],
    sampleSize: 5100,
    lastUpdated: '2025-03-15',
  },
  {
    product: '2024 Select Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    boxPrice: 300,
    expectedValue: 345,
    evRatio: 1.15,
    topCards: [
      { cardName: 'Caleb Williams Tie-Dye /25', value: 2000, odds: '1:2000' },
      { cardName: 'Marvin Harrison Jr Gold /10', value: 1500, odds: '1:3000' },
      { cardName: 'CJ Stroud Silver Concourse', value: 120, odds: '1:80' },
    ],
    sampleSize: 2900,
    lastUpdated: '2025-03-12',
  },
  {
    product: '2024 Donruss Optic Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    boxPrice: 220,
    expectedValue: 280,
    evRatio: 1.27,
    topCards: [
      { cardName: 'Victor Wembanyama Holo Auto', value: 5000, odds: '1:4000' },
      { cardName: 'Anthony Edwards Holo', value: 150, odds: '1:100' },
      { cardName: 'Jaylen Brown Auto /49', value: 400, odds: '1:800' },
    ],
    sampleSize: 3500,
    lastUpdated: '2025-03-14',
  },
  {
    product: '2024 Mosaic Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    boxPrice: 160,
    expectedValue: 175,
    evRatio: 1.09,
    topCards: [
      { cardName: 'Caleb Williams Genesis', value: 800, odds: '1:3000' },
      { cardName: 'Marvin Harrison Jr Genesis', value: 600, odds: '1:3000' },
      { cardName: 'CJ Stroud Silver', value: 80, odds: '1:60' },
    ],
    sampleSize: 4100,
    lastUpdated: '2025-03-11',
  },
  {
    product: '2024 Topps Finest',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 230,
    expectedValue: 295,
    evRatio: 1.28,
    topCards: [
      { cardName: 'Elly De La Cruz Finest Auto', value: 1800, odds: '1:1000' },
      { cardName: 'Paul Skenes Refractor Auto /150', value: 600, odds: '1:600' },
      { cardName: 'Jasson Dominguez Refractor Auto /150', value: 350, odds: '1:600' },
    ],
    sampleSize: 2600,
    lastUpdated: '2025-03-10',
  },
  {
    product: '2024 Prizm Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    boxPrice: 350,
    expectedValue: 410,
    evRatio: 1.17,
    topCards: [
      { cardName: 'Caleb Williams Silver', value: 500, odds: '1:200' },
      { cardName: 'Marvin Harrison Jr Silver', value: 350, odds: '1:200' },
      { cardName: 'Rome Odunze Rookie Auto', value: 250, odds: '1:500' },
    ],
    sampleSize: 3600,
    lastUpdated: '2025-03-13',
  },
  {
    product: '2024 Topps Chrome Black',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 700,
    expectedValue: 880,
    evRatio: 1.26,
    topCards: [
      { cardName: 'Shohei Ohtani Auto 1/1', value: 25000, odds: '1:20000' },
      { cardName: 'Elly De La Cruz Auto /50', value: 2500, odds: '1:800' },
      { cardName: 'Paul Skenes Auto /99', value: 900, odds: '1:400' },
    ],
    sampleSize: 1800,
    lastUpdated: '2025-03-14',
  },
  {
    product: '2024 Flawless Basketball',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    boxPrice: 4500,
    expectedValue: 5800,
    evRatio: 1.29,
    topCards: [
      { cardName: 'Victor Wembanyama Flawless Auto 1/1', value: 50000, odds: '1:15000' },
      { cardName: 'Chet Holmgren Gold /10', value: 3000, odds: '1:1200' },
      { cardName: 'Luka Doncic Diamond /20', value: 2500, odds: '1:800' },
    ],
    sampleSize: 800,
    lastUpdated: '2025-03-12',
  },
  {
    product: '2024 National Treasures Football',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    boxPrice: 3800,
    expectedValue: 4600,
    evRatio: 1.21,
    topCards: [
      { cardName: 'Caleb Williams Patch Auto /99', value: 5000, odds: '1:2000' },
      { cardName: 'Drake Maye Patch Auto /99', value: 2000, odds: '1:2000' },
      { cardName: 'Marvin Harrison Jr RPA /99', value: 3500, odds: '1:2000' },
    ],
    sampleSize: 1200,
    lastUpdated: '2025-03-11',
  },
  {
    product: '2024 Bowman Draft',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 280,
    expectedValue: 360,
    evRatio: 1.29,
    topCards: [
      { cardName: 'Top Prospect Auto Chrome /25', value: 1500, odds: '1:1000' },
      { cardName: 'Shimmer Refractor Auto /75', value: 600, odds: '1:500' },
      { cardName: 'Gold Refractor /50', value: 400, odds: '1:400' },
    ],
    sampleSize: 2200,
    lastUpdated: '2025-03-09',
  },
  {
    product: '2024 Topps Heritage',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 120,
    expectedValue: 95,
    evRatio: 0.79,
    topCards: [
      { cardName: 'Real One Auto', value: 500, odds: '1:2000' },
      { cardName: 'Chrome Refractor /573', value: 80, odds: '1:200' },
      { cardName: 'Short Print Variation', value: 40, odds: '1:50' },
    ],
    sampleSize: 5500,
    lastUpdated: '2025-03-08',
  },
  {
    product: '2024 Topps Series 1',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    boxPrice: 85,
    expectedValue: 60,
    evRatio: 0.71,
    topCards: [
      { cardName: 'Superfractor 1/1', value: 3000, odds: '1:50000' },
      { cardName: 'Gold /2024', value: 30, odds: '1:100' },
      { cardName: 'Short Print', value: 15, odds: '1:30' },
    ],
    sampleSize: 8200,
    lastUpdated: '2025-03-07',
  },
];

// ── Exported Functions ───────────────────────────────────────

/**
 * Return all live breaks, merging any locally stored custom breaks.
 */
export function getLiveBreaks(): LiveBreak[] {
  const stored = loadFromStorage<LiveBreak[]>('custom_breaks', []);
  return [...MOCK_LIVE_BREAKS, ...stored];
}

/**
 * Return only upcoming or live breaks (excluding completed/cancelled).
 */
export function getUpcomingBreaks(): LiveBreak[] {
  return getLiveBreaks().filter(
    (b) => b.status === 'upcoming' || b.status === 'live',
  );
}

/**
 * Return all break results, merging any locally stored results.
 */
export function getBreakResults(): BreakResult[] {
  const stored = loadFromStorage<BreakResult[]>('results', []);
  return [...MOCK_BREAK_RESULTS, ...stored];
}

/**
 * Return all breaker profiles.
 */
export function getBreakerProfiles(): BreakerProfile[] {
  return [...MOCK_BREAKER_PROFILES];
}

/**
 * Return top breakers sorted by rating, then average ROI.
 */
export function getTopBreakers(): BreakerProfile[] {
  return [...MOCK_BREAKER_PROFILES].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.avgROI - a.avgROI;
  });
}

/**
 * Compute aggregate ROI statistics across all break results.
 */
export function getBreakROIStats(): BreakROIStats {
  const results = getBreakResults();

  const totalSpent = results.reduce((s, r) => s + r.spotCost, 0);
  const totalValuePulled = results.reduce((s, r) => s + r.totalValue, 0);
  const netROI = totalValuePulled - totalSpent;
  const roiPercent = totalSpent > 0 ? (netROI / totalSpent) * 100 : 0;

  // Best / worst break
  const sorted = [...results].sort((a, b) => b.roi - a.roi);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const allHits = results.flatMap((r) => r.hits);
  const topHits = [...allHits]
    .filter((h) => h.isTopHit)
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 10);

  const breakWithHits = results.filter((r) => r.hits.length > 0).length;
  const hitRate = results.length > 0 ? (breakWithHits / results.length) * 100 : 0;

  // Avg ROI by break type – derive from live break data
  const liveBreaks = getLiveBreaks();
  const typeMap = new Map<BreakType, { total: number; count: number }>();
  for (const lb of liveBreaks) {
    const entry = typeMap.get(lb.breakType) ?? { total: 0, count: 0 };
    entry.total += lb.expectedROI;
    entry.count += 1;
    typeMap.set(lb.breakType, entry);
  }
  const avgROIByType = Array.from(typeMap.entries()).map(([type, d]) => ({
    type,
    avgROI: Math.round((d.total / d.count) * 10) / 10,
    count: d.count,
  }));

  // Avg ROI by product
  const productMap = new Map<string, { total: number; count: number }>();
  for (const r of results) {
    const entry = productMap.get(r.product) ?? { total: 0, count: 0 };
    entry.total += r.roiPercent;
    entry.count += 1;
    productMap.set(r.product, entry);
  }
  const avgROIByProduct = Array.from(productMap.entries()).map(([product, d]) => ({
    product,
    avgROI: Math.round((d.total / d.count) * 10) / 10,
    count: d.count,
  }));

  // Avg ROI by platform
  const platformMap = new Map<BreakPlatform, { total: number; count: number }>();
  for (const r of results) {
    const entry = platformMap.get(r.platform) ?? { total: 0, count: 0 };
    entry.total += r.roiPercent;
    entry.count += 1;
    platformMap.set(r.platform, entry);
  }
  const avgROIByPlatform = Array.from(platformMap.entries()).map(([platform, d]) => ({
    platform,
    avgROI: Math.round((d.total / d.count) * 10) / 10,
    count: d.count,
  }));

  // Monthly spend
  const monthMap = new Map<string, { spent: number; value: number }>();
  for (const r of results) {
    const month = r.completedAt.slice(0, 7); // YYYY-MM
    const entry = monthMap.get(month) ?? { spent: 0, value: 0 };
    entry.spent += r.spotCost;
    entry.value += r.totalValue;
    monthMap.set(month, entry);
  }
  const monthlySpend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      month,
      spent: d.spent,
      value: d.value,
      roi: d.spent > 0 ? Math.round(((d.value - d.spent) / d.spent) * 100 * 10) / 10 : 0,
    }));

  const bestTopHit = best?.hits.sort((a, b) => b.estimatedValue - a.estimatedValue)[0];

  return {
    totalBreaksJoined: results.length,
    totalSpent,
    totalValuePulled,
    netROI,
    roiPercent: Math.round(roiPercent * 10) / 10,
    bestBreak: {
      title: best?.breakTitle ?? 'N/A',
      roi: best?.roi ?? 0,
      topHit: bestTopHit?.cardName ?? 'N/A',
    },
    worstBreak: {
      title: worst?.breakTitle ?? 'N/A',
      roi: worst?.roi ?? 0,
    },
    avgROIByType,
    avgROIByProduct,
    avgROIByPlatform,
    hitRate: Math.round(hitRate * 10) / 10,
    topHits,
    monthlySpend,
  };
}

/**
 * Return all product expected value data.
 */
export function getProductEVs(): ProductEV[] {
  return [...MOCK_PRODUCT_EVS];
}

/**
 * Calculate expected value for a specific product and spot price.
 * Returns the expected $ return per spot.
 */
export function calculateBreakEV(product: string, spotPrice: number): number {
  const ev = MOCK_PRODUCT_EVS.find(
    (p) => p.product.toLowerCase() === product.toLowerCase(),
  );
  if (!ev || spotPrice <= 0) return 0;
  // Spot EV = (box EV / box price) * spot price
  const evPerDollar = ev.expectedValue / ev.boxPrice;
  return Math.round(evPerDollar * spotPrice * 100) / 100;
}

/**
 * Human-friendly label for a break type.
 */
export function getBreakTypeLabel(type: BreakType): string {
  const labels: Record<BreakType, string> = {
    hobby_box: 'Hobby Box',
    jumbo_box: 'Jumbo Box',
    blaster: 'Blaster',
    mega: 'Mega Box',
    group_break: 'Group Break',
    pick_your_team: 'Pick Your Team',
    random_team: 'Random Team',
    hit_draft: 'Hit Draft',
  };
  return labels[type] ?? type;
}

/**
 * Tailwind-compatible colour class for a platform badge.
 */
export function getPlatformColor(platform: BreakPlatform): string {
  const colors: Record<BreakPlatform, string> = {
    whatnot: 'bg-purple-500/20 text-purple-400',
    loupe: 'bg-blue-500/20 text-blue-400',
    youtube: 'bg-red-500/20 text-red-400',
    facebook: 'bg-indigo-500/20 text-indigo-400',
    instagram: 'bg-pink-500/20 text-pink-400',
    twitch: 'bg-violet-500/20 text-violet-400',
    in_person: 'bg-emerald-500/20 text-emerald-400',
  };
  return colors[platform] ?? 'bg-gray-500/20 text-gray-400';
}

/**
 * Human-friendly label for a platform.
 */
export function getPlatformLabel(platform: BreakPlatform): string {
  const labels: Record<BreakPlatform, string> = {
    whatnot: 'Whatnot',
    loupe: 'Loupe',
    youtube: 'YouTube',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitch: 'Twitch',
    in_person: 'In-Person',
  };
  return labels[platform] ?? platform;
}

/**
 * Tailwind-compatible colour class for a break status badge.
 */
export function getStatusColor(status: BreakStatus): string {
  const colors: Record<BreakStatus, string> = {
    upcoming: 'bg-blue-500/20 text-blue-400',
    live: 'bg-red-500/20 text-red-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status] ?? 'bg-gray-500/20 text-gray-400';
}

/**
 * Format a number as USD currency string.
 */
export function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1000) {
    return n.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format an ROI number with sign and percent.
 */
export function formatROI(roi: number): string {
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${roi.toFixed(1)}%`;
}
