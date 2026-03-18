// ---- Types ----

export type ListingFormat = 'auction' | 'buy-it-now' | 'best-offer';
export type ConditionLabel = 'New/Mint' | 'Like New' | 'Very Good' | 'Good' | 'Acceptable';
export type TemplateStyle = 'minimal' | 'professional' | 'premium' | 'vintage';

export interface ListingDraft {
  id: string;
  cardName: string;
  player: string;
  year: string;
  set: string;
  grade: string;
  generatedTitle: string;
  titleScore: number; // 0-100 SEO score
  description: string;
  htmlTemplate: string;
  suggestedPrice: number;
  format: ListingFormat;
  condition: ConditionLabel;
  shippingCost: number;
  keywords: string[];
  createdAt: string;
  status: 'draft' | 'ready' | 'listed';
}

export interface TitleSuggestion {
  title: string;
  seoScore: number;
  characterCount: number;
  keywordDensity: number;
  reasoning: string;
}

export interface PricingSuggestion {
  startPrice: number;
  buyItNowPrice: number;
  reservePrice: number;
  competitorAvg: number;
  recentSales: number[];
  recommendation: string;
}

export interface ListingTemplate {
  id: string;
  name: string;
  style: TemplateStyle;
  previewHtml: string;
  popularity: number;
}

export interface ListingStats {
  totalListings: number;
  avgSeoScore: number;
  bestPerformingTemplate: string;
  avgDaysToSell: number;
  avgSalePrice: number;
  sellThroughRate: number;
  totalRevenue: number;
}

// ---- Mock Data ----

const mockListings: ListingDraft[] = [
  {
    id: 'el-1',
    cardName: '2024 Topps Chrome Elly De La Cruz #150',
    player: 'Elly De La Cruz',
    year: '2024',
    set: 'Topps Chrome',
    grade: 'PSA 10',
    generatedTitle: '2024 Topps Chrome ELLY DE LA CRUZ #150 PSA 10 GEM MINT Reds RC Rookie',
    titleScore: 94,
    description: 'Up for sale is a gorgeous 2024 Topps Chrome Elly De La Cruz #150 graded PSA 10 Gem Mint. This is one of the hottest rookie cards in the hobby right now. Card is in perfect condition as graded. Ships in a padded bubble mailer with tracking.',
    htmlTemplate: '<div style="font-family:Arial;max-width:800px;margin:0 auto"><h1>2024 Topps Chrome Elly De La Cruz PSA 10</h1><p>Premium rookie card in perfect condition.</p></div>',
    suggestedPrice: 425,
    format: 'buy-it-now',
    condition: 'New/Mint',
    shippingCost: 4.99,
    keywords: ['elly de la cruz', 'topps chrome', '2024', 'psa 10', 'gem mint', 'rookie', 'reds', 'rc'],
    createdAt: '2026-03-15T10:00:00Z',
    status: 'ready',
  },
  {
    id: 'el-2',
    cardName: '2023 Prizm Victor Wembanyama Silver',
    player: 'Victor Wembanyama',
    year: '2023',
    set: 'Prizm',
    grade: 'BGS 9.5',
    generatedTitle: '2023 Panini Prizm VICTOR WEMBANYAMA Silver BGS 9.5 GEM MINT Spurs RC',
    titleScore: 91,
    description: 'Beautiful 2023 Panini Prizm Victor Wembanyama Silver Prizm graded BGS 9.5 Gem Mint. Subgrades: Centering 9.5, Edges 9.5, Corners 9.5, Surface 10. One of the most sought-after rookie cards in basketball.',
    htmlTemplate: '<div style="font-family:Arial;max-width:800px;margin:0 auto"><h1>2023 Prizm Victor Wembanyama Silver BGS 9.5</h1><p>Elite basketball rookie.</p></div>',
    suggestedPrice: 1850,
    format: 'auction',
    condition: 'New/Mint',
    shippingCost: 0,
    keywords: ['wembanyama', 'prizm', 'silver', 'bgs 9.5', 'spurs', 'rookie', 'rc', '2023'],
    createdAt: '2026-03-14T15:30:00Z',
    status: 'draft',
  },
  {
    id: 'el-3',
    cardName: '1986 Fleer Michael Jordan #57',
    player: 'Michael Jordan',
    year: '1986',
    set: 'Fleer',
    grade: 'PSA 7',
    generatedTitle: '1986 Fleer MICHAEL JORDAN #57 Rookie RC PSA 7 NM Bulls HOF GOAT',
    titleScore: 96,
    description: 'Iconic 1986 Fleer Michael Jordan #57 rookie card graded PSA 7 Near Mint. One of the most recognizable cards in the hobby. This is THE card that every serious collector needs in their portfolio.',
    htmlTemplate: '<div style="font-family:Arial;max-width:800px;margin:0 auto"><h1>1986 Fleer Michael Jordan #57 PSA 7</h1><p>The GOAT rookie card.</p></div>',
    suggestedPrice: 18500,
    format: 'best-offer',
    condition: 'Very Good',
    shippingCost: 0,
    keywords: ['michael jordan', '1986 fleer', 'rookie', 'psa 7', 'bulls', 'hof', 'goat', '#57'],
    createdAt: '2026-03-13T08:45:00Z',
    status: 'listed',
  },
];

const mockTitleSuggestions: TitleSuggestion[] = [
  { title: '2024 Topps Chrome ELLY DE LA CRUZ #150 PSA 10 GEM MINT Reds RC Rookie', seoScore: 94, characterCount: 69, keywordDensity: 0.82, reasoning: 'Optimal keyword placement with caps emphasis on player name and grade' },
  { title: 'Elly De La Cruz 2024 Topps Chrome #150 PSA 10 Gem Mint Rookie Card RC', seoScore: 88, characterCount: 68, keywordDensity: 0.78, reasoning: 'Player-first approach, good for name searches' },
  { title: '2024 Topps Chrome Elly De La Cruz Rookie #150 PSA 10 🔥 GEM MINT RC', seoScore: 82, characterCount: 67, keywordDensity: 0.75, reasoning: 'Emoji attracts mobile attention but may reduce search match' },
];

const mockTemplates: ListingTemplate[] = [
  { id: 'tmpl-1', name: 'Clean Professional', style: 'professional', previewHtml: '<div style="border:2px solid #333;padding:20px;font-family:Arial"><h2>Card Title</h2><p>Description</p></div>', popularity: 85 },
  { id: 'tmpl-2', name: 'Minimal Modern', style: 'minimal', previewHtml: '<div style="padding:16px;font-family:system-ui"><h3>Card Title</h3><p>Description</p></div>', popularity: 72 },
  { id: 'tmpl-3', name: 'Premium Showcase', style: 'premium', previewHtml: '<div style="background:#1a1a2e;color:white;padding:24px;font-family:Georgia"><h2>Card Title</h2><p>Description</p></div>', popularity: 68 },
  { id: 'tmpl-4', name: 'Vintage Classic', style: 'vintage', previewHtml: '<div style="background:#fdf6e3;padding:20px;font-family:serif;border:3px double #8b7355"><h2>Card Title</h2><p>Description</p></div>', popularity: 45 },
];

// ---- Service Functions ----

export function getListings(): ListingDraft[] {
  return mockListings;
}

export function getListing(id: string): ListingDraft | undefined {
  return mockListings.find(l => l.id === id);
}

export function getTitleSuggestions(_cardName?: string): TitleSuggestion[] {
  return mockTitleSuggestions;
}

export function getPricingSuggestion(_cardName?: string): PricingSuggestion {
  return {
    startPrice: 350,
    buyItNowPrice: 425,
    reservePrice: 380,
    competitorAvg: 410,
    recentSales: [395, 420, 450, 380, 435, 415],
    recommendation: 'Buy It Now at $425 is competitive — 3.6% above recent average with room for Best Offer at $395+',
  };
}

export function getTemplates(): ListingTemplate[] {
  return mockTemplates;
}

export function getListingStats(): ListingStats {
  return {
    totalListings: mockListings.length,
    avgSeoScore: mockListings.reduce((s, l) => s + l.titleScore, 0) / mockListings.length,
    bestPerformingTemplate: 'Clean Professional',
    avgDaysToSell: 4.2,
    avgSalePrice: 6925,
    sellThroughRate: 0.89,
    totalRevenue: 20775,
  };
}
