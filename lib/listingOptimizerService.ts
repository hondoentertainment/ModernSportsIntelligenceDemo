// Phase 154: Card Photography & Listing Optimizer
// AI-powered listing analysis, photo scoring, title optimization, pricing recommendations, and competitor analysis

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
  overallScore: number;
  issues: string[];
  improvements: string[];
  estimatedViewIncrease: number;
  estimatedSaleSpeedIncrease: number;
  analyzedDate: string;
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
  sellerName: string;
  sellerRating: number;
  price: number;
  shippingCost: number;
  totalPrice: number;
  photoCount: number;
  photoQuality: 'poor' | 'fair' | 'good' | 'excellent';
  titleQuality: number;
  daysListed: number;
  watchers: number;
  bestOffer: boolean;
  freeShipping: boolean;
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
  trending: boolean;
  category: string;
  platform: Platform;
  ctrImpact: number;
}

export interface TimingRecommendation {
  id: string;
  platform: Platform;
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
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
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

export function getListingAnalyses(): ListingAnalysis[] {
  const cached = loadData<ListingAnalysis[]>('listing_analyses');
  if (cached) return cached;
  saveData('listing_analyses', MOCK_ANALYSES);
  return MOCK_ANALYSES;
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

export function getCompetitorListings(): CompetitorListing[] {
  const cached = loadData<CompetitorListing[]>('competitor_listings');
  if (cached) return cached;
  saveData('competitor_listings', MOCK_COMPETITORS);
  return MOCK_COMPETITORS;
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
