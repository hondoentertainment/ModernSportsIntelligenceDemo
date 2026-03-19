// Community Trading Floor Service
// Peer-to-peer trading hub for sports card collectors with reputation, offers, and social features

// ---- Types ----

export type PostType = 'want' | 'have' | 'trade';
export type PostStatus = 'active' | 'pending' | 'completed' | 'expired';
export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered';

export interface TradePost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  type: PostType;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  condition: string;
  estimatedValue: number;
  description: string;
  images: string[];
  tags: string[];
  timestamp: string;
  likes: number;
  comments: number;
  status: PostStatus;
}

export interface OfferedCard {
  cardName: string;
  player: string;
  value: number;
}

export interface TradeOffer {
  id: string;
  postId: string;
  fromUser: string;
  toUser: string;
  offeredCards: OfferedCard[];
  requestedCards: OfferedCard[];
  cashDifference: number;
  message: string;
  status: OfferStatus;
  timestamp: string;
}

export interface UserReputation {
  userId: string;
  username: string;
  completedTrades: number;
  rating: number;
  badges: string[];
  memberSince: string;
  responseTime: string;
}

export interface TradingStats {
  totalActivePosts: number;
  tradesCompletedToday: number;
  avgTradeValue: number;
  topTrader: string;
  totalVolume: number;
}

export interface TradeActivity {
  date: string;
  volume: number;
  trades: number;
}

// ---- Storage helpers ----

const STORAGE_PREFIX = 'msi_community_trading';

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
}

// ---- Mock Data ----

const MOCK_TRADE_POSTS: TradePost[] = [
  {
    id: 'tp-001', userId: 'u-001', username: 'CardKingMike', avatar: '/avatars/mike.png',
    type: 'have', cardName: '2023 Topps Chrome Victor Wembanyama RC #201', player: 'Victor Wembanyama',
    sport: 'Basketball', year: 2023, set: 'Topps Chrome', condition: 'PSA 10',
    estimatedValue: 850, description: 'Perfect centering, sharp corners. Looking for football rookies or cash.',
    images: ['/cards/wemby-chrome.jpg'], tags: ['rookie', 'psa10', 'basketball'],
    timestamp: '2025-12-15T10:30:00Z', likes: 42, comments: 8, status: 'active',
  },
  {
    id: 'tp-002', userId: 'u-002', username: 'BaseballJen', avatar: '/avatars/jen.png',
    type: 'want', cardName: '2024 Bowman 1st Paul Skenes', player: 'Paul Skenes',
    sport: 'Baseball', year: 2024, set: 'Bowman 1st', condition: 'Raw NM+',
    estimatedValue: 300, description: 'Looking for any parallel or base. Will trade from my football collection.',
    images: [], tags: ['rookie', 'bowman', 'baseball', 'pitchers'],
    timestamp: '2025-12-15T09:15:00Z', likes: 18, comments: 3, status: 'active',
  },
  {
    id: 'tp-003', userId: 'u-003', username: 'GridironGreg', avatar: '/avatars/greg.png',
    type: 'trade', cardName: '2023 Panini Prizm CJ Stroud Silver', player: 'CJ Stroud',
    sport: 'Football', year: 2023, set: 'Panini Prizm', condition: 'BGS 9.5',
    estimatedValue: 425, description: 'Looking to swap for basketball rookies of equal value.',
    images: ['/cards/stroud-prizm.jpg'], tags: ['rookie', 'silver', 'football', 'prizm'],
    timestamp: '2025-12-14T22:00:00Z', likes: 35, comments: 12, status: 'active',
  },
  {
    id: 'tp-004', userId: 'u-004', username: 'VintageVince', avatar: '/avatars/vince.png',
    type: 'have', cardName: '1986 Fleer Michael Jordan RC #57', player: 'Michael Jordan',
    sport: 'Basketball', year: 1986, set: 'Fleer', condition: 'PSA 7',
    estimatedValue: 12500, description: 'Iconic card. Accepting offers — prefer high-end vintage baseball.',
    images: ['/cards/jordan-fleer.jpg'], tags: ['vintage', 'hof', 'basketball', 'grail'],
    timestamp: '2025-12-14T18:45:00Z', likes: 128, comments: 47, status: 'active',
  },
  {
    id: 'tp-005', userId: 'u-005', username: 'HockeyHank', avatar: '/avatars/hank.png',
    type: 'want', cardName: '2023-24 Upper Deck Connor Bedard YG', player: 'Connor Bedard',
    sport: 'Hockey', year: 2023, set: 'Upper Deck', condition: 'Raw NM+',
    estimatedValue: 200, description: 'Looking for Young Guns base or any parallel. Have baseball to trade.',
    images: [], tags: ['rookie', 'hockey', 'young-guns'],
    timestamp: '2025-12-14T16:30:00Z', likes: 22, comments: 5, status: 'active',
  },
  {
    id: 'tp-006', userId: 'u-006', username: 'SoccerStella', avatar: '/avatars/stella.png',
    type: 'trade', cardName: '2022 Topps Chrome UCL Jude Bellingham', player: 'Jude Bellingham',
    sport: 'Soccer', year: 2022, set: 'Topps Chrome UCL', condition: 'PSA 9',
    estimatedValue: 375, description: 'Will trade for comparable basketball or football rookies.',
    images: ['/cards/bellingham-chrome.jpg'], tags: ['soccer', 'ucl', 'rookie'],
    timestamp: '2025-12-14T14:20:00Z', likes: 31, comments: 9, status: 'active',
  },
  {
    id: 'tp-007', userId: 'u-001', username: 'CardKingMike', avatar: '/avatars/mike.png',
    type: 'have', cardName: '2024 Topps Series 1 Elly De La Cruz', player: 'Elly De La Cruz',
    sport: 'Baseball', year: 2024, set: 'Topps Series 1', condition: 'Raw Mint',
    estimatedValue: 45, description: 'Base card, perfect condition straight from pack. Open to trades.',
    images: ['/cards/elly-topps.jpg'], tags: ['baseball', '2024', 'speed'],
    timestamp: '2025-12-14T12:00:00Z', likes: 11, comments: 2, status: 'active',
  },
  {
    id: 'tp-008', userId: 'u-007', username: 'PatchPete', avatar: '/avatars/pete.png',
    type: 'have', cardName: '2023 National Treasures Caleb Williams RPA /99', player: 'Caleb Williams',
    sport: 'Football', year: 2023, set: 'National Treasures', condition: 'Raw NM',
    estimatedValue: 1800, description: 'Rookie Patch Auto numbered /99. Beautiful 3-color patch.',
    images: ['/cards/caleb-nt.jpg', '/cards/caleb-nt-back.jpg'], tags: ['rpa', 'auto', 'patch', 'football', 'numbered'],
    timestamp: '2025-12-13T20:00:00Z', likes: 67, comments: 21, status: 'active',
  },
  {
    id: 'tp-009', userId: 'u-008', username: 'WaxRipperRay', avatar: '/avatars/ray.png',
    type: 'trade', cardName: '2024 Panini Select Caitlin Clark Courtside', player: 'Caitlin Clark',
    sport: 'Basketball', year: 2024, set: 'Panini Select', condition: 'Raw NM+',
    estimatedValue: 550, description: 'Courtside parallel. Trading for football or baseball of similar value.',
    images: ['/cards/clark-select.jpg'], tags: ['basketball', 'wnba', 'courtside', 'rookie'],
    timestamp: '2025-12-13T15:30:00Z', likes: 89, comments: 33, status: 'active',
  },
  {
    id: 'tp-010', userId: 'u-009', username: 'DiamondDave', avatar: '/avatars/dave.png',
    type: 'want', cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle',
    sport: 'Baseball', year: 1952, set: 'Topps', condition: 'Any grade',
    estimatedValue: 50000, description: 'The holy grail. Have a massive collection to trade. Serious inquiries only.',
    images: [], tags: ['vintage', 'grail', 'hof', 'baseball', 'pre-war'],
    timestamp: '2025-12-13T10:00:00Z', likes: 215, comments: 64, status: 'active',
  },
  {
    id: 'tp-011', userId: 'u-003', username: 'GridironGreg', avatar: '/avatars/greg.png',
    type: 'have', cardName: '2023 Donruss Optic Marvin Harrison Jr Holo', player: 'Marvin Harrison Jr',
    sport: 'Football', year: 2023, set: 'Donruss Optic', condition: 'PSA 10',
    estimatedValue: 280, description: 'Holo parallel gem mint. Looking for basketball trades.',
    images: ['/cards/mhj-optic.jpg'], tags: ['football', 'holo', 'rookie', 'psa10'],
    timestamp: '2025-12-12T22:15:00Z', likes: 24, comments: 6, status: 'active',
  },
  {
    id: 'tp-012', userId: 'u-010', username: 'RookieQueen', avatar: '/avatars/rq.png',
    type: 'trade', cardName: '2024 Topps Chrome Shohei Ohtani Gold /50', player: 'Shohei Ohtani',
    sport: 'Baseball', year: 2024, set: 'Topps Chrome', condition: 'Raw Gem',
    estimatedValue: 1200, description: 'Gold refractor /50. Will trade for comparable football or basketball.',
    images: ['/cards/ohtani-gold.jpg'], tags: ['baseball', 'gold', 'numbered', 'refractor'],
    timestamp: '2025-12-12T18:30:00Z', likes: 55, comments: 15, status: 'active',
  },
  {
    id: 'tp-013', userId: 'u-005', username: 'HockeyHank', avatar: '/avatars/hank.png',
    type: 'have', cardName: '2024 Upper Deck Macklin Celebrini YG', player: 'Macklin Celebrini',
    sport: 'Hockey', year: 2024, set: 'Upper Deck', condition: 'Raw NM+',
    estimatedValue: 120, description: 'Young Guns rookie. Trading for baseball prospects.',
    images: ['/cards/celebrini-yg.jpg'], tags: ['hockey', 'young-guns', 'rookie'],
    timestamp: '2025-12-12T14:45:00Z', likes: 15, comments: 4, status: 'active',
  },
  {
    id: 'tp-014', userId: 'u-002', username: 'BaseballJen', avatar: '/avatars/jen.png',
    type: 'have', cardName: '2023 Bowman Chrome Jackson Holliday 1st Auto', player: 'Jackson Holliday',
    sport: 'Baseball', year: 2023, set: 'Bowman Chrome', condition: 'BGS 9.5/10',
    estimatedValue: 950, description: '1st Bowman Chrome Auto, auto grade 10. Open to multi-card deals.',
    images: ['/cards/holliday-auto.jpg'], tags: ['baseball', 'auto', 'bowman', '1st', 'prospect'],
    timestamp: '2025-12-12T11:00:00Z', likes: 46, comments: 14, status: 'active',
  },
  {
    id: 'tp-015', userId: 'u-004', username: 'VintageVince', avatar: '/avatars/vince.png',
    type: 'trade', cardName: '1971 Topps Roberto Clemente #630', player: 'Roberto Clemente',
    sport: 'Baseball', year: 1971, set: 'Topps', condition: 'PSA 6',
    estimatedValue: 650, description: 'Classic Clemente. Will trade for other vintage HOFers.',
    images: ['/cards/clemente-71.jpg'], tags: ['vintage', 'hof', 'baseball', 'pirates'],
    timestamp: '2025-12-11T19:00:00Z', likes: 38, comments: 10, status: 'active',
  },
  {
    id: 'tp-016', userId: 'u-006', username: 'SoccerStella', avatar: '/avatars/stella.png',
    type: 'want', cardName: '2023 Topps Chrome Lionel Messi Refractor', player: 'Lionel Messi',
    sport: 'Soccer', year: 2023, set: 'Topps Chrome', condition: 'PSA 10',
    estimatedValue: 400, description: 'Need this for my Messi PC. Have plenty of basketball and football to offer.',
    images: [], tags: ['soccer', 'goat', 'refractor', 'psa10'],
    timestamp: '2025-12-11T16:00:00Z', likes: 27, comments: 7, status: 'active',
  },
  {
    id: 'tp-017', userId: 'u-008', username: 'WaxRipperRay', avatar: '/avatars/ray.png',
    type: 'have', cardName: '2024 Prizm Draft Picks Drake Maye Silver', player: 'Drake Maye',
    sport: 'Football', year: 2024, set: 'Prizm Draft Picks', condition: 'Raw NM+',
    estimatedValue: 85, description: 'Silver parallel from a hobby box rip. Open to any trades.',
    images: ['/cards/maye-silver.jpg'], tags: ['football', 'silver', 'rookie', 'prizm'],
    timestamp: '2025-12-11T12:30:00Z', likes: 9, comments: 1, status: 'completed',
  },
  {
    id: 'tp-018', userId: 'u-009', username: 'DiamondDave', avatar: '/avatars/dave.png',
    type: 'have', cardName: '2020 Panini Prizm Justin Herbert Silver RC', player: 'Justin Herbert',
    sport: 'Football', year: 2020, set: 'Panini Prizm', condition: 'PSA 10',
    estimatedValue: 350, description: 'Chargers star QB. Looking for vintage baseball or comparable modern.',
    images: ['/cards/herbert-prizm.jpg'], tags: ['football', 'silver', 'psa10', 'qb'],
    timestamp: '2025-12-10T20:00:00Z', likes: 19, comments: 5, status: 'pending',
  },
];

const MOCK_TRADE_OFFERS: TradeOffer[] = [
  {
    id: 'to-001', postId: 'tp-001', fromUser: 'GridironGreg', toUser: 'CardKingMike',
    offeredCards: [
      { cardName: '2023 Prizm CJ Stroud Base RC', player: 'CJ Stroud', value: 150 },
      { cardName: '2023 Donruss Optic Bijan Robinson', player: 'Bijan Robinson', value: 120 },
    ],
    requestedCards: [
      { cardName: '2023 Topps Chrome Victor Wembanyama RC', player: 'Victor Wembanyama', value: 850 },
    ],
    cashDifference: 580, message: 'Two solid football rookies plus cash to make up the difference. Let me know!',
    status: 'pending', timestamp: '2025-12-15T11:00:00Z',
  },
  {
    id: 'to-002', postId: 'tp-004', fromUser: 'DiamondDave', toUser: 'VintageVince',
    offeredCards: [
      { cardName: '1958 Topps Mickey Mantle #150', player: 'Mickey Mantle', value: 5000 },
      { cardName: '1956 Topps Roberto Clemente #33', player: 'Roberto Clemente', value: 4500 },
    ],
    requestedCards: [
      { cardName: '1986 Fleer Michael Jordan RC #57', player: 'Michael Jordan', value: 12500 },
    ],
    cashDifference: 3000, message: 'Two vintage HOF cards plus cash. Both PSA graded.',
    status: 'pending', timestamp: '2025-12-14T19:30:00Z',
  },
  {
    id: 'to-003', postId: 'tp-009', fromUser: 'BaseballJen', toUser: 'WaxRipperRay',
    offeredCards: [
      { cardName: '2024 Bowman Chrome Ethan Salas 1st', player: 'Ethan Salas', value: 275 },
      { cardName: '2024 Topps Chrome Yoshinobu Yamamoto RC', player: 'Yoshinobu Yamamoto', value: 200 },
    ],
    requestedCards: [
      { cardName: '2024 Panini Select Caitlin Clark Courtside', player: 'Caitlin Clark', value: 550 },
    ],
    cashDifference: 75, message: 'Two hot baseball cards plus a small cash add. Interested?',
    status: 'pending', timestamp: '2025-12-13T16:00:00Z',
  },
  {
    id: 'to-004', postId: 'tp-003', fromUser: 'CardKingMike', toUser: 'GridironGreg',
    offeredCards: [
      { cardName: '2023 Topps Chrome Anthony Edwards', player: 'Anthony Edwards', value: 200 },
      { cardName: '2024 Panini Prizm Zach Edey RC', player: 'Zach Edey', value: 100 },
    ],
    requestedCards: [
      { cardName: '2023 Panini Prizm CJ Stroud Silver', player: 'CJ Stroud', value: 425 },
    ],
    cashDifference: 125, message: 'Two basketball cards plus cash for your Stroud silver.',
    status: 'accepted', timestamp: '2025-12-14T23:00:00Z',
  },
  {
    id: 'to-005', postId: 'tp-008', fromUser: 'WaxRipperRay', toUser: 'PatchPete',
    offeredCards: [
      { cardName: '2024 Select Caitlin Clark Courtside', player: 'Caitlin Clark', value: 550 },
      { cardName: '2023 Prizm Tyrese Maxey Silver', player: 'Tyrese Maxey', value: 180 },
    ],
    requestedCards: [
      { cardName: '2023 National Treasures Caleb Williams RPA /99', player: 'Caleb Williams', value: 1800 },
    ],
    cashDifference: 1070, message: 'Two cards plus substantial cash for the Williams RPA.',
    status: 'declined', timestamp: '2025-12-13T21:00:00Z',
  },
];

const MOCK_USER_REPUTATIONS: UserReputation[] = [
  { userId: 'u-001', username: 'CardKingMike', completedTrades: 156, rating: 4.9, badges: ['Power Trader', 'Trusted Seller', 'Top Rated', 'Verified'], memberSince: '2021-03-15', responseTime: '< 1 hour' },
  { userId: 'u-002', username: 'BaseballJen', completedTrades: 89, rating: 4.8, badges: ['Baseball Expert', 'Trusted Seller', 'Quick Shipper'], memberSince: '2022-01-10', responseTime: '< 2 hours' },
  { userId: 'u-003', username: 'GridironGreg', completedTrades: 112, rating: 4.7, badges: ['Football Guru', 'Power Trader', 'Verified'], memberSince: '2021-08-22', responseTime: '< 3 hours' },
  { userId: 'u-004', username: 'VintageVince', completedTrades: 234, rating: 5.0, badges: ['Vintage Expert', 'Hall of Fame Trader', 'Top Rated', 'Trusted Seller', 'Verified'], memberSince: '2020-06-01', responseTime: '< 30 min' },
  { userId: 'u-005', username: 'HockeyHank', completedTrades: 45, rating: 4.5, badges: ['Hockey Specialist', 'Verified'], memberSince: '2023-02-14', responseTime: '< 4 hours' },
  { userId: 'u-006', username: 'SoccerStella', completedTrades: 67, rating: 4.6, badges: ['Soccer Expert', 'Quick Shipper', 'Verified'], memberSince: '2022-09-05', responseTime: '< 2 hours' },
  { userId: 'u-007', username: 'PatchPete', completedTrades: 198, rating: 4.9, badges: ['Patch Collector', 'Power Trader', 'Top Rated', 'Verified'], memberSince: '2020-11-20', responseTime: '< 1 hour' },
  { userId: 'u-008', username: 'WaxRipperRay', completedTrades: 78, rating: 4.4, badges: ['Wax Ripper', 'Active Trader'], memberSince: '2023-05-30', responseTime: '< 6 hours' },
  { userId: 'u-009', username: 'DiamondDave', completedTrades: 312, rating: 5.0, badges: ['Diamond Club', 'Hall of Fame Trader', 'Top Rated', 'Trusted Seller', 'Verified', 'Whale'], memberSince: '2019-01-01', responseTime: '< 15 min' },
  { userId: 'u-010', username: 'RookieQueen', completedTrades: 143, rating: 4.8, badges: ['Rookie Hunter', 'Power Trader', 'Trusted Seller', 'Verified'], memberSince: '2021-07-04', responseTime: '< 1 hour' },
];

const MOCK_TRADE_ACTIVITY: TradeActivity[] = [
  { date: '2025-12-09', volume: 45200, trades: 34 },
  { date: '2025-12-10', volume: 52800, trades: 41 },
  { date: '2025-12-11', volume: 38900, trades: 28 },
  { date: '2025-12-12', volume: 67300, trades: 52 },
  { date: '2025-12-13', volume: 71500, trades: 58 },
  { date: '2025-12-14', volume: 84200, trades: 67 },
  { date: '2025-12-15', volume: 63100, trades: 49 },
];

// ---- Exported Functions ----

export function getTradePosts(): TradePost[] {
  const stored = loadFromStorage<TradePost[]>('posts');
  if (stored && stored.length > 0) return stored;
  return [...MOCK_TRADE_POSTS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function createPost(post: Omit<TradePost, 'id' | 'timestamp' | 'likes' | 'comments' | 'status'>): TradePost {
  const posts = getTradePosts();
  const newPost: TradePost = {
    ...post,
    id: `tp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: 0,
    status: 'active',
  };
  posts.unshift(newPost);
  saveToStorage('posts', posts);
  return newPost;
}

export function getTradeOffers(): TradeOffer[] {
  const stored = loadFromStorage<TradeOffer[]>('offers');
  if (stored && stored.length > 0) return stored;
  return [...MOCK_TRADE_OFFERS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function makeOffer(offer: Omit<TradeOffer, 'id' | 'timestamp' | 'status'>): TradeOffer {
  const offers = getTradeOffers();
  const newOffer: TradeOffer = {
    ...offer,
    id: `to-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
  offers.unshift(newOffer);
  saveToStorage('offers', offers);
  return newOffer;
}

export function respondToOffer(id: string, status: 'accepted' | 'declined' | 'countered'): TradeOffer | null {
  const offers = getTradeOffers();
  const idx = offers.findIndex(o => o.id === id);
  if (idx === -1) return null;
  offers[idx] = { ...offers[idx], status };
  saveToStorage('offers', offers);
  return offers[idx];
}

export function getUserReputation(userId: string): UserReputation | null {
  const rep = MOCK_USER_REPUTATIONS.find(r => r.userId === userId);
  return rep ?? null;
}

export function getTradingStats(): TradingStats {
  const posts = getTradePosts();
  const activePosts = posts.filter(p => p.status === 'active');
  const completedPosts = posts.filter(p => p.status === 'completed');
  const allValues = posts.map(p => p.estimatedValue);
  const avgValue = allValues.length > 0
    ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
    : 0;
  const topTrader = MOCK_USER_REPUTATIONS.reduce((best, cur) =>
    cur.completedTrades > best.completedTrades ? cur : best
  );
  return {
    totalActivePosts: activePosts.length,
    tradesCompletedToday: completedPosts.length,
    avgTradeValue: avgValue,
    topTrader: topTrader.username,
    totalVolume: MOCK_TRADE_ACTIVITY.reduce((sum, a) => sum + a.volume, 0),
  };
}

export function getTopTraders(): UserReputation[] {
  return [...MOCK_USER_REPUTATIONS].sort((a, b) => b.completedTrades - a.completedTrades);
}

export function searchPosts(query: string): TradePost[] {
  const posts = getTradePosts();
  const q = query.toLowerCase();
  return posts.filter(p =>
    p.cardName.toLowerCase().includes(q) ||
    p.player.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function filterByType(type: PostType): TradePost[] {
  return getTradePosts().filter(p => p.type === type);
}

export function filterBySport(sport: string): TradePost[] {
  return getTradePosts().filter(p => p.sport.toLowerCase() === sport.toLowerCase());
}

export function getRecentActivity(): TradeActivity[] {
  return [...MOCK_TRADE_ACTIVITY];
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function getStatusColor(status: PostStatus | OfferStatus): string {
  switch (status) {
    case 'active': return 'text-green-400';
    case 'pending': return 'text-yellow-400';
    case 'completed': case 'accepted': return 'text-blue-400';
    case 'expired': case 'declined': return 'text-red-400';
    case 'countered': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

export function getTypeLabel(type: PostType): string {
  switch (type) {
    case 'want': return 'Looking For';
    case 'have': return 'Available';
    case 'trade': return 'Open to Trade';
    default: return 'Unknown';
  }
}

export function getTypeBadgeColor(type: PostType): string {
  switch (type) {
    case 'want': return 'bg-blue-600';
    case 'have': return 'bg-green-600';
    case 'trade': return 'bg-purple-600';
    default: return 'bg-gray-600';
  }
}
