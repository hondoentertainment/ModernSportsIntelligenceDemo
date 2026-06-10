// Phase 132: Real-Time Comparable Sales Forensics
// Statistical analysis of comparable sales with outlier detection, seller reputation, and fair market value estimation

import { store } from '../dal/syncStore';

// ---- Types ----

export type Platform = 'ebay' | 'goldin' | 'pwcc' | 'heritage' | 'myslabs' | 'comc';
export type SellerType = 'dealer' | 'collector' | 'flipper' | 'estate' | 'auction_house';
export type OutlierFlag = 'shill_bid' | 'damaged_return' | 'best_offer' | 'misgraded' | 'price_manipulation';
export type Condition = 'gem_mint' | 'mint' | 'nm_mt' | 'near_mint' | 'excellent' | 'very_good' | 'good' | 'raw';

export interface CompSale {
  id: string;
  cardId: string;
  cardName: string;
  date: string;
  price: number;
  platform: Platform;
  seller_type: SellerType;
  condition_notes: string;
  grade: string;
  is_outlier: boolean;
  outlier_reason: OutlierFlag | null;
  listingUrl?: string;
}

export interface CompAnalysis {
  cardId: string;
  cardName: string;
  mean: number;
  median: number;
  std_dev: number;
  confidence_interval: [number, number];
  sample_size: number;
  fair_market_value: number;
  fmv_confidence: number;
  min_price: number;
  max_price: number;
  iqr: number;
  outlier_count: number;
  trend_direction: 'up' | 'down' | 'stable';
  trend_percent: number;
  last_updated: string;
}

export interface PriceCluster {
  range_low: number;
  range_high: number;
  count: number;
  avg_price: number;
  platforms: Platform[];
  label: string;
}

export interface SellerReputation {
  sellerId: string;
  sellerName: string;
  platform: Platform;
  seller_type: SellerType;
  totalSales: number;
  avgPriceVsFmv: number;
  returnRate: number;
  positiveRating: number;
  suspiciousActivity: number;
  trustScore: number;
  lastActive: string;
}

export interface ForensicReport {
  cardId: string;
  cardName: string;
  analysis: CompAnalysis;
  outliers: CompSale[];
  clusters: PriceCluster[];
  platformComparison: { platform: Platform; avgPrice: number; saleCount: number; premiumPercent: number }[];
  sellerBreakdown: { seller_type: SellerType; avgPrice: number; count: number }[];
  recommendation: string;
  riskFactors: string[];
  generatedAt: string;
}

export interface CardEntry {
  id: string;
  name: string;
  grade: string;
  sport: string;
  year: number;
  compCount: number;
  fmv: number;
  fmvConfidence: number;
  lastCompDate: string;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_comp_forensics';

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Mock Data: Cards ----

const TRACKED_CARDS: CardEntry[] = [
  { id: 'card_001', name: '2003 Topps Chrome LeBron James RC #111 PSA 10', grade: 'PSA 10', sport: 'Basketball', year: 2003, compCount: 8, fmv: 42500, fmvConfidence: 92, lastCompDate: '2026-03-12' },
  { id: 'card_002', name: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', grade: 'BGS 9.5', sport: 'Basketball', year: 1986, compCount: 6, fmv: 78000, fmvConfidence: 88, lastCompDate: '2026-03-11' },
  { id: 'card_003', name: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', grade: 'PSA 10', sport: 'Basketball', year: 2018, compCount: 12, fmv: 4800, fmvConfidence: 95, lastCompDate: '2026-03-13' },
  { id: 'card_004', name: '1952 Topps Mickey Mantle #311 PSA 6', grade: 'PSA 6', sport: 'Baseball', year: 1952, compCount: 4, fmv: 535000, fmvConfidence: 78, lastCompDate: '2026-03-08' },
  { id: 'card_005', name: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', grade: 'PSA 10', sport: 'Football', year: 2020, compCount: 15, fmv: 3100, fmvConfidence: 96, lastCompDate: '2026-03-13' },
  { id: 'card_006', name: '1993 SP Foil Derek Jeter RC #279 PSA 10', grade: 'PSA 10', sport: 'Baseball', year: 1993, compCount: 5, fmv: 128000, fmvConfidence: 82, lastCompDate: '2026-03-10' },
  { id: 'card_007', name: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', grade: 'BGS 9.5', sport: 'Basketball', year: 2023, compCount: 7, fmv: 32000, fmvConfidence: 85, lastCompDate: '2026-03-12' },
  { id: 'card_008', name: '1979 O-Pee-Chee Wayne Gretzky RC #18 PSA 8', grade: 'PSA 8', sport: 'Hockey', year: 1979, compCount: 5, fmv: 175000, fmvConfidence: 80, lastCompDate: '2026-03-09' },
  { id: 'card_009', name: '2001 SP Authentic Tiger Woods RC Auto /900 BGS 9', grade: 'BGS 9', sport: 'Golf', year: 2001, compCount: 4, fmv: 24000, fmvConfidence: 76, lastCompDate: '2026-03-07' },
  { id: 'card_010', name: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', grade: 'PSA 10', sport: 'Baseball', year: 2022, compCount: 9, fmv: 1850, fmvConfidence: 93, lastCompDate: '2026-03-13' },
];

// ---- Mock Data: Comparable Sales (50+) ----

const COMP_SALES: CompSale[] = [
  // Card 001: LeBron PSA 10
  { id: 'cs_001', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-03-12', price: 43500, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Clean holder, strong eye appeal', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_002', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-03-08', price: 41200, platform: 'pwcc', seller_type: 'dealer', condition_notes: 'Standard holder, slight surface haze on case', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_003', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-03-05', price: 44800, platform: 'heritage', seller_type: 'auction_house', condition_notes: 'Heritage premium auction, pristine holder', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_004', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-02-28', price: 39500, platform: 'ebay', seller_type: 'collector', condition_notes: 'Best Offer accepted, original listing $45K', grade: 'PSA 10', is_outlier: true, outlier_reason: 'best_offer' },
  { id: 'cs_005', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-02-22', price: 62000, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Suspicious bidding pattern: 3 new accounts pushed price up', grade: 'PSA 10', is_outlier: true, outlier_reason: 'shill_bid' },
  { id: 'cs_006', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-02-18', price: 42100, platform: 'myslabs', seller_type: 'dealer', condition_notes: 'Marketplace sale, clean transaction', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_007', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-02-12', price: 40800, platform: 'comc', seller_type: 'dealer', condition_notes: 'COMC vault sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_008', cardId: 'card_001', cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10', date: '2026-02-05', price: 28500, platform: 'ebay', seller_type: 'estate', condition_notes: 'Returned as damaged after sale. Relisted at discount.', grade: 'PSA 10', is_outlier: true, outlier_reason: 'damaged_return' },

  // Card 002: Jordan BGS 9.5
  { id: 'cs_009', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-03-11', price: 79500, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'Sub-grades: 9.5/9/9.5/9.5', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_010', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-03-04', price: 76200, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'All sub-grades 9 or higher', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_011', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-02-25', price: 82000, platform: 'heritage', seller_type: 'auction_house', condition_notes: 'Heritage premium sale. Strong centering.', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_012', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-02-15', price: 74500, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN listing, competitive pricing', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_013', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-02-08', price: 55000, platform: 'ebay', seller_type: 'collector', condition_notes: 'Suspected misgrade. Centering off. Possible BGS 8.5 in 9.5 holder.', grade: 'BGS 9.5', is_outlier: true, outlier_reason: 'misgraded' },
  { id: 'cs_014', cardId: 'card_002', cardName: '1986-87 Fleer Michael Jordan RC #57 BGS 9.5', date: '2026-01-30', price: 77800, platform: 'pwcc', seller_type: 'dealer', condition_notes: 'Standard PWCC weekly auction', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },

  // Card 003: Luka Silver PSA 10
  { id: 'cs_015', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-03-13', price: 4950, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN sale, standard listing', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_016', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-03-11', price: 4700, platform: 'myslabs', seller_type: 'collector', condition_notes: 'Marketplace sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_017', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-03-09', price: 5100, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Weekly auction, strong bidding', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_018', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-03-06', price: 4600, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'PWCC weekly, competitive field', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_019', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-03-03', price: 4850, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Auction ending, clean sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_020', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-28', price: 3200, platform: 'ebay', seller_type: 'collector', condition_notes: 'Best Offer accepted, seller motivated', grade: 'PSA 10', is_outlier: true, outlier_reason: 'best_offer' },
  { id: 'cs_021', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-25', price: 4750, platform: 'comc', seller_type: 'dealer', condition_notes: 'COMC vault', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_022', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-20', price: 4500, platform: 'ebay', seller_type: 'dealer', condition_notes: 'Standard auction', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_023', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-15', price: 8200, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Shill bid pattern: 4 bids from accounts created same week', grade: 'PSA 10', is_outlier: true, outlier_reason: 'shill_bid' },
  { id: 'cs_024', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-10', price: 4650, platform: 'myslabs', seller_type: 'dealer', condition_notes: 'Clean marketplace sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_025', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-02-05', price: 4400, platform: 'ebay', seller_type: 'collector', condition_notes: 'Standard auction sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_026', cardId: 'card_003', cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10', date: '2026-01-30', price: 4550, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'Weekly auction', grade: 'PSA 10', is_outlier: false, outlier_reason: null },

  // Card 005: Burrow Silver PSA 10
  { id: 'cs_027', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-13', price: 3200, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_028', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-12', price: 3050, platform: 'myslabs', seller_type: 'collector', condition_notes: 'Marketplace', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_029', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-10', price: 3100, platform: 'comc', seller_type: 'dealer', condition_notes: 'Vault sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_030', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-08', price: 2950, platform: 'ebay', seller_type: 'collector', condition_notes: 'Auction sale', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_031', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-05', price: 3300, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Weekly auction', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_032', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-03-02', price: 1800, platform: 'ebay', seller_type: 'estate', condition_notes: 'Damaged holder returned. Deep scratch on case.', grade: 'PSA 10', is_outlier: true, outlier_reason: 'damaged_return' },
  { id: 'cs_033', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-02-28', price: 3150, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'PWCC weekly', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_034', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-02-25', price: 5800, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Price manipulation: relisted 3 times with fake sold comparables', grade: 'PSA 10', is_outlier: true, outlier_reason: 'price_manipulation' },
  { id: 'cs_035', cardId: 'card_005', cardName: '2020 Panini Prizm Joe Burrow Silver RC PSA 10', date: '2026-02-20', price: 2900, platform: 'ebay', seller_type: 'dealer', condition_notes: 'Standard BIN', grade: 'PSA 10', is_outlier: false, outlier_reason: null },

  // Card 007: Wembanyama Auto
  { id: 'cs_036', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-03-12', price: 33500, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Clean auto, 4-color patch', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_037', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-03-08', price: 31200, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'Weekly auction, strong bidding', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_038', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-03-03', price: 34800, platform: 'heritage', seller_type: 'auction_house', condition_notes: 'Heritage signature auction premium', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_039', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-02-26', price: 30500, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN listing', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_040', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-02-20', price: 48000, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Shill bid: bidder history shows same 2 accounts bidding on each other listings', grade: 'BGS 9.5', is_outlier: true, outlier_reason: 'shill_bid' },
  { id: 'cs_041', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-02-14', price: 29800, platform: 'myslabs', seller_type: 'collector', condition_notes: 'Marketplace sale', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },
  { id: 'cs_042', cardId: 'card_007', cardName: '2023 Bowman Chrome Victor Wembanyama RC Auto /99', date: '2026-02-08', price: 31800, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Clean weekly auction', grade: 'BGS 9.5', is_outlier: false, outlier_reason: null },

  // Card 010: J-Rod Auto PSA 10
  { id: 'cs_043', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-03-13', price: 1900, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_044', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-03-11', price: 1800, platform: 'myslabs', seller_type: 'collector', condition_notes: 'Marketplace', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_045', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-03-09', price: 1950, platform: 'comc', seller_type: 'dealer', condition_notes: 'COMC vault', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_046', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-03-06', price: 1750, platform: 'ebay', seller_type: 'collector', condition_notes: 'Auction', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_047', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-03-03', price: 2050, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Weekly', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_048', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-02-28', price: 1200, platform: 'ebay', seller_type: 'estate', condition_notes: 'Best Offer, motivated seller', grade: 'PSA 10', is_outlier: true, outlier_reason: 'best_offer' },
  { id: 'cs_049', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-02-22', price: 1850, platform: 'pwcc', seller_type: 'auction_house', condition_notes: 'PWCC weekly', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_050', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-02-18', price: 1780, platform: 'ebay', seller_type: 'dealer', condition_notes: 'BIN listing', grade: 'PSA 10', is_outlier: false, outlier_reason: null },
  { id: 'cs_051', cardId: 'card_010', cardName: '2022 Topps Chrome Julio Rodriguez RC Auto /499 PSA 10', date: '2026-02-12', price: 3600, platform: 'ebay', seller_type: 'flipper', condition_notes: 'Misgraded: holder shows PSA 10 but card has visible surface issues. Likely altered.', grade: 'PSA 10', is_outlier: true, outlier_reason: 'misgraded' },

  // Additional comps for other cards
  { id: 'cs_052', cardId: 'card_004', cardName: '1952 Topps Mickey Mantle #311 PSA 6', date: '2026-03-08', price: 540000, platform: 'heritage', seller_type: 'auction_house', condition_notes: 'Signature auction, strong eye appeal', grade: 'PSA 6', is_outlier: false, outlier_reason: null },
  { id: 'cs_053', cardId: 'card_004', cardName: '1952 Topps Mickey Mantle #311 PSA 6', date: '2026-02-20', price: 525000, platform: 'goldin', seller_type: 'auction_house', condition_notes: 'Clean holder', grade: 'PSA 6', is_outlier: false, outlier_reason: null },
  { id: 'cs_054', cardId: 'card_004', cardName: '1952 Topps Mickey Mantle #311 PSA 6', date: '2026-01-28', price: 560000, platform: 'heritage', seller_type: 'auction_house', condition_notes: 'January signature auction', grade: 'PSA 6', is_outlier: false, outlier_reason: null },
  { id: 'cs_055', cardId: 'card_004', cardName: '1952 Topps Mickey Mantle #311 PSA 6', date: '2026-01-10', price: 515000, platform: 'lelands', seller_type: 'auction_house', condition_notes: 'Lelands winter classic', grade: 'PSA 6', is_outlier: false, outlier_reason: null },
];

const SELLER_REPUTATIONS: SellerReputation[] = [
  { sellerId: 'slr_001', sellerName: 'VintageKingCards', platform: 'ebay', seller_type: 'dealer', totalSales: 2845, avgPriceVsFmv: -2.1, returnRate: 1.2, positiveRating: 99.8, suspiciousActivity: 0, trustScore: 97, lastActive: '2026-03-13' },
  { sellerId: 'slr_002', sellerName: 'CardVaultPremium', platform: 'ebay', seller_type: 'dealer', totalSales: 1520, avgPriceVsFmv: 3.5, returnRate: 2.8, positiveRating: 99.2, suspiciousActivity: 1, trustScore: 88, lastActive: '2026-03-12' },
  { sellerId: 'slr_003', sellerName: 'FlipMaster2024', platform: 'ebay', seller_type: 'flipper', totalSales: 890, avgPriceVsFmv: 12.4, returnRate: 5.2, positiveRating: 97.1, suspiciousActivity: 4, trustScore: 62, lastActive: '2026-03-13' },
  { sellerId: 'slr_004', sellerName: 'Heritage Auctions', platform: 'heritage', seller_type: 'auction_house', totalSales: 45200, avgPriceVsFmv: 5.8, returnRate: 0.3, positiveRating: 99.9, suspiciousActivity: 0, trustScore: 99, lastActive: '2026-03-13' },
  { sellerId: 'slr_005', sellerName: 'Goldin Auctions', platform: 'goldin', seller_type: 'auction_house', totalSales: 28400, avgPriceVsFmv: 4.2, returnRate: 0.5, positiveRating: 99.8, suspiciousActivity: 0, trustScore: 98, lastActive: '2026-03-13' },
  { sellerId: 'slr_006', sellerName: 'PWCC Marketplace', platform: 'pwcc', seller_type: 'auction_house', totalSales: 52100, avgPriceVsFmv: 1.8, returnRate: 0.8, positiveRating: 99.6, suspiciousActivity: 1, trustScore: 96, lastActive: '2026-03-13' },
  { sellerId: 'slr_007', sellerName: 'ShadyDeals99', platform: 'ebay', seller_type: 'flipper', totalSales: 245, avgPriceVsFmv: 22.8, returnRate: 11.5, positiveRating: 94.2, suspiciousActivity: 8, trustScore: 28, lastActive: '2026-03-11' },
  { sellerId: 'slr_008', sellerName: 'EstateFindsLLC', platform: 'ebay', seller_type: 'estate', totalSales: 380, avgPriceVsFmv: -8.5, returnRate: 3.1, positiveRating: 98.4, suspiciousActivity: 0, trustScore: 85, lastActive: '2026-03-09' },
  { sellerId: 'slr_009', sellerName: 'MySlabs Verified', platform: 'myslabs', seller_type: 'dealer', totalSales: 12800, avgPriceVsFmv: 0.5, returnRate: 1.5, positiveRating: 99.4, suspiciousActivity: 0, trustScore: 94, lastActive: '2026-03-13' },
  { sellerId: 'slr_010', sellerName: 'COMC Official', platform: 'comc', seller_type: 'dealer', totalSales: 98500, avgPriceVsFmv: -1.2, returnRate: 0.9, positiveRating: 99.7, suspiciousActivity: 0, trustScore: 95, lastActive: '2026-03-13' },
];

// ---- Statistical Helpers ----

function calcMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function calcMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calcIQR(values: number[]): { q1: number; q3: number; iqr: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.length % 2 !== 0 ? sorted.slice(mid + 1) : sorted.slice(mid);
  const q1 = calcMedian(lower);
  const q3 = calcMedian(upper);
  return { q1, q3, iqr: q3 - q1 };
}

// ---- Public API ----

export function getTrackedCards(): CardEntry[] {
  const cached = loadData<CardEntry[]>('tracked_cards');
  if (cached && cached.length > 0) return cached;
  saveData('tracked_cards', TRACKED_CARDS);
  return TRACKED_CARDS;
}

export function getComps(cardId: string, days?: number): CompSale[] {
  let comps = COMP_SALES.filter(c => c.cardId === cardId);
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    comps = comps.filter(c => new Date(c.date) >= cutoff);
  }
  return comps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function analyzeComps(comps: CompSale[]): CompAnalysis {
  const cleanComps = comps.filter(c => !c.is_outlier);
  const prices = cleanComps.map(c => c.price);
  const allPrices = comps.map(c => c.price);

  const mean = Math.round(calcMean(prices));
  const median = Math.round(calcMedian(prices));
  const stdDev = Math.round(calcStdDev(prices, mean));
  const { iqr } = calcIQR(prices);

  const ciMargin = prices.length > 0 ? (1.96 * stdDev) / Math.sqrt(prices.length) : 0;
  const confidenceInterval: [number, number] = [Math.round(mean - ciMargin), Math.round(mean + ciMargin)];

  const fmv = Math.round((mean * 0.4 + median * 0.6));
  const fmvConfidence = Math.min(98, Math.round(60 + (cleanComps.length * 4) - (comps.filter(c => c.is_outlier).length * 5)));

  const sortedByDate = [...cleanComps].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let trendPercent = 0;
  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (sortedByDate.length >= 3) {
    const recent = sortedByDate.slice(-Math.ceil(sortedByDate.length / 2));
    const older = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
    const recentAvg = calcMean(recent.map(c => c.price));
    const olderAvg = calcMean(older.map(c => c.price));
    trendPercent = Math.round(((recentAvg - olderAvg) / olderAvg) * 100 * 10) / 10;
    trendDirection = trendPercent > 2 ? 'up' : trendPercent < -2 ? 'down' : 'stable';
  }

  return {
    cardId: comps[0]?.cardId || '',
    cardName: comps[0]?.cardName || '',
    mean,
    median,
    std_dev: stdDev,
    confidence_interval: confidenceInterval,
    sample_size: comps.length,
    fair_market_value: fmv,
    fmv_confidence: fmvConfidence,
    min_price: Math.min(...allPrices),
    max_price: Math.max(...allPrices),
    iqr: Math.round(iqr),
    outlier_count: comps.filter(c => c.is_outlier).length,
    trend_direction: trendDirection,
    trend_percent: trendPercent,
    last_updated: new Date().toISOString(),
  };
}

export function detectOutliers(comps: CompSale[]): CompSale[] {
  return comps.filter(c => c.is_outlier);
}

export function getSellerReputation(sellerId?: string): SellerReputation[] {
  if (sellerId) {
    return SELLER_REPUTATIONS.filter(s => s.sellerId === sellerId);
  }
  return SELLER_REPUTATIONS.sort((a, b) => b.trustScore - a.trustScore);
}

export function getPriceClusters(comps: CompSale[]): PriceCluster[] {
  const cleanComps = comps.filter(c => !c.is_outlier);
  if (cleanComps.length === 0) return [];

  const prices = cleanComps.map(c => c.price).sort((a, b) => a - b);
  const min = prices[0];
  const max = prices[prices.length - 1];
  const range = max - min;
  const bucketSize = range / 4 || 1;

  const clusters: PriceCluster[] = [];
  for (let i = 0; i < 4; i++) {
    const low = Math.round(min + bucketSize * i);
    const high = Math.round(min + bucketSize * (i + 1));
    const inRange = cleanComps.filter(c => c.price >= low && (i === 3 ? c.price <= high : c.price < high));
    if (inRange.length > 0) {
      clusters.push({
        range_low: low,
        range_high: high,
        count: inRange.length,
        avg_price: Math.round(calcMean(inRange.map(c => c.price))),
        platforms: [...new Set(inRange.map(c => c.platform))],
        label: i === 0 ? 'Value' : i === 1 ? 'Below Avg' : i === 2 ? 'Market Rate' : 'Premium',
      });
    }
  }
  return clusters;
}

export function generateForensicReport(cardId: string): ForensicReport {
  const comps = getComps(cardId);
  const analysis = analyzeComps(comps);
  const outliers = detectOutliers(comps);
  const clusters = getPriceClusters(comps);

  const platformMap: Record<string, { total: number; count: number }> = {};
  comps.filter(c => !c.is_outlier).forEach(c => {
    if (!platformMap[c.platform]) platformMap[c.platform] = { total: 0, count: 0 };
    platformMap[c.platform].total += c.price;
    platformMap[c.platform].count += 1;
  });

  const platformComparison = Object.entries(platformMap).map(([platform, data]) => ({
    platform: platform as Platform,
    avgPrice: Math.round(data.total / data.count),
    saleCount: data.count,
    premiumPercent: Math.round(((data.total / data.count - analysis.fair_market_value) / analysis.fair_market_value) * 100 * 10) / 10,
  }));

  const sellerMap: Record<string, { total: number; count: number }> = {};
  comps.filter(c => !c.is_outlier).forEach(c => {
    if (!sellerMap[c.seller_type]) sellerMap[c.seller_type] = { total: 0, count: 0 };
    sellerMap[c.seller_type].total += c.price;
    sellerMap[c.seller_type].count += 1;
  });

  const sellerBreakdown = Object.entries(sellerMap).map(([type, data]) => ({
    seller_type: type as SellerType,
    avgPrice: Math.round(data.total / data.count),
    count: data.count,
  }));

  const riskFactors: string[] = [];
  if (outliers.length > comps.length * 0.2) riskFactors.push('High outlier ratio suggests market manipulation or data quality issues');
  if (analysis.std_dev > analysis.mean * 0.15) riskFactors.push('High price variance indicates unstable market conditions');
  if (analysis.sample_size < 5) riskFactors.push('Low sample size reduces confidence in FMV estimate');
  if (outliers.some(o => o.outlier_reason === 'shill_bid')) riskFactors.push('Shill bidding detected on this card. Exercise caution with auction prices.');
  if (analysis.trend_direction === 'down') riskFactors.push(`Declining trend: ${Math.abs(analysis.trend_percent)}% decrease in recent comps`);

  let recommendation: string;
  if (analysis.fmv_confidence >= 90) {
    recommendation = `Strong confidence in FMV of ${formatCurrency(analysis.fair_market_value)}. Buy below ${formatCurrency(analysis.confidence_interval[0])} for value. Sell above ${formatCurrency(analysis.confidence_interval[1])} for premium.`;
  } else if (analysis.fmv_confidence >= 75) {
    recommendation = `Moderate confidence in FMV. Recommend waiting for additional comps before committing to large purchases. Target entry below ${formatCurrency(analysis.median)}.`;
  } else {
    recommendation = `Low confidence in FMV due to limited data or high variance. Recommend gathering more comparable sales before making pricing decisions.`;
  }

  return {
    cardId,
    cardName: analysis.cardName,
    analysis,
    outliers,
    clusters,
    platformComparison,
    sellerBreakdown,
    recommendation,
    riskFactors,
    generatedAt: new Date().toISOString(),
  };
}

export function getFairMarketValue(cardId: string): { fmv: number; confidence: number } {
  const comps = getComps(cardId);
  if (comps.length === 0) {
    const card = TRACKED_CARDS.find(c => c.id === cardId);
    return { fmv: card?.fmv || 0, confidence: card?.fmvConfidence || 0 };
  }
  const analysis = analyzeComps(comps);
  return { fmv: analysis.fair_market_value, confidence: analysis.fmv_confidence };
}

export function getConfidenceScore(analysis: CompAnalysis): number {
  return analysis.fmv_confidence;
}

export function getCompTrend(cardId: string, _period?: string): { date: string; price: number; isOutlier: boolean }[] {
  return getComps(cardId).map(c => ({
    date: c.date,
    price: c.price,
    isOutlier: c.is_outlier,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getPlatformPriceComparison(cardId: string): { platform: string; avgPrice: number; count: number }[] {
  const comps = getComps(cardId).filter(c => !c.is_outlier);
  const platformMap: Record<string, { total: number; count: number }> = {};
  comps.forEach(c => {
    if (!platformMap[c.platform]) platformMap[c.platform] = { total: 0, count: 0 };
    platformMap[c.platform].total += c.price;
    platformMap[c.platform].count += 1;
  });
  return Object.entries(platformMap).map(([platform, data]) => ({
    platform,
    avgPrice: Math.round(data.total / data.count),
    count: data.count,
  })).sort((a, b) => b.avgPrice - a.avgPrice);
}

export function getRecentComps(limit?: number): CompSale[] {
  const sorted = [...COMP_SALES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}

// ---- Helpers ----

export function getPlatformConfig(platform: Platform): { label: string; text: string; bg: string; border: string } {
  const map: Record<Platform, { label: string; text: string; bg: string; border: string }> = {
    ebay: { label: 'eBay', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    goldin: { label: 'Goldin', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    pwcc: { label: 'PWCC', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    heritage: { label: 'Heritage', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    myslabs: { label: 'MySlabs', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    comc: { label: 'COMC', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  };
  return map[platform];
}

export function getOutlierConfig(reason: OutlierFlag): { label: string; text: string; bg: string; border: string } {
  const map: Record<OutlierFlag, { label: string; text: string; bg: string; border: string }> = {
    shill_bid: { label: 'Shill Bid', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    damaged_return: { label: 'Damaged/Return', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    best_offer: { label: 'Best Offer', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    misgraded: { label: 'Misgraded', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    price_manipulation: { label: 'Price Manipulation', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  };
  return map[reason];
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}
