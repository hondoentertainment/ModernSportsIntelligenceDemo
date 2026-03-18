// Phase 145: Live Event & Break Streaming Hub
// Real-time hub for live card breaks, auction events, and streaming sessions across platforms

import { store } from './dal/syncStore';

// ---- Types ----

export type Platform = 'whatnot' | 'loupe' | 'youtube' | 'twitch' | 'ebay_live' | 'fanatics_live' | 'drip' | 'steel_city';

export type BreakFormat = 'random_team' | 'pick_your_team' | 'personal' | 'hit_draft' | 'half_case' | 'full_case' | 'mixer';

export type BreakStatus = 'live' | 'upcoming' | 'filling' | 'completed';

export interface LiveBreak {
  id: string;
  platform: Platform;
  breakerName: string;
  breakerId: string;
  title: string;
  product: string;
  format: BreakFormat;
  status: BreakStatus;
  spotPrice: number;
  spotsTotal: number;
  spotsFilled: number;
  viewerCount: number;
  startTime: string;
  streamUrl: string;
  thumbnailUrl?: string;
}

export interface BreakSpot {
  id: string;
  breakId: string;
  team: string;
  price: number;
  buyerName: string | null;
  isFilled: boolean;
}

export interface LiveAuction {
  id: string;
  platform: Platform;
  title: string;
  currentBid: number;
  bidCount: number;
  timeRemaining: string;
  thumbnailUrl?: string;
}

export interface StreamEvent {
  id: string;
  platform: Platform;
  breakerName: string;
  eventType: 'break_start' | 'big_hit' | 'break_end' | 'giveaway' | 'milestone';
  description: string;
  timestamp: string;
  value?: number;
}

export interface BreakResult {
  id: string;
  breakId: string;
  breakerName: string;
  product: string;
  platform: Platform;
  cardPulled: string;
  player: string;
  team: string;
  estimatedValue: number;
  isNotableHit: boolean;
  timestamp: string;
}

export interface BreakerProfile {
  id: string;
  name: string;
  platform: Platform;
  rating: number;
  totalBreaks: number;
  totalHits: number;
  avgHitRate: number;
  followers: number;
  isVerified: boolean;
  specialty: string;
}

export interface SpotPrice {
  team: string;
  price: number;
  historicalAvg: number;
  demand: 'low' | 'medium' | 'high' | 'extreme';
}

export interface ViewerStats {
  platform: Platform;
  totalViewers: number;
  activeStreams: number;
  peakToday: number;
  avgViewersPerStream: number;
}

export interface BreakSchedule {
  id: string;
  breakerName: string;
  platform: Platform;
  product: string;
  format: BreakFormat;
  scheduledTime: string;
  estimatedSpotPrice: number;
  status: 'scheduled' | 'filling' | 'sold_out';
}

export interface HitTracker {
  productId: string;
  productName: string;
  totalOpened: number;
  notableHits: number;
  hitRate: number;
  bestPull: string;
  bestPullValue: number;
  avgBoxValue: number;
  recentPulls: { card: string; value: number; timestamp: string }[];
}

// ---- Constants ----

const STORAGE_KEY = 'msi_live_break_hub';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Data ----

const LIVE_BREAKS: LiveBreak[] = [
  {
    id: 'brk_001',
    platform: 'whatnot',
    breakerName: 'Layton Sports Cards',
    breakerId: 'layton_sc',
    title: '2024 Topps Chrome Hobby Case Break',
    product: '2024 Topps Chrome Hobby',
    format: 'random_team',
    status: 'live',
    spotPrice: 35,
    spotsTotal: 30,
    spotsFilled: 30,
    viewerCount: 2847,
    startTime: '2026-03-15T18:00:00Z',
    streamUrl: 'https://whatnot.com/live/layton_sc',
  },
  {
    id: 'brk_002',
    platform: 'loupe',
    breakerName: 'Packman Breaks',
    breakerId: 'packman_brk',
    title: 'National Treasures Football PYT',
    product: '2024 Panini National Treasures Football',
    format: 'pick_your_team',
    status: 'live',
    spotPrice: 250,
    spotsTotal: 32,
    spotsFilled: 28,
    viewerCount: 1523,
    startTime: '2026-03-15T17:30:00Z',
    streamUrl: 'https://loupe.com/live/packman_brk',
  },
  {
    id: 'brk_003',
    platform: 'youtube',
    breakerName: 'Jabs Family',
    breakerId: 'jabs_fam',
    title: 'Chrome Sapphire Personal Rip Night',
    product: '2024 Topps Chrome Sapphire',
    format: 'personal',
    status: 'live',
    spotPrice: 450,
    spotsTotal: 12,
    spotsFilled: 12,
    viewerCount: 4210,
    startTime: '2026-03-15T19:00:00Z',
    streamUrl: 'https://youtube.com/live/jabs_fam',
  },
  {
    id: 'brk_004',
    platform: 'fanatics_live',
    breakerName: 'Fanatics Exclusives',
    breakerId: 'fanatics_ex',
    title: 'Bowman Draft 2024 Full Case Hit Draft',
    product: '2024 Bowman Draft Hobby',
    format: 'hit_draft',
    status: 'live',
    spotPrice: 75,
    spotsTotal: 16,
    spotsFilled: 16,
    viewerCount: 3102,
    startTime: '2026-03-15T18:30:00Z',
    streamUrl: 'https://fanatics.com/live/exclusives',
  },
  {
    id: 'brk_005',
    platform: 'whatnot',
    breakerName: 'Steel City Collectibles',
    breakerId: 'steel_city_c',
    title: 'Prizm Basketball Half Case Random',
    product: '2024 Panini Prizm Basketball',
    format: 'half_case',
    status: 'live',
    spotPrice: 45,
    spotsTotal: 30,
    spotsFilled: 30,
    viewerCount: 1876,
    startTime: '2026-03-15T17:00:00Z',
    streamUrl: 'https://whatnot.com/live/steel_city_c',
  },
  {
    id: 'brk_006',
    platform: 'twitch',
    breakerName: 'CardSmith Live',
    breakerId: 'cardsmith_tv',
    title: 'Optic Football Mega Mixer',
    product: '2024 Donruss Optic Football',
    format: 'mixer',
    status: 'live',
    spotPrice: 25,
    spotsTotal: 32,
    spotsFilled: 29,
    viewerCount: 934,
    startTime: '2026-03-15T19:30:00Z',
    streamUrl: 'https://twitch.tv/cardsmith_tv',
  },
  {
    id: 'brk_007',
    platform: 'ebay_live',
    breakerName: 'Vintage Breaks',
    breakerId: 'vintage_brk',
    title: '1987 Topps Case Break Nostalgia Night',
    product: '1987 Topps Baseball Wax Case',
    format: 'full_case',
    status: 'live',
    spotPrice: 15,
    spotsTotal: 20,
    spotsFilled: 18,
    viewerCount: 612,
    startTime: '2026-03-15T20:00:00Z',
    streamUrl: 'https://ebay.com/live/vintage_brk',
  },
  {
    id: 'brk_008',
    platform: 'drip',
    breakerName: 'Rip City Cards',
    breakerId: 'ripcity_c',
    title: 'Select Basketball PYT Premium',
    product: '2024 Panini Select Basketball',
    format: 'pick_your_team',
    status: 'live',
    spotPrice: 85,
    spotsTotal: 30,
    spotsFilled: 26,
    viewerCount: 745,
    startTime: '2026-03-15T18:15:00Z',
    streamUrl: 'https://drip.com/live/ripcity_c',
  },
  {
    id: 'brk_009',
    platform: 'steel_city',
    breakerName: 'Steel City Official',
    breakerId: 'steel_official',
    title: 'Mosaic Football Full Case Break',
    product: '2024 Panini Mosaic Football',
    format: 'full_case',
    status: 'live',
    spotPrice: 55,
    spotsTotal: 32,
    spotsFilled: 32,
    viewerCount: 1340,
    startTime: '2026-03-15T16:00:00Z',
    streamUrl: 'https://steelcitycollectibles.com/live',
  },
  {
    id: 'brk_010',
    platform: 'whatnot',
    breakerName: 'Blez Sports Cards',
    breakerId: 'blez_sc',
    title: 'Flawless Basketball Personal Box',
    product: '2024 Panini Flawless Basketball',
    format: 'personal',
    status: 'live',
    spotPrice: 2500,
    spotsTotal: 4,
    spotsFilled: 4,
    viewerCount: 5621,
    startTime: '2026-03-15T20:00:00Z',
    streamUrl: 'https://whatnot.com/live/blez_sc',
  },
  {
    id: 'brk_011',
    platform: 'loupe',
    breakerName: 'Brothers in Cards',
    breakerId: 'bic_breaks',
    title: 'Spectra Football Random Team',
    product: '2024 Panini Spectra Football',
    format: 'random_team',
    status: 'live',
    spotPrice: 40,
    spotsTotal: 32,
    spotsFilled: 27,
    viewerCount: 1102,
    startTime: '2026-03-15T19:00:00Z',
    streamUrl: 'https://loupe.com/live/bic_breaks',
  },
  {
    id: 'brk_012',
    platform: 'youtube',
    breakerName: 'Cards Infinity',
    breakerId: 'cards_inf',
    title: 'Bowman Chrome University PYT',
    product: '2024 Bowman Chrome University',
    format: 'pick_your_team',
    status: 'filling',
    spotPrice: 30,
    spotsTotal: 30,
    spotsFilled: 19,
    viewerCount: 487,
    startTime: '2026-03-15T21:00:00Z',
    streamUrl: 'https://youtube.com/live/cards_inf',
  },
  {
    id: 'brk_013',
    platform: 'fanatics_live',
    breakerName: 'Fanatics Premier',
    breakerId: 'fanatics_pr',
    title: 'Topps Dynasty Baseball Personal',
    product: '2024 Topps Dynasty Baseball',
    format: 'personal',
    status: 'filling',
    spotPrice: 1800,
    spotsTotal: 6,
    spotsFilled: 3,
    viewerCount: 892,
    startTime: '2026-03-15T22:00:00Z',
    streamUrl: 'https://fanatics.com/live/premier',
  },
  {
    id: 'brk_014',
    platform: 'twitch',
    breakerName: 'Midwest Box Breaks',
    breakerId: 'midwest_bb',
    title: 'Contenders Football Full Case',
    product: '2024 Panini Contenders Football',
    format: 'full_case',
    status: 'upcoming',
    spotPrice: 60,
    spotsTotal: 32,
    spotsFilled: 0,
    viewerCount: 0,
    startTime: '2026-03-16T14:00:00Z',
    streamUrl: 'https://twitch.tv/midwest_bb',
  },
  {
    id: 'brk_015',
    platform: 'whatnot',
    breakerName: 'Backyard Breaks',
    breakerId: 'backyard_brk',
    title: 'Immaculate Baseball Mixer',
    product: '2024 Panini Immaculate Baseball',
    format: 'mixer',
    status: 'upcoming',
    spotPrice: 120,
    spotsTotal: 24,
    spotsFilled: 0,
    viewerCount: 0,
    startTime: '2026-03-16T18:00:00Z',
    streamUrl: 'https://whatnot.com/live/backyard_brk',
  },
];

const BREAKER_PROFILES: BreakerProfile[] = [
  { id: 'bp_001', name: 'Layton Sports Cards', platform: 'whatnot', rating: 4.9, totalBreaks: 12450, totalHits: 3890, avgHitRate: 31.2, followers: 285000, isVerified: true, specialty: 'Baseball' },
  { id: 'bp_002', name: 'Jabs Family', platform: 'youtube', rating: 4.8, totalBreaks: 8920, totalHits: 2980, avgHitRate: 33.4, followers: 520000, isVerified: true, specialty: 'Multi-sport' },
  { id: 'bp_003', name: 'Packman Breaks', platform: 'loupe', rating: 4.7, totalBreaks: 6340, totalHits: 1890, avgHitRate: 29.8, followers: 142000, isVerified: true, specialty: 'Football' },
  { id: 'bp_004', name: 'Steel City Collectibles', platform: 'whatnot', rating: 4.9, totalBreaks: 15600, totalHits: 5120, avgHitRate: 32.8, followers: 310000, isVerified: true, specialty: 'All Sports' },
  { id: 'bp_005', name: 'Blez Sports Cards', platform: 'whatnot', rating: 4.6, totalBreaks: 4200, totalHits: 1540, avgHitRate: 36.7, followers: 178000, isVerified: true, specialty: 'Basketball' },
  { id: 'bp_006', name: 'CardSmith Live', platform: 'twitch', rating: 4.5, totalBreaks: 3100, totalHits: 870, avgHitRate: 28.1, followers: 89000, isVerified: false, specialty: 'Football' },
  { id: 'bp_007', name: 'Brothers in Cards', platform: 'loupe', rating: 4.7, totalBreaks: 7800, totalHits: 2340, avgHitRate: 30.0, followers: 195000, isVerified: true, specialty: 'Football' },
  { id: 'bp_008', name: 'Vintage Breaks', platform: 'ebay_live', rating: 4.8, totalBreaks: 2100, totalHits: 480, avgHitRate: 22.9, followers: 67000, isVerified: true, specialty: 'Vintage' },
  { id: 'bp_009', name: 'Rip City Cards', platform: 'drip', rating: 4.4, totalBreaks: 1850, totalHits: 520, avgHitRate: 28.1, followers: 43000, isVerified: false, specialty: 'Basketball' },
  { id: 'bp_010', name: 'Backyard Breaks', platform: 'whatnot', rating: 4.6, totalBreaks: 5600, totalHits: 1790, avgHitRate: 32.0, followers: 156000, isVerified: true, specialty: 'Baseball' },
];

const BREAK_RESULTS: BreakResult[] = [
  { id: 'res_001', breakId: 'brk_001', breakerName: 'Layton Sports Cards', product: '2024 Topps Chrome Hobby', platform: 'whatnot', cardPulled: '2024 Topps Chrome Elly De La Cruz Gold Refractor Auto /50', player: 'Elly De La Cruz', team: 'Reds', estimatedValue: 1200, isNotableHit: true, timestamp: '2026-03-15T18:22:00Z' },
  { id: 'res_002', breakId: 'brk_003', breakerName: 'Jabs Family', product: '2024 Topps Chrome Sapphire', platform: 'youtube', cardPulled: '2024 Topps Chrome Sapphire Shohei Ohtani Superfractor 1/1', player: 'Shohei Ohtani', team: 'Dodgers', estimatedValue: 15000, isNotableHit: true, timestamp: '2026-03-15T19:14:00Z' },
  { id: 'res_003', breakId: 'brk_002', breakerName: 'Packman Breaks', product: '2024 Panini National Treasures Football', platform: 'loupe', cardPulled: '2024 NT Caleb Williams RPA /99', player: 'Caleb Williams', team: 'Bears', estimatedValue: 3500, isNotableHit: true, timestamp: '2026-03-15T17:55:00Z' },
  { id: 'res_004', breakId: 'brk_005', breakerName: 'Steel City Collectibles', product: '2024 Panini Prizm Basketball', platform: 'whatnot', cardPulled: '2024 Prizm Victor Wembanyama Silver /25', player: 'Victor Wembanyama', team: 'Spurs', estimatedValue: 4200, isNotableHit: true, timestamp: '2026-03-15T17:38:00Z' },
  { id: 'res_005', breakId: 'brk_004', breakerName: 'Fanatics Exclusives', product: '2024 Bowman Draft Hobby', platform: 'fanatics_live', cardPulled: '2024 Bowman Draft Chrome Travis Bazzana Auto /25', player: 'Travis Bazzana', team: 'Guardians', estimatedValue: 850, isNotableHit: true, timestamp: '2026-03-15T18:45:00Z' },
  { id: 'res_006', breakId: 'brk_001', breakerName: 'Layton Sports Cards', product: '2024 Topps Chrome Hobby', platform: 'whatnot', cardPulled: '2024 Topps Chrome Gunnar Henderson Refractor Auto', player: 'Gunnar Henderson', team: 'Orioles', estimatedValue: 380, isNotableHit: false, timestamp: '2026-03-15T18:18:00Z' },
  { id: 'res_007', breakId: 'brk_009', breakerName: 'Steel City Official', product: '2024 Panini Mosaic Football', platform: 'steel_city', cardPulled: '2024 Mosaic Marvin Harrison Jr Gold Vinyl 1/1', player: 'Marvin Harrison Jr', team: 'Cardinals', estimatedValue: 2800, isNotableHit: true, timestamp: '2026-03-15T16:42:00Z' },
  { id: 'res_008', breakId: 'brk_010', breakerName: 'Blez Sports Cards', product: '2024 Panini Flawless Basketball', platform: 'whatnot', cardPulled: '2024 Flawless Luka Doncic Patch Auto /10', player: 'Luka Doncic', team: 'Lakers', estimatedValue: 5500, isNotableHit: true, timestamp: '2026-03-15T20:12:00Z' },
  { id: 'res_009', breakId: 'brk_006', breakerName: 'CardSmith Live', product: '2024 Donruss Optic Football', platform: 'twitch', cardPulled: '2024 Optic Drake Maye Rated Rookie Auto /99', player: 'Drake Maye', team: 'Patriots', estimatedValue: 420, isNotableHit: false, timestamp: '2026-03-15T19:52:00Z' },
  { id: 'res_010', breakId: 'brk_002', breakerName: 'Packman Breaks', product: '2024 Panini National Treasures Football', platform: 'loupe', cardPulled: '2024 NT Jayden Daniels Rookie Patch Auto 1/1 Logoman', player: 'Jayden Daniels', team: 'Commanders', estimatedValue: 18000, isNotableHit: true, timestamp: '2026-03-15T18:08:00Z' },
  { id: 'res_011', breakId: 'brk_005', breakerName: 'Steel City Collectibles', product: '2024 Panini Prizm Basketball', platform: 'whatnot', cardPulled: '2024 Prizm Chet Holmgren Gold Wave /10', player: 'Chet Holmgren', team: 'Thunder', estimatedValue: 780, isNotableHit: true, timestamp: '2026-03-15T17:25:00Z' },
  { id: 'res_012', breakId: 'brk_008', breakerName: 'Rip City Cards', product: '2024 Panini Select Basketball', platform: 'drip', cardPulled: '2024 Select Anthony Edwards Tie-Dye /25', player: 'Anthony Edwards', team: 'Timberwolves', estimatedValue: 1650, isNotableHit: true, timestamp: '2026-03-15T18:33:00Z' },
  { id: 'res_013', breakId: 'brk_011', breakerName: 'Brothers in Cards', product: '2024 Panini Spectra Football', platform: 'loupe', cardPulled: '2024 Spectra CJ Stroud Neon Green /15', player: 'CJ Stroud', team: 'Texans', estimatedValue: 920, isNotableHit: true, timestamp: '2026-03-15T19:18:00Z' },
  { id: 'res_014', breakId: 'brk_003', breakerName: 'Jabs Family', product: '2024 Topps Chrome Sapphire', platform: 'youtube', cardPulled: '2024 Topps Chrome Sapphire Ronald Acuna Jr Auto /10', player: 'Ronald Acuna Jr', team: 'Braves', estimatedValue: 2100, isNotableHit: true, timestamp: '2026-03-15T19:28:00Z' },
  { id: 'res_015', breakId: 'brk_007', breakerName: 'Vintage Breaks', product: '1987 Topps Baseball Wax Case', platform: 'ebay_live', cardPulled: '1987 Topps Barry Bonds RC #320 (PSA 10 candidate)', player: 'Barry Bonds', team: 'Pirates', estimatedValue: 250, isNotableHit: false, timestamp: '2026-03-15T20:15:00Z' },
  { id: 'res_016', breakId: 'brk_004', breakerName: 'Fanatics Exclusives', product: '2024 Bowman Draft Hobby', platform: 'fanatics_live', cardPulled: '2024 Bowman Draft JJ Wetherholt Chrome Auto /50', player: 'JJ Wetherholt', team: 'Pirates', estimatedValue: 620, isNotableHit: true, timestamp: '2026-03-15T19:02:00Z' },
  { id: 'res_017', breakId: 'brk_010', breakerName: 'Blez Sports Cards', product: '2024 Panini Flawless Basketball', platform: 'whatnot', cardPulled: '2024 Flawless Nikola Jokic Diamond /20', player: 'Nikola Jokic', team: 'Nuggets', estimatedValue: 3200, isNotableHit: true, timestamp: '2026-03-15T20:28:00Z' },
  { id: 'res_018', breakId: 'brk_009', breakerName: 'Steel City Official', product: '2024 Panini Mosaic Football', platform: 'steel_city', cardPulled: '2024 Mosaic Bo Nix Rookie Red /49', player: 'Bo Nix', team: 'Broncos', estimatedValue: 180, isNotableHit: false, timestamp: '2026-03-15T16:55:00Z' },
  { id: 'res_019', breakId: 'brk_006', breakerName: 'CardSmith Live', product: '2024 Donruss Optic Football', platform: 'twitch', cardPulled: '2024 Optic Brock Bowers Downtown /75', player: 'Brock Bowers', team: 'Raiders', estimatedValue: 550, isNotableHit: true, timestamp: '2026-03-15T20:05:00Z' },
  { id: 'res_020', breakId: 'brk_001', breakerName: 'Layton Sports Cards', product: '2024 Topps Chrome Hobby', platform: 'whatnot', cardPulled: '2024 Topps Chrome Paul Skenes Rookie Auto /75', player: 'Paul Skenes', team: 'Pirates', estimatedValue: 950, isNotableHit: true, timestamp: '2026-03-15T18:35:00Z' },
  { id: 'res_021', breakId: 'brk_002', breakerName: 'Packman Breaks', product: '2024 Panini National Treasures Football', platform: 'loupe', cardPulled: '2024 NT Malik Nabers Rookie Patch Auto /49', player: 'Malik Nabers', team: 'Giants', estimatedValue: 1100, isNotableHit: true, timestamp: '2026-03-15T18:20:00Z' },
  { id: 'res_022', breakId: 'brk_005', breakerName: 'Steel City Collectibles', product: '2024 Panini Prizm Basketball', platform: 'whatnot', cardPulled: '2024 Prizm Zach Edey Green Pulsar /25', player: 'Zach Edey', team: 'Grizzlies', estimatedValue: 340, isNotableHit: false, timestamp: '2026-03-15T17:42:00Z' },
  { id: 'res_023', breakId: 'brk_008', breakerName: 'Rip City Cards', product: '2024 Panini Select Basketball', platform: 'drip', cardPulled: '2024 Select Ja Morant Courtside Gold /10', player: 'Ja Morant', team: 'Grizzlies', estimatedValue: 1400, isNotableHit: true, timestamp: '2026-03-15T18:50:00Z' },
  { id: 'res_024', breakId: 'brk_011', breakerName: 'Brothers in Cards', product: '2024 Panini Spectra Football', platform: 'loupe', cardPulled: '2024 Spectra Caleb Williams Radiance Auto /15', player: 'Caleb Williams', team: 'Bears', estimatedValue: 2400, isNotableHit: true, timestamp: '2026-03-15T19:35:00Z' },
  { id: 'res_025', breakId: 'brk_003', breakerName: 'Jabs Family', product: '2024 Topps Chrome Sapphire', platform: 'youtube', cardPulled: '2024 Topps Chrome Sapphire Julio Rodriguez Gold /50', player: 'Julio Rodriguez', team: 'Mariners', estimatedValue: 680, isNotableHit: true, timestamp: '2026-03-15T19:45:00Z' },
];

const BREAK_SCHEDULE: BreakSchedule[] = [
  { id: 'sch_001', breakerName: 'Layton Sports Cards', platform: 'whatnot', product: '2024 Bowman Chrome Hobby', format: 'random_team', scheduledTime: '2026-03-16T12:00:00Z', estimatedSpotPrice: 40, status: 'filling' },
  { id: 'sch_002', breakerName: 'Jabs Family', platform: 'youtube', product: '2024 Panini Prizm Basketball', format: 'personal', scheduledTime: '2026-03-16T14:00:00Z', estimatedSpotPrice: 350, status: 'scheduled' },
  { id: 'sch_003', breakerName: 'Packman Breaks', platform: 'loupe', product: '2024 Panini Immaculate Football', format: 'pick_your_team', scheduledTime: '2026-03-16T16:00:00Z', estimatedSpotPrice: 180, status: 'filling' },
  { id: 'sch_004', breakerName: 'Steel City Collectibles', platform: 'whatnot', product: '2024 Topps Chrome Update', format: 'full_case', scheduledTime: '2026-03-16T18:00:00Z', estimatedSpotPrice: 30, status: 'sold_out' },
  { id: 'sch_005', breakerName: 'Blez Sports Cards', platform: 'whatnot', product: '2024 Panini National Treasures Basketball', format: 'personal', scheduledTime: '2026-03-16T20:00:00Z', estimatedSpotPrice: 3200, status: 'filling' },
  { id: 'sch_006', breakerName: 'CardSmith Live', platform: 'twitch', product: '2024 Panini Contenders Football', format: 'random_team', scheduledTime: '2026-03-16T19:00:00Z', estimatedSpotPrice: 35, status: 'scheduled' },
  { id: 'sch_007', breakerName: 'Brothers in Cards', platform: 'loupe', product: '2024 Topps Definitive Baseball', format: 'hit_draft', scheduledTime: '2026-03-17T14:00:00Z', estimatedSpotPrice: 200, status: 'scheduled' },
  { id: 'sch_008', breakerName: 'Vintage Breaks', platform: 'ebay_live', product: '1989 Upper Deck Baseball Wax Case', format: 'full_case', scheduledTime: '2026-03-17T16:00:00Z', estimatedSpotPrice: 20, status: 'scheduled' },
  { id: 'sch_009', breakerName: 'Rip City Cards', platform: 'drip', product: '2024 Panini Select Football', format: 'pick_your_team', scheduledTime: '2026-03-17T18:00:00Z', estimatedSpotPrice: 65, status: 'scheduled' },
  { id: 'sch_010', breakerName: 'Backyard Breaks', platform: 'whatnot', product: '2024 Topps Sterling Baseball', format: 'personal', scheduledTime: '2026-03-17T20:00:00Z', estimatedSpotPrice: 550, status: 'filling' },
  { id: 'sch_011', breakerName: 'Fanatics Exclusives', platform: 'fanatics_live', product: '2024 Topps Chrome Black Baseball', format: 'personal', scheduledTime: '2026-03-17T22:00:00Z', estimatedSpotPrice: 1200, status: 'scheduled' },
  { id: 'sch_012', breakerName: 'Midwest Box Breaks', platform: 'twitch', product: '2024 Panini Prizm Football', format: 'half_case', scheduledTime: '2026-03-18T14:00:00Z', estimatedSpotPrice: 50, status: 'scheduled' },
  { id: 'sch_013', breakerName: 'Layton Sports Cards', platform: 'whatnot', product: '2024 Panini Flawless Football', format: 'hit_draft', scheduledTime: '2026-03-18T18:00:00Z', estimatedSpotPrice: 450, status: 'scheduled' },
  { id: 'sch_014', breakerName: 'Jabs Family', platform: 'youtube', product: '2024 Topps Luminaries Baseball', format: 'personal', scheduledTime: '2026-03-18T20:00:00Z', estimatedSpotPrice: 800, status: 'scheduled' },
  { id: 'sch_015', breakerName: 'Steel City Official', platform: 'steel_city', product: '2024 Panini Prizm Draft Picks', format: 'random_team', scheduledTime: '2026-03-18T16:00:00Z', estimatedSpotPrice: 25, status: 'scheduled' },
  { id: 'sch_016', breakerName: 'Packman Breaks', platform: 'loupe', product: '2024 Panini Origins Football', format: 'pick_your_team', scheduledTime: '2026-03-19T14:00:00Z', estimatedSpotPrice: 110, status: 'scheduled' },
  { id: 'sch_017', breakerName: 'Blez Sports Cards', platform: 'whatnot', product: '2024 Panini One Basketball', format: 'personal', scheduledTime: '2026-03-19T20:00:00Z', estimatedSpotPrice: 1500, status: 'scheduled' },
  { id: 'sch_018', breakerName: 'Brothers in Cards', platform: 'loupe', product: '2024 Topps Museum Collection', format: 'mixer', scheduledTime: '2026-03-19T18:00:00Z', estimatedSpotPrice: 75, status: 'scheduled' },
  { id: 'sch_019', breakerName: 'CardSmith Live', platform: 'twitch', product: '2024 Donruss Basketball', format: 'full_case', scheduledTime: '2026-03-20T14:00:00Z', estimatedSpotPrice: 20, status: 'scheduled' },
  { id: 'sch_020', breakerName: 'Rip City Cards', platform: 'drip', product: '2024 Panini Crown Royale Football', format: 'random_team', scheduledTime: '2026-03-20T18:00:00Z', estimatedSpotPrice: 55, status: 'scheduled' },
];

const HIT_TRACKERS: HitTracker[] = [
  {
    productId: 'prod_001',
    productName: '2024 Topps Chrome Hobby',
    totalOpened: 4200,
    notableHits: 420,
    hitRate: 10.0,
    bestPull: 'Elly De La Cruz Superfractor Auto 1/1',
    bestPullValue: 25000,
    avgBoxValue: 185,
    recentPulls: [
      { card: 'Paul Skenes Rookie Auto /75', value: 950, timestamp: '2026-03-15T18:35:00Z' },
      { card: 'Elly De La Cruz Gold Refractor Auto /50', value: 1200, timestamp: '2026-03-15T18:22:00Z' },
      { card: 'Gunnar Henderson Refractor Auto', value: 380, timestamp: '2026-03-15T18:18:00Z' },
      { card: 'Jackson Chourio Orange Refractor /25', value: 560, timestamp: '2026-03-15T17:50:00Z' },
      { card: 'Corbin Carroll Pink Refractor Auto', value: 290, timestamp: '2026-03-15T17:35:00Z' },
    ],
  },
  {
    productId: 'prod_002',
    productName: '2024 Panini National Treasures Football',
    totalOpened: 890,
    notableHits: 267,
    hitRate: 30.0,
    bestPull: 'Jayden Daniels Rookie Patch Auto 1/1 Logoman',
    bestPullValue: 18000,
    avgBoxValue: 1250,
    recentPulls: [
      { card: 'Jayden Daniels RPA 1/1 Logoman', value: 18000, timestamp: '2026-03-15T18:08:00Z' },
      { card: 'Caleb Williams RPA /99', value: 3500, timestamp: '2026-03-15T17:55:00Z' },
      { card: 'Malik Nabers RPA /49', value: 1100, timestamp: '2026-03-15T18:20:00Z' },
      { card: 'Marvin Harrison Jr Colossal Patch Auto /25', value: 2200, timestamp: '2026-03-15T17:40:00Z' },
      { card: 'Drake Maye Booklet Auto /10', value: 1800, timestamp: '2026-03-15T17:30:00Z' },
    ],
  },
  {
    productId: 'prod_003',
    productName: '2024 Panini Prizm Basketball',
    totalOpened: 6100,
    notableHits: 610,
    hitRate: 10.0,
    bestPull: 'Victor Wembanyama Gold Vinyl 1/1',
    bestPullValue: 32000,
    avgBoxValue: 220,
    recentPulls: [
      { card: 'Victor Wembanyama Silver /25', value: 4200, timestamp: '2026-03-15T17:38:00Z' },
      { card: 'Chet Holmgren Gold Wave /10', value: 780, timestamp: '2026-03-15T17:25:00Z' },
      { card: 'Zach Edey Green Pulsar /25', value: 340, timestamp: '2026-03-15T17:42:00Z' },
      { card: 'Anthony Edwards Shimmer /35', value: 1100, timestamp: '2026-03-15T17:10:00Z' },
      { card: 'Luka Doncic Silver Prizm', value: 450, timestamp: '2026-03-15T16:55:00Z' },
    ],
  },
  {
    productId: 'prod_004',
    productName: '2024 Topps Chrome Sapphire',
    totalOpened: 1200,
    notableHits: 180,
    hitRate: 15.0,
    bestPull: 'Shohei Ohtani Superfractor 1/1',
    bestPullValue: 45000,
    avgBoxValue: 850,
    recentPulls: [
      { card: 'Shohei Ohtani Superfractor 1/1', value: 15000, timestamp: '2026-03-15T19:14:00Z' },
      { card: 'Ronald Acuna Jr Auto /10', value: 2100, timestamp: '2026-03-15T19:28:00Z' },
      { card: 'Julio Rodriguez Gold /50', value: 680, timestamp: '2026-03-15T19:45:00Z' },
      { card: 'Corbin Carroll Green /99', value: 320, timestamp: '2026-03-15T19:05:00Z' },
      { card: 'Paul Skenes Purple /75', value: 550, timestamp: '2026-03-15T18:55:00Z' },
    ],
  },
  {
    productId: 'prod_005',
    productName: '2024 Panini Flawless Basketball',
    totalOpened: 320,
    notableHits: 192,
    hitRate: 60.0,
    bestPull: 'LeBron James Flawless Patch Auto 1/1',
    bestPullValue: 55000,
    avgBoxValue: 4500,
    recentPulls: [
      { card: 'Luka Doncic Patch Auto /10', value: 5500, timestamp: '2026-03-15T20:12:00Z' },
      { card: 'Nikola Jokic Diamond /20', value: 3200, timestamp: '2026-03-15T20:28:00Z' },
      { card: 'Victor Wembanyama Ruby /15', value: 6800, timestamp: '2026-03-15T20:02:00Z' },
      { card: 'Jayson Tatum Gold /10', value: 2400, timestamp: '2026-03-15T19:50:00Z' },
      { card: 'Shai Gilgeous-Alexander Emerald /5', value: 4100, timestamp: '2026-03-15T19:38:00Z' },
    ],
  },
];

const VIEWER_STATS: ViewerStats[] = [
  { platform: 'whatnot', totalViewers: 10344, activeStreams: 4, peakToday: 18200, avgViewersPerStream: 2586 },
  { platform: 'youtube', totalViewers: 4697, activeStreams: 2, peakToday: 8400, avgViewersPerStream: 2349 },
  { platform: 'fanatics_live', totalViewers: 3994, activeStreams: 2, peakToday: 6800, avgViewersPerStream: 1997 },
  { platform: 'loupe', totalViewers: 2625, activeStreams: 2, peakToday: 5100, avgViewersPerStream: 1313 },
  { platform: 'steel_city', totalViewers: 1340, activeStreams: 1, peakToday: 2800, avgViewersPerStream: 1340 },
  { platform: 'twitch', totalViewers: 934, activeStreams: 1, peakToday: 3200, avgViewersPerStream: 934 },
  { platform: 'drip', totalViewers: 745, activeStreams: 1, peakToday: 1500, avgViewersPerStream: 745 },
  { platform: 'ebay_live', totalViewers: 612, activeStreams: 1, peakToday: 1800, avgViewersPerStream: 612 },
];

const STREAM_EVENTS: StreamEvent[] = [
  { id: 'evt_001', platform: 'youtube', breakerName: 'Jabs Family', eventType: 'big_hit', description: 'Shohei Ohtani Superfractor 1/1 pulled from Chrome Sapphire!', timestamp: '2026-03-15T19:14:00Z', value: 15000 },
  { id: 'evt_002', platform: 'loupe', breakerName: 'Packman Breaks', eventType: 'big_hit', description: 'Jayden Daniels 1/1 Logoman RPA from National Treasures!', timestamp: '2026-03-15T18:08:00Z', value: 18000 },
  { id: 'evt_003', platform: 'whatnot', breakerName: 'Blez Sports Cards', eventType: 'break_start', description: 'Flawless Basketball Personal Box starting now', timestamp: '2026-03-15T20:00:00Z' },
  { id: 'evt_004', platform: 'whatnot', breakerName: 'Layton Sports Cards', eventType: 'giveaway', description: '$500 credit giveaway at 3000 viewers!', timestamp: '2026-03-15T18:30:00Z' },
  { id: 'evt_005', platform: 'fanatics_live', breakerName: 'Fanatics Exclusives', eventType: 'milestone', description: 'Reached 10,000 total breaks on Fanatics Live', timestamp: '2026-03-15T18:50:00Z' },
  { id: 'evt_006', platform: 'whatnot', breakerName: 'Steel City Collectibles', eventType: 'big_hit', description: 'Victor Wembanyama Silver Prizm /25 pulled!', timestamp: '2026-03-15T17:38:00Z', value: 4200 },
  { id: 'evt_007', platform: 'steel_city', breakerName: 'Steel City Official', eventType: 'big_hit', description: 'Marvin Harrison Jr Gold Vinyl 1/1 from Mosaic!', timestamp: '2026-03-15T16:42:00Z', value: 2800 },
  { id: 'evt_008', platform: 'drip', breakerName: 'Rip City Cards', eventType: 'break_start', description: 'Select Basketball PYT Premium going live', timestamp: '2026-03-15T18:15:00Z' },
  { id: 'evt_009', platform: 'whatnot', breakerName: 'Blez Sports Cards', eventType: 'big_hit', description: 'Luka Doncic Flawless Patch Auto /10!', timestamp: '2026-03-15T20:12:00Z', value: 5500 },
  { id: 'evt_010', platform: 'twitch', breakerName: 'CardSmith Live', eventType: 'break_end', description: 'Optic Football Mega Mixer complete', timestamp: '2026-03-15T20:15:00Z' },
];

// ---- Public API ----

export function getLiveBreaks(platform?: Platform): LiveBreak[] {
  const cached = loadData<LiveBreak[]>('live_breaks');
  const data = cached && cached.length > 0 ? cached : LIVE_BREAKS;
  if (!cached || cached.length === 0) saveData('live_breaks', LIVE_BREAKS);
  if (platform) return data.filter(b => b.platform === platform);
  return data;
}

export function getBreakDetails(breakId: string): LiveBreak | null {
  const breaks = getLiveBreaks();
  return breaks.find(b => b.id === breakId) || null;
}

export function getBreakFormats(): { format: BreakFormat; label: string; description: string; typicalPriceRange: string }[] {
  return [
    { format: 'random_team', label: 'Random Team', description: 'Teams are randomly assigned to participants after all spots are sold', typicalPriceRange: '$15-$75' },
    { format: 'pick_your_team', label: 'Pick Your Team', description: 'Participants select their preferred team at varying price points', typicalPriceRange: '$5-$500' },
    { format: 'personal', label: 'Personal Box/Case', description: 'One person gets all the hits from an entire box or case', typicalPriceRange: '$150-$5000' },
    { format: 'hit_draft', label: 'Hit Draft', description: 'Participants draft hits in order as they are pulled from packs', typicalPriceRange: '$50-$300' },
    { format: 'half_case', label: 'Half Case', description: 'Half of a sealed case is broken and distributed by team', typicalPriceRange: '$25-$150' },
    { format: 'full_case', label: 'Full Case', description: 'An entire sealed case is broken and distributed by team', typicalPriceRange: '$30-$250' },
    { format: 'mixer', label: 'Mixer', description: 'Multiple products are combined in a single break for variety', typicalPriceRange: '$20-$200' },
  ];
}

export function getActiveAuctions(): LiveAuction[] {
  return [
    { id: 'la_001', platform: 'whatnot', title: '2023 Topps Chrome Wembanyama PSA 10', currentBid: 2400, bidCount: 34, timeRemaining: '4m 22s' },
    { id: 'la_002', platform: 'ebay_live', title: '1986 Fleer Jordan RC PSA 7', currentBid: 18500, bidCount: 22, timeRemaining: '1h 15m' },
    { id: 'la_003', platform: 'fanatics_live', title: '2024 Bowman Chrome JJ Wetherholt Auto', currentBid: 380, bidCount: 15, timeRemaining: '8m 30s' },
    { id: 'la_004', platform: 'whatnot', title: '2020 Prizm Justin Herbert Silver PSA 10', currentBid: 950, bidCount: 19, timeRemaining: '22m 10s' },
    { id: 'la_005', platform: 'loupe', title: '2024 NT Caleb Williams RPA /49', currentBid: 1850, bidCount: 28, timeRemaining: '3m 45s' },
  ];
}

export function getStreamEvents(): StreamEvent[] {
  const cached = loadData<StreamEvent[]>('stream_events');
  if (cached && cached.length > 0) return cached;
  saveData('stream_events', STREAM_EVENTS);
  return STREAM_EVENTS;
}

export function getRecentResults(limit?: number): BreakResult[] {
  const cached = loadData<BreakResult[]>('break_results');
  const data = cached && cached.length > 0 ? cached : BREAK_RESULTS;
  if (!cached || cached.length === 0) saveData('break_results', BREAK_RESULTS);
  const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getBreakerProfiles(): BreakerProfile[] {
  const cached = loadData<BreakerProfile[]>('breaker_profiles');
  if (cached && cached.length > 0) return cached;
  saveData('breaker_profiles', BREAKER_PROFILES);
  return BREAKER_PROFILES;
}

export function getSpotPrices(breakId: string): SpotPrice[] {
  const breakInfo = getBreakDetails(breakId);
  if (!breakInfo) return [];
  const basePrice = breakInfo.spotPrice;
  const teams = [
    'Yankees', 'Dodgers', 'Braves', 'Astros', 'Phillies', 'Orioles', 'Rangers', 'Padres',
    'Mets', 'Guardians', 'Brewers', 'Cubs', 'Twins', 'Rays', 'Red Sox', 'Mariners',
    'Cardinals', 'Giants', 'Tigers', 'Diamondbacks', 'Reds', 'Blue Jays', 'Pirates',
    'White Sox', 'Royals', 'Angels', 'Athletics', 'Nationals', 'Marlins', 'Rockies',
  ];
  const multipliers: Record<string, number> = {
    Yankees: 3.2, Dodgers: 3.5, Braves: 2.1, Astros: 1.8, Phillies: 2.0,
    Orioles: 2.4, Rangers: 1.5, Padres: 1.6, Mets: 1.7, Guardians: 1.3,
    Brewers: 1.1, Cubs: 1.4, Twins: 1.2, Rays: 1.0, 'Red Sox': 1.6,
    Mariners: 1.3, Cardinals: 1.3, Giants: 1.2, Tigers: 1.1, Diamondbacks: 1.0,
    Reds: 1.8, 'Blue Jays': 1.2, Pirates: 1.9, 'White Sox': 0.8, Royals: 1.0,
    Angels: 1.1, Athletics: 0.7, Nationals: 0.9, Marlins: 0.8, Rockies: 0.7,
  };
  const demandLevels: Record<string, 'low' | 'medium' | 'high' | 'extreme'> = {
    Yankees: 'extreme', Dodgers: 'extreme', Braves: 'high', Astros: 'high', Phillies: 'high',
    Orioles: 'high', Rangers: 'medium', Padres: 'medium', Mets: 'medium', Guardians: 'medium',
    Brewers: 'medium', Cubs: 'medium', Twins: 'medium', Rays: 'low', 'Red Sox': 'medium',
    Mariners: 'medium', Cardinals: 'medium', Giants: 'medium', Tigers: 'low', Diamondbacks: 'low',
    Reds: 'high', 'Blue Jays': 'medium', Pirates: 'high', 'White Sox': 'low', Royals: 'low',
    Angels: 'low', Athletics: 'low', Nationals: 'low', Marlins: 'low', Rockies: 'low',
  };
  return teams.map(team => ({
    team,
    price: Math.round(basePrice * (multipliers[team] || 1.0)),
    historicalAvg: Math.round(basePrice * (multipliers[team] || 1.0) * 0.92),
    demand: demandLevels[team] || 'medium',
  }));
}

export function getViewerStats(): ViewerStats[] {
  return VIEWER_STATS;
}

export function getBreakSchedule(days?: number): BreakSchedule[] {
  const cached = loadData<BreakSchedule[]>('break_schedule');
  const data = cached && cached.length > 0 ? cached : BREAK_SCHEDULE;
  if (!cached || cached.length === 0) saveData('break_schedule', BREAK_SCHEDULE);
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return data.filter(s => new Date(s.scheduledTime) <= cutoff);
  }
  return data;
}

export function getHitTracker(productId: string): HitTracker | null {
  return HIT_TRACKERS.find(h => h.productId === productId) || null;
}

export function getPlatformStats(): { platform: Platform; label: string; liveBreaks: number; totalViewers: number; avgSpotPrice: number }[] {
  const breaks = getLiveBreaks();
  const stats = getViewerStats();
  const platforms: Platform[] = ['whatnot', 'loupe', 'youtube', 'twitch', 'ebay_live', 'fanatics_live', 'drip', 'steel_city'];
  return platforms.map(p => {
    const platformBreaks = breaks.filter(b => b.platform === p && b.status === 'live');
    const viewerStat = stats.find(s => s.platform === p);
    const avgPrice = platformBreaks.length > 0
      ? Math.round(platformBreaks.reduce((s, b) => s + b.spotPrice, 0) / platformBreaks.length)
      : 0;
    return {
      platform: p,
      label: getPlatformConfig(p).label,
      liveBreaks: platformBreaks.length,
      totalViewers: viewerStat?.totalViewers || 0,
      avgSpotPrice: avgPrice,
    };
  });
}

export function getTopHitsToday(): BreakResult[] {
  return getRecentResults()
    .filter(r => r.isNotableHit)
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 10);
}

export function calculateSpotValue(breakId: string, team: string): { spotPrice: number; expectedValue: number; roi: number } {
  const prices = getSpotPrices(breakId);
  const spot = prices.find(p => p.team === team);
  if (!spot) return { spotPrice: 0, expectedValue: 0, roi: 0 };
  const expectedValue = Math.round(spot.price * (0.6 + Math.random() * 0.8));
  const roi = Math.round(((expectedValue - spot.price) / spot.price) * 100);
  return { spotPrice: spot.price, expectedValue, roi };
}

// ---- Helpers ----

export function getPlatformConfig(platform: Platform): { label: string; text: string; bg: string; border: string } {
  const map: Record<Platform, { label: string; text: string; bg: string; border: string }> = {
    whatnot: { label: 'Whatnot', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    loupe: { label: 'Loupe', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    youtube: { label: 'YouTube', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    twitch: { label: 'Twitch', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    ebay_live: { label: 'eBay Live', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    fanatics_live: { label: 'Fanatics Live', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    drip: { label: 'Drip', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    steel_city: { label: 'Steel City', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  };
  return map[platform];
}

export function getFormatConfig(format: BreakFormat): { label: string; text: string; bg: string; border: string } {
  const map: Record<BreakFormat, { label: string; text: string; bg: string; border: string }> = {
    random_team: { label: 'Random Team', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    pick_your_team: { label: 'PYT', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    personal: { label: 'Personal', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    hit_draft: { label: 'Hit Draft', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    half_case: { label: 'Half Case', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    full_case: { label: 'Full Case', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    mixer: { label: 'Mixer', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  };
  return map[format];
}

export function getStatusConfig(status: BreakStatus): { label: string; text: string; bg: string; border: string } {
  const map: Record<BreakStatus, { label: string; text: string; bg: string; border: string }> = {
    live: { label: 'LIVE', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    upcoming: { label: 'UPCOMING', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    filling: { label: 'FILLING', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    completed: { label: 'COMPLETED', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  };
  return map[status];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
