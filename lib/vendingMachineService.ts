// Phase 139: AI Vending Machine & Impulse Pack Simulator
// Gamified pack-opening simulator with AI-themed mystery packs, odds tracking, and responsible collecting

// ---- Types ----

export type PackTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type PackTheme =
  | 'vintage_legends'
  | 'modern_rookies'
  | 'graded_gems'
  | 'international_stars'
  | 'error_cards'
  | 'hall_of_fame'
  | 'rising_prospects'
  | 'championship_moments';

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'ultra_rare' | 'legendary';

export interface VendingPack {
  id: string;
  name: string;
  tier: PackTier;
  theme: PackTheme;
  price: number;
  cardsPerPack: number;
  description: string;
  guaranteedRarity: CardRarity;
  imageColor: string;
  available: boolean;
  limitedEdition: boolean;
  stock: number;
}

export interface PackCard {
  id: string;
  player: string;
  year: number;
  set: string;
  cardNumber: string;
  rarity: CardRarity;
  estimatedValue: number;
  sport: string;
  team: string;
  isAuto: boolean;
  isNumbered: boolean;
  serialNumber?: string;
  description: string;
}

export interface OpenedPack {
  id: string;
  packId: string;
  packName: string;
  tier: PackTier;
  theme: PackTheme;
  pricePaid: number;
  cards: PackCard[];
  totalValue: number;
  profit: number;
  openedAt: string;
  streakBonus: boolean;
}

export interface PackHistory {
  totalPacks: number;
  totalSpent: number;
  totalValue: number;
  totalProfit: number;
  bestPull: PackCard | null;
  rarityBreakdown: Record<CardRarity, number>;
  tierBreakdown: Record<PackTier, number>;
}

export interface DailyDeal {
  id: string;
  packId: string;
  packName: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;
  expiresAt: string;
  tier: PackTier;
  theme: PackTheme;
  featured: boolean;
}

export interface CollectorProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPacks: number;
  totalSpent: number;
  totalValue: number;
  streak: number;
  bestPull: string;
  bestPullValue: number;
  joinedAt: string;
  dailyBudget: number;
  weeklyBudget: number;
  spentToday: number;
  spentThisWeek: number;
}

export interface PackOdds {
  packId: string;
  packName: string;
  tier: PackTier;
  odds: { rarity: CardRarity; percentage: number; avgValue: number }[];
  expectedValue: number;
  jackpotChance: number;
}

export interface Jackpot {
  id: string;
  poolAmount: number;
  lastWinner: string;
  lastWinDate: string;
  lastWinAmount: number;
  contributions: number;
  nextDrawDate: string;
  ticketCost: number;
  eligiblePacks: PackTier[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalValue: number;
  bestPull: string;
  bestPullValue: number;
  packsOpened: number;
  roi: number;
  streak: number;
  level: number;
}

export interface SeasonPass {
  id: string;
  seasonName: string;
  currentTier: number;
  maxTiers: number;
  xpEarned: number;
  xpRequired: number;
  rewards: SeasonReward[];
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface SeasonReward {
  tier: number;
  name: string;
  description: string;
  type: 'pack' | 'bonus_xp' | 'exclusive_card' | 'discount' | 'jackpot_ticket';
  value: number;
  claimed: boolean;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_vending_machine';

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

export function getRarityConfig(rarity: CardRarity): { label: string; text: string; bg: string; border: string } {
  switch (rarity) {
    case 'common': return { label: 'Common', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    case 'uncommon': return { label: 'Uncommon', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'rare': return { label: 'Rare', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'ultra_rare': return { label: 'Ultra Rare', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'legendary': return { label: 'Legendary', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  }
}

export function getTierConfig(tier: PackTier): { label: string; text: string; bg: string; border: string } {
  switch (tier) {
    case 'bronze': return { label: 'Bronze', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'silver': return { label: 'Silver', text: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };
    case 'gold': return { label: 'Gold', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 'platinum': return { label: 'Platinum', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    case 'diamond': return { label: 'Diamond', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' };
  }
}

// ---- Mock Data: Available Packs ----

const MOCK_PACKS: VendingPack[] = [
  { id: 'vp-1', name: 'Rookie Rush', tier: 'bronze', theme: 'modern_rookies', price: 2.99, cardsPerPack: 5, description: 'Entry-level pack featuring current year rookies', guaranteedRarity: 'common', imageColor: '#cd7f32', available: true, limitedEdition: false, stock: 999 },
  { id: 'vp-2', name: 'Prospect Pipeline', tier: 'bronze', theme: 'rising_prospects', price: 4.99, cardsPerPack: 5, description: 'Up-and-coming minor league and international prospects', guaranteedRarity: 'common', imageColor: '#cd7f32', available: true, limitedEdition: false, stock: 750 },
  { id: 'vp-3', name: 'Silver Sluggers', tier: 'silver', theme: 'modern_rookies', price: 9.99, cardsPerPack: 7, description: 'Premium rookie pack with guaranteed uncommon or better', guaranteedRarity: 'uncommon', imageColor: '#c0c0c0', available: true, limitedEdition: false, stock: 500 },
  { id: 'vp-4', name: 'International Showcase', tier: 'silver', theme: 'international_stars', price: 12.99, cardsPerPack: 7, description: 'Global talent from NPB, KBO, Liga MX, and European leagues', guaranteedRarity: 'uncommon', imageColor: '#c0c0c0', available: true, limitedEdition: false, stock: 400 },
  { id: 'vp-5', name: 'Golden Legends', tier: 'gold', theme: 'hall_of_fame', price: 24.99, cardsPerPack: 8, description: 'Hall of Famers and all-time greats with rare pull chance', guaranteedRarity: 'rare', imageColor: '#ffd700', available: true, limitedEdition: false, stock: 300 },
  { id: 'vp-6', name: 'Championship Glory', tier: 'gold', theme: 'championship_moments', price: 29.99, cardsPerPack: 8, description: 'Iconic championship performances and World Series heroes', guaranteedRarity: 'rare', imageColor: '#ffd700', available: true, limitedEdition: false, stock: 250 },
  { id: 'vp-7', name: 'Error Card Vault', tier: 'gold', theme: 'error_cards', price: 19.99, cardsPerPack: 6, description: 'Misprints, variations, and error cards collectors love', guaranteedRarity: 'rare', imageColor: '#ffd700', available: true, limitedEdition: true, stock: 150 },
  { id: 'vp-8', name: 'Platinum Prestige', tier: 'platinum', theme: 'graded_gems', price: 49.99, cardsPerPack: 5, description: 'High-grade slabbed cards with ultra rare guarantee', guaranteedRarity: 'ultra_rare', imageColor: '#00ced1', available: true, limitedEdition: false, stock: 200 },
  { id: 'vp-9', name: 'Vintage Vault', tier: 'platinum', theme: 'vintage_legends', price: 59.99, cardsPerPack: 4, description: 'Pre-1980 legends with authenticated vintage cards', guaranteedRarity: 'ultra_rare', imageColor: '#00ced1', available: true, limitedEdition: false, stock: 120 },
  { id: 'vp-10', name: 'Rising Stars Elite', tier: 'platinum', theme: 'rising_prospects', price: 44.99, cardsPerPack: 6, description: 'Top prospect autos and numbered parallels', guaranteedRarity: 'ultra_rare', imageColor: '#00ced1', available: true, limitedEdition: true, stock: 100 },
  { id: 'vp-11', name: 'Diamond Dynasty', tier: 'diamond', theme: 'hall_of_fame', price: 99.99, cardsPerPack: 3, description: 'Premium tier with legendary pull guaranteed', guaranteedRarity: 'legendary', imageColor: '#b9f2ff', available: true, limitedEdition: true, stock: 50 },
  { id: 'vp-12', name: 'Ultimate Collection', tier: 'diamond', theme: 'championship_moments', price: 149.99, cardsPerPack: 5, description: 'The pinnacle pack — multiple legendaries possible', guaranteedRarity: 'legendary', imageColor: '#b9f2ff', available: true, limitedEdition: true, stock: 25 },
];

// ---- Mock Data: Packable Cards (80+) ----

const MOCK_CARDS: PackCard[] = [
  { id: 'pc-1', player: 'Shohei Ohtani', year: 2024, set: 'Topps Chrome', cardNumber: '1', rarity: 'legendary', estimatedValue: 450.00, sport: 'Baseball', team: 'Los Angeles Dodgers', isAuto: true, isNumbered: true, serialNumber: '/25', description: 'Chrome Refractor Auto /25' },
  { id: 'pc-2', player: 'Mike Trout', year: 2023, set: 'Topps Sterling', cardNumber: '15', rarity: 'legendary', estimatedValue: 380.00, sport: 'Baseball', team: 'Los Angeles Angels', isAuto: true, isNumbered: true, serialNumber: '/10', description: 'Patch Auto /10' },
  { id: 'pc-3', player: 'Aaron Judge', year: 2024, set: 'Topps Finest', cardNumber: '62', rarity: 'legendary', estimatedValue: 320.00, sport: 'Baseball', team: 'New York Yankees', isAuto: true, isNumbered: false, description: 'Finest Auto Refractor' },
  { id: 'pc-4', player: 'Ronald Acuna Jr', year: 2024, set: 'Bowman Chrome', cardNumber: '13', rarity: 'legendary', estimatedValue: 290.00, sport: 'Baseball', team: 'Atlanta Braves', isAuto: true, isNumbered: true, serialNumber: '/50', description: 'Gold Refractor Auto /50' },
  { id: 'pc-5', player: 'Elly De La Cruz', year: 2024, set: 'Topps Chrome', cardNumber: '201', rarity: 'ultra_rare', estimatedValue: 185.00, sport: 'Baseball', team: 'Cincinnati Reds', isAuto: true, isNumbered: true, serialNumber: '/99', description: 'Rookie Auto Refractor /99' },
  { id: 'pc-6', player: 'Gunnar Henderson', year: 2024, set: 'Topps Series 1', cardNumber: '350', rarity: 'ultra_rare', estimatedValue: 165.00, sport: 'Baseball', team: 'Baltimore Orioles', isAuto: true, isNumbered: false, description: 'Rookie Debut Auto' },
  { id: 'pc-7', player: 'Paul Skenes', year: 2024, set: 'Bowman Draft', cardNumber: '100', rarity: 'ultra_rare', estimatedValue: 210.00, sport: 'Baseball', team: 'Pittsburgh Pirates', isAuto: true, isNumbered: true, serialNumber: '/150', description: '1st Bowman Chrome Auto /150' },
  { id: 'pc-8', player: 'Jackson Holliday', year: 2024, set: 'Topps Chrome', cardNumber: '215', rarity: 'ultra_rare', estimatedValue: 155.00, sport: 'Baseball', team: 'Baltimore Orioles', isAuto: false, isNumbered: true, serialNumber: '/50', description: 'Gold Refractor /50' },
  { id: 'pc-9', player: 'Wyatt Langford', year: 2024, set: 'Topps Update', cardNumber: '312', rarity: 'ultra_rare', estimatedValue: 140.00, sport: 'Baseball', team: 'Texas Rangers', isAuto: true, isNumbered: false, description: 'Rookie Auto' },
  { id: 'pc-10', player: 'Junior Caminero', year: 2024, set: 'Bowman Chrome', cardNumber: '88', rarity: 'ultra_rare', estimatedValue: 130.00, sport: 'Baseball', team: 'Tampa Bay Rays', isAuto: true, isNumbered: true, serialNumber: '/250', description: 'Prospect Auto /250' },
  { id: 'pc-11', player: 'Victor Wembanyama', year: 2024, set: 'Panini Prizm', cardNumber: '1', rarity: 'legendary', estimatedValue: 520.00, sport: 'Basketball', team: 'San Antonio Spurs', isAuto: true, isNumbered: true, serialNumber: '/25', description: 'Prizm Silver Auto /25' },
  { id: 'pc-12', player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', cardNumber: '301', rarity: 'ultra_rare', estimatedValue: 175.00, sport: 'Football', team: 'Chicago Bears', isAuto: false, isNumbered: true, serialNumber: '/75', description: 'Silver Prizm /75' },
  { id: 'pc-13', player: 'Jayden Daniels', year: 2024, set: 'Panini Select', cardNumber: '200', rarity: 'ultra_rare', estimatedValue: 195.00, sport: 'Football', team: 'Washington Commanders', isAuto: true, isNumbered: true, serialNumber: '/99', description: 'Concourse Auto /99' },
  { id: 'pc-14', player: 'Marvin Harrison Jr', year: 2024, set: 'Panini Prizm', cardNumber: '310', rarity: 'ultra_rare', estimatedValue: 160.00, sport: 'Football', team: 'Arizona Cardinals', isAuto: false, isNumbered: false, description: 'Green Prizm RC' },
  { id: 'pc-15', player: 'Chet Holmgren', year: 2024, set: 'Panini Select', cardNumber: '55', rarity: 'rare', estimatedValue: 85.00, sport: 'Basketball', team: 'Oklahoma City Thunder', isAuto: false, isNumbered: true, serialNumber: '/149', description: 'Courtside Silver /149' },
  { id: 'pc-16', player: 'Anthony Edwards', year: 2024, set: 'Panini Prizm', cardNumber: '22', rarity: 'rare', estimatedValue: 95.00, sport: 'Basketball', team: 'Minnesota Timberwolves', isAuto: false, isNumbered: false, description: 'Red White Blue Prizm' },
  { id: 'pc-17', player: 'Corbin Carroll', year: 2024, set: 'Topps Chrome', cardNumber: '125', rarity: 'rare', estimatedValue: 72.00, sport: 'Baseball', team: 'Arizona Diamondbacks', isAuto: false, isNumbered: false, description: 'Pink Refractor' },
  { id: 'pc-18', player: 'Julio Rodriguez', year: 2024, set: 'Topps Series 2', cardNumber: '410', rarity: 'rare', estimatedValue: 68.00, sport: 'Baseball', team: 'Seattle Mariners', isAuto: false, isNumbered: false, description: 'SP Image Variation' },
  { id: 'pc-19', player: 'Adley Rutschman', year: 2024, set: 'Topps Chrome', cardNumber: '150', rarity: 'rare', estimatedValue: 55.00, sport: 'Baseball', team: 'Baltimore Orioles', isAuto: false, isNumbered: false, description: 'Sepia Refractor' },
  { id: 'pc-20', player: 'Bobby Witt Jr', year: 2024, set: 'Topps Finest', cardNumber: '44', rarity: 'rare', estimatedValue: 78.00, sport: 'Baseball', team: 'Kansas City Royals', isAuto: false, isNumbered: true, serialNumber: '/299', description: 'Green Refractor /299' },
  { id: 'pc-21', player: 'Mookie Betts', year: 2024, set: 'Topps Chrome', cardNumber: '50', rarity: 'rare', estimatedValue: 62.00, sport: 'Baseball', team: 'Los Angeles Dodgers', isAuto: false, isNumbered: false, description: 'Refractor' },
  { id: 'pc-22', player: 'Juan Soto', year: 2024, set: 'Topps Series 1', cardNumber: '22', rarity: 'rare', estimatedValue: 58.00, sport: 'Baseball', team: 'New York Mets', isAuto: false, isNumbered: false, description: 'Photo Variation SP' },
  { id: 'pc-23', player: 'Trea Turner', year: 2024, set: 'Topps Heritage', cardNumber: '100', rarity: 'rare', estimatedValue: 45.00, sport: 'Baseball', team: 'Philadelphia Phillies', isAuto: false, isNumbered: false, description: 'Chrome Refractor' },
  { id: 'pc-24', player: 'Ichiro Suzuki', year: 2001, set: 'Topps Chrome', cardNumber: '151', rarity: 'legendary', estimatedValue: 650.00, sport: 'Baseball', team: 'Seattle Mariners', isAuto: false, isNumbered: false, description: 'Rookie Refractor' },
  { id: 'pc-25', player: 'Ken Griffey Jr', year: 1989, set: 'Upper Deck', cardNumber: '1', rarity: 'legendary', estimatedValue: 420.00, sport: 'Baseball', team: 'Seattle Mariners', isAuto: false, isNumbered: false, description: 'Star Rookie' },
  { id: 'pc-26', player: 'Derek Jeter', year: 1993, set: 'SP', cardNumber: '279', rarity: 'legendary', estimatedValue: 580.00, sport: 'Baseball', team: 'New York Yankees', isAuto: false, isNumbered: false, description: 'Foil Rookie' },
  { id: 'pc-27', player: 'Travis Bazzana', year: 2024, set: 'Bowman Draft', cardNumber: '1', rarity: 'ultra_rare', estimatedValue: 145.00, sport: 'Baseball', team: 'Cleveland Guardians', isAuto: true, isNumbered: false, description: '1st Bowman Chrome Auto' },
  { id: 'pc-28', player: 'Charlie Condon', year: 2024, set: 'Bowman Draft', cardNumber: '2', rarity: 'rare', estimatedValue: 82.00, sport: 'Baseball', team: 'Colorado Rockies', isAuto: false, isNumbered: true, serialNumber: '/150', description: '1st Bowman Chrome /150' },
  { id: 'pc-29', player: 'Ethan Salas', year: 2024, set: 'Bowman Chrome', cardNumber: '50', rarity: 'ultra_rare', estimatedValue: 195.00, sport: 'Baseball', team: 'San Diego Padres', isAuto: true, isNumbered: false, description: '1st Bowman Chrome Auto' },
  { id: 'pc-30', player: 'Jasson Dominguez', year: 2024, set: 'Topps Chrome', cardNumber: '220', rarity: 'rare', estimatedValue: 88.00, sport: 'Baseball', team: 'New York Yankees', isAuto: false, isNumbered: false, description: 'Refractor RC' },
  { id: 'pc-31', player: 'Yoshinobu Yamamoto', year: 2024, set: 'Topps Update', cardNumber: 'US1', rarity: 'rare', estimatedValue: 75.00, sport: 'Baseball', team: 'Los Angeles Dodgers', isAuto: false, isNumbered: false, description: 'Rookie Debut' },
  { id: 'pc-32', player: 'Shota Imanaga', year: 2024, set: 'Topps Chrome', cardNumber: '225', rarity: 'uncommon', estimatedValue: 32.00, sport: 'Baseball', team: 'Chicago Cubs', isAuto: false, isNumbered: false, description: 'Base RC' },
  { id: 'pc-33', player: 'Malik Nabers', year: 2024, set: 'Panini Prizm', cardNumber: '315', rarity: 'rare', estimatedValue: 92.00, sport: 'Football', team: 'New York Giants', isAuto: false, isNumbered: false, description: 'Silver Prizm RC' },
  { id: 'pc-34', player: 'Rome Odunze', year: 2024, set: 'Panini Prizm', cardNumber: '320', rarity: 'uncommon', estimatedValue: 28.00, sport: 'Football', team: 'Chicago Bears', isAuto: false, isNumbered: false, description: 'Base Prizm RC' },
  { id: 'pc-35', player: 'Bo Nix', year: 2024, set: 'Panini Donruss', cardNumber: '301', rarity: 'uncommon', estimatedValue: 22.00, sport: 'Football', team: 'Denver Broncos', isAuto: false, isNumbered: false, description: 'Rated Rookie' },
  { id: 'pc-36', player: 'Drake Maye', year: 2024, set: 'Panini Prizm', cardNumber: '305', rarity: 'rare', estimatedValue: 65.00, sport: 'Football', team: 'New England Patriots', isAuto: false, isNumbered: false, description: 'Red White Blue Prizm RC' },
  { id: 'pc-37', player: 'Reed Sheppard', year: 2024, set: 'Panini Prizm', cardNumber: '250', rarity: 'rare', estimatedValue: 88.00, sport: 'Basketball', team: 'Houston Rockets', isAuto: false, isNumbered: false, description: 'Silver Prizm RC' },
  { id: 'pc-38', player: 'Alexandre Sarr', year: 2024, set: 'Panini Select', cardNumber: '201', rarity: 'uncommon', estimatedValue: 35.00, sport: 'Basketball', team: 'Washington Wizards', isAuto: false, isNumbered: false, description: 'Concourse RC' },
  { id: 'pc-39', player: 'Zach Edey', year: 2024, set: 'Panini Prizm', cardNumber: '260', rarity: 'uncommon', estimatedValue: 25.00, sport: 'Basketball', team: 'Memphis Grizzlies', isAuto: false, isNumbered: false, description: 'Base Prizm RC' },
  { id: 'pc-40', player: 'Nolan Ryan', year: 1968, set: 'Topps', cardNumber: '177', rarity: 'legendary', estimatedValue: 1200.00, sport: 'Baseball', team: 'New York Mets', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-41', player: 'Hank Aaron', year: 1954, set: 'Topps', cardNumber: '128', rarity: 'legendary', estimatedValue: 2500.00, sport: 'Baseball', team: 'Milwaukee Braves', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-42', player: 'Roberto Clemente', year: 1955, set: 'Topps', cardNumber: '164', rarity: 'legendary', estimatedValue: 1800.00, sport: 'Baseball', team: 'Pittsburgh Pirates', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-43', player: 'Fernando Tatis Jr', year: 2024, set: 'Topps Chrome', cardNumber: '23', rarity: 'uncommon', estimatedValue: 28.00, sport: 'Baseball', team: 'San Diego Padres', isAuto: false, isNumbered: false, description: 'Base Refractor' },
  { id: 'pc-44', player: 'Freddie Freeman', year: 2024, set: 'Topps Series 1', cardNumber: '5', rarity: 'uncommon', estimatedValue: 18.00, sport: 'Baseball', team: 'Los Angeles Dodgers', isAuto: false, isNumbered: false, description: 'Gold Parallel /2024' },
  { id: 'pc-45', player: 'Bryce Harper', year: 2024, set: 'Topps Chrome', cardNumber: '3', rarity: 'uncommon', estimatedValue: 22.00, sport: 'Baseball', team: 'Philadelphia Phillies', isAuto: false, isNumbered: false, description: 'Refractor' },
  { id: 'pc-46', player: 'Marcus Stroman', year: 2024, set: 'Topps Heritage', cardNumber: '55', rarity: 'common', estimatedValue: 3.00, sport: 'Baseball', team: 'New York Yankees', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-47', player: 'Kyle Tucker', year: 2024, set: 'Topps Series 2', cardNumber: '285', rarity: 'common', estimatedValue: 5.00, sport: 'Baseball', team: 'Houston Astros', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-48', player: 'Rafael Devers', year: 2024, set: 'Topps Chrome', cardNumber: '11', rarity: 'common', estimatedValue: 4.00, sport: 'Baseball', team: 'Boston Red Sox', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-49', player: 'Corey Seager', year: 2024, set: 'Topps Series 1', cardNumber: '175', rarity: 'common', estimatedValue: 3.50, sport: 'Baseball', team: 'Texas Rangers', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-50', player: 'Pete Alonso', year: 2024, set: 'Topps Chrome', cardNumber: '20', rarity: 'common', estimatedValue: 3.00, sport: 'Baseball', team: 'New York Mets', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-51', player: 'Vladimir Guerrero Jr', year: 2024, set: 'Topps Series 1', cardNumber: '27', rarity: 'uncommon', estimatedValue: 15.00, sport: 'Baseball', team: 'Toronto Blue Jays', isAuto: false, isNumbered: false, description: 'Rainbow Foil' },
  { id: 'pc-52', player: 'Matt Olson', year: 2024, set: 'Topps Chrome', cardNumber: '28', rarity: 'common', estimatedValue: 2.50, sport: 'Baseball', team: 'Atlanta Braves', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-53', player: 'Yordan Alvarez', year: 2024, set: 'Topps Finest', cardNumber: '10', rarity: 'uncommon', estimatedValue: 18.00, sport: 'Baseball', team: 'Houston Astros', isAuto: false, isNumbered: false, description: 'Base Refractor' },
  { id: 'pc-54', player: 'Luka Doncic', year: 2024, set: 'Panini Prizm', cardNumber: '77', rarity: 'rare', estimatedValue: 95.00, sport: 'Basketball', team: 'Dallas Mavericks', isAuto: false, isNumbered: false, description: 'Silver Prizm' },
  { id: 'pc-55', player: 'Patrick Mahomes', year: 2024, set: 'Panini Prizm', cardNumber: '15', rarity: 'rare', estimatedValue: 75.00, sport: 'Football', team: 'Kansas City Chiefs', isAuto: false, isNumbered: false, description: 'Silver Prizm' },
  { id: 'pc-56', player: 'Josh Allen', year: 2024, set: 'Panini Select', cardNumber: '17', rarity: 'uncommon', estimatedValue: 35.00, sport: 'Football', team: 'Buffalo Bills', isAuto: false, isNumbered: false, description: 'Concourse' },
  { id: 'pc-57', player: 'Lamar Jackson', year: 2024, set: 'Panini Prizm', cardNumber: '8', rarity: 'uncommon', estimatedValue: 30.00, sport: 'Football', team: 'Baltimore Ravens', isAuto: false, isNumbered: false, description: 'Base Prizm' },
  { id: 'pc-58', player: 'Stephen Curry', year: 2024, set: 'Panini Prizm', cardNumber: '30', rarity: 'uncommon', estimatedValue: 28.00, sport: 'Basketball', team: 'Golden State Warriors', isAuto: false, isNumbered: false, description: 'Base Prizm' },
  { id: 'pc-59', player: 'LeBron James', year: 2024, set: 'Panini Prizm', cardNumber: '23', rarity: 'rare', estimatedValue: 110.00, sport: 'Basketball', team: 'Los Angeles Lakers', isAuto: false, isNumbered: false, description: 'Silver Prizm' },
  { id: 'pc-60', player: 'Jalen Brunson', year: 2024, set: 'Panini Select', cardNumber: '11', rarity: 'common', estimatedValue: 8.00, sport: 'Basketball', team: 'New York Knicks', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-61', player: 'Shai Gilgeous-Alexander', year: 2024, set: 'Panini Prizm', cardNumber: '2', rarity: 'uncommon', estimatedValue: 42.00, sport: 'Basketball', team: 'Oklahoma City Thunder', isAuto: false, isNumbered: false, description: 'Red White Blue Prizm' },
  { id: 'pc-62', player: 'Joe Burrow', year: 2024, set: 'Panini Prizm', cardNumber: '9', rarity: 'common', estimatedValue: 12.00, sport: 'Football', team: 'Cincinnati Bengals', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-63', player: 'CJ Stroud', year: 2024, set: 'Panini Prizm', cardNumber: '302', rarity: 'uncommon', estimatedValue: 38.00, sport: 'Football', team: 'Houston Texans', isAuto: false, isNumbered: false, description: 'Green Prizm' },
  { id: 'pc-64', player: 'Masataka Yoshida', year: 2024, set: 'Topps Series 1', cardNumber: '168', rarity: 'common', estimatedValue: 4.00, sport: 'Baseball', team: 'Boston Red Sox', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-65', player: 'Spencer Strider', year: 2024, set: 'Topps Chrome', cardNumber: '99', rarity: 'common', estimatedValue: 5.00, sport: 'Baseball', team: 'Atlanta Braves', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-66', player: 'Marcus Semien', year: 2024, set: 'Topps Heritage', cardNumber: '75', rarity: 'common', estimatedValue: 2.00, sport: 'Baseball', team: 'Texas Rangers', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-67', player: 'Mickey Mantle', year: 1956, set: 'Topps', cardNumber: '135', rarity: 'legendary', estimatedValue: 5000.00, sport: 'Baseball', team: 'New York Yankees', isAuto: false, isNumbered: false, description: 'Triple Crown Year' },
  { id: 'pc-68', player: 'Willie Mays', year: 1952, set: 'Topps', cardNumber: '261', rarity: 'legendary', estimatedValue: 3800.00, sport: 'Baseball', team: 'New York Giants', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-69', player: 'Sandy Koufax', year: 1955, set: 'Topps', cardNumber: '123', rarity: 'legendary', estimatedValue: 1500.00, sport: 'Baseball', team: 'Brooklyn Dodgers', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-70', player: 'Reggie Jackson', year: 1969, set: 'Topps', cardNumber: '260', rarity: 'ultra_rare', estimatedValue: 350.00, sport: 'Baseball', team: 'Oakland Athletics', isAuto: false, isNumbered: false, description: 'Rookie Card' },
  { id: 'pc-71', player: 'Ohtani 2018 Error', year: 2018, set: 'Topps Update', cardNumber: 'US1e', rarity: 'ultra_rare', estimatedValue: 280.00, sport: 'Baseball', team: 'Los Angeles Angels', isAuto: false, isNumbered: false, description: 'Wrong Photo Variation Error' },
  { id: 'pc-72', player: 'Jeter 1993 Error', year: 1993, set: 'SP', cardNumber: '279e', rarity: 'ultra_rare', estimatedValue: 320.00, sport: 'Baseball', team: 'New York Yankees', isAuto: false, isNumbered: false, description: 'Miscut Factory Error' },
  { id: 'pc-73', player: 'Masyn Winn', year: 2024, set: 'Topps Chrome', cardNumber: '230', rarity: 'uncommon', estimatedValue: 18.00, sport: 'Baseball', team: 'St. Louis Cardinals', isAuto: false, isNumbered: false, description: 'Base RC' },
  { id: 'pc-74', player: 'Jordan Walker', year: 2024, set: 'Topps Series 2', cardNumber: '355', rarity: 'common', estimatedValue: 6.00, sport: 'Baseball', team: 'St. Louis Cardinals', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-75', player: 'Evan Carter', year: 2024, set: 'Topps Chrome', cardNumber: '218', rarity: 'uncommon', estimatedValue: 22.00, sport: 'Baseball', team: 'Texas Rangers', isAuto: false, isNumbered: false, description: 'Base RC Refractor' },
  { id: 'pc-76', player: 'Jung Hoo Lee', year: 2024, set: 'Topps Update', cardNumber: 'US50', rarity: 'uncommon', estimatedValue: 15.00, sport: 'Baseball', team: 'San Francisco Giants', isAuto: false, isNumbered: false, description: 'Rookie Debut' },
  { id: 'pc-77', player: 'Ceddanne Rafaela', year: 2024, set: 'Topps Chrome', cardNumber: '240', rarity: 'common', estimatedValue: 8.00, sport: 'Baseball', team: 'Boston Red Sox', isAuto: false, isNumbered: false, description: 'Base RC' },
  { id: 'pc-78', player: 'Colton Cowser', year: 2024, set: 'Topps Series 1', cardNumber: '330', rarity: 'common', estimatedValue: 5.00, sport: 'Baseball', team: 'Baltimore Orioles', isAuto: false, isNumbered: false, description: 'Base RC' },
  { id: 'pc-79', player: 'Yuki Matsui', year: 2024, set: 'Topps Chrome', cardNumber: '245', rarity: 'common', estimatedValue: 4.50, sport: 'Baseball', team: 'San Diego Padres', isAuto: false, isNumbered: false, description: 'Base RC' },
  { id: 'pc-80', player: 'Michael Busch', year: 2024, set: 'Topps Update', cardNumber: 'US75', rarity: 'common', estimatedValue: 3.00, sport: 'Baseball', team: 'Chicago Cubs', isAuto: false, isNumbered: false, description: 'Rookie Debut' },
  { id: 'pc-81', player: 'Brice Turang', year: 2024, set: 'Topps Series 2', cardNumber: '400', rarity: 'common', estimatedValue: 2.50, sport: 'Baseball', team: 'Milwaukee Brewers', isAuto: false, isNumbered: false, description: 'Base' },
  { id: 'pc-82', player: 'Brooks Lee', year: 2024, set: 'Bowman Chrome', cardNumber: '101', rarity: 'uncommon', estimatedValue: 20.00, sport: 'Baseball', team: 'Minnesota Twins', isAuto: false, isNumbered: false, description: '1st Bowman Chrome' },
  { id: 'pc-83', player: 'Jace Jung', year: 2024, set: 'Bowman Chrome', cardNumber: '115', rarity: 'uncommon', estimatedValue: 15.00, sport: 'Baseball', team: 'Detroit Tigers', isAuto: false, isNumbered: false, description: '1st Bowman Chrome' },
  { id: 'pc-84', player: 'JJ McCarthy', year: 2024, set: 'Panini Prizm', cardNumber: '330', rarity: 'uncommon', estimatedValue: 30.00, sport: 'Football', team: 'Minnesota Vikings', isAuto: false, isNumbered: false, description: 'Base Prizm RC' },
  { id: 'pc-85', player: 'Nikola Jokic', year: 2024, set: 'Panini Prizm', cardNumber: '15', rarity: 'rare', estimatedValue: 80.00, sport: 'Basketball', team: 'Denver Nuggets', isAuto: false, isNumbered: false, description: 'Silver Prizm' },
];

// ---- Mock Data: Opened Packs ----

const MOCK_OPENED_PACKS: OpenedPack[] = [
  { id: 'op-1', packId: 'vp-1', packName: 'Rookie Rush', tier: 'bronze', theme: 'modern_rookies', pricePaid: 2.99, cards: [MOCK_CARDS[76], MOCK_CARDS[77], MOCK_CARDS[73], MOCK_CARDS[79], MOCK_CARDS[80]], totalValue: 23.50, profit: 20.51, openedAt: '2025-12-01T10:00:00Z', streakBonus: false },
  { id: 'op-2', packId: 'vp-3', packName: 'Silver Sluggers', tier: 'silver', theme: 'modern_rookies', pricePaid: 9.99, cards: [MOCK_CARDS[31], MOCK_CARDS[43], MOCK_CARDS[44], MOCK_CARDS[46], MOCK_CARDS[47], MOCK_CARDS[48], MOCK_CARDS[74]], totalValue: 72.00, profit: 62.01, openedAt: '2025-12-03T14:30:00Z', streakBonus: true },
  { id: 'op-3', packId: 'vp-5', packName: 'Golden Legends', tier: 'gold', theme: 'hall_of_fame', pricePaid: 24.99, cards: [MOCK_CARDS[15], MOCK_CARDS[20], MOCK_CARDS[21], MOCK_CARDS[50], MOCK_CARDS[52], MOCK_CARDS[44], MOCK_CARDS[46], MOCK_CARDS[47]], totalValue: 219.50, profit: 194.51, openedAt: '2025-12-05T09:15:00Z', streakBonus: false },
  { id: 'op-4', packId: 'vp-8', packName: 'Platinum Prestige', tier: 'platinum', theme: 'graded_gems', pricePaid: 49.99, cards: [MOCK_CARDS[4], MOCK_CARDS[14], MOCK_CARDS[19], MOCK_CARDS[22], MOCK_CARDS[43]], totalValue: 367.00, profit: 317.01, openedAt: '2025-12-07T16:45:00Z', streakBonus: true },
  { id: 'op-5', packId: 'vp-2', packName: 'Prospect Pipeline', tier: 'bronze', theme: 'rising_prospects', pricePaid: 4.99, cards: [MOCK_CARDS[81], MOCK_CARDS[82], MOCK_CARDS[74], MOCK_CARDS[79], MOCK_CARDS[80]], totalValue: 43.50, profit: 38.51, openedAt: '2025-12-09T11:20:00Z', streakBonus: false },
  { id: 'op-6', packId: 'vp-11', packName: 'Diamond Dynasty', tier: 'diamond', theme: 'hall_of_fame', pricePaid: 99.99, cards: [MOCK_CARDS[0], MOCK_CARDS[2], MOCK_CARDS[24]], totalValue: 1190.00, profit: 1090.01, openedAt: '2025-12-10T08:00:00Z', streakBonus: false },
  { id: 'op-7', packId: 'vp-4', packName: 'International Showcase', tier: 'silver', theme: 'international_stars', pricePaid: 12.99, cards: [MOCK_CARDS[30], MOCK_CARDS[31], MOCK_CARDS[75], MOCK_CARDS[63], MOCK_CARDS[78], MOCK_CARDS[46], MOCK_CARDS[64]], totalValue: 135.50, profit: 122.51, openedAt: '2025-12-12T13:10:00Z', streakBonus: true },
  { id: 'op-8', packId: 'vp-6', packName: 'Championship Glory', tier: 'gold', theme: 'championship_moments', pricePaid: 29.99, cards: [MOCK_CARDS[17], MOCK_CARDS[20], MOCK_CARDS[54], MOCK_CARDS[55], MOCK_CARDS[56], MOCK_CARDS[48], MOCK_CARDS[49], MOCK_CARDS[46]], totalValue: 206.50, profit: 176.51, openedAt: '2025-12-14T17:30:00Z', streakBonus: false },
  { id: 'op-9', packId: 'vp-9', packName: 'Vintage Vault', tier: 'platinum', theme: 'vintage_legends', pricePaid: 59.99, cards: [MOCK_CARDS[23], MOCK_CARDS[69], MOCK_CARDS[42], MOCK_CARDS[68]], totalValue: 2578.00, profit: 2518.01, openedAt: '2025-12-15T10:45:00Z', streakBonus: true },
  { id: 'op-10', packId: 'vp-7', packName: 'Error Card Vault', tier: 'gold', theme: 'error_cards', pricePaid: 19.99, cards: [MOCK_CARDS[70], MOCK_CARDS[71], MOCK_CARDS[17], MOCK_CARDS[29], MOCK_CARDS[43], MOCK_CARDS[46]], totalValue: 676.00, profit: 656.01, openedAt: '2025-12-16T09:00:00Z', streakBonus: false },
  { id: 'op-11', packId: 'vp-1', packName: 'Rookie Rush', tier: 'bronze', theme: 'modern_rookies', pricePaid: 2.99, cards: [MOCK_CARDS[33], MOCK_CARDS[34], MOCK_CARDS[38], MOCK_CARDS[78], MOCK_CARDS[80]], totalValue: 63.50, profit: 60.51, openedAt: '2025-12-17T14:00:00Z', streakBonus: false },
  { id: 'op-12', packId: 'vp-12', packName: 'Ultimate Collection', tier: 'diamond', theme: 'championship_moments', pricePaid: 149.99, cards: [MOCK_CARDS[1], MOCK_CARDS[10], MOCK_CARDS[3], MOCK_CARDS[6], MOCK_CARDS[12]], totalValue: 1695.00, profit: 1545.01, openedAt: '2025-12-18T19:30:00Z', streakBonus: true },
  { id: 'op-13', packId: 'vp-3', packName: 'Silver Sluggers', tier: 'silver', theme: 'modern_rookies', pricePaid: 9.99, cards: [MOCK_CARDS[72], MOCK_CARDS[73], MOCK_CARDS[46], MOCK_CARDS[47], MOCK_CARDS[48], MOCK_CARDS[64], MOCK_CARDS[65]], totalValue: 38.50, profit: 28.51, openedAt: '2025-12-20T11:00:00Z', streakBonus: false },
  { id: 'op-14', packId: 'vp-5', packName: 'Golden Legends', tier: 'gold', theme: 'hall_of_fame', pricePaid: 24.99, cards: [MOCK_CARDS[53], MOCK_CARDS[58], MOCK_CARDS[16], MOCK_CARDS[17], MOCK_CARDS[43], MOCK_CARDS[56], MOCK_CARDS[49], MOCK_CARDS[62]], totalValue: 304.00, profit: 279.01, openedAt: '2025-12-22T08:30:00Z', streakBonus: true },
  { id: 'op-15', packId: 'vp-10', packName: 'Rising Stars Elite', tier: 'platinum', theme: 'rising_prospects', pricePaid: 44.99, cards: [MOCK_CARDS[26], MOCK_CARDS[28], MOCK_CARDS[27], MOCK_CARDS[81], MOCK_CARDS[82], MOCK_CARDS[74]], totalValue: 477.00, profit: 432.01, openedAt: '2025-12-23T15:20:00Z', streakBonus: false },
  { id: 'op-16', packId: 'vp-2', packName: 'Prospect Pipeline', tier: 'bronze', theme: 'rising_prospects', pricePaid: 4.99, cards: [MOCK_CARDS[83], MOCK_CARDS[75], MOCK_CARDS[78], MOCK_CARDS[80], MOCK_CARDS[65]], totalValue: 50.00, profit: 45.01, openedAt: '2025-12-24T10:00:00Z', streakBonus: true },
  { id: 'op-17', packId: 'vp-6', packName: 'Championship Glory', tier: 'gold', theme: 'championship_moments', pricePaid: 29.99, cards: [MOCK_CARDS[54], MOCK_CARDS[84], MOCK_CARDS[57], MOCK_CARDS[60], MOCK_CARDS[61], MOCK_CARDS[62], MOCK_CARDS[49], MOCK_CARDS[47]], totalValue: 258.50, profit: 228.51, openedAt: '2025-12-26T13:45:00Z', streakBonus: false },
  { id: 'op-18', packId: 'vp-8', packName: 'Platinum Prestige', tier: 'platinum', theme: 'graded_gems', pricePaid: 49.99, cards: [MOCK_CARDS[7], MOCK_CARDS[8], MOCK_CARDS[9], MOCK_CARDS[19], MOCK_CARDS[22]], totalValue: 535.00, profit: 485.01, openedAt: '2025-12-28T09:15:00Z', streakBonus: true },
  { id: 'op-19', packId: 'vp-4', packName: 'International Showcase', tier: 'silver', theme: 'international_stars', pricePaid: 12.99, cards: [MOCK_CARDS[75], MOCK_CARDS[31], MOCK_CARDS[78], MOCK_CARDS[63], MOCK_CARDS[64], MOCK_CARDS[46], MOCK_CARDS[66]], totalValue: 44.50, profit: 31.51, openedAt: '2025-12-30T16:00:00Z', streakBonus: false },
  { id: 'op-20', packId: 'vp-11', packName: 'Diamond Dynasty', tier: 'diamond', theme: 'hall_of_fame', pricePaid: 99.99, cards: [MOCK_CARDS[25], MOCK_CARDS[40], MOCK_CARDS[67]], totalValue: 3080.00, profit: 2980.01, openedAt: '2026-01-02T10:00:00Z', streakBonus: true },
];

// ---- Mock Data: Daily Deals ----

const MOCK_DAILY_DEALS: DailyDeal[] = [
  { id: 'dd-1', packId: 'vp-5', packName: 'Golden Legends', originalPrice: 24.99, dealPrice: 17.49, discount: 30, expiresAt: '2026-03-15T23:59:59Z', tier: 'gold', theme: 'hall_of_fame', featured: true },
  { id: 'dd-2', packId: 'vp-3', packName: 'Silver Sluggers', originalPrice: 9.99, dealPrice: 6.99, discount: 30, expiresAt: '2026-03-15T23:59:59Z', tier: 'silver', theme: 'modern_rookies', featured: false },
  { id: 'dd-3', packId: 'vp-8', packName: 'Platinum Prestige', originalPrice: 49.99, dealPrice: 39.99, discount: 20, expiresAt: '2026-03-15T23:59:59Z', tier: 'platinum', theme: 'graded_gems', featured: false },
  { id: 'dd-4', packId: 'vp-7', packName: 'Error Card Vault', originalPrice: 19.99, dealPrice: 12.99, discount: 35, expiresAt: '2026-03-15T23:59:59Z', tier: 'gold', theme: 'error_cards', featured: false },
  { id: 'dd-5', packId: 'vp-10', packName: 'Rising Stars Elite', originalPrice: 44.99, dealPrice: 34.99, discount: 22, expiresAt: '2026-03-15T23:59:59Z', tier: 'platinum', theme: 'rising_prospects', featured: false },
];

// ---- Mock Data: Jackpot ----

const MOCK_JACKPOT: Jackpot = {
  id: 'jp-1',
  poolAmount: 12450.00,
  lastWinner: 'CardKing2024',
  lastWinDate: '2026-02-28',
  lastWinAmount: 8750.00,
  contributions: 1843,
  nextDrawDate: '2026-03-22',
  ticketCost: 1.99,
  eligiblePacks: ['gold', 'platinum', 'diamond'],
};

// ---- Mock Data: Leaderboard ----

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'PackMaster9000', totalValue: 28450.00, bestPull: 'Mickey Mantle 1956 Topps', bestPullValue: 5000.00, packsOpened: 342, roi: 385.2, streak: 14, level: 45 },
  { rank: 2, username: 'CardKing2024', totalValue: 22180.00, bestPull: 'Willie Mays 1952 Topps', bestPullValue: 3800.00, packsOpened: 289, roi: 312.7, streak: 8, level: 42 },
  { rank: 3, username: 'VintageHunter', totalValue: 19320.00, bestPull: 'Roberto Clemente 1955 Topps', bestPullValue: 1800.00, packsOpened: 256, roi: 278.4, streak: 22, level: 39 },
  { rank: 4, username: 'RookieChaser', totalValue: 15890.00, bestPull: 'Wembanyama Prizm Auto /25', bestPullValue: 520.00, packsOpened: 412, roi: 195.3, streak: 5, level: 38 },
  { rank: 5, username: 'DiamondDigger', totalValue: 14250.00, bestPull: 'Nolan Ryan 1968 Rookie', bestPullValue: 1200.00, packsOpened: 198, roi: 245.8, streak: 11, level: 36 },
  { rank: 6, username: 'SlabCollector', totalValue: 12780.00, bestPull: 'Ohtani Chrome Auto /25', bestPullValue: 450.00, packsOpened: 325, roi: 188.5, streak: 3, level: 35 },
  { rank: 7, username: 'ProspectGuru', totalValue: 11450.00, bestPull: 'Ichiro 2001 Chrome Refractor', bestPullValue: 650.00, packsOpened: 278, roi: 172.9, streak: 7, level: 33 },
  { rank: 8, username: 'WaxBreaker', totalValue: 10320.00, bestPull: 'Jeter 1993 SP Foil', bestPullValue: 580.00, packsOpened: 356, roi: 145.6, streak: 19, level: 32 },
  { rank: 9, username: 'GemMintPulls', totalValue: 9180.00, bestPull: 'Aaron Judge Finest Auto', bestPullValue: 320.00, packsOpened: 192, roi: 210.3, streak: 2, level: 30 },
  { rank: 10, username: 'ErrorHunter42', totalValue: 8540.00, bestPull: 'Ohtani 2018 Error', bestPullValue: 280.00, packsOpened: 445, roi: 98.7, streak: 6, level: 29 },
  { rank: 11, username: 'ChromeChaser', totalValue: 7890.00, bestPull: 'Paul Skenes 1st Bowman Auto', bestPullValue: 210.00, packsOpened: 167, roi: 185.2, streak: 9, level: 27 },
  { rank: 12, username: 'HobbyBreaks', totalValue: 6420.00, bestPull: 'Jayden Daniels Select Auto', bestPullValue: 195.00, packsOpened: 234, roi: 112.8, streak: 1, level: 25 },
  { rank: 13, username: 'PrizmPuller', totalValue: 5850.00, bestPull: 'Ethan Salas 1st Bowman Auto', bestPullValue: 195.00, packsOpened: 189, roi: 142.1, streak: 4, level: 23 },
  { rank: 14, username: 'BaseballDad55', totalValue: 4920.00, bestPull: 'Elly De La Cruz Auto /99', bestPullValue: 185.00, packsOpened: 312, roi: 78.5, streak: 10, level: 21 },
  { rank: 15, username: 'NewCollector', totalValue: 3150.00, bestPull: 'LeBron Prizm Silver', bestPullValue: 110.00, packsOpened: 88, roi: 165.4, streak: 0, level: 15 },
];

// ---- Mock Data: Season Pass ----

const MOCK_SEASON_PASS: SeasonPass = {
  id: 'sp-1',
  seasonName: 'Spring 2026 Collection Season',
  currentTier: 6,
  maxTiers: 10,
  xpEarned: 14500,
  xpRequired: 25000,
  rewards: [
    { tier: 1, name: 'Starter Pack', description: 'Free Bronze tier pack', type: 'pack', value: 2.99, claimed: true },
    { tier: 2, name: 'XP Boost', description: '2x XP for next 5 packs', type: 'bonus_xp', value: 500, claimed: true },
    { tier: 3, name: 'Silver Discount', description: '15% off Silver tier packs', type: 'discount', value: 15, claimed: true },
    { tier: 4, name: 'Jackpot Entry', description: 'Free jackpot ticket', type: 'jackpot_ticket', value: 1.99, claimed: true },
    { tier: 5, name: 'Gold Pack', description: 'Free Gold tier pack', type: 'pack', value: 24.99, claimed: true },
    { tier: 6, name: 'Exclusive Parallel', description: 'Season-exclusive numbered card', type: 'exclusive_card', value: 50.00, claimed: true },
    { tier: 7, name: 'Platinum Discount', description: '20% off Platinum tier packs', type: 'discount', value: 20, claimed: false },
    { tier: 8, name: 'XP Mega Boost', description: '3x XP for next 10 packs', type: 'bonus_xp', value: 1500, claimed: false },
    { tier: 9, name: 'Diamond Pack', description: 'Free Diamond tier pack', type: 'pack', value: 99.99, claimed: false },
    { tier: 10, name: 'Season Trophy Card', description: '1/1 season-exclusive legendary card', type: 'exclusive_card', value: 250.00, claimed: false },
  ],
  startDate: '2026-01-01',
  endDate: '2026-06-30',
  active: true,
};

// ---- Mock Data: Collector Profile ----

const MOCK_COLLECTOR_PROFILE: CollectorProfile = {
  id: 'cp-1',
  username: 'ModernCollector',
  level: 28,
  xp: 14500,
  xpToNextLevel: 1200,
  totalPacks: 20,
  totalSpent: 727.79,
  totalValue: 12057.00,
  streak: 5,
  bestPull: 'Mickey Mantle 1956 Topps',
  bestPullValue: 5000.00,
  joinedAt: '2025-06-15',
  dailyBudget: 50.00,
  weeklyBudget: 200.00,
  spentToday: 12.99,
  spentThisWeek: 82.97,
};

// ---- Service Functions ----

export function getAvailablePacks(): VendingPack[] {
  const cached = loadData<VendingPack[]>('available_packs');
  if (cached) return cached;
  saveData('available_packs', MOCK_PACKS);
  return MOCK_PACKS;
}

export function getPacksByTier(tier: PackTier): VendingPack[] {
  const packs = getAvailablePacks();
  return packs.filter(p => p.tier === tier);
}

export function getPackDetails(id: string): VendingPack | null {
  const packs = getAvailablePacks();
  return packs.find(p => p.id === id) || null;
}

export function openPack(packId: string): OpenedPack {
  const pack = getPackDetails(packId);
  if (!pack) {
    throw new Error(`Pack ${packId} not found`);
  }

  const odds = getPackOdds(packId);
  const selectedCards: PackCard[] = [];
  const cardPool = MOCK_CARDS;

  for (let i = 0; i < pack.cardsPerPack; i++) {
    const roll = Math.random() * 100;
    let cumulativeOdds = 0;
    let targetRarity: CardRarity = 'common';

    for (const odd of odds.odds) {
      cumulativeOdds += odd.percentage;
      if (roll <= cumulativeOdds) {
        targetRarity = odd.rarity;
        break;
      }
    }

    const eligible = cardPool.filter(c => c.rarity === targetRarity);
    if (eligible.length > 0) {
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      selectedCards.push(pick);
    } else {
      const fallback = cardPool[Math.floor(Math.random() * cardPool.length)];
      selectedCards.push(fallback);
    }
  }

  const totalValue = selectedCards.reduce((sum, c) => sum + c.estimatedValue, 0);
  const profit = totalValue - pack.price;

  const opened: OpenedPack = {
    id: `op-${Date.now()}`,
    packId: pack.id,
    packName: pack.name,
    tier: pack.tier,
    theme: pack.theme,
    pricePaid: pack.price,
    cards: selectedCards,
    totalValue,
    profit,
    openedAt: new Date().toISOString(),
    streakBonus: Math.random() > 0.7,
  };

  return opened;
}

export function getPackHistory(): OpenedPack[] {
  const cached = loadData<OpenedPack[]>('pack_history');
  if (cached) return cached;
  saveData('pack_history', MOCK_OPENED_PACKS);
  return MOCK_OPENED_PACKS;
}

export function getDailyDeals(): DailyDeal[] {
  const cached = loadData<DailyDeal[]>('daily_deals');
  if (cached) return cached;
  saveData('daily_deals', MOCK_DAILY_DEALS);
  return MOCK_DAILY_DEALS;
}

export function getPackOdds(packId: string): PackOdds {
  const pack = getAvailablePacks().find(p => p.id === packId);
  if (!pack) {
    return { packId, packName: 'Unknown', tier: 'bronze', odds: [], expectedValue: 0, jackpotChance: 0 };
  }

  const oddsMap: Record<PackTier, { rarity: CardRarity; percentage: number; avgValue: number }[]> = {
    bronze: [
      { rarity: 'common', percentage: 60, avgValue: 4.00 },
      { rarity: 'uncommon', percentage: 28, avgValue: 22.00 },
      { rarity: 'rare', percentage: 9, avgValue: 72.00 },
      { rarity: 'ultra_rare', percentage: 2.5, avgValue: 165.00 },
      { rarity: 'legendary', percentage: 0.5, avgValue: 800.00 },
    ],
    silver: [
      { rarity: 'common', percentage: 40, avgValue: 4.00 },
      { rarity: 'uncommon', percentage: 35, avgValue: 22.00 },
      { rarity: 'rare', percentage: 18, avgValue: 72.00 },
      { rarity: 'ultra_rare', percentage: 5.5, avgValue: 165.00 },
      { rarity: 'legendary', percentage: 1.5, avgValue: 800.00 },
    ],
    gold: [
      { rarity: 'common', percentage: 20, avgValue: 4.00 },
      { rarity: 'uncommon', percentage: 30, avgValue: 22.00 },
      { rarity: 'rare', percentage: 32, avgValue: 72.00 },
      { rarity: 'ultra_rare', percentage: 13, avgValue: 165.00 },
      { rarity: 'legendary', percentage: 5, avgValue: 800.00 },
    ],
    platinum: [
      { rarity: 'common', percentage: 5, avgValue: 4.00 },
      { rarity: 'uncommon', percentage: 20, avgValue: 22.00 },
      { rarity: 'rare', percentage: 35, avgValue: 72.00 },
      { rarity: 'ultra_rare', percentage: 28, avgValue: 165.00 },
      { rarity: 'legendary', percentage: 12, avgValue: 800.00 },
    ],
    diamond: [
      { rarity: 'common', percentage: 0, avgValue: 4.00 },
      { rarity: 'uncommon', percentage: 5, avgValue: 22.00 },
      { rarity: 'rare', percentage: 25, avgValue: 72.00 },
      { rarity: 'ultra_rare', percentage: 40, avgValue: 165.00 },
      { rarity: 'legendary', percentage: 30, avgValue: 800.00 },
    ],
  };

  const packOdds = oddsMap[pack.tier];
  const expectedValue = packOdds.reduce((sum, o) => sum + (o.percentage / 100) * o.avgValue, 0) * pack.cardsPerPack;
  const jackpotChance = pack.tier === 'diamond' ? 0.05 : pack.tier === 'platinum' ? 0.02 : pack.tier === 'gold' ? 0.005 : 0;

  return {
    packId: pack.id,
    packName: pack.name,
    tier: pack.tier,
    odds: packOdds,
    expectedValue,
    jackpotChance,
  };
}

export function getJackpotInfo(): Jackpot {
  const cached = loadData<Jackpot>('jackpot');
  if (cached) return cached;
  saveData('jackpot', MOCK_JACKPOT);
  return MOCK_JACKPOT;
}

export function getLeaderboard(): LeaderboardEntry[] {
  const cached = loadData<LeaderboardEntry[]>('leaderboard');
  if (cached) return cached;
  saveData('leaderboard', MOCK_LEADERBOARD);
  return MOCK_LEADERBOARD;
}

export function getSeasonPass(): SeasonPass {
  const cached = loadData<SeasonPass>('season_pass');
  if (cached) return cached;
  saveData('season_pass', MOCK_SEASON_PASS);
  return MOCK_SEASON_PASS;
}

export function getCollectorProfile(): CollectorProfile {
  const cached = loadData<CollectorProfile>('collector_profile');
  if (cached) return cached;
  saveData('collector_profile', MOCK_COLLECTOR_PROFILE);
  return MOCK_COLLECTOR_PROFILE;
}

export function calculateExpectedValue(packId: string): { ev: number; price: number; evRatio: number; recommendation: string } {
  const odds = getPackOdds(packId);
  const pack = getPackDetails(packId);
  if (!pack) return { ev: 0, price: 0, evRatio: 0, recommendation: 'unknown' };

  const evRatio = odds.expectedValue / pack.price;
  let recommendation = 'neutral';
  if (evRatio >= 2.0) recommendation = 'strong_buy';
  else if (evRatio >= 1.3) recommendation = 'buy';
  else if (evRatio >= 0.8) recommendation = 'neutral';
  else recommendation = 'avoid';

  return {
    ev: odds.expectedValue,
    price: pack.price,
    evRatio,
    recommendation,
  };
}

export function getStreakBonus(): { currentStreak: number; nextBonusAt: number; bonusMultiplier: number; description: string } {
  const profile = getCollectorProfile();
  const streakBonuses = [
    { threshold: 3, multiplier: 1.1, desc: '10% value boost on next pack' },
    { threshold: 7, multiplier: 1.25, desc: '25% value boost on next pack' },
    { threshold: 14, multiplier: 1.5, desc: '50% value boost + free pack' },
    { threshold: 30, multiplier: 2.0, desc: '2x value boost + exclusive card' },
  ];

  const nextBonus = streakBonuses.find(b => b.threshold > profile.streak);
  const currentBonus = [...streakBonuses].reverse().find(b => b.threshold <= profile.streak);

  return {
    currentStreak: profile.streak,
    nextBonusAt: nextBonus ? nextBonus.threshold : 30,
    bonusMultiplier: currentBonus ? currentBonus.multiplier : 1.0,
    description: currentBonus ? currentBonus.desc : 'No active streak bonus',
  };
}
