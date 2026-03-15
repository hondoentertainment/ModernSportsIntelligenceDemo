// ---- Types ----

export type NotificationCategory = 'price_alert' | 'deal_found' | 'market_move' | 'portfolio' | 'auction' | 'news' | 'grading' | 'social' | 'system';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type DeliveryChannel = 'in_app' | 'push' | 'email' | 'sms';
export type DealType = 'below_market' | 'price_crash' | 'new_listing' | 'auction_ending' | 'buy_it_now' | 'best_offer_accepted';

export interface SmartNotification {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  actionUrl: string;
  actionLabel: string;
  cardName: string | null;
  player: string | null;
  priceData: { current: number; previous: number; change: number; changePercent: number } | null;
  metadata: Record<string, string | number>;
  channels: DeliveryChannel[];
  expiresAt: string | null;
  groupId: string | null;
}

export interface DealAlert {
  id: string;
  cardName: string;
  player: string;
  year: number;
  grade: string;
  dealType: DealType;
  listPrice: number;
  marketPrice: number;
  savings: number;
  savingsPercent: number;
  platform: string;
  listingUrl: string;
  imageUrl: string;
  sellerRating: number;
  timeRemaining: string | null;
  discoveredAt: string;
  confidence: number;
  isExpired: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  category: NotificationCategory;
  enabled: boolean;
  conditions: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'contains' | 'change_pct';
    value: string | number;
  }[];
  channels: DeliveryChannel[];
  priority: NotificationPriority;
  cooldown: string;
  createdAt: string;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  byCategory: { category: NotificationCategory; count: number; unread: number }[];
  byPriority: { priority: NotificationPriority; count: number }[];
  dealsFound: number;
  dealsSaved: number;
  totalSavings: number;
  avgResponseTime: string;
  topAlertedCards: { cardName: string; alertCount: number }[];
}

export interface NotificationPreferences {
  quietHoursStart: string;
  quietHoursEnd: string;
  maxPerDay: number;
  groupSimilar: boolean;
  channels: { channel: DeliveryChannel; enabled: boolean }[];
  categoryPreferences: { category: NotificationCategory; enabled: boolean; minPriority: NotificationPriority }[];
}

export interface NotificationGroup {
  groupId: string;
  category: NotificationCategory;
  count: number;
  latestTimestamp: string;
  summary: string;
  notifications: SmartNotification[];
}

// ---- Storage Keys ----

const STORAGE_KEYS = {
  notifications: 'msi_notifications_list',
  readIds: 'msi_notifications_read_ids',
  dismissedIds: 'msi_notifications_dismissed_ids',
  preferences: 'msi_notifications_preferences',
  rules: 'msi_notifications_rules',
};

// ---- Helper: ISO timestamps relative to "now" ----

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function minutesAgo(m: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - m);
  return d.toISOString();
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursFromNow(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

// ---- Mock Notifications (40+) ----

const MOCK_NOTIFICATIONS: SmartNotification[] = [
  // --- price_alert ---
  {
    id: 'notif-001',
    category: 'price_alert',
    priority: 'critical',
    title: 'Price Target Hit: Wemby Prizm RC',
    message: 'Victor Wembanyama 2023 Prizm Silver RC has dropped below your $450 target. Currently listed at $389.',
    timestamp: minutesAgo(12),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/wemby-prizm-rc',
    actionLabel: 'View Listing',
    cardName: '2023 Prizm Silver RC',
    player: 'Victor Wembanyama',
    priceData: { current: 389, previous: 520, change: -131, changePercent: -25.2 },
    metadata: { platform: 'eBay', seller: 'CardKing99', watchers: 47 },
    channels: ['in_app', 'push', 'email'],
    expiresAt: hoursFromNow(24),
    groupId: 'price-alerts-wemby',
  },
  {
    id: 'notif-002',
    category: 'price_alert',
    priority: 'high',
    title: 'Price Drop: Luka Doncic Select RC',
    message: 'Luka Doncic 2018-19 Select Concourse RC PSA 10 dropped 18% in the last 24 hours to $275.',
    timestamp: minutesAgo(45),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/luka-select-rc',
    actionLabel: 'Check Price',
    cardName: '2018-19 Select Concourse RC PSA 10',
    player: 'Luka Doncic',
    priceData: { current: 275, previous: 335, change: -60, changePercent: -17.9 },
    metadata: { grader: 'PSA', grade: '10', population: 4821 },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: 'price-alerts-luka',
  },
  {
    id: 'notif-003',
    category: 'price_alert',
    priority: 'medium',
    title: 'Price Surge: Jaylen Brown Prizm',
    message: 'Jaylen Brown 2016-17 Prizm RC PSA 9 is up 12% after playoff performance. Now at $145.',
    timestamp: hoursAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/jaylen-brown-prizm',
    actionLabel: 'View Trend',
    cardName: '2016-17 Prizm RC PSA 9',
    player: 'Jaylen Brown',
    priceData: { current: 145, previous: 129, change: 16, changePercent: 12.4 },
    metadata: { grader: 'PSA', grade: '9' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-004',
    category: 'price_alert',
    priority: 'high',
    title: 'Price Target Hit: Shohei Ohtani Bowman',
    message: 'Shohei Ohtani 2018 Bowman Chrome RC PSA 10 has hit your $1,200 price target. Currently at $1,175.',
    timestamp: hoursAgo(1),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/ohtani-bowman-chrome',
    actionLabel: 'View Listing',
    cardName: '2018 Bowman Chrome RC PSA 10',
    player: 'Shohei Ohtani',
    priceData: { current: 1175, previous: 1350, change: -175, changePercent: -13.0 },
    metadata: { platform: 'COMC', population: 2345 },
    channels: ['in_app', 'push', 'email'],
    expiresAt: hoursFromNow(48),
    groupId: null,
  },
  {
    id: 'notif-005',
    category: 'price_alert',
    priority: 'low',
    title: 'Slight Dip: Ja Morant Prizm',
    message: 'Ja Morant 2019-20 Prizm Base RC is down 4% to $82. Monitoring trend.',
    timestamp: hoursAgo(5),
    isRead: true,
    isDismissed: false,
    actionUrl: '/marketplace/card/ja-morant-prizm',
    actionLabel: 'View Card',
    cardName: '2019-20 Prizm Base RC',
    player: 'Ja Morant',
    priceData: { current: 82, previous: 85.5, change: -3.5, changePercent: -4.1 },
    metadata: {},
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },

  // --- deal_found ---
  {
    id: 'notif-006',
    category: 'deal_found',
    priority: 'critical',
    title: 'HOT DEAL: Chet Holmgren Prizm Silver',
    message: 'Chet Holmgren 2022-23 Prizm Silver RC BGS 9.5 listed 32% below market at $165. Only 1 available!',
    timestamp: minutesAgo(3),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/chet-prizm-silver',
    actionLabel: 'Grab Deal',
    cardName: '2022-23 Prizm Silver RC BGS 9.5',
    player: 'Chet Holmgren',
    priceData: { current: 165, previous: 243, change: -78, changePercent: -32.1 },
    metadata: { platform: 'eBay', sellerRating: 99.8, quantity: 1 },
    channels: ['in_app', 'push', 'sms'],
    expiresAt: hoursFromNow(2),
    groupId: 'deals-basketball',
  },
  {
    id: 'notif-007',
    category: 'deal_found',
    priority: 'high',
    title: 'Deal Alert: Julio Rodriguez Topps Chrome',
    message: 'Julio Rodriguez 2022 Topps Chrome RC PSA 10 found at $89 — 24% below recent comps.',
    timestamp: minutesAgo(18),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/jrod-topps-chrome',
    actionLabel: 'View Deal',
    cardName: '2022 Topps Chrome RC PSA 10',
    player: 'Julio Rodriguez',
    priceData: { current: 89, previous: 117, change: -28, changePercent: -23.9 },
    metadata: { platform: 'MySlabs', sellerRating: 98.5 },
    channels: ['in_app', 'push'],
    expiresAt: hoursFromNow(6),
    groupId: 'deals-baseball',
  },
  {
    id: 'notif-008',
    category: 'deal_found',
    priority: 'high',
    title: 'Below Market: CJ Stroud Prizm',
    message: 'CJ Stroud 2023 Prizm Silver RC PSA 10 at $210 — market price $285. 26% savings.',
    timestamp: minutesAgo(32),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/stroud-prizm',
    actionLabel: 'Buy Now',
    cardName: '2023 Prizm Silver RC PSA 10',
    player: 'CJ Stroud',
    priceData: { current: 210, previous: 285, change: -75, changePercent: -26.3 },
    metadata: { platform: 'eBay', sellerRating: 99.2 },
    channels: ['in_app', 'push'],
    expiresAt: hoursFromNow(12),
    groupId: 'deals-football',
  },
  {
    id: 'notif-009',
    category: 'deal_found',
    priority: 'medium',
    title: 'New Listing: Anthony Edwards Optic',
    message: 'Anthony Edwards 2020-21 Donruss Optic Rated Rookie PSA 9 listed at $195. Fair deal.',
    timestamp: hoursAgo(1),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/ant-optic',
    actionLabel: 'View Listing',
    cardName: '2020-21 Donruss Optic Rated Rookie PSA 9',
    player: 'Anthony Edwards',
    priceData: { current: 195, previous: 220, change: -25, changePercent: -11.4 },
    metadata: { platform: 'Mercari' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'deals-basketball',
  },
  {
    id: 'notif-010',
    category: 'deal_found',
    priority: 'critical',
    title: 'FLASH DEAL: Connor Bedard YG RC',
    message: 'Connor Bedard 2023-24 Upper Deck Young Guns RC PSA 10 at $399 — 35% below market!',
    timestamp: minutesAgo(7),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/bedard-yg',
    actionLabel: 'Grab Now',
    cardName: '2023-24 Upper Deck Young Guns RC PSA 10',
    player: 'Connor Bedard',
    priceData: { current: 399, previous: 615, change: -216, changePercent: -35.1 },
    metadata: { platform: 'eBay', sellerRating: 100, watchers: 23 },
    channels: ['in_app', 'push', 'sms'],
    expiresAt: hoursFromNow(1),
    groupId: 'deals-hockey',
  },

  // --- market_move ---
  {
    id: 'notif-011',
    category: 'market_move',
    priority: 'high',
    title: 'Market Surge: Basketball Rookies',
    message: 'Basketball rookie cards are up 8.4% across the board following NBA playoff matchups announcement.',
    timestamp: hoursAgo(3),
    isRead: false,
    isDismissed: false,
    actionUrl: '/market/basketball-rookies',
    actionLabel: 'View Market',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Basketball Rookies', changePercent: 8.4, timeframe: '24h' },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: 'market-basketball',
  },
  {
    id: 'notif-012',
    category: 'market_move',
    priority: 'medium',
    title: 'Football Cards Trending Down',
    message: 'NFL card market index is down 3.2% this week. Consider buying opportunities on key rookies.',
    timestamp: hoursAgo(6),
    isRead: true,
    isDismissed: false,
    actionUrl: '/market/football-index',
    actionLabel: 'View Index',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Football', changePercent: -3.2, timeframe: '7d' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'market-football',
  },
  {
    id: 'notif-013',
    category: 'market_move',
    priority: 'high',
    title: 'Vintage Baseball Spike',
    message: 'Vintage baseball cards (pre-1980) index up 15% month-over-month. Heritage auction results driving prices.',
    timestamp: hoursAgo(8),
    isRead: false,
    isDismissed: false,
    actionUrl: '/market/vintage-baseball',
    actionLabel: 'Explore',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Vintage Baseball', changePercent: 15.0, timeframe: '30d' },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: 'market-baseball',
  },
  {
    id: 'notif-014',
    category: 'market_move',
    priority: 'low',
    title: 'Soccer Market Stable',
    message: 'European soccer card market remains flat this week. Premier League parallels holding steady.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/market/soccer',
    actionLabel: 'View Report',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Soccer', changePercent: 0.3, timeframe: '7d' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-015',
    category: 'market_move',
    priority: 'critical',
    title: 'Market Crash Alert: Panini Products',
    message: 'Panini-branded products dropping sharply (-22%) as Fanatics transition accelerates. Review your holdings.',
    timestamp: hoursAgo(4),
    isRead: false,
    isDismissed: false,
    actionUrl: '/market/panini-transition',
    actionLabel: 'Review Portfolio',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Panini All', changePercent: -22.0, timeframe: '14d' },
    channels: ['in_app', 'push', 'email'],
    expiresAt: null,
    groupId: 'market-panini',
  },

  // --- portfolio ---
  {
    id: 'notif-016',
    category: 'portfolio',
    priority: 'high',
    title: 'Portfolio Up 5.3% This Week',
    message: 'Your portfolio value increased by $1,247 this week, driven by basketball rookies and vintage baseball.',
    timestamp: hoursAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/portfolio/summary',
    actionLabel: 'View Portfolio',
    cardName: null,
    player: null,
    priceData: { current: 24780, previous: 23533, change: 1247, changePercent: 5.3 },
    metadata: { topGainer: 'Victor Wembanyama', topLoser: 'Trae Young' },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: 'portfolio-weekly',
  },
  {
    id: 'notif-017',
    category: 'portfolio',
    priority: 'medium',
    title: 'Diversification Alert',
    message: 'Your portfolio is 72% basketball cards. Consider diversifying into baseball or football for stability.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/portfolio/diversify',
    actionLabel: 'View Suggestions',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { basketballPct: 72, baseballPct: 15, footballPct: 10, otherPct: 3 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-018',
    category: 'portfolio',
    priority: 'critical',
    title: 'Loss Threshold Triggered',
    message: 'Your Trae Young 2018-19 Prizm Silver RC has dropped 30% from purchase price. Consider your exit strategy.',
    timestamp: hoursAgo(3),
    isRead: false,
    isDismissed: false,
    actionUrl: '/portfolio/card/trae-young-prizm',
    actionLabel: 'Review Card',
    cardName: '2018-19 Prizm Silver RC',
    player: 'Trae Young',
    priceData: { current: 95, previous: 136, change: -41, changePercent: -30.1 },
    metadata: { purchasePrice: 136, currentValue: 95 },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-019',
    category: 'portfolio',
    priority: 'low',
    title: 'Monthly Performance Report Ready',
    message: 'Your February portfolio report is ready. Total value: $24,780 (+$2,140 from last month).',
    timestamp: daysAgo(2),
    isRead: true,
    isDismissed: false,
    actionUrl: '/portfolio/report/february',
    actionLabel: 'View Report',
    cardName: null,
    player: null,
    priceData: { current: 24780, previous: 22640, change: 2140, changePercent: 9.5 },
    metadata: { month: 'February', year: 2026 },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: null,
  },

  // --- auction ---
  {
    id: 'notif-020',
    category: 'auction',
    priority: 'critical',
    title: 'Auction Ending: Caleb Williams Prizm',
    message: 'Caleb Williams 2024 Prizm Silver RC PSA 10 auction ends in 12 minutes! Current bid: $310.',
    timestamp: minutesAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/auction/caleb-williams-prizm',
    actionLabel: 'Bid Now',
    cardName: '2024 Prizm Silver RC PSA 10',
    player: 'Caleb Williams',
    priceData: { current: 310, previous: 280, change: 30, changePercent: 10.7 },
    metadata: { platform: 'eBay', bidCount: 23, timeRemaining: '12m' },
    channels: ['in_app', 'push', 'sms'],
    expiresAt: minutesAgo(-12),
    groupId: 'auction-ending',
  },
  {
    id: 'notif-021',
    category: 'auction',
    priority: 'high',
    title: 'Outbid Alert: Jayson Tatum National Treasures',
    message: 'You have been outbid on Jayson Tatum 2017-18 National Treasures RC /99. Current high bid: $2,450.',
    timestamp: minutesAgo(8),
    isRead: false,
    isDismissed: false,
    actionUrl: '/auction/tatum-nt-rc',
    actionLabel: 'Place Bid',
    cardName: '2017-18 National Treasures RC /99',
    player: 'Jayson Tatum',
    priceData: { current: 2450, previous: 2200, change: 250, changePercent: 11.4 },
    metadata: { platform: 'Heritage Auctions', myBid: 2200, highBid: 2450 },
    channels: ['in_app', 'push'],
    expiresAt: hoursFromNow(2),
    groupId: 'auction-outbid',
  },
  {
    id: 'notif-022',
    category: 'auction',
    priority: 'medium',
    title: 'Auction Won: Shai Gilgeous-Alexander Optic',
    message: 'Congratulations! You won Shai GA 2018-19 Optic RC PSA 10 for $380. Great price!',
    timestamp: hoursAgo(4),
    isRead: true,
    isDismissed: false,
    actionUrl: '/auction/sga-optic-won',
    actionLabel: 'View Details',
    cardName: '2018-19 Optic RC PSA 10',
    player: 'Shai Gilgeous-Alexander',
    priceData: { current: 380, previous: 420, change: -40, changePercent: -9.5 },
    metadata: { platform: 'eBay', marketValue: 420, savedAmount: 40 },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-023',
    category: 'auction',
    priority: 'high',
    title: 'Watched Auction Ending Soon',
    message: 'Mac Jones 2021 Prizm Silver RC PSA 10 auction ends in 45 minutes. Current bid: $42.',
    timestamp: minutesAgo(15),
    isRead: false,
    isDismissed: false,
    actionUrl: '/auction/mac-jones-prizm',
    actionLabel: 'Watch',
    cardName: '2021 Prizm Silver RC PSA 10',
    player: 'Mac Jones',
    priceData: { current: 42, previous: 38, change: 4, changePercent: 10.5 },
    metadata: { platform: 'eBay', bidCount: 8, timeRemaining: '45m' },
    channels: ['in_app'],
    expiresAt: minutesAgo(-45),
    groupId: 'auction-ending',
  },

  // --- news ---
  {
    id: 'notif-024',
    category: 'news',
    priority: 'high',
    title: 'Fanatics Exclusive License Announced',
    message: 'Fanatics secures exclusive MLB, NBA, and NFL card licensing through 2035. Major market implications expected.',
    timestamp: hoursAgo(1),
    isRead: false,
    isDismissed: false,
    actionUrl: '/news/fanatics-exclusive',
    actionLabel: 'Read More',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { source: 'Sports Business Journal', impact: 'high' },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: 'news-industry',
  },
  {
    id: 'notif-025',
    category: 'news',
    priority: 'medium',
    title: 'PSA Submission Backlog Update',
    message: 'PSA reports 45-day turnaround for Regular service. Express down to 5 days. Plan your submissions.',
    timestamp: hoursAgo(6),
    isRead: true,
    isDismissed: false,
    actionUrl: '/news/psa-update',
    actionLabel: 'Read Article',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { source: 'PSA Blog', regularDays: 45, expressDays: 5 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'news-grading',
  },
  {
    id: 'notif-026',
    category: 'news',
    priority: 'medium',
    title: 'Heritage Auctions Record Sale',
    message: '1952 Topps Mickey Mantle PSA 9 sells for $12.6M at Heritage, setting new record for post-war cards.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/news/heritage-record',
    actionLabel: 'See Results',
    cardName: null,
    player: 'Mickey Mantle',
    priceData: null,
    metadata: { source: 'Heritage Auctions', salePrice: 12600000 },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: 'news-industry',
  },
  {
    id: 'notif-027',
    category: 'news',
    priority: 'low',
    title: 'New Topps Chrome Release Date',
    message: '2025 Topps Chrome Baseball release confirmed for October 15. Pre-order hobby boxes available.',
    timestamp: daysAgo(2),
    isRead: true,
    isDismissed: false,
    actionUrl: '/news/topps-chrome-release',
    actionLabel: 'Pre-Order',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { source: 'Topps', releaseDate: '2025-10-15' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },

  // --- grading ---
  {
    id: 'notif-028',
    category: 'grading',
    priority: 'high',
    title: 'Grading Complete: 5 Cards Returned',
    message: 'Your PSA submission #48291 is complete. 3 gems (PSA 10), 1 mint (PSA 9), 1 near-mint (PSA 8).',
    timestamp: hoursAgo(5),
    isRead: false,
    isDismissed: false,
    actionUrl: '/grading/submission/48291',
    actionLabel: 'View Results',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { submissionId: 48291, psa10: 3, psa9: 1, psa8: 1 },
    channels: ['in_app', 'push', 'email'],
    expiresAt: null,
    groupId: 'grading-returns',
  },
  {
    id: 'notif-029',
    category: 'grading',
    priority: 'medium',
    title: 'Submission Received by PSA',
    message: 'Your PSA submission #48305 (8 cards) has been received and logged. Estimated turnaround: 30 days.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/grading/submission/48305',
    actionLabel: 'Track',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { submissionId: 48305, cardCount: 8, estimatedDays: 30 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'grading-tracking',
  },
  {
    id: 'notif-030',
    category: 'grading',
    priority: 'medium',
    title: 'Grade Prediction: High ROI Opportunity',
    message: 'Your raw Anthony Richardson Prizm Silver has 78% chance of PSA 10. Potential value jump from $120 to $340.',
    timestamp: hoursAgo(8),
    isRead: false,
    isDismissed: false,
    actionUrl: '/grading/predict/ant-richardson',
    actionLabel: 'Submit for Grading',
    cardName: '2023 Prizm Silver RC',
    player: 'Anthony Richardson',
    priceData: { current: 120, previous: 120, change: 0, changePercent: 0 },
    metadata: { psa10Probability: 78, rawValue: 120, graded10Value: 340 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },

  // --- social ---
  {
    id: 'notif-031',
    category: 'social',
    priority: 'low',
    title: 'Trending on CardX: Wemby Hype',
    message: '2,400+ collectors discussing Victor Wembanyama cards after his 40-point game. Join the conversation.',
    timestamp: hoursAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/social/thread/wemby-hype',
    actionLabel: 'Join Discussion',
    cardName: null,
    player: 'Victor Wembanyama',
    priceData: null,
    metadata: { participants: 2400, comments: 5600 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'social-trending',
  },
  {
    id: 'notif-032',
    category: 'social',
    priority: 'medium',
    title: 'Trade Offer Received',
    message: 'User @CardTrader88 wants to trade their Lamar Jackson Prizm RC PSA 10 for your Josh Allen Optic RC.',
    timestamp: hoursAgo(3),
    isRead: false,
    isDismissed: false,
    actionUrl: '/social/trade/offer-4521',
    actionLabel: 'Review Offer',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { offeredCard: 'Lamar Jackson Prizm RC PSA 10', requestedCard: 'Josh Allen Optic RC' },
    channels: ['in_app', 'push'],
    expiresAt: hoursFromNow(48),
    groupId: null,
  },
  {
    id: 'notif-033',
    category: 'social',
    priority: 'low',
    title: 'New Follower',
    message: '@VintageKing followed you. They have 1,200+ cards in their collection.',
    timestamp: hoursAgo(7),
    isRead: true,
    isDismissed: false,
    actionUrl: '/social/profile/vintage-king',
    actionLabel: 'View Profile',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { followerCards: 1200 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'social-follows',
  },
  {
    id: 'notif-034',
    category: 'social',
    priority: 'low',
    title: 'Your Post Got 50 Likes',
    message: 'Your post about the 1986 Fleer Jordan RC price analysis received 50 likes and 12 comments.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/social/post/jordan-analysis',
    actionLabel: 'View Post',
    cardName: null,
    player: 'Michael Jordan',
    priceData: null,
    metadata: { likes: 50, comments: 12 },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'social-engagement',
  },

  // --- system ---
  {
    id: 'notif-035',
    category: 'system',
    priority: 'medium',
    title: 'Database Sync Complete',
    message: 'Your collection has been synced with the latest market prices. 142 cards updated.',
    timestamp: hoursAgo(1),
    isRead: false,
    isDismissed: false,
    actionUrl: '/settings/sync',
    actionLabel: 'View Log',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { cardsUpdated: 142, duration: '3.2s' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'system-sync',
  },
  {
    id: 'notif-036',
    category: 'system',
    priority: 'low',
    title: 'Weekly Backup Complete',
    message: 'Your collection data has been backed up successfully. 2.4 MB saved.',
    timestamp: daysAgo(1),
    isRead: true,
    isDismissed: false,
    actionUrl: '/settings/backups',
    actionLabel: 'Manage Backups',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { size: '2.4 MB' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-037',
    category: 'system',
    priority: 'high',
    title: 'New Feature: AI Card Scanner',
    message: 'Use your camera to instantly identify and price cards with our new AI scanner. Try it now!',
    timestamp: daysAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/ar-scanner',
    actionLabel: 'Try Scanner',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { feature: 'AR Scanner' },
    channels: ['in_app', 'email'],
    expiresAt: null,
    groupId: null,
  },

  // --- additional price_alert ---
  {
    id: 'notif-038',
    category: 'price_alert',
    priority: 'medium',
    title: 'Price Recovery: Paolo Banchero',
    message: 'Paolo Banchero 2022-23 Prizm Base RC rebounding — up 9% to $48 after three weeks of decline.',
    timestamp: hoursAgo(4),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/paolo-prizm',
    actionLabel: 'View Trend',
    cardName: '2022-23 Prizm Base RC',
    player: 'Paolo Banchero',
    priceData: { current: 48, previous: 44, change: 4, changePercent: 9.1 },
    metadata: {},
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
  {
    id: 'notif-039',
    category: 'price_alert',
    priority: 'high',
    title: 'Breakout Alert: Tyrese Maxey',
    message: 'Tyrese Maxey cards surging 28% after All-Star selection. Prizm RC PSA 10 now at $185.',
    timestamp: hoursAgo(1),
    isRead: false,
    isDismissed: false,
    actionUrl: '/marketplace/card/maxey-prizm',
    actionLabel: 'View Cards',
    cardName: '2020-21 Prizm RC PSA 10',
    player: 'Tyrese Maxey',
    priceData: { current: 185, previous: 144, change: 41, changePercent: 28.5 },
    metadata: { catalyst: 'All-Star Selection' },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: 'price-alerts-maxey',
  },

  // --- additional deal_found ---
  {
    id: 'notif-040',
    category: 'deal_found',
    priority: 'medium',
    title: 'Best Offer Accepted: Bryce Harper',
    message: 'Bryce Harper 2012 Bowman Chrome RC PSA 10 best offer accepted at $155 — 19% below last sale.',
    timestamp: hoursAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/deals/harper-bowman',
    actionLabel: 'Similar Deals',
    cardName: '2012 Bowman Chrome RC PSA 10',
    player: 'Bryce Harper',
    priceData: { current: 155, previous: 191, change: -36, changePercent: -18.8 },
    metadata: { platform: 'eBay', dealType: 'best_offer_accepted' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'deals-baseball',
  },

  // --- additional auction ---
  {
    id: 'notif-041',
    category: 'auction',
    priority: 'medium',
    title: 'New Auction: LeBron James Exquisite',
    message: 'LeBron James 2003-04 Exquisite Collection RC /99 just listed on Goldin. Starting bid: $85,000.',
    timestamp: hoursAgo(2),
    isRead: false,
    isDismissed: false,
    actionUrl: '/auction/lebron-exquisite',
    actionLabel: 'Watch Auction',
    cardName: '2003-04 Exquisite Collection RC /99',
    player: 'LeBron James',
    priceData: null,
    metadata: { platform: 'Goldin', startingBid: 85000, numbered: '/99' },
    channels: ['in_app', 'email'],
    expiresAt: daysAgo(-7),
    groupId: null,
  },

  // --- additional news ---
  {
    id: 'notif-042',
    category: 'news',
    priority: 'high',
    title: 'BGS Rebranding Announcement',
    message: 'Beckett Grading Services announces new slab design and updated grading criteria effective Q2 2026.',
    timestamp: hoursAgo(10),
    isRead: false,
    isDismissed: false,
    actionUrl: '/news/bgs-rebrand',
    actionLabel: 'Read Details',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { source: 'Beckett', effectiveDate: 'Q2 2026' },
    channels: ['in_app', 'push'],
    expiresAt: null,
    groupId: 'news-grading',
  },

  // --- additional market_move ---
  {
    id: 'notif-043',
    category: 'market_move',
    priority: 'medium',
    title: 'Hockey Cards Gaining Momentum',
    message: 'NHL card market up 6.1% driven by Connor Bedard rookie hype and playoff push.',
    timestamp: hoursAgo(7),
    isRead: false,
    isDismissed: false,
    actionUrl: '/market/hockey',
    actionLabel: 'View Trends',
    cardName: null,
    player: null,
    priceData: null,
    metadata: { segment: 'Hockey', changePercent: 6.1, timeframe: '7d' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: 'market-hockey',
  },

  // --- additional portfolio ---
  {
    id: 'notif-044',
    category: 'portfolio',
    priority: 'medium',
    title: 'New Comp Sale Detected',
    message: 'A comparable Luka Doncic 2018-19 Prizm Silver RC PSA 10 just sold for $1,850 — your card is valued at $1,720.',
    timestamp: hoursAgo(3),
    isRead: false,
    isDismissed: false,
    actionUrl: '/portfolio/card/luka-prizm-silver',
    actionLabel: 'Update Valuation',
    cardName: '2018-19 Prizm Silver RC PSA 10',
    player: 'Luka Doncic',
    priceData: { current: 1720, previous: 1650, change: 70, changePercent: 4.2 },
    metadata: { compSalePrice: 1850, platform: 'eBay' },
    channels: ['in_app'],
    expiresAt: null,
    groupId: null,
  },
];

// ---- Mock Deal Alerts (15+) ----

const MOCK_DEAL_ALERTS: DealAlert[] = [
  {
    id: 'deal-001',
    cardName: '2023 Prizm Silver RC BGS 9.5',
    player: 'Chet Holmgren',
    year: 2023,
    grade: 'BGS 9.5',
    dealType: 'below_market',
    listPrice: 165,
    marketPrice: 243,
    savings: 78,
    savingsPercent: 32.1,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/chet-prizm-silver',
    imageUrl: '/images/cards/chet-prizm.jpg',
    sellerRating: 99.8,
    timeRemaining: '2h 15m',
    discoveredAt: minutesAgo(3),
    confidence: 94,
    isExpired: false,
  },
  {
    id: 'deal-002',
    cardName: '2023-24 Upper Deck Young Guns RC PSA 10',
    player: 'Connor Bedard',
    year: 2024,
    grade: 'PSA 10',
    dealType: 'price_crash',
    listPrice: 399,
    marketPrice: 615,
    savings: 216,
    savingsPercent: 35.1,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/bedard-yg-psa10',
    imageUrl: '/images/cards/bedard-yg.jpg',
    sellerRating: 100,
    timeRemaining: '55m',
    discoveredAt: minutesAgo(7),
    confidence: 97,
    isExpired: false,
  },
  {
    id: 'deal-003',
    cardName: '2022 Topps Chrome RC PSA 10',
    player: 'Julio Rodriguez',
    year: 2022,
    grade: 'PSA 10',
    dealType: 'below_market',
    listPrice: 89,
    marketPrice: 117,
    savings: 28,
    savingsPercent: 23.9,
    platform: 'MySlabs',
    listingUrl: 'https://myslabs.com/listing/jrod-chrome',
    imageUrl: '/images/cards/jrod-chrome.jpg',
    sellerRating: 98.5,
    timeRemaining: '6h 30m',
    discoveredAt: minutesAgo(18),
    confidence: 88,
    isExpired: false,
  },
  {
    id: 'deal-004',
    cardName: '2023 Prizm Silver RC PSA 10',
    player: 'CJ Stroud',
    year: 2023,
    grade: 'PSA 10',
    dealType: 'buy_it_now',
    listPrice: 210,
    marketPrice: 285,
    savings: 75,
    savingsPercent: 26.3,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/stroud-prizm-silver',
    imageUrl: '/images/cards/stroud-prizm.jpg',
    sellerRating: 99.2,
    timeRemaining: null,
    discoveredAt: minutesAgo(32),
    confidence: 91,
    isExpired: false,
  },
  {
    id: 'deal-005',
    cardName: '2020-21 Donruss Optic Rated Rookie PSA 9',
    player: 'Anthony Edwards',
    year: 2021,
    grade: 'PSA 9',
    dealType: 'new_listing',
    listPrice: 195,
    marketPrice: 220,
    savings: 25,
    savingsPercent: 11.4,
    platform: 'Mercari',
    listingUrl: 'https://mercari.com/listing/ant-edwards-optic',
    imageUrl: '/images/cards/ant-optic.jpg',
    sellerRating: 97.0,
    timeRemaining: null,
    discoveredAt: hoursAgo(1),
    confidence: 82,
    isExpired: false,
  },
  {
    id: 'deal-006',
    cardName: '2018 Bowman Chrome RC PSA 10',
    player: 'Shohei Ohtani',
    year: 2018,
    grade: 'PSA 10',
    dealType: 'below_market',
    listPrice: 1175,
    marketPrice: 1350,
    savings: 175,
    savingsPercent: 13.0,
    platform: 'COMC',
    listingUrl: 'https://comc.com/listing/ohtani-bowman',
    imageUrl: '/images/cards/ohtani-bowman.jpg',
    sellerRating: 99.5,
    timeRemaining: null,
    discoveredAt: hoursAgo(1),
    confidence: 90,
    isExpired: false,
  },
  {
    id: 'deal-007',
    cardName: '2023 Prizm Silver RC',
    player: 'Victor Wembanyama',
    year: 2023,
    grade: 'Raw',
    dealType: 'price_crash',
    listPrice: 389,
    marketPrice: 520,
    savings: 131,
    savingsPercent: 25.2,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/wemby-prizm',
    imageUrl: '/images/cards/wemby-prizm.jpg',
    sellerRating: 99.8,
    timeRemaining: '18h',
    discoveredAt: minutesAgo(12),
    confidence: 93,
    isExpired: false,
  },
  {
    id: 'deal-008',
    cardName: '2024 Prizm Silver RC PSA 10',
    player: 'Caleb Williams',
    year: 2024,
    grade: 'PSA 10',
    dealType: 'auction_ending',
    listPrice: 310,
    marketPrice: 395,
    savings: 85,
    savingsPercent: 21.5,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/caleb-williams-prizm',
    imageUrl: '/images/cards/caleb-prizm.jpg',
    sellerRating: 98.9,
    timeRemaining: '12m',
    discoveredAt: minutesAgo(2),
    confidence: 86,
    isExpired: false,
  },
  {
    id: 'deal-009',
    cardName: '2012 Bowman Chrome RC PSA 10',
    player: 'Bryce Harper',
    year: 2012,
    grade: 'PSA 10',
    dealType: 'best_offer_accepted',
    listPrice: 155,
    marketPrice: 191,
    savings: 36,
    savingsPercent: 18.8,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/harper-bowman',
    imageUrl: '/images/cards/harper-bowman.jpg',
    sellerRating: 99.1,
    timeRemaining: null,
    discoveredAt: hoursAgo(2),
    confidence: 85,
    isExpired: false,
  },
  {
    id: 'deal-010',
    cardName: '2020-21 Prizm RC PSA 10',
    player: 'Tyrese Maxey',
    year: 2021,
    grade: 'PSA 10',
    dealType: 'below_market',
    listPrice: 145,
    marketPrice: 185,
    savings: 40,
    savingsPercent: 21.6,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/maxey-prizm',
    imageUrl: '/images/cards/maxey-prizm.jpg',
    sellerRating: 98.7,
    timeRemaining: '4h 20m',
    discoveredAt: hoursAgo(1),
    confidence: 89,
    isExpired: false,
  },
  {
    id: 'deal-011',
    cardName: '2019-20 Prizm Base RC PSA 10',
    player: 'Zion Williamson',
    year: 2020,
    grade: 'PSA 10',
    dealType: 'price_crash',
    listPrice: 215,
    marketPrice: 310,
    savings: 95,
    savingsPercent: 30.6,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/zion-prizm-base',
    imageUrl: '/images/cards/zion-prizm.jpg',
    sellerRating: 99.4,
    timeRemaining: '8h',
    discoveredAt: hoursAgo(2),
    confidence: 92,
    isExpired: false,
  },
  {
    id: 'deal-012',
    cardName: '2018-19 Prizm Silver RC PSA 10',
    player: 'Trae Young',
    year: 2019,
    grade: 'PSA 10',
    dealType: 'below_market',
    listPrice: 280,
    marketPrice: 365,
    savings: 85,
    savingsPercent: 23.3,
    platform: 'Goldin',
    listingUrl: 'https://goldin.co/listing/trae-prizm',
    imageUrl: '/images/cards/trae-prizm.jpg',
    sellerRating: 99.9,
    timeRemaining: '3d 12h',
    discoveredAt: hoursAgo(3),
    confidence: 87,
    isExpired: false,
  },
  {
    id: 'deal-013',
    cardName: '2021 Bowman Chrome 1st RC PSA 10',
    player: 'Jackson Holliday',
    year: 2021,
    grade: 'PSA 10',
    dealType: 'new_listing',
    listPrice: 175,
    marketPrice: 225,
    savings: 50,
    savingsPercent: 22.2,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/holliday-bowman',
    imageUrl: '/images/cards/holliday-bowman.jpg',
    sellerRating: 98.3,
    timeRemaining: null,
    discoveredAt: hoursAgo(1),
    confidence: 84,
    isExpired: false,
  },
  {
    id: 'deal-014',
    cardName: '2023-24 Prizm Silver RC PSA 10',
    player: 'Jaime Jaquez Jr.',
    year: 2024,
    grade: 'PSA 10',
    dealType: 'buy_it_now',
    listPrice: 52,
    marketPrice: 72,
    savings: 20,
    savingsPercent: 27.8,
    platform: 'Mercari',
    listingUrl: 'https://mercari.com/listing/jaquez-prizm',
    imageUrl: '/images/cards/jaquez-prizm.jpg',
    sellerRating: 96.5,
    timeRemaining: null,
    discoveredAt: hoursAgo(2),
    confidence: 80,
    isExpired: false,
  },
  {
    id: 'deal-015',
    cardName: '2023 Bowman Chrome 1st RC PSA 10',
    player: 'Paul Skenes',
    year: 2023,
    grade: 'PSA 10',
    dealType: 'below_market',
    listPrice: 88,
    marketPrice: 120,
    savings: 32,
    savingsPercent: 26.7,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/skenes-bowman',
    imageUrl: '/images/cards/skenes-bowman.jpg',
    sellerRating: 99.0,
    timeRemaining: '1d 6h',
    discoveredAt: hoursAgo(4),
    confidence: 86,
    isExpired: false,
  },
  {
    id: 'deal-016',
    cardName: '2023 Prizm Draft Picks Silver RC PSA 10',
    player: 'Marvin Harrison Jr.',
    year: 2023,
    grade: 'PSA 10',
    dealType: 'new_listing',
    listPrice: 135,
    marketPrice: 180,
    savings: 45,
    savingsPercent: 25.0,
    platform: 'eBay',
    listingUrl: 'https://ebay.com/itm/mhj-prizm-dp',
    imageUrl: '/images/cards/mhj-prizm.jpg',
    sellerRating: 99.3,
    timeRemaining: null,
    discoveredAt: minutesAgo(45),
    confidence: 88,
    isExpired: false,
  },
];

// ---- Mock Notification Rules (10+) ----

const MOCK_RULES: NotificationRule[] = [
  {
    id: 'rule-001',
    name: 'Price Drop > 15%',
    category: 'price_alert',
    enabled: true,
    conditions: [{ field: 'priceChangePercent', operator: 'lt', value: -15 }],
    channels: ['in_app', 'push'],
    priority: 'high',
    cooldown: '1h',
    createdAt: daysAgo(30),
  },
  {
    id: 'rule-002',
    name: 'Price Surge > 20%',
    category: 'price_alert',
    enabled: true,
    conditions: [{ field: 'priceChangePercent', operator: 'gt', value: 20 }],
    channels: ['in_app', 'push', 'email'],
    priority: 'high',
    cooldown: '2h',
    createdAt: daysAgo(30),
  },
  {
    id: 'rule-003',
    name: 'Deal Below Market 25%+',
    category: 'deal_found',
    enabled: true,
    conditions: [{ field: 'savingsPercent', operator: 'gt', value: 25 }],
    channels: ['in_app', 'push', 'sms'],
    priority: 'critical',
    cooldown: '0',
    createdAt: daysAgo(25),
  },
  {
    id: 'rule-004',
    name: 'Auction Ending < 15min',
    category: 'auction',
    enabled: true,
    conditions: [{ field: 'timeRemainingMinutes', operator: 'lt', value: 15 }],
    channels: ['in_app', 'push'],
    priority: 'critical',
    cooldown: '5m',
    createdAt: daysAgo(20),
  },
  {
    id: 'rule-005',
    name: 'Portfolio Daily Change > 5%',
    category: 'portfolio',
    enabled: true,
    conditions: [{ field: 'portfolioChangePercent', operator: 'gt', value: 5 }, { field: 'portfolioChangePercent', operator: 'lt', value: -5 }],
    channels: ['in_app', 'email'],
    priority: 'high',
    cooldown: '24h',
    createdAt: daysAgo(15),
  },
  {
    id: 'rule-006',
    name: 'New Wembanyama Listings',
    category: 'deal_found',
    enabled: true,
    conditions: [{ field: 'player', operator: 'contains', value: 'Wembanyama' }],
    channels: ['in_app', 'push'],
    priority: 'medium',
    cooldown: '30m',
    createdAt: daysAgo(10),
  },
  {
    id: 'rule-007',
    name: 'Grading Returns',
    category: 'grading',
    enabled: true,
    conditions: [{ field: 'submissionStatus', operator: 'eq', value: 'complete' }],
    channels: ['in_app', 'push', 'email'],
    priority: 'high',
    cooldown: '0',
    createdAt: daysAgo(45),
  },
  {
    id: 'rule-008',
    name: 'Market Index Swing > 10%',
    category: 'market_move',
    enabled: true,
    conditions: [{ field: 'indexChangePercent', operator: 'change_pct', value: 10 }],
    channels: ['in_app', 'push'],
    priority: 'critical',
    cooldown: '6h',
    createdAt: daysAgo(30),
  },
  {
    id: 'rule-009',
    name: 'Loss Threshold -25%',
    category: 'portfolio',
    enabled: true,
    conditions: [{ field: 'cardChangeFromPurchase', operator: 'lt', value: -25 }],
    channels: ['in_app', 'push'],
    priority: 'critical',
    cooldown: '24h',
    createdAt: daysAgo(20),
  },
  {
    id: 'rule-010',
    name: 'Trade Offers Received',
    category: 'social',
    enabled: true,
    conditions: [{ field: 'tradeOfferType', operator: 'eq', value: 'received' }],
    channels: ['in_app', 'push'],
    priority: 'medium',
    cooldown: '0',
    createdAt: daysAgo(12),
  },
  {
    id: 'rule-011',
    name: 'New Listings Under $50',
    category: 'deal_found',
    enabled: false,
    conditions: [{ field: 'listPrice', operator: 'lt', value: 50 }],
    channels: ['in_app'],
    priority: 'low',
    cooldown: '1h',
    createdAt: daysAgo(5),
  },
  {
    id: 'rule-012',
    name: 'Breaking Industry News',
    category: 'news',
    enabled: true,
    conditions: [{ field: 'impact', operator: 'eq', value: 'high' }],
    channels: ['in_app', 'push'],
    priority: 'high',
    cooldown: '0',
    createdAt: daysAgo(40),
  },
];

// ---- Default Preferences ----

const DEFAULT_PREFERENCES: NotificationPreferences = {
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  maxPerDay: 50,
  groupSimilar: true,
  channels: [
    { channel: 'in_app', enabled: true },
    { channel: 'push', enabled: true },
    { channel: 'email', enabled: true },
    { channel: 'sms', enabled: false },
  ],
  categoryPreferences: [
    { category: 'price_alert', enabled: true, minPriority: 'low' },
    { category: 'deal_found', enabled: true, minPriority: 'low' },
    { category: 'market_move', enabled: true, minPriority: 'medium' },
    { category: 'portfolio', enabled: true, minPriority: 'low' },
    { category: 'auction', enabled: true, minPriority: 'low' },
    { category: 'news', enabled: true, minPriority: 'medium' },
    { category: 'grading', enabled: true, minPriority: 'low' },
    { category: 'social', enabled: true, minPriority: 'medium' },
    { category: 'system', enabled: true, minPriority: 'low' },
  ],
};

// ---- localStorage Helpers ----

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readIds);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveReadIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEYS.readIds, JSON.stringify([...ids]));
}

function loadDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.dismissedIds);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveDismissedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEYS.dismissedIds, JSON.stringify([...ids]));
}

// ---- Exported Functions ----

/** Get all notifications, optionally filtered by category. Excludes dismissed. */
export function getNotifications(category?: NotificationCategory): SmartNotification[] {
  const readIds = loadReadIds();
  const dismissedIds = loadDismissedIds();

  let results = MOCK_NOTIFICATIONS
    .map(n => ({
      ...n,
      isRead: n.isRead || readIds.has(n.id),
      isDismissed: n.isDismissed || dismissedIds.has(n.id),
    }))
    .filter(n => !n.isDismissed);

  if (category) {
    results = results.filter(n => n.category === category);
  }

  // Sort by timestamp descending (most recent first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return results;
}

/** Get only unread notifications. */
export function getUnreadNotifications(): SmartNotification[] {
  return getNotifications().filter(n => !n.isRead);
}

/** Get all deal alerts. */
export function getDealAlerts(): DealAlert[] {
  return [...MOCK_DEAL_ALERTS].sort(
    (a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
  );
}

/** Get only active (non-expired) deal alerts. */
export function getActiveDealAlerts(): DealAlert[] {
  return getDealAlerts().filter(d => !d.isExpired);
}

/** Get all notification rules. */
export function getNotificationRules(): NotificationRule[] {
  return [...MOCK_RULES];
}

/** Compute aggregate notification stats. */
export function getNotificationStats(): NotificationStats {
  const all = getNotifications();
  const unread = all.filter(n => !n.isRead);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = all.filter(n => new Date(n.timestamp) >= todayStart);
  const deals = getDealAlerts();
  const activeDeals = deals.filter(d => !d.isExpired);

  const categories: NotificationCategory[] = [
    'price_alert', 'deal_found', 'market_move', 'portfolio',
    'auction', 'news', 'grading', 'social', 'system',
  ];
  const byCategory = categories.map(cat => {
    const catNotifs = all.filter(n => n.category === cat);
    return {
      category: cat,
      count: catNotifs.length,
      unread: catNotifs.filter(n => !n.isRead).length,
    };
  });

  const priorities: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];
  const byPriority = priorities.map(p => ({
    priority: p,
    count: all.filter(n => n.priority === p).length,
  }));

  const totalSavings = activeDeals.reduce((sum, d) => sum + d.savings, 0);

  // Top alerted cards
  const cardCounts: Record<string, number> = {};
  for (const n of all) {
    if (n.cardName) {
      const key = n.player ? `${n.player} ${n.cardName}` : n.cardName;
      cardCounts[key] = (cardCounts[key] || 0) + 1;
    }
  }
  const topAlertedCards = Object.entries(cardCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cardName, alertCount]) => ({ cardName, alertCount }));

  return {
    totalNotifications: all.length,
    unreadCount: unread.length,
    todayCount: today.length,
    byCategory,
    byPriority,
    dealsFound: deals.length,
    dealsSaved: activeDeals.length,
    totalSavings,
    avgResponseTime: '4.2m',
    topAlertedCards,
  };
}

/** Get notification preferences (from localStorage or defaults). */
export function getNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.preferences);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { ...DEFAULT_PREFERENCES };
}

/** Group notifications by category/groupId. */
export function getNotificationGroups(): NotificationGroup[] {
  const all = getNotifications();
  const groupMap = new Map<string, SmartNotification[]>();

  for (const n of all) {
    const key = n.groupId || `ungrouped-${n.id}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(n);
  }

  const groups: NotificationGroup[] = [];
  for (const [groupId, notifications] of groupMap) {
    if (notifications.length === 0) continue;
    const sorted = notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const latest = sorted[0];
    groups.push({
      groupId,
      category: latest.category,
      count: notifications.length,
      latestTimestamp: latest.timestamp,
      summary: notifications.length > 1
        ? `${notifications.length} ${getCategoryLabel(latest.category).toLowerCase()} notifications`
        : latest.title,
      notifications: sorted,
    });
  }

  groups.sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  return groups;
}

/** Mark a single notification as read. */
export function markAsRead(id: string): void {
  const readIds = loadReadIds();
  readIds.add(id);
  saveReadIds(readIds);
}

/** Mark all notifications as read. */
export function markAllAsRead(): void {
  const all = MOCK_NOTIFICATIONS.map(n => n.id);
  const readIds = loadReadIds();
  for (const id of all) readIds.add(id);
  saveReadIds(readIds);
}

/** Dismiss (hide) a notification. */
export function dismissNotification(id: string): void {
  const dismissedIds = loadDismissedIds();
  dismissedIds.add(id);
  saveDismissedIds(dismissedIds);
}

// ---- Display Helpers ----

export function getCategoryColor(category: NotificationCategory): string {
  const colors: Record<NotificationCategory, string> = {
    price_alert: '#f59e0b',
    deal_found: '#10b981',
    market_move: '#3b82f6',
    portfolio: '#8b5cf6',
    auction: '#ef4444',
    news: '#06b6d4',
    grading: '#f97316',
    social: '#ec4899',
    system: '#6b7280',
  };
  return colors[category];
}

export function getCategoryLabel(category: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    price_alert: 'Price Alert',
    deal_found: 'Deal Found',
    market_move: 'Market Move',
    portfolio: 'Portfolio',
    auction: 'Auction',
    news: 'News',
    grading: 'Grading',
    social: 'Social',
    system: 'System',
  };
  return labels[category];
}

export function getCategoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    price_alert: 'TrendingUp',
    deal_found: 'DollarSign',
    market_move: 'BarChart',
    portfolio: 'Briefcase',
    auction: 'Gavel',
    news: 'Newspaper',
    grading: 'Award',
    social: 'Users',
    system: 'Settings',
  };
  return icons[category];
}

export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#6b7280',
  };
  return colors[priority];
}

export function getDealTypeLabel(type: DealType): string {
  const labels: Record<DealType, string> = {
    below_market: 'Below Market',
    price_crash: 'Price Crash',
    new_listing: 'New Listing',
    auction_ending: 'Auction Ending',
    buy_it_now: 'Buy It Now',
    best_offer_accepted: 'Best Offer Accepted',
  };
  return labels[type];
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
