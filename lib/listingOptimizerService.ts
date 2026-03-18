// Phase 154: Card Photography & Listing Optimizer
// AI-powered listing analysis, photo scoring, title optimization, pricing recommendations, and competitor analysis

import { store } from './dal/syncStore';

// ---- Types ----

export type Platform = 'ebay' | 'mercari' | 'comc' | 'myslabs' | 'facebook' | 'instagram' | 'whatnot' | 'pwcc';

export interface ListingAnalysis {
  id: string;
  cardName: string;
  player: string;
  platform: Platform;
  currentTitle: string;
  suggestedTitle: string;
  currentPrice: number;
  suggestedPrice: number;
  photoScore: number;
  titleScore: number;
  descriptionScore: number;
  pricingScore: number;
  seoScore: number;
  overallScore: number;
  issues: string[];
  improvements: string[];
  estimatedViewIncrease: number;
  estimatedSaleSpeedIncrease: number;
  estimatedSales: number;
  estimatedViews: number;
  analyzedDate: string;
  listingDate: string;
  photoQuality: 'poor' | 'fair' | 'good' | 'excellent';
  improvementTips: string[];
  missingKeywords: string[];
}

export interface PhotoScore {
  id: string;
  listingId: string;
  overallScore: number;
  lighting: number;
  focus: number;
  background: number;
  angle: number;
  centering: number;
  colorAccuracy: number;
  resolution: number;
  recommendations: string[];
  photoCount: number;
  idealPhotoCount: number;
}

export interface TitleSuggestion {
  id: string;
  listingId: string;
  originalTitle: string;
  suggestedTitle: string;
  score: number;
  keywordsAdded: string[];
  keywordsRemoved: string[];
  characterCount: number;
  maxCharacters: number;
  reasoning: string;
  estimatedCTRIncrease: number;
  platform: Platform;
}

export interface PricingRecommendation {
  id: string;
  listingId: string;
  cardName: string;
  currentPrice: number;
  suggestedPrice: number;
  recommendedPrice: number;
  competitorLow: number;
  competitorAvg: number;
  competitorHigh: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  minPrice: number;
  maxPrice: number;
  marketAverage: number;
  recentSales: number[];
  confidence: number;
  strategy: 'competitive' | 'market_value' | 'premium' | 'quick_sale' | 'auction_start';
  reasoning: string;
}

export interface CompetitorListing {
  id: string;
  cardName: string;
  platform: Platform;
  seller: string;
  sellerName: string;
  sellerRating: number;
  price: number;
  shippingCost: number;
  totalPrice: number;
  photoCount: number;
  photoQuality: 'poor' | 'fair' | 'good' | 'excellent';
  photoScore: number;
  titleQuality: number;
  daysListed: number;
  watchers: number;
  bestOffer: boolean;
  freeShipping: boolean;
  sold: boolean;
}

export interface ListingTemplate {
  id: string;
  name: string;
  platform: Platform;
  titleFormat: string;
  descriptionTemplate: string;
  recommendedPhotos: number;
  pricingStrategy: string;
  tags: string[];
  category: string;
}

export interface OptimizationScore {
  overall: number;
  title: number;
  photos: number;
  pricing: number;
  description: number;
  shipping: number;
  timing: number;
  competitiveness: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
}

export interface SEOKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  relevanceScore: number;
  relevance: number;
  trending: boolean;
  category: string;
  platform: Platform;
  ctrImpact: number;
}

export interface TimingRecommendation {
  id: string;
  platform: Platform;
  dayOfWeek: string;
  hour: number;
  score: number;
  avgViews: number;
  avgSales: number;
  bestDayOfWeek: string;
  bestTimeOfDay: string;
  worstDayOfWeek: string;
  worstTimeOfDay: string;
  peakSeason: string;
  offSeason: string;
  currentDemand: 'low' | 'moderate' | 'high' | 'very_high';
  reasoning: string;
}

export interface ListingHistory {
  id: string;
  cardName: string;
  platform: Platform;
  listDate: string;
  saleDate: string | null;
  listPrice: number;
  salePrice: number | null;
  views: number;
  watchers: number;
  offers: number;
  daysToSell: number | null;
  optimized: boolean;
}

export interface ABTestResult {
  id: string;
  testName: string;
  variantA: string;
  variantB: string;
  variantAViews: number;
  variantBViews: number;
  variantASales: number;
  variantBSales: number;
  variantACTR: number;
  variantBCTR: number;
  winner: 'A' | 'B' | 'inconclusive';
  confidence: number;
  testDuration: number;
  category: string;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_listing_optimizer';

function loadData<T>(key: string): T | null {
  return store.has(`${STORAGE_KEY}_${key}`) ? store.get<T>(`${STORAGE_KEY}_${key}`, null as unknown as T) : null;
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getPlatformConfig(platform: Platform): { label: string; text: string; bg: string; border: string } {
  switch (platform) {
    case 'ebay': return { label: 'eBay', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'mercari': return { label: 'Mercari', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'comc': return { label: 'COMC', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'myslabs': return { label: 'MySlabs', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'facebook': return { label: 'Facebook', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    case 'instagram': return { label: 'Instagram', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' };
    case 'whatnot': return { label: 'Whatnot', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'pwcc': return { label: 'PWCC', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
  }
}

export function getScoreGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ---- Mock Data: Listing Analyses (25) ----

const MOCK_ANALYSES: ListingAnalysis[] = [
  { id: 'la-1', cardName: '2023 Prizm Victor Wembanyama RC #260 PSA 10', player: 'Victor Wembanyama', platform: 'ebay', currentTitle: 'Wembanyama Prizm RC PSA 10 Gem Mint', suggestedTitle: '2023-24 Panini Prizm Victor Wembanyama RC #260 PSA 10 Gem Mint ROTY', currentPrice: 1750, suggestedPrice: 1825, photoScore: 72, titleScore: 58, descriptionScore: 65, overallScore: 65, issues: ['Title missing year and card number', 'Only 3 photos provided', 'No mention of ROTY in title', 'Background is cluttered'], improvements: ['Add year and card number to title', 'Include 8-12 photos with front/back/edge shots', 'Add ROTY keyword for search visibility', 'Use clean black or white background'], estimatedViewIncrease: 45, estimatedSaleSpeedIncrease: 35, analyzedDate: '2026-03-14' },
  { id: 'la-2', cardName: '1986 Fleer Michael Jordan RC #57 PSA 8', player: 'Michael Jordan', platform: 'ebay', currentTitle: '1986-87 Fleer Michael Jordan Rookie Card #57 PSA 8 NM-MT Basketball HOF GOAT', suggestedTitle: '1986-87 Fleer Michael Jordan RC #57 PSA 8 NM-MT Rookie Card HOF GOAT', currentPrice: 18500, suggestedPrice: 18200, photoScore: 92, titleScore: 88, descriptionScore: 90, overallScore: 90, issues: ['Slightly overpriced vs recent comps', 'Title could be more concise'], improvements: ['Adjust price to match recent PSA 8 sales', 'Lead with RC abbreviation for better search matching'], estimatedViewIncrease: 8, estimatedSaleSpeedIncrease: 15, analyzedDate: '2026-03-12' },
  { id: 'la-3', cardName: '2018 Prizm Luka Doncic RC #280 PSA 10', player: 'Luka Doncic', platform: 'mercari', currentTitle: 'Luka Doncic rookie card psa 10', suggestedTitle: '2018-19 Panini Prizm Luka Doncic RC #280 PSA 10 Gem Mint Mavericks', currentPrice: 3400, suggestedPrice: 3200, photoScore: 55, titleScore: 32, descriptionScore: 40, overallScore: 42, issues: ['Title missing year, set, and card number', 'No capitalization in title', 'Single blurry photo', 'No description provided', 'Price above market average'], improvements: ['Rewrite title with full card details', 'Use proper capitalization', 'Take 5+ clear photos with good lighting', 'Write detailed description with card specifics', 'Lower price to competitive range'], estimatedViewIncrease: 120, estimatedSaleSpeedIncrease: 85, analyzedDate: '2026-03-13' },
  { id: 'la-4', cardName: '2020 Prizm Justin Herbert RC #325 PSA 10', player: 'Justin Herbert', platform: 'ebay', currentTitle: '2020 Panini Prizm Justin Herbert RC #325 PSA 10 Base Chargers QB', suggestedTitle: '2020 Panini Prizm Justin Herbert RC #325 PSA 10 Gem Mint Chargers Rookie', currentPrice: 880, suggestedPrice: 825, photoScore: 78, titleScore: 75, descriptionScore: 70, overallScore: 74, issues: ['Missing Gem Mint designation', 'Price slightly high', 'Background inconsistent across photos'], improvements: ['Add Gem Mint to title', 'Adjust price to match recent sales', 'Use consistent background'], estimatedViewIncrease: 18, estimatedSaleSpeedIncrease: 22, analyzedDate: '2026-03-10' },
  { id: 'la-5', cardName: '2003 Topps Chrome LeBron James RC #111 BGS 9.5', player: 'LeBron James', platform: 'pwcc', currentTitle: '2003-04 Topps Chrome LeBron James RC #111 BGS 9.5 Gem Mint', suggestedTitle: '2003-04 Topps Chrome LeBron James RC #111 BGS 9.5 Gem Mint TRUE GEM', currentPrice: 22000, suggestedPrice: 23500, photoScore: 95, titleScore: 85, descriptionScore: 92, overallScore: 91, issues: ['Could mention subgrades if all 9.5+', 'Slightly underpriced for BGS 9.5'], improvements: ['Add TRUE GEM if applicable', 'Increase price to match premium BGS 9.5 market'], estimatedViewIncrease: 5, estimatedSaleSpeedIncrease: 8, analyzedDate: '2026-03-11' },
  { id: 'la-6', cardName: '2017 Prizm Patrick Mahomes RC #269 PSA 10', player: 'Patrick Mahomes', platform: 'ebay', currentTitle: 'Patrick Mahomes 2017 Prizm Rookie PSA 10', suggestedTitle: '2017 Panini Prizm Patrick Mahomes II RC #269 PSA 10 Gem Mint Chiefs MVP', currentPrice: 4500, suggestedPrice: 4200, photoScore: 68, titleScore: 52, descriptionScore: 60, overallScore: 60, issues: ['Title missing card number and Panini', 'No MVP/Super Bowl keywords', 'Photos have yellow tint from bad lighting', 'Only 4 photos'], improvements: ['Include full set name and card number', 'Add MVP and championship keywords', 'Reshoot with neutral white lighting', 'Add more angle shots'], estimatedViewIncrease: 55, estimatedSaleSpeedIncrease: 40, analyzedDate: '2026-03-09' },
  { id: 'la-7', cardName: '2022 Bowman Chrome Elly De La Cruz 1st BCP-150', player: 'Elly De La Cruz', platform: 'mercari', currentTitle: 'Elly De La Cruz Bowman Chrome 1st Prospect', suggestedTitle: '2022 Bowman Chrome Elly De La Cruz 1st Bowman #BCP-150 Reds Prospect RC', currentPrice: 310, suggestedPrice: 280, photoScore: 62, titleScore: 45, descriptionScore: 48, overallScore: 52, issues: ['Missing year and card number', 'No team name', 'Photo taken on carpet', 'Price too high for raw card'], improvements: ['Add year, number, and team', 'Use proper photo surface', 'Price competitively for raw copies'], estimatedViewIncrease: 65, estimatedSaleSpeedIncrease: 50, analyzedDate: '2026-03-08' },
  { id: 'la-8', cardName: '2024 Prizm Caitlin Clark RC #100 PSA 10', player: 'Caitlin Clark', platform: 'ebay', currentTitle: '2024 Panini Prizm Caitlin Clark RC #100 PSA 10 Gem Mint WNBA Fever ROTY', suggestedTitle: '2024 Panini Prizm Caitlin Clark RC #100 PSA 10 Gem Mint WNBA ROTY Indiana Fever', currentPrice: 145, suggestedPrice: 150, photoScore: 88, titleScore: 90, descriptionScore: 85, overallScore: 88, issues: ['Could be priced slightly higher given demand', 'Description could mention record-breaking stats'], improvements: ['Increase price to capture WNBA momentum', 'Add stat highlights to description'], estimatedViewIncrease: 5, estimatedSaleSpeedIncrease: 3, analyzedDate: '2026-03-14' },
  { id: 'la-9', cardName: '1952 Topps Mickey Mantle #311 PSA 2', player: 'Mickey Mantle', platform: 'pwcc', currentTitle: '1952 Topps Mickey Mantle #311 PSA 2 Good — The Holy Grail', suggestedTitle: '1952 Topps Mickey Mantle #311 PSA 2 Good Vintage HOF Yankees', currentPrice: 68000, suggestedPrice: 72000, photoScore: 90, titleScore: 78, descriptionScore: 88, overallScore: 85, issues: ['Subjective language in title (Holy Grail)', 'Underpriced based on recent sales'], improvements: ['Use objective keywords instead of subjective claims', 'Increase price to match market'], estimatedViewIncrease: 10, estimatedSaleSpeedIncrease: 12, analyzedDate: '2026-03-07' },
  { id: 'la-10', cardName: '2023 Topps Chrome Corbin Carroll RC Auto', player: 'Corbin Carroll', platform: 'ebay', currentTitle: 'corbin Carroll topps chrome auto rookie 2023', suggestedTitle: '2023 Topps Chrome Corbin Carroll RC Auto #RA-CC Diamondbacks ROY', currentPrice: 55, suggestedPrice: 42, photoScore: 40, titleScore: 25, descriptionScore: 30, overallScore: 32, issues: ['No capitalization', 'Missing card number and team', 'Dark, blurry photos', 'Overpriced for current market', 'No item specifics filled out'], improvements: ['Capitalize properly', 'Include card number and ROY keyword', 'Reshoot with proper lighting and focus', 'Price competitively — card has depreciated', 'Fill out all item specifics'], estimatedViewIncrease: 150, estimatedSaleSpeedIncrease: 100, analyzedDate: '2026-03-06' },
  { id: 'la-11', cardName: '2018 Prizm SGA RC #184 PSA 10', player: 'Shai Gilgeous-Alexander', platform: 'ebay', currentTitle: '2018-19 Prizm Shai Gilgeous-Alexander RC PSA 10', suggestedTitle: '2018-19 Panini Prizm Shai Gilgeous-Alexander RC #184 PSA 10 Gem Mint MVP', currentPrice: 920, suggestedPrice: 950, photoScore: 80, titleScore: 68, descriptionScore: 72, overallScore: 73, issues: ['Missing card number', 'No MVP candidate mention', 'Missing Panini in set name'], improvements: ['Add card number and Panini to title', 'Include MVP keyword while current', 'Slightly increase price to capture momentum'], estimatedViewIncrease: 28, estimatedSaleSpeedIncrease: 20, analyzedDate: '2026-03-13' },
  { id: 'la-12', cardName: '2020 Prizm Anthony Edwards RC #258 PSA 10', player: 'Anthony Edwards', platform: 'mercari', currentTitle: 'Anthony Edwards Prizm PSA 10 Rookie', suggestedTitle: '2020-21 Panini Prizm Anthony Edwards RC #258 PSA 10 Gem Mint Timberwolves', currentPrice: 720, suggestedPrice: 680, photoScore: 65, titleScore: 40, descriptionScore: 50, overallScore: 52, issues: ['Missing year, set details, card number', 'Mercari formatting not optimized', 'Only 2 photos', 'No team name'], improvements: ['Add complete card details to title', 'Include 5+ photos', 'Add team name for search visibility', 'Write detailed Mercari description'], estimatedViewIncrease: 72, estimatedSaleSpeedIncrease: 55, analyzedDate: '2026-03-12' },
  { id: 'la-13', cardName: '1989 Upper Deck Ken Griffey Jr RC #1 PSA 9', player: 'Ken Griffey Jr', platform: 'ebay', currentTitle: '1989 Upper Deck Ken Griffey Jr. Rookie Card #1 PSA 9 Mint HOF Mariners', suggestedTitle: '1989 Upper Deck Ken Griffey Jr RC #1 PSA 9 Mint HOF Mariners Iconic RC', currentPrice: 190, suggestedPrice: 185, photoScore: 85, titleScore: 82, descriptionScore: 80, overallScore: 82, issues: ['Could use RC abbreviation for better search', 'Minor pricing adjustment needed'], improvements: ['Use RC abbreviation alongside Rookie Card', 'Slight price reduction to match comps'], estimatedViewIncrease: 8, estimatedSaleSpeedIncrease: 10, analyzedDate: '2026-03-11' },
  { id: 'la-14', cardName: '2024 Bowman Chrome Travis Bazzana 1st', player: 'Travis Bazzana', platform: 'ebay', currentTitle: 'Travis Bazzana 2024 Bowman Chrome 1st #1 Pick', suggestedTitle: '2024 Bowman Chrome Travis Bazzana 1st Bowman #BDC-1 Guardians #1 Pick Prospect', currentPrice: 115, suggestedPrice: 105, photoScore: 70, titleScore: 55, descriptionScore: 58, overallScore: 61, issues: ['Year should lead the title', 'Missing Bowman Chrome number', 'No team name', 'Photos lack close-up details'], improvements: ['Lead with year and set name', 'Add card number and team', 'Include close-up photos of card details'], estimatedViewIncrease: 38, estimatedSaleSpeedIncrease: 30, analyzedDate: '2026-03-14' },
  { id: 'la-15', cardName: '1996 Topps Chrome Kobe Bryant RC #138 SGC 9', player: 'Kobe Bryant', platform: 'ebay', currentTitle: '1996-97 Topps Chrome Kobe Bryant Rookie #138 SGC 9 Mint Lakers HOF Mamba', suggestedTitle: '1996-97 Topps Chrome Kobe Bryant RC #138 SGC 9 Mint Lakers HOF Mamba Forever', currentPrice: 5200, suggestedPrice: 5400, photoScore: 88, titleScore: 85, descriptionScore: 82, overallScore: 85, issues: ['Slightly underpriced for SGC 9 Kobe', 'Could add emotional keywords'], improvements: ['Increase price based on recent SGC 9 sales', 'Add Mamba Forever for emotional search traffic'], estimatedViewIncrease: 8, estimatedSaleSpeedIncrease: 5, analyzedDate: '2026-03-10' },
  { id: 'la-16', cardName: '2023 Bowman Chrome Ethan Salas 1st', player: 'Ethan Salas', platform: 'ebay', currentTitle: '2023 Bowman Chrome Ethan Salas 1st Bowman Padres Top Prospect', suggestedTitle: '2023 Bowman Chrome Ethan Salas 1st Bowman #BCP-50 Padres #1 Prospect MLB Debut', currentPrice: 195, suggestedPrice: 200, photoScore: 75, titleScore: 72, descriptionScore: 68, overallScore: 72, issues: ['Missing card number', 'No mention of imminent MLB debut'], improvements: ['Add card number', 'Include MLB debut callup hype keywords'], estimatedViewIncrease: 22, estimatedSaleSpeedIncrease: 18, analyzedDate: '2026-03-13' },
  { id: 'la-17', cardName: '2009 National Treasures Stephen Curry RC /99', player: 'Stephen Curry', platform: 'pwcc', currentTitle: '2009-10 Panini National Treasures Stephen Curry RC /99 BGS 9.5', suggestedTitle: '2009-10 Panini National Treasures Stephen Curry RC #206 /99 BGS 9.5 Gem Mint', currentPrice: 18800, suggestedPrice: 19200, photoScore: 94, titleScore: 82, descriptionScore: 90, overallScore: 89, issues: ['Missing card number', 'Missing Gem Mint designation'], improvements: ['Add card number #206', 'Include Gem Mint for BGS 9.5 searches'], estimatedViewIncrease: 6, estimatedSaleSpeedIncrease: 8, analyzedDate: '2026-03-09' },
  { id: 'la-18', cardName: '2024 Prizm Jayden Daniels RC Silver', player: 'Jayden Daniels', platform: 'mercari', currentTitle: 'jayden daniels prizm silver rookie', suggestedTitle: '2024 Panini Prizm Jayden Daniels RC Silver #301 Commanders OROY', currentPrice: 48, suggestedPrice: 42, photoScore: 50, titleScore: 28, descriptionScore: 35, overallScore: 38, issues: ['No capitalization', 'Missing year, set brand, card number', 'Dark photos', 'Missing team and award info'], improvements: ['Capitalize and add full details', 'Take photos in natural or studio light', 'Add OROY and Commanders keywords'], estimatedViewIncrease: 95, estimatedSaleSpeedIncrease: 70, analyzedDate: '2026-03-12' },
  { id: 'la-19', cardName: '2022 Prizm Paolo Banchero RC #282 PSA 10', player: 'Paolo Banchero', platform: 'ebay', currentTitle: '2022-23 Prizm Paolo Banchero Rookie #282 PSA 10 Gem Magic', suggestedTitle: '2022-23 Panini Prizm Paolo Banchero RC #282 PSA 10 Gem Mint Orlando Magic ROY', currentPrice: 195, suggestedPrice: 185, photoScore: 78, titleScore: 65, descriptionScore: 70, overallScore: 71, issues: ['Missing Panini in title', 'Gem should be Gem Mint', 'Missing ROY keyword'], improvements: ['Add Panini and ROY to title', 'Use full Gem Mint designation', 'Slight price adjustment'], estimatedViewIncrease: 25, estimatedSaleSpeedIncrease: 20, analyzedDate: '2026-03-08' },
  { id: 'la-20', cardName: '2013 Prizm Giannis Antetokounmpo RC #290 PSA 9', player: 'Giannis Antetokounmpo', platform: 'ebay', currentTitle: '2013-14 Panini Prizm Giannis Antetokounmpo RC #290 PSA 9 Mint Bucks MVP', suggestedTitle: '2013-14 Panini Prizm Giannis Antetokounmpo RC #290 PSA 9 Mint 2x MVP Bucks', currentPrice: 3200, suggestedPrice: 3100, photoScore: 82, titleScore: 85, descriptionScore: 80, overallScore: 82, issues: ['Could specify 2x MVP', 'Slightly overpriced'], improvements: ['Add 2x MVP distinction', 'Lower price to match recent comps'], estimatedViewIncrease: 5, estimatedSaleSpeedIncrease: 12, analyzedDate: '2026-03-11' },
  { id: 'la-21', cardName: '2011 Topps Update Mike Trout RC US175 PSA 10', player: 'Mike Trout', platform: 'ebay', currentTitle: '2011 Topps Update Mike Trout RC #US175 PSA 10 Gem Mint Angels MVP', suggestedTitle: '2011 Topps Update Mike Trout RC #US175 PSA 10 Gem Mint 3x MVP Angels HOF', currentPrice: 3900, suggestedPrice: 3800, photoScore: 85, titleScore: 82, descriptionScore: 78, overallScore: 82, issues: ['Could add 3x MVP and HOF keywords', 'Minor pricing adjustment'], improvements: ['Specify 3x MVP for added impact', 'Adjust price down slightly'], estimatedViewIncrease: 8, estimatedSaleSpeedIncrease: 10, analyzedDate: '2026-03-10' },
  { id: 'la-22', cardName: '2023 Prizm Chet Holmgren RC #249 Raw', player: 'Chet Holmgren', platform: 'facebook', currentTitle: 'Chet Holmgren Prizm RC — $25 shipped', suggestedTitle: '2023-24 Panini Prizm Chet Holmgren RC #249 Base Thunder', currentPrice: 25, suggestedPrice: 18, photoScore: 45, titleScore: 30, descriptionScore: 25, overallScore: 33, issues: ['Price in title hurts marketplace search', 'Missing all card details', 'Single phone photo', 'Overpriced for declining card'], improvements: ['Remove price from title', 'Add full card details', 'Take multiple clear photos', 'Price at current market value'], estimatedViewIncrease: 85, estimatedSaleSpeedIncrease: 60, analyzedDate: '2026-03-14' },
  { id: 'la-23', cardName: '1979 OPC Wayne Gretzky RC #18 PSA 6', player: 'Wayne Gretzky', platform: 'pwcc', currentTitle: '1979-80 O-Pee-Chee Wayne Gretzky RC #18 PSA 6 EX-MT Oilers HOF GOAT', suggestedTitle: '1979-80 O-Pee-Chee Wayne Gretzky RC #18 PSA 6 EX-MT Hockey GOAT Oilers HOF', currentPrice: 28000, suggestedPrice: 29000, photoScore: 92, titleScore: 88, descriptionScore: 90, overallScore: 90, issues: ['Slightly underpriced', 'Could add Hockey keyword for cross-sport search'], improvements: ['Add Hockey keyword', 'Increase price to match current PSA 6 sales'], estimatedViewIncrease: 4, estimatedSaleSpeedIncrease: 5, analyzedDate: '2026-03-07' },
  { id: 'la-24', cardName: '2024 Topps Chrome Paul Skenes RC Auto', player: 'Paul Skenes', platform: 'ebay', currentTitle: 'Paul Skenes 2024 Topps Chrome Auto RC Pirates', suggestedTitle: '2024 Topps Chrome Paul Skenes RC Auto #RA-PS Pirates ROY Ace Rookie', currentPrice: 125, suggestedPrice: 115, photoScore: 72, titleScore: 55, descriptionScore: 62, overallScore: 63, issues: ['Year should come first', 'Missing card number', 'No ROY mention'], improvements: ['Restructure title with year first', 'Add auto card number', 'Include ROY keyword'], estimatedViewIncrease: 35, estimatedSaleSpeedIncrease: 28, analyzedDate: '2026-03-13' },
  { id: 'la-25', cardName: '2014 Bowman Chrome Mookie Betts 1st PSA 10', player: 'Mookie Betts', platform: 'ebay', currentTitle: '2014 Bowman Chrome Mookie Betts 1st Bowman #BCP109 PSA 10 Gem Mint Dodgers', suggestedTitle: '2014 Bowman Chrome Mookie Betts 1st Bowman #BCP109 PSA 10 Gem Mint Dodgers MVP', currentPrice: 1180, suggestedPrice: 1200, photoScore: 82, titleScore: 85, descriptionScore: 80, overallScore: 82, issues: ['Could add MVP keyword', 'Slightly underpriced'], improvements: ['Add MVP to title', 'Small price increase'], estimatedViewIncrease: 5, estimatedSaleSpeedIncrease: 8, analyzedDate: '2026-03-09' },
];

// ---- Mock Data: Title Suggestions (30) ----

const MOCK_TITLE_SUGGESTIONS: TitleSuggestion[] = [
  { id: 'ts-1', listingId: 'la-1', originalTitle: 'Wembanyama Prizm RC PSA 10 Gem Mint', suggestedTitle: '2023-24 Panini Prizm Victor Wembanyama RC #260 PSA 10 Gem Mint ROTY', score: 92, keywordsAdded: ['2023-24', 'Panini', 'Victor', '#260', 'ROTY'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: 'Adding year, full name, card number, and ROTY designation significantly improves search discoverability', estimatedCTRIncrease: 45, platform: 'ebay' },
  { id: 'ts-2', listingId: 'la-3', originalTitle: 'Luka Doncic rookie card psa 10', suggestedTitle: '2018-19 Panini Prizm Luka Doncic RC #280 PSA 10 Gem Mint Mavericks', score: 95, keywordsAdded: ['2018-19', 'Panini', 'Prizm', 'RC', '#280', 'Gem Mint', 'Mavericks'], keywordsRemoved: ['rookie card'], characterCount: 72, maxCharacters: 80, reasoning: 'Complete overhaul needed. RC abbreviation, set name, and team are essential search terms', estimatedCTRIncrease: 120, platform: 'mercari' },
  { id: 'ts-3', listingId: 'la-6', originalTitle: 'Patrick Mahomes 2017 Prizm Rookie PSA 10', suggestedTitle: '2017 Panini Prizm Patrick Mahomes II RC #269 PSA 10 Gem Mint Chiefs MVP', score: 90, keywordsAdded: ['Panini', 'II', 'RC', '#269', 'Gem Mint', 'Chiefs', 'MVP'], keywordsRemoved: ['Rookie'], characterCount: 74, maxCharacters: 80, reasoning: 'Adding Panini, card number, team name, and MVP captures more search queries', estimatedCTRIncrease: 55, platform: 'ebay' },
  { id: 'ts-4', listingId: 'la-10', originalTitle: 'corbin Carroll topps chrome auto rookie 2023', suggestedTitle: '2023 Topps Chrome Corbin Carroll RC Auto #RA-CC Diamondbacks ROY', score: 94, keywordsAdded: ['RC', '#RA-CC', 'Diamondbacks', 'ROY'], keywordsRemoved: ['rookie'], characterCount: 66, maxCharacters: 80, reasoning: 'Proper capitalization, structure, and keywords completely transform discoverability', estimatedCTRIncrease: 150, platform: 'ebay' },
  { id: 'ts-5', listingId: 'la-7', originalTitle: 'Elly De La Cruz Bowman Chrome 1st Prospect', suggestedTitle: '2022 Bowman Chrome Elly De La Cruz 1st Bowman #BCP-150 Reds Prospect', score: 88, keywordsAdded: ['2022', '1st Bowman', '#BCP-150', 'Reds'], keywordsRemoved: ['Prospect'], characterCount: 70, maxCharacters: 80, reasoning: 'Year, card number, and team name are essential for Bowman Chrome searches', estimatedCTRIncrease: 65, platform: 'mercari' },
  { id: 'ts-6', listingId: 'la-4', originalTitle: '2020 Panini Prizm Justin Herbert RC #325 PSA 10 Base Chargers QB', suggestedTitle: '2020 Panini Prizm Justin Herbert RC #325 PSA 10 Gem Mint Chargers Rookie', score: 82, keywordsAdded: ['Gem Mint', 'Rookie'], keywordsRemoved: ['Base', 'QB'], characterCount: 74, maxCharacters: 80, reasoning: 'Replace Base and QB with more searchable terms like Gem Mint and Rookie', estimatedCTRIncrease: 18, platform: 'ebay' },
  { id: 'ts-7', listingId: 'la-11', originalTitle: '2018-19 Prizm Shai Gilgeous-Alexander RC PSA 10', suggestedTitle: '2018-19 Panini Prizm Shai Gilgeous-Alexander RC #184 PSA 10 Gem Mint OKC MVP', score: 90, keywordsAdded: ['Panini', '#184', 'Gem Mint', 'OKC', 'MVP'], keywordsRemoved: [], characterCount: 78, maxCharacters: 80, reasoning: 'Adding Panini, card number, Gem Mint, and MVP candidate status boosts searches', estimatedCTRIncrease: 28, platform: 'ebay' },
  { id: 'ts-8', listingId: 'la-12', originalTitle: 'Anthony Edwards Prizm PSA 10 Rookie', suggestedTitle: '2020-21 Panini Prizm Anthony Edwards RC #258 PSA 10 Gem Mint Timberwolves', score: 93, keywordsAdded: ['2020-21', 'Panini', 'RC', '#258', 'Gem Mint', 'Timberwolves'], keywordsRemoved: ['Rookie'], characterCount: 76, maxCharacters: 80, reasoning: 'Missing nearly all key search terms. Full restructure needed for Mercari visibility', estimatedCTRIncrease: 72, platform: 'mercari' },
  { id: 'ts-9', listingId: 'la-18', originalTitle: 'jayden daniels prizm silver rookie', suggestedTitle: '2024 Panini Prizm Jayden Daniels RC Silver #301 Commanders OROY', score: 94, keywordsAdded: ['2024', 'Panini', 'RC', '#301', 'Commanders', 'OROY'], keywordsRemoved: ['rookie'], characterCount: 65, maxCharacters: 80, reasoning: 'Complete rebuild with proper formatting and essential keywords', estimatedCTRIncrease: 95, platform: 'mercari' },
  { id: 'ts-10', listingId: 'la-22', originalTitle: 'Chet Holmgren Prizm RC — $25 shipped', suggestedTitle: '2023-24 Panini Prizm Chet Holmgren RC #249 Base Thunder', score: 85, keywordsAdded: ['2023-24', 'Panini', '#249', 'Base', 'Thunder'], keywordsRemoved: ['$25 shipped'], characterCount: 56, maxCharacters: 80, reasoning: 'Never include price in title. Add card details for search matching', estimatedCTRIncrease: 85, platform: 'facebook' },
  { id: 'ts-11', listingId: 'la-8', originalTitle: '2024 Panini Prizm Caitlin Clark RC #100 PSA 10 Gem Mint WNBA Fever ROTY', suggestedTitle: '2024 Panini Prizm Caitlin Clark RC #100 PSA 10 Gem Mint WNBA ROTY Indiana Fever', score: 88, keywordsAdded: ['Indiana'], keywordsRemoved: [], characterCount: 78, maxCharacters: 80, reasoning: 'Minor tweak — add Indiana for location-based searches', estimatedCTRIncrease: 5, platform: 'ebay' },
  { id: 'ts-12', listingId: 'la-14', originalTitle: 'Travis Bazzana 2024 Bowman Chrome 1st #1 Pick', suggestedTitle: '2024 Bowman Chrome Travis Bazzana 1st Bowman #BDC-1 Guardians #1 Pick Prospect', score: 88, keywordsAdded: ['1st Bowman', '#BDC-1', 'Guardians', 'Prospect'], keywordsRemoved: [], characterCount: 78, maxCharacters: 80, reasoning: 'Add 1st Bowman designation, proper card number, and team for full search coverage', estimatedCTRIncrease: 38, platform: 'ebay' },
  { id: 'ts-13', listingId: 'la-16', originalTitle: '2023 Bowman Chrome Ethan Salas 1st Bowman Padres Top Prospect', suggestedTitle: '2023 Bowman Chrome Ethan Salas 1st Bowman #BCP-50 Padres #1 Prospect MLB Debut', score: 90, keywordsAdded: ['#BCP-50', '#1 Prospect', 'MLB Debut'], keywordsRemoved: ['Top'], characterCount: 76, maxCharacters: 80, reasoning: 'Card number and MLB Debut keyword capitalize on current hype', estimatedCTRIncrease: 22, platform: 'ebay' },
  { id: 'ts-14', listingId: 'la-19', originalTitle: '2022-23 Prizm Paolo Banchero Rookie #282 PSA 10 Gem Magic', suggestedTitle: '2022-23 Panini Prizm Paolo Banchero RC #282 PSA 10 Gem Mint Orlando Magic ROY', score: 90, keywordsAdded: ['Panini', 'RC', 'Mint', 'Orlando', 'ROY'], keywordsRemoved: ['Rookie'], characterCount: 76, maxCharacters: 80, reasoning: 'Add Panini, use RC abbreviation, complete Gem Mint, add ROY keyword', estimatedCTRIncrease: 25, platform: 'ebay' },
  { id: 'ts-15', listingId: 'la-24', originalTitle: 'Paul Skenes 2024 Topps Chrome Auto RC Pirates', suggestedTitle: '2024 Topps Chrome Paul Skenes RC Auto #RA-PS Pirates ROY Ace Rookie', score: 88, keywordsAdded: ['#RA-PS', 'ROY', 'Ace', 'Rookie'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: 'Year-first format with auto number and ROY keyword improves search ranking', estimatedCTRIncrease: 35, platform: 'ebay' },
  { id: 'ts-16', listingId: 'la-2', originalTitle: '1986-87 Fleer Michael Jordan Rookie Card #57 PSA 8 NM-MT Basketball HOF GOAT', suggestedTitle: '1986-87 Fleer Michael Jordan RC #57 PSA 8 NM-MT Rookie Card HOF GOAT', score: 85, keywordsAdded: ['RC'], keywordsRemoved: ['Basketball'], characterCount: 68, maxCharacters: 80, reasoning: 'Lead with RC for search matching, Basketball is implied by set', estimatedCTRIncrease: 8, platform: 'ebay' },
  { id: 'ts-17', listingId: 'la-5', originalTitle: '2003-04 Topps Chrome LeBron James RC #111 BGS 9.5 Gem Mint', suggestedTitle: '2003-04 Topps Chrome LeBron James RC #111 BGS 9.5 Gem Mint TRUE GEM', score: 86, keywordsAdded: ['TRUE GEM'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: 'TRUE GEM designation if subgrades support it adds premium perception', estimatedCTRIncrease: 5, platform: 'pwcc' },
  { id: 'ts-18', listingId: 'la-9', originalTitle: '1952 Topps Mickey Mantle #311 PSA 2 Good — The Holy Grail', suggestedTitle: '1952 Topps Mickey Mantle #311 PSA 2 Good Vintage HOF Yankees', score: 82, keywordsAdded: ['Vintage', 'HOF', 'Yankees'], keywordsRemoved: ['The Holy Grail'], characterCount: 58, maxCharacters: 80, reasoning: 'Replace subjective language with objective, searchable keywords', estimatedCTRIncrease: 10, platform: 'pwcc' },
  { id: 'ts-19', listingId: 'la-13', originalTitle: '1989 Upper Deck Ken Griffey Jr. Rookie Card #1 PSA 9 Mint HOF Mariners', suggestedTitle: '1989 Upper Deck Ken Griffey Jr RC #1 PSA 9 Mint HOF Mariners Iconic RC', score: 84, keywordsAdded: ['RC', 'Iconic'], keywordsRemoved: ['Rookie Card'], characterCount: 68, maxCharacters: 80, reasoning: 'RC abbreviation captures more searches than full Rookie Card', estimatedCTRIncrease: 8, platform: 'ebay' },
  { id: 'ts-20', listingId: 'la-15', originalTitle: '1996-97 Topps Chrome Kobe Bryant Rookie #138 SGC 9 Mint Lakers HOF Mamba', suggestedTitle: '1996-97 Topps Chrome Kobe Bryant RC #138 SGC 9 Mint Lakers HOF Mamba Forever', score: 86, keywordsAdded: ['RC', 'Forever'], keywordsRemoved: ['Rookie'], characterCount: 74, maxCharacters: 80, reasoning: 'RC abbreviation and Mamba Forever emotional keyword boost engagement', estimatedCTRIncrease: 8, platform: 'ebay' },
  { id: 'ts-21', listingId: 'la-20', originalTitle: '2013-14 Panini Prizm Giannis Antetokounmpo RC #290 PSA 9 Mint Bucks MVP', suggestedTitle: '2013-14 Panini Prizm Giannis Antetokounmpo RC #290 PSA 9 Mint 2x MVP Bucks', score: 84, keywordsAdded: ['2x'], keywordsRemoved: [], characterCount: 72, maxCharacters: 80, reasoning: 'Specifying 2x MVP adds distinction and accuracy', estimatedCTRIncrease: 5, platform: 'ebay' },
  { id: 'ts-22', listingId: 'la-21', originalTitle: '2011 Topps Update Mike Trout RC #US175 PSA 10 Gem Mint Angels MVP', suggestedTitle: '2011 Topps Update Mike Trout RC #US175 PSA 10 Gem Mint 3x MVP Angels HOF', score: 86, keywordsAdded: ['3x', 'HOF'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: '3x MVP and HOF-bound status add keyword depth', estimatedCTRIncrease: 8, platform: 'ebay' },
  { id: 'ts-23', listingId: 'la-23', originalTitle: '1979-80 O-Pee-Chee Wayne Gretzky RC #18 PSA 6 EX-MT Oilers HOF GOAT', suggestedTitle: '1979-80 O-Pee-Chee Wayne Gretzky RC #18 PSA 6 EX-MT Hockey GOAT Oilers HOF', score: 84, keywordsAdded: ['Hockey'], keywordsRemoved: [], characterCount: 72, maxCharacters: 80, reasoning: 'Adding Hockey captures cross-sport search traffic', estimatedCTRIncrease: 4, platform: 'pwcc' },
  { id: 'ts-24', listingId: 'la-17', originalTitle: '2009-10 Panini National Treasures Stephen Curry RC /99 BGS 9.5', suggestedTitle: '2009-10 Panini National Treasures Stephen Curry RC #206 /99 BGS 9.5 Gem Mint', score: 88, keywordsAdded: ['#206', 'Gem Mint'], keywordsRemoved: [], characterCount: 76, maxCharacters: 80, reasoning: 'Card number and Gem Mint designation improve search matching for high-end cards', estimatedCTRIncrease: 6, platform: 'pwcc' },
  { id: 'ts-25', listingId: 'la-25', originalTitle: '2014 Bowman Chrome Mookie Betts 1st Bowman #BCP109 PSA 10 Gem Mint Dodgers', suggestedTitle: '2014 Bowman Chrome Mookie Betts 1st Bowman #BCP109 PSA 10 Gem Mint Dodgers MVP', score: 84, keywordsAdded: ['MVP'], keywordsRemoved: [], characterCount: 76, maxCharacters: 80, reasoning: 'MVP keyword captures additional search traffic', estimatedCTRIncrease: 5, platform: 'ebay' },
  { id: 'ts-26', listingId: 'la-1', originalTitle: 'Wembanyama Prizm RC PSA 10 Gem Mint', suggestedTitle: '2023 Panini Prizm Victor Wembanyama Rookie #260 PSA 10 Spurs Gem Mint', score: 88, keywordsAdded: ['2023', 'Panini', 'Victor', '#260', 'Spurs', 'Rookie'], keywordsRemoved: ['RC'], characterCount: 72, maxCharacters: 80, reasoning: 'Alternative suggestion using full Rookie instead of RC for different search audience', estimatedCTRIncrease: 40, platform: 'ebay' },
  { id: 'ts-27', listingId: 'la-3', originalTitle: 'Luka Doncic rookie card psa 10', suggestedTitle: '2018 Panini Prizm Luka Doncic Rookie Card #280 PSA 10 Mavericks NBA', score: 90, keywordsAdded: ['2018', 'Panini', 'Prizm', '#280', 'Mavericks', 'NBA'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: 'Alternative keeping Rookie Card spelled out for buyers who search that way', estimatedCTRIncrease: 100, platform: 'mercari' },
  { id: 'ts-28', listingId: 'la-6', originalTitle: 'Patrick Mahomes 2017 Prizm Rookie PSA 10', suggestedTitle: '2017 Prizm Patrick Mahomes Rookie Card #269 PSA 10 Chiefs Super Bowl MVP', score: 88, keywordsAdded: ['Card', '#269', 'Chiefs', 'Super Bowl', 'MVP'], keywordsRemoved: [], characterCount: 72, maxCharacters: 80, reasoning: 'Alternative emphasizing Super Bowl wins over Panini brand', estimatedCTRIncrease: 48, platform: 'ebay' },
  { id: 'ts-29', listingId: 'la-10', originalTitle: 'corbin Carroll topps chrome auto rookie 2023', suggestedTitle: '2023 Topps Chrome Corbin Carroll Rookie Auto RA-CC Arizona ROY Winner', score: 90, keywordsAdded: ['Rookie', 'RA-CC', 'Arizona', 'ROY', 'Winner'], keywordsRemoved: [], characterCount: 68, maxCharacters: 80, reasoning: 'Alternative with Rookie spelled out and Arizona market keyword', estimatedCTRIncrease: 130, platform: 'ebay' },
  { id: 'ts-30', listingId: 'la-22', originalTitle: 'Chet Holmgren Prizm RC — $25 shipped', suggestedTitle: '2023 Panini Prizm Chet Holmgren Rookie Card #249 OKC Thunder Basketball', score: 82, keywordsAdded: ['2023', 'Panini', 'Rookie Card', '#249', 'OKC', 'Thunder', 'Basketball'], keywordsRemoved: ['$25 shipped'], characterCount: 72, maxCharacters: 80, reasoning: 'Alternative with full Rookie Card and Basketball keyword for Facebook searches', estimatedCTRIncrease: 80, platform: 'facebook' },
];

// ---- Mock Data: Competitor Listings (20) ----

const MOCK_COMPETITORS: CompetitorListing[] = [
  { id: 'cl-1', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', platform: 'ebay', sellerName: 'topshelfcards', sellerRating: 99.8, price: 1799, shippingCost: 0, totalPrice: 1799, photoCount: 12, photoQuality: 'excellent', titleQuality: 92, daysListed: 3, watchers: 45, bestOffer: true, freeShipping: true },
  { id: 'cl-2', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', platform: 'ebay', sellerName: 'gemmintsports', sellerRating: 99.5, price: 1850, shippingCost: 5.99, totalPrice: 1855.99, photoCount: 8, photoQuality: 'good', titleQuality: 85, daysListed: 7, watchers: 32, bestOffer: false, freeShipping: false },
  { id: 'cl-3', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', platform: 'mercari', sellerName: 'sportscard_seller', sellerRating: 98.2, price: 1695, shippingCost: 0, totalPrice: 1695, photoCount: 5, photoQuality: 'fair', titleQuality: 60, daysListed: 14, watchers: 18, bestOffer: false, freeShipping: true },
  { id: 'cl-4', cardName: '1986 Fleer Michael Jordan RC PSA 8', platform: 'ebay', sellerName: 'vintagecardkings', sellerRating: 100, price: 18200, shippingCost: 0, totalPrice: 18200, photoCount: 16, photoQuality: 'excellent', titleQuality: 95, daysListed: 5, watchers: 28, bestOffer: true, freeShipping: true },
  { id: 'cl-5', cardName: '1986 Fleer Michael Jordan RC PSA 8', platform: 'pwcc', sellerName: 'pwcc_vault', sellerRating: 99.9, price: 18500, shippingCost: 0, totalPrice: 18500, photoCount: 10, photoQuality: 'excellent', titleQuality: 90, daysListed: 2, watchers: 52, bestOffer: false, freeShipping: true },
  { id: 'cl-6', cardName: '2018 Prizm Luka Doncic RC PSA 10', platform: 'ebay', sellerName: 'rookiecards4u', sellerRating: 99.2, price: 3150, shippingCost: 0, totalPrice: 3150, photoCount: 10, photoQuality: 'good', titleQuality: 88, daysListed: 8, watchers: 22, bestOffer: true, freeShipping: true },
  { id: 'cl-7', cardName: '2018 Prizm Luka Doncic RC PSA 10', platform: 'ebay', sellerName: 'cardslabpro', sellerRating: 99.6, price: 3250, shippingCost: 4.99, totalPrice: 3254.99, photoCount: 6, photoQuality: 'good', titleQuality: 82, daysListed: 12, watchers: 15, bestOffer: true, freeShipping: false },
  { id: 'cl-8', cardName: '2020 Prizm Justin Herbert RC PSA 10', platform: 'ebay', sellerName: 'footballcardhq', sellerRating: 99.4, price: 825, shippingCost: 0, totalPrice: 825, photoCount: 8, photoQuality: 'good', titleQuality: 80, daysListed: 10, watchers: 12, bestOffer: true, freeShipping: true },
  { id: 'cl-9', cardName: '2020 Prizm Justin Herbert RC PSA 10', platform: 'mercari', sellerName: 'qbcards', sellerRating: 97.8, price: 795, shippingCost: 0, totalPrice: 795, photoCount: 4, photoQuality: 'fair', titleQuality: 55, daysListed: 20, watchers: 8, bestOffer: false, freeShipping: true },
  { id: 'cl-10', cardName: '2017 Prizm Patrick Mahomes RC PSA 10', platform: 'ebay', sellerName: 'elitecards', sellerRating: 99.7, price: 4150, shippingCost: 0, totalPrice: 4150, photoCount: 12, photoQuality: 'excellent', titleQuality: 90, daysListed: 4, watchers: 38, bestOffer: true, freeShipping: true },
  { id: 'cl-11', cardName: '2017 Prizm Patrick Mahomes RC PSA 10', platform: 'ebay', sellerName: 'midwest_cards', sellerRating: 99.3, price: 4280, shippingCost: 5.99, totalPrice: 4285.99, photoCount: 7, photoQuality: 'good', titleQuality: 78, daysListed: 15, watchers: 20, bestOffer: false, freeShipping: false },
  { id: 'cl-12', cardName: '2024 Prizm Caitlin Clark RC PSA 10', platform: 'ebay', sellerName: 'wnba_specialist', sellerRating: 99.0, price: 148, shippingCost: 0, totalPrice: 148, photoCount: 8, photoQuality: 'good', titleQuality: 85, daysListed: 2, watchers: 55, bestOffer: false, freeShipping: true },
  { id: 'cl-13', cardName: '2024 Prizm Caitlin Clark RC PSA 10', platform: 'mercari', sellerName: 'hoops_queen', sellerRating: 98.5, price: 139, shippingCost: 0, totalPrice: 139, photoCount: 6, photoQuality: 'good', titleQuality: 72, daysListed: 5, watchers: 30, bestOffer: false, freeShipping: true },
  { id: 'cl-14', cardName: '2023 Bowman Chrome Ethan Salas 1st', platform: 'ebay', sellerName: 'prospect_hunter', sellerRating: 99.1, price: 198, shippingCost: 3.99, totalPrice: 201.99, photoCount: 6, photoQuality: 'good', titleQuality: 78, daysListed: 6, watchers: 25, bestOffer: true, freeShipping: false },
  { id: 'cl-15', cardName: '2018 Prizm SGA RC PSA 10', platform: 'ebay', sellerName: 'thundercards', sellerRating: 99.4, price: 945, shippingCost: 0, totalPrice: 945, photoCount: 10, photoQuality: 'excellent', titleQuality: 88, daysListed: 3, watchers: 42, bestOffer: true, freeShipping: true },
  { id: 'cl-16', cardName: '2020 Prizm Anthony Edwards RC PSA 10', platform: 'ebay', sellerName: 'wolfcards', sellerRating: 99.2, price: 675, shippingCost: 0, totalPrice: 675, photoCount: 8, photoQuality: 'good', titleQuality: 82, daysListed: 5, watchers: 28, bestOffer: true, freeShipping: true },
  { id: 'cl-17', cardName: '1989 Upper Deck Ken Griffey Jr RC PSA 9', platform: 'ebay', sellerName: 'vintage90s', sellerRating: 99.8, price: 188, shippingCost: 0, totalPrice: 188, photoCount: 8, photoQuality: 'excellent', titleQuality: 85, daysListed: 8, watchers: 15, bestOffer: true, freeShipping: true },
  { id: 'cl-18', cardName: '2013 Prizm Giannis RC PSA 9', platform: 'ebay', sellerName: 'buckscards', sellerRating: 99.5, price: 3100, shippingCost: 0, totalPrice: 3100, photoCount: 10, photoQuality: 'good', titleQuality: 84, daysListed: 6, watchers: 22, bestOffer: true, freeShipping: true },
  { id: 'cl-19', cardName: '2024 Topps Chrome Paul Skenes RC Auto', platform: 'ebay', sellerName: 'piratescollector', sellerRating: 98.8, price: 112, shippingCost: 4.50, totalPrice: 116.50, photoCount: 6, photoQuality: 'fair', titleQuality: 68, daysListed: 9, watchers: 18, bestOffer: true, freeShipping: false },
  { id: 'cl-20', cardName: '1996 Topps Chrome Kobe Bryant RC SGC 9', platform: 'ebay', sellerName: 'mambacards', sellerRating: 99.6, price: 5350, shippingCost: 0, totalPrice: 5350, photoCount: 12, photoQuality: 'excellent', titleQuality: 90, daysListed: 4, watchers: 35, bestOffer: true, freeShipping: true },
];

// ---- Service Functions ----

function qualityFromPhotoScore(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function enrichAnalysis(a: typeof MOCK_ANALYSES[number]): ListingAnalysis {
  const pricingScore = Math.min(100, Math.round((a.overallScore + a.photoScore) / 2 + 5));
  const seoScore = Math.min(100, Math.round(a.titleScore * 0.9));
  return {
    ...a,
    pricingScore,
    seoScore,
    estimatedSales: Math.max(1, Math.round(a.overallScore / 20)),
    estimatedViews: Math.round(a.estimatedViewIncrease * 8 + 100),
    listingDate: a.analyzedDate,
    photoQuality: qualityFromPhotoScore(a.photoScore),
    improvementTips: a.improvements.slice(0, 3),
    missingKeywords: a.issues
      .filter(i => i.toLowerCase().includes('missing') || i.toLowerCase().includes('no '))
      .map(i => i.replace(/^(Title )?[Mm]issing /,'').replace(/^No /,''))
      .slice(0, 4),
  } as ListingAnalysis;
}

export function getListingAnalyses(): ListingAnalysis[] {
  const cached = loadData<ListingAnalysis[]>('listing_analyses');
  if (cached && cached.length > 0 && 'pricingScore' in cached[0]) return cached;
  const enriched = MOCK_ANALYSES.map(enrichAnalysis);
  saveData('listing_analyses', enriched);
  return enriched;
}

export function getAnalysisById(id: string): ListingAnalysis | undefined {
  const analyses = getListingAnalyses();
  return analyses.find(a => a.id === id);
}

export function getAnalysesByPlatform(platform: Platform): ListingAnalysis[] {
  const analyses = getListingAnalyses();
  return analyses.filter(a => a.platform === platform);
}

export function getTitleSuggestions(): TitleSuggestion[] {
  const cached = loadData<TitleSuggestion[]>('title_suggestions');
  if (cached) return cached;
  saveData('title_suggestions', MOCK_TITLE_SUGGESTIONS);
  return MOCK_TITLE_SUGGESTIONS;
}

export function getTitleSuggestionsByListing(listingId: string): TitleSuggestion[] {
  const suggestions = getTitleSuggestions();
  return suggestions.filter(s => s.listingId === listingId);
}

function enrichCompetitor(c: typeof MOCK_COMPETITORS[number]): CompetitorListing {
  const qualityToScore: Record<string, number> = { excellent: 92, good: 78, fair: 60, poor: 40 };
  return {
    ...c,
    seller: c.sellerName,
    photoScore: qualityToScore[c.photoQuality] ?? 70,
    sold: c.daysListed <= 5,
  } as CompetitorListing;
}

export function getCompetitorListings(): CompetitorListing[] {
  const cached = loadData<CompetitorListing[]>('competitor_listings');
  if (cached && cached.length > 0 && 'seller' in cached[0]) return cached;
  const enriched = MOCK_COMPETITORS.map(enrichCompetitor);
  saveData('competitor_listings', enriched);
  return enriched;
}

export function getCompetitorsByCard(cardName: string): CompetitorListing[] {
  const competitors = getCompetitorListings();
  return competitors.filter(c => c.cardName.toLowerCase().includes(cardName.toLowerCase()));
}

export function getCompetitorsByPlatform(platform: Platform): CompetitorListing[] {
  const competitors = getCompetitorListings();
  return competitors.filter(c => c.platform === platform);
}

export function getOptimizationScore(analysisId: string): OptimizationScore | null {
  const analysis = getAnalysisById(analysisId);
  if (!analysis) return null;
  const overall = analysis.overallScore;
  return {
    overall,
    title: analysis.titleScore,
    photos: analysis.photoScore,
    pricing: Math.round((1 - Math.abs(analysis.currentPrice - analysis.suggestedPrice) / analysis.currentPrice) * 100),
    description: analysis.descriptionScore,
    shipping: 75,
    timing: 70,
    competitiveness: Math.round(overall * 0.9),
    grade: getScoreGrade(overall) as OptimizationScore['grade'],
  };
}

export function getLowScoreListings(threshold: number = 60): ListingAnalysis[] {
  const analyses = getListingAnalyses();
  return analyses.filter(a => a.overallScore < threshold);
}

export function getHighScoreListings(threshold: number = 85): ListingAnalysis[] {
  const analyses = getListingAnalyses();
  return analyses.filter(a => a.overallScore >= threshold);
}

export function getAverageScoreByPlatform(): { platform: Platform; avgScore: number; count: number }[] {
  const analyses = getListingAnalyses();
  const platformMap = new Map<Platform, { total: number; count: number }>();
  analyses.forEach(a => {
    const entry = platformMap.get(a.platform) || { total: 0, count: 0 };
    entry.total += a.overallScore;
    entry.count += 1;
    platformMap.set(a.platform, entry);
  });
  return Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    avgScore: Math.round(data.total / data.count),
    count: data.count,
  }));
}

export function getTopImprovementOpportunities(limit: number = 10): ListingAnalysis[] {
  const analyses = getListingAnalyses();
  return [...analyses].sort((a, b) => b.estimatedViewIncrease - a.estimatedViewIncrease).slice(0, limit);
}

export function getMostCommonIssues(): { issue: string; count: number }[] {
  const analyses = getListingAnalyses();
  const issueCount = new Map<string, number>();
  analyses.forEach(a => {
    a.issues.forEach(issue => {
      issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
    });
  });
  return Array.from(issueCount.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTitleSuggestionsByPlatform(platform: Platform): TitleSuggestion[] {
  const suggestions = getTitleSuggestions();
  return suggestions.filter(s => s.platform === platform);
}

// ---- Mock Data: Photo Scores (15) ----

const MOCK_PHOTO_SCORES: PhotoScore[] = [
  { id: 'ps-1', listingId: 'la-1', overallScore: 72, lighting: 68, focus: 75, background: 55, angle: 80, centering: 78, colorAccuracy: 72, resolution: 82, recommendations: ['Use white or black background', 'Increase lighting to reduce shadows', 'Add close-up of centering'], photoCount: 3, idealPhotoCount: 10 },
  { id: 'ps-2', listingId: 'la-2', overallScore: 92, lighting: 95, focus: 92, background: 90, angle: 88, centering: 95, colorAccuracy: 90, resolution: 94, recommendations: ['Near perfect — consider adding a lifestyle shot'], photoCount: 12, idealPhotoCount: 12 },
  { id: 'ps-3', listingId: 'la-3', overallScore: 55, lighting: 50, focus: 45, background: 40, angle: 65, centering: 60, colorAccuracy: 55, resolution: 70, recommendations: ['Reshoot entirely with proper lighting', 'Use a lightbox or ring light', 'Focus camera before shooting', 'Use neutral background', 'Take multiple angles'], photoCount: 1, idealPhotoCount: 8 },
  { id: 'ps-4', listingId: 'la-6', overallScore: 68, lighting: 55, focus: 72, background: 65, angle: 75, centering: 70, colorAccuracy: 58, resolution: 80, recommendations: ['Fix yellow lighting tint', 'Add neutral white light source', 'Include edge and corner close-ups', 'Add more photos'], photoCount: 4, idealPhotoCount: 10 },
  { id: 'ps-5', listingId: 'la-10', overallScore: 40, lighting: 35, focus: 30, background: 25, angle: 50, centering: 45, colorAccuracy: 42, resolution: 55, recommendations: ['Complete reshoot required', 'Use natural daylight or studio lighting', 'Ensure camera is focused on card', 'Clean and neutral background essential', 'Take 8-12 photos minimum'], photoCount: 2, idealPhotoCount: 10 },
  { id: 'ps-6', listingId: 'la-5', overallScore: 95, lighting: 96, focus: 95, background: 94, angle: 92, centering: 98, colorAccuracy: 95, resolution: 96, recommendations: ['Excellent photography — no changes needed'], photoCount: 10, idealPhotoCount: 10 },
  { id: 'ps-7', listingId: 'la-8', overallScore: 88, lighting: 90, focus: 88, background: 85, angle: 86, centering: 92, colorAccuracy: 88, resolution: 90, recommendations: ['Very good — consider adding a scan for online buyers'], photoCount: 8, idealPhotoCount: 10 },
  { id: 'ps-8', listingId: 'la-12', overallScore: 65, lighting: 60, focus: 68, background: 58, angle: 72, centering: 65, colorAccuracy: 62, resolution: 75, recommendations: ['Add more photos — only 2 provided', 'Improve lighting consistency', 'Show back of card and edges'], photoCount: 2, idealPhotoCount: 8 },
  { id: 'ps-9', listingId: 'la-18', overallScore: 50, lighting: 42, focus: 55, background: 38, angle: 58, centering: 52, colorAccuracy: 48, resolution: 60, recommendations: ['Dark photos — increase lighting significantly', 'Use white or light gray background', 'Ensure card fills frame properly', 'Add front, back, and detail shots'], photoCount: 3, idealPhotoCount: 8 },
  { id: 'ps-10', listingId: 'la-22', overallScore: 45, lighting: 40, focus: 48, background: 30, angle: 55, centering: 50, colorAccuracy: 45, resolution: 52, recommendations: ['Phone photo quality too low', 'Use proper camera or phone with good camera', 'Never photograph on fabric or carpet', 'Studio setup needed for card photography'], photoCount: 1, idealPhotoCount: 8 },
  { id: 'ps-11', listingId: 'la-9', overallScore: 90, lighting: 92, focus: 90, background: 88, angle: 88, centering: 94, colorAccuracy: 90, resolution: 92, recommendations: ['Strong photos — consider adding cert verification shot'], photoCount: 10, idealPhotoCount: 12 },
  { id: 'ps-12', listingId: 'la-15', overallScore: 88, lighting: 90, focus: 86, background: 85, angle: 88, centering: 92, colorAccuracy: 88, resolution: 90, recommendations: ['Good quality — add close-up of hologram sticker'], photoCount: 8, idealPhotoCount: 10 },
  { id: 'ps-13', listingId: 'la-7', overallScore: 62, lighting: 58, focus: 65, background: 48, angle: 70, centering: 65, colorAccuracy: 60, resolution: 72, recommendations: ['Improve background — remove clutter', 'Better lighting needed', 'Take additional angle shots'], photoCount: 4, idealPhotoCount: 8 },
  { id: 'ps-14', listingId: 'la-14', overallScore: 70, lighting: 72, focus: 68, background: 65, angle: 72, centering: 75, colorAccuracy: 70, resolution: 78, recommendations: ['Add close-up detail shots', 'Slightly improve lighting brightness', 'Consider using photo editing for white balance'], photoCount: 5, idealPhotoCount: 8 },
  { id: 'ps-15', listingId: 'la-23', overallScore: 92, lighting: 94, focus: 92, background: 90, angle: 90, centering: 95, colorAccuracy: 92, resolution: 94, recommendations: ['Professional-grade photography — excellent work'], photoCount: 12, idealPhotoCount: 12 },
];

// ---- Mock Data: Timing Recommendations (8) ----

const MOCK_TIMING: TimingRecommendation[] = [
  { id: 'tr-1', platform: 'ebay', bestDayOfWeek: 'Sunday', bestTimeOfDay: '7:00 PM - 9:00 PM EST', worstDayOfWeek: 'Tuesday', worstTimeOfDay: '2:00 AM - 6:00 AM EST', peakSeason: 'January-March (off-season buying)', offSeason: 'July-August (summer slowdown)', currentDemand: 'high', reasoning: 'Sunday evening listings capture maximum buyer attention as people browse before the work week.' },
  { id: 'tr-2', platform: 'mercari', bestDayOfWeek: 'Saturday', bestTimeOfDay: '10:00 AM - 2:00 PM EST', worstDayOfWeek: 'Monday', worstTimeOfDay: '6:00 AM - 8:00 AM EST', peakSeason: 'November-December (holiday gifts)', offSeason: 'June-July', currentDemand: 'moderate', reasoning: 'Weekend morning browsing drives Mercari engagement. Fresh listings get priority in search.' },
  { id: 'tr-3', platform: 'pwcc', bestDayOfWeek: 'Wednesday', bestTimeOfDay: '12:00 PM - 3:00 PM EST', worstDayOfWeek: 'Friday', worstTimeOfDay: '5:00 PM - 8:00 PM EST', peakSeason: 'January-April (auction season)', offSeason: 'August-September', currentDemand: 'high', reasoning: 'Mid-week auction endings historically generate higher final bids on PWCC.' },
  { id: 'tr-4', platform: 'facebook', bestDayOfWeek: 'Thursday', bestTimeOfDay: '6:00 PM - 9:00 PM EST', worstDayOfWeek: 'Monday', worstTimeOfDay: '9:00 AM - 12:00 PM EST', peakSeason: 'Year-round with sports season peaks', offSeason: 'Summer months', currentDemand: 'moderate', reasoning: 'Facebook group engagement peaks on weekday evenings when members are active.' },
  { id: 'tr-5', platform: 'whatnot', bestDayOfWeek: 'Friday', bestTimeOfDay: '8:00 PM - 11:00 PM EST', worstDayOfWeek: 'Tuesday', worstTimeOfDay: '10:00 AM - 1:00 PM EST', peakSeason: 'During major sports events', offSeason: 'Mid-summer', currentDemand: 'high', reasoning: 'Friday night live breaks draw the biggest audiences and bidding wars.' },
  { id: 'tr-6', platform: 'comc', bestDayOfWeek: 'Monday', bestTimeOfDay: '9:00 AM - 12:00 PM EST', worstDayOfWeek: 'Saturday', worstTimeOfDay: '12:00 AM - 6:00 AM EST', peakSeason: 'September-November (new releases)', offSeason: 'May-June', currentDemand: 'moderate', reasoning: 'COMC buyers tend to be more methodical, shopping during business hours.' },
  { id: 'tr-7', platform: 'instagram', bestDayOfWeek: 'Saturday', bestTimeOfDay: '11:00 AM - 2:00 PM EST', worstDayOfWeek: 'Wednesday', worstTimeOfDay: '3:00 AM - 7:00 AM EST', peakSeason: 'During major card shows', offSeason: 'No significant off-season', currentDemand: 'moderate', reasoning: 'Weekend content gets more engagement. Pair listings with hobby content.' },
  { id: 'tr-8', platform: 'myslabs', bestDayOfWeek: 'Sunday', bestTimeOfDay: '4:00 PM - 8:00 PM EST', worstDayOfWeek: 'Tuesday', worstTimeOfDay: '6:00 AM - 10:00 AM EST', peakSeason: 'October-February (basketball/football)', offSeason: 'Summer', currentDemand: 'moderate', reasoning: 'MySlabs caters to graded card buyers who browse on weekend afternoons.' },
];

// ---- Mock Data: Listing History (12) ----

const MOCK_LISTING_HISTORY: ListingHistory[] = [
  { id: 'lh-1', cardName: '2023 Prizm Wembanyama RC PSA 10', platform: 'ebay', listDate: '2026-02-01', saleDate: '2026-02-08', listPrice: 1650, salePrice: 1600, views: 2450, watchers: 42, offers: 8, daysToSell: 7, optimized: true },
  { id: 'lh-2', cardName: '2018 Prizm Luka Doncic RC PSA 10', platform: 'ebay', listDate: '2026-01-15', saleDate: '2026-02-02', listPrice: 3500, salePrice: 3200, views: 1800, watchers: 28, offers: 5, daysToSell: 18, optimized: false },
  { id: 'lh-3', cardName: '2020 Prizm Justin Herbert RC PSA 10', platform: 'mercari', listDate: '2026-02-10', saleDate: '2026-03-05', listPrice: 900, salePrice: 825, views: 650, watchers: 12, offers: 3, daysToSell: 23, optimized: false },
  { id: 'lh-4', cardName: '2024 Prizm Caitlin Clark RC PSA 10', platform: 'ebay', listDate: '2026-03-01', saleDate: '2026-03-03', listPrice: 145, salePrice: 145, views: 3200, watchers: 65, offers: 0, daysToSell: 2, optimized: true },
  { id: 'lh-5', cardName: '1986 Fleer Jordan RC PSA 7', platform: 'pwcc', listDate: '2026-01-20', saleDate: '2026-02-15', listPrice: 12000, salePrice: 11800, views: 890, watchers: 18, offers: 4, daysToSell: 26, optimized: true },
  { id: 'lh-6', cardName: '2022 Prizm Paolo Banchero RC PSA 10', platform: 'ebay', listDate: '2026-02-20', saleDate: null, listPrice: 195, salePrice: null, views: 420, watchers: 8, offers: 2, daysToSell: null, optimized: false },
  { id: 'lh-7', cardName: '2024 Topps Chrome Paul Skenes RC Auto', platform: 'ebay', listDate: '2026-03-05', saleDate: '2026-03-10', listPrice: 118, salePrice: 112, views: 780, watchers: 15, offers: 3, daysToSell: 5, optimized: true },
  { id: 'lh-8', cardName: '2023 Bowman Chrome Ethan Salas 1st', platform: 'ebay', listDate: '2026-02-25', saleDate: '2026-02-26', listPrice: 195, salePrice: 195, views: 1500, watchers: 32, offers: 0, daysToSell: 1, optimized: true },
  { id: 'lh-9', cardName: '2017 Prizm Mahomes RC PSA 10', platform: 'ebay', listDate: '2026-02-15', saleDate: null, listPrice: 4500, salePrice: null, views: 950, watchers: 22, offers: 4, daysToSell: null, optimized: false },
  { id: 'lh-10', cardName: '2013 Prizm Giannis RC PSA 9', platform: 'ebay', listDate: '2026-03-01', saleDate: '2026-03-12', listPrice: 3200, salePrice: 3100, views: 1200, watchers: 18, offers: 6, daysToSell: 11, optimized: true },
  { id: 'lh-11', cardName: '2024 Prizm Jayden Daniels RC Silver', platform: 'mercari', listDate: '2026-03-08', saleDate: null, listPrice: 48, salePrice: null, views: 180, watchers: 5, offers: 1, daysToSell: null, optimized: false },
  { id: 'lh-12', cardName: '1989 Upper Deck Griffey Jr RC PSA 9', platform: 'ebay', listDate: '2026-02-28', saleDate: '2026-03-08', listPrice: 190, salePrice: 185, views: 520, watchers: 10, offers: 2, daysToSell: 8, optimized: true },
];

// ---- Additional Service Functions ----

export function getPhotoScores(): PhotoScore[] {
  const cached = loadData<PhotoScore[]>('photo_scores');
  if (cached) return cached;
  saveData('photo_scores', MOCK_PHOTO_SCORES);
  return MOCK_PHOTO_SCORES;
}

export function getPhotoScoreByListing(listingId: string): PhotoScore | undefined {
  const scores = getPhotoScores();
  return scores.find(s => s.listingId === listingId);
}

function enrichTiming(t: typeof MOCK_TIMING[number]): TimingRecommendation {
  const hourMatch = t.bestTimeOfDay.match(/(\d+):/);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 19;
  const demandToScore: Record<string, number> = { very_high: 95, high: 85, moderate: 70, low: 50 };
  const score = demandToScore[t.currentDemand] ?? 70;
  return {
    ...t,
    dayOfWeek: t.bestDayOfWeek,
    hour,
    score,
    avgViews: Math.round(score * 3.5),
    avgSales: Math.round(score * 0.4),
  } as TimingRecommendation;
}

export function getTimingRecommendations(): TimingRecommendation[] {
  const cached = loadData<TimingRecommendation[]>('timing_recommendations');
  if (cached && cached.length > 0 && 'dayOfWeek' in cached[0]) return cached;
  const enriched = MOCK_TIMING.map(enrichTiming);
  saveData('timing_recommendations', enriched);
  return enriched;
}

export function getTimingByPlatform(platform: Platform): TimingRecommendation | undefined {
  const timing = getTimingRecommendations();
  return timing.find(t => t.platform === platform);
}

export function getListingHistory(): ListingHistory[] {
  const cached = loadData<ListingHistory[]>('listing_history');
  if (cached) return cached;
  saveData('listing_history', MOCK_LISTING_HISTORY);
  return MOCK_LISTING_HISTORY;
}

export function getActiveListings(): ListingHistory[] {
  const history = getListingHistory();
  return history.filter(h => h.saleDate === null);
}

export function getSoldListings(): ListingHistory[] {
  const history = getListingHistory();
  return history.filter(h => h.saleDate !== null);
}

export function getAverageDaysToSell(): number {
  const sold = getSoldListings();
  const days = sold.filter(s => s.daysToSell !== null).map(s => s.daysToSell as number);
  return days.length > 0 ? Math.round(days.reduce((sum, d) => sum + d, 0) / days.length) : 0;
}

export function getOptimizedVsUnoptimizedStats(): { optimized: { avgDays: number; avgViews: number }; unoptimized: { avgDays: number; avgViews: number } } {
  const sold = getSoldListings();
  const opt = sold.filter(s => s.optimized && s.daysToSell !== null);
  const unopt = sold.filter(s => !s.optimized && s.daysToSell !== null);
  return {
    optimized: {
      avgDays: opt.length > 0 ? Math.round(opt.reduce((sum, s) => sum + (s.daysToSell || 0), 0) / opt.length) : 0,
      avgViews: opt.length > 0 ? Math.round(opt.reduce((sum, s) => sum + s.views, 0) / opt.length) : 0,
    },
    unoptimized: {
      avgDays: unopt.length > 0 ? Math.round(unopt.reduce((sum, s) => sum + (s.daysToSell || 0), 0) / unopt.length) : 0,
      avgViews: unopt.length > 0 ? Math.round(unopt.reduce((sum, s) => sum + s.views, 0) / unopt.length) : 0,
    },
  };
}

// ---- Page-compatible types & adapters (used by ListingOptimizer page) ----

export interface PhotoTip {
  id: string;
  category: string;
  tip: string;
  impact: 'high' | 'medium' | 'low';
  score: number;
}

export interface PlatformDistribution {
  platform: string;
  listings: number;
}

export interface ScoreImprovement {
  category: string;
  before: number;
  after: number;
}

export interface ListingOptimizerSummary {
  totalListings: number;
  avgScore: number;
  improvementOpportunities: number;
  topPlatform: string;
  avgPhotoScore: number;
}

export const PLATFORM_META: Record<string, { label: string; color: string }> = {
  ebay: { label: 'eBay', color: '#3b82f6' },
  comc: { label: 'COMC', color: '#22c55e' },
  myslabs: { label: 'MySlabs', color: '#a855f7' },
  mercari: { label: 'Mercari', color: '#ef4444' },
  whatnot: { label: 'Whatnot', color: '#f97316' },
  facebook: { label: 'Facebook', color: '#1877f2' },
  instagram: { label: 'Instagram', color: '#e1306c' },
  pwcc: { label: 'PWCC', color: '#14b8a6' },
};

export const QUALITY_META: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'text-emerald-400' },
  good: { label: 'Good', color: 'text-blue-400' },
  fair: { label: 'Fair', color: 'text-amber-400' },
  poor: { label: 'Poor', color: 'text-red-400' },
};

export function getPhotoTips(): PhotoTip[] {
  return [
    { id: 'pt1', category: 'Lighting', tip: 'Use natural daylight or a lightbox for consistent, even illumination', impact: 'high', score: 92 },
    { id: 'pt2', category: 'Background', tip: 'Use a plain black or white background to make the card stand out', impact: 'high', score: 88 },
    { id: 'pt3', category: 'Focus', tip: 'Enable macro mode and ensure the full card surface is sharp', impact: 'high', score: 85 },
    { id: 'pt4', category: 'Angle', tip: 'Shoot directly overhead to avoid perspective distortion', impact: 'medium', score: 78 },
    { id: 'pt5', category: 'Resolution', tip: 'Upload at least 1600x1200px images for zoom capability', impact: 'medium', score: 74 },
    { id: 'pt6', category: 'Edges', tip: 'Show all four corners clearly for condition assessment', impact: 'medium', score: 70 },
    { id: 'pt7', category: 'Color', tip: 'Avoid filters; keep colors true to the actual card', impact: 'low', score: 65 },
    { id: 'pt8', category: 'Multiple Angles', tip: 'Include front, back, and close-up shots of key features', impact: 'high', score: 90 },
  ];
}

export function getPricingRecommendations(): PricingRecommendation[] {
  const analyses = getListingAnalyses();
  return analyses.map((a, i) => ({
    id: `pr-${a.id}`,
    listingId: a.id,
    cardName: a.cardName,
    currentPrice: a.currentPrice,
    recommendedPrice: a.suggestedPrice,
    competitorLow: Math.round(a.currentPrice * 0.8),
    competitorAvg: Math.round(a.currentPrice * 1.02),
    competitorHigh: Math.round(a.currentPrice * 1.3),
    demandLevel: i % 4 === 0 ? 'very_high' : i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    confidence: 60 + Math.round(Math.random() * 35),
    suggestedPrice: a.suggestedPrice,
    minPrice: Math.round(a.currentPrice * 0.7),
    maxPrice: Math.round(a.currentPrice * 1.4),
    marketAverage: Math.round(a.currentPrice * 1.05),
    recentSales: [a.currentPrice, a.suggestedPrice],
    strategy: 'competitive' as const,
    reasoning: 'Based on recent comparable sales and market trends.',
  }));
}

export function getPlatformDistribution(): PlatformDistribution[] {
  const analyses = getListingAnalyses();
  const counts: Record<string, number> = {};
  analyses.forEach(a => { counts[a.platform] = (counts[a.platform] || 0) + 1; });
  return Object.entries(counts).map(([platform, listings]) => ({ platform, listings }));
}

export function getSEOKeywords(): SEOKeyword[] {
  const keywords = [
    { keyword: 'PSA 10', volume: 45000, comp: 'high' as const, rel: 95, trend: true, cat: 'grading' },
    { keyword: 'rookie card', volume: 38000, comp: 'high' as const, rel: 90, trend: true, cat: 'type' },
    { keyword: 'auto', volume: 32000, comp: 'medium' as const, rel: 85, trend: false, cat: 'feature' },
    { keyword: 'numbered', volume: 18000, comp: 'medium' as const, rel: 80, trend: true, cat: 'feature' },
    { keyword: 'refractor', volume: 15000, comp: 'low' as const, rel: 75, trend: false, cat: 'variant' },
    { keyword: 'prizm', volume: 28000, comp: 'high' as const, rel: 88, trend: true, cat: 'product' },
    { keyword: 'topps chrome', volume: 22000, comp: 'medium' as const, rel: 82, trend: false, cat: 'product' },
    { keyword: 'case hit', volume: 9000, comp: 'low' as const, rel: 70, trend: true, cat: 'rarity' },
  ];
  return keywords.map((kw, i) => ({
    id: `seo-${i}`,
    keyword: kw.keyword,
    searchVolume: kw.volume,
    competition: kw.comp,
    relevanceScore: kw.rel,
    relevance: kw.rel,
    trending: kw.trend,
    category: kw.cat,
    platform: 'ebay' as Platform,
    ctrImpact: kw.rel * 0.8,
  }));
}

export function getScoreImprovements(): ScoreImprovement[] {
  return [
    { category: 'Title', before: 52, after: 88 },
    { category: 'Photos', before: 45, after: 82 },
    { category: 'Description', before: 38, after: 79 },
    { category: 'Pricing', before: 61, after: 85 },
    { category: 'SEO', before: 33, after: 76 },
  ];
}

export function getOptimizerSummary(): ListingOptimizerSummary {
  const analyses = getListingAnalyses();
  const photos = getPhotoScores();
  return {
    totalListings: analyses.length,
    avgScore: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length) : 0,
    improvementOpportunities: analyses.filter(a => a.overallScore < 75).length,
    topPlatform: 'eBay',
    avgPhotoScore: photos.length > 0 ? Math.round(photos.reduce((s, p) => s + p.overallScore, 0) / photos.length) : 0,
  };
}

// ---- Widget API Functions ----

export function getListingScores(): { id: string; listingTitle: string; score: number; platform: Platform }[] {
  return getListingAnalyses().map(a => ({
    id: a.id,
    listingTitle: a.currentTitle,
    score: a.overallScore,
    platform: a.platform,
  }));
}

export function getOptimizedListings(): { id: string; listingTitle: string; revenueBoost: number; platform: Platform }[] {
  return getListingAnalyses()
    .filter(a => a.overallScore >= 75)
    .map(a => ({
      id: a.id,
      listingTitle: a.suggestedTitle || a.currentTitle,
      revenueBoost: a.estimatedViewIncrease > 0 ? a.estimatedViewIncrease : Math.round((a.suggestedPrice - a.currentPrice) / a.currentPrice * 100),
      platform: a.platform,
    }));
}

export function getRevenueMetrics(): { totalRevenue: number; boostPercent: number } {
  const analyses = getListingAnalyses();
  const totalRevenue = analyses.reduce((sum, a) => sum + a.estimatedSales * a.suggestedPrice, 0);
  const boostPercent = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.estimatedViewIncrease, 0) / analyses.length)
    : 0;
  return { totalRevenue, boostPercent };
}

export function getListingSummary(): { totalCount: number; pendingCount: number; optimizedCount: number } {
  const analyses = getListingAnalyses();
  const optimized = analyses.filter(a => a.overallScore >= 75).length;
  return {
    totalCount: analyses.length,
    pendingCount: analyses.length - optimized,
    optimizedCount: optimized,
  };
}
