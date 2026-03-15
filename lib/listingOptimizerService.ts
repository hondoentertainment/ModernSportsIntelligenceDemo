// ---- Types ----

export type Platform = 'ebay' | 'comc' | 'myslabs' | 'mercari' | 'whatnot' | 'sportslots';

export type PhotoQuality = 'poor' | 'fair' | 'good' | 'excellent' | 'professional';

export interface ListingAnalysis {
  id: string;
  cardName: string;
  platform: Platform;
  titleScore: number;
  photoScore: number;
  descriptionScore: number;
  pricingScore: number;
  seoScore: number;
  overallScore: number;
  suggestedTitle: string;
  suggestedPrice: number;
  currentPrice: number;
  photoQuality: PhotoQuality;
  missingKeywords: string[];
  improvementTips: string[];
  estimatedViews: number;
  estimatedSales: number;
  competitorAvgPrice: number;
  listingDate: string;
}

export interface PhotoTip {
  id: string;
  category: string;
  tip: string;
  impact: 'low' | 'medium' | 'high';
  score: number;
}

export interface PricingRecommendation {
  id: string;
  cardName: string;
  currentPrice: number;
  recommendedPrice: number;
  competitorLow: number;
  competitorHigh: number;
  competitorAvg: number;
  recentSales: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  confidence: number;
}

export interface PlatformDistribution {
  platform: Platform;
  listings: number;
  avgPrice: number;
  sellThroughRate: number;
  avgDaysToSell: number;
}

export interface CompetitorListing {
  id: string;
  seller: string;
  cardName: string;
  platform: Platform;
  price: number;
  photoScore: number;
  titleScore: number;
  watchers: number;
  daysListed: number;
  sold: boolean;
}

export interface TimingRecommendation {
  dayOfWeek: string;
  hour: number;
  score: number;
  avgViews: number;
  avgSales: number;
}

export interface SEOKeyword {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  relevance: number;
  trending: boolean;
}

export interface ListingOptimizerSummary {
  totalListings: number;
  avgScore: number;
  totalEstimatedRevenue: number;
  improvementOpportunities: number;
  topPlatform: string;
  avgPhotoScore: number;
}

export interface ScoreImprovement {
  category: string;
  before: number;
  after: number;
  improvement: number;
}

// ---- Constants ----

export const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string }> = {
  ebay:       { label: 'eBay',       color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  comc:       { label: 'COMC',       color: 'text-green-400',  bg: 'bg-green-500/10' },
  myslabs:    { label: 'MySlabs',    color: 'text-purple-400', bg: 'bg-purple-500/10' },
  mercari:    { label: 'Mercari',    color: 'text-red-400',    bg: 'bg-red-500/10' },
  whatnot:    { label: 'Whatnot',    color: 'text-orange-400', bg: 'bg-orange-500/10' },
  sportslots: { label: 'SportLots',  color: 'text-teal-400',   bg: 'bg-teal-500/10' },
};

export const QUALITY_META: Record<PhotoQuality, { label: string; color: string }> = {
  poor:         { label: 'Poor',         color: 'text-red-400' },
  fair:         { label: 'Fair',         color: 'text-orange-400' },
  good:         { label: 'Good',         color: 'text-amber-400' },
  excellent:    { label: 'Excellent',    color: 'text-green-400' },
  professional: { label: 'Professional', color: 'text-emerald-400' },
};

// ---- Seed Data ----

const SEED_LISTINGS: ListingAnalysis[] = [
  {
    id: 'lst_001', cardName: '2023 Topps Chrome Elly De La Cruz RC PSA 10', platform: 'ebay',
    titleScore: 82, photoScore: 74, descriptionScore: 68, pricingScore: 78, seoScore: 71, overallScore: 75,
    suggestedTitle: '2023 Topps Chrome #88 Elly De La Cruz RC Rookie PSA 10 Gem Mint Reds', suggestedPrice: 145,
    currentPrice: 130, photoQuality: 'good', missingKeywords: ['Rookie', 'Gem Mint', 'Reds'],
    improvementTips: ['Add "Rookie" to title', 'Include team name', 'Add grade descriptor'], estimatedViews: 340,
    estimatedSales: 12, competitorAvgPrice: 142, listingDate: '2026-03-01',
  },
  {
    id: 'lst_002', cardName: '2018 Panini Prizm Luka Doncic Silver RC BGS 9.5', platform: 'ebay',
    titleScore: 90, photoScore: 88, descriptionScore: 85, pricingScore: 72, seoScore: 86, overallScore: 84,
    suggestedTitle: '2018 Panini Prizm Silver #280 Luka Doncic RC Rookie BGS 9.5 Gem Mint Mavs', suggestedPrice: 3200,
    currentPrice: 2900, photoQuality: 'excellent', missingKeywords: ['Gem Mint'],
    improvementTips: ['Slight price increase justified by recent comps', 'Add grade descriptor'], estimatedViews: 890,
    estimatedSales: 3, competitorAvgPrice: 3150, listingDate: '2026-02-15',
  },
  {
    id: 'lst_003', cardName: '2020 Topps Update Luis Robert RC', platform: 'mercari',
    titleScore: 55, photoScore: 42, descriptionScore: 40, pricingScore: 65, seoScore: 48, overallScore: 50,
    suggestedTitle: '2020 Topps Update #U-58 Luis Robert RC Rookie White Sox Base', suggestedPrice: 18,
    currentPrice: 22, photoQuality: 'fair', missingKeywords: ['Update', 'U-58', 'White Sox', 'Base', 'Rookie'],
    improvementTips: ['Better photos needed', 'Add card number', 'Include team name', 'Lower price to match comps'],
    estimatedViews: 45, estimatedSales: 2, competitorAvgPrice: 16, listingDate: '2026-03-10',
  },
  {
    id: 'lst_004', cardName: '2019 Topps Heritage Yordan Alvarez RC', platform: 'comc',
    titleScore: 78, photoScore: 90, descriptionScore: 72, pricingScore: 80, seoScore: 68, overallScore: 77,
    suggestedTitle: '2019 Topps Heritage #509 Yordan Alvarez RC Rookie SP Astros', suggestedPrice: 85,
    currentPrice: 78, photoQuality: 'professional', missingKeywords: ['SP', 'Astros'],
    improvementTips: ['Mention Short Print status', 'Add team name'], estimatedViews: 210,
    estimatedSales: 6, competitorAvgPrice: 82, listingDate: '2026-02-28',
  },
  {
    id: 'lst_005', cardName: '2023 Bowman Chrome Victor Wembanyama', platform: 'whatnot',
    titleScore: 70, photoScore: 60, descriptionScore: 55, pricingScore: 68, seoScore: 62, overallScore: 63,
    suggestedTitle: '2023 Bowman Chrome #WC-1 Victor Wembanyama RC Rookie Spurs 1st Chrome', suggestedPrice: 250,
    currentPrice: 275, photoQuality: 'good', missingKeywords: ['1st Chrome', 'Spurs', 'WC-1'],
    improvementTips: ['Reduce price to market level', 'Highlight 1st Chrome status', 'Improve photo lighting'],
    estimatedViews: 560, estimatedSales: 4, competitorAvgPrice: 245, listingDate: '2026-03-05',
  },
  {
    id: 'lst_006', cardName: '1986 Fleer Michael Jordan RC PSA 7', platform: 'ebay',
    titleScore: 92, photoScore: 95, descriptionScore: 88, pricingScore: 85, seoScore: 90, overallScore: 90,
    suggestedTitle: '1986-87 Fleer #57 Michael Jordan RC Rookie PSA 7 NM Bulls HOF GOAT', suggestedPrice: 28000,
    currentPrice: 27500, photoQuality: 'professional', missingKeywords: ['HOF'],
    improvementTips: ['Nearly perfect listing', 'Could add HOF keyword'], estimatedViews: 2200,
    estimatedSales: 1, competitorAvgPrice: 27800, listingDate: '2026-01-20',
  },
  {
    id: 'lst_007', cardName: '2024 Topps Series 1 Jackson Holliday RC', platform: 'sportslots',
    titleScore: 60, photoScore: 50, descriptionScore: 45, pricingScore: 70, seoScore: 52, overallScore: 55,
    suggestedTitle: '2024 Topps Series 1 #100 Jackson Holliday RC Rookie Orioles Base', suggestedPrice: 12,
    currentPrice: 15, photoQuality: 'fair', missingKeywords: ['Series 1', '#100', 'Orioles', 'Base'],
    improvementTips: ['Retake photos with better lighting', 'Add card number', 'Reduce price'], estimatedViews: 80,
    estimatedSales: 5, competitorAvgPrice: 11, listingDate: '2026-03-12',
  },
  {
    id: 'lst_008', cardName: '2022 Panini Prizm Ja Morant Silver', platform: 'myslabs',
    titleScore: 75, photoScore: 82, descriptionScore: 70, pricingScore: 76, seoScore: 73, overallScore: 75,
    suggestedTitle: '2022-23 Panini Prizm Silver #146 Ja Morant Grizzlies All-Star', suggestedPrice: 45,
    currentPrice: 42, photoQuality: 'excellent', missingKeywords: ['All-Star', 'Grizzlies'],
    improvementTips: ['Add player accolades', 'Include team name'], estimatedViews: 175,
    estimatedSales: 8, competitorAvgPrice: 44, listingDate: '2026-03-08',
  },
];

const SEED_PHOTO_TIPS: PhotoTip[] = [
  { id: 'pt_1', category: 'Lighting', tip: 'Use diffused natural light or a lightbox to eliminate glare on slabbed cards', impact: 'high', score: 95 },
  { id: 'pt_2', category: 'Background', tip: 'Use a solid dark background (black felt) to make the card stand out', impact: 'high', score: 90 },
  { id: 'pt_3', category: 'Angles', tip: 'Photograph front, back, and a 45-degree angle shot showing surface condition', impact: 'medium', score: 78 },
  { id: 'pt_4', category: 'Focus', tip: 'Use macro mode or a tripod to ensure the card text is sharply in focus', impact: 'high', score: 92 },
  { id: 'pt_5', category: 'Edges', tip: 'Include close-up shots of all four corners for graded card potential buyers', impact: 'medium', score: 75 },
  { id: 'pt_6', category: 'Color', tip: 'Avoid fluorescent lighting which can distort card colors and make parallels look off', impact: 'medium', score: 72 },
  { id: 'pt_7', category: 'Composition', tip: 'Center the card in frame with minimal cropping — show the full card with slight border', impact: 'low', score: 65 },
  { id: 'pt_8', category: 'Resolution', tip: 'Use at least 12MP resolution so buyers can zoom in on details', impact: 'high', score: 88 },
];

const SEED_PRICING: PricingRecommendation[] = [
  { id: 'pr_1', cardName: '2023 Topps Chrome Elly De La Cruz RC PSA 10', currentPrice: 130, recommendedPrice: 145, competitorLow: 120, competitorHigh: 175, competitorAvg: 142, recentSales: 28, demandLevel: 'very_high', confidence: 88 },
  { id: 'pr_2', cardName: '2018 Panini Prizm Luka Doncic Silver RC BGS 9.5', currentPrice: 2900, recommendedPrice: 3200, competitorLow: 2800, competitorHigh: 3800, competitorAvg: 3150, recentSales: 5, demandLevel: 'high', confidence: 82 },
  { id: 'pr_3', cardName: '2020 Topps Update Luis Robert RC', currentPrice: 22, recommendedPrice: 16, competitorLow: 12, competitorHigh: 25, competitorAvg: 16, recentSales: 45, demandLevel: 'medium', confidence: 90 },
  { id: 'pr_4', cardName: '2023 Bowman Chrome Victor Wembanyama', currentPrice: 275, recommendedPrice: 245, competitorLow: 220, competitorHigh: 300, competitorAvg: 245, recentSales: 18, demandLevel: 'very_high', confidence: 85 },
  { id: 'pr_5', cardName: '1986 Fleer Michael Jordan RC PSA 7', currentPrice: 27500, recommendedPrice: 28000, competitorLow: 25000, competitorHigh: 32000, competitorAvg: 27800, recentSales: 3, demandLevel: 'high', confidence: 78 },
  { id: 'pr_6', cardName: '2024 Topps Series 1 Jackson Holliday RC', currentPrice: 15, recommendedPrice: 11, competitorLow: 8, competitorHigh: 18, competitorAvg: 11, recentSales: 60, demandLevel: 'medium', confidence: 92 },
];

const SEED_PLATFORM_DIST: PlatformDistribution[] = [
  { platform: 'ebay', listings: 3, avgPrice: 10210, sellThroughRate: 72, avgDaysToSell: 8 },
  { platform: 'comc', listings: 1, avgPrice: 78, sellThroughRate: 85, avgDaysToSell: 14 },
  { platform: 'myslabs', listings: 1, avgPrice: 42, sellThroughRate: 68, avgDaysToSell: 12 },
  { platform: 'mercari', listings: 1, avgPrice: 22, sellThroughRate: 55, avgDaysToSell: 18 },
  { platform: 'whatnot', listings: 1, avgPrice: 275, sellThroughRate: 78, avgDaysToSell: 3 },
  { platform: 'sportslots', listings: 1, avgPrice: 15, sellThroughRate: 60, avgDaysToSell: 21 },
];

const SEED_COMPETITORS: CompetitorListing[] = [
  { id: 'cl_1', seller: 'CardKing2024', cardName: '2023 Topps Chrome Elly De La Cruz RC PSA 10', platform: 'ebay', price: 148, photoScore: 88, titleScore: 90, watchers: 24, daysListed: 3, sold: false },
  { id: 'cl_2', seller: 'SlabMaster', cardName: '2023 Topps Chrome Elly De La Cruz RC PSA 10', platform: 'ebay', price: 139, photoScore: 72, titleScore: 78, watchers: 18, daysListed: 7, sold: false },
  { id: 'cl_3', seller: 'GrailHunter', cardName: '2018 Panini Prizm Luka Doncic Silver RC BGS 9.5', platform: 'ebay', price: 3150, photoScore: 95, titleScore: 92, watchers: 45, daysListed: 2, sold: false },
  { id: 'cl_4', seller: 'RookieInvestor', cardName: '2023 Bowman Chrome Victor Wembanyama', platform: 'whatnot', price: 240, photoScore: 65, titleScore: 70, watchers: 32, daysListed: 1, sold: false },
  { id: 'cl_5', seller: 'VintageVault', cardName: '1986 Fleer Michael Jordan RC PSA 7', platform: 'ebay', price: 27800, photoScore: 92, titleScore: 95, watchers: 89, daysListed: 5, sold: false },
  { id: 'cl_6', seller: 'BreakCity', cardName: '2024 Topps Series 1 Jackson Holliday RC', platform: 'mercari', price: 10, photoScore: 55, titleScore: 60, watchers: 5, daysListed: 14, sold: true },
];

const SEED_TIMING: TimingRecommendation[] = [
  { dayOfWeek: 'Sunday', hour: 20, score: 95, avgViews: 450, avgSales: 18 },
  { dayOfWeek: 'Monday', hour: 19, score: 72, avgViews: 310, avgSales: 10 },
  { dayOfWeek: 'Tuesday', hour: 20, score: 68, avgViews: 280, avgSales: 8 },
  { dayOfWeek: 'Wednesday', hour: 19, score: 70, avgViews: 290, avgSales: 9 },
  { dayOfWeek: 'Thursday', hour: 20, score: 78, avgViews: 340, avgSales: 12 },
  { dayOfWeek: 'Friday', hour: 18, score: 82, avgViews: 380, avgSales: 14 },
  { dayOfWeek: 'Saturday', hour: 21, score: 90, avgViews: 420, avgSales: 16 },
];

const SEED_KEYWORDS: SEOKeyword[] = [
  { keyword: 'PSA 10', searchVolume: 18500, competition: 'high', relevance: 95, trending: false },
  { keyword: 'Rookie Card', searchVolume: 14200, competition: 'high', relevance: 90, trending: false },
  { keyword: 'RC', searchVolume: 12800, competition: 'medium', relevance: 88, trending: false },
  { keyword: 'Gem Mint', searchVolume: 8400, competition: 'medium', relevance: 82, trending: false },
  { keyword: '1st Bowman Chrome', searchVolume: 6200, competition: 'low', relevance: 78, trending: true },
  { keyword: 'Prizm Silver', searchVolume: 9100, competition: 'high', relevance: 85, trending: true },
  { keyword: 'Short Print SP', searchVolume: 5300, competition: 'low', relevance: 72, trending: false },
  { keyword: 'Numbered /25', searchVolume: 3800, competition: 'low', relevance: 70, trending: false },
  { keyword: 'Auto Autograph', searchVolume: 11000, competition: 'high', relevance: 88, trending: false },
  { keyword: 'Refractor', searchVolume: 7600, competition: 'medium', relevance: 80, trending: true },
];

// ---- Public API ----

export function getListingAnalyses(): ListingAnalysis[] {
  return [...SEED_LISTINGS];
}

export function getPhotoTips(): PhotoTip[] {
  return [...SEED_PHOTO_TIPS];
}

export function getPricingRecommendations(): PricingRecommendation[] {
  return [...SEED_PRICING];
}

export function getPlatformDistribution(): PlatformDistribution[] {
  return [...SEED_PLATFORM_DIST];
}

export function getCompetitorListings(): CompetitorListing[] {
  return [...SEED_COMPETITORS];
}

export function getTimingRecommendations(): TimingRecommendation[] {
  return [...SEED_TIMING];
}

export function getSEOKeywords(): SEOKeyword[] {
  return [...SEED_KEYWORDS];
}

export function getScoreImprovements(): ScoreImprovement[] {
  return [
    { category: 'Title', before: 68, after: 88, improvement: 20 },
    { category: 'Photos', before: 55, after: 82, improvement: 27 },
    { category: 'Description', before: 60, after: 80, improvement: 20 },
    { category: 'Pricing', before: 72, after: 85, improvement: 13 },
    { category: 'SEO', before: 50, after: 78, improvement: 28 },
    { category: 'Overall', before: 61, after: 83, improvement: 22 },
  ];
}

export function getOptimizerSummary(): ListingOptimizerSummary {
  const listings = getListingAnalyses();
  const avgScore = listings.reduce((s, l) => s + l.overallScore, 0) / listings.length;
  const totalRev = listings.reduce((s, l) => s + l.suggestedPrice * l.estimatedSales, 0);
  const improvements = listings.filter(l => l.overallScore < 80).length;
  const avgPhoto = listings.reduce((s, l) => s + l.photoScore, 0) / listings.length;

  return {
    totalListings: listings.length,
    avgScore: Math.round(avgScore * 10) / 10,
    totalEstimatedRevenue: totalRev,
    improvementOpportunities: improvements,
    topPlatform: 'eBay',
    avgPhotoScore: Math.round(avgPhoto * 10) / 10,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return '$' + value.toFixed(2);
}
